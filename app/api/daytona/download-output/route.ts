import { NextResponse } from "next/server";
import { getDaytona } from "@/lib/daytona";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sandboxId = searchParams.get("sandboxId");
    const outputPath = searchParams.get("outputPath");

    if (!sandboxId || !outputPath) {
      return NextResponse.json(
        { success: false, error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const daytona = getDaytona();
    if (!daytona) {
      return NextResponse.json(
        { success: false, error: "Daytona not initialized" },
        { status: 500 }
      );
    }

    // Get sandbox
    const sandbox = await daytona.get(sandboxId);

    // Download the file
    const content = await sandbox.fs.downloadFile(outputPath);

    // Convert Buffer to string
    const htmlContent = content.toString("utf-8");

    return NextResponse.json({
      success: true,
      content: htmlContent,
    });
  } catch (error) {
    console.error("Error downloading output:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
