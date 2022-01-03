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

$return['permissions'] = Perm::Extract($Modid);

$Table = array(
    'def'       => 'journal',
    'item'      => 'item'
);

$CLAUSE = "
    WHERE
        company = '".$company."' AND
        coa_kode >= '".$coa_kode_from."' AND
        coa_kode <= '".$coa_kode_to."'
";

if($fdari && $fhingga) {
    $CLAUSE .= "
        AND
            tanggal BETWEEN '" . $fdari . "' AND '" . $fhingga . "'
    ";
}

if(isset($coa) && $coa != ''){
    $CLAUSE .= "
        AND coa = '" . $coa . "'
    ";
}

$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'coa',
        'coa_kode', 
        'coa_nama',
        'debit',
        'credit'
    ),
    "
        $CLAUSE
        GROUP BY
            coa_kode
        ORDER BY 
            coa_kode ASC,
            tanggal ASC,
            create_date ASC 
    "
);

$R_Data = $DB->Row($Q_Data);
if($R_Data > 0){

    $i = 0;
    while($Data = $DB->Result($Q_Data)){

        $return['data'][$i] = $Data;

        /**
         * Get COA Balance
         */
        /*$Q_Bal = $DB->Query(
            $Table['def'] . "_balance",
            array(
                'opening_balance'
            ),
            "
                WHERE 
                    coa = '" . $Data['coa'] . "' AND 
                    company = '" . $company . "' AND 
                    `year` = '" . $TAHUN . "' AND 
                    `month` = '" . $BULAN . "'
            "
        );
        $R_Bal = $DB->Row($Q_Bal);
        if($R_Bal > 0){
            $Bal = $DB->Result($Q_Bal);

            // print_r($Bal);

            $return['data'][$i]['opening_balance'] = $Bal['opening_balance'];
            $return['data'][$i]['balance'] = $Bal['balance'];
        }*/

        /**--------------------- */

        $Q_Bal = $DB->Query(
            $Table['def'] . "_balance",
            array(
                'coa',
                'opening_balance'
            ),
            "
                WHERE
                    company = '" . $company . "' AND 
                    `year` BETWEEN DATE_FORMAT('" . $fdari . "', '%Y') and DATE_FORMAT('" . $fhingga . "', '%Y') AND
                    `month` BETWEEN DATE_FORMAT('" . $fdari . "', '%m') and DATE_FORMAT('" . $fhingga . "', '%m') AND
                    coa = '" . $Data['coa'] . "'
            "
        );
        $R_Bal = $DB->Row($Q_Bal);
        
        if($R_Bal > 0){
            $fdari_day = date('d', strtotime($fdari));
            $Bal = $DB->Result($Q_Bal);
            if($fdari_day > 1){
                $Q_DetailForBalance = $DB->Query(
                    $Table['def'],
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

                    $return['data'][$i]['opening_balance'] = $Bal['opening_balance'] + $DetailForBalance['total_debit'] + $DetailForBalance['total_credit'];
                    
                }
                else{
                    $return['data'][$i]['opening_balance'] = $Bal['opening_balance'];
                }
            }
            else{
                $return['data'][$i]['opening_balance'] = $Bal['opening_balance'];
            }
        }
        else{
            $return['data'][$i]['opening_balance'] = 0;
        }
        //=> / END : Get COA Balance

        /**
         * Detail
         */
        $Q_Detail = $DB->Query(
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
                'concat(cost_center_kode, " - ", cost_center_nama)' => 'cost_center',
                'item',
                'pihak_ketiga_nama',
                'job_alocation_nama',
                'keterangan'
            ),
            "
                $CLAUSE AND

                coa_kode = '".$Data['coa_kode']."'

                ORDER BY 
                    coa_kode ASC,
                    tanggal ASC,
                    create_date ASC
            "
        );

        $R_Detail = $DB->Row($Q_Detail);
        if($R_Detail > 0){
            $j = 0;
            while($Detail = $DB->Result($Q_Detail)){

                $return['data'][$i]['detail'][$j] = $Detail;

                if(
                    !empty($Detail['item'])
                ){
                    $Item = $DB->Result($DB->Query(
                        $Table['item'],
                        array(
                            'nama2' => 'nama',
                            'kode'
                        ),
                        "WHERE id = '" . $Detail['item'] . "'"
                    ));

                    $return['data'][$i]['detail'][$j]['item_nama'] = $Item['nama'];

                }

                $j++;
            }
        }
        // => End Detail

        $i++;
    }

    $return['status'] = 1;

}else{
    $return['status'] = 0;
}

echo Core::ReturnData($return);
?>