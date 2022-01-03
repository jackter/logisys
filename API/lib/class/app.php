<?php
class App {

    function __construct(){

    }

    function __destruct(){

    }

    /**
     * JurnalStock
     * 
     * Options:
     * 
     * tipe = debit / credit
     * company
     * dept
     * storeloc
     * item
     * qty
     */
    static function JurnalStock($Options = array()){

        // $DB = new DB;
        global $DB;

        $return = [];

        if(empty($Options['tipe'])){
            //echo "Please define transaction type Credit / Debit";
            $DB->LogError("Please define transaction type Credit / Debit");
            //exit();
        }

        if(
            empty($Options['company']) || 
            empty($Options['storeloc']) || 
            empty($Options['item']) || 
            empty($Options['qty'])
        ){
            //print_r($Options);
            //echo "Mandatory field JS = company, store, item, qty, and price";
            $DB->LogError("Please define transaction type Credit / Debit");
            //exit();
        }

        if(
            empty($Options['price']) || 
            $Options['price'] <= 0
        ){
            $Options['price'] = 0;
        }

        /**
         * Select Company
         */
        $Q_Company = $DB->QueryOn(
            DB['master'],
            "company",
            array(
                'id',
                'nama',
                'abbr'
        
            ),
            "
            WHERE 
                id = '" . $Options['company'] . "'
            "
        );
        $R_Company = $DB->Row($Q_Company);
        if($R_Company > 0){
            $Company = $DB->Result($Q_Company);
        }
        //=> / END : Select Company

        /**
         * Select Dept
         */
        if(!empty($Options['dept'])){
            $Q_Dept = $DB->QueryOn(
                DB['master'],
                "dept",
                array(
                    'id',
                    'nama',
                    'abbr'
            
                ),
                "
                WHERE 
                    id = '" . $Options['dept'] . "'
                "
            );
            $R_Dept = $DB->Row($Q_Dept);
            if($R_Dept > 0){
                $Dept = $DB->Result($Q_Dept);
            }
        }
        //=> / END : Select Dept

        /**
         * Select Storeloc
         */
        $Q_Storeloc = $DB->Query(
            "storeloc",
            array(
                'id',
                'kode',
                'nama'
            ),
            "
            WHERE 
                id = '" . $Options['storeloc'] . "'
            "
        );
        $R_Storeloc = $DB->Row($Q_Storeloc);
        if($R_Storeloc > 0){
            $Storeloc = $DB->Result($Q_Storeloc);
        }
        //=> / END : Select Storeloc

        /**
         * Select Item
         */
        $Q_Item = $DB->Query(
            "item",
            array(
                'id',
                'kode',
                'TRIM(nama)'        => 'nama',
                'satuan',
                'grup'
            ),
            "
                WHERE
                    id = '" . $Options['item'] . "'
            "
        );
        $R_Item = $DB->Row($Q_Item);
        if($R_Item > 0){
            $Item = $DB->Result($Q_Item);
        }
        //=> / END : Item

        /**
         * Get Saldo Awal
         */
        $StockAwal = 0;
        $Price= 0;
        $Q_SStock = $DB->Query(
            "storeloc_stock",
            array(
                'stock',
                'price'
            ),
            "
                WHERE
                    company = '" . $Options['company'] . "' AND 
                    storeloc = '" . $Options['storeloc'] . "' AND 
                    item = '" . $Options['item'] . "'
            "
        );
        $R_SStock = $DB->Row($Q_SStock);
        if($R_SStock > 0){
            $SStock = $DB->Result($Q_SStock);

            $Price = $SStock['price'];
            $StockAwal = $SStock['stock'];
        }
        //=> / END : Get Saldo Awal

        $UnitPrice = $Price;

        /**
         * Calculate Debit / Credit
         */
        if($Options['tipe'] == "debit"){    // MASUK
            $StockAkhir = $Options['qty'] + $StockAwal;

            /**
             * Create new HPP
             */
            $PriceOld = $StockAwal * $Price;
            $PriceNew = $Options['qty'] * $Options['price'];
            $AllQty = $StockAkhir;

            $UnitPrice = ($PriceOld + $PriceNew) / $AllQty;
            //=> / END : Create new HPP

        }elseif($Options['tipe'] == "credit"){ // Keluar
            $StockAkhir = $StockAwal - $Options['qty'];
            if(empty($UnitPrice)){
                $UnitPrice = $Options['price'];
            }
        }
        //=> / END : Calculate Debit / Credit

        /**
         * Tanggal Transaksi
         */
        $Tanggal = $Options['tanggal'];
        if(empty($Tanggal)){
            $Tanggal = date("Y-m-d");
        }
        //=> / END : Tanggal Transaksi

        /**
         * Field Jurnal
         */
        $Field = array(
            'company'           => $Company['id'],
            'company_abbr'      => $Company['abbr'],
            'company_nama'      => $Company['nama'],
            'item'              => $Item['id'],
            'item_kode'         => $Item['kode'],
            'item_nama'         => $Item['nama'],
            'item_satuan'       => $Item['satuan'],
            'item_grup'         => $Item['grup'],
            'saldo'             => $StockAwal,
            'saldo_akhir'       => $StockAkhir,
            'price'             => $UnitPrice,
            'storeloc'          => $Storeloc['id'],
            'storeloc_kode'     => $Storeloc['kode'],
            'storeloc_nama'     => $Storeloc['nama'],
            'tanggal'           => $Tanggal,
            'create_by'         => Core::GetState('id'),
            'create_date'       => date("Y-m-d H:i:s"),
        );
        if(!empty($Options['dept'])){
            $Field['dept']      = $Dept['id'];
            $Field['dept_abbr'] = $Dept['abbr'];
            $Field['dept_nama'] = $Dept['nama'];
        }
        if($Options['tipe'] == "debit"){    // MASUK
            $Field['debit'] = $Options['qty'];
        }elseif($Options['tipe'] == "credit"){ // Keluar
            $Field['credit'] = $Options['qty'];
        }
        if($Options['adj'] == 1){
            $Field['adj'] = 1;
        }

        if(!empty($Options['keterangan']) && isset($Options['keterangan'])){
            $Field['keterangan'] = $Options['keterangan'];
        }
        if(!empty($Options['kode']) && isset($Options['kode'])){
            $Field['ref_kode'] = $Options['kode'];
        }
        //=> / END : Field Jurnal

        /**
         * Insert to Jurnal Stock
         */
        if($DB->Insert(
            "stock",
            $Field
        )){
            /**
             * Update Stock
             */
            $UpdateStock = App::UpdateStock(array(
                'tipe'          => $Options['tipe'],
                'company'       => $Options['company'],
                'storeloc'      => $Options['storeloc'],
                'item'          => $Options['item'],
                'qty'           => $StockAkhir,
                'price'         => $UnitPrice
            ));
            //=> / END : Update Stock

            /**
             * Update Stock Ledger
             */
            $UpdateStockLedger  = App::UpdateStockLedger(array(
                'tipe'          => $Options['tipe'],
                'year'          => (int)date("Y", strtotime($Tanggal)),
                'month'         => (int)date("m", strtotime($Tanggal)),
                'company'       => $Company['id'],
                'company_abbr'  => $Company['abbr'],
                'company_nama'  => $Company['nama'],
                'storeloc'      => $Storeloc['id'],
                'storeloc_kode' => $Storeloc['kode'],
                'item'          => $Item['id'],
                'item_kode'     => $Item['kode'],
                'item_nama'     => $Item['nama'],
                'value'         => $Options['qty']
            ));
            // => / END : Update Balance

            $return = array(
                'status'    => 1,
                'msg'       => 'Insert Jurnal Stock Success',
                'update'    => $UpdateStock['action']
            );

        }else{
            $return = array(
                'status'    => 0,
                'msg'       => 'Insert Jurnal Stock Failed'
            );
        }
        //=> / END : Insert to Jurnal Stock

        return $return;

    }
    //=> / END : JurnalStock

