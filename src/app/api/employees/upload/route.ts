import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const id = formData.get("id") as string;
    const photoFile = formData.get("photo") as File;

    if (!id || !photoFile) {
      return NextResponse.json({ error: "ID and photo are required" }, { status: 400 });
    }

    const dataPath = path.join(process.cwd(), "src", "data", "employees.json");
    const rawData = await fs.readFile(dataPath, "utf-8");
    let employees = JSON.parse(rawData);

    const index = employees.findIndex((emp: any) => emp.id === id);
    if (index === -1) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    // Save the new photo securely
    const photoBuffer = Buffer.from(await photoFile.arrayBuffer());
    // Create a new filename to avoid browser caching issues on the frontend
    const ext = path.extname(photoFile.name) || ".png";
    const newFileName = `${employees[index].name}_${Date.now()}${ext}`;
    
    const savePath = path.join(process.cwd(), "public", "assets", "templates", "Birthday Post Employee Images", newFileName);
    await fs.writeFile(savePath, photoBuffer);

    // Optionally delete the old photo to save space
    if (employees[index].photoFileName) {
      const oldPath = path.join(process.cwd(), "public", "assets", "templates", "Birthday Post Employee Images", employees[index].photoFileName);
      try {
        await fs.unlink(oldPath);
      } catch (err) {
        console.warn("Could not delete old photo:", oldPath);
      }
    }

    // Update database record
    employees[index].photoFileName = newFileName;
    await fs.writeFile(dataPath, JSON.stringify(employees, null, 2));

    return NextResponse.json({ success: true, photoFileName: newFileName });
  } catch (error) {
    console.error("Error uploading photo:", error);
    return NextResponse.json({ error: "Failed to upload photo" }, { status: 500 });
  }
}
