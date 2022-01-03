<?php
$Modid = 32;

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
        id != ''
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
                            case "DRAFT":
                                if($i == 0){
                                    $CLAUSE .="IFNULL(submited, 0) != 1 AND is_void != 1 AND is_close != 1 ";
                                }else{
                                    $CLAUSE .="OR IFNULL(submited, 0) != 1 AND is_void != 1 AND is_close != 1 ";
                                }
                            break;
                            case "WAITING GOODS RECEIPT":
                                if($i == 0){
                                    $CLAUSE .="submited = 1 AND finish != 1 ";
                                }else{
                                    $CLAUSE .="OR submited = 1 AND finish != 1 ";
                                }
                            break;
                            case "FINISH":
                                if($i == 0){
                                    $CLAUSE .="submited = 1 AND finish = 1 ";
                                }else{
                                    $CLAUSE .="OR submited = 1 AND finish = 1 ";
                                }
                            break;
                            case "CANCELED":
                                if($i == 0){
                                    $CLAUSE .="is_void = 1 ";
                                }else{
                                    $CLAUSE .="OR is_void = 1 ";
                                }
                            break;
                            case "CLOSED":
                                if($i == 0){
                                    $CLAUSE .="is_close = 1 ";
                                }else{
                                    $CLAUSE .="OR is_close = 1 ";
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
                $Q_Item = $DB->QueryPort("
                    SELECT
                        pod.header
                    FROM
                        item i,
                        po_detail pod
                    WHERE
                        i.id = pod.item
                        AND (i.kode LIKE '%" . $Val['filter'] . "%' OR i.nama LIKE '%" . $Val['filter'] . "%' OR pod.origin_quality LIKE '%" . $Val['filter'] . "%')               
                "
                );
                $R_Item = $DB->Row($Q_Item);
                if($R_Item > 0){
                    $AllItem = [];
                    while($Item = $DB->Result($Q_Item)){

                        $AllPO[] = $Item['header'];

                    }

                    $CLAUSE .= "
                        AND
                            id IN (" . implode(",", $AllPO) . ")
                    ";

                }else{
                    $CLAUSE .= "
                        AND id = ''
                    ";
                }
                
                break;
            default:
                $CLAUSE .= "
                    AND 
                        $Key LIKE '%" . $Val['filter'] . "%'                    
                ";
        }
        //=> / END : Generate Clause

    $return['clause'] = $CLAUSE;

    }


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
            'kode',
            'mr_kode',
            'pr_kode',
            'pq',
            'pr',
            'dp_invoice_status',
            'supplier_nama',
            'grand_total',
            'submited',
            'create_date',
            'dp_invoice_status',
            'finish',
            'is_void',
            'is_close',
            'close_remarks',
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
            $return['data'][$i]['gr_available'] = $R_GR;
        }

        $FinishPercent = 0;

        if($AllGR > 0){
            $FinishPercent = ($AllGR / $AllPO) * 100;
        }
        $return['data'][$i]['finish_percent'] = decimal($FinishPercent);
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