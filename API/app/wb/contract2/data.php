<?php

$Modid = 188;
Perm::Check($Modid, 'view');

//=> Default Statement
$return = [];
$RPL    = "";
$SENT    = Core::Extract($_POST, $RPL);

//=> Extract Array
if (isset($SENT)) {
    foreach ($SENT as $KEY => $VAL) {
        $$KEY = $VAL;
    }
}

$return['permissions'] = Perm::Extract($Modid);

$Table = array(
    'def'       => 'wb_kontrak_dev',
    'trx'       => 'wb_transaksi'
);

//=> Clean Data
if (empty($limit)) {
    $limit = 10;
}
if (empty($offset)) {
    $offset = 0;
}

/**
 * Filter
 */
$CLAUSE = "
    WHERE 
        id != ''
";

// $PermCompany = Core::GetState('company');
// if($PermCompany != "X"){
//     $CLAUSE .= " AND company IN (" . $PermCompany . ")";
// }

// $PermDept = Core::GetState('dept');
// if($PermDept != "X" && !empty($PermDept)){
//     $CLAUSE .= " AND dept IN (" . $PermDept . ")";
// }

// $PermUsers = Core::GetState('users');
// if($PermUsers != "X"){
//     if(!empty($PermUsers)){
//         $CLAUSE .= " AND create_by IN (" . $PermUsers . ")";
//     }else{
//         $CLAUSE .= " AND create_by = '" . Core::GetState('id') . "'";
//     }
// }
//=> / END : Filter

/**
 * Filter Table
 */
$ftable = json_decode($ftable, true);
if (isset($ftable)) {
    foreach ($ftable as $Key => $Val) {

        /**
         * Generate Clause
         */
        switch ($Key) {
            case "status_data":
                if (count($Val['values']) > 0) {
                    for ($i = 0; $i < count($Val['values']); $i++) {
                        if ($i == 0) {
                            $CLAUSE .= "AND ( ";
                        }

                        switch ($Val['values'][$i]) {
                            case "PROCESS":
                                if ($i == 0) {
                                    $CLAUSE .= "finish = 0";
                                } else {
                                    $CLAUSE .= " OR finish = 0";
                                }
                                break;
                            case "FINISH":
                                if ($i == 0) {
                                    $CLAUSE .= "finish = 1";
                                } else {
                                    $CLAUSE .= "OR finish = 1";
                                }
                                break;
                        }

                        if ($i == count($Val['values']) - 1) {
                            $CLAUSE .= ")";
                        }
                    }
                }

                break;
            default:
                $CLAUSE .= "
                    AND 
                        $Key LIKE '%" . $Val['filter'] . "%'                    
                ";
        }
        //=> / END : Generate Clause
    }
}
//=> / END : Filter Table

/**
 * Listing Data
 */
$return['start']        = 0;
$return['limit']        = $limit;
$return['count']        = 0;

$Q_Data = $DB->Query(
    $Table['def'],
    array('id'),
    $CLAUSE
);
$R_Data = $DB->Row($Q_Data);

if ($R_Data > 0) {

    $return['start']        = $start;
    $return['limit']        = $limit;
    $return['count']        = $R_Data;

    $Q_Data = $DB->Query(
        $Table['def'],
        array(
            'id',
            'kode',
            'sup_cust_nama',
            'product_nama',
            'tanggal',
            'qty',
            'item_satuan',
            'finish',
            'approved'
        ),
        $CLAUSE .
            "
            ORDER BY
                create_date DESC
            LIMIT 
                $offset, $limit
        "
    );

    $i = 0;
    while ($Data = $DB->Result($Q_Data)) {

        $return['data'][$i] = $Data;

        /**
         * get total trx
         */
        $Q_Trx = $DB->Query(
            $Table['trx'],
            array(
                'SUM(netto)' => 'total'
            ),
            "
                WHERE
                    contract = '" . $Data['id'] . "'
            "
        );
        $R_Trx = $DB->Row($Q_Trx);
        if ($R_Trx > 0) {

            $Trx = $DB->Result($Q_Trx);

            $return['data'][$i]['total_netto'] = $Trx['total'];
        }
        //=> End get total trx

        $i++;
    }
}
//=> / END : Listing Data

echo Core::ReturnData($return);

?>