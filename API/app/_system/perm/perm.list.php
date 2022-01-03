<?php
$Modid = 12;

Perm::Check($Modid, 'permission');

//=> Default Statement
$return = [];
$RPL	= "";
$SENT   = Core::Extract($_POST, $RPL);

//=> Extract Array
if(isset($SENT)){
    foreach($SENT as $KEY => $VAL){	
        $$KEY = $VAL;
    }
}

$return['status'] = 0;

/**
 * Get Auth
 * 
 * untuk melakukan ekstraksi module
 */
$Auth = $DB->Result($DB->Query(
    "sys_auth",
    array(
        'module'
    ),
    "
        WHERE
            gperm = '" . $id . "'
    "
));
//=> / END : Get Auth

/**
 * Extract Module
 * 
 * dari table sys_module
 */
$Q_Module = $DB->Query(
    "sys_module",
    array(
        'id',
        'nama',
        'alias'
    ),
    "
        WHERE
            status != 0 AND 
            main = 0
        ORDER BY 
            posisi ASC
    "
);
$R_Module = $DB->Row($Q_Module);
if($R_Module > 0){

    $return['status'] == 1;
    $i = 0;
    while($Module = $DB->Result($Q_Module)){

        /**
         * Define Array
         */
        $return['data'][$i] = array(
            'id'        => $Module['id'],
			'nama'		=> $Module['nama'],
			'alias'		=> $Module['alias'],
			'value'		=> $Module['id'],
			//'checked'	=> true,
			'children'	=> array()
        );
        //=> / END : Define Array

        /**
         * Check Component
         * 
         * pengecekkan component untuk ditampilkan pada UI
         */
        $Q_Com = $DB->Query(
            "sys_module",
            array(),
            "
                WHERE
                    main = '" . $Module['id'] . "' AND 
                    status != 0
                ORDER BY 
                    posisi ASC
            "
        );
        $R_Com = $DB->Row($Q_Com);
        if($R_Com > 0){
            while($Com = $DB->Result($Q_Com)){

                //=> Get Actions
                $Actions = json_decode($Com['actions'], true);

                $ActionShow = array();

                $CountCheck = 0;
                for($x = 0; $x < sizeof($Actions); $x++){

                    $ActionShow[$x] = array(
						'value'		=> $Actions[$x]['id'],
						'act'		=> $Actions[$x]['act'],
						'text'		=> $Actions[$x]['text'],
						'checked'	=> false
                    );
                    
                    //=> Find Module
                    if($Auth['module']){
                        $AuthModule = json_decode($Auth['module'], true);
                        for($y = 0; $y < sizeof($AuthModule); $y++){
                            
                            if($AuthModule[$y]['mod'] != $Com['id']){
                                continue;
                            }
                            
                            $TheItem = explode(",", $AuthModule[$y]['perm']);
                            if(in_array($Actions[$x]['id'], $TheItem)){
                                $ActionShow[$x]['checked'] = true;
                                $CountCheck++;
                            }
                            
                        }
                    }

                }

                $ChildChecked = false;
				if($CountCheck == sizeof($Actions)){
					$ChildChecked = true;
				}
				$return['data'][$i]['children'][] = array(
                    'id'        => $Com['id'],
					'nama'		=> $Com['nama'],
					'alias'		=> $Com['alias'],
					'value'		=> $Com['id'],
					'checked'	=> $ChildChecked,
					'action'	=> $ActionShow
				);

            }
        }
        //=> / END : Check Component

        $i++;

    }

}
//=> / END : Extract Module

echo Core::ReturnData($return);
?>