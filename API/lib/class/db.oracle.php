<?php
error_reporting(E_ALL ^ (E_NOTICE | E_WARNING | E_DEPRECATED | E_STRICT)); 

$OraConfig = array(
	'db'		=> 'DBDEF',
	'username'	=> 'EPMS_TRXI', 
	'password'	=> 'EPLANTTRXI2014'
);

$GLOBALS['oracle'] = new ORACLE();

$GLOBALS['oracle']->Connect($OraConfig['db'], $OraConfig['username'], $OraConfig['password']);

$GLOBALS['oracle']->SetFetchMode(OCI_ASSOC);
$GLOBALS['oracle']->SetAutoCommit(true);
?>