const express = require("express");
const router = express.Router();
const OpeningHours = require("../models/OpeningHours");

// Add working hours
router.post("/working-hours", async (req, res) => {
  try {
    const { hours } = req.body;

    const newOpeningHours = new OpeningHours({ hours });
    await newOpeningHours.save();
    return res
      .status(201)
      .json({ message: "Opening hours saved successfully!" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error saving opening hours" });
  }
});

// Get working hours
router.get("/working-hours", async (req, res) => {
  try {
    // Retrieve the most recent entry for opening hours (or adjust if needed)
    const openingHours = await OpeningHours.findOne().sort({ createdAt: -1 });

    if (!openingHours) {
      return res.status(404).json({ message: "Opening hours not found" });
    }

    return res.status(200).json(openingHours);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching opening hours" });
  }
});

// Update working hours
router.put("/working-hours/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { hours } = req.body;

    // Find and update the opening hours by ID
    const updatedOpeningHours = await OpeningHours.findByIdAndUpdate(
      id,
      { hours },
      { new: true }
    );

    if (!updatedOpeningHours) {
      return res.status(404).json({ message: "Opening hours not found" });
    }

    return res.status(200).json({
      message: "Opening hours updated successfully!",
      data: updatedOpeningHours,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error updating opening hours" });
  }
});

module.exports = router;
