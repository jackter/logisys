<?php
$Tree = array(
    array(
        'name' => 'ASSETS',
        'child' => array(
            array(
                'name' => 'CURRENT ASSETS',
                'child' => array(
                    array(
                        'name' => 'Cash/Bank',
                    ),
                    array(
                        'name' => 'Account Receivable',
                    ),
                    array(
                        'name' => 'Inventory',
                    ),
                    array(
                        'name' => 'Other Current Assets'
                    ),
                )
            ),
            array(
                'name' => 'FIXED ASSETS',
                'child' => array(
                    array(
                        'name' => 'Historical Value',
                        'child' => array(
                            array(
                                'name' => 'Fixed Asset'
                            ),
                        )
                    ),
                    array(
                        'name' => 'Accumulated Depreciation',
                    )
                )
            ),
            array(
                'name' => 'OTHER ASSETS',
                'child' => array(
                    array(
                        'name' => 'Other Asset'
                    )
                )
            )
        ),
    ),
    array(
        'name' => 'LIABILITIES and EQUITIES',
        'child' => array(
            array(
                'name' => 'LIABILITIES',
                'child' => array(
                    array(
                        'name' => 'Current Liabilities',
                        'child' => array(
                            array(
                                'name' => 'Account Payable'
                            ),
                            array(
                                'name' => 'Other Current Liability',
                            )
                        )
                    ),
                    array(
                        'name' => 'Long Term Liability',
                    ),
                )
            ),
            array(
                'name' => 'EQUITIES',
                'child' => array(
                    array(
                        'name' => 'Equity'
                    )
                )
            )
        )
    )
);

echo Core::ReturnData($Tree);
?>