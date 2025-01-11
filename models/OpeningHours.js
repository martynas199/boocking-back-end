const mongoose = require("mongoose");

const openingHoursSchema = new mongoose.Schema({
  hours: {
    type: Map,
    of: {
      isOpen: Boolean,
      open: String,
      close: String,
      breaks: [
        {
          from: String,
          to: String,
        },
      ],
    },
  },
});

const OpeningHours = mongoose.model("OpeningHours", openingHoursSchema);

module.exports = OpeningHours;
