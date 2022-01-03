<?php

$Modid = 109;
Perm::Check($Modid, 'edit');

#Default Statement
$return = [];
$RPL = "";
$SENT = Core::Extract($_POST, $RPL);

#Extract Array
if (isset($SENT)) {
    foreach ($SENT as $KEY => $VAL) {
        $$KEY = $VAL;
    }
}

$LIST = json_decode($list, true);

#Table List
$Table = array(
    'def'       => 'sp3'
);

$Date = date('Y-m-d H:i:s');

#Create history
$HistoryField = array(
    'table' => $Table['def'],
    'clause' => "WHERE id = '" . $id . "'",
    'action' => "edit",
    'description' => "Edit SP3"
);
$History = Core::History($HistoryField);

$Fields = array(
    'cost_center'       => $cost,
    'cost_center_kode'  => $cost_kode,
    'cost_center_nama'  => $cost_nama,
    'grup'              => $grup,
    'grup_nama'         => $grup_nama,
    'po_no'             => $po_no,
    'po_tgl'            => $tanggal_po,
    'penerima'          => $penerima,
    'penerima_nama'     => $penerima_nama,
    'currency'          => $currency,
    'total'             => $total,
    'keterangan_bayar'  => $keterangan_bayar,
    'update_by'         => Core::GetState('id'),
    'update_date'       => $Date,
    'history'           => $History,
    'status'            => 1
);

$DB->ManualCommit();

if ($DB->Update(
    $Table['def'],
    $Fields,
    "id = '" . $id . "'"
)) {

    if(sizeof($LIST) > 0){
        if ($DB->Delete(
            $Table['def'] . "_detail", 
            "header = '" . $id . "'"
        )){
            for($i = 0; $i < sizeof($LIST); $i++){
                if(!empty($LIST[$i]['jumlah'])){
                    $DetailFields = array(
                        'header'    => $id,
                        'uraian'    => $LIST[$i]['uraian'],
                        'jumlah'    => $LIST[$i]['jumlah']
                    );
                    if($DB->Insert(
                        $Table['def'] . "_detail", 
                        $DetailFields
                    )){
                        $return['status'] = 1;
                    }
                }
            }

            $EP3 = $DB->Result($DB->QueryOn(
                DB['recon'],
                $Table['def'],
                array(
                    'id'
                ),
                "
                    WHERE
                        kode = '" . $kode . "'
                "
            ));

            if ($DB->UpdateOn(
                DB['recon'],
                $Table['def'],
                $Fields,
                "id = '" . $EP3['id'] . "'"
            )){
                if(sizeof($LIST) > 0){
                    if ($DB->DeleteOn(
                        DB['recon'],
                        $Table['def'] . "_detail", 
                        "header = '" . $EP3['id'] . "'"
                    )){
                        for($i = 0; $i < sizeof($LIST); $i++){
                            if(!empty($LIST[$i]['jumlah'])){
                                $DetailFields = array(
                                    'header'    => $EP3['id'],
                                    'uraian'    => $LIST[$i]['uraian'],
                                    'jumlah'    => $LIST[$i]['jumlah']
                                );
                                $DB->InsertOn(
                                    DB['recon'],
                                    $Table['def'] . "_detail", 
                                    $DetailFields
                                );
                            }
                        }

                        $DB->Commit();
                        $return['status'] = 1;
                    }
                }
            }
        }        
    }

} else {
    $return = array(
        'status' => 0,
        'error_msg' => 'Gagal Menyimpan Data'
    );
}
echo Core::ReturnData($return);

?>