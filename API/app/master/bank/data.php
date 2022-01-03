<?php
$Modid = 80;

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
    'def'       => 'company_bank',
    'def2'      => 'bank'
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
        cb.id != ''
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
            case "nama":
                $CLAUSE .= "
                    AND 
                        b.$Key LIKE '%" . $Val['filter'] . "%'                    
                ";

                break;
            case "kode":
                $CLAUSE .= "
                    AND 
                        b.$Key LIKE '%" . $Val['filter'] . "%'                    
                ";

                break;
            default:
                $CLAUSE .= "
                    AND 
                        cb.$Key LIKE '%" . $Val['filter'] . "%'                    
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

$Q_Data = $DB->QueryPort("
    SELECT
        cb.id
    FROM company_bank cb
    WHERE cb.id != ''
");
$R_Data = $DB->Row($Q_Data);

if($R_Data > 0){

    $return['start']        = $start;
    $return['limit']        = $limit;
    $return['count']        = $R_Data;

    $Q_Data = $DB->QueryPort("
        SELECT
            cb.id,
            cb.bank,
            cb.coa,
            cb.coa_kode,
            cb.coa_nama,
            b.kode,
            b.nama,
            cb.no_rekening,
            cb.nama_rekening,
            cb.company,
            cb.company_abbr,
            cb.company_nama,
            cb.currency,
            cb.saldo,
            cb.status
        FROM company_bank cb, bank b
        $CLAUSE
        AND cb.bank = b.id
        ORDER BY
            cb.company, cb.currency, cb.bank, cb.id ASC
        LIMIT 
            $offset, $limit
    ");

    $R_Data = $DB->Row($Q_Data);

    if($R_Data > 0){
        $i = 0;
        while($Data = $DB->Result($Q_Data)){

            $return['data'][$i] = $Data;
            $i++;

        }
    }
}
else{

}
//=> / END : Listing Data

echo Core::ReturnData($return);
?>