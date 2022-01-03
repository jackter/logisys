<?php
$Modid = 92;

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

$Q_Data = $DB->QueryPort("
    SELECT
        K.kode
    FROM
        wb_kontrak K,
        wb_transaksi T
    WHERE
        K.id = T.contract
        $CLAUSE
    GROUP BY
        contract
"
);
$R_Data = $DB->Row($Q_Data);

if($R_Data > 0){

    $return['start']        = $start;
    $return['limit']        = $limit;
    $return['count']        = $R_Data;

    $Q_Data = $DB->QueryPort("
        SELECT
            K.kode,
            K.qty,
            K.finish,
            T.transporter,
            sum(T.netto_src) qty_src,
            sum(T.netto) qty_sbi
        FROM
            wb_kontrak K,
            wb_transaksi T
        WHERE
            K.id = T.contract
            $CLAUSE
        GROUP BY
            contract
        ORDER BY
            K.id DESC
        LIMIT 
            $offset, $limit
    "
    );

    $i = 0;
    while($Data = $DB->Result($Q_Data)){

        $return['data'][$i] = $Data;
        $i++;
    }

}

echo Core::ReturnData($return);
?>