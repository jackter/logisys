<?php
$Child = array(42, 48, 49, 71, 80, 81, 84, 86, 111, 131, 132, 133, 137, 185, 196, 206);
if (Perm::ChildCount($Child)) {
    $j++;

    $Data[$i]['children'][$j] = array(
        'id'        => 'master',
        'title'     => 'Master Data',
        'type'      => 'collapsable',
        'icon'      => 'widgets',
    );

    if (Perm::Count(42)) {
        $Data[$i]['children'][$j]['children'][] = array(
            'id'        => 'master-supplier',
            'title'     => 'Supplier',
            'type'      => 'item',
            'url'       => '/master/supplier',
            'icon'      => 'store_mall_directory'
        );
    }
    if (Perm::Count(185)) {
        $Data[$i]['children'][$j]['children'][] = array(
            'id'        => 'master-kontraktor',
            'title'     => 'Contractor',
            'type'      => 'item',
            'url'       => '/master/kontraktor',
            'icon'      => 'transfer_within_a_station'
        );
    }
    if (Perm::Count(71)) {
        $Data[$i]['children'][$j]['children'][] = array(
            'id'        => 'master-costumer',
            'title'     => 'Customer',
            'type'      => 'item',
            'url'       => '/master/costumer',
            'icon'      => 'how_to_reg'
        );
    }
    if (Perm::Count(206)) {
        $Data[$i]['children'][$j]['children'][] = array(
            'id'        => 'master-transporter',
            'title'     => 'Transporter',
            'type'      => 'item',
            'url'       => '/master/transporter',
            'icon'      => 'local_shipping'
        );
    }
    if (Perm::Count(48)) {
        $Data[$i]['children'][$j]['children'][] = array(
            'id'        => 'master-tax',
            'title'     => 'Tax',
            'type'      => 'item',
            'url'       => '/master/tax',
            'icon'      => 'monetization_on'
        );
    }
    if (Perm::Count(86)) {
        $Data[$i]['children'][$j]['children'][] = array(
            'id'        => 'master-coa',
            'title'     => 'COA',
            'type'      => 'item',
            'url'       => '/master/coa',
            'icon'      => 'list_alt'
        );
    }
    if (Perm::Count(111)) {
        $Data[$i]['children'][$j]['children'][] = array(
            'id'        => 'master-coa-bal',
            'title'     => 'Trx COA Balance',
            'type'      => 'item',
            'url'       => '/master/trx_coa_bal',
            'icon'      => 'list_alt'
        );
    }
    if (Perm::Count(131)) {
        $Data[$i]['children'][$j]['children'][] = array(
            'id'        => 'master-iga',
            'title'     => 'Item Group Account',
            'type'      => 'item',
            'url'       => '/master/iga',
            'icon'      => 'view_list'
        );
    }
    if (Perm::Count(132)) {
        $Data[$i]['children'][$j]['children'][] = array(
            'id'        => 'master-alc',
            'title'     => 'Activity Location Control',
            'type'      => 'item',
            'url'       => '/master/alc',
            'icon'      => 'view_list'
        );
    }
    if (Perm::Count(80)) {
        $Data[$i]['children'][$j]['children'][] = array(
            'id'        => 'master-company',
            'title'     => 'Bank',
            'type'      => 'item',
            'url'       => '/master/bank',
            'icon'      => 'account_balance_wallet'
        );
    }
    if (Perm::Count(81)) {
        $Data[$i]['children'][$j]['children'][] = array(
            'id'        => 'master-company',
            'title'     => 'Exchange Rate',
            'type'      => 'item',
            'url'       => '/master/exchangerate',
            'icon'      => 'attach_money'
        );
    }
    if (Perm::Count(49)) {
        $Data[$i]['children'][$j]['children'][] = array(
            'id'        => 'master-company',
            'title'     => 'Company',
            'type'      => 'item',
            'url'       => '/master/company',
            'icon'      => 'domain'
        );
    }
    if (Perm::Count(84)) {
        $Data[$i]['children'][$j]['children'][] = array(
            'id'        => 'master-dept',
            'title'     => 'Department',
            'type'      => 'item',
            'url'       => '/master/dept',
            'icon'      => 'meeting_room'
        );
    }
    // if (Perm::Count(202)) {
    //     $Data[$i]['children'][$j]['children'][] = array(
    //         'id'        => 'wo_lokasi',
    //         'title'     => 'Locations',
    //         'type'      => 'item',
    //         'url'       => '/master/lokasi',
    //         'icon'      => 'room'
    //     );
    // }
    if (Perm::Count(133)) {
        $Data[$i]['children'][$j]['children'][] = array(
            'id'        => 'master-cost-center',
            'title'     => 'Cost Center',
            'type'      => 'item',
            'url'       => '/master/cost_center',
            'icon'      => 'library_books'
        );
    }
    if (Perm::Count(137)) {
        $Data[$i]['children'][$j]['children'][] = array(
            'id'        => 'master-vehicle',
            'title'     => 'Vehicle',
            'type'      => 'item',
            'url'       => '/master/vehicle',
            'icon'      => 'local_shipping'
        );
    }
    if (Perm::Count(194)) {
        $Data[$i]['children'][$j]['children'][] = array(
            'id'        => 'master-equipment',
            'title'     => 'Equipment',
            'type'      => 'item',
            'url'       => '/master/equipment',
            'icon'      => 'build'
        );
    }
    if (Perm::Count(196)) {
        $Data[$i]['children'][$j]['children'][] = array(
            'id'        => 'master-job-alocation',
            'title'     => 'Job Alocation',
            'type'      => 'item',
            'url'       => '/master/job_alocation',
            'icon'      => 'view_list'
        );
    }
}

?>