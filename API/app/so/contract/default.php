<?php
$Modid = 68;

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

//=> Company
include "app/_global/company.php";

$return['permissions'] = Perm::Extract($Modid);

$Table = array(
    'def' => 'kontrak',
    'ctm'   => 'customer'
);

/**
 * Customer
 */
$Q_CTMR = $DB->Query(
    $Table['ctm'],
    array(
        'id',
        'kode',
        'abbr',
        'nama',
        'jenis',
        'alamat',
        'kabkota',
        'provinsi'
    )
);
$R_CTMR = $DB->Row($Q_CTMR);
if ($R_CTMR > 0) {
    $i = 0;
    while ($CTMR = $DB->Result($Q_CTMR)) {

        $return['customer'][$i] = $CTMR;
        if(!empty($CTMR['jenis'])){
            $return['customer'][$i]['nama_full'] = $CTMR['jenis'] . '. ' . $CTMR['nama'];
        }
        else{
            $return['customer'][$i]['nama_full'] = $CTMR['nama'];
        }

        $i++;
    }
}
//End => Customer

/**
 * Bank
 */
$Q_BANK = $DB->QueryPort("
    SELECT
        cb.id,
        b.nama nama_bank,
        cb.no_rekening,
        cb.nama_rekening,
        cb.company
    FROM 
        company_bank cb, bank b
    WHERE 
        cb.bank = b.id
    ORDER BY 
        cb.company, b.nama, cb.no_rekening
");
$R_BANK = $DB->Row($Q_BANK);
if ($R_BANK > 0) {
    $i = 0;
    while ($BANK = $DB->Result($Q_BANK)) {

        $return['bank'][$i] = $BANK;

        $i++;
    }
}
//End => Bank

/**
 * Item
 */
$Params = Core::GetParams(array(
    'item_sales_kontrak',
    'item_sc_quality',
    'sc_notes'
));
$return['params'] = $Params;
//=> END : Item

/**
 * Extract Cur
 */
$Q_Cur = $DB->Query(
    'cur',
    array(
        'id',
        'kode',
        'nama',
        'country'
    ),
    "
        WHERE
            status = 1
        ORDER BY
            id ASC
    "
);
$R_Cur = $DB->Row($Q_Cur);

if ($R_Cur > 0) {

    $i = 0;
    while ($Cur = $DB->Result($Q_Cur)) {
        $return['currency'][$i] = $Cur;
        $i++;
    }
}
//=> / END : Extract Cur

# Address
$Q_Address = $DB->Query(
    $Table['def'],
    array(
        'syarat_penyerahan_addr'
    ),
    "
        WHERE 
            syarat_penyerahan_addr != '' OR syarat_penyerahan_addr IS NOT NULL
        GROUP BY 
            LCASE(syarat_penyerahan_addr)
        ORDER BY 
            syarat_penyerahan_addr
    "
);
$R_Address = $DB->Row($Q_Address);

if ($R_Address > 0) {
    while ($Address = $DB->Result($Q_Address)) {
        $return['address'][] = $Address['syarat_penyerahan_addr'];
    }
}

// $Params = Core::GetParams(array(
//     'item_sc_quality'
// ));
// $return['params'] = $Params;

echo Core::ReturnData($return);

?>