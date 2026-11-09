# @roombook/mcp-db

MCP-сервер `roombook_db` (stdio) з двома інструментами лише для читання:
`list_tables` і `query` (один SELECT у транзакції READ ONLY, не більше 200 рядків).

```bash
pnpm --filter @roombook/mcp-db build
ROOMBOOK_RO_URL=postgresql://roombook_ro:...@localhost:5432/roombook \
  node packages/mcp-db/dist/server.js
```

- Рядок підключення `ROOMBOOK_RO_URL` – лише в оточенні користувача, не в репозиторії.
- Роль бази `roombook_ro` створює адміністратор за `sql/roombook_ro.sql`.
- Сервер запускаємо напряму через `node`, а не `pnpm start`: pnpm друкує у stdout
  власний заголовок, а stdout належить протоколу MCP. Діагностика – лише в stderr.
- Підключення до Codex – `[mcp_servers.roombook_db]` у `.codex/config.toml`.
