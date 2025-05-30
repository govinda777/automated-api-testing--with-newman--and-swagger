# Automated API Testing with Newman & Swagger

![CI/CD](./img/1.1.png)

Este projeto oferece um framework robusto para automatizar testes de API, convertendo especificações Swagger/OpenAPI em coleções Postman/Newman executáveis, complementadas por testes BDD (Behavior-Driven Development) utilizando Cucumber.js.

## Índice

- [Visão Geral](#visão-geral)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Pré-requisitos](#pré-requisitos)
- [Configuração Inicial](#configuração-inicial)
- [Fluxo de Trabalho Típico](#fluxo-de-trabalho-típico)
- [Comandos Disponíveis (NPM Scripts)](#comandos-disponíveis-npm-scripts)
- [Estratégia de Testes](#estratégia-de-testes)
- [Geração de Relatórios](#geração-de-relatórios)
- [Configuração de Ambiente](#configuração-de-ambiente)
- [Integração CI/CD](#integração-cicd)
- [Benefícios](#benefícios)

---

## Visão Geral

O objetivo principal é simplificar e acelerar o processo de testes de API através da automação:
1.  **Importação de Especificação:** Ingestão de arquivos Swagger/OpenAPI.
2.  **Geração de Coleção:** Conversão da especificação em uma coleção Postman, incluindo testes básicos para cada endpoint.
3.  **Execução de Testes Unitários de API:** Validação de cada endpoint individualmente usando Newman.
4.  **Execução de Testes BDD:** Validação de fluxos de usuário e cenários de negócio complexos com Cucumber.js.
5.  **Relatórios Detalhados:** Geração de múltiplos formatos de relatório (HTML, JUnit XML) para análise dos resultados.

---

## Estrutura de Pastas

A estrutura do projeto é organizada da seguinte forma:

-   **/artifacts**: Contém arquivos gerados durante o processo de teste.
    -   **/collections**: Armazena as coleções Postman geradas (e.g., `generated-collection.json`).
    -   **/logs**: Guarda logs de execução de testes (e.g., `unit-tests.log`).
    -   **/reports**: Contém os relatórios de teste (e.g., `html-report.html`, `junit-report.xml`).
-   **/config**: Arquivos de configuração para diferentes ambientes.
    -   **/environments**: Contém arquivos YAML para configuração de variáveis de ambiente (e.g., `example.yaml`).
-   **/core**: Lógica central da aplicação.
    -   **/builders**: Scripts para construir/gerar artefatos (e.g., conversor de OpenAPI para Postman).
    -   **/monitoring**: (Se aplicável) Módulos para monitoramento.
    -   **/swagger**: Scripts para manipulação de arquivos Swagger/OpenAPI.
-   **/scripts**: Scripts utilitários e de setup.
    -   **/generators**: Scripts para geração de dados de teste dinâmicos (e.g., `example.js`).
    -   **/setup**: Scripts para configuração inicial do projeto.
-   **/tests**: Contém todos os arquivos relacionados a testes.
    -   **/bdd**: Testes de Behavior-Driven Development.
        -   **/features**: Arquivos Gherkin (`.feature`).
        -   **/step-definitions**: Implementações dos passos Gherkin em JavaScript.
        -   **/support**: Arquivos de suporte para Cucumber (e.g., hooks, world context).
    -   **/data**: Dados de teste estáticos em formato JSON (e.g., `sampleUser.data.json`).
    -   **/unit**: (Pode ser usado para testes unitários de código JavaScript, se necessário, usando Jest).
    -   **/utils**: Utilitários para os testes (e.g., `data-loader.js`).
-   **/img**: Imagens usadas na documentação.

---

## Pré-requisitos

-   Node.js (versão especificada em `package.json`, e.g., >=16.0.0)
-   npm (geralmente vem com Node.js)

---

## Configuração Inicial

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/govinda777/automated-api-testing--with-newman--and-swagger.git
    cd automated-api-testing--with-newman--and-swagger
    ```
2.  **Instale as dependências:**
    ```bash
    npm install
    ```

---

## Fluxo de Trabalho Típico

1.  **Importar a Especificação da API:**
    Use o comando `npm run import-swagger` para validar sua especificação OpenAPI/Swagger e copiá-la para `/core/swagger/swagger.yaml`.
    ```bash
    npm run import-swagger -- --file=./caminho/para/seu/swagger.yaml
    ```
2.  **Gerar a Coleção Postman:**
    Converta a especificação importada em uma coleção Postman (`/artifacts/collections/generated-collection.json`) com testes básicos.
    ```bash
    npm run generate-collection
    ```
3.  **Executar Testes Unitários de API:**
    Rode os testes da coleção gerada usando Newman.
    ```bash
    npm run test:unit
    ```
    *Nota:* Este comando utiliza um `baseUrl` padrão (`http://localhost:3000`). Se sua API estiver rodando em um local diferente, você precisará ajustar o `baseUrl` na coleção gerada ou usar variáveis de ambiente (veja [Configuração de Ambiente](#configuração-de-ambiente)).
4.  **Executar Testes BDD:**
    Execute os cenários de BDD definidos com Cucumber.js.
    ```bash
    npm run test:bdd
    ```
    *Nota:* Os testes BDD podem interagir com uma API real. Certifique-se que a API alvo esteja configurada e acessível. A configuração de `BASE_URL` para os testes BDD pode ser gerenciada via variáveis de ambiente ou diretamente nos step definitions.
5.  **Gerar e Visualizar Relatórios:**
    Gere relatórios consolidados dos testes de API.
    ```bash
    npm run report
    ```
    Para abrir o relatório HTML no seu navegador (se o comando `open` ou `xdg-open` estiver disponível):
    ```bash
    npm run report:open
    ```
    Ou abra manualmente o arquivo `/artifacts/reports/html-report.html`.

---

## Comandos Disponíveis (NPM Scripts)

-   `npm run import-swagger -- --file=<filePath>`: Valida um arquivo Swagger/OpenAPI e o copia para `/core/swagger/swagger.yaml`.
    -   Exemplo: `npm run import-swagger -- --file=./docs/swagger.yaml`
-   `npm run generate-collection`: Gera uma coleção Postman a partir do `/core/swagger/swagger.yaml` e a salva em `/artifacts/collections/generated-collection.json`, adicionando testes básicos para cada request.
-   `npm run test`: Executa testes Jest (se houver) e testes Cucumber.js (BDD). (Comportamento padrão original, pode ser ajustado).
-   `npm run test:unit`: Executa a coleção Postman gerada (`generated-collection.json`) com Newman, gerando um relatório JSON e um log de console em `/artifacts/logs/`. Utiliza `http://localhost:3000` como `baseUrl` por padrão.
-   `npm run test:bdd`: Executa os testes BDD usando Cucumber.js localizados em `/tests/bdd/features/`.
-   `npm run report`: Gera relatórios de teste consolidados (JUnit XML e HTMLEXTRA HTML) em `/artifacts/reports/` a partir da execução da coleção `generated-collection.json`.
-   `npm run report:open`: Tenta abrir o relatório HTML (`html-report.html`) no navegador padrão.
-   `npm run doc`: Gera documentação JSDoc (se configurado).

---

## Estratégia de Testes

O projeto emprega uma estratégia de testes em múltiplas camadas:

-   **Testes Unitários de API (Newman):** A coleção Postman gerada automaticamente (`generated-collection.json`) inclui testes básicos para cada endpoint (e.g., verificação de status code `2xx`). Estes são executados com `npm run test:unit`.
    -   **Executando Endpoints/Pastas Individuais:** Atualmente, `npm run test:unit` executa a coleção inteira. Melhorias futuras podem incluir:
        -   Uso da opção `--folder <folderName>` do Newman para rodar pastas específicas dentro da coleção.
        -   Execução programática do Newman via sua biblioteca Node.js para controle mais granular.
-   **Testes de Comportamento (BDD - Cucumber.js):** Cenários de usuário e fluxos de negócio são definidos em Gherkin (`.feature`) e implementados em JavaScript. Executados com `npm run test:bdd`. Estes testes focam na perspectiva do usuário e podem cobrir interações mais complexas.
-   **Testes de Contrato (Schema Validation):** Embora não explicitamente implementado como um script separado, a validação de schema pode ser adicionada aos testes Newman ou BDD para garantir que as respostas da API sigam o contrato definido na especificação OpenAPI.
-   **Análise Estática:** Ferramentas como ESLint (se configuradas) ajudam a manter a qualidade e consistência do código.

---

## Geração de Relatórios

-   **HTML (HTMLEXTRA)**: Um relatório HTML interativo e detalhado é gerado em `/artifacts/reports/html-report.html`. Este relatório oferece uma visão amigável dos resultados dos testes, incluindo detalhes de requisições, respostas e asserções.
    -   Para visualizar o relatório, abra o arquivo `artifacts/reports/html-report.html` em seu navegador.
    -   Um script auxiliar opcional `npm run report:open` tenta abrir o relatório automaticamente.
-   **JUnit XML**: Um relatório em formato XML compatível com JUnit é gerado em `/artifacts/reports/junit-report.xml`. Este formato é comumente usado para integração com sistemas de Integração Contínua (CI/CD) como Jenkins, GitLab CI, etc.
-   **CLI**: Saída de console (Command Line Interface) é exibida durante a execução dos testes Newman, fornecendo feedback imediato.
-   **Logs de Testes Unitários**: Logs detalhados da execução de `npm run test:unit` são salvos em `/artifacts/logs/unit-tests.log`, e um relatório JSON cru também é gerado em `/artifacts/logs/unit-tests-report.json`.

Os relatórios Newman são gerados executando o comando `npm run report`.

---

## Configuração de Ambiente

O diretório `/config/environments/` é destinado a armazenar configurações específicas de ambiente (e.g., `baseUrl`, chaves de API, credenciais de teste) em arquivos YAML.

-   **`example.yaml`**: Serve como um modelo. Copie e renomeie este arquivo para seus ambientes específicos (e.g., `development.yaml`, `staging.yaml`, `production.yaml`).
    ```yaml
    # example.yaml
    baseUrl: "http://localhost:3000/api/v1"
    apiKey: "your_api_key_here"
    timeout: 5000
    # Adicione outras variáveis conforme necessário
    ```

-   **Uso em Testes:**
    -   Atualmente, a integração direta destes arquivos YAML nos scripts de teste (Newman, Cucumber) não é automatizada de forma genérica.
    -   Para Newman, a `baseUrl` e outras variáveis são passadas diretamente no comando (e.g., `npm run test:unit` usa `--env-var "baseUrl=http://localhost:3000"`). Uma abordagem mais robusta seria gerar ou usar [Ambientes Postman](https://learning.postman.com/docs/sending-requests/variables/#managing-environments) que podem ser populados a partir destes arquivos YAML através de scripts customizados.
    -   Para Cucumber.js (testes BDD), você pode carregar estas configurações usando um parser YAML (como o pacote `yaml` já incluído) e `dotenv` no início dos seus testes (e.g., em `support/hooks.js` ou um arquivo de setup específico) e disponibilizá-las globalmente ou através do World context do Cucumber.
        ```javascript
        // Exemplo em support/hooks.js ou similar
        // const fs = require('fs');
        // const yaml = require('yaml');
        // const path = require('path');
        //
        // BeforeAll(function() {
        //   const env = process.env.TEST_ENV || 'development'; // Default to development
        //   const configPath = path.resolve(__dirname, `../../../config/environments/${env}.yaml`);
        //   try {
        //     const fileContents = fs.readFileSync(configPath, 'utf8');
        //     const config = yaml.parse(fileContents);
        //     process.env.BASE_URL = config.baseUrl; // Make it available as env var
        //     // this.config = config; // Make it available in Cucumber world
        //     console.log(`Loaded configuration for environment: ${env}`);
        //   } catch (error) {
        //     console.error(`Failed to load configuration for environment: ${env}`, error);
        //     // Decide se deve prosseguir ou falhar os testes
        //   }
        // });
        ```
    -   É crucial **não commitar arquivos de ambiente com dados sensíveis** (como chaves de API de produção) no repositório. Use `.gitignore` para excluir arquivos como `production.yaml` e gerencie-os de forma segura (e.g., através de secrets em CI/CD).

---

## Integração CI/CD

Este projeto é projetado para ser facilmente integrado em pipelines CI/CD (e.g., GitHub Actions, Jenkins, GitLab CI).

**Passos Básicos do Pipeline:**

1.  **Checkout do Código:** Obtenha a versão mais recente do repositório.
2.  **Instalação de Dependências:** Execute `npm install`.
3.  **Importar Swagger (se aplicável):** Se seu arquivo Swagger é um artefato de um passo anterior do build ou precisa ser buscado, execute `npm run import-swagger -- --file=./caminho/para/seu/swagger.yaml`.
4.  **Gerar Coleção:** Execute `npm run generate-collection`.
5.  **Executar Testes:**
    *   Testes Unitários de API: `npm run test:unit`
    *   Testes BDD: `npm run test:bdd` (garanta que seu ambiente de teste e serviços estejam disponíveis)
6.  **Publicar Relatórios:** Os relatórios são gerados em `/artifacts/reports/`. Eles podem ser arquivados ou publicados pelo seu sistema de CI/CD. Relatórios JUnit XML (`junit-report.xml`) são particularmente úteis para integração com plataformas de CI para exibir os resultados dos testes.

Melhorias futuras podem incluir gerenciamento de ambiente mais sofisticado dentro do pipeline CI/CD e implantação automatizada baseada nos resultados dos testes.
O arquivo existente `.github/workflows/static.yml` fornece um exemplo de um workflow do GitHub Actions, que pode ser expandido para automação completa de testes.

---

## Benefícios

-   Automação abrangente de testes de API, desde a especificação até a execução.
-   Geração automática de coleções Postman a partir de especificações OpenAPI.
-   Suporte para testes unitários de API (Newman) e testes de comportamento (BDD com Cucumber).
-   Relatórios detalhados em múltiplos formatos (HTML, JUnit).
-   Estrutura organizada para fácil manutenção e escalabilidade.
-   Facilidade de integração com pipelines CI/CD.

---

© 2025 Govinda Systems
