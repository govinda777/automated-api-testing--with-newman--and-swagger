#!/bin/bash

# Script para executar o fluxo completo de testes usando Docker
# Uso: ./run-all-tests.sh [caminho/swagger.yaml] [ambiente] [iniciar-mock]
# Exemplo: ./run-all-tests.sh ./api/swagger.yaml development true

# Configura variáveis
SWAGGER_FILE=$1
ENVIRONMENT=${2:-development}  # Ambiente padrão é development
START_MOCK=${3:-false}  # Iniciar servidor de mock por padrão
MOCK_PORT=4010  # Porta padrão do mock server
DOCKER_IMAGE="automated-api-testing:latest"

# Função para mostrar status
show_status() {
    echo "==================================================="
    echo " $1"
    echo "==================================================="
}

# Função para limpar o ambiente
cleanup_environment() {
    show_status "Limpando ambiente..."
    
    # Mata qualquer processo na porta 4010
    echo "Encerrando processos na porta $MOCK_PORT..."
    sudo lsof -ti :$MOCK_PORT | xargs kill -9 || true
    
    # Para qualquer container existente
    echo "Parando e removendo container do mock server..."
    docker stop api-mock-server || true
    docker rm api-mock-server || true
    
    # Limpa a imagem antiga
    echo "Limpando imagem Docker antiga..."
    docker rmi $DOCKER_IMAGE || true
}

# Função para verificar se o Docker está instalado
check_docker() {
    if ! command -v docker &> /dev/null; then
        echo "Erro: Docker não está instalado. Por favor, instale o Docker primeiro."
        exit 1
    fi
    
    # Verifica se temos permissão para usar o Docker
    if ! docker ps &> /dev/null; then
        echo "Erro: Sem permissão para usar o Docker. Execute:"
        echo "sudo usermod -aG docker $USER"
        echo "E faça logout/login ou execute: newgrp docker"
        exit 1
    fi
}

# Limpa o ambiente antes de começar
cleanup_environment

# Verifica Docker e inicia os testes
check_docker

# Resto do script...

# Função para construir a imagem Docker
build_docker_image() {
    echo "Construindo imagem Docker..."
    docker build -t $DOCKER_IMAGE .
    if [ $? -ne 0 ]; then
        echo "Erro ao construir imagem Docker"
        exit 1
    fi
}

# Função para iniciar o mock server com Docker
start_mock_with_docker() {
    echo "Iniciando mock server com Docker..."
    
    # Para qualquer container existente
    stop_mock_with_docker
    
    # Reconstrói a imagem
    build_docker_image
    
    # Inicia o container
    docker run -d --name api-mock-server \
        -p $MOCK_PORT:$MOCK_PORT \
        -v $(pwd)/core/swagger:/app/core/swagger \
        --memory="512m" \
        --memory-swap="1g" \
        $DOCKER_IMAGE
    
    if [ $? -ne 0 ]; then
        echo "Erro ao iniciar mock server com Docker"
        exit 1
    fi
}

# Função para parar e remover o container do mock server
stop_mock_with_docker() {
    echo "Parando e removendo container do mock server..."
    docker stop api-mock-server 2>/dev/null || true
    docker rm api-mock-server 2>/dev/null || true
}

# Função para verificar se o mock server está pronto
check_mock_ready() {
    local port=$1
    local attempts=30
    local delay=1
    
    for ((i=1; i<=attempts; i++)); do
        echo "Tentativa $i/$attempts - Verificando se o mock server está respondendo..."
        
        # Verifica se o processo está rodando
        if ! ps aux | grep -v grep | grep -q "prism mock"; then
            echo "Erro: Processo do mock server não está mais rodando"
            return 1
        fi
        
        # Verifica se o servidor está respondendo
        RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$port/users)
        if [ "$RESPONSE" = "200" ]; then
            echo "Mock server pronto e respondendo na porta $port"
            return 0
        fi
        
        # Verifica se o servidor está respondendo com qualquer código HTTP
        if [ "$RESPONSE" -ge "100" ] && [ "$RESPONSE" -le "599" ]; then
            echo "Mock server respondendo com código HTTP $RESPONSE"
            return 0
        fi
        
        sleep $delay
    done
    
    echo "Erro: Mock server não ficou pronto após $attempts tentativas"
    return 1
}

