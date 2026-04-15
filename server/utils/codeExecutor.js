import { exec, spawn } from "child_process";
import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMP_DIR = path.join(__dirname, "..", "temp_code");
const MINGW_PATH = "C:\\mingw64\\bin";

// Ensure temp directory exists
const ensureTempDir = async () => {
    try {
        await fs.access(TEMP_DIR);
    } catch {
        await fs.mkdir(TEMP_DIR, { recursive: true });
    }
};

/**
 * Execute code in a specified language.
 * @param {string} language - Language ID (python, javascript, c, cpp, java)
 * @param {string} code - The source code
 * @param {string} input - Standard input for the program
 * @returns {Promise<{output: string, error?: string}>}
 */
export const executeCode = async (language, code, input = "") => {
    await ensureTempDir();
    const sessionId = uuidv4();
    let fileName = "";
    let compileCmd = "";
    let runCmd = "";
    let workDir = TEMP_DIR;

    const isWindows = process.platform === "win32";

    switch (language) {
        case "python":
            fileName = `${sessionId}.py`;
            // Check for python vs py command in Windows
            const hasPython = await new Promise(r => exec("where python", (err) => r(!err)));
            runCmd = hasPython ? `python ${fileName}` : `py ${fileName}`;
            break;
        case "javascript":
            fileName = `${sessionId}.js`;
            runCmd = `node ${fileName}`;
            break;
        case "c":
            fileName = `${sessionId}.c`;
            compileCmd = `gcc ${fileName} -o ${sessionId}.exe`;
            runCmd = isWindows ? `.\\${sessionId}.exe` : `./${sessionId}`;
            break;
        case "cpp":
            fileName = `${sessionId}.cpp`;
            compileCmd = `g++ ${fileName} -o ${sessionId}.exe`;
            runCmd = isWindows ? `.\\${sessionId}.exe` : `./${sessionId}`;
            break;
        case "java":
            fileName = `Main_${sessionId.replace(/-/g, '_')}.java`;
            const className = fileName.replace(".java", "");
            code = code.replace(/public\s+class\s+\w+/g, `public class ${className}`);
            compileCmd = `javac ${fileName}`;
            runCmd = `java ${className}`;
            break;
        case "rust":
            fileName = `${sessionId}.rs`;
            compileCmd = `rustc ${fileName} -o ${sessionId}.exe`;
            runCmd = `${sessionId}.exe`;
            break;
        case "bash":
            fileName = `${sessionId}.sh`;
            runCmd = `bash ${fileName}`;
            break;
        default:
            throw new Error(`Unsupported language: ${language}`);
    }

    const filePath = path.join(TEMP_DIR, fileName);
    await fs.writeFile(filePath, code);

    return new Promise((resolve) => {
        const timeout = 5000; // 5 seconds limit

        const cleanup = async () => {
            try {
                const files = await fs.readdir(TEMP_DIR);
                for (const file of files) {
                    if (file.includes(sessionId) || (language === "java" && file.includes(sessionId.replace(/-/g, '_')))) {
                        await fs.unlink(path.join(TEMP_DIR, file)).catch(() => {});
                    }
                }
            } catch (err) {
                console.error("Cleanup error:", err);
            }
        };

        const runExecution = () => {
            const env = { ...process.env, PATH: `${process.env.PATH};${MINGW_PATH}` };
            const proc = exec(runCmd, { cwd: TEMP_DIR, timeout, env }, async (error, stdout, stderr) => {
                await cleanup();
                if (error && error.killed) {
                    resolve({ output: "", error: "Execution Timed Out (5s limit)" });
                } else {
                    resolve({ 
                        output: stdout, 
                        error: stderr || (error ? error.message : undefined) 
                    });
                }
            });

            if (input && proc.stdin) {
                proc.stdin.write(input);
                proc.stdin.end();
            }
        };

        if (compileCmd) {
            const env = { ...process.env, PATH: `${process.env.PATH};${MINGW_PATH}` };
            exec(compileCmd, { cwd: TEMP_DIR, env }, async (error, stdout, stderr) => {
                if (error) {
                    await cleanup();
                    resolve({ output: stdout, error: `Compilation Error: ${stderr || error.message}` });
                } else {
                    runExecution();
                }
            });
        } else {
            runExecution();
        }
    });
};
