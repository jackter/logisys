<?php
require_once ("config.php");

/*echo DX::Strong("M092259");
echo "<br>";
echo DX::Strong("VT-client-epumxd2tcO2k5bpd");
echo "<br>";
echo DX::Strong("VT-server-cB_kpdp-waLcNV_Y99-c1JcM");

echo "<br>";*/
//echo DX::SDD("gzks0vwaI_QnNibC4YjxA6u8nn0SdxlIl-haB7pB4wY");

/*echo Base65Encode("http://192.168.1.101/startup/jaloka/API/mobile", "LY2XnLzd");
echo "<br>";
echo Base65Encode("http://192.1681.101/startup/jaloka/web", "PTmLTC2N");*/

//=> Generate Password
//$KEY = Core::GenPass("bc1", "erp4321");
$KEY = Core::GenPass("sukardi", "CBI2018");
echo $KEY . "<br>";

$KEY = Core::GenPass("cicik", "CBI2018");
echo $KEY . "<br>";

$KEY = Core::GenPass("niketutayuastini", "CBI2018");
echo $KEY . "<br>";

$KEY = Core::GenPass("handy", "CBI2018");
echo $KEY . "<br>";

$KEY = Core::GenPass("lina", "CBI2018");
echo $KEY . "<br>";

$KEY = Core::GenPass("padman_nambiar", "CBI2018");
echo $KEY . "<br>";

exit();

/*
//=> Development Sessions
$TIME = '2017-07-06 09:30:00';
$KEY = Core::GenPass("1:admin", $TIME);
$StateOptions = array(
	'key'			=> $KEY,
	'id'			=> 1,
	'username'		=> 'admin',
	'login_time'	=> $TIME,
	'expire_time'	=> '2020-12-30 23:59:59'
);
$StateOptions = DX::SDX(json_encode($StateOptions));

echo $StateOptions;
*/

//echo DX::SDX("sys_group");
//echo DX::SDD("ELQgquYjPEutmlGt5Dwjwha_ZSy36ELZ7UlkIjjRhhc");

//=> Perm JSON
/*$perm = array(
	array(
		'id'	=> 1,
		'text'	=> "View",
		'act'	=> "view",
	),
	array(
		'id'	=> 2,
		'text'	=> "Add",
		'act'	=> "add",
	),
	array(
		'id'	=> 3,
		'text'	=> "Edit",
		'act'	=> "edit",
	),
	array(
		'id'	=> 4,
		'text'	=> "Delete",
		'act'	=> "delete",
	),
	array(
		'id'	=> 5,
		'text'	=> "Verify",
		'act'	=> "verify",
	),
);
echo json_encode($perm);

echo "<br>";

//=> Module Permissions
$module = array(
	array(
		'mod'		=> 6,
		'perm'		=> '1,2,3,4,5'
	),
);
echo json_encode($module);*/
?>