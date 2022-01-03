<?php
//=> Default Statement
$return = [];
$RPL	= "";
$SENT	= Core::Extract($_POST, $RPL);

//=> Extract Array
if(isset($SENT)){
    foreach($SENT as $KEY => $VAL){	
        $$KEY = $VAL;
    }
}

$year = date('Y');
$month = date('m');
$tgl1 = 1;
$tgl2= 31;
// $i= 1;

/**
 * Data
 */
for($i = 1; $i <= $month; $i++){

    $Q_Data = $DB->QueryPort("
        SELECT
            COUNT(*) total
        FROM
            pr
        WHERE
            DATE(DATE_FORMAT(STR_TO_DATE(create_date, '%Y-%m-%d %H:%i:%s'), '%Y-%m-%d')) BETWEEN '".$year.'-'.$i.'-'.$tgl1."' AND '".$year.'-'.$i.'-'.$tgl2."'
    ");
    $R_Data = $DB->Row($Q_Data);
    
    if($R_Data > 0){
        $Data = $DB->Result($Q_Data);

        $pr[] = (int)$Data['total'];
    
    }

    $Q_Data = $DB->QueryPort("
        SELECT
            COUNT(*) total
        FROM
            po
        WHERE
            DATE(DATE_FORMAT(STR_TO_DATE(create_date, '%Y-%m-%d %H:%i:%s'), '%Y-%m-%d')) BETWEEN '".$year.'-'.$i.'-'.$tgl1."' AND '".$year.'-'.$i.'-'.$tgl2."'
    ");
    $R_Data = $DB->Row($Q_Data);
    
    if($R_Data > 0){
        $Data = $DB->Result($Q_Data);

        $po[] = (int)$Data['total'];
    
    }

    $Q_Data = $DB->QueryPort("
        SELECT
            COUNT(*) total
        FROM
            mr
        WHERE
            verified = 1 AND
            approved = 1 AND 
            DATE(DATE_FORMAT(STR_TO_DATE(create_date, '%Y-%m-%d %H:%i:%s'), '%Y-%m-%d')) BETWEEN '".$year.'-'.$i.'-'.$tgl1."' AND '".$year.'-'.$i.'-'.$tgl2."'
    ");
    $R_Data = $DB->Row($Q_Data);
    
    if($R_Data > 0){
        $Data = $DB->Result($Q_Data);

        $mr[] = (int)$Data['total'];
    
    }

    $Q_Data = $DB->QueryPort("
        SELECT
            COUNT(*) total
        FROM
            gr
        WHERE
            DATE(DATE_FORMAT(STR_TO_DATE(create_date, '%Y-%m-%d %H:%i:%s'), '%Y-%m-%d')) BETWEEN '".$year.'-'.$i.'-'.$tgl1."' AND '".$year.'-'.$i.'-'.$tgl2."'
    ");
    $R_Data = $DB->Row($Q_Data);
    
    if($R_Data > 0){
        $Data = $DB->Result($Q_Data);

        $gr[] = (int)$Data['total'];
    
    }

    $Q_Data = $DB->QueryPort("
        SELECT
            COUNT(*) total
        FROM
            gi
        WHERE
            DATE(DATE_FORMAT(STR_TO_DATE(create_date, '%Y-%m-%d %H:%i:%s'), '%Y-%m-%d')) BETWEEN '".$year.'-'.$i.'-'.$tgl1."' AND '".$year.'-'.$i.'-'.$tgl2."'
    ");
    $R_Data = $DB->Row($Q_Data);
    
    if($R_Data > 0){
        $Data = $DB->Result($Q_Data);

        $gi[] = (int)$Data['total'];
    
    }

    $bulan[] = din_bulanEN($i);

}

$return['pr'] = $pr;
$return['po'] = $po;
$return['mr'] = $mr;
$return['gr'] = $gr;
$return['gi'] = $gi;
$return['bulan'] = $bulan;
//=> END : Data
echo Core::ReturnData($return);
?>