# Função para matar processos na porta
kill_port() {
    local port=$1
    echo "Encerrando processos na porta $port..."
    # Primeiro mata os processos
    lsof -ti :$port | xargs kill -9 2>/dev/null || true
    
    # Aguarda um pouco para garantir que os processos morreram
    echo "Aguardando 2 segundos para os processos morrerem..."
    sleep 2
    
    # Verifica se a porta ainda está ocupada
    if lsof -i :$port &> /dev/null; then
        echo "Erro: Porta $port ainda está ocupada após tentar matar os processos"
        return 1
    fi
    
    echo "Porta $port liberada com sucesso"
    return 0
}

# Função para testar endpoint
make_test_request() {
    local endpoint=$1
    local http_code
    
    # Usa -s para modo silencioso e -w para extrair apenas o código HTTP
    # Usa -X GET para especificar o método HTTP
    http_code=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$MOCK_PORT$endpoint")
    
    # Verifica se o código é 200 antes de imprimir
    if [ "$http_code" -ne 200 ]; then
        echo "Erro: Endpoint .. $endpoint não está respondendo com 200 (obtido: $http_code)"
        return 1
    fi
    
    # Imprime o código HTTP apenas se for sucesso
    echo "Código de resposta do endpoint $endpoint: $http_code"
    echo "Endpoint $endpoint funcionando corretamente com código HTTP $http_code"
    return 0
}

# Função para verificar se o mock server está respondendo corretamente
verify_mock_response() {
    local endpoint=$1
    local expected_code=$2
    local attempts=5
    
    for i in {1..$attempts}; do
        echo "Verificando resposta do endpoint $endpoint (tentativa $i/$attempts)..."
        RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$MOCK_PORT$endpoint")
        if [ "$RESPONSE" = "$expected_code" ]; then
            echo "Resposta válida recebida (código $RESPONSE)"
            return 0
        fi
        echo "Resposta não válida (código $RESPONSE), aguardando 2 segundos..."
        sleep 2
    done
    
    echo "Erro: Não foi possível obter resposta válida após $attempts tentativas"
    return 1
}

# 1. Iniciar servidor de mock (opcional)
if [ "$START_MOCK" = "true" ]; then
    show_status "Iniciando servidor de mock com menos memória..."
    
    # Mata qualquer processo na porta 4010
    if ! kill_port $MOCK_PORT; then
        echo "Erro ao liberar porta $MOCK_PORT"
        exit 1
    fi
    
    # Inicia o mock server com menos memória
    echo "Iniciando servidor mock Prism com menos memória..."
    
    # Primeiro limpa o cache do npm
    npm cache clean --force
    
    # Instala Prism localmente
    npm install @stoplight/prism-cli@5.14.2 --save-dev
    
    # Define o caminho absoluto do Swagger
    SWAGGER_PATH=$(pwd)/core/swagger/swagger.yaml
    
    # Verifica se o arquivo existe
    if [ ! -f "$SWAGGER_PATH" ]; then
        echo "Erro: Arquivo Swagger não encontrado em $SWAGGER_PATH"
        exit 1
    fi
    
    # Inicia o mock server com limites de memória
    echo "Iniciando servidor mock Prism com o comando:"
    echo "node --max-old-space-size=512 ./node_modules/.bin/prism mock \"$SWAGGER_PATH\" -p $MOCK_PORT --host 0.0.0.0 --verboseLevel debug"
    
    # Inicia o mock server em segundo plano
    node --max-old-space-size=512 ./node_modules/.bin/prism mock "$SWAGGER_PATH" -p $MOCK_PORT --host 0.0.0.0 --verboseLevel debug &
    
    # Aguarda o mock server ficar pronto
    if ! check_mock_ready $MOCK_PORT; then
        echo "Erro ao iniciar mock server"
        exit 1
    fi
    
    # Aguarda um pouco mais para garantir que o servidor esteja completamente pronto
    echo "Aguardando 5 segundos adicionais para o servidor estar completamente pronto..."
    sleep 5
