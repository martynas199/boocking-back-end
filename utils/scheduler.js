const moment = require("moment");
const cron = require("node-cron");
const Appointment = require("../models/Appointment");
const sendBookingReminder = require("../email/bookingReminder"); // Adjust path accordingly

cron.schedule("0 * * * *", async () => {
  try {
    const now = moment();
    const reminderTimeStart = now.add(24, "hours").startOf("hour");
    const reminderTimeEnd = moment(reminderTimeStart).endOf("hour");

    console.log(
      `Checking appointments between ${reminderTimeStart.format(
        "YYYY-MM-DD HH:mm"
      )} and ${reminderTimeEnd.format("YYYY-MM-DD HH:mm")}`
    );

    // Find appointments happening 24 hours from now
    const appointments = await Appointment.find({
      payment_verified: true, // Ensure only verified appointments are considered
      $expr: {
        $and: [
          {
            $eq: [
              {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: { $dateFromString: { dateString: "$date" } },
                },
              },
              reminderTimeStart.format("YYYY-MM-DD"),
            ],
          },
          {
            $gte: [
              {
                $dateFromString: {
                  dateString: {
                    $concat: ["$date", "T", "$time", ":00"],
                  },
                },
              },
              reminderTimeStart.toDate(),
            ],
          },
          {
            $lt: [
              {
                $dateFromString: {
                  dateString: {
                    $concat: ["$date", "T", "$time", ":00"],
                  },
                },
              },
              reminderTimeEnd.toDate(),
            ],
          },
        ],
      },
    });

    if (appointments.length === 0) {
      console.log("No appointments found for the given reminder window.");
      return;
    }

    console.log(`Found ${appointments.length} appointment(s) to remind.`);

    // Send reminders for these appointments
    for (const appointment of appointments) {
      console.log(`Sending reminder for: ${appointment.name}`);
      await sendBookingReminder(appointment);
    }
  } catch (error) {
    console.error("Error running the reminder email scheduler:", error);
  }
});
