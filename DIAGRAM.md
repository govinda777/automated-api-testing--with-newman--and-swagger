```mermaid
classDiagram
    class SwaggerParser {
        +validate(filePath)
    }

    class Builder {
        +convertSwaggerToPostman(swaggerFile)
        +addBasicTests(collection)
    }

    class Runner {
        +runTests(collection)
    }

    class Polling {
        +startPolling()
    }

    class Monitoring {
        +monitorQueues()
    }

    class ReportingAdapter {
        +generateReport(results)
    }

    class PostmanAdapter {
        +runCollection(collection)
    }

    class CICDAdapter {
        +integrateWithPipeline()
    }

    SwaggerParser <|-- Builder
    Builder --> PostmanAdapter
    Builder --> ReportingAdapter
    Runner --> PostmanAdapter
    Runner --> ReportingAdapter
    Runner --> Monitoring
    Runner --> Polling
    CICDAdapter --> Runner

## Macro-Level System Architecture

```mermaid
graph LR
    subgraph User Interaction
        direction LR
        User[Developer/User]
    end

    subgraph Inputs
        direction TB
        SwaggerSpec[Swagger/OpenAPI Spec]
        ConfigYAML[Environment Config (YAML)]
    end

    subgraph Core Processing & Generation
        direction TB
        NPMScripts[NPM Scripts]
        SwaggerImporter[core/swagger/index.js
(npm run import-swagger)]
        CollectionBuilder[core/builders/index.js
(npm run generate-collection)]
        EnvPreparer[scripts/setup/prepare-newman-env.js]
    end

    subgraph Test Execution
        direction TB
        Newman[Newman
(npm run test:unit, report)]
        Cucumber[Cucumber.js
(npm run test:bdd)]
        MockServer[Mock Server (Prism)
(npm run mock-server)]
    end

    subgraph Generated Artifacts
        direction TB
        PostmanCollection[Generated Postman Collection
(artifacts/collections/)]
        NewmanEnvJSON[newman_env.json
(artifacts/environments/)]
        HTMLReports[HTML Reports
(dashboard.html, html-report.html)]
        JUnitReport[JUnit Report
(artifacts/reports/)]
        Logs[Test Logs
(artifacts/logs/)]
    end

    subgraph Deployment & CI/CD
        direction TB
        CICD[CI/CD Pipeline
(GitHub Actions)]
        Docs[Documentation Files
(doc/)]
        GHPages[GitHub Pages]
    end

    User --> NPMScripts

    SwaggerSpec --> SwaggerImporter
    SwaggerImporter --> CollectionBuilder
    ConfigYAML --> EnvPreparer
    EnvPreparer --> NewmanEnvJSON

    NPMScripts --> SwaggerImporter
    NPMScripts --> CollectionBuilder
    NPMScripts --> EnvPreparer
    NPMScripts --> Newman
    NPMScripts --> Cucumber
    NPMScripts --> MockServer

    CollectionBuilder --> PostmanCollection
    PostmanCollection --> Newman
    NewmanEnvJSON --> Newman

    SwaggerSpec --> MockServer

    Newman --> HTMLReports
    Newman --> JUnitReport
    Newman --> Logs
    Cucumber --> Logs
    Logs --> HTMLReports


    CICD --> NPMScripts
    Docs --> CICD
    HTMLReports --> CICD
    JUnitReport --> CICD

    CICD --> GHPages

    classDef default fill:#f9f9f9,stroke:#333,stroke-width:2px;
    classDef user_interaction fill:#lightblue,stroke:#333,stroke-width:2px;
    classDef inputs fill:#lightgreen,stroke:#333,stroke-width:2px;
    classDef core_processing fill:#lightyellow,stroke:#333,stroke-width:2px;
    classDef test_execution fill:#orange,stroke:#333,stroke-width:2px;
    classDef artifacts_gen fill:#lightgrey,stroke:#333,stroke-width:2px;
    classDef deployment fill:#pink,stroke:#333,stroke-width:2px;

    class User UserInteraction;
    class SwaggerSpec,ConfigYAML Inputs;
    class NPMScripts,SwaggerImporter,CollectionBuilder,EnvPreparer CoreProcessing;
    class Newman,Cucumber,MockServer TestExecution;
    class PostmanCollection,NewmanEnvJSON,HTMLReports,JUnitReport,Logs GeneratedArtifacts;
    class CICD,Docs,GHPages Deployment;
