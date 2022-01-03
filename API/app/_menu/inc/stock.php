<?php
$Child = array(24,25,26,38,66,123,189);
if(Perm::ChildCount($Child)){
    $j++;
    $k = -1;
    $Data[$i]['children'][$j] = array(
        'id'        => 'stock',
        'title'     => 'Inventory',
        'type'      => 'collapsable',
        'icon'      => 'local_convenience_store',
    );

    if(Perm::Count(24)){
        $k++;
        $Data[$i]['children'][$j]['children'][$k] = array(
            'id'        => 'stock-item',
            'title'     => 'Items',
            'type'      => 'item',
            'url'       => '/stock/item',
            'icon'      => 'list_alt'
        );
    }

    if(Perm::Count(25)){
        $k++;
        $Data[$i]['children'][$j]['children'][$k] = array(
            'id'        => 'stock-location',
            'title'     => 'Storage Location',
            'type'      => 'item',
            'url'       => '/stock/location',
            'icon'      => 'flag'
        );
    }

    if(Perm::Count(26)){
        $k++;
        $Data[$i]['children'][$j]['children'][$k] = array(
            'id'        => 'stock-initial',
            'title'     => 'Initial Stock',
            'type'      => 'item',
            'url'       => '/stock/initial',
            'icon'      => 'data_usage'
        );
    }
    if(Perm::Count(38)){
        $k++;
        $Data[$i]['children'][$j]['children'][$k] = array(
            'id'        => 'stock-taking',
            'title'     => 'Stock Taking',
            'type'      => 'item',
            'url'       => '/stock/stock_taking',
            'icon'      => 'widgets'
        );
    }
    if(Perm::Count(66)){
        $k++;
        $Data[$i]['children'][$j]['children'][$k] = array(
            'id'        => 'stock-adjustment',
            'title'     => 'Stock Adjustment',
            'type'      => 'item',
            'url'       => '/stock/adjustment',
            'icon'      => 'spellcheck'
        );
    }

    // if(Perm::Count(123)){

    //     $Data[$i]['children'][$j]['children'][] = array(
    //         'id'        => 'sounding',
    //         'title'     => 'Sounding',
    //         'type'      => 'item',
    //         'url'       => '/stock/sounding',
    //         'icon'      => 'call_to_action'
    //     );
    // }

    $Child = array(123,189);
    if(Perm::ChildCount($Child)){
        $k++;
        $Data[$i]['children'][$j]['children'][$k] = array(
            'id'        => 'tank',
            'title'     => 'Tank',
            'type'      => 'collapsable',
            'icon'      => 'storage'
        );
        if(Perm::Count(123)){
            $Data[$i]['children'][$j]['children'][$k]['children'][] = array(
                'id'        => 'sounding',
                'title'     => 'Sounding',
                'type'      => 'item',
                'url'       => '/stock/sounding',
                'icon'      => 'call_to_action'
            );
        }

        if(Perm::Count(189)){
            $Data[$i]['children'][$j]['children'][$k]['children'][] = array(
                'id'        => 'netto_summary',
                'title'     => 'Netto Summary',
                'type'      => 'item',
                'url'       => '/stock/netto_summary',
                'icon'      => 'donut_small'
            );
        }

    }
}
?>