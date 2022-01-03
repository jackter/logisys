<?php
$Modid = 123;
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

$list = json_decode($list, true);

$Table = array(
    'def'       => 'sounding',
    'detail'    => 'sounding_detail'
);

$Date = date('Y-m-d H:i:s');

$HistoryField = array(
    'table'         => $Table['def'],
    'action'        => "edit",
    'description'   => "Edit Sounding"
);
$History = Core::History($HistoryField);

$Fields = array(
    'tanggal'           => $tanggal_send,
    'company'           => $company,
    'company_abbr'      => $company_abbr,
    'company_nama'      => $company_nama,
    'remarks'           => $remarks,
    'update_by'         => Core::GetState('id'),
    'update_date'       => $Date,
    'history'           => $History
);

if ($DB->Update(
    $Table['def'],
    $Fields,
    "id = '" . $id . "'"
)) {

    $DB->Delete(
        $Table['detail'],
        "header = '" . $id . "'"
    );

    for($i = 0; $i < sizeof($list); $i++){
        if(!empty($list[$i]['tinggi'] && !empty($list[$i]['temp']))){
            $FieldDetail = array(
                'header'            => $id,
                'produk'            => $list[$i]['produk'],
                'storeloc'          => $list[$i]['id'],
                'storeloc_kode'     => $list[$i]['kode'],
                'storeloc_nama'     => $list[$i]['nama'],
                'tinggi'            => $list[$i]['tinggi'],
                'tinggi_meja'       => $list[$i]['tinggi_meja'],
                'tabel'             => $list[$i]['tabel'],
                'temp'              => $list[$i]['temp'],
                'density'           => $list[$i]['density'],
                'faktor_koreksi'    => $list[$i]['faktor_koreksi'],
                'volume'            => $list[$i]['volume'],
                'weight'            => $list[$i]['weight'],
                'remarks'           => $list[$i]['remarks'],
                'status'            => 1
            );

            if($DB->Insert(
                $Table['detail'],
                $FieldDetail
            )){
                $return['status_detail'][$i]= array(
                    'index'     => $i,
                    'status'    => 1,
                );

            }else{
                $return['status_detail'][$i] = array(
                    'index'     => $i,
                    'status'    => 0,
                    'error_msg' => $GLOBALS['mysql']->error
                );
            }
        }
    }

    $return['status'] = 1;

} else {
    $return = array(
        'status'    => 0,
        'error_msg' => 'Gagal Menyimpan Data'
    );
}
echo Core::ReturnData($return);

?>
