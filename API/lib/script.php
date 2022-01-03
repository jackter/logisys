<?php
/* Module Plug & Play */
//=> JS
$CSCRIPT = sizeof($GLOBALS['plugjs']);
for($szci = 0; $szci < $CSCRIPT; $szci++){
	?>
    <script src="<?=HOST?>/<?=$GLOBALS['plugjs'][$szci]?>"></script>
    <?php
}
//=> CSS
?>
<?php if(!empty($GLOBALS['plugcss'])){ ?>
<script>
<?php
$CSCRIPT = sizeof($GLOBALS['plugcss']);
for($szci = 0; $szci < $CSCRIPT; $szci++){
	echo 'dxd("' . $GLOBALS['plugcss'][$szci] . '");';
}
/* End Module Plug & Play*/
?>
</script>
<?php } ?>

<?php if(!empty($GLOBALS['szscript'])){ ?>
<script>
<?php
$CSCRIPT = sizeof($GLOBALS['szscript']);
for($szci = 0; $szci < $CSCRIPT; $szci++){
	echo 'dxd("' . $GLOBALS['szscript'][$szci] . '");';
}
?>
</script>
<?php } ?>

<?php if(!empty($GLOBALS['szscript-basic'])){ ?>
<?php
$CSCRIPT_BASIC = sizeof($GLOBALS['szscript-basic']);
$SEPARATOR = "";
$SCRIPT_BASIC = "";
for($szci = 0; $szci < $CSCRIPT_BASIC; $szci++){
	/*$SCRIPT_BASIC .= $SEPARATOR;
	$SCRIPT_BASIC .= $GLOBALS['szscript-basic'][$szci];
	
	//=> SET SEPARATOR
	$SEPARATOR = ",";*/
	?>
    <script src="<?=$GLOBALS['szscript-basic'][$szci]?>"></script>
    <?php
}
?>
<? /*<script src="<?=HOST?>/scripts/<?=PATH?>lib/lists/<?=$SCRIPT_BASIC?>"></script>*/ ?>
<?php } ?>

<?php /*if(!empty($GLOBALS['szscript-basic'])){ ?>
<?php
$CSCRIPT_BASIC = sizeof($GLOBALS['szscript-basic']);
$SEPARATOR = "";
$SCRIPT_BASIC = "";
for($szci = 0; $szci < $CSCRIPT_BASIC; $szci++){
	$SCRIPT_BASIC .= $SEPARATOR;
	$SCRIPT_BASIC .= $GLOBALS['szscript-basic'][$szci];
	
	//=> SET SEPARATOR
	$SEPARATOR = ",";
}
?>
<script src="<?=HOST?>/scripts/<?=PATH?>lib/lists/<?=$SCRIPT_BASIC?>"></script>
<?php } ?>

<?php if(!empty($GLOBALS['szscript-plugins'])){ ?>
<?php
$CSCRIPT_PLUGINS = sizeof($GLOBALS['szscript-plugins']);
$SEPARATOR = "";
$SCRIPT_PLUGINS = "";
for($szci = 0; $szci < $CSCRIPT_PLUGINS; $szci++){
	$SCRIPT_PLUGINS .= $SEPARATOR;
	$SCRIPT_PLUGINS .= $GLOBALS['szscript-plugins'][$szci];
	
	//=> SET SEPARATOR
	$SEPARATOR = ",";
}
?>
<script src="<?=HOST?>/scripts/<?=PATH?><?=GO_TPL?>/plugins/lists/<?=$SCRIPT_PLUGINS?>"></script>
<?php } ?>

<?php if(!empty($GLOBALS['szscript-plugins-css'])){ ?>
<script>
<?php
$CSCRIPT = sizeof($GLOBALS['szscript-plugins-css']);
for($szci = 0; $szci < $CSCRIPT; $szci++){
	echo 'dxd("' . $GLOBALS['szscript-plugins-css'][$szci] . '");';
}
?>
</script>
<?php }*/ ?>