    /**
     * Update stock
     * 
     * OPTIONS:
     * tipe
     * company
     * storeloc
     * item
     * qty
     */
    static function UpdateStock($Options = array()){

        // $DB = new DB;
        global $DB;

        $return = [];

        $Table = "storeloc_stock";

        if(
            empty($Options['company']) || 
            empty($Options['storeloc']) || 
            empty($Options['item'])
        ){
            //print_r($Options);

            //echo "Mandatory field US = company, store, item, qty";
            $DB->LogError("Mandatory field US = company, store, item, qty");
            //exit();
        }
        
        /**
         * Check Storeloc Stock
         */
        $Q_Check = $DB->Query(
            $Table,
            array(
                'id',
                'price'
            ),
            "
                WHERE
                    company = '" . $Options['company'] . "' AND 
                    storeloc = '" . $Options['storeloc'] . "' AND 
                    item = '" . $Options['item'] . "'
            "
        );
        $R_Check = $DB->Row($Q_Check);
        if($R_Check > 0){
            $Check = $DB->Result($Q_Check);

            if($Options['tipe'] == 'debit'){
                $Field = array(
                    'stock'     => $Options['qty'],
                    'price'     => $Options['price']
                );
            }else{
                $Field = array(
                    'stock'     => $Options['qty']
                );
            }

            if($DB->Update(
                $Table,
                $Field,
                "id = '" . $Check['id'] . "'"
            )){
                $return = array(
                    'action'    => 'Update Stock',
                    'status'    => 1
                );
            }else{

            }
        }else{

            if(empty($Options['price'])){
                //echo "Please Define Price to Create New Storeloc Stock";
                $DB->LogError("Please Define Price to Create New Storeloc Stock");
                //exit();
            }

            /**
             * Select Storeloc
             */
            $Q_Storeloc = $DB->Query(
                "storeloc",
                array(
                    'id',
                    'kode',
                    'nama'
                ),
                "
                WHERE 
                    id = '" . $Options['storeloc'] . "'
                "
            );
            $R_Storeloc = $DB->Row($Q_Storeloc);
            if($R_Storeloc > 0){
                $Storeloc = $DB->Result($Q_Storeloc);
            }
            //=> / END : Select Storeloc

            /**
             * Create new storeloc stock
             */
            if($DB->Insert(
                $Table,
                array(
                    'company'       => $Options['company'],
                    'storeloc'      => $Options['storeloc'],
                    'storeloc_kode' => $Storeloc['kode'],
                    'item'          => $Options['item'],
                    'stock'         => $Options['qty'],
                    'price'         => $Options['price']
                )
            )){
                $return = array(
                    'action'    => 'Create Storeloc [' . $Options['company'] . ',' . $Options['storeloc'] . ']',
                    'status'    => 1
                );
            }else{

            }
            //=> / END : Create new storeloc stock

        }
        //=> / END : Check Storeloc Stock

        /**
         * Insert Stock Price History
         */
        if($Options['tipe'] == 'debit'){

            $TableHistory = "storeloc_stock_history";

            $LastHistory = $DB->Result($DB->Query(
                $TableHistory,
                array(
                    'id',
                    'price'
                ),
                "
                    WHERE
                        company = '" . $Options['company'] . "' AND 
                        storeloc = '" . $Options['storeloc'] . "' AND 
                        item = '" . $Options['item'] . "'
                    ORDER BY 
                        tanggal DESC
                    LIMIT 1
                "
            ));

            if($LastHistory['price'] != $Options['price']){

                $DB->Insert(
                    $TableHistory,
                    array(
                        'company'       => $Options['company'],
                        'storeloc'      => $Options['storeloc'],
                        'item'          => $Options['item'],
                        'price'         => $Options['price'],
                        'tanggal'       => date('Y-m-d H:i:s')
                    )
                );

            }else{

                $DB->Update(
                    $TableHistory,
                    array(
                        'last_update'   => date('Y-m-d H:i:s')
                    ),
                    "id = '" . $LastHistory['id'] . "'"
                );

            }
        }
        //=> / END : Insert Stock Price History

        return $return;

    }
    //=> / END : Update Stock

