const fs = require('fs/promises');
const path = require('path');

async function initDB() {
  const imagesDir = path.join(process.cwd(), '..', 'Assets', 'Templates', 'Birthday Post Employee Images');
  const dataDir = path.join(process.cwd(), 'src', 'data');
  const dbPath = path.join(dataDir, 'employees.json');

  try {
    await fs.mkdir(dataDir, { recursive: true });
    
    // Check if db already exists
    try {
      await fs.access(dbPath);
      console.log('Database already exists at', dbPath);
      return;
    } catch (e) {
      // File doesn't exist, proceed
    }

    const files = await fs.readdir(imagesDir);
    const employees = files
      .filter(f => f.endsWith('.png') || f.endsWith('.jpg'))
      .map(file => {
        const name = path.parse(file).name;
        return {
          id: name.toLowerCase().replace(/\s+/g, '-'),
          name: name,
          title: "Team Member", // Default
          birthday: "01-01", // Default MM-DD
          photoFileName: file,
          photoSettings: {
            x: 160,
            y: 568,
            scale: 1.15
          }
        };
      });

    await fs.writeFile(dbPath, JSON.stringify(employees, null, 2));
    console.log(`Successfully generated employees.json with ${employees.length} entries.`);

  } catch (error) {
    console.error("Error initializing DB:", error);
  }
}

initDB();
