<?php
$GLOBALS['sqlsrv'] = new SqlSrv;

//=> Query
function SQS_QUERY($TABLE_NAME, $NEXT_QUERY = ""){
    return $GLOBALS['sqlsrv']->query("SELECT * FROM $TABLE_NAME $NEXT_QUERY");
}

function SQS_QUERY_TOP($TOP, $TABLE_NAME, $NEXT_QUERY = ""){
    return $GLOBALS['sqlsrv']->query("SELECT TOP $TOP * FROM $TABLE_NAME $NEXT_QUERY");
}
function SQS_RESULT($QUERY_RESULT){  
  if($QUERY_RESULT){
  	$RESULT = $GLOBALS['sqlsrv']->fetchArray($QUERY_RESULT);
	return $RESULT;  
  }
}
		
function SQS_ROWS($QUERY){
	return $GLOBALS['sqlsrv']->num_rows($QUERY);
	//return sqlsrv_num_rows($QUERY);
}

//PORTABLE PORTABLE
function SQS_QUERY_PORT($QUERY = ""){
	return $GLOBALS['sqlsrv']->query($QUERY);
}

//=> Insert
function SQS_INSERT($TABLE_NAME, $Fields = array()){	
	//return $GLOBALS['sqlsrv']->query("INSERT INTO $TABLE_NAME VALUES($VALUES)");
	if(!empty($TABLE_NAME)){
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
		
		return $GLOBALS['sqlsrv']->query($QUERY);
	}
}

//=> Update
function SQS_UPDATE($TABLE_NAME, $Fields = array(), $WHERE){
    //return $GLOBALS['sqlsrv']->query("UPDATE $TABLE_NAME SET $VALUES WHERE $WHERE");
	if (empty($WHERE)) {
        echo 'Where clause is empty for update method : ' . $table;
        exit();
    }else{
		$QUERY = "UPDATE `" . $TABLE_NAME ."` SET";
		
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
        if(!empty($WHERE)){
            $QUERY .= " WHERE $where";
        }
		
		return $GLOBALS['sqlsrv']->query($QUERY);
	}
}

//=> Delete
function SQS_DELETE($TABLE_NAME, $WHERE){
    return $GLOBALS['sqlsrv']->query("DELETE FROM $TABLE_NAME WHERE $WHERE");
}
?>