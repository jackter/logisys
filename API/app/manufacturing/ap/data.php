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

$return['permissions'] = Perm::Extract($Modid);

$Table = array(
    'def'       => 'jo',
    'sr'        => 'sr',
    'item'      => 'item'
);

//=> Clean Data
if(empty($limit)){
    $limit = 10;
}
if(empty($offset)){
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
        id != '' AND
        approved = 1
";
//=> / END : Filter

/**
 * Filter Table
 */
$ftable = json_decode($ftable, true);
if(isset($ftable)){
    foreach($ftable AS $Key => $Val){

        /**
         * Generate Clause
         */
        switch($Key){
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

if($R_Data > 0){

    $return['start']        = $start;
    $return['limit']        = $limit;
    $return['count']        = $R_Data;

    $Q_Data = $DB->Query(
        $Table['def'],
        array(
            'id',
            'storeloc_kode',
            'plant',
            'kode',
            'description',
            'tanggal',
            'item',
            'qty',
            'finish',
            'create_date'
        ),
        $CLAUSE . 
        "
            ORDER BY
                id DESC
            LIMIT 
                $offset, $limit
        "
    );

    $i = 0;
    while($Data = $DB->Result($Q_Data)){

        $return['data'][$i] = $Data;

        $return['data'][$i]['create_date'] = date('d/m/Y', strtotime($Data['create_date']));

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

            // $Data['total_sr'] = $SR['total_qty'];
        }
        //=> / END : Calculate Progress

        $i++;
    }
}

echo Core::ReturnData($return);
?>