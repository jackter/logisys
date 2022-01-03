<?php
$Modid = 28;

Perm::Check($Modid, 'add');

//=> Default Statement
$return = [];
$RPL	= "";
$SENT   = Core::Extract($_POST, $RPL);

//=> Extract Array
if(isset($SENT)){
    foreach($SENT as $KEY => $VAL){	
        $$KEY = $VAL;
    }
}

$list = json_decode($list, true);

$Table = array(
    'def'       => 'mr',
    'detail'    => 'mr_detail',
    'dept'      => 'dept',
    'item'      => 'item'
);

/**
 * Create Code
 */
$Time = date('y') . "/";
$Time2 = romawi(date('n')) . "/";
$InitialCode = "MR/" . strtoupper($company_abbr) . "-" . strtoupper($dept_abbr) . "/" . $Time . $Time2;
$InitialCodeCheck = "MR/" . strtoupper($company_abbr) . "%/" . $Time;
$Len = 4;
$LastKode = $DB->Result($DB->Query(
    $Table['def'],
    array('kode'),
    "
        WHERE
            kode LIKE '" . $InitialCodeCheck . "%' 
        ORDER BY 
            SUBSTR(kode, -$Len, $Len) DESC
    "
));
$LastKode = (int)substr($LastKode['kode'], -$Len) + 1;
$LastKode = str_pad($LastKode, $Len, 0, STR_PAD_LEFT);

$kode = $InitialCode . $LastKode;
//=> / END : Create Code

$DB->ManualCommit();

/**
 * Check Department
 */
$ADept = array(
    'id'        => $dept,
    'company'   => $company,
    'abbr'      => strtoupper($dept_abbr),
    'nama'      => $dept_nama
);
if(!isset($ADept['id']) || empty($ADept['id'])){
    $Q_Dept = $DB->QueryOn(
        DB['master'],
        $Table['dept'],
        array(
            'id',
            'company',
            'abbr',
            'nama'
        ),
        "
            WHERE
                company = '" . $ADept['company'] . "' AND
                (
                    LOWER(REPLACE(nama, ' ', '')) = '" . strtolower(str_replace(" ", "", $ADept['nama'])) . "' OR 
                    LOWER(REPLACE(abbr, ' ', '')) = '" . strtolower(str_replace(" ", "", $ADept['abbr'])) . "'
                )
        "
    );
    $R_Dept = $DB->Row($Q_Dept);
    if($R_Dept > 0){
        $Dept = $DB->Result($Q_Dept);
    }else{

        if(Perm::Check2($Modid, "add_dept")){

            /**
             * Create new Dept
             */
            $DeptField = array(
                'company'   => $ADept['company'],
                'abbr'      => $ADept['abbr'],
                'nama'      => $ADept['nama'],
                'status'    => 1
            );
            if($DB->InsertOn(
                DB['master'],
                $Table['dept'],
                $DeptField
            )){
                $return['add_department'] = array(
                    'status'    => 1,
                    'field'     => $DeptField
                );

                /**
                 * Re-Select Dept
                 */
                $Q_Dept = $DB->QueryOn(
                    DB['master'],
                    $Table['dept'],
                    array(
                        'id',
                        'company',
                        'abbr',
                        'nama'
                    ),
                    "
                        WHERE
                            company = '" . $ADept['company'] . "' AND
                            (
                                LOWER(REPLACE(nama, ' ', '')) = '" . strtolower(str_replace(" ", "", $ADept['nama'])) . "' OR 
                                LOWER(REPLACE(abbr, ' ', '')) = '" . strtolower(str_replace(" ", "", $ADept['abbr'])) . "'
                            )
                    "
                );
                $R_Dept = $DB->Row($Q_Dept);
                if($R_Dept > 0){
                    $Dept = $DB->Result($Q_Dept);

                    /**
                     * Update Master Dept
                     * 
                     * ketika penambahan dept baru dan permissions != global
                     */
                    $PermDept = Core::GetState('dept');
                    if($PermDept != "X"){
                        $PermDept .= $Dept['id'];

                        $NormalizeDept = explode(",", $PermDept);
                        sort($NormalizeDept);
                        $PermDept = $Comma = "";
                        for($x = 0; $x < sizeof($NormalizeDept); $x++){
                            $PermDept .= $Comma . $NormalizeDept[$x];
                            $Comma = ",";
                        }

                        $DB->UpdateOn(
                            DB['master'],
                            'sys_user_org',
                            array(
                                'dept'   => $PermDept
                            ),
                            "uid = '" . Core::GetState('id') . "'"
                        );
                    }
                    //=> / END : Update Master Dept

                }
                //=> / END : Re-Select Dept

            }else{
                $return = array(
                    'status'    => 0,
                    'error_msg' => 'Failed to Initialized Department!'
                );
                echo Core::ReturnData($return);
                exit();
            }

        }else{
            $return = array(
                'status'    => 0,
                'error_msg' => 'You dont have permission to Create New Department, Please Call System Administrator to help you!'
            );
            echo Core::ReturnData($return);
            exit();
        }
        //=> / END : Create new Dept

    }
}else{
    $Dept = $ADept;
}
//=> / END : Check Department

