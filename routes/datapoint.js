const express = require("express");
const { createDataPoint, getDataPoints, updateDataPoint, deleteDataPoint } = require("../controllers/datapointController");
const { authenticate } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/create", authenticate, createDataPoint);
router.get("/", authenticate, getDataPoints);
router.put("/:id", authenticate, updateDataPoint);
router.delete("/:id", authenticate, deleteDataPoint);

module.exports = router;
