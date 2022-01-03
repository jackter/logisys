<?php
$Modid = 130;

Perm::Check($Modid, 'hapus');

//=> Default Statement
$return = [];
$RPL	= "";
$SENT   = Core::Extract($_POST, $RPL);

//=> Extract Array
if(isset($SENT)){
    foreach($SENT as $KEY => $VAL){	
        $$KEY = $VAL;
    }
}

$Table = array(
    'def'       => 'mti',
    'detail'    => 'mti_detail',
    'detail_2'  => 'mto_detail'
);

$DB->ManualCommit();

$Q_Detail = $DB->QueryPort("
    SELECT
        D.id AS detail_id,
        D.qty_os,
        D2.qty 
    FROM
        mto H,
        mto_detail D,
        mti H2,
        mti_detail D2 
    WHERE
        H.id = D.header 
        AND H.id = H2.mto 
        AND H2.id = D2.header 
        AND D.item = D2.item 
        AND H2.id = '".$id."'
");
$R_Detail = $DB->Row($Q_Detail);
if($R_Detail > 0){
    while($Detail = $DB->Result($Q_Detail)){
        $FieldDetail = array(
            'qty_os'    => $Detail['qty_os'] + $Detail['qty']
        );

        $DB->Update(
            $Table['detail_2'],
            $FieldDetail,
            "id = '" . $Detail['detail_id'] . "'"
        );
    }
}

if($DB->Delete(
    $Table['detail'],
    "header = '" . $id . "'"
)){
    if(
        $DB->Delete(
            $Table['def'],
            "
                id = '" . $id . "'
            "
    )){

        $DB->Commit();

        $return['status'] = 1;
    }
}else{
    $return = array(
        'status'        => 0,
        'error_msg'     => "Cannot Delete Material Transfer"
    );
}

echo Core::ReturnData($return);
?>