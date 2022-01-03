<?php
$Table = array(
    'temp' => 'coa_temp'
);

$Q_Temp = $DB->Query(
    $Table['temp'],
    array(),
    "
        WHERE
            company_abbr = 'CBU'
        ORDER BY id ASC
    "
);
$R_Temp = $DB->Row($Q_Temp);
if($R_Temp > 0){
    ?>
    <table cellpadding="5" cellspacing="0" border="1">
        <thead>
            <tr>
                <th>ID</th>
                <th>Company</th>
                <th>Company Abbr</th>
                <th>Company Nama</th>
                <!-- <th>H1</th>
                <th>H2</th>
                <th>H3</th>
                <th>H4</th>
                <th>H5</th>
                <th>D</th> -->
                <th>Lv1</th>
                <th>Lv2</th>
                <th>Lv3</th>
                <th>Lv4</th>
                <th>Lv5</th>
                <th>Kode</th>
                <th>Nama</th>
                <th>IS H</th>
                <th>Type</th>
            </tr>
        </thead>
        <?php
        $Lv1 = 0;
        $Lv2 = 0;
        $Lv3 = 0;
        $Lv4 = 0;
        $Lv5 = 0;
        while($Temp = $DB->Result($Q_Temp)){

            /**
             * Find Lv1
             */
            if($Temp['h1'] != 0){
                $Lv1 = $Temp['id'];
                $Lv2 = $Lv3 = $Lv4 = $Lv5 = 0;
            }
            //=> / END : Find Lv1

            /**
             * Find Lv2
             */
            if($Temp['h2'] != 0){
                $Lv2 = $Temp['id'];
                $Lv3 = $Lv4 = $Lv5 = 0;
            }
            //=> / END : Find Lv2

            /**
             * Find Lv3
             */
            if($Temp['h3'] != 0){
                $Lv3 = $Temp['id'];
                $Lv4 = $Lv5 = 0;
            }
            //=> / END : Find Lv3

            /**
             * Find Lv4
             */
            if($Temp['h4'] != 0){
                $Lv4 = $Temp['id'];
                $Lv5 = 0;
            }
            //=> / END : Find Lv4

            /**
             * Find Lv5
             */
            if($Temp['h5'] != 0){
                $Lv5 = $Temp['id'];
            }
            //=> / END : Find Lv5

            ?>
            <tr>
                <td><?=$Temp['id']?></td>
                <td>3</td>
                <td><?=$Temp['company_abbr']?></td>
                <td>PT Citra Borneo Utama</td>
                <!-- <td><?=$Temp['h1']?></td>
                <td><?=$Temp['h2']?></td>
                <td><?=$Temp['h3']?></td>
                <td><?=$Temp['h4']?></td>
                <td><?=$Temp['h5']?></td>
                <td><?=$Temp['d']?></td> -->
                <td><?=$Lv1?></td>
                <td><?=$Lv2?></td>
                <td><?=$Lv3?></td>
                <td><?=$Lv4?></td>
                <td><?=$Lv5?></td>
                <td><?=$Temp['kode']?></td>
                <td><?=$Temp['nama']?></td>
                <td><?=$Temp['is_h']?></td>
                <td><?=$Temp['keterangan']?></td>
            </tr>
            <?php
        }
        ?>
    </table>
    <?php
}
?>