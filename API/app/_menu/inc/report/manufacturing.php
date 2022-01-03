<?php

$Child = array(113,114,115,119,124);
if(Perm::ChildCount($Child)){
    $j++;
    $Data[$i]['children'][$j] = array(
        'id'        => 'rpt-mft',
        'title'     => 'Manufacturing',
        'type'      => 'collapsable',
        'icon'      => 'table_chart',
    );

    if(Perm::Count(113)){
        
        $Data[$i]['children'][$j]['children'][] = array(
            'id'        => 'rpt-mfr-jo',
            'title'     => 'JO Control',
            'type'      => 'item',
            'url'       => '/manufacturing/report/jo-control',
            'icon'      => 'chevron_right'
        );
    }
    if(Perm::Count(114)){
        
        $Data[$i]['children'][$j]['children'][] = array(
            'id'        => 'rpt-mfr-mm',
            'title'     => 'Material Movement',
            'type'      => 'item',
            'url'       => '/manufacturing/report/material-movement',
            'icon'      => 'chevron_right'
        );
    }
    if(Perm::Count(115)){
        
        $Data[$i]['children'][$j]['children'][] = array(
            'id'        => 'rpt-mfr-ic',
            'title'     => 'Inventory Control',
            'type'      => 'item',
            'url'       => '/manufacturing/report/inventory-control',
            'icon'      => 'chevron_right'
        );
    }
    if(Perm::Count(119)){
        
        $Data[$i]['children'][$j]['children'][] = array(
            'id'        => 'rpt-mfr-ac',
            'title'     => 'Actual Consumtion',
            'type'      => 'item',
            'url'       => '/manufacturing/report/actual-consumtion',
            'icon'      => 'chevron_right'
        );
    }
    if(Perm::Count(124)){
        
        $Data[$i]['children'][$j]['children'][] = array(
            'id'        => 'rpt-mfr-item',
            'title'     => 'Item Stock',
            'type'      => 'item',
            'url'       => '/manufacturing/report/item',
            'icon'      => 'chevron_right'
        );
    }
    
}

?>