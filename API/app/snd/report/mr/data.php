<?php
$Modid = 35;

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
    'def'     => 'mr'
);

$fdari = stddate($fdari, "/");
$fhingga = stddate($fhingga, "/");

$CLAUSE = $CLAUSE2 = "";

if(!empty($company)){
    $CLAUSE .= "
        AND company = $company
    ";
    $CLAUSE2 .= "
        AND H.company = $company
    ";
}
if(!empty($dept)){
    $CLAUSE .= "
        AND dept = $dept
    ";
    $CLAUSE2 .= "
        AND H.dept = $dept
    ";
}

$Check = $DB->Row($DB->Query(
    $Table['def'],
    array(
        'id'
    ),
    "
        WHERE
            finish = 0
            $CLAUSE
    "
));

if($Check > 0){
    $Q_Data = $DB->QueryPort("
    SELECT
        I.id,
        H.kode AS mr_kode,
        I.kode,
        TRIM(I.nama) AS nama,
        I.satuan,
        H.company,
        H.dept_abbr,
        D.qty_approved,
        D.qty_outstanding,
        DATE_FORMAT(H.create_date, '%Y-%m-%d') AS date_request,
        H.date_target
    FROM
        mr AS H,
        mr_detail AS D,
        item AS I
    WHERE
        H.id = D.header AND 
        D.item = I.id AND 
        H.finish = 0 AND 
        H.approved = 1 AND 
        H.processed = 1
        $CLAUSE2
    ORDER BY
        H.kode ASC,
        I.kode ASC
    ");
    $R_Data = $DB->Row($Q_Data);
    if($R_Data > 0){
        $no = 1;
        $i = 0;
        while($Data = $DB->Result($Q_Data)){

            $return['data'][$i] = $Data;
            $return['data'][$i]['no'] = $no;

            $return['data'][$i]['date_request'] = date('d/m/Y', strtotime($Data['date_request']));
            $return['data'][$i]['date_target'] = date('d/m/Y', strtotime($Data['date_target']));

            /**
             * Time Left
             */
            $TimeLeft = timebydate(date('Y-m-d'), $Data['date_target']);
            $RTimeLeft = 0;
            if($TimeLeft['bulan'] > 0){
                $RTimeLeft = $TimeLeft['bulan'] . " months,";
            }
            if($TimeLeft['hari'] > 0){
                $RTimeLeft = $TimeLeft['hari'] . " days";
            }
            $return['data'][$i]['time_left'] = $RTimeLeft;
            //=> / END : Time Left

            /**
             * Total GI
             */
            $return['data'][$i]['qty_gi'] = $Data['qty_approved'] - $Data['qty_outstanding'];
            //=> / END : Total GI

            /**
             * Get Stock
             */
            $Stock = App::GetStock(array(
                'item'      => $Data['id'],
                'company'   => $Data['company']
            ));
            $return['data'][$i]['stock'] = $Stock;
            //=> / END : Get Stock

            $no++;
            $i++;
        }
    }
}

echo Core::ReturnData($return);
?>