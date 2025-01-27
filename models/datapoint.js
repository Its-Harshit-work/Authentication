const mongoose = require("mongoose");

const labelSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    description: { type: String, required: true },
    rating: { type: Number, required: true },
    audio_url: { type: String },
  });
  
  const dataPointSchema = new mongoose.Schema({
    video_image_url: { type: String, required: true },
    dataset_id: { type: mongoose.Schema.Types.ObjectId, ref: "Dataset", required: true },
    task_id: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true },
    labels: [labelSchema], // Embedded Label schema
    reference_label: { type: String, default: "" },
    game_mapping: { type: String, required: true },
    final_label: { type: String, default: "" },
  }, { timestamps: true });
  
  module.exports = mongoose.model("DataPoint", dataPointSchema);