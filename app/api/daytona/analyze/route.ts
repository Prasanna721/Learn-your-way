import { NextResponse } from "next/server";
import { getDaytona } from "@/lib/daytona";
import fs from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  try {
    const {
      sandboxId,
      execSessionId,
      request: userRequest,
      scopeId,
    } = await request.json();

    if (!sandboxId || !execSessionId || !userRequest || !scopeId) {
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

    // Read design.md content
    const designPath = path.join(process.cwd(), "agents", "design.md");
    const designContent = await fs.readFile(designPath, "utf-8");

    // Prepare paths (using volume mount)
    const outputPath = `/home/daytona/claude-cloud/output/${scopeId}/output.html`;
    const codePath = `/home/daytona/claude-cloud/code/${scopeId}`;
    const agentPath = `/home/daytona/claude-cloud/code_analyzer_agent.py`;

    // Execute code_analyzer_agent.py
    const command = `python ${agentPath} --path ${codePath} --request "${userRequest.replace(
      /"/g,
      '\\"'
    )}" --design "modern and clean with coral palette" --output ${outputPath}`;

    console.log("Executing command:", command);

    // Get sandbox from daytona
    const sandbox = await daytona.get(sandboxId);

    await sandbox.process.executeSessionCommand(execSessionId, {
      command,
      async: true,
    });

    console.log("Analysis started");

    return NextResponse.json({
      success: true,
      message: "Analysis started",
      outputPath,
    });
  } catch (error) {
    console.error("Error starting analysis:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
