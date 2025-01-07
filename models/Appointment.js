const mongoose = require("mongoose");

const AppointmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  service: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  sessionId: { type: String, required: true },
  payment_verified: { type: Boolean, default: false },
  treatmentLength: { type: Number, required: true }, // New field
});

const Appointment = mongoose.model("Appointment", AppointmentSchema);

module.exports = Appointment;
