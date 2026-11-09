<?php
// Спільне підключення до бази звітів (MySQL schedule).
// База щоночі синхронізується з PostgreSQL RoomBook.
// Параметри підключення – у config/db.local.php (не в репозиторії, розд. 7);
// шаблон – config/db.local.php.example.
$config = require dirname(__FILE__) . '/config/db.local.php';
$db = mysqli_connect($config['host'], $config['user'], $config['password'],
                     $config['database']);
if (!$db) {
    die("Помилка підключення до бази");
}
mysqli_query($db, "SET NAMES cp1251");
