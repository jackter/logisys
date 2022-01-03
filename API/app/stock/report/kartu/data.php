<?php
$Modid = 87;

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
    'def'       => 'stock'
);

$CLAUSE = "
    WHERE
        id != '' AND 
        tanggal BETWEEN '" . $fdari . " 00:00:00' AND '" . $fhingga . " 23:59:59'
";

if (!empty($company)) {
    $CLAUSE .= "
        AND company = '" . $company . "'
    ";
}
if (!empty($storeloc)) {
    $CLAUSE .= "
        AND storeloc = '" . $storeloc . "'
    ";
}

$Q_Data = $DB->Query(
    $Table['def'],
    array('id'),
    $CLAUSE
);
$R_Data = $DB->Row($Q_Data);

if($R_Data > 0){
    $Q_Data = $DB->Query(
        $Table['def'],
        array(
            'id',
            'ref_kode',
            'company',
            'storeloc',
            'storeloc_kode',
            'storeloc_nama',
            'item',
            'item_kode',
            'item_nama',
            'item_satuan',
            'keterangan',
            'debit',
            'credit',
            // 'saldo',
            'tanggal',
            // 'saldo_akhir'
        ),
        $CLAUSE .
        "
            ORDER BY
                storeloc ASC,
                tanggal ASC,
                create_date ASC,
                id ASC
        "
    );

    $i = 0;
    $no = 1;
    $DefinedSaldo = [];
    while($Data = $DB->Result($Q_Data)){

        $return['data'][$i] = $Data;
        $return['data'][$i]['no'] = $no;

        $FormattedValue = $Data['item'] . "#" . $Data['company'] . "#" . $Data['storeloc'];
        if(!in_array($FormattedValue, $DefinedSaldo)){

            $DefinedSaldo[] = $FormattedValue;

            $Saldo = App::GetOpeningStockLedger(array(
                'company'   => $Data['company'],
                'storeloc'  => $Data['storeloc'],
                'item'      => $Data['item'],
                'tanggal'   => $Data['tanggal']
            ));
            // $SaldoAkhir = $Saldo + $Data['debit'] - $Data['credit'];

            $return['data'][$i]['saldo'] = $Saldo;
            $return['data'][$i]['is_open_saldo'] = 1;
            // $return['data'][$i]['saldo_akhir'] = $SaldoAkhir;


        }

        $i++;
        $no++;
    }
}
echo Core::ReturnData($return);

?>