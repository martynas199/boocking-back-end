const moment = require("moment");
const cron = require("node-cron");
const Appointment = require("../models/Appointment");
const sendBookingReminder = require("../email/bookingReminder"); // Adjust path accordingly

cron.schedule("0 * * * *", async () => {
  try {
    const now = moment();
    const reminderTime = now.add(24, "hours"); // 24 hours from now

    // Find appointments happening 24 hours from now
    const appointments = await Appointment.find({
      date: reminderTime.format("YYYY-MM-DD"), // Date 24 hours from now
      time: {
        $gte: reminderTime.format("HH:mm:ss"),
        $lt: reminderTime.add(1, "hour").format("HH:mm:ss"), // 1-hour window for time
      },
    });

    // Send reminders for these appointments
    for (const appointment of appointments) {
      await sendBookingReminder(appointment);
    }
  } catch (error) {
    console.error("Error running the reminder email scheduler:", error);
  }
});
