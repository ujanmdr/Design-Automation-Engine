import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET() {
  try {
    const dataPath = path.join(process.cwd(), "src", "data", "employees.json");
    const rawData = await fs.readFile(dataPath, "utf-8");
    const employees = JSON.parse(rawData);

    // Sort by next upcoming birthday
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const enriched = employees.map((emp: any) => {
      const [month, day] = emp.birthday.split('-').map(Number);
      let nextBday = new Date(today.getFullYear(), month - 1, day);
      
      // If birthday has passed this year, it's next year
      if (nextBday < today) {
        nextBday.setFullYear(today.getFullYear() + 1);
      }
      
      const diffTime = nextBday.getTime() - today.getTime();
      const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        ...emp,
        daysUntil
      };
    });

    enriched.sort((a: any, b: any) => a.daysUntil - b.daysUntil);

    return NextResponse.json({ success: true, upcoming: enriched.slice(0, 10) });

  } catch (error) {
    console.error("Error reading birthdays:", error);
    return NextResponse.json({ error: "Failed to load birthdays" }, { status: 500 });
  }
}
