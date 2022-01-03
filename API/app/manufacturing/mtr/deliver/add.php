<?php

$Modid = 64;
Perm::Check($Modid, 'add_deliver');

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
    'detail'    => 'prd_tf_detail',
    'deliver'   => 'prd_tf_deliver',
);

/**
 * Create Code
 */
$Time = date('y') . "/" . romawi(date('n')) . "/";
$InitialCode = "DTF/" . strtoupper($company_abbr) . "-" . strtoupper($dept_abbr) . "/" . $Time;
$Len = 4;
$LastKode = $DB->Result($DB->Query(
    $Table['deliver'],
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
    'table'            => $Table['deliver'],
    'clause'        => "WHERE kode = '" . $kode . "'",
    'action'        => "add",
    'description'    => "Create DTF (" . $kode . ")"
);
$History = Core::History($HistoryField);
$Field = array(
    'kode'          => $kode,
    'tanggal'       => $tanggal_send,
    'prd'           => $prd,
    'prd_kode'      => $prd_kode,
    'create_by'        => Core::GetState('id'),
    'create_date'    => $Date,
    'history'        => $History
);
//=> / END : Field
$DB->ManualCommit();

/**
 * Insert Deliver
 */
if ($DB->Insert(
    $Table['deliver'],
    $Field
)) {

    $Header = $DB->Result($DB->Query(
        $Table['deliver'],
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
    for ($i = 0; $i < sizeof($material); $i++) {

        if ($material[$i]['qty'] > 0) {

            $Field = array(
                'header'    => $Header['id'],
                'tipe'      => 1,
                'item'      => $material[$i]['id'],
                'qty_ref'   => $material[$i]['qty_ref'],
                'qty'       => $material[$i]['qty'],
                'remarks'   => $material[$i]['remarks'],
                'storeloc'       => $material[$i]['storeloc'],
                'storeloc_kode'  => $material[$i]['storeloc_kode'],
                'storeloc_nama'  => $material[$i]['storeloc_nama'],
            );

            $return['material'][$i] = $Field;

            if ($DB->Insert(
                $Table['deliver'] . "_detail",
                $Field
            )) {

                /**
                 * Update Outstanding
                 */
                // $FieldDetail = array(
                //     'outstanding'   => $material[$i]['outstanding']
                // );
                // $DB->Update(
                //     $Table['detail'],
                //     $FieldDetail,
                //     "
                //         header = '".$id."' AND
                //         tipe   = 1 AND
                //         item   = '".$material[$i]['id']."'
                //     "
                // );
                // => End Update Ooutstanding

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
    // => End Material

    /**
     * Others
     */
    for ($i = 0; $i < sizeof($list); $i++) {

        if ($list[$i]['qty'] > 0) {

            $Field = array(
                'header'    => $Header['id'],
                'tipe'      => 4,
                'item'      => $list[$i]['id'],
                'qty_ref'   => $list[$i]['qty_ref'],
                'qty'       => $list[$i]['qty'],
                'remarks'   => $list[$i]['remarks'],
                'storeloc'       => $list[$i]['storeloc'],
                'storeloc_kode'  => $list[$i]['storeloc_kode'],
                'storeloc_nama'  => $list[$i]['storeloc_nama']
            );

            $return['list'][$i] = $Field;

            if ($DB->Insert(
                $Table['deliver'] . "_detail",
                $Field
            )) {

                /**
                 * Update Outstanding
                 */
                // $FieldDetail = array(
                //     'outstanding'   => $list[$i]['outstanding']
                // );
                // $DB->Update(
                //     $Table['detail'],
                //     $FieldDetail,
                //     "
                //         header = '".$id."' AND
                //         tipe   = 4 AND
                //         item   = '".$list[$i]['id']."'
                //     "
                // );
                // => End Update Ooutstanding

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
    // =>End Others
    $DB->Commit();

    $return['status'] = 1;
} else {
    $return = array(
        'status'    => 0,
        'error_msg' => $GLOBALS['mysql']->error
    );
}

// => End Insert Deliver

echo Core::ReturnData($return);

?>