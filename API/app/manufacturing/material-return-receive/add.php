<?php

$Modid = 191;
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

$list = json_decode($list_send, true);

$Table = array(
    'def'       => 'prd_tf_return',
    'detail'    => 'prd_tf_return_detail'
);

/**
 * Create Code
 */
$Time = date('y') . "/" . romawi(date('n')) . "/";
$InitialCode = "RMR/" . strtoupper($company_abbr) . "-" . strtoupper($dept_abbr) . "/" . $Time;
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
	'clause'		=> "WHERE kode = '" . $kode . "'",
	'action'		=> "add",
	'description'	=> "Create New Material Return Receive (" . $kode . ")"
);
$History = Core::History($HistoryField);
$Field = array(
    'kode'              => $kode,
    'tanggal'           => $tanggal_send,
    'company'           => $company,
    'company_abbr'      => $company_abbr,
    'company_nama'      => $company_nama,
    'dept'              => $dept,
    'dept_abbr'         => $dept_abbr,
    'dept_nama'         => $dept_nama,
    'deliver'           => $deliver,
    'deliver_kode'      => $deliver_kode,
    'is_receive'        => 1,
    'create_by'		    => Core::GetState('id'),
	'create_date'	    => $Date,
	'history'		    => $History
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
            if(!empty($list[$i]['qty_return'])){

                $FieldDetail = array(
                    'header'            => $Header['id'],
                    'id_deliver_detail' => $list[$i]['id'],
                    'item'              => $list[$i]['item'],
                    'qty_ref'           => $list[$i]['qty_ref'],
                    'qty_return'        => $list[$i]['qty_return'],
                    'remarks'           => $list[$i]['remarks'],
                    'storeloc'          => $list[$i]['storeloc'],
                    'storeloc_kode'     => $list[$i]['storeloc_kode'],
                    'storeloc_nama'     => $list[$i]['storeloc_nama'],
                    'price'             => $list[$i]['price']
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
}else{
    $return = array(
        'status'    => 0,
        'error_msg' => $GLOBALS['mysql']->error
    );
}
//=> / END : Insert Data

echo Core::ReturnData($return);

?>