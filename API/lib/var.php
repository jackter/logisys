<?php
$DB_DB 			= $DB_DEF;

//=> Variables
$ActiveTheme	= false;

//=> Definers
define ("HOST", $HOST);
define ("DBDEF", $DB_DEF);
define ("ActiveTheme", $ActiveTheme);

define('THEMEPATH', "themes");
define('MODULE', "modules");
define ("GO_TPL", THEMEPATH . "/" . $ActiveTheme);

define("PAY_URL", "https://api.sandbox.midtrans.com/v2");
define("PAY_ID", "M092259");
define("PAY_CLIENT_KEY", "VT-client-epumxd2tcO2k5bpd");
define("PAY_SERVER_KEY", "VT-server-cB_kpdp-waLcNV_Y99-c1JcM");
//define("PAY_ID", DX::Destrong("hTs1Y2sxy5D8w4vEbSZaOXesMdyv768nt1R1SEiY-qc"));
//define("PAY_CLIENT_KEY", DX::Destrong("3-RWa9lxtYt1Bm4ao5oGTZ8rCuRcfHwDlxvAFX-0uw0"));
//define("PAY_SERVER_KEY", DX::Destrong("JuMm7wOFI34l8BVf8Ry4q47uu3xBUYU7-nuTxH_ebjfpRkFL2DBB3eKp9edOYN5Yd1syuaYQYSDNNG6L7Em0ag"));

?>