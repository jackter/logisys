<?php
$Modid = 136;

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
    'def'     => 'journal',
    'item' => 'item'
);


$CLAUSE = "
    WHERE
        id != ''
";

$CLAUSE .= "
    AND tanggal BETWEEN '" . $fdari . "' AND '" . $fhingga . "'
";

if(!empty($company)){
    $CLAUSE .= "
        AND company = $company
    ";
}

$Check = $DB->Row($DB->Query(
    $Table['def'],
    array(
        'id'
    ),
    $CLAUSE
));

if($Check > 0){

    $Q_TGL = $DB->Query(
        $Table['def'],
        array(
            'tanggal'
        ),
        $CLAUSE .
        "
            GROUP BY tanggal
            ORDER BY tanggal
        "
    );
    $i = 0;
    while($TGL = $DB->Result($Q_TGL)){

        $return['data'][$i] = $TGL;

        $Q_Data = $DB->Query(
            $Table['def'],
            array(
                'company_abbr',
                'ref_kode',
                'source_kode',
                'target_kode',
                'item',
                'currency',
                'rate',
                'tanggal',
                'coa',
                'coa_kode',
                'coa_nama',
                'debit',
                'credit',
                'keterangan'
            ),
            $CLAUSE .
            "
                AND
                    tanggal = '".$TGL['tanggal']."'

                ORDER BY tanggal
            "
        );
        $R_Data = $DB->Row($Q_Data);

        if($R_Data > 0){
            $j = 0;
            while($Data = $DB->Result($Q_Data)){

                $return['data'][$i]['detail'][$j] = $Data;

                $return['data'][$i]['detail'][$j]['account'] = $Data['coa_kode'] ." - ". $Data['coa_nama'];

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

                    $return['data'][$i]['detail'][$j]['keterangan'] = $Keterangan;

                }

                $j++;
            }

        }
        
        $i++;
    }
    
}

echo Core::ReturnData($return);
?>