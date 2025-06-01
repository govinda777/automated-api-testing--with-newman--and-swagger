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
check_mock_ready() {
    local port=$1
    local max_attempts=10
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        echo "Tentativa $attempt de $max_attempts: Verificando se o mock server está pronto..."
        
        # Verifica se o servidor está respondendo
        if curl -s http://localhost:$port/health > /dev/null; then
            echo "Mock server pronto na porta $port"
            return 0
        fi
        
        echo "Mock server não está pronto. Aguardando 5 segundos..."
        sleep 5
        attempt=$((attempt + 1))
    done
    
    echo "Erro: Mock server não ficou pronto após $max_attempts tentativas"
    return 1
}

# Função para executar testes dentro do container
run_tests_in_container() {
    show_status "Executando testes dentro do container..."
    
    # Copia o arquivo Swagger para o container
    docker cp $SWAGGER_FILE automated-api-testing:/app/core/swagger/swagger.yaml
    
    # Executa os comandos dentro do container
    docker exec automated-api-testing sh -c "
        npm run import-swagger -- --file=/app/core/swagger/swagger.yaml &&
        npm run generate-collection &&
        npm run test:unit &&
        npm run test:bdd &&
        npm run report
    "
    
    if [ $? -ne 0 ]; then
        echo "Erro ao executar testes dentro do container"
        exit 1
    fi
}

# Função principal
main() {
    # Limpa o ambiente antes de começar
    cleanup_environment

    # Verifica Docker e inicia os testes
    check_docker

    # Verifica Docker login
    check_docker_login

    # Constrói a imagem Docker usando docker-build.sh
    show_status "Construindo imagem Docker..."
    ./docker-build.sh
    if [ $? -ne 0 ]; then
        echo "Erro ao construir imagem Docker"
        exit 1
    fi

    # Inicia o container
    show_status "Iniciando container..."
    docker run -d --name automated-api-testing -p $MOCK_PORT:$MOCK_PORT $DOCKER_IMAGE
    if [ $? -ne 0 ]; then
        echo "Erro ao iniciar container"
        exit 1
    fi

    # Inicia o mock server se necessário
    if [ "$START_MOCK" = "true" ]; then
        show_status "Iniciando servidor de mock..."
        docker exec automated-api-testing sh -c "
            prism mock /app/core/swagger/swagger.yaml \
            -p $MOCK_PORT \
            --host 0.0.0.0 \
            --verboseLevel debug \
            --dynamic \
            --seed 123456 \
            --errors false \
            --cors true
        " &
        
        # Aguarda o mock server ficar pronto
        if ! check_mock_ready $MOCK_PORT; then
            echo "Erro ao iniciar mock server"
            exit 1
        fi
    fi

    # Executa os testes dentro do container
    run_tests_in_container

    # Copia os relatórios para fora do container
    show_status "Copiando relatórios para fora do container..."
    docker cp automated-api-testing:/app/artifacts/reports ./artifacts/reports
    if [ $? -ne 0 ]; then
        echo "Erro ao copiar relatórios"
    fi

    # Finalização
    echo "==================================================="
    echo "Processo concluído com sucesso!"
    echo "Ambiente: $ENVIRONMENT"
    echo "Mock Server: $START_MOCK"
    echo "Porta do Mock Server: $MOCK_PORT"
    echo "Relatórios gerados em: ./artifacts/reports/"
    echo "==================================================="

    # Se estiver usando mock, aguarda o usuário terminar
    if [ "$START_MOCK" = "true" ]; then
        echo "Pressione Ctrl+C para encerrar o servidor de mock"
        wait %1  # Aguarda o processo do mock server
    fi
}

# Executa a função principal
main $@