#!/bin/bash
echo "Starting NorthWay Solar Engine..."

# Ensure Docker is up (simple check)
docker ps > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "Error: Docker is not running. Please start Docker Desktop."
    exit 1
fi

# Trap to kill both processes on Ctrl+C
trap 'kill 0' SIGINT

echo "Starting Backend on http://localhost:3000..."
(cd backend && PORT=3000 npm run start:dev) &

echo "Starting Frontend on http://localhost:3001..."
(cd frontend && PORT=3001 npm run dev) &

wait
