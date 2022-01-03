<?php

$Modid = 57;
Perm::Check($Modid, 'add');

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

$Params = Core::GetParams(array(
    'min_periode_end',
    'closing_params'
));

$return['valid'] = 0;

for($i = 0; $i < count($Params['min_periode_end']['value']); $i++){
    if($Params['min_periode_end']['value'][$i]['company'] == $company){
        if($year <= $Params['min_periode_end']['value'][$i]['data'][0]['value']){
            if($month < $Params['min_periode_end']['value'][$i]['data'][1]['value']){
                $return = array(
                    'status'    => 0,
                    'error_msg' => 'Tidak dapat melakukan Proses, Balance pada periode ini melalui proses pengangkatan balance by administrator'
                );
                echo Core::ReturnData($return);
                exit();
            }
        }
        $return['valid'] = 1;
    }
}

$Table = array(
    'def'           => 'periode_end'
);

/**
 * Field
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
    'table'         => $Table['def'],
    'clause'        => "WHERE id = '" . $id . "'",
    'action'        => "add",
    'description'   => "Periode Closing (" . $id . ")"
);
$History = Core::History($HistoryField);
$Field = array(
    'company'       => $company,
    'company_abbr'  => $company_abbr,
    'company_nama'  => $company_nama,
    'year'          => $year,
    'month'         => $month,
    'create_by'     => Core::GetState('id'),
    'create_date'   => $Date,
    'history'       => $History,
    'status'        => 1
);
//=> / END : Field

include('reclosing.journal.php');

$DB->ManualCommit();

/**
 * Delete & Insert Data
 */

if ($DB->QueryPort("
    DELETE 
        FROM periode_end
    WHERE company = " . $company . " 
        AND year = '" . $year . "'
        AND month = '" . $month . "'"
    )) {
    if ($DB->Insert(
        $Table['def'],
        $Field
    )) {
        Reclosing::closingStockLedger($company, $year, $month, $year_plus, $month_plus);
        Reclosing::closingHPP($company, $year, $month, $year_min, $month_min, $year_plus, $month_plus);
        // Reclosing::closingGR($company, $year, $month);
        // Reclosing::closingRGR($company, $year, $month);
        // Reclosing::closingGI($company, $year, $month);
        // Reclosing::closingRGI($company, $year, $month);
        // Reclosing::closingINV_SD($company, $year, $month);
        Reclosing::closingJV($company, $year, $month);
        // Reclosing::closingAsset($company, $year, $month);
        // Reclosing::closingDepreciation($company, $tgl);
        // Reclosing::closingSP3($company, $year, $month);
        // Reclosing::closingBR($company, $year, $month);
        // Reclosing::closingBP($company, $year, $month);
        // Reclosing::closingBankBalance($company, $year, $month, $year_plus, $month_plus);
        Reclosing::closingBalance($company, $year, $month);

        $DB->Commit();
        $return['status'] = 1;
    }
} else {
    $return = array(
        'status'    => 0,
        'error_msg' => $GLOBALS['mysql']->error
    );
}
//=> / END : Insert Data

echo Core::ReturnData($return);

?>