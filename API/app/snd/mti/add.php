<?php
$Modid = 130;

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
    'def'       => 'mti',
    'detail'    => 'mti_detail',
    'detail_2'  => 'mto_detail'
);

/**
 * Create Code
 */
$Time = date('y') . "/" . romawi(date('n')) . "/";
$InitialCode = "MTI/" . strtoupper($company_abbr_to) . "/F" . $from_storeloc . "-T" . $to_storeloc . "/" . $Time;
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
	'description'	=> "Create New Material Transfer In (" . $kode . ")"
);
$History = Core::History($HistoryField);
$Field = array(
    'kode'                  => $kode,
    'company'               => $company_to,
    'company_abbr'          => $company_abbr_to,
    'company_nama'          => $company_nama_to,
    'company_from'          => $company_from,
    'company_abbr_from'     => $company_abbr_from,
    'company_nama_from'     => $company_nama_from,
    'tanggal'               => $tanggal_send,
    'mto'                   => $mto,
    'mto_kode'              => $mto_kode,
    'from_storeloc'         => $from_storeloc,
    'from_storeloc_kode'    => $from_storeloc_kode,
    'to_storeloc'           => $to_storeloc,
    'to_storeloc_kode'      => $to_storeloc_kode,
    'remarks'               => $remarks,
    'create_by'		        => Core::GetState('id'),
	'create_date'	        => $Date,
	'history'		        => $History
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
                    'qty'       => $list[$i]['qty'],
                    'price'     => $list[$i]['price'],  //=> Sesuaikan ketika verify
                );

                $final_qty_os = $list[$i]['qty_mto_os'] - $list[$i]['qty'];

                if($DB->Insert(
                    $Table['detail'],
                    $FieldDetail
                )){
                    $return['status_detail'][$i]= array(
                        'index'     => $i,
                        'status'    => 1,
                    );

                    $FieldDetail_2 = array(
                        'qty_os'    => $final_qty_os
                    );

                    if($DB->Update(
                        $Table['detail_2'],
                        $FieldDetail_2,
                        "id = '" . $list[$i]['detail_id'] . "'"
                    )){
                        $return['status_detail_2'][$i]= array(
                            'index'     => $i,
                            'status'    => 1,
                        );
                    }
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