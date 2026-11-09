<?php
// Тижнева завантаженість аудиторій. Вивантажується щопонеділка в Excel.
require_once dirname(__FILE__) . '/../db.php';
define('SLOTS_PER_WEEK', 40);                    // 8 пар x 5 днів

$week = $_GET['week'];                           // '2026-03-16', понеділок
$sql = "SELECT r.name, COUNT(s.room_id) AS pairs
        FROM rooms r
        LEFT JOIN room_slots s ON s.room_id = r.id
             AND s.day >= '" . $week . "'
             AND s.day < DATE_ADD('" . $week . "', INTERVAL 5 DAY)
        GROUP BY r.id
        ORDER BY r.name";
$res = mysqli_query($db, $sql);

header('Content-Type: text/csv; charset=windows-1251');
header('Content-Disposition: attachment; filename="room_week_'
       . $week . '.csv"');
echo "Аудиторія;Пар;Завантаженість, %\r\n";
while ($row = mysqli_fetch_assoc($res)) {
    $pct = round($row['pairs'] / SLOTS_PER_WEEK * 100);
    echo $row['name'] . ';' . $row['pairs'] . ';' . $pct . "\r\n";
}
