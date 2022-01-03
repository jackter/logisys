<?php

$Modid = 112;
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
    'def'       => 'oip',
    'detail'    => 'oip_detail'
);

/**
 * Create Code
 */
if ($plant == 1) {
    $InitialCode = "OIPR-X-";
} else {
    $InitialCode = "OIPF-X-";
}
$Len = 4;
$LastKode = $DB->Result($DB->Query(
    $Table['def'],
    array('kode'),
    "
        WHERE
            kode LIKE '" . $InitialCode . "%' 
        ORDER BY 
            REPLACE(kode, '" . $InitialCode . "', '') DESC
    "
));
$LastKode = (int)substr($LastKode['kode'], -$Len) + 1;
$LastKode = str_pad($LastKode, $Len, 0, STR_PAD_LEFT);

$kode = $InitialCode . $LastKode;
//=> END : Create Code

/**
 * Field
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'            => $Table['def'],
    'clause'        => "WHERE id = '" . $id . "'",
    'action'        => "add",
    'description'    => "Create Oil In Plant"
);
$History = Core::History($HistoryField);

$list = json_decode($list, true);

$Field = array(
    'kode'              => $kode,
    'tanggal'           => $tanggal_send,
    'plant'             => $plant,
    'create_by'         => Core::GetState('id'),
    'create_date'        => $Date,
    'history'            => $History,
    'status'            => 1
);
//=> / END : Field

$DB->ManualCommit();

/**
 * Insert Data
 */
if ($DB->Insert(
    $Table['def'],
    $Field
)) {
    $return['status'] = 1;

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

        for ($i = 0; $i < sizeof($list); $i++) {
            if (!empty($list[$i]['level'])) {

                $FieldDetail = array(
                    'id_tpl'        => $list[$i]['id'],
                    'header'        => $Header['id'],
                    'plant'         => $plant,
                    'item'          => $list[$i]['item'],
                    'item_nama'     => $list[$i]['item_nama'],
                    'vessel'        => $list[$i]['vessel'],
                    'volume'        => $list[$i]['volume'],
                    'density'       => $list[$i]['density'],
                    'mt'            => $list[$i]['mt'],
                    'level'         => $list[$i]['level'],
                    'actual_oip'    => $list[$i]['actual_oip']
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
    //=> END : Insert Detail
    $DB->Commit();
    $return['status'] = 1;

} else {
    $return = array(
        'status'    => 0,
        'error_msg' => $GLOBALS['mysql']->error
    );
}
//>> End: Insert Data

echo Core::ReturnData($return);

?>