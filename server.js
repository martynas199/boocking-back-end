const express = require("express");
const cors = require("cors");
require("dotenv").config();
const serviceRoutes = require("./routes/services");
const appointmentRoutes = require("./routes/appointment");
const workingHoursRoutes = require("./routes/openingHours");
const adminRoutes = require("./routes/admin");

const app = express();
app.use(express.json());
app.use(cors());
const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error(err));

// Routes
app.use("/api", serviceRoutes);
app.use("/api", appointmentRoutes);
app.use("/api", workingHoursRoutes);
app.use("/api/admin", adminRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: err });
});

app.listen(5000, () => console.log("Server running on port 5000"));
