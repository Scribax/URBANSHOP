#!/bin/bash
# LATIN BROÚ - Fast Incremental Update Script
set -e

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== ACTUALIZACIÓN RÁPIDA - LATIN BROÚ ===${NC}"

echo -e "${YELLOW}[1/2] Trayendo cambios desde GitHub...${NC}"
git pull origin main

echo -e "${YELLOW}[2/2] Recompilando de forma incremental con Docker Compose...${NC}"
# docker compose up -d --build compiles only changed layers and hot-swaps the container
# without causing database downtime.
docker compose up -d --build

echo -e "${GREEN}=== TIENDA ACTUALIZADA EXITOSAMENTE! ===${NC}"
echo -e "Los cambios aplicados ya se encuentran activos en producción."
echo -e "========================================="
