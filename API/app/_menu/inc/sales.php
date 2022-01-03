<?php

$Child = array(68, 69, 99, 198, 200);
if (Perm::ChildCount($Child)) {

    $j++;
    $k = -1;

    $Data[$i]['children'][$j] = array(
        'id'        => 'so',
        'title'     => 'Sales',
        'type'      => 'collapsable',
        'icon'      => 'score',
    );

    if (Perm::Count(68)) {

        $k++;
        $Data[$i]['children'][$j]['children'][$k] = array(
            'id'        => 'so-contract',
            'title'     => 'Sales Contract',
            'type'      => 'item',
            'url'       => '/so/contract',
            'icon'      => 'library_books'
        );
    }

    if (Perm::Count(99)) {
        $k++;
        $Data[$i]['children'][$j]['children'][$k] = array(
            'id'        => 'sales_order',
            'title'     => 'Sales Order',
            'type'      => 'item',
            'url'       => '/so/sales_order',
            'icon'      => 'shopping_basket'
        );
    }

    if (Perm::Count(69)) {
        $k++;
        $Data[$i]['children'][$j]['children'][$k] = array(
            'id'        => 'gi_product',
            'title'     => 'Goods Issued Product',
            'type'      => 'item',
            'url'       => '/so/gi_product',
            'icon'      => 'whatshot'
        );
    }

    if (Perm::Count(198)) {
        $k++;
        $Data[$i]['children'][$j]['children'][$k] = array(
            'id'        => 'bill_of_lading',
            'title'     => 'Bill of Lading',
            'type'      => 'item',
            'url'       => '/so/bill_of_lading',
            'icon'      => 'directions_boat'
        );
    }

    if (Perm::Count(200)) {
        $k++;
        $Data[$i]['children'][$j]['children'][$k] = array(
            'id'        => 'sales_handover',
            'title'     => 'Sales Handover',
            'type'      => 'item',
            'url'       => '/so/sales_handover',
            'icon'      => 'pan_tool'
        );
    }
}
