<?php
$Modid = 61;

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
    'def'       => 'jo',
    'sr'        => 'sr',
    'item'      => 'item'
);


/**
 * Filter
 */
$CLAUSE = "
    WHERE 
        id != '' AND
        approved = 1 AND
        finish != 1
";
//=> / END : Filter


$Q_Data = $DB->Query(
    $Table['def'],
    array('id'),
    $CLAUSE
);
$R_Data = $DB->Row($Q_Data);

if($R_Data > 0){

    $Q_Data = $DB->Query(
        $Table['def'],
        array(
            'id',
            'kode',
            'item',
            'qty'
        ),
        $CLAUSE . 
        "
            ORDER BY
                id DESC
        "
    );

    $i = 0;
    while($Data = $DB->Result($Q_Data)){

        $return['data'][$i] = $Data;

        $Item = $DB->Result($DB->Query(
            $Table['item'],
            array(
                'kode',
                'nama2' => 'nama',
                'satuan'
            ),
            "
                WHERE
                    id = '" . $Data['item'] . "'
            "
        ));
        $return['data'][$i]['item_kode'] = $Item['kode'];
        $return['data'][$i]['nama'] = $Item['nama'];
        $return['data'][$i]['satuan'] = $Item['satuan'];

        /**
         * Calculate Progress
         */
        $Q_SR = $DB->QueryPort("
            SELECT
                SUM(qty) AS total_qty
            FROM
                " . $Table['sr'] . " H, 
                " . $Table['sr'] . "_detail D
            WHERE
                D.header = H.id AND 
                H.jo = '" . $Data['id'] . "' AND 
                D.item = '" . $Data['item'] . "' AND 
                H.approved = 1
            GROUP BY
                item
        ");
        $R_SR = $DB->Row($Q_SR);
        if($R_SR > 0){
            $SR = $DB->Result($Q_SR);

            $return['data'][$i]['total_sr'] = $SR['total_qty'];

        }

        $return['data'][$i]['progres'] = ($SR['total_qty'] / $Data['qty']) * 100;
        //=> / END : Calculate Progress

        $i++;
    }
}

echo Core::ReturnData($return);
?>