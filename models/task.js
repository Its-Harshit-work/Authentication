const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  datasetId: { type: mongoose.Schema.Types.ObjectId, ref: "Dataset", required: true },
  files: [{ type: String, required: true }], // Array of file URLs or paths
  size: { type: Number, required: true }, // Total size of all files in bytes
  startOn: { type: Date, required: true },
  creditsNeeded: { type: Number, required: true },
},{ timestamps: true });


module.exports = mongoose.model("Task", taskSchema);
