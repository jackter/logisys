<?php
$ServerName 	= "localhost\DB16";
$ConnInfo		= array(
	"Database"		=> "cibis_inventory",
	"UID"			=> "cbi",
	"PWD"			=> "citraborneoindah"
);

$Conn = sqlsrv_connect($ServerName, $ConnInfo);
if($Conn){
	echo "Koneksi Sukses";
}else{
	echo "Koneksi MSSQL Gagal<hr>";
	die(print_r(sqlsrv_errors(), true));
}
?>