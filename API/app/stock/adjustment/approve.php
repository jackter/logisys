<?php
$Modid = 66;

Perm::Check($Modid, 'approve');

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

$Table = array(
    'def'           => 'stock_adjustment',
    'detail'        => 'stock_adjustment_detail',
    'sstock'        => 'storeloc_stock',
    'stock'         => 'stock',
    'stock_price'   => 'stock_price'
);

$list = json_decode($list, true);

/**
 * Update Approve
 */
$Date = date("Y-m-d H:i:s");

$HistoryField = array(
	'table'			=> $Table['def'],
	'clause'		=> "WHERE id = '" . $id . "'",
	'action'		=> "approve",
	'description'	=> "Approve Adjustment " . $kode
);
$History = Core::History($HistoryField);

$Field = array(
    'approved'      => 1,
    'approved_by'	=> Core::GetState('id'),
	'approved_date'	=> $Date,
    'update_by'		=> Core::GetState('id'),
	'update_date'	=> $Date,
	'history'		=> $History
);

$DB->ManualCommit();

$Data = $DB->Result($DB->Query(
    $Table['def'],
    array(
        'id',
        'company',
        'company_abbr',
        'company_nama',
        'remarks',
        'storeloc',
        'storeloc_kode',
        'storeloc_nama',
        'adj_qty',
        'adj_value',
        'tanggal'
    ),
    "
        WHERE 
            id = '" . $id . "'
    "
));

