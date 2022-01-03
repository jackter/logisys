<?php
$Modid = 81;

Perm::Check($Modid, 'view');

/*Default Statement*/
$return = [];
$RPL    = "";
$SENT    = Core::Extract($_POST, $RPL);

/*Extract Array*/
if (isset($SENT)) {
    foreach ($SENT as $KEY => $VAL) {
        $$KEY = $VAL;
    }
}

$Table = array(
    'def'       => 'exchange',
    'detail'    => 'cur'
);

$ftable = json_decode($ftable, true);
if(isset($ftable)){
    foreach($ftable AS $Key => $Val){

        /**
         * Generate Clause
         */
        switch($Key){
            case 'country':
                $CLAUSE .= "
                    AND 
                        C.$Key LIKE '%" . $Val['filter'] . "%'                    
                ";
                break;
            default:
                $CLAUSE .= "
                    AND 
                        E.$Key LIKE '%" . $Val['filter'] . "%'                    
                ";
        }
        //=> / END : Generate Clause
    }
}

if(empty($limit)){
    $limit = 10;
}
if(empty($offset)){
    $offset = 0;
}

$start = $offset * $limit;

$return['start']        = 0;
$return['limit']        = $limit;
$return['count']        = 0;

/** Get Data */
// $Q_Data = $DB->Query(
//     $Table['def'],
//     array(
//         'id',
//         'tanggal',
//         'description',
//         'rate',
//         'cur',
//         'cur_kode',
//         'cur_nama',
//         'country'
//     ),
//     "
//         WHERE tanggal = '" . $tgl . "'
//         $CLAUSE
//         ORDER BY
//             tanggal, cur ASC
//         LIMIT 
//             $offset, $limit
//     "
// );

$Q_Data = $DB->QueryPort("
    SELECT
        E.id,
        E.tanggal,
        E.description,
        E.rate,
        E.cur,
        E.cur_kode,
        E.cur_nama,
        C.country
    FROM
        exchange E,
        cur C 
    WHERE
        E.cur = C.id
        AND E.tanggal = '" . $tgl . "'
        $CLAUSE
        ORDER BY
            E.tanggal, E.cur ASC
        LIMIT 
            $offset, $limit
");

$R_Data = $DB->Row($Q_Data);
if ($R_Data > 0) {
    $return['count']        = $R_Data;
    $i = 0;
    while($Data = $DB->Result($Q_Data)){
        $return['data'][$i] = $Data;
        $i++;
    }
    $return['status'] = 1;
}

echo Core::ReturnData($return);

?>
