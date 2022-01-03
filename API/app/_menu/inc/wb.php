<?php
$Child = array(76,188,77,78,79);
if(Perm::ChildCount($Child)){

    $j++;
    $Data[$i]['children'][$j] = array(
        'id'        => 'wb',
        'title'     => 'Weighbridge',
        'type'      => 'collapsable',
        'icon'      => 'local_shipping',
    );

        if(Perm::Count(76)){
            $Data[$i]['children'][$j]['children'][] = array(
                'id'        => 'contract',
                'title'     => 'Contract',
                'type'      => 'item',
                'url'       => '/wb/contract',
                'icon'      => 'description'
            );
        }

        if(Perm::Count(188)){
            $Data[$i]['children'][$j]['children'][] = array(
                'id'        => 'contract2',
                'title'     => 'Contract2',
                'type'      => 'item',
                'url'       => '/wb/contract2',
                'icon'      => 'description'
            );
        }

        if(Perm::Count(77)){
            $Data[$i]['children'][$j]['children'][] = array(
                'id'        => 'transaction',
                'title'     => 'Transaction',
                'type'      => 'item',
                'url'       => '/wb/transaction',
                'icon'      => 'library_books'
            );
        }

        if(Perm::Count(78)){
            $Data[$i]['children'][$j]['children'][] = array(
                'id'        => 'transporter',
                'title'     => 'Transporter',
                'type'      => 'item',
                'url'       => '/wb/transporter',
                'icon'      => 'local_shipping'
            );
        }
        
        if(Perm::Count(79)){
            $Data[$i]['children'][$j]['children'][] = array(
                'id'        => 'vehicle',
                'title'     => 'Vehicle',
                'type'      => 'item',
                'url'       => '/wb/vehicle',
                'icon'      => 'directions_bus'
            );
        }
}
?>