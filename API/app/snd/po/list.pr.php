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
    'pr' => 'pr',
    'pr_detail' => 'pr_detail'
);

$CLAUSE = "";

if($keyword != '' && isset($keyword)){
    $CLAUSE .= " 
        AND pr.kode LIKE '%" . $keyword . "%'
    ";
}

$PermCompany = Core::GetState('company');
if($PermCompany != "X"){
    $CLAUSE .= " AND pr.company IN (" . $PermCompany . ")";
}

$PermDept = Core::GetState('dept');
if($PermDept != "X" && !empty($PermDept)){
    $CLAUSE .= " AND pr.dept IN (" . $PermDept . ")";
}

$PermUsers = Core::GetState('users');
if($PermUsers != "X"){
    if(!empty($PermUsers)){
        $CLAUSE .= " AND pr.create_by IN (" . $PermUsers . ")";
    }else{
        $CLAUSE .= " AND pr.create_by = '" . Core::GetState('id') . "'";
    }
}
//=> / END : Filter
/**
 * Get Data
 */
$Q_PR = $DB->QueryPort("
    SELECT
        pr.*,
        SUM(prd.qty_outstanding) qty_outstanding
    FROM
        pr,
        pr_detail AS prd
    WHERE
        prd.header = pr.id AND 
        pr.finish = 1 AND 
        qty_outstanding > 0
        $CLAUSE
    GROUP BY
        pr.id
");
$R_PR = $DB->Row($Q_PR);
if($R_PR > 0){
    $i = 0;
    while($PR = $DB->Result($Q_PR)){

        $return[$i] = $PR;
        $return[$i]['allchecked'] = 1;
        
        /**
         * Get Detail
         */
        $Q_Detail = $DB->QueryPort("
            SELECT
                D.id AS detail_id,
                D.item AS id,
                D.qty_mr AS qty,
                D.qty_purchase,
                D.qty_outstanding,
                D.est_price,
                D.remarks,
                TRIM(I.nama) AS nama,
                I.satuan,
                I.in_decimal
            FROM
                item AS I,
                " . $Table['pr_detail'] . " AS D
            WHERE
                D.header = '" . $PR['id'] . "' AND
                D.item = I.id
        ");
        $R_Detail = $DB->Row($Q_Detail);

        if($R_Detail > 0){
            $j = 0;
            while($Detail = $DB->Result($Q_Detail)){
                $return[$i]['list'][$j] = $Detail;
                $return[$i]['list'][$j]['selected'] = 1;

                //untuk kebutuhan calculate func CalOutstanding() di ts
                $return[$i]['list'][$j]['qty_po'] = 0;

                $j++;
            }
        }
        //=> / END : Detail PR

        $i++;

    }
}
//=> / END : Get Data

echo Core::ReturnData($return);
?>