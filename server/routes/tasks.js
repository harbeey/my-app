import { Router } from "express";
import Task from "../models/Task.js";
import { authMiddleware } from "../middleware/auth.js";
import { isMongoConnected } from "../storage.js";

const router = Router();

router.use(authMiddleware);

// In-memory store for tasks
const inMemoryTasks = new Map();
let nextTaskId = 1;

router.get("/team/:teamId", async (req, res) => {
  if (isMongoConnected()) {
    const tasks = await Task.find({ teamId: req.params.teamId });
    // Map _id to id for frontend compatibility
    res.json(
      tasks.map((task) => ({
        ...task.toObject(),
        id: task._id,
      }))
    );
  } else {
    const teamId = req.params.teamId;
    const tasks = Array.from(inMemoryTasks.values()).filter(
      (task) => task.teamId === teamId
    );
    res.json(tasks);
  }
});

router.post("/team/:teamId", async (req, res) => {
  const { title, description, assignedTo, status, priority } = req.body;
  const teamId = req.params.teamId;
  let task;

  if (isMongoConnected()) {
    const dbTask = await Task.create({
      teamId,
      title,
      description,
      assignedTo,
      status,
      priority,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: req.user.sub,
    });
    task = { ...dbTask.toObject(), id: dbTask._id };
  } else {
    task = {
      id: `task_${nextTaskId++}`,
      _id: `task_${nextTaskId - 1}`,
      teamId,
      title,
      description,
      assignedTo,
      status,
      priority,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: req.user.sub,
    };
    inMemoryTasks.set(task.id, task);
  }

  const io = req.app.get("io");
  if (io) io.to(`teamBoard:${teamId}`).emit("teamBoard:update", { task });
  res.status(201).json(task);
});

router.put("/:id", async (req, res) => {
  if (!req.params.id || req.params.id === "undefined") {
    return res.status(400).json({ error: "Invalid task ID" });
  }
  let task;
  if (isMongoConnected()) {
    const dbTask = await Task.findById(req.params.id);
    if (!dbTask) return res.status(404).json({ error: "Task not found" });
    Object.assign(dbTask, req.body, { updatedAt: new Date().toISOString() });
    await dbTask.save();
    task = { ...dbTask.toObject(), id: dbTask._id };
  } else {
    task = inMemoryTasks.get(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });
    Object.assign(task, req.body, { updatedAt: new Date().toISOString() });
  }

  const io = req.app.get("io");
  if (io) io.to(`teamBoard:${task.teamId}`).emit("teamBoard:update", { task });
  res.json(task);
});

router.delete("/:id", async (req, res) => {
  if (!req.params.id || req.params.id === "undefined") {
    return res.status(400).json({ error: "Invalid task ID" });
  }
  let task;
  if (isMongoConnected()) {
    task = await Task.findByIdAndDelete(req.params.id);
  } else {
    task = inMemoryTasks.get(req.params.id);
    if (task) {
      inMemoryTasks.delete(req.params.id);
    }
  }

  if (!task) return res.status(404).json({ error: "Task not found" });

  const io = req.app.get("io");
  if (io)
    io.to(`teamBoard:${task.teamId}`).emit("teamBoard:update", {
      deletedTaskId: String(task._id),
    });
  res.json({ ok: true });
});

export default router;
