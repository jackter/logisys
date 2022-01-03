<?php
$Modid = 195;

Perm::Check($Modid, 'add_request');

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

if (isset($material)) {
    $material = json_decode($material, true);
} else {
    $material = array();
}

if (isset($list)) {
    $list = json_decode($list, true);
} else {
    $list = array();
}

$Table = array(
    'mr' => 'prd_mr'
);

/**
 * Create Code
 */
$LastJO = explode("/", $jo_kode);
$LastJO = $LastJO[4];

$Time = date('y') . "/" . romawi(date('n')) . "/";
$InitialCode = "MRP/JO-" . $LastJO . "/" . $Time;
$Len = 4;
$LastKode = $DB->Result($DB->Query(
    $Table['mr'],
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
//=> / END : Create Code

/**
 * Field
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'            => $Table['mr'],
    'clause'        => "WHERE kode = '" . $kode . "'",
    'action'        => "add",
    'description'    => "Create DTF (" . $kode . ")"
);
$History = Core::History($HistoryField);
$Fields = array(
    'kode'          => $kode,
    'tanggal'       => $tanggal_send,
    'notes'         => $notes,
    'jo'            => $jo,
    'jo_kode'       => $jo_kode,
    'create_by'     => Core::GetState('id'),
    'create_date'   => $Date,
    'history'       => $History
);
//=> / END : Field

$DB->ManualCommit();    // Activate Manual Commit

/**
 * Insert
 */
if($DB->Insert(
    $Table['mr'],
    $Fields
)){

    $Header = $DB->Result($DB->Query(
        $Table['mr'],
        array('id'),
        "
            WHERE
                kode = '" . $kode . "' AND
                create_date = '" . $Date . "'
        "
    ));

    /**
     * Material
     */
    if(sizeof($material) > 0){
        for ($i = 0; $i < sizeof($material); $i++) {

            if ($material[$i]['qty_req'] > 0) {

                $DetailField = array(
                    'header'    => $Header['id'],
                    'jo'        => $jo,
                    'tipe'      => 1,
                    'item'      => $material[$i]['id'],
                    'item_nama' => $material[$i]['nama'],
                    'qty_jo'    => $material[$i]['qty_jo'],
                    'qty_req'   => $material[$i]['qty_req'],
                    'remarks'   => $material[$i]['remarks'],
                );

                if($DB->Insert(
                    $Table['mr'] . '_detail',
                    $DetailField
                )){
                    $return['status_material'][$i] = array(
                        'index'     => $i,
                        'status'    => 1,
                    );
                } else {
                    $return['status_material'][$i] = array(
                        'index'     => $i,
                        'status'    => 0,
                        'error_msg' => $GLOBALS['mysql']->error
                    );
                }

            }

        }
    }
    //=> / END : Material

    /**
     * Others
     */
    if(sizeof($list) > 0){
        for ($i = 0; $i < sizeof($list); $i++) {

            if ($list[$i]['qty_req'] > 0) {

                $DetailField = array(
                    'header'    => $Header['id'],
                    'jo'        => $jo,
                    'tipe'      => 4,
                    'item'      => $list[$i]['id'],
                    'item_nama' => $list[$i]['nama'],
                    'qty_jo'    => $list[$i]['qty_jo'],
                    'qty_req'   => $list[$i]['qty_req'],
                    'remarks'   => $list[$i]['remarks'],
                );

                if($DB->Insert(
                    $Table['mr'] . '_detail',
                    $DetailField
                )){
                    $return['status_list'][$i] = array(
                        'index'     => $i,
                        'status'    => 1,
                    );
                } else {
                    $return['status_list'][$i] = array(
                        'index'     => $i,
                        'status'    => 0,
                        'error_msg' => $GLOBALS['mysql']->error
                    );
                }

            }

        }
    }
    //=> / END : Others

    $DB->Commit();

    $return['status'] = 1;
} else {
    $return = array(
        'status'    => 0,
        'error_msg' => $GLOBALS['mysql']->error
    );

}
//=> / END : Insert

echo Core::ReturnData($return);
?>