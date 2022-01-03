<?php
$Modid = 118;

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

#Menampilkan Data
include "app/_global/company.php";

$Q_Bank = $DB->QueryPort(
    "
        SELECT 
            cb.*,
            b.jenis
        FROM
            company_bank cb, 
            bank b
        WHERE 
            cb.bank = b.id
            AND b.jenis != 3
            AND cb.status != 0
        ORDER BY bank ASC
    "
);

$R_Bank = $DB->Row($Q_Bank);
if($R_Bank > 0){
    while ($Bank = $DB->Result($Q_Bank)) {
        $return['company_bank'][] = $Bank;
    }
}

$Q_Customer = $DB->Query(
    "customer",
    array(
        'id',
        'kode',
        'nama',
        'abbr'
    ),
    "
        WHERE
            status != 0
        ORDER BY nama ASC
    "
);

$R_Customer = $DB->Row($Q_Customer);
if($R_Customer > 0){
    while ($Customer = $DB->Result($Q_Customer)) {
        $return['customer'][] = $Customer;
    }
}

/**
 * Subjek
 */
$Q_Subjek = $DB->Query(
    "subjek",
    array(
        'id',
        'nama'
    ),
    "
        WHERE 
            tipe = 2
            AND status = 1
    "
);
$R_Subjek = $DB->Row($Q_Subjek);
if($R_Subjek > 0){
    while($Subjek = $DB->Result($Q_Subjek)){

        $return['subjek'][] = $Subjek;

    }
}
//=> / END : Subjek

echo Core::ReturnData($return);
?>