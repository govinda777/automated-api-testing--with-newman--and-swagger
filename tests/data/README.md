# Test Data

This directory stores static data used for running automated tests.

## Format

Test data files should be in **JSON** format.

## Naming Convention

- For general test suites: `[testSuiteName].data.json` (e.g., `userAuth.data.json`)
- For specific endpoints: `[endpointName].data.json` (e.g., `createUser.data.json`)

## Structure

Organize data within each file logically, for example, by use case or by valid/invalid scenarios.

Example (`sampleUser.data.json`):
```json
{
  "createUser": {
    "valid": {
      "name": "John Doe",
      "email": "john.doe@example.com",
      "password": "securePassword123"
    },
    "invalid": {
      "name": "Jane Doe",
      "email": "jane.doe.invalid",
      "password": "short"
    }
  },
  "getUser": {
    "byId": "user123"
  }
}
```

## Loading Data in Tests

Use the utility function `loadTestData(fileName)` from `/tests/utils/data-loader.js`.

```javascript
// Example in a Jest test
const { loadTestData } = require('../utils/data-loader'); // Adjust path as needed

const userData = loadTestData('sampleUser.data.json');
const validUserPayload = userData.createUser.valid;
```

## Geração Dinâmica de Massa de Dados

Este projeto inclui um script para gerar dados de teste dinâmicos, o que é particularmente útil para criar uma variedade de cenários de teste sem a necessidade de definir manualmente cada conjunto de dados. A geração é feita utilizando a biblioteca [`@faker-js/faker`](https://github.com/faker-js/faker).

**Como Gerar Dados:**

Para gerar os dados, execute o seguinte comando NPM no terminal:
```bash
npm run generate:data
```
Este comando executa o script localizado em `scripts/generators/example.js`.

**O Que é Gerado:**

Por padrão, o script `scripts/generators/example.js` gera um conjunto de dados de usuários fictícios. Esses dados são salvos como um arquivo JSON em:
`tests/data/generated/dynamic-users.json`

O script pode ser configurado para gerar um número diferente de usuários passando o argumento `--count`. Por exemplo, para gerar 10 usuários:
```bash
npm run generate:data -- --count 10
```

**Utilizando os Dados Gerados em Testes:**

Os dados gerados podem ser facilmente carregados e utilizados em seus testes BDD (Cucumber) ou outros tipos de testes.

*   **Carregamento:** Os arquivos JSON podem ser lidos e parseados usando as funcionalidades padrão do Node.js (`fs.readFileSync` e `JSON.parse`).
*   **Exemplo Prático:** Para um exemplo de como esses dados dinâmicos são carregados e utilizados em um cenário BDD, consulte:
    *   Arquivo Feature: `tests/bdd/features/dynamicDataUsage.feature`
    *   Arquivo de Step Definitions: `tests/bdd/step-definitions/dynamicDataUsage.steps.js`

    Esses arquivos demonstram como ler o `dynamic-users.json` e iterar sobre os usuários para simular ações de teste.

**Adaptando para Suas Necessidades:**

O script `scripts/generators/example.js` serve como um ponto de partida. Você pode (e é encorajado a) adaptá-lo ou criar novos scripts em `scripts/generators/` para gerar diferentes tipos de dados dinâmicos que sejam relevantes para os seus cenários de teste (e.g., produtos, pedidos, etc.).
