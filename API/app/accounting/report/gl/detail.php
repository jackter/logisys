<?php
$Modid = 54;

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

$Table = array(
    'def'       => 'journal',
    'item'      => 'item'
);

$CLAUSE = "
    WHERE
        company = '".$company."' AND
        ref_kode = '" . $ref_kode . "'
";

if(empty($limit)){
    $limit = 10;
}
if(empty($offset)){
    $offset = 0;
}

$start = $offset * $limit;

$return['start']        = 0;
$return['limit']        = $limit;
$return['count']        = 0;

$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'tanggal', 
        'ref_kode', 
        'doc_source',
        'doc_nama',
        'coa_kode', 
        'coa_nama',
        'concat(coa_kode, " - ", coa_nama)' => 'account',
        'debit', 
        'credit', 
        'item',
        'keterangan'
    ),
    "
        $CLAUSE

        ORDER BY 
            debit DESC,
            coa_kode ASC,
            tanggal ASC
    "
);

$R_Data = $DB->Row($Q_Data);
if($R_Data > 0){

    $return['start']    = $start;
    $return['limit']    = $limit;
    $return['count']    = $R_Data;

    $i = 0;
    while($Data = $DB->Result($Q_Data)){

        $return['data'][$i] = $Data;

        if(
            empty($Data['keterangan']) && 
            !empty($Data['item'])
        ){
            $Item = $DB->Result($DB->Query(
                $Table['item'],
                array(
                    'nama2' => 'nama',
                    'kode'
                ),
                "WHERE id = '" . $Data['item'] . "'"
            ));

            $Keterangan = $Item['nama'];

            $return['data'][$i]['keterangan'] = $Keterangan;

        }

        $i++;
    }
}


echo Core::ReturnData($return);
?>