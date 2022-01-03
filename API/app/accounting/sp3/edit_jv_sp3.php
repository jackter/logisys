<?php

$Modid = 109;

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
    'detail'    => 'sp3_jv_detail',
);

/**
 * Field
 */
$LIST = json_decode($list, true);

$DB->ManualCommit();

/**
 * Update Data
 */
if ($DB->Delete(
    $Table['detail'],
    "header = '" . $id . "'"
)) {
    /**
     * Update Detail
     */
    for ($i = 0; $i < sizeof($LIST); $i++) {
        if (!empty($LIST[$i]['id'])) {

            $FieldDetail = array(
                'header'    => $id,
                'coa'       => $LIST[$i]['id'],
                'coa_kode'  => $LIST[$i]['kode'],
                'coa_nama'  => $LIST[$i]['nama'],
                'debit'     => $LIST[$i]['debit'],
                'credit'    => $LIST[$i]['credit'],
                'keterangan' => $LIST[$i]['memo']
            );

            if ($DB->Insert(
                $Table['detail'],
                $FieldDetail
            )) {
                $return['status_detail'][$i] = array(
                    'index'     => $i,
                    'status'    => 1
                );
                $DB->Commit();

                $return['status'] = 1;
            }
        }
    }
    // => End Update Detail    
} else {
    $return = array(
        'status'    => 0,
        'error_msg' => $GLOBALS['mysql']->error
    );
}
//=> / END : Update Data

echo Core::ReturnData($return);

?>