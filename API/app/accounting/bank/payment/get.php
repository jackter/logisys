<?php

#Default statement
$return = [];
$RPL = "";
$SENT = Core::Extract($_POST, $RPL);

#Extract Array
if (isset($SENT)) {
    foreach ($SENT as $KEY => $VAL) {
        $$KEY = $VAL;
    }
}

$Table = array(
    'def'   => 'bp',
    'def2'  => 'bp_detail',
    'reff_a' => 'invoice'
);

#Get Data
$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'id',
        'kode',
        'company',
        'tanggal',
        'company_abbr',
        'company_nama',
        'company_bank',
        'bank',
        'bank_kode',
        'bank_nama',
        'bank_coa',
        'bank_coa_kode',
        'bank_coa_nama',
        'no_rekening',
        'currency',
        'rate',
        'buku_cek_ket',
        'reff_type',
        'subjek',
        'subjek_nama',
        'tipe_pihak_ketiga',
        'pihak_ketiga',
        'pihak_ketiga_kode',
        'pihak_ketiga_nama',
        'supplier',
        'supplier_kode',
        'supplier_nama',
        'penerima_nama_bank',
        'penerima_bank_rek',
        'penerima_bank_nama',
        'total',
        'remarks',
        'rekon',
        'approved',
        'status'
    ),
    "
        WHERE id = '" . $id . "'
    "
);
$R_Data = $DB->Row($Q_Data);

