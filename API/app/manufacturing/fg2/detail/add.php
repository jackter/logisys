<?php
$Modid = 201;
Perm::Check($Modid, 'add');

//=> Default Statement
$return = [];
$RPL	= "";
$SENT	= Core::Extract($_POST, $RPL);

//=> Extract Array
if(isset($SENT)){
    foreach($SENT as $KEY => $VAL){	
        $$KEY = $VAL;
    }
}

$Table = array(
    'def'       => 'prd_transfer_fg',
    'detail'    => 'prd_transfer_fg_detail'
);

$list = json_decode($list, true);

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
 * History
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'         => $Table['def'],
    'clause'        => "WHERE kode = '" . $kode . "'",
    'action'        => "add",
    'description'   => "Create TFG (" . $kode . ")"
);
$History = Core::History($HistoryField);
//=> END : History

$Field = array(
    'kode'          => $kode,
    'tanggal'       => $tanggal_send,
    'company'       => $company,
    'company_abbr'  => $company_abbr,
    'company_nama'  => $company_nama,
    'dept'          => $dept,
    'dept_abbr'     => $dept_abbr,
    'dept_nama'     => $dept_nama,
    'jo'            => $jo,
    'jo_kode'       => $jo_kode,
    'remarks'       => $remarks,
    'create_by'     => Core::GetState('id'),
    'create_date'   => $Date,
    'history'       => $History,
    'status'        => 1
);

$DB->ManualCommit();

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

    for ($i = 0; $i < sizeof($list); $i++) {
        if (!empty($list[$i]['item'])) {

            $Field = array(
                'header'            => $Header['id'],
                'tipe'              => $list[$i]['tipe'],
                'item'              => $list[$i]['item'],
                'storeloc'          => $list[$i]['storeloc'],
                'storeloc_kode'     => $list[$i]['storeloc_kode'],
                'storeloc_nama'     => $list[$i]['storeloc_nama'],
                'jo'                => $list[$i]['jo'],
                'jo_kode'           => $list[$i]['jo_kode'],
                'qty'               => $list[$i]['qty'],
                'stock'             => $list[$i]['stock'],
                'remarks'           => $list[$i]['remarks']
            );

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

    $DB->Commit();
    $return['status'] = 1;
}else {
    $return = array(
        'status'    => 0,
        'error_msg' => $GLOBALS['mysql']->error
    );
}
echo Core::ReturnData($return);
?>