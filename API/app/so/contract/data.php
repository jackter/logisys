<?php

$Modid = 68;
Perm::Check($Modid, 'view');

//=> Default Statement
$return = [];
$RPL    = "";
$SENT   = Core::Extract($_POST, $RPL);

//=> Extract Array
if (isset($SENT)) {
    foreach ($SENT as $KEY => $VAL) {
        $$KEY = $VAL;
    }
}

$Table = array(
    'def'       => 'kontrak'
);

//=> Clean Data
if (empty($limit)) {
    $limit = 10;
}
if (empty($offset)) {
    $offset = 0;
}

$return['start']        = 0;
$return['limit']        = $limit;
$return['count']        = 0;

/**
 * Filter
 */
$CLAUSE = "
    WHERE 
        id != ''
";
//=> / END : Filter

$PermCompany = Core::GetState('company');
if ($PermCompany != "X") {
    $CLAUSE .= " AND company IN (" . $PermCompany . ")";
}

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

            case ($Key == "tanggal"):  // Sesuaikan dengan field pada Table Col
                $Val = preg_replace('/[^0-9]/', '', $Val['filter']);

                $CLAUSE .= "
                    AND date_format($Key, '%d%m%Y') LIKE '%" . $Val . "%'
                ";

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
            'company_abbr',
            'cust_nama',
            'cust_abbr',
            'tanggal',
            'item',
            'item_nama',
            'item_kode',
            'qty',
            'currency',
            'sold_price',
            'ppn',
            'po',
            'grand_total',
            'verified',
            'approved'
        ),
        $CLAUSE .
            "
            ORDER BY
                tanggal DESC, create_date DESC
            LIMIT 
                $offset, $limit
        "
    );

    $i = 0;
    while ($Data = $DB->Result($Q_Data)) {

        $return['data'][$i] = $Data;

        $i++;
    }
}

echo Core::ReturnData($return);

?>