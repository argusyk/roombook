<?php
// Семестрова завантаженість аудиторії: заняття за розкладом.
require_once dirname(__FILE__) . '/../db.php';

$room = $_GET['room'];
$res = mysqli_query($db,
    "SELECT day, pair, subject FROM lessons WHERE room='" . $room . "'");
echo "<h1>Аудиторія " . $room . "</h1>";
echo "<table border=1><tr><th>День</th><th>Пара</th></tr>";
while ($row = mysqli_fetch_assoc($res)) {
    echo "<tr><td>" . $row['day'] . "</td><td>" . $row['pair']
        . "</td></tr>";
}
echo "</table>";
