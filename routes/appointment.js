const express = require("express");
const router = express.Router();
const Stripe = require("stripe"); // Import Stripe
const Appointment = require("./../models/Appointment");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); // Initialize Stripe with secret key
const sendBookingConfirmation = require("../email/bookingConfirmation"); // Import the email function

// Endpoint to create a PaymentIntent with Stripe
router.post("/payment", async (req, res) => {
  const {
    name,
    service,
    email,
    phone,
    date,
    time,
    treatmentLength,
    treatmentPrice,
  } = req.body;

  // Validate all required fields
  const missingFields = [];
  if (!name) missingFields.push("name");
  if (!service) missingFields.push("service");
  if (!email) missingFields.push("email");
  if (!phone) missingFields.push("phone");
  if (!date) missingFields.push("date");
  if (!time) missingFields.push("time");
  if (!treatmentLength) missingFields.push("treatmentLength");
  if (!treatmentPrice) missingFields.push("treatmentPrice");

  if (missingFields.length > 0) {
    return res.status(400).json({
      error: `All fields are required. Missing: ${missingFields}`,
    });
  }

  try {
    // Calculate 25% of treatmentPrice
    const unitAmount = Math.round((treatmentPrice * 25) / 100);

    // Create a Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "klarna", "paypal"], // Include additional payment methods
      line_items: [
        {
          price_data: {
            currency: "GBP",
            product_data: {
              name: service,
              description: `Booking for ${name}`,
            },
            unit_amount: unitAmount * 100, // Convert to pence
          },
          quantity: 1,
        },
      ],
      mode: "payment", // One-time payment
      success_url:
        "https://permanentbyjuste.co.uk/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://booking-virid.vercel.app/cancel",
      metadata: {
        name,
        service,
        email,
        phone,
        date,
        time,
        treatmentLength, // Add treatmentLength to metadata
        treatmentPrice,
      },
    });

    return res.status(200).json({ id: session.id });
  } catch (error) {
    console.error("Error creating payment session:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Utility function to check if an appointment exists
const checkExistingAppointment = async (sessionId, date, time, service) => {
  return await Appointment.findOne({ sessionId, date, time, service });
};

router.post("/verify-payment", async (req, res) => {
  const {
    sessionId,
    isAdmin,
    name,
    email,
    phone,
    service,
    date,
    time,
    treatmentLength,
    treatmentPrice,
  } = req.body;

  // If admin, bypass sessionId requirement
  if (isAdmin) {
    try {
      // Check if an appointment already exists for the given date and time
      const existingAppointment = await checkExistingAppointment(
        null,
        date,
        time,
        service
      );

      if (existingAppointment) {
        return res.status(400).json({
          success: false,
          message: "An appointment already exists for the given date and time.",
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
        sessionId: null, // No sessionId needed for admin bookings
        payment_verified: true, // Automatically verified
        treatmentLength, // Save treatmentLength
        treatmentPrice,
      });

      await appointment.save();

      sendBookingConfirmation(email, name, {
        service: service,
        date: date,
        time: time,
      });

      return res.status(200).json({
        success: true,
        message: "Appointment created successfully by admin.",
      });
    } catch (error) {
      console.error("Error creating appointment by admin:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to create appointment by admin.",
        error,
      });
    }
  }

  // Regular flow for verifying payment
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
      // Use the data from req.body instead of session.metadata
      const { name, service, email, phone, date, time, treatmentLength } =
        req.body;

      // Check if an appointment already exists for this sessionId
      const existingAppointment = await checkExistingAppointment(
        sessionId,
        date,
        time,
        service
      );

      if (existingAppointment) {
        if (existingAppointment.payment_verified) {
          sendBookingConfirmation(email, name, {
            service: service,
            date: date,
            time: time,
          });

          return res.status(200).json({
            success: true,
            message: "Successfully booked.",
          });
        }

        // Update payment status if appointment exists but was not verified
        existingAppointment.payment_verified = true;
        await existingAppointment.save();
        sendBookingConfirmation(email, name, {
          service: service,
          date: date,
          time: time,
        });

        return res.status(200).json({
          success: true,
          message: "Payment verified and appointment updated successfully.",
        });
      }

      // Create a new appointment with treatmentLength
      const appointment = new Appointment({
        name,
        email,
        phone,
        service,
        date,
        time,
        sessionId,
        payment_verified: true, // Mark as verified
        treatmentLength, // Save treatmentLength
        treatmentPrice,
      });

      await appointment.save();

      sendBookingConfirmation(email, name, {
        service: service,
        date: date,
        time: time,
      });

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
router.get("/appointments", async (req, res) => {
  try {
    const appointments = await Appointment.find();
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to update an appointment
router.put("/appointments/:id", async (req, res) => {
  const { id } = req.params; // Get appointment ID from URL
  const { name, email, phone, service, date, time, treatmentLength } = req.body; // Get updated data from request body

  try {
    // Find the appointment by ID and update it
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      { name, email, phone, service, date, time, treatmentLength },
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
router.delete("/appointments/:id", async (req, res) => {
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

module.exports = router;
