FROM node:18.20.1-slim

WORKDIR /app

# Instala as dependências
COPY package*.json ./
RUN npm install

# Copia o Swagger e o script de entrada
COPY core/swagger/swagger.yaml ./core/swagger/swagger.yaml
COPY docker-entrypoint.sh ./

# Define permissões para o script de entrada
RUN chmod +x docker-entrypoint.sh

# Define variáveis de ambiente
ENV NODE_OPTIONS="--max-old-space-size=512"
ENV SWAGGER_PATH="/app/core/swagger/swagger.yaml"

# Expose a porta do mock server
EXPOSE 4010

# Define o script de entrada
ENTRYPOINT ["./docker-entrypoint.sh"]
