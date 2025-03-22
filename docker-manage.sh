#!/bin/bash

# Colors for better output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

PROJECT_DIR=$(dirname "$0")
cd "$PROJECT_DIR" || exit

show_help() {
  echo -e "${BLUE}Docker Management Script for Tech Standards Project${NC}"
  echo
  echo -e "Usage: ${YELLOW}./docker-manage.sh${NC} ${GREEN}[command]${NC}"
  echo
  echo -e "Commands:"
  echo -e "  ${GREEN}start${NC}      Start all containers"
  echo -e "  ${GREEN}stop${NC}       Stop all containers"
  echo -e "  ${GREEN}restart${NC}    Restart all containers"
  echo -e "  ${GREEN}build${NC}      Rebuild and start all containers"
  echo -e "  ${GREEN}logs${NC}       View logs from all containers"
  echo -e "  ${GREEN}client${NC}     View logs from client container only"
  echo -e "  ${GREEN}server${NC}     View logs from server container only"
  echo -e "  ${GREEN}mongo${NC}      View logs from MongoDB container only"
  echo -e "  ${GREEN}status${NC}     Check the status of all containers"
  echo -e "  ${GREEN}prune${NC}      Remove all stopped containers, unused networks, and dangling images"
  echo
}

case "$1" in
  start)
    echo -e "${BLUE}Starting all containers...${NC}"
    docker-compose up -d
    ;;
  stop)
    echo -e "${BLUE}Stopping all containers...${NC}"
    docker-compose down
    ;;
  restart)
    echo -e "${BLUE}Restarting all containers...${NC}"
    docker-compose restart
    ;;
  build)
    echo -e "${BLUE}Rebuilding and starting all containers...${NC}"
    docker-compose up -d --build
    ;;
  logs)
    echo -e "${BLUE}Showing logs for all containers...${NC}"
    docker-compose logs -f
    ;;
  client)
    echo -e "${BLUE}Showing logs for client container...${NC}"
    docker-compose logs -f client
    ;;
  server)
    echo -e "${BLUE}Showing logs for server container...${NC}"
    docker-compose logs -f server
    ;;
  mongo)
    echo -e "${BLUE}Showing logs for MongoDB container...${NC}"
    docker-compose logs -f mongo
    ;;
  status)
    echo -e "${BLUE}Current container status:${NC}"
    docker-compose ps
    ;;
  prune)
    echo -e "${YELLOW}Warning: This will remove all stopped containers, unused networks and dangling images.${NC}"
    read -p "Are you sure you want to continue? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      echo -e "${BLUE}Cleaning up Docker resources...${NC}"
      docker system prune -f
      echo -e "${GREEN}Clean up complete!${NC}"
    fi
    ;;
  *)
    show_help
    ;;
esac 