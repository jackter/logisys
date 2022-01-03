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

$j++;
$Data[$i]['children'][$j] = array(
    'id'        => 'dashboard',
    'title'     => 'Dashboard',
    'type'      => 'item',
    'iconm'      => 'apps',
    'url'       => '/home',
);

include "inc/snd.php";
include "inc/qc.php";

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
    'iconm'      => 'lock',
    'url'       => '/system/cpass',
);

// $Child = array(12,13);
// if(Perm::ChildCount($Child)){
//     $j++;
//     $Data[$i]['children'][$j] = array(
//         'id'        => 'setting_user',
//         'title'     => 'Setting User',
//         'type'      => 'collapsable',
//         'icon'      => 'group',
//     );

//     if(Perm::Count(13)){
//         $Data[$i]['children'][$j]['children'][] = array(
//             'id'        => 'user',
//             'title'     => 'User',
//             'type'      => 'item',
//             'icon'      => 'group_add',
//             'url'       => '/system/user',
//         );
//     }
//     if(Perm::Count(12)){
//         $Data[$i]['children'][$j]['children'][] = array(
//             'id'        => 'permission',
//             'title'     => 'Permissions',
//             'type'      => 'item',
//             'icon'      => 'how_to_reg',
//             'url'       => '/system/permission',
//         );
//     }
// }
//=> / END : System

$menu = $Data;
?>