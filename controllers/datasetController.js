const Dataset = require("../models/dataset");
const Task = require("../models/task");

const createDataset = async (req, res) => {
  try {
    const { name, type, license } = req.body;
    const userId = req.user.id;
    
    const newDataset = new Dataset({ name, type, license, userId });
    await newDataset.save();

    res.status(201).json({ message: "Dataset created successfully", dataset: newDataset });
  } catch (error) {
    console.error("Error creating dataset:", error);
    res.status(500).json({ message: "Failed to create dataset", error });
  }
};

const addTaskToDataset = async (req, res) => {
  try {
    const { datasetId, size, startOn, creditsNeeded } = req.body;

    const task = new Task({ datasetId, size, startOn, creditsNeeded });
    await task.save();

    res.status(201).json({ message: "Task added successfully", task });
  } catch (error) {
    console.error("Error adding task:", error);
    res.status(500).json({ message: "Failed to add task", error });
  }
};

const getDatasetsForUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const datasets = await Dataset.find({ userId });

    res.status(200).json(datasets);
  } catch (error) {
    console.error("Error fetching datasets:", error);
    res.status(500).json({ message: "Failed to fetch datasets", error });
  }
};

module.exports = { createDataset, addTaskToDataset, getDatasetsForUser };
