const { Given, When, Then } = require('@cucumber/cucumber');
const fs = require('fs');
const path = require('path');
const assert = require('assert'); // Para asserções

// Caminho para o arquivo de dados gerado
const DATA_FILE_PATH = path.join(__dirname, '..', '..', '..', 'tests', 'data', 'generated', 'dynamic-users.json');

let dynamicUsers = [];

Given('o arquivo de dados de usuários dinâmicos "dynamic-users.json" está disponível', function () {
  // Verificar se o arquivo existe
  assert(fs.existsSync(DATA_FILE_PATH), `Arquivo de dados não encontrado: ${DATA_FILE_PATH}. Execute 'npm run generate:data' primeiro.`);

  // Carregar os dados do arquivo JSON
  try {
    const fileContent = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
    dynamicUsers = JSON.parse(fileContent);
    assert(Array.isArray(dynamicUsers) && dynamicUsers.length > 0, 'O arquivo de dados está vazio ou não é um array JSON válido.');
    console.log(`Carregados ${dynamicUsers.length} usuários do arquivo ${DATA_FILE_PATH}`);
  } catch (error) {
    throw new Error(`Erro ao ler ou parsear o arquivo de dados ${DATA_FILE_PATH}: ${error.message}`);
  }
});

When('eu processo o registro para cada usuário dinâmico contido no arquivo', function () {
  assert(dynamicUsers.length > 0, 'Nenhum usuário dinâmico para processar. Verifique o step "Given".');

  console.log('\nIniciando processamento de registro simulado para usuários dinâmicos:');
  this.processedUsernames = []; // Armazena informações para o step 'Then'

  dynamicUsers.forEach(user => {
    // Simula o envio dos dados do usuário para um endpoint de registro
    console.log(`  [SIMULAÇÃO] Registrando usuário:`);
    console.log(`    ID: ${user.userId}`);
    console.log(`    Username: ${user.username}`);
    console.log(`    Email: ${user.email}`);
    console.log(`    Nome: ${user.firstName} ${user.lastName}`);
    console.log(`    Telefone: ${user.phone}`);
    console.log(`    Empresa: ${user.company ? user.company.name : 'N/A'}`);
    console.log(`    Destino: POST /api/users/register (simulado)`);
    // Aqui, em um teste real, ocorreria uma chamada HTTP usando axios ou similar.
    // ex: axios.post('http://localhost:3000/api/users/register', user);

    this.processedUsernames.push(user.username); // Guarda o username para verificação no 'Then'
  });
});

Then('cada tentativa de registro de usuário dinâmico do arquivo deve ser reportada como processada', function () {
  assert(this.processedUsernames && this.processedUsernames.length > 0, 'Nenhum usuário foi processado no step "When".');
  assert(this.processedUsernames.length === dynamicUsers.length, 'O número de usuários processados não corresponde ao número de usuários carregados.');

  console.log('\nVerificando status de processamento dos registros:');
  this.processedUsernames.forEach(username => {
    // Em um cenário real, aqui verificaríamos o resultado da chamada (e.g., status code, corpo da resposta)
    // Para este exemplo, apenas logamos que foi processado.
    console.log(`  [VERIFICAÇÃO] Registro simulado para o usuário "${username}" foi processado.`);
  });
  console.log(`Total de ${this.processedUsernames.length} registros de usuários dinâmicos processados e verificados.`);
});
