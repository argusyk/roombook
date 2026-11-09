-- Роль лише для читання для MCP-сервера roombook_db (розд. 8).
-- Виконує адміністратор бази; пароль – зі сховища секретів, не з репозиторію.
-- Таблиця "User" (персональні дані) ролі недоступна.
CREATE ROLE roombook_ro LOGIN
  PASSWORD '[пароль зі сховища секретів]';
GRANT CONNECT ON DATABASE roombook TO roombook_ro;
GRANT USAGE ON SCHEMA public TO roombook_ro;
GRANT SELECT ON "Room", "Booking", "BookingSeries", "ConsultationSlot"
  TO roombook_ro;
ALTER ROLE roombook_ro SET default_transaction_read_only = on;
ALTER ROLE roombook_ro SET statement_timeout = '5s';
