const cron = require("node-cron");
const sendBookingReminder = require("../email/bookingReminder"); // Import the email function

// Scheduler to check for appointments 24 hours from now
cron.schedule("0 * * * *", async () => {
  try {
    const now = new Date();
    const reminderTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

    // Find appointments happening 24 hours from now
    const appointments = await Appointment.find({
      date: reminderTime.toISOString().split("T")[0],
      time: {
        $gte: reminderTime.toTimeString().split(" ")[0],
        $lt: new Date(reminderTime.getTime() + 60 * 60 * 1000)
          .toTimeString()
          .split(" ")[0],
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