if($DB->Update(
    $Table['def'],
    $Field,
    "id = '" . $id . "'"
)){

    for($i = 0; $i < sizeof($list); $i++){

        if(!empty($list[$i]['id'])){
            if($list[$i]['credit'] == 0){
                /**
                 * Insert to Jurnal and Update Stock
                 */
                $Jurnal = App::JurnalStock(array(
                    'tipe'          => 'debit',
                    'company'       => $company,
                    'dept'          => $dept,
                    'storeloc'      => $storeloc,
                    'item'          => $list[$i]['id'],
                    'qty'           => $list[$i]['debit'],
                    'price'         => $list[$i]['price'],
                    'kode'          => $kode,
                    'keterangan'    => CLEANHTML($remarks),
                    'tanggal'       => $tanggal
                ));
                //=> / END : Insert to Jurnal and Update Stock
            }
            else{
                /**
                 * Insert to Jurnal and Update Stock
                 */
                $Jurnal = App::JurnalStock(array(
                    'tipe'          => 'credit',
                    'company'       => $company,
                    'dept'          => $dept,
                    'storeloc'      => $storeloc,
                    'item'          => $list[$i]['id'],
                    'qty'           => $list[$i]['credit'],
                    'price'         => $list[$i]['price'],
                    'kode'          => $kode,
                    'keterangan'    => CLEANHTML($remarks),
                    'tanggal'       => $tanggal
                ));
                //=> / END : Insert to Jurnal and Update Stock
            }
        }
    }

    $DB->Commit();

    $return['status'] = 1;

    // $Q_Detail = $DB->QueryPort("
    //     SELECT
    //         D.id AS detail_id,
    //         D.item,
    //         D.stock,
    //         D.price,

    //         D.actual,
    //         D.selisih,
    //         D.jurnal,
    //         D.qty_jurnal,

    //         D.current_val,
    //         D.val,
    //         D.selisih_val,
    //         D.jurnal_acc,
    //         D.val_jurnal_acc,

    //         D.price_new,
    //         D.price_stock,

    //         D.coa,
    //         D.coa_kode,
    //         D.coa_nama,

    //         I.kode AS kode,
    //         TRIM(I.nama) AS nama,
    //         I.satuan,
    //         I.in_decimal,
    //         I.grup,
    //         IC.coa_persediaan
    //     FROM
    //         item AS I,
    //         item_grup_coa AS IC,
    //         " . $Table['detail'] . " AS D
    //     WHERE
    //         I.grup = IC.item_grup_id AND
    //         IC.company = '" . $Data['company'] . "' AND
    //         D.header = '" . $id . "' AND
    //         D.item = I.id
    // ");
    // $R_Detail = $DB->Row($Q_Detail);
    // if($R_Detail > 0){
    //     while($Detail = $DB->Result($Q_Detail)){

    //         $QTY = $Detail['actual'];
    //         if($Data['adj_qty'] != 1){
    //             $QTY = $Detail['stock'];
    //         }

    //         /**
    //          * Update Storeloc Stock
    //          */
    //         $Q_CheckStoreloc = $DB->Query(
    //             $Table['sstock'],
    //             array(
    //                 'id',
    //             ),
    //             "
    //                 WHERE
    //                     company = '" . $Data['company'] . "' AND 
    //                     storeloc = '" . $Data['storeloc'] . "' AND 
    //                     item = '" . $Detail['item'] . "'
    //             "
    //         );
    //         $R_CheckStoreloc = $DB->Row($Q_CheckStoreloc);
    //         if($R_CheckStoreloc > 0){   // UPDATE STORELOC

    //             $StorelocStockUpdate = array(
    //                 'stock' => $QTY,
    //                 'price' => $Detail['price_new']
    //             );
    //             $StorelocStockClause = "
    //                 company = '" . $Data['company'] . "' AND 
    //                 storeloc = '" . $Data['storeloc'] . "' AND 
    //                 item = '" . $Detail['item'] . "'
    //             ";
    //             $DB->Update(
    //                 $Table['sstock'],
    //                 $StorelocStockUpdate,
    //                 $StorelocStockClause
    //             );

    //             $StockPriceUpdate = array(
    //                 'price'         => $Detail['price_new'],
    //                 'update_by'     => Core::GetState('id'),
    //                 'update_date'   => date("Y-m-d H:i:s")
    //             );
    //             $StockPriceClause = "
    //                 company = '" . $Data['company'] . "' AND
    //                 item = '" . $Detail['item'] . "'
    //             ";
    //             $DB->Update(
    //                 $Table['stock_price'],
    //                 $StockPriceUpdate,
    //                 $StockPriceClause
    //             );

    //         }else{  // CREATE STORELOC

    //             $DB->Insert(
    //                 $Table['sstock'],
    //                 array(
    //                     'company'       => $Data['company'],
    //                     'storeloc'      => $Data['storeloc'],
    //                     'storeloc_kode' => $Data['storeloc_kode'],
    //                     'item'          => $Detail['item'],
    //                     'stock'         => $QTY,
    //                     'price'         => $Detail['price_new']
    //                 )
    //             );

    //             $DB->Insert(
    //                 $Table['stock_price'],
    //                 array(
    //                     'company'       => $Data['company'],
    //                     'item'          => $Detail['item'],
    //                     'price'         => $Detail['price_new'],
    //                     'create_by'     => Core::GetState('id'),
    //                     'create_date'   => date("Y-m-d H:i:s")
    //                 )
    //             );

    //         }
    //         //=> / END : Update Storeloc Stock

    //         /**
    //          * Insert Jurnal Stock
    //          * 
    //          * insert selisih kedalam jurnal sesuai dengan 
    //          * tipe jurnal (D / K)
    //          */
    //         if(
    //             $Data['adj_qty'] == 1 &&
    //             $Detail['selisih'] != 0
    //         ){

    //             /**
    //              * Get Saldo Awal
    //              */
    //             $StockAwal = 0;
    //             $Price = 0;
    //             $qty_debit = 0;
    //             $qty_credit = 0;
    //             $Q_SStock = $DB->Query(
    //                 $Table['sstock'],
    //                 array(
    //                     'stock',
    //                 ),
    //                 "
    //                     WHERE
    //                         company = '" . $Data['company'] . "' AND 
    //                         storeloc = '" . $Data['storeloc'] . "' AND 
    //                         item = '" . $Detail['item'] . "'
    //                 "
    //             );
    //             $R_SStock = $DB->Row($Q_SStock);
    //             if($R_SStock > 0){
    //                 $SStock = $DB->Result($Q_SStock);

    //                 $StockAwal = $SStock['stock'];
    //             }
    //             //=> / END : Get Saldo Awal

    //             if($Detail['jurnal'] == 'debit'){
    //                 $StockAwal = $QTY - $Detail['qty_jurnal'];
    //                 $qty_debit = $Detail['qty_jurnal'];
    //             }
    //             else{
    //                 $StockAwal = $QTY + $Detail['qty_jurnal'];
    //                 $qty_credit = $Detail['qty_jurnal'];
    //             }

    //             $StockAkhir = $QTY;
                
    //             $Field = array(
    //                 'company'           => $Data['company'],
    //                 'company_abbr'      => $Data['company_abbr'],
    //                 'company_nama'      => $Data['company_nama'],
    //                 'item'              => $Detail['item'],
    //                 'item_kode'         => $Detail['kode'],
    //                 'item_nama'         => $Detail['nama'],
    //                 'item_satuan'       => $Detail['satuan'],
    //                 'item_grup'         => $Detail['grup'],
    //                 'saldo'             => $StockAwal,
    //                 'debit'             => $qty_debit,
    //                 'credit'            => $qty_credit,
    //                 'saldo_akhir'       => $StockAkhir,
    //                 'price'             => $Detail['price_stock'],
    //                 'storeloc'          => $Data['storeloc'],
    //                 'storeloc_kode'     => $Data['storeloc_kode'],
    //                 'storeloc_nama'     => $Data['storeloc_nama'],
    //                 'tanggal'           => $Data['tanggal'],
    //                 'create_by'         => Core::GetState('id'),
    //                 'create_date'       => date("Y-m-d H:i:s"),
    //                 'keterangan'        => 'Adjustment ' . $kode,
    //                 'adj'               => 1,
    //                 'adj_qty'           => $Detail['selisih'],
    //                 'ref_kode'          => $kode
    //             );

    //             $DB->Insert(
    //                 $Table['stock'],
    //                 $Field
    //             );

    //             $return['jurnal'] = 'Jurnal Stock';
                
    //         }
    //         //=> / END : Insert Jurnal Stock

    //         /**
    //          * Insert Jurnal Accounting
    //          * insert selisih kedalam jurnal_acc sesuai dengan 
    //          * tipe jurnal_acc (D / K)
    //          */
    //         if(
    //             $Data['adj_value'] == 1 &&
    //             $Detail['selisih_val'] != 0
    //         ){
    //             if($Detail['jurnal_acc'] == "debit"){
    //                 $JurnalBiaya = "credit";
    //             }
    //             else{
    //                 $JurnalBiaya = "debit";
    //             }

    //             if($enable_journal == 1){
    //                 $Jurnal = App::JurnalPosting(array(
    //                     'trx_type'      => 9,
    //                     'tipe'          => $Detail['jurnal_acc'],
    //                     'company'       => $Data['company'],
    //                     'source'        => $kode,
    //                     'target'        => $Data['storeloc_kode'],
    //                     'target_2'      => $Detail['item'],
    //                     'currency'      => 'IDR',
    //                     'rate'          => 1,
    //                     'coa'           => $Detail['coa_persediaan'],
    //                     'value'         => $Detail['val_jurnal_acc'],
    //                     'kode'          => $kode,
    //                     'tanggal'       => $Data['tanggal'],
    //                     'keterangan'    => $Data['remarks']
    //                 ));
    
    //                 $Jurnal = App::JurnalPosting(array(
    //                     'trx_type'      => 9,
    //                     'tipe'          => $JurnalBiaya,
    //                     'company'       => $Data['company'],
    //                     'source'        => $kode,
    //                     'target'        => $Data['storeloc_kode'],
    //                     'target_2'      => $Detail['item'],
    //                     'currency'      => 'IDR',
    //                     'rate'          => 1,
    //                     'coa'           => $Detail['coa'],
    //                     'value'         => $Detail['val_jurnal_acc'],
    //                     'kode'          => $kode,
    //                     'tanggal'       => $Data['tanggal'],
    //                     'keterangan'    => $Data['remarks']
    //                 ));
    
    //                 $return['jurnal'] = 'Jurnal Accounting';
    //             }
    //         }
    //         //=> / END : Insert Jurnal Accounting

    //     }

    //     $DB->Commit();
    //     $return['status'] = 1;
    // }
    // else{
    //     $return = array(
    //         'status'            => 0,
    //         'error_msg'         => 'Please call accounting to fill item grup account for this item adjusment'
    //     );
    // }

}else{
    $return = array(
        'status'    => 0,
        'error_msg' => $GLOBALS['mysql']->error
    );
}
//=> / END : Update Approve

echo Core::ReturnData($return);
?>