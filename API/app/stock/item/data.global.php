<?php
$Modid = 24;

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
    'm_item'       => 'purchaseitem'
);

//=> Clean Data
if(empty($limit)){
    $limit = 10;
}
if(empty($offset)){
    $offset = 0;
}

$PermCompany = Core::GetState('company');
if($PermCompany == "X"){
    $CLAUSE_COMPANY = "";
}else{
    //$CLAUSE_COMPANY = " AND company IN (" . $PermCompany . ")";
}

/**
 * Filter
 */
$CLAUSE = "
    WHERE 
        INACTIVE = 0
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
                    AND ITEMDESCRIPTION LIKE '%" . $Val['filter'] . "%'
                ";

                break;

            case "jenis_bayar_text":

                if(!empty($Val['values'])){
                    $CLAUSE .= " AND (";
                    $COMMA = "";
                    foreach($Val['values'] AS $V){

                        switch(strtolower($V)){
                            case "transfer bank":
                                $jenis_bayar = 1;
                                break;
                            case "cheque":
                                $jenis_bayar = 2;
                                break;
                            case "tunai":
                                $jenis_bayar = 3;
                                break;
                            default:
                                $jenis_bayar = 0;
                        }

                        $CLAUSE .= $COMMA . " 
                                jenis_bayar = '" . $jenis_bayar . "'
                        ";
                        $COMMA = " OR ";

                    }
                    $CLAUSE .= ")";
                }

                break;

            case "approved_text": 

                if(!empty($Val['values'])){
                    foreach($Val['values'] AS $Approved){

                        $approved = 1;
                        if(strtolower($Approved) != "approved"){
                            $approved = 0;
                        }

                        $CLAUSE .= "
                            AND 
                                approved = '" . $approved . "'
                        ";

                    }
                }

                break;

            default:
                $CLAUSE .= "
                    AND 
                        $Key LIKE '%" . $Val['filter'] . "%'                    
                ";
        }
        //=> / END : Generate Clause

        $return['ftable'] = $Val;
        $return['clause'] = $CLAUSE;
    }
}
//=> / END : Filter Table

/**
 * Listing Data
 */
$return['start']        = 0;
$return['limit']        = $limit;
$return['count']        = 0;

$Q_Data = $DB->QueryOn(
    DB['master'],
    $Table['m_item'],
    array(
        'ITEMCODE'          => 'kode',
        'ITEMDESCRIPTION'   => 'nama',
        'UOMCODE'           => 'unit'
    ),
    $CLAUSE
);
$R_Data = $DB->Row($Q_Data);

if($R_Data > 0){

    $return['start']        = $start;
    $return['limit']        = $limit;
    $return['count']        = $R_Data;

    $Q_Data = $DB->QueryOn(
        DB['master'],
        $Table['m_item'],
        array(
            'ITEMCODE'          => 'kode',
            'ITEMDESCRIPTION'   => 'nama',
            'UOMCODE'           => 'unit'
        ),
        $CLAUSE . 
        "
            ORDER BY
                nama ASC
            LIMIT 
                $offset, $limit
        "
    );

    $i = 0;
    while($Data = $DB->Result($Q_Data)){

        $return['data'][$i] = $Data;

        $i++;
    }

}else{

}
//=> / END : Listing Data

echo Core::ReturnData($return);
?>