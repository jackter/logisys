<?php
class Query {
	
	/* Begin Check Toko */
	static function CheckToko(){
		
		$UID	= Core::Auth("uid");
		
		$TOKO = DB_ROWS(DB_QUERY("toko_admin", "WHERE pengguna = '" . $UID . "'"));
		
		$R = false;
		if($TOKO > 0){
			$R = true;
		}
		
		return $R;
		
	}
	/* End Check Toko */
	
	/* Begin Toko */
	static function Toko($REQ){

		$R = false;
		if(Query::CheckToko() && Core::Auth('login') == 1 && Core::Auth('uid') != ''){
			
			$UID = Core::Auth("uid");

			$Q_ADMIN = DB_QUERY("toko_admin", "WHERE pengguna = '" . $UID . "'");
			$R_ADMIN = DB_ROWS($Q_ADMIN);
			if($R_ADMIN > 0){
				$ADMIN = DB_RESULT($Q_ADMIN);
				
				$Q_TOKO = DB_QUERY("toko", "WHERE id = '" . $ADMIN['toko'] . "' AND status = 1");
				$R_TOKO = DB_ROWS($Q_TOKO);
				
				if($R_TOKO > 0){
					$TOKO = DB_RESULT($Q_TOKO);
					
					$R = $TOKO[$REQ];
				}else{
					$R = false;	// User tidak memiliki toko
				}
			}else{
				$R = false; // User tidak memiliki toko
			}
			
		}

        return $R;

    }
	/* End Toko */
	
}
?>