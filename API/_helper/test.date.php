<?php
$Tanggal = "2020-07-01";
$PrevDate = date("Y-m-d", strtotime($Tanggal) - (time() - strtotime("-1 days")));

// echo strtotime($Tanggal) . " - " . strtotime();
echo $PrevDate;
?>