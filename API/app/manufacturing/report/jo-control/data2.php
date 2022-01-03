<?php
$Modid = 91;

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
    'def'       => 'jo',
    'detail'    => 'jo_detail'
);

$CLAUSE = "
    WHERE
        id != '' AND 
        approved = 1 AND
        tanggal BETWEEN '" . $fdari . "' AND '" . $fhingga . "'
";

if(!empty($bom)){
    $CLAUSE .= "
        AND bom = '" . $bom . "' 
    ";
}

$return['clause'] = $CLAUSE;


$Q_Data = $DB->Query(
    $Table['def'],
    array('id'),
    $CLAUSE
);
$R_Data = $DB->Row($Q_Data);

if($R_Data > 0){

    $Q_Data = $DB->Query(
        $Table['def'],
        array(
            'id'        => 'jo',
            'kode'      => 'jo_kode',
            'tanggal',
            'company',
            'company_abbr',
            'company_nama',
            'storeloc',
            'storeloc_kode',
            'storeloc_nama',
            'plant',
            'bom',
            'bom_kode'
        ),
        $CLAUSE .
        "
            ORDER BY
                create_date DESC
        "
    );

    $i = 0;
    while($Data = $DB->Result($Q_Data)){

        $return['data'][$i] = $Data;

        /**
         * Extract Detail
         */
        $Q_Detail = $DB->QueryPort("
        SELECT
            D.item AS id,
            D.ref_qty,
            TRIM(I.nama) AS nama,
            I.satuan,
            I.kode
        FROM
            item AS I,
            " . $Table['detail'] . " AS D
        WHERE
            D.header = '" . $Data['jo'] . "' AND
            D.item = I.id AND
            tipe = 1
        ORDER BY
            tipe ASC
        ");
        $R_Detail = $DB->Row($Q_Detail);
        if($R_Detail > 0){
            $j=0;
            while($Detail = $DB->Result($Q_Detail)){

                $return['data'][$i]['detail'][$j] = $Detail;

                /**
                 * Get Stock
                 */
                $GetStock = App::GetStock(array(
                    'company'   => $Data['company'],
                    'storeloc'  => $Data['storeloc'],
                    'item'      => $Detail['id']
                ));
                //=> End Get Stock

                $return['data'][$i]['detail'][$j]['stock'] = $GetStock;

                $j++;
            }
        }
        //=> End Extract Detail

        

        $i++;
    }

}

echo Core::ReturnData($return);
?>