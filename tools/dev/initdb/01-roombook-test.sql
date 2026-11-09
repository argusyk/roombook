-- Виконується один раз під час створення тому бази (docker-compose).
-- Окрема база для інтеграційних тестів: test:int очищає таблиці перед кожним тестом.
CREATE DATABASE roombook_test OWNER roombook;
