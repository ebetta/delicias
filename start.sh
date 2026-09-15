#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

PID_DIR=".run"
LOG_DIR="logs"
mkdir -p "$PID_DIR" "$LOG_DIR"

VITE_PID_FILE="$PID_DIR/vite.pid"
SERVER_PID_FILE="$PID_DIR/server.pid"
COMPOSE_FILE="docker-compose.postgres.yml"
DB_CONTAINER="delicias-postgres"

is_running() {
  local pid_file="$1"
  [ -f "$pid_file" ] && kill -0 "$(cat "$pid_file")" 2>/dev/null
}

if is_running "$VITE_PID_FILE" || is_running "$SERVER_PID_FILE"; then
  echo "Aplicação já parece estar rodando. Use ./stop.sh antes de iniciar novamente."
  exit 1
fi

echo "Subindo container do Postgres ($DB_CONTAINER)..."
docker compose -f "$COMPOSE_FILE" up -d

echo "Aguardando Postgres ficar saudável..."
for _ in $(seq 1 30); do
  status="$(docker inspect -f '{{.State.Health.Status}}' "$DB_CONTAINER" 2>/dev/null || echo "unknown")"
  if [ "$status" = "healthy" ]; then
    break
  fi
  sleep 1
done
if [ "$status" != "healthy" ]; then
  echo "Postgres não ficou saudável a tempo (status: $status). Veja: docker logs $DB_CONTAINER"
  exit 1
fi

echo "Iniciando servidor Express (porta 3001)..."
nohup node server.js > "$LOG_DIR/server.log" 2>&1 &
echo $! > "$SERVER_PID_FILE"

echo "Iniciando Vite (frontend)..."
nohup npx vite --host > "$LOG_DIR/vite.log" 2>&1 &
echo $! > "$VITE_PID_FILE"

echo "Backend PID: $(cat "$SERVER_PID_FILE") (log: $LOG_DIR/server.log)"
echo "Frontend PID: $(cat "$VITE_PID_FILE") (log: $LOG_DIR/vite.log)"

echo "Aguardando Vite ficar pronto..."
for _ in $(seq 1 30); do
  if grep -q "Local:" "$LOG_DIR/vite.log" 2>/dev/null; then
    break
  fi
  if ! kill -0 "$(cat "$VITE_PID_FILE")" 2>/dev/null; then
    echo "Vite encerrou inesperadamente. Veja $LOG_DIR/vite.log"
    exit 1
  fi
  sleep 0.5
done

echo ""
grep -E "Local:|Network:" "$LOG_DIR/vite.log" || echo "(URLs ainda não disponíveis, veja $LOG_DIR/vite.log)"
echo ""
echo "Aplicação iniciada. Use ./stop.sh para parar."
