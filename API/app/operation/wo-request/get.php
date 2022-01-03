<?php

$Modid = 138;
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
    'def'           => 'wo'

);

# Get Data
$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'id',
        'kode',
        'req_kode',
        'company',
        'company_abbr',
        'company_nama',
        'dept',
        'dept_abbr',
        'dept_nama',
        'dept_section_abbr',
        'dept_section_nama',
        'lokasi',
        'lokasi_nama',
        'shift',
        'order_date',
        'section',
        'equipment',
        'equipment_kode',
        'maintenance_type',
        'job_title',
        'approved',
        'approved_by',
        'approved_date',
        'gm_approve',
        'gm_approved',
        'processed',
        'create_by',
        'create_date'
    ),
    "
        WHERE 
            id = '" . $id . "'
    "
);
$R_Data = $DB->Row($Q_Data);

if ($R_Data > 0) {
    $Data = $DB->Result($Q_Data);

    $return['data'] = $Data;

    $return['data']['maintenance_type'] = (int) $Data['maintenance_type'];

    $return['data']['create_by'] = Core::GetUser("nama", $Data['create_by']);
    $return['data']['create_date'] = date("d/m/Y H:i:s", strtotime($Data['create_date'])) . " WIB";

    if (!empty($Data['approved_by'])) {
        $return['data']['approved_by'] = Core::GetUser("nama", $Data['approved_by']);
        $return['data']['approved_date'] = date("d/m/Y H:i:s", strtotime($Data['approved_date'])) . " WIB";
    }
    

  
    //=> BUSINESS UNIT TITLE 
    $Business = $DB->Result($DB->QueryOn(
        DB['master'],
        "company",
        array(
            'business_unit'
        ),
        "
            WHERE
                id = '" . $Data['company'] . "'
        "
    ));
    $return['data']['business_unit'] = $Business['business_unit'];

}
echo Core::ReturnData($return);

?>