const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");
const dataPointRoutes = require("./routes/datapoint");
const datasetRoutes = require("./routes/dataset");
const AWS = require('aws-sdk');
const { generatePresignedUrls } = require("./controllers/datasetController");
const DataPoint = require("./models/datapoint");

dotenv.config();
const app = express();
app.use(express.json());


// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// AWS S3 Setup
const s3 = new AWS.S3();

// Function to process files in batch
const processUploadedFiles = async (records) => {
  try {
    console.log(`Processing batch of ${records.length} files`);

    const fileUrls = records.map(record => `s3://${record.s3.bucket.name}/${record.s3.object.key}`);

    // Simulated processing (replace with actual ML model processing)
    const processedResults = fileUrls.map(url => ({
      url,
      label: "Processed_Label" // Replace with actual ML output
    }));

    // Update MongoDB with processed labels
    for (let result of processedResults) {
      await DataPoint.findOneAndUpdate(
        { video_image_url: result.url },
        { $set: { final_label: result.label } }
      );
    }

    console.log("Batch processing complete.");
  } catch (error) {
    console.error("Error in batch processing:", error);
  }
};

// Route to handle S3 event notifications (acts like a Lambda function)
app.post("/api/s3-event", async (req, res) => {
  try {
    const { Records } = req.body;
    if (!Records || Records.length === 0) {
      return res.status(400).json({ message: "No records received." });
    }

    // Process the batch of uploaded files
    await processUploadedFiles(Records);

    res.status(200).json({ message: "Batch processing started" });
  } catch (error) {
    console.error("Error in S3 event processing:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

// Routes
app.use("/api/dataset", datasetRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/datapoint", dataPointRoutes);
app.post("/api/upload/presigned-url", generatePresignedUrls);

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

