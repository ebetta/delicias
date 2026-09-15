#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

PID_DIR=".run"
VITE_PID_FILE="$PID_DIR/vite.pid"
SERVER_PID_FILE="$PID_DIR/server.pid"
COMPOSE_FILE="docker-compose.postgres.yml"

stop_pid_file() {
  local name="$1"
  local pid_file="$2"

  if [ ! -f "$pid_file" ]; then
    echo "$name: nenhum PID registrado."
    return
  fi

  local pid
  pid="$(cat "$pid_file")"

  if kill -0 "$pid" 2>/dev/null; then
    kill "$pid"
    for _ in $(seq 1 10); do
      kill -0 "$pid" 2>/dev/null || break
      sleep 0.5
    done
    if kill -0 "$pid" 2>/dev/null; then
      echo "$name (PID $pid) não parou, forçando kill -9..."
      kill -9 "$pid" 2>/dev/null || true
    fi
    echo "$name (PID $pid) parado."
  else
    echo "$name: processo (PID $pid) já não estava rodando."
  fi

  rm -f "$pid_file"
}

stop_pid_file "Servidor Express" "$SERVER_PID_FILE"
stop_pid_file "Vite" "$VITE_PID_FILE"

echo "Parando container do Postgres (delicias-postgres)..."
docker compose -f "$COMPOSE_FILE" stop

echo "Aplicação parada."
