const express = require("express");
const { createDataset, addTaskToDataset, getDatasetsForUser } = require("../controllers/datasetController");
const { authenticate } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/create", authenticate, createDataset);
router.post("/task", authenticate, addTaskToDataset);
router.get("/", authenticate, getDatasetsForUser);

module.exports = router;
