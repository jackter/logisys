<?php

/*if(
    $_SERVER['HTTP_HOST'] != "localhost" &&
    $_SERVER['HTTP_HOST'] != "myserver.com"
){
    error_reporting(0);
}*/
$DEVMODE = true;

set_time_limit(0);

//=> Set Default Timezone
date_default_timezone_set('Asia/Jakarta');

//=> Allow Origin
header('Access-Control-Allow-Origin: *');

if($_SERVER["REQUEST_METHOD"] == "OPTIONS"){
    
    //header('Access-Control-Allow-Methods: GET, PUT, POST, DELETE, OPTIONS');
    header("Access-Control-Allow-Headers: Content-Type");
    //header('Access-Control-Expose-Headers: X-Requested-With, Content-Type, State');
    //header('Access-Control-Allow-Credentials: True');

    //Just exit with 200 OK with the above headers for OPTIONS method
    exit(0);
}

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
$PATH = "cbi/app/logisys/API";
$HOST = "http://" . $_SERVER['HTTP_HOST'] . "/" . $PATH;

if($PATH != ""){
	define ("PATH", $PATH . "/");
}else{
	define ("PATH", "");	
}

$MAIN_PATH = "";
$MAIN_HOST = "";
define("MAIN_HOST", $MAIN_HOST);

/**
 * Ref Database
 */
$DB = array(
    'default'       => 'cbi_logisys',
    'master'        => 'cbi_master',
    'recon'         => 'cbi_finance'
);
define('DB', $DB);
//=> / : Ref Database

//=> Mysql Connections
$DB_U 			= "root";			//DB USER
$DB_P 			= "DevCBI";				//DB PASS
$DB_S 			= "10.9.120.120";		//DB SERVER
$DB_DEF 		= DB['default'];			//DB Name (Tanpa Prefix)

// $DB_U 			= "cbi";			//DB USER
// $DB_P 			= "CitraBorneo";				//DB PASS
// $DB_S 			= "10.10.10.11";		//DB SERVER
// $DB_DEF 		= DB['default'];			//DB Name (Tanpa Prefix)

//=> Include Files
include_once(LIBPATH . "/var.php");
include_once(CLASSPATH . "/db.class.php");
include_once(LIBPATH . "/list.php");

//=> Definer
define("ASecret", "+TeZAm*IZ+p&jaSB");

//=> Define Const
define('LOGINTIME', 60);
$Alamat = array(
    'alamat'    => 'Jl. H. Udan Said No. 47',
    'kel'       => 'Kel. Baru',
    'kota'      => 'Pangkalan Bun',
    'kab'       => 'Kab. Kotawaringin Barat',
    'prov'      => 'Kalimantan Tengah',
    'negara'    => 'Indonesia',
    'kodepos'   => 74113,
    'telp'      => '0532 21297',
    'fax'       => '0532 28258'
);
define('DEF_ALAMAT', $Alamat);

$Default = array(
    'clone'         => true,
    'company'       => 3,
    'company_abbr'  => "CBU",
    'company_nama'  => "PT Citra Borneo Utama",
    'prd_capacity'  => 2500000,
    'shift_total'   => 3,   // Total Shift Per day
    'dept'          => array(
        'refinery'      => array(
            'id'            => 29,
            'abbr'          => 'RFN',
            'nama'          => 'REFINERY'
        ),
        'fractionation' => array(
            'id'            => 30,
            'abbr'          => 'FRC',
            'nama'          => 'FRACTIONATION'
        )
    )
);
define("DEF", $Default);
?>