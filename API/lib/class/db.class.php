<?php
define ("DB_USER", $DB_U);
define ("DB_PASS", $DB_P);
define ("DB_HOST", $DB_S);
define ("DB_NAME", $DB_DB);

if(!isset($DB_PORT)){
    $DB_PORT = 3306;
}

define ("DB_PORT", $DB_PORT);

class DB {

    protected $conn = null;

    public function __construct(){
        try {
            $this->conn = new mysqli(
                DB_HOST,
                DB_USER,
                DB_PASS,
                DB_NAME,
                DB_PORT
            );

            mysqli_set_charset($this->conn,"utf8");

            $this->conn->autocommit(FALSE);
        } catch ( Exception $e ){
            die ('Unable to connect to database ' . strtoupper(DB_NAME));
        }
    }

    public function __destruct(){
        if($this->conn){
            $this->disconnect();
        }
    }

    static function Conn(){
        return new mysqli(
            DB_HOST,
            DB_USER,
            DB_PASS,
            DB_NAME,
            DB_PORT
        );
    }

    public function Ping($host){
        $port = 3306; 
        $waitTimeoutInSeconds = 1; 
        try{
            if($fp = fsockopen($host,$port,$errCode,$errStr,$waitTimeoutInSeconds)){   
                return true;
            } else {
                return false;
            } 
            fclose($fp);
        }
        catch ( Exception $e ){
            return false;
        }
    }

    public function real_escape_string($String){
        return $this->conn->real_escape_string($String);
    }

    public function disconnect(){
        $this->conn->close();
    }

    public function Instance(){
        return $this->conn;
    }

