<?php
function grs($length = 10) {
    $characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    $charactersLength = strlen($characters);
    $randomString = '';
    for ($i = 0; $i < $length; $i++) {
        $randomString .= $characters[rand(0, $charactersLength - 1)];
    }
    return $randomString;
}
function hed($TEXT){
	$H = rand(25, 30);
	$TEXT = base64_encode($TEXT);
	$TEXT = str_replace("=", "", $TEXT);
	//$TEXT = sdx($TEXT);
	$TEXT = substr($TEXT, 5) . substr($TEXT, 0, 5);	
	$TEXT = grs($H) . $TEXT;
	$TEXT = substr($TEXT, 0, 4) . $H . substr($TEXT, 4);
	
	return $TEXT;
}
function hbdn($KEY){
	//=> Get Key
	$GKEY = substr($KEY, 4, 2);
	$TEXT = substr($KEY, $GKEY+2);
	$TEXT = substr($TEXT, -5) . substr($TEXT, 0, strlen($TEXT)-5);
	$TEXT = base64_decode($TEXT);
	return $TEXT;
}
function erroracs(){
header('HTTP/1.0 404 Not Found', true, 404);
	?>
    
<!DOCTYPE html>
<html lang=en>
  <meta charset=utf-8>
  <meta name=viewport content="initial-scale=1, minimum-scale=1, width=device-width">
  <link href="//www.google.com/images/branding/product/ico/googleg_lodp.ico" rel="shortcut icon">
  <title>Error 404 (Not Found)!!1</title>
  <style>
    *{margin:0;padding:0}html,code{font:15px/22px arial,sans-serif}html{background:#fff;color:#222;padding:15px}body{margin:7% auto 0;max-width:390px;min-height:180px;padding:30px 0 15px}* > body{background:url(//www.google.com/images/errors/robot.png) 100% 5px no-repeat;padding-right:205px}p{margin:11px 0 22px;overflow:hidden}ins{color:#777;text-decoration:none}a img{border:0}@media screen and (max-width:772px){body{background:none;margin-top:0;max-width:none;padding-right:0}}#logo{background:url(//www.google.com/images/branding/googlelogo/1x/googlelogo_color_150x54dp.png) no-repeat;margin-left:-5px}@media only screen and (min-resolution:192dpi){#logo{background:url(//www.google.com/images/branding/googlelogo/2x/googlelogo_color_150x54dp.png) no-repeat 0% 0%/100% 100%;-moz-border-image:url(//www.google.com/images/branding/googlelogo/2x/googlelogo_color_150x54dp.png) 0}}@media only screen and (-webkit-min-device-pixel-ratio:2){#logo{background:url(//www.google.com/images/branding/googlelogo/2x/googlelogo_color_150x54dp.png) no-repeat;-webkit-background-size:100% 100%}}#logo{display:inline-block;height:54px;width:150px}
  </style>
  <a href=//www.google.com/><span id=logo aria-label=Google></span></a>
  <p><b>404.</b> <ins>That's an error.</ins>
  <p>The requested URL <code><?=$_SERVER['REQUEST_URI']?></code> was not found on this server.  <ins>That's all we know.</ins>

    <?php
	exit();
}
function acskey(){
	$HEADER = $_SERVER["CONTENT_TYPE"];
	$HEADER = explode(";", $HEADER);
	//$HEADER = explode("/", $HEADER[1]);
	$APPX = $HEADER[1];
	$APPX = substr($APPX, 0, 8) . substr($APPX, -8);
	
	return $APPX;
}
function checkacs($DEF = 300){
	
	$HEADER = $_SERVER["CONTENT_TYPE"];
	$HEADER = explode(";", $HEADER);
	//$HEADER = explode("/", $HEADER[1]);
	$APPX = $HEADER[1];
	
	$R = false;
	//if((hbdn($_POST['d']) + $DEF) > time() && isset($_POST['d'])){
	if(((int)hbdn($APPX) + $DEF) > time() && isset($APPX)){
		$R = true;
	}
	return $R;
}
function cleanpost($DATA){
	$return = [];
	
	foreach($DATA as $KEY => $VAL){	
    
		$VAL = urldecode($VAL);
	
		//=> Check Not Encrypt Value
        $ISI = Base65Decode($VAL, acskey());
		if(substr($VAL, 0, 5) == "NE---"){
            //$VAL = htmlspecialchars($VAL, ENT_NOQUOTES, "UTF-8");
			$ISI = str_replace("NE---", "", $VAL);
        }
    
        $RKey = Base65Decode($KEY, acskey());
        //echo $RKey . ": " . $ISI . "-" . $VAL . "\n";
		$return[$RKey] = $ISI;
	}
	
	return $return;
}

//GENERATE SYNCID
function SYNCID($DB, $TABLE){
	$Q_SYNC = DB_QUERY_ON($DB, $TABLE, "ORDER BY id DESC");
	$R_SYNC = DB_ROWS($Q_SYNC);
	
	if($R_SYNC > 0){
		$SYNC = DB_RESULT($Q_SYNC);
		$SYNC = $SYNC['syid'] + 1;
	}else{
		$SYNC = 1;
	}
	
	return $SYNC;
}

//rupiah
function rupiah($source){
	$masterShow = number_format($source, 0, ",", ".");
	return $masterShow;
}
//decimal
function decimal($source, $decimal = 2){
    $masterShow = number_format($source, $decimal, ",", ".");
    
    if((int)substr($masterShow, -2) <= 0){
        $masterShow = number_format($source, 0, ",", ".");
    }

	return $masterShow;
}
//decimal
function decimalcount($source, $decimal = 2){
	$masterShow = number_format($source, $decimal, ".", "");
	return $masterShow;
}
//DOLLAR
function clean_usd($source){
	$source = str_replace(".", "", $source);
	$LEN = strlen($source);
	$DECIMAL = substr($source, -2);
	$AMOUNT = substr($source, 0, ($LEN - 2));
	
	$masterShow = $AMOUNT . "." . $DECIMAL;
	//$masterShow = number_format($source, 2, ".", "");
	return $masterShow;
}
function usd($source){
	$masterShow = number_format($source, 2, ".", ",");
	return $masterShow;
}

function db_fail($data = ""){
/*?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
<title>Koneksi gagal</title>
<style type="text/css">
<!--
body {
	background: #FFC4C4;
}
-->
</style>
</head>

<body>
<div align="center">
<div align="left" style="width:50%">
	<h1 style="color:#990000" align="center">
	<?php
		if($data == "conn"){
		?>
		Gagal Menghubungkan Ke Database
		<?php
		}else{
		?>
		Database Tidak Ditemukan
		<?php
		}
	?>
	</h1>
	<p>
		<i style="font-weight:bold">Solusi :</i>
		<ul style="list-style:square">
			<li>Pastikan database telah diatur sesuai ketentuan</li>
			<li>Nama database harus sama dengan struktur yang berada di MySQL</li>
			<li>Perhatikan lagi file konfigurasi dan sesuaikan dengan ketentuan yang ada</li>
			<li>Pastikan MySQL server telah dijalankan</li>
			<li>Silahkan periksa lagi struktur database</li>
		</ul>
	</p>
</div>
</div>
</body>
</html>

<?php*/
}

//DATABASE ERROR
function db_error(){
	$content = "
		<div align='center' style='color:#ff0000'>
			<p><b>Terjadi permasalahan dalam database.</b></p>
			<p>Mohon maaf atas ketidaknyamanan ini dan kami akan segera memperbaikinya demi kenyamanan anda</p>
			<p><a href='#'>Klik disini untuk menghubungi webmaster</a></p>
			<p>Terima Kasih</p>
		</div>
	";
	
	return $content;
}

//MAKE THUMBNAIL IMAGES
function makeThumb($file,$thumb_dir,$new_name="",$resize="10",$new_width="110",$new_height="110"){

	// get file info
	$size = getimagesize($file);
	$width = $size[0];
	$height = $size[1];
	
	if(!$new_name){
		$filename = basename($file);
	}else{
		$filename = $new_name;
	}
	
	// new size
	if($resize){
		$new_w = ($width*($resize/100));
		$new_h = ($height*($resize/100));
	}else{
		// tentuin new width and height
		$new_w = $new_width;
		$new_h = $new_height;

		if($width>=$height){
			$stat="hor";
		}elseif($width<=$height){
			$stat="ver";
		}
		
		if($stat=="hor"){
			$new_h=$height*$new_w/$width;
		}elseif($stat=="ver"){
			$new_w=$width*$new_h/$height;
		}
		
	}
	
	// ayo menggambar
	//$src_img = imagecreatefromjpeg($file);
	
	$dst_img = imagecreatetruecolor($new_w,$new_h);
	
	//check type file
	if (preg_match("/png/", $file)) {
		@imagecolortransparent($dst_img, @imagecolorallocate($dst_img, 0, 0, 0));
		@imagealphablending($dst_img, false);
		@imagesavealpha($dst_img, true);
		$src_img = imagecreatefrompng($file);
	} elseif (preg_match("/jpg|jpeg/", $file)) {
		$src_img = imagecreatefromjpeg($file);
	} elseif (preg_match("/gif/", $file)) {
		@imagecolortransparent($dst_img, @imagecolorallocate($dst_img, 0, 0, 0));
		$src_img = imagecreatefromgif($file);
	}

	
	//$dst_img = imagecreatetruecolor($new_w,$new_h);
	imagecopyresampled($dst_img, $src_img, 0, 0, 0, 0, $new_w, $new_h, $width, $height);
	//imagejpeg($dst_img,$thumb_dir.$filename,100);

	if (preg_match("/png/", $file)) {
		imagepng($dst_img, $thumb_dir.$filename); // output png image to file
	} elseif (preg_match("/jpg|jpeg/", $file)) {
		imagejpeg($dst_img, $thumb_dir.$filename, 100); // output jpg image to file
	} elseif (preg_match("/gif/", $file)) {
		imagegif($dst_img, $thumb_dir.$filename); // output gif file to file
	}

	// bersihin sampah memori
	imagedestroy($src_img);
	imagedestroy($dst_img);
}


function title($data){
	//FOR TITLE
	/*$title = str_replace("/", "", $data);
	$title = str_replace("'", "", $title);
	$title = str_replace("\"", "", $title);
	$title = str_replace(",", "", $title);
	$title = str_replace(".", "", $title);
	$title = str_replace(":", "", $title);
	$title = str_replace("\"", "", $title);
	$title = str_replace(")", "", $title);
	$title = str_replace("(", "", $title);				
	$title = str_replace(" ", "-", $title);
	$title = str_replace("__", "-", $title);
	$title = str_replace("|", "-", $title);
	$title = str_replace("___", "-", $title);
	$title = str_replace("-", "-", $title);
	$title = str_replace("?", "-", $title);
	$title = str_replace("!", "-", $title);
	$title = strtolower($title);*/
    
    $title = strtolower($data);
    $title = preg_replace('/[^A-Za-z0-9-]+/', ' ', $title);
    $title = preg_replace('/\s+/', ' ', trim($title));
    $title = preg_replace('/[^A-Za-z0-9-]+/', '-', $title);
		
	return $title;
}

function SetTitle($str, $delimiter = '-') {
	$clean = iconv('UTF-8', 'ASCII//TRANSLIT', $str);
	$clean = preg_replace("/[^a-zA-Z0-9\/_|+ -]/", '', $clean);
	$clean = strtolower(trim($clean, '-'));
	$clean = preg_replace("/[\/_|+ -]+/", $delimiter, $clean);

	return $clean;
}

function title_back($data){

	$title = str_replace("-", " ", $data);
	
	return $title;

}

function myurl($data){
	
	//FOR URL
	$myurl = str_replace("http://", "", $data);
	$myurl = str_replace("www.", "", $myurl);
	$myurl = str_replace("/", "_", $myurl);
	$myurl = str_replace(".", "__", $myurl);
	$myurl = str_replace("?", "___", $myurl);
	
	return $myurl;
	
}

function myurl_back($data){
	//FOR URL
	$myurl = str_replace("___", "?", $data);
	$myurl = str_replace("__", ".", $data);
	$myurl = str_replace("_", "/", $myurl);
	
	return $myurl;
}

//SPECIAL CHARS
function SC($char){
	$html = str_replace("/", "%2F", $char);
	$html = str_replace(":", "%3A", $html);
	$html = str_replace("&", "&amp;", $html);
	
	return $html;
}

//DATE STATEMENT
//STATEMENT TANGGAL
function date_db($full_date){
	if($full_date != '0000-00-00'){
		$date = explode("-", $full_date);
		
		$tahun 		= $date[0];
		//$bulan 		= din_bulanIndo_full($date[1]);
		$bulan 		= din_bulanIndo_full($date[1]);
		$tanggal 	= $date[2];
		
		return $tanggal . " " . $bulan . " " . $tahun;
		//return date("l, d F, Y", strtotime($full_date));
		//return date("d F, Y", strtotime($full_date));
	}
	
}
function datetime_db($full_date){
	if($full_date != '0000-00-00 00:00:00'){
		$date = explode(" ", $full_date);
		$date = explode("-", $date[0]);
		
		$hari		= din_hariIndo(date("D", strtotime($full_date)));
		$tahun 		= $date[0];
		$bulan 		= din_bulanIndo_full($date[1]);
		//$bulan 		= din_bulanIndo($date[1]);
		$tanggal 	= $date[2];
		
		return $hari . ", " . $tanggal . " " . $bulan . " " . $tahun . " " . date("H:i", strtotime($full_date)) . " WIB";
		//return date("l, d F, Y", strtotime($full_date));
		//return date("d F, Y", strtotime($full_date));
	}
	
}
function datetime_db_en($full_date){
	if($full_date != '0000-00-00 00:00:00'){
		$date = explode(" ", $full_date);
		$date = explode("-", $date[0]);
		
		$hari		= din_hariEn(date("D", strtotime($full_date)));
		$tahun 		= $date[0];
		$bulan 		= din_bulanEn_full($date[1]);
		//$bulan 		= din_bulanIndo($date[1]);
		$tanggal 	= $date[2];
		
		return $hari . ", " . $bulan . " " . $tanggal . ", " . $tahun . " - " . date("H:i", strtotime($full_date)) . " WIB";
		//return date("l, d F, Y", strtotime($full_date));
		//return date("d F, Y", strtotime($full_date));
	}
	
}
function date_std($full_date){
	if($full_date != '0000-00-00'){
		$date = explode("-", $full_date);
		
		$tahun 		= $date[0];
		//$bulan 		= din_bulanIndo_full($date[1]);
		$bulan 		= din_bulanIndo($date[1]);
		$tanggal 	= $date[2];
		
		//return $tanggal . " " . $bulan . " " . $tahun;
		return date('d/m/Y', strtotime($full_date));
		//return date("l, d F, Y", strtotime($full_date));
		//return date("d F, Y", strtotime($full_date));
	}
	
}
function date_string(){
	$STRING[]	= "686e49264b4c4f49574d602a4d2c787780757577907d8d8a8";
	$STRING[]	= "f40625c7f746b6c4d5b8f8850486d6e716b796f824c585454";
	$STRING[]	= "747891907d805679755e7e829b9a879769c1b4adb5bfafbea";
	$STRING[]	= "dadb9beafb7769892b5aaa1a28391d9bdcacdc5d7c7c1cccf";
	$STRING[]	= "8684a4cc9b86cdd4d7d1dea999d1d9deead7ea9bb8c9f5ebf";
	$STRING[]	= "2dfedefa2c1f3f2f8f7f8f8c6b5f4b9ccaccbf10af708b8bf";
	$STRING[]	= "cd153237";
	return $STRING;
}
function bulanIndo(){
     $bulan = date(m, time());

     if($bulan=="01"){
       $bulan = "Jan";
     } else if($bulan=="02"){
       $bulan = "Feb";
     } else if($bulan=="03"){
       $bulan = "Mar";
     } else if($bulan=="04"){
       $bulan = "Apr";
     } else if($bulan=="05"){
       $bulan = "Mei";
     } else if($bulan=="06"){
       $bulan = "Jun";
     } else if($bulan=="07"){
       $bulan = "Jul";
     } else if($bulan=="08"){
       $bulan = "Ags";
     } else if($bulan=="09"){
       $bulan = "Sep";
     } else if($bulan=="10"){
       $bulan = "Okt";
     } else if($bulan=="11"){
       $bulan = "Nov";
     } else if($bulan=="12"){
       $bulan = "Des";
     }

	 return $bulan;

}

function din_bulanIndo($data){
     $bulan = $data;


     if($bulan=='01'){
       $bulan = "Jan";
     } elseif($bulan=='02'){
       $bulan = "Feb";
     } elseif($bulan=='03'){
       $bulan = "Mar";
     } elseif($bulan=='04'){
       $bulan = "Apr";
     } elseif($bulan=='05'){
       $bulan = "Mei";
     } elseif($bulan=='06'){
       $bulan = "Jun";
     } elseif($bulan=='07'){
       $bulan = "Jul";
     } elseif($bulan=='08'){
       $bulan = "Agu";
     } elseif($bulan=='09'){
       $bulan = "Sep";
     } elseif($bulan=='10'){
       $bulan = "Okt";
     } elseif($bulan=='11'){
       $bulan = "Nov";
     } elseif($bulan=='12'){
       $bulan = "Des";
     }

	 return $bulan;

}

function din_bulanIndo_full($data){
     $bulan = $data;

     if($bulan=='01'){
       $bulan = "Januari";
     } elseif($bulan=='02'){
       $bulan = "Februari";
     } elseif($bulan=='03'){
       $bulan = "Maret";
     } elseif($bulan=='04'){
       $bulan = "April";
     } elseif($bulan=='05'){
       $bulan = "Mei";
     } elseif($bulan=='06'){
       $bulan = "Juni";
     } elseif($bulan=='07'){
       $bulan = "Juli";
     } elseif($bulan=='08'){
       $bulan = "Agustus";
     } elseif($bulan=='09'){
       $bulan = "September";
     } elseif($bulan=='10'){
       $bulan = "Oktober";
     } elseif($bulan=='11'){
       $bulan = "November";
     } elseif($bulan=='12'){
       $bulan = "Desember";
     }

	 return $bulan;

}

function din_bulanEn_full($data){
    $bulan = $data;

    if($bulan=='01'){
      $bulan = "January";
    } elseif($bulan=='02'){
      $bulan = "February";
    } elseif($bulan=='03'){
      $bulan = "March";
    } elseif($bulan=='04'){
      $bulan = "April";
    } elseif($bulan=='05'){
      $bulan = "May";
    } elseif($bulan=='06'){
      $bulan = "June";
    } elseif($bulan=='07'){
      $bulan = "July";
    } elseif($bulan=='08'){
      $bulan = "August";
    } elseif($bulan=='09'){
      $bulan = "September";
    } elseif($bulan=='10'){
      $bulan = "October";
    } elseif($bulan=='11'){
      $bulan = "November";
    } elseif($bulan=='12'){
      $bulan = "December";
    }

    return $bulan;

}

function din_bulanEN($data){
     $bulan = $data;

     if($bulan=="01"){
       $bulan = "Jan";
     } else if($bulan=="02"){
       $bulan = "Feb";
     } else if($bulan=="03"){
       $bulan = "Mar";
     } else if($bulan=="04"){
       $bulan = "Apr";
     } else if($bulan=="05"){
       $bulan = "May";
     } else if($bulan=="06"){
       $bulan = "Jun";
     } else if($bulan=="07"){
       $bulan = "Jul";
     } else if($bulan=="08"){
       $bulan = "Aug";
     } else if($bulan=="09"){
       $bulan = "Sep";
     } else if($bulan=="10"){
       $bulan = "Oct";
     } else if($bulan=="11"){
       $bulan = "Nov";
     } else if($bulan=="12"){
       $bulan = "Dec";
     }

	 return $bulan;

}

function hariIndo(){
			$hari = strtolower(date("D"));
		
		switch($hari){
			case $hari == "mon":
				$sHari = "Senin";
				break;
			case $hari == "tue":
				$sHari = "Selasa";
				break;
			case $hari == "wed":
				$sHari = "Rabu";
				break;
			case $hari == "thu":
				$sHari = "Kamis";
				break;
			case $hari == "fri":
				$sHari = "Jumat";
				break;
			case $hari == "sat":
				$sHari = "Sabtu";
				break;
			default:
				$sHari = "Minggu";
			
		}

	return $sHari;
}

function din_hariIndo($data){
		$hari = strtolower($data);
		
		switch($hari){
			case $hari == "mon":
				$sHari = "Senin";
				break;
			case $hari == "tue":
				$sHari = "Selasa";
				break;
			case $hari == "wed":
				$sHari = "Rabu";
				break;
			case $hari == "thu":
				$sHari = "Kamis";
				break;
			case $hari == "fri":
				$sHari = "Jumat";
				break;
			case $hari == "sat":
				$sHari = "Sabtu";
				break;
			default:
				$sHari = "Minggu";
			
		}

	return $sHari;
}

function din_hariEn($data){
    $hari = strtolower($data);
    
    switch($hari){
        case $hari == "mon":
            $sHari = "Monday";
            break;
        case $hari == "tue":
            $sHari = "Thuesday";
            break;
        case $hari == "wed":
            $sHari = "Wednesday";
            break;
        case $hari == "thu":
            $sHari = "Thursday";
            break;
        case $hari == "fri":
            $sHari = "Friday";
            break;
        case $hari == "sat":
            $sHari = "Saturday";
            break;
        default:
            $sHari = "Sunday";
        
    }

return $sHari;
}

function get_img_src($html) {
	if (stripos($html, '<img') !== false) {
		$imgsrc_regex = '#<\s*img [^\>]*src\s*=\s*(["\'])(.*?)\1#im';
		preg_match ($imgsrc_regex, $html, $matches);
		unset ($imgsrc_regex);
		unset ($html);
		if (is_array($matches) && !empty($matches)) {
			return $matches[2];
		} else {
			return false;
		}
	} else {
		return false;
	}
}

//CREATE NOTIFY
function notify($text = "undefined", $target = "allid", $status = "0"){
	$TANGGAL = date("Y-m-d");
	$TIME = date("H:i:s");
	
	$text = trim($GLOBALS['mysql']->real_escape_string(stripslashes($text)));

	DB_INSERT("notifikasi", "'', '" . $TANGGAL . "', '" . $TIME . "', '" . $target . "', '" . $text . "', '" . $status . "'");
}

//PEMERIKSAAN IP
function cip(){
	$IP = $_SERVER['REMOTE_ADDR'];
	$Q_IP = DB_QUERY("sys_ipaccess", "WHERE ip = '" . $IP . "' AND status != 0");
	$R_IP = DB_ROWS($Q_IP);
	
	if($R_IP > 0){
		return 1;
	}else{
		return 0;
	}
}

/*function terbilang($x)
{
  $abil = array("", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan", "sepuluh", "sebelas");
  if ($x < 12){
    return " " . $abil[$x];
  }elseif ($x < 20){
    return terbilang($x - 10) . "belas";
  }elseif ($x < 100){
    return terbilang($x / 10) . " puluh" . terbilang($x % 10);
  }elseif ($x < 200){
    return " seratus" . terbilang($x - 100);
  }elseif ($x < 1000){
    return terbilang($x / 100) . " ratus" . terbilang($x % 100);
  }elseif ($x < 2000){
    return " seribu" . terbilang($x - 1000);
  }elseif ($x < 1000000){
    return terbilang($x / 1000) . " ribu" . terbilang($x % 1000);
  }elseif ($x < 1000000000){
    return terbilang($x / 1000000) . " juta" . terbilang($x % 1000000);
  }
}*/

function terbilang($x){
	$abil = array("", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan", "sepuluh", "sebelas");
	if ($x < 12){
		return " " . $abil[$x];
	}elseif ($x < 20){
		return terbilang($x - 10) . "belas";
	}elseif ($x < 100){
		return terbilang($x / 10) . " puluh" . terbilang($x % 10);
	}elseif ($x < 200){
		return " seratus" . terbilang($x - 100);
	}elseif ($x < 1000){
		return terbilang($x / 100) . " ratus" . terbilang($x % 100);
	}elseif ($x < 2000){
		return " seribu" . terbilang($x - 1000);
	}elseif ($x < 1000000){
		return terbilang($x / 1000) . " ribu" . terbilang($x % 1000);
	}elseif ($x < 1000000000){
		return terbilang($x / 1000000) . " juta" . terbilang($x % 1000000);
	}elseif ($x < 1000000000000){
		return terbilang($x / 1000000000) . " milyar" . terbilang($x % 1000000000);
	}elseif ($x < 1000000000000000){
		return terbilang($x / 1000000000000) . " trilyun" . terbilang($x % 1000000000000);
	}
	}

//SLICE
function slice($DATA = "", $SPRT = ",", $SPRT_R = ""){
	$DATA = explode($SPRT, $DATA);
	$C_DATA = sizeof($DATA);
	
	$R_DATA = "";
	
	for($i = 0; $i < $C_DATA; $i++){
		$R_DATA .= $DATA[$i];
		
		if($i < ($C_DATA - 1)){
			$R_DATA .= $SPRT_R;
		}
	}
	
	return $R_DATA;
}

//NO ACCESS
function NO_ACCESS(){
	?>
    <? /*<div align="center" id="no-access" style="padding:50px 0 0 0;">
        <div style="
            width:500px;
            border:1px solid #02509f;
            padding:10px;
            background:#e3f3ff;
        " align="left" class="corner">
            <h3 style="border-bottom:1px solid #02509f; padding:5px 0; margin:2px;">
                <img src="<?=HOST?>/images/error.png" align="absmiddle" hspace="5" /> 
                <!--Halaman yang anda cari tidak ditemukan.-->
                ERROR 403 : 
                <span style="color:#FF0000" class="sdxblink">Access Denied for <u><?=strtolower($_GET['mod'])?></u></span>
            </h3>
            <p>
                Mungkin halaman yang anda cari sudah tidak berlaku atau alamat yang anda masukkan salah atau mungkin halaman ini sedang dalam proses maintenance.
            </p>
            <ul style="
                list-style:square;
                padding:0 12px;
            ">
              <li><a href="<?=HOST?>">Kembali ke <strong>halaman depan</strong></a></li>
              <li><a href="<?=$_SERVER['HTTP_REFERER']?>">Kembali ke halaman sebelumnya</a></li>
          </ul>
        </div>
    </div>	*/ ?>	
    
    <div class="container-fluid">
        <div class="row-fluid">
         
            <div class="error-500">
                <i class="icon-warning-sign icon-4x" style="color:#900"></i>
                <h1>Access Denied!</h1>
                <span class="text-error"><small><strong>Error 403</strong></small></span>
                <p>Access Denied for <strong><?=strtolower($_GET['com'])?></strong></p>
                <hr />
                <p>
                	Anda tidak memiliki Hak untuk mengakses Komponen ini
                </p>
                <p>
                    <a href="<?=HOST?>" class="btn">
                        <i class="icon-home"></i> Kembali ke Dashboard Utama
                    </a>
                    <a href="<?=$_SERVER['HTTP_REFERER']?>" class="btn">
                        <i class="icon-double-angle-left"></i> Kembali ke halaman sebelumnya
                    </a>
                </p>
            </div>
         
        </div>
    </div>	
    <?php
}

//SORTING MERGED ARRAY
function array_qsort2 (&$array, $column=0, $order="ASC") {
    $oper = ($order == "ASC")?">":"<";
    if(!is_array($array)) return;
    usort($array, create_function('$a,$b',"return (\$a['$column'] $oper \$b['$column']);")); 
    reset($array);
}

//MENGHITUNG UMUR / MASA KERJA
/*function timebydate($startDate, $endDate = ""){
	//echo $endDate;
	if($endDate == ""){
		$endDate = date("Y-m-d");
	}
	
	$startDate 	= date("Y-m-d", strtotime($startDate));
	$endDate 	= date("Y-m-d", strtotime($endDate));
	
	$startDate = strtotime($startDate); 
	$endDate = strtotime($endDate); 
		
	$years = date('Y', $endDate) - date('Y', $startDate); 
	
	$endMonth = date('m', $endDate); 
	$startMonth = date('m', $startDate); 
	
	// Calculate months 
	$months = $endMonth - $startMonth; 
	//if ($months <= 0)  { 
	if ($months < 0)  { 
		$months += 12; 
		$years--; 
	}
	
	if ($years < 0) 
		$years = 0;
		//return false; 
	
	// Calculate the days 
	$offsets = array(); 
	if ($years > 0) 
		$offsets[] = $years . (($years == 1) ? ' year' : ' years'); 
	if ($months > 0) 
		$offsets[] = $months . (($months == 1) ? ' month' : ' months'); 
	$offsets = count($offsets) > 0 ? '+' . implode(' ', $offsets) : 'now'; 

	$days = $endDate - strtotime($offsets, $startDate); 
	$days = date('z', $days);  
	
	$DATA['tahun']	= $years;
	$DATA['bulan']	= $months; 
	$DATA['hari']	= $days;
				
	//return array($years, $months, $days); 
	return $DATA;
} */

function timebydate($startdate = '0000-00-00', $enddate = '0000-00-00') {
		
	// Check to see if start date is valid

	@list($year, $month, $day) = explode('-', $startdate);
	if (@!checkdate($month,$day,$year)) {
		return false;
	}
	
	// Create a new datetime object to do our calculations with
	$s = new DateTime($startdate);
	// We have to have an end date so if it is empty or 0000-00-00 we will make it right now
	if (empty($enddate) OR $enddate == '0000-00-00') {
		$enddate = 'now';
	} else {
		// Check to see if end date is valid

		@list($year, $month, $day) = explode('-', $enddate);
		if (@!checkdate($month,$day,$year)) {
			return false;
		}
	}
	// Create a new datetime object to compare as an end date
	$e = new DateTime($enddate);
	
	if ($s->format('Ymd') > $e->format('Ymd')) {
		// End date cannot be before start date
		return false;
	}
	
	// Calculate our base numbers here
	$years = $e->format('Y')-$s->format('Y');
	$months = $e->format('m')-$s->format('m');
	$days = $e->format('d')-$s->format('d');

	// We cannot have negative days
	// Calculate how many days are in the startdate month
	// subtract the startdate day and add 1
	// Then add back in the day of the enddate
	// Subtract 1 month
	if ($days < 0) {
		$days = $s->format('t')-$s->format('d')+1;
		$days += $e->format('d');
		$months--;
	}
	
	// We cannot have negative months
	// Subtract 1 year and add back 12 months to make months positive
	if ($months < 0) {
		$years--;
		$months += 12;
	}

	//return array('years'=>$years,'months'=>$months, 'days'=>$days);
	
	$DATA['tahun']	= $years;
	$DATA['bulan']	= $months; 
	$DATA['hari']	= $days;
				
	//return array($years, $months, $days); 
	return $DATA;
}

//CONVERT TANGGAL TO INTERNATIONAL
function stddate($DATE = "", $SEPARATOR = "-", $SOURCE = 1){
	$DATE = explode($SEPARATOR, $DATE);

	if($SOURCE == 1){	//dd/mm/yyyy
		$DATE = $DATE[2] . "-" . $DATE[1] . "-" . $DATE[0];
	}
	
	return $DATE;
}

//=> FORMAT NIP
function format_nip($NIP){
	
	if(strlen($NIP) >= 18){
		$R_NIP 	= substr($NIP, 0, 8) . " ";
		$R_NIP .= substr($NIP, 8, 6) . " ";
		$R_NIP .= substr($NIP, 14, 1) . " ";
		$R_NIP .= substr($NIP, 15, 3) . " ";
	}else{
		$R_NIP = $NIP;
	}
	
	return $R_NIP;
}

//=> FORMAT NIK
function format_nik($NIK){
	$R_NIK 	= substr($NIK, 0, 2) . " ";
	$R_NIK .= substr($NIK, 2, 8) . " ";
	$R_NIK .= substr($NIK, 10, 5) . " ";
	
	return $R_NIK;
}

//=> Delete Directory
function rrmdir($dir) {
   if (is_dir($dir)) {
     $objects = scandir($dir);
     foreach ($objects as $object) {
       if ($object != "." && $object != "..") {
         if (filetype($dir."/".$object) == "dir") rrmdir($dir."/".$object); else unlink($dir."/".$object);
       }
     }
     reset($objects);
     rmdir($dir);
   }
 }
 
function ftrim($DATA){
	return preg_replace('/\s+/', '', $DATA);
}

/** Create All Data **/
function ALLDATA($DATA, $PREFIX, $DB, $ID){
	$C_DATA 	= sizeof($DATA);
	$ALLDATA 	= $COMMA = "";
	
	/** DB DATA **/
	$DB_DATA = DB_RESULT(DB_QUERY($DB, "WHERE id = '" . $ID . "'"));
	
	foreach ($DATA as $KEY => $VAL) {
		if(
			$KEY != "com_name" && 
			$KEY != "d_id" && 
			$KEY != "syslog"
		){
			
			$KEY = str_replace($PREFIX . "-", "", $KEY);
			
			$ALLDATA .= $COMMA . $DB_DATA[$KEY];
			$COMMA = "-[::]-";
		}
	}
	
	return $ALLDATA;
}

$TEMP_COLOR = "";
function colorRan(){
	$letters = "1234567890ABCDEF";
	while(strlen($str)<6){
		$pos = rand(1,16);
		$str .= $letters{$pos};
	}
	
	//=> Check Before
	if($TEMP_COLOR == $str){
		colorRan();
	}else{
		$TEMP_COLOR = $str;
		return "#" . $str;
	}
}

/** Nomor HP **/
function nomor_hp($NOMOR){
	
	$NOMOR = substr($NOMOR, 0, 4) . " " . substr($NOMOR, 4, 4) . " " . substr($NOMOR, 8);
	
	return $NOMOR;
}

//=> Fungsi Mutu
function mutu($VAL){
	$R = "Tidak terdefinisi";
	
	if($VAL >= 91){
		$R = "Amat Baik";
	}else
	if($VAL >= 76 && $VAL <= 90){
		$R = "Baik";
	}else
	if($VAL >= 61 && $VAL <= 75){
		$R = "Cukup";
	}else
	if($VAL >= 51 && $VAL <= 60){
		$R = "Sedang";
	}else
	if($VAL > 0 && $VAL <= 50){
		$R = "Kurang";
	}else{
		$R = "-";
	}
	
	return $R;
}

//=> Compress HTML
function compress_html($buffer){
		
	if($_SESSION['MSZ']){
			
		$buffer = preg_replace( "/(?<!\:)\/\/(.*)\\n/", "", $buffer);
		$search = array('/\>[^\S ]+/s','/[^\S ]+\</s','/(\s)+/s');
		$replace = array('>','<','\\1');
		$buffer = preg_replace($search, $replace, $buffer);
		$buffer = preg_replace(array('/\s{2,}/', '/[\t\n]/'), ' ', $buffer);
		
		//=> Replace Comment
		//$buffer = preg_replace('/<!--(.|\s)*?-->/', '', $buffer);
		$buffer = preg_replace('/<!--(?!\s*(?:\[if [^\]]+]|<!|>))(?:(?!-->).)*-->/', '', $buffer);
		
		//=> Replace %20 inside script
		/*$search = array("/src=[\'\"](.*?)[\'\"]/");
		$replace = array('src=');
		$buffer = preg_replace($search, $replace, $buffer);*/
	}
					
	return $buffer;
}

//=> Javascript Array
function js_str($s)
{
    //return '"' . addcslashes($s, "\0..\37\"\\") . '"';
	return "'" . $s . "'";
}
function js_array($array)
{
    $temp = array_map('js_str', $array);
    return '[' . implode(',', $temp) . ']';
}

//=> MakeSRC
function MakeSRC($SRC = ""){
	if(!empty($SRC)){
		$SRC = implode(",", $SRC);
	}
	return $SRC;
}

//Function To Make FTP Connection

function ftp_connection($host, $user, $pass)
{

    $conn_id = @ftp_connect($host);
    $login_result = @ftp_login($conn_id, $user, $pass);
		
    if($login_result){		
		return $conn_id;
    }else{
		return 0;
    }

}

function ftp_connection_quit($conn_id){
	
    @ftp_quit($conn_id);
    @ftp_close($conn_id);
    
}

function PutFilesonFTPServer($host, $user, $pass, $folder, $newfilename,$existingfilename){
	
	 global $publiclink;
	 
	 $uploaded = false;
	 
	 $conn = ftp_connection($host, $user, $pass);
	 
	 if($conn  == 0){
	 exit("Error while connecting FTP Server");
	 }
	
	 @ftp_set_option($conn, FTP_TIMEOUT_SEC, 1000);
	
	 $path = $publiclink.$folder;
         
	 @ftp_site($conn,"CHMOD 0777 $path.");
	 @ftp_pasv($conn, true);
	 
	 
	 if(!@ftp_put($conn, $path.$newfilename, $existingfilename, FTP_BINARY)){
		
		$uploaded = false;
                
	 }else{
            
		$uploaded = true;
	 }
         

	 @ftp_site($conn,"CHMOD 0755 $path.");
         
	 ftp_connection_quit($conn);
	 
	 return $uploaded;
	
}

function CLEANHTML($HTML){
	//=> STATE 1
	$HTML = strip_tags($HTML);
	$HTML = preg_replace( "/(?<!\:)\/\/(.*)\\n/", "", $HTML);
	$SEARCH = array('/\>[^\S ]+/s','/[^\S ]+\</s','/(\s)+/s');
	$REPLACE = array('>','<','\\1');
	$HTML = preg_replace($SEARCH, $REPLACE, $HTML);
	$HTML = preg_replace(array('/\s{2,}/', '/[\t\n]/'), ' ', $HTML);
	
	return $HTML;
}

function CleanTitle($VAL){
    $VAL		= str_replace('"', "'", $VAL);
    $VAL		= preg_replace("/[^a-zA-Z0-9.:,&#;\- ']+/", "", $VAL);
    
    return $VAL;
}

//=> Function
function makeDir($path){
	return is_dir($path) || mkdir($path, 0755, true);
}

function distance($lat1, $lon1, $lat2, $lon2, $unit = "K") {

  $theta = $lon1 - $lon2;
  $dist = sin(deg2rad($lat1)) * sin(deg2rad($lat2)) +  cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * cos(deg2rad($theta));
  $dist = acos($dist);
  $dist = rad2deg($dist);
  $miles = $dist * 60 * 1.1515;
  $unit = strtoupper($unit);

  if ($unit == "K") {
    return ($miles * 1.609344);
  } else if ($unit == "N") {
      return ($miles * 0.8684);
    } else {
        return $miles;
      }
}

//echo distance(32.9697, -96.80322, 29.46786, -98.53506, "M") . " Miles<br>";
//echo distance(32.9697, -96.80322, 29.46786, -98.53506, "K") . " Kilometers<br>";
//echo distance(32.9697, -96.80322, 29.46786, -98.53506, "N") . " Nautical Miles<br>";

function base65encode($string, $key){
        $result = "";
        for($i=0; $i<strlen($string); $i++){
                $char = substr($string, $i, 1);
                $keychar = substr($key, ($i % strlen($key))-1, 1);
                $char = chr(ord($char)+ord($keychar));
                $result.=$char;
				//echo $char . "<hr>";
        }
        $salt_string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxys0123456789~!@#$^&*()_+`-={}|:<>?[]\;',./";
        $length = rand(1, 15);
        $salt = "";
        for($i=0; $i<=$length; $i++){
                $salt .= substr($salt_string, rand(0, strlen($salt_string)), 1);
        }
        $salt_length = strlen($salt);
        $end_length = strlen(strval($salt_length));
		
		$data = base64_encode($result.$salt.$salt_length.$end_length);
		$data = str_replace(array('+','/','='),array('-','_',''),$data);
		
        return $data;
}
function base65decode($string, $key){
        $result = "";
		
		$string = str_replace(array('-','_'),array('+','/'),$string);
        $mod4 = strlen($string) % 4;
        if ($mod4) {
            $string .= substr('====', $mod4);
        }
		
        $string = base64_decode($string);
        $end_length = intval(substr($string, -1, 1));
        $string = substr($string, 0, -1);
        $salt_length = intval(substr($string, $end_length*-1, $end_length));
        $string = substr($string, 0, $end_length*-1+$salt_length*-1);
        for($i=0; $i<strlen($string); $i++){
                $char = substr($string, $i, 1);
                $keychar = substr($key, ($i % strlen($key))-1, 1);
                $char = chr(ord($char)-ord($keychar));
                $result.=$char;
        }
        $result = utf8_encode($result);
        return $result;
}

/************************************************/
//=> Payments
function PaymentCharge($Data){
	
	$UriCharge = PAY_URL . "/charge";
	$curl = curl_init();

	//=> Set Authorization Headers
	$Headers = array(
		'Content-type: application/json', 
		'Accept: application/json',
		'Authorization: Basic ' . base64_encode(PAY_SERVER_KEY . ":")
	);

	curl_setopt_array($curl, array(
	  CURLOPT_URL => $UriCharge,
	  CURLOPT_RETURNTRANSFER => true,
	  CURLOPT_SSL_VERIFYPEER => false,
	  CURLOPT_ENCODING => "",
	  CURLOPT_MAXREDIRS => 10,
	  CURLOPT_TIMEOUT => 30,
	  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
	  CURLOPT_CUSTOMREQUEST => "POST",
	  CURLOPT_POSTFIELDS => json_encode($Data),
	  //CURLOPT_HEADER => true,
	  CURLOPT_HTTPHEADER => $Headers,
	));
	
	$response = curl_exec($curl);
	$err = curl_error($curl);
	
	if($err){
		$response = $err;
	}
	
	curl_close($curl);
	
	return $response;
}

function PaymentCapture($Data){
	
	$UriCharge = PAY_URL . "/capture";
	$curl = curl_init();

	//=> Set Authorization Headers
	$Headers = array(
		'Content-type: application/json', 
		'Accept: application/json',
		'Authorization: Basic ' . base64_encode(PAY_SERVER_KEY . ":")
	);

	curl_setopt_array($curl, array(
	  CURLOPT_URL => $UriCharge,
	  CURLOPT_RETURNTRANSFER => true,
	  CURLOPT_SSL_VERIFYPEER => false,
	  CURLOPT_ENCODING => "",
	  CURLOPT_MAXREDIRS => 10,
	  CURLOPT_TIMEOUT => 30,
	  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
	  CURLOPT_CUSTOMREQUEST => "POST",
	  CURLOPT_POSTFIELDS => json_encode($Data),
	  //CURLOPT_HEADER => true,
	  CURLOPT_HTTPHEADER => $Headers,
	));
	
	$response = curl_exec($curl);
	$err = curl_error($curl);
	
	if($err){
		$response = $err;
	}
	
	curl_close($curl);
	
	return $response;
}

function PaymentStatus($OrderId){
	
	$UriStatus = PAY_URL . "/" . $OrderId . "/status";
	$curl = curl_init();

	//=> Set Authorization Headers
	$Headers = array(
		'Content-type: application/json', 
		'Accept: application/json',
		'Authorization: Basic ' . base64_encode(PAY_SERVER_KEY . ":")
	);

	curl_setopt_array($curl, array(
	  CURLOPT_URL => $UriStatus,
	  CURLOPT_RETURNTRANSFER => true,
	  CURLOPT_SSL_VERIFYPEER => false,
	  CURLOPT_ENCODING => "",
	  CURLOPT_MAXREDIRS => 10,
	  CURLOPT_TIMEOUT => 30,
	  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
	  //CURLOPT_CUSTOMREQUEST => "POST",
	  //CURLOPT_POSTFIELDS => json_encode($Data),
	  //CURLOPT_HEADER => true,
	  CURLOPT_HTTPHEADER => $Headers,
	));
	
	$response = curl_exec($curl);
	$err = curl_error($curl);
	
	if($err){
		$response = $err;
	}
	
	curl_close($curl);
	
	return $response;
}

function PaymentToken($Card){
	
	$Card = http_build_query($Card);
	
	$UriToken = PAY_URL . "/token?client_key=" . PAY_CLIENT_KEY . "&" . $Card;
	$curl = curl_init();

	//=> Set Authorization Headers
	$Headers = array(
		'Content-type: application/json', 
		'Accept: application/json',
		'Authorization: Basic ' . base64_encode(PAY_SERVER_KEY . ":")
	);

	curl_setopt_array($curl, array(
	  CURLOPT_URL => $UriToken,
	  CURLOPT_RETURNTRANSFER => true,
	  CURLOPT_SSL_VERIFYPEER => false,
	  CURLOPT_ENCODING => "",
	  CURLOPT_MAXREDIRS => 10,
	  CURLOPT_TIMEOUT => 30,
	  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
	  //CURLOPT_CUSTOMREQUEST => "POST",
	  //CURLOPT_POSTFIELDS => json_encode($Data),
	  //CURLOPT_HEADER => true,
	  CURLOPT_HTTPHEADER => $Headers,
	));
	
	$response = curl_exec($curl);
	$err = curl_error($curl);
	
	if($err){
		$response = $err;
	}
	
	curl_close($curl);
	
	return $response;
}
//=> END Payments
/************************************************/

/************************************************/
//=> Invoice
function CreateInvoice($DATE = "0000-00-00", $TOKO = "0", $ID = "0"){
	
	$DATE	= explode("-", $DATE);
	
	$INVOICE = substr($DATE[0], -2) . "-" . $DATE[1] . "/" . $DATE[2];
	$INVOICE .= "/" . $TOKO;
	$INVOICE .= "/" . $ID;
	
	return $INVOICE;
	
}
//=> End Invoice
/************************************************/

function escapeJsonString($value) { # list from www.json.org: (\b backspace, \f formfeed)
    $escapers = array("\\", "/", "\"", "\n", "\r", "\t", "\x08", "\x0c");
    $replacements = array("\\\\", "\\/", "\\\"", "\\n", "\\r", "\\t", "\\f", "\\b");
    $result = str_replace($escapers, $replacements, $value);
    return $result;
}

function roman2number($roman){
    $conv = array(
        array("letter" => 'I', "number" => 1),
        array("letter" => 'V', "number" => 5),
        array("letter" => 'X', "number" => 10),
        array("letter" => 'L', "number" => 50),
        array("letter" => 'C', "number" => 100),
        array("letter" => 'D', "number" => 500),
        array("letter" => 'M', "number" => 1000),
        array("letter" => 0, "number" => 0)
    );
    $arabic = 0;
    $state = 0;
    $sidx = 0;
    $len = strlen($roman);

    while ($len >= 0) {
        $i = 0;
        $sidx = $len;

        while ($conv[$i]['number'] > 0) {
            if (strtoupper(@$roman[$sidx]) == $conv[$i]['letter']) {
                if ($state > $conv[$i]['number']) {
                    $arabic -= $conv[$i]['number'];
                } else {
                    $arabic += $conv[$i]['number'];
                    $state = $conv[$i]['number'];
                }
            }
            $i++;
        }

        $len--;
    }

    return($arabic);
}


function number2roman($num,$isUpper=true) {
    $n = intval($num);
    $res = '';

    /*** roman_numerals array ***/
    $roman_numerals = array(
        'M' => 1000,
        'CM' => 900,
        'D' => 500,
        'CD' => 400,
        'C' => 100,
        'XC' => 90,
        'L' => 50,
        'XL' => 40,
        'X' => 10,
        'IX' => 9,
        'V' => 5,
        'IV' => 4,
        'I' => 1
    );

    foreach ($roman_numerals as $roman => $number)
    {
        /*** divide to get matches ***/
        $matches = intval($n / $number);

        /*** assign the roman char * $matches ***/
        $res .= str_repeat($roman, $matches);

        /*** substract from the number ***/
        $n = $n % $number;
    }

    /*** return the res ***/
    if($isUpper) return $res;
    else return strtolower($res);
}

function remove_bs($Str) {  
  $StrArr = str_split($Str); $NewStr = '';
  foreach ($StrArr as $Char) {    
    $CharNo = ord($Char);
    if ($CharNo == 163) { $NewStr .= $Char; continue; } // keep £ 
    if ($CharNo > 31 && $CharNo < 127) {
      $NewStr .= $Char;    
    }
  }  
  return $NewStr;
}

function searchJson( $obj, $value ) {
    foreach( $obj as $key => $item ) {
        if( !is_nan( intval( $key ) ) && is_array( $item ) ){
            if( in_array( $value, $item ) ) return $item;
        } else {
            foreach( $item as $child ) {
                if(isset($child) && $child == $value) {
                    return $child;
                }
            }
        }
    }
    return null;
}

function jsonEncodeArray( $array ){
    array_walk_recursive( $array, function(&$item) { 
       $item = utf8_encode( $item ); 
    });
    return json_encode( $array );
}

function romawi($n = ""){
    if(!empty($n)){
        $BulanRomawi = array(
            1   =>
            "I",
            "II",
            "III",
            "IV",
            "V",
            "VI",
            "VII",
            "VIII",
            "IX",
            "X",
            "XI",
            "XII"
        );

        return $BulanRomawi[$n];
    }
}
?>