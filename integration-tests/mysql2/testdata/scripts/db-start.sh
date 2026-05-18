#!/usr/bin/env bash
set -euo pipefail

CONTAINER_ID=$(docker run -d --name mysql-test \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=test \
  -p 3306:3306 \
  -v ./testdata/sql:/docker-entrypoint-initdb.d \
  --health-cmd="mysql -u root -proot test -e 'SELECT 1'" \
  --health-interval=2s \
  --health-retries=10 \
  mysql:8)

echo "Started container $CONTAINER_ID"
echo "Waiting for mysql-test to become healthy..."

until [ "$(docker inspect -f '{{.State.Health.Status}}' "$CONTAINER_ID")" = "healthy" ]; do
  sleep 1
done

echo "mysql-test is healthy"