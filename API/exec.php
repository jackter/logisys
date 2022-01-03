<?php
require_once ("config.php");

if(!checkacs(600)){
	erroracs();
}

$Q = $_SERVER['REQUEST_URI'];
$Q = str_replace(PATH, "", $Q);
$Q = explode("/", $Q);

//=> Check Directory
if($Q[1] == "e"){
	
	//=> Get File Name
	$FILE	= $Q[sizeof($Q)-1];
			
	//=> Generate Directory
	$SEP = "/";
	$DIR = "";
	for($i = 2; $i < sizeof($Q)-1; $i++){
		$DIR .= $Q[$i] . $SEP;
	}
	
	//echo "lib/" . $DIR . $FILE . ".php";
	
	$GETFILE = "app/" . $DIR . $FILE . ".php";
	if(file_exists($GETFILE)){
		$_POST = cleanpost($_POST);
		include $GETFILE;
		//include "bot.php";
	}else{
		erroracs();
	}
	
	include "app/user_log.php";
	
	//include "lib/" . hbd($Q[2]) . ".php";
	//include "lib/" . $Q[2] . ".php";
}

$GLOBALS['mysql']->close();
?>