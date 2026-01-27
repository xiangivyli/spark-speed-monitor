

# Queue Position Indicator - Implementation Plan

## Current Backend Limitation

Your current `asyncio.Lock()` approach doesn't track queue positions. It only knows:
- Lock is free → acquire immediately
- Lock is held → wait (but no visibility into who else is waiting)

## Solution: Replace Lock with Queue Tracking

We need to modify the backend to explicitly track waiting tasks, then expose this to the frontend.

---

## Backend Changes Required

### 1. Replace asyncio.Lock with Queue Tracking

```python
# Add at the top with global state
import uuid
from collections import OrderedDict

# Replace benchmark_queue_lock with:
queue_lock = asyncio.Lock()  # Protects queue operations
processing_lock = asyncio.Lock()  # Ensures one-at-a-time processing
task_queue: OrderedDict[str, dict] = OrderedDict()  # task_id -> task info
```

### 2. Create Queue Management Functions

```python
async def add_to_queue(task_id: str, filename: str) -> int:
    """Add task to queue and return position."""
    async with queue_lock:
        task_queue[task_id] = {
            "filename": filename,
            "status": "queued",
            "added_at": time.time()
        }
        return len(task_queue)

async def get_queue_position(task_id: str) -> tuple[int, int]:
    """Get (position, total) for a task. Returns (0, total) if processing."""
    async with queue_lock:
        if task_id not in task_queue:
            return (0, len(task_queue))
        
        position = list(task_queue.keys()).index(task_id) + 1
        return (position, len(task_queue))

async def remove_from_queue(task_id: str):
    """Remove completed task from queue."""
    async with queue_lock:
        if task_id in task_queue:
            del task_queue[task_id]
```

### 3. Add Queue Status Endpoint

```python
@app.get("/api/queue-status/{task_id}")
async def get_queue_status(task_id: str):
    """Get current queue position for a task."""
    position, total = await get_queue_position(task_id)
    
    if position == 0:
        return {"status": "processing", "position": 0, "total": total}
    
    return {
        "status": "queued",
        "position": position,
        "total": total
    }
```

### 4. Modify /api/benchmark Endpoint

The endpoint should now:
1. Generate a task_id and add to queue immediately
2. Return the initial queue position right away
3. Wait for its turn using a different mechanism

**Option A: Simple Polling Approach (Recommended)**

```python
@app.post("/api/benchmark")
async def run_benchmark(
    file: UploadFile = File(...),
    fileType: str = Form(...),
    threads: int = Form(6),
    driverMemory: str = Form("4g"),
    target_partition_size_mb: Optional[int] = Form(None)
):
    # Validation (unchanged)
    threads = max(1, min(12, threads))
    valid_memory = ["1g", "2g", "4g", "8g", "12g", "16g"]
    if driverMemory not in valid_memory:
        driverMemory = "4g"

    # Save file (unchanged)
    suffix = f".{fileType.lower()}"
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to save uploaded file")

    file_size_mb = os.path.getsize(tmp_path) / (1024 * 1024)
    
    # Generate task ID and add to queue
    task_id = str(uuid.uuid4())
    initial_position = await add_to_queue(task_id, file.filename)
    
    try:
        # Wait for our turn (FIFO order enforced by waiting for those ahead)
        while True:
            position, total = await get_queue_position(task_id)
            if position == 1:  # We're next!
                break
            await asyncio.sleep(0.5)  # Check every 500ms
        
        # Now acquire processing lock
        async with processing_lock:
            # Update status to processing
            async with queue_lock:
                if task_id in task_queue:
                    task_queue[task_id]["status"] = "processing"
            
            # ... rest of processing logic (unchanged) ...
            get_or_create_spark(threads, driverMemory)
            # ... process file ...
            
        # Build response
        response = {
            "sparkExecutionTime": round(spark_time, 2),
            # ... other fields ...
        }
        
        return response
        
    finally:
        await remove_from_queue(task_id)
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)
```

**Option B: Return Task ID Immediately (More Complex)**

If you want users to see queue position before the request completes:

```python
@app.post("/api/benchmark/submit")
async def submit_benchmark(...):
    # Save file, add to queue
    task_id = str(uuid.uuid4())
    position = await add_to_queue(task_id, file.filename)
    
    # Start background processing
    asyncio.create_task(process_benchmark(task_id, tmp_path, ...))
    
    # Return immediately with queue info
    return {
        "task_id": task_id,
        "position": position,
        "total": position
    }

@app.get("/api/benchmark/result/{task_id}")
async def get_result(task_id: str):
    # Return result when ready
    ...
```

