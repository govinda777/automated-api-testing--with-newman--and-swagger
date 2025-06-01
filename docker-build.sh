#!/bin/bash

# Script para construir a imagem Docker do projeto
# Uso: ./docker-build.sh [tag]
# Se nenhum tag for especificado, usa 'latest' como padrão

set -e  # Encerra o script se algum comando falhar

# Configura variáveis
DOCKER_IMAGE="automated-api-testing"
TAG=${1:-latest}
FULL_IMAGE_NAME="${DOCKER_IMAGE}:${TAG}"

# Define variáveis de ambiente para otimização
export DOCKER_BUILDKIT=1
export DOCKER_CLI_EXPERIMENTAL=enabled
export DOCKER_BUILD_PARALLEL=true
export DOCKER_BUILD_PARALLEL_JOBS=$(nproc)

show_status() {
    echo "==================================================="
    echo " $1"
    echo "==================================================="
}

# Função para limpar cache do Docker
cleanup_docker_cache() {
    show_status "Limpando cache do Docker..."
    # Limpa apenas o cache do builder
    docker builder prune -f
    # Limpa apenas imagens não utilizadas
    docker image prune -f --filter "until=24h"
}

# Função para construir a imagem
build_image() {
    show_status "Construindo imagem Docker..."
    
    # Constrói a imagem com mais detalhes
    show_status "Construindo imagem Docker com detalhes..."
    
    # Constrói a imagem
    docker build \
        --progress=plain \
        --pull \
        --build-arg NODE_ENV=production \
        --build-arg NODE_OPTIONS="--max-old-space-size=4096" \
        --tag ${FULL_IMAGE_NAME} \
        . \
        | tee build.log
    
    # Verifica se houve erro na construção
    if [ $? -ne 0 ]; then
        echo "Erro na construção da imagem. Verifique o arquivo build.log para mais detalhes."
        exit 1
    fi
    
    # Mostra tamanho da imagem
    IMAGE_SIZE=$(docker image inspect ${FULL_IMAGE_NAME} --format='{{.Size}}')
    echo "Tamanho da imagem: $(echo "scale=2; $IMAGE_SIZE/1024/1024" | bc) MB"
}

# Função para testar a imagem
validate_image() {
    show_status "Validando imagem Docker..."
    
    # Testa se a imagem foi criada corretamente
    if ! docker image inspect ${FULL_IMAGE_NAME} &> /dev/null; then
        echo "Erro: A imagem Docker não foi criada corretamente"
        exit 1
    fi
    
    # Testa se o Prism CLI está instalado corretamente
    docker run --rm ${FULL_IMAGE_NAME} npx @stoplight/prism-cli@5.14.2 --version
}

main() {
    cleanup_docker_cache
    build_image
    validate_image
    
    show_status "Imagem Docker criada com sucesso: ${FULL_IMAGE_NAME}"
}

# Executa o script
main "$@"
