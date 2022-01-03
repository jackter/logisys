<?php
$Modid = 31;

// include "_function.php";

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

/**
 * Check Special Logo for Print
 */
// $ShowLogo = array(
//     'CKA',
//     'AMJ',
//     'ENM',
//     'MP',
//     'IJI',
//     'BSG',
//     'NSP'
// );
//=> / END : Check Special Logo For Print

$Table = array(
    'def'       => 'pq',
    'supplier'  => 'pq_supplier',
    'send'      => 'pq_supplier_quotesend',
    'reply'     => 'pq_supplier_reply',
    'pr'        => 'pr',
    'detail'    => 'pr_detail',
    'po'        => 'po'
);

/**
 * Get Data
 */
$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'id',
        'kode'      => 'pq_kode',
        'tanggal',
        'company',
        'company_abbr',
        'company_nama',
        'dept',
        'dept_abbr',
        'dept_nama',
        'pr',
        'pr_kode'   => 'pr_kode',
        'verified',
        'approved',
        'approved2',
        'approved3',
        'finish',
        'is_void',
        'history'
    ),
    "
        WHERE id = '" . $id . "'
    "
);
$R_Data = $DB->Row($Q_Data);
if ($R_Data > 0) {
    $Data = $DB->Result($Q_Data);

    // if (in_array($Data['company_abbr'], $ShowLogo)) {
    //     $Data['show_logo'] = 1;
    // }

    $return['data'] = $Data;

    //=> BUSINESS UNIT TITLE 
    $Business = $DB->Result($DB->QueryOn(
        DB['master'],
        "company",
        array(
            'business_unit'
        ),
        "
            WHERE
                id = '" . $Data['company'] . "'
        "
    ));
    $return['data']['business_unit'] = $Business['business_unit'];

    /**
     * Extract History
     */
    $History = json_decode($Data['history'], true);
    for ($i = 0; $i < sizeof($History); $i++) {
        $History[$i]['time'] = datetime_db_en($History[$i]['time']);
    }
    $return['data']['history'] = $History;

    //=> / END : Extract History

    /**
     * PR
     */
    $PR = $DB->Result($DB->Query(
        $Table['pr'],
        array(
            'tanggal'
        ),
        "WHERE id = '" . $Data['pr'] . "'"
    ));
    $return['data']['pr_tanggal'] = $PR['tanggal'];
    //=> / END : PR

    /**
     * Extract Detail
     */
    $Q_Detail = $DB->QueryPort("
        SELECT
            D.id AS detail_id,
            D.item AS id,
            D.qty_mr AS qty,
            D.qty_outstanding AS qty_purchase,
            D.est_price,
            D.remarks,
            TRIM(I.nama) AS nama,
            I.satuan,
            I.in_decimal
        FROM
            item AS I,
            " . $Table['detail'] . " AS D
        WHERE
            D.header = '" . $Data['pr'] . "' AND
            D.item = I.id
    ");
    $R_Detail = $DB->Row($Q_Detail);

    if ($R_Detail > 0) {
        $i = 0;
        while ($Detail = $DB->Result($Q_Detail)) {
            $return['data']['list'][$i] = $Detail;
            $return['data']['list'][$i]['i'] = $i;

            $i++;
        }
    }
    //=> / END : Extract Detail

    /**
     * Cet Jumlah Outds
     */
    $OS = $DB->Result($DB->Query(
        $Table['detail'],
        array(
            'SUM(qty_purchase)' => 'jumlah_pur',
            'SUM(qty_outstanding)' => 'jumlah_ost'
        ),
        " 
        WHERE
            header = '" . $Data['pr'] . "'

        "
    ));
    $return['data']['jumlah_purchase'] = $OS['jumlah_pur'];
    $return['data']['jumlah_outsd'] = $OS['jumlah_ost'];

    //END Cek jumlah Outds

    /**
     * Extract Supplier
     */
    $Q_Supplier = $DB->Query(
        $Table['supplier'],
        array(
            'id'        => 'detail_id',
            'supplier'  => 'id',
            'is_print',
            'kode',
            'nama',
            'remarks'
        ),
        "
            WHERE header = '" . $Data['id'] . "'
        "
    );
    $R_Supplier = $DB->Row($Q_Supplier);
    $Quoted = 0;
    if ($R_Supplier > 0) {
        $i = 0;
        while ($Supplier = $DB->Result($Q_Supplier)) {

            $DataSupplier = $DB->Result($DB->Query(
                'supplier',
                array(
                    'alamat',
                    'jenis'
                ),
                "
                    WHERE id = '" . $Supplier['id'] . "'
                "
            ));

            $return['data']['supplier_list'][$i] = $Supplier;
            $return['data']['supplier_list'][$i]['alamat'] = $DataSupplier['alamat'];
            $return['data']['supplier_list'][$i]['jenis'] = $DataSupplier['jenis'];

            $Print = false;
            if ($Supplier['is_print'] == 1) {
                $Print = true;
            }
            $return['data']['supplier_list'][$i]['print'] = $Print;

            /**
             * Get Count Send
             */
            $Q_Count = $DB->Query(
                $Table['send'],
                array('id'),
                "
                    WHERE 
                        header_pq_supplier = '" . $Supplier['detail_id'] . "' AND 
                        supplier = '" . $Supplier['id'] . "'
                "
            );
            $R_Count = $DB->Row($Q_Count);
            $return['data']['supplier_list'][$i]['count'] = $R_Count;
            //=> / END : Get Count Send

            /**
             * Get Count of Reply
             * 
             * untuk mengetahui bahwa penawaran telah di balas oleh
             * supplier
             */
            $Q_Reply = $DB->Query(
                $Table['reply'],
                array(
                    'id'
                ),
                "
                    WHERE 
                        header = '" . $Data['id'] . "' AND 
                        header_pq_supplier = '" . $Supplier['detail_id'] . "'
                "
            );
            $R_Reply = $DB->Row($Q_Reply);
            if ($R_Reply > 0) {

                $Reply = $DB->Result($Q_Reply);

                $return['data']['supplier_list'][$i]['quoted'] = $R_Reply;
                $Quoted = 1;

                /**
                 * Get Total PO
                 */
                $Q_RDetail = $DB->Query(
                    $Table['reply'] . "_detail",
                    array(
                        'qty_po'
                    ),
                    "
                        WHERE
                            header_reply = '" . $Reply['id'] . "' AND 
                            (
                                qty_po > 0 ||
                                qty_po IS NOT NULL
                            )
                    "
                );
                $R_RDetail = $DB->Row($Q_Detail);
                if ($R_RDetail > 0) {
                    $QTY_PO = 0;
                    while ($RDetail = $DB->Result($Q_RDetail)) {
                        $QTY_PO += $RDetail['qty_po'];
                    }
                    $return['data']['supplier_list'][$i]['qty_po'] = $QTY_PO;
                }
                //=> / END : Total PO

            }
            //=> / END : Get Reply of Reply

            /**
             * Get PO
             */
            $Q_PO = $DB->Query(
                $Table['po'],
                array(
                    'id',
                    'kode',
                    'tanggal'
                ),
                "
                    WHERE
                        pq = '" . $Data['id'] . "' AND 
                        supplier = '" . $Supplier['id'] . "' AND 
                        header_pq_supplier = '" . $Supplier['detail_id'] . "' AND 
                        is_void = 0
                "
            );
            $R_PO = $DB->Row($Q_PO);
            if ($R_PO > 0) {
                $PO = $DB->Result($Q_PO);

                $return['data']['supplier_list'][$i]['po'] = $PO['id'];
                $return['data']['supplier_list'][$i]['po_kode'] = $PO['kode'];
                //$return['data']['supplier_list'][$i]['po_tanggal'] = date("l, jS \of F Y", strtotime($PO['tanggal']));
                $return['data']['supplier_list'][$i]['po_tanggal'] = $PO['tanggal'];
            }
            //=> / END : Get PO

            $i++;
        }

    }
    $return['data']['quoted'] = $Quoted;
    //=> / END : Extract Supplier

    /**
     * Total Quotation
     */
    // $Apvd = Apvd($Data['id']);
    $return['data']['apvd'] = 1;
    //=> / END : Total Quotation
}

echo Core::ReturnData($return);

?>