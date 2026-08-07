import fs from "fs/promises";
import path from "path";
import { generateBirthdayPost } from "../src/lib/image-engine";

async function runDailyJob() {
  console.log("Starting daily birthday check...");
  const dataPath = path.join(process.cwd(), "src", "data", "employees.json");
  const photosDir = path.join(process.cwd(), "public", "assets", "templates", "Birthday Post Employee Images");
  
  try {
    const rawData = await fs.readFile(dataPath, "utf-8");
    const employees = JSON.parse(rawData);

    // Get today's month and day (MM-DD)
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${month}-${day}`;

    const birthdayFolks = employees.filter((emp: any) => emp.birthday === todayStr);

    if (birthdayFolks.length === 0) {
      console.log(`No birthdays today (${todayStr}).`);
      return;
    }

    console.log(`Found ${birthdayFolks.length} birthday(s) today! Generating posts...`);

    for (const emp of birthdayFolks) {
      console.log(`Processing: ${emp.name}`);
      const photoPath = path.join(photosDir, emp.photoFileName);
      
      let photoBuffer;
      try {
        photoBuffer = await fs.readFile(photoPath);
      } catch (err) {
        console.error(`Could not read photo for ${emp.name} at ${photoPath}`);
        continue;
      }

      const outputFilename = `${emp.name} birthday post.png`;
      const subtext = "Wishing you a joyful day and a successful year ahead!"; // Default or could pull from DB

      await generateBirthdayPost({
        name: emp.name,
        title: emp.title,
        subtext: subtext,
        photoBuffer,
        x: emp.birthdayPhotoSettings?.x ?? 160,
        y: emp.birthdayPhotoSettings?.y ?? 568,
        scale: emp.birthdayPhotoSettings?.scale ?? 1.15,
        outputFilename
      });
      console.log(`✅ Successfully generated: ${outputFilename}`);
    }

    console.log("Daily job completed successfully.");
  } catch (error) {
    console.error("Error running daily job:", error);
  }
}

// Run it if called directly
runDailyJob();
