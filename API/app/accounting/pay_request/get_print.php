<?php
$Modid = 63;

Perm::Check($Modid, 'view');

//=> Default Statement
$return = [];
$RPL    = "";
$SENT    = Core::Extract($_POST, $RPL);

//=> Extract Array
if (isset($SENT)) {
    foreach ($SENT as $KEY => $VAL) {
        $$KEY = $VAL;
    }
}

/*Check Special Logo for Print*/
$ShowLogo = array(
    'CKA',
    'AMJ',
    'ENM',
    'MP',
    'IJI',
);

$Table = array(
    'def'       => 'sp3',
    'detail'    => 'sp3_detail',
    'inv'       => 'invoice'
);

/**
 * Get Data
 */
$Q_Data = $DB->Query(
    $Table['def'],
    array(
        'id',
        'company',
        'company_abbr',
        'company_nama',
        'cost_center',
        'cost_center_kode',
        'cost_center_nama',
        'currency',
        'grup',
        'grup_nama',
        'keterangan_bayar',
        'kode',
        'penerima',
        'penerima_nama',
        'po_no',
        'po_tgl',
        'tanggal',
        'total',
        'is_manual'
    ),
    "
        WHERE id = '" . $id . "'
    "
);
$R_Data = $DB->Row($Q_Data);
if ($R_Data > 0) {

    $Data = $DB->Result($Q_Data);

    if(in_array($Data['company_abbr'], $ShowLogo)){
        $Data['show_logo'] = 1;
    }

    $return['data'] = $Data;

    if ($Data['is_manual'] == 0) {
        $i = 0;

        $Q_Jurnal = $DB->QueryPort("
            SELECT
                coa_kode,
                coa_nama,
                debit, 
                credit
            FROM
                journal 
            WHERE
                ref_kode IN ( SELECT kode FROM invoice WHERE sp3 = $id )
                AND credit = 0
            GROUP BY
                coa_kode,
                coa_nama
            ORDER BY coa_kode
        ");
        $R_Jurnal = $DB->Row($Q_Jurnal);
        if ($R_Jurnal > 0) {
            while ($Jurnal = $DB->Result($Q_Jurnal)) {

                $return['data']['jurnal'][$i] = $Jurnal;

                $TypeJurnal = 'K';
                if ($Jurnal['debit'] != 0) {
                    $TypeJurnal = 'D';
                }

                $return['data']['jurnal'][$i]['tipe'] = $TypeJurnal;

                $i++;
            }
        }

        $Q_Jurnal = $DB->QueryPort("
            SELECT
                coa_kode,
                coa_nama,
                debit, 
                credit
            FROM
                journal 
            WHERE
                ref_kode IN ( SELECT kode FROM invoice WHERE sp3 = $id )
                AND debit = 0
            GROUP BY
                coa_kode,
                coa_nama
            ORDER BY coa_kode
        ");
        $R_Jurnal = $DB->Row($Q_Jurnal);
        if ($R_Jurnal > 0) {
            while ($Jurnal = $DB->Result($Q_Jurnal)) {

                $return['data']['jurnal'][$i] = $Jurnal;

                $TypeJurnal = 'K';
                if ($Jurnal['debit'] != 0) {
                    $TypeJurnal = 'D';
                }

                $return['data']['jurnal'][$i]['tipe'] = $TypeJurnal;

                $i++;
            }
        }
    } else if ($Data['is_manual'] == 1) {
        $i = 0;

        $Q_Jurnal = $DB->QueryPort("
            SELECT
                coa_kode,
                coa_nama,
                debit, 
                credit
            FROM
                sp3_jv_detail 
            WHERE
                header = $id 
                AND credit = 0
            GROUP BY
                coa_kode,
                coa_nama
            ORDER BY coa_kode
        ");
        $R_Jurnal = $DB->Row($Q_Jurnal);
        if ($R_Jurnal > 0) {
            while ($Jurnal = $DB->Result($Q_Jurnal)) {

                $return['data']['jurnal'][$i] = $Jurnal;

                $TypeJurnal = 'K';
                if ($Jurnal['debit'] != 0) {
                    $TypeJurnal = 'D';
                }

                $return['data']['jurnal'][$i]['tipe'] = $TypeJurnal;

                $i++;
            }
        }

        $Q_Jurnal = $DB->QueryPort("
            SELECT
                coa_kode,
                coa_nama,
                debit, 
                credit
            FROM
                sp3_jv_detail 
            WHERE
                header = $id 
                AND debit = 0
            GROUP BY
                coa_kode,
                coa_nama
            ORDER BY coa_kode
        ");
        $R_Jurnal = $DB->Row($Q_Jurnal);
        if ($R_Jurnal > 0) {
            while ($Jurnal = $DB->Result($Q_Jurnal)) {

                $return['data']['jurnal'][$i] = $Jurnal;

                $TypeJurnal = 'K';
                if ($Jurnal['debit'] != 0) {
                    $TypeJurnal = 'D';
                }

                $return['data']['jurnal'][$i]['tipe'] = $TypeJurnal;

                $i++;
            }
        }
    }

    if(empty($return['data']['jurnal'])){
        $InvType = $DB->Result($DB->Query(
            "invoice",
            array(
                'tipe'
            ),
            "
                WHERE
                    sp3 = $id
            "
        ));

        if($InvType){
            if($InvType['tipe'] == 1){
                $jurnal_pihak_ketiga = $DB->Result($DB->Query(
                    "pihakketiga_coa",
                    array(
                        'coa',
                        'coa_kode',
                        'coa_nama'
                    ),
                    "
                        WHERE    
                            company = (SELECT company FROM invoice WHERE sp3 = $id)
                            AND pihakketiga_tipe = (SELECT 1 FROM invoice WHERE sp3 = $id)
                            AND pihakketiga = (SELECT supplier FROM invoice WHERE sp3 = $id)
                    "
                ));
            }
            else{
                $jurnal_pihak_ketiga = $DB->Result($DB->Query(
                    "pihakketiga_coa",
                    array(
                        'coa',
                        'coa_kode',
                        'coa_nama'
                    ),
                    "
                        WHERE    
                            company = (SELECT company FROM invoice WHERE sp3 = $id)
                            AND pihakketiga_tipe = (SELECT tipe_pihak_ketiga FROM invoice WHERE sp3 = $id)
                            AND pihakketiga = (SELECT pihak_ketiga FROM invoice WHERE sp3 = $id)
                    "
                ));
            }

            if($jurnal_pihak_ketiga){
                $return['data']['jurnal'][0] = $jurnal_pihak_ketiga;
            }
        }
    }

    /**
     * get company & group
     */
    $Q_Inv = $DB->Query(
        $Table['inv'],
        array(
            'kode',
            'ref_kode'
        ),
        "
        WHERE 
            sp3 = '" . $Data['id'] . "'
        "
    );
    $R_Inv = $DB->Row($Q_Inv);
    if ($R_Inv > 0) {
        $i = 0;
        while ($Inv = $DB->Result($Q_Inv)) {

            $return['data']['inv_ref'][$i] = $Inv;

            $i++;
        }
    }

    /**
     * get company & group
     */
    $Q_Company = $DB->QueryOn(
        DB['master'],
        "company",
        array(
            'logo',
            'business_unit'
        ),
        "
        WHERE 
            id = '" . $Data['company'] . "'
        "
    );
    $R_Company = $DB->Row($Q_Company);
    if ($R_Company > 0) {
        $Company = $DB->Result($Q_Company);

        $return['data']['company_logo'] = $Company['logo'];
        $return['data']['business_unit'] = $Company['business_unit'];
    }

    /**
     * get detail
     */
    $Q_Detail = $DB->Query(
        $Table['detail'],
        array(),
        "
            WHERE
                header = '" . $id . "'
        "
    );
    $R_Detail = $DB->Row($Q_Detail);
    if ($R_Detail > 0) {

        $i = 0;
        while ($Detail = $DB->Result($Q_Detail)) {

            $return['data']['list'][$i] = $Detail;

            $i++;
        }
        // => end get detail

    }
}

echo Core::ReturnData($return);
