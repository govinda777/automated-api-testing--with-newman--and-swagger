const fs = require('fs');
const path = require('path');
const SwaggerParser = require('swagger-parser');
const YAML = require('yaml');

// Parse command-line arguments
const args = process.argv.slice(2);
const fileArg = args.find(arg => arg.startsWith('--file='));

if (!fileArg) {
  console.error('Error: Missing --file argument. Please provide the path to the Swagger/OpenAPI file.');
  process.exit(1);
}

const filePath = fileArg.split('=')[1];

if (!fs.existsSync(filePath)) {
  console.error(`Error: File not found at path: ${filePath}`);
  process.exit(1);
}

// Create /core/swagger directory if it doesn't exist
const swaggerDir = path.join(__dirname);
if (!fs.existsSync(swaggerDir)) {
  fs.mkdirSync(swaggerDir, { recursive: true });
}

// Read and validate Swagger/OpenAPI file
SwaggerParser.validate(filePath, (err, api) => {
  if (err) {
    console.error('Error validating Swagger/OpenAPI file:', err.message);
    process.exit(1);
  }

  console.log('Swagger/OpenAPI file validated successfully.');

  // Determine output file path and format
  const outputFileName = 'swagger.yaml';
  const outputFilePath = path.join(swaggerDir, outputFileName);

  // Convert to YAML and save
  try {
    const yamlString = YAML.stringify(api);
    fs.writeFileSync(outputFilePath, yamlString);
    console.log(`Validated API saved to ${outputFilePath}`);
  } catch (error) {
    console.error('Error saving validated API to YAML:', error.message);
    process.exit(1);
  }
});
