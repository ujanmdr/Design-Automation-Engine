import { NextRequest, NextResponse } from "next/server";
import { generateIdCard, generateIdCardBackside } from "@/lib/image-engine";
import fs from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { employeeId, x, y, scale, customTitle } = body;

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

    // Read photo from public templates directory
    const photoPath = path.join(
      process.cwd(), 
      "public", "assets", "templates", "Id Card Employee Images", 
      employee.photoFileName
    );
    
    let photoBuffer;
    try {
      photoBuffer = await fs.readFile(photoPath);
    } catch (err) {
      return NextResponse.json({ error: "Employee photo file not found" }, { status: 404 });
    }

    // Save the new ID card coordinates in the database
    employee.idCardPhotoSettings = {
      x: x ?? 0,
      y: y ?? 0,
      scale: scale ?? 1.0
    };
    await fs.writeFile(dataPath, JSON.stringify(employees, null, 2));

    // Generate ID Card
    const outputFilename = `${employee.name} ID Card Front.png`;
    const frontUrl = await generateIdCard({
      name: employee.name,
      title: customTitle || "Engineering",
      email: employee.email,
      photoBuffer,
      x: employee.idCardPhotoSettings.x,
      y: employee.idCardPhotoSettings.y,
      scale: employee.idCardPhotoSettings.scale,
      outputFilename
    });

    let backUrl = null;
    if (body.includeBackside) {
      const backFilename = `${employee.name} ID Card Back.png`;
      backUrl = await generateIdCardBackside({
        qrCodeUrl: body.qrCodeUrl || "https://www.gritfeat.com",
        website: body.website || "www.gritfeat.com",
        email: body.email || "contact@gritfeat.com",
        phone: body.phone || "+977-01-5900445",
        address: body.address || "Ekantakuna-13, Laitpur",
        outputFilename: backFilename
      });
    }

    return NextResponse.json({ success: true, imageUrl: frontUrl, backUrl });
  } catch (error) {
    console.error("Error generating ID card:", error);
    return NextResponse.json({ error: "Failed to generate ID card" }, { status: 500 });
  }
}
