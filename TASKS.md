# TASKS

Tarefas necessárias para executar e concluir o projeto, seguindo o fluxo que você descreveu. Vou detalhar cada etapa em tarefas práticas, sugerindo subtarefas e entregáveis claros para facilitar o acompanhamento.

---
## 0. A partir de um swagger criar um servidor de mok

- [x] **Gerar servidor de mock a partir do Swagger**
  - [x] Pesquisar e escolher uma ferramenta/biblioteca de mock compatível (ex: [Prism](https://github.com/stoplightio/prism), [swagger-mock-api](https://www.npmjs.com/package/swagger-mock-api), [swagger-mock-express](https://www.npmjs.com/package/swagger-mock-express)) - *Prism CLI escolhido e implementado.*
  - [x] Criar script (ex: `scripts/mock-server.js`) que utilize o arquivo Swagger localizado em `/core/swagger/swagger.yaml`
  - [x] Adicionar comando no `package.json` (ex: `npm run mock-server`)
  - [x] Permitir configuração de porta e baseUrl via argumentos ou variáveis de ambiente - *Porta configurável implementada.*
  - [x] Documentar no README como subir o mock server
  - [ ] (Opcional) Permitir hot-reload do mock ao alterar o arquivo Swagger - *Investigado: Prism CLI v5.14.2 não suporta nativamente; requer restart manual.*

## 1. Importar o arquivo Swagger

- [x] **Criar comando de importação**
  - [x] Definir um comando no `package.json` (ex: `npm run import-swagger`)
  - [x] Permitir que o comando aceite um caminho local para o arquivo Swagger/OpenAPI
  - [x] Validar o arquivo importado (estrutura, versão, etc.)
  - [x] Salvar o arquivo em um diretório padrão do projeto (`/core/swagger/swagger.yaml`)

---

## 2. Gerar a Collection a partir do Swagger

- [x] **Implementar conversor Swagger → Postman Collection**
  - [x] Utilizar biblioteca existente ou criar script para conversão (`openapi-to-postmanv2`)
  - [x] Garantir que todos os endpoints e métodos HTTP sejam mapeados
  - [x] Salvar a collection gerada em `/artifacts/collections/generated-collection.json`
  - [x] Adicionar testes básicos automáticos (ex: status code, schema)

---

## 3. Estrutura de Massa de Dados para Testes

- [x] Definir diretório `/tests/data/` para massa de dados
- [x] Padronizar formato (JSON/YAML) e nomenclatura dos arquivos - *JSON usado para dados dinâmicos gerados, YAML para config de ambiente.*
- [x] Implementar utilitário para carregar dados nos testes - *Exemplos nos steps BDD e potencial para utils.*
- [x] (Opcional) Scripts para geração dinâmica de massa de dados (`npm run generate:data` implementado)
- [x] Documentar exemplos e boas práticas de uso da massa de dados (`tests/data/README.md` e referências no `README.md` principal)

---

## 4. Executar Testes de Unidade Automaticamente

- [x] **Configurar runner de testes**
  - [x] Integrar Newman para execução das collections
  - [x] Criar comando no `package.json` (ex: `npm run test:unit`)
  - [x] Garantir que cada endpoint seja testado individualmente (via estrutura da collection)
  - [x] Salvar logs/resultados em `/artifacts/logs/`

---

## 5. Implementar Testes Complexos (BDD/Steps)

- [x] **Estruturar testes BDD**
  - [x] Definir pasta `/tests/bdd/` para features e steps
  - [ ] Permitir que collections sirvam de base para cenários BDD - *Nota: A estratégia atual foca em chamadas diretas à API nos steps BDD, não em reutilizar collections Postman diretamente, para maior clareza e controle. Considerado não essencial para a abordagem atual.*
  - [x] Integrar framework BDD (ex: Cucumber.js)
  - [x] Criar exemplos de cenários multi-step (ex: login, fluxo de compra) - *Exemplos básicos fornecidos.*
  - [x] Comando para rodar testes BDD (ex: `npm run test:bdd`)

---

## 6. Exibir Relatórios

- [x] **Gerar e exibir relatórios de testes**
  - [x] Integrar reporter HTML e XML no Newman
  - [x] Salvar relatórios em `/artifacts/reports/`
  - [x] (Opcional) Criar script para abrir relatório HTML automaticamente (`npm run report:open`)
  - [x] (Opcional) Agregar resultados de diferentes tipos de teste em um dashboard simples (`npm run report:dashboard` implementado)

---

## Tarefas Gerais/Extras

- [x] **Documentação**
  - [x] Atualizar README com instruções de uso dos comandos
  - [x] Documentar estrutura de pastas e fluxo de trabalho
- [x] **Configuração de ambientes**
  - [x] Permitir configuração de variáveis de ambiente para diferentes ambientes (dev, staging, prod) - *Implementado via arquivos YAML em `config/environments/` e variável `TEST_ENV` para selecionar o ambiente ativo para testes Cucumber e Newman.*
- [x] **CI/CD**
  - [x] Adicionar pipeline básico para rodar testes automaticamente em push/pull request - *Exemplo de workflow GitHub Actions (`.github/workflows/static.yml`) existe.*

---

## Exemplo de Sequência de Comandos

1. `npm run import-swagger -- --file=swagger.yaml`
2. `npm run generate-collection`
3. `npm run test:unit`
4. `npm run test:bdd`
5. `npm run report:open`
