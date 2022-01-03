<?php

$Modid = 51;
Perm::Check($Modid, 'import');

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
    'def'    => 'jv',
    'detail' => 'jv_detail'
);

$dept_abbr = "ACC";

$Date = date("Y-m-d H:i:s");

$list = json_decode($list, true);

$DB->ManualCommit();

for ($i = 0; $i < sizeof($list); $i++) {

    $Detail = json_decode($list[$i]['detail_send'], true);

    /**
     * Create Code
     */
    $Time = date('y') . "/";
    $Time2 = romawi(date('n')) . "/";
    $InitialKode = "JV/" . strtoupper($company_abbr) . "/" . $Time . $Time2;
    $InitialCodeCheck = "JV/" . strtoupper($company_abbr) . "%/" . $Time;
    $Len = 4;
    $LastKode = $DB->Result($DB->Query(
        $Table['def'],
        array('kode'),
        "
            WHERE
                kode LIKE '" . $InitialCodeCheck . "%' 
            ORDER BY 
                SUBSTR(kode, -$Len, $Len) DESC
        "
    ));
    $LastKode = (int)substr($LastKode['kode'], -$Len) + 1;
    $LastKode = str_pad($LastKode, $Len, 0, STR_PAD_LEFT);

    $Kode = $InitialKode . $LastKode;
    //=> / END : Create Code

    $HistoryField = array(
        'table'         => $Table['def'],
        'clause'        => "WHERE kode = '" . $Kode . "'",
        'action'        => "add",
        'description'   => "Create Journal Entry (" . $Kode . ")"
    );
    $History = Core::History($HistoryField);

    $Field = array(
        'kode'          => $Kode,
        'jv_type'       => 1,
        'tanggal'       => $list[$i]['tanggal'],
        'company'       => $list[$i]['company'],
        'company_abbr'  => $list[$i]['company_abbr'],
        'company_nama'  => $list[$i]['company_nama'],
        'total_credit'  => $list[$i]['total_credit'],
        'total_debit'   => $list[$i]['total_debit'],
        'note'          => "-",
        'create_by'     => Core::GetState('id'),
        'create_date'   => $Date,
        'history'       => $History,
        'status'        => 1
    ); 

    if ($DB->Insert(
        $Table['def'],
        $Field
    )) { 
        $Q_Header = $DB->Query(
            $Table['def'],
            array('id'),
            "
                WHERE
                    kode = '" . $Kode . "' AND
                    create_date = '" . $Date . "'
            "
        );
        $R_Header = $DB->Row($Q_Header);

        if ($R_Header > 0) {

            $Header = $DB->Result($Q_Header);

            for ($j = 0; $j < sizeof($Detail); $j++) {
                if (!empty($Detail[$j]['coa'])) {
    
                    $FieldDetail = array(
                        'header'        => $Header['id'],
                        'coa'           => $Detail[$j]['coa'],
                        'coa_kode'      => $Detail[$j]['coa_kode'],
                        'coa_nama'      => $Detail[$j]['coa_nama'],
                        'debit'         => $Detail[$j]['debit'],
                        'credit'        => $Detail[$j]['credit'],
                        'keterangan'    => $Detail[$j]['keterangan'],
                    );
    
                    if ($DB->Insert(
                        $Table['detail'],
                        $FieldDetail
                    )) {
                        $return['status_detail'][$i] = array(
                            'index'     => $i,
                            'status'    => 1,
                        );
                    }
                }
            }
        }

        $DB->Commit();
        $return['status'] = 1;
    }
}

echo Core::ReturnData($return);

?>