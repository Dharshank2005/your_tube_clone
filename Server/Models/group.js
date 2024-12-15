import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
  leadername: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  members: {
    type: [String]    // Ensure it starts as an empty array
  } // Reference to user model for members
});

export default mongoose.model('Group', groupSchema);