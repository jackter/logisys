<?php

$Modid = 183;
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
    'def' => 'kontrak_request',
    'detail' => 'kontrak_request_detail'
);

$Date = date('Y-m-d H:i:s');

$List = json_decode($list, true);

#Create History
$HistoryField = array(
    'table'         => $Table['def'],
    'clause'        => "WHERE id = '" . $id . "'",
    'action'        => "add",
    'description'   => "Add New Contract Request"
);
$History = Core::History($HistoryField);

# Create Kode
$Time = date('y') . "/" . romawi(date('n')) . "/";
$InitialCode = "CR/" . strtoupper($company_abbr) . "/" . $Time;
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
    'duration'          => $duration,
    'kode'              => $KODE,
    'work'              => $work,
    'work_nama'         => $work_nama,
    'work_code'         => $work_code,
    'cip'               => $cip,
    'cip_kode'          => $cip_kode,
    'kontrak_tipe'      => $kontrak_tipe,
    'grand_total'       => $grand_total,
    'currency'          => $currency,
    'start_date'        => $start_date_send,
    'end_date'          => $end_date_send,
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

        for ($i = 0; $i < sizeof($List); $i++) {
            if (!empty($List[$i]['coa'])) {

                $FieldsWorkCode = array(
                    'header'            => $Header['id'],
                    'coa'               => $List[$i]['coa'],
                    'coa_kode'          => $List[$i]['coa_kode'],
                    'coa_nama'          => $List[$i]['coa_nama'],
                    'keterangan'        => $List[$i]['keterangan'],
                    'volume'            => $List[$i]['volume'],
                    'uom'               => $List[$i]['uom'],
                    'est_rate'          => $List[$i]['est_rate'],
                    'total'             => $List[$i]['total']

                );

                if ($DB->Insert(
                    $Table['detail'],
                    $FieldsWorkCode
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