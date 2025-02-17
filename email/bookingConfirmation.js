require("dotenv").config(); // For loading environment variables
const sgMail = require("@sendgrid/mail");

// Set API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Send email function
const sendBookingConfirmation = async (toEmail, userName, bookingDetails) => {
  const msg = {
    to: toEmail, // Recipient's email
    from: "martynas.20@hotmail.com", // Your verified sender email
    subject: "Booking Confirmation",
    text: `Hello ${userName}, your booking is confirmed!`,
    html: `
     <p>Dear ${userName},</p>
<p>Thank you for booking with us! Here are your booking details:</p>
<table style="border-collapse: collapse; width: 100%; max-width: 600px; font-family: Arial, sans-serif;">
  <tr>
    <td style="padding: 8px; font-weight: bold;">Service:</td>
    <td style="padding: 8px;">${bookingDetails.service}</td>
  </tr>
  <tr style="background-color: #f9f9f9;">
    <td style="padding: 8px; font-weight: bold;">Date:</td>
    <td style="padding: 8px;">${bookingDetails.date}</td>
  </tr>
  <tr>
    <td style="padding: 8px; font-weight: bold;">Time:</td>
    <td style="padding: 8px;">${bookingDetails.time}</td>
  </tr>
</table>
<p>We look forward to seeing you!</p>
<p>Best regards,</p>
<p>Juste</p
    `,
  };

  try {
    console.log(
      "Booking confirmation email sent initiated sendBookingConfirmation."
    );

    await sgMail.send(msg);

    console.log("Booking confirmation email sent successfully.");
  } catch (error) {
    console.error(
      "Error sending email:",
      error.response?.body || error.message
    );
  }
};

module.exports = sendBookingConfirmation;
