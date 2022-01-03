<?php

$Modid = 195;
Perm::Check($Modid, 'view');

//=> Default Statement
$return = [];
$RPL    = "";
$SENT   = Core::Extract($_POST, $RPL);

//=> Extract Array
if (isset($SENT)) {
    foreach ($SENT as $KEY => $VAL) {
        $$KEY = $VAL;
    }
}

$Table = array(
    'def'       => 'prd_issued',
    'detail'    => 'prd_issued_detail',
    'jo'        => 'jo',
    'storeloc'  => 'storeloc',
    'stock'     => 'storeloc_stock'
);

/**
 * Function
 */
function getStockByDetail($Data, $Detail)
{

    global $Table;
    global $DB;

    $return = [];

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
            D.stock > 0 AND 
            D.storeloc != '" . $Data['storeloc'] . "'
    ");
    $R_SStock = $DB->Row($Q_SStock);
    if ($R_SStock > 0) {
        $j = 0;
        while ($SStock = $DB->Result($Q_SStock)) {

            $return[$j] = $SStock;

            $j++;
        }
    }
    //=> / END : Get Available Stock on Storeloc BY ITEM

    return $return;
}
//=> / END : Function

$Q_Data = $DB->Query(
    $Table['def'],
    array('id'),
    "
        WHERE
            id = $id
    "
);
$R_Data = $DB->Row($Q_Data);

if ($R_Data > 0) {
    $Q_Data = $DB->Query(
        $Table['def'],
        array(
            'id',
            'kode',
            'tanggal',
            'jo',
            'jo_kode',
            'mrp',
            'notes',
            'verified',
            'verified_by',
            'verified_date',
            'approved',
            'approved_by',
            'approved_date',
            'approved2',
            'approved2_by',
            'approved2_date',
            'history',
            'create_by',
            'create_date'
        ),
        "
            WHERE id = $id
        "
    );

    $Data = $DB->Result($Q_Data);

    /**
     * SELECT JO
     */
    $JO = $DB->Result($DB->Query(
        $Table['jo'],
        array(
            'company',
            'dept',
            'storeloc'
        ),
        "
            WHERE id = $Data[jo]
        "
    ));

    $Data['company'] = $JO['company'];
    $Data['dept'] = $JO['dept'];
    $Data['storeloc'] = $JO['storeloc'];
    //=> / END : SELECT JO

    $return['data'] = $Data;

    $return['data']['create_by'] = Core::GetUser("nama", $Data['create_by']);
    $return['data']['create_date'] = date("d/m/Y H:i:s", strtotime($Data['create_date'])) . " WIB";

    if ($Data['verified']) {
        $return['data']['verified_by'] = Core::GetUser("nama", $Data['verified_by']);
        $return['data']['verified_date'] = date("d/m/Y H:i:s", strtotime($Data['verified_date'])) . " WIB";
    }

    if (!empty($Data['approved_by'])) {
        $return['data']['approved_by'] = Core::GetUser("nama", $Data['approved_by']);
        $return['data']['approved_date'] = date("d/m/Y H:i:s", strtotime($Data['approved_date'])) . " WIB";
    }

    if (!empty($Data['approved2_by'])) {
        $return['data']['approved2_by'] = Core::GetUser("nama", $Data['approved_by']);
        $return['data']['approved2_date'] = date("d/m/Y H:i:s", strtotime($Data['approved_date'])) . " WIB";
    }

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
     * Extract Detail
     */
    $Q_Detail = $DB->QueryPort("
        SELECT
            D.id AS detail_id,
            D.item AS id,
            D.storeloc,
            D.storeloc_kode,
            D.storeloc_nama,
            D.stock,
            D.qty_jo,
            D.qty_req,
            D.qty_issued,
            D.price,
            D.remarks,
            TRIM(I.nama) AS nama,
            I.satuan,
            D.tipe,
            I.kode,
            I.in_decimal,
            I.is_fix
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
    if ($R_Detail > 0) {
        $im = 0;
        $ic = 0;
        while ($Detail = $DB->Result($Q_Detail)) {

            /**
             * Calc Outstanding
             */
            $Q_ISD = $DB->QueryPort("
                SELECT 
                    H.id,
                    D.id AS detail_id,
                    D.item,
                    SUM(D.qty_issued) AS qty_issued
                FROM  
                    " . $Table['def'] . " AS H, 
                    " . $Table['def'] . "_detail AS D,
                    item AS I
                WHERE
                    mrp = $Data[mrp] AND
                    D.item = $Detail[id] AND 
                    D.header = H.id AND 
                    D.item = I.id AND 
                    H.approved2 = 1
                GROUP BY
                    H.mrp
            ");
            $R_ISD = $DB->Row($Q_Data);
            if ($R_ISD > 0) {
                $ISD = $DB->Result($Q_ISD);
            }
            //=> / END : Calc Outstanding

            if ($Detail['tipe'] == 1) {
                $return['data']['material'][$im] = $Detail;

                $return['data']['material'][$im]['outstanding'] = $Detail['qty_req'] - $ISD['qty_issued'];
                $return['data']['material'][$im]['outstanding_def'] = $Detail['qty_req'] - $ISD['qty_issued'];

                if ($Detail['qty_req'] > 0) {
                    $return['data']['material'][$im]['storeloc_list'] = getStockByDetail($Data, $Detail);
                }

                $im++;
            } elseif ($Detail['tipe'] == 4) {
                $return['data']['list'][$ic] = $Detail;
                $return['data']['list'][$ic]['outstanding'] = $Detail['qty_req'] - $ISD['qty_issued'];
                $return['data']['list'][$ic]['outstanding_def'] = $Detail['qty_req'] - $ISD['qty_issued'];

                if ($Detail['qty_req'] > 0) {
                    $return['data']['list'][$ic]['storeloc_list'] = getStockByDetail($Data, $Detail);
                }

                $ic++;
            }
        }

        if (empty($is_detail) && !isset($is_detail)) {
            $return['data']['material'][$im] = array(
                'i' => 0
            );
            $return['data']['list'][$ic] = array(
                'i' => 0
            );
        }
    }
    //=> / END : Extract Detail

}

echo Core::ReturnData($return);

?>