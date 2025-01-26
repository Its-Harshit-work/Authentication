const mongoose = require("mongoose");

const datasetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  license: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }], // List of task IDs
});

module.exports = mongoose.model("Dataset", datasetSchema);
