// @ts-check

const { createMultiProcessPrism, createSingleProcessPrism } = require('@stoplight/prism-cli/dist/operations');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const access = promisify(fs.access);

const SWAGGER_FILE_PATH = 'core/swagger/swagger.yaml';

async function main() {
  // Determinar a porta
  let port = process.env.PORT ? parseInt(process.env.PORT, 10) : 4010;
  const portArgIndex = process.argv.indexOf('--port');
  if (portArgIndex > -1 && process.argv[portArgIndex + 1]) {
    const portArg = parseInt(process.argv[portArgIndex + 1], 10);
    if (!isNaN(portArg)) {
      port = portArg;
    }
  }

  // Verificar se o arquivo Swagger existe
  try {
    await access(SWAGGER_FILE_PATH, fs.constants.F_OK);
  } catch (err) {
    console.error(`Erro: Arquivo Swagger não encontrado em ${SWAGGER_FILE_PATH}`);
    process.exit(1);
  }

  console.log(`Iniciando servidor mock Prism na porta ${port}...`);
  console.log(`Usando o arquivo Swagger: ${SWAGGER_FILE_PATH}`);

  try {
    // Configurar e iniciar o Prism
    // Usando createSingleProcessPrism para um setup mais simples,
    // createMultiProcessPrism pode ser usado para cenários mais complexos.
    await createSingleProcessPrism({
      document: path.resolve(SWAGGER_FILE_PATH),
      config: {
        checkSecurity: true,
        validateRequest: true,
        validateResponse: true,
        mock: { dynamic: true }, // Mock dinâmico
        errors: false, // Não mostrar erros detalhados no console, opcional
      },
      serverOptions: {
        port: port,
        cors: true, // Habilitar CORS, opcional
      },
    });
    console.log(`Servidor mock Prism iniciado com sucesso na porta ${port}.`);
  } catch (error) {
    console.error('Erro ao iniciar o servidor Prism:', error);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Erro inesperado:', error);
  process.exit(1);
});
