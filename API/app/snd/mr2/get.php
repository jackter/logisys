<?php
$Modid = 28;

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
$ShowLogo = array(
    'CKA',
    'AMJ',
    'ENM',
    'MP',
    'IJI',
);
//=> / END : Check Special Logo For Print

$Table = array(
    'def'       => 'mr',
    'detail'    => 'mr_detail',
    'pr'        => 'pr',
    'prd'       => 'pr_detail',
    'po'        => 'po',
    'pod'       => 'po_detail',
    'storeloc'  => 'storeloc',
    'stock'     => 'storeloc_stock',
    'gi'        => 'gi',
    'gid'       => 'gi_detail'
);

/**
 * Get Data
 */
$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'id',
        'kode',
        'note',
        'date_target',
        'company',
        'company_abbr',
        'company_nama',
        'dept',
        'dept_abbr',
        'dept_nama',
        'cost_center_id'    => 'cost',
        'cost_center_kode'  => 'cost_kode',
        'cost_center_nama'  => 'cost_nama',
        'ref_type',
        'sub_ref_type',
        'ref',
        'ref_kode',
        'verified',
        'approved',
        'validated',
        'processed',
        'finish',
        'create_by',
        'create_date',
        'approved_by',
        'approved_date',
        'processed_by',
        'processed_date',
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
    $return['data']['create_by'] = Core::GetUser("nama", $Data['create_by']);
    $return['data']['create_date'] = date("d/m/Y H:i:s", strtotime($Data['create_date'])) . " WIB";

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
    
    if(!empty($Data['approved_by'])){
        $return['data']['approved_by'] = Core::GetUser("nama", $Data['approved_by']);
        $return['data']['approved_date'] = date("d/m/Y H:i:s", strtotime($Data['approved_date'])) . " WIB";
    }
    if(!empty($Data['processed_by'])){
        // $return['data']['processed_by'] = Core::GetUser("nama", $Data['processed_by']);
        // $return['data']['processed_date'] = date("d/m/Y H:i:s", strtotime($Data['processed_date'])) . " WIB";

        $return['data']['processed_by'] = "";
        $return['data']['processed_date'] = "";
    }

    $Outstanding = 0;

    $REMARKS = [];

    /**
     * Extract Detail
     */
    $Q_Detail = $DB->QueryPort("
        SELECT
            D.id AS detail_id,
            D.item AS id,
            D.qty,
            D.qty_approved,
            D.qty_outstanding,
            D.remarks,
            D.cost_center,
            D.cost_center_kode,
            D.cost_center_nama,
            D.coa_alokasi,
            D.coa_alokasi_nama,
            D.job_alocation,
            D.job_alocation_nama,
            D.coa,
            D.coa_kode,
            D.coa_nama,
            D.stock,
            I.kode AS kode,
            TRIM(I.nama) AS nama,
            I.grup,
            I.item_type,
            I.grup_nama,
            I.satuan,
            I.in_decimal
        FROM
            item AS I,
            " . $Table['detail'] . " AS D
        WHERE
            D.header = '" . $id . "' AND
            D.item = I.id
    ");
    $R_Detail = $DB->Row($Q_Detail);

    $ALL_STOCK = 0;
    if($R_Detail > 0){
        $i = 0;
        while($Detail = $DB->Result($Q_Detail)){
            $return['data']['list'][$i] = $Detail;
            $return['data']['list'][$i]['i'] = $i;

            $REMARKS[$i] = $Detail['remarks'];

            /**
             * Get Stock
             */
            $STOCK = App::GetStockAll(array(
                'company'   => $Data['company'],
                'item'      => $Detail['id']
            ));
            // $return['data']['list'][$i]['stock'] = $STOCK;
            $ALL_STOCK += $STOCK;
            //=> / END : Get Stock

            if($is_process){

                /**
                 * Get Last Price
                 */
                $Q_LastPrice = $DB->QueryPort("
                    SELECT
                        D.price
                    FROM
                        po AS H,
                        po_detail AS D
                    WHERE
                        D.header = H.id AND 
                        H.submited = 1 AND
                        H.submited_date IS NOT NULL AND 
                        D.item = '" . $Detail['id'] . "'
                    ORDER BY 
                        H.submited_date DESC
                    LIMIT 1
                ");
                $R_LastPrice = $DB->Row($Q_LastPrice);
                if($R_LastPrice > 0){
                    $LastPrice = $DB->Result($Q_LastPrice);

                    $return['data']['list'][$i]['last_price'] = 1;
                    $return['data']['list'][$i]['est_price'] = $LastPrice['price'];
                }
                //=> / END : Get Last Price
            }

            /**
             * IS GOODS ISSUED
             */
            //if($is_gi){
                /**
                 * Get Available Stock on Storeloc BY ITEM
                 */
                $Q_SStock = $DB->QueryPort("
                    SELECT
                        D.storeloc AS id,
                        D.storeloc_kode AS kode,
                        H.nama,
                        D.stock,
                        D.price
                    FROM
                        " . $Table['storeloc'] . " AS H,
                        " . $Table['stock'] . " AS D
                    WHERE
                        D.storeloc = H.id AND
                        D.company = '" . $Data['company'] . "' AND 
                        D.item = '" . $Detail['id'] . "' AND 
                        D.stock > 0
                ");
                $R_SStock = $DB->Row($Q_SStock);
                if($R_SStock > 0){
                    $j = 0;
                    while($SStock = $DB->Result($Q_SStock)){

                        $return['data']['list'][$i]['storeloc_list'][$j] = $SStock;

                        $j++;
                    }
                }
                //=> / END : Get Available Stock on Storeloc BY ITEM

                /**
                 * Get Outstanding
                 */
                $return['data']['list'][$i]['qty_outstanding_def'] = $Detail['qty_outstanding'];
                $Outstanding += $Detail['qty_outstanding'];
                //=> / END : Outstanding
            /*}else{
                unset($return['data']['list'][$i]['qty_outstanding']);
            }*/
            //=> / END : IS GOODS ISSUED

            /**
             * menentukan stock
             */
            if($Detail['stock'] != null){
                $return['data']['list'][$i]['stock'] = $Detail['stock'];
            }else{
                $return['data']['list'][$i]['stock'] = $STOCK;
            }
            //=> menentukan stock

            $i++;
        }
        
        if(!$is_detail){
            if($Data['ref_type'] != 3) {
                $return['data']['list'][$i] = array(
                    'i' => 0
                );
            }
        }
    }
    //=> / END : Extract Detail

    if($is_process){
        $return['data']['gi_ready'] = $ALL_STOCK;
        $return['data']['outstanding'] = $Outstanding;

        /**
         * Get Purchased Status
         */
        $Q_PR = $DB->Query(
            $Table['pr'],
            array(
                'id',
                'kode'
            ),
            "
                WHERE
                    mr = '" . $id . "' AND 
                    is_void = 0
            "
        );
        $R_PR = $DB->Row($Q_PR);
        if($R_PR > 0){
            $PR = $DB->Result($Q_PR);
            $return['data']['purchased'] = 1;
            $return['data']['purchase_kode'] = $PR['kode'];
        }
        //=> / END : Get Purchased Status
    }

    /**
     * IS GI
     */
    if($is_gi){
        $Q_GI = $DB->Query(
            $Table['gi'],
            array(
                'id',
                'kode',
                'tanggal',
                'cost_center',
                'cost_center_kode',
                'cost_center_nama',
                'remarks',
                'create_by',
                'create_date'
            ),
            "
                WHERE
                    mr = '" . $id . "'
            "
        );
        $R_GI = $DB->Row($Q_GI);
        if($R_GI > 0){

            $return['gi']['count'] = $R_GI;

            $i = 0;
            while($GI = $DB->Result($Q_GI)){
                $return['gi']['list'][$i] = $GI;
                $return['gi']['list'][$i]['tanggal_format'] = date("D, d M Y", strtotime($GI['tanggal']));

                $return['gi']['list'][$i]['remarks'] = $REMARKS[$i];

                if(!empty($GI['create_by'])){
                    $return['gi']['list'][$i]['issued_by'] = Core::GetUser("nama", $GI['create_by']);
                    $return['gi']['list'][$i]['issued_date'] = date("d/m/Y H:i:s", strtotime($GI['create_date'])) . " WIB";
                }

                $i++;
            }
        }
    }
    //=> / END : IS GI

}
//=> / END : Get Data

echo Core::ReturnData($return);
?>