import { NextRequest, NextResponse } from "next/server";
import { generateBirthdayPost } from "@/lib/image-engine";
import fs from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { employeeId, subtext, x, y, scale } = body;

    if (!employeeId) {
      return NextResponse.json({ error: "Employee ID is required" }, { status: 400 });
    }

    const dataPath = path.join(process.cwd(), "src", "data", "employees.json");
    const rawData = await fs.readFile(dataPath, "utf-8");
    let employees = JSON.parse(rawData);

    const index = employees.findIndex((emp: any) => emp.id === employeeId);
    if (index === -1) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    const employee = employees[index];

    // Read photo from server disk
    const photoPath = path.join(
      process.cwd(), 
      "public", "assets", "templates", "Birthday Post Employee Images", 
      employee.photoFileName
    );
    
    let photoBuffer;
    try {
      photoBuffer = await fs.readFile(photoPath);
    } catch (err) {
      return NextResponse.json({ error: "Employee photo file not found" }, { status: 404 });
    }

    // Save the new coordinates in the database so the cron uses them tomorrow!
    employee.birthdayPhotoSettings = {
      x: x ?? 160,
      y: y ?? 568,
      scale: scale ?? 1.15
    };
    await fs.writeFile(dataPath, JSON.stringify(employees, null, 2));

    // Generate Post
    const outputFilename = `${employee.name} birthday post.png`;
    const outputUrl = await generateBirthdayPost({
      name: employee.name,
      title: employee.title,
      subtext: subtext || "Wishing you a joyful day and a successful year ahead!",
      photoBuffer,
      x: employee.birthdayPhotoSettings.x,
      y: employee.birthdayPhotoSettings.y,
      scale: employee.birthdayPhotoSettings.scale,
      outputFilename
    });

    return NextResponse.json({ 
      success: true, 
      imageUrl: outputUrl 
    });

  } catch (error) {
    console.error("Error generating post:", error);
    return NextResponse.json({ error: "Failed to generate post" }, { status: 500 });
  }
}
