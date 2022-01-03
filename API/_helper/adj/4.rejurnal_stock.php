<?php

exit();

$Table = array(
    'stock' => 'stock',
    'sstock' => 'storeloc_stock',
    'process' => 'process_stock',
    'item' => 'item'
);

$company = 2;

$Q_Item = $DB->Query(
    $Table['item'],
    array(
        'id',
        'kode',
        'nama'
    ),
    "
        WHERE
            id IN (
                SELECT
                    item 
                FROM
                    stock
                WHERE
                    create_date LIKE '2019-08-%' AND 
                    company = '" . $company . "' AND
                    item != 2021 AND 
                    item IN (
                        SELECT
                            item
                        FROM
                            process_stock
                        WHERE
                            adj = 1 AND 
                            company = '" . $company . "'
                    )
            )
    "
);
$R_Item = $DB->Row($Q_Item);
if($R_Item > 0){
    ?>
    <table cellpadding="3" cellspacing="0" border="1">
        <thead>
            <tr>
                <th>No.</th>
                <th>ID Stock</th>
                <th>ID</th>
                <th>Kode Barang</th>
                <th>Nama</th>
                <th>STORELOC</th>
                <th>Tanggal</th>
                <th>Create</th>
                <th>Saldo Awal (B)</th>
                <th>Saldo Awal (ADJ)</th>
                <th>Debit (B)</th>
                <th>Credit (B)</th>
                <th>Saldo Akhir (B)</th>
                <th>Saldo Akhir (ADJ)</th>
            </tr>
        </thead>
        <tbody>
        <?php
        $no = 1;
        while($Item = $DB->Result($Q_Item)){

            /**
             * Loop Stock
             */
            $Q_Stock = $DB->Query(
                $Table['stock'],
                array(),
                "
                    WHERE
                        create_date LIKE '2019-08-%' AND 
                        item = '" . $Item['id'] . "' AND 
                        company = '" . $company . "'
                    ORDER BY
                        create_date ASC
                "
            );
            $R_Stock = $DB->Row($Q_Stock);

            $SaldoAwal = 0;
            $SaldoAkhir = 0;

            $Storeloc = '';

            if($R_Stock > 0){
                $i = 0;
                while($Stock = $DB->Result($Q_Stock)){

                    $Storeloc = $Stock['storeloc'];

                    if($SaldoAwal == 0 && $i == 0){
                        $GetStock = App::GetStockItem(array(
                            'company' => $Stock['company'],
                            'storeloc' => $Stock['storeloc'],
                            'item' => $Stock['item']
                        ));
                        $SaldoAwal = $GetStock['stock'];
                    }else{
                        $SaldoAwal = $SaldoAkhir;
                    }
                    
                    if($i == 0){
                        $SaldoAkhir = $SaldoAwal;
                    }

                    if($Stock['debit'] > 0){
                        $SaldoAkhir += $Stock['debit'];
                    }else{
                        $SaldoAkhir -= $Stock['credit'];
                    }
                    
                    ?>
                    <tr>
                        <td><?=$no?></td>
                        <td><?=$Stock['id']?></td>
                        <td><?=$Item['id']?></td>
                        <td><?=$Item['kode']?></td>
                        <td><small><?=$Item['nama']?></small></td>
                        <td><?=$Stock['storeloc']?> - <?=$Stock['storeloc_kode']?></td>
                        <td><?=$Stock['tanggal']?></td>
                        <td><small><?=$Stock['create_date']?></small></td>
                        <td align="right"><?=$Stock['saldo']?></td>
                        <td align="right"><?=$SaldoAwal?></td>
                        <td align="right"><?=$Stock['debit']?></td>
                        <td align="right"><?=$Stock['credit']?></td>
                        <td align="right"><?=$Stock['saldo_akhir']?></td>
                        <td align="right"><?=$SaldoAkhir?></td>
                    </tr>
                    <?php

                    /**
                     * Update Jurnal Stock
                     */
                    $DB->Update(
                        $Table['stock'],
                        array(
                            'saldo' => $SaldoAwal,
                            'saldo_akhir' => $SaldoAkhir
                        ),
                        "id = '" . $Stock['id'] . "'"
                    );
                    //=> / END : Update Jurnal Stock
        
                    $no++;
                    $i++;

                }
            }
            //=> / END : Loop Stock

            ?>
            <tr>
                <td colspan="11">Adjust Store Location [<?=$Storeloc?>] <?=$SaldoAkhir?></td>
            </tr>
            <?php
            /**
             * Update Storeloc Stock
             */
            $DB->Update(
                $Table['sstock'],
                array(
                    'stock' => $SaldoAkhir
                ),
                "
                    item = '" . $Item['id'] . "' AND 
                    storeloc = '" . $Storeloc . "'
                "
            );
            //=> / END : Update Storeloc Stock
        }
        ?>
        </tbody>
    </table>
    <?php
}
?>