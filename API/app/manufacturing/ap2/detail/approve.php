<?php
$Modid = 61;
Perm::Check($Modid, 'approve');

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

$output = json_decode($output, true);
$material = json_decode($material, true);
$utility = json_decode($utility, true);
$list = json_decode($list, true);

$Table = array(
    'def'       => 'actual_production'
);

/**
 * Update Verify
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'         => $Table['def'],
    'clause'        => "WHERE id = '" . $id . "'",
    'action'        => "approve",
    'description'   => "Approve AP " . $kode
);
$History = Core::History($HistoryField);

$Field = array(
    'approved'       => 1,
    'approved_by'    => Core::GetState('id'),
    'approved_date'  => $Date,
    'update_by'      => Core::GetState('id'),
    'update_date'    => $Date,
    'history'        => $History
);
$DB->ManualCommit();

if ($DB->Update(
    $Table['def'],
    $Field,
    "id = '" . $id . "'"
)) {

    /**
     * Output
     */
    if($output) {
        for ($i = 0; $i < sizeof($output); $i++) {
            if (!empty($output[$i]['qty'])) {
    
                $Jurnal = App::JurnalStock(array(
                    'tipe'          => 'debit',
                    'company'       => $company,
                    'dept'          => $dept,
                    'storeloc'      => $storeloc,
                    'item'          => $output[$i]['id'],
                    'qty'           => $output[$i]['qty'],
                    'price'         => $output[$i]['price'],
                    'kode'          => $kode,
                    'tanggal'       => $tanggal
                ));
            }
        }
    }
    //=> / END : Output

    /**
     * Material
     */
    if($material) {
        for ($i = 0; $i < sizeof($material); $i++) {
            if (!empty($material[$i]['qty'] && !$material[$i]['is_fix'])) {
    
                $Jurnal = App::JurnalStock(array(
                    'tipe'          => 'credit',
                    'company'       => $company,
                    'dept'          => $dept,
                    'storeloc'      => $storeloc,
                    'item'          => $material[$i]['id'],
                    'qty'           => $material[$i]['qty'],
                    'price'         => $material[$i]['price'],
                    'kode'          => $kode,
                    'tanggal'       => $tanggal
                ));
            }
        }
    }
    //=> / END : Material

    /**
     * Utility
     */
    if($utility) { 
        for ($i = 0; $i < sizeof($utility); $i++) {
            if (!empty($utility[$i]['qty']) && !$utility[$i]['is_fix']) {
    
                $Jurnal = App::JurnalStock(array(
                    'tipe'          => 'credit',
                    'company'       => $company,
                    'dept'          => $dept,
                    'storeloc'      => $storeloc,
                    'item'          => $utility[$i]['id'],
                    'qty'           => $utility[$i]['qty'],
                    'price'         => $utility[$i]['price'],
                    'kode'          => $kode,
                    'tanggal'       => $tanggal
                ));
            }
        }
    }
    //=> / END : Utility

    /**
     * Other
     */
    if($list) { 
        for ($i = 0; $i < sizeof($list); $i++) {
            if (!empty($list[$i]['qty'])) {
    
                $Jurnal = App::JurnalStock(array(
                    'tipe'          => 'credit',
                    'company'       => $company,
                    'dept'          => $dept,
                    'storeloc'      => $storeloc,
                    'item'          => $list[$i]['id'],
                    'qty'           => $list[$i]['qty'],
                    'price'         => $list[$i]['price'],
                    'kode'          => $kode,
                    'tanggal'       => $tanggal
                ));
            }
        }
    }
    //=> / END : Other

    $DB->Commit();

    $return['status'] = 1;
} else {
    $return = array(
        'status'    => 0,
        'error_msg' => $GLOBALS['mysql']->error
    );
}
//=> / END: Update Verify

echo Core::ReturnData($return);
?>