    /**
     * Update Stock Ledger
     * 
     * OPTIONS:
     * year
     * month
     * company
     * company_abbr
     * company_nama
     * storeloc
     * item
     * tipe
     * value
     */
    static function UpdateStockLedger($Options = array()){

        // $DB = new DB;
        global $DB;

        $return = [];

        $Table = "storeloc_stock_ledger";

        if(empty($Options['tipe'])){
            //echo "Please define transaction type Credit / Debit";
            $DB->LogError("Please define transaction type Credit / Debit");
            //exit();
        }

        if(
            empty($Options['year']) || 
            empty($Options['month']) || 
            empty($Options['company']) || 
            empty($Options['storeloc']) || 
            empty($Options['item']) || 
            empty($Options['value'])
        ){
            //print_r($Options);

            //echo "Mandatory field US = year, month, company, storeloc, item, value";
            $DB->LogError("Mandatory field US = year, month, company, storeloc, item, value");
            //exit();
        }
        
        /**
         * Check Stock Balance
         */
        $Q_Check = $DB->Query(
            $Table,
            array(
                'id',
                'closing'
            ),
            "
                WHERE
                    company = '" . $Options['company'] . "' AND 
                    storeloc = '" . $Options['storeloc'] . "'  AND 
                    item = '" . $Options['item'] . "'  AND
                    year = '" . $Options['year'] . "'  AND 
                    month = '" . $Options['month'] . "'
            "
        );
        $R_Check = $DB->Row($Q_Check);
        if($R_Check == 1){
            $Check = $DB->Result($Q_Check);

            if($Options['tipe'] == 'debit'){
                $Field = array(
                    'closing'       => $Check['closing'] + $Options['value'],
                    'update_by'     => Core::GetState('id'),
                    'update_date'   => date("Y-m-d H:i:s")
                );
            }else{
                $Field = array(
                    'closing'     => $Check['closing'] + ($Options['value'] * -1),
                    'update_by'     => Core::GetState('id'),
                    'update_date'   => date("Y-m-d H:i:s")
                );
            }

            if($DB->Update(
                $Table,
                $Field,
                "id = '" . $Check['id'] . "'"
            )){
                $return = array(
                    'action'    => 'Update Stock Ledger Closing',
                    'status'    => 1
                );
            }else{

            }
        }else{
            $Q_Check = $DB->Query(
                $Table,
                array(
                    'id',
                    'closing'
                ),
                "
                    WHERE
                        company = '" . $Options['company'] . "' AND
                        storeloc = '" . $Options['storeloc'] . "'  AND 
                        item = '" . $Options['item'] . "'  AND
                        STR_TO_DATE(CONCAT('01-',MONTH,'-',YEAR),'%d-%m-%Y') <= STR_TO_DATE(CONCAT('01-'," . $Options['month'] . ",'-'," . $Options['year'] . "),'%d-%m-%Y')
                        ORDER BY STR_TO_DATE(CONCAT('01-',MONTH,'-',YEAR),'%d-%m-%Y') DESC
                "
            );
            $R_Check = $DB->Row($Q_Check);
            if($R_Check >= 1){
                $i = 0;
                $lastItemBalance = 0;
                $finalItemBalance = 0;
                while($ItemBalance = $DB->Result($Q_Check)){
                    if($i == 0){
                        $lastItemBalance = $ItemBalance['closing'];
                        if($Options['tipe'] == 'debit'){
                            $finalItemBalance = $ItemBalance['closing'] + $Options['value'];
                        }else{
                            $finalItemBalance = $ItemBalance['closing'] + ($Options['value'] * -1);
                        }
                    }
                    $i++;
                }

                /**
                 * Create new stock balance
                 */
                if($DB->Insert(
                    $Table,
                    array(
                        'year'          => $Options['year'],
                        'month'         => $Options['month'],
                        'company'       => $Options['company'],
                        'company_abbr'  => $Options['company_abbr'],
                        'company_nama'  => $Options['company_nama'],
                        'storeloc'      => $Options['storeloc'],
                        'storeloc_kode' => $Options['storeloc_kode'],
                        'item'          => $Options['item'],
                        'item_kode'     => $Options['item_kode'],
                        'item_nama'     => $Options['item_nama'],
                        'opening'       => $lastItemBalance,
                        'closing'       => $finalItemBalance,
                        'create_by'     => Core::GetState('id'),
                        'create_date'   => date("Y-m-d H:i:s")
                    )
                )){
                    $return = array(
                        'action'    => 'Create stock balance [' . $Options['year'] . ',' . $Options['month'] . ',' . $Options['company'] . ',' . $Options['storeloc'] . ',' . $Options['item'] . ']',
                        'status'    => 1
                    );
                }else{
    
                }
                //=> / END : Create new stock balance
            }
            else{
    
                /**
                 * Create new stock balance
                 */
                if($Options['tipe'] == 'debit'){
                    $closing = $Options['value'];
                }else{
                    $closing = ($Options['value'] * -1);
                }

                if($DB->Insert(
                    $Table,
                    array(
                        'year'          => $Options['year'],
                        'month'         => $Options['month'],
                        'company'       => $Options['company'],
                        'company_abbr'  => $Options['company_abbr'],
                        'company_nama'  => $Options['company_nama'],
                        'storeloc'      => $Options['storeloc'],
                        'storeloc_kode' => $Options['storeloc_kode'],
                        'item'          => $Options['item'],
                        'item_kode'     => $Options['item_kode'],
                        'item_nama'     => $Options['item_nama'],
                        'opening'       => 0,
                        'closing'       => $closing,
                        'create_by'     => Core::GetState('id'),
                        'create_date'   => date("Y-m-d H:i:s")
                    )
                )){
                    $return = array(
                        'action'    => 'Create COA Balance [' . $Options['year'] . ',' . $Options['month'] . ',' . $Options['company'] . ',' . $Options['coa'] . ']',
                        'status'    => 1
                    );
                }else{
    
                }
                //=> / END : Create new stock balance
            }

        }
        //=> / END : Check Stock Balance

        return $return;

    }
    //=> / END : Stock Ledger

    /**
     * Get Stock
     * 
     * OPTIONS:
     * company (empty == all)
     * storeloc (empty == all)
     * item
     */
    static function GetStock($Options = array()){

        // $DB = new DB;
        global $DB;

        $Table = array(
            'stock'     => 'storeloc_stock'
        );

        if(
            empty($Options['item'])
        ){
            //echo "Please Define Item";
            $DB->LogError("Please Define Item");
            //exit();
        }

        $CLAUSE = "WHERE id != ''";

        $PermCompany = Core::GetState('company');
        if($PermCompany != "X"){
            $CLAUSE .= " AND company IN (" . $PermCompany . ")";
        }

        if(!empty($Options['company'])){
            $CLAUSE .= " AND company = '" . $Options['company'] . "'";
        }

        if(!empty($Options['storeloc'])){
            $CLAUSE .= " AND storeloc = '" . $Options['storeloc'] . "'";
        }

        $Stock = 0;

        /**
         * Get Stock from DB
         */
        $Q_Stock = $DB->Query(
            $Table['stock'],
            array(
                'SUM(stock)'    => 'stock'
            ),
            $CLAUSE . "
                AND
                    item = '" . $Options['item'] . "'
            "
        );
        $R_Stock = $DB->Row($Q_Stock);
        if($R_Stock > 0){
            $Stock = $DB->Result($Q_Stock);
            $Stock = $Stock['stock'];
        }
        //=> / END : Get Stock from DB

        return $Stock;

    }
    //=> / END : Get Stock

