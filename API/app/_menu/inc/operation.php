<?php

$Child = array(135, 138, 139, 140);
if (Perm::ChildCount($Child)) {
    $j++;
    $k = -1;
    $Data[$i]['children'][$j] = array(
        'id'        => 'operation',
        'title'     => 'Operation',
        'type'      => 'collapsable',
        'icon'      => 'schedule',
    );

    // if (Perm::Count(135)) {
    //     $Data[$i]['children'][$j]['children'][] = array(
    //         'id'        => 'vehicle_running',
    //         'title'     => 'Vehicle Running Account',
    //         'type'      => 'item',
    //         'url'       => '/operation/vehicle_activity',
    //         'icon'      => 'local_shipping'
    //     );
    // }

    $Child = array(138, 139, 140, 192, 197);
    if (Perm::ChildCount($Child)) {

        $k++;
        $Data[$i]['children'][$j]['children'][$k] = array(
            'id'        => 'workshop',
            'title'     => 'Workshop',
            'type'      => 'collapsable',
            'icon'      => 'local_convenience_store'
        );

        if (Perm::Count(192)) {
            $Data[$i]['children'][$j]['children'][$k]['children'][] = array(
                'id'        => 'wo-request',
                'title'     => 'Work Order Request',
                'type'      => 'item',
                'url'       => '/operation/workshop/wo-request',
                'icon'      => 'chevron_right'
            );
        }

        if (Perm::Count(138)) {
            $Data[$i]['children'][$j]['children'][$k]['children'][] = array(
                'id'        => 'work-order',
                'title'     => 'Work Order',
                'type'      => 'item',
                'url'       => '/operation/workshop/work-order',
                'icon'      => 'chevron_right'
            );
        }

        if (Perm::Count(197)) {
            $Data[$i]['children'][$j]['children'][$k]['children'][] = array(
                'id'        => 'work-order-process',
                'title'     => 'Work Order Process',
                'type'      => 'item',
                'url'       => '/operation/workshop/wo-process',
                'icon'      => 'chevron_right'
            );
        }
        
    }
}

?>