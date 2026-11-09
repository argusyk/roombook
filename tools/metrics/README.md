# tools/metrics – скрипти метрик впровадження (розд. 16, 18; додаток К)

Потрібні GitHub CLI (`gh`) з правом читання репозиторію і `jq`.
Числа, які ці скрипти дають на даних оповіді посібника, умовні.

## Мітки
- `agent` – PR, основну частину якого написав агент;
- `missed-by-review` – злитий PR, у якому пізніше знайшли дефект, що його мав помітити рецензент;
- `agent-ready`, `agent-running` (а також `agent-pr-open`, `agent-needs-info`) – стани issue нічного розбору;
- `codex-autofix`, `codex-draft` – чернетки PR від конвеєра.

## pr-metrics.sh – час до злиття і доопрацювання PR

```bash
tools/metrics/pr-metrics.sh argusyk/roombook 2027-02-01 2027-05-31 > pr-2027s.csv
```

| Стовпець | Тип | Зміст |
|---|---|---|
| `number` | ціле | номер PR |
| `created_at`, `merged_at` | дата й час UTC (ISO 8601) | створення і злиття PR |
| `hours_to_merge` | дійсне, 0,1 год | час від створення до злиття |
| `agent` | 0 або 1 | PR має мітку `agent` |
| `changes_requested` | ціле | кількість рев'ю зі статусом «потрібні зміни» |
| `missed_by_review` | 0 або 1 | PR має мітку `missed-by-review` |

Пошук GitHub повертає не більше 1000 результатів на запит: довгі періоди діліть на місяці.

## runs-to-csv.sh – метрики запусків агента

```bash
gh run download --name codex-autofix --dir runs/   # артефакти конвеєра за тиждень
tools/metrics/runs-to-csv.sh runs/ > runs.csv
```

Рядки метрик формує `tools/codex/summarize-run.sh`; у workflow `codex-autofix.yml`
вони лежать в артефакті як `metrics.jsonl`. Рядки `events.jsonl` (без полів `kind`
і `status`) фільтр відкидає.

| Стовпець | Тип | Зміст |
|---|---|---|
| `ts` | дата й час UTC | час формування рядка |
| `kind` | рядок | вид запуску: автофікс, рев'ю, нічний розбір |
| `sha` | рядок | коміт, для якого запущено агента (`local` для локального запуску) |
| `status` | рядок | статус зі звіту агента або `no-report` |
| `duration_s` | ціле | тривалість запуску в секундах |
| `items`, `turns`, `errors` | ціле | кількість елементів, завершених ходів і подій `error` у журналі |

`fixtures/` – умовний артефакт для перевірки скрипта в CI.
