<?php
    $company = strip_tags($_GET['company']);
    $year = strip_tags($_GET['year']);
    $month = strip_tags($_GET['month']);

    if((isset($company) && !empty($company)) && (isset($year) && !empty($year)) && (isset($month) && !empty($month))){
        if($DB->Delete(
            "storeloc_stock_ledger",
            "company = '" . $company . "'
            AND year = '" . $year . "'
            AND month = '" . $month . "'"
        )){
            $Q_Stock = $DB->Query(
                "stock",
                array(
                    'company', 
                    'company_abbr',
                    'company_nama',
                    'storeloc',
                    'storeloc_kode',
                    'item',
                    'item_kode',
                    'item_nama',
                    'debit', 
                    'credit'
                ),
                "
                WHERE 
                    company = '" . $company . "'
                    AND DATE_FORMAT(tanggal,'%Y') = '" . $year. "'
                    AND CAST(DATE_FORMAT(tanggal,'%m') AS SIGNED) = '" . $month. "'
                ORDER BY tanggal
                "
            );
            $R_Stock = $DB->Row($Q_Stock);
            if($R_Stock > 0){
                while($Stock = $DB->Result($Q_Stock)){
                    if($Stock['debit'] != 0){
                        $value = $Stock['debit'];
                        $type = 'debit';
                    }
                    else{
                        $value = $Stock['credit'];
                        $type = 'credit';
                    }
    
                    /**
                     * Select Item
                     */
                    $Q_Item = $DB->Query(
                        "item",
                        array(
                            'id',
                            'kode',
                            'TRIM(nama)'        => 'nama'
                        ),
                        "
                            WHERE
                                id = '" . $Stock['item'] . "'
                        "
                    );
                    $R_Item = $DB->Row($Q_Item);
                    if($R_Item > 0){
                        $Item = $DB->Result($Q_Item);
                    }
                    //=> / END : Item
                    
                    if($value != 0 && $Stock['item'] != 0){
                        $UpdateStockLedger = App::UpdateStockLedger(array(
                            'tipe'          => $type,
                            'year'          => $year,
                            'month'         => $month,
                            'company'       => $Stock['company'],
                            'company_abbr'  => $Stock['company_abbr'],
                            'company_nama'  => $Stock['company_nama'],
                            'storeloc'      => $Stock['storeloc'],
                            'storeloc_kode' => $Stock['storeloc_kode'],
                            'item'          => $Stock['item'],
                            'item_kode'     => $Item['kode'],
                            'item_nama'     => $Item['nama'],
                            'value'         => $value
                        ));
                    }
                }
            }
    
            echo "Sukses";
        }
        else{
            echo "Gagal";
        }
    }
    else{
        echo "Please specify parameter company, year & month for target.";
    }
?>