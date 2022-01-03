<?php

$Modid = 65;
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

$output = json_decode($output, true);

$Table = array(
    'def'       => 'transfer_fg',
    'detail'    => 'transfer_fg_detail',
);

/**
 * Define Department
 */
if ($storeloc == 65) {
    $dept       = DEF['dept']['refinery']['id'];
    $dept_abbr  = DEF['dept']['refinery']['abbr'];
    $dept_nama  = DEF['dept']['refinery']['nama'];
} elseif ($plant == 2) {
    $dept       = DEF['dept']['fractionation']['id'];
    $dept_abbr  = DEF['dept']['fractionation']['abbr'];
    $dept_nama  = DEF['dept']['fractionation']['nama'];
}
//=> / END : Define Department

/**
 * Create Code
 */
$Time = date('y') . "/" . romawi(date('n')) . "/";
$InitialCode = "TFG/" . strtoupper($company_abbr) . "-" . strtoupper($dept_abbr) . "/" . $Time;
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
$LastKode = (int)substr($LastKode['kode'], -$Len) + 1;
$LastKode = str_pad($LastKode, $Len, 0, STR_PAD_LEFT);

$kode = $InitialCode . $LastKode;
//=> / END : Create Code

/**
 * Field
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'         => $Table['def'],
    'clause'        => "WHERE kode = '" . $kode . "'",
    'action'        => "add",
    'description'   => "Create TFG (" . $kode . ")"
);
$History = Core::History($HistoryField);
$Field = array(
    'company'       => $company,
    'company_abbr'  => $company_abbr,
    'company_nama'  => $company_nama,
    'dept'          => $dept,
    'dept_abbr'     => $dept_abbr,
    'dept_nama'     => $dept_nama,
    'kode'          => $kode,
    'jo'            => $jo,
    'jo_kode'       => $jo_kode,
    'storeloc'      => $storeloc,
    'storeloc_kode' => $storeloc_kode,
    'storeloc_nama' => $storeloc_nama,
    'remarks'       => $note,
    'create_by'     => Core::GetState('id'),
    'create_date'   => $Date,
    'history'       => $History
);
//=> / END : Field
$DB->ManualCommit();

/**
 * Insert Deliver
 */
if ($DB->Insert(
    $Table['def'],
    $Field
)) {

    $Header = $DB->Result($DB->Query(
        $Table['def'],
        array('id'),
        "
            WHERE
                kode = '" . $kode . "' AND
                create_date = '" . $Date . "'
        "
    ));

    /**
     * Output
     */
    for ($i = 0; $i < sizeof($output); $i++) {
        if ($output[$i]['qty_send'] > 0) {

            $Field = array(
                'header'    => $Header['id'],
                'item'      => $output[$i]['id'],
                'qty'       => $output[$i]['qty_send'],
                'price'     => $output[$i]['price'],
            );

            $return['output'][$i] = $Field;

            if ($DB->Insert(
                $Table['detail'],
                $Field
            )) {
                $return['status_output'][$i] = array(
                    'index'     => $i,
                    'status'    => 1,
                );
            } else {
                $return['status_output'][$i] = array(
                    'index'     => $i,
                    'status'    => 0,
                    'error_msg' => $GLOBALS['mysql']->error
                );
            }
        }
    }
    // => End output
    $DB->Commit();

    $return['status'] = 1;
} else {
    $return = array(
        'status'    => 0,
        'error_msg' => $GLOBALS['mysql']->error
    );
}

// => End Insert Deliver

echo Core::ReturnData($return);

?>