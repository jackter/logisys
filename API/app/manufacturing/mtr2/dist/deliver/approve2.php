<?php
$Modid = 195;
Perm::Check($Modid, 'approve_deliver');

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
    'def'       => 'prd_issued'
);

/**
 * Update Verify
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'         => $Table['def'],
    'clause'        => "WHERE id = '" . $id . "'",
    'action'        => "approve_deliver",
    'description'   => "Approve Deliver " . $kode
);
$History = Core::History($HistoryField);

$Field = array(
    'approved2'       => 1,
    'approved2_by'    => Core::GetState('id'),
    'approved2_date'  => $Date,
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

    /**
     * Journal Stock
     */
    if(sizeof($material) > 0){
        for ($i = 0; $i < sizeof($material); $i++) {
            if ($material[$i]['qty_issued'] > 0) {

                //=> OUT
                $FieldJurnal = array(
                    'tipe'      => 'credit',
                    'company'   => $company,
                    'dept'      => $dept,
                    'storeloc'  => $material[$i]['storeloc'],
                    'item'      => $material[$i]['id'],
                    'qty'       => $material[$i]['qty_issued'],
                    'price'     => $material[$i]['price'],
                    'kode'      => $kode,
                    'tanggal'   => $tanggal,
                    'keterangan'    => 'Send Material ' . $kode
                );
                App::JurnalStock($FieldJurnal);
                //=> / END : OUT

                //=> IN
                $FieldJurnal = array(
                    'tipe'      => 'debit',
                    'company'   => $company,
                    'dept'      => $dept,
                    'storeloc'  => $storeloc,
                    'item'      => $material[$i]['id'],
                    'qty'       => $material[$i]['qty_issued'],
                    'price'     => $material[$i]['price'],
                    'kode'      => $kode,
                    'tanggal'   => $tanggal,
                    'keterangan'    => 'Receive Material ' . $kode
                );
                App::JurnalStock($FieldJurnal);
                //=> / END : IN

            }
        }
    }

    if(sizeof($list) > 0){
        for ($i = 0; $i < sizeof($list); $i++) {
            if ($list[$i]['qty_issued'] > 0) {

                //=> OUT
                $FieldJurnal = array(
                    'tipe'      => 'credit',
                    'company'   => $company,
                    'dept'      => $dept,
                    'storeloc'  => $list[$i]['storeloc'],
                    'item'      => $list[$i]['id'],
                    'qty'       => $list[$i]['qty_issued'],
                    'price'     => $list[$i]['price'],
                    'kode'      => $kode,
                    'tanggal'   => $tanggal,
                    'keterangan'    => 'Send Material ' . $kode
                );
                App::JurnalStock($FieldJurnal);
                //=> / END : OUT

                //=> IN
                $FieldJurnal = array(
                    'tipe'      => 'debit',
                    'company'   => $company,
                    'dept'      => $dept,
                    'storeloc'  => $storeloc,
                    'item'      => $list[$i]['id'],
                    'qty'       => $list[$i]['qty_issued'],
                    'price'     => $list[$i]['price'],
                    'kode'      => $kode,
                    'tanggal'   => $tanggal,
                    'keterangan'    => 'Receive Material ' . $kode
                );
                App::JurnalStock($FieldJurnal);
                //=> / END : IN

            }
        }
    }
    //=> / END : Journal Stock

    $return['status'] = 1;

    $DB->Commit();
    
} else {
    $return = array(
        'status'    => 0,
        'error_msg' => $GLOBALS['mysql']->error
    );
}
//=> / END: Update Verify

echo Core::ReturnData($return);
?>