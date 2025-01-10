const express = require("express");
const cors = require("cors");
require("dotenv").config();
const serviceRoutes = require("./routes/services");
const appointmentRoutes = require("./routes/appointment");
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

app.use("/api", serviceRoutes);
app.use("/api", appointmentRoutes);

app.listen(5000, () => console.log("Server running on port 5000"));
