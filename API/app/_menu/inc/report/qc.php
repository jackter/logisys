<?php

$Child = array(122);
if(Perm::ChildCount($Child)){
    $j++;
    $Data[$i]['children'][$j] = array(
        'id'        => 'rpt-qc',
        'title'     => 'Quality Control',
        'type'      => 'collapsable',
        'icon'      => 'table_chart',
    );

    if(Perm::Count(122)){
        $Data[$i]['children'][$j]['children'][] = array(
            'id'        => 'rpt-rqc',
            'title'     => 'Resume Incoming',
            'type'      => 'item',
            'url'       => '/qc/report/incoming'
            //'icon'      => 'file'
        );
    }

}

?>