<?php
$Modid = 131;

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
    'def'       => 'item_grup_coa'
);

//=> Clean Data
if(empty($limit)){
    $limit = 10;
}
if(empty($offset)){
    $offset = 0;
}

/**
 * Filter
 */
$CLAUSE = "
    WHERE 
        id != ''
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

/**
 * Listing Data
 */
$return['start']        = 0;
$return['limit']        = $limit;
$return['count']        = 0;

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
            'company',
            'company_abbr',
            'company_nama',
            'item_grup_id',
            'item_grup_kode',
            'item_grup_nama',
            'coa_persediaan',
            'coa_kode_persediaan',
            'coa_nama_persediaan',
            'coa_penjualan',
            'coa_kode_penjualan',
            'coa_nama_penjualan',
            'coa_disc_penjualan',
            'coa_kode_disc_penjualan',
            'coa_nama_disc_penjualan',
            'coa_retur_penjualan',
            'coa_kode_retur_penjualan',
            'coa_nama_retur_penjualan',
            'coa_retur_pembelian',
            'coa_kode_retur_pembelian',
            'coa_nama_retur_pembelian',
            'coa_hpp',
            'coa_kode_hpp',
            'coa_nama_hpp',
            'coa_accrued',
            'coa_kode_accrued',
            'coa_nama_accrued',
            'coa_beban',
            'coa_kode_beban',
            'coa_nama_beban',
            'history'
        ),
        $CLAUSE . 
        "
            ORDER BY
                create_date ASC
            LIMIT 
                $offset, $limit
        "
    );

    $i = 0;
    while($Data = $DB->Result($Q_Data)){

        $return['data'][$i] = $Data;

        /**
         * Last History
         */
        $History = json_decode($Data['history'], true);
        $History = $History[0];
        $FormatHistory = $History['description'] . " - " . datetime_db_en($History['time']);

        $User = Core::GetUser("nama", $History['user']);
        if(!empty($User)){
            $FormatHistory .= " - By " . $User;
        }

        $return['data'][$i]['history'] = $FormatHistory;
        //=> / END : Last History

        $i++;
    }

}else{

}
//=> / END : Listing Data

echo Core::ReturnData($return);
?>