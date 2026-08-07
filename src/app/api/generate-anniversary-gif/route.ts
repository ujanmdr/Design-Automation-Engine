import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";
import fsSync from "fs";

const execFileAsync = promisify(execFile);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { videoUrl } = body;
    if (!videoUrl) {
      return NextResponse.json({ error: "videoUrl is required" }, { status: 400 });
    }

    const cleanUrl = videoUrl.split("?")[0];
    const inputVideoPath = path.join(process.cwd(), "public", cleanUrl);

    if (!fsSync.existsSync(inputVideoPath)) {
      return NextResponse.json({ error: `Video file not found on disk at: ${inputVideoPath}` }, { status: 404 });
    }

    const gifFilename = path.basename(cleanUrl).replace(/\.mp4$/i, ".gif");
    const outputGifPath = path.join(process.cwd(), "public", "outputs", gifFilename);
    const gifUrl = `/outputs/${gifFilename}`;

    const ffmpegPath = eval("require")("@ffmpeg-installer/ffmpeg").path;
    console.log(`Converting video to GIF using ffmpeg binary: ${ffmpegPath}`);

    const args = [
      "-y",
      "-i", inputVideoPath,
      "-vf", "fps=10,scale=540:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse",
      outputGifPath
    ];

    await execFileAsync(ffmpegPath, args);
    console.log(`Successfully converted ${inputVideoPath} to GIF at ${outputGifPath}`);

    return NextResponse.json({
      success: true,
      gifUrl: `${gifUrl}?t=${Date.now()}`,
      message: "GIF exported successfully!"
    });

  } catch (error: any) {
    console.error("Error generating GIF:", error);
    return NextResponse.json(
      { error: "Failed to generate GIF", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
