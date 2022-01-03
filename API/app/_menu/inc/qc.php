<?php

$Child = array(121,125);
if(Perm::ChildCount($Child)){
    $j++;
    $Data[$i]['children'][$j] = array(
        'id'        => 'qc',
        'title'     => 'Quality Control',
        'type'      => 'collapsable',
        'icon'      => 'check_circle',
    );
    
    if(Perm::Count(121)){
        $Data[$i]['children'][$j]['children'][] = array(
            'id'        => 'incoming',
            'title'     => 'Incoming Quality',
            'type'      => 'item',
            'url'       => '/qc/incoming',
            'icon'      => 'description'
        );
    }

    if(Perm::Count(125)){
        $Data[$i]['children'][$j]['children'][] = array(
            'id'        => 'incoming_dobi',
            'title'     => 'Input Dobi',
            'type'      => 'item',
            'url'       => '/qc/incoming_dobi',
            'icon'      => 'description'
        );
    }
}

?>