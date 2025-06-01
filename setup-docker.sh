#!/bin/bash

# Adiciona o usuário ao grupo docker
sudo usermod -aG docker $USER

# Mostra mensagem de instrução
echo "==================================================="
echo "Para usar o Docker, você precisa fazer logout/login ou executar:"
echo "newgrp docker"
echo "==================================================="

# Verifica se o usuário tem permissão para usar o Docker
docker ps &> /dev/null
if [ $? -eq 0 ]; then
    echo "Permissões configuradas com sucesso!"
else
    echo "Ainda sem permissão. Execute:"
    echo "newgrp docker"
fi
