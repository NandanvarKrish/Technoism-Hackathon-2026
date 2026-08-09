// Python Service - IPC Bridge Child Process Spawner
const { spawn } = require('child_process');
const path = require('path');

exports.runPythonScript = (scriptName, inputData = {}) => {
  return new Promise((resolve, reject) => {
    const pythonScriptPath = path.join(__dirname, '../../python', scriptName);
    
    // Attempt python3 or python command
    const pythonProcess = spawn('python', [pythonScriptPath]);
    
    let stdoutData = '';
    let stderrData = '';

    pythonProcess.stdin.write(JSON.stringify(inputData));
    pythonProcess.stdin.end();

    pythonProcess.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      stderrData += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`Python process exited with code ${code}: ${stderrData}`));
      }
      try {
        const parsed = JSON.parse(stdoutData);
        resolve(parsed);
      } catch (e) {
        resolve({ rawOutput: stdoutData });
      }
    });

    pythonProcess.on('error', (err) => {
      reject(err);
    });
  });
};
