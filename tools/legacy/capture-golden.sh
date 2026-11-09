#!/usr/bin/env bash
# tools/legacy/capture-golden.sh <dump.sql> <файл зі списком понеділків>
# Знімає еталони тижневого звіту зі стенду php:7.4-cli + mysql:5.7 (версії
# кафедрального сервера) на замороженій копії бази. Запускає ЛЮДИНА:
# правила розд. 7 забороняють агентові docker, а legacy-php/AGENTS.md – запуск звітів.
# Результат: apps/api/test/golden/room-week/<week>.input.json і <week>.csv.
set -euo pipefail
dump="$1"; weeks="$2"
root="$(git rev-parse --show-toplevel)"
out="$root/apps/api/test/golden/room-week"
net=roombook-golden
mkdir -p "$out"

docker network create "$net" >/dev/null 2>&1 || true
docker run -d --rm --name rb-golden-mysql --network "$net" \
  -e MYSQL_ROOT_PASSWORD=golden -e MYSQL_DATABASE=schedule mysql:5.7 \
  --character-set-server=cp1251 >/dev/null
trap 'docker rm -f rb-golden-mysql >/dev/null 2>&1; docker network rm "$net" >/dev/null 2>&1' EXIT
until docker exec rb-golden-mysql mysqladmin -uroot -pgolden ping --silent 2>/dev/null; do sleep 2; done
docker exec -i rb-golden-mysql mysql -uroot -pgolden schedule < "$dump"

cfg="$(mktemp -d)"
cat > "$cfg/db.local.php" <<'PHP'
<?php return array('host' => 'rb-golden-mysql', 'user' => 'root',
                   'password' => 'golden', 'database' => 'schedule');
PHP

while read -r week; do
  [ -z "$week" ] && continue
  # вхід: зайняті пари за аудиторіями (без порядку, як GROUP BY r.id)
  docker exec rb-golden-mysql mysql -uroot -pgolden schedule -N --default-character-set=utf8 -e "
    SELECT CONCAT('[', GROUP_CONCAT(JSON_OBJECT('name', name, 'pairs', pairs)), ']') FROM (
      SELECT r.name, COUNT(s.room_id) AS pairs FROM rooms r
      LEFT JOIN room_slots s ON s.room_id = r.id
       AND s.day >= '$week' AND s.day < DATE_ADD('$week', INTERVAL 5 DAY)
      GROUP BY r.id) t" > "$out/$week.input.json"
  # вихід: сам legacy-звіт, байти як є
  docker run --rm --network "$net" -v "$root/legacy-php:/app:ro" \
    -v "$cfg/db.local.php:/app/config/db.local.php:ro" php:7.4-cli \
    sh -c "docker-php-ext-install mysqli >/dev/null 2>&1; \
           php -r '\$_GET[\"week\"]=\"$week\"; include \"/app/reports/room_week.php\";'" \
    > "$out/$week.csv"
  echo "еталон $week: $(wc -c < "$out/$week.csv") байтів"
done < "$weeks"
