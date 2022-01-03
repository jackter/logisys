<?php
exit();
$Table = array(
    'cbu'   => 'cbu_1908',
    'sbi'   => 'sbi_1908',
    'sstock' => 'storeloc_stock',
    'process' => 'process_stock',
    'def'   => 'cbu_1908'
);

$company = 2;

// $TableDef = $Table['def'];

$DefaultSBI = array(
    'storeloc' => 1,
    'storeloc_kode' => 'SBI-ST001'
);
$DefaultCBU = array(
    'storeloc' => 37,
    'storeloc_kode' => 'CBU-ST002'
);

$Default = $DefaultSBI;
$TableDef = $Table['sbi'];
if($company == 3){
    $Default = $DefaultCBU;
    $TableDef = $Table['cbu'];
}

$Q_FileStock = $DB->Query(
    $TableDef,
    array(),
    "
        WHERE
            id_item NOT IN (
                SELECT
                    item
                FROM
                    " . $Table['process'] . "
                WHERE
                    company = '" . $company . "'
            ) AND 
            id_item IS NOT NULL AND 
            qty > 0
    "
);
$R_FileStock = $DB->Row($Q_FileStock);
if($R_FileStock > 0){
    ?>
    <table cellpadding="3" cellspacing="0" border="1">
        <thead>
            <tr>
                <th>No.</th>
                <th>ID</th>
                <th>Kode Barang</th>
                <th>Nama</th>
                <th>Adj Stock</th>
            </tr>
        </thead>
        <tbody>
        <?php
        $no = 1;
        while($FileStock = $DB->Result($Q_FileStock)){

            /**
             * Insert to Storeloc
             */
            $FieldStoreloc = array(
                'company' => $company,
                'storeloc' => $Default['storeloc'],
                'storeloc_kode' => $Default['storeloc_kode'],
                'item' => $FileStock['id_item'],
                'stock' => $FileStock['qty'],
                'price' => 0
            );
            if($DB->Insert(
                $Table['sstock'],
                $FieldStoreloc
            )){

                /**
                 * Insert To Process
                 */
                $FieldProcess = array(
                    'id_stock' => $FileStock['id'],
                    'company' => $company,
                    'item' => $FileStock['id_item'],
                    'nama' => $FileStock['nama'],
                    'qty_before' => 0,
                    'qty' => $FileStock['qty'],
                    'keterangan' => 'NEW STOCK'
                );
                /**
                 * Insert Process
                 */
                $DB->Insert(
                    $Table['process'],
                    $FieldProcess
                );
                //=> / END : Insert Process
                //=> / END : Insert To Process

            }
            //=> / END : Insert to Storeloc

            ?>
            <tr>
                <td><?=$no?></td>
                <td><?=$FileStock['id_item']?></td>
                <td><?=$FileStock['kode_item']?></td>
                <td><?=$FileStock['nama']?></td>
                <td align="right"><?=$FileStock['qty']?></td>
            </tr>
            <?php
            $no++;
        }
        ?>
        </tbody>
    </table>
    <?php
}
?>