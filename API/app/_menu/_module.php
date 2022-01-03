<?php

$i = 0;
$j = -1;

/**
 * Begin Applications
 */
$Data[$i] = array(
    'id'        => 'app',
    'title'     => 'Applications',
    'type'      => 'group',
    'icon'      => 'apps',
);

// $j++;
// $Data[$i]['children'][$j] = array(
//     'id'        => 'dashboard',
//     'title'     => 'Dashboard',
//     'type'      => 'item',
//     'icon'      => 'dashboard',
//     'url'       => '/dashboard',
// );
include "inc/dashboard.php";
include "inc/master.php";
include "inc/stock.php";
include "inc/supply_demand.php";
include "inc/wb.php";
include "inc/qc.php";
include "inc/manufacturing.php";
include "inc/sales.php";
include "inc/contract.php";

include "inc/accounting.php";
include "inc/operation.php";

//=> / END : Applications

/**
 * Begin Report
 */
// $Child = array(34,35,56,87,88,89,90,91,92,93);
// if(Perm::ChildCount($Child)){
$i++;
$j = -1;
$Data[$i] = array(
    'id'        => 'report',
    'title'     => 'Reports',
    'type'      => 'group',
    'icon'      => 'apps',
);

include "inc/report/stock.php";
include "inc/report/snd.php";
include "inc/report/wb.php";
include "inc/report/qc.php";
include "inc/report/manufacturing.php";
include "inc/report/accounting.php";
include "inc/report/operation.php";
//=> / END : Begin Report

/**
 * Begin System
 */
$i++;
$j = -1;
$Data[$i] = array(
    'id'        => 'setting',
    'title'     => 'System Config',
    'type'      => 'group',
    'icon'      => 'settings',
);

$j++;
$Data[$i]['children'][$j] = array(
    'id'        => 'cpass',
    'title'     => 'Change Password',
    'type'      => 'item',
    'icon'      => 'vpn_key',
    'url'       => '/system/cpass',
);

$Child = array(12, 13);
if (Perm::ChildCount($Child)) {
    $j++;
    $Data[$i]['children'][$j] = array(
        'id'        => 'setting_user',
        'title'     => 'Setting User',
        'type'      => 'collapsable',
        'icon'      => 'group',
    );

    if (Perm::Count(13)) {
        $Data[$i]['children'][$j]['children'][] = array(
            'id'        => 'user',
            'title'     => 'User',
            'type'      => 'item',
            'icon'      => 'group_add',
            'url'       => '/system/user',
        );
    }
    if (Perm::Count(12)) {
        $Data[$i]['children'][$j]['children'][] = array(
            'id'        => 'permission',
            'title'     => 'Permissions',
            'type'      => 'item',
            'icon'      => 'how_to_reg',
            'url'       => '/system/permission',
        );
    }
}
//=> / END : System

$menu = $Data;

?>