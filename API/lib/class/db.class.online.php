<?php
define ("DB_USER", $DB_U);
define ("DB_PASS", $DB_P);
define ("DB_HOST", $DB_S);
define ("DB_NAME", $DB_DB);

if(!isset($DB_PORT)){
    $DB_PORT = 3306;
}

define ("DB_PORT", $DB_PORT);

$DBOnline = array(
    'host'      => 'citraborneo.id',
    'user'      => 'citraborneo_indah',
    'pass'      => 'O2D8nKTw_Nda',
    'db'        => 'citraborneo_logisys'
);
define ("DBO", $DBOnline);

function Lo2On($str){
    
    switch($str){
        case "cbi_logisys":
            $return = "citraborneo_logisys";
            break;
        case "cbi_master":
            $return = "citraborneo_master";
            break;
        default:
            $return = "Error!";
    }

    return $return;

}

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

        $AI = NULL;
        /*$INFO = $this->Result($this->QueryPort("
            SELECT `AUTO_INCREMENT`
            FROM  INFORMATION_SCHEMA.TABLES
            WHERE TABLE_SCHEMA = '" . DBDEF . "'
            AND   TABLE_NAME   = '" . $Table . "';
        "));
        $AI = $INFO['AUTO_INCREMENT'];*/

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

            /**
             * Insert to Online
             */
            if($return){

                $ID = $this->conn->insert_id;

                /**
                 * Recreate Query
                 */
                $Query = "INSERT INTO `$Table`";

                //=> Extract Fields
                if(is_array($Fields)){

                    $Query .= ' ( `id`, ';

                    $num = 0;
                    foreach($Fields as $key => $value){
                        $Query .= ' `' . $key . '`';
                        $num++;
                        if($num != count($Fields)){
                            $Query .= ',';
                        }
                    }

                    $Query .= ' ) VALUES ( ' . $ID . ', ' . $this->DBJoinArray($Fields) . ' )';

                }else{

                    $Query .= ' ' . $Table . ' VALUES ( ' . $ID . ', ' . $Fields . ')';

                }
                //=> / END : Recreate Query

                $this->InsertOnline(
                    $Table,
                    $Query,
                    $AI
                );
            }
            //=> / END : Insert to Online

            return $return;

        }else{
            return $this->Error('not_exist', $Table);
        }

    }
    public function InsertOnline(
        $Table,
        $Query,
        $AI,
        $DB = DBDEF
    ){
            
        $DBOL = new mysqli(
            DBO['host'],
            DBO['user'],
            DBO['pass'],
            Lo2On($DB)
        );
        $DBOL->select_db(Lo2On($DB));

        /**
         * Update Auto Increment
         */
        /*$DBOL->query("
            ALTER TABLE $Table AUTO_INCREMENT = $AI
        ");*/
        //=> / END : Update Auto Increment

        /**
         * Insert Data Online
         */
        $DBOL->query($Query);
        //=> / END : Insert Data Online

        $DBOL->close();

    }
    /** END DBInsert */

    /** BEGIN InsertON */
    public function InsertOn($DBName, $Table, $Fields = array()){
    
        $AI = NULL;
        /*$INFO = $this->Result($this->QueryPort("
            SELECT `AUTO_INCREMENT`
            FROM  INFORMATION_SCHEMA.TABLES
            WHERE TABLE_SCHEMA = '" . $DBName . "'
            AND   TABLE_NAME   = '" . $Table . "';
        "));
        $AI = $INFO['AUTO_INCREMENT'];*/

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

                echo "AI " . $AI;

                /**
                 * Insert to Online
                 */
                if($return){

                    $ID = $this->conn->insert_id;

                    /**
                     * Recreate Query
                     */
                    $Query = "INSERT INTO `$Table`";

                    //=> Extract Fields
                    if(is_array($Fields)){

                        $Query .= ' ( `id`, ';

                        $num = 0;
                        foreach($Fields as $key => $value){
                            $Query .= ' `' . $key . '`';
                            $num++;
                            if($num != count($Fields)){
                                $Query .= ',';
                            }
                        }

                        $Query .= ' ) VALUES ( ' . $ID . ', ' . $this->DBJoinArray($Fields) . ' )';

                    }else{

                        $Query .= ' ' . $Table . ' VALUES ( ' . $ID . ', ' . $Fields . ')';

                    }
                    //=> / END : Recreate Query

                    $this->InsertOnline(
                        $Table,
                        $Query,
                        $AI,
                        $DBName
                    );
                }
                //=> / END : Insert to Online

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

            if($return){
                $this->UpdateOnline(
                    $Table,
                    $Query
                );
            }

            return $return;

        }
    }
    public function UpdateOnline(
        $Table,
        $Query,
        $DB = DBDEF
    ){
            
        $DBOL = new mysqli(
            DBO['host'],
            DBO['user'],
            DBO['pass'],
            Lo2On($DB)
        );
        $DBOL->select_db(Lo2On($DB));

        $DBOL->query($Query);
        $DBOL->close();

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

                if($return){
                    $this->UpdateOnline(
                        $Table,
                        $Query,
                        $DBName
                    );
                }

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

            if($return){
                $this->DeleteOnline(
                    $Table,
                    $Query
                );
            }

            return $return;
        }else{
            return $this->Error('not_exist', $Table);
        }

    }
    public function DeleteOnline(
        $Table,
        $Query,
        $DB = DBDEF
    ){
          
        $DBOL = new mysqli(
            DBO['host'],
            DBO['user'],
            DBO['pass'],
            Lo2On($DB)
        );
        $DBOL->select_db(Lo2On($DB));

        $DBOL->query($Query);
        $DBOL->close();

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

                if($return){
                    $this->DeleteOnline(
                        $Table,
                        $Query,
                        $DBName
                    );
                }

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

    /** BEGIN Row */
    public function Row($Query){
        if($Query->num_rows > 0){
            return $Query->num_rows;
        }
    }
    /** END Row */

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