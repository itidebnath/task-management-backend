import express from "express"
import Task from "../models/Task.js"
import User from "../models/User.js"
import { auth, isAdmin } from "../middleware/auth.js"

const router = express.Router()

// Admin: create task
router.post("/create", auth, isAdmin, async (req, res) => {
  try {
    const { title, userId } = req.body
    const task = await Task.create({ title, assignedTo: userId })
    res.status(201).json(task)
  } catch (err) {
    res.status(500).json({ msg: "Task creation failed" })
  }
})

// Admin: get all users
router.get("/users", auth, isAdmin, async (req, res) => {
  const users = await User.find({ role: "user" }).select("-password")
  res.json(users)
})

// Admin: get all tasks
router.get("/", auth, isAdmin, async (req, res) => {
  const tasks = await Task.find().populate("assignedTo", "name email")
  res.json(tasks)
})

// Admin: delete task
router.delete("/:id", auth, isAdmin, async (req, res) => {
  await Task.findByIdAndDelete(req.params.id)
  res.json({ msg: "Task deleted" })
})

// User: get assigned tasks
router.get("/mytasks", auth, async (req, res) => {
  const tasks = await Task.find({ assignedTo: req.user._id })
  res.json(tasks)
})

// User: toggle complete WITH reason
router.patch("/:id/toggle", auth, async (req, res) => {
  try {
    const { reason } = req.body

    const task = await Task.findById(req.params.id)
    if (!task) return res.status(404).json({ msg: "Task not found" })

    if (task.assignedTo.toString() !== req.user._id.toString())
      return res.status(403).json({ msg: "Not your task" })

    // If marking as NOT completed → reason required
    if (task.completed === true) {
      if (!reason || reason.trim() === "") {
        return res.status(400).json({
          msg: "Reason is required when marking task as not completed",
        })
      }
      task.completed = false
      task.notCompletedReason = reason
    } 
    // If marking as completed → clear reason
    else {
      task.completed = true
      task.notCompletedReason = ""
    }

    await task.save()
    res.json(task)
  } catch (err) {
    res.status(500).json({ msg: "Toggle failed" })
  }
})

export default router

