<?php
/**
 * Script yang digunakan untuk melakukan BULK UPDATE
 * item item_coa dengan item_coa_temp berdasarkan company dan id COA
 */
exit();

$Table = array(
    'item' => 'item_coa',
    'temp' => 'item_coa_temp'
);

$Q_Temp = $DB->Query(
    $Table['temp'],
    array(),
    "
        ORDER BY id ASC
    "
);
$R_Temp = $DB->Row($Q_Temp);
if($R_Temp > 0){
    while($Temp = $DB->Result($Q_Temp)){

        echo "<pre>";
        print_r($Temp);
        echo "</pre>";

        /**
         * Query Item
         */
        $Q_Item = $DB->Query(
            $Table['item'],
            array(

            ),
            "
                WHERE
                    company = $Temp[company] AND
                    coa_persediaan = $Temp[old_id]
            "
        );
        $R_Item = $DB->Row($Q_Item);
        echo $R_Item . " ITEM";

        $Field = array(
            'coa_persediaan' => $Temp['new_id'],
            'coa_kode_persediaan' => $Temp['new_kode'],
            'coa_nama_persediaan' => $Temp['new_nama'],
            'coa_penjualan' => NULL,
            'coa_kode_penjualan' => NULL,
            'coa_nama_penjualan' => NULL,
            'coa_disc_penjualan' => NULL,
            'coa_kode_disc_penjualan' => NULL,
            'coa_nama_disc_penjualan' => NULL,
            'coa_retur_penjualan' => NULL,
            'coa_kode_retur_penjualan' => NULL,
            'coa_nama_retur_penjualan' => NULL,
            'coa_retur_pembelian' => NULL,
            'coa_kode_retur_pembelian' => NULL,
            'coa_nama_retur_pembelian' => NULL,
            'coa_hpp' => NULL,
            'coa_kode_hpp' => NULL,
            'coa_nama_hpp' => NULL,
            'coa_accrued' => NULL,
            'coa_kode_accrued' => NULL,
            'coa_nama_accrued' => NULL,
            'coa_beban' => NULL,
            'coa_kode_beban' => NULL,
            'coa_nama_beban' => NULL,
            'update_by' => 1,
            'update_date' => date('Y-m-d H:i:s'),
        );

        if($DB->Update(
            $Table['item'],
            $Field,
            "
                company = $Temp[company] AND
                coa_persediaan = $Temp[old_id]
            "
        )){
            echo "<pre>";
            print_r($Field);
            echo "</pre>";
        }else{
            echo "GAGAL UPDATE";
        }
        //=> / END : Query Item

        echo "<hr>";

    }
}
?>
