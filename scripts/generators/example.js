const { faker } = require('@faker-js/faker');
const fs = require('fs');
const path = require('path');

/**
 * Cria um objeto de usuário com dados aleatórios gerados pelo Faker.
 * @returns {object} Objeto de usuário com dados fictícios.
 */
function createRandomUser() {
  return {
    userId: faker.string.uuid(),
    username: faker.internet.userName(),
    email: faker.internet.email(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    avatar: faker.image.avatar(),
    password: "GENERATED_PASSWORD",
    birthdate: faker.date.birthdate(),
    registeredAt: faker.date.past({ years: 5 }),
    address: {
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state({ abbreviated: true }),
      zipCode: faker.location.zipCode(),
      country: faker.location.countryCode(),
    },
    phone: faker.phone.number(),
    company: {
      name: faker.company.name(),
      catchPhrase: faker.company.catchPhrase(),
    }
  };
}

// Determina o número de usuários a serem gerados.
// Pode ser configurado via argumentos de linha de comando no futuro.
// Ex: node scripts/generators/example.js --count 10
const args = process.argv.slice(2);
const countArgIndex = args.indexOf('--count');
let numberOfUsers = 5; // Padrão

if (countArgIndex > -1 && args[countArgIndex + 1]) {
  const count = parseInt(args[countArgIndex + 1], 10);
  if (!isNaN(count) && count > 0) {
    numberOfUsers = count;
  } else {
    console.warn(`Valor inválido para --count: ${args[countArgIndex + 1]}. Usando o padrão de ${numberOfUsers} usuários.`);
  }
}

console.log(`Gerando ${numberOfUsers} usuário(s) dinâmico(s)...`);

const users = Array.from({ length: numberOfUsers }, createRandomUser);

// Define o diretório de saída para os dados gerados
const outputDir = path.join(__dirname, '..', '..', 'tests', 'data', 'generated');

// Cria o diretório se ele não existir
if (!fs.existsSync(outputDir)) {
  try {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`Diretório criado: ${outputDir}`);
  } catch (error) {
    console.error(`Erro ao criar diretório ${outputDir}:`, error);
    process.exit(1); // Sai se não puder criar o diretório
  }
}

const outputPath = path.join(outputDir, 'dynamic-users.json');

try {
  fs.writeFileSync(outputPath, JSON.stringify(users, null, 2));
  console.log(`${users.length} usuário(s) dinâmico(s) gerados e salvos com sucesso em: ${outputPath}`);
} catch (error) {
  console.error(`Erro ao salvar arquivo JSON em ${outputPath}:`, error);
  process.exit(1); // Sai se não puder salvar o arquivo
}
