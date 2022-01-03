<?php

$Modid = 31;

//=> Default Statement
$return = [];
$RPL    = "";
$SENT    = Core::Extract($_POST, $RPL);

//=> Extract Array
if (isset($SENT)) {
    foreach ($SENT as $KEY => $VAL) {
        $$KEY = $VAL;
    }
}

$Table = array(
    'def'       => 'pq',
    'supplier'  => 'pq_supplier',
    'send'      => 'pq_supplier_quotesend',
    'reply'     => 'pq_supplier_reply',
    'reply_detail' => 'pq_supplier_reply_detail',
    'pr'        => 'pr',
    'pr_detail' => 'pr_detail',
);

$ID = $id;

/**
 * Select PQ
 */
$Q_PQ = $DB->Query(
    $Table['def'],
    array(),
    "
        WHERE id = '" . $ID . "'
    "
);
$R_PQ = $DB->Row($Q_PQ);
if ($R_PQ > 0) {
    $PQ = $DB->Result($Q_PQ);

    // Get PR by Type 1 = pr all noraml 2 = pr outsd 
    $CLAUSE = "";
    if($type == 2){
        $CLAUSE = "AND D.qty_outstanding != 0";
    }
    /**
     * Select PR
     */
    $Q_PR = $DB->QueryPort("
        SELECT
            D.id AS detail_id,
            D.item AS id,
            D.qty_mr AS qty,
            D.qty_outstanding,
            D.qty_cancel,
            D.est_price,
            TRIM(I.nama) AS nama,
            I.satuan,
            I.in_decimal
        FROM
            item AS I,
            " . $Table['pr_detail'] . " AS D
        WHERE
            D.header = '" . $PQ['pr'] . "' AND
            D.item = I.id
            $CLAUSE
            
    ");
    $R_PR = $DB->Row($Q_PR);
    if ($R_PR > 0) {
        $i = 0;
        while ($PR = $DB->Result($Q_PR)) {
            $return['pr'][$i] = $PR;
            $return['pr'][$i]['qty_purchase'] = $PR['qty_outstanding'];

            $Q_LastPurchase = $DB->QueryPort("
                SELECT
                    x.supplier_nama,
                    x.tanggal,
                    y.price
                FROM
                    po x,
                    po_detail y
                WHERE
                    x.id = y.header
                    AND y.item = " . $PR['id'] . "
                ORDER BY x.id DESC LIMIT 1
            ");

            $R_LastPurchase = $DB->Row($Q_LastPurchase);

            if ($R_LastPurchase > 0) {
                $LastPurchase = $DB->Result($Q_LastPurchase);

                $return['pr'][$i]['supplier_nama'] = $LastPurchase['supplier_nama'];
                $return['pr'][$i]['tanggal'] = $LastPurchase['tanggal'];
                $return['pr'][$i]['last_price'] = $LastPurchase['price'];
            }

            $i++;
        }
    }
    //=> / END : Select PR

    /**
     * Get Header from Pq Supplier Reply
     */
    $ALL_PQREP;
    $Q_PQREP = $DB->Query(
        $Table['reply'],
        array('header_pq_supplier'),
        "
            WHERE
                header = '" . $PQ['id'] . "'
        "
    );
    $R_PQREP = $DB->Row($Q_PQREP);
    if ($R_PQREP > 0) {
        $COMMA = "";
        while ($PQREP = $DB->Result($Q_PQREP)) {
            $ALL_PQREP .= $COMMA . $PQREP['header_pq_supplier'];
            $COMMA = ",";
        }
    }
    //=> / END : Get Header from PQ Supplier Reply

    
    //get pq reply tidak di print
    $Q_SupNoPrint = $DB->Query(
        $Table['supplier'],
        array('id'),
        "
            WHERE
                header = '" . $PQ['id'] . "' AND 
                id IN (" . $ALL_PQREP . ") AND 
                is_print = 0
        "
    );
    $R_SupNoPrint = $DB->Row($Q_SupNoPrint);
    if($R_SupNoPrint > 0){

        $AllNoPrint = [];
        while ($SupNoPrint = $DB->Result($Q_SupNoPrint)) {
            $AllNoPrint[] = $SupNoPrint['id'];
        }
        $Q_SupplierReply = $DB->Query(
            $Table['reply'],
            array('id'),
            "
                WHERE 
                    header = '" . $PQ['id'] . "' AND 
                    header_pq_supplier IN (".implode(",", $AllNoPrint).")
            "
        );
        $AllRD = [];
        while ($SupplierReply = $DB->Result($Q_SupplierReply)) {
            $AllRD[] = $SupplierReply['id'];
        } 
    }
    //END get pq reply

    /**
     * Select Supplier BY Header
     */
    $Q_Sup = $DB->Query(
        $Table['supplier'],
        array(),
        "
            WHERE
                header = '" . $PQ['id'] . "' AND 
                id IN (" . $ALL_PQREP . ") AND 
                is_print = 1
        "
    );
    $R_Sup = $DB->Row($Q_Sup);
    if ($R_Sup > 0) {
        $i = 0;
        while ($Sup = $DB->Result($Q_Sup)) {

            $return['supplier'][$i] = $Sup;

            /**
             * For Footer
             */
            //$Subtotal = [];
            //$Total = [];
            //=> / END : For Footer

            /**
             * Get Supplier Reply
             */
            $Q_SupplierReply = $DB->Query(
                $Table['reply'],
                array(),
                "
                    WHERE 
                        header = '" . $PQ['id'] . "' AND 
                        header_pq_supplier = '" . $Sup['id'] . "'
                "
            );
            $R_SupplierReply = $DB->Row($Q_SupplierReply);

            $return['supplier'][$i]['reply'] = NULL;
            $return['supplier'][$i]['cc'] = "cash";

            if ($R_SupplierReply > 0) {
                $SupplierReply = $DB->Result($Q_SupplierReply);

                if (!$SupplierReply['ppbkb']) {
                    $SupplierReply['ppbkb'] = 0;
                }

                if (!$SupplierReply['other_cost']) {
                    $SupplierReply['other_cost'] = 0;
                }

                $return['supplier'][$i]['reply'] = $SupplierReply;

                if (!empty($SupplierReply['tipe'])) {
                    $return['supplier'][$i]['cc'] = $SupplierReply['tipe'];
                }

                /**
                 * Loop From PR
                 */
                for ($j = 0; $j < sizeof($return['pr']); $j++) {

                    /**
                     * Extract Reply Detail
                     */
                    $Q_Detail = $DB->QueryPort("
                        SELECT
                            D.id AS detail_id,
                            D.item AS id,
                            D.qty_purchase,
                            D.qty_supplier,
                            D.qty_po,
                            D.prc_cash,
                            D.prc_credit,
                            D.origin_quality AS origin,
                            D.remarks,
                            D.pph,
                            TRIM(I.nama) AS nama,
                            I.satuan,
                            I.in_decimal
                        FROM
                            item AS I,
                            " . $Table['reply_detail'] . " AS D
                        WHERE
                            D.header_reply = '" . $SupplierReply['id'] . "' AND
                            D.item = '" . $return['pr'][$j]['id'] . "' AND 
                            D.item = I.id
                    ");
                    $R_Detail = $DB->Row($Q_Detail);

                    if ($R_Detail > 0) {
                        $Detail = $DB->Result($Q_Detail);
                        $return['supplier'][$i]['detail'][$j] = $Detail;

                        if ($Detail['qty_po'] > 0) {
                            $return['supplier'][$i]['detail'][$j]['selected'] = 1;
                            //$return['pr'][$j]['qty_outstanding'] -= $Detail['qty_po'];
                        }

                        
                        if ($Detail['prc_cash'] == 0 && $Detail['prc_credit'] > 0 ) {
                            $return['supplier'][$i]['cc'] = "credit";
                        } else if($Detail['prc_cash'] > 0 && $Detail['prc_credit'] == 0 ) {
                            $return['supplier'][$i]['cc'] = "cash";
                        }

                        //=> Total
                        /*$Total['cash'] = $Detail['qty_supplier'] * $Detail['prc_cash'];
                        $Total['credit'] = $Detail['qty_supplier'] * $Detail['prc_credit'];

                        //=> Subtotal
                        $Subtotal['cash'] += $Total['cash'];
                        $Subtotal['credit'] += $Total['credit'];*/
                    }
                    //=> / END : Reply Detail

                }
                //=> / END : Loop From PR

            }
            //=> / END : Get Supplier Reply

            /*$return['supplier'][$i]['total'] = $Total;
            $return['supplier'][$i]['subtotal'] = $Subtotal;*/

            $i++;
        }
    }
    //=> / END : Select Supplier By Header

    $return['pq'] = $PQ;
    if($AllRD){
    
        $return['pq']['sup_no_print'] = implode(",", $AllRD);
    }

    $return['pq']['tanggal'] = date("D", strtotime($PQ['tanggal'])) . ", " . date("d M Y", strtotime($PQ['tanggal']));
    $return['pq']['create_by_name'] = strtoupper(Core::GetUser('nama', $PQ['create_by']));

    /**
     * Get Tanggal PR
     */
    $Q_PR = $DB->Query(
        $Table['pr'],
        array('tanggal'),
        "WHERE id = '" . $PQ['pr'] . "'"
    );
    $R_PR = $DB->Row($Q_PR);
    if ($R_PR > 0) {
        $PR = $DB->Result($Q_PR);

        $return['pq']['pr_tanggal'] =  date("D", strtotime($PR['tanggal'])) . ", " . date("d M Y", strtotime($PR['tanggal']));
    }
    //=> / END : Get Tanggal PR
}
//=> / END : Select PQ

echo Core::ReturnData($return);

?>