fi
    
    # Testa o endpoint /users
    echo "Testando endpoint /users..."
    RESPONSE_CODE=$(make_test_request "/users")
    echo "Código de resposta do endpoint /users: $RESPONSE_CODE"
    if [ "$RESPONSE_CODE" != "200" ]; then
        echo "Erro: Endpoint . /users não está respondendo com 200 (obtido: $RESPONSE_CODE)"
        exit 1
    fi
    
    # Verifica se o conteúdo da resposta está correto
    RESPONSE=$(curl -s "http://localhost:$MOCK_PORT/users")
    echo "Conteúdo da resposta:"
    echo "$RESPONSE"
    if [[ $RESPONSE != *"id"* ]] || [[ $RESPONSE != *"name"* ]]; then
        echo "Erro: Resposta não contém os campos esperados (id e name)"
        exit 1
    fi
    
    # Verifica se o mock server está respondendo corretamente
    if ! verify_mock_response "/users" "200"; then
        echo "Erro: Mock server não está respondendo corretamente"
        exit 1
    fi
    
    # Aguarda mais alguns segundos para garantir que o servidor esteja completamente pronto
    echo "Aguardando 15 segundos adicionais para o servidor estar completamente pronto..."
    sleep 15
    
    # Atualiza as variáveis de ambiente
    export BASE_URL="http://localhost:$MOCK_PORT"
    export API_URL="http://localhost:$MOCK_PORT"
    export API_BASE_URL="http://localhost:$MOCK_PORT"
    export MOCK_SERVER_PORT=$MOCK_PORT
fi

# 2. Importar especificação Swagger
show_status "Importando especificação Swagger..."
npm run import-swagger -- --file=$SWAGGER_FILE
if [ $? -ne 0 ]; then
    echo "Erro ao importar especificação Swagger"
    exit 1
fi

# 3. Gerar coleção Postman
show_status "Gerando coleção Postman..."
npm run generate-collection
if [ $? -ne 0 ]; then
    echo "Erro ao gerar coleção Postman"
    exit 1
fi

# Aguarda mais alguns segundos para o mock server processar as alterações
show_status "Aguardando mock server processar alterações..."
echo "Aguardando 15 segundos adicionais..."
sleep 15

# 4. Executar testes unitários
show_status "Executando testes unitários..."
export TEST_ENV=$ENVIRONMENT
# Se estiver usando mock, garante que as variáveis de ambiente estão corretas
if [ "$START_MOCK" = "true" ]; then
    export BASE_URL="http://localhost:$MOCK_PORT"
    export API_URL="http://localhost:$MOCK_PORT"
    export API_BASE_URL="http://localhost:$MOCK_PORT"
    export MOCK_SERVER_PORT=$MOCK_PORT
fi

# Verifica o conteúdo do arquivo de ambiente
show_status "Verificando arquivo de ambiente..."
cat artifacts/environments/newman_env.json

npm run test:unit
if [ $? -ne 0 ]; then
    echo "Erro ao executar testes unitários"
    exit 1
fi

# 5. Executar testes BDD
show_status "Executando testes BDD..."
npm run test:bdd
if [ $? -ne 0 ]; then
    echo "Erro ao executar testes BDD"
    exit 1
fi

# 6. Gerar relatórios
show_status "Gerando relatórios..."
npm run report
if [ $? -ne 0 ]; then
    echo "Erro ao gerar relatórios"
    exit 1
fi

# 7. Abrir relatório no navegador
show_status "Abrindo relatório no navegador..."
npm run report:open

# Finalização
echo "==================================================="
echo "Processo concluído com sucesso!"
echo "Ambiente: $ENVIRONMENT"
echo "Mock Server: $START_MOCK"
echo "Porta do Mock Server: $MOCK_PORT"
echo "Relatórios gerados em: /artifacts/reports/"
echo "==================================================="

# Se estiver usando mock, aguarda o usuário terminar
if [ "$START_MOCK" = "true" ]; then
    echo "Pressione Ctrl+C para encerrar o servidor de mock"
    wait %1  # Aguarda o processo do mock server
fi
