const mongoose = require("mongoose");

const breakSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
});

const openingHoursSchema = new mongoose.Schema({
  Mon: {
    isOpen: { type: Boolean, default: false },
    open: { type: String, required: true },
    close: { type: String, required: true },
    breaks: [breakSchema],
  },
  Tue: {
    isOpen: { type: Boolean, default: false },
    open: { type: String, required: true },
    close: { type: String, required: true },
    breaks: [breakSchema],
  },
  Wed: {
    isOpen: { type: Boolean, default: false },
    open: { type: String, required: true },
    close: { type: String, required: true },
    breaks: [breakSchema],
  },
  Thu: {
    isOpen: { type: Boolean, default: false },
    open: { type: String, required: true },
    close: { type: String, required: true },
    breaks: [breakSchema],
  },
  Fri: {
    isOpen: { type: Boolean, default: false },
    open: { type: String, required: true },
    close: { type: String, required: true },
    breaks: [breakSchema],
  },
  Sat: {
    isOpen: { type: Boolean, default: false },
    open: { type: String, required: true },
    close: { type: String, required: true },
    breaks: [breakSchema],
  },
  Sun: {
    isOpen: { type: Boolean, default: false },
    open: { type: String, required: true },
    close: { type: String, required: true },
    breaks: [breakSchema],
  },
});

const OpeningHours = mongoose.model("OpeningHours", openingHoursSchema);

module.exports = OpeningHours;
