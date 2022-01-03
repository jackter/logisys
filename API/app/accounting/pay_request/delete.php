<?php

$Modid = 63;
Perm::Check($Modid, 'hapus');

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
    'def'       => 'sp3',
    'detail'    => 'sp3_detail',
    'inv'       => 'invoice',
    'pcr'       => 'rekap_pcr'
);

$Date = date("Y-m-d H:i:s");

$P3 = $DB->Result($DB->Query(
    $Table['def'],
    array(
        'kode'
    ),
    "
        WHERE
            id = '" . $id . "'
    "
));

$DB->ManualCommit();

if ($DB->Delete(
    $Table['detail'],
    "header = '" . $id . "'"
)) {


    /**
     * Delete Detail
     */
    if ($DB->Delete(
        $Table['def'],
        "id = '" . $id . "'"
    )) {
        $return['status_header']['status'] = 1;

        $Field = array(
            'sp3'               => 0,
            'sp3_kode'          => null,
            'update_by'         => Core::GetState('id'),
            'update_date'        => $Date
        );

        if($pay_req_type == 0 || $pay_req_type == 1){
            $DB->Update(
                $Table['inv'],
                $Field,
                "
                sp3 = '" . $id . "'
            "
            );
        }
        else if($pay_req_type == 2){
            $DB->Update(
                $Table['pcr'],
                $Field,
                "
                sp3 = '" . $id . "'
            "
            );
        }

        $EP3 = $DB->Result($DB->QueryOn(
            DB['recon'],
            $Table['def'],
            array(
                'id'
            ),
            "
                WHERE
                    kode = '" . $P3['kode'] . "'
            "
        ));

        $return['status_header']['kode_p3_erecon'] = $P3['kode'];
        $return['status_header']['id_p3_erecon'] = $EP3['id'];

        if ($DB->DeleteOn(
            DB['recon'],
            $Table['detail'],
            "header = '" . $EP3['id'] . "'"
        )) {
            $DB->DeleteOn(
                DB['recon'],
                $Table['def'],
                "id = '" . $EP3['id'] . "'"
            );
        }
    } else {
        $return['status_header'] = array(
            'status'    => 0,
            'error_msg' => $GLOBALS['mysql']->error
        );
    }
    // => End Delete Detail

    $DB->Commit();
    $return['status'] = 1;
} else {
    $return = array(
        'status'        => 0,
        'error_msg'     => "Cannot Delete Payment Request"
    );
}

echo Core::ReturnData($return);

?>