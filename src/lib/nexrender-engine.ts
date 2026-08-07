import path from "path";
import fs from "fs/promises";
import fsSync from "fs";
import sharp from "sharp";

import { generateAnniversaryCard1, generateAnniversaryCard2 } from "./image-engine";

function findAerenderBinary(): string | undefined {
  const possiblePaths = [
    "C:\\Program Files\\Adobe\\Adobe After Effects 2023\\Support Files\\aerender.exe",
    "C:\\Program Files\\Adobe\\Adobe After Effects 2024\\Support Files\\aerender.exe",
    "C:\\Program Files\\Adobe\\Adobe After Effects 2025\\Support Files\\aerender.exe",
    "C:\\Program Files\\Adobe\\Adobe After Effects CC 2022\\Support Files\\aerender.exe",
  ];
  return possiblePaths.find((p) => fsSync.existsSync(p));
}

// Dynamic require for @nexrender/core to prevent Next.js Turbopack bundling errors
const getRender = () => {
  const core = eval("require")("@nexrender/core");
  return core.render;
};

export interface WorkAnniversaryData {
  employeeName: string;
  employeeDesignation: string;
  yearsCompleted: string; // e.g. "5 Years"
  employeePhotoUrl: string; // Local path or HTTP URL
  testimonial?: string;
  compositionName?: string;
  templateType?: "story" | "post";
  outputFilename?: string;
  x?: number;
  y?: number;
  scale?: number;
}

export interface WorkAnniversaryResult {
  videoUrl: string;
  card1Url: string;
  card2Url: string;
}

/**
 * Main Node.js Video Automation Function using Nexrender
 *
 * The Nexrender patch (commandLineRenderer.jsx) is installed at:
 * C:\Users\ujan\AppData\Roaming\Adobe\After Effects\23.0\Scripts\Startup\commandLineRenderer.jsx
 * This is user-writable and AE loads it automatically — no admin needed.
 */
