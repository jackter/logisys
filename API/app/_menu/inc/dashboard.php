<?php
    $j++;
    $k = -1;

    $Data[$i]['children'][$j] = array(
        'id'        => 'dashboard',
        'title'     => 'Dashboard',
        'type'      => 'collapsable',
        'icon'      => 'widgets',
    );


    $k++;
    $Data[$i]['children'][$j]['children'][$k] = array(
        'id'        => 'dash-def',
        'title'     => 'Default',
        'type'      => 'item',
        'url'       => '/dashboard/default',
        'icon'      => 'chevron_right'
    );

    if(Perm::Count(101)){
        $k++;
        $Data[$i]['children'][$j]['children'][$k] = array(
            'id'        => 'dash-snd',
            'title'     => 'Supply Demand',
            'type'      => 'item',
            'url'       => '/dashboard/snd',
            'icon'      => 'chevron_right'
        );
    }

    if(Perm::Count(102)){
        $k++;
        $Data[$i]['children'][$j]['children'][$k] = array(
            'id'        => 'dash-manufacturing',
            'title'     => 'Manufacturing',
            'type'      => 'item',
            'url'       => '/dashboard/manufacturing',
            'icon'      => 'chevron_right'
        );
    }

    if(Perm::Count(103)){
        $k++;
        $Data[$i]['children'][$j]['children'][$k] = array(
            'id'        => 'dash-inventory',
            'title'     => 'Inventory',
            'type'      => 'item',
            'url'       => '/dashboard/inventory',
            'icon'      => 'chevron_right'
        );
    }

    if(Perm::Count(104)){
        $k++;
        $Data[$i]['children'][$j]['children'][$k] = array(
            'id'        => 'dash-finance',
            'title'     => 'Finance & Accounting',
            'type'      => 'item',
            'url'       => '/dashboard/finance',
            'icon'      => 'chevron_right'
        );
    }

    if(Perm::Count(105)){
        $k++;
        $Data[$i]['children'][$j]['children'][$k] = array(
            'id'        => 'dash-wb',
            'title'     => 'Weigh Bridge',
            'type'      => 'item',
            'url'       => '/dashboard/wb',
            'icon'      => 'chevron_right'
        );
    }
?>