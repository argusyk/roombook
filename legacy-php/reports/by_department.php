<?php
// Зведення занять за кафедрами (містить прізвища викладачів – не для публікації).
require_once dirname(__FILE__) . '/../db.php';

$from = $_GET['from'];
$to = $_GET['to'];
$res = mysqli_query($db,
    "SELECT d.title, t.surname, COUNT(*) AS lessons
     FROM lessons l
     JOIN teachers t ON t.id = l.teacher_id
     JOIN departments d ON d.id = t.department_id
     WHERE l.day >= '" . $from . "' AND l.day <= '" . $to . "'
     GROUP BY d.id, t.id
     ORDER BY d.title, t.surname");
echo "<table border=1><tr><th>Кафедра</th><th>Викладач</th><th>Занять</th></tr>";
while ($row = mysqli_fetch_assoc($res)) {
    echo "<tr><td>" . $row['title'] . "</td><td>" . $row['surname']
        . "</td><td>" . $row['lessons'] . "</td></tr>";
}
echo "</table>";
