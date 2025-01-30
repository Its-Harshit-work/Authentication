const User = require("../models/user");
const Dataset = require("../models/dataset");
const Task = require("../models/task");
const { S3Client } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");


const AWS = require('aws-sdk');

// Configure AWS S3
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});


const createDataset = async (req, res) => {
  try {
    const { name, type, license } = req.body;
    const userId = req.user.id;
    
    const existingDataset = await Dataset.findOne({ userId, name });
    if (existingDataset) {
      return res.status(400).json({ message: "Dataset with this name already exists for the user." });
    }

    const newDataset = new Dataset({ name, type, license, userId });
    await newDataset.save();

    // Append the dataset ID to the user's list of datasets
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    user.datasets.push(newDataset._id);
    await user.save();

    res.status(201).json({ message: "Dataset created successfully", dataset: newDataset });
  } catch (error) {
    console.error("Error creating dataset:", error);
    res.status(500).json({ message: "Failed to create dataset", error });
  }
};

const getDatasetsForUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate("datasets");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ datasets: user.datasets });
  } catch (error) {
    console.error("Error fetching datasets:", error);
    res.status(500).json({ message: "Failed to fetch datasets", error });
  }
};

const addTaskToDataset = async (req, res) => {
  try {
    const { datasetId, size, startOn, creditsNeeded } = req.body;
    const userId = req.user.id;

    const dataset = await Dataset.findOne({ _id: datasetId, userId });
    if (!dataset) {
      return res.status(404).json({ message: "Dataset not found or doesn't belong to the user." });
    }

    const task = new Task({ datasetId, size, startOn, creditsNeeded });
    await task.save();

    dataset.tasks.push(task._id);
    await dataset.save();

    res.status(201).json({ message: "Task added successfully", task });
  } catch (error) {
    console.error("Error adding task:", error);
    res.status(500).json({ message: "Failed to add task", error });
  }
};

// module.exports = { createDataset, addTaskToDataset, getDatasetsForUser };


// Generate Pre-signed URL
const generatePresignedUrls = async (req, res) => {
  try {
    const { datasetId, taskId, fileNames } = req.body;

    if (!Array.isArray(fileNames) || fileNames.length === 0) {
      return res.status(400).json({ message: "fileNames should be a non-empty array." });
    }

    const dataset = await Dataset.findById(datasetId);
    if (!dataset) return res.status(404).json({ message: "Dataset not found." });

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found." });

    const urls = await Promise.all(fileNames.map(async (fileName) => {
      const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `uploads/${datasetId}/${taskId}/${fileName}`,
        ContentType: "image/jpeg" // Change based on file type
      });

      const url = await getSignedUrl(s3, command, { expiresIn: 3600 }); // 1 hour expiry

      return { fileName, url };
    }));

    res.status(200).json({ urls });
  } catch (error) {
    console.error("Error generating presigned URLs:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = { 
  createDataset, 
  addTaskToDataset, 
  getDatasetsForUser, 
  generatePresignedUrls 
};