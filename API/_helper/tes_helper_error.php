<?php
set_time_limit(0);

$Table = 'item';
$Field = 'kode2';

$Q_Data = $DB->Query(
    $Table,
    array(),
    "
        WHERE
            $Field IS NULLs
    "
);
$R_Data = $DB->Row($Q_Data);
if($R_Data > 0){
    while($Data = $DB->Result($Q_Data)){

        /**
         * Create Code
         */
        // $Abbr = strtoupper(App::Abbr($Data['nama'], 4));
        // $CodeFirst = $Abbr;

        // $Len = 4;

        // $LastKode = $DB->Result($DB->Query(
        //     $Table,
        //     array($Field),
        //     "
        //         WHERE
        //             $Field LIKE '" . $CodeFirst . "%'
        //         ORDER BY
        //             SUBSTR($Field, -$Len) DESC
        //     "
        // ));
        // $LastKode = (int)substr($LastKode[$Field], -$Len) + 1;
        // $LastKode = str_pad($LastKode, $Len, 0, STR_PAD_LEFT);

        // $kode = $CodeFirst . $LastKode;
        // //=> / END : Create Code

        // /**
        //  * Update Kode
        //  */
        // if($DB->Update(
        //     $Table,
        //     array(
        //         $Field      => $kode
        //     ),
        //     "id = '" . $Data['id'] . "'"
        // )){
        //     echo $kode . "<br>";
        // }else{
        //     echo "Error " . $Data['id'];
        // }
        //=> / END : Update Kode

    }
}
?>