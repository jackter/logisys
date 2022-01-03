<?php
require_once ("config.php");

$Q = $_SERVER['REQUEST_URI'];
$Q = str_replace(PATH, "", $Q);
$Q = explode("/", $Q);

$FILE	= $Q[sizeof($Q)-2];

$Allowed = array();
if(DEV_MODE){
	$Allowed = array(
		$FILE
	);
}

if(!checkacs() && !in_array($FILE, $Allowed)){
	erroracs();
}

//=> Check Directory
if($Q[1] == "eq"){
	
	//=> Get File Name
	$FILE	= $Q[sizeof($Q)-2];
			
	//=> Generate Directory
	$SEP = "/";
	$DIR = "";
	for($i = 2; $i < sizeof($Q)-2; $i++){
		$DIR .= $Q[$i] . $SEP;
	}
	
	//echo "lib/" . $DIR . $FILE . ".php?" . $Q[sizeof($Q)-1];
	include "app/" . $DIR . $FILE . ".php";
	//include "lib/" . hbd($Q[2]) . ".php";
	//include "lib/" . $Q[2] . ".php";
}

$GLOBALS['mysql']->close();
?>