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
    'def'       => 'mto',
    'detail'    => 'mto_detail'
);

$CLAUSE = "";
if($keyword != '' && isset($keyword)){
    $CLAUSE .= " 
        AND kode LIKE '%" . $keyword . "%'
    ";
}

/**
 * Get Data
 */
$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'id',
        'kode',
        'company',
        'company_abbr',
        'company_nama',
        'company_to',
        'company_abbr_to',
        'company_nama_to',
        'from_storeloc',
        'from_storeloc_kode',
        'to_storeloc',
        'to_storeloc_kode'
    ),
    "
        WHERE
            company_to = '" . $company . "' AND
            approved = 1 AND
            finish = 0
            $CLAUSE
    "
);
$R_Data = $DB->Row($Q_Data);

if($R_Data > 0){

    $i = 0;
    while($Data = $DB->Result($Q_Data)){

        $return[$i] = $Data;

        /**
         * Get Detail
         */
        $Q_Detail = $DB->QueryPort("
            SELECT
                D.id as detail_id,
                D.item as id,
                D.item,
                D.qty as qty_mto,
                D.qty_os as qty_mto_os,
                D.price,
                I.kode as kode,
                TRIM(I.nama) as nama,
                I.satuan,
                I.in_decimal
            FROM
                item AS I,
                " . $Table['detail'] . " AS D
            WHERE
                D.header = '" . $Data['id'] . "' AND
                D.item = I.id
        ");
        $R_Detail = $DB->Row($Q_Detail);

        if($R_Detail > 0){

            $j = 0;
            while($Detail = $DB->Result($Q_Detail)){

                $return[$i]['list'][$j] = $Detail;
                $j++;
            }
        }
        //=> END : Get Detail

        $i++;
    }
}
//=> END : Get Data

echo Core::ReturnData($return);
?>