<?php

$Modid = 200;
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

$Table = array(
    'def' => 'sales_handover',
    'detail' => 'sales_handover_detail'
);

$Detail = json_decode($detail, true);

/**
 * Field
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'            => $Table['def'],
    'clause'        => "WHERE id = '" . $id . "'",
    'action'        => "edit",
    'description'    => "Edit Sales Handover"
);
$History = Core::History($HistoryField);
$Field = array(
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
    'qty_so'            => $qty_so,
    'qty_total'            => $qty_total,
    'remarks'           => $remarks,
    'update_by'         => Core::GetState('id'),
    'update_date'       => $Date,
    'history'           => $History,
    'status'            => 1
);

$DB->ManualCommit();

/*Update Data*/
if ($DB->Update(
    $Table['def'],
    $Field,
    "id = '" . $id . "'"
)) {

    /* Delete Detail Before Insert New*/
    $DB->Delete(
        $Table['detail'],
        "header = '" . $id . "'"
    );

    #Save Detail
    for ($i = 0; $i < sizeof($Detail); $i++) {
        if (!empty($Detail[$i]['ship_kode'])) {
            $FieldsDetail = array(
                'header'            => $id,
                'ship_kode'         => $Detail[$i]['ship_kode'],
                'ship_tanggal'      => $Detail[$i]['ship_tanggal'],
                'qty_shipping'      => $Detail[$i]['qty_shipping'],
                'remarks'           => $Detail[$i]['remarks']
            );

            if ($DB->Insert(
                $Table['detail'],
                $FieldsDetail
            )) {
                $return['status_detail'][$i] = array(
                    'index' => $i,
                    'status' => 1,
                    'field' => $FieldsDetail
                );
            }
        }
    }

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