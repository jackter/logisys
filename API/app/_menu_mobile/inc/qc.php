<?php

$Child = array(121,125);
if(Perm::ChildCount($Child)){
    $j++;
    $k = -1;
    $Data[$i]['children'][$j] = array(
        'id'        => 'qc',
        'title'     => 'Quality Control',
        'type'      => 'collapsable',
        'iconm'      => 'water',
    );
    
    if(Perm::Count(121)){
        $Data[$i]['children'][$j]['children'][] = array(
            'id'        => 'incoming',
            'title'     => 'Incoming Quality',
            'type'      => 'item',
            'url'       => '/qc/incoming',
        );
    }

    if(Perm::Count(125)){
        $Data[$i]['children'][$j]['children'][] = array(
            'id'        => 'incoming_dobi',
            'title'     => 'Input Dobi',
            'type'      => 'item',
            'url'       => '/qc/incoming_dobi',
        );
    }
}

?>