import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const dataPath = path.join(process.cwd(), "src", "data", "employees.json");

export async function GET() {
  try {
    const rawData = await fs.readFile(dataPath, "utf-8");
    const employees = JSON.parse(rawData);
    return NextResponse.json({ success: true, employees });
  } catch (error) {
    console.error("Error reading employees:", error);
    return NextResponse.json({ error: "Failed to load employees" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const updatedEmployee = await req.json();
    if (!updatedEmployee.id) {
      return NextResponse.json({ error: "Employee ID is required" }, { status: 400 });
    }

    const rawData = await fs.readFile(dataPath, "utf-8");
    let employees = JSON.parse(rawData);

    const index = employees.findIndex((emp: any) => emp.id === updatedEmployee.id);
    if (index === -1) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    // Preserve existing photo if not provided in update
    employees[index] = { ...employees[index], ...updatedEmployee };

    await fs.writeFile(dataPath, JSON.stringify(employees, null, 2));

    return NextResponse.json({ success: true, employee: employees[index] });
  } catch (error) {
    console.error("Error updating employee:", error);
    return NextResponse.json({ error: "Failed to update employee" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Employee ID is required" }, { status: 400 });
    }

    const rawData = await fs.readFile(dataPath, "utf-8");
    let employees = JSON.parse(rawData);

    const index = employees.findIndex((emp: any) => emp.id === id);
    if (index === -1) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    const employee = employees[index];
    const photoFileName = employee.photoFileName;

    // Delete photos if they exist
    if (photoFileName) {
      const pathsToDelete = [
        path.join(process.cwd(), "public", "assets", "templates", "Id Card Employee Images", photoFileName),
        path.join(process.cwd(), "public", "assets", "templates", "Birthday Post Employee Images", photoFileName),
      ];

      for (const p of pathsToDelete) {
        try {
          await fs.unlink(p);
          console.log(`Successfully deleted file: ${p}`);
        } catch (err: any) {
          if (err.code !== "ENOENT") {
            console.warn(`Failed to delete file: ${p}`, err);
          }
        }
      }
    }

    // Filter out employee
    employees.splice(index, 1);

    await fs.writeFile(dataPath, JSON.stringify(employees, null, 2));

    return NextResponse.json({ success: true, message: `Employee '${employee.name}' and their files deleted successfully.` });
  } catch (error) {
    console.error("Error deleting employee:", error);
    return NextResponse.json({ error: "Failed to delete employee" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const title = formData.get("title") as string;
    const email = formData.get("email") as string;
    const birthday = formData.get("birthday") as string;
    const appointmentDate = formData.get("appointmentDate") as string;
    const birthdayPhoto = formData.get("birthdayPhoto") as File;
    const idPhoto = formData.get("idPhoto") as File;

    if (!name || !title || !email) {
      return NextResponse.json({ error: "Name, Designation, and Email are required" }, { status: 400 });
    }

    const dataPath = path.join(process.cwd(), "src", "data", "employees.json");
    const rawData = await fs.readFile(dataPath, "utf-8");
    let employees = JSON.parse(rawData);

    // Generate unique ID
    const baseId = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
    let id = baseId;
    let counter = 1;
    while (employees.some((e: any) => e.id === id)) {
      id = `${baseId}-${counter}`;
      counter++;
    }

    // Process filenames and upload photos
    let photoFileName = "image_0.png"; // fallback
    
    if (birthdayPhoto && idPhoto) {
      const ext = path.extname(birthdayPhoto.name) || ".png";
      const cleanName = name.trim().replace(/[^a-zA-Z0-9]+/g, "_");
      photoFileName = `${cleanName}_${Date.now()}${ext}`;

      // Save Birthday Photo
      const birthdayPhotoBuffer = Buffer.from(await birthdayPhoto.arrayBuffer());
      const birthdaySavePath = path.join(
        process.cwd(),
        "public",
        "assets",
        "templates",
        "Birthday Post Employee Images",
        photoFileName
      );
      await fs.writeFile(birthdaySavePath, birthdayPhotoBuffer);

      // Save ID Card Photo
      const idPhotoBuffer = Buffer.from(await idPhoto.arrayBuffer());
      const idSavePath = path.join(
        process.cwd(),
        "public",
        "assets",
        "templates",
        "Id Card Employee Images",
        photoFileName
      );
      await fs.writeFile(idSavePath, idPhotoBuffer);
    }

    const newEmployee = {
      id,
      name: name.trim(),
      title: title.trim(),
      birthday: birthday ? birthday.trim() : "01-01",
      photoFileName,
      birthdayPhotoSettings: { x: 160, y: 568, scale: 1.15 },
      idCardPhotoSettings: { x: 0, y: 0, scale: 1.0 },
      email: email.trim(),
      appointmentDate: appointmentDate ? appointmentDate.trim() : ""
    };

    employees.push(newEmployee);
    await fs.writeFile(dataPath, JSON.stringify(employees, null, 2));

    return NextResponse.json({ success: true, employee: newEmployee });
  } catch (error) {
    console.error("Error creating employee:", error);
    return NextResponse.json({ error: "Failed to create employee" }, { status: 500 });
  }
}
