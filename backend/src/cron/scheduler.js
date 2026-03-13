import cron from "node-cron";
import { processRecurringTransactions } from "./jobs/transaction.job.js";
import { processReportJob } from "./jobs/report.job.js";

const scheduleJob = (name, time, job) => {
  console.log(`Scheduling ${name} at ${time}`);

  return cron.schedule(
    time,
    async () => {
      try {
        await job();
        console.log(`${name} completed`);
      } catch (error) {
        console.log(`${name} failed`, error);
      }
    },
    {
      scheduled: true,
      timezone: "UTC",
    }
  );
};

export const startJobs = () => {
  return [
    // Runs every day at 5 AM
    scheduleJob("Transactions", "0 5 * * *", processRecurringTransactions),

    // Runs 2:30 AM on first day of every month
    scheduleJob("Weekly Reports", "30 2 * * 1", () => processReportJob("WEEKLY")),
    scheduleJob("Monthly Reports", "30 2 1 * *", () => processReportJob("MONTHLY")),
  ];
};
