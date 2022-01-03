<?php
$Modid = 33;

Perm::Check($Modid, 'view');

//=> Default Statement
$return = [];
$RPL	= "";
$SENT	= Core::Extract($_POST, $RPL);

//=> Extract Array
if(isset($SENT)){
    foreach($SENT as $KEY => $VAL){	
        $$KEY = $VAL;
    }
}

$return['permissions'] = Perm::Extract($Modid);

$Table = array(
    'def'       => 'po',
    'detail'    => 'po_detail',
    'gr'        => 'gr',
    'gr_detail' => 'gr_detail',
    'item'      => 'item'
);

//=> Clean Data
if(empty($limit)){
    $limit = 10;
}
if(empty($offset)){
    $offset = 0;
}

/**
 * Filter
 */
$CLAUSE = "
    WHERE 
        submited = 1 AND
        is_close != 1
";
$PermCompany = Core::GetState('company');
if($PermCompany != "X"){
    $CLAUSE .= " AND company IN (" . $PermCompany . ")";
}

$PermDept = Core::GetState('dept');
if($PermDept != "X" && !empty($PermDept)){
    $CLAUSE .= " AND dept IN (" . $PermDept . ")";
}

$PermUsers = Core::GetState('users');
if($PermUsers != "X"){
    if(!empty($PermUsers)){
        $CLAUSE .= " AND create_by IN (" . $PermUsers . ")";
    }else{
        $CLAUSE .= " AND create_by = '" . Core::GetState('id') . "'";
    }
}
//=> / END : Filter

/**
 * Filter Table
 */
$ftable = json_decode($ftable, true);
if(isset($ftable)){
    foreach($ftable AS $Key => $Val){

        /**
         * Generate Clause
         */
        switch($Key){
            case "status_data":
                if(count($Val['values']) > 0){
                    for($i = 0; $i < count($Val['values']); $i++){
                        if($i == 0){
                            $CLAUSE .= "AND ( ";
                        }

                        switch($Val['values'][$i]){
                            case "WAITING GOODS RECEIVE":
                                if($i == 0){
                                    $CLAUSE .="submited = 1 AND finish != 1 AND id NOT IN (SELECT po FROM gr)";
                                }else{
                                    $CLAUSE .="OR submited = 1 AND finish != 1 AND id NOT IN (SELECT po FROM gr)";
                                }
                            break;
                            case "GOODS RECEIVE ON PROGRESS":
                                if($i == 0){
                                    $CLAUSE .="submited = 1 AND finish != 1 AND id IN (SELECT po FROM gr)";
                                }else{
                                    $CLAUSE .="OR submited = 1 AND finish != 1 AND id IN (SELECT po FROM gr)";
                                }
                            break;
                            case "FINISH":
                                if($i == 0){
                                    $CLAUSE .="submited = 1 AND finish = 1";
                                }else{
                                    $CLAUSE .="OR submited = 1 AND finish = 1";
                                }
                            break;
                        }
                        
                        if($i == count($Val['values'])-1){
                            $CLAUSE .= ")";
                        }
                    }
                }
            
                break;

            case "item_keyword":

                /**
                 * Search Item
                 */
                $Q_Item = $DB->Query(
                    $Table['item'],
                    array(
                        'id'
                    ),
                    "
                        WHERE
                            kode LIKE '%" . $Val['filter'] . "%' OR
                            nama LIKE '%" . $Val['filter'] . "%'
                        LIMIT 100
                    "
                );
                $R_Item = $DB->Row($Q_Item);
                if($R_Item > 0){
                    $AllItem = [];
                    while($Item = $DB->Result($Q_Item)){

                        $AllItem[] = $Item['id'];

                    }

                    /**
                     * Select GR Detail
                     * 
                     * where item id in AllItem
                     */
                    $Q_GR_Detail = $DB->Query(
                        $Table['def'] . "_detail",
                        array(
                            'header'
                        ),
                        "
                            WHERE
                                item IN (" . implode(",", $AllItem) . ")
                        "
                    );
                    $R_GR_Detail = $DB->Row($Q_GR_Detail);
                    if($R_GR_Detail > 0){
                        $AllGR = [];
                        while($GR_Detail = $DB->Result($Q_GR_Detail)){

                            if(!in_array($GR_Detail['header'], $AllGR)){
                                $AllGR[] = $GR_Detail['header'];
                            }
                        }

                        $CLAUSE .= "
                            AND 
                                id IN (" . implode(",", $AllGR) . ")
                        ";
                    }else{
                        $CLAUSE .= "
                            AND id = ''
                        ";
                    }
                    //=> END : Select GR Detail
                }else{
                    $CLAUSE .= "
                        AND id = ''
                    ";
                }
                //=> END : Search Item

                break;

            default:
                $CLAUSE .= "
                    AND 
                        $Key LIKE '%" . $Val['filter'] . "%'                    
                ";
        }
        //=> / END : Generate Clause
    }

    $return['clause'] = $CLAUSE;

}
//=> / END : Filter Table

