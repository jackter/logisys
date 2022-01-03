<?php
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
    'def'           => 'po',
    'po_detail'     => 'po_detail'
);

$CLAUSE = "
    WHERE
        company = " . $company . " AND
        supplier = " . $supplier . " AND
        submited = 1
";

$CLAUSE .= " 
    AND os_dp > 0
    AND dp > 0
";

if($keyword != ''){
    $CLAUSE .= " 
        AND kode LIKE '%" . $keyword . "%'
    ";
}

/**
 * Get Data
 */
$Q_PO = $DB->Query(
    $Table['def'],
    array(
        'id',
        'company',
        'company_abbr',
        'company_nama',
        'dept',
        'dept_abbr',
        'dept_nama',
        'kode',
        'supplier',
        'supplier_kode',
        'supplier_nama',
        'os_dp' => 'dp',
        'os_dp',
        'total',
        'disc',
        'tax_base',
        'ppn',
        'inclusive_ppn',
        'customs',
        'pph',
        'pph_code',
        'other_cost',
        'ppbkb',
        'grand_total'
    ),
    $CLAUSE . 
    "
        LIMIT
            100
    "
);
$R_PO = $DB->Row($Q_PO);
if($R_PO > 0){

    $i = 0;
    while($PO = $DB->Result($Q_PO)){

        /**
         * Get Detail PO
         */
        $Q_Detail = $DB->QueryPort("
            SELECT
                D.id AS detail_id,
                D.item AS id,
                D.qty_invoice,
                D.qty_po - D.qty_cancel - D.qty_invoice AS qty,
                D.price,
                D.pph,
                TRIM(I.nama) AS nama,
                I.satuan,
                I.in_decimal
            FROM
                item AS I,
                " . $Table['po_detail'] . " AS D
            WHERE
                D.header = '" . $PO['id'] . "' AND
                D.item = I.id AND
                D.qty_po - D.qty_cancel - D.qty_invoice > 0
        ");
        $R_Detail = $DB->Row($Q_Detail);

        if($R_Detail > 0){

            $return['po'][$i] = $PO;

            $j = 0;
            while($Detail = $DB->Result($Q_Detail)){

                $return['po'][$i]['list'][$j] = $Detail;
                $j++;
            }
            
            $i++;
        }
        //=> / END : Get Detail PO

    }
}
//=> / END : Get Data

echo Core::ReturnData($return);
?>