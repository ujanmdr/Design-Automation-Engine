const fs = require('fs');
const path = require('path');

const dataPath = path.join(process.cwd(), 'src', 'data', 'employees.json');

try {
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  const employees = JSON.parse(rawData);

  let migratedCount = 0;

  for (let emp of employees) {
    if (emp.photoSettings) {
      emp.birthdayPhotoSettings = { ...emp.photoSettings };
      delete emp.photoSettings;
      migratedCount++;
    }
    
    // Ensure idCardPhotoSettings exists
    if (!emp.idCardPhotoSettings) {
      emp.idCardPhotoSettings = {
        x: 150, // placeholder defaults for ID card
        y: 200,
        scale: 1.0
      };
    }
    
    // Ensure birthdayPhotoSettings exists if it somehow didn't
    if (!emp.birthdayPhotoSettings) {
       emp.birthdayPhotoSettings = {
         x: 160,
         y: 568,
         scale: 1.15
       };
    }
  }

  fs.writeFileSync(dataPath, JSON.stringify(employees, null, 2));
  console.log(`Successfully migrated ${migratedCount} employees to new photo settings schema.`);

} catch (error) {
  console.error("Error migrating DB:", error);
}
