const mongoose = require("mongoose");

const ServiceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  treatmentLength: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

const Service = mongoose.model("Service", ServiceSchema);

module.exports = Service;
