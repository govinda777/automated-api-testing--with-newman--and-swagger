const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');
const { mkdirp } = require('mkdirp'); // Corrected import for mkdirp
const { v4: uuidv4 } = require('uuid'); // For generating UUID

console.log('Starting Newman environment preparation...');

const env = process.env.TEST_ENV || 'development';
const yamlFilePath = path.resolve(__dirname, `../../config/environments/${env}.yaml`);
const outputDir = path.resolve(__dirname, '../../artifacts/environments');
const outputFilePath = path.resolve(outputDir, 'newman_env.json');

try {
  console.log(`Attempting to load YAML configuration from: ${yamlFilePath}`);
  if (!fs.existsSync(yamlFilePath)) {
    console.error(`Error: YAML configuration file not found at ${yamlFilePath}`);
    process.exit(1);
  }

  const yamlFileContent = fs.readFileSync(yamlFilePath, 'utf8');
  const config = yaml.load(yamlFileContent);

  if (!config) {
    console.error(`Error: Failed to parse YAML or file is empty at ${yamlFilePath}`);
    process.exit(1);
  }

  console.log(`Successfully loaded configuration for environment: ${env}`);

  // Ensure the output directory exists
  try {
    mkdirp.sync(outputDir);
    console.log(`Ensured directory exists: ${outputDir}`);
  } catch (dirError) {
    console.error(`Error creating directory ${outputDir}:`, dirError);
    process.exit(1);
  }


  const postmanEnv = {
    id: uuidv4(),
    name: `Generated ${env} Environment`,
    values: [],
    _postman_variable_scope: 'environment',
    _postman_exported_at: new Date().toISOString(),
    _postman_exported_using: 'Newman/Automated Script v1.0' // Static string for simplicity
  };

  for (const key in config) {
    if (Object.hasOwnProperty.call(config, key)) {
      postmanEnv.values.push({
        key: key,
        value: config[key],
        enabled: true,
        type: typeof config[key] === 'string' ? 'default' : 'any' // Postman distinguishes types, 'default' for string
      });
    }
  }

  fs.writeFileSync(outputFilePath, JSON.stringify(postmanEnv, null, 2), 'utf8');
  console.log(`Successfully generated Postman environment file: ${outputFilePath}`);
  console.log('Newman environment preparation completed.');

} catch (error) {
  console.error('Error during Newman environment preparation:', error);
  process.exit(1);
}
