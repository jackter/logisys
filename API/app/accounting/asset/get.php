<?php
$Modid = 51;

Perm::Check($Modid, 'view');

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
    'detail_cip'    => 'ast_detail_cip'
);

/**
 * Get Data
 */
$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'id',
        'company',
        'company_abbr',
        'company_nama',
        'IFNULL(asset_usage, 0)' => 'asset_usage',
        'cip_post_asset',
        'asset_kode',
        'asset_type',
        'asset_type_nama',
        'depreciation_method',
        'kode',
        'is_po',
        'po',
        'po_kode',
        'gr',
        'gr_kode',
        'supplier',
        'supplier_kode',
        'supplier_nama',
        'item',
        'item_nama',
        'acquisition_value',
        'tanggal',
        'est_year',
        'est_month',
        'remarks',
        'verified',
        'status'
    ),
    "
        WHERE id = '" . $id . "'
    "
);
$R_Data = $DB->Row($Q_Data);
if($R_Data > 0){
    $Data = $DB->Result($Q_Data);

    $return['data'] = $Data;

    /**
     * Detail Ast
     */
    $Q_Detail = $DB->Query(
        $Table['detail'],
        array(
            'id'        => 'id_detail',
            'coa_expenditures',
            'coa_kode_expenditures',
            'coa_nama_expenditures',
            'coa_asset',
            'coa_kode_asset',
            'coa_nama_asset',
            'coa_depreciation',
            'coa_kode_depreciation',
            'coa_nama_depreciation',
            'coa_accumulated_depreciation',
            'coa_kode_accumulated_depreciation',
            'coa_nama_accumulated_depreciation',
        ),
        "
            WHERE
                header = '".$id."'
        "
    );
    $R_Detail = $DB->Row($Q_Detail);

    if($R_Detail > 0){
        $Detail = $DB->Result($Q_Detail);

        $return['data']['detail'] = $Detail;
    }
    // => End Detail Ast

    /**
     * Detail Ast CIP
     */
    $Q_Detail = $DB->Query(
        $Table['detail_cip'],
        array(
        ),
        "
            WHERE
                header = '".$id."'
        "
    );
    $R_Detail = $DB->Row($Q_Detail);

    if($R_Detail > 0){
        $i = 0;
        while($Detail = $DB->Result($Q_Detail)){
            $return['data']['list'][$i] = $Detail;
            $i++;
        }
    }
    // => End Detail Ast CIP

}
//=> / END : Get Data

echo Core::ReturnData($return);
?>