const mongoose = require("mongoose");

const AppointmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  service: { type: String, required: true },
  date: { type: Date, required: true },
});

module.exports = mongoose.model("Appointment", AppointmentSchema);
