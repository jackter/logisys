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
    'def'       => 'supplier',
    'tipe'      => 'supplier_type'
);

/**
 * Filter
 */
$CLAUSE = "
    WHERE 
        id != '' AND
        status = 1
";

$QSql = $QSqlClause = "";
if(isset($keyword)){
    $Search = Search::Create(
        $keyword,
        array(
            'kode',
            'nama',
            'tipe_nama',
            'alamat',
            'kabkota',
            'provinsi',
            'country_kode',
            'country_nama',
            'cp',
            'cp_manual',
            'cp_telp1',
            'cp_telp2',
            'cp_hp1',
            'cp_hp2',
            'website',
            'keterangan',
        ),
        array(
            16,
            15,
            14,
            13,
            12,
            11,
            10,
            9,
            8,
            7,
            6,
            5,
            4,
            3,
            2,
            1
        )
    );

    if(!empty($Search['query'])){
        $QSql = "," . $Search['query'];
        $QSqlClause = $Search['having'];
    }
}
//=> / END : Filter

/**
 * Extract Data
 */
$Q_Data = $DB->Query(
    $Table['def'],
    array('id'),
    $CLAUSE
);
$R_Data = $DB->Row($Q_Data);
if($R_Data > 0){

    $ORDER = "ORDER BY nama ASC";
    if(!empty($QSql)){
        $ORDER = "ORDER BY relevance DESC";
    }

    $Q_Data = $DB->Query(
        $Table['def'],
        array(
            'id',
            'kode',
            'TRIM(nama)'        => 'nama',
            'jenis' . $QSql
        ),
        $CLAUSE . 
        $QSqlClause . 
        $ORDER .
        "
            LIMIT 100
        "
    );

    $i = 0;
    while($Data = $DB->Result($Q_Data)){
        $return[$i] = $Data;

        $i++;
    }
}
//=> / END : Extract Data

echo Core::ReturnData($return);
?>