    /**
     * Get Stock 2
     * 
     * function to get actual stock using defined periode of data and item code
     * with special formula including date range to get actual stock by date
     * 
     * example of formula is:
     * Opening Stock = Opening stock current month + debit summary - credit summary
     * 
     * OPTIONS:
     * company (empty == all)
     * storeloc (empty == all)
     * item
     * tanggal
     */
    static function GetOpeningStockLedger($Options = array()){
        
        global $DB;

        $Table = array(
            'stock'     => 'stock',
            'ledger'    => 'storeloc_stock_ledger'
        );

        if(
            empty($Options['item']) ||
            empty($Options['tanggal'])
        ){
            //echo "Please Define Item, Date";
            $DB->LogError("Please Define Item, Date");
            //exit();
        }

        $CLAUSE = "WHERE id != ''";

        $PermCompany = Core::GetState('company');
        if($PermCompany != "X"){
            $CLAUSE .= " AND company IN (" . $PermCompany . ")";
        }

        if(!empty($Options['company'])){
            $CLAUSE .= " AND company = '" . $Options['company'] . "'";
        }

        if(!empty($Options['storeloc'])){
            $CLAUSE .= " AND storeloc = '" . $Options['storeloc'] . "'";
        }

        $Stock = 0;

        /**
         * Define Tanggal
         */
        $GetYear = date("Y", strtotime($Options['tanggal']));
        $GetMonth = date("n", strtotime($Options['tanggal']));
        $Awal = $GetYear . '-' . $GetMonth . '-01';
        //=> / END : Define Tanggal

        /**
         * Check Tanggal 
         * 
         * untuk kebutuhan perhitungan summary debit dan credit
         */
        $Q_SUM = $DB->Query(
            $Table['stock'],
            array(
                "SUM(debit)" => 'debit',
                "SUM(credit)" => 'credit'
            ),
            $CLAUSE . "
                AND
                    tanggal >= '" . $Awal . "' AND 
                    tanggal < '" . $Options['tanggal'] . "' AND
                    item = '" . $Options['item'] . "'
            "
        );
        $R_SUM = $DB->Row($Q_SUM);

        $TotalDebit = 0;
        $TotalCredit = 0;
        
        if($R_SUM > 0){
            $SUM = $DB->Result($Q_SUM);

            $TotalDebit = $SUM['debit'];
            $TotalCredit = $SUM['credit'];
        }
        //=> / END : Check Tanggal

        /**
         * Get Stock from DB
         */
        $Q_Stock = $DB->Query(
            $Table['ledger'],
            array(
                'SUM(opening)'    => 'stock'
            ),
            $CLAUSE . "
                AND
                    item = '" . $Options['item'] . "' AND 
                    year = '" . $GetYear . "' AND 
                    month = '" . $GetMonth . "'
            "
        );
        $R_Stock = $DB->Row($Q_Stock);
        if($R_Stock > 0){
            $Stock = $DB->Result($Q_Stock);
            $Stock = $Stock['stock'];
        }
        //=> / END : Get Stock from DB

        $Stock = $Stock + $TotalDebit - $TotalCredit;

        return $Stock;

    }
    //=> / END : Get Stock 2

    //=============== ABBR ===============
    static function Abbr( $strString, $intLength = 3 ) {

        /*if(strtoupper($strString) == $strString){
            $strString = strtolower($strString);
            $strString = ucwords($strString);
        }*/
        //$strString = ucwords($strString);

        $NewString = $Comma = "";
        $Normalize = explode(" ", $strString);
        for($i = 0; $i < sizeof($Normalize); $i++){

            $String = $Normalize[$i];
            if(strlen($String) > 3){
                $String = ucwords($Normalize[$i]);
            }

            $NewString .= $Comma . $String;
            $Comma = " ";

        }
        $strString = $NewString;

        $defaultAbbrevLength = 8; //Default abbreviation length if none is specified
        //Set up the string for processing
        $strString = preg_replace("/[^A-Za-z0-9]/", '', $strString);	//Remove non-alphanumeric characters
        $strString = ucfirst( $strString );	//Capitalize the first character (helps with abbreviation calcs)
        $stringIndex = 0;
        //Figure out everything we need to know about the resulting abbreviation string
        $uppercaseCount = preg_match_all('/[A-Z]/', $strString, $uppercaseLetters, PREG_OFFSET_CAPTURE);	//Record occurences of uppercase letters and their indecies in the $uppercaseLetters array, take note of how many there are
        $targetLength = isset( $intLength ) ? intval( $intLength ) : $defaultAbbrevLength; //Maximum length of the abbreviation
        $uppercaseCount = $uppercaseCount > $targetLength ? $targetLength : $uppercaseCount; //If there are more uppercase letters than the target length, adjust uppercaseCount to ignore overflow
        $targetWordLength = round( $targetLength / intval( $uppercaseCount ) );	//How many characters need to be taken from each uppercase-designated "word" in order to best meet the target length?
        $abbrevLength = 0;	//How long the abbreviation currently is
        $abbreviation = '';	//The actual abbreviation
        //Create respective arrays for the occurence indecies and the actual characters of uppercase characters within the string
        for($i = 0; $i < $uppercaseCount; $i++) {
            //$ucIndicies[] = $uppercaseLetters[1]; //Not actually used. Could be used to calculate abbreviations more efficiently than the routine below by strictly considering indecies
            $ucLetters[] = $uppercaseLetters[0][$i][0];
        }
        $characterDeficit = 0;	//Gets incremented when an uppercase letter is encountered before $targetCharsPerWord characters have been collected since the last UC char.
        $wordIndex = $targetWordLength;	//HACK: keeps track of how many characters have been carried into the abbreviation since the last UC char
        while( $stringIndex < strlen( $strString ) ) {	//Process the whole input string...
            if( $abbrevLength >= $targetLength ) //...unless the abbreviation has hit the target length cap
            break;
            $currentChar = $strString[ $stringIndex++ ];	//Grab a character from the string, advance the string cursor
            if( in_array( $currentChar, $ucLetters ) ) { //If handling a UC char, consider it a new word
                $characterDeficit += $targetWordLength - $wordIndex;	//If UC chars are closer together than targetWordLength, keeps track of how many extra characters are required to fit the target length of the abbreviation
                $wordIndex = 0;	//Set the wordIndex to reflect a new word
            } else if( $wordIndex >= $targetWordLength ) {
                if( $characterDeficit == 0 ) //If the word is full and we're not short any characters, ignore the character
                    continue;
                else
                    $characterDefecit--;	//If we are short some characters, decrement the defecit and carry on with adding the character to the abbreviation
            }
            $abbreviation .= $currentChar;	//Add the character to the abbreviation
            $abbrevLength++;	//Increment abbreviation length
            $wordIndex++;	//Increment the number of characters for this word
        }
        return $abbreviation;
    }
    //============== / ABBR ==============

