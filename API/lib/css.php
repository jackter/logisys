<?php
include "var.php";
include "minify.php";

header('Content-type: text/css');
ob_start("minify_css");
$path_to_css = "../" . THEMEPATH . "/" . $ActiveTheme . "/assets/css"; // edit path to css directory

function get_files($dir = '.', $sort = 0) {
	$files = scandir($dir, $sort);
	$files = array_diff($files, array('.', '..'));
	return $files;
}
$files = get_files($path_to_css, 0);

foreach($files as $file) {
	include($path_to_css . '/' . $file);
}
ob_end_flush();
?>