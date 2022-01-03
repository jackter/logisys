<?php
$Modid = 211;

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

$return['permissions'] = Perm::Extract($Modid);

$CLAUSE = "
    WHERE
        company = '" . $company . "'
";

if($fdari && $fhingga) {
    $CLAUSE .= "
        AND
            tanggal BETWEEN '" . $fdari . "' AND '" . $fhingga . "'
    ";
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
        'concat(kode, " - ", nama)' => 'account'
    ),
    "
        WHERE
            company = '" . $company . "' AND 
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
        $return['data'][$i]['has_child'] = 0;

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
        $CLAUSE
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
            `year` BETWEEN DATE_FORMAT('" . $fdari . "', '%Y') and DATE_FORMAT('" . $fhingga . "', '%Y') AND
            `month` BETWEEN DATE_FORMAT('" . $fdari . "', '%m') and DATE_FORMAT('" . $fhingga . "', '%m')
    "
);
$R_Bal = $DB->Row($Q_Bal);

if($R_Bal > 0){
    $fdari_day = date('d', strtotime($fdari));
    while($Bal = $DB->Result($Q_Bal)){
        if($fdari_day > 1){
            $Q_DetailForBalance = $DB->Query(
                $Table['jnl'],
                array(
                    'coa',
                    'SUM(debit)' => 'total_debit', 
                    'SUM(credit)' => 'total_credit'
                ),
                "
                    WHERE
                        company = '" . $company . "' AND
                        coa = '" . $Bal['coa'] . "' AND
                        tanggal BETWEEN '" . date('Y-m-01', strtotime($fdari)) . "' AND '" . date('Y-m-'. ($fdari_day - 1), strtotime($fdari)) . "'
                    GROUP BY
                        coa_kode    
                    ORDER BY 
                        coa_kode ASC
                "
            );
            
            $R_DetailForBalance = $DB->Row($Q_DetailForBalance);
            if($R_DetailForBalance > 0){
            
                $DetailForBalance = $DB->Result($Q_DetailForBalance);

                $Bal['opening_balance'] = $Bal['opening_balance'] + $DetailForBalance['total_debit'] + $DetailForBalance['total_credit'];
                $return['balance'][] = $Bal;
                
            }
            else{
                $return['balance'][] = $Bal;
            }
        }
        else{
            $return['balance'][] = $Bal;
        }
    }
}
//=> / END : Get COA Balance

echo Core::ReturnData($return);
?>