    /**
     * Smart Satuan
     * 
     * fungsi yang digunakan untuk dapat mencocokan
     * inputan user dengan data pada database
     */
    static function SmartSatuan($Options = array()){

        // $DB = new DB;
        global $DB;

        $Table = array(
            'satuan'       => 'item_satuan'
        );

        $Satuan = $Options['satuan'];
        $SatuanNama = $Options['satuan_nama'];
        $SatuanKode = $Options['satuan_kode'];

        if(empty($SatuanKode)){
            //echo "ERROR : Satuan Cannot be Empty";
            $DB->LogError("ERROR : Satuan Cannot be Empty");
            //exit();
        }

        $return = [];

        if(empty($Satuan)){

            //=> Check Satuan
            $Q_CheckSatuan = $DB->Query(
                $Table['satuan'],
                array(
                    'id',
                    'kode',
                    'nama'
                ),
                "
                    WHERE
                        LOWER(REPLACE(nama, ' ', '')) = '" . strtolower(str_replace(" ", "", $SatuanKode)) . "' OR
                        LOWER(REPLACE(kode, ' ', '')) = '" . strtolower(str_replace(" ", "", $SatuanKode)) . "'

                "
            );
            $R_CheckSatuan = $DB->Row($Q_CheckSatuan);
            if($R_CheckSatuan > 0){

                //=> Select Existing Satuan
                $CheckSatuan = $DB->Result($Q_CheckSatuan);
                $Satuan = $CheckSatuan['id'];

                $return = array(
                    'id'        => $CheckSatuan['id'],
                    'kode'      => $CheckSatuan['kode'],
                    'nama'      => $CheckSatuan['nama'],
                );
            }else{

                //=> Create new subjek
                if($DB->Insert(
                    $Table['satuan'],
                    array(
                        'kode'      => $SatuanNama,
                        'nama'      => $SatuanNama,
                    )
                )){

                    //=> Select Last Satuan
                    $CheckSatuan = $DB->Result($DB->Query(
                        $Table['satuan'],
                        array(
                            'id',
                            'kode',
                            'nama'
                        ),
                        "WHERE nama = '" . $SatuanNama . "' ORDER BY id DESC"
                    ));

                    $Satuan = $CheckSatuan['id'];
                    $SatuanNama = $CheckSatuan['nama'];

                    $return = array(
                        'id'        => $CheckSatuan['id'],
                        'kode'      => $CheckSatuan['kode'],
                        'nama'      => $CheckSatuan['nama'],
                    );

                }

            }

        }else{
            $return = array(
                'id'        => $Options['satuan'],
                'kode'      => $Options['satuan_kode'],
                'nama'      => $Options['satuan_nama'],
            );
        }

        return $return;

    }
    //=> / END : Smart Satuan

    /**
     * Get Stock
     * 
     * class yang digunakan untuk mendapatkan jumlah stock
     * pada storloc tertentu sesuai dengan company dan item
     */
    static function GetStockItem($Options = array()){

        //=> / Initialize DB
        // $DB = new DB;
        global $DB;

        //=> Array DB Table
        $Table = array(
            'storeloc'      => 'storeloc',
            'stock'         => 'storeloc_stock',
            'item'          => 'item'
        );

        $return = [];

        if(
            empty($Options['company']) || 
            empty($Options['storeloc']) || 
            empty($Options['item'])
        ){
            $return = array(
                "stock"      => "Error",
                "price"      => "Error"
            );
        }else{

            /**
             * Get Stock from DB
             */
            $Q_Stock = $DB->Query(
                $Table['stock'],
                array(
                    'stock',
                    'price'
                ),
                "
                    WHERE
                        company = '" . $Options['company'] . "' AND 
                        storeloc = '" . $Options['storeloc'] . "' AND 
                        item = '" . $Options['item'] . "'
                "
            );
            $R_Stock = $DB->Row($Q_Stock);
            if($R_Stock > 0){
                $Stock = $DB->Result($Q_Stock);

                $return = $Stock;
            }
            //=> / END : Get Stock From DB

        }

        return $return;

    }
    //=> / END : Get Stock

    /**
     * GetStockAll
     * 
     * class yang digunakan untuk mendapatkan jumlah stock pada
     * semua storeloc yang ada sesuai dengan parameter yang digunakan
     * 
     * OPTIONS:
     * - *Company = id company
     * - *Item = item id
     * - storeloc = item storeloc
     */
    static function GetStockAll($Options = array()){

        //=> / Initialize DB
        // $DB = new DB;
        global $DB;

        //=> Array DB Table
        $Table = array(
            'storeloc'      => 'storeloc',
            'stock'         => 'storeloc_stock',
            'item'          => 'item'
        );

        $STOCK = 0;

        if(empty($Options['company']) || empty($Options['item'])){
            $STOCK = "Stock Error";
        }else{

            /**
             * Define Clause
             */
            $CLAUSE = "WHERE id != ''";
            if($Options['company']){
                $CLAUSE .= " 
                    AND 
                        company = '" . $Options['company'] . "'
                ";
            }

            if($Options['item']){
                $CLAUSE .= " 
                    AND 
                        item = '" . $Options['item'] . "'
                ";
            }

            if($Options['storeloc']){
                $CLAUSE .= " 
                    AND 
                        storeloc = '" . $Options['storeloc'] . "'
                ";
            }
            //=> / END : Define Clause

            /**
             * Get Stock from DB
             */
            $Q_Stock = $DB->Query(
                $Table['stock'],
                array(
                    'SUM(stock)'    => 'stock'
                ),
                $CLAUSE . "
                    GROUP BY 
                        item
                "
            );
            $R_Stock = $DB->Row($Q_Stock);
            if($R_Stock > 0){
                $Stock = $DB->Result($Q_Stock);

                $STOCK = $Stock['stock'];
            }
            //=> / END : Get Stock From DB

        }

        return $STOCK;

    }
    //=> / END : GetStockAll

