const mongoose = require("mongoose");

const AppointmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  service: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  sessionId: { type: String, unique: true, required: true }, // Unique session ID
  payment_verified: { type: Boolean, default: false }, // Payment status
});

module.exports = mongoose.model("Appointment", AppointmentSchema);
