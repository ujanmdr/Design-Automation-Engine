import { NextRequest, NextResponse } from "next/server";
import { generateAnniversaryCard1, generateAnniversaryCard2 } from "@/lib/image-engine";
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { employeeId, yearsCompleted, testimonial, x, y, scale, typographySettings, imageAdjustments } = body;

    if (!employeeId) {
      return NextResponse.json({ error: "Missing employeeId" }, { status: 400 });
    }

    const dataPath = path.join(process.cwd(), "src", "data", "employees.json");
    const rawData = await fs.readFile(dataPath, "utf-8");
    const employees = JSON.parse(rawData);

    const emp = employees.find(
      (e: any) =>
        String(e.id).toLowerCase() === String(employeeId).toLowerCase() ||
        e.name.toLowerCase() === String(employeeId).toLowerCase()
    );

    if (!emp) {
      return NextResponse.json({ error: `Employee '${employeeId}' not found` }, { status: 404 });
    }

    const employeePhotoPath = path.join(
      process.cwd(),
      "public", "assets", "templates", "Id Card Employee Images",
      emp.photoFileName
    );

    // Resolve photo buffer
    let photoBuffer: Buffer;
    try {
      photoBuffer = await fs.readFile(employeePhotoPath);
    } catch (err) {
      console.warn("Could not load employee photo for preview, using fallback gradient", err);
      photoBuffer = await sharp({
        create: { width: 600, height: 600, channels: 4, background: { r: 244, g: 125, b: 48, alpha: 1 } }
      }).png().toBuffer();
    }

    const timestamp = Date.now();
    const card1Filename = `preview_${emp.id}_card1_${timestamp}.png`;
    const card2Filename = `preview_${emp.id}_card2_${timestamp}.png`;

    // Generate Card 1 preview
    const card1Url = await generateAnniversaryCard1({
      name: emp.name,
      title: emp.title,
      photoBuffer,
      outputFilename: card1Filename,
      x: x !== undefined ? x : (emp.anniversaryPhotoSettings?.x ?? 0),
      y: y !== undefined ? y : (emp.anniversaryPhotoSettings?.y ?? 148),
      scale: scale !== undefined ? scale : (emp.anniversaryPhotoSettings?.scale ?? 1.0),
      typographySettings,
      imageAdjustments
    });

    // Generate Card 2 preview
    const card2Url = await generateAnniversaryCard2({
      yearsText: yearsCompleted || "3 Years",
      testimonial: testimonial || "Thank you for your dedication, hard work, and valuable contributions to GritFeat!",
      outputFilename: card2Filename
    });

    // Clean up old preview files for this employee to prevent directory bloat
    const outputsDir = path.join(process.cwd(), "public", "outputs");
    try {
      const files = await fs.readdir(outputsDir);
      for (const file of files) {
        if (file.startsWith(`preview_${emp.id}_`) && file !== card1Filename && file !== card2Filename) {
          await fs.unlink(path.join(outputsDir, file));
        }
      }
    } catch (e) {
      console.warn("Error cleaning up old previews:", e);
    }

    return NextResponse.json({
      success: true,
      card1Url,
      card2Url
    });

  } catch (error: any) {
    console.error("Error generating anniversary previews:", error);
    return NextResponse.json(
      { error: "Failed to generate card previews", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
