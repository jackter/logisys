<?php
$Modid = 66;

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
    'def'       => 'stock_adjustment',
    'detail'    => 'stock_adjustment_detail',
    'sstock'    => 'storeloc_stock'
);

/**
 * Create Code
 */
$Time = date('y') . "/" . romawi(date('n')) . "/";
$InitialCode = "ADJ/" . strtoupper($storeloc_kode) . "/" . $Time;
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
	'description'	=> "Create New Stock Adjustment Data (" . $kode . ")"
);
$History = Core::History($HistoryField);
$Field = array(
    'kode'          => $kode,
    'adj_qty'       => $adj_qty,
    'adj_value'       => $adj_value,
    'company'       => $company,
    'company_abbr'  => $company_abbr,
    'company_nama'  => $company_nama,
    'tanggal'       => date('Y-m-d'),
    'storeloc'  => $storeloc,
    'storeloc_kode' => $storeloc_kode,
    'storeloc_nama' => $storeloc_nama,
    'remarks'       => $remarks,
    'tanggal'       => $tanggal,
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
            if(!empty($list[$i]['id'])){
                $FieldDetail = array(
                    'header'    => $Header['id'],
                    'item'      => $list[$i]['id'],
                    'price'     => $list[$i]['price'],
                    'debit'     => $list[$i]['debit'],
                    'credit'    => $list[$i]['credit']
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