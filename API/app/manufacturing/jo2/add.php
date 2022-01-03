<?php

$Modid = 60;
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

$material = json_decode($material, true);
$output = json_decode($output, true);
$utility = json_decode($utility, true);

$Table = array(
    'def'       => 'jo',
    'detail'    => 'jo_detail'
);

/**
 * Define Department
 */
if ($plant == 1) {
    $dept       = DEF['dept']['refinery']['id'];
    $dept_abbr  = DEF['dept']['refinery']['abbr'];
    $dept_nama  = DEF['dept']['refinery']['nama'];
} elseif ($plant == 2) {
    $dept       = DEF['dept']['fractionation']['id'];
    $dept_abbr  = DEF['dept']['fractionation']['abbr'];
    $dept_nama  = DEF['dept']['fractionation']['nama'];
}
//=> / END : Define Department

/**
 * Create Code
 */
$Time = date('y') . "/" . romawi(date('n')) . "/";
$InitialCode = "JO/" . strtoupper(DEF['company_abbr']) . "-" . strtoupper($dept_abbr) . "/" . $Time;
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
    'description'   => "Create New MR (" . $kode . ")"
);
$History = Core::History($HistoryField);
$Field = array(
    'company'       => DEF['company'],
    'company_abbr'  => DEF['company_abbr'],
    'company_nama'  => DEF['company_nama'],
    'dept'          => $dept,
    'dept_abbr'     => $dept_abbr,
    'dept_nama'     => $dept_nama,
    'storeloc'      => $storeloc,
    'storeloc_kode' => $storeloc_kode,
    'storeloc_nama' => $storeloc_nama,
    'plant'         => $plant,
    'kontrak_kode'  => $kontrak_kode,
    'bom'           => $bom,
    'bom_kode'      => $bom_kode,
    'item'          => $output[0]['id'],
    'qty'           => $output[0]['qty'],
    'shift_rate'    => $shift_rate,
    'running_hours' => $running_hours,
    'man_power'     => $man_power,
    'kode'          => $kode,
    'tanggal'       => $jo_date_send,
    'start_date'    => $start_date_send,
    'end_date'      => $end_date_send,
    'description'   => $description,
    'inforder'      => $inforder,
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
            if (!empty($material[$i]['id'])) {

                $FieldDetail = array(
                    'header'    => $Header['id'],
                    'tipe'      => 1,
                    'item'      => $material[$i]['id'],
                    'ref_qty'   => $material[$i]['ref_qty'],
                    'qty'       => $material[$i]['qty']
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
         * Output
         */
        for ($i = 0; $i < sizeof($output); $i++) {
            if (!empty($output[$i]['id'])) {

                $FieldDetail = array(
                    'header'    => $Header['id'],
                    'tipe'      => 2,
                    'item'      => $output[$i]['id'],
                    'ref_qty'   => $output[$i]['ref_qty'],
                    'qty'       => $output[$i]['qty'],
                    'persentase'       => $output[$i]['persentase']
                );

                $return['output'][$i] = $FieldDetail;

                if ($DB->Insert(
                    $Table['detail'],
                    $FieldDetail
                )) {
                    $return['status_output'][$i] = array(
                        'index'     => $i,
                        'status'    => 1,
                    );
                } else {
                    $return['status_output'][$i] = array(
                        'index'     => $i,
                        'status'    => 0,
                        'error_msg' => $GLOBALS['mysql']->error
                    );
                }
            }
        }
        //=> / END : Output

        /**
         * Utility
         */
        for ($i = 0; $i < sizeof($utility); $i++) {
            if (!empty($utility[$i]['id'])) {

                $FieldDetail = array(
                    'header'    => $Header['id'],
                    'tipe'      => 3,
                    'item'      => $utility[$i]['id'],
                    'ref_qty'   => $utility[$i]['ref_qty'],
                    'qty'       => $utility[$i]['qty']
                );

                $return['utility'][$i] = $FieldDetail;

                if ($DB->Insert(
                    $Table['detail'],
                    $FieldDetail
                )) {
                    $return['status_utility'][$i] = array(
                        'index'     => $i,
                        'status'    => 1,
                    );
                } else {
                    $return['status_utility'][$i] = array(
                        'index'     => $i,
                        'status'    => 0,
                        'error_msg' => $GLOBALS['mysql']->error
                    );
                }
            }
        }
        //=> / END : Utility

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