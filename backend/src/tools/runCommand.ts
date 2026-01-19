import { spawn } from "node:child_process";

interface RunCommandOptions {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  onLine?: (line: string) => void;
}

export interface RunCommandResult {
  code: number | null;
  signal: NodeJS.Signals | null;
  durationMs: number;
  stdout: string;
  stderr: string;
}

export async function runCommand(command: string, options: RunCommandOptions = {}): Promise<RunCommandResult> {
  const start = Date.now();

  return new Promise<RunCommandResult>((resolve, reject) => {
    const child = spawn(command, {
      cwd: options.cwd,
      env: {
        ...process.env,
        ...options.env,
      },
      shell: true,
    });

    let stdoutBuffer = "";
    let stderrBuffer = "";
    let stdoutAggregate = "";
    let stderrAggregate = "";

    const flushLines = (chunk: Buffer, isStdout: boolean) => {
      const text = chunk.toString();
      const combined = (isStdout ? stdoutBuffer : stderrBuffer) + text;
      const lines = combined.split(/\r?\n/);
      const incomplete = lines.pop();

      for (const line of lines) {
        if (line.length > 0 || text.includes("\n")) {
          options.onLine?.(line);
        }
      }

      if (isStdout) {
        stdoutBuffer = incomplete ?? "";
        stdoutAggregate += text;
      } else {
        stderrBuffer = incomplete ?? "";
        stderrAggregate += text;
      }
    };

    child.stdout?.on("data", (chunk: Buffer) => flushLines(chunk, true));
    child.stderr?.on("data", (chunk: Buffer) => flushLines(chunk, false));

    child.on("error", (error) => {
      reject(error);
    });

    child.on("close", (code, signal) => {
      if (stdoutBuffer) {
        options.onLine?.(stdoutBuffer);
        stdoutAggregate += stdoutBuffer;
      }
      if (stderrBuffer) {
        options.onLine?.(stderrBuffer);
        stderrAggregate += stderrBuffer;
      }

      resolve({
        code,
        signal,
        durationMs: Date.now() - start,
        stdout: stdoutAggregate,
        stderr: stderrAggregate,
      });
    });
  });
}
