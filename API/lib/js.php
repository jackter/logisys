<?php
header('Content-type: text/javascript');

$OBS = $_GET['obs'];

if($OBS == 1){

include "var.php";
require_once 'o/bin/wlJSO.php';

$config = new wlJSOConfig();            //create a configuration and fill its values
$config->DO_DECOY = true;
$config->DO_MINIFY = false;
$config->DO_LOCK_DOMAIN = true;
$config->DO_SCRAMBLE_VARS = true;
$config->ENCRYPTION_LEVEL = 2;
$config->SHOW_JS_LOCK_ALERTS = false;
$config->CACHE_LEVEL = 2;
$config->EXPIRATION_DATE = null;
$config->SHOW_WISELOOP_SIGNATURE = false;

$path_to_js = "../" . THEMEPATH . "/" . $ActiveTheme . "/assets/js"; // edit path to js directory

function get_files($dir = '.', $sort = 0) {
	$files = scandir($dir, $sort);
	$files = array_diff($files, array('.', '..'));
	return $files;
}
$files = get_files($path_to_js, 0);

$javaScriptCode = '';
foreach($files as $file) {
	//include_once($path_to_js . '/' . $file);
	$javaScriptCode .= file_get_contents($path_to_js . "/" . $file);
}

$jso = new wlJSOProcessor();
$jso->init($javaScriptCode, $config);   //initialize the obfuscator considering the config and the JavaScript code

echo $obJs = $jso->get();

}else{

include "var.php";
include "minify.php";
ob_start("minify_js");
//ob_start("");
$path_to_js = "../" . THEMEPATH . "/" . $ActiveTheme . "/assets/js"; // edit path to js directory

function get_files($dir = '.', $sort = 0) {
	$files = scandir($dir, $sort);
	$files = array_diff($files, array('.', '..'));
	return $files;
}
$files = get_files($path_to_js, 0);

$js = '';
foreach($files as $file) {
	include_once($path_to_js . '/' . $file);
}
ob_end_flush();

}
?>