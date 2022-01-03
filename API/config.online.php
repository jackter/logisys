<?php

/*if(
    $_SERVER['HTTP_HOST'] != "localhost" &&
    $_SERVER['HTTP_HOST'] != "myserver.com"
){
    error_reporting(0);
}*/
$DEVMODE = true;

//=> Set Default Timezone
date_default_timezone_set('Asia/Jakarta');

//=> Allow Origin
header('Access-Control-Allow-Origin: *');

//=> Sessions Destinations
//session_save_path("sessions");

//=> START SESSION
session_start();

//=> Define LIB
define('ROOTPATH', dirname(__FILE__));
define('LIBPATH', "lib");
define('CLASSPATH', LIBPATH . "/class");

define('HTMLDOM', LIBPATH . "/htdom.php");

define('DEV_MODE', $DEVMODE);

if(DEV_MODE){
    //error_reporting(E_ALL ^ (E_NOTICE | E_WARNING | E_DEPRECATED | E_STRICT));
    error_reporting(E_ALL ^ (E_NOTICE | E_DEPRECATED | E_STRICT));
}else{
    error_reporting(0);
}

define('MAIN_DIR', '../api/');

//=> Host and Path
$PATH = "kaber";
$HOST = "https://api.citraborneoutama.co.id/" . $PATH;

if($PATH != ""){
	define ("PATH", $PATH . "/");
}else{
	define ("PATH", "");	
}

$MAIN_PATH = "";
$MAIN_HOST = "";
define("MAIN_HOST", $MAIN_HOST);

//=> Mysql Connections
$DB_U 			= "citraborneoutama_def";			//DB USER
$DB_P 			= "U=KxXu*LwjH%";				//DB PASS
$DB_S 			= "localhost";		//DB SERVER
$DB_DEF 		= "citraborneoutama_kaber";			//DB Name (Tanpa Prefix)

//=> Include Files
include_once(LIBPATH . "/var.php");
include_once(LIBPATH . "/list.php");

//=> Definer
define("ASecret", "+TeZAm*IZ+p&jaSB");

//=> Define Const
define('PROPINSI', 'MALUKU UTARA');
define('KABKOTA', 'PULAU MOROTAI');

define('LOGINTIME', 60);

?>