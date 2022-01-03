<?php

$Child = array(199);
if(Perm::ChildCount($Child)){
    $j++;
    $Data[$i]['children'][$j] = array(
        'id'        => 'rpt-operation',
        'title'     => 'Operation',
        'type'      => 'collapsable',
        'icon'      => 'table_chart',
    );

    if(Perm::Count(199)){
        $Data[$i]['children'][$j]['children'][] = array(
            'id'        => 'rpt-transactions',
            'title'     => 'WO History',
            'type'      => 'item',
            'url'       => '/operation/report/wo-history',
            'icon'      => 'chevron_right'
        );
    }

}

?>