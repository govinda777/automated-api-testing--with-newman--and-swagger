// @ts-check
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const SWAGGER_FILE_PATH = 'core/swagger/swagger.yaml';
const PORT = process.env.PORT || 4010;

console.log(`Verifying Swagger file at: ${path.resolve(SWAGGER_FILE_PATH)}`);

if (!fs.existsSync(SWAGGER_FILE_PATH)) {
  console.error(`Error: Swagger file not found at ${path.resolve(SWAGGER_FILE_PATH)}`);
  process.exit(1);
}

const prismCommand = `npx @stoplight/prism-cli@5.14.2 mock "${path.resolve(SWAGGER_FILE_PATH)}" -p ${PORT} --host 0.0.0.0`;

console.log(`Iniciando servidor mock Prism com o comando:`);
console.log(prismCommand);

const prismProcess = exec(prismCommand);

prismProcess.stdout.on('data', (data) => {
  console.log(data.toString());
});

prismProcess.stderr.on('data', (data) => {
  console.error(data.toString());
});

prismProcess.on('close', (code) => {
  console.log(`Prism mock server exited with code ${code}`);
});

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\nGracefully shutting down Prism mock server...');
  if (prismProcess) {
    prismProcess.kill('SIGINT');
  }
  process.exit();
});
