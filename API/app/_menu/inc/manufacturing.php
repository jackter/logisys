<?php

$Child = array(59,60,61,62,64,112,126,187,191,195, 201);
if(Perm::ChildCount($Child)){

    $j++;
    $k = -1;

    $Data[$i]['children'][$j] = array(
        'id'        => 'mfg',
        'title'     => 'Manufacturing',
        'type'      => 'collapsable',
        'icon'      => 'business',
    );

        if(Perm::Count(59)){

            $k++;
            $Data[$i]['children'][$j]['children'][$k] = array(
                'id'        => 'bom',
                'title'     => 'Bill of Materials',
                'type'      => 'item',
                'url'       => '/manufacturing/bom',
                'icon'      => 'receipt'
            );
        }
        if(Perm::Count(60)){

            $k++;
            $Data[$i]['children'][$j]['children'][$k] = array(
                'id'        => 'jo',
                'title'     => 'Job Order',
                'type'      => 'item',
                'url'       => '/manufacturing/jo',
                'icon'      => 'how_to_vote'
            );
        }
        if(Perm::Count(191)){

            $k++;
            $Data[$i]['children'][$j]['children'][$k] = array(
                'id'        => 'jo2',
                'title'     => 'Job Order 2',
                'type'      => 'item',
                'url'       => '/manufacturing/jo2',
                'icon'      => 'how_to_vote'
            );
        }
        if(Perm::Count(61)){

            $k++;
            $Data[$i]['children'][$j]['children'][$k] = array(
                'id'        => 'ap',
                'title'     => 'Actual Production',
                'type'      => 'item',
                'url'       => '/manufacturing/actual_production',
                'icon'      => 'event_note'
            );
        }

        if(Perm::Count(187)){

            $k++;
            $Data[$i]['children'][$j]['children'][$k] = array(
                'id'        => 'ap2',
                'title'     => 'Actual Production 2',
                'type'      => 'item',
                'url'       => '/manufacturing/actual_production2',
                'icon'      => 'event_note'
            );
        }
        // $Child = array(62);
        // if(Perm::ChildCount($Child)){

        //     $k++;
        //     $Data[$i]['children'][$j]['children'][$k] = array(
        //         'id'        => 'ma',
        //         'title'     => 'Material Acceptance',
        //         'type'      => 'item',
        //         'url'       => '/manufacturing/material_acceptance',
        //         'icon'      => 'local_shipping'
        //     );
        // }

        if(Perm::Count(64)){
            $k++;
            $Data[$i]['children'][$j]['children'][$k] = array(
                'id'        => 'mtr',
                'title'     => 'Material Trf Req.',
                'type'      => 'item',
                'url'       => '/manufacturing/transfer_request',
                'icon'      => 'compare_arrows'
            );
        }

        if(Perm::Count(195)){
            $k++;
            $Data[$i]['children'][$j]['children'][$k] = array(
                'id'        => 'mtr2',
                'title'     => 'Material Trf Req. 2',
                'type'      => 'item',
                'url'       => '/manufacturing/transfer_request2',
                'icon'      => 'compare_arrows'
            );
        }

        if(Perm::Count(65)){
            $k++;
            $Data[$i]['children'][$j]['children'][$k] = array(
                'id'        => 'fg',
                'title'     => 'Transfer Finish Goods',
                'type'      => 'item',
                'url'       => '/manufacturing/transfer_finish_goods',
                'icon'      => 'local_shipping'
            );
        }

        if(Perm::Count(201)){
            $k++;
            $Data[$i]['children'][$j]['children'][$k] = array(
                'id'        => 'fg',
                'title'     => 'Transfer Finish Goods 2',
                'type'      => 'item',
                'url'       => '/manufacturing/transfer_finish_goods2',
                'icon'      => 'local_shipping'
            );
        }

        if(Perm::Count(112)){
            $k++;
            $Data[$i]['children'][$j]['children'][$k] = array(
                'id'        => 'oip',
                'title'     => 'Oil In Plant',
                'type'      => 'item',
                'url'       => '/manufacturing/oip',
                'icon'      => 'dns'
            );
        }

        // if(Perm::Count(126)){
        //     $k++;
        //     $Data[$i]['children'][$j]['children'][$k] = array(
        //         'id'        => 'mr',
        //         'title'     => 'Material Return',
        //         'type'      => 'item',
        //         'url'       => '/manufacturing/material_return_deliver',
        //         'icon'      => 'refresh'
        //     );
        // }

        $Child = array(126,191);
        if(Perm::ChildCount($Child)){
            $k++;
            $Data[$i]['children'][$j]['children'][$k] = array(
                'id'        => 'snd-return',
                'title'     => 'Material Return',
                'type'      => 'collapsable',
                'icon'      => 'refresh'
            );

            if(Perm::Count(126)){
                $Data[$i]['children'][$j]['children'][$k]['children'][] = array(
                    'id'        => 'manufacturing-return-deliver',
                    'title'     => 'Material Return Deliver',
                    'type'      => 'item',
                    'url'       => '/manufacturing/material_return_deliver',
                    'icon'      => 'chevron_right'
                );
            }

            if(Perm::Count(191)){
                $Data[$i]['children'][$j]['children'][$k]['children'][] = array(
                    'id'        => 'manufacturing-return-receive',
                    'title'     => 'Material Return Receive',
                    'type'      => 'item',
                    'url'       => '/manufacturing/material_return_receive',
                    'icon'      => 'chevron_right'
                );
            }
        }
    }
?>