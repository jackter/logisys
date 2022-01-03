<?php
$Modid = 137;

Perm::Check($Modid, 'view');

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

$return['permissions'] = Perm::Extract($Modid);

$Table = array(
    'def'       => 'vehicle_activity'
);

//=> Clean Data
if(empty($limit)){
    $limit = 10;
}
if(empty($offset)){
    $offset = 0;
}

$return['start']        = 0;
$return['limit']        = $limit;
$return['count']        = 0;

/**
 * Filter
 */
$CLAUSE = "
    WHERE 
        vehicle = '" . $vehicle . "' AND
        tanggal BETWEEN '" . $fdari . "' AND '" . $fhingga . "'
";
//=> / END : Filter

/**
 * Filter Table
 */
$ftable = json_decode($ftable, true);
if(isset($ftable)){
    foreach($ftable AS $Key => $Val){

        /**
         * Generate Clause
         */
        switch($Key){
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

$Q_Data = $DB->Query(
    $Table['def'],
    array('id'),
    $CLAUSE
);
$R_Data = $DB->Row($Q_Data);

if($R_Data > 0){

    $return['start']        = $start;
    $return['limit']        = $limit;
    $return['count']        = $R_Data;

    $Q_Data = $DB->Query(
        $Table['def'],
        array(
            'id',
            'tanggal',
            'company',
            'company_abbr',
            'company_nama',
            'vehicle',
            'vgrup',
            'vgrup_abbr',
            'vgrup_nama',
            'waktu_start',
            'waktu_end',
            'total_waktu',
            'jarak_start',
            'jarak_end',
            'total_jarak',
            'coa',
            'coa_kode',
            'coa_nama',
            'muatan_abbr',
            'muatan_nama',
            'qty',
            'uom',
            'keterangan',
            'approved'
        ),
        $CLAUSE . 
        "
            ORDER BY
                id ASC,
                tanggal ASC
            LIMIT 
                $offset, $limit
        "
    );

    $i = 0;
    while($Data = $DB->Result($Q_Data)){

        $return['data'][$i] = $Data;

        $i++;
    }
}

echo Core::ReturnData($return);
?>