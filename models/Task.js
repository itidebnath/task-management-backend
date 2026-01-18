import mongoose from "mongoose"

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    completed: {
      type: Boolean,
      default: false, // ✅ VERY IMPORTANT
    },
    notCompletedReason: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
)

export default mongoose.model("Task", taskSchema)
