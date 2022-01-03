<?php

$Modid = 51;
Perm::Check($Modid, 'verify');

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
    'def'       => 'jv',
    'ast_cip'   => 'ast_detail_cip'
);

/**
 * Update Verify
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'         => $Table['def'],
    'clause'        => "WHERE id = '" . $id . "'",
    'action'        => "verify",
    'description'   => "Verify Journal Entry " . $kode
);
$History = Core::History($HistoryField);

$Field = array(
    'verified'      => 1,
    'verified_by'   => Core::GetState('id'),
    'verified_date' => $Date,
    'history'       => $History
);

$DB->ManualCommit();

$list = json_decode($list, true);

if ($DB->Update(
    $Table['def'],
    $Field,
    "id = '" . $id . "'"
)) {
    for ($i = 0; $i < sizeof($list); $i++) {
        if ($ref_type == 1 && $list[$i]['ref_cip'] != 0) {
            $amount = 0;
            if ($list[$i]['credit'] == 0) {
                $amount = $list[$i]['debit'];
            } else {
                $amount = $list[$i]['credit'];
            }

            $Field = array(
                'header'        => $list[$i]['ref_cip'],
                'year'          => date("Y", strtotime($tanggal)),
                'month'         => date("m", strtotime($tanggal)),
                'coa_cip'       => $list[$i]['id'],
                'coa_kode_cip'  => $list[$i]['kode'],
                'coa_nama_cip'  => $list[$i]['nama'],
                'doc_id'        => 7,
                'doc_source'    => 'Finance & Accounting',
                'doc_nama'      => 'Journal Voucher',
                'ref_kode'      => $kode,
                'amount'        => $amount
            );

            $DB->Insert(
                $Table['ast_cip'],
                $Field
            );
        }

        if ($list[$i]['credit'] == 0) {
            $Jurnal = App::JurnalPosting(array(
                'trx_type'      => 7,
                'tipe'          => 'debit',
                'company'       => $company,
                'source'        => $kode,
                'target'        => $kode,
                'currency'      => 'IDR',
                'rate'          => 1,
                'coa'           => $list[$i]['id'],
                'value'         => $list[$i]['debit'],
                'kode'          => $kode,
                'tanggal'       => $tanggal,
                'keterangan'    => $list[$i]['memo']
            ));

            //=> / END : Insert to Jurnal Posting and Update Balance

            $return['jurnalPosting'][$i] = $Jurnal['msg'];
        } else if ($list[$i]['debit'] == 0) {
            $Jurnal = App::JurnalPosting(array(
                'trx_type'      => 7,
                'tipe'          => 'credit',
                'company'       => $company,
                'source'        => $kode,
                'target'        => $kode,
                'currency'      => 'IDR',
                'rate'          => 1,
                'coa'           => $list[$i]['id'],
                'value'         => $list[$i]['credit'],
                'kode'          => $kode,
                'tanggal'       => $tanggal,
                'keterangan'    => $list[$i]['memo']
            ));

            //=> / END : Insert to Jurnal Posting and Update Balance

            $return['jurnalPosting'][$i] = $Jurnal['msg'];
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
// => / END: Update Verify

echo Core::ReturnData($return);

?>