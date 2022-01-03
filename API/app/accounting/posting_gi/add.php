<?php

$Modid = 50;
Perm::Check($Modid, 'add');

//=> Default Statement
$return = [];
$RPL    = "";
$SENT    = Core::Extract($_POST, $RPL);

//=> Extract Array
if (isset($SENT)) {
    foreach ($SENT as $KEY => $VAL) {
        $$KEY = $VAL;
    }
}

$Table = array(
    'def'       => 'gi',
    'detail'    => 'gi_detail'
);

/**
 * Field
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'         => $Table['def'],
    'clause'        => "WHERE id = '" . $id . "'",
    'action'        => "add",
    'description'   => "Posting Outstanding GI"
);
$History = Core::History($HistoryField);

$LIST = json_decode($list, true);

$Field = array(
    'jurnal'         => 1,
    'update_by'      => Core::GetState('id'),
    'update_date'    => $Date,
    'history'        => $History
);

$DB->ManualCommit();

if ($DB->Update(
    $Table['def'],
    $Field,
    "
        id = '" . $id . "'
    "
)) {
    for ($i = 0; $i < sizeof($LIST); $i++) {

        $Field = array(
            'cost_center'       => $LIST[$i]['cost_center'],
            'cost_center_kode'  => $LIST[$i]['cost_center_kode'],
            'cost_center_nama'  => $LIST[$i]['cost_center_nama'],
            'coa'               => $LIST[$i]['coa'],
            'coa_kode'          => $LIST[$i]['coa_kode'],
            'coa_nama'          => $LIST[$i]['nama'],
        );

        if ($DB->Update(
            $Table['detail'],
            $Field,
            "
                id = '" . $LIST[$i]['detail_id'] . "'
            "
        )) {
            /**
             * Select Item COA
             */
            $Q_COA_Item = $DB->Query(
                "item_coa",
                array(
                    'id',
                    'item_type',
                    'coa_persediaan',
                    'coa_penjualan',
                    'coa_disc_penjualan',
                    'coa_retur_penjualan',
                    'coa_retur_pembelian',
                    'coa_hpp',
                    'coa_accrued',
                    'coa_beban'
                ),
                "
                WHERE 
                    item_id = '" . $LIST[$i]['id'] . "'
                    AND company = " . $company . "
                "
            );
            $R_COA_Item = $DB->Row($Q_COA_Item);
            if ($R_COA_Item > 0) {
                $COA_Item = $DB->Result($Q_COA_Item);

                if (!$LIST[$i]['cost_center_kode']) {
                    $LIST[$i]['cost_center_kode'] = "X";
                }

                $Jurnal = App::JurnalPosting(array(
                    'trx_type'      => 2,
                    'tipe'          => 'debit',
                    'company'       => $LIST[$i]['company'],
                    'source'        => $LIST[$i]['storeloc_kode'],
                    'target'        => $LIST[$i]['cost_center_kode'],
                    'target_2'      => $LIST[$i]['id'],
                    'currency'      => 'IDR',
                    'rate'          => 1,
                    'coa'           => $LIST[$i]['coa'],
                    'value'         => ($LIST[$i]['qty_gi'] * $LIST[$i]['price']),
                    'kode'          => $LIST[$i]['gi_kode'],
                    'tanggal'       => $LIST[$i]['tanggal'],
                    'keterangan'    => $LIST[$i]['remarks']
                ));
                //=> / END : Insert to Jurnal Posting and Update Balance

                if ($COA_Item['item_type'] == 1) {
                    $Jurnal = App::JurnalPosting(array(
                        'trx_type'      => 2,
                        'tipe'          => 'credit',
                        'company'       => $LIST[$i]['company'],
                        'source'        => $LIST[$i]['storeloc_kode'],
                        'target'        => $LIST[$i]['cost_center_kode'],
                        'target_2'      => $LIST[$i]['id'],
                        'currency'      => 'IDR',
                        'rate'          => 1,
                        'coa'           => $COA_Item['coa_persediaan'],
                        'value'         => ($LIST[$i]['qty_gi'] * $LIST[$i]['price']),
                        'kode'          => $LIST[$i]['gi_kode'],
                        'tanggal'       => $LIST[$i]['tanggal'],
                        'keterangan'    => $LIST[$i]['remarks']
                    ));
                    //=> / END : Insert to Jurnal Posting and Update Balance

                    $return['detail'][$i]['jurnalPostingCredit'] = $Jurnal['msg'];
                } else if ($COA_Item['item_type'] == 2) {
                    $Jurnal = App::JurnalPosting(array(
                        'trx_type'      => 2,
                        'tipe'          => 'credit',
                        'company'       => $LIST[$i]['company'],
                        'source'        => $LIST[$i]['storeloc_kode'],
                        'target'        => $LIST[$i]['cost_center_kode'],
                        'target_2'      => $list[$i]['id'],
                        'currency'      => 'IDR',
                        'rate'          => 1,
                        'coa'           => $COA_Item['coa_beban'],
                        'value'         => ($LIST[$i]['qty_gi'] * $LIST[$i]['price']),
                        'kode'          => $LIST[$i]['gi_kode'],
                        'tanggal'       => $LIST[$i]['tanggal'],
                        'keterangan'    => $LIST[$i]['remarks']
                    ));
                    //=> / END : Insert to Jurnal Posting and Update Balance

                    $return['detail'][$i]['jurnalPostingCredit'] = $Jurnal['msg'];
                }

                $return['detail'][$i]['jurnalPostingDebit'] = $Jurnal['msg'];
            }
        }
    }

    $DB->Commit();
    $return['status'] = 1;
} else {
    $return = array(
        'status'    => 0,
        'error_msg' => $GLOBALS['mysql']->error
    );
}
//=> / END : Field

echo Core::ReturnData($return);

?>