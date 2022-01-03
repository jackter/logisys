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

$Table = array(
    'pr'        => 'pr',
    'pq'        => 'pq',
    'po'        => 'po',
    'reply'     => 'pq_supplier_reply',
    'detail'    => 'pq_supplier_reply_detail',
    'supplier'  => 'supplier'
);


/**
 * Get Data
 */
$Q_PQ = $DB->Query(
    $Table['pq'],
    array(
        'id',
        'pr',
        'pr_kode'
    ),
    "
        WHERE
            id = '" . $pq . "'
    "
);
$R_PQ = $DB->Row($Q_PQ);
if($R_PQ > 0){
    $PQ = $DB->Result($Q_PQ);

    $return['pr'] = $PQ['pr'];
    $return['pr_kode'] = $PQ['pr_kode'];

    $return['alamat'] = DEF_ALAMAT;

    
    /**
     * Get PO
     */
    $Q_PO = $DB->Query(
        $Table['po'],
        array(
            'note',
            'storeloc',
            'storeloc_kode',
            'storeloc_nama'
        ),
        "
            WHERE
                pr = '" . $PQ['pr'] . "'
        "
    );
    $R_PO = $DB->Row($Q_PO);
    if($R_PO > 0){
        $PO = $DB->Result($Q_PO);
        
        $return['note'] = $PO['note'];
        $return['storeloc'] = $PO['storeloc'];
        $return['storeloc_kode'] = $PO['storeloc_kode'];
        $return['storeloc_nama'] = $PO['storeloc_nama'];
    }
     // => End: Get PO

    /**
     * Select PR
     */
    $Q_PR = $DB->Query(
        $Table['pr'],
        array(
            'id',
            'mr',
            'mr_kode'
        ),
        "
            WHERE
                id = '" . $PQ['pr'] . "'
        "
    );
    $R_PR = $DB->Row($Q_PR);
    if($R_PR > 0){
        $PR = $DB->Result($Q_PR);
        
        $return['mr'] = $PR['mr'];
        $return['mr_kode'] = $PR['mr_kode'];

    }
    //=> / END : Select PR

    /**
     * Select Supplier
     */
    $Supplier = $DB->Result($DB->Query(
        $Table['supplier'],
        array(
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
                id = '" . $supplier . "'
        "
    ));
    $return['supplier_detail'] = $Supplier;
    //=> / END : Select Supplier

    /**
     * Select Supplier Reply
     */
    $Q_SupReply = $DB->Query(
        $Table['reply'],
        array(
            'id',
            'tipe',
            'currency',
            'customs',
            'dp',
            'ppn',
            'inclusive_ppn',
            'pph_code',
            'pph',
            'disc_cash',
            'disc_credit',
            'other_cost',
            'ppbkb',
            'delivery_plan',
            'weight_base',
            'po_contract',
            'payment_term',
            'storeloc',
            'storeloc_nama',
            'storeloc_kode'
        ),
        "
            WHERE
                header = '" . $PQ['id'] . "' AND 
                header_pq_supplier = '" . $header_pq_supplier . "'
        "
    );
    $R_SupReply = $DB->Row($Q_SupReply);
    if($R_SupReply > 0){
        $SupReply = $DB->Result($Q_SupReply);

        if($SupReply['tipe'] == "cash"){
            $SupReply['disc'] = $SupReply['disc_cash'];
        }else{
            $SupReply['disc'] = $SupReply['disc_credit'];
        }

        $return['reply'] = $SupReply;

        if($SupReply['currency'] == 1){
            $return['reply']['currency'] = 'IDR';
        }
        else if($SupReply['currency'] == 2){
            $return['reply']['currency'] = 'USD';
        }

        if($SupReply['customs'] == 1){
            $return['reply']['customs'] = 'Yes';
        }
        else if($SupReply['customs'] == 2){
            $return['reply']['customs'] = 'No';
        }

        /**
         * Get Reply Detail
         */
        $Total = 0;

        $Q_SupReplyDetail = $DB->QueryPort("
            SELECT
                D.*,
                TRIM(I.nama) AS nama,
                I.satuan,
                I.in_decimal
            FROM
                item AS I,
                " . $Table['detail'] . " AS D
            WHERE
                D.header_reply = '" . $SupReply['id'] . "' AND
                D.item = I.id AND 
                D.qty_po > 0
        ");
        $R_SupReplyDetail = $DB->Row($Q_SupReplyDetail);
        if($R_SupReplyDetail > 0){
            $i = 0;
            while($SupReplyDetail = $DB->Result($Q_SupReplyDetail)){

                $return['reply']['detail'][$i] = $SupReplyDetail;

                /**
                 * Get Price Type
                 */
                $Price = $SupReplyDetail['prc_cash'];
                if($SupReply['tipe'] == 'credit'){
                    $Price = $SupReplyDetail['prc_credit'];
                }
                
                $return['reply']['detail'][$i]['price'] = $Price;
                //=> / END : Get Price Type

                /**
                 * Calculate Total
                 */
                if($SupReply['inclusive_ppn'] == 1){
                    $Total += ($SupReplyDetail['qty_po'] * $Price)/1.1;
                }
                else{
                    $Total += $SupReplyDetail['qty_po'] * $Price;
                }
                //=> / END : Total

                $i++;
            }
        }
        //=> / END : Get Reply Detail

        /**
         * Calculation
         */
        if($SupReply['inclusive_ppn'] == 1){
            $return['reply']['total'] = round($Total);
        }
        else{
            $return['reply']['total'] = $Total;
        }
        //=> / END : Calculation

    }
    //=> / END : Select Supplier Reply
}
//=> / END : Get Data

echo Core::ReturnData($return);
?>