<?php
$Modid = 91;

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
    'def'       => 'wb_transaksi'
);

$CLAUSE = "
    WHERE
        id != '' AND 
        w_in_date BETWEEN '" . $fdari . " 00:00:00' AND '" . $fhingga . " 23:59:59'
";

if(!empty($product)){
    $CLAUSE .= "
        AND product = '" . $product . "' 
    ";
}

$return['clause'] = $CLAUSE;

if(!empty($wb)){
    $CLAUSE .= "
        AND wb = '" . $wb . "'
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
            'kode',
            'w_in_date',
            'w_out_date',
            'product',
            'veh_nopol',
            'contract_no',
            'do_no',
            'transporter_nama',
            'weigh_in',
            'weigh_out',
            'netto',
            'bruto_src',
            'tara_src',
            'netto_src',
            'pks'
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

        /**
         * Get Product
         */
        $Q_Product = $DB->Query(
            "wb_produk",
            array(
                'nama'
            ),
            "
                WHERE
                    id = '" . $Data['product'] . "'
            "
        );
        $R_Product = $DB->Row($Q_Product);

        if($R_Product > 0){
            $Product = $DB->Result($Q_Product);
            $return['data'][$i]['product'] = $Product['nama'];
        }
        //=> END : Get Product

        $i++;
    }

}

echo Core::ReturnData($return);
?>