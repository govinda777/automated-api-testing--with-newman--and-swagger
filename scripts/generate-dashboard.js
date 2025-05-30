const fs = require('fs');
const path = require('path');

// Caminhos para os arquivos de resultado JSON
const NEWMAN_REPORT_PATH = path.join(__dirname, '..', 'artifacts', 'logs', 'unit-tests-report.json');
const CUCUMBER_REPORT_PATH = path.join(__dirname, '..', 'artifacts', 'logs', 'bdd-report.json');

// Caminho para o arquivo de saída do dashboard
const DASHBOARD_OUTPUT_PATH = path.join(__dirname, '..', 'artifacts', 'reports', 'dashboard.html');
const REPORTS_DIR = path.dirname(DASHBOARD_OUTPUT_PATH);

// Função para garantir que o diretório de saída exista
function ensureDirectoryExistence(filePath) {
    const dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
        return true;
    }
    ensureDirectoryExistence(dirname); // Recursivamente cria o pai se não existir
    fs.mkdirSync(dirname);
}

// Função para ler e parsear JSON com tratamento de erro básico
function readJsonFile(filePath) {
    try {
        if (fs.existsSync(filePath)) {
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            return JSON.parse(fileContent);
        }
        console.warn(`Aviso: Arquivo de relatório não encontrado: ${filePath}. Será tratado como sem resultados.`);
        return null;
    } catch (error) {
        console.error(`Erro ao ler ou parsear o arquivo JSON ${filePath}:`, error);
        return { error: true, message: error.message }; // Retorna um objeto de erro para tratamento posterior
    }
}

// Funções para processar dados de cada relatório (serão implementadas a seguir)
function processNewmanReport(report) {
    if (!report || report.error || !report.run || !report.run.stats || !report.run.timings) {
        console.error('Erro ou formato inválido no relatório Newman:', report ? (report.message || 'Formato inesperado') : 'Relatório não fornecido');
        return { total: 0, passed: 0, failed: 0, durationMs: 0, error: true };
    }
    try {
        const stats = report.run.stats;
        const timings = report.run.timings;

        // Prioriza 'assertions' se disponível, caso contrário tenta 'items'
        const totalTests = stats.assertions ? stats.assertions.total : (stats.items ? stats.items.total : 0);
        const failedTests = stats.assertions ? stats.assertions.failed : (stats.items ? stats.items.failed : 0);

        // Calcula 'passed' com base no total e falhas. Garante que não seja negativo.
        const passedTests = Math.max(0, totalTests - failedTests);

        const durationMs = timings.completed && timings.started ? (timings.completed - timings.started) : 0;

        return {
            total: totalTests,
            passed: passedTests,
            failed: failedTests,
            durationMs: durationMs
        };
    } catch (e) {
        console.error("Erro ao processar dados do Newman:", e);
        return { total: 0, passed: 0, failed: 0, durationMs: 0, error: true, errorMessage: e.message };
    }
}

function processCucumberReport(report) {
    if (!report || report.error || !Array.isArray(report)) {
        console.error('Erro ou formato inválido no relatório Cucumber:', report ? (report.message || 'Formato inesperado') : 'Relatório não fornecido');
        return { totalScenarios: 0, passedScenarios: 0, failedScenarios: 0, durationMs: 0, error: true };
    }
    try {
        let totalScenarios = 0;
        let passedScenarios = 0;
        let failedScenarios = 0;
        let totalDurationNano = 0;

        report.forEach(feature => {
            if (feature.elements) {
                feature.elements.forEach(scenario => {
                    if (scenario.type === 'scenario') { // Garante que é um cenário
                        totalScenarios++;
                        let scenarioFailed = false;
                        if (scenario.steps) {
                            scenario.steps.forEach(step => {
                                if (step.result) {
                                    if (step.result.status === 'failed') {
                                        scenarioFailed = true;
                                    }
                                    totalDurationNano += step.result.duration || 0;
                                }
                            });
                        }
                        if (scenarioFailed) {
                            failedScenarios++;
                        } else {
                            // Considera o cenário passado apenas se não falhou e teve steps
                            // (um cenário sem steps ou com steps pulados/pendentes não é necessariamente "passado" ativamente)
                            if (scenario.steps && scenario.steps.length > 0) {
                                passedScenarios++;
                            }
                        }
                    }
                });
            }
        });
        const durationMs = Math.round(totalDurationNano / 1000000); // Convertendo nanossegundos para milissegundos
        return {
            totalScenarios,
            passedScenarios,
            failedScenarios,
            durationMs
        };
    } catch (e) {
        console.error("Erro ao processar dados do Cucumber:", e);
        return { totalScenarios: 0, passedScenarios: 0, failedScenarios: 0, durationMs: 0, error: true, errorMessage: e.message };
    }
}

