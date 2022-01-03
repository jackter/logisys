<?php
$Modid = 56;

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
    'def'       => 'mr',
    'detail'    => 'mr_detail',
    'pr'        => 'pr',
    'po'        => 'po',
    'gr'        => 'gr'
);

/**
 * Filter
 */
$CLAUSE = "
    WHERE 
        create_date BETWEEN '" . $F_Start_send . "-01' and '" . $F_End_send . "-31'
";

$PermCompany = Core::GetState('company');
if($PermCompany != "X"){
    $CLAUSE .= " AND company IN (" . $PermCompany . ")";
}

$PermDept = Core::GetState('dept');
if($PermDept != "X"){
    $CLAUSE .= " AND dept IN (" . $PermDept . ")";
}

$PermUsers = Core::GetState('users');
if($PermUsers != "X"){
    if(!empty($PermUsers)){
        $CLAUSE .= " AND create_by IN (" . $PermUsers . ")";
    }else{
        $CLAUSE .= " AND create_by = '" . Core::GetState('id') . "'";
    }
}

if(!empty($company)){
    $CLAUSE .= " AND company = '" . $company . "'";
}
if(!empty($dept)){
    $CLAUSE .= " AND dept = '" . $dept . "'";
}
//=> / END : Filter

$return['post'] = $SENT;

/**
 * Select MR
 */
// $Q_MR = $DB->QueryPort("
//     SELECT
//         D.id AS detail_id,
//         D.item AS id,
//         D.qty,
//         D.qty_approved,
//         D.qty_outstanding,
//         D.remarks,
//         I.kode AS kode,
//         TRIM(I.nama) AS nama,
//         I.satuan,
//         I.in_decimal
//     FROM
//         item AS I,
//         " . $Table['detail'] . " AS D,
//         " . $Table['def'] . " AS H
//     WHERE
//         D.header = '" . $id . "' AND
//         D.item = I.id
// ");
$Q_MR = $DB->Query(
    $Table['def'],
    array(
        'id',
        'kode',
        'create_date' => 'tanggal'
    ),
    $CLAUSE
);
$R_MR = $DB->Row($Q_MR);

$MRs = "";
$MRsComma = "";

if($R_MR > 0){
    $i = 0;
    while($MR = $DB->Result($Q_MR)){

        $return['data'][$i] = $MR;
        $return['data'][$i]['tanggal'] = date('Y-m-d', strtotime($MR['tanggal']));

        $MRs .= $MRsComma . $MR['id'];
        $MRsComma = ',';

        $i++;
    }

    // $return['mrs'] = $MRs;
}
//=> / END : Select MR

if($MRs != ''){
    
    /**
     * Select Detail
     */
    // $Q_Detail = $DB->Query(
    //     $Table['detail'],
    //     array(
    //         // 'COUNT(*)' => 'c_group',
    //         "GROUP_CONCAT(header SEPARATOR ',') AS header",
    //         'item'
    //     ),
    //     "
    //         WHERE
    //             header IN (" . $MRs . ")
    //         GROUP BY
    //             item
    //     "
    // );
    $Q_Detail = $DB->QueryPort("
        SELECT
            D.header,
            D.item AS id,
            D.qty,
            D.qty_approved,
            D.qty_outstanding,
            D.remarks,
            I.kode AS kode,
            TRIM(I.nama2) AS nama,
            I.satuan,
            I.in_decimal
        FROM
            item AS I,
            " . $Table['detail'] . " AS D
        WHERE
            D.header IN (" . $MRs . ") AND
            D.item = I.id
    ");
    $R_Detail = $DB->Row($Q_Detail);
    if($R_Detail > 0){
        $i = 0;
        while($Detail = $DB->Result($Q_Detail)){

            $return['detail'][$i] = $Detail;

            $i++;

        }
    }
    //=> / END : Select Detail

    /**
     * SELECT PR
     */
    $Q_PR = $DB->Query(
        $Table['pr'],
        array(
            'id',
            'kode',
            'create_date' => 'tanggal',
            'mr'
        ),
        "
            WHERE
                mr IN (" . $MRs . ") AND 
                is_void != 1
        "
    );
    $R_PR = $DB->Row($Q_PR);
    if($R_PR > 0){
        $i = 0;
        while($PR = $DB->Result($Q_PR)){

            $return['pr'][$i] = $PR;
            $return['pr'][$i]['tanggal'] = date('Y-m-d', strtotime($PR['tanggal']));

            $i++;

        }
    }
    //=> / END : PR

    /**
     * SELECT PO
     */
    $POs = "";
    $POsComma = "";

    $Q_PO = $DB->Query(
        $Table['po'],
        array(
            'id',
            'kode',
            'create_date' => 'tanggal',
            'mr',
            'supplier_nama'
        ),
        "
            WHERE
                mr IN (" . $MRs . ") AND 
                is_void != 1
        "
    );
    $R_PO = $DB->Row($Q_PO);
    if($R_PO > 0){
        $i = 0;
        while($PO = $DB->Result($Q_PO)){

            $POs .= $POsComma . $PO['id'];
            $POsComma = ',';

            $return['po'][$i] = $PO;
            $return['po'][$i]['tanggal'] = date('Y-m-d', strtotime($PO['tanggal']));

            $i++;

        }
    }
    //=> / END : PO
    
    if($POs != ''){
        
        /**
         * Select GRN
         */
        $Q_GRN = $DB->Query(
            $Table['gr'],
            array(
                'id',
                'kode',
                'create_date' => 'tanggal',
                'po',
                'supplier_nama'
            ),
            "
                WHERE
                    po IN (" . $POs . ")
            "
        );
        $R_GRN = $DB->Row($Q_GRN);
        if($R_GRN > 0){
            $i = 0;
            while($GRN = $DB->Result($Q_GRN)){

                $return['gr'][$i] = $GRN;
                $return['gr'][$i]['tanggal'] = date('Y-m-d', strtotime($GRN['tanggal']));

                $i++;

            }
        }
        //=> / END : Select GRN

    }

}

echo Core::ReturnData($return);
?>