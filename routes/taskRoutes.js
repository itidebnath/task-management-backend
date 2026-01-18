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

router.patch("/:id/status", auth, async (req, res) => {
  try {
    const { status, reason } = req.body

    if (!["completed", "not_completed"].includes(status)) {
      return res.status(400).json({ msg: "Invalid status" })
    }

    const task = await Task.findById(req.params.id)
    if (!task) return res.status(404).json({ msg: "Task not found" })

    if (task.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: "Unauthorized" })
    }

    if (status === "completed") {
      task.completed = true
      task.notCompletedReason = ""
    }

    if (status === "not_completed") {
      if (!reason || !reason.trim()) {
        return res.status(400).json({ msg: "Reason required" })
      }
      task.completed = false
      task.notCompletedReason = reason
    }

    await task.save()
    res.json(task)
  } catch (err) {
    console.error(err)
    res.status(500).json({ msg: "Status update failed" })
  }
})



export default router