/**
 * Listing Data
 */
$return['start']        = 0;
$return['limit']        = $limit;
$return['count']        = 0;

$Q_Data = $DB->Query(
    $Table['def'],
    array('id'),
    $CLAUSE
);
$R_Data = $DB->Row($Q_Data);

if($R_Data > 0){

    $return['start']        = $start;
    $return['limit']        = $limit;
    $return['count']        = $R_Data;

    $Q_Data = $DB->Query(
        $Table['def'],
        array(
            'id',
            'company_abbr',
            'dept_abbr',
            'tanggal',
            'delivery_plan',
            'kode',
            'pr',
            'pr_kode',
            'UPPER(supplier_nama)'  => 'supplier_nama',
            'submited',
            'create_date',
            'finish',
            'finish_date',
            'history'
        ),
        $CLAUSE . 
        "
            ORDER BY
                create_date DESC
            LIMIT 
                $offset, $limit
        "
    );

    $i = 0;
    while($Data = $DB->Result($Q_Data)){

        $return['data'][$i] = $Data;

        $return['data'][$i]['po_date'] = date('d/m/Y', strtotime($Data['create_date']));
        
        if($Data['tanggal'] != '0000-00-00'){
            $return['data'][$i]['tanggal'] = date('d/m/Y', strtotime($Data['tanggal']));
        }

        /**
         * Estimated Date
         */
        $Start = strtotime($Data['tanggal']) + 86400;
        $End = $Data['delivery_plan'] * 86400;
        $TanggalEstimated = date('Y-m-d', $Start + $End);
        $Estimated = din_hariEn(date("D", strtotime($TanggalEstimated))) . ", " . date('d/m/Y', strtotime($TanggalEstimated));
        $return['data'][$i]['estimated_date'] = $Estimated;
        //=> / END : Estimated Date

        /**
         * Countdown
         */
        $Countdown = timebydate(date("Y-m-d"), $TanggalEstimated);
        $RCountdown = 0;
        if($Countdown['bulan'] > 0){
            $RCountdown = $Countdown['bulan'] . " months, ";
        }
        if($Countdown['hari'] > 0){
            if($RCountdown == 0){
                $RCountdown = "";
            }
            $RCountdown .= $Countdown['hari'] . " days";
        }

        if($Data['finish'] == 1){
            /*$Countdown = timebydate($Data['tanggal'], date('Y-m-d', strtotime($Data['finish_date'])));

            $RCountdown = 0;
            if($Countdown['bulan'] > 0){
                $RCountdown = $Countdown['bulan'] . " months, ";
            }
            if($Countdown['hari'] > 0){
                if($RCountdown == 0){
                    $RCountdown = "";
                }
                $RCountdown .= $Countdown['hari'] . " days";
            }

            $RCountdown = "Finished on " . $RCountdown;
            if($Countdown['hari'] <= 0){
                $RCountdown = "Finished on same day";
            }*/

            $RCountdown = "Finished " . date("d/m/Y", strtotime($Data['finish_date']));
        }

        $return['data'][$i]['countdown'] = $RCountdown;
        //=> / END : Countdown

        /**
         * Finish Percent
         */
        $AllPO = $DB->Result($DB->QueryPort("
            SELECT
                SUM(D.qty_po - D.qty_cancel) AS po
            FROM
                po AS H,
                po_detail AS D
            WHERE
                H.id = '" . $Data['id'] . "' AND 
                D.header = H.id
        "));
        $AllPO = $AllPO['po'];
         
        $Q_GR = $DB->Query(
            $Table['gr'],
            array(
                'id'
            ),
            "
                WHERE
                    po = '" . $Data['id'] . "'
            "
        );
        $R_GR = $DB->Row($Q_GR);
        $AllGR = 0;
        if($R_GR > 0){
            while($GR = $DB->Result($Q_GR)){

                $DGR = $DB->Result($DB->QueryPort("
                    SELECT
                        SUM(D.qty_receipt - D.qty_return) AS gr
                    FROM
                        gr AS H,
                        gr_detail AS D
                    WHERE
                        H.id = '" . $GR['id'] . "' AND 
                        D.header = H.id
                "));
                $AllGR += $DGR['gr'];
            }
        }

        $FinishPercent = 0;

        if($AllGR > 0){
            $FinishPercent = ($AllGR / $AllPO) * 100;
        }
        $return['data'][$i]['finish_percent'] = $FinishPercent;
        //=> / END : Finish Percent

        /**
         * Last History
         */
        $History = json_decode($Data['history'], true);
        $History = $History[0];
        $FormatHistory = $History['description'] . " - " . datetime_db_en($History['time']);

        $User = Core::GetUser("nama", $History['user']);
        if(!empty($User)){
            $FormatHistory .= " - By " . $User;
        }

        $return['data'][$i]['history'] = $FormatHistory;
        //=> / END : Last History

        $i++;
    }

}
//=> / END : Listing Data

echo Core::ReturnData($return);
?>