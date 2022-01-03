<?php
$Modid = 12;

Perm::Check($Modid, 'add');

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
    'def'       => 'sys_group',
    'auth'      => 'sys_auth'
);

/**
 * Insert to Sys Group
 * 
 * fungsi yang digunakan untuk memasukkan data ke table sys_group
 */
if($DB->Insert(
    $Table['def'],
    array(
        'nama'          => $nama,
        'keterangan'    => $keterangan,
        'status'        => 1
    )
)){

    /**
     * Select Inserted Group
     * 
     * Pemanggilan data yang baru dimasukkan pada sys_grup
     */
    $Group = $DB->Result($DB->Query(
        $Table['def'],
        array('id'),
        "
            WHERE
                nama = '" . $nama . "' AND 
                keterangan = '" . $keterangan . "'
            ORDER BY 
                id DESC
        "
    ));
    //=> / END : Select Inserted Group

    /**
     * Create new Auth
     * 
     * fungsi yang digunakan untuk menambahkan sys_auth sesuai dengan
     * id yang secara auto increment disimpan pada sys_group
     */
    $DB->Insert(
        $Table['auth'],
        array(
            'gperm'     => $Group['id'],
            'status'    => 1
        )
    );
    //=> / END : Create new Auth

    $return['status'] = 1;

}else{
    $return = array(
        'status'        => 0,
        'error_msg'     => 'Gagal Menambahkan Group'
    );
}
//=> / END : Insert to Sys Group

echo Core::ReturnData($return);
?>