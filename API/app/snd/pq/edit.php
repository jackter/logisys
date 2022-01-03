<?php
$Modid = 31;

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

$list = json_decode($supplier_list, true);

$Table = array(
    'def'       => 'pq',
    'supplier'  => 'pq_supplier'
);

$DB->ManualCommit();

$IDs = [];
for ($i = 0; $i < sizeof($list); $i++) {

    if ($list[$i]['quoted'] > 0) {
        $IDs[] = $list[$i]['id'];
    }

    if ($list[$i]['quoted'] <= 0) {
        if (!empty($list[$i]['id'])) {

            $IDs[] = $list[$i]['id'];

            $Q_Check = $DB->Query(
                $Table['supplier'],
                array('id'),
                "
                    WHERE 
                        id = '" . $list[$i]['detail_id'] . "'
                "
            );
            $R_Check = $DB->Row($Q_Check);

            if ($R_Check <= 0) {
                if ($DB->Insert(
                    $Table['supplier'],
                    array(
                        'header'        => $id,
                        'supplier'      => $list[$i]['id'],
                        'kode'          => $list[$i]['kode'],
                        'nama'          => $list[$i]['nama'],
                        'remarks'       => $list[$i]['remarks'],
                    )
                )) {
                    $return['list'][$i]['add'] = $list[$i]['id'];
                }
            } else {
                if ($DB->Update(
                    $Table['supplier'],
                    array(
                        'remarks'       => $list[$i]['remarks'],
                    ),
                    "
                        id = '" . $list[$i]['detail_id'] . "'
                    "
                )) {
                    $return['list'][$i]['update'] = $list[$i]['id'];
                }
            }
        }
    }
    //$return['list'][$i] = $list[$i];
}

/**
 * Delete Supplier
 */
if ($DB->Delete(
    $Table['supplier'],
    "
        header = '" . $id . "' AND 
        supplier NOT IN (" . implode(",", $IDs) . ")
    "
)) {

    $DB->Commit();

    $return['delete'] = 1;
}
//=> / END : Delete Supplier

echo Core::ReturnData($return);

?>