<?php
$Modid = 47;

Perm::Check($Modid, 'view');

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
    'def'       => 'invoice',
    'detail'    => 'invoice_expense',
    'po'        => 'po',
    'po_detail' => 'po_detail',
    'gr'        => 'gr',
    'gr_detail' => 'gr_detail'
);

/**
 * Get Data
 */
$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'id',
        'company',
        'company_abbr',
        'company_nama',
        'dept',
        'dept_abbr',
        'dept_nama',
        'po',
        'po_kode',
        'supplier',
        'supplier_kode',
        'supplier_nama',
        'kode',
        'grn_id',
        'inv_tgl',
        'ref_kode',
        'ref_tgl',
        'pajak_no',
        'pajak_tgl',
        'tipe',
        'dp_amount',
        'tgl_jatuh_tempo',
        'create_date',
        'create_by',
        'verified',
        'verified_by',
        'verified_date',
        'note',
        'sp3',
        'sp3_kode'
    ),
    "
        WHERE id = '" . $id . "'
    "
);
$R_Data = $DB->Row($Q_Data);
if ($R_Data > 0) {

    $Data = $DB->Result($Q_Data);

    $return['data'] = $Data;

    $PO = $DB->Result($DB->QueryPort(
        "
            SELECT
                currency,
                dp,
                inclusive_ppn
            FROM
                po
            WHERE
                id = '" . $Data['po'] . "'
        "
    ));

    $return['data']['currency'] = $PO['currency'];
    $return['data']['dp'] = $PO['dp'];
    $return['data']['inclusive_ppn'] = $PO['inclusive_ppn'];

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

    $Q_INV = $DB->QueryPort("
        SELECT
            h.dp,
            h.disc,
            h.other_cost,
            h.ppbkb,
            d.qty_po qty,
            d.price,
            h.ppn,
            h.inclusive_ppn,
            h.pph * d.pph pph
        FROM
            po h,
            po_detail d
        WHERE
            h.id = " . $Data['po'] . " 
            AND h.id = d.header 
    ");
    $R_INV = $DB->Row($Q_INV);
    if($R_INV > 0){
        $j = 0;
        while($INV = $DB->Result($Q_INV)){
            $return['data']['data_dp'][$j] = $INV;
            $j++;
        }
    }

    $Q_PO_DETAIL = $DB->Result($DB->Query(
        $Table['po_detail'],
        array(
            'sum(qty_po)' => 'total_qty_po'
        ),
        "
            WHERE
                header = '" . $Data['po'] . "'
        "
    ));

    $return['data']['total_qty_po'] = $Q_PO_DETAIL['total_qty_po'];

    /**
     * Get DP Invoice Amount
     */
    $Q_INV = $DB->QueryPort("
        SELECT
            h.dp,
            h.disc,
            h.other_cost,
            h.ppbkb,
            d.qty_po qty,
            d.price,
            h.ppn,
            h.inclusive_ppn,
            h.pph * d.pph pph
        FROM
            po h,
            po_detail d
        WHERE
            h.id = " . $Data['po'] . " 
            AND h.id = d.header 
    ");
    $R_INV = $DB->Row($Q_INV);
    if ($R_INV > 0) {
        $return['data']['is_dp'] = 1;
        $i = 0;
        while ($INV = $DB->Result($Q_INV)) {
            $return['data']['data_dp'][$i] = $INV;
            $i++;
        }
    } else {
        $return['data']['is_dp'] = 0;
    }
    //=> / END : Get Invoice Amount

    $return['data']['check_all'] = true;

    $return['data']['tanggal'] = date("D, d M Y", strtotime($Data['inv_tgl']));

    $return['data']['create_by'] = Core::GetUser("nama", $Data['create_by']);
    $return['data']['verified_by'] = Core::GetUser("nama", $Data['verified_by']);

    $Q_GRN = $DB->Query(
        $Table['gr'],
        array(
            'id'        => 'grn',
            'kode'      => 'grn_kode',
            'inv',
            'tanggal',
            'remarks'
        ),
        "
            WHERE
                id IN (" . $Data['grn_id'] . ")
        "
    );
    $R_GRN = $DB->Row($Q_GRN);
    if ($R_GRN > 0) {

        $j = 0;
        while ($GRN = $DB->Result($Q_GRN)) {

            $return['data']['list'][$j] = $GRN;

            /**
             * Get Detail Item
             */
            $Q_Detail = $DB->QueryPort("
                SELECT
                    h.ppn, 
                    h.inclusive_ppn,
                    h.pph, 
                    h.other_cost, 
                    h.ppbkb, 
                    h.disc,
                    d.item, 
                    d.qty_po, 
                    (gd.qty_receipt - gd.qty_return) AS qty,
                    gd.price AS price_gr, 
                    d.price, 
                    d.pph pph_flag
                FROM
                    " . $Table['po'] . " AS h,
                    " . $Table['po_detail'] . " AS d,
                    " . $Table['gr'] . " AS g,
                    " . $Table['gr_detail'] . " AS gd
                WHERE
                    g.id IN (" . $GRN['grn'] . ") and
                    h.id = d.header and 
                    h.id = g.po and 
                    g.id = gd.header and 
                    d.item = gd.item
            ");
            $R_Detail = $DB->Row($Q_Detail);

            if ($R_Detail > 0) {
                $k = 0;
                while ($Detail = $DB->Result($Q_Detail)) {

                    $return['data']['list'][$j]['item'][$k] = $Detail;

                    if($GRN['inv'] == 0){
                        $return['data']['list'][$j]['check_list'] = false;
                    }
                    else{
                        $return['data']['list'][$j]['check_list'] = true;
                    }

                    $k++;
                }
            }

            $j++;
        }
    }

    $Q_EXP = $DB->Query(
        $Table['detail'],
        array(
            'header',
            'coa',
            'coa_kode' => 'kode',
            'coa_nama' => 'nama',
            'jumlah' => 'amount',
            'keterangan' => 'notes'
        ),
        "
            WHERE
                header = '" . $id . "'
        "
    );
    $R_EXP = $DB->Row($Q_EXP);
    if ($R_EXP > 0) {
        while ($EXP = $DB->Result($Q_EXP)) {
            $return['data']['expense'][] = $EXP;
        }
    }
}

echo Core::ReturnData($return);

?>