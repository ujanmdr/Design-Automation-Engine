import { NextRequest, NextResponse } from "next/server";
import { renderWorkAnniversaryVideo, WorkAnniversaryData } from "@/lib/nexrender-engine";
import fs from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { employeeId, employeeName, employeeDesignation, yearsCompleted, employeePhotoUrl, testimonial, x, y, scale, templateType } = body;

    let userData: WorkAnniversaryData;

    if (employeeId) {
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

      userData = {
        employeeName: emp.name,
        employeeDesignation: emp.title,
        yearsCompleted: yearsCompleted || "3 Years",
        compositionName: body.compositionName || "Comp 1",
        templateType: templateType || "story",
        testimonial: testimonial,
        employeePhotoUrl: path.join(process.cwd(), "public", "assets", "templates", "Id Card Employee Images", emp.photoFileName),
        x: x !== undefined ? x : (emp.anniversaryPhotoSettings?.x ?? 0),
        y: y !== undefined ? y : (emp.anniversaryPhotoSettings?.y ?? 148), // default y to 148 so it sits nicely in the blue area under the white header
        scale: scale !== undefined ? scale : (emp.anniversaryPhotoSettings?.scale ?? 1.0)
      };
    } else {
      if (!employeeName || !employeeDesignation) {
        return NextResponse.json({ error: "Missing required employee details" }, { status: 400 });
      }

      userData = {
        employeeName,
        employeeDesignation,
        yearsCompleted: yearsCompleted || "3 Years",
        compositionName: body.compositionName || "Comp 1",
        templateType: templateType || "story",
        employeePhotoUrl: employeePhotoUrl || path.join(process.cwd(), "public", "assets", "images", "image_0.png"),
        x: x !== undefined ? x : 0,
        y: y !== undefined ? y : 148,
        scale: scale !== undefined ? scale : 1.0
      };
    }

    const result = await renderWorkAnniversaryVideo(userData);

    return NextResponse.json({
      success: true,
      videoUrl: result.videoUrl,
      card1Url: result.card1Url,
      card2Url: result.card2Url,
      message: `Work Anniversary Video rendered successfully for ${userData.employeeName}!`
    });

  } catch (error: any) {
    console.error("Error in generate-anniversary-video route:", error);
    return NextResponse.json(
      { error: "Failed to generate anniversary video", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
