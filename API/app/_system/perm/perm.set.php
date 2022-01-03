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

$data = json_decode($data, true);

$Permissions = [];

$i = 0;
//=> Create Permissions
foreach($data as $Key => $Val){
	foreach($data[$Key] as $ModKey => $ModVal){
		
		if($ModKey == "children" && sizeof($data[$Key][$ModKey]) > 0){
			//=> Extract Children Index
			foreach($data[$Key][$ModKey] as $ModInKey => $ModInVal){
				
				//=> Extract Children
				foreach($data[$Key][$ModKey][$ModInKey] as $ComKey => $ComVal){
					
					//=> Check Action
					if($ComKey == "action" && sizeof($data[$Key][$ModKey][$ModInKey][$ComKey]) > 0){
						
						//=> Extract Index Action
						$IsAction = 0;
						$Checked = "";
						$Comma = "";
						foreach($data[$Key][$ModKey][$ModInKey][$ComKey] as $ActInKey => $ActInVal){
							
							if($data[$Key][$ModKey][$ModInKey][$ComKey][$ActInKey]['checked'] == 1){
								$Checked .= $Comma . $data[$Key][$ModKey][$ModInKey][$ComKey][$ActInKey]['value'];
								$Comma = ",";
								$IsAction++;
							}
							
						}
						
						if($IsAction > 0){
							$Permissions[$i]['mod'] = $data[$Key][$ModKey][$ModInKey]['value'];
							$Permissions[$i]['perm'] = $Checked;
						}
						
						if($IsAction > 0){
							$i++;
						}
						
					}
					
				}
				
			}
		}
		
	}
}

$Permissions = json_encode($Permissions);

$return = array(
	'status'	=> 0,
	'error_msg'	=> 'Failed to Set Permissions'
);

//=> Update Auth
$Fields = array(
	'module'	=> $Permissions
);
if($DB->Update(
    "sys_auth", 
    $Fields, 
    "gperm = '" . $id . "'"
)){
	$return['status'] = 1;
}

echo Core::ReturnData($return);
?>