<?php
// Спільне підключення до бази звітів (MySQL schedule).
// База щоночі синхронізується з PostgreSQL RoomBook.
$db = mysqli_connect("localhost", "report", "report", "schedule");
if (!$db) {
    die("Помилка підключення до бази");
}
mysqli_query($db, "SET NAMES cp1251");
