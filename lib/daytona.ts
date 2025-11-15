import { Daytona } from "@daytonaio/sdk";
import fs from "fs/promises";
import path from "path";

let daytonaInstance: Daytona | null = null;
let sandboxInstance: any = null;

export async function initializeDaytona() {
  if (!process.env.DAYTONA_API_KEY) {
    throw new Error("DAYTONA_API_KEY is not set in environment variables");
  }

  // Initialize Daytona client
  daytonaInstance = new Daytona({
    apiKey: process.env.DAYTONA_API_KEY,
  });

  console.log("Daytona client initialized");

  return daytonaInstance;
}

export async function createSandboxWithVolume() {
  if (!daytonaInstance) {
    await initializeDaytona();
  }

  try {
    // Create or get the "claude-cloud" volume
    console.log("Getting or creating volume: claude-cloud");
    const volume = await daytonaInstance!.volume.get("claude-cloud", true);
    console.log("Volume ready:", volume.id);

    // Mount the volume to the sandbox
    const mountDir = "/home/daytona/claude-cloud";

    console.log("Creating sandbox with mounted volume...");
    const sandbox = await daytonaInstance!.create({
      volumes: [{ volumeId: volume.id, mountPath: mountDir }],
    });

    sandboxInstance = sandbox;
    console.log("Sandbox created:", sandbox.id);

    // Upload the code_analyzer_agent.py file to workspace/
    await uploadCodeAnalyzer(sandbox);

    // Delete the sandbox after upload - volume persists
    console.log("Deleting sandbox, keeping volume...");
    await daytonaInstance!.delete(sandbox);
    sandboxInstance = null;
    console.log("Sandbox deleted, volume persists");

    return { volume };
  } catch (error) {
    console.error("Error creating sandbox with volume:", error);
    throw error;
  }
}

async function uploadCodeAnalyzer(sandbox: any) {
  try {
    console.log("Uploading code_analyzer_agent.py to volume...");

    // Read the local file
    const localFilePath = path.join(
      process.cwd(),
      "agents",
      "code_analyzer_agent.py"
    );
    const fileContent = await fs.readFile(localFilePath);

    // Upload to volume mount path
    await sandbox.fs.uploadFile(
      fileContent,
      "/home/daytona/claude-cloud/code_analyzer_agent.py"
    );

    console.log("Successfully uploaded code_analyzer_agent.py");
  } catch (error) {
    console.error("Error uploading code_analyzer_agent.py:", error);
    throw error;
  }
}

export async function getSandbox() {
  return sandboxInstance;
}

export async function cleanupSandbox() {
  if (sandboxInstance && daytonaInstance) {
    try {
      console.log("Cleaning up sandbox...");
      await daytonaInstance.delete(sandboxInstance);
      sandboxInstance = null;
      console.log("Sandbox cleaned up");
    } catch (error) {
      console.error("Error cleaning up sandbox:", error);
    }
  }
}

export function getDaytona() {
  return daytonaInstance;
}

export async function createScopeSandbox(scopeId: string) {
  if (!daytonaInstance) {
    await initializeDaytona();
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set in environment variables");
  }

  try {
    // Get or create the claude-cloud volume
    console.log("Getting or creating volume: claude-cloud");
    const volume = await daytonaInstance!.volume.get("claude-cloud", true);
    console.log("Volume ready:", volume.id);

    // Mount the volume
    const mountDir = "/home/daytona/claude-cloud";

    console.log(`Creating sandbox for scope: ${scopeId}`);
    const sandbox = await daytonaInstance!.create({
      snapshot: "daytona-large",
      volumes: [{ volumeId: volume.id, mountPath: mountDir }],
      envVars: { ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY },
      public: true, // Make preview links publicly accessible
    });

    console.log("Sandbox created:", sandbox.id);

    // Check if volume code path exists
    const scopeCodePath = `/home/daytona/claude-cloud/code/${scopeId}`;
    let shouldUpload = false;

    try {
      const files = await sandbox.fs.listFiles(scopeCodePath);
      console.log(`Found existing files in ${scopeCodePath}:`, files.length);
      shouldUpload = files.length === 0;
    } catch (error) {
      // Directory doesn't exist, need to upload
      console.log(
        `Directory ${scopeCodePath} doesn't exist, will create and upload`
      );
      shouldUpload = true;
    }

    if (shouldUpload) {
      await uploadScopeFiles(sandbox, scopeId, scopeCodePath);
    } else {
      console.log("Files already exist, skipping upload");
    }

    await installDependencies(sandbox, scopeCodePath);

    // Create execution session for agent
    const execSessionId = `agent-session-${scopeId}`;
    await sandbox.process.createSession(execSessionId);
    console.log("Agent execution session created:", execSessionId);

    return { sandbox, volume, execSessionId };
  } catch (error) {
    console.error("Error creating scope sandbox:", error);
    throw error;
  }
}

async function uploadScopeFiles(
  sandbox: any,
  scopeId: string,
  targetPath: string
) {
  try {
    console.log(`Uploading files for scope: ${scopeId}`);

    // Create the directory structure
    await sandbox.fs.createFolder(targetPath, "755");
    await sandbox.fs.createFolder(`${targetPath}/static`, "755");
    await sandbox.fs.createFolder(`${targetPath}/static/css`, "755");
    await sandbox.fs.createFolder(`${targetPath}/static/js`, "755");

    // Read all files from the local scope directory
    const localScopePath = path.join(
      process.cwd(),
      "app",
      "scopes",
      scopeId,
      "files",
      "code"
    );

    // Define files to upload with their relative paths
    const filesToUpload = [
      "README.md",
      "main.py",
      "neural_network.py",
      "requirements.txt",
      "static/css/style.css",
      "static/index.html",
      "static/js/app.js",
    ];

    // Upload files
    const uploads = [];
    for (const file of filesToUpload) {
      const localPath = path.join(localScopePath, file);
      try {
        const content = await fs.readFile(localPath);
        uploads.push({
          source: content,
          destination: `${targetPath}/${file}`,
        });
        console.log(`Queued for upload: ${file}`);
      } catch (error) {
        console.warn(`Warning: Could not read file ${file}:`, error);
      }
    }

    // Upload all files at once
    if (uploads.length > 0) {
      await sandbox.fs.uploadFiles(uploads);
      console.log(`Successfully uploaded ${uploads.length} files`);
    }
  } catch (error) {
    console.error("Error uploading scope files:", error);
    throw error;
  }
}

async function installDependencies(sandbox: any, scopeCodePath: string) {
  try {
    console.log("Installing dependencies...");

    // Create an execution session with a specific ID
    const execSessionId = "python-install-session";
    await sandbox.process.createSession(execSessionId);
    console.log("Execution session created:", execSessionId);

    // Install claude-agent-sdk
    console.log("Installing claude-agent-sdk...");
    await sandbox.process.executeSessionCommand(execSessionId, {
      command: "pip install claude-agent-sdk",
      async: true,
    });
    await sandbox.process.executeSessionCommand(execSessionId, {
      command: "npm install -g @anthropic-ai/claude-code",
      async: true,
    });

    // Install requirements from requirements.txt
    console.log("Installing requirements from requirements.txt...");
    await sandbox.process.executeSessionCommand(execSessionId, {
      command: `cd ${scopeCodePath} && pip install -r requirements.txt`,
      async: true,
    });

    console.log("Dependencies installed successfully");
  } catch (error) {
    console.error("Error installing dependencies:", error);
    throw error;
  }
}
