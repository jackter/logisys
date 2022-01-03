<?php

$Child = array(54,55,85,106,110,127,128,136,211,213,214,215);
if(Perm::ChildCount($Child)){
    $j++;
    $Data[$i]['children'][$j] = array(
        'id'        => 'rpt-acc',
        'title'     => 'Finance & Accounting',
        'type'      => 'collapsable',
        'icon'      => 'table_chart',
    );

    if(Perm::Count(55)){
        
        $Data[$i]['children'][$j]['children'][] = array(
            'id'        => 'acc-rep-gl-summary',
            'title'     => 'GL Summary',
            'type'      => 'item',
            'url'       => '/acc/report/gl-summary',
            'icon'      => 'chevron_right'
        );
    }
    
    if(Perm::Count(54)){

        $Data[$i]['children'][$j]['children'][] = array(
            'id'        => 'acc-rep-gl',
            'title'     => 'GL Detail',
            'type'      => 'item',
            'url'       => '/acc/report/gl',
            'icon'      => 'chevron_right'
        );
    }

    if(Perm::Count(211)){

        $Data[$i]['children'][$j]['children'][] = array(
            'id'        => 'rpt-trial-balance-summary',
            'title'     => 'TB Summary',
            'type'      => 'item',
            'url'       => '/acc/report/tb-summary',
            'icon'      => 'chevron_right'
        );
    }

    if(Perm::Count(85)){

        $Data[$i]['children'][$j]['children'][] = array(
            'id'        => 'acc-rep-trial-balance',
            'title'     => 'Trial Balance',
            'type'      => 'item',
            'url'       => '/acc/report/tb',
            'icon'      => 'chevron_right'
        );
    }

    if(Perm::Count(106)){

        $Data[$i]['children'][$j]['children'][] = array(
            'id'        => 'acc-rep-inv-aging',
            'title'     => 'Invoice Aging AP',
            'type'      => 'item',
            'url'       => '/acc/report/inv-aging',
            'icon'      => 'chevron_right'
        );
    }
    if(Perm::Count(213)){
        $Data[$i]['children'][$j]['children'][] = array(
            'id'        => 'acc-invoice-aging-summary',
            'title'     => 'Invoice Aging AP Summary',
            'type'      => 'item',
            'url'       => '/acc/report/inv-aging-summary',
            'icon'      => 'chevron_right'
        );
    }

    if(Perm::Count(214)){
        $Data[$i]['children'][$j]['children'][] = array(
            'id'        => 'acc-rep-inv-aging-ar',
            'title'     => 'Invoice Aging AR',
            'type'      => 'item',
            'url'       => '/acc/report/inv-aging-ar',
            'icon'      => 'chevron_right'
        );
    }

    if(Perm::Count(215)){
        $Data[$i]['children'][$j]['children'][] = array(
            'id'        => 'acc-invoice-aging-ar-summary',
            'title'     => 'Invoice Aging AR Summary',
            'type'      => 'item',
            'url'       => '/acc/report/inv-aging-ar-summary',
            'icon'      => 'chevron_right'
        );
    }

    if(Perm::Count(110)){

        $Data[$i]['children'][$j]['children'][] = array(
            'id'        => 'acc-rep-list-p3',
            'title'     => 'List P3',
            'type'      => 'item',
            'url'       => '/acc/report/list-p3',
            'icon'      => 'chevron_right'
        );
    }

    if(Perm::Count(136)){

        $Data[$i]['children'][$j]['children'][] = array(
            'id'        => 'acc-rep-list-je',
            'title'     => 'List Journal Entry',
            'type'      => 'item',
            'url'       => '/acc/report/list_je',
            'icon'      => 'chevron_right'
        );
    }

    if(Perm::Count(127)){

        $Data[$i]['children'][$j]['children'][] = array(
            'id'        => 'acc-rep-balance_sheet',
            'title'     => 'Balance Sheet',
            'type'      => 'item',
            'url'       => '/acc/report/balance_sheet',
            'icon'      => 'chevron_right'
        );
    }

    if(Perm::Count(128)){

        $Data[$i]['children'][$j]['children'][] = array(
            'id'        => 'acc-rep-profit_loss',
            'title'     => 'Profit & Loss',
            'type'      => 'item',
            'url'       => '/acc/report/profit_loss',
            'icon'      => 'chevron_right'
        );
    }
}

?>