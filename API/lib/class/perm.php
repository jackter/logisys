<?php
class Perm {
    //=> Extract Permissions
    static function Extract($Modid = 0){

        // $DB = new DB;
        global $DB;

        $Permissions = [];

        /*$Q_Module = DB_QUERY("sys_module", "WHERE id = '" . $Modid . "'");
        $R_Module = DB_ROWS($Q_Module);*/
        $FModule = array(
            'actions'
        );
        $Q_Module = $DB->Query("sys_module", $FModule, "WHERE id = '" . $Modid . "' AND status != 0");
        $R_Module = $DB->Row($Q_Module);
        if($R_Module > 0){

            //$Module = DB_RESULT($Q_Module);
            $Module = $DB->Result($Q_Module);

            $Actions = json_decode($Module['actions'], true);
            $ActionShow = array();
            for($i = 0; $i < sizeof($Actions); $i++){
                $ActionShow[$Actions[$i]['id']] = $Actions[$i]['act'];
            }

            /*echo "<pre>";
			print_r($ActionShow);
			echo "</pre>";*/

            $ID = Core::GetState("id");
            //$ID = 2;	//=> Development

            //echo "ID = " . $ID;

            if(isset($ID)){

                if($ID == 1){	//=> Super Administrator

                    foreach($ActionShow as $ASKey => $ASVal){
                        $Permissions[$ASVal] = 1;
                    }

                }else{

                    //$User = DB_RESULT(DB_QUERY("sys_user", "WHERE id = '" . $ID . "'"));
                    $FUser = array(
                        'gperm',

                    );
                    $User = $DB->Result($DB->Query("sys_user", $FUser, "WHERE id = '" . $ID . "'"));

                    $GPerm = explode(",", $User['gperm']);
                    for($i = 0; $i < sizeof($GPerm); $i++){				
                        //$Auth = DB_RESULT(DB_QUERY("sys_auth", "WHERE gperm = '" . $GPerm[$i] . "'"));

                        $FAuth = array(
                            'module'
                        );
                        $Auth = $DB->Result($DB->Query("sys_auth", $FAuth, "WHERE gperm = '" . $GPerm[$i] . "'"));

                        //=> Find Module
                        $AuthModule = json_decode($Auth['module'], true);
                        if(isset($AuthModule)){
                            foreach( $AuthModule as $index => $obj ) {
                                foreach($obj as $key => $item){
        
                                    /*if($key != "mod" && $item != $Modid){
                                        //continue 3;
        
                                    }*/
        
                                    if($key == "mod" && $item == $Modid){
        
                                        $ModulePerm = explode(",", $AuthModule[$index]['perm']);
                                        foreach($ActionShow as $ASKey => $ASVal){
                                            //echo $ASKey . " - " . $ASVal . "<br>";
                                            if(in_array($ASKey, $ModulePerm)){
                                                $Permissions[$ASVal] = 1;
        
                                            }
                                        }
        
                                    }
        
                                }
                            }
                        }

                    }

                }

            }

        }

        return $Permissions;

    }

    //=> Check Module Permissions
    static function CheckModule($Module){

        // $DB = new DB;
        global $DB;

        /*$Q_Sub = DB_QUERY("sys_module", "WHERE main = '" . $Module . "' AND status != 0");
        $R_Sub = DB_ROWS($Q_Sub);*/

        $FSub = array('id');
        $Q_Sub = $DB->Query("sys_module", $FSub, "WHERE main = '" . $Module . "' AND status != 0");
        $R_Sub = $DB->Row($Q_Sub);

        $return = false;
        if($R_Sub > 0){
            //while($Sub = DB_RESULT($Q_Sub)){
            while($Sub = $DB->Result($Q_Sub)){

                $Child[] = $Sub['id'];

            }
            if(Perm::ChildCount($Child)){
                $return = true;
            }
        }

        return $return;

    }

    //=> Check CheckModuleChild
    static function CheckModuleChild($Modules){

        // $DB = new DB;
        global $DB;

        $Count = 0;
        foreach($Modules as $Module){

            /*$Q_Sub = DB_QUERY("sys_module", "WHERE main = '" . $Module . "' AND status != 0");
            $R_Sub = DB_ROWS($Q_Sub);*/

            $FSub = array('id');
            $Q_Sub = $DB->Query("sys_module", $FSub, "WHERE main = '" . $Module . "' AND status != 0");
            $R_Sub = $DB->Row($Q_Sub);

            if($R_Sub > 0){
                //while($Sub = DB_RESULT($Q_Sub)){
                while($Sub = $DB->Result($Q_Sub)){

                    $Child[] = $Sub['id'];

                }
                if(Perm::ChildCount($Child)){
                    $Count++;
                }
            }

        }
        
        if($Count > 0){
            $return = true;
        }

        return $return;

    }

    //=> Check Spesifik Permissions
    static function Check($Modid, $Act){
        $Perm = Perm::Extract($Modid);
        if($Perm[$Act] != 1){
            $return = array(
                'status'	=> 99,
                'error_msg'	=> 'Does not have permissions, Request Rejected'
            );
            echo json_encode($return);
            exit();
        }
    }
    static function Check2($Modid, $Act){
        $Perm = Perm::Extract($Modid);
        $return = true;
        if($Perm[$Act] != 1){
            $return = false;
        }

        return $return;
    }

    //=> Check Spesifik Permissions on Menu
    static function CheckMenu($Modid, $Act){
        $Perm = Perm::Extract($Modid);
        $return = false;
        if($Perm[$Act] == 1){
            $return = true;
        }

        return $return;
    }

    //=> Check Count Perm
    static function Count($Modid = 0){
        $return = false;

        $Perm = Perm::Extract($Modid);
        $Count = 0;

        foreach($Perm as $Key => $Val){
            if($Perm[$Key] == 1){
                $Count++;
            }
        }

        if($Count > 0){
            $return = true;
        }

        return $return;
    }

    //=> Check Child Count
    static function ChildCount($Modules){

        $return = false;

        $Count = 0;
        foreach($Modules as $Modid){
            $Perm = Perm::Extract($Modid);

            foreach($Perm as $Key => $Val){
                if($Perm[$Key] == 1){
                    $Count++;
                }
            }
        }

        if($Count > 0){
            $return = true;
        }

        return $return;

    }
}
?>