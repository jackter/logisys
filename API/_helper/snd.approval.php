<?php

/**
 * Define Step
 */
function ProcStepDesc($kode){

    switch($kode){

        /**
         * MR
         */
        case 10000:
        break;
        case 10100:
            $Desc = "Logistic Process Started";
            // Ditandai oleh Approval MR by logistic
        break;
        case 10201:
            $Desc = "Approved";
            // Jika tidak ada perubahan
        break;
        case 10202:
            $Desc = "Approved & Modified";
            // Jika ada perubahan terhadap jumlah Qty
        break;
        //=> / END : MR

        /**
         * GI
         */
        case 20100:
            $Desc = "Goods Issued";
            // Trigger Pada saat full Issued
        break;
        case 20200:
            $Desc = "Goods Issued Partially (Outstanding)";
            // Trigger Pada saatu Issued Partial
        break;
        //=> / END : GI

        /**
         * PR
         */
        case 30100:
            $Desc = "Purchase Request, Waiting Approval";
            // Trigger dari pembuatan PR sesuai dengan MR
        break;
        case 30201:
            $Desc = "Purchase Request Approved";    // MGR Purchasing Approved
            // Trigger pada saat manager approved
        break;
        case 30202:
            $Desc = "Purchas Request Approved";    // Dirkom / Head Approved
            // Trigger pada saat Dirkom / Head Approve
        break;
        case 30300:
            $Desc = "Purchase Request Approval Finished";
            // Trigger untuk pembuatan RFQ
        break;
        //=> / END : PR

        /**
         * RFQ
         */
        case 40100:
            $Desc = "Purchase Quotation";
        break;
        case 40201:
            $Desc = "Quotation Approved";
        break;
        case 40202:
            $Desc = "Quaotation Approved";
        break;
        case 40300:
            $Desc = "Purchase Quaotation Approval Finished, Processing to Purchasing Order";
        break;
        //=> / END : RFQ

        /**
         * PO
         */
        case 50100:
            $Desc = "Purchasing Order";
        break;
        //=> / END : PO

        /**
         * GR
         */
        case 60100:
            $Desc = "Goods Receipt";
        break;
        case 60200:
            $Desc = "Goods Receipt (Partially)";
        break;
        //=> / END : GR

        default:
            $Desc = "Progress Core Not Found!";

    }

    return $Desc;

}
//=> / END : Define Step

?>