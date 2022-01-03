<?php
$Modid = 31;

include "_function.php";

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

$return['permissions'] = Perm::Extract($Modid);

$Table = array(
    'def'       => 'pq',
    'reply'     => 'pq_supplier_reply',
    'po'        => 'po',
    'gr'        => 'gr',
    'item'      => 'item',
    'pr_detail' => 'pr_detail'
);

//=> Clean Data
if (empty($limit)) {
    $limit = 10;
}
if (empty($offset)) {
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
if ($PermCompany != "X") {
    $CLAUSE .= " AND company IN (" . $PermCompany . ")";
}

$PermDept = Core::GetState('dept');
if ($PermDept != "X" && !empty($PermDept)) {
    $CLAUSE .= " AND dept IN (" . $PermDept . ")";
}

$PermUsers = Core::GetState('users');
if ($PermUsers != "X") {
    if (!empty($PermUsers)) {
        $CLAUSE .= " AND create_by IN (" . $PermUsers . ")";
    } else {
        $CLAUSE .= " AND create_by = '" . Core::GetState('id') . "'";
    }
}
//=> / END : Filter

/**
 * Show By Permissions
 */
if (Core::GetState('id') != 1) {
    if (Perm::Check2($Modid, 'only_verified')) {
        $CLAUSE .= "
            AND verified = 1
        ";
    }
    if (Perm::Check2($Modid, 'only_approved')) {
        $CLAUSE .= "
            AND approved = 1
        ";
    }
    if (Perm::Check2($Modid, 'only_approved2')) {
        $CLAUSE .= "
            AND approved2 = 1
        ";
    }
}
//=> / END : Show By Permissions

/**
 * Filter Table
 */
$ftable = json_decode($ftable, true);
if (isset($ftable)) {
    foreach ($ftable as $Key => $Val) {

        /**
         * Generate Clause
         */
        switch ($Key) {
            case "status_data":
                if(count($Val['values']) > 0){
                    for($i = 0; $i < count($Val['values']); $i++){
                        if($i == 0){
                            $CLAUSE .= "AND ( ";
                        }

                        switch($Val['values'][$i]){
                            case "DRAFT":
                                if($i == 0){
                                    $CLAUSE .="verified != 1 AND is_void != 1 ";
                                }else{
                                    $CLAUSE .="OR verified != 1 AND is_void != 1 ";
                                }
                            break;
                            case "VERIFIED, WAITING MGR. APPROVE":
                                if($i == 0){
                                    $CLAUSE .="verified = 1 AND approved != 1 AND finish != 1 ";
                                }else{
                                    $CLAUSE .="OR verified = 1 AND approved != 1 AND finish != 1 ";
                                }
                            break;
                            case "MANAGER APPROVED, WAITING DIRKOM APPROVE":
                                if($i == 0){
                                    $CLAUSE .="approved = 1 AND approved2 != 1 AND finish != 1 ";
                                }else{
                                    $CLAUSE .="OR approved = 1 AND approved2 != 1 AND finish != 1 ";
                                }
                            break;
                            case "HEAD APPROVED, WAITING CEO APPROVE":
                                if($i == 0){
                                    $CLAUSE .="approved2 = 1 AND approved3 != 1 AND finish != 1 ";
                                }else{
                                    $CLAUSE .="OR approved2 = 1 AND approved3 != 1 AND finish != 1 ";
                                }
                            break;
                            case "FINISH, READY TO CREATE PURCHASE ORDER":
                                if($i == 0){
                                    $CLAUSE .="finish = 1 AND id NOT IN (SELECT pq FROM po WHERE is_void = 0) AND is_void != 1 ";
                                }else{
                                    $CLAUSE .="OR finish = 1 AND id NOT IN (SELECT pq FROM po WHERE is_void = 0) AND is_void != 1 ";
                                }
                            break;
                            case "FINISH":
                                if($i == 0){
                                    $CLAUSE .="finish = 1 AND is_void != 1 ";
                                }else{
                                    $CLAUSE .="OR finish = 1 AND is_void != 1 ";
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
            case "verified":

                if (!empty($Val['values'])) {
                    $SEPARATOR = "";
                    $CLAUSE .= "AND (";
                    foreach ($Val['values'] as $Item) {

                        if (strtolower($Item) == "verified") {
                            $CLAUSE .= "
                                $SEPARATOR verified = 1 AND approved = 0
                            ";
                        }

                        if (strtolower($Item) == "unverified") {
                            $CLAUSE .= "
                                $SEPARATOR verified = 0
                            ";
                        }

                        if (strtolower($Item) == "approved") {
                            $CLAUSE .= "
                                $SEPARATOR approved = 1
                            ";
                        }
                        $SEPARATOR = "OR";
                    }
                    $CLAUSE .= ")";
                } else {
                    $CLAUSE .= "
                        AND 
                            verified = 2
                    ";
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
                if ($R_Item > 0) {
                    $AllItem = [];
                    while ($Item = $DB->Result($Q_Item)) {

                        $AllItem[] = $Item['id'];

                        $return['id_item'] = $AllItem;
                    }

                    $Q_PR_Detail = $DB->Query(
                        $Table['pr_detail'],
                        array(
                            'header'
                        ),
                        "
                            WHERE
                                item IN (" . implode(",", $AllItem) . ")
                        "
                    );

                    $R_PR_Detail = $DB->Row($Q_PR_Detail);
                    if ($R_PR_Detail > 0) {
                        $ALLPR = [];
                        while ($PR_Detail = $DB->Result($Q_PR_Detail)) {

                            $ALLPR[] = $PR_Detail['header'];

                            $return['replay'] = $ALLPR;
                        }

                        $Q_PQ = $DB->Query(
                            $Table['def'],
                            array(
                                'id'
                            ),
                            "
                                WHERE
                                    pr IN (" . implode(",", $ALLPR) . ")
                            "
                        );

                        $R_PQ = $DB->Row($Q_PQ);
                        if ($R_PQ > 0) {
                            $ALLPQ = [];
                            while ($PQ = $DB->Result($Q_PQ)) {

                                if (!in_array($PQ['id'], $ALLPQ)) {
                                    $ALLPQ[] = $PQ['id'];
                                }

                                $return['header'] = $ALLPQ;
                            }

                            $CLAUSE .= "
                                AND 
                                    id IN (" . implode(",", $ALLPQ) . ")
                            ";
                        } else {

                            $CLAUSE .= "
                                AND 
                                    id = ''
                            ";
                        }
                    } else {
                        $CLAUSE .= "
                            AND id = ''
                        ";
                    }
                } else {
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

if ($R_Data > 0) {

    $return['start']        = $start;
    $return['limit']        = $limit;
    $return['count']        = $R_Data;

    $Q_Data = $DB->Query(
        $Table['def'],
        array(
            'id',
            'company_abbr',
            'tanggal',
            'kode',
            'pr',
            'pr_kode',
            'verified',
            'approved',     //MGR
            'approved_by',
            'approved2',    //DIRKOM / HEAD
            'approved2_by',
            'approved3',    //CEO
            'approved3_by',
            'create_by',
            'create_date',
            'finish',
            'is_void',
            'void_by',
            'void_date',
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
    while ($Data = $DB->Result($Q_Data)) {

        $return['data'][$i] = $Data;

        $return['data'][$i]['create_by'] = Core::GetUser('nama', $Data['create_by']);

        /**
         * Approved By
         */
        $ApprovedBy = "WAITING";
        if ($Data['verified'] != 1) {
            $ApprovedBy = "ON PROGRESS";
        }
        if ($Data['approved_by'] > 0) {
            $ApprovedBy = Core::GetUser('nama', $Data['approved_by']);
        }
        if ($Data['approved2_by'] > 0) {
            $ApprovedBy = Core::GetUser('nama', $Data['approved2_by']);
        }
        if ($Data['approved3_by'] > 0) {
            $ApprovedBy = Core::GetUser('nama', $Data['approved3_by']);
        }
        $return['data'][$i]['approved_by'] = $ApprovedBy;
        //=> / END : Approved By

        /**
         * Last History
         */
        $History = json_decode($Data['history'], true);
        $History = $History[0];
        $FormatHistory = $History['description'] . " - " . datetime_db_en($History['time']);

        $User = Core::GetUser("nama", $History['user']);
        if (!empty($User)) {
            $FormatHistory .= " - By " . $User;
        }

        $return['data'][$i]['history'] = $FormatHistory;
        //=> / END : Last History

        /**
         * Total Quotation
         */
        // $Apvd = Apvd($Data['id']);
        $return['data'][$i]['apvd'] = 1;
        //=> / END : Total Quotation

        /**
         * Get Quotation Status
         */
        if ($Data['finish'] == 1) {

            /**
             * Count Supplier Reply
             */
            $Q_SupReply = $DB->QueryPort("
                SELECT
                    H.id
                FROM
                    " . $Table['reply'] . " AS H,
                    " . $Table['reply'] . "_detail AS D
                WHERE
                    D.header_reply = H.id AND 
                    D.qty_po > 0 AND 
                    H.header = '" . $Data['id'] . "'
                GROUP BY
                    D.header_reply
            ");
            $R_SupReply = $DB->Row($Q_SupReply);
            //=> / END : Count Supplier Reply

            $Q_PO = $DB->Query(
                $Table['po'],
                array(
                    'id'
                ),
                "
                    WHERE
                        pq = '" . $Data['id'] . "' AND
                        is_void = 0
                "
            );
            $R_PO = $DB->Row($Q_PO);

            $return['data'][$i]['ordered'] = 0;
            if ($R_PO == $R_SupReply) {
                $return['data'][$i]['ordered'] = 1;
            }
        }
        //=> / END : Get Quotation Status

        /**
         * Check Ready to Cancel
         */
        $Q_PO = $DB->Query(
            $Table['po'],
            array(
                'id',
                'is_void'
            ),
            "
                WHERE
                    pr = '" . $Data['pr'] . "'
            "
        );
        $R_PO = $DB->Row($Q_PO);
        if ($R_PO > 0) {

            $ALLPO = [];
            while ($PO = $DB->Result($Q_PO)) {

                $ALLPO[] = $PO['id'];
            }

            $Q_GR = $DB->Query(
                $Table['gr'],
                array(
                    'id'
                ),
                "
                    WHERE
                        po IN (" . implode(",", $ALLPO) . ")
                "
            );
            $R_GR = $DB->Row($Q_GR);

            if ($R_GR > 0) {

                $return['data'][$i]['gr_available'] = 1;
            } else {

                $return['data'][$i]['gr_available'] = 0;
            }
        }

        // >> End: Check Ready to Cancel

        $i++;
    }
} else {
}
//=> / END : Listing Data

echo Core::ReturnData($return);

?>