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
    'def'           => 'wb_kontrak',
    'trx'           => 'wb_transaksi'
);

$CLAUSE = "
    WHERE
        id != '' AND 
        finish != 1
";

if($keyword != '' && isset($keyword)){
    $CLAUSE .= " 
        AND kode LIKE '%" . $keyword . "%'
    ";
}

/**
 * Get Data
 */
$Q_Kontrak = $DB->Query(
    $Table['def'],
    array(
        'id',
        'kode'
    ),
    $CLAUSE .
    "
        ORDER BY
            create_date
    "
);
$R_Kontrak = $DB->Row($Q_Kontrak);
if($R_Kontrak > 0){

    $i = 0;
    while($Kontrak = $DB->Result($Q_Kontrak)){

        $return[$i] = $Kontrak;

        /**
         * Get Traksaksi
         */
        $Q_Transaksi = $DB->Query(
            $Table['trx'],
            array(
                'id',
                'kode',
                'sup_cust',
                'sup_cust_nama',
                'transporter',
                'transporter_nama',
                'ticket_no',
                'pks',
                'weigh_in',
                'weigh_out',
                'netto',
                'veh_nopol',
                'create_date'
            ),
            "
                WHERE
                    contract = '".$Kontrak['id']."' AND
                    netto != '' AND
                    grn = 0
            "
        );

        $R_Transaksi = $DB->Row($Q_Transaksi);
        if($R_Transaksi > 0){

            $j = 0;
            while($Transaksi = $DB->Result($Q_Transaksi)){

                $return[$i]['transaksi'][$j] = $Transaksi;
                $return[$i]['transaksi'][$j]['weigh_in'] = (int)$Transaksi['weigh_in'];
                $return[$i]['transaksi'][$j]['weigh_out'] = (int)$Transaksi['weigh_out'];
                $return[$i]['transaksi'][$j]['netto'] = (int)$Transaksi['netto'];

                $return[$i]['transaksi'][$j]['create_date'] = date('d/m/Y', strtotime($Transaksi['create_date']));

                $j++;
            }
        }
        //=> End Get Transaksi
        $i++;
    }
}
//=> / END : Get Data

echo Core::ReturnData($return);
?>