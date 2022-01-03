<?php

$Modid = 195;
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

// $return['permissions'] = Perm::Extract($Modid);

$Table = array(
    'def'       => 'prd_issued'
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
        H.jo = $jo AND 
        D.header = H.id AND 
        D.item = I.id
";
//=> / END : Filter

/**
 * Filter Table
 */
$ftable = json_decode($ftable, true);
if (isset($ftable)) {
    foreach ($ftable as $Key => $Val) {

        /**
         * Generate Clause
         */
        switch($Key){
            case "tanggal":
                $CLAUSE .= "
                    AND 
                        H.tanggal LIKE '" . $Val['filter'] . "%'                    
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

$Q_Data = $DB->QueryPort("
    SELECT
        H.id 
    FROM
        " . $Table['def'] . " AS H, 
        " . $Table['def'] . "_detail AS D,
        item AS I
    $CLAUSE
        
");
$R_Data = $DB->Row($Q_Data);

if ($R_Data > 0) {

    $return['start']        = $start;
    $return['limit']        = $limit;
    $return['count']        = $R_Data;

    $Q_Data = $DB->QueryPort("
        SELECT 
            H.id,
            H.kode,
            H.tanggal,
            H.mrp,
            H.mrp_kode,
            H.notes,
            H.verified,
            H.approved,
            H.approved2,
            H.history,
            H.create_date,
            D.id AS detail_id,
            D.item,
            D.qty_req,
            D.qty_issued,
            D.tipe,
            I.kode AS item_kode,
            TRIM(I.nama) AS item_nama,
            I.satuan,
            I.in_decimal
        FROM  
            " . $Table['def'] . " AS H, 
            " . $Table['def'] . "_detail AS D,
            item AS I
        $CLAUSE
        ORDER BY
            H.tanggal DESC,
            H.create_date DESC,
            H.id DESC
        LIMIT 
            $offset, $limit
    ");

    $i = 0;
    while ($Data = $DB->Result($Q_Data)) {

        $return['data'][$i] = $Data;

        $return['data'][$i]['total_issued'] = 0;
        $return['data'][$i]['outstanding'] = 0;

        /**
         * Last Hostory
         */
        $History = json_decode($Data['history'], true);
        $History = $History[0];
        $FormatHistory = $History['description'] . " - " . datetime_db_en($History['time']);

        $return['data'][$i]['tanggal'] = date('d-m-Y', strtotime($Data['tanggal']));
        $return['data'][$i]['create_date'] = date('d-m-Y', strtotime($Data['create_date']));
       
        $User = Core::GetUser("nama", $History['user']);
        if(!empty($User)){
            $FormatHistory .= " - By ". $User;
        }

        $return['data'][$i]['history'] = $FormatHistory;
        // => End Last History

        $i++;

    }
}

echo Core::ReturnData($return);

?>