---

## Frontend Changes

### 1. Update Types (`src/types/benchmark.ts`)

Add `queued` stage and queue fields:

```typescript
export interface ProcessingStatus {
  stage: 'queued' | 'uploading' | 'processing_spark' | 'processing_pandas' | 'completed' | 'error';
  progress: number;
  message: string;
  queuePosition?: number;
  queueTotal?: number;
}
```

### 2. Update ProcessingStatus Component (`src/components/ProcessingStatus.tsx`)

Add queue stage display with Users icon:

- Add `queued` to `stageIcons` with `Users` icon
- Display "Position X of Y in queue" when in queued state
- Update the stage indicator dots to include the queued stage
- Show animated waiting indicator

### 3. Update useBenchmark Hook (`src/hooks/useBenchmark.ts`)

**For Option A (Polling during long request):**

Since the request waits in queue, we poll a separate endpoint while waiting:

```typescript
const submitBenchmark = useCallback(async (file: File, ...) => {
  setIsProcessing(true);
  
  // Show initial queued status
  setProcessingStatus({
    stage: 'queued',
    progress: 5,
    message: 'Joining queue...',
  });
  
  const formData = new FormData();
  // ... append fields ...
  
  // Start the benchmark request (this will wait in queue on server)
  const benchmarkPromise = fetch(`${API_BASE_URL}/benchmark`, {
    method: 'POST',
    body: formData,
  });
  
  // Poll queue status while waiting
  // Note: Need a way to identify our request - could use a header or query param
  // Simpler: just show "waiting in queue" without exact position for Option A
  
  const response = await benchmarkPromise;
  
  // Continue with normal processing stages...
}, []);
```

**For Option B (Task ID approach - better UX):**

```typescript
const submitBenchmark = useCallback(async (file: File, ...) => {
  // 1. Submit and get task_id + position
  const submitResponse = await fetch(`${API_BASE_URL}/benchmark/submit`, {
    method: 'POST',
    body: formData,
  });
  const { task_id, position, total } = await submitResponse.json();
  
  setProcessingStatus({
    stage: 'queued',
    progress: 5,
    message: `Position ${position} of ${total} in queue`,
    queuePosition: position,
    queueTotal: total,
  });
  
  // 2. Poll for status updates
  let completed = false;
  while (!completed) {
    await new Promise(r => setTimeout(r, 2000)); // Poll every 2s
    
    const statusResponse = await fetch(`${API_BASE_URL}/queue-status/${task_id}`);
    const status = await statusResponse.json();
    
    if (status.status === 'queued') {
      setProcessingStatus({
        stage: 'queued',
        progress: 5,
        message: `Position ${status.position} of ${status.total} in queue`,
        queuePosition: status.position,
        queueTotal: status.total,
      });
    } else if (status.status === 'processing') {
      setProcessingStatus({
        stage: 'processing_spark',
        progress: 50,
        message: 'Your turn! Processing with Spark...',
      });
    } else if (status.status === 'completed') {
      completed = true;
    }
  }
  
  // 3. Fetch final result
  const resultResponse = await fetch(`${API_BASE_URL}/benchmark/result/${task_id}`);
  const data = await resultResponse.json();
  // ... update results ...
}, []);
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/types/benchmark.ts` | Add `queued` stage, `queuePosition`, `queueTotal` |
| `src/components/ProcessingStatus.tsx` | Add queued stage UI, Users icon, position display |
| `src/hooks/useBenchmark.ts` | Add polling logic for queue status |

---

## Recommendation

**Option B (Task ID + Polling)** provides the best user experience:
- Users see their exact queue position immediately
- Position updates in real-time as the queue moves
- More responsive feedback

However, it requires more backend changes. If you want a simpler approach:

**Option A Simplified**: Just show "Waiting in queue..." without exact position. The server still processes FIFO, users just don't see their exact spot. This requires minimal backend changes.

---

## Summary of Backend Endpoints Needed

| Endpoint | Purpose |
|----------|---------|
| `POST /api/benchmark/submit` | Submit file, return task_id + initial position |
| `GET /api/queue-status/{task_id}` | Get current position (poll this) |
| `GET /api/benchmark/result/{task_id}` | Get final result when completed |

Or keep single endpoint with polling endpoint:

| Endpoint | Purpose |
|----------|---------|
| `POST /api/benchmark` | Submit and wait (blocking) |
| `GET /api/queue-status` | Get global queue info (for display only) |

