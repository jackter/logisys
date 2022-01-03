<?php
$Modid = 49;

Perm::Check($Modid, 'edit');

$return = [];
$RPL = "";
$SENT = Core::Extract($_POST, $RPL);

/* Extract Array */
if(isset($SENT)){
    foreach($SENT as $KEY => $VAL){	
        $$KEY = $VAL;
    }
}

/*Update Data*/
if($DB->UpdateOn(
    DB['master'],
    "company",
    array(
        'nama'              => $nama,
        'abbr'              => $abbr,
        'grup'              => $grup,
        'status'            => 1
    ),
    "id = '" . $id . "'"
)){

    $return['status'] = 1;

}else{
    $return = array(
        'status'        => 0,
        'error_msg'     => 'Gagal Mengedit Data'
    );
}

echo Core::ReturnData($return);

?>