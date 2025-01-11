const express = require("express");
const router = express.Router();
const OpeningHours = require("../models/OpeningHours");

// Add working hours
router.post("/opening-hours", async (req, res) => {
  try {
    const { hours } = req.body;

    // Assuming the data sent from frontend matches the schema format
    const newOpeningHours = new OpeningHours(hours);

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
router.get("/opening-hours", async (req, res) => {
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

module.exports = router;
