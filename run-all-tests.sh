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

# Configura Buildx para Docker
export DOCKER_BUILDKIT=1
export DOCKER_CLI_EXPERIMENTAL=enabled

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

# Função para verificar se o Docker está logado
check_docker_login() {
    echo "Verificando Docker login..."
    # Tenta listar imagens para verificar se está logado
    if ! docker images &> /dev/null; then
        echo "Docker não está logado."
        echo "1. Construir imagem localmente (recomendado)"
        echo "2. Fazer login no Docker"
        echo "3. Sair"
        read -p "Escolha uma opção (1-3): " choice
        
        case $choice in
            1)
                echo "Construindo imagem localmente..."
                build_docker_image
                return 0
                ;;
            2)
                echo "Execute: docker login"
                exit 1
                ;;
            3)
                exit 1
                ;;
            *)
                echo "Opção inválida. Saindo..."
                exit 1
                ;;
        esac
    fi
}

# Função para verificar se o mock server está pronto
check_mock_server() {
    echo "\nValidando se o mock server está pronto..."
    
    # Executa o script de validação
    if ! node scripts/validate-mock-server.js; then
        echo "Erro: Mock server não ficou pronto após várias tentativas"
        exit 1
    fi
}

# Função para matar processos na porta
kill_port() {
    local port=$1
    echo "Encerrando processos na porta $port..."
    
    # Usa sudo para garantir permissões
    if ! sudo lsof -ti :$port | xargs sudo kill -9 2>/dev/null; then
        echo "Nenhum processo encontrado na porta $port"
    fi
    
    echo "Aguardando 2 segundos para os processos morrerem..."
    sleep 2
    
    if sudo lsof -i :$port &> /dev/null; then
        echo "Erro: Porta $port ainda está ocupada após tentar matar os processos"
        return 1
    fi
    
    echo "Porta $port liberada com sucesso"
    return 0
}

# Função para construir a imagem Docker
build_docker_image() {
    show_status "Construindo imagem Docker usando docker-build.sh..."
    
    # Executa o script de build
    ./docker-build.sh
    if [ $? -ne 0 ]; then
        echo "Erro ao construir imagem Docker. Verifique o log acima para mais detalhes."
        echo "Se o erro persistir, verifique:"
        echo "1. Se todos os arquivos necessários estão presentes"
        echo "2. Se há permissões adequadas nos arquivos"
        echo "3. Se o Docker tem espaço suficiente no disco"
        exit 1
    fi
    
    echo "Imagem Docker construída com sucesso"
}

# Função para iniciar o mock server com Docker
start_mock_with_docker() {
    echo "Iniciando mock server com Docker..."
    
    # Para qualquer container existente
    stop_mock_with_docker
    
    # Reconstrói a imagem
    build_docker_image
    
    # Inicia o container com mais opções de segurança
    docker run -d --name api-mock-server \
        -p $MOCK_PORT:$MOCK_PORT \
        -v $(pwd)/core/swagger:/app/core/swagger:ro \
        --memory="512m" \
        --memory-swap="1g" \
        --restart=unless-stopped \
        --security-opt=no-new-privileges \
        --security-opt=apparmor=unconfined \
        $DOCKER_IMAGE
    
    if [ $? -ne 0 ]; then
        echo "Erro ao iniciar mock server com Docker. Verifique:"
        echo "1. Se a porta $MOCK_PORT está disponível"
        echo "2. Se há espaço suficiente no disco"
        echo "3. Se o Docker tem recursos suficientes"
        exit 1
    fi
    
    echo "Mock server iniciado com sucesso na porta $MOCK_PORT"
    echo "Container ID: $(docker ps -qf "name=api-mock-server")"
}

# Função para parar e remover o container do mock server
stop_mock_with_docker() {
    echo "Parando e removendo container do mock server..."
    docker stop api-mock-server 2>/dev/null || true
    docker rm api-mock-server 2>/dev/null || true
}

# Limpa o ambiente antes de começar
cleanup_environment

# Verifica Docker e inicia os testes
check_docker

# Verifica Docker login
check_docker_login

# 1. Iniciar servidor de mock (opcional)
if [ "$START_MOCK" = "true" ]; then
    show_status "Iniciando servidor de mock..."
    
    # Mata qualquer processo na porta 4010
    if ! kill_port $MOCK_PORT; then
        echo "Erro ao liberar porta $MOCK_PORT"
        exit 1
    fi
    
    # Inicia o mock server com Docker
    start_mock_with_docker
    
    # Aguarda o mock server ficar pronto
    if ! check_mock_ready $MOCK_PORT; then
        echo "Erro ao iniciar mock server"
        exit 1
    fi
    
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
