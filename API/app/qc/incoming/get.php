<?php
$Modid = 121;

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
    'def'       => 'wb_transaksi'
);

/**
 * Get Data
 */
$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'id',
        'sup_cust_nama',
        'transporter_nama',
        'veh',
        'veh_nopol',
        'contract_no',
        'do_no',
        'seal_no',
        'ticket_no',
        'driver_nama',
        'pks',
        'bruto_src',
        'tara_src',
        'netto_src',
        'weigh_in',
        'weigh_out',
        'netto',
        'remarks',
        'ffa_qc',
        'mai_qc',
        'dobi_qc',
        'date_src',
        'create_date'
    ),
    "
        WHERE
            id = '" . $id . "'
    "
);
$R_Data = $DB->Row($Q_Data);

if($R_Data > 0){
    $Data = $DB->Result($Q_Data);

    if($Data['ffa_qc'] == 0){
        $Data['ffa_qc'] = NULL;
    }
    if($Data['mai_qc'] == 0){
        $Data['mai_qc'] = NULL;
    }

    $return['data'] = $Data;
}
//=> / END : Get Data

echo Core::ReturnData($return);
?>