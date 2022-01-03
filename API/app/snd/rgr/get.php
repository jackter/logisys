<?php
$Modid = 43;

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
    'def'       => 'rgr',
    'detail'    => 'rgr_detail'
);

/**
 * Get Data
 */
$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'id',
        'kode',
        'company',
        'company_abbr',
        'company_nama',
        'dept',
        'dept_abbr',
        'dept_nama',
        'po_kode',
        'gr_kode',
        'kode',
        'supplier',
        'supplier_kode',
        'supplier_nama',
        'tanggal',
        'create_by'
    ),
    "
        WHERE id = '" . $id . "'
    "
);
$R_Data = $DB->Row($Q_Data);
if($R_Data > 0){

    $Data = $DB->Result($Q_Data);

    $return['data'] = $Data;

    $return['data']['tanggal'] = date("D, d M Y", strtotime($Data['tanggal']));

    $return['data']['create_by'] = Core::GetUser("nama", $Data['create_by']);

    //=> BUSINESS UNIT TITLE 
    $Business = $DB->Result($DB->QueryOn(
        DB['master'],
        "company",
        array(
            'business_unit'
        ),
        "
            WHERE
                id = '".$Data['company']."'
        "
    ));
    $return['data']['business_unit'] = $Business['business_unit'];

    /**
     * Extract Detail
     */
    $Q_Detail = $DB->QueryPort("
        SELECT
            D.id AS detail_id,
            D.item AS id,
            D.qty_receipt,
            D.act_qty_receipt,
            D.qty_return,
            D.price,
            D.remarks,
            TRIM(I.nama) AS nama,
            I.satuan,
            I.in_decimal
        FROM
            item AS I,
            " . $Table['detail'] . " AS D
        WHERE
            D.header = '" . $id . "' AND
            D.item = I.id AND 
            D.qty_receipt > 0
    ");
    $R_Detail = $DB->Row($Q_Detail);
    if($R_Detail > 0){
        $i = 0;
        while($Detail = $DB->Result($Q_Detail)){
            $return['data']['detail'][$i] = $Detail;
            
            $i++;
        }
    }
    //=> / END : Extract Detail

}
//=> / END : Get Data

echo Core::ReturnData($return);
?>