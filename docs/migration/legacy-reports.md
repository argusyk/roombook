# Інвентаризація legacy-звітів

Звіти legacy-php читають MySQL `schedule` (таблиці `rooms`, `room_slots`, `lessons`, …),
яку щоночі синхронізують з PostgreSQL RoomBook. Синхронізація діє, доки не
вимкнено останній звіт.

| Звіт | Файл | Стан |
|---|---|---|
| Тижнева завантаженість | `legacy-php/reports/room_week.php` (видалено; остання версія – тег `legacy-room-week-final`) | перенесено в `apps/api` (розд. 11), режим `new` |
| Семестрова завантаженість | `legacy-php/reports/semester.php` | у черзі |
| Зведення за кафедрами | `legacy-php/reports/by_department.php` | у черзі; містить прізвища викладачів – еталони поза репозиторієм |

## room_week

- **SQL:** `SELECT r.name, COUNT(s.room_id) AS pairs FROM rooms r LEFT JOIN room_slots s
  ON s.room_id = r.id AND s.day >= '<week>' AND s.day < DATE_ADD('<week>', INTERVAL 5 DAY)
  GROUP BY r.id ORDER BY r.name`. Параметр `week` підставляється конкатенацією (SQL-ін'єкція).
- **Колонки виходу:** `Аудиторія;Пар;Завантаженість, %`.
- **Кодування:** cp1251 (файл збережено в cp1251, `db.php` виконує `SET NAMES cp1251`).
- **Роздільник:** `;`, **кінці рядків:** CRLF, заголовок – перший рядок, без BOM.
- **Округлення:** `round($pairs / SLOTS_PER_WEEK * 100)`, `SLOTS_PER_WEEK = 40` (8 пар × 5 днів);
  PHP `round()` округлює половини від нуля після попереднього округлення до 15 значущих
  цифр: 23 пари → 58 (а `Math.round(23 / 40 * 100)` у JavaScript дає 57).
- **Сортування:** `ORDER BY r.name` (у новому коді – явний `Intl.Collator("uk")`).
- **Аудиторія без занять:** присутня з нулем (`LEFT JOIN`).
- **Відповідь:** `Content-Type: text/csv; charset=windows-1251`,
  `Content-Disposition: attachment; filename="room_week_<week>.csv"`.

## Нова реалізація

- `apps/api/src/reports/room-week.ts`: `buildRoomWeek` (чиста функція, еталони),
  `loadRoomWeek` (PostgreSQL, представлення `room_slot`), `toLegacyCsv` (байти cp1251).
- `room_slot` – представлення над `Booking`, яке повторює форму legacy-таблиці
  `room_slots` (міграція `room_slot_view`).
- Маршрути: `GET /reports/room-week?week=` і фасад `GET /legacy/reports/room_week.php`
  з `REPORTS_ROOM_WEEK_MODE` = `legacy` | `shadow` | `new`.
- Еталони: `apps/api/test/golden/room-week/` (96 тижнів). У цьому навчальному
  репозиторії вони синтетичні (`tools/legacy/synth-golden.py`); на кафедрі їх знімає
  людина скриптом `tools/legacy/capture-golden.sh`.
