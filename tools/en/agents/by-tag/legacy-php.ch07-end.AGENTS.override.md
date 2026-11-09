<!-- English override of legacy-php/AGENTS.md for readers of the English edition
     of "Developing with Codex". Installed as legacy-php/AGENTS.override.md by
     tools/en/use-english-agents.sh; mirrors legacy-php/AGENTS.md at ch07-end..ch10-end.
     Source: tools/en/agents/by-tag/legacy-php.ch07-end.AGENTS.override.md -->
# legacy-php: careful, code without tests

Old room occupancy reports (PHP 5 style, mysqli, no tests).
The department still uses them every month. The behavior must not change.

Reply to the user in English. The report headers and comments here are in
Ukrainian (cp1251); do not translate them.

## Rules
- By default, only read here. Change files only when the task
  explicitly names legacy-php.
- Do not refactor or modernize the code in passing. Without tests, every edit
  may change the numbers in the reports, and no one will notice.
- Do not run the report scripts: they connect to the production MySQL database.
- Before any behavior change, first propose a characterization
  test that pins the current report output.
- Do not move logic into apps/api without a separate migration task.
- Before any deletion - a dry run (`git rm -n`, `git clean -n`);
  show the list to a human.
- The MySQL parameters are in config/db.local.php (outside git). Do not read
  or copy this file; data exports are in ~/roombook-data/legacy-exports/.

## How to read the code
- Entry points are in legacy-php/reports/, the shared DB connection
  is in db.php.
- The SQL here is built by string concatenation. Do not copy this style into
  new code.
