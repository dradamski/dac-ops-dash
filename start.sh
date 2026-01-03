#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting DAC Operations Dashboard...${NC}"

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found.${NC}"
    echo -e "${YELLOW}Please create a .env file with the required environment variables.${NC}"
    echo -e "${YELLOW}See README.md for required variables.${NC}"
    exit 1
fi

# Step 1: Start Docker containers
echo -e "\n${GREEN}[1/4] Starting Docker containers...${NC}"
docker-compose up -d

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Failed to start Docker containers${NC}"
    exit 1
fi

# Step 2: Wait for PostgreSQL to be healthy
echo -e "\n${GREEN}[2/4] Waiting for PostgreSQL to be ready...${NC}"
MAX_WAIT=60
WAIT_COUNT=0
while [ $WAIT_COUNT -lt $MAX_WAIT ]; do
    if docker-compose ps postgres | grep -q "healthy"; then
        echo -e "${GREEN}PostgreSQL is ready!${NC}"
        break
    fi
    echo -n "."
    sleep 1
    WAIT_COUNT=$((WAIT_COUNT + 1))
done

if [ $WAIT_COUNT -eq $MAX_WAIT ]; then
    echo -e "\n${RED}Error: PostgreSQL did not become healthy within ${MAX_WAIT} seconds${NC}"
    docker-compose logs postgres
    exit 1
fi

# Step 3: Wait for backend to be ready
echo -e "\n${GREEN}[3/4] Waiting for backend to be ready...${NC}"
MAX_WAIT=60
WAIT_COUNT=0
BACKEND_READY=false
RESTART_COUNT=0
MAX_RESTARTS=3

# Give backend a moment to start after container is created
sleep 3

while [ $WAIT_COUNT -lt $MAX_WAIT ]; do
    # Check if backend container is running (check if "Up" appears in status line)
    CONTAINER_LINE=$(docker-compose ps backend 2>/dev/null | grep backend || echo "")
    
    # Check if container is running (status contains "Up")
    if echo "$CONTAINER_LINE" | grep -q "Up"; then
        # Check if backend is responding via health endpoint
        if curl -s -f http://localhost:8000/health > /dev/null 2>&1; then
            echo -e "${GREEN}Backend is ready!${NC}"
            BACKEND_READY=true
            break
        fi
        # Fallback: Check if we can reach the API root endpoint
        if curl -s -f http://localhost:8000/ > /dev/null 2>&1; then
            echo -e "${GREEN}Backend is ready!${NC}"
            BACKEND_READY=true
            break
        fi
    fi
    
    # Extract status for exit checking
    CONTAINER_STATUS=$(echo "$CONTAINER_LINE" | awk '{print $4}' || echo "")
    
    # If container exited, check logs and try to restart (max 3 times)
    if [ "$CONTAINER_STATUS" = "Exit" ] || [ -z "$CONTAINER_STATUS" ]; then
        if [ $RESTART_COUNT -lt $MAX_RESTARTS ]; then
            echo -e "\n${YELLOW}Backend container appears to have exited. Checking logs...${NC}"
            docker-compose logs --tail=20 backend
            echo -e "\n${YELLOW}Attempting to restart backend (attempt $((RESTART_COUNT + 1))/${MAX_RESTARTS})...${NC}"
            docker-compose restart backend
            RESTART_COUNT=$((RESTART_COUNT + 1))
            sleep 5  # Give it more time after restart
        else
            echo -e "\n${RED}Maximum restart attempts (${MAX_RESTARTS}) reached. Backend failed to start.${NC}"
            break
        fi
    fi
    
    echo -n "."
    sleep 1
    WAIT_COUNT=$((WAIT_COUNT + 1))
done

if [ "$BACKEND_READY" = false ]; then
    echo -e "\n${RED}Error: Backend did not become ready within ${MAX_WAIT} seconds${NC}"
    echo -e "${YELLOW}Backend logs:${NC}"
    docker-compose logs --tail=30 backend
    exit 1
fi

# Step 4: Check if database needs seeding
echo -e "\n${GREEN}[4/4] Checking if database needs seeding...${NC}"

# Ensure backend is still running before trying to exec
if ! docker-compose ps backend | grep -q "Up"; then
    echo -e "${RED}Error: Backend container is not running. Cannot seed database.${NC}"
    docker-compose logs --tail=20 backend
    exit 1
fi

# Check if dac_units table has any rows
UNIT_COUNT=$(docker-compose exec -T postgres psql -U ${POSTGRES_USER:-dac_user} -d ${POSTGRES_DB:-dac_ops_db} -t -c "SELECT COUNT(*) FROM dac_units;" 2>/dev/null | tr -d ' ')

if [ -z "$UNIT_COUNT" ] || [ "$UNIT_COUNT" = "0" ]; then
    echo -e "${YELLOW}Database appears to be empty. Seeding with sample data...${NC}"
    
    # Try exec first, if that fails, use run
    if ! docker-compose exec -T backend python seed_data.py 2>/dev/null; then
        echo -e "${YELLOW}Exec failed, trying run...${NC}"
        docker-compose run --rm backend python seed_data.py
    fi
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Database seeded successfully!${NC}"
    else
        echo -e "${RED}Error: Failed to seed database${NC}"
        echo -e "${YELLOW}Backend logs:${NC}"
        docker-compose logs --tail=20 backend
        exit 1
    fi
else
    echo -e "${GREEN}Database already contains data (${UNIT_COUNT} units found). Skipping seed.${NC}"
fi

# Final status
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}All services are running!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "Frontend:  ${GREEN}http://localhost:3000${NC}"
echo -e "Backend:   ${GREEN}http://localhost:8000${NC}"
echo -e "API Docs:  ${GREEN}http://localhost:8000/docs${NC}"
echo -e "\nTo view logs: ${YELLOW}docker-compose logs -f${NC}"
echo -e "To stop:     ${YELLOW}docker-compose down${NC}"