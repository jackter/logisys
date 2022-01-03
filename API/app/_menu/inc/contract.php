<?php
$Child = array(178, 179, 180, 181, 182, 183);
if (Perm::ChildCount($Child)) {

    $j++;
    $k = -1;
    $Data[$i]['children'][$j] = array(
        'id'        => 'contract',
        'title'     => 'Contract',
        'type'      => 'collapsable',
        'icon'      => 'receipt_long',
    );

    if (Perm::Count(183)) {
        $k++;
        $Data[$i]['children'][$j]['children'][$k] = array(
            'id'        => 'contract-request',
            'title'     => 'Contract Request',
            'type'      => 'item',
            'url'       => '/contract/contract-request',
            'icon'      => 'note_add'
        );
    }

    if (Perm::Count(181)) {
        $k++;
        $Data[$i]['children'][$j]['children'][$k] = array(
            'id'        => 'contract-agreement',
            'title'     => 'Contract Agreement',
            'type'      => 'item',
            'url'       => '/contract/contract-agreement',
            'icon'      => 'verified_user'
        );
    }

    if (Perm::Count(180)) {
        $k++;
        $Data[$i]['children'][$j]['children'][$k] = array(
            'id'        => 'contract-progress',
            'title'     => 'Contract Progress',
            'type'      => 'item',
            'url'       => '/contract/contract-progress',
            'icon'      => 'cached'
        );
    }

    $Child = array(178, 179);
    if (Perm::ChildCount($Child)) {
        $k++;
        $Data[$i]['children'][$j]['children'][$k] = array(
            'id'        => 'contract-inv',
            'title'     => 'Contract Invoice',
            'type'      => 'collapsable',
            'icon'      => 'description'
        );
        if (Perm::Count(179)) {
            $Data[$i]['children'][$j]['children'][$k]['children'][] = array(
                'id'        => 'contract-invoice',
                'title'     => 'Inv. Standard',
                'type'      => 'item',
                'url'       => '/contract/contract-invoice',
                'icon'      => 'chevron_right'
            );
        }

        if (Perm::Count(178)) {
            $Data[$i]['children'][$j]['children'][$k]['children'][] = array(
                'id'        => 'contract-invoice-others',
                'title'     => 'Inv. Others',
                'type'      => 'item',
                'url'       => '/contract/contract-invoice-others',
                'icon'      => 'chevron_right'
            );
        }
    }

    if (Perm::Count(182)) {
        $k++;
        $Data[$i]['children'][$j]['children'][$k] = array(
            'id'        => 'contract-adendum',
            'title'     => 'Contract Adendum',
            'type'      => 'item',
            'url'       => '/contract/contract-adendum',
            'icon'      => 'description'
        );
    }
}

?>