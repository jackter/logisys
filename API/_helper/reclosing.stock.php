<?php
    $company = strip_tags($_GET['company']);
    $year = strip_tags($_GET['year']);
    $month = strip_tags($_GET['month']);

    if((isset($company) && !empty($company)) && (isset($year) && !empty($year)) && (isset($month) && !empty($month))){
        $Q_AllStock = $DB->QueryPort("
            SELECT
                *
            FROM
                stock_ref x
            WHERE
                x.company = ".$company." 
                AND YEAR ( x.tanggal ) = ".$year."
                AND MONTH ( x.tanggal ) = ".$month." 
            ORDER BY
                x.id ASC
        ");

        $R_AllStock = $DB->Row($Q_AllStock);
        
        if($R_AllStock > 0){
            while($Stock = $DB->Result($Q_AllStock)){
                $cur_price = App::GetStockItem(array(
                    'company'   => $company,
                    'storeloc'  => $Stock['storeloc'],
                    'item'      => $Stock['item']
                ));

                // $Field = array(
                //     'ref_kode'      => $Stock['ref_kode'],
                //     'company'       => $Stock['company'],
                //     'company_abbr'  => $Stock['company_abbr'],
                //     'company_nama'  => $Stock['company_nama'],
                //     'dept'          => $Stock['dept'],
                //     'dept_abbr'     => $Stock['dept_abbr'],
                //     'dept_nama'     => $Stock['dept_nama'],
                //     'item'          => $Stock['item'],
                //     'item_kode'     => $Stock['item_kode'],
                //     'item_nama'     => $Stock['item_nama'],
                //     'item_satuan'   => $Stock['item_satuan'],
                //     'item_grup'     => $Stock['item_grup'],
                //     'saldo'         => $Stock['saldo'],
                //     'debit'         => $Stock['debit'],
                //     'credit'        => $Stock['credit'],
                //     'saldo_akhir'   => $Stock['saldo_akhir'],
                //     'price'         => $cur_price['price'],
                //     'adj'           => $Stock['adj'],
                //     'adj_qty'       => $Stock['adj_qty'],
                //     'storeloc'      => $Stock['storeloc'],
                //     'storeloc_kode' => $Stock['storeloc_kode'],
                //     'storeloc_nama' => $Stock['storeloc_nama'],
                //     'tanggal'       => $Stock['tanggal'],
                //     'create_by'     => $Stock['create_by'],
                //     'create_date'   => $Stock['create_date'],
                //     'keterangan'    => $Stock['keterangan']
                // );

                $type = 'debit';
                $qty = $Stock['debit'];
                $price = $Stock['price'];
                if($Stock['debit'] == 0){
                    $type = 'credit';
                    $qty = $Stock['credit'];
                    $price = $cur_price['price'];
                }

                App::JurnalStock(array(
                    'tipe'          => $type,
                    'company'       => $company,
                    'dept'          => $Stock['dept'],
                    'storeloc'      => $Stock['storeloc'],
                    'item'          => $Stock['item'],
                    'qty'           => $qty,
                    'price'         => $price,
                    'keterangan'    => $Stock['keterangan'],
                    'kode'          => $Stock['ref_kode'],
                    'tanggal'       => $Stock['tanggal'],
                ));
            }

            echo "Finish";
        }
    }
    else{
        echo "Please specify parameter company, year & month for target.";
    }
?>