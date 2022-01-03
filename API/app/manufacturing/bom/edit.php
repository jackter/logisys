<?php

$Modid = 59;
Perm::Check($Modid, 'edit');

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
    'clause'        => "WHERE id = '" . $id . "'",
    'action'        => "edit",
    'description'   => "Edit BOM (" . $kode . ")"
);
$History = Core::History($HistoryField);
$Field = array(
    'dept'          => $dept,
    'dept_abbr'     => $dept_abbr,
    'dept_nama'     => $dept_nama,
    'storeloc'      => $storeloc,
    'storeloc_kode' => $storeloc_kode,
    'storeloc_nama' => $storeloc_nama,
    'cost_center_id'    => $cost,
    'cost_center_kode'  => $cost_kode,
    'cost_center_nama'  => $cost_nama,
    'description'   => $description,
    'plant'         => $plant,
    'update_by'     => Core::GetState('id'),
    'update_date'   => $Date,
    'history'       => $History
);
//=> / END : Field
$DB->ManualCommit();

/**
 * Insert Data
 */
if ($DB->Update(
    $Table['def'],
    $Field,
    "id = '" . $id . "'"
)) {

    /**
     * Insert Detail
     */
    $Q_Header = $DB->Query(
        $Table['def'],
        array('id'),
        "
            WHERE
                id = '" . $id . "'
        "
    );
    $R_Header = $DB->Row($Q_Header);
    if ($R_Header > 0) {

        //=> Remove All Previous Detail
        if ($DB->Delete(
            $Table['detail'],
            "header = '" . $id . "'"
        )) {

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
                        'qty'       => $material[$i]['qty'],
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