export async function renderWorkAnniversaryVideo(
  userData: WorkAnniversaryData
): Promise<WorkAnniversaryResult> {
  console.log(`Starting After Effects video render pipeline for ${userData.employeeName} [format: ${userData.templateType || "story"}]...`);

  await fs.mkdir(path.join(process.cwd(), "public", "outputs"), { recursive: true });

  const templateFileName = userData.templateType === "post"
    ? "Work Anniversary Insta Post.aep"
    : "Work Anniversary2.aep";
  const aeTemplatePath = path.join(process.cwd(), "public", "assets", "templates", templateFileName);
  const outputFileName =
    userData.outputFilename ||
    `${userData.employeeName.replace(/\s+/g, "_")}_Anniversary.mp4`;
  const outputVideoPath = path.join(process.cwd(), "public", "outputs", outputFileName);

  // ── Step 1: Resolve Photo Buffer ─────────────────────────────────────────
  let photoBuffer: Buffer;
  try {
    if (
      userData.employeePhotoUrl.startsWith("http://") ||
      userData.employeePhotoUrl.startsWith("https://")
    ) {
      const res = await fetch(userData.employeePhotoUrl);
      const arrayBuffer = await res.arrayBuffer();
      photoBuffer = Buffer.from(arrayBuffer);
    } else {
      photoBuffer = await fs.readFile(userData.employeePhotoUrl);
    }
  } catch (err) {
    console.warn("Could not load employee photo, using fallback gradient", err);
    photoBuffer = await sharp({
      create: {
        width: 600,
        height: 600,
        channels: 4,
        background: { r: 244, g: 125, b: 48, alpha: 1 },
      },
    })
      .png()
      .toBuffer();
  }

  // ── Step 2: Generate Card 1 and Card 2 as flat PNGs ──────────────────────
  console.log("Generating flat PNGs for Card 1 and Card 2...");
  const card1Filename = `card1_${Date.now()}.png`;
  const card1Url = await generateAnniversaryCard1({
    name: userData.employeeName,
    title: userData.employeeDesignation,
    photoBuffer,
    outputFilename: card1Filename,
    x: userData.x,
    y: userData.y,
    scale: userData.scale
  });

  const card2Filename = `card2_${Date.now()}.png`;
  const card2Url = await generateAnniversaryCard2({
    yearsText: userData.yearsCompleted,
    testimonial: "", // Pass empty testimonial during video render to avoid double testimonial (AEP has a dedicated TextLayer)
    outputFilename: card2Filename,
  });

  const card1Path = path.join(process.cwd(), "public", card1Url);
  const card2Path = path.join(process.cwd(), "public", card2Url);
  console.log(`Card 1: ${card1Path}\nCard 2: ${card2Path}`);

  // ── Step 3: Build Nexrender Job Payload ───────────────────────────────────
  const jobPayload: any = {
    template: {
      src: `file:///${aeTemplatePath.replace(/\\/g, "/")}`,
      composition: userData.compositionName || "Comp 1",
      outputExt: "mp4",
    },
    assets: [
      {
        type: "image",
        composition: "Pre-comp 1",
        layerName: "Card 1",
        src: `file:///${card1Path.replace(/\\/g, "/")}`,
      },
      {
        type: "image",
        composition: "Pre-comp 1",
        layerName: "Card 2",
        src: `file:///${card2Path.replace(/\\/g, "/")}`,
      },
      {
        type: "data",
        composition: "Comp 1",
        layerName: "Testimonial",
        property: "Source Text",
        value: userData.testimonial || "Thank you for your dedication, hard work, and valuable contributions to GritFeat!",
      },
    ],
    actions: {
      postrender: [
        {
          module: "@nexrender/action-copy",
          output: outputVideoPath,
        },
      ],
    },
  };

  // Find background overlay image based on anniversary year
  const yearsMatch = userData.yearsCompleted.match(/\d+/);
  const yearsNum = yearsMatch ? parseInt(yearsMatch[0]) : 3;
  const overlayFilename = `${yearsNum} Year.png`;
  const backgroundOverlayPath = path.join(
    process.cwd(),
    "public",
    "assets",
    "templates",
    "Background Overlay Images",
    overlayFilename
  );

  if (fsSync.existsSync(backgroundOverlayPath)) {
    console.log(`Found matching background overlay image: ${backgroundOverlayPath}`);
    jobPayload.assets.push({
      type: "image",
      composition: "Comp 1",
      layerName: "Background_Overlay",
      src: `file:///${backgroundOverlayPath.replace(/\\/g, "/")}`,
    });
  } else {
    console.warn(`Background overlay image not found: ${backgroundOverlayPath}. Falling back to default in AEP.`);
  }

  // ── Step 4: Execute Nexrender ─────────────────────────────────────────────
  try {
    const renderFunc = getRender();
    const aeBinary = findAerenderBinary();
    console.log(`Using After Effects Binary: ${aeBinary || "Autofind"}`);

    const result = await renderFunc(jobPayload, {
      workpath: path.join(process.cwd(), "scratch", "nexrender-work"),
      binary: aeBinary,
      skipCleanup: false,
      reuse: true,
      skipPatches: true,
      logger: console,
    });

    // Cleanup temporary card PNGs
    try {
      if (fsSync.existsSync(card1Path)) await fs.unlink(card1Path);
      if (fsSync.existsSync(card2Path)) await fs.unlink(card2Path);
    } catch (cleanupErr) {
      console.warn("Could not clean up temporary card files:", cleanupErr);
    }

    console.log("Nexrender completed successfully!", result?.uid);
    return {
      videoUrl: `/outputs/${outputFileName}`,
      card1Url,
      card2Url,
    };
  } catch (error) {
    console.error("Nexrender Execution Error:", error);
    throw error;
  }
}

/**
 * Auto-Execution Test Block (Sample Data)
 */
if (require.main === module) {
  const sampleData: WorkAnniversaryData = {
    employeeName: "Sarah Jenkins",
    employeeDesignation: "Senior UX Designer",
    yearsCompleted: "5 Years",
    employeePhotoUrl:
      "c:/Users/ujan/Desktop/Birthday & Video Automation/birthday-app/public/assets/templates/Birthday Post Employee Images/Aashish Chapain.png",
  };

  renderWorkAnniversaryVideo(sampleData)
    .then((r) => console.log(`Render Complete! Video: ${r.videoUrl}`))
    .catch((err) => console.error("Render Failed:", err));
}
