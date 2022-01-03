<?php
$Child = array(28,29,30,31,32,33,36,37,43,44,83,129,130,186);
if(Perm::ChildCount($Child)){
    $j++;
    $k = -1;
    $Data[$i]['children'][$j] = array(
        'id'        => 'snd',
        'title'     => 'Supply & Demand',
        'type'      => 'collapsable',
        'icon'      => 'tab',
    );

    if(Perm::Count(28)){
        $k++;
        $Data[$i]['children'][$j]['children'][$k] = array(
            'id'        => 'snd-mr',
            'title'     => 'Material Request',
            'type'      => 'item',
            'url'       => '/snd/mr',
            'icon'      => 'assignment'
        );
    }

    if(Perm::Count(186)){
        $k++;
        $Data[$i]['children'][$j]['children'][$k] = array(
            'id'        => 'snd-mr2',
            'title'     => 'Reservation',
            'type'      => 'item',
            'url'       => '/snd/mr2',
            'icon'      => 'assignment'
        );
    }

    if(Perm::Count(29)){
        $k++;
        $Data[$i]['children'][$j]['children'][$k] = array(
            'id'        => 'snd-pmr',
            'title'     => 'Process Material Request',
            'type'      => 'item',
            'url'       => '/snd/pmr',
            'icon'      => 'arrow_forward'
        );
    }

    if(Perm::Count(30)){
        $k++;
        $Data[$i]['children'][$j]['children'][$k] = array(
            'id'        => 'snd-pr',
            'title'     => 'Purchase Request',
            'type'      => 'item',
            'url'       => '/snd/pr',
            'icon'      => 'business_center'
        );
    }

    if(Perm::Count(31)){
        $k++;
        $Data[$i]['children'][$j]['children'][$k] = array(
            'id'        => 'snd-pq',
            'title'     => 'Purchase Quotations',
            'type'      => 'item',
            'url'       => '/snd/pq',
            'icon'      => 'description'
        );
    }

    if(Perm::Count(32)){
        $k++;
        $Data[$i]['children'][$j]['children'][$k] = array(
            'id'        => 'snd-po',
            'title'     => 'Purchase Order',
            'type'      => 'item',
            'url'       => '/snd/po',
            'icon'      => 'shopping_cart'
        );
    }

    if(Perm::Count(33)){
        $k++;
        $Data[$i]['children'][$j]['children'][$k] = array(
            'id'        => 'snd-gr',
            'title'     => 'Goods Receive',
            'type'      => 'item',
            'url'       => '/snd/gr',
            'icon'      => 'call_received'
        );
    }

    if(Perm::Count(83)){
        $k++;
        $Data[$i]['children'][$j]['children'][$k] = array(
            'id'        => 'snd-wb-grn',
            'title'     => 'WB GRN',
            'type'      => 'item',
            'url'       => '/snd/wb-grn',
            'icon'      => 'receipt'
        );
    }

    if(Perm::Count(36)){
        $k++;
        $Data[$i]['children'][$j]['children'][$k] = array(
            'id'        => 'snd-gi',
            'title'     => 'Goods Issued',
            'type'      => 'item',
            'url'       => '/snd/gi',
            'icon'      => 'local_shipping'
        );
    }

    if(Perm::Count(37)){
        $k++;
        $Data[$i]['children'][$j]['children'][$k] = array(
            'id'        => 'snd-mt',
            'title'     => 'Material Transfer',
            'type'      => 'item',
            'url'       => '/snd/material_transfer',
            'icon'      => 'compare_arrows'
        );
    }

    $Child = array(129,130);
    if(Perm::ChildCount($Child)){
        $k++;
        $Data[$i]['children'][$j]['children'][$k] = array(
            'id'        => 'snd-mt',
            'title'     => 'Material Transfer',
            'type'      => 'collapsable',
            'icon'      => 'compare_arrows'
        );

        if(Perm::Count(129)){
            $Data[$i]['children'][$j]['children'][$k]['children'][] = array(
                'id'        => 'snd-mto',
                'title'     => 'Material Transfer Out',
                'type'      => 'item',
                'url'       => '/snd/mto',
                'icon'      => 'chevron_right'
            );
        }

        if(Perm::Count(130)){
            $Data[$i]['children'][$j]['children'][$k]['children'][] = array(
                'id'        => 'snd-mti',
                'title'     => 'Material Transfer In',
                'type'      => 'item',
                'url'       => '/snd/mti',
                'icon'      => 'chevron_right'
            );
        }
    }

    $Child = array(43,44);
    if(Perm::ChildCount($Child)){
        $k++;
        $Data[$i]['children'][$j]['children'][$k] = array(
            'id'        => 'snd-return',
            'title'     => 'Return',
            'type'      => 'collapsable',
            'icon'      => 'refresh'
        );

        if(Perm::Count(43)){
            $Data[$i]['children'][$j]['children'][$k]['children'][] = array(
                'id'        => 'snd-rgr',
                'title'     => 'Return Goods Receipt',
                'type'      => 'item',
                'url'       => '/snd/rgr',
                'icon'      => 'chevron_right'
            );
        }

        if(Perm::Count(44)){
            $Data[$i]['children'][$j]['children'][$k]['children'][] = array(
                'id'        => 'snd-rgi',
                'title'     => 'Return Goods Issued',
                'type'      => 'item',
                'url'       => '/snd/rgi',
                'icon'      => 'chevron_right'
            );
        }
    }

}
?>