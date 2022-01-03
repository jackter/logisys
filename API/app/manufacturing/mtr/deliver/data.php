<?php
$Modid = 64;

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
    'def'       => 'prd_tf_deliver'
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
        prd = '".$id."'
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

// $Q_Data = $DB->Query(
//     $Table['def'],
//     array('id'),
//     $CLAUSE
// );
$Q_Data = $DB->QueryPort("
    SELECT
        H.id
    FROM
        " . $Table['def'] . " AS H,
        " . $Table['def'] . "_detail AS D
    WHERE
        D.header = H.id AND 
        prd = '" . $id . "'
");
$R_Data = $DB->Row($Q_Data);

$Optional_Data = $DB->Row($DB->QueryPort("
SELECT
    id
FROM
    " . $Table['def'] . "
WHERE
    prd = '" . $id . "'
"));

$R_Data = ($Optional_Data*2) + $R_Data;

if($R_Data > 0){

    $return['start']        = $start;
    $return['limit']        = $limit;
    $return['count']        = $R_Data;

    // $Q_Data = $DB->Query(
    //     $Table['def'],
    //     array(
    //         'id',
    //         'prd_kode',
    //         'kode',
    //         'tanggal',
    //         'create_date',
    //         'verified',
    //         'approved',
    //         'rcv',
    //         'verified_rcv',
    //         'approved_rcv',
    //         'history'
    //     ),
    //     $CLAUSE . 
    //     "
    //         ORDER BY
    //             id DESC
    //         LIMIT 
    //             $offset, $limit
    //     "
    // );
    $Q_Data = $DB->QueryPort("
        SELECT
            H.id,
            H.prd_kode,
            H.id,
            H.prd_kode,
            H.kode AS h_kode,
            H.tanggal AS h_tanggal,
            H.create_date AS h_create_date,
            H.verified,
            H.approved,
            H.rcv,
            H.verified_rcv,
            H.approved_rcv,
            H.history,
            TRIM(I.nama) AS i_nama,
            I.satuan AS i_satuan,
            I.kode,
            I.in_decimal AS i_in_decimal,
            D.qty,
            D.qty_receive,
            D.storeloc_kode
        FROM
            " . $Table['def'] . " AS H,
            " . $Table['def'] . "_detail AS D,
            item AS I
        WHERE
            D.header = H.id AND 
            D.item = I.id AND 
            H.prd = '" . $id . "'
        ORDER BY
            H.id DESC
        LIMIT 
            $offset, $limit
    ");

    $i = 0;
    $Header = "";
    while($Data = $DB->Result($Q_Data)){

        /**
         * Insert Header
         */
        if($Header != $Data['id']){
            $Header = $Data['id'];

            $return['data'][$i] = [];
            $return['data'][$i]['separator'] = 1;

            // $return['count'] = $return['count']+1;

            $i++;

            $return['data'][$i] = $Data;
            $return['data'][$i]['tanggal'] = date('d/m/Y', strtotime($Data['h_tanggal']));
            $return['data'][$i]['create_date'] = date('d/m/Y - H:i', strtotime($Data['h_create_date']));
            $return['data'][$i]['kode'] = $Data['h_kode'];
            $return['data'][$i]['qty'] = 0;
            $return['data'][$i]['qty_receive'] = 0;
            $return['data'][$i]['is_header'] = 1;
            $return['data'][$i]['history'] = "";

            // $return['count'] = $return['count']+1;

            $i++;

        }
        //=> / END : Header

        $return['data'][$i] = $Data;

        $Description = $Data['i_nama'];
        $return['data'][$i]['description'] = $Description;

        $return['data'][$i]['tanggal'] = $Data['storeloc_kode'];

        // $return['data'][$i]['tanggal'] = date('d/m/Y', strtotime($Data['tanggal']));

        // $return['data'][$i]['create_date'] = date('d/m/Y', strtotime($Data['create_date']));

        /**
         * Last Hostory
         */
        $History = json_decode($Data['history'], true);
        $History = $History[0];
        $FormatHistory = $History['description'] . " - " . datetime_db_en($History['time']);
       
        $User = Core::GetUser("nama", $History['user']);
        if(!empty($User)){
            $FormatHistory .= " - By ". $User;
        }

        $return['data'][$i]['history'] = $FormatHistory;
        // => End Last History

        $return['data'][$i]['verified'] = (int)$Data['verified'];
        $return['data'][$i]['approved'] = (int)$Data['approved'];
        $return['data'][$i]['verified_rcv'] = (int)$Data['verified_rcv'];
        $return['data'][$i]['approved_rcv'] = (int)$Data['approved_rcv'];

        
        $i++;
    }

}

echo Core::ReturnData($return);
?>