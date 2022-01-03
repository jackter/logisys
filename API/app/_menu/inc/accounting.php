<?php

$Child = array(46,47,50,51,52,53,57,63,72,73,108,109,117,118,202,208,216);
if(Perm::ChildCount($Child)){
$j++;
$k = -1;

$Data[$i]['children'][$j] = array(
    'id'        => 'acc',
    'title'     => 'Finance & Accounting',
    'type'      => 'collapsable',
    'icon'      => 'account_balance',
);
    $Child = array(46,47,63,72,73,208,216);
    if(Perm::ChildCount($Child)){        
        $k++;
        $Data[$i]['children'][$j]['children'][$k] = array(
            'id'        => 'acc-inv',
            'title'     => 'Invoice',
            'type'      => 'collapsable',
            'icon'      => 'class'
        );
        if(Perm::Count(47)){
            $Data[$i]['children'][$j]['children'][$k]['children'][] = array(
                'id'        => 'acc-inv-normal',
                'title'     => 'Purchase Invoice',
                'type'      => 'item',
                'url'       => '/acc/inv/default',
                'icon'      => 'chevron_right'
            );
        }
        if(Perm::Count(46)){
            $Data[$i]['children'][$j]['children'][$k]['children'][] = array(
                'id'        => 'acc-inv-dp',
                'title'     => 'Inv. Down Payment',
                'type'      => 'item',
                'url'       => '/acc/inv/others',
                'icon'      => 'chevron_right'
            );
        }
        if(Perm::Count(202)){
            $Data[$i]['children'][$j]['children'][$k]['children'][] = array(
                'id'        => 'acc-inv-miscellaneous',
                'title'     => 'Inv. Miscellaneous',
                'type'      => 'item',
                'url'       => '/acc/inv/miscellaneous',
                'icon'      => 'chevron_right'
            );
        }
        if(Perm::Count(208)){
            $Data[$i]['children'][$j]['children'][$k]['children'][] = array(
                'id'        => 'acc-sales-inv-misc',
                'title'     => 'Sales Invoice Misc',
                'type'      => 'item',
                'url'       => '/acc/inv/sales_inv_misc',
                'icon'      => 'chevron_right'
            );
        }
        if(Perm::Count(72)){
            $Data[$i]['children'][$j]['children'][$k]['children'][] = array(
                'id'        => 'acc-sales-inv',
                'title'     => 'Sales Invoice',
                'type'      => 'item',
                'url'       => '/acc/inv/sales_inv',
                'icon'      => 'chevron_right'
            );
        }
        if(Perm::Count(73)){
            $Data[$i]['children'][$j]['children'][$k]['children'][] = array(
                'id'        => 'acc-sales-inv-dp',
                'title'     => 'Sales Invoice DP',
                'type'      => 'item',
                'url'       => '/acc/inv/sales_inv_dp',
                'icon'      => 'chevron_right'
            );
        }
        if(Perm::Count(216)){
            $Data[$i]['children'][$j]['children'][$k]['children'][] = array(
                'id'        => 'acc-ddebit-note',
                'title'     => 'Debit Note',
                'type'      => 'item',
                'url'       => '/acc/inv/debit_note',
                'icon'      => 'chevron_right'
            );
        }
        if(Perm::Count(63)){
            $Data[$i]['children'][$j]['children'][$k]['children'][] = array(
                'id'        => 'acc-pay-request',
                'title'     => 'Payment Request',
                'type'      => 'item',
                'url'       => '/acc/inv/pay_request',
                'icon'      => 'chevron_right'
            );
        }
    }

    $Child = array(117,118);
    if(Perm::ChildCount($Child)){

        $k++;
        // $Data[$i]['children'][$j]['children'][$k] = array(
        //     'id'        => 'acc-ast',
        //     'title'     => 'Asset',
        //     'type'      => 'collapsable',
        //     'icon'      => 'home'
        // );
        // if(Perm::Count(52)){
        //     $Data[$i]['children'][$j]['children'][$k]['children'][] = array(
        //         'id'        => 'acc-ast-list',
        //         'title'     => 'Fixed Asset List',
        //         'type'      => 'item',
        //         'url'       => '/acc/ast/ast-list',
        //         'icon'      => 'chevron_right'
        //     );
        // }
        // if(Perm::Count(53)){
        //     $Data[$i]['children'][$j]['children'][$k]['children'][] = array(
        //         'id'        => 'acc-ast-type',
        //         'title'     => 'Fixed Asset Type',
        //         'type'      => 'item',
        //         'url'       => '/acc/ast/ast-type',
        //         'icon'      => 'chevron_right'
        //     );
        // }

        $Data[$i]['children'][$j]['children'][$k] = array(
            'id'        => 'acc-inv',
            'title'     => 'Bank',
            'type'      => 'collapsable',
            'icon'      => 'credit_card'
        );
        if(Perm::Count(117)){
            $Data[$i]['children'][$j]['children'][$k]['children'][] = array(
                'id'        => 'acc-inv-normal',
                'title'     => 'Bank Payment',
                'type'      => 'item',
                'url'       => '/acc/bank/payment',
                'icon'      => 'chevron_right'
            );
        }
        if(Perm::Count(118)){
            $Data[$i]['children'][$j]['children'][$k]['children'][] = array(
                'id'        => 'acc-inv-dp',
                'title'     => 'Bank Receive',
                'type'      => 'item',
                'url'       => '/acc/bank/receive',
                'icon'      => 'chevron_right'
            );
        }
    }

    if(Perm::Count(50)){

        $k++;
        $Data[$i]['children'][$j]['children'][$k] = array(
            'id'        => 'os_gi',
            'title'     => 'Outstanding GI',
            'type'      => 'item',
            'url'       => '/acc/os_posting_gi',
            'icon'      => 'description'
        );
    }

    if(Perm::Count(51)){

        $k++;
        $Data[$i]['children'][$j]['children'][$k] = array(
            'id'        => 'journal',
            'title'     => 'Journal Voucher',
            'type'      => 'item',
            'url'       => '/acc/journal_entry',
            'icon'      => 'library_books'
        );
    }

    $Child = array(52,53);
    if(Perm::ChildCount($Child)){

        $k++;
        $Data[$i]['children'][$j]['children'][$k] = array(
            'id'        => 'acc-ast',
            'title'     => 'Asset',
            'type'      => 'collapsable',
            'icon'      => 'home'
        );
        if(Perm::Count(52)){
            $Data[$i]['children'][$j]['children'][$k]['children'][] = array(
                'id'        => 'acc-ast-list',
                'title'     => 'Fixed Asset List',
                'type'      => 'item',
                'url'       => '/acc/ast/ast-list',
                'icon'      => 'chevron_right'
            );
        }
        if(Perm::Count(53)){
            $Data[$i]['children'][$j]['children'][$k]['children'][] = array(
                'id'        => 'acc-ast-type',
                'title'     => 'Fixed Asset Type',
                'type'      => 'item',
                'url'       => '/acc/ast/ast-type',
                'icon'      => 'chevron_right'
            );
        }
    }

    if(Perm::Count(57)){

        $k++;
        $Data[$i]['children'][$j]['children'][$k] = array(
            'id'        => 'periode-end',
            'title'     => 'Periode End',
            'type'      => 'item',
            'url'       => '/acc/periode-end',
            'icon'      => 'calendar_today'
        );
    }

    if(Perm::Count(108)){

        $k++;
        $Data[$i]['children'][$j]['children'][$k] = array(
            'id'        => 'production',
            'title'     => 'Production Params',
            'type'      => 'item',
            'url'       => '/manufacturing/production_params',
            'icon'      => 'dns'
        );
    }

    if(Perm::Count(109)){

        $k++;
        $Data[$i]['children'][$j]['children'][$k] = array(
            'id'        => 'sp3',
            'title'     => 'SP3 ( Manual )',
            'type'      => 'item',
            'url'       => '/acc/sp3',
            'icon'      => 'calendar_today'
        );
    }

    // $Child = array(54,55,85);
    // if(Perm::ChildCount($Child)){

    //     $k++;
    //     $Data[$i]['children'][$j]['children'][$k] = array(
    //         'id'        => 'acc-rep',
    //         'title'     => 'Report',
    //         'type'      => 'collapsable',
    //         'icon'      => 'payment'
    //     );

    //     if(Perm::Count(55)){
        
    //         $Data[$i]['children'][$j]['children'][$k]['children'][] = array(
    //             'id'        => 'acc-rep-gl-summary',
    //             'title'     => 'GL Summary',
    //             'type'      => 'item',
    //             'url'       => '/acc/report/gl-summary',
    //             'icon'      => 'chevron_right'
    //         );
    //     }
        
    //     if(Perm::Count(54)){

    //         $Data[$i]['children'][$j]['children'][$k]['children'][] = array(
    //             'id'        => 'acc-rep-gl',
    //             'title'     => 'GL Detail',
    //             'type'      => 'item',
    //             'url'       => '/acc/report/gl',
    //             'icon'      => 'chevron_right'
    //         );
    //     }

    //     if(Perm::Count(85)){

    //         $Data[$i]['children'][$j]['children'][$k]['children'][] = array(
    //             'id'        => 'acc-rep-trial-balance',
    //             'title'     => 'Trial Balance',
    //             'type'      => 'item',
    //             'url'       => '/acc/report/tb',
    //             'icon'      => 'chevron_right'
    //         );
    //     }

    // }
}
?>