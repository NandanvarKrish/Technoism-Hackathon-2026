/**
 * Tech Titans - Python Execution Service
 * Manages communication between Node.js Express backend and Python AI Engine
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const PYTHON_PATH = process.env.PYTHON_PATH || 'python';
const PYTHON_DIR = path.join(__dirname, '..', '..', 'python');

/**
 * Runs a Python script with argument / JSON payload and parses JSON output.
 */
function runPythonScript(scriptName, jsonPayloadOrArg) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(PYTHON_DIR, scriptName);
    
    if (!fs.existsSync(scriptPath)) {
      return resolve({
        success: false,
        error: `Python script not found at ${scriptPath}`,
        fallback: true
      });
    }

    const payloadArg = typeof jsonPayloadOrArg === 'object' 
      ? JSON.stringify(jsonPayloadOrArg) 
      : (jsonPayloadOrArg || '');

    const args = [scriptPath];
    if (payloadArg) {
      args.push(payloadArg);
    }

    let stdoutData = '';
    let stderrData = '';

    const pyProcess = spawn(PYTHON_PATH, args, { cwd: PYTHON_DIR });

    pyProcess.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });

    pyProcess.stderr.on('data', (data) => {
      stderrData += data.toString();
    });

    pyProcess.on('close', (code) => {
      if (code !== 0) {
        console.warn(`[PythonService] Script ${scriptName} exited with code ${code}. Stderr: ${stderrData}`);
      }
      try {
        const parsed = JSON.parse(stdoutData.trim());
        return resolve(parsed);
      } catch (err) {
        // Return raw text or error output
        return resolve({
          success: code === 0,
          raw_output: stdoutData.trim(),
          stderr: stderrData.trim(),
          fallback: true
        });
      }
    });

    pyProcess.on('error', (err) => {
      console.warn(`[PythonService] Failed to start Python process (${PYTHON_PATH}): ${err.message}`);
      return resolve({
        success: false,
        error: `Python executable error (${PYTHON_PATH}): ${err.message}`,
        fallback: true
      });
    });
  });
}

module.exports = {
  runPythonScript
};
