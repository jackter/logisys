<?php

$Modid = 51;
Perm::Check($Modid, 'add');

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
    'def'    => 'jv',
    'detail' => 'jv_detail'
);

$dept_abbr = "ACC";

/**
 * Create Code
 */
$Time = date('y') . "/";
$Time2 = romawi(date('n')) . "/";
$InitialCode = "JV/" . strtoupper($company_abbr) . "/" . $Time . $Time2;
$InitialCodeCheck = "JV/" . strtoupper($company_abbr) . "/" . $Time;
$Len = 4;
$LastKode = $DB->Result($DB->Query(
    $Table['def'],
    array('kode'),
    "
        WHERE
            kode LIKE '" . $InitialCodeCheck . "%' 
        ORDER BY 
            SUBSTR(kode, -$Len, $Len) DESC
    "
));
$LastKode = (int)substr($LastKode['kode'], -$Len) + 1;
$LastKode = str_pad($LastKode, $Len, 0, STR_PAD_LEFT);

$kode = $InitialCode . $LastKode;
//=> / END : Create Code

/**
 * Field
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'         => $Table['def'],
    'clause'        => "WHERE kode = '" . $kode . "'",
    'action'        => "add",
    'description'   => "Create Journal Entry (" . $kode . ")"
);
$History = Core::History($HistoryField);

$LIST = json_decode($list, true);

$Field = array(
    'company'       => $company,
    'company_abbr'  => $company_abbr,
    'company_nama'  => $company_nama,
    'kode'          => $kode,
    'tanggal'       => $tanggal_send,
    'note'          => $note,
    'ref_type'      => $ref_type,
    'jv_type'       => 1,
    'total_credit'  => $creditTotal,
    'total_debit'   => $debitTotal,
    'create_by'     => Core::GetState('id'),
    'create_date'   => $Date,
    'history'       => $History,
    'status'        => 1
);

$DB->ManualCommit();

if ($DB->Insert(
    $Table['def'],
    $Field
)) {
    /**
     * Insert Detail
     */
    $Q_Header = $DB->Query(
        $Table['def'],
        array('id'),
        "
            WHERE
                kode = '" . $kode . "' AND
                create_date = '" . $Date . "'
        "
    );
    $R_Header = $DB->Row($Q_Header);
    if ($R_Header > 0) {

        $Header = $DB->Result($Q_Header);

        for ($i = 0; $i < sizeof($LIST); $i++) {
            if (!empty($LIST[$i]['id'])) {

                $FieldDetail = array(
                    'header'        => $Header['id'],
                    'ref_cip'       => $LIST[$i]['ref_cip'],
                    'ref_cip_kode'  => $LIST[$i]['ref_cip_kode'],
                    'coa'           => $LIST[$i]['id'],
                    'coa_kode'      => $LIST[$i]['kode'],
                    'coa_nama'      => $LIST[$i]['nama'],
                    'debit'         => $LIST[$i]['debit'],
                    'credit'        => $LIST[$i]['credit'],
                    'keterangan'    => $LIST[$i]['memo']
                );

                if ($DB->Insert(
                    $Table['detail'],
                    $FieldDetail
                )) {
                    $return['status_detail'][$i] = array(
                        'index'     => $i,
                        'status'    => 1,
                    );
                }
            }
        }
    }
    // => End Insert Detail

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