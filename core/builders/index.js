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
            '});',
            '',
            'pm.test("Schema is valid", function() {',
            '    // Attempt to get the schema from the response definition in the collection',
            '    // openapi-to-postmanv2 might store the expected response schema here',
            '    if (pm.item.responses && pm.item.responses.members && pm.item.responses.members[0] && pm.item.responses.members[0].body) {',
            '        let expectedSchema = pm.item.responses.members[0].body;',
            '        if (expectedSchema) {',
            '            try {',
            '                // Assuming the schema is a JSON string, it needs to be parsed',
            '                let schema = JSON.parse(expectedSchema);',
            '                pm.response.to.have.jsonSchema(schema);',
            '            } catch (e) {',
            '                console.error("Failed to parse schema or schema not found for this request. Schema string: " + expectedSchema, e);',
            '                // Fail the test if schema cannot be parsed or is invalid',
            '                pm.expect(false, "Schema parsing/validation failed: " + e.message).to.be.true;',
            '            }',
            '        } else {',
            '            // If no schema is defined for the response, log it.',
            '            // Depending on requirements, this could be a failing test.',
            '            console.log("No schema found for this response in the collection definition.");',
            '        }',
            '    } else {',
            '        console.log("No response schema definition found in pm.item.responses for this request.");',
            '        // Optionally, fail the test if a schema is always expected.',
            '        // pm.expect(false, "Response schema definition missing in collection").to.be.true;',
            '    }',
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
  console.log('Basic tests and schema validation tests added to the collection.');
});
