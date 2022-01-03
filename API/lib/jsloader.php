<?php
header('Content-type: text/javascript');

$F = strip_tags($_GET['f']);
$F = base64_decode($F);
$F = "../" . $F;

$OBS = $_GET['obs'];

if($OBS == 1){
	
include "var.php";
require_once 'o/bin/wlJSO.php';

$config = new wlJSOConfig();            //create a configuration and fill its values
$config->DO_DECOY = true;
$config->DO_MINIFY = false;
$config->DO_LOCK_DOMAIN = true;
$config->DO_SCRAMBLE_VARS = true;
$config->ENCRYPTION_LEVEL = 1;
$config->SHOW_JS_LOCK_ALERTS = false;
$config->CACHE_LEVEL = 2;
$config->EXPIRATION_DATE = null;
$config->SHOW_WISELOOP_SIGNATURE = false;

$javaScriptCode .= file_get_contents($F);

$jso = new wlJSOProcessor();
$jso->init($javaScriptCode, $config);   //initialize the obfuscator considering the config and the JavaScript code

echo $obJs = $jso->get();

}else{

include "var.php";
include "minify.php";

ob_start("minify_js");
include_once($F);
ob_end_flush();

}
?>