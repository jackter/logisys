<?php

$Modid = 109;
Perm::Check($Modid, 'approve');

//=> Default Statement
$return = [];
$RPL    = "";
$SENT   = Core::Extract($_POST, $RPL);

//=> Extract Array
if (isset($SENT)) {
    foreach ($SENT as $KEY => $VAL) {
        $$KEY = $VAL;
    }
}

$Table = array(
    'def'       => 'sp3',
    'detail'    => 'sp3_jv_detail',
    'exchange'      => 'exchange',
    'param'         => 'parameter'
);

/**
 * Update Approve
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'         => $Table['def'],
    'clause'        => "WHERE id = '" . $id . "'",
    'action'        => "approve",
    'description'   => "Approve SP3 " . $kode
);
$History = Core::History($HistoryField);

// Comment sementara akunting belum aktif
// $Q_Detail = $DB->QueryPort("
//     SELECT
//         round(x.total, 2) sp3_total,
//         round(sum( y.debit ), 2) jv_total
//     FROM
//         sp3 x LEFT JOIN sp3_jv_detail y ON x.id = y.header 
//     WHERE
//         x.id = $id
// ");
// $R_Detail = $DB->Row($Q_Detail);

// if ($R_Detail > 0) {
//     $Detail = $DB->Result($Q_Detail);

//     if ($Detail['jv_total']) {
//         $return['status'] = 4;
//     } else {
//         $return['status'] = 2;
//     }
// }

$return['status'] = 4;

$Field = array(
    'approved'      => 1,
    'approved_by'   => Core::GetState('id'),
    'approved_date' => $Date,
    'history'       => $History
);

$DB->ManualCommit();

if ($return['status'] == 4) {
    if ($DB->Update(
        $Table['def'],
        $Field,
        "id = '" . $id . "'"
    )) {

        $P3 = $DB->Result($DB->Query(
            $Table['def'],
            array(
                'kode'
            ),
            "
                WHERE
                    id = '" . $id . "'
            "
        ));

        $Q_Detail = $DB->QueryPort("
            SELECT
                x.company,
                x.kode,
                x.tanggal,
                x.currency,
                x.cost_center_kode,
                y.coa,
                y.debit,
                y.credit,
                y.keterangan
            FROM
                sp3 x, sp3_jv_detail y 
            WHERE
                x.id = y.header AND
                x.id = $id
        ");
        $R_Detail = $DB->Row($Q_Detail);

        if ($R_Detail > 0) {
            $j = 0;
            while ($Detail = $DB->Result($Q_Detail)) {

                $rate = 1;

                if($Detail['currency'] != "IDR"){
                    $R_Exchange_Ext = $DB->Row($DB->Query(
                        $Table['param'],
                        array(
                            'param_val'
                        ),
                        "
                            WHERE    
                                id = 'exchange_execution'
                                AND '" . $Detail['tanggal'] . "' <= param_val
                        "
                    ));

                    if($R_Exchange_Ext > 0){
                        $exchange = $DB->Result($DB->Query(
                            $Table['exchange'],
                            array(
                                'rate'
                            ),
                            "
                                WHERE    
                                    tanggal <= '" . $Detail['tanggal'] . "' 
                                    AND cur_kode = '" . $Detail['currency'] . "'
                                ORDER BY tanggal desc 
                                LIMIT 1
                            "
                        ));

                        $rate = $exchange['rate'];
                    }
                    else{
                        $DB->LogError("Exchange rate is not defined at " . $Detail['tanggal'] . " for " . $Detail['currency']);
                        exit();
                    }
                }

                if ($Detail['credit'] == 0) {
                    $Jurnal = App::JurnalPosting(array(
                        'trx_type'      => 11,
                        'tipe'          => 'debit',
                        'company'       => $Detail['company'],
                        'source'        => $Detail['kode'],
                        'target'        => $Detail['cost_center_kode'],
                        'currency'      => $Detail['currency'],
                        'rate'          => $rate,
                        'coa'           => $Detail['coa'],
                        'value'         => $Detail['debit'],
                        'kode'          => $Detail['kode'],
                        'tanggal'       => $Detail['tanggal'],
                        'keterangan'    => $Detail['keterangan']
                    ));

                    //=> / END : Insert to Jurnal Posting and Update Balance

                    $return['jurnalPosting'][$i] = $Jurnal['msg'];
                } else if ($Detail['debit'] == 0) {
                    $Jurnal = App::JurnalPosting(array(
                        'trx_type'      => 11,
                        'tipe'          => 'credit',
                        'company'       => $Detail['company'],
                        'source'        => $Detail['kode'],
                        'target'        => $Detail['cost_center_kode'],
                        'currency'      => $Detail['currency'],
                        'rate'          => $rate,
                        'coa'           => $Detail['coa'],
                        'value'         => $Detail['credit'],
                        'kode'          => $Detail['kode'],
                        'tanggal'       => $Detail['tanggal'],
                        'keterangan'    => $Detail['keterangan']
                    ));

                    //=> / END : Insert to Jurnal Posting and Update Balance

                    $return['jurnalPosting'][$i] = $Jurnal['msg'];
                }

                $j++;
            }
        }

        $DB->Commit();
        $return['status'] = 1;
    }
} else if ($return['status'] == 3) {
    $return['status'] = 3;
} else if ($return['status'] == 2) {
    $return['status'] = 2;
} else {
    $return = array(
        'status'    => 0,
        'error_msg' => $GLOBALS['mysql']->error
    );
}
//=> / END: Update Verify

echo Core::ReturnData($return);

?>