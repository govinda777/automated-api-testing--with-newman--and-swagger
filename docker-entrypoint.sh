#!/bin/bash

# Inicia o mock server com configurações mais robustas
echo "Iniciando servidor mock Prism..."
exec node --max-old-space-size=512 ./node_modules/.bin/prism mock "$SWAGGER_PATH" \
    -p 4010 \
    --host 0.0.0.0 \
    --verboseLevel debug \
    --dynamic \
    --seed "123456" \
    --errors false \
    --cors true
