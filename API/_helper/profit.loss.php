<?php
$Tree = array(
    array(
        'name' => 'Revenue',
        'store_to' => 'revenue'
    ),
    array(
        'name' => 'Cost of Goods Sold',
        'store_to' => 'cogs'
    ),
    array(
        'name' => 'GROSS PROFIT',
        'no_total' => 1,
        'store_to' => 'gross_profit'
    ),
    array(
        'name' => 'Expense',
        'store_to' => 'expense'
    ),
    array(
        'name' => 'INCOME FROM OPERATION',
        'no_total' => 1,
        'store_to' => 'income'
    ),
    array(
        'name' => 'OTHER INCOME AND EXPENSE',
        'child' => array(
            array(
                'name' => 'Other Income',
                'store_to' => 'other_income'
            ),
            array(
                'name' => 'Other Expense',
                'store_to' => 'other_expense'
            ),
        )
    ),
    array(
        'name' => 'NET PROFIT/LOSS (Before Tax)',
        'no_total' => 1,
        'store_to' => 'pl_before'
    ),
    array(
        'name' => 'NET PROFIT/LOSS (After Tax)',
        'no_total' => 1,
        'store_to' => 'pl_after'
    ),
);

echo Core::ReturnData($Tree);
?>