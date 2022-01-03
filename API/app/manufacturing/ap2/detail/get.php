<?php
$Modid = 61;

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

$Table = array(
    'def'       => 'actual_production',
    'detail'    => 'actual_production_detail',
    'man_power' => 'actual_production_man_power',
    // 'DTime'     => 'actual_production_downtime',
    'jo'        => 'jo',
    'bom'       => 'bom',
    'gi'        => 'gi',
    'param'     => 'produksi_param'
);

$CostCenter = array(
    'refinery' => array(
        'cost_center' => 5,
        'cost_center_kode' => 11101023
    ),
    'fractionation' => array(
        'cost_center' => 6,
        'cost_center_kode' => 11101031
    )
);

/**
 * Functions
 */
function SelectCostCenter($key){
    global $CostCenter;

    switch($key){

        case 29:
            $CostID = $CostCenter['refinery']['cost_center'];
            break;

        case 30:
            $CostID = $CostCenter['fractionation']['cost_center'];
            break;

        default:
            $CostID = 0;

    }

    // $CostID = 0;
    // if($key == 29){
    //     $CostID = $CostCenter['refinery']['cost_center'];
    // }elseif($key == 30){
    //     $CostID = $CostCenter['fractionation']['cost_center'];
    // }

    return $CostID;
}
//=> / END : Functions

/**
 * Get Data
 */
