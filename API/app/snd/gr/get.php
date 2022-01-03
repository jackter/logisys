<?php
$Modid = 33;

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
//     'NSP',
//     'PNAK'
// );
//=> / END : Check Special Logo For Print

$Table = array(
    'def'       => 'po',
    'detail'    => 'po_detail',
    'gr'        => 'gr',
    'gr_detail' => 'gr_detail',
    'supplier'  => 'supplier',
);

/**
 * Get Data
 */
$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'id',
        'kode',
        'company',
        'company_abbr',
        'company_nama',
        'dept',
        'dept_abbr',
        'dept_nama',
        'supplier',
        'supplier_kode',
        'supplier_nama',
        'ppn',
        'inclusive_ppn',
        'pph_code',
        'pph',
        'other_cost',
        'ppbkb',
        'finish',
        'pr',
        'pr_kode',
        'mr_kode',
        'currency',
        'disc',
        // 'tanggal'
    ),
    "
        WHERE id = '" . $id . "'
    "
);
$R_Data = $DB->Row($Q_Data);
if($R_Data > 0){

    $Data = $DB->Result($Q_Data);

    // if(in_array($Data['company_abbr'], $ShowLogo)){
    //     $Data['show_logo'] = 1;
    // }

    $return['data'] = $Data;

    //get Enabled Journal
    $Q_Company = $DB->Result($DB->QueryOn(
        DB['master'],
        "company",
        array(
            'journal'
        ),
        "
            WHERE 
                id = '" . $Data['company'] . "'
        "
    ));
    $return['data']['enable_journal'] = $Q_Company['journal'];

    /**
     * Extract Detail
     */
    $Q_Detail = $DB->QueryPort("
        SELECT
            D.id AS detail_id,
            D.item AS id,
            D.qty_po,
            D.qty_cancel AS qty_canceled,
            D.price,
            D.prc_cash,
            D.prc_credit,
            D.origin_quality,
            D.remarks,
            TRIM(I.nama) AS nama,
            I.satuan,
            I.item_type,
            I.grup,
            I.grup_nama,
            I.in_decimal
        FROM
            item AS I,
            " . $Table['detail'] . " AS D
        WHERE
            D.header = '" . $id . "' AND
            D.item = I.id AND 
            D.qty_po > 0
    ");
    $R_Detail = $DB->Row($Q_Detail);
    if($R_Detail > 0){
        $i = 0;
        while($Detail = $DB->Result($Q_Detail)){
            $return['data']['detail'][$i] = $Detail;

            /**
             * Calculate Outstanding
             */
            $Q_GR = $DB->Query(
                $Table['gr'],
                array(
                    'id'
                ),
                "
                    WHERE
                        po = '" . $Data['id'] . "'
                "
            );
            $R_GR = $DB->Row($Q_GR);
            $Outstanding = 0;
            if($R_GR > 0){
                while($GR = $DB->Result($Q_GR)){
                    /**
                     * Detail GR
                     */
                    $Q_DGR = $DB->Query(
                        $Table['gr_detail'],
                        array(
                            'qty_receipt',
                            'qty_return'
                        ),
                        "
                            WHERE
                                header = '" . $GR['id'] . "' AND 
                                item = '" . $Detail['id'] . "'
                        "
                    );
                    $R_DGR = $DB->Row($Q_DGR);
                    if($R_DGR > 0){
                        while($DGR = $DB->Result($Q_DGR)){
                            $Outstanding += ($DGR['qty_receipt'] - $DGR['qty_return']);
                        }
                    }
                    //=> / END : Detail GR

                }
            }

            $Outstanding = $Detail['qty_po'] - $Outstanding;
            $return['data']['detail'][$i]['outstanding'] = $Outstanding;
            $return['data']['detail'][$i]['outstanding_def'] = $Outstanding;
            //=> / END : Calculate Outstanding

            $i++;
        }
    }
    //=> / END : Extract Detail

    /**
     * History GRN
     */
    $Q_History = $DB->Query(
        $Table['gr'],
        array(
            'id',
            'kode',
            'inv',
            'po',
            'tanggal',
            'supplier_nama',
            'remarks'
        ),
        "
            WHERE 
                po = '" . $Data['id']  . "'
            ORDER BY
                create_date ASC
        "
    );
    $R_History = $DB->Row($Q_History);
    if($R_History > 0){
        $no = 1;
        $i = 0;
        while($History = $DB->Result($Q_History)){
            $return['history'][$i] = $History;
            $return['history'][$i]['po_kode'] = $Data['kode'];
            $return['history'][$i]['pr_kode'] = $Data['pr_kode'];
            $return['history'][$i]['mr_kode'] = $Data['mr_kode'];
            $return['history'][$i]['tanggal'] = date("D, d M Y", strtotime($History['tanggal']));
            $return['history'][$i]['no'] = $no;

            //=> BUSINESS UNIT TITLE 
            $Business = $DB->Result($DB->QueryOn(
                DB['master'],
                "company",
                array(
                    'business_unit',
                    'grup'
                ),
                "
                    WHERE
                        id = '".$Data['company']."'
                "
            ));
            $return['history'][$i]['business_unit'] = $Business['business_unit'];
            $return['history'][$i]['company_grup'] = $Business['grup'];

            /**
             * Extract Detail
             */
            $Q_Detail = $DB->QueryPort("
                SELECT
                    D.id AS detail_id,
                    D.item AS id,
                    D.qty_po,
                    D.qty_receipt,
                    D.qty_return AS qty,
                    D.price,
                    D.unit_price,
                    D.storeloc,
                    D.storeloc_kode,
                    TRIM(I.nama) AS nama,
                    I.satuan,
                    I.in_decimal
                FROM
                    item AS I,
                    " . $Table['gr_detail'] . " AS D
                WHERE
                    D.header = '" . $History['id'] . "' AND
                    D.item = I.id
            ");
            $R_Detail = $DB->Row($Q_Detail);
            if($R_Detail > 0){
                $j = 0;
                while($Detail = $DB->Result($Q_Detail)){
                    $return['history'][$i]['detail'][$j] = $Detail;
                    $return['history'][$i]['detail'][$j]['qty_max_return'] = (int)($Detail['qty_receipt'] - $Detail['qty']);
                    $return['history'][$i]['detail'][$j]['qty_max_return_def'] = (int)($Detail['qty_receipt'] - $Detail['qty']);

                    $j++;
                }
            }
            //=> / END : Extract Detail

            $i++;
            $no++;
        }
    }
    //=> / END : History

}
//=> / END : Get Data

echo Core::ReturnData($return);
?>