<?php

$Modid = 200;
Perm::Check($Modid, 'add');

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

$Table = array(
    'def' => 'sales_handover',
    'detail' => 'sales_handover_detail'
);

$Date = date('Y-m-d H:i:s');

$Detail = json_decode($detail, true);

# Create Kode
$Time = date('y') . "/" . romawi(date('n')) . "/";
$InitialCode = "SH/" . strtoupper($company_abbr) . "/" . $Time;
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
$LastKode = (int) substr($LastKode['kode'], -$Len) + 1;
$LastKode = str_pad($LastKode, $Len, 0, STR_PAD_LEFT);

$KODE = $InitialCode . $LastKode;

# Fields
$Fields = array(
    'tanggal'           => $tanggal_send,
    'company'           => $company,
    'company_abbr'      => $company_abbr,
    'company_nama'      => $company_nama,
    'kode'              => $KODE,
    'cust'              => $cust,
    'cust_kode'         => $cust_kode,
    'cust_nama'         => $cust_nama,
    'cust_abbr'         => $cust_abbr,
    'kontrak'           => $kontrak,
    'kontrak'           => $kontrak,
    'kontrak_kode'      => $kontrak_kode,
    'kontrak_tanggal'   => $kontrak_tanggal,
    'item'              => $item,
    'item_kode'         => $item_kode,
    'item_nama'         => $item_nama,
    'item_satuan'       => $item_satuan,
    'so'                => $so,
    'so_kode'           => $so_kode,
    'qty_so'            => $qty_so,
    'qty_total'         => $qty_total,
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
    $Q_Header = $DB->Query(
        $Table['def'],
        array('id'),
        "
            WHERE 
                create_date = '" . $Date . "'
        "
    );
    $R_Header = $DB->Row($Q_Header);

    if ($R_Header > 0) {

        $Header = $DB->Result($Q_Header);

        for ($i = 0; $i < sizeof($Detail); $i++) {
            if (!empty($Detail[$i]['ship_kode'])) {

                $FieldsDetail = array(
                    'header'            => $Header['id'],
                    'ship_kode'         => $Detail[$i]['ship_kode'],
                    'ship_tanggal'      => $Detail[$i]['ship_tanggal'],
                    'qty_shipping'      => $Detail[$i]['qty_shipping'],
                    'remarks'           => $Detail[$i]['remarks'],
                );

                if ($DB->Insert(
                    $Table['detail'],
                    $FieldsDetail
                )) {

                    $return['status_detail'][$i] = array(
                        'index' => $i,
                        'status' => 1
                    );
                }
            }
        }
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