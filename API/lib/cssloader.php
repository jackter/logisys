<?php
$F = strip_tags($_GET['f']);
$F = base64_decode($F);
$F = "../" . $F;

include "var.php";
include "minify.php";

header('Content-type: text/css');
ob_start("minify_css");
include_once($F);
ob_end_flush();
?>