// Função para gerar o conteúdo HTML do dashboard (será implementada a seguir)
function generateDashboardHtml(newmanData, cucumberData) {
    const newmanReportLink = "../reports/html-report.html"; // Assumindo que está na mesma pasta 'reports'
    const newmanReportExists = fs.existsSync(path.join(REPORTS_DIR, "html-report.html"));

    // Tratamento para casos de erro na leitura/processamento dos relatórios
    const nmTotal = newmanData.error ? 'Erro' : newmanData.total;
    const nmPassed = newmanData.error ? 'Erro' : newmanData.passed;
    const nmFailed = newmanData.error ? 'Erro' : newmanData.failed;
    const nmDuration = newmanData.error ? 'Erro' : `${newmanData.durationMs} ms`;

    const cucTotal = cucumberData.error ? 'Erro' : cucumberData.totalScenarios;
    const cucPassed = cucumberData.error ? 'Erro' : cucumberData.passedScenarios;
    const cucFailed = cucumberData.error ? 'Erro' : cucumberData.failedScenarios;
    const cucDuration = cucumberData.error ? 'Erro' : `${cucumberData.durationMs} ms`;

    let overallTotalTests = 0;
    let overallPassed = 0;
    let overallFailed = 0;

    if (!newmanData.error) {
        overallTotalTests += newmanData.total;
        overallPassed += newmanData.passed;
        overallFailed += newmanData.failed;
    }
    if (!cucumberData.error) {
        overallTotalTests += cucumberData.totalScenarios;
        overallPassed += cucumberData.passedScenarios;
        overallFailed += cucumberData.failedScenarios;
    }


    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard de Testes da API</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f4f4f4; color: #333; }
        .container { background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        h1 { color: #333; text-align: center; }
        h2 { color: #555; border-bottom: 2px solid #eee; padding-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { text-align: left; padding: 12px; border-bottom: 1px solid #ddd; }
        th { background-color: #f0f0f0; }
        .summary-card { background-color: #e9ecef; padding: 15px; border-radius: 5px; margin-bottom: 15px; }
        .summary-card p { margin: 5px 0; font-size: 1.1em; }
        .status-passed { color: green; }
        .status-failed { color: red; }
        .status-neutral { color: orange; }
        .report-link { margin-top: 10px; }
        .report-link a { color: #007bff; text-decoration: none; }
        .report-link a:hover { text-decoration: underline; }
        .error-message { color: #D8000C; background-color: #FFD2D2; padding: 10px; border-radius: 5px; margin-bottom:15px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Dashboard de Testes da API</h1>

        ${newmanData.error ? `<div class="error-message"><strong>Erro ao processar relatório Newman:</strong> ${newmanData.errorMessage || 'Verifique os logs do console.'}</div>` : ''}
        ${cucumberData.error ? `<div class="error-message"><strong>Erro ao processar relatório Cucumber:</strong> ${cucumberData.errorMessage || 'Verifique os logs do console.'}</div>` : ''}

        <h2>Resumo Geral</h2>
        <div class="summary-card">
            <p>Total de Testes Executados: <strong>${(newmanData.error || cucumberData.error) ? 'N/A (devido a erros)' : overallTotalTests}</strong></p>
            <p class="${overallFailed > 0 ? 'status-failed' : 'status-passed'}">Total Passados: <strong>${(newmanData.error || cucumberData.error) ? 'N/A' : overallPassed}</strong></p>
            <p class="${overallFailed > 0 ? 'status-failed' : 'status-neutral'}">Total Falhados: <strong>${(newmanData.error || cucumberData.error) ? 'N/A' : overallFailed}</strong></p>
        </div>

        <h2>Testes Unitários/Contrato (Newman)</h2>
        <table>
            <thead>
                <tr>
                    <th>Métrica</th>
                    <th>Valor</th>
                </tr>
            </thead>
            <tbody>
                <tr><td>Total de Asserções/Testes</td><td><strong>${nmTotal}</strong></td></tr>
                <tr><td>Passados</td><td class="${newmanData.error ? '' : (nmFailed === 0 ? 'status-passed' : '')}">${nmPassed}</td></tr>
                <tr><td>Falhados</td><td class="${newmanData.error ? '' : (nmFailed > 0 ? 'status-failed' : 'status-passed')}">${nmFailed}</td></tr>
                <tr><td>Duração</td><td>${nmDuration}</td></tr>
            </tbody>
        </table>
        ${newmanReportExists ? `<div class="report-link"><a href="${newmanReportLink}" target="_blank">Ver Relatório HTML Detalhado do Newman</a></div>` : '<p>Relatório HTML do Newman não encontrado.</p>'}


        <h2>Testes de Comportamento (BDD - Cucumber)</h2>
        <table>
            <thead>
                <tr>
                    <th>Métrica</th>
                    <th>Valor</th>
                </tr>
            </thead>
            <tbody>
                <tr><td>Total de Cenários</td><td><strong>${cucTotal}</strong></td></tr>
                <tr><td>Passados</td><td class="${cucumberData.error ? '' : (cucFailed === 0 ? 'status-passed' : '')}">${cucPassed}</td></tr>
                <tr><td>Falhados</td><td class="${cucumberData.error ? '' : (cucFailed > 0 ? 'status-failed' : 'status-passed')}">${cucFailed}</td></tr>
                <tr><td>Duração</td><td>${cucDuration}</td></tr>
            </tbody>
        </table>
        <!-- Link para relatório Cucumber HTML pode ser adicionado se gerado -->
    </div>
</body>
</html>
    `;
}

// Função principal para orquestrar a geração do dashboard
function main() {
    console.log('Iniciando geração do dashboard de testes...');

    ensureDirectoryExistence(DASHBOARD_OUTPUT_PATH);

    const newmanReport = readJsonFile(NEWMAN_REPORT_PATH);
    const cucumberReport = readJsonFile(CUCUMBER_REPORT_PATH);

    const newmanData = processNewmanReport(newmanReport);
    const cucumberData = processCucumberReport(cucumberReport);

    const dashboardHtml = generateDashboardHtml(newmanData, cucumberData);

    try {
        fs.writeFileSync(DASHBOARD_OUTPUT_PATH, dashboardHtml);
        console.log(`Dashboard gerado com sucesso em: ${DASHBOARD_OUTPUT_PATH}`);
    } catch (error) {
        console.error(`Erro ao salvar o arquivo do dashboard HTML em ${DASHBOARD_OUTPUT_PATH}:`, error);
        process.exit(1);
    }
}

// Executa a função principal
main();