    /* BEGIN Table Exists */
    private function table_exist($table, $db){

        $this->conn->select_db($db);
        $Q = $this->conn->query("
            SHOW TABLES LIKE '" . $table . "'
        ") or die (mysqli_error());

        if(mysqli_num_rows($Q)){
            return true;
        }else{
            return false;
        }

    }
    /* END Table Exists */

    /* BEGIN DBJoin */
    private function DBJoinArray($array){

        $nr = 0;
        $query = '';
        foreach ($array as $key => $value) {
            if (is_object($value) || is_array($value) || is_bool($value)) {
                $value = serialize($value);
            }
            $query .= " '" . $this->conn->real_escape_string($value) . "'";
            $nr++;
            if ($nr != count($array)) {
                $query .= ',';
            }
        }
        return trim($query);

    }
    /* END DBJoin */

    /* BEGIN NotExists */
    private function Error($Type = "", $String = ""){

        $return = [];

        switch($Type){

            case "not_exist": 
                $return = array(
                    'status'        => 0,
                    'error_msg'     => 'SQL Query Error: Please Check table "' . $String . '", it does not exist'
                );
                break;

            case "db_not_exist": 
                $return = array(
                    'status'        => 0,
                    'error_msg'     => 'SQL Query Error: Please Check Database "' . $String . '", it does not exist'
                );
                break;

            default:
                $return = array(
                    'status'        => 0,
                    'error_msg'     => 'SQL Query Error: Please Check table "' . $String . '", it does not exist'
                );
        }

        return $return;

    }
    /** END NotExists */

    /** BEGIN DBInsert */
    public function Insert($Table, $Fields = array()){

        $this->conn->select_db(DBDEF);
        if($this->table_exist($Table, DBDEF)){

            $Query = "INSERT INTO `$Table`";

            //=> Extract Fields
            if(is_array($Fields)){

                $Query .= ' (';

                $num = 0;
                foreach($Fields as $key => $value){
                    $Query .= ' `' . $key . '`';
                    $num++;
                    if($num != count($Fields)){
                        $Query .= ',';
                    }
                }

                $Query .= ' ) VALUES ( ' . $this->DBJoinArray($Fields) . ' )';

            }else{

                $Query .= ' ' . $Table . ' VALUES (' . $Fields . ')';

            }

            /*if($this->conn->query($Query)){
                return true;
            }else{
                echo "Error Insert " . $Table . " : " . $this->conn->error;
            }*/

            $return = $this->conn->query($Query)  or die(
                $Query . "\n" . 
                "================\n" . 
                "Table " . DBDEF . "." . $Table . "\n" . 
                "================\n" . 
                $this->conn->error
            );

            return $return;

        }else{
            return $this->Error('not_exist', $Table);
        }

    }
    /** END DBInsert */

    /** BEGIN InsertON */
    public function InsertOn($DBName, $Table, $Fields = array()){

        if($this->conn->select_db($DBName)){

            if($this->table_exist($Table, $DBName)){

                $Query = "INSERT INTO `$Table`";
                
                //=> Extract Fields
                if(is_array($Fields)){
    
                    $Query .= ' (';
    
                    $num = 0;
                    foreach($Fields as $key => $value){
                        $Query .= ' `' . $key . '`';
                        $num++;
                        if($num != count($Fields)){
                            $Query .= ',';
                        }
                    }
    
                    $Query .= ' ) VALUES ( ' . $this->DBJoinArray($Fields) . ' )';
    
                }else{
    
                    $Query .= ' ' . $Table . ' VALUE (' . $Fields . ')';
    
                }
    
                //return $this->conn->query($Query);
                /*if($this->conn->query($Query)){
                    return true;
                }else{
                    echo "Error Insert ON " . $DBName . "." . $Table . " : " . $this->conn->error;
                }*/

                $return = $this->conn->query($Query)  or die(
                    $Query . "\n" . 
                    "================\n" . 
                    "Table " . $DBName . "." . $Table . "\n" . 
                    "================\n" . 
                    $this->conn->error
                );

                return $return;

            }else{
                return $this->Error('not_exist', $Table);
            }

        }else{
            return $this->Error('db_not_exist', $DBName);
        }

    }
    /** END InsertON */

    /** BEGIN Update */
    public function Update($Table, $Fields = array(), $Where){
        if(empty($Where)){
            echo 'Where clause is mandatory for update method';
            exit();
        }else{

            $this->conn->select_db(DBDEF);
            $Query = "UPDATE `" . $Table . "` SET";

            if(is_array($Fields)){
                $i = 0;
                foreach($Fields AS $Key => $Value){

                    if(
                        is_object($Value) || 
                        is_array($Value) || 
                        is_bool($Value)
                    ){
                        $Value = serialize($Value);
                    }

                    $Query .= " `" . $Key . "`='" . $this->conn->real_escape_string($Value) . "'";

                    $i++;
                    if($i != sizeof($Fields)){
                        $Query .= ',';
                    }

                }
            }else{
                $Query .= ' ' . $Fields;
            }
            if(!empty($Where)){
                $Query .= " WHERE " . $Where;
            }

            //return $this->conn->query($Query);
            /*if($this->conn->query($Query)){
                return true;
            }else{
                echo "Error Update " . $Table . " : " . $this->conn->error;
            }*/

            $return = $this->conn->query($Query)  or die(
                $Query . "\n" . 
                "================\n" . 
                "Table " . DBDEF . "." . $Table . "\n" . 
                "================\n" . 
                $this->conn->error
            );

            return $return;

        }
    }
    /** END Update */

    /** BEGIN UpdateOn */
    public function UpdateOn($DBName, $Table, $Fields = array(), $Where){
        if(empty($Where)){
            echo 'Where clause is mandatory for update method';
            exit();
        }else{

            if($this->conn->select_db($DBName)){

                $Query = "UPDATE `" . $DBName . "`.`" . $Table . "` SET";
                
                if(is_array($Fields)){
                    $i = 0;
                    foreach($Fields AS $Key => $Value){
    
                        if(
                            is_object($Value) || 
                            is_array($Value) || 
                            is_bool($Value)
                        ){
                            $Value = serialize($Value);
                        }
    
                        $Query .= " `" . $Key . "`= '" . $this->conn->real_escape_string($Value) . "'";
    
                        $i++;
                        if($i != sizeof($Fields)){
                            $Query .= ',';
                        }
    
                    }
                }else{
                    $Query .= ' ' . $Fields;
                }
                if(!empty($Where)){
                    $Query .= " WHERE " . $Where;
                }
    
                //return $this->conn->query($Query);
                /*if($this->conn->query($Query)){
                    return true;
                }else{
                    echo "Error Update ON " . $DBName . "." . $Table . " : " . $this->conn->error;
                }*/

                $return = $this->conn->query($Query)  or die(
                    $Query . "\n" . 
                    "================\n" . 
                    "Table " . $DBName . "." . $Table . "\n" . 
                    "================\n" . 
                    $this->conn->error
                );

                return $return;

            }else{
                return $this->Error('db_not_exist', $DBName);
            }

        }
    }
    /** END UpdateOn */

    /** BEGIN Delete */
    public function Delete($Table, $Where){

        $this->conn->select_db(DBDEF);
        if($this->table_exist($Table, DBDEF)){
            //return $this->conn->query("DELETE FROM $Table WHERE $Where");
            $Query = "DELETE FROM $Table WHERE $Where";
            $return = $this->conn->query($Query)  or die(
                $Query . "\n" . 
                "================\n" . 
                "Table " . DBDEF . "." . $Table . "\n" . 
                "================\n" . 
                $this->conn->error
            );

            return $return;
        }else{
            return $this->Error('not_exist', $Table);
        }

    }
    /** END Delete */

    /** BEGIN DeleteOn */
    public function DeleteOn($DBName, $Table, $Where){

        if($this->conn->select_db($DBName)){
            if($this->table_exist($Table, $DBName)){
                //return $this->conn->query("DELETE FROM $Table WHERE $Where");
                $Query = "DELETE FROM $Table WHERE $Where";
                $return = $this->conn->query($Query)  or die(
                    $Query . "\n" . 
                    "================\n" . 
                    "Table " . $DBName . "." . $Table . "\n" . 
                    "================\n" . 
                    $this->conn->error
                );

                return $return;
            }else{
                return $this->Error('not_exist', $Table);
            }
        }else{
            return $this->Error('db_not_exist', $DBName);
        }

    }
    /** END DeleteOn */

    /** BEGIN DBQuery */
    public function Query(
        $Table, 
        $Fields = array(), 
        $Next = ''
    ){

        $this->conn->select_db(DBDEF);
        if($this->table_exist($Table, DBDEF)){

            $Columns = $Query = '';

            if(is_array($Fields)){
                $i = 0;
                foreach($Fields as $key => $value){

                    if(!is_numeric($key)){
                        $Columns .= ' ' . $key . '';

                        if(!empty($value)){
                            $Columns .= ' AS ' . $value . '';
                        }
                    }else{
                        $Columns .= ' ' . $value . '';
                    }

                    $i++;
                    if($i != count($Fields)){
                        $Columns .= ',';
                    }
                }

                if(empty($Columns)){
                    $Columns = '*';
                }
            }else{
                $Columns = '*';
            }

            $Query = "
                SELECT 
                    " . $Columns . "
                FROM 
                    " . $Table . "
                " . $Next . "
            ";

            $return = $this->conn->query($Query) or die(
                $Query . "\n" . 
                "================\n" . 
                "Table " . $Table . "\n" . 
                "================\n" . 
                $this->conn->error
            );

            return $return;

        }else{
            return $this->Error('not_exist', $Table);
        }

    }
    /** END DBQuery */

    public function LogError($MSG){
        error_log(CLEANHTML($MSG));
        if($this->conn){
            mysqli_rollback($this->conn);
        }
        $this->Insert(
            "_errlog",
            array(
                'logtime'   => date('Y-m-d H:i:s'),
                'msg'       => CLEANHTML($MSG),
                'create_by'		=> Core::GetState('id'),
	            'create_date'	=> date("Y-m-d H:i:s"),
                'filepath'  => $_SERVER['REQUEST_URI'],
            ),
            array(
                'noclone' => true
            )
        );
        if($this->conn){
            mysqli_commit($this->conn);
        }
        die($MSG);
    }

    public function Commit(){
        if($this->conn){
            mysqli_commit($this->conn);
        }
    }

    /** BEGIN QueryOn */
    public function QueryOn($DBName, $Table, $Fields = array(), $Next = ''){

        if($this->conn->select_db($DBName)){
            if($this->table_exist($Table, $DBName)){

                $Columns = $Query = '';

                if(is_array($Fields)){
                    $i = 0;
                    foreach($Fields as $key => $value){

                        if(!is_numeric($key)){
                            $Columns .= ' ' . $key . '';
    
                            if(!empty($value)){
                                $Columns .= ' AS ' . $value . '';
                            }
                        }else{
                            $Columns .= ' ' . $value . '';
                        }

                        $i++;
                        if($i != count($Fields)){
                            $Columns .= ',';
                        }
                    }
                }else{
                    $Columns = '*';
                }

                $Query = "
                    SELECT 
                        " . $Columns . "
                    FROM 
                        " . $Table . "
                    " . $Next . "
                ";

                $return = $this->conn->query($Query) or die(
                    $Query . "\n" . 
                    "================\n" . 
                    "Table " . $DBName . "." . $Table . "\n" . 
                    "================\n" . 
                    $this->conn->error
                );
    
                return $return;

            }else{
                return $this->Error('not_exist', $Table);
            }
        }else{
            return $this->Error('db_not_exist', $DBName);
        }

    }
    /** END QueryOn */

    /** BEGIN QueryPort */
    public function QueryPort($Query, $DBName = ""){

        if(empty($DBName)){
            $DBName = DBDEF;
        }

        if(!empty($Query)){

            if($this->conn->select_db($DBName)){
                $Result = $this->conn->query($Query) or die(
                    $Query . "\n" . 
                    "================\n" . 
                    "Database " . $DBName . "\n" . 
                    "================\n" . 
                    $this->conn->error
                );;
                if($Result){
                    return $Result;
                }else{
                    return $this->conn->error;
                }
            }else{
                return $this->Error('db_not_exist', $DBName);
            }

        }

    }
    /** END QueryPort */

    /** BEGIN QueryPort */
    public function QueryMulti($Query, $DBName = ""){

        if(empty($DBName)){
            $DBName = DBDEF;
        }

        if(!empty($Query)){

            if($this->conn->select_db($DBName)){
                $Result = $this->conn->multi_query($Query) or die(
                    $Query . "\n" . 
                    "================\n" . 
                    "Database " . $DBName . "\n" . 
                    "================\n" . 
                    $this->conn->error
                );;
                if($Result){
                    return $Result;
                }else{
                    return $this->conn->error;
                }
            }else{
                return $this->Error('db_not_exist', $DBName);
            }

        }

    }
    /** END QueryPort */

    /** BEGIN Row */
    public function Row($Query){
        if($Query->num_rows > 0){
            return $Query->num_rows;
        }
    }
    /** END Row */

    /** Begin Count */
    public function Count(
        $Table, 
        $Next = '',
        $QSql = '',
        $DBName = ''
    ){

        if(empty($DBName)){
            $DBName = DBDEF;
        }

        if(empty($QSql)){

            $Query = "
                SELECT 
                    COUNT(*) AS total
                FROM
                    $Table
                $Next
            ";

            $Query = $this->conn->query($Query) or die(
                $Query . "\n" . 
                "================\n" . 
                "Table " . $DBName . "." . $Table . "\n" . 
                "================\n" . 
                $this->conn->error
            );

        }else{

            //=> Clean QSql
            //$QSql = " AND " . substr($QSql, 1);
            //$QSql = str_replace(" AS relevance", " > 0", $QSql);

            $QSql = explode("AS", $QSql);
            $QSql = preg_replace('/,/', '', $QSql, 1);
            $QSql = " AND " . $QSql[0] . "> 0";

            //echo $Next . "====";
            //echo $QSql;

            $Query = "
                SELECT 
                    COUNT(*) AS total
                FROM
                    $Table
                $Next
                $QSql
            ";

            //echo $Query;

            $Query = $this->conn->query($Query) or die(
                $Query . "\n" . 
                "================\n" . 
                "Table " . $DBName . "." . $Table . "\n" . 
                "================\n" . 
                $this->conn->error
            );

        }

        $Result = $Query->fetch_array(MYSQLI_ASSOC);
        if($Result['total'] > 0){
            return $Result['total'];
        }else{
            return 0;
        }

    }
    /** END Count */

    /** BEGIN Result */
    public function Result($Query){
        if($Query){
            return $Query->fetch_array(MYSQLI_ASSOC);
        }
    }
    /** END Result */

    /** BEGIN Result */
    public function ResultRow($Query){
        if($Query){
            return $Query->fetch_row();
        }
    }
    /** END Result */

}

$DB = new DB;
?>