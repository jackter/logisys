<?php

$Child = array(34,87,88,90,89,98,184,212);
if(Perm::ChildCount($Child)){
    $j++;
    $Data[$i]['children'][$j] = array(
        'id'        => 'rpt-stock',
        'title'     => 'Inventory',
        'type'      => 'collapsable',
        'icon'      => 'table_chart',
    );

    if(Perm::Count(34)){
        $Data[$i]['children'][$j]['children'][] = array(
            'id'        => 'rpt-stock-item',
            'title'     => 'Item Stock',
            'type'      => 'item',
            'url'       => '/stock/report/item',
            'icon'      => 'store' 
        );
    }
    if(Perm::Count(87)){
        $Data[$i]['children'][$j]['children'][] = array(
            'id'        => 'rpt-kartu-stock',
            'title'     => 'Bin Card',
            'type'      => 'item',
            'url'       => '/stock/report/kartu_stok',
            'icon'      => 'assignment'
        );
    }
    if(Perm::Count(88)){
        $Data[$i]['children'][$j]['children'][] = array(
            'id'        => 'rpt-pengeluaran',
            'title'     => 'Goods Issued List',
            'type'      => 'item',
            'url'       => '/stock/report/goods_issued_list',
            'icon'      => 'list'
        );
    }
    if(Perm::Count(90)){
        $Data[$i]['children'][$j]['children'][] = array(
            'id'        => 'rpt-pengembalian',
            'title'     => 'Return GI',
            'type'      => 'item',
            'url'       => '/stock/report/return_gi',
            'icon'      => 'refresh'
        );
    }
    if(Perm::Count(89)){
        $Data[$i]['children'][$j]['children'][] = array(
            'id'        => 'rpt-inventory-tb',
            'title'     => 'Inventory Trial Balance',
            'type'      => 'item',
            'url'       => '/stock/report/inventory_tb',
            'icon'      => 'chrome_reader_mode'
        );
    }
    if(Perm::Count(98)){
        $Data[$i]['children'][$j]['children'][] = array(
            'id'        => 'rpt-stock-summary',
            'title'     => 'Stock Summary',
            'type'      => 'item',
            'url'       => '/stock/report/stock_summary',
            'icon'      => 'add_to_queue'
        );
    }
    if(Perm::Count(212)){
        $Data[$i]['children'][$j]['children'][] = array(
            'id'        => 'rpt-stock-adj',
            'title'     => 'Stock Adjustment',
            'type'      => 'item',
            'url'       => '/stock/report/stock_adj',
            'icon'      => 'add_to_queue'
        );
    }
    if(Perm::Count(184)){
        $Data[$i]['children'][$j]['children'][] = array(
            'id'        => 'rpt-oil-movement',
            'title'     => 'Oil Movement',
            'type'      => 'item',
            'url'       => '/stock/report/oil_movement',
            'icon'      => 'add_to_queue'
        );
    }
}
?>