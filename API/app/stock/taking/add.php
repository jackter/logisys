<?php
$Modid = 38;

Perm::Check($Modid, 'add');

//=> Default Statement
$return = [];
$RPL	= "";
$SENT   = Core::Extract($_POST, $RPL);

//=> Extract Array
if(isset($SENT)){
    foreach($SENT as $KEY => $VAL){	
        $$KEY = $VAL;
    }
}

$list = json_decode($list, true);

$Table = array(
    'def'       => 'stock_taking',
    'detail'    => 'stock_taking_detail',
    'stock'     => 'storeloc_stock'
);

/**
 * Create Code
 */
$Time = date('y') . "/" . romawi(date('n')) . "/" . date('d') . "/" . str_pad($storeloc, 3, 0, STR_PAD_LEFT) . "/";
$InitialCode = "STK/" . strtoupper($company_abbr) . "/" . $Time;
$Len = 2;
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
	'clause'		=> "WHERE kode = '" . $kode . "'",
	'action'		=> "add",
	'description'	=> "Create New Stock Tacking Data (" . $kode . ")"
);
$History = Core::History($HistoryField);
$Field = array(
    'kode'          => $kode,
    'company'       => $company,
    'company_abbr'  => $company_abbr,
    'company_nama'  => $company_nama,
    'tanggal'       => date('Y-m-d'),
    'storeloc'  => $storeloc,
    'storeloc_kode' => $storeloc_kode,
    'storeloc_nama' => $storeloc_nama,
    'remarks'       => $remarks,
    'create_by'		=> Core::GetState('id'),
	'create_date'	=> $Date,
	'history'		=> $History
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

    /**
     * Insert Detail
     */
    $Q_Header = $DB->Query(
        $Table['def'], 
        array('id'), 
        "
            WHERE
                kode = '" . $kode . "' AND
                create_date = '" . $Date . "'
        "
    );
    $R_Header = $DB->Row($Q_Header);
    if($R_Header > 0){
        $Header = $DB->Result($Q_Header);

        for($i = 0; $i < sizeof($list); $i++){
            if($list[$i]['qty'] > 0){

                $FieldDetail = array(
                    'header'    => $Header['id'],
                    'item'      => $list[$i]['id'],
                    'stock'     => $list[$i]['stock'],
                    'actual'    => $list[$i]['qty'],
                    'price'     => $list[$i]['price'],  //=> Sesuaikan ketika verify
                    'selisih'   => $list[$i]['selisih'],
                    'jurnal'    => $list[$i]['jurnal'],
                    'qty_jurnal'    => $list[$i]['qty_jurnal'],
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

    }
    //=> / END : Insert Detail

    $DB->Commit();
    $return['status'] = 1;

}
//=> / END : Insert Data

echo Core::ReturnData($return);
?>