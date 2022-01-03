<?php

$Child = array(28, 33, 36);
if(Perm::ChildCount($Child)){

    $j++;
    $k = -1;
    $Data[$i]['children'][$j] = array(
        'id'        => 'rpt-snd',
        'title'     => 'Supply & Demand',
        'type'      => 'collapsable',
        'iconm'      => 'cube',
    );

    if(Perm::Count(28)){
        $k++;
        $Data[$i]['children'][$j]['children'][$k] = array(
            'id'        => 'snd-mr',
            'title'     => 'Material Request',
            'type'      => 'item',
            'url'       => '/snd/mr',
        );
    }
    if(Perm::Count(33)){
        $k++;
        $Data[$i]['children'][$j]['children'][$k] = array(
            'id'        => 'snd-gr',
            'title'     => 'Goods Receive',
            'type'      => 'item',
            'url'       => '/snd/gr',
        );
    }
    if(Perm::Count(36)){
        $k++;
        $Data[$i]['children'][$j]['children'][$k] = array(
            'id'        => 'snd-gi',
            'title'     => 'Goods Issued',
            'type'      => 'item',
            'url'       => '/snd/gi',
        );
    }

}
?>