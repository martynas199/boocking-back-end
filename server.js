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
            currency: "GBP",
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
        "https://booking-virid.vercel.app/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://booking-virid.vercel.app/cancel",
      payment_method_types: ["card", "paypal", "klarna"], // Include PayPal and Klarna
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

      // Check if an appointment already exists for this sessionId
      const existingAppointment = await Appointment.findOne({ sessionId });

      if (existingAppointment) {
        if (existingAppointment.payment_verified) {
          return res.status(200).json({
            success: true,
            message: "Succesfully booked.",
          });
        }

        // Update payment status if appointment exists but was not verified
        existingAppointment.payment_verified = true;
        await existingAppointment.save();
        return res.status(200).json({
          success: true,
          message: "Payment verified and appointment updated successfully.",
        });
      }

      // Create a new appointment
      const appointment = new Appointment({
        name,
        email,
        phone,
        service,
        date,
        time,
        sessionId,
        payment_verified: true, // Mark as verified
      });

      await appointment.save();

      return res.status(200).json({
        success: true,
        message: "Appointment created successfully.",
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

// Endpoint to update an appointment
app.put("/api/appointments/:id", async (req, res) => {
  const { id } = req.params; // Get appointment ID from URL
  const { name, email, phone, service, date, time } = req.body; // Get updated data from request body

  try {
    // Find the appointment by ID and update it
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      { name, email, phone, service, date, time },
      { new: true } // Return the updated document
    );

    if (!updatedAppointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    res.status(200).json({
      success: true,
      message: "Appointment updated successfully",
      appointment: updatedAppointment,
    });
  } catch (err) {
    console.error("Error updating appointment:", err);
    res.status(500).json({ error: "Failed to update appointment" });
  }
});

// Endpoint to delete an appointment
app.delete("/api/appointments/:id", async (req, res) => {
  const { id } = req.params; // Get appointment ID from URL

  try {
    // Find the appointment by ID and delete it
    const deletedAppointment = await Appointment.findByIdAndDelete(id);

    if (!deletedAppointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    res.status(200).json({
      success: true,
      message: "Appointment deleted successfully",
      appointment: deletedAppointment,
    });
  } catch (err) {
    console.error("Error deleting appointment:", err);
    res.status(500).json({ error: "Failed to delete appointment" });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