$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'id',
        'kode',
        'tanggal',
        'shift',
        'jo',
        'running_hours',
        'man_power',
        'verified',
        'approved'
    ),
    "
        WHERE id = '" . $id . "'
    "
);
$R_Data = $DB->Row($Q_Data);
if($R_Data > 0){
    $Data = $DB->Result($Q_Data);

    $return['data'] = $Data;
    $return['data']['shift'] = (int)$Data['shift'];

    /**
     * Man Power
     */
    $Q_Power = $DB->Query(
        $Table['man_power'],
        array(
            'id',
            'kid',
            'nik',
            'nama'
        ),
        "
            WHERE
                header = '" . $id . "'
        "
    );
    $R_Power = $DB->Row($Q_Power);

    if($R_Power > 0) {
        $i = 0;
        while($Power = $DB->Result($Q_Power)) {

            $return['data']['list_man_power'][$i] = $Power;
            $i++;
        }

        if(!$is_detail){
            $return['data']['list_man_power'][$i] = array(
                'i' => 0
            );
        }
    } else {
        if(!$is_detail){
            $return['data']['list_man_power'][] = array(
                'i' => 0
            );
        }
    }
    //=> END : Man Power

    /**
     * Downtime
     */
    // $Q_DTime = $DB->Query(
    //     $Table['DTime'],
    //     array(
    //         'dt_id'     => 'id',
    //         'dt_kode'   => 'kode',
    //         'dt_nama'   => 'nama',
    //         'dt_durasi' => 'duration',

    //     ),
    //     "
    //         WHERE
    //             header = '" . $id . "'
    //     "
    // );
    // $R_DTime = $DB->Row($Q_DTime);
    // if($R_DTime > 0){
    //     $d = 0;
    //     while($DTime = $DB->Result($Q_DTime)){

    //         $return['data']['downtime'][$d] = $DTime;

    //         $d++;
    //     }
    // }
    // => End Downtime

    /**
     * Extract Detail
     */
    $Q_Detail = $DB->QueryPort("
        SELECT
            D.id AS detail_id,
            D.item AS id,
            D.jo_qty,
            D.qty,
            TRIM(I.nama) AS nama,
            I.satuan,
            D.tipe,
            I.kode,
            I.in_decimal,
            I.is_fix,
            I.fix_price,
            D.persentase
        FROM
            item AS I,
            " . $Table['detail'] . " AS D
        WHERE
            D.header = '" . $id . "' AND
            D.item = I.id
        ORDER BY
            tipe ASC
    ");
    $R_Detail = $DB->Row($Q_Detail);
    if($R_Detail > 0){
        $im = 0;
        $io = 0;
        $iu = 0;
        $ic = 0;
        while($Detail = $DB->Result($Q_Detail)){

            /**
             * Get Stock
             */
            $GetStock = App::GetStockItem(array(
                'company'   => $company,
                'storeloc'  => $storeloc,
                'item'      => $Detail['id']
            ));
            //=> / END : Get Stock

            if(!$GetStock['stock']) {
                $GetStock['stock'] = 0;
            } 

            if($Detail['tipe'] == 1){
                $return['data']['material'][$im] = $Detail;
                $return['data']['material'][$im]['stock'] = $GetStock['stock'];
                $return['data']['material'][$im]['stock_def'] = $GetStock['stock'];
                $return['data']['material'][$im]['price'] = $GetStock['price'];
                $im++;
            }elseif($Detail['tipe'] == 2){
                $return['data']['output'][$io] = $Detail;

                $Q_Price = $DB->Query(
                    'item_sales',
                    array(
                        'last_price'
                    ),
                    "
                        WHERE 
                            item = '" . $Detail['id'] . "'
                    "
                );
                $R_Price = $DB->Row($Q_Price);

                if($R_Price > 0) {
                    $Price = $DB->Result($Q_Price);
                    $return['data']['output'][$io]['price'] = $Price['last_price'];
                }

                $io++;
            }elseif($Detail['tipe'] == 3){
                $return['data']['utility'][$iu] = $Detail;
                $return['data']['utility'][$iu]['stock'] = $GetStock['stock'];
                $return['data']['utility'][$iu]['stock_def'] = $GetStock['stock'];
                $return['data']['utility'][$iu]['price'] = $GetStock['price'];
                $iu++;
            }elseif($Detail['tipe'] == 4){
                $return['data']['list'][$ic] = $Detail;
                $return['data']['list'][$ic]['stock'] = $GetStock['stock'];
                $return['data']['list'][$ic]['stock_def'] = $GetStock['stock'];
                $return['data']['list'][$ic]['price'] = $GetStock['price'];
                $ic++;
            }

        }

        if(empty($is_detail) && !isset($is_detail)){
            $return['data']['material'][$im] = array(
                'i' => 0
            );
            $return['data']['output'][$io] = array(
                'i' => 0
            );
            $return['data']['utility'][$iu] = array(
                'i' => 0
            );
            // $return['data']['downtime'][] = array(
            //     'i' => 0
            // );
            $return['data']['list'][$ic] = array(
                'i' => 0
            );
        }
    }
    //=> / END : Extract Detail


    if($Data['approved'] != 1){

        $JO = $DB->Result($DB->Query(
            $Table['jo'],
            array(
                'bom'
            ),
            "WHERE id = '" . $Data['jo'] . "'"
        ));
        if(!empty($JO['bom'])){
            $BOM = $DB->Result($DB->Query(
                $Table['bom'],
                array(
                    'company',
                    'dept'
                ),
                "WHERE id = '" . $JO['bom'] . "'"
            ));

            $CostID = SelectCostCenter($BOM['dept']);
        }

        // $return['cost_id'] = SelectCostCenter($BOM['dept']);

        /**
         * Get Data Lain2 from GI
         * - Repair & Maintenance
         * - Factory Overhead
         * - General Overhead
         */
        $Q_GI = $DB->QueryPort("
            SELECT
                D.qty_gi,
                D.qty_return,
                D.price
            FROM
                " . $Table['gi'] . " AS H,
                " . $Table['gi'] . "_detail AS D
            WHERE
                D.header = H.id AND 
                H.tanggal = '" . $Data['tanggal'] . "' AND 
                D.item != 2021 AND
                D.cost_center = '" . $CostID . "'
        ");
        $R_GI = $DB->Row($Q_GI);
        $TotalBiayaGI = 0;
        if($R_GI > 0){
            while($GI = $DB->Result($Q_GI)){

                $TotalBiayaGI += ($GI['qty_gi'] - $GI['qty_return']) * $GI['price'];

            }
        }
        $return['biaya_gi'] = $TotalBiayaGI;
        //=> / END : Get Data Lain2 from GI

        /**
         * Get Data lain2 from Params
         * - labour
         * - laboratory
         * - Engineering
         * - Effulent
         * - Temporary Worker
         * - Depreciation
         */
        $Q_PRD_Param = $DB->Query(
            $Table['param'],
            array(
                'year',
                'month',
                'labour',
                'laboratory',
                'engineering',
                'effulent',
                'depreciation'
            ),
            "
                WHERE
                    company = '" . $BOM['company'] . "'
                ORDER BY
                    year DESC,
                    month DESC
            "
        );
        $R_PRD_Param = $DB->Row($Q_PRD_Param);
        $TotalBiayaLain = 0;
        if($R_PRD_Param > 0){
            $PRD_Param = $DB->Result($Q_PRD_Param);

            $TotalDays = cal_days_in_month(CAL_GREGORIAN, $PRD_Param['month'], $PRD_Param['year']);

            $Labour = $PRD_Param['labour'] / $TotalDays;
            $Laboratory = $PRD_Param['laboratory'] / $TotalDays;
            $Engineering = $PRD_Param['engineering'] / $TotalDays;
            $Effulent = $PRD_Param['effulent'] / $TotalDays;
            $Depreciation = $PRD_Param['depreciation'] / $TotalDays;

            $return['biaya_lain_detail'] = array(
                'labour' => $Labour,
                'laboratory' => $Laboratory,
                'engineering' => $Engineering,
                'effulent' => $Effulent,
                'depreciation' => $Depreciation
            );

            $TotalBiayaLain = $Labour + $Laboratory + $Engineering + $Effulent + $Depreciation;
        }
        $return['biaya_lain'] = $TotalBiayaLain;
        $return['total_days'] = $TotalDays;
        //=> / END : Get Data lain2 from Params

    }

    $return['data']['company'] = $company;
    $return['data']['dept'] = $dept;
    $return['data']['storeloc'] = $storeloc;

}
//=> / END : Get Data

echo Core::ReturnData($return);
?>