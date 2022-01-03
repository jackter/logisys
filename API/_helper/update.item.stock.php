<?php
exit();
set_time_limit(0);

$Table = "item_cbu";

$Q_Data = $DB->Query(
    $Table,
    array(),
    "
        WHERE
            item IS NULL
    "
);
$R_Data = $DB->Row($Q_Data);
if($R_Data > 0){
    while($Data = $DB->Result($Q_Data)){  

        $kode_old = str_replace(".", "", $Data['kode']);
        $kode_old = str_replace(" ", "", $kode_old);

        echo $kode_old;

        /**
         * Item
         */
        $Q_Item = $DB->Query(
            "item",
            array(
                'id'
            ),
            "
                WHERE
                    TRIM(REPLACE(REPLACE(kode_old, '.', ''), ' ', '')) = '" . $kode_old . "'
            "
        );
        $R_Item = $DB->Row($Q_Item);
        if($R_Item > 0){
            $Item = $DB->Result($Q_Item);

            echo $Data['kode_old'];

            $DB->Update(
                $Table,
                array(
                    'item'  => $Item['id']
                ),
                "id = '" . $Data['id'] . "'"
            );
        }
        //=> / END :  Item

    }
}
?>