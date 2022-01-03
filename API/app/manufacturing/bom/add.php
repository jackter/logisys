<?php

$Modid = 59;
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
    'def'       => 'bom',
    'detail'    => 'bom_detail'
);

/**
 * Create Code
 */
$InitialCode = "BM-";
$Len = 3;
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
 * Define Department
 */
if ($plant == 1) {
    $dept       = '29';
    $dept_abbr  = 'RFN';
    $dept_nama  = 'REFINERY';
} elseif ($plant == 2) {
    $dept       = '30';
    $dept_abbr  = 'FRC';
    $dept_nama  = 'FRACTINATION';
}
//=> / END : Define Department

/**
 * Field
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'         => $Table['def'],
    'clause'        => "WHERE kode = '" . $kode . "'",
    'action'        => "add",
    'description'   => "Added new BOM (" . $kode . ")"
);
$History = Core::History($HistoryField);
$Field = array(
    'company'       => '3',
    'company_abbr'  => 'CBU',
    'company_nama'  => 'PT Citra Borneo Utama',
    'dept'          => $dept,
    'dept_abbr'     => $dept_abbr,
    'dept_nama'     => $dept_nama,
    'storeloc'      => $storeloc,
    'storeloc_kode' => $storeloc_kode,
    'storeloc_nama' => $storeloc_nama,
    'cost_center_id'    => $cost,
    'cost_center_kode'  => $cost_kode,
    'cost_center_nama'  => $cost_nama,
    'kode'          => $kode,
    'description'   => $description,
    'plant'         => $plant,
    'create_by'     => Core::GetState('id'),
    'create_date'   => $Date,
    'history'       => $History,
    'status'        => 1
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
                    'header'            => $Header['id'],
                    'tipe'              => 1,
                    'item'              => $material[$i]['id'],
                    'qty'               => $material[$i]['qty'],
                    'cost_center'       => $cost,
                    'cost_center_kode'  => $cost_kode,
                    'cost_center_nama'  => $cost_nama,
                    'job_alocation'     => $material[$i]['job_alocation'],
                    'job_alocation_nama'=> $material[$i]['job_alocation_nama'],
                    'coa_alokasi'       => $material[$i]['coa_alokasi'],
                    'coa_alokasi_nama'  => $material[$i]['coa_alokasi_nama'],
                    'coa'               => $material[$i]['coa'],
                    'coa_kode'          => $material[$i]['coa_kode'],
                    'coa_nama'          => $material[$i]['coa_nama']
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
                    'header'        => $Header['id'],
                    'tipe'          => 2,
                    'item'          => $output[$i]['id'],
                    'qty'           => $output[$i]['qty'],
                    'persentase'    => $output[$i]['persentase'],
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