```

## CI/CD Pipeline Flow

```mermaid
graph TD
    A[Push to main branch / Manual Dispatch] --> B{Job: deploy};
    B --> C[Checkout Code
(actions/checkout@v4)];
    C --> D[Setup Node.js 18.20.1
(actions/setup-node@v3)];
    D --> E[Install Dependencies
(npm install)];
    E --> F[Run Tests & Generate Reports
(npm run report:all)];
    F --> G[Setup Pages
(actions/configure-pages@v5)];
    G --> H[Upload Artifacts (entire repo)
(actions/upload-pages-artifact@v3)];
    H --> I[Deploy to GitHub Pages
(actions/deploy-pages@v4)];
    I --> J[GitHub Pages Site Updated];

    classDef trigger fill:#lightblue,stroke:#333,stroke-width:2px;
    classDef job fill:#lightyellow,stroke:#333,stroke-width:2px;
    classDef step fill:#f9f9f9,stroke:#333,stroke-width:2px;
    classDef outcome fill:#lightgreen,stroke:#333,stroke-width:2px;

    class A trigger;
    class B job;
    class C,D,E,F,G,H,I step;
    class J outcome;
```

The CI/CD pipeline, defined in `.github/workflows/static.yml`, automates the testing, report generation, and deployment of documentation and reports to GitHub Pages.

**Trigger:**
The workflow is triggered by:
- A `push` event to the `main` branch.
- A manual `workflow_dispatch` event from the GitHub Actions tab.

**Job: `deploy`**
This single job runs on an `ubuntu-latest` runner and has the necessary permissions to read repository contents and write to GitHub Pages.

**Steps:**
1.  **Checkout Code:** The `actions/checkout@v4` action checks out the repository's code.
2.  **Setup Node.js:** The `actions/setup-node@v3` action configures Node.js version 18.20.1, which is required to run the project's scripts.
3.  **Install Dependencies:** `npm install` is executed to download and install all project dependencies defined in `package.json` and `package-lock.json`.
4.  **Run Tests & Generate Reports:** The crucial command `npm run report:all` is executed. This script:
    *   Runs API tests using Newman.
    *   Runs BDD tests using Cucumber.js (if applicable and configured in `report:all`).
    *   Generates various test reports, including `html-report.html` and `dashboard.html`, saving them into the `artifacts/reports/` directory.
5.  **Setup Pages:** The `actions/configure-pages@v5` action prepares the environment for deploying to GitHub Pages.
6.  **Upload Artifacts:** The `actions/upload-pages-artifact@v3` action uploads the entire repository content (`path: '.'`) as a GitHub Pages artifact. This includes the documentation in `/doc`, the generated reports in `/artifacts/reports`, the new root `index.html`, and all other project files.
7.  **Deploy to GitHub Pages:** The `actions/deploy-pages@v4` action takes the uploaded artifact and deploys it to the GitHub Pages environment. The URL of the deployed site is available as an output of this step.

**Outcome:**
The GitHub Pages site is updated with the latest documentation, test reports, and any other static content from the `main` branch.

## Test Execution Flow (Newman)

```mermaid
graph TD
    A[npm run test:unit OR npm run report] --> B{Pre-requisite Script};
    B --> C[scripts/setup/prepare-newman-env.js];
    C --> D[Reads TEST_ENV (or defaults to 'development')];
    D --> E[Loads config from config/environments/*.yaml];
    E --> F[Generates artifacts/environments/newman_env.json];

    F --> G{Newman Execution};
    A --> G;

    H[artifacts/collections/generated-collection.json] --> G;

    G --> I[Executes API Tests against Target Environment];
    I --> J[Generates Test Results (JSON, JUnit, HTMLEXTRA)];
    J --> K[Saves reports to artifacts/reports/];
    J --> L[Outputs to console];

    classDef trigger fill:#lightblue,stroke:#333,stroke-width:2px;
    classDef script fill:#lightyellow,stroke:#333,stroke-width:2px;
    classDef action fill:#f9f9f9,stroke:#333,stroke-width:2px;
    classDef artifact fill:#lightgrey,stroke:#333,stroke-width:2px;
    classDef outcome fill:#lightgreen,stroke:#333,stroke-width:2px;

    class A trigger;
    class B,G script;
    class C,D,E,I action;
    class F,H,J,K,L artifact;
```

This flow details how API tests are executed using Newman, typically triggered by commands like `npm run test:unit` or `npm run report`.

**Trigger:**
- `npm run test:unit`: Executes Newman tests and outputs basic logs/JSON.
- `npm run report`: Also executes Newman tests as a prerequisite to generating full HTML/JUnit reports.

**Environment Preparation (via `prereport` or `pretest:unit` scripts in `package.json`):**
1.  **`scripts/setup/prepare-newman-env.js` Execution:** This script runs first.
2.  **Environment Configuration Loading:**
    *   It checks the `TEST_ENV` environment variable. If not set, it defaults to `development`.
    *   It loads the corresponding YAML configuration file from `config/environments/` (e.g., `development.yaml`).
3.  **`newman_env.json` Generation:** The script converts the loaded YAML configuration into a JSON file (`artifacts/environments/newman_env.json`) that Newman can understand. This file contains variables like `baseUrl`, `apiKey`, etc.

**Newman Test Execution:**
1.  **Newman Invocation:** The Newman CLI is executed.
2.  **Inputs:**
    *   **Postman Collection:** It uses the pre-generated Postman collection from `artifacts/collections/generated-collection.json`. This collection contains the API requests and basic test scripts (e.g., status code checks, schema validation) derived from the Swagger/OpenAPI specification.
    *   **Environment File:** It uses the dynamically generated `artifacts/environments/newman_env.json` to populate environment-specific variables.
3.  **Test Execution:** Newman sends requests to the target API endpoints (defined by `baseUrl` in the environment and paths in the collection) and runs the associated test scripts.
4.  **Outputs & Results:**
    *   **Console Output:** Real-time feedback on test execution.
    *   **Report Files:** Depending on the exact Newman command (especially with `npm run report`), various report files are generated:
        *   JUnit XML report (e.g., `artifacts/reports/junit-report.xml`).
        *   HTMLEXTRA report (e.g., `artifacts/reports/html-report.html`).
        *   JSON report (e.g., `artifacts/logs/unit-tests-report.json`).
    *   These reports are saved in the `artifacts/reports/` or `artifacts/logs/` directories.

This flow ensures that tests are run with the correct environment configuration and that results are captured in multiple formats for analysis and CI/CD integration.

## Report Generation Flow

```mermaid
graph TD
    subgraph Trigger
        ReportAllCmd[npm run report:all]
        ReportCmd[npm run report]
        DashboardCmd[npm run report:dashboard]
    end

    subgraph NewmanReporting
        Direction LR
        NewmanExec[Newman Execution
(as part of 'npm run report')]
        NewmanExec --> HTMLReport[HTMLEXTRA Report
(html-report.html)]
        NewmanExec --> JUnitReport[JUnit XML Report
(junit-report.xml)]
        NewmanExec --> RawJSONReport[Raw JSON Report
(unit-tests-report.json in /logs)]
    end

    subgraph DashboardGeneration
        Direction LR
        GenerateDashboardScript[scripts/generate-dashboard.js]
        RawJSONReport --> GenerateDashboardScript
        CucumberJSON[BDD JSON Report
(bdd-report.json in /logs, if test:bdd ran)]
        CucumberJSON --> GenerateDashboardScript
        HTMLReportLink{{Link to html-report.html}} -- Optional --> GenerateDashboardScript
        GenerateDashboardScript --> DashboardHTML[Dashboard Report
(dashboard.html)]
    end

    ReportAllCmd --> ReportCmd;
    ReportAllCmd --> DashboardCmd;

    ReportCmd --> NewmanExec;

    DashboardCmd --> GenerateDashboardScript;


    classDef trigger fill:#lightblue,stroke:#333,stroke-width:2px;
    classDef process fill:#lightyellow,stroke:#333,stroke-width:2px;
    classDef artifact fill:#lightgrey,stroke:#333,stroke-width:2px;
    classDef script_file fill:#e6e6fa,stroke:#333,stroke-width:2px;

    class ReportAllCmd,ReportCmd,DashboardCmd trigger;
    class NewmanExec,GenerateDashboardScript process;
    class HTMLReport,JUnitReport,RawJSONReport,DashboardHTML,CucumberJSON artifact;
    class HTMLReportLink artifact;

```

This flow outlines how various test reports are generated, primarily through the `npm run report` and `npm run report:dashboard` commands, often combined in `npm run report:all`.

**Triggers:**
-   **`npm run report`**: Focuses on generating reports directly from a Newman test run.
-   **`npm run report:dashboard`**: Focuses on generating the aggregated `dashboard.html`. This script typically runs *after* other tests have produced their respective JSON outputs.
-   **`npm run report:all`**: A convenience script that usually executes both `npm run report` and `npm run report:dashboard` sequentially.

**1. Newman-Specific Report Generation (via `npm run report`):**
*   **Newman Execution:** The `npm run report` command first triggers a Newman test execution (similar to `npm run test:unit` but often with more reporters configured).
*   **Output Reports:** Newman is configured with multiple reporters:
    *   **HTMLEXTRA Reporter:** Generates a detailed, interactive HTML report (e.g., `artifacts/reports/html-report.html`). This is often the primary human-readable report for Newman tests.
    *   **JUnit Reporter:** Generates an XML report (e.g., `artifacts/reports/junit-report.xml`), which is standard for CI/CD system integration.
    *   **JSON Reporter:** Outputs a raw JSON file with the test results (e.g., `artifacts/logs/unit-tests-report.json`). This JSON file is a crucial input for the dashboard generation.

**2. Dashboard Report Generation (via `npm run report:dashboard`):**
*   **`scripts/generate-dashboard.js` Execution:** This Node.js script is responsible for creating the `artifacts/reports/dashboard.html` file.
*   **Inputs:**
    *   **Newman JSON Report:** It reads the JSON output from the Newman run (e.g., `artifacts/logs/unit-tests-report.json`).
    *   **Cucumber/BDD JSON Report (Optional):** It looks for a BDD test JSON report (e.g., `artifacts/logs/bdd-report.json`), if available. This implies that BDD tests (`npm run test:bdd`) should have been run prior to generating an all-inclusive dashboard.
    *   **Link to HTMLEXTRA report (Optional):** The script might also include a direct link to the more detailed `html-report.html` within the dashboard for easy navigation.
*   **Processing:** The script aggregates data from these JSON reports (e.g., number of tests, passes, failures, duration for both Newman and BDD tests).
*   **Output:**
    *   **`dashboard.html`:** A consolidated HTML page providing a summary of both API (Newman) and BDD (Cucumber) test results, with overall statistics and links to more detailed reports if applicable.

This multi-stage reporting process ensures that detailed individual reports are available for deep dives, while a summary dashboard provides a quick overview of the overall test status. The `npm run report:all` command simplifies this by orchestrating both stages.
