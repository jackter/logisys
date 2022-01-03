<?php
$Modid = 114;

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
    'def'       => 'jo',
    'sr'        => 'sr',
    'stok'      => 'stock'
);

$CLAUSE = "
    WHERE
        id != '' AND 
        approved = 1 AND
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

// $return['clause'] = $CLAUSE;

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
            'kode',
            'tanggal'
        ),
        $CLAUSE .
        "
            ORDER BY
                create_date DESC
        "
    );

    $i = 0;
    while($Data = $DB->Result($Q_Data)){

        $return['data'][$i] = $Data;

        $Q_SR = $DB->Query(
            $Table['sr'],
            array('kode'),
            "
                WHERE
                    jo = '".$Data['id']."'
            "
        );
        $R_SR = $DB->Row($Q_SR);
        if($R_SR > 0 ){
            $AllSR = [];
            while($SR = $DB->Result($Q_SR)){
                $AllSR[] = $SR['kode'];
            }

            /**
             * Get Jurnal Stock
             */
            $Q_Stock = $DB->Query(
                $Table['stok'],
                array(
                    'id',
                    'ref_kode',
                    'item',
                    'item_kode',
                    'item_nama',
                    'keterangan',
                    'debit',
                    'credit',
                    'saldo',
                    'tanggal',
                    'saldo_akhir'
                ),
                "
                    WHERE
                        ref_kode IN ('" . implode("','", $AllSR) ."') AND
                        tanggal BETWEEN '" . $fdari . " 00:00:00' AND '" . $fhingga . " 23:59:59'
                    ORDER BY
                        tanggal ASC
                "
            );
            $R_Stock = $DB->Row($Q_Stock);

            if($R_Data > 0){

                $j = 0;
                while($Stock = $DB->Result($Q_Stock)){
            
                    $return['data'][$i]['detail'][$j] = $Stock;
            
                    $j++;
            
                }
            }
            //=> End Get Jurnal Stock
        }

        $i++;
    }

}

echo Core::ReturnData($return);
?>