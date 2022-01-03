<?php

$Modid = 51;

Perm::Check($Modid, 'edit');

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
    'def'       => 'ast',
    'detail'    => 'ast_detail',
    'depre'     => 'ast_depreciation'
);

/**
 * Field
 */
$LIST = json_decode($list, true);

$Date = date("Y-m-d H:i:s");

$HistoryField = array(
	'table'			=> $Table['def'],
	'clause'		=> "WHERE id = '" . $id . "'",
	'action'		=> "edit",
	'description'	=> "Edit Asset List " . $kode
);
$History = Core::History($HistoryField);

$DepreYear = json_decode($depreYear, true);

if($is_po == true){
    $Field = array(
        'company'               => $company,
        'company_abbr'          => $company_abbr,
        'company_nama'          => $company_nama,
        'asset_type'            => $asset_type,
        'asset_type_nama'       => $asset_type_nama,
        'depreciation_method'   => $depreciation_method,
        'kode'                  => $kode,
        'is_po'                 => 1,
        'po'                    => $po,
        'po_kode'               => $po_kode,
        'gr'                    => $gr,
        'gr_kode'               => $gr_kode,
        'supplier'              => $supplier,
        'supplier_kode'         => $supplier_kode,
        'supplier_nama'         => $supplier_nama,
        'item'                  => $item,
        'item_nama'             => $item_nama,
        'acquisition_value'     => $acquisition_value,
        'tanggal'               => $tanggal_send,
        'est_year'              => $est_year,
        'est_month'             => $est_month,
        'remarks'               => $remarks,
        'create_by'             => Core::GetState('id'),
        'create_date'	        => $Date,
        'update_by'             => Core::GetState('id'),
        'update_date'	        => $Date,
        'history'		        => $History,
        'status'                => 1
    );
}else{
    $Field = array(
        'company'               => $company,
        'company_abbr'          => $company_abbr,
        'company_nama'          => $company_nama,
        'asset_type'            => $asset_type,
        'asset_type_nama'       => $asset_type_nama,
        'depreciation_method'   => $depreciation_method,
        'kode'                  => $kode,
        'is_po'                 => 0,

        'po'                    => null,
        'po_kode'               => null,
        'gr'                    => null,
        'gr_kode'               => null,
        'supplier'              => null,
        'supplier_kode'         => null,
        'supplier_nama'         => null,
        'item'                  => null,
        'item_nama'             => null,

        'acquisition_value'     => $acquisition_value,
        'tanggal'               => $tanggal_send,
        'est_year'              => $est_year,
        'est_month'             => $est_month,
        'remarks'               => $remarks,
        'create_by'             => Core::GetState('id'),
        'create_date'	        => $Date,
        'update_by'             => Core::GetState('id'),
        'update_date'	        => $Date,
        'history'		        => $History,
        'status'                => 1
    );
}
//=> / END : Field

$DB->ManualCommit();

/**
 * Update Data
 */
if($DB->Update(
    $Table['def'],
    $Field,
    "
        id = '" . $id . "'
    "
)){
    $FieldDetail = array(
        'header'                                => $id,
        'coa_expenditures'                      => $coa_expenditure,
        'coa_kode_expenditures'                 => $coa_kode_expenditure,
        'coa_nama_expenditures'                 => $coa_nama_expenditure,
        'coa_asset'                             => $coa_asset,
        'coa_kode_asset'                        => $coa_kode_asset,
        'coa_nama_asset'                        => $coa_nama_asset,
        'coa_depreciation'                      => $coa_depreciation,
        'coa_kode_depreciation'                 => $coa_kode_depreciation,
        'coa_nama_depreciation'                 => $coa_nama_depreciation,
        'coa_accumulated_depreciation'          => $coa_accumulated_depreciation,
        'coa_kode_accumulated_depreciation'     => $coa_kode_accumulated_depreciation,
        'coa_nama_accumulated_depreciation'     => $coa_nama_accumulated_depreciation
    );

    if($DB->Update(
        $Table['detail'],
        $FieldDetail,
        "
            id = '" . $id . "'
        "
    )){
        $return['status_detail']= array(
            'status'    => 1,
            'coa_expenditures'                      => $coa_expenditure,
            'coa_kode_expenditures'                 => $coa_kode_expenditure,
            'coa_nama_expenditures'                 => $coa_nama_expenditure,
            'coa_asset'                             => $coa_asset,
            'coa_kode_asset'                        => $coa_kode_asset,
            'coa_nama_asset'                        => $coa_nama_asset,
            'coa_depreciation'                      => $coa_depreciation,
            'coa_kode_depreciation'                 => $coa_kode_depreciation,
            'coa_nama_depreciation'                 => $coa_nama_depreciation,
            'coa_accumulated_depreciation'          => $coa_accumulated_depreciation,
            'coa_kode_accumulated_depreciation'     => $coa_kode_accumulated_depreciation,
            'coa_nama_accumulated_depreciation'     => $coa_nama_accumulated_depreciation
        );

        if($DB->Delete(
            $Table['depre'],
            "
                header = '".$id."'
            "
        )){
            if($depreciation_method > 0){
                $Query = "";
                for($i = 0; $i < sizeof($DepreYear); $i++){
                    $Query = "insert into ".$Table['depre']." (header, tanggal, value, remarks, create_by, create_date) values(".$id.", '".$DepreYear[$i]['tanggal']."', ".$DepreYear[$i]['value'].", 'Depresiasi bulan ke - ".($i+1)."', '".Core::GetState('id')."', '".$Date."'); ";

                    $DB->QueryPort($Query);
                }

                // $DB->QueryMulti($Query);
            }

            $DB->Commit();

            $return['status'] = 1;
        }
    }
}else{
    $return = array(
        'status'    => 0,
        'error_msg' => $GLOBALS['mysql']->error
    );
}
//=> / END : Update Data

echo Core::ReturnData($return);
?>