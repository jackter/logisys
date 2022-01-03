<?php

$Modid = 51;

Perm::Check($Modid, 'verify');

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

$Table = array(
    'def'       => 'ast'
);

/**
 * Update Verify
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
	'table'			=> $Table['def'],
	'clause'		=> "WHERE id = '" . $id . "'",
	'action'		=> "verify",
	'description'	=> "Verify Journal Entry " . $kode
);
$History = Core::History($HistoryField);

$Field = array(
    'verified'      => 1,
    'verified_by'   => Core::GetState('id'),
	'verified_date'	=> $Date,
	'history'		=> $History
);

$DB->ManualCommit();

$list = json_decode($list, true);

if($DB->Update(
    $Table['def'],
    $Field,
    "id = '" . $id . "'"
)){
    if($asset_usage == 0){
        /**
         * Get Data
         */
        $Q_Data = $DB->QueryPort("
            SELECT
                H.kode,
                H.asset_type_nama,
                H.acquisition_value,
                D.id AS id_detail,
                H.tanggal,
                H.remarks,
                D.coa_expenditures,
                D.coa_kode_expenditures,
                D.coa_nama_expenditures,
                D.coa_asset,
                D.coa_kode_asset,
                D.coa_nama_asset 
            FROM
                ast_detail D,
                ast H 
            WHERE
                H.id = D.header 
                AND H.id = '".$id."'");

        $R_Data = $DB->Row($Q_Data);

        if($R_Data > 0){
            while($Data = $DB->Result($Q_Data)){
                $Jurnal = App::JurnalPosting(array(
                    'trx_type'      => 8,
                    'tipe'          => 'debit',
                    'company'       => $company,
                    'source'        => $Data['kode'],
                    'target'        => $Data['asset_type_nama'],
                    'currency'      => 'IDR',
                    'rate'          => 1,
                    'coa'           => $Data['coa_asset'],
                    'value'         => $Data['acquisition_value'],
                    'kode'          => $Data['kode'],
                    'tanggal'       => $Data['tanggal'],
                    'keterangan'    => $Data['remarks']
                ));
                //=> / END : Insert to Jurnal Posting and Update Balance

                $Jurnal = App::JurnalPosting(array(
                    'trx_type'      => 8,
                    'tipe'          => 'credit',
                    'company'       => $company,
                    'source'        => $Data['kode'],
                    'target'        => $Data['asset_type_nama'],
                    'currency'      => 'IDR',
                    'rate'          => 1,
                    'coa'           => $Data['coa_expenditures'],
                    'value'         => $Data['acquisition_value'],
                    'kode'          => $Data['kode'],
                    'tanggal'       => $Data['tanggal'],
                    'keterangan'    => $Data['remarks']
                ));
                //=> / END : Insert to Jurnal Posting and Update Balance

                $return['jurnalPosting'][$i] = $Jurnal['msg'];
            }
        }
    }

    $DB->Commit();
    $return['status'] = 1;

}else{
    $return = array(
        'status'    => 0,
        'error_msg' => $GLOBALS['mysql']->error
    );
}
// => / END: Update Verify

echo Core::ReturnData($return);
?>