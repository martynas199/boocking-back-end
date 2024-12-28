const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Stripe = require("stripe"); // Import Stripe
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

const Appointment = require("./models/Appointment");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); // Initialize Stripe with secret key

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error(err));

// Endpoint to create a PaymentIntent with Stripe
app.post("/api/payment", async (req, res) => {
  const { name, service, email, phone, date, time } = req.body;

  if (!name || !service || !email || !phone || !date || !time) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // Create a Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"], // Allow credit card payments
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: service,
              description: `Booking for ${name}`,
            },
            unit_amount: 5000, // Amount in cents (e.g., 5000 cents = $50)
          },
          quantity: 1,
        },
      ],
      mode: "payment", // One-time payment
      success_url:
        "http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "http://localhost:3000/cancel",
      metadata: {
        name,
        service,
        email,
        phone,
        date,
        time,
      },
    });

    // Return the session ID to the frontend
    res.status(200).json({
      id: session.id, // The Checkout session ID
    });
  } catch (err) {
    console.error("Error creating checkout session:", err);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

// Endpoint to verify the payment after successful Stripe Checkout
app.post("/api/verify-payment", async (req, res) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    return res
      .status(400)
      .json({ success: false, message: "Session ID is required" });
  }

  try {
    // Retrieve the Checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Check if the payment was successful
    if (session.payment_status === "paid") {
      const { name, service, email, phone, date, time } = session.metadata;

      // Check if the payment has already been processed for this session
      const existingAppointment = await Appointment.findOne({ sessionId });

      // If an appointment with this sessionId exists and payment is already verified, skip the creation
      if (existingAppointment && existingAppointment.payment_verified) {
        return res.status(400).json({
          success: false,
          message:
            "This payment has already been processed. Appointment already exists.",
        });
      }

      // Create the appointment only if payment is successful and not already processed
      const appointment = new Appointment({
        sessionId: session.id, // Store sessionId to check against future bookings
        name,
        email,
        phone,
        service,
        date,
        time,
        payment_verified: true, // Mark payment as verified
      });

      await appointment.save();

      return res.status(200).json({
        success: true,
        message: "Appointment created successfully",
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Payment was not successful. Appointment not created.",
      });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify payment",
    });
  }
});

// Fetch all appointments
app.get("/api/appointments", async (req, res) => {
  try {
    const appointments = await Appointment.find();
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
