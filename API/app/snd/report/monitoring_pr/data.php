<?php
$Modid = 190;

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

$Table = array(
    'def'       => 'pr',
    'detail'    => 'pr_detail',
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
if ($PermCompany != "X") {
    $CLAUSE .= " AND company IN (" . $PermCompany . ")";
}

$PermDept = Core::GetState('dept');
if ($PermDept != "X") {
    $CLAUSE .= " AND dept IN (" . $PermDept . ")";
}

$PermUsers = Core::GetState('users');
if ($PermUsers != "X") {
    if (!empty($PermUsers)) {
        $CLAUSE .= " AND create_by IN (" . $PermUsers . ")";
    } else {
        $CLAUSE .= " AND create_by = '" . Core::GetState('id') . "'";
    }
}

if (!empty($company)) {
    $CLAUSE .= " AND company = '" . $company . "'";
}
if (!empty($dept)) {
    $CLAUSE .= " AND dept = '" . $dept . "'";
}
//=> / END : Filter

$return['post'] = $SENT;

# Select PR
$Q_PR = $DB->Query(
    $Table['def'],
    array(
        'id',
        'kode',
        'create_date' => 'tanggal'
    ),
    $CLAUSE
);
$R_PR = $DB->Row($Q_PR);

$PRs = "";
$PRsComma = "";

if ($R_PR > 0) {
    $i = 0;
    while ($PR = $DB->Result($Q_PR)) {

        $return['data'][$i] = $PR;
        $return['data'][$i]['tanggal'] = date('Y-m-d', strtotime($PR['tanggal']));

        $PRs .= $PRsComma . $PR['id'];
        $PRsComma = ',';

        $i++;
    }
}

if ($PRs != '') {

    # Select Detail
    $Q_Detail = $DB->QueryPort("
    SELECT
        D.header,
        D.item as id,
        D.qty_mr,
        D.qty_purchase,
        D.qty_outstanding,
        D.qty_cancel,
        D.est_price,
        D.remarks,
        I.kode AS kode_barang,
        I.nama AS nama_barang 
    FROM
        item AS I, 
        " . $Table['detail'] . " AS D
    WHERE
        D.header IN (" . $PRs . ") AND D.item = I.id 
");
    $R_Detail = $DB->Row($Q_Detail);

    if ($R_Detail > 0) {

        while ($Detail = $DB->Result($Q_Detail)) {
            $return['detail'][] = $Detail;
        }
    }

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
            'pr',
            'create_date' => 'tanggal',
            'supplier_nama'
        ),
        "
            WHERE
                pr IN (" . $PRs . ") AND is_void != 1
        "
    );
    $R_PO = $DB->Row($Q_PO);
    if ($R_PO > 0) {
        $i = 0;
        while ($PO = $DB->Result($Q_PO)) {

            $POs .= $POsComma . $PO['id'];
            $POsComma = ',';

            $return['po'][$i] = $PO;
            $return['po'][$i]['tanggal'] = date('Y-m-d', strtotime($PO['tanggal']));

            $i++;
        }
    }
    //=> / END : PO

    if ($POs != '') {

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
        if ($R_GRN > 0) {
            $i = 0;
            while ($GRN = $DB->Result($Q_GRN)) {

                $return['gr'][$i] = $GRN;
                $return['gr'][$i]['tanggal'] = date('Y-m-d', strtotime($GRN['tanggal']));

                $i++;
            }
        }
        //=> / END : Select GRN

    }
}

echo Core::ReturnData($return);
