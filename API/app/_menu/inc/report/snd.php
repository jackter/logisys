<?php

$Child = array(35, 56, 94, 95, 96, 97, 209, 210);
if(Perm::ChildCount($Child)){
    $j++;
    $Data[$i]['children'][$j] = array(
        'id'        => 'rpt-snd',
        'title'     => 'Supply & Demand',
        'type'      => 'collapsable',
        'icon'      => 'table_chart',
    );

    if(Perm::Count(35)){
        $Data[$i]['children'][$j]['children'][] = array(
            'id'        => 'rpt-snd-mr',
            'title'     => 'Material Request',
            'type'      => 'item',
            'url'       => '/snd/report/mr',
            'icon'      => 'folder'
        );
    }

    if(Perm::Count(95)){
        $Data[$i]['children'][$j]['children'][] = array(
            'id'        => 'rpt-snd-grn',
            'title'     => 'Goods Receive',
            'type'      => 'item',
            'url'       => '/snd/report/grn',
            'icon'      => 'folder'
        );
    }

    if(Perm::Count(35)){
        $Data[$i]['children'][$j]['children'][] = array(
            'id'        => 'rpt-snd-monitoring_request',
            'title'     => 'Monitoring MR',
            'type'      => 'item',
            'url'       => '/snd/report/monitoring_request',
            'icon'      => 'desktop_windows'
        );
    }

    if(Perm::Count(190)){
        $Data[$i]['children'][$j]['children'][] = array(
            'id'        => 'rpt-snd-monitoring_pr',
            'title'     => 'Monitoring PR',
            'type'      => 'item',
            'url'       => '/snd/report/monitoring_pr',
            'icon'      => 'desktop_windows'
        );
    }
    if(Perm::Count(94)){
        $Data[$i]['children'][$j]['children'][] = array(
            'id'        => 'rpt-snd-monitoring_po',
            'title'     => 'Monitoring PO',
            'type'      => 'item',
            'url'       => '/snd/report/monitoring_po',
            'icon'      => 'desktop_windows'
        );
    }

    if (Perm::Count(209)) {
        $Data[$i]['children'][$j]['children'][] = array(
            'id'        => 'monitoring_os_po_null',
            'title'     => 'Monitoring OS PO Null',
            'type'      => 'item',
            'url'       => '/snd/report/os_po_null',
            'icon'      => 'chevron_right'
        );
    }

    if (Perm::Count(210)) {
        $Data[$i]['children'][$j]['children'][] = array(
            'id'        => 'monitoring_os_po_partial',
            'title'     => 'Monitoring OS PO Partial',
            'type'      => 'item',
            'url'       => '/snd/report/os_po_partial',
            'icon'      => 'chevron_right'
        );
    }

    if(Perm::Count(97)){
        $Data[$i]['children'][$j]['children'][] = array(
            'id'        => 'rpt-snd-monitoring_gr',
            'title'     => 'Monitoring GR',
            'type'      => 'item',
            'url'       => '/snd/report/monitoring_gr',
            'icon'      => 'desktop_windows'
        );
    }

    if(Perm::Count(96)){
        $Data[$i]['children'][$j]['children'][] = array(
            'id'        => 'rpt-snd-rgr',
            'title'     => 'Return GR',
            'type'      => 'item',
            'url'       => '/snd/report/rgr',
            'icon'      => 'replay'
        );
    }
}
?>