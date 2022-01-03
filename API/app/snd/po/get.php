<?php
$Modid = 32;

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

/**
 * Check Special Logo for Print
 */
$ShowLogo = array(
    'CKA',
    'AMJ',
    'ENM',
    'MP',
    'IJI',
    'BSG',
    'NSP',
    'PNAK'
);
//=> / END : Check Special Logo For Print

$Table = array(
    'def'       => 'po',
    'detail'    => 'po_detail',
    'supplier'  => 'supplier',
    'par'       => 'wf_params',
    'gr'        => 'gr',
    'gr_det'    => 'gr_detail'
);

/**
 * Get Data
 */
$Q_Data = $DB->Query(
    $Table['def'],
    array(

    ),
    "
        WHERE id = '" . $id . "'
    "
);
$R_Data = $DB->Row($Q_Data);
if($R_Data > 0){

    $Data = $DB->Result($Q_Data);

    if(in_array($Data['company_abbr'], $ShowLogo)){
        $Data['show_logo'] = 1;
    }

    $return['data'] = $Data;
    $return['data']['alamat'] = DEF_ALAMAT;

    //=> BUSINESS UNIT TITLE 
    $Business = $DB->Result($DB->QueryOn(
        DB['master'],
        "company",
        array(
            'business_unit'
        ),
        "
            WHERE
                id = '".$Data['company']."'
        "
    ));
    $return['data']['business_unit'] = $Business['business_unit'];

    //$return['data']['tanggal'] = date("l, jS \of F Y", strtotime($Data['tanggal']));
    $return['data']['po_tanggal'] = $Data['tanggal'];


    if($is_modif){
    
        $Q_GR = $DB->Query(
            $Table['gr'],
            array(
                'id'
            ),
            "
                WHERE
                    po = '".$Data['id']."'
            "
        );
    
        $R_GR = $DB->Row($Q_GR);
        if($R_GR > 0){
            $AllGR = [];
            while($GR = $DB->Result($Q_GR)){
    
                $AllGR[] = $GR['id'];
    
            }
        }
    }

    /**
     * Extract Detail
     */
    $Q_Detail = $DB->QueryPort("
        SELECT
            D.id AS detail_id,
            D.item AS id,
            D.qty_po,
            D.qty_cancel as cancel,
            D.price,
            D.prc_cash,
            D.prc_credit,
            D.origin_quality,
            D.remarks,
            D.pph,
            TRIM(I.nama) AS nama,
            I.satuan,
            I.in_decimal
        FROM
            item AS I,
            " . $Table['detail'] . " AS D
        WHERE
            D.header = '" . $id . "' AND
            D.item = I.id AND 
            (D.qty_po - D.qty_cancel) > 0
    ");
    $R_Detail = $DB->Row($Q_Detail);
    if($R_Detail > 0){
        $i = 0;
        while($Detail = $DB->Result($Q_Detail)){
            $return['data']['detail'][$i] = $Detail;


            $return['data']['detail'][$i]['qty_po'] = $Detail['qty_po'] - $Detail['cancel'];

            $return['data']['detail'][$i]['qty_receipt'] = 0;

             /**
             * Get Detail GR
             */
            if($is_modif && $AllGR){
            
                $Q_GR_Detail = $DB->Query(
                    $Table['gr_det'],
                    array(
                        'SUM(qty_receipt)' => 'qty_receipt'
                    ),
                    "
                        WHERE
                            header IN (" . implode(",", $AllGR) . ") AND
                            item = '". $Detail['id'] ."'
                        GROUP BY
                            item
                    "
                );
        
                while($GR_Detail = $DB->Result($Q_GR_Detail)){
        
                    $return['data']['detail'][$i]['qty_receipt'] = $GR_Detail['qty_receipt'];
                }
                
            }
            //=> END: Get Detail GR

            $i++;
        }
    }
    //=> / END : Extract Detail

   

    /**
     * Get Supplier
     */
    $Q_Supplier = $DB->Query(
        $Table['supplier'],
        array(
            'alamat',
            'kabkota'       => 'kab',
            'provinsi'      => 'prov',
            'country_nama'  => 'negara',
            //'cp_manual'     => 'cp',
            'cp',
            'cp_telp1',
            'cp_telp2',
            'cp_hp1',
            'cp_hp2'
        ),
        "
            WHERE
                id = '" . $Data['supplier'] . "'
        "
    );
    $R_Supplier = $DB->Row($Q_Supplier);
    if($R_Supplier > 0){
        $Supplier = $DB->Result($Q_Supplier);
        $return['data']['supplier_detail'] = $Supplier;
        $return['data']['supplier_alamat'] = $Supplier['alamat'];
    }
    //=> / END : Get Supplier

}
//=> / END : Get Data

echo Core::ReturnData($return);
?>