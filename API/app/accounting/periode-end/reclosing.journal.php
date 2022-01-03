<?php
    class Reclosing {

        public function closingBalance($company, $year, $month){
            global $DB;

            if($DB->QueryPort("
                DELETE 
                    FROM journal_balance
                WHERE company = " . $company . " 
                    AND year = '" . $year . "'
                    AND month = '" . $month . "'"
            )){
                $Q_JournalBal = $DB->Query(
                    "journal_balance",
                    array(
                        'company', 
                        'company_abbr',
                        'company_nama',
                        'coa',
                        'coa_kode',
                        'coa_nama',
                        'balance'
                    ),
                    "
                    WHERE 
                        company = '" . $company . "'
                        AND STR_TO_DATE(CONCAT('01-',MONTH,'-',YEAR),'%d-%m-%Y') = DATE_SUB(STR_TO_DATE(CONCAT('01-','" . $month . "','-','" . $year . "'),'%d-%m-%Y'), INTERVAL 1 MONTH)
                    ORDER BY coa_kode
                    "
                );
                $R_JournalBal = $DB->Row($Q_JournalBal);
                if($R_JournalBal > 0){
                    while($JournalBal = $DB->Result($Q_JournalBal)){
                        if($JournalBal['coa'] != 0){
                            App::UpdateJournalBalance(array(
                                'tipe'          => 'debit',
                                'year'          => $year,
                                'month'         => $month,
                                'company'       => $JournalBal['company'],
                                'company_abbr'  => $JournalBal['company_abbr'],
                                'company_nama'  => $JournalBal['company_nama'],
                                'coa'           => $JournalBal['coa'],
                                'coa_kode'      => $JournalBal['coa_kode'],
                                'coa_nama'      => $JournalBal['coa_nama'],
                                'value'         => 0
                            ));
                        }
                    }
                }

                $Q_Journal = $DB->Query(
                    "journal",
                    array(
                        'company', 
                        'company_abbr',
                        'company_nama',
                        'coa',
                        'coa_kode',
                        'coa_nama',
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
                $R_Journal = $DB->Row($Q_Journal);
                if($R_Journal > 0){
                    while($Journal = $DB->Result($Q_Journal)){
                        if($Journal['debit'] != 0){
                            $value = $Journal['debit'];
                            $type = 'debit';
                        }
                        else{
                            $value = $Journal['credit'] * -1;
                            $type = 'credit';
                        }
                        
                        if($value != 0 && $Journal['coa'] != 0){
                            $UpdateBalance = App::UpdateJournalBalance(array(
                                'tipe'          => $type,
                                'year'          => $year,
                                'month'         => $month,
                                'company'       => $Journal['company'],
                                'company_abbr'  => $Journal['company_abbr'],
                                'company_nama'  => $Journal['company_nama'],
                                'coa'           => $Journal['coa'],
                                'coa_kode'      => $Journal['coa_kode'],
                                'coa_nama'      => $Journal['coa_nama'],
                                'value'         => $value
                            ));
                        }
                    }
                }
            }
        }

        public function closingBankBalance($company, $year, $month, $year_plus, $month_plus){
            global $DB;

            if($DB->QueryPort("
                DELETE 
                    FROM company_bank_ledger
                WHERE company = " . $company . " 
                    AND year = '" . $year . "'
                    AND month = '" . $month . "'"
            )){
                $Q_CompanyBank = $DB->QueryPort("
                    SELECT
                        x.company,
                        x.bank,
                        x.id AS company_bank,
                        x.no_rekening,
                        x.currency 
                    FROM
                        company_bank x,
                        bank y 
                    WHERE
                        x.company = " . $company . " 
                        AND x.bank = y.id 
                        AND y.jenis IN ( 1, 2 )
                ");
                $R_CompanyBank = $DB->Row($Q_CompanyBank);
                if($R_CompanyBank > 0){
                    while($CompanyBank = $DB->Result($Q_CompanyBank)){
                        $Q_BankTrx = $DB->QueryPort("
                        ( 
                            SELECT
                                id,
                                1 AS tipe,
                                tanggal,
                                tanggal_bank,
                                kode,
                                bank,
                                bank_nama,
                                company_bank,
                                no_rekening,
                                rate,
                                currency,
                                total AS debit,
                                NULL AS credit,
                                rekon,
                                rekon_date
                            FROM
                                br 
                            WHERE
                                id != '' AND
                                approved = 1 AND
                                company = '" . $company . "' AND
                                YEAR(tanggal) = '" . $year . "' AND
                                MONTH(tanggal) = '" . $month . "' AND
                                company_bank = '" . $CompanyBank['company_bank'] . "'
                            ORDER BY
                                tanggal,
                                create_date ASC 
                        ) UNION ALL (
                            SELECT
                                id,
                                2 AS tipe,
                                tanggal,
                                tanggal_bank,
                                kode,
                                bank,
                                bank_nama,
                                company_bank,
                                no_rekening,
                                rate,
                                currency,
                                NULL AS debit,
                                total AS credit,
                                rekon,
                                rekon_date
                            FROM
                                bp 
                            WHERE
                                id != '' AND
                                approved = 1 AND
                                company = '" . $company . "' AND
                                YEAR(tanggal) = '" . $year . "' AND
                                MONTH(tanggal) = '" . $month . "' AND
                                company_bank = '" . $CompanyBank['company_bank'] . "'
                            ORDER BY
                                tanggal,
                                create_date ASC 
                        ) 
                        ORDER BY
                            tanggal ASC
                        ");
                        $R_BankTrx = $DB->Row($Q_BankTrx);
                        if($R_BankTrx > 0){
                            while($BankTrx = $DB->Result($Q_BankTrx)){
                                if($BankTrx['debit']){
                                    $value = $BankTrx['debit'];
                                    $type = 'debit';
                                }
                                else{
                                    $value = $BankTrx['credit'];
                                    $type = 'credit';
                                }

                                App::UpdateBankBalance(array(
                                    'tipe'          => $type,
                                    'year'          => $year,
                                    'month'         => $month,
                                    'company'       => $company,
                                    'bank'          => $BankTrx['bank'],
                                    'company_bank'  => $BankTrx['company_bank'],
                                    'no_rekening'   => $BankTrx['no_rekening'],
                                    'currency'      => $BankTrx['currency'],
                                    'value'         => $value
                                ));
                            }
                        }
                        else{
                            App::UpdateBankBalance(array(
                                'tipe'          => 'debit',
                                'year'          => $year,
                                'month'         => $month,
                                'company'       => $company,
                                'bank'          => $CompanyBank['bank'],
                                'company_bank'  => $CompanyBank['company_bank'],
                                'no_rekening'   => $CompanyBank['no_rekening'],
                                'currency'      => $CompanyBank['currency'],
                                'value'         => 0
                            ));
                        }
                    }

                    $Q_CompanyBankNext = $DB->Query(
                        "company_bank_ledger",
                        array(
                            'company', 
                            'bank',
                            'company_bank',
                            'no_rekening',
                            'currency'
                        ),
                        "
                        WHERE 
                            company = '" . $company . "'
                            AND year = '" . $year . "'
                            AND month = '" . $month . "'
                        ORDER BY no_rekening
                        "
                    );

                    $R_CompanyBankNext = $DB->Row($Q_CompanyBankNext);
                    if($R_CompanyBankNext > 0){
                        while($CompanyBankNext = $DB->Result($Q_CompanyBankNext)){
                            App::UpdateBankBalance(array(
                                'tipe'          => 'debit',
                                'year'          => $year_plus,
                                'month'         => $month_plus,
                                'company'       => $company,
                                'bank'          => $CompanyBankNext['bank'],
                                'company_bank'  => $CompanyBankNext['company_bank'],
                                'no_rekening'   => $CompanyBankNext['no_rekening'],
                                'currency'      => $CompanyBankNext['currency'],
                                'value'         => 0
                            ));
                        }
                    }
                }
            }
        }

        public function closingStockLedger($company, $year, $month, $year_plus, $month_plus){
            global $DB;

            if ($DB->Delete(
                "storeloc_stock_ledger",
                "
                    company = '" . $company . "'
                    AND year = '" . $year . "'
                    AND month = '" . $month . "'
                    AND item IN (SELECT
                        item 
                    FROM
                        storeloc_stock 
                    WHERE
                        company = '" . $company . "')
                "
            )) {
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
                        AND DATE_FORMAT(tanggal,'%Y') = '" . $year . "'
                        AND CAST(DATE_FORMAT(tanggal,'%m') AS SIGNED) = '" . $month . "'
                    ORDER BY tanggal
                    "
                );
                $R_Stock = $DB->Row($Q_Stock);
                if ($R_Stock > 0) {
                    while ($Stock = $DB->Result($Q_Stock)) {
                        if ($Stock['debit'] != 0) {
                            $value = $Stock['debit'];
                            $type = 'debit';
                        } else {
                            $value = $Stock['credit'];
                            $type = 'credit';
                        }

                        $company_abbr = $Stock['company_abbr'];
                        $company_nama = $Stock['company_nama'];
    
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
                        if ($R_Item > 0) {
                            $Item = $DB->Result($Q_Item);
                        }
                        //=> / END : Item
    
                        if ($value != 0 && $Stock['item'] != 0) {
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
    
                /** PROCESS UPDATE STORELOC STOCK BULAN BERJALAN */
    
                if($year == $cur_year && $month == $cur_month){
                    $Q_StockL = $DB->QueryPort("
                        SELECT
                            company,
                            storeloc,
                            item,
                            closing
                        FROM
                            storeloc_stock_ledger 
                        WHERE
                            storeloc = '" . $Stock['storeloc'] . "'
                            AND company = '" . $company . "' 
                            AND `year` = '" . $year . "' 
                            AND `month` = '" . $month . "'
                    ");
                    $R_StockL = $DB->Row($Q_StockL);
                    if ($R_StockL > 0) {
                        while ($Stock = $DB->Result($Q_StockL)) {
                            $DB->Update(
                                'storeloc_stock',
                                array(
                                    'stock' => $Stock['closing']
                                ),
                                "
                                    company = '" . $Stock['company'] . "' AND
                                    storeloc = '" . $Stock['storeloc'] . "' AND
                                    item = '" . $Stock['item'] . "'
                                "
                            );
                        }
                    }
                }

                /** PROCESS GENERATE STOCK LEDGER UNTUK ITEM ADA DI STORELOC_STOCK TAPI TIDAK ADA DI STOCK LEDGER  */

                $Q_StorelocStock = $DB->QueryPort("
                    SELECT
                        company,
                        storeloc,
                        storeloc_kode,
                        item 
                    FROM
                        storeloc_stock 
                    WHERE
                        concat( item, '|', storeloc ) NOT IN 
                            ( SELECT 
                                concat( item, '|', storeloc ) 
                              FROM 
                                storeloc_stock_ledger
                              WHERE `year` = '" . $year . "' AND `month` = '" . $month . "')
                ");
                $R_StorelocStock = $DB->Row($Q_StorelocStock);
                if ($R_StorelocStock > 0) {
                    while ($StorelocStock = $DB->Result($Q_StorelocStock)) {
                        /**
                         * Select Item
                         */
                        $Q_Item = $DB->Query(
                            "item",
                            array(
                                'id',
                                'kode',
                                'TRIM(nama)' => 'nama'
                            ),
                            "
                                WHERE
                                    id = '" . $StorelocStock['item'] . "'
                            "
                        );
                        $R_Item = $DB->Row($Q_Item);
                        if ($R_Item > 0) {
                            $Item = $DB->Result($Q_Item);
                        }
                        //=> / END : Item

                        App::UpdateStockLedger(array(
                            'tipe'          => 'debit',
                            'year'          => $year,
                            'month'         => $month,
                            'company'       => $company,
                            'company_abbr'  => $company_abbr,
                            'company_nama'  => $company_nama,
                            'storeloc'      => $StorelocStock['storeloc'],
                            'storeloc_kode' => $StorelocStock['storeloc_kode'],
                            'item'          => $StorelocStock['item'],
                            'item_kode'     => $Item['kode'],
                            'item_nama'     => $Item['nama'],
                            'value'         => 0
                        ));
                    }
                }
    
                /** PROCESS UPDATE STOCK LEDGER KE BULAN SELANJUTNYA */
    
                $Q_StockLedger = $DB->QueryPort("
                    SELECT
                        year,
                        month,
                        company,
                        company_abbr,
                        company_nama,
                        storeloc,
                        storeloc_kode,
                        item,
                        item_kode,
                        item_nama,
                        opening,
                        closing
                    FROM
                        storeloc_stock_ledger 
                    WHERE
                        company = '" . $company . "' 
                        AND `year` = '" . $year . "' 
                        AND `month` = '" . $month . "'
                ");
                $R_StockLedger = $DB->Row($Q_StockLedger);
                if ($R_StockLedger > 0) {
                    while ($StockLedger = $DB->Result($Q_StockLedger)) {
                        $Q_Check = $DB->Query(
                            'storeloc_stock_ledger',
                            array(
                                'id',
                                'closing'
                            ),
                            "
                                WHERE
                                    company = '" . $company . "' AND 
                                    storeloc = '" . $StockLedger['storeloc'] . "'  AND 
                                    item = '" . $StockLedger['item'] . "'  AND
                                    year = '" . $year_plus . "'  AND 
                                    month = '" . $month_plus . "'
                            "
                        );
                        $R_Check = $DB->Row($Q_Check);
                        if($R_Check == 1){
                            $Check = $DB->Result($Q_Check);
    
                            $opening = $StockLedger['closing'];
                            $closing = $opening;
    
                            $Q_DetailNLedger = $DB->QueryPort("
                                SELECT
                                    SUM(debit) as total_debit,
                                    SUM(credit) as total_credit
                                FROM
                                    stock S
                                WHERE
                                    company = '" . $company . "'
                                    AND storeloc  = '" . $StockLedger['storeloc'] . "'
                                    AND DATE_FORMAT(tanggal,'%Y') = '" . $year_plus . "'
                                    AND CAST(DATE_FORMAT(tanggal,'%m') AS SIGNED) = '" . $month_plus . "'
                                    AND item = '" . $StockLedger['item'] . "'
                                GROUP BY
                                    item
                            ");
                            $R_DetailNLedger = $DB->Row($Q_DetailNLedger);
    
                            if($R_DetailNLedger > 0){
                                $DetailNLedger = $DB->Result($Q_DetailNLedger);
    
                                $closing = $opening + $DetailNLedger['total_debit'] - $DetailNLedger['total_credit'];
                            }
                
                            $Field = array(
                                'opening'       => $opening,
                                'closing'       => $closing,
                                'update_by'     => Core::GetState('id'),
                                'update_date'   => date("Y-m-d H:i:s")
                            );
                
                            if($DB->Update(
                                'storeloc_stock_ledger',
                                $Field,
                                "id = '" . $Check['id'] . "'"
                            )){
                                $return = array(
                                    'action'    => 'Update Stock Ledger Closing',
                                    'status'    => 1
                                );
                            }
                        }
                        else{
                            $closing = $StockLedger['closing'];
                            $DB->Insert(
                                'storeloc_stock_ledger',
                                array(
                                    'year'          => $year_plus,
                                    'month'         => $month_plus,
                                    'company'       => $StockLedger['company'],
                                    'company_abbr'  => $StockLedger['company_abbr'],
                                    'company_nama'  => $StockLedger['company_nama'],
                                    'storeloc'      => $StockLedger['storeloc'],
                                    'storeloc_kode' => $StockLedger['storeloc_kode'],
                                    'item'          => $StockLedger['item'],
                                    'item_kode'     => $StockLedger['item_kode'],
                                    'item_nama'     => $StockLedger['item_nama'],
                                    'opening'       => $StockLedger['closing'],
                                    'closing'       => $StockLedger['closing'],
                                    'create_by'     => Core::GetState('id'),
                                    'create_date'   => date("Y-m-d H:i:s")
                                )
                            );
                        }

                        if($year_plus == (int)date("Y") && $month_plus == (int)date("m")){
                            $Q_CheckSlocStok = $DB->Query(
                                'storeloc_stock',
                                array(
                                    'id'
                                ),
                                "
                                    WHERE
                                        company = '" . $company . "' AND 
                                        storeloc = '" . $StockLedger['storeloc'] . "'  AND 
                                        item = '" . $StockLedger['item'] . "'
                                "
                            );
                            $R_CheckSlocStok = $DB->Row($Q_CheckSlocStok);
                            if($R_CheckSlocStok == 1){
                                $DB->Update(
                                    'storeloc_stock',
                                    array(
                                        'stock'         => $closing
                                    ),
                                    "
                                        company = '" . $company . "' AND
                                        storeloc = '" . $StockLedger['storeloc'] . "' AND
                                        item = '" . $StockLedger['item'] . "'
                                    "
                                );
                            }
                            else{
                                $Q_StockPrice = $DB->Query(
                                    'stock_price',
                                    array(
                                        'price'
                                    ),
                                    "
                                        WHERE
                                            company = '" . $company . "' AND
                                            item = '" . $StockLedger['item'] . "'
                                    "
                                );
                                $R_StockPrice = $DB->Row($Q_StockPrice);
    
                                if($R_StockPrice > 0){
                                    $StockPrice = $DB->Result($Q_StockPrice);
        
                                    $DB->Insert(
                                        'storeloc_stock',
                                        array(
                                            'company'       => $company,
                                            'storeloc'      => $StockLedger['storeloc'],
                                            'storeloc_kode' => $StockLedger['storeloc_kode'],
                                            'item'          => $StockLedger['item'],
                                            'stock'         => $closing,
                                            'price'         => $StockPrice['price']
                                        )
                                    );
                                }
                            }
                        }
                    }
                }
            }
        }

        public function closingHPP($company, $year, $month, $year_min, $month_min, $year_plus, $month_plus){
            // $DB = new DB;
            global $DB;

            $Q_AllTrxHPP = $DB->QueryPort("
                SELECT
                    * 
                FROM
                    (
                    SELECT
                        1 AS seq,
                        y.id,
                        x.company,
                        x.tanggal,
                        x.kode,
                        y.item,
                        y.qty_receipt AS qty,
                        y.price AS price,
                        y.storeloc 
                    FROM
                        gr x,
                        gr_detail y 
                    WHERE
                        x.id = y.header UNION ALL
                    SELECT
                        2 AS seq,
                        y.id,
                        x.company,
                        x.tanggal,
                        x.kode,
                        y.item,
                        y.qty_return AS qty,
                        y.price AS price,
                        y.storeloc 
                    FROM
                        rgr x,
                        rgr_detail y 
                    WHERE
                        x.id = y.header UNION ALL
                    SELECT
                        3 AS seq,
                        y.id,
                        x.company,
                        x.tanggal,
                        x.kode,
                        y.item,
                        y.qty_gi AS qty,
                        y.price AS price,
                        y.storeloc 
                    FROM
                        gi x,
                        gi_detail y 
                    WHERE
                        x.id = y.header UNION ALL
                    SELECT
                        4 AS seq,
                        y.id,
                        x.company,
                        x.tanggal,
                        x.kode,
                        y.item,
                        y.qty_return AS qty,
                        y.price AS price,
                        y.storeloc 
                    FROM
                        rgi x,
                        rgi_detail y 
                    WHERE
                        x.id = y.header UNION ALL
                    SELECT
                        5 AS seq,
                        y.id,
                        x.company,
                        x.tanggal,
                        x.kode,
                        y.item,
                        y.debit AS qty,
                        y.price AS price,
                        x.storeloc 
                    FROM
                        stock_adjustment x,
                        stock_adjustment_detail y 
                    WHERE
                        x.id = y.header
                        AND debit != 0 UNION ALL
                    SELECT
                        6 AS seq,
                        y.id,
                        x.company,
                        x.tanggal,
                        x.kode,
                        y.item,
                        y.credit AS qty,
                        y.price AS price,
                        x.storeloc 
                    FROM
                        stock_adjustment x,
                        stock_adjustment_detail y 
                    WHERE
                        x.id = y.header
                        AND credit != 0
                    ) head 
                WHERE
                    company = " . $company . " 
                    AND YEAR ( tanggal ) = " . $year . " 
                    AND MONTH ( tanggal ) = " . $month . "
                ORDER BY
                    tanggal,
                    seq,
                    kode
            ");
    
            $R_AllTrxHPP = $DB->Row($Q_AllTrxHPP);
    
            if($R_AllTrxHPP > 0){
                $DB->QueryPort("
                    DELETE FROM stock_price_ledger
                    WHERE company = " . $company . " 
                    AND year = " . $year . " 
                    AND month = " . $month . "
                ");
                while($Data = $DB->Result($Q_AllTrxHPP)){
                    $StockAwal = 0;
                    $StockAkhir = 0;
                    $Price = 0;
        
                    $Q_StockPrice = $DB->Query(
                        "stock_price_ledger",
                        array(
                            'closing_stock',
                            'closing_price'
                        ),
                        "
                            WHERE
                                company = '" . $company . "' AND
                                item = '" . $Data['item'] . "' AND 
                                year = '" . $year . "' AND 
                                month = '" . $month . "'
                        "
                    );
                    $R_StockPrice = $DB->Row($Q_StockPrice);
                    if($R_StockPrice > 0){
                        $StockPrice = $DB->Result($Q_StockPrice);
        
                        $StockAwal = $StockPrice['closing_stock'];
                        $Price = $StockPrice['closing_price'];
                    }
                    else{
                        $Q_StockLedger = $DB->QueryPort("
                            SELECT
                                IFNULL(opening_stock, 0) AS opening_stock,
                                CASE		
                                    WHEN opening_price IS NOT NULL THEN
                                    opening_price ELSE ( SELECT price FROM stock WHERE ref_kode = '" . $Data['kode'] . "' AND item = '" . $Data['item'] . "' LIMIT 1) 
                                END AS opening_price 
                            FROM
                            (SELECT
                                SUM( x.opening ) AS opening_stock,
                                (
                                SELECT
                                    closing_price 
                                FROM
                                    stock_price_ledger 
                                WHERE
                                    company = '" . $company . "' 
                                    AND item = x.item 
                                    AND `year` <= '" . $year . "' 
                                    AND `month` < '" . $month . "' 
                                ORDER BY
                                    YEAR,
                                MONTH DESC 
                                    LIMIT 1 
                                ) AS opening_price 
                            FROM
                                storeloc_stock_ledger x 
                            WHERE
                                x.company = '" . $company . "' 
                                AND x.item = '" . $Data['item'] . "' 
                                AND x.`year` = '" . $year . "' 
                                AND x.`month` = '" . $month . "') ops
                        ");
                        $R_StockLedger = $DB->Row($Q_StockLedger);
                        if($R_StockLedger > 0){
                            $StockLedger = $DB->Result($Q_StockLedger);

                            $StockAwal = $StockLedger['opening_stock'];
                            $Price = $StockLedger['opening_price'];
                        }
                    }
        
                    $UnitPrice = $Price;
            
                    /**
                     * Calculate Debit / Credit
                     */
                    if($Data['seq'] == 1 || $Data['seq'] == 4 || $Data['seq'] == 5){ // MASUK
                        $StockAkhir = $Data['qty'] + $StockAwal;
                        
                        $PriceOld = $StockAwal * $Price;
                        if($Data['seq'] == 1){
                            $PriceNew = $Data['qty'] * $Data['price'];
                        }
                        else{
                            $PriceNew = $Data['qty'] * $Price;
                        }
                        $AllQty = $StockAkhir;
                        
                        if($AllQty > 0){
                            $UnitPrice = ($PriceOld + $PriceNew) / $AllQty;
                        }
                        //=> / END : Create new HPP            
                    }else{ // Keluar
                        $StockAkhir = $StockAwal - $Data['qty'];
                        if($Data['seq'] == 2){
                            $PriceOld = $StockAwal * $Price;
                            $PriceNew = $Data['qty'] * $Price;
                            $AllQty = $StockAkhir;    
                            
                            if($AllQty > 0){
                                $UnitPrice = ($PriceOld + $PriceNew) / $AllQty;
                            }
                        }
                    }

                    if($Data['price'] != $UnitPrice && $Data['seq'] == 3){                        
                        $DB->Update(
                            "stock",
                            array(
                                'price' => $UnitPrice
                            ),
                            "
                                ref_kode = '" . $Data['kode'] . "'
                                AND item = '" . $Data['item'] . "'
                            "
                        );

                        $DB->Update(
                            "gi_detail",
                            array(
                                'price' => $UnitPrice
                            ),
                            "
                                id = '" . $Data['id'] . "'
                            "
                        );
                    }

                    /** UPDATE STOCK PRICE LEDGER */
                    $Q_Check = $DB->Query(
                        "stock_price_ledger",
                        array(
                            'id'
                        ),
                        "
                            WHERE
                                company = '" . $company . "' AND
                                item = '" . $Data['item'] . "' AND 
                                year = '" . $year . "' AND 
                                month = '" . $month . "'
                        "
                    );
                    $R_Check = $DB->Row($Q_Check);
                    if($R_Check > 0){
                        $Check = $DB->Result($Q_Check);

                        $Field = array(
                            'closing_stock' => $StockAkhir,
                            'closing_price' => $UnitPrice,
                            'update_by'     => Core::GetState('id'),
                            'update_date'   => date("Y-m-d H:i:s")
                        );

                        if($DB->Update(
                            "stock_price_ledger",
                            $Field,
                            "id = '" . $Check['id'] . "'"
                        )){
                            $return = array(
                                'action'    => 'Update Price',
                                'status'    => 1
                            );
                        }
                    }else{
                        $opening_stock = 0;
                        $opening_price = 0;

                        $Q_StockLedger = $DB->QueryPort("
                            SELECT
                                IFNULL(opening_stock, 0) AS opening_stock,
                                CASE		
                                    WHEN opening_price IS NOT NULL THEN
                                    opening_price ELSE ( SELECT price FROM stock WHERE ref_kode = '" . $Data['kode'] . "' AND item = '" . $Data['item'] . "' LIMIT 1) 
                                END AS opening_price 
                            FROM
                            (SELECT
                                SUM( x.opening ) AS opening_stock,
                                (
                                SELECT
                                    closing_price 
                                FROM
                                    stock_price_ledger 
                                WHERE
                                    company = '" . $company . "' 
                                    AND item = x.item 
                                    AND `year` <= '" . $year . "' 
                                    AND `month` < '" . $month . "' 
                                ORDER BY
                                    YEAR,
                                MONTH DESC 
                                    LIMIT 1 
                                ) AS opening_price 
                            FROM
                                storeloc_stock_ledger x 
                            WHERE
                                x.company = '" . $company . "' 
                                AND x.item = '" . $Data['item'] . "' 
                                AND x.`year` = '" . $year . "' 
                                AND x.`month` = '" . $month . "') ops
                        ");
                        $R_StockLedger = $DB->Row($Q_StockLedger);
                        if($R_StockLedger > 0){
                            $StockLedger = $DB->Result($Q_StockLedger);

                            $opening_stock = $StockLedger['opening_stock'];
                            $opening_price = $StockLedger['opening_price'];
                        }
                        
                        if($DB->Insert(
                            "stock_price_ledger",
                            array(
                                'year'          => $year,
                                'month'         => $month,
                                'company'       => $company,
                                'item'          => $Data['item'],
                                'opening_stock' => $opening_stock,
                                'opening_price' => $opening_price,
                                'closing_stock' => $StockAkhir,
                                'closing_price' => $UnitPrice,
                                'create_by'     => Core::GetState('id'),
                                'create_date'   => date("Y-m-d H:i:s"),
                                'flag'          => 1
                            )
                        )){
                            $return = array(
                                'action'    => 'Create Price [' . $Options['company'] . ',' . $Options['item'] . ']',
                                'status'    => 1
                            );
                        }
                    }
                }
            }
        }

        /**
         * Trx ID = 1
         */
        public function closingGR($company, $year, $month){
            // $DB = new DB;
            global $DB;

            if($DB->Delete(
                "journal",
                "company = ".$company." 
                AND YEAR ( tanggal ) = ".$year." 
                AND MONTH ( tanggal ) = ".$month."
                AND DOC_ID = 1"
            )){
                $Q_AllGRs = $DB->QueryPort("
                    SELECT
                        x.id,
                        x.po,
                        x.supplier,
                        x.supplier_nama,
                        x.tanggal,
                        x.kode
                    FROM
                        gr x
                    WHERE
                        x.company = ".$company." 
                        AND YEAR ( x.tanggal ) = ".$year." 
                        AND MONTH ( x.tanggal ) = ".$month." 
                    ORDER BY
                        x.tanggal, x.kode
                ");
        
                $R_AllGRs = $DB->Row($Q_AllGRs);
        
                if($R_AllGRs > 0){
                    while($Data = $DB->Result($Q_AllGRs)){
                        /**
                         * START : Posting Jurnal
                         */
                        $Q_AllGR = $DB->QueryPort("
                            SELECT
                                x.kode,
                                x.po_kode,
                                x.supplier_kode,
                                x.tanggal,
                                x.remarks,
                                y.id AS item,
                                z.grup,
                                z.item_type,
                                y.qty_receipt,
                                y.price,
                                y.storeloc_kode
                            FROM
                                gr x,
                                gr_detail y,
                                item z
                            WHERE
                                x.id = ".$Data['id']."
                                AND x.id = y.header
                                AND y.item = z.id
                        ");
                        
                        $R_AllGR = $DB->Row($Q_AllGR);

                        if($R_AllGR > 0){
                            $PO = $DB->Result($DB->QueryPort("
                                SELECT
                                    x.kode,
                                    x.other_cost,
                                    x.ppbkb,
                                    x.currency,
                                    x.supplier_kode,
                                    sum( y.qty_po ) tot_qty
                                FROM
                                    po x,
                                    po_detail y 
                                WHERE
                                    x.id = y.header 
                                    AND x.id = ".$Data['po']."
                            "));

                            $po_kode = $PO['kode'];
                            $kode = $Data['kode'];
                            $sum_qty_po = $PO['tot_qty'];
                            $other_cost = $PO['other_cost'];
                            $ppbkb = $PO['ppbkb'];
                            $supplier_kode = $PO['supplier_kode'];
                            $currency = $PO['currency'];
                            $tanggal = $Data['tanggal'];

                            $i = 0;
                            $ARR_GR = [];
                            while($GR = $DB->Result($Q_AllGR)){
                                $ARR_GR[$i] = $GR;
                                $Q_COA_Item = $DB->Query(
                                    "item_grup_coa",
                                    array(
                                        'id',
                                        'coa_persediaan',
                                        'coa_beban'
                                    ),
                                    "
                                    WHERE 
                                        item_grup_id = '" . $GR['grup'] . "'
                                        AND company = ".$company."
                                    "
                                );

                                if($GR['item_type']  == 1){
                                    $R_COA_Item = $DB->Row($Q_COA_Item);
                                    if($R_COA_Item > 0){
                                        $COA_Item = $DB->Result($Q_COA_Item);
                                        if($COA_Item['coa_persediaan']){
                                            $Jurnal = App::JurnalPosting(array(
                                                'trx_type'      => 1,
                                                'tipe'          => 'debit',
                                                'company'       => $company,
                                                'source'        => $po_kode,
                                                'target'        => $GR['storeloc_kode'],
                                                'item'          => $GR['item'],
                                                'qty'           => $GR['qty_receipt'],
                                                'currency'      => $currency,
                                                'rate'          => 1,
                                                'coa'           => $COA_Item['coa_persediaan'],
                                                'value'         => ($GR['price'] * $GR['qty_receipt']) + (($other_cost / $sum_qty_po) * $list[$i]['qty_receipt']) + (($ppbkb / $sum_qty_po) * $list[$i]['qty_receipt']),
                                                'kode'          => $kode,
                                                'tanggal'       => $GR['tanggal'],
                                                'keterangan'    => $GR['remarks']
                                            ));
                                            //=> / END : Insert to Jurnal Posting and Update Balance
                                        }
                                    }
                                }
                                else{
                                    $R_COA_Item = $DB->Row($Q_COA_Item);
                                    if($R_COA_Item > 0){
                                        $COA_Item = $DB->Result($Q_COA_Item);
                                        if($COA_Item['coa_beban']){
                                            $Jurnal = App::JurnalPosting(array(
                                                'trx_type'      => 1,
                                                'tipe'          => 'debit',
                                                'company'       => $company,
                                                'source'        => $po_kode,
                                                'target'        => $GR['storeloc_kode'],
                                                'item'          => $GR['item'],
                                                'qty'           => $GR['qty_receipt'],
                                                'currency'      => $currency,
                                                'rate'          => 1,
                                                'coa'           => $COA_Item['coa_beban'],
                                                'value'         => ($GR['price'] * $GR['qty_receipt']) + (($other_cost / $sum_qty_po) * $list[$i]['qty_receipt']) + (($ppbkb / $sum_qty_po) * $list[$i]['qty_receipt']),
                                                'kode'          => $kode,
                                                'tanggal'       => $GR['tanggal'],
                                                'keterangan'    => $GR['remarks']
                                            ));
                                            //=> / END : Insert to Jurnal Posting and Update Balance
                                        }
                                    }
                                }
                                $i++;
                            }

                            $Q_COA = $DB->Query(
                                "pihakketiga_coa",
                                array(
                                    'id',
                                    'coa_accrued',
                                ),
                                "WHERE 
                                    pihakketiga_tipe = 0
                                    AND company = '". $company ."'
                                    AND pihakketiga = '". $Data['supplier'] ."'
                                    AND coa_accrued IS NOT NULL
                                    AND status = 1"
                            );
                            $R_COA = $DB->Row($Q_COA);

                            if($R_COA > 0){
                                $S_COA = $DB->Result($Q_COA);

                                $total_price = 0;
                                for($i = 0; $i < sizeof($ARR_GR); $i++){
                                    if($ARR_GR[$i]['qty_receipt'] > 0){
                                        $total_price = $total_price + ($ARR_GR[$i]['price'] * $ARR_GR[$i]['qty_receipt']) + (($other_cost / $sum_qty_po) * $ARR_GR[$i]['qty_receipt']) + (($ppbkb / $sum_qty_po) * $ARR_GR[$i]['qty_receipt']);
                                    }
                                }

                                $Jurnal = App::JurnalPosting(array(
                                    'trx_type'      => 1,
                                    'tipe'          => 'credit',
                                    'company'       => $company,
                                    'source'        => $po_kode,
                                    'target'        => $supplier_kode,
                                    'currency'      => $currency,
                                    'rate'          => 1,
                                    'coa'           => $S_COA['coa_accrued'],
                                    'value'         => $total_price,
                                    'kode'          => $kode,
                                    'tanggal'       => $tanggal,
                                    'keterangan'    => $remarks
                                ));
                            }
                            else{
                                $DB->LogError("Please define default activity/account for this supplier " . $Data['supplier_nama']);
                                exit();
                            }
                        }
                    }
                }
            }
        }
    
        /**
         * Trx ID = 2
         */
        function closingGI($company, $year, $month){
            // $DB = new DB;
            global $DB;

            if($DB->Delete(
                "journal",
                "company = ".$company." 
                AND YEAR ( tanggal ) = ".$year." 
                AND MONTH ( tanggal ) = ".$month."
                AND DOC_ID = 2"
            )){
                $Q_AllGI = $DB->QueryPort("
                    SELECT
                        x.kode,
                        x.tanggal,
                        x.remarks,
                        mrd.remarks AS mr_remarks,
                        y.item,
                        y.qty_gi,
                        y.price,
                        y.storeloc_kode,
                        y.cost_center,
                        y.cost_center_kode,
                        y.coa,
                        z.item_type,
                        z.grup 
                    FROM
                        gi x,
                        gi_detail y,
                        item z,
                        mr_detail mrd
                    WHERE
                        x.id = y.header 
                        AND y.item = z.id 
                        AND mrd.header = x.mr
                        AND mrd.item = y.item
                        AND x.company = ".$company." 
                        AND YEAR ( x.tanggal ) = ".$year."
                        AND MONTH ( x.tanggal ) = ".$month." 
                    ORDER BY
                        x.tanggal, x.kode
                ");
        
                $R_AllGI = $DB->Row($Q_AllGI);
        
                if($R_AllGI > 0){
                    while($GI = $DB->Result($Q_AllGI)){
                        /**
                         * START : Posting Jurnal
                         */
                        
                        /**
                        * Select Item COA
                        */
                        $Q_COA_Item = $DB->Query(
                            "item_grup_coa",
                            array(
                                'id',
                                'coa_persediaan',
                                'coa_beban'
                            ),
                            "
                            WHERE 
                                item_grup_id = '" . $GI['grup'] . "'
                                AND company = ".$company."
                            "
                        );
                        $R_COA_Item = $DB->Row($Q_COA_Item);
                        if($R_COA_Item > 0 && $GI['item_type']  == 1){
                            $COA_Item = $DB->Result($Q_COA_Item);

                            if(!$GI['cost_center_kode']){
                                $GI['cost_center_kode'] = "X";
                            }

                            $Jurnal = App::JurnalPosting(array(
                                'trx_type'      => 2,
                                'tipe'          => 'debit',
                                'company'       => $company,
                                'source'        => $GI['storeloc_kode'],
                                'target'        => $GI['cost_center_kode'],
                                'item'          => $GI['item'],
                                'cost_center'   => $GI['cost_center'],
                                'qty'           => $GI['qty_gi'],
                                'currency'      => 'IDR',
                                'rate'          => 1,
                                'coa'           => $GI['coa'],
                                'value'         => $GI['qty_gi'] * $GI['price'],
                                'kode'          => $GI['kode'],
                                'tanggal'       => $GI['tanggal'],
                                'keterangan'    => $GI['mr_remarks']
                            ));
                            //=> / END : Insert to Jurnal Posting and Update Balance

                            $Jurnal = App::JurnalPosting(array(
                                'trx_type'      => 2,
                                'tipe'          => 'credit',
                                'company'       => $company,
                                'source'        => $GI['storeloc_kode'],
                                'target'        => $GI['cost_center_kode'],
                                'item'          => $GI['item'],
                                'cost_center'   => $GI['cost_center'],
                                'qty'           => $GI['qty_gi'],
                                'currency'      => 'IDR',
                                'rate'          => 1,
                                'coa'           => $COA_Item['coa_persediaan'],
                                'value'         => $GI['qty_gi'] * $GI['price'],
                                'kode'          => $GI['kode'],
                                'tanggal'       => $GI['tanggal'],
                                'keterangan'    => $GI['mr_remarks']
                            ));
                            //=> / END : Insert to Jurnal Posting and Update Balance
                        }
                        //=> / END : Posting Jurnal
                    }
                }
            }
        }
    
        /**
         * Trx ID = 3
         */
        function closingRGR($company, $year, $month){
            // $DB = new DB;
            global $DB;

            if($DB->Delete(
                "journal",
                "company = ".$company." 
                AND YEAR ( tanggal ) = ".$year." 
                AND MONTH ( tanggal ) = ".$month."
                AND DOC_ID = 3"
            )){
                $Q_AllRGRs = $DB->QueryPort("
                    SELECT
                        x.id,
                        x.gr,
                        x.supplier,
                        x.supplier_nama,
                        x.po,
                        x.tanggal,
                        x.kode
                    FROM
                        rgr x
                    WHERE
                        x.company = ".$company." 
                        AND YEAR ( x.tanggal ) = ".$year." 
                        AND MONTH ( x.tanggal ) = ".$month." 
                    ORDER BY
                        x.tanggal, x.kode
                ");
        
                $R_AllRGRs = $DB->Row($Q_AllRGRs);
        
                if($R_AllRGRs > 0){
                    while($Data = $DB->Result($Q_AllRGRs)){
                        /**
                         * START : Posting Jurnal
                         */
                        $Q_AllRGR = $DB->QueryPort("
                            SELECT
                                x.kode,
                                x.po_kode,
                                x.supplier_kode,
                                x.tanggal,
                                y.item,
                                z.id AS item,
                                z.grup,
                                z.item_type,
                                y.qty_return,
                                y.price,
                                y.storeloc_kode,
                                y.remarks
                            FROM
                                rgr x,
                                rgr_detail y,
                                item z
                            WHERE
                                x.id = ".$Data['id']."
                                AND x.id = y.header
                                AND y.item = z.id
                        ");
                        
                        $R_AllRGR = $DB->Row($Q_AllRGR);

                        if($R_AllRGR > 0){
                            $PO = $DB->Result($DB->QueryPort("
                                SELECT
                                    x.kode,
                                    x.other_cost,
                                    x.currency,
                                    x.supplier_kode,
                                    sum( y.qty_po ) tot_qty
                                FROM
                                    po x,
                                    po_detail y 
                                WHERE
                                    x.id = y.header 
                                    AND x.id = ".$Data['po']."
                            "));

                            $po_kode = $PO['kode'];
                            $kode = $Data['kode'];
                            $sum_qty_po = $PO['tot_qty'];
                            $other_cost = $PO['other_cost'];
                            $supplier_kode = $PO['supplier_kode'];
                            $currency = $PO['currency'];
                            $tanggal = $Data['tanggal'];

                            $ARR_RGR = [];
                            $i = 0;
                            while($RGR = $DB->Result($Q_AllRGR)){
                                $ARR_RGR[$i] = $RGR;
                                $i++;

                                $Q_COA_Item = $DB->Query(
                                    "item_grup_coa",
                                    array(
                                        'id',
                                        'coa_persediaan',
                                        'coa_beban'
                                    ),
                                    "
                                    WHERE 
                                        item_grup_id = '" . $RGR['grup'] . "'
                                        AND company = ".$company."
                                    "
                                );
                                $R_COA_Item = $DB->Row($Q_COA_Item);
                                if($R_COA_Item > 0){
                                    $COA_Item = $DB->Result($Q_COA_Item);
        
                                    if(empty($RGR['remarks'])){
                                        $RGR[$i]['remarks'] = "-";
                                    }
            
                                    if($RGR['item_type']  == 1){
                                        $Jurnal = App::JurnalPosting(array(
                                            'trx_type'      => 3,
                                            'tipe'          => 'credit',
                                            'company'       => $company,
                                            'source'        => $po_kode,
                                            'target'        => $RGR['storeloc_kode'],
                                            'target_2'      => $RGR['item'],
                                            'currency'      => $currency,
                                            'rate'          => 1,
                                            'coa'           => $COA_Item['coa_persediaan'],
                                            'value'         => ($RGR['price'] * $RGR['qty_return']) + (($other_cost / $sum_qty_po) * $RGR['qty_return']) + (($ppbkb / $sum_qty_po) * $RGR['qty_return']),
                                            'kode'          => $kode,
                                            'tanggal'       => $tanggal,
                                            'keterangan'    => $RGR['remarks']
                                        ));
                                        //=> / END : Insert to Jurnal Posting and Update Balance
                                    }
                                    else{
                                        $Jurnal = App::JurnalPosting(array(
                                            'trx_type'      => 3,
                                            'tipe'          => 'credit',
                                            'company'       => $company,
                                            'source'        => $po_kode,
                                            'target'        => $RGR['storeloc_kode'],
                                            'target_2'      => $RGR['item'],
                                            'currency'      => $currency,
                                            'rate'          => 1,
                                            'coa'           => $COA_Item['coa_beban'],
                                            'value'         => ($RGR['price'] * $RGR['qty_return']) + (($other_cost / $sum_qty_po) * $RGR['qty_return']) + (($ppbkb / $sum_qty_po) * $RGR['qty_return']),
                                            'kode'          => $kode,
                                            'tanggal'       => $tanggal,
                                            'keterangan'    => $RGR['remarks']
                                        ));
                                        
                                        //=> / END : Insert to Jurnal Posting and Update Balance
                                    }
                                }
                            }

                            $Q_COA = $DB->Query(
                                "pihakketiga_coa",
                                array(
                                    'id',
                                    'coa_accrued',
                                ),
                                "WHERE 
                                    pihakketiga_tipe = 0
                                    AND company = '". $company ."'
                                    AND pihakketiga = '". $Data['supplier'] ."'
                                    AND coa_accrued IS NOT NULL
                                    AND status = 1"
                            );
                            $R_COA = $DB->Row($Q_COA);

                            if($R_COA > 0){
                                $S_COA = $DB->Result($Q_COA);

                                $total_price = 0;

                                for($i = 0; $i < sizeof($ARR_RGR); $i++){
                                    if($ARR_RGR[$i]['qty_return'] > 0){
                                        $total_price = $total_price + ($ARR_RGR[$i]['price'] * $ARR_RGR[$i]['qty_return']) + (($other_cost / $sum_qty_po) * $ARR_RGR[$i]['qty_return']) + (($ppbkb / $sum_qty_po) * $ARR_RGR[$i]['qty_return']);
                                    }
                                }
                
                                $Jurnal = App::JurnalPosting(array(
                                    'trx_type'      => 3,
                                    'tipe'          => 'debit',
                                    'company'       => $company,
                                    'source'        => $po_kode,
                                    'target'        => $supplier_kode,
                                    'currency'      => $currency,
                                    'rate'          => 1,
                                    'coa'           => $S_COA['coa_accrued'],
                                    'value'         => $total_price,
                                    'kode'          => $kode,
                                    'tanggal'       => $tanggal
                                ));
                            }
                            else{
                                $DB->LogError("Please define default activity/account for this supplier " . $Data['supplier_nama']);
                                exit();
                            }
                        }
                    }
                }
            }
        }
    
        /**
         * Trx ID = 4
         */
        function closingRGI($company, $year, $month){
            // $DB = new DB;
            global $DB;

            if($DB->Delete(
                "journal",
                "company = ".$company." 
                AND YEAR ( tanggal ) = ".$year." 
                AND MONTH ( tanggal ) = ".$month."
                AND DOC_ID = 4"
            )){
                $Q_AllRGI = $DB->QueryPort("
                    SELECT
                        xx.kode,
                        xx.tanggal,
                        yy.remarks,
                        yy.item,
                        yy.qty_return,
                        yy.price,
                        y.storeloc_kode,
                        y.cost_center,
                        y.cost_center_kode,
                        y.cost_center_nama,
                        y.coa,
                        i.item_type,
                        i.grup
                    FROM
                        gi x,
                        gi_detail y,
                        rgi xx,
                        rgi_detail yy,
                        item i
                    WHERE
                        x.id = y.header
                        AND x.id = xx.gi
                        AND xx.id = yy.header
                        AND y.item = i.id
                        AND xx.company = ".$company." 
                        AND YEAR ( xx.tanggal ) = ".$year." 
                        AND MONTH ( xx.tanggal ) = ".$month."
                    ORDER BY
                            xx.tanggal, xx.kode
                ");
        
                $R_AllRGI = $DB->Row($Q_AllRGI);
        
                if($R_AllRGI > 0){
                    while($RGI = $DB->Result($Q_AllRGI)){                        
                        /**
                        * Select Item COA
                        */
                        $Q_COA_Item = $DB->Query(
                            "item_grup_coa",
                            array(
                                'id',
                                'coa_persediaan',
                                'coa_beban'
                            ),
                            "
                            WHERE 
                                item_grup_id = '" . $RGI['grup'] . "'
                                AND company = ".$company."
                            "
                        );
                        $R_COA_Item = $DB->Row($Q_COA_Item);
                        if($R_COA_Item > 0 && $RGI['item_type']  == 1){
                            $COA_Item = $DB->Result($Q_COA_Item);

                            $Jurnal = App::JurnalPosting(array(
                                'trx_type'      => 4,
                                'tipe'          => 'debit',
                                'company'       => $company,
                                'source'        => $RGI['storeloc_kode'],
                                'target'        => $RGI['cost_center_kode'],
                                'item'          => $RGI['item'],
                                'cost_center'   => $RGI['cost_center'],
                                'qty'           => $RGI['qty_return'],
                                'currency'      => 'IDR',
                                'rate'          => 1,
                                'coa'           => $COA_Item['coa_persediaan'],
                                'value'         => ($RGI['qty_return'] * $RGI['price']),
                                'kode'          => $RGI['kode'],
                                'tanggal'       => $RGI['tanggal'],
                                'keterangan'    => $RGI['remarks']
                            ));
                            //=> / END : Insert to Jurnal Posting and Update Balance

                            $Jurnal = App::JurnalPosting(array(
                                'trx_type'      => 4,
                                'tipe'          => 'credit',
                                'company'       => $company,
                                'source'        => $RGI['storeloc_kode'],
                                'target'        => $RGI['cost_center_kode'],
                                'cost_center'   => $RGI['cost_center'],
                                'qty'           => $RGI['qty_return'],
                                'item'          => $RGI['item'],
                                'currency'      => 'IDR',
                                'rate'          => 1,
                                'coa'           => $RGI['coa'],
                                'value'         => ($RGI['qty_return'] * $RGI['price']),
                                'kode'          => $RGI['kode'],
                                'tanggal'       => $RGI['tanggal'],
                                'keterangan'    => $RGI['remarks']
                            ));
                            //=> / END : Insert to Jurnal Posting and Update Balance
                        }
                        //=> / END : Posting Jurnal
                    }
                }
            }
        }
    
        /**
         * Trx ID = 6
         */
        function closingINV_SD($company, $year, $month){
            // $DB = new DB;
            global $DB;

            if($DB->Delete(
                "journal",
                "company = ".$company." 
                AND YEAR ( tanggal ) = ".$year." 
                AND MONTH ( tanggal ) = ".$month."
                AND DOC_ID = 6"
            )){
                $Q_AllInvSD = $DB->QueryPort("
                    SELECT
                        h.kode po_kode,
                        i.kode AS inv_kode,
                        i.ref_tgl,
                        h.supplier_kode,
                        h.supplier_nama,
                        d.item,
                        h.currency,
                        h.company,
                        SUM(
                            (
                                ( IFNULL( h.other_cost, 0 ) + IFNULL( h.ppbkb, 0 ) ) / ( SELECT sum( qty_po ) FROM po_detail WHERE header = h.id ) * ( dg.qty_receipt - dg.qty_return ) 
                                ) + (
                                ( 100- h.disc ) / 100 * (
                                CASE
                                        
                                        WHEN h.inclusive_ppn = 1 THEN
                                        d.price / 1.1 ELSE d.price 
                                    END * ( dg.qty_receipt - dg.qty_return ) 
                                ) 
                            ) 
                        ) amount_accrued,
                        ( SELECT coa FROM trx_coa_balance WHERE doc_nama = 'Purchase Invoice' AND seq = 2 AND company = h.company )  AS coa_uang_muka,
                        SUM(
                            (
                                ( IFNULL( h.other_cost, 0 ) + IFNULL( h.ppbkb, 0 ) ) / ( SELECT sum( qty_po ) FROM po_detail WHERE header = h.id ) * ( ( dg.qty_receipt - dg.qty_return ) / 100 * h.dp ) 
                                ) + (
                                ( 100- h.disc ) / 100 * (
                                CASE
                                        
                                        WHEN h.inclusive_ppn = 1 THEN
                                        d.price / 1.1 ELSE d.price 
                                    END * ( ( dg.qty_receipt - dg.qty_return ) / 100 * h.dp ) 
                                ) 
                            ) 
                        ) amount_uang_muka,
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
                        SUM(
                        CASE
                                
                                WHEN h.customs = 1 THEN
                                0 ELSE (
                                    (
                                        (
                                            ( 100- h.disc ) / 100 * (
                                            CASE
                                                    
                                                    WHEN h.inclusive_ppn = 1 THEN
                                                    d.price / 1.1 ELSE d.price 
                                                END * ( dg.qty_receipt - dg.qty_return ) 
                                            ) 
                                        ) 
                                    ) * ( h.ppn / 100 ) 
                                    ) - (
                                    (
                                        (
                                            ( 100- h.disc ) / 100 * (
                                            CASE
                                                    
                                                    WHEN h.inclusive_ppn = 1 THEN
                                                    d.price / 1.1 ELSE d.price 
                                                END * ( ( dg.qty_receipt - dg.qty_return ) / 100 * h.dp ) 
                                            ) 
                                        ) 
                                    ) * ( h.ppn / 100 ) 
                                ) 
                            END 
                            ) amount_ppn,
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
                        SUM(
                            (
                                (
                                    (
                                        ( 100- h.disc ) / 100 * (
                                        CASE
                                                
                                                WHEN h.inclusive_ppn = 1 THEN
                                                d.price / 1.1 ELSE d.price 
                                            END * ( dg.qty_receipt - dg.qty_return ) 
                                        ) 
                                    ) 
                                ) * ( h.pph / 100 ) 
                                ) - (
                                (
                                    (
                                        ( 100- h.disc ) / 100 * (
                                        CASE
                                                
                                                WHEN h.inclusive_ppn = 1 THEN
                                                d.price / 1.1 ELSE d.price 
                                            END * ( ( dg.qty_receipt - dg.qty_return ) / 100 * h.dp ) 
                                        ) 
                                    ) 
                                ) * ( h.pph / 100 ) 
                            ) 
                        ) amount_pph,
                        (
                            SELECT
                                coa 
                            FROM
                                pihakketiga_coa 
                            WHERE
                                pihakketiga_tipe = 0 
                                AND company = h.company 
                                AND pihakketiga = h.supplier 
                                AND coa IS NOT NULL 
                                AND STATUS = 1 
                            )
                        AS coa_hutang_supplier,
                        (
                            SELECT
                                coa_accrued 
                            FROM
                                pihakketiga_coa 
                            WHERE
                                pihakketiga_tipe = 0 
                                AND company = h.company 
                                AND pihakketiga = h.supplier 
                                AND coa_accrued IS NOT NULL 
                                AND STATUS = 1 
                            )
                        AS coa_accrued,
                        i.note 
                    FROM
                        po h,
                        po_detail d,
                        gr hg,
                        gr_detail dg,
                        invoice i,
                        item it 
                    WHERE
                        h.id = d.header 
                        AND h.id = hg.po 
                        AND hg.id = dg.header 
                        AND dg.item = it.id 
                        AND hg.inv = i.id 
                        AND d.item = dg.item 
                        AND i.verified = 1 
                        AND i.tipe = 2 
                        AND i.company = ".$company."
                        AND YEAR(i.ref_tgl) = ".$year."
                        AND MONTH(i.ref_tgl) = ".$month."
                    GROUP BY
                        i.kode
                ");
        
                $R_AllInvSD = $DB->Row($Q_AllInvSD);
        
                if($R_AllInvSD > 0){
                    while($Data = $DB->Result($Q_AllInvSD)){
                        /**
                         * START : Posting Jurnal
                         */
                        $rate = 1;

                        if($Data['currency'] != "IDR"){
                            $R_Exchange_Ext = $DB->Row($DB->Query(
                                "parameter",
                                array(
                                    'param_val'
                                ),
                                "
                                    WHERE    
                                        id = 'exchange_execution'
                                        AND '" . $Data['ref_tgl'] . "' <= param_val
                                "
                            ));
            
                            if($R_Exchange_Ext > 0){
                                $exchange = $DB->Result($DB->Query(
                                    "exchange",
                                    array(
                                        'rate'
                                    ),
                                    "
                                        WHERE    
                                            tanggal <= '" . $Data['ref_tgl'] . "' 
                                            AND cur_kode = '" . $Data['currency'] . "'
                                        ORDER BY tanggal desc 
                                        LIMIT 1
                                    "
                                ));
            
                                $rate = $exchange['rate'];
                            }
                            else{
                                $DB->LogError("Exchange rate is not defined at " . $INV['ref_tgl'] . " for " . $Data['currency']);
                                exit();
                            }
                        }
                        
                        if($Data['coa_accrued'] > 0){
                            $Jurnal = App::JurnalPosting(array(
                                'trx_type'      => 6,
                                'tipe'          => 'debit',
                                'company'       => $Data['company'],
                                'source'        => $Data['inv_kode'],
                                'target'        => $Data['po_kode'],
                                'target_2'      => $Data['item'],
                                'currency'      => $Data['currency'],
                                'rate'          => $rate,
                                'coa'           => $Data['coa_accrued'],
                                'value'         => $Data['amount_accrued'],
                                'kode'          => $Data['inv_kode'],
                                'tanggal'       => $Data['ref_tgl'],
                                'keterangan'    => $Data['note']
                            ));
                            //=> / END : Insert to Jurnal Posting and Update Balance
                        }
        
                        if($Data['amount_uang_muka'] > 0){
                            $Jurnal = App::JurnalPosting(array(
                                'trx_type'      => 6,
                                'tipe'          => 'credit',
                                'company'       => $Data['company'],
                                'source'        => $Data['inv_kode'],
                                'target'        => $Data['po_kode'],
                                'target_2'      => $Data['item'],
                                'currency'      => $Data['currency'],
                                'rate'          => $rate,
                                'coa'           => $Data['coa_uang_muka'],
                                'value'         => $Data['amount_uang_muka'],
                                'kode'          => $Data['inv_kode'],
                                'tanggal'       => $Data['ref_tgl'],
                                'keterangan'    => $Data['note']
                            ));
                            //=> / END : Insert to Jurnal Posting and Update Balance
                        }
        
                        if($Data['amount_ppn'] > 0 && $Data['coa_ppn'] > 0){
                            $Jurnal = App::JurnalPosting(array(
                                'trx_type'      => 6,
                                'tipe'          => $Data['coa_pembukuan_ppn'],
                                'company'       => $Data['company'],
                                'source'        => $Data['inv_kode'],
                                'target'        => $Data['po_kode'],
                                'target_2'      => $Data['item'],
                                'currency'      => $Data['currency'],
                                'rate'          => $rate,
                                'coa'           => $Data['coa_ppn'],
                                'value'         => $Data['amount_ppn'],
                                'kode'          => $Data['inv_kode'],
                                'tanggal'       => $Data['ref_tgl'],
                                'keterangan'    => $Data['note']
                            ));
                            //=> / END : Insert to Jurnal Posting and Update Balance
                        }
        
                        if($Data['amount_pph'] != 0 && $Data['coa_pph'] > 0){
                            if($Data['coa_pembukuan_pph'] == 'debit'){
                                $amount_pph = -1 * $Data['amount_pph'];
                            }
                            else{
                                $amount_pph = $Data['amount_pph'];
                            }
                            $Jurnal = App::JurnalPosting(array(
                                'trx_type'      => 6,
                                'tipe'          => $Data['coa_pembukuan_pph'],
                                'company'       => $Data['company'],
                                'source'        => $Data['inv_kode'],
                                'target'        => $Data['po_kode'],
                                'target_2'      => $Data['item'],
                                'currency'      => $Data['currency'],
                                'rate'          => $rate,
                                'coa'           => $Data['coa_pph'],
                                'value'         => $amount_pph,
                                'kode'          => $Data['inv_kode'],
                                'tanggal'       => $Data['ref_tgl'],
                                'keterangan'    => $Data['note']
                            ));
                            //=> / END : Insert to Jurnal Posting and Update Balance
                        }
                        
                        if($Data['coa_hutang_supplier'] > 0){
                            if(($Data['amount_accrued'] + $Data['amount_ppn'] - $Data['amount_uang_muka'] - $Data['amount_pph']) != 0){
                                $Jurnal = App::JurnalPosting(array(
                                    'trx_type'      => 6,
                                    'tipe'          => 'credit',
                                    'company'       => $Data['company'],
                                    'source'        => $Data['inv_kode'],
                                    'target'        => $Data['supplier_kode'],
                                    'target_2'      => $Data['item'],
                                    'currency'      => $Data['currency'],
                                    'rate'          => $rate,
                                    'coa'           => $Data['coa_hutang_supplier'],
                                    'value'         => $Data['amount_accrued'] + $Data['amount_ppn'] - $Data['amount_uang_muka'] - $Data['amount_pph'],
                                    'kode'          => $Data['inv_kode'],
                                    'tanggal'       => $Data['ref_tgl'],
                                    'keterangan'    => $Data['note']
                                ));
                                //=> / END : Insert to Jurnal Posting and Update Balance
                            }
                        }
                        else{
                            $DB->LogError("Please define default activity/account for this supplier " . $Data['supplier_nama']);
                            exit();
                        }
                        //=> / END : Posting Jurnal
                    }
                }

                /**-------------------------------------------------------------------------------- */

                $Q_AllInvSB = $DB->QueryPort("
                    SELECT
                        h.kode po_kode,
                        i.kode inv_kode,
                        i.ref_tgl,
                        h.supplier_kode,
                        d.item,
                        h.currency,
                        h.company,
                        h.customs,
                        h.disc,
                        h.other_cost,
                        h.ppbkb,
                        h.dp,
                        ( SELECT sum( qty_po - qty_cancel ) FROM po_detail WHERE header = h.id ) tot_qty_po,
                        h.inclusive_ppn,
                        h.ppn,
                        d.price,
                        (d.qty_po - d.qty_cancel) AS qty_po,
                        id.qty_invoice,
                                            ( SELECT coa_accrued FROM item_grup_coa WHERE company = h.company AND item_grup_id = ( SELECT grup FROM item WHERE id = d.item ) ) coa_accrued,
                    CASE
                            
                            WHEN h.currency = 'IDR' THEN
                            ( SELECT coa FROM trx_coa_balance WHERE doc_nama = 'Purchase Invoice' AND seq = 2 AND company = h.company ) 
                        END coa_uang_muka,
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
                        (
                            (
                                (
                                    ( 100- h.disc ) / 100 * ( CASE WHEN h.inclusive_ppn = 1 THEN d.price / 1.1 ELSE d.price END * id.qty_invoice ) 
                                ) 
                            ) * ( h.pph / 100 ) 
                            ) - (
                            (
                                (
                                    ( 100- h.disc ) / 100 * (
                                    CASE
                                            
                                            WHEN h.inclusive_ppn = 1 THEN
                                            d.price / 1.1 ELSE d.price 
                                        END * ( id.qty_invoice / 100 * h.dp ) 
                                    ) 
                                ) 
                            ) * ( h.pph / 100 ) 
                        ) amount_pph,
                    CASE
                                
                            WHEN h.currency = 'IDR' THEN
                            ( SELECT coa FROM pihakketiga_coa WHERE pihakketiga_tipe = 0 AND company = h.company AND pihakketiga = h.supplier AND coa_accrued IS NOT NULL AND status = 1 ) 
                        END coa_hutang_supplier,
                        i.note 
                    FROM
                        po h,
                        po_detail d,
                        invoice i,
                        invoice_detail id 
                    WHERE
                                            h.id = d.header 
                        AND h.id = i.po 
                        AND i.id = id.header 
                        AND d.item = id.item
                        AND i.tipe = 3
                        AND i.verified = 1
                        AND i.company = ".$company."
                        AND YEAR(i.ref_tgl) = ".$year."
                        AND MONTH(i.ref_tgl) = ".$month."
                ");
        
                $R_AllInvSB = $DB->Row($Q_AllInvSB);
        
                if($R_AllInvSB > 0){
                    while($Data = $DB->Result($Q_AllInvSB)){
                        /**
                         * START : Posting Jurnal
                         */
                        
                        $amount_accrued = 0;
                        $amount_uang_muka = 0;
                        $amount_ppn = 0;
                        $amount_pph = 0;
        
                        if($Data['coa_accrued'] != 0){
                            $tot_oc = $Data['other_cost'] / $Data['tot_qty_po'] * $Data['qty_invoice'];
                            $tot_ppbkb = $Data['ppbkb'] / $Data['tot_qty_po'] * $Data['qty_invoice'];
                            
                            $price = $Data['price'];
                            if($Data['inclusive_ppn']){
                                $price = $Data['price'] / 1.1;
                            }
        
                            $amount_accrued = (($tot_oc + $tot_ppbkb) + ((100 - $Data['disc']) / 100 * ($price * $Data['qty_invoice'])));
        
                            $Jurnal = App::JurnalPosting(array(
                                'trx_type'      => 6,
                                'tipe'          => 'debit',
                                'company'       => $Data['company'],
                                'source'        => $Data['inv_kode'],
                                'target'        => $Data['po_kode'],
                                'target_2'      => $Data['item'],
                                'currency'      => $Data['currency'],
                                'rate'          => 1,
                                'coa'           => $Data['coa_accrued'],
                                'value'         => $amount_accrued,
                                'kode'          => $Data['inv_kode'],
                                'tanggal'       => $Data['ref_tgl'],
                                'keterangan'    => $Data['note']
                            ));
                            //=> / END : Insert to Jurnal Posting and Update Balance
                
                            $return['jurnalPosting'][$i] = $Jurnal['msg'];
                        }
        
                        if($Data['coa_uang_muka'] != 0){
                            $tot_oc = $Data['other_cost'] / $Data['tot_qty_po'] * $Data['qty_invoice'];
                            $tot_ppbkb = $Data['ppbkb'] / $Data['tot_qty_po'] * $Data['qty_invoice'];
                            
                            $price = $Data['price'];
                            if($Data['inclusive_ppn']){
                                $price = $Data['price'] / 1.1;
                            }
        
                            $amount_uang_muka = (($tot_oc + $tot_ppbkb) + ((100 - $Data['disc']) / 100 * ($price * $Data['qty_invoice']))) / 100 * $Data['dp'];
        
                            if($amount_uang_muka > 0){
                                $Jurnal = App::JurnalPosting(array(
                                    'trx_type'      => 6,
                                    'tipe'          => 'credit',
                                    'company'       => $Data['company'],
                                    'source'        => $Data['inv_kode'],
                                    'target'        => $Data['po_kode'],
                                    'target_2'      => $Data['item'],
                                    'currency'      => $Data['currency'],
                                    'rate'          => 1,
                                    'coa'           => $Data['coa_uang_muka'],
                                    'value'         => $amount_uang_muka,
                                    'kode'          => $Data['inv_kode'],
                                    'tanggal'       => $Data['ref_tgl']
                                ));
                                //=> / END : Insert to Jurnal Posting and Update Balance
                            }
                        }
        
                        if($Data['amount_ppn'] > 0 && $Data['coa_ppn'] != 0){
                            $amount_ppn = ($amount_accrued - $amount_uang_muka) * ($Data['ppn'] / 100);
        
                            $Jurnal = App::JurnalPosting(array(
                                'trx_type'      => 6,
                                'tipe'          => $Data['coa_pembukuan_ppn'],
                                'company'       => $Data['company'],
                                'source'        => $Data['inv_kode'],
                                'target'        => $Data['po_kode'],
                                'target_2'      => $Data['item'],
                                'currency'      => $Data['currency'],
                                'rate'          => 1,
                                'coa'           => $Data['coa_ppn'],
                                'value'         => $amount_ppn,
                                'kode'          => $Data['inv_kode'],
                                'tanggal'       => $Data['ref_tgl']
                            ));
                            //=> / END : Insert to Jurnal Posting and Update Balance
                        }
        
                        if($Data['amount_pph'] != 0 && $Data['coa_pph'] != 0){
                            $return['pembukuan_pph'] = $Data['coa_pembukuan_pph'];
                            if($Data['coa_pembukuan_pph'] == 'debit'){
                                $amount_pph = -1 * $Data['amount_pph'];
                            }
                            else{
                                $amount_pph = $Data['amount_pph'];
                            }
        
                            $Jurnal = App::JurnalPosting(array(
                                'trx_type'      => 6,
                                'tipe'          => $Data['coa_pembukuan_pph'],
                                'company'       => $Data['company'],
                                'source'        => $Data['inv_kode'],
                                'target'        => $Data['po_kode'],
                                'target_2'      => $Data['item'],
                                'currency'      => $Data['currency'],
                                'rate'          => 1,
                                'coa'           => $Data['coa_pph'],
                                'value'         => $amount_pph,
                                'kode'          => $Data['inv_kode'],
                                'tanggal'       => $Data['ref_tgl']
                            ));
                            //=> / END : Insert to Jurnal Posting and Update Balance
                        }
        
                        if($Data['coa_hutang_supplier'] != 0){
        
                            if($Data['coa_pembukuan_pph'] == 'debit'){
                                $amount_pph = -1 * $Data['amount_pph'];
                            }
                            else{
                                $amount_pph = $Data['amount_pph'];
                            }
        
                            $amount_hutang_supplier = $amount_accrued - $amount_uang_muka + $amount_ppn - $amount_pph;
        
                            $Jurnal = App::JurnalPosting(array(
                                'trx_type'      => 6,
                                'tipe'          => 'credit',
                                'company'       => $Data['company'],
                                'source'        => $Data['inv_kode'],
                                'target'        => $Data['supplier_kode'],
                                'target_2'      => $Data['item'],
                                'currency'      => $Data['currency'],
                                'rate'          => 1,
                                'coa'           => $Data['coa_hutang_supplier'],
                                'value'         => $amount_hutang_supplier,
                                'kode'          => $Data['inv_kode'],
                                'tanggal'       => $Data['ref_tgl']
                            ));
                            //=> / END : Insert to Jurnal Posting and Update Balance
                        }
                        else{
                            $DB->LogError("Please define default activity/account for this supplier " . $Data['supplier_nama']);
                            exit();
                        }
                        //=> / END : Posting Jurnal
                    }
                }
            }
        }
    
        /**
         * Trx ID = 7
         */
        function closingJV($company, $year, $month){
            // $DB = new DB;
            global $DB;

            if($DB->Delete(
                "journal",
                "company = ".$company." 
                AND YEAR ( tanggal ) = ".$year." 
                AND MONTH ( tanggal ) = ".$month."
                AND DOC_ID = 7"
            )){
                $Q_AllJV = $DB->QueryPort("
                    SELECT
                        x.kode,
                        x.tanggal,
                        y.coa,
                        y.debit,
                        y.credit,
                        y.keterangan
                    FROM
                        jv x,
                        jv_detail y
                    WHERE
                        x.id = y.header
                        AND x.verified = 1
                        AND x.company = ".$company." 
                        AND YEAR ( x.tanggal ) = ".$year." 
                        AND MONTH ( x.tanggal ) = ".$month." 
                    ORDER BY
                        x.tanggal,
                        x.kode,
                        y.credit
                ");
        
                $R_AllJV = $DB->Row($Q_AllJV);
        
                if($R_AllJV > 0){
                    while($JV = $DB->Result($Q_AllJV)){
                        /**
                         * START : Posting Jurnal
                         */

                        if($JV['credit'] == 0){
                            $Jurnal = App::JurnalPosting(array(
                                'trx_type'      => 7,
                                'tipe'          => 'debit',
                                'company'       => $company,
                                'source'        => $JV['kode'],
                                'target'        => $JV['kode'],
                                'currency'      => 'IDR',
                                'rate'          => 1,
                                'coa'           => $JV['coa'],
                                'value'         => $JV['debit'],
                                'kode'          => $JV['kode'],
                                'tanggal'       => $JV['tanggal'],
                                'keterangan'    => $JV['keterangan']
                            ));
                    
                            //=> / END : Insert to Jurnal Posting and Update Balance
                        }
                        else if($JV['debit'] == 0){
                            $Jurnal = App::JurnalPosting(array(
                                'trx_type'      => 7,
                                'tipe'          => 'credit',
                                'company'       => $company,
                                'source'        => $JV['kode'],
                                'target'        => $JV['kode'],
                                'currency'      => 'IDR',
                                'rate'          => 1,
                                'coa'           => $JV['coa'],
                                'value'         => $JV['credit'],
                                'kode'          => $JV['kode'],
                                'tanggal'       => $JV['tanggal'],
                                'keterangan'    => $JV['keterangan']
                            ));
                    
                            //=> / END : Insert to Jurnal Posting and Update Balance
                        }
                    }
                }
            }
        }
    
        /**
         * Trx ID = 8
         */
        function closingAsset($company, $year, $month){
            // $DB = new DB;
            global $DB;

            if($DB->Delete(
                "journal",
                "company = ".$company." 
                AND YEAR ( tanggal ) = ".$year." 
                AND MONTH ( tanggal ) = ".$month."
                AND DOC_ID = 8"
            )){
                $Q_AllAST = $DB->QueryPort("
                    SELECT
                        H.kode,
                        H.asset_type_nama,
                        H.acquisition_value,
                        D.id AS id_detail,
                        H.tanggal,
                        H.remarks,
                        D.coa_expenditures,
                        D.coa_kode_expenditures,
                        D.coa_nama_expenditures,
                        D.coa_asset,
                        D.coa_kode_asset,
                        D.coa_nama_asset 
                    FROM
                        ast_detail D,
                        ast H 
                    WHERE
                        H.id = D.header 
                        AND H.verified = 1
                        AND H.company = ".$company." 
                        AND YEAR ( H.tanggal ) = ".$year." 
                        AND MONTH ( H.tanggal ) = ".$month." 
                ");
        
                $R_AllAST = $DB->Row($Q_AllAST);
        
                if($R_AllAST > 0){
                    while($AST = $DB->Result($Q_AllAST)){
                        /**
                         * START : Posting Jurnal
                         */

                        $Jurnal = App::JurnalPosting(array(
                            'trx_type'      => 8,
                            'tipe'          => 'debit',
                            'company'       => $company,
                            'source'        => $AST['kode'],
                            'target'        => $AST['asset_type_nama'],
                            'currency'      => 'IDR',
                            'rate'          => 1,
                            'coa'           => $AST['coa_asset'],
                            'value'         => $AST['acquisition_value'],
                            'kode'          => $AST['kode'],
                            'tanggal'       => $AST['tanggal'],
                            'keterangan'    => $AST['remarks']
                        ));
                        //=> / END : Insert to Jurnal Posting and Update Balance
            
                        $Jurnal = App::JurnalPosting(array(
                            'trx_type'      => 8,
                            'tipe'          => 'credit',
                            'company'       => $company,
                            'source'        => $AST['kode'],
                            'target'        => $AST['asset_type_nama'],
                            'currency'      => 'IDR',
                            'rate'          => 1,
                            'coa'           => $AST['coa_expenditures'],
                            'value'         => $AST['acquisition_value'],
                            'kode'          => $AST['kode'],
                            'tanggal'       => $AST['tanggal'],
                            'keterangan'    => $AST['remarks']
                        ));
                        //=> / END : Insert to Jurnal Posting and Update Balance
                    }
                }
            }
        }

        public function closingDepreciation($company, $tgl){
            global $DB;

            $Q_Data = $DB->QueryPort("
                SELECT
                    DPC.id,
                    H.kode,
                    H.asset_type_nama,
                    DPC.`value`,
                    DPC.tanggal,
                    CONCAT(DPC.remarks, ' - ', H.remarks) AS remarks,
                    D.coa_depreciation,
                    D.coa_accumulated_depreciation,
                    H.cost_center
                FROM
                    ast H,
                    ast_detail D,
                    ast_depreciation DPC 
                WHERE
                    H.id = D.header
                    AND D.header = DPC.header 
                    AND H.verified = 1
                    AND DPC.tanggal = '" . $tgl . "' 
                    AND H.company = " . $company . "
            ");

            $R_Data = $DB->Row($Q_Data);

            if ($R_Data > 0) {
                $i = 0;
                while ($Data = $DB->Result($Q_Data)) {
                    $Jurnal = App::JurnalPosting(array(
                        'trx_type'      => 8,
                        'tipe'          => 'debit',
                        'company'       => $company,
                        'source'        => $Data['kode'],
                        'target'        => $Data['asset_type_nama'],
                        'cost_center'   => $Data['cost_center'],
                        'currency'      => 'IDR',
                        'rate'          => 1,
                        'coa'           => $Data['coa_depreciation'],
                        'value'         => $Data['value'],
                        'kode'          => $Data['kode'],
                        'tanggal'       => $Data['tanggal'],
                        'keterangan'    => $Data['remarks']
                    ));
                    //=> / END : Insert to Jurnal Posting and Update Balance

                    $Jurnal = App::JurnalPosting(array(
                        'trx_type'      => 8,
                        'tipe'          => 'credit',
                        'company'       => $company,
                        'source'        => $Data['kode'],
                        'target'        => $Data['asset_type_nama'],
                        'cost_center'   => $Data['cost_center'],
                        'currency'      => 'IDR',
                        'rate'          => 1,
                        'coa'           => $Data['coa_accumulated_depreciation'],
                        'value'         => $Data['value'],
                        'kode'          => $Data['kode'],
                        'tanggal'       => $Data['tanggal'],
                        'keterangan'    => $Data['remarks']
                    ));
                    //=> / END : Insert to Jurnal Posting and Update Balance

                    $return['jurnalPosting'][$i] = $Jurnal['msg'];

                    $Field = array(
                        'posting'               => 1,
                        'posting_by'            => Core::GetState('id'),
                        'posting_date'          => date("Y-m-d H:i:s")
                    );

                    $DB->Update(
                        "ast_depreciation",
                        $Field,
                        "
                            id = '" . $Data['id'] . "'
                        "
                    );
                    $i++;
                }
            }
        }
    
        /**
         * Trx ID = 11
         */
        function closingSP3($company, $year, $month){
            // $DB = new DB;
            global $DB;

            if($DB->Delete(
                "journal",
                "company = ".$company." 
                AND YEAR ( tanggal ) = ".$year." 
                AND MONTH ( tanggal ) = ".$month."
                AND DOC_ID = 11"
            )){
                $Q_AllSP3 = $DB->QueryPort("
                    SELECT
                        x.kode,
                        x.tanggal,
                        x.cost_center_kode,
                        x.currency,
                        y.coa,
                        y.debit,
                        y.credit,
                        x.keterangan
                    FROM
                        sp3 x,
                        sp3_jv_detail y
                    WHERE
                        x.id = y.header
                        AND x.approved = 1
                        AND x.company = ".$company." 
                        AND YEAR ( x.tanggal ) = ".$year." 
                        AND MONTH ( x.tanggal ) = ".$month." 
                    ORDER BY
                        x.tanggal,
                        x.kode,
                        y.credit
                ");
        
                $R_AllSP3 = $DB->Row($Q_AllSP3);
        
                if($R_AllSP3 > 0){
                    while($SP3 = $DB->Result($Q_AllSP3)){
                        /**
                         * START : Posting Jurnal
                         */

                        if($SP3['credit'] == 0){
                            $Jurnal = App::JurnalPosting(array(
                                'trx_type'      => 11,
                                'tipe'          => 'debit',
                                'company'       => $company,
                                'source'        => $SP3['kode'],
                                'target'        => $SP3['cost_center_kode'],
                                'currency'      => $SP3['currency'],
                                'rate'          => 1,
                                'coa'           => $SP3['coa'],
                                'value'         => $SP3['debit'],
                                'kode'          => $SP3['kode'],
                                'tanggal'       => $SP3['tanggal'],
                                'keterangan'    => $SP3['keterangan']
                            ));
                    
                            //=> / END : Insert to Jurnal Posting and Update Balance
                        }
                        else if($SP3['debit'] == 0){
                            $Jurnal = App::JurnalPosting(array(
                                'trx_type'      => 11,
                                'tipe'          => 'credit',
                                'company'       => $company,
                                'source'        => $SP3['kode'],
                                'target'        => $SP3['cost_center_kode'],
                                'currency'      => $SP3['currency'],
                                'rate'          => 1,
                                'coa'           => $SP3['coa'],
                                'value'         => $SP3['credit'],
                                'kode'          => $SP3['kode'],
                                'tanggal'       => $SP3['tanggal'],
                                'keterangan'    => $SP3['keterangan']
                            ));
                    
                            //=> / END : Insert to Jurnal Posting and Update Balance
                        }
                    }
                }
            }
        }
    
        /**
         * Trx ID = 13
         */
        function closingBP($company, $year, $month){
            // $DB = new DB;
            global $DB;

            if($DB->Delete(
                "journal",
                "company = ".$company." 
                AND YEAR ( tanggal ) = ".$year." 
                AND MONTH ( tanggal ) = ".$month."
                AND DOC_ID IN (13, 5)"
            )){
                $Q_AllBP = $DB->QueryPort("
                    SELECT
                        id,
                        kode,
                        company,
                        tanggal,
                        company_abbr,
                        company_nama,
                        company_bank,
                        bank,
                        bank_kode,
                        bank_nama,
                        bank_coa,
                        bank_coa_kode,
                        bank_coa_nama,
                        no_rekening,
                        currency,
                        reff_type,
                        supplier,
                        supplier_kode,
                        supplier_nama,
                        total,
                        approved,
                        status
                    FROM
                        bp
                    WHERE
                        approved = 1
                        AND company = ".$company." 
                        AND YEAR ( tanggal ) = ".$year." 
                        AND MONTH ( tanggal ) = ".$month."
                ");
        
                $R_AllBP = $DB->Row($Q_AllBP);
        
                if($R_AllBP > 0){
                    while($BP = $DB->Result($Q_AllBP)){
                        $Q_Detail = $DB->Query(
                            "bp_detail",
                            array(
                                'id',
                                'header',
                                'reff_id',
                                'reff_kode',
                                'coa',
                                'coa_kode',
                                'coa_nama',
                                'uraian',
                                'total'
                            ),
                            "
                                WHERE header = '" . $BP['id'] . "'    
                            "
                        );
                        $R_Detail = $DB->Row($Q_Detail);
                        if ($R_Detail > 0) {
                            $i = 0;
                            $Detail = [];
                            while ($Det = $DB->Result($Q_Detail)) {
                                $Detail[$i] = $Det;
                                $i++;
                            }
                        }

                        for($i = 0; $i < sizeof($Detail); $i++){
                            if($Detail[$i]['coa'] != 0){
                                if($BP['reff_type'] == 1){
                                    $Reff = $DB->Result($DB->Query(
                                        "invoice",
                                        array(
                                            'tipe',
                                            'is_payment'
                                        ),
                                        "
                                            WHERE
                                                id = '" . $Detail[$i]['reff_id'] . "'
                                        "
                                    ));
                    
                                    $DB->QueryPort("
                                        UPDATE invoice SET is_payment = 1 WHERE id = " . $Detail[$i]['reff_id'] . "
                                    ");
                    
                                    if($Reff['tipe'] == 1){
                                        /**
                                         * Get Data
                                         */
                                        $Q_Data = $DB->QueryPort("
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
                                        ( SELECT coa FROM pihakketiga_coa WHERE pihakketiga_tipe = 0 AND company = h.company AND pihakketiga = h.supplier AND coa_accrued IS NOT NULL AND status = 1 ) AS coa_hutang_supplier 
                                        FROM
                                            po h,
                                            po_detail d,
                                            invoice i,
                                            invoice_detail id 
                                        WHERE
                                            i.id = " . $Detail[$i]['reff_id'] . " 
                                            AND h.id = d.header 
                                            AND i.tipe = 1 
                                            AND h.id = i.po 
                                            AND i.id = id.header");
                                        $R_Data = $DB->Row($Q_Data);
                    
                                        if ($R_Data > 0) {
                                            $i = 0;
                                            while ($Data = $DB->Result($Q_Data)) {
                                                $amount_uang_muka = 0;
                                                $amount_ppn = 0;
                                                $amount_pph = 0;
                    
                                                $rate = 1;
                    
                                                if($Data['currency'] != "IDR"){
                                                    $R_Exchange_Ext = $DB->Row($DB->Query(
                                                        "parameter",
                                                        array(
                                                            'param_val'
                                                        ),
                                                        "
                                                            WHERE    
                                                                id = 'exchange_execution'
                                                                AND '" . $BP['tanggal'] . "' <= param_val
                                                        "
                                                    ));
                                            
                                                    if($R_Exchange_Ext > 0){
                                                        $exchange = $DB->Result($DB->Query(
                                                            'exchange',
                                                            array(
                                                                'rate'
                                                            ),
                                                            "
                                                                WHERE    
                                                                    tanggal <= '" . $BP['tanggal'] . "' 
                                                                    AND cur_kode = '" . $Data['currency'] . "'
                                                                ORDER BY tanggal desc 
                                                                LIMIT 1
                                                            "
                                                        ));
                                            
                                                        $rate = $exchange['rate'];
                                                    }
                                                }
                    
                                                if ($Data['coa_uang_muka'] > 0) {
                                                    $tot_oc = $Data['other_cost'] / $Data['tot_qty_po'] * $Data['qty_po'];
                                                    $tot_ppbkb = $Data['ppbkb'] / $Data['tot_qty_po'] * $Data['qty_po'];
                                                    $price = $Data['price'];
                                                    if ($Data['inclusive_ppn']) {
                                                        $price = $Data['price'] / 1.1;
                                                    }
                    
                                                    $amount_uang_muka = (($tot_oc + $tot_ppbkb) + ((100 - $Data['disc']) / 100 * ($price * $Data['qty_po']))) / 100 * $Data['dp_pct'];
                    
                                                    if ($amount_uang_muka != 0) {
                                                        $Jurnal = App::JurnalPosting(array(
                                                            'trx_type'      => 5,
                                                            'tipe'          => 'debit',
                                                            'company'       => $Data['company'],
                                                            'source'        => $Data['dp_inv_kode'],
                                                            'target'        => $Data['po_kode'],
                                                            'target_2'      => $Data['item'],
                                                            'currency'      => $Data['currency'],
                                                            'rate'          => $rate,
                                                            'coa'           => $Data['coa_uang_muka'],
                                                            'value'         => $amount_uang_muka,
                                                            'kode'          => $Data['dp_inv_kode'],
                                                            'tanggal'       => $BP['tanggal']
                                                        ));
                                                        //=> / END : Insert to Jurnal Posting and Update Balance
                                                    }
                                                }
                    
                                                if ($Data['coa_ppn'] > 0) {
                                                    if ($Data['customs'] == 1) {
                                                        $amount_ppn = 0;
                                                    } else {
                                                        $price = $Data['price'];
                                                        if ($Data['inclusive_ppn']) {
                                                            $price = $Data['price'] / 1.1;
                                                        }
                                                        $amount_ppn = (((100 - $Data['disc']) / 100 * ($price * $Data['qty_po'])) * ($Data['ppn'] / 100)) / 100 * $Data['dp_pct'];
                                                    }
                    
                                                    if ($amount_ppn > 0) {
                                                        $Jurnal = App::JurnalPosting(array(
                                                            'trx_type'      => 5,
                                                            'tipe'          => $Data['coa_pembukuan_ppn'],
                                                            'company'       => $Data['company'],
                                                            'source'        => $Data['dp_inv_kode'],
                                                            'target'        => $Data['po_kode'],
                                                            'target_2'      => $Data['item'],
                                                            'currency'      => $Data['currency'],
                                                            'rate'          => $rate,
                                                            'coa'           => $Data['coa_ppn'],
                                                            'value'         => $amount_ppn,
                                                            'kode'          => $Data['dp_inv_kode'],
                                                            'tanggal'       => $BP['tanggal']
                                                        ));
                                                    }
                                                    //=> / END : Insert to Jurnal Posting and Update Balance
                                                }
                    
                                                if ($Data['amount_pph'] != 0 && $Data['coa_pph'] > 0) {
                                                    $return['pembukuan_pph'] = $Data['coa_pembukuan_pph'];
                                                    if ($Data['coa_pembukuan_pph'] == 'debit') {
                                                        $amount_pph = -1 * $Data['amount_pph'];
                                                    } else {
                                                        $amount_pph = $Data['amount_pph'];
                                                    }
                                                    $Jurnal = App::JurnalPosting(array(
                                                        'trx_type'      => 5,
                                                        'tipe'          => $Data['coa_pembukuan_pph'],
                                                        'company'       => $Data['company'],
                                                        'source'        => $Data['dp_inv_kode'],
                                                        'target'        => $Data['po_kode'],
                                                        'target_2'      => $Data['item'],
                                                        'currency'      => $Data['currency'],
                                                        'rate'          => $rate,
                                                        'coa'           => $Data['coa_pph'],
                                                        'value'         => $amount_pph,
                                                        'kode'          => $Data['dp_inv_kode'],
                                                        'tanggal'       => $BP['tanggal']
                                                    ));
                                                    //=> / END : Insert to Jurnal Posting and Update Balance
                                                }
                    
                                                if ($Data['coa_hutang_supplier'] > 0) {
                                                    if ($amount_uang_muka + $amount_ppn - $Data['amount_pph'] != 0) {
                                                        $Jurnal = App::JurnalPosting(array(
                                                            'trx_type'      => 5,
                                                            'tipe'          => 'credit',
                                                            'company'       => $Data['company'],
                                                            'source'        => $Data['dp_inv_kode'],
                                                            'target'        => $Data['supplier_kode'],
                                                            'target_2'      => $Data['item'],
                                                            'currency'      => $Data['currency'],
                                                            'rate'          => $rate,
                                                            'coa'           => $Data['coa_hutang_supplier'],
                                                            'value'         => $amount_uang_muka + $amount_ppn - $Data['amount_pph'],
                                                            'kode'          => $Data['dp_inv_kode'],
                                                            'tanggal'       => $BP['tanggal']
                                                        ));
                                                        //=> / END : Insert to Jurnal Posting and Update Balance
                                                    }
                                                } else {
                                                    $DB->LogError("Please define default activity/account for this supplier " . $Data['supplier_nama']);
                                                    exit();
                                                }
                    
                                                $i++;
                                            }
                                        }
                                    }
                                }
                                else if($BP['reff_type'] == 2){
                                    $DB->QueryPort("
                                        UPDATE sp3 SET is_payment = 1 WHERE id = " . $Detail[$i]['reff_id'] . "
                                    "); 
                                }
                            }
                        }

                        $rate = 1;

                        if($BP['currency'] != "IDR"){
                            $R_Exchange_Ext = $DB->Row($DB->Query(
                                "parameter",
                                array(
                                    'param_val'
                                ),
                                "
                                    WHERE    
                                        id = 'exchange_execution'
                                        AND '" . $BP['tanggal'] . "' <= param_val
                                "
                            ));

                            if($R_Exchange_Ext > 0){
                                $exchange = $DB->Result($DB->Query(
                                    "exchange",
                                    array(
                                        'rate'
                                    ),
                                    "
                                        WHERE    
                                            tanggal <= '" . $BP['tanggal'] . "' 
                                            AND cur_kode = '" . $BP['currency'] . "'
                                        ORDER BY tanggal desc 
                                        LIMIT 1
                                    "
                                ));

                                $rate = $exchange['rate'];
                            }
                            else{
                                $DB->LogError("Exchange rate is not defined at " . $BP['tanggal'] . " for " . $BP['currency']);
                                exit();
                            }
                        }
                                           
                        for($i = 0; $i < sizeof($Detail); $i++){
                            if(!empty($Detail[$i]['id'])){
                                $Jurnal = App::JurnalPosting(array(
                                    'trx_type'      => 13,
                                    'tipe'          => 'debit',
                                    'company'       => $BP['company'],
                                    'source'        => $BP['kode'],
                                    'target'        => $Detail[$i]['reff_kode'],
                                    'currency'      => $BP['currency'],
                                    'rate'          => $rate,
                                    'coa'           => $Detail[$i]['coa'],
                                    'value'         => $Detail[$i]['total'],
                                    'kode'          => $BP['kode'],
                                    'tanggal'       => $BP['tanggal'],
                                    'keterangan'    => $Detail[$i]['uraian']
                                ));
                            }
                        }

                        $Jurnal = App::JurnalPosting(array(
                            'trx_type'      => 13,
                            'tipe'          => 'credit',
                            'company'       => $BP['company'],
                            'source'        => $BP['bank_kode'],
                            'target'        => $BP['kode'],
                            'currency'      => $BP['currency'],
                            'rate'          => $rate,
                            'coa'           => $BP['bank_coa'],
                            'value'         => $BP['total'],
                            'kode'          => $BP['kode'],
                            'tanggal'       => $BP['tanggal']
                        ));
                    }
                }
            }
        }
    
        /**
         * Trx ID = 14
         */
        function closingBR($company, $year, $month){
            // $DB = new DB;
            global $DB;

            if($DB->Delete(
                "journal",
                "company = ".$company." 
                AND YEAR ( tanggal ) = ".$year." 
                AND MONTH ( tanggal ) = ".$month."
                AND DOC_ID IN (14, 18)"
            )){
                $Q_AllBR = $DB->QueryPort("
                    SELECT
                        id,
                        kode,
                        company,
                        tanggal,
                        company_abbr,
                        company_nama,
                        company_bank,
                        bank,
                        bank_kode,
                        bank_nama,
                        bank_coa,
                        bank_coa_kode,
                        bank_coa_nama,
                        no_rekening,
                        currency,
                        reff_type,
                        customer,
                        customer_kode,
                        customer_nama,
                        total,
                        approved,
                        status
                    FROM
                        br
                    WHERE
                        approved = 1
                        AND company = ".$company." 
                        AND YEAR ( tanggal ) = ".$year." 
                        AND MONTH ( tanggal ) = ".$month."
                ");
        
                $R_AllBR = $DB->Row($Q_AllBR);
        
                if($R_AllBR > 0){
                    $trx_bal_kurs = $DB->Result($DB->Query(
                        "trx_coa_balance",
                        array(
                            'coa',
                            'coa_kode',
                            'coa_nama',
                            'seq'
                        ),
                        "
                            WHERE    
                                company = " . $company . "
                                AND doc_source = 'Bank'
                                AND doc_nama = 'Bank Receive'
                                AND seq = 70
                        "
                    ));

                    while($BR = $DB->Result($Q_AllBR)){
                        $Q_Detail = $DB->Query(
                            "br_detail",
                            array(
                                'id',
                                'header',
                                'reff_id',
                                'reff_kode',
                                'coa',
                                'coa_kode',
                                'coa_nama',
                                'uraian',
                                'total'
                            ),
                            "
                                WHERE header = '" . $BR['id'] . "'    
                            "
                        );
                        $R_Detail = $DB->Row($Q_Detail);
                        if ($R_Detail > 0) {
                            $i = 0;
                            $Detail = [];
                            while ($Det = $DB->Result($Q_Detail)) {
                                $Detail[$i] = $Det;
                                $i++;
                            }
                        }

                        for($i = 0; $i < sizeof($Detail); $i++){
                            if(!empty($Detail[$i]['id'])){
                                if($BR['reff_type'] == 1){
                                    $Reff = $DB->Result($DB->Query(
                                        "sales_invoice",
                                        array(
                                            'is_payment',
                                            'tipe'
                                        ),
                                        "
                                            WHERE
                                                id = '" . $Detail[$i]['reff_id'] . "'
                                        "
                                    ));
                    
                                    $DB->QueryPort("
                                        UPDATE sales_invoice SET is_payment = 1 WHERE id = " . $Detail[$i]['reff_id'] . "
                                    ");
                    
                                    if($Reff['tipe'] == 1){
                                        $Q_Data = $DB->QueryPort("
                                            SELECT
                                                I.id,
                                                I.sc,
                                                I.sc_kode,
                                                I.company,
                                                I.company_abbr,
                                                I.company_nama,
                                                I.cust,
                                                I.cust_kode,
                                                I.cust_nama,
                                                I.cust_abbr,
                                                I.inv_tgl,
                                                I.kode,
                                                I.currency,
                                                K.dp,
                                                K.ppn,
                                                K.inclusive_ppn,
                                                K.sold_price,
                                                K.grand_total,
                                                K.qty,
                                                K.item,
                                                K.item_kode,
                                                K.item_nama,
                                                K.item_satuan
                                            FROM
                                                sales_invoice AS I,
                                                kontrak AS K 
                                            WHERE
                                                I.id = '" . $Detail[$i]['reff_id'] . "' 
                                                AND I.sc = K.id
                                        ");
                                        $R_Data = $DB->Row($Q_Data);
                    
                                        if ($R_Data > 0) {
                    
                                            $Data = $DB->Result($Q_Data);
                                            if($Data['ppn']){
                                                $tax = $DB->Result($DB->Query(
                                                    "taxmaster",
                                                    array(
                                                        'pembukuan',
                                                        'coa',
                                                        'coa_kode',
                                                        'coa_nama'
                                                    ),
                                                    "
                                                        WHERE    
                                                            company = " . $Data['company'] . "
                                                            AND code = 'VAT-OUT'
                                                    "
                                                ));
                                            }
                    
                                            $trx_bal = $DB->Result($DB->Query(
                                                "trx_coa_balance",
                                                array(
                                                    'coa',
                                                    'coa_kode',
                                                    'coa_nama',
                                                    'seq'
                                                ),
                                                "
                                                    WHERE    
                                                        company = " . $Data['company'] . "
                                                        AND doc_source = 'Finance & Accounting'
                                                        AND doc_nama = 'Sales Inv. DP'
                                                        AND seq = 1
                                                "
                                            ));
                    
                                            $pihak_ketiga = $DB->Result($DB->Query(
                                                "pihakketiga_coa",
                                                array(
                                                    'coa',
                                                    'coa_accrued',
                                                ),
                                                "
                                                    WHERE    
                                                        company = " . $Data['company'] . "
                                                        AND pihakketiga_tipe = 2
                                                        AND pihakketiga = " . $Data['cust'] . "
                                                "
                                            ));
                    
                                            $accrued = 0;
                                            $ppn_amount = 0;
                                            $gt = 0;
                    
                                            if($Data['ppn'] == 10 && $Data['inclusive_ppn'] == 1){
                                                $accrued = (($Data['sold_price'] * $Data['qty']) / 1.1);
                                                $ppn_amount = ($Data['sold_price'] * $Data['qty']) - (($Data['sold_price'] * $Data['qty']) / 1.1);
                                                $gt = $accrued + $ppn_amount;
                                            }
                                            else if($Data['ppn'] == 10 && $Data['inclusive_ppn'] == 0){
                                                $accrued = $Data['sold_price'] * $Data['qty'];
                                                $ppn_amount = ($Data['sold_price'] * $Data['qty']) / 100 * 10;
                                                $gt = $accrued + $ppn_amount;
                                            }
                                            else{
                                                $accrued = $Data['sold_price'] * $Data['qty'];
                                                $gt = $accrued;
                                            }
                    
                                            $accrued = $accrued / 100 * $Data['dp'];
                                            $ppn_amount = $ppn_amount / 100 * $Data['dp'];
                                            $gt = $gt / 100 * $Data['dp'];
                                            
                                            $rate = 1;
                                            
                                            if($Data['currency'] != "IDR"){
                                                $R_Exchange_Ext = $DB->Row($DB->Query(
                                                    "parameter",
                                                    array(
                                                        'param_val'
                                                    ),
                                                    "
                                                        WHERE    
                                                            id = 'exchange_execution'
                                                            AND '" . $BR['tanggal'] . "' <= param_val
                                                    "
                                                ));
                    
                                                if($R_Exchange_Ext > 0){
                                                    $exchange = $DB->Result($DB->Query(
                                                        "exchange",
                                                        array(
                                                            'rate'
                                                        ),
                                                        "
                                                            WHERE    
                                                                tanggal <= '" . $BR['tanggal'] . "' 
                                                                AND cur_kode = '" . $Data['currency'] . "'
                                                            ORDER BY tanggal desc 
                                                            LIMIT 1
                                                        "
                                                    ));
                    
                                                    $rate = $exchange['rate'];
                                                }
                                                else{
                                                    $DB->LogError("Exchange rate is not defined at " . $BR['tanggal'] . " for " . $Data['currency']);
                                                    exit();
                                                }
                                            }
                                            
                                            if($trx_bal['coa'] && $pihak_ketiga['coa']){
                                                if($pihak_ketiga['coa'] && $gt > 0){
                                                    $Jurnal = App::JurnalPosting(array(
                                                        'trx_type'      => 18,
                                                        'tipe'          => 'debit',
                                                        'company'       => $Data['company'],
                                                        'source'        => $Data['kode'],
                                                        'target'        => $Data['cust_kode'],
                                                        'target_2'      => $Data['item'],
                                                        'currency'      => $Data['currency'],
                                                        'rate'          => $rate,
                                                        'coa'           => $pihak_ketiga['coa'],
                                                        'value'         => $gt,
                                                        'kode'          => $Data['kode'],
                                                        'tanggal'       => $BR['tanggal'],
                                                        'keterangan'    => "Inv Down Payment Contract No " . $Data['sc_kode'] . " a/n " . $Data['cust_nama']
                                                    ));
                                                }
                    
                                                if($Data['ppn'] == 10 && $ppn_amount > 0){
                                                    $Jurnal = App::JurnalPosting(array(
                                                        'trx_type'      => 18,
                                                        'tipe'          => 'credit',
                                                        'company'       => $Data['company'],
                                                        'source'        => $Data['kode'],
                                                        'target'        => 'Cost Book',
                                                        'target_2'      => $Data['item'],
                                                        'currency'      => $Data['currency'],
                                                        'rate'          => $rate,
                                                        'coa'           => $tax['coa'],
                                                        'value'         => $ppn_amount,
                                                        'kode'          => $Data['kode'],
                                                        'tanggal'       => $BR['tanggal'],
                                                        'keterangan'    => "VAT Out Contract No " . $Data['sc_kode']
                                                    ));
                                                }
                    
                                                if($accrued > 0){
                                                    $Jurnal = App::JurnalPosting(array(
                                                        'trx_type'      => 18,
                                                        'tipe'          => 'credit',
                                                        'company'       => $Data['company'],
                                                        'source'        => $Data['kode'],
                                                        'target'        => $Data['cust_kode'],
                                                        'target_2'      => $Data['item'],
                                                        'currency'      => $Data['currency'],
                                                        'rate'          => $rate,
                                                        'coa'           => $trx_bal['coa'],
                                                        'value'         => $accrued,
                                                        'kode'          => $Data['kode'],
                                                        'tanggal'       => $BR['tanggal'],
                                                        'keterangan'    => "Inv Down Payment Contract No " . $Data['sc_kode']
                                                    ));
                                                }
                                            }
                                            else{
                                                $DB->LogError("Account customer is not defined");
                                                exit();
                                            }
                                        }   
                                    }
                                }
                            }
                        }

                        $rate = 1;

                        if($BR['currency'] != "IDR"){
                            $R_Exchange_Ext = $DB->Row($DB->Query(
                                "parameter",
                                array(
                                    'param_val'
                                ),
                                "
                                    WHERE    
                                        id = 'exchange_execution'
                                        AND '" . $BR['tanggal'] . "' <= param_val
                                "
                            ));

                            if($R_Exchange_Ext > 0){
                                $exchange = $DB->Result($DB->Query(
                                    "exchange",
                                    array(
                                        'rate'
                                    ),
                                    "
                                        WHERE    
                                            tanggal <= '" . $BR['tanggal'] . "' 
                                            AND cur_kode = '" . $BR['currency'] . "'
                                        ORDER BY tanggal desc 
                                        LIMIT 1
                                    "
                                ));

                                $rate = $exchange['rate'];
                            }
                            else{
                                $DB->LogError("Exchange rate is not defined at " . $BR['tanggal'] . " for " . $BR['currency']);
                                exit();
                            }
                        }
                        

                        $Jurnal = App::JurnalPosting(array(
                            'trx_type'      => 14,
                            'tipe'          => 'debit',
                            'company'       => $BR['company'],
                            'source'        => $BR['bank_kode'],
                            'target'        => $BR['kode'],
                            'currency'      => $BR['currency'],
                            'rate'          => $rate,
                            'coa'           => $BR['bank_coa'],
                            'value'         => $BR['total'],
                            'kode'          => $BR['kode'],
                            'tanggal'       => $BR['tanggal']
                        ));

                        $lastRate = $rate;
                    
                        for($i = 0; $i < sizeof($Detail); $i++){
                            if(!empty($Detail[$i]['id'])){
                                if($BR['currency'] != 'IDR'){
                                    $CurRate = $DB->Result($DB->Query(
                                        "sales_invoice_exchange_history",
                                        array(
                                            'rate'
                                        ),
                                        "
                                            WHERE 
                                                header = '" . $Detail[$i]['reff_id'] . "'
                                            ORDER BY tanggal DESC
                                            LIMIT 1
                                        "
                                    ));

                                    if($CurRate){
                                        $rate = $CurRate['rate'];
                                    }
                                }
                                $Jurnal = App::JurnalPosting(array(
                                    'trx_type'      => 14,
                                    'tipe'          => 'credit',
                                    'company'       => $BR['company'],
                                    'source'        => $BR['bank_kode'],
                                    'target'        => $Detail[$i]['reff_kode'],
                                    'currency'      => $BR['currency'],
                                    'rate'          => $rate,
                                    'coa'           => $Detail[$i]['coa'],
                                    'value'         => $Detail[$i]['total'],
                                    'kode'          => $BR['kode'],
                                    'tanggal'       => $BR['tanggal'],
                                    'keterangan'    => $Detail[$i]['uraian']
                                ));

                                if($trx_bal_kurs && $BR['currency'] != 'IDR'){
                                    if((float)$rate > (float)$lastRate){
                                        $Jurnal = App::JurnalPosting(array(
                                            'trx_type'      => 14,
                                            'tipe'          => 'debit',
                                            'company'       => $BR['company'],
                                            'source'        => $BR['kode'],
                                            'target'        => 'Cost Book',
                                            'currency'      => 'IDR',
                                            'rate'          => 1,
                                            'coa'           => $trx_bal_kurs['coa'],
                                            'value'         => ($rate * $Detail[$i]['total']) - ($lastRate * $Detail[$i]['total']),
                                            'kode'          => $BR['kode'],
                                            'tanggal'       => $BR['tanggal'],
                                            'keterangan'    => "Selisih Kurs invoice no." . $Detail[$i]['reff_kode']
                                        ));
                                    }
                                    else if((float)$rate < (float)$lastRate){
                                        $Jurnal = App::JurnalPosting(array(
                                            'trx_type'      => 14,
                                            'tipe'          => 'credit',
                                            'company'       => $BR['company'],
                                            'source'        => $BR['kode'],
                                            'target'        => 'Cost Book',
                                            'currency'      => 'IDR',
                                            'rate'          => 1,
                                            'coa'           => $trx_bal_kurs['coa'],
                                            'value'         => ($lastRate * $Detail[$i]['total']) - ($rate * $Detail[$i]['total']),
                                            'kode'          => $BR['kode'],
                                            'tanggal'       => $BR['tanggal'],
                                            'keterangan'    => "Selisih Kurs invoice no." . $Detail[$i]['reff_kode']
                                        ));
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
?>