const express = require("express");
const router = express.Router();
const Service = require("../models/Service"); // Import the service schema

// Add a new service
router.post("/services", async (req, res) => {
  try {
    const { title, description, treatmentLength, price } = req.body;

    if (!title || !description || !treatmentLength || !price) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const newService = new Service({
      title,
      description,
      treatmentLength,
      price,
    });

    const savedService = await newService.save();
    res.status(200).json(savedService);
  } catch (error) {
    console.error("Error adding service:", error);
    res.status(500).json({ error: "Internal server error" });
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

    res.json(updatedService);
  } catch (error) {
    console.error("Error updating service:", error);
    res.status(500).json({ error: "Server error while updating service." });
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

    res.json({ message: "Service deleted successfully.", deletedService });
  } catch (error) {
    console.error("Error deleting service:", error);
    res.status(500).json({ error: "Server error while deleting service." });
  }
});

module.exports = router;
