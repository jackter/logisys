<?php
class Module {
	
	//=> Module Default
	static function Def($MOD = "", $COM = ""){
		
		//config
		$CFG		= MODULE . "/" . $MOD . "/" . $COM . "/config.php";
				
		if(file_exists($CFG)){
			include $CFG;
			$MFILE		= MODULE . "/" . $MOD_NAME . "/" . $COM_NAME . "/" . $FNAME . ".php";
						
			if(file_exists($MFILE)){ 
				include ($MFILE);
			}else{
				//MODULE NOT FOUND
				echo "
					<div align='center' class='corner div_error'>
						File <b><u>" . $FNAME . "</u></b> not found on component <u><b>" . $MOD_NAME . "</b></u>. Please check your component config.
					</div>
				";
			}
		}else{
			//MODULE ERROR
			echo '
				<div class="container-fluid">
					<div class="row-fluid">
					 
						<div class="error-404 pulse5 animated bounceIn">
							<i class="icon-warning-sign icon-5x text-error"></i>
							<h1>Module Error</h1>
							<span class="text-error"><small><strong>Error 404</strong></small></span>
							<div class="text-warning"><small><strong>Destinasi : ' . strtoupper(substr($COM_NAME, 4)) . '</strong></small></div>
							<p>Module yang anda destinasikan tidak ditemukan.</p>
						</div>
						
					</div>
				</div>
			';

		}
	}
	
	//=> Get Module Config
	static function CFG($MOD = "", $COM = ""){
		$Location = "modules/" . $MOD . "/" . $COM . "/config.php";
		if(file_exists($Location)){
			return $Location;
		}else{
			echo "<div align='center'>File Config ('" . $MOD . "-" . $COM . "') tidak ditemukan.</div>";
		}
	}
	
	//=> Get Module File
	static function Inc($MOD = "", $COM = "", $FNAME = "", $DIR = "files", $EXT = ".php"){
		$Location = "modules/" . $MOD . "/" . $COM . "/" . $DIR . "/" . $FNAME . $EXT;
		if(file_exists($Location)){
			include $Location;
		}else{
			echo "<div align='center'>File Include " . $FNAME . " ('" . $MOD . "-" . $COM . "') tidak ditemukan.</div>";
		}
	}
	
	//=> Module Exec
	static function Exec($MOD = "", $COM = "", $FNAME = ""){
		$Location = "modules/" . $MOD . "/" . $COM . "/exec/" . $FNAME . ".exe.php";
		if(file_exists($Location)){
			include $Location;
		}else{
			echo 0;
		}
	}
	
	static function SRC($MOD = "", $COM = "", $DATA = "", $SECURE = false, $BASIC = 0){
		include Module::CFG($MOD, $COM);
				
		$DIR = "assets";
				
		$SRC_FILE 	= $MOD . "/" . $COM . "/" . $DIR . "/" . $DATA;
		$THE_F		= MODULE . "/" . $SRC_FILE;
		
			
		if(file_exists($THE_F)){
			$EXT = explode(".", $DATA);
			$CEXT = sizeof($EXT);
			$UEXT = $CEXT - 1;
			$EXT = $EXT[$UEXT];
			
			$DEXT = $EXT;
            
            if($SECURE){
                $SECURE = 1;
            }else{
                $SECURE = 0;
            }
			
			if($BASIC == 0){
				$RESULT = base64_encode('mod_file("' . $MOD . '", "' . $COM . '", "' . $DATA . '", "' . $SECURE . '");');
				//$RESULT = MODULE . "/" . $MOD . "/" . $COM . "/" . $DIR . "/" . $DATA;
				$GLOBALS['szscript'][] = $RESULT;
			}else{
				//$RESULT = HOST . "/" . MODULE . "/" . $MOD . "/" . $COM . "/" . $DIR . "/" . $DATA;
                $RESULT = MODULE . "/" . $MOD . "/" . $COM . "/" . $DIR . "/" . $DATA;
                $RESULT = HOST . "/script/js.module." . $SECURE . base64_encode($RESULT);
				$GLOBALS['szscript-basic'][] = $RESULT;
			}
		}else{
			//MODULE ERROR
			echo "
			</script>
				<div align='center' class='alert alert-error'>
					<b>File <u>" . strtoupper($DATA) . "</u> Tidak ditemukan</b>
				</div>
			<script>
			";
		}	
		
	}
	
	static function External($URL){
		if(!empty($URL)){
			$GLOBALS['szscript-basic'][] = $URL;
		}
	}
	
	static function PlugJS($Dest){
		$THE_F		= THEMEPATH . "/" . ActiveTheme . "/assets/plugins/" . $Dest . ".js";
		if(file_exists($THE_F)){
			$GLOBALS['plugjs'][] = $THE_F;
		}else{
			echo $Dest . " Not Found<br>";
		}
	}
	
	static function PlugCSS($Dest){
		$THE_F		= THEMEPATH . "/" . ActiveTheme . "/assets/plugins/" . $Dest . ".css";
		if(file_exists($THE_F)){
			$RESULT = base64_encode('PlugCSS("' . $THE_F . '");');
			$GLOBALS['plugcss'][] = $RESULT;
		}else{
			echo $Dest . " Not Found";
		}
	}
}

$Module = new Module;
?>