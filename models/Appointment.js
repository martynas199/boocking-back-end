const mongoose = require("mongoose");

const AppointmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  service: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  sessionId: { type: String, required: true, unique: true }, // Store Stripe session ID
  payment_verified: { type: Boolean, default: false }, // Track payment status
});

module.exports = mongoose.model("Appointment", AppointmentSchema);