    /**
     * JurnalPosting
     * 
     * Options:
     * 
     * trx_type
     * tipe = debit / credit
     * company
     * coa
     * value
     */
    static function JurnalPosting($Options = array()){

        // $DB = new DB;
        global $DB;

        $return = [];

        if(empty($Options['tipe'])){
            //echo "Please define transaction type Credit / Debit";
            $DB->LogError("Please define transaction type Credit / Debit");
            //exit();
        }

        if( 
            empty($Options['trx_type']) || 
            empty($Options['company']) || 
            empty($Options['source']) ||
            empty($Options['target']) ||
            empty($Options['currency']) ||
            empty($Options['rate']) ||
            empty($Options['coa']) ||
            empty($Options['value'] ||
            empty($Options['tanggal']))
        ){
            // print_r($Options);
            //echo "Mandatory field JS = trx_type, company, coa, currency, rate, source, target, value, tanggal";
            $DB->LogError("Mandatory field JS = trx_type, company, coa, currency, rate, source, target, value, tanggal => " . json_encode($Options));
            //exit();
        }

        if($Options['coa'] == 0){
            //echo "Please define transaction coa";
            $DB->LogError("Please define transaction coa");
            //exit();
        }

        /**
         * Select Trxtype
         */
        $Q_Trxtype = $DB->Query(
            "trx_type",
            array(
                'id',
                'doc_source',
                'doc_nama'
            ),
            "
            WHERE 
                id = '" . $Options['trx_type'] . "'
            "
        );
        $R_Trxtype = $DB->Row($Q_Trxtype);
        if($R_Trxtype > 0){
            $Trxtype = $DB->Result($Q_Trxtype);
        }
        //=> / END : Select Trxtype

        /**
         * Select Company
         */
        $Q_Company = $DB->QueryOn(
            DB['master'],
            "company",
            array(
                'id',
                'nama',
                'abbr'        
            ),
            "
            WHERE 
                id = '" . $Options['company'] . "'
            "
        );
        $R_Company = $DB->Row($Q_Company);
        if($R_Company > 0){
            $Company = $DB->Result($Q_Company);
        }
        //=> / END : Select Company

        /**
         * Select COA Master
         */
        $Q_COAMaster = $DB->Query(
            "coa_master",
            array(
                'id',
                'kode',
                'nama'
            ),
            "
            WHERE 
                id = '" . $Options['coa'] . "'
                AND company = '" . $Options['company'] . "'
            "
        );
        $R_COAMaster = $DB->Row($Q_COAMaster);
        if($R_COAMaster > 0){
            $COAMaster = $DB->Result($Q_COAMaster);

            /**
             * Field Jurnal
             */
            $Field = array(
                'doc_id'            => $Trxtype['id'],
                'doc_source'        => $Trxtype['doc_source'],
                'doc_nama'          => $Trxtype['doc_nama'],
                'company'           => $Company['id'],
                'company_abbr'      => $Company['abbr'],
                'company_nama'      => $Company['nama'],
                'coa'               => $COAMaster['id'],
                'coa_kode'          => $COAMaster['kode'],
                'coa_nama'          => $COAMaster['nama'],
                'currency'          => $Options['currency'],
                'rate'              => $Options['rate'],
                'source_kode'       => $Options['source'],
                'target_kode'       => $Options['target'],
                'item'              => $Options['item'],
                'tanggal'           => $Options['tanggal'],
                'create_by'         => Core::GetState('id'),
                'create_date'       => date("Y-m-d H:i:s"),
            );
            if($Options['tipe'] == "debit"){    // MASUK
                $Field['debit_orig'] = $Options['value'];
                $Field['debit'] = $Options['value'] * $Options['rate'];
            }elseif($Options['tipe'] == "credit"){ // Keluar
                $Field['credit_orig'] = $Options['value'] * -1;
                $Field['credit'] = ($Options['value']  * $Options['rate']) * -1;
            }

            if(!empty($Options['item']) && isset($Options['item'])){
                $Field['item'] = $Options['item'];
            }

            if(!empty($Options['target_2']) && isset($Options['target_2'])){
                $Field['item'] = $Options['target_2'];
            }

            if(!empty($Options['qty']) && isset($Options['qty'])){
                $Field['qty'] = $Options['qty'];
            }

            if(!empty($Options['cost_center']) && isset($Options['cost_center'])){
                $Q_CostCenter = $DB->Query(
                    "cost_center",
                    array(
                        'id',
                        'kode',
                        'nama'
                    ),
                    "
                    WHERE 
                        id = '" . $Options['cost_center'] . "'
                        AND company = '" . $Options['company'] . "'
                        AND status = 1
                    "
                );
                $R_CostCenter = $DB->Row($Q_CostCenter);
                if($R_CostCenter > 0){
                    $CostCenter = $DB->Result($Q_CostCenter);

                    $Field['cost_center'] = $CostCenter['id'];
                    $Field['cost_center_kode'] = $CostCenter['kode'];
                    $Field['cost_center_nama'] = $CostCenter['nama'];
                }
            }

            if(!empty($Options['keterangan']) && isset($Options['keterangan'])){
                $Field['keterangan'] = $Options['keterangan'];
            }
            if(!empty($Options['kode']) && isset($Options['kode'])){
                $Field['ref_kode'] = $Options['kode'];
            }
            //=> / END : Field Jurnal

            /**
             * Insert to Jurnal Balance
             */
            if($DB->Insert(
                "journal",
                $Field
            )){
                /**
                 * Update Balance
                 */
                $UpdateBalance = App::UpdateJournalBalance(array(
                    'tipe'          => $Options['tipe'],
                    'year'          => (int)date("Y", strtotime($Options['tanggal'])),
                    'month'         => (int)date("m", strtotime($Options['tanggal'])),
                    'company'       => $Company['id'],
                    'company_abbr'  => $Company['abbr'],
                    'company_nama'  => $Company['nama'],
                    'coa'           => $COAMaster['id'],
                    'coa_kode'      => $COAMaster['kode'],
                    'coa_nama'      => $COAMaster['nama'],
                    'value'         => $Options['value']
                ));
                // => / END : Update Balance

                $return = array(
                    'status'    => 1,
                    'msg'       => 'Insert Jurnal Posting Success',
                    'update'    => $UpdateStock['action']
                );

            }else{
                $return = array(
                    'status'    => 0,
                    'msg'       => 'Insert Jurnal Posting Failed'
                );
            }
            //=> / END : Insert to Jurnal Stock
        }
        //=> / END : Select COA Master

        return $return;

    }
    //=> / END : JurnalPosting

