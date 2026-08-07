const fs = require('fs');
const path = require('path');

const dataPath = path.join(process.cwd(), 'src', 'data', 'employees.json');

try {
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  const employees = JSON.parse(rawData);

  let migratedCount = 0;

  for (let emp of employees) {
    if (!emp.email) {
      // Create a default email based on their name
      const nameParts = emp.name.toLowerCase().split(' ');
      const email = `${nameParts[0]}.${nameParts[nameParts.length - 1]}@gritfeat.com`;
      emp.email = email;
      migratedCount++;
    }
  }

  fs.writeFileSync(dataPath, JSON.stringify(employees, null, 2));
  console.log(`Successfully added email field to ${migratedCount} employees.`);

} catch (error) {
  console.error("Error migrating DB:", error);
}
