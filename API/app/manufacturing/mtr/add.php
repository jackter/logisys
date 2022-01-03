<?php

$Modid = 64;
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
    'def'       => 'prd_tf',
    'detail'    => 'prd_tf_detail',
);

/**
 * Create Code
 */
$Time = date('y') . "/" . romawi(date('n')) . "/";
$InitialCode = "PTF/" . strtoupper($company_abbr) . "-" . strtoupper($dept_abbr) . "/" . $Time;
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
//=> / END : Create Code

/**
 * Field
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'         => $Table['def'],
    'clause'        => "WHERE kode = '" . $kode . "'",
    'action'        => "add",
    'description'   => "Create MTR (" . $kode . ")"
);
$History = Core::History($HistoryField);
$Field = array(
    'company'       => $company,
    'company_abbr'  => $company_abbr,
    'company_nama'  => $company_nama,
    'dept'          => $dept,
    'dept_abbr'     => $dept_abbr,
    'dept_nama'     => $dept_nama,
    'kode'          => $kode,
    'jo'            => $jo,
    'jo_kode'       => $jo_kode,
    'remarks'       => $note,
    'create_by'     => Core::GetState('id'),
    'create_date'   => $Date,
    'history'       => $History
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

        /**
         * Material
         */
        for ($i = 0; $i < sizeof($material); $i++) {
            if (!empty($material[$i]['id'] && $material[$i]['qty'] > 0)) {

                $FieldDetail = array(
                    'header'    => $Header['id'],
                    'tipe'      => 1,
                    'item'      => $material[$i]['id'],
                    'qty'       => $material[$i]['qty'],
                    'price'     => $material[$i]['price'],
                    'remarks'   => $material[$i]['remarks']
                );

                $return['material'][$i] = $FieldDetail;

                if ($DB->Insert(
                    $Table['detail'],
                    $FieldDetail
                )) {
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
        //=> / END : Material

        /**
         * Others
         */
        for ($i = 0; $i < sizeof($list); $i++) {
            if (!empty($list[$i]['id'])) {

                $FieldDetail = array(
                    'header'    => $Header['id'],
                    'tipe'      => 4,
                    'item'      => $list[$i]['id'],
                    'qty'       => $list[$i]['qty'],
                    'price'     => $list[$i]['price'],
                    'remarks'   => $list[$i]['remarks']
                );

                $return['list'][$i] = $FieldDetail;

                if ($DB->Insert(
                    $Table['detail'],
                    $FieldDetail
                )) {
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
        // => End Others

    }
    //=> / END : Insert Detail
    $DB->Commit();

    $return['status'] = 1;
} else {
    $return = array(
        'status'    => 0,
        'error_msg' => $GLOBALS['mysql']->error
    );
}

echo Core::ReturnData($return);

?>