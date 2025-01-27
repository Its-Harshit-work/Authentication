const DataPoint = require("../models/datapoint");
const Dataset = require("../models/dataset");
const Task = require("../models/task");

const createDataPoint = async (req, res) => {
  try {
    const { video_image_url, dataset_id, task_id, game_mapping } = req.body;

    // Validate dataset and task
    const dataset = await Dataset.findById(dataset_id);
    const task = await Task.findById(task_id);

    if (!dataset || !task) {
      return res.status(404).json({ message: "Dataset or Task not found." });
    }

    const newDataPoint = new DataPoint({
      video_image_url,
      dataset_id,
      task_id,
      labels: [], // Initially empty
      reference_label: "",
      game_mapping,
      final_label: "",
    });

    await newDataPoint.save();

    res.status(201).json({ message: "DataPoint created successfully", dataPoint: newDataPoint });
  } catch (error) {
    console.error("Error creating DataPoint:", error);
    res.status(500).json({ message: "Failed to create DataPoint", error });
  }
};

const getDataPoints = async (req, res) => {
  try {
    const dataPoints = await DataPoint.find().populate("dataset_id").populate("task_id");
    res.status(200).json({ dataPoints });
  } catch (error) {
    console.error("Error fetching DataPoints:", error);
    res.status(500).json({ message: "Failed to fetch DataPoints", error });
  }
};

const updateDataPoint = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedDataPoint = await DataPoint.findByIdAndUpdate(id, updates, { new: true });
    if (!updatedDataPoint) {
      return res.status(404).json({ message: "DataPoint not found." });
    }

    res.status(200).json({ message: "DataPoint updated successfully", dataPoint: updatedDataPoint });
  } catch (error) {
    console.error("Error updating DataPoint:", error);
    res.status(500).json({ message: "Failed to update DataPoint", error });
  }
};

const deleteDataPoint = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedDataPoint = await DataPoint.findByIdAndDelete(id);
    if (!deletedDataPoint) {
      return res.status(404).json({ message: "DataPoint not found." });
    }

    res.status(200).json({ message: "DataPoint deleted successfully" });
  } catch (error) {
    console.error("Error deleting DataPoint:", error);
    res.status(500).json({ message: "Failed to delete DataPoint", error });
  }
};

module.exports = { createDataPoint, getDataPoints, updateDataPoint, deleteDataPoint };
