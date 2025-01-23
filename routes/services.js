const express = require("express");
const router = express.Router();
const Service = require("../models/Service"); // Service schema
const multer = require("multer");
const cloudinary = require("../utils/cloudinary");
const fs = require("fs");

// Multer setup: Temporary file storage
const upload = multer({ dest: "uploads/" });

// Helper: Delete local file
const deleteLocalFile = (path) => {
  try {
    fs.unlinkSync(path);
  } catch (err) {
    console.error("Error deleting local file:", err);
  }
};

// Add a new service
router.post("/services", upload.single("image"), async (req, res) => {
  try {
    const { title, description, treatmentLength, price } = req.body;

    // Validate fields
    if (!title || !description || !treatmentLength || !price || !req.file) {
      return res
        .status(400)
        .json({ error: "All fields, including an image, are required." });
    }

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "services", // Optional folder in Cloudinary
    });

    // Create and save new service
    const newService = new Service({
      title,
      description,
      treatmentLength,
      price,
      imageUrl: result.secure_url,
    });
    const savedService = await newService.save();

    // Clean up local file storage
    deleteLocalFile(req.file.path);

    res.status(200).json(savedService);
  } catch (error) {
    console.error("Error adding service:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    // Ensure local file is deleted even if an error occurs
    if (req.file) deleteLocalFile(req.file.path);
  }
});

// Get all services
router.get("/services", async (req, res) => {
  try {
    const services = await Service.find();
    res.status(200).json(services);
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Edit an existing service
router.put("/services/:id", async (req, res) => {
  const { id } = req.params;
  const { title, description, treatmentLength, price } = req.body;

  // Validate fields
  if (!title || !description || !treatmentLength || !price) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const updatedService = await Service.findByIdAndUpdate(
      id,
      { title, description, treatmentLength, price },
      { new: true, runValidators: true }
    );

    if (!updatedService) {
      return res.status(404).json({ error: "Service not found." });
    }

    res.status(200).json(updatedService);
  } catch (error) {
    console.error("Error updating service:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete a service
router.delete("/services/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deletedService = await Service.findByIdAndDelete(id);

    if (!deletedService) {
      return res.status(404).json({ error: "Service not found." });
    }

    res
      .status(200)
      .json({ message: "Service deleted successfully.", deletedService });
  } catch (error) {
    console.error("Error deleting service:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