if ($R_Data > 0) {
    $Data = $DB->Result($Q_Data);

    $return['data'] = $Data;

    $Business = $DB->Result($DB->QueryOn(
        DB['master'],
        "company",
        array(
            'business_unit',
            'alamat'
        ),
        "
            WHERE
                id = '" . $Data['company'] . "'
        "
    ));
    $return['data']['business_unit'] = $Business['business_unit'];
    $return['data']['company_alamat'] = str_replace("\\n", "<br/>", stripslashes($Business['alamat']));

    #Get BP Detail
    $Q_Detail = $DB->Query(
        $Table['def2'],
        array(
            'id',
            'header',
            'reff_id',
            'reff_kode',
            'coa',
            'coa_kode',
            'coa_nama',
            'uraian',
            'total',
        ),
        "
            WHERE header = '" . $Data['id'] . "'    
        "
    );
    $R_Detail = $DB->Row($Q_Detail);
    if ($R_Detail > 0) {
        $i = 0;
        while ($Detail = $DB->Result($Q_Detail)) {
            $return['data']['detail'][$i] = $Detail;
            $return['data']['detail'][$i]['company'] = $Data['company'];
            $return['data']['detail'][$i]['company_nama'] = $Data['company_nama'];
            $return['data']['detail'][$i]['total_show'] = decimal($Detail['total']);

            if ($Data['reff_type'] == 5) {
                $Q_Penerima = $DB->Query(
                    "sp3",
                    array(
                        'penerima_nama'
                    ),
                    "
                    WHERE 
                        id = '" . $Detail['reff_id'] . "'
                    "
                );
                $R_Penerima = $DB->Row($Q_Penerima);
                if ($R_Penerima > 0) {
                    $Penerima = $DB->Result($Q_Penerima);

                    $return['data']['penerima_nama'] = $Penerima['penerima_nama'];
                }

                if($Detail['coa'] != 0){
                    /**
                     * Extract REFF
                     */
                    $Q_Reff = $DB->Query(
                        $Table['reff_a'],
                        array(
                            'id',
                            'tipe',
                            'is_payment',
                            'jurnal_post'
                        ),
                        "
                            WHERE
                                sp3 = '" . $Detail['reff_id'] . "'
                        "
                    );
                    $R_Reff = $DB->Row($Q_Reff);
                    if($R_Reff > 0){
                        $Reff = $DB->Result($Q_Reff);
    
                        $return['data']['detail'][$i]['reff'] = $Reff;
    
                        /**
                         * Get Ref Data By id
                         */
                        if($Reff['tipe'] == 1){
                            /**
                             * Get invoice 
                             * refer to PO
                             */
                            $Q_ReffData = $DB->QueryPort("
                            SELECT
                                h.kode po_kode,
                                i.kode dp_inv_kode,
                                i.ref_tgl,
                                h.supplier_kode,
                                h.supplier_nama,
                                d.item,
                                h.currency,
                                h.company,
                                h.customs,
                                h.disc,
                                h.other_cost,
                                h.ppbkb,
                                ( SELECT sum( qty_po - qty_cancel ) FROM po_detail WHERE header = h.id ) tot_qty_po,
                                h.inclusive_ppn,
                                h.ppn,
                                d.price,
                                (d.qty_po - d.qty_cancel) AS qty_po,
                                id.dp_pct,
                            CASE
                                    
                                    WHEN h.ppn > 0 THEN
                                    (
                                    SELECT
                                        id 
                                    FROM
                                        coa_master 
                                    WHERE
                                        kode = ( SELECT coa_kode FROM taxmaster WHERE CODE = 'VAT-IN' AND company = h.company ) 
                                        AND company = h.company 
                                    ) ELSE 0 
                                END coa_ppn,
                            CASE
                                    
                                    WHEN h.ppn > 0 THEN
                                    ( SELECT pembukuan FROM taxmaster WHERE CODE = 'VAT-IN' AND company = h.company ) ELSE 0 
                                END coa_pembukuan_ppn,
                            CASE
                                    
                                    WHEN d.pph > 0 THEN
                                    (
                                    SELECT
                                        id 
                                    FROM
                                        coa_master 
                                    WHERE
                                        kode = ( SELECT coa_kode FROM taxmaster WHERE CODE = h.pph_code AND company = h.company ) 
                                        AND company = h.company 
                                    ) ELSE 0 
                                END coa_pph,
                            CASE
                                    
                                    WHEN d.pph > 0 THEN
                                    ( SELECT pembukuan FROM taxmaster WHERE CODE = h.pph_code AND company = h.company ) ELSE 0 
                                END coa_pembukuan_pph,
                            CASE
                                    
                                    WHEN d.pph > 0 THEN
                                    (
                                        (
                                            (
                                                ( 100- h.disc ) / 100 * ( ( CASE WHEN h.inclusive_ppn = 1 THEN d.price / 1.1 ELSE d.price END ) * d.qty_po ) 
                                            ) 
                                        ) * ( h.pph / 100 ) 
                                    ) / 100 * id.dp_pct ELSE 0 
                                END amount_pph,
                            ( SELECT coa FROM trx_coa_balance WHERE doc_nama = 'Down Payment Invoice' AND seq = 2 AND company = h.company ) AS coa_uang_muka,
                            ( SELECT coa FROM pihakketiga_coa WHERE pihakketiga_tipe = 1 AND company = h.company AND pihakketiga = h.supplier AND coa_accrued IS NOT NULL AND status = 1 ) AS coa_hutang_supplier 
                            FROM
                                po h,
                                po_detail d,
                                invoice i,
                                invoice_detail id 
                            WHERE
                                i.id = " . $Reff['id'] . " 
                                AND h.id = d.header 
                                AND i.tipe = 1 
                                AND h.id = i.po 
                                AND i.id = id.header");
                            $R_ReffData = $DB->Row($Q_ReffData);
    
                            if ($R_ReffData > 0) {
                                while ($ReffData = $DB->Result($Q_ReffData)) {
                                    $return['data']['detail'][$i]['reff_data'][] = $ReffData;
                                }
                            }
                        }elseif($Reff['tipe'] == 4 && $Reff['jurnal_post'] == 1){
    
                            /**
                             * Get single invoice
                             */
                            $Q_ReffData = $DB->Query(
                                $Table['reff_a'],
                                array(
                                    'id',
                                    'company',
                                    'company_abbr',
                                    'company_nama',
                                    'kode',
                                    'tipe_pihak_ketiga',
                                    'pihak_ketiga',
                                    'pihak_ketiga_kode',
                                    'pihak_ketiga_nama',
                                    'ref_tgl',
                                    'ref_kode',
                                    'currency',
                                    'amount',
                                    'note'
                                ),
                                "
                                    WHERE id = '" . $Reff['id'] . "'
                                    AND jurnal_post = 1
                                "
                            );
                            $R_ReffData = $DB->Row($Q_ReffData);
                            if ($R_ReffData > 0) {
                                $ReffData = $DB->Result($Q_ReffData);
                                $return['data']['detail'][$i]['reff_data'][] = $ReffData;
                            }
    
                        }
                        //=> / END : Get Ref Data By id
    
                    }
                    //=> / END : Extract REFF
                }
            }
            else if ($Data['reff_type'] == 3) {
                $return['data']['penerima_nama'] = $Data['penerima_nama_bank'];
            }

            $i++;
        }
    }
}
echo Core::ReturnData($return);

?>