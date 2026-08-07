import cron from "node-cron";
import { exec } from "child_process";
import path from "path";

console.log("🚀 Background Birthday Cron Daemon Started!");
console.log("Listening for birthdays every day at 9:00 AM...");

// Run every day at 09:00 AM
cron.schedule("0 9 * * *", () => {
  console.log(`[${new Date().toISOString()}] Triggering daily-job.ts...`);
  
  const scriptPath = path.join(process.cwd(), "scripts", "daily-job.ts");
  
  exec(`npx tsx "${scriptPath}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing daily job: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Script Stderr: ${stderr}`);
    }
    console.log(`Script Output:\n${stdout}`);
  });
});