    /**
     * Update Journal Balance
     * 
     * OPTIONS:
     * year
     * month
     * company
     * company_abbr
     * company_nama
     * coa
     * coa_kode
     * coa_nama
     * balance
     */
    static function UpdateJournalBalance($Options = array()){

        // $DB = new DB;
        global $DB;

        $return = [];

        $Table = "journal_balance";

        if(empty($Options['tipe'])){
            //echo "Please define transaction type Credit / Debit";
            $DB->LogError("Please define transaction type Credit / Debit");
            //exit();
        }

        if(
            empty($Options['year']) || 
            empty($Options['month']) || 
            empty($Options['company']) || 
            empty($Options['coa'])
        ){
            //print_r($Options);

            //echo "Mandatory field US = year, month, company, coa, value";
            $DB->LogError("Mandatory field US = year, month, company, coa " . json_encode($Options));
            //exit();
        }
        
        /**
         * Check COA Balance
         */
        $Q_Check = $DB->Query(
            $Table,
            array(
                'id',
                'balance'
            ),
            "
                WHERE
                    company = '" . $Options['company'] . "' AND 
                    coa = '" . $Options['coa'] . "'  AND 
                    year = '" . $Options['year'] . "'  AND 
                    month = '" . $Options['month'] . "'
            "
        );
        $R_Check = $DB->Row($Q_Check);
        if($R_Check == 1){
            $Check = $DB->Result($Q_Check);

            if($Options['tipe'] == 'debit'){
                $Field = array(
                    'balance'     => $Check['balance'] + $Options['value'],
                    'update_by'     => Core::GetState('id'),
                    'update_date'   => date("Y-m-d H:i:s")
                );
            }else{
                $Field = array(
                    'balance'     => $Check['balance'] + ($Options['value'] * -1),
                    'update_by'     => Core::GetState('id'),
                    'update_date'   => date("Y-m-d H:i:s")
                );
            }

            if($DB->Update(
                $Table,
                $Field,
                "id = '" . $Check['id'] . "'"
            )){
                $return = array(
                    'action'    => 'Update COA Balance',
                    'status'    => 1
                );
            }else{

            }
        }else{
            $Q_Check = $DB->Query(
                $Table,
                array(
                    'id',
                    'balance'
                ),
                "
                    WHERE
                        company = '" . $Options['company'] . "' AND 
                        coa = '" . $Options['coa'] . "'  AND 
                        STR_TO_DATE(CONCAT('01-',MONTH,'-',YEAR),'%d-%m-%Y') <= STR_TO_DATE(CONCAT('01-'," . $Options['month'] . ",'-'," . $Options['year'] . "),'%d-%m-%Y')
                        ORDER BY STR_TO_DATE(CONCAT('01-',MONTH,'-',YEAR),'%d-%m-%Y') DESC
                "
            );
            $R_Check = $DB->Row($Q_Check);
            if($R_Check >= 1){
                $i = 0;
                $lastCOABalance = 0;
                $finalCOABalance = 0;
                while($COABalance = $DB->Result($Q_Check)){
                    if($i == 0){
                        $lastCOABalance = $COABalance['balance'];
                        if($Options['tipe'] == 'debit'){
                            $finalCOABalance = $COABalance['balance'] + $Options['value'];
                        }else{
                            $finalCOABalance = $COABalance['balance'] + ($Options['value'] * -1);
                        }
                    }
                    $i++;
                }

                /**
                 * Create new coa balance
                 */
                if($DB->Insert(
                    $Table,
                    array(
                        'year'          => $Options['year'],
                        'month'         => $Options['month'],
                        'company'       => $Options['company'],
                        'company_abbr'  => $Options['company_abbr'],
                        'company_nama'  => $Options['company_nama'],
                        'coa'           => $Options['coa'],
                        'coa_kode'      => $Options['coa_kode'],
                        'coa_nama'      => $Options['coa_nama'],
                        'opening_balance'       => $lastCOABalance,
                        'balance'       => $finalCOABalance,
                        'create_by'     => Core::GetState('id'),
                        'create_date'   => date("Y-m-d H:i:s")
                    )
                )){
                    $return = array(
                        'action'    => 'Create COA Balance [' . $Options['year'] . ',' . $Options['month'] . ',' . $Options['company'] . ',' . $Options['coa'] . ']',
                        'status'    => 1
                    );
                }else{
    
                }
                //=> / END : Create new coa balance
            }
            else{
    
                /**
                 * Create new coa balance
                 */
                if($Options['tipe'] == 'debit'){
                    $COABalance = $Options['value'];
                }else{
                    $COABalance = ($Options['value'] * -1);
                }

                if($DB->Insert(
                    $Table,
                    array(
                        'year'          => $Options['year'],
                        'month'         => $Options['month'],
                        'company'       => $Options['company'],
                        'company_abbr'  => $Options['company_abbr'],
                        'company_nama'  => $Options['company_nama'],
                        'coa'           => $Options['coa'],
                        'coa_kode'      => $Options['coa_kode'],
                        'coa_nama'      => $Options['coa_nama'],
                        'opening_balance'       => 0,
                        'balance'       => $COABalance,
                        'create_by'     => Core::GetState('id'),
                        'create_date'   => date("Y-m-d H:i:s")
                    )
                )){
                    $return = array(
                        'action'    => 'Create COA Balance [' . $Options['year'] . ',' . $Options['month'] . ',' . $Options['company'] . ',' . $Options['coa'] . ']',
                        'status'    => 1
                    );
                }else{
    
                }
                //=> / END : Create new coa balance
            }

        }
        //=> / END : Check COA Balance

        return $return;

    }
    //=> / END : Update Journal Balance

    /**
     * Update Bank Balance
     * 
     * OPTIONS:
     * year
     * month
     * company
     * bank
     * company_bank
     * currency
     * value
     */
    static function UpdateBankBalance($Options = array()){

        // $DB = new DB;
        global $DB;

        $return = [];

        $Table = "company_bank_ledger";

        if(empty($Options['tipe'])){
            $DB->LogError("Please define transaction type Credit / Debit");
        }

        if(
            empty($Options['year']) || 
            empty($Options['month']) || 
            empty($Options['company']) || 
            empty($Options['company_bank'])
        ){
            $DB->LogError("Mandatory field US = year, month, company, company_bank " . json_encode($Options));
        }
        
        /**
         * Check Bank Balance
         */
        $Q_Check = $DB->Query(
            $Table,
            array(
                'id',
                'closing'
            ),
            "
                WHERE
                    company = '" . $Options['company'] . "' AND 
                    company_bank = '" . $Options['company_bank'] . "'  AND 
                    year = '" . $Options['year'] . "'  AND 
                    month = '" . $Options['month'] . "'
            "
        );
        $R_Check = $DB->Row($Q_Check);
        if($R_Check == 1){
            $Check = $DB->Result($Q_Check);

            if($Options['tipe'] == 'debit'){
                $Field = array(
                    'closing'       => $Check['closing'] + $Options['value']
                );
            }else{
                $Field = array(
                    'closing'       => $Check['closing'] - $Options['value']
                );
            }

            if($DB->Update(
                $Table,
                $Field,
                "id = '" . $Check['id'] . "'"
            )){
                $return = array(
                    'action'    => 'Update Bank Balance',
                    'status'    => 1
                );
            }
        }else{
            $Q_Check = $DB->Query(
                $Table,
                array(
                    'id',
                    'closing'
                ),
                "
                    WHERE
                        company = '" . $Options['company'] . "' AND 
                        company_bank = '" . $Options['company_bank'] . "'  AND 
                        STR_TO_DATE(CONCAT('01-',MONTH,'-',YEAR),'%d-%m-%Y') <= STR_TO_DATE(CONCAT('01-'," . $Options['month'] . ",'-'," . $Options['year'] . "),'%d-%m-%Y')
                        ORDER BY STR_TO_DATE(CONCAT('01-',MONTH,'-',YEAR),'%d-%m-%Y') DESC
                        LIMIT 1
                "
            );
            $R_Check = $DB->Row($Q_Check);
            if($R_Check > 0){
                $i = 0;
                $lastBankBalance = 0;
                $finalBankBalance = 0;
                $BankBalance = $DB->Result($Q_Check);

                $lastBankBalance = $BankBalance['closing'];
                if($Options['tipe'] == 'debit'){
                    $finalBankBalance = $BankBalance['closing'] + $Options['value'];
                }else{
                    $finalBankBalance = $BankBalance['closing'] - $Options['value'];
                }

                /**
                 * Create new coa balance
                 */
                if($DB->Insert(
                    $Table,
                    array(
                        'year'          => $Options['year'],
                        'month'         => $Options['month'],
                        'company'       => $Options['company'],
                        'bank'          => $Options['bank'],
                        'company_bank'  => $Options['company_bank'],
                        'no_rekening'   => $Options['no_rekening'],
                        'currency'      => $Options['currency'],
                        'opening'       => $lastBankBalance,
                        'closing'       => $finalBankBalance,
                        'status'        => 1
                    )
                )){
                    $return = array(
                        'action'    => 'Create Bank Balance [' . $Options['year'] . ',' . $Options['month'] . ',' . $Options['company'] . ',' . $Options['company_bank'] . ']',
                        'status'    => 1
                    );
                }
                //=> / END : Create new coa balance
            }
            else{
    
                /**
                 * Create new coa balance
                 */
                if($Options['tipe'] == 'debit'){
                    $BankBalance = $Options['value'];
                }else{
                    $BankBalance = ($Options['value'] * -1);
                }

                if($DB->Insert(
                    $Table,
                    array(
                        'year'          => $Options['year'],
                        'month'         => $Options['month'],
                        'company'       => $Options['company'],
                        'bank'          => $Options['bank'],
                        'company_bank'  => $Options['company_bank'],
                        'no_rekening'   => $Options['no_rekening'],
                        'currency'      => $Options['currency'],
                        'opening'       => 0,
                        'closing'       => $BankBalance,
                        'status'        => 1
                    )
                )){
                    $return = array(
                        'action'    => 'Create Bank Balance [' . $Options['year'] . ',' . $Options['month'] . ',' . $Options['company'] . ',' . $Options['company_bank'] . ']',
                        'status'    => 1
                    );
                }
                //=> / END : Create new bank balance
            }

        }
        //=> / END : Check Bank Balance

        return $return;

    }
    //=> / END : Update Bank Balance

