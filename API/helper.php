<?php
include "config.php";

$F = strip_tags($_GET['f']);

if(isset($F)){

    include "_helper/" . $F . ".php";

}else{
    echo "Reason Undefined!";
}
?>