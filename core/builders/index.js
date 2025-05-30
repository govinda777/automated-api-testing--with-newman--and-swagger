const { convert } = require('openapi-to-postmanv2');
const fs = require('fs');
const path = require('path');
const yaml = require('yaml'); // Already a dependency

const swaggerFilePath = path.join(__dirname, '..', 'swagger', 'swagger.yaml');
const outputCollectionPath = path.join(__dirname, '..', '..', 'artifacts', 'collections', 'generated-collection.json');
const artifactsDir = path.dirname(outputCollectionPath);
const collectionsDir = path.join(artifactsDir, 'collections');

if (!fs.existsSync(swaggerFilePath)) {
  console.error('Error: Swagger file not found at ' + swaggerFilePath);
  process.exit(1);
}

const swaggerString = fs.readFileSync(swaggerFilePath, { encoding: 'UTF8' });
const swaggerData = yaml.parse(swaggerString); // Assuming swagger.yaml

convert({ type: 'json', data: swaggerData }, {}, (err, conversionResult) => {
  if (err) {
    console.error('Error during conversion:', err);
    process.exit(1); 
  }
  if (!conversionResult.result) {
    console.error('Conversion failed:', conversionResult.reason);
    process.exit(1); 
  }

  const collection = conversionResult.output[0].data;

  // Add basic tests to each request
  if (collection.item) {
    collection.item.forEach(processItem); 
  }

  function processItem(item) {
    if (item.item) { 
      item.item.forEach(processItem);
    } else if (item.request) { 
      if (!item.event) item.event = [];
      item.event.push({
        listen: 'test',
        script: {
          exec: [
            'pm.test("Status code is 2xx", function () {',
            '    pm.response.to.be.success;',
            '});'
          ],
          type: 'text/javascript'
        }
      });
    }
  }

  // Ensure artifacts/collections directory exists
  if (!fs.existsSync(collectionsDir)) { 
    fs.mkdirSync(collectionsDir, { recursive: true });
  }

  fs.writeFileSync(outputCollectionPath, JSON.stringify(collection, null, 2));
  console.log('Postman collection generated successfully at ' + outputCollectionPath);
  console.log('Basic tests added to the collection.');
});
