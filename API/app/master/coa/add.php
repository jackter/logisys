<?php
$Modid = 86;

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
    'def'       => 'coa_master'
);

/**
 * Field
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
	'table'			=> $Table['def'],
	'clause'		=> "WHERE id = '" . $id . "'",
	'action'		=> "add",
	'description'	=> "Create COA"
);
$History = Core::History($HistoryField);

$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'id'
    ),
    "WHERE company = '".$company."'
    AND kode = '".$account_no."'"
);

$R_Data = $DB->Row($Q_Data);

if ($R_Data == 0) {
    if($is_h == true){
        $is_h = 1;
    }
    else{
        $is_h = 0;
    }
    
    $Field = array(
        'company'       => $company,
        'company_abbr'  => $company_abbr,
        'company_nama'  => $company_nama,
        'kode'          => $account_no,
        'lv1'           => $lv1,
        'lv2'           => $lv2,
        'lv3'           => $lv3,
        'lv4'           => $lv4,
        'lv5'           => $lv5,
        'nama'          => $account_name,
        'type'          => $account_type,
        'is_h'          => $is_h,
        'opening_balance'   => $opening_balance,
        'opening_as_of' =>  $date_balance_send,
        'create_by'     => Core::GetState('id'),
        'create_date'	=> $Date,
        'history'		=> $History,
        'status'        => 1
    );
    //=> / END : Field

    /**
     * Insert Data
     */
    if($DB->Insert(
        $Table['def'],
        $Field
    )){
        $return['status'] = 1;
        
        // $Q_Data = $DB->Query(
        //     $Table['def'],
        //     array(
        //         'id'
        //     ),
        //     "WHERE company = '".$company."'
        //     AND kode = '".$account_no."'"
        // );
        
        // $R_Data = $DB->Row($Q_Data);

        // if ($R_Data > 0) {
        //     $Data = $Data = $DB->Result($Q_Data);

        //     $Q_COA_Item = $DB->Query(
        //         "coa_master",
        //         array(
        //             'id', 
        //             'kode', 
        //             'nama'       
        //         ),
        //         "
        //         WHERE 
        //             kode = '31000100'
        //             and company = ".$company."
        //         "
        //     );

        //     $R_COA_Item = $DB->Row($Q_COA_Item);
        //     $return['$R_COA_Item'] = $R_COA_Item;
        //     if($R_COA_Item > 0 && $opening_balance != 0){
        //         $COA_Item = $DB->Result($Q_COA_Item);

        //         $getID_COA = $DB->Result($DB->Query(
        //             "coa_master",
        //             array(
        //                 'id'    
        //             ),
        //             "
        //             WHERE 
        //                 kode = '".$account_no."'
        //                 and company = ".$company."
        //             "
        //         ));

        //         $Time = date('y') . "/" . romawi(date('n')) . "/";
        //         $kode = "ISC/" . strtoupper($company_abbr) . "/" . $Time . $getID_COA['id'];

        //         if($opening_balance > 0){
        //             $Jurnal = App::JurnalPosting(array(
        //                 'trx_type'      => 1,
        //                 'tipe'          => 'debit',
        //                 'company'       => $company,
        //                 'source'        => $account_no,
        //                 'target'        => $COA_Item['kode'],
        //                 'target_2'      => $kode,
        //                 'currency'      => 'IDR',
        //                 'rate'          => 1,
        //                 'coa'           => $Data['id'],
        //                 'value'         => $opening_balance,
        //                 'kode'          => $kode,
        //                 'tanggal'       => $date_balance_send
        //             ));

        //             $Jurnal = App::JurnalPosting(array(
        //                 'trx_type'      => 1,
        //                 'tipe'          => 'credit',
        //                 'company'       => $company,
        //                 'source'        => $COA_Item['kode'],
        //                 'target'        => $account_no,
        //                 'target_2'      => $kode,
        //                 'currency'      => 'IDR',
        //                 'rate'          => 1,
        //                 'coa'           => $COA_Item['id'],
        //                 'value'         => $opening_balance,
        //                 'kode'          => $kode,
        //                 'tanggal'       => $date_balance_send
        //             ));
        //         }
        //         else{
        //             $Jurnal = App::JurnalPosting(array(
        //                 'trx_type'      => 1,
        //                 'tipe'          => 'debit',
        //                 'company'       => $company,
        //                 'source'        => $COA_Item['kode'],
        //                 'target'        => $account_no,
        //                 'target_2'      => $kode,
        //                 'currency'      => 'IDR',
        //                 'rate'          => 1,
        //                 'coa'           => $COA_Item['id'],
        //                 'value'         => $opening_balance,
        //                 'kode'          => $kode,
        //                 'tanggal'       => $date_balance_send
        //             ));

        //             $Jurnal = App::JurnalPosting(array(
        //                 'trx_type'      => 1,
        //                 'tipe'          => 'credit',
        //                 'company'       => $company,
        //                 'source'        => $account_no,
        //                 'target'        => $COA_Item['kode'],
        //                 'target_2'      => $kode,
        //                 'currency'      => 'IDR',
        //                 'rate'          => 1,
        //                 'coa'           => $Data['id'],
        //                 'value'         => $opening_balance,
        //                 'kode'          => $kode,
        //                 'tanggal'       => $date_balance_send
        //             ));
        //         }

        //         $return['status'] = 1;
        //     }

            // $Field = array(
            //     'year'              => $year,
            //     'month'             => $month,
            //     'company'           => $company,
            //     'company_abbr'      => $company_abbr,
            //     'company_nama'      => $company_nama,
            //     'coa'               => $Data['id'],
            //     'coa_kode'          => $account_no,
            //     'coa_nama'          => $account_name,
            //     'opening_balance'   => $opening_balance,
            //     'balance'           => $opening_balance,
            //     'create_by'         => Core::GetState('id'),
            //     'create_date'	    => $Date
            // );
            // //=> / END : Field

            // if($DB->Insert(
            //     $Table['balance'],
            //     $Field
            // )){
            //     $return['status'] = 1;
            // }
        // }
    }
}
else{
    $return = array(
        'status'    => 0,
        'error_msg' => $GLOBALS['mysql']->error
    );
}
//>> End: Insert Data

echo Core::ReturnData($return);
?>