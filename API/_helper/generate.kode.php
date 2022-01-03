<?php
$Q_Data = $DB->Query(
    'item',
    array(),
    "
        WHERE
            kode IS NULL
    "
);
$R_Data = $DB->Row($Q_Data);
if($R_Data > 0){
    while($Data = $DB->Result($Q_Data)){

        /**
         * Grup
         */
        $Grup = $DB->Result($DB->Query(
            'item_grup',
            array(
                'kode'
            ),
            "
                WHERE
                    id = '" . $Data['grup'] . "'
            "
        ));
        //=> / END : Grup

        /**
         * Create Code
         */
        $InitialCode = strtoupper($Grup['kode']);
        $Abbr = strtoupper(App::Abbr($Data['nama'], 5));
        $CodeFirst = $InitialCode . "-" . $Abbr;

        $Len = 4;

        $LastKode = $DB->Result($DB->Query(
            'item',
            array('kode'),
            "
                WHERE
                    kode LIKE '" . $CodeFirst . "%'
                ORDER BY
                    SUBSTR(kode, -$Len) DESC
            "
        ));
        $LastKode = (int)substr($LastKode['kode'], -$Len) + 1;
        $LastKode = str_pad($LastKode, $Len, 0, STR_PAD_LEFT);

        $kode = $CodeFirst . $LastKode;
        //=> / END : Create Code

        /**
         * Update Kode
         */
        if($DB->Update(
            'item',
            array(
                'kode'      => $kode
            ),
            "id = '" . $Data['id'] . "'"
        )){
            echo $kode . "<br>";
        }else{
            echo "Error " . $Data['id'];
        }
        //=> / END : Update Kode

    }
}
?>