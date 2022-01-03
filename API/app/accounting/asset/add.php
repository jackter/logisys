<?php

$Modid = 52;

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
    'def'       => 'ast',
    'detail'    => 'ast_detail',
    'depre'     => 'ast_depreciation'
);

/**
 * Create Code
 */
$Time = date('y') . "/";
$Time2 = romawi(date('n')) . "/";
if ($asset_usage == 0 || $prog_cip_post_asset == 1) {
    $InitialCode = "AST/FA/" . strtoupper($company_abbr) . "-" . strtoupper($asset_initial) . "/" . $Time . $Time2;
    $InitialCodeCheck = "AST/FA/" . strtoupper($company_abbr) . "%/" . $Time;
} else {
    $InitialCode = "AST/WBS/" . strtoupper($company_abbr) . "-" . strtoupper($asset_initial) . "/" . $Time . $Time2;
    $InitialCodeCheck = "AST/WBS/" . strtoupper($company_abbr) . "%/" . $Time;
}
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
	'description'	=> "Create Asset List (" . $kode . ")"
);
$History = Core::History($HistoryField);

$DepreYear = json_decode($depreYear, true);

if($is_po == true){
    $Field = array(
        'company'               => $company,
        'company_abbr'          => $company_abbr,
        'company_nama'          => $company_nama,
        'asset_usage'           => $asset_usage,
        'asset_type'            => $asset_type,
        'asset_type_nama'       => $asset_type_nama,
        'depreciation_method'   => $depreciation_method,
        'kode'                  => $kode,
        'is_po'                 => $is_po,
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
        'history'		        => $History,
        'status'                => 1
    );
}else{
    $Field = array(
        'company'               => $company,
        'company_abbr'          => $company_abbr,
        'company_nama'          => $company_nama,
        'asset_usage'           => $asset_usage,
        'asset_type'            => $asset_type,
        'asset_type_nama'       => $asset_type_nama,
        'depreciation_method'   => $depreciation_method,
        'kode'                  => $kode,
        'is_po'                 => $is_po,
        'acquisition_value'     => $acquisition_value,
        'tanggal'               => $tanggal_send,
        'est_year'              => $est_year,
        'est_month'             => $est_month,
        'remarks'               => $remarks,
        'create_by'             => Core::GetState('id'),
        'create_date'	        => $Date,
        'history'		        => $History,
        'status'                => 1
    );
}

$DB->ManualCommit();

if($DB->Insert(
    $Table['def'],
    $Field
)){
    if($prog_cip_post_asset == 1){
        $Data = $DB->Result($DB->Query(
            $Table['def'],
            array(
                'id'
            ),
            "
                WHERE kode = '" . $kode . "'
            "));

        $Field = array(
            'cip_post_asset'    => 1,
            'asset_header'      => $Data['id'],
            'asset_kode'        => $kode
        );

        $DB->Update(
            $Table['def'],
            $Field,
            "
                id = '" . $id . "'
            "
        );

        $return['id'] = $Data['id'];
    }

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

        if($asset_usage == 0){
            $FieldDetail = array(
                'header'                                => $Header['id'],
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
                'coa_nama_accumulated_depreciation'     => $coa_nama_accumulated_depreciation,
            );
    
            $DB->Insert(
                $Table['detail'],
                $FieldDetail
            );
    
            if($depreciation_method > 0){
                $Query = "";
                for($i = 0; $i < sizeof($DepreYear); $i++){
                    $Query = "insert into ".$Table['depre']." (header, tanggal, value, remarks, create_by, create_date) values(".$Header['id'].", '".$DepreYear[$i]['tanggal']."', ".$DepreYear[$i]['value'].", 'Depresiasi bulan ke - ".($i+1)."', '".Core::GetState('id')."', '".$Date."'); ";

                    $DB->QueryPort($Query);
                }
    
                // $DB->QueryMulti($Query);
            }
        }

        $DB->Commit();
        $return['status'] = 1;

    }
    // => End Insert Detail


}else{
    $return = array(
        'status'    => 0,
        'error_msg' => $GLOBALS['mysql']->error
    );
}
//=> / END : Field

echo Core::ReturnData($return);
?>