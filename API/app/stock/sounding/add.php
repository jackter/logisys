<?php
$Modid = 123;
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

$list = json_decode($list, true);

$Table = array(
    'def'       => 'sounding',
    'detail'    => 'sounding_detail'
);

$Date = date('Y-m-d H:i:s');

$HistoryField = array(
    'table'         => $Table['def'],
    'action'        => "add",
    'description'   => "Add New Sounding"
);
$History = Core::History($HistoryField);

$Fields = array(
    'company'           => $company,
    'company_abbr'      => $company_abbr,
    'company_nama'      => $company_nama,
    'tanggal'           => $tanggal_send,
    'remarks'           => $remarks,
    'create_by'         => Core::GetState('id'),
    'create_date'       => $Date,
    'history'           => $History,
    'status'            => 1
);

$DB->ManualCommit();

if ($DB->Insert(
    $Table['def'],
    $Fields
)) {

    /**
     * Insert Detail
     */
    $Q_Header = $DB->Query(
        $Table['def'], 
        array('id'), 
        "
            WHERE
                create_date = '" . $Date . "'
        "
    );
    $R_Header = $DB->Row($Q_Header);
    if($R_Header > 0){
        $Header = $DB->Result($Q_Header);

        for($i = 0; $i < sizeof($list); $i++){
            if(!empty($list[$i]['tinggi'] && !empty($list[$i]['temp']))){
                $FieldDetail = array(
                    'header'            => $Header['id'],
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

                //$return['detail'][$i] = $FieldDetail;

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
    //=> / END : Insert Detail
    }

    $DB->Commit();
    
    $return['status'] = 1;
} else {
    $return = array(
        'status'    => 0,
        'error_msg' => 'Gagal Menyimpan Data'
    );
}
echo Core::ReturnData($return);

?>
