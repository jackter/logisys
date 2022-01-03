<?php
$Modid = 30;

Perm::Check($Modid, 'direct_pr');

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
    'def'       => 'pr',
    'detail'    => 'pr_detail',
    'LastPrice' => 'storeloc_stock_history'
);

/**
 * Create Code
 */
$Time = date('y') . "/";
$Time2 = romawi(date('n')) . "/";
$InitialCode = "PR-D/" . strtoupper($company_abbr) . "-" . strtoupper($dept_abbr) . "/" . $Time . $Time2;
$InitialCodeCheck = "PR-D/" . strtoupper($company_abbr) . "%/" . $Time;
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
    'description'	=> "Create New Purchase Request From (" . $kode . ")"
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
    'tanggal'       => $date_target_send,
    'note'          => $note,
    'create_by'		=> Core::GetState('id'),
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

                //Get Last Price
                $LastPrice = $DB->Result($DB->Query(
                    $Table['LastPrice'],
                    array(
                        'price'
                    ),
                    "
                        WHERE
                            item = '".$list[$i]['id']."'
                        ORDER BY
                            tanggal DESC
                        LIMIT 1
                    "
                ));

                $FieldDetail = array(
                    'header'        => $Header['id'],
                    'item'          => $list[$i]['id'],
                    'qty_mr'        => $list[$i]['qty'],
                    'qty_purchase'  => $list[$i]['qty'],
                    'qty_outstanding'  => $list[$i]['qty'],
                    'est_price'     => $LastPrice['price'],
                    'remarks'       => $list[$i]['remarks'],
                );

                $return['detail'][$i] = $FieldDetail;

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