    /**
     * Oil Movement Journal
     * 
     * Options:
     * 
     * sounding : id sounding detail
     * 
     * Example
     * 
     * App::OilMove(sounding_id)
     */
    // static function OilMove($Options = array()){
    static function OilMove($ID){

        global $DB;

        $Table = array(
            'jurnal' => 'oil_move',
            'sounding' => 'sounding',
            'detail' => 'sounding_detail'
        );

        $return = [];

        // if(empty($Options['tipe'])){
        //     //echo "Please define transaction type Credit / Debit";
        //     //exit();
        // }

        if(
            // empty($Options['company']) || 
            //empty($Options['dept']) || 
            // empty($Options['storeloc']) || 
            // empty($Options['qty']) || 
            // empty($Options['tanggal']) || 
            empty($ID)
        ){
            // //print_r($Options);
            $error_msg = "Detail ID Empty";
            $DB->LogError($error_msg);
            //exit();
        }

        /**
         * Header
         */
        $Q_Header = $DB->Query(
            $Table['sounding'],
            array(),
            "
                WHERE id = $ID
            "
        );
        $R_Header = $DB->Row($Q_Header);
        if($R_Header <= 0){

            $return = array(
                'status' => 0,
                'error_msg' => 'ID Sounding is not valid'
            );

            $DB->LogError($return['error_msg']);

            //echo Core::ReturnData($return);
            //exit();
        }

        $Header = $DB->Result($Q_Header);
        //=> / END : Header

        /**
         * Detail
         */
        $Q_Detail = $DB->Query(
            $Table['detail'],
            array(),
            "
                WHERE
                    header = $ID
            "
        );
        $R_Detail = $DB->Row($Q_Detail);
        if($R_Detail > 0){
            while($Detail = $DB->Result($Q_Detail)){

                $QTY = $Detail['weight'];

                // $PrevDate = date("Y-m-d", strtotime($Options['tanggal']) - (time() - strtotime("-1 days")));

                /**
                 * Get And update Previous Data
                 */
                $Q_Prev = $DB->Query(
                    $Table['jurnal'],
                    array(
                        'id',
                        'opening',
                        'closing'
                    ),
                    "
                        WHERE
                            company = $Header[company] AND 
                            storeloc = $Detail[storeloc]
                        ORDER BY 
                            create_date DESC
                    "
                );
                $R_Prev = $DB->Row($Q_Prev);
                $ClosePrev = 0;
                if($R_Prev > 0){

                    $Prev = $DB->Result($Q_Prev);

                    /**
                     * Check Receive or Issued
                     */
                    $Receive = $QTY - $Prev['opening'];
                    $Issued = $Prev['opening'] - $QTY;

                    $UpdateFields = array(
                        'closing' => $QTY
                    );

                    if($Receive > 0){
                        $Issued = 0;
                        $UpdateFields['receive'] = $Receive;
                    }else{
                        $Receive = 0;
                        $UpdateFields['issued'] = $Issued;
                    }
                    //=> / END : Check Receive or Issued

                    /**
                     * Edit Previous Close = Current QTY
                     */
                    $DB->Update(
                        $Table['jurnal'],
                        $UpdateFields,
                        "id = $Prev[id]"
                    );
                    //=> / END : Edit Previous Close = Current QTY

                    $ClosePrev = $QTY;
                }
                //=> / END : Get And update Previous Day

                /**
                 * Insert Today
                 */
                $InsertFields = array(
                    'company' => $Header['company'],
                    'company_abbr' => $Header['company_abbr'],
                    'company_nama' => $Header['company_nama'],
                    'sounding_detail' => $Detail['id'], // SOUNDING DETAIL ID            
                    'tanggal' => $Header['tanggal'],
                    'produk' => $Detail['produk'],
                    'storeloc' => $Detail['storeloc'],
                    'storeloc_kode' => $Detail['storeloc_kode'],
                    'storeloc_nama' => $Detail['storeloc_nama'],
                    'tinggi' => $Detail['tinggi'],
                    'tinggi_meja' => $Detail['tinggi_meja'],
                    'tabel' => $Detail['tabel'],
                    'temp' => $Detail['temp'],
                    'density' => $Detail['density'],
                    'faktor_koreksi' => $Detail['faktor_koreksi'],
                    'volume' => $Detail['volume'],
                    'weight' => $Detail['weight'],
                    'opening' => $ClosePrev,
                    // 'receive',
                    // 'issued',
                    // 'closing',
                    'create_by' => Core::GetState('id'),
                    'create_date' => date("Y-m-d H:i:s"),
                );
                //=> / END : Insert Today

                if($DB->Insert(
                    $Table['jurnal'],
                    $InsertFields
                )){
                    $return[] = array(
                        'status' => 1
                    );
                }else{
                    $return[] = array(
                        'status' => 0
                    );
                }

            }
        }
        //=> / END : Detail

        return $return;

    }
    //=> / END: Oil Movement Journal
}
?>