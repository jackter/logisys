<?php
$Modid = 34;

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
    'def'           => 'stock',
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
        tanggal BETWEEN '" . $periode_start . "' AND '" . $periode_end . "' AND 
        company = '" . $company . "' AND 
        item = '" . $item . "'
";
if(isset($storeloc)){
    $CLAUSE .= " AND storeloc = '" . $storeloc . "'";
}

$PermCompany = Core::GetState('company');
if($PermCompany != "X"){
    $CLAUSE .= " AND company IN (" . $PermCompany . ")";
}

$PermDept = Core::GetState('dept');
if($PermDept != "X" && !empty($PermDept)){
    $CLAUSE .= " AND dept IN (" . $PermDept . ")";
}

// $PermUsers = Core::GetState('users');
// if($PermUsers != "X"){
//     if(!empty($PermUsers)){
//         $CLAUSE .= " AND create_by IN (" . $PermUsers . ")";
//     }else{
//         $CLAUSE .= " AND create_by = '" . Core::GetState('id') . "'";
//     }
// }
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

$return['clause'] = $CLAUSE;

if($R_Data > 0){

    $return['start']        = $start;
    $return['limit']        = $limit;
    $return['count']        = $R_Data;

    $Q_Data = $DB->Query(
        $Table['def'],
        array(
            'id',
            'ref_kode',
            'company',
            'company_abbr',
            'tanggal',
            'item',
            //'item_nama',
            // 'saldo',
            'debit',
            'credit',
            'saldo_akhir',
            'storeloc',
            'storeloc_kode',
            'storeloc_nama',
            'keterangan',
            'create_by',
            'create_date'
        ),
        $CLAUSE . 
        "
            ORDER BY
                storeloc_kode ASC,
                tanggal ASC,
                create_date ASC
            LIMIT 
                $offset, $limit
        "
    );

    $i = 0;
    $LastStoreloc = 0;
    while($Data = $DB->Result($Q_Data)){
        $return['data'][$i] = $Data;

        if($LastStoreloc != $Data['storeloc']){
            $LastStoreloc = $Data['storeloc'];

            $return['data'][$i]['saldo'] = App::GetOpeningStockLedger(array(
                'company'   => $Data['company'],
                'storeloc'  => $Data['storeloc'],
                'item'      => $Data['item'],
                'tanggal'   => $Data['tanggal']
            ));
        }

        $return['data'][$i]['tanggal'] = date('d/m/Y', strtotime($Data['tanggal']));
        $return['data'][$i]['create_by'] = Core::GetUser('nama', $Data['create_by']);

        $i++;
    }        

}
//=> / END : Listing Data

echo Core::ReturnData($return);
?>