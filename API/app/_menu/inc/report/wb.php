<?php

$Child = array(91, 92, 93);
if(Perm::ChildCount($Child)){
    $j++;
    $Data[$i]['children'][$j] = array(
        'id'        => 'rpt-wb',
        'title'     => 'Weighbridge',
        'type'      => 'collapsable',
        'icon'      => 'table_chart',
    );

    if(Perm::Count(91)){
        $Data[$i]['children'][$j]['children'][] = array(
            'id'        => 'rpt-transactions',
            'title'     => 'Transactions',
            'type'      => 'item',
            'url'       => '/wb/report/transactions',
            //'icon'      => 'file'
        );
    }

    if(Perm::Count(92)){
        $Data[$i]['children'][$j]['children'][] = array(
            'id'        => 'rpt-contract-progress',
            'title'     => 'Contract Progress',
            'type'      => 'item',
            'url'       => '/wb/report/contract-progress',
            //'icon'      => 'file'
        );
    }

    if(Perm::Count(93)){
        $Data[$i]['children'][$j]['children'][] = array(
            'id'        => 'rpt-transporter-progress',
            'title'     => 'Transporter Progress',
            'type'      => 'item',
            'url'       => '/wb/report/transporter-progress',
            //'icon'      => 'file'
        );
    }
}

?>