/**
 * Field
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
	'table'			=> $Table['def'],
	'clause'		=> "WHERE kode = '" . $kode . "'",
	'action'		=> "add",
	'description'	=> "Create New MR (" . $kode . ")"
);
$History = Core::History($HistoryField);
$Field = array(
    'company'           => $company,
    'company_abbr'      => $company_abbr,
    'company_nama'      => $company_nama,
    'dept'              => $Dept['id'],
    'dept_abbr'         => $Dept['abbr'],
    'dept_nama'         => $Dept['nama'],
    'date_target'       => $date_target_send,
   
    'kode'              => $kode,
    'ref_type'          => $ref_type,
    'sub_ref_type'      => $sub_ref_type,
    'ref'               => $ref,
    'ref_kode'          => $ref_kode,
    'note'              => $note,
    'create_by'		    => Core::GetState('id'),
	'create_date'	    => $Date,
	'history'		    => $History
);
//=> / END : Field

/**
 * Insert Data
 */
if($DB->Insert(
    $Table['def'],
    $Field
)){

    /**
     * Insert Detail
     */
    $Q_Header = $DB->Query(
        $Table['def'], 
        array('id'), 
        "
            WHERE
                kode = '" . $kode . "' AND
                create_date = '" . $Date . "'
        "
    );
    $R_Header = $DB->Row($Q_Header);
    if($R_Header > 0){

        $Header = $DB->Result($Q_Header);
        for($i = 0; $i < sizeof($list); $i++){
            if(!empty($list[$i]['id'])){

                $FieldDetail = array(
                    'header'                => $Header['id'],
                    'item'                  => $list[$i]['id'],
                    'qty'                   => $list[$i]['qty'],
                    'cost_center'           => $list[$i]['cost_center'],
                    'cost_center_kode'      => $list[$i]['cost_center_kode'],
                    'cost_center_nama'      => $list[$i]['cost_center_nama'],
                    'stock'                 => $list[$i]['stock'],
                    // 'coa_alokasi'       => $list[$i]['coa_alokasi'],
                    // 'coa_alokasi_nama'  => $list[$i]['coa_alokasi_nama'],
                    'job_alocation'         => $list[$i]['job_alocation'],
                    'job_alocation_nama'    => $list[$i]['job_alocation_nama'],
                    'coa'                   => $list[$i]['coa'],
                    'coa_kode'              => $list[$i]['coa_kode'],
                    'coa_nama'              => $list[$i]['coa_nama'],
                    'remarks'               => $list[$i]['remarks']
                );

                //$return['detail'][$i] = $FieldDetail;

                if($DB->Insert(
                    $Table['detail'],
                    $FieldDetail
                )){
                    $return['status_detail'][$i]= array(
                        'index'     => $i,
                        'status'    => 1,
                    );

                    /**
                     * Inject Company to Item
                     */
                    $Q_Item = $DB->Query(
                        $Table['item'],
                        array(
                            'id'
                        ),
                        "
                            WHERE
                                CONCAT(',', company, ',') LIKE '%," . $company . ",%' AND 
                                id = '" .  $list[$i]['id'] . "'
                        "
                    );
                    $R_Item = $DB->Row($Q_Item);
                    if($R_Item <= 0){
                        $Item = $DB->Result($DB->Query(
                            $Table['item'],
                            array(
                                'company'
                            ),
                            "
                                WHERE
                                    id = '" .  $list[$i]['id'] . "'
                            "
                        ));

                        if(!empty($Item['company'])){
                            $ItemCompany = $Item['company'] . "," . $company;
                        }else{
                            $ItemCompany = $company;
                        }

                        $NormalizeCompany = explode(",", $ItemCompany);
                        sort($NormalizeCompany);
                        $ItemCompany = $Comma = "";
                        for($x = 0; $x < sizeof($NormalizeCompany); $x++){
                            $ItemCompany .= $Comma . $NormalizeCompany[$x];
                            $Comma = ",";
                        }

                        $DB->Update(
                            $Table['item'],
                            array(
                                'company'   => $ItemCompany
                            ),
                            "id = '" . $list[$i]['id'] . "'"
                        );
                    }
                    //=> / END : Inject Company to Item

                }else{
                    $return['status_detail'][$i] = array(
                        'index'     => $i,
                        'status'    => 0,
                        'error_msg' => $GLOBALS['mysql']->error
                    );
                }

            }
        }

    }
    //=> / END : Insert Detail

    $DB->Commit();

    $return['status'] = 1;
}else{
    $return = array(
        'status'    => 0,
        'error_msg' => $GLOBALS['mysql']->error
    );
}
//=> / END : Insert Data

echo Core::ReturnData($return);
?>