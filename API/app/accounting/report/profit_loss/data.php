<?php
$Modid = 128;

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
    'def'     => 'coa_master',
    'jnl'     => 'journal'
);

if(isset($bs_date_send)){
    $Exbs_date_send = explode("-", $bs_date_send);
    $TAHUN_START = $Exbs_date_send[0];
    $BULAN_START = ltrim($Exbs_date_send[1], 0);
}

$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'id',
        'company',
        'company_abbr',
        'company_nama',
        'kode', 
        'nama',
        'is_h',
        'type',
        'concat(kode, " - ", nama)' => 'account',
        'lv1',
        'lv2',
        'lv3',
        'lv4',
        'lv5'
    ),
    "
        WHERE
            company = '".$company."' AND 
            status != 0
        ORDER BY 
            kode ASC
    "
);

$R_Data = $DB->Row($Q_Data);
if($R_Data > 0){

    $i = 0;
    while($Data = $DB->Result($Q_Data)){

        $return['data'][$i] = $Data;

        $i++;
    }

    $return['status'] = 1;

}else{
    $return['status'] = 0;
}

/**
 * COA Jurnal
 */
$Q_Detail = $DB->Query(
    $Table['jnl'],
    array(
        'coa',
        'SUM(debit)' => 'total_debit', 
        'SUM(credit)' => 'total_credit'
    ),
    "
        WHERE
            tanggal BETWEEN '" . $bs_date_send . "-01' and '" . date("Y-m-t", strtotime($bs_date_send."-31")) . "' AND
            company = " . $company. "
        GROUP BY
            coa_kode    
        ORDER BY 
            coa_kode ASC
    "
);

$R_Detail = $DB->Row($Q_Detail);
if($R_Detail > 0){

    while($Detail = $DB->Result($Q_Detail)){

        $return['jurnal'][] = $Detail;

    }
    
}
//=> / END : COA Jurnal

 /**
 * Get COA Balance
 */
$Q_Bal = $DB->Query(
    $Table['jnl'] . "_balance",
    array(
        'coa',
        'opening_balance',
        'balance'
    ),
    "
        WHERE 
            company = '" . $company . "' AND 
            `year` BETWEEN '" . $TAHUN_START . "' and '".$TAHUN_END."' AND
            `month` BETWEEN '" . $BULAN_START . "' and '".$BULAN_END."'
    "
);
$R_Bal = $DB->Row($Q_Bal);

if($R_Bal > 0){
    while($Bal = $DB->Result($Q_Bal)){

        $return['balance'][] = $Bal;
    }
}
//=> / END : Get COA Balance

echo Core::ReturnData($return);
?>