#!/bin/bash
# LATIN BROÚ - Automated Ubuntu VPS Deployment Script
set -e

# Setup premium terminal color outputs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}===============================================${NC}"
echo -e "${BLUE}     SISTEMA DE DESPLIEGUE - LATIN BROÚ        ${NC}"
echo -e "${BLUE}===============================================${NC}"

# 1. Update system packages
echo -e "\n${YELLOW}[1/5] Actualizando listas de paquetes del sistema...${NC}"
sudo apt-get update -y
sudo apt-get upgrade -y

# 2. Install basic dependencies and Docker Engine
echo -e "\n${YELLOW}[2/5] Verificando e instalando dependencias (Git, Curl, Docker)...${NC}"
sudo apt-get install -y git curl gnupg lsb-release ca-certificates

if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}Docker no está instalado. Iniciando instalación de Docker...${NC}"
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
fi

# Enable and start Docker service daemon
sudo systemctl enable docker
sudo systemctl start docker

# 3. Clone Repository
echo -e "\n${YELLOW}[3/5] Clonando/actualizando repositorio de producción en /var/www/urbanshop...${NC}"
DEPLOY_DIR="/var/www/urbanshop"
if [ -d "$DEPLOY_DIR" ]; then
    echo -e "${YELLOW}El directorio ya existe. Obteniendo últimos cambios de Git...${NC}"
    cd "$DEPLOY_DIR"
    sudo git reset --hard
    sudo git pull origin main || true
else
    sudo mkdir -p /var/www
    sudo git clone https://github.com/Scribax/URBANSHOP.git "$DEPLOY_DIR"
    cd "$DEPLOY_DIR"
fi

# 4. Domain & IP Setup
echo -e "\n${YELLOW}[4/5] Configurando direcciones IP / Dominio público...${NC}"
PUBLIC_IP=$(curl -s https://icanhazip.com || curl -s https://ifconfig.me || echo "186.64.123.154")
DOMAIN="$PUBLIC_IP"

echo -e "${GREEN}IP Pública de tu VPS detectada automáticamente: $PUBLIC_IP${NC}"
echo -e "Presiona Enter para usar la IP ($PUBLIC_IP) o escribe tu dominio (ej: valencajera.com):"
read -p "> " INPUT_DOMAIN

if [ ! -z "$INPUT_DOMAIN" ]; then
    DOMAIN="$INPUT_DOMAIN"
fi

echo -e "${YELLOW}Configurando archivos para dominio/IP: http://$DOMAIN${NC}"

# Replace localhost in docker-compose.yml configuration with target VPS domain
sed -i "s|NEXT_PUBLIC_API_URL: http://localhost:4000|NEXT_PUBLIC_API_URL: http://$DOMAIN|g" docker-compose.yml
sed -i "s|FRONTEND_URL: http://localhost:3000|FRONTEND_URL: http://$DOMAIN|g" docker-compose.yml

# Ensure certs folder is present for Nginx configuration (even if empty for HTTP port 80 proxy)
mkdir -p docker/nginx/certs

# 5. Launch containers
echo -e "\n${YELLOW}[5/5] Construyendo imágenes e iniciando contenedores con Docker Compose...${NC}"
sudo docker compose down --remove-orphans || true
sudo docker compose build --no-cache
sudo docker compose up -d

echo -e "\n${GREEN}===============================================${NC}"
echo -e "${GREEN}        DESPLIEGUE FINALIZADO CON ÉXITO!       ${NC}"
echo -e "${GREEN}===============================================${NC}"
echo -e "Tienda disponible en: ${BLUE}http://$DOMAIN${NC}"
echo -e "Panel de Administración: ${BLUE}http://$DOMAIN/admin${NC}"
echo -e "Contenedores Docker activos en segundo plano (Postgres, MinIO, NestJS, NextJS, Nginx)."
echo -e "Para ver registros corre: ${YELLOW}docker compose logs -f${NC}"
echo -e "==============================================="
