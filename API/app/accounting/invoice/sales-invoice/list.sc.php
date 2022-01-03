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
    'def'   => 'kontrak',
    'bl'    => 'bl',   
    'sh'    => 'sales_handover'   
);

$CLAUSE = "";
if($keyword != '' && isset($keyword)){
    $CLAUSE .= " 
        AND kode LIKE '%" . $keyword . "%'
    ";
}

if($company != '' && isset($company)){
    $CLAUSE .= "
        AND company = '" . $company . "'
    ";
}
if($cust != '' && isset($cust)){
    $CLAUSE .= "
        AND cust = '" . $cust . "'
    ";
}

/**
 * Get Data
 */
$Q_SC = $DB->Query(
    $Table['def'],
    array(
        'id',
        'company',
        'company_abbr',
        'company_nama',
        'kode',
        'cust',
        'cust_kode',
        'cust_nama',
        'cust_abbr',
        'currency',
        'dp',
        'ppn',
        'inclusive_ppn',
        'sold_price',
        'grand_total',
        'sold_price',
        'qty',
        'transport'
    ),
    "
        WHERE
            approved = 1
            $CLAUSE
        GROUP BY
            id
    "
);
$R_SC = $DB->Row($Q_SC);
if($R_SC > 0){

    $i = 0;
    while($SC = $DB->Result($Q_SC)){

        $return[$i] = $SC;

        if($SC['transport'] == 0){
            $Q_BL = $DB->Query(
                $Table['bl'],
                array(
                    'id',
                    'kode',
                    'item',
                    'item_kode',
                    'item_nama',
                    'item_satuan',
                    'qty_bl' => 'qty'
                ),
                "
                    WHERE
                        kontrak = " . $SC['id'] . "
                "
            );

            $R_BL = $DB->Row($Q_BL);
            if($R_BL > 0){
                $j = 0;
                while($BL = $DB->Result($Q_BL)){
                    $return[$i]['accrued'][$j] = $BL;
                    $return[$i]['accrued'][$j]['price'] = $SC['sold_price'];
                    $j++;
                }
            }
        }
        else{
            $Q_BL = $DB->Query(
                $Table['sh'],
                array(
                    'id',
                    'kode',
                    'item',
                    'item_kode',
                    'item_nama',
                    'item_satuan',
                    'qty_total' => 'qty'
                ),
                "
                    WHERE
                        kontrak = " . $SC['id'] . "
                "
            );

            $R_BL = $DB->Row($Q_BL);
            if($R_BL > 0){
                $j = 0;
                while($BL = $DB->Result($Q_BL)){
                    $return[$i]['accrued'][$j] = $BL;
                    $return[$i]['accrued'][$j]['price'] = $SC['sold_price'];
                    $j++;
                }
            }
        }

        $i++;
        
    }
}
//=> / END : Get Data

echo Core::ReturnData($return);
?>