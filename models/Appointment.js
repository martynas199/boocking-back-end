const mongoose = require("mongoose");

const AppointmentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    trim: true,
    match: [/.+@.+\..+/, "Please enter a valid email address"], // Simple email validation
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    match: [/^\+?[0-9]{7,15}$/, "Please enter a valid phone number"], // Regex for phone number
  },
  service: { type: String, required: true, trim: true },
  date: { type: Date, required: true }, // Store date as Date type
  time: { type: String, required: true }, // Keep as String for simplicity
  treatmentLength: { type: Number, required: true, min: 1 }, // Ensure it's a positive number
});

module.exports = mongoose.model("Appointment", AppointmentSchema);
