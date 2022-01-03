<?php
$Modid = 83;

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
    'def'       => 'wb_grn',
    'trx'       => 'wb_transaksi'
);

/**
 * Get Data
 */
$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'id',
        'kode',
        'kontrak',
        'kontrak_kode',
        'id_trx',
        'verified',
        'verified_by',
        'verified_date',
        'note'
    ),
    "
        WHERE id = '" . $id . "'
    "
);
$R_Data = $DB->Row($Q_Data);
if($R_Data > 0){

    $Data = $DB->Result($Q_Data);

    $return['data'] = $Data;
    $return['data']['check_all'] = true;

    $Q_TRX = $DB->Query(
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
                id IN (".$Data['id_trx'].")
        "
    );
    $R_TRX = $DB->Row($Q_TRX);
    if($R_TRX > 0){
        $i = 0;
        while($TRX = $DB->Result($Q_TRX)){

            $return['data']['list'][$i] = $TRX;
            $return['data']['list'][$i]['check_list'] = true;

            $return['data']['list'][$i]['weigh_in'] = (int)$TRX['weigh_in'];
            $return['data']['list'][$i]['weigh_out'] = (int)$TRX['weigh_out'];
            $return['data']['list'][$i]['netto'] = (int)$TRX['netto'];

            $return['data']['list'][$i]['create_date'] = date('d/m/Y', strtotime($TRX['create_date']));

            $i++;
        }

    }

}

echo Core::ReturnData($return);
?>