<?php
$PAGE 	= $_GET['page'];
$COM	= $_GET['com'];
$IN		= $_GET['inpage'];

if($IN == 1){
	$FILE		= $_GET['f'];
	$THE_F		= "pages/" . $FILE. ".php";
	
	if(file_exists($THE_F)){
		include $THE_F;
	}else{
		echo "<script>window.location=\"" . HOST . "/error/404\"</script>";
	}
}else{
	if(isset($PAGE)){
		
		$cekMod = is_dir(MODULE . "/" . $PAGE);
		$cekCom = is_dir(MODULE . "/" . $PAGE . "/" . $COM);
		//$cekComDef = is_dir(MODULES . "/mod_default/" . "com_" . $PAGE);
		if($cekMod){
			if($cekCom){
				include Module::CFG($PAGE, $COM);
				if($ADM_ONLY == 1){
					echo "<script>window.location=\"" . HOST . "/error/403\"</script>";
				}elseif($MOD_TYPE == 1){
					Module::Def($PAGE, $COM);
				}else{
					echo "<script>window.location=\"" . HOST . "/error/404\"</script>";
				}
			}else{
				echo '<script>window.location = "' . HOST . '/error/404"</script>';
			}
		}else{
			echo '<script>window.location = "' . HOST . '/error/404"</script>';
		}
		
	}else{
		$THE_F		= THEMEPATH . "/" . ActiveTheme . "/main.php";
	
		if(file_exists($THE_F)){
			include $THE_F;
		}else{
			$THE_F		= MODULES . "/main.php";
			if(file_exists($THE_F)){
				include $THE_F;
			}else{
				//MODULE ERROR
				echo "
					<div align='center' class='corner div_error'>
						<b>File <u>" . $THE_F . "</u> Tidak ditemukan</b>
					</div>
				";
			}
		}
	}
}
?>