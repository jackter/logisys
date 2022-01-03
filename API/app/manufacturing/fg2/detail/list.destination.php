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

$Table = array(
    'def'       => 'jo'
);

if($tipe == 1) {

    if($keyword != '' && isset($keyword)) {
        $CLAUSE .= "
            AND
                kode LIKE '%" . $keyword . "%' OR
                nama LIKE '%" . $keyword . "%'
        ";
    }

    /**
     * Storeloc
     */
    $Q_Store = $DB->Query(
        'storeloc',
        array(),
        "
            WHERE
                company = '" . $company . "' AND
                sounding = 1
                $CLAUSE
            LIMIT 
                100
        "
    );
    $R_Store = $DB->Row($Q_Store);
    
    if($R_Store > 0) {
        $i = 0;
        while($Store = $DB->Result($Q_Store)) {
            $return['destination'][$i] = $Store;
            $i++;
        }
    }
    //=> END : Storeloc
} 

if ($tipe == 2){

    if($keyword != '' && isset($keyword)) {
        $CLAUSE .= "
            AND
                kode LIKE '%" . $keyword . "%'
        ";
    }

    /**
     * JO
     */
    $Q_Data = $DB->Query(
        $Table['def'],
        array(
            'id',
            'company',
            'company_abbr',
            'company_nama',
            'dept',
            'dept_abbr',
            'dept_nama',
            'storeloc',
            'storeloc_kode',
            'storeloc_nama',
            'plant',
            'kode'
        ),
        "
            WHERE
                company = '" . $company . "' AND
                plant != '" . $plant . "' AND
                kode like '%" . $val . "%' AND
                approved = 1
                $CLAUSE
            LIMIT
                100
        "
    );
    $R_Data = $DB->Row($Q_Data);
    
    if($R_Data > 0) {
    
        $i = 0;
        while($Data = $DB->Result($Q_Data)) {
            $return['destination'][$i] = $Data;
            $i++;
        }
    }
    //=> END : JO
}

echo Core::ReturnData($return);
?>