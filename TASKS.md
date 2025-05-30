# TASKS

Tarefas necessárias para executar e concluir o projeto, seguindo o fluxo que você descreveu. Vou detalhar cada etapa em tarefas práticas, sugerindo subtarefas e entregáveis claros para facilitar o acompanhamento.

---
## 0. A partir de um swagger criar um servidor de mok

- [ ] **Gerar servidor de mock a partir do Swagger**
  - [ ] Pesquisar e escolher uma ferramenta/biblioteca de mock compatível (ex: [Prism](https://github.com/stoplightio/prism), [swagger-mock-api](https://www.npmjs.com/package/swagger-mock-api), [swagger-mock-express](https://www.npmjs.com/package/swagger-mock-express))
  - [ ] Criar script (ex: `scripts/mock-server.js`) que utilize o arquivo Swagger localizado em `/core/swagger/swagger.yaml`
  - [ ] Adicionar comando no `package.json` (ex: `npm run mock-server`)
  - [ ] Permitir configuração de porta e baseUrl via argumentos ou variáveis de ambiente
  - [ ] Documentar no README como subir o mock server
  - [ ] (Opcional) Permitir hot-reload do mock ao alterar o arquivo Swagger

## 1. Importar o arquivo Swagger

- [ ] **Criar comando de importação**
  - [ ] Definir um comando no `package.json` (ex: `npm run import-swagger`)
  - [ ] Permitir que o comando aceite um caminho local para o arquivo Swagger/OpenAPI
  - [ ] Validar o arquivo importado (estrutura, versão, etc.)
  - [ ] Salvar o arquivo em um diretório padrão do projeto (`/core/swagger/` ou `/artifacts/`)

---

## 2. Gerar a Collection a partir do Swagger

- [ ] **Implementar conversor Swagger → Postman Collection**
  - [ ] Utilizar biblioteca existente ou criar script para conversão
  - [ ] Garantir que todos os endpoints e métodos HTTP sejam mapeados
  - [ ] Salvar a collection gerada em `/artifacts/collections/`
  - [ ] Adicionar testes básicos automáticos (ex: status code, schema)

---

## 3. Estrutura de Massa de Dados para Testes

- [ ] Definir diretório `/tests/data/` para massa de dados
- [ ] Padronizar formato (JSON/YAML) e nomenclatura dos arquivos
- [ ] Implementar utilitário para carregar dados nos testes
- [ ] (Opcional) Scripts para geração dinâmica de massa de dados
- [ ] Documentar exemplos e boas práticas de uso da massa de dados

---

## 4. Executar Testes de Unidade Automaticamente

- [ ] **Configurar runner de testes**
  - [ ] Integrar Newman para execução das collections
  - [ ] Criar comando no `package.json` (ex: `npm run test:unit`)
  - [ ] Garantir que cada endpoint seja testado individualmente
  - [ ] Salvar logs/resultados em `/artifacts/logs/`

---

## 5. Implementar Testes Complexos (BDD/Steps)

- [ ] **Estruturar testes BDD**
  - [ ] Definir pasta `/tests/bdd/` para features e steps
  - [ ] Permitir que collections sirvam de base para cenários BDD
  - [ ] Integrar framework BDD (ex: Cucumber.js)
  - [ ] Criar exemplos de cenários multi-step (ex: login, fluxo de compra)
  - [ ] Comando para rodar testes BDD (ex: `npm run test:bdd`)

---

## 6. Exibir Relatórios

- [ ] **Gerar e exibir relatórios de testes**
  - [ ] Integrar reporter HTML e XML no Newman
  - [ ] Salvar relatórios em `/artifacts/reports/`
  - [ ] (Opcional) Criar script para abrir relatório HTML automaticamente
  - [ ] (Opcional) Agregar resultados de diferentes tipos de teste em um dashboard simples

---

## Tarefas Gerais/Extras

- [ ] **Documentação**
  - [ ] Atualizar README com instruções de uso dos comandos
  - [ ] Documentar estrutura de pastas e fluxo de trabalho
- [ ] **Configuração de ambientes**
  - [ ] Permitir configuração de variáveis de ambiente para diferentes ambientes (dev, staging, prod)
- [ ] **CI/CD**
  - [ ] Adicionar pipeline básico para rodar testes automaticamente em push/pull request

---

## Exemplo de Sequência de Comandos

1. `npm run import-swagger -- --file=swagger.yaml`
2. `npm run generate-collection`
3. `npm run test:unit`
4. `npm run test:bdd`
5. `npm run report:open`

