<?php

$Modid = 183;
Perm::Check($Modid, 'view');

//=> Default Statement
$return = [];
$RPL    = "";
$SENT    = Core::Extract($_POST, $RPL);

//=> Extract Array
if (isset($SENT)) {
    foreach ($SENT as $KEY => $VAL) {
        $$KEY = $VAL;
    }
}

$return['permissions'] = Perm::Extract($Modid);

$Table = array(
    'def'       => 'kontrak_request'
);

//=> Clean Data
if (empty($limit)) {
    $limit = 10;
}
if (empty($offset)) {
    $offset = 0;
}

/**
 * Filter
 */
$CLAUSE = "
    WHERE
        id != ''
";
//=> / END : Filter

# Filter Company 
$PermCompany = Core::GetState('company');
if ($PermCompany == "X") {
    $CLAUSE .= "";
} else {
    $CLAUSE .= " AND company IN (" . $PermCompany . ")";
}

/**
 * Filter Table
 */
$ftable = json_decode($ftable, true);
if (isset($ftable)) {
    foreach ($ftable as $Key => $Val) {

        /**
         * Generate Clause
         */
        switch ($Key) {

            case "status_data":
                if(count($Val['values']) > 0){
                    for($i = 0; $i < count($Val['values']); $i++){
                        if($i == 0){
                            $CLAUSE .= "AND ( ";
                        }

                        switch($Val['values'][$i]){
                            case "DRAFT":
                                if($i == 0){
                                    $CLAUSE .="verified != 1 ";
                                }else{
                                    $CLAUSE .="OR verified != 1 ";
                                }
                            break;
                            case "VERIFIED, WAITING APPROVE":
                                if($i == 0){
                                    $CLAUSE .="verified = 1 AND approved != 1 ";
                                }else{
                                    $CLAUSE .="OR verified = 1 AND approved != 1 ";
                                }
                            break;
                            case "APPROVED":
                                if($i == 0){
                                    $CLAUSE .="approved = 1 ";
                                }else{
                                    $CLAUSE .="OR approved = 1 ";
                                }
                            break;
                        }
                        
                        if($i == count($Val['values'])-1){
                            $CLAUSE .= ")";
                        }
                    }
                }
            break;
            default:
                $CLAUSE .= "
                    AND 
                        $Key LIKE '%" . $Val['filter'] . "%'                    
                ";
        }
        //=> / END : Generate Clause
    }
}
//=> / END : Filter Table

/**
 * Listing Data
 */
$return['start']        = 0;
$return['limit']        = $limit;
$return['count']        = 0;

$Q_Data = $DB->Query(
    $Table['def'],
    array('id'),
    $CLAUSE
);
$R_Data = $DB->Row($Q_Data);

if ($R_Data > 0) {

    $return['start']        = $start;
    $return['limit']        = $limit;
    $return['count']        = $R_Data;

    $Q_Data = $DB->Query(
        $Table['def'],
        array(
            'id',
            'tanggal',
            'company',
            'company_nama',
            'company_abbr',
            'kode',
            'work_code',
            'approved',
            'verified'
        ),
        $CLAUSE .
        " 
            ORDER BY id DESC
            LIMIT 100
        "
    );

    $i = 0;
    while ($Data = $DB->Result($Q_Data)) {
        $return['data'][$i] = $Data;
        $i++;
    }
}
//=> / END : Listing Data

echo Core::ReturnData($return);

?>