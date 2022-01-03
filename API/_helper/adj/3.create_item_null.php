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

$TableDef = $Table['sbi'];
if($company == 3){
    $TableDef = $Table['cbu'];
}

$Q_FileStock = $DB->Query(
    $TableDef,
    array(),
    "
        WHERE
        (
            id_item NOT IN (
                SELECT
                    item
                FROM
                    " . $Table['process'] . "
                WHERE
                    company = '" . $company . "'
            ) OR 
            id_item IS NULL
        ) AND 
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
                <th>Kode Barang</th>
                <th>Nama</th>
                <th>Qty</th>
            </tr>
        </thead>
        <tbody>

        <?php
        $no = 1;
        while($FileStock = $DB->Result($Q_FileStock)){
            ?>
            <tr>
                <td><?=$no?></td>
                <td><?=$FileStock['kode']?></td>
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