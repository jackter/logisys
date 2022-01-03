<?php

$Modid = 98;
Perm::Check($Modid, 'view');

#Default Statement
$return = [];
$RPL = "";
$SENT = Core::Extract($_POST, $RPL);

#Extract Array
if (isset($SENT)) {
    foreach ($SENT as $KEY => $VAL) {
        $$KEY = $VAL;
    }
}
$return['permissions'] = Perm::Extract($Modid);

$Table = array(
    'stock'       => 'stock'
);

$CLAUSE = $CLAUSE2 = "";

$CLAUSE .= "
    AND tanggal BETWEEN '" . $fdari . "' AND '" . $fhingga . "'
";

if(!empty($company)){
    $CLAUSE .= "
        AND company = $company
    ";
    $CLAUSE2 .= "
        AND S.company = $company
    ";
}
if(!empty($storeloc)){
    $CLAUSE .= "
        AND storeloc = $storeloc
    ";
    $CLAUSE2 .= "
        AND S.storeloc = $storeloc
    ";
}

$Check = $DB->Row($DB->Query(
    $Table['stock'],
    array(
        'id'
    ),
    "
        WHERE
            id != ''
            $CLAUSE
    "
));

if($Check > 0){
    
    $Q_Data = $DB->QueryPort("
    (
        SELECT
            item AS id,
            item_nama AS nama,
            item_kode AS kode,
            item_satuan AS satuan,
            SUM(saldo) AS saldo,
            SUM(saldo*price) AS saldo_amt,
            SUM(debit) AS debit,
            SUM(debit*price) AS debit_amt,
            SUM(credit) AS credit,
            SUM(credit*price) AS credit_amt,
            SUM(saldo_akhir) AS saldo_akhir,
            SUM(saldo_akhir*price) AS saldo_akhir_amt,
            1 AS is_stock
        FROM
            stock
        WHERE
            item != ''
            $CLAUSE
        GROUP BY
            item
    )
    UNION 
    (	
        SELECT
            I.id AS id,
            TRIM(I.nama) AS nama,
            I.kode AS kode,
            I.satuan AS satuan,
            SUM(S.stock) AS saldo,
            SUM(S.stock*S.price) AS saldo_amt,
            0 AS debit,
            0 AS debit_amt,
            0 AS credit, 
            0 AS credit_amt,
            SUM(S.stock) AS saldo_akhir,
            SUM(S.stock*S.price) AS saldo_akhir_amt,
            NULL AS is_stock
        FROM
            storeloc_stock AS S,
            item AS I
        WHERE 
            S.id != '' AND 
            S.item = I.id AND
            S.item NOT IN (
                SELECT
                    item
                FROM
                    stock
                WHERE
                    id != ''
                    $CLAUSE
                GROUP BY
                    item
            )
            $CLAUSE2
        GROUP BY
            S.item
    )
    ORDER BY 
        kode ASC
    ");
    $R_Data = $DB->Row($Q_Data);

    if($R_Data > 0){
        $no = 1;
        $i = 0;
        while($Data = $DB->Result($Q_Data)){

            $return['data'][$i] = $Data;
            $return['data'][$i]['no'] = $no;

            /**
             * Saldo Awal
             */
            if(!empty($Data['is_stock'])){
                $SaldoAwal = 0;
                $Q_SA = $DB->Query(
                    $Table['stock'],
                    array(
                        'saldo'
                    ),
                    "
                        WHERE
                            item = '" . $Data['id'] . "'
                            $CLAUSE
                        ORDER BY
                            create_date ASC
                    "
                );
                $R_SA = $DB->Row($Q_SA);
                if($R_SA > 0){
                    $SA = $DB->Result($Q_SA);
                    $SaldoAwal = $SA['saldo'];
                }
                $return['data'][$i]['saldo'] = $SaldoAwal;
            }
            //=> / END : Saldo Awal

            /**
             * Saldo Akhir
             */
            if(!empty($Data['is_stock'])){
                $SaldoAkhir = 0;
                $Q_SA = $DB->Query(
                    $Table['stock'],
                    array(
                        'SUM(saldo_akhir)'  => 'saldo_akhir'
                        // 'saldo_akhir'
                    ),
                    "
                        WHERE
                            id IN (
                                SELECT 
                                    MAX(id)
                                FROM 
                                    stock
                                WHERE
                                    item = '" . $Data['id'] . "'
                                    $CLAUSE
                                GROUP BY
                                    storeloc,
                                    item
                            )
                            $CLAUSE
                        ORDER BY
                            create_date DESC,
                            id DESC
                    "
                );
                $R_SA = $DB->Row($Q_SA);
                if($R_SA > 0){
                    $SA = $DB->Result($Q_SA);
                    $SaldoAkhir = $SA['saldo_akhir'];
                }
                $return['data'][$i]['saldo_akhir'] = $SaldoAkhir;
            }
            //=> / END : Saldo Akhir

            $no++;
            $i++;
        }

    }
}

echo Core::ReturnData($return);

?>