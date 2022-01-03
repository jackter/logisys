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

$Q_Storeloc = $DB->Query(
    $Table['sstock'],
    array(
        'id',
        'item',
        'storeloc_kode' => 'kode',
        'stock'
    ),
    "
        WHERE
            company = '" . $company . "' AND 
            item != 2021 AND 
            item NOT IN (
                SELECT
                    item
                FROM
                    " . $Table['process'] . "
                WHERE
                    company = '" . $company . "'
            )
    "
);
$R_Storeloc = $DB->Row($Q_Storeloc);

$PROCESS = [];

if($R_Storeloc > 0){
    ?>
    <table cellpadding="3" cellspacing="0" border="1">
        <thead>
            <tr>
                <th>No.</th>
                <th>ID</th>
                <th>Storeloc</th>
                <th>Kode Barang</th>
                <th>Nama</th>
                <th>Storeloc Stock</th>
                <th>Adj Stock</th>
            </tr>
        </thead>
        <tbody>
        <?php
        $no = 1;
        while($Storeloc = $DB->Result($Q_Storeloc)){

            /**
             * Select FileStock
             */
            $Q_FileStock = $DB->Query(
                $TableDef,
                array(
                    'id',
                    'id_item' => 'item',
                    'kode_item' => 'kode',
                    'nama',
                    'qty'
                ),
                "
                    WHERE
                        id_item = '" . $Storeloc['item'] . "'
                "
            );
            $R_FileStock = $DB->Row($Q_FileStock);

            if($R_FileStock > 0){
                while($FileStock = $DB->Result($Q_FileStock)){

                    $NamaItem = $FileStock['nama'];
                    $KodeItem = $FileStock['kode'];
                    $Qty = $FileStock['qty'];
                    $ID = $FileStock['item'];

                    if($Qty != $Storeloc['stock']){

                        ?>
                        <tr>
                            <td><?=$no?></td>
                            <td><?=$ID?></td>
                            <td><?=$Storeloc['kode']?></td>
                            <td><?=$KodeItem?></td>
                            <td><?=$NamaItem?></td>
                            <td align="right"><?=$Storeloc['stock']?></td>
                            <td align="right"><?=$Qty?></td>
                        </tr>
                        <?php
                        $no++;

                        /**
                         * Update Storeloc Stock
                         */
                        if($DB->Update(
                            $Table['sstock'],
                            array(
                                'stock' => $FileStock['qty']
                            ),
                            "id = '" . $Storeloc['id'] . "'"
                        )){

                            $FieldProcess = array(
                                'id_stock' => $FileStock['id'],
                                'company' => $company,
                                'item' => $FileStock['item'],
                                'nama' => $FileStock['nama'],
                                'qty_before' => $Storeloc['stock'],
                                'qty' => $FileStock['qty'],
                                'adj' => 1,
                                'keterangan' => 'Adjustment'
                            );
                            $PROCESS[] = $FieldProcess;

                            /**
                             * Insert Process
                             */
                            $DB->Insert(
                                $Table['process'],
                                $FieldProcess
                            );
                            //=> / END : Insert Process

                        }
                        //=> / END : Update Storeloc Stock

                    }else{

                        $FieldProcess = array(
                            'id_stock' => $FileStock['id'],
                            'company' => $company,
                            'item' => $FileStock['item'],
                            'nama' => $FileStock['nama'],
                            'qty_before' => $Storeloc['stock'],
                            'qty' => $FileStock['qty'],
                            'keterangan' => 'SKIP'
                        );
                        $PROCESS[] = $FieldProcess;

                        /**
                         * Insert Process
                         */
                        $DB->Insert(
                            $Table['process'],
                            $FieldProcess
                        );
                        //=> / END : Insert Process

                    }

                }
            }
            //=> / END : Select FileStock

        }
        ?>
        </tbody>
    </table>
    <?php
}
// print_r($PROCESS);
?>