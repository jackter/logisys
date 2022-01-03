<?php
$Modid = 83;

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
    'def'   => 'wb_grn',
    'trx'   => 'wb_transaksi'
);

$list = json_decode($list_send, true);

/**
 * format data 
 */
$TRXID = [];
$format_trx = $COMMA = "";
foreach($list AS $Key => $Val){
    $format_trx .= $COMMA . $Val['id'];
    $COMMA = ",";
}
 // => end format data

/**
 * Create Code
 */
$Time = date('y') . "/" . romawi(date('n')) . "/";
$InitialCode = "WB-GRN/" . strtoupper($company_abbr) . "-" . strtoupper($dept_abbr) . "/" . $Time;
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
	'table'			=> $Table['def'],
	'clause'		=> "WHERE id = '" . $id . "'",
	'action'		=> "add",
	'description'	=> "Create WB Goods Receive"
);
$History = Core::History($HistoryField);

$Field = array(
    'kode'          => $kode,
    'kontrak'       => $kontrak,
    'kontrak_kode'  => $kontrak_kode,
    'id_trx'        => $format_trx,
    'note'          => $note,
    'create_by'     => Core::GetState('id'),
	'create_date'	=> $Date,
    'history'		=> $History,
    'status'        => 1
);
//=> / END : Field

$DB->ManualCommit();

/**
 * Insert Data
 */
if($DB->Insert(
    $Table['def'],
    $Field
)){
    // $return['status'] = 1;

    $TRX = $DB->Result($DB->Query(
        $Table['def'],
        array(
            'id',
            'id_trx'
        ),
        "
            WHERE
                kode = '".$kode."' AND
                create_date = '".$Date."'
        "
    ));

    /**
     * Update Tabel Wb_transaksi
     */
    $DB->Update(
        $Table['trx'],
        array(
            'grn'   => $TRX['id']
        ),
        "
            id IN (".$TRX['id_trx'].")
        "
    );
    //=> End Update

    $DB->Commit();

    $return['status'] = 1;

}else{
    $return = array(
        'status'    => 0,
        'error_msg' => $GLOBALS['mysql']->error
    );
}
//>> End: Insert Data

echo Core::ReturnData($return);
?>