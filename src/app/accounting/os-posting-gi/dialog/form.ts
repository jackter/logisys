import { Component, OnInit } from "@angular/core";
import { Core } from "providers/core";
import { MatDialogRef, MatDialog } from '@angular/material';
import * as moment from 'moment';

@Component({
    selector: 'dialog-form-Poting',
    templateUrl: './form.html'
})
export class PostingGIFormDialogComponent implements OnInit {

    List: any[] = [{
        i: 0
    }];
    form: any = {};
    perm: any = {};
    Default: any = {};

    ComUrl;
    Com;
    Busy;

    Delay;

    minDate;

    ReceiptState;

    constructor(
        private core: Core,
        private dialog: MatDialog,
        public dialogRef: MatDialogRef<PostingGIFormDialogComponent>
    ) {
        this.minDate = moment(new Date()).format('DD/MM/YYYY');
    }

    ngOnInit() {

        if (this.form.id != 'add') {
            this.form.isposting = 1;
            if (Object.keys(this.form.list).length > 0) {
                for (let item of this.form.list) {
                    if (Number(item.item_type) == 1) {
                        item.item_type_desc = "Inventory";
                    }

                    if (Number(item.item_type) == 0) {
                        this.form.isposting = 0;
                    }
                }
                this.List = this.form.list;

            }
        }
    }

    /**
     * AC COA
     */
    COA: any;
    WaitItem: any[] = [];
    async COAFilter(val: string, i: number) {

        if (val) {

            clearTimeout(this.Delay);
            this.Delay = setTimeout(() => {

                this.WaitItem[i] = true;

                val = val.toString().toLowerCase();

                var Params = {
                    NoLoader: 1,
                    company: this.form.company,
                    keyword: val
                };

                this.core.Do(this.ComUrl + 'coa.list', Params).subscribe(
                    result => {

                        if (result) {
                            this.COA = result;
                        }

                        this.WaitItem[i] = false;
                    },
                    error => {
                        console.error('Coa Filter', error);
                        this.core.OpenNotif(error);
                        this.WaitItem[i] = false;
                    }

                );

            }, 100);

        }

    }
    COASelect(e, item, i: number) {

        if (e.isUserInput) {

            this.List[i].coa = item.id;
            this.List[i].coa_kode = item.kode;
            this.List[i].nama = item.nama;

            this.COA = [];
        }
    }
    removeCoa(item) {
        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {
            item.coa = null;
            item.coa_kode = null;
            item.nama = null;
        }, 100);
    }
    // => End AC COA

    /**
     * AC Cost center
     */
    CostD: any;
    WaitCostD: any[] = [];
    CostFilterD(val: string) {

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            var Params = {
                NoLoader: 1,
                keyword: val,
                company: this.form.company
            };

            this.core.Do(this.ComUrl + 'list.cost', Params).subscribe(
                result => {

                    if (result) {
                        this.CostD = result;
                        console.log(result);
                    }
                },
                error => {
                    this.core.OpenNotif(error);
                }
            );

        }, 250);
    }
    CostSelectD(e, item, i: number) {

        if (e.isUserInput) {

            setTimeout(() => {

                this.List[i].cost_center = item.id;
                this.List[i].cost_center_kode = item.kode;
                this.List[i].cost_center_nama = item.nama;

                setTimeout(() => {
                    this.WaitCostD[i] = false;
                    $('#remarks-' + i).focus();
                }, 250);

            }, 0);

        }
    }
    removeCostCenter(item) {
        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {
            item.cost_center = 0;
            item.cost_center_kode = null;
            item.cost_center_nama = null;
        }, 100);
    }
    // => End : Cost Center


    /**
     * Simpan
     */
    Simpan() {

        if (this.form.isposting == 0) {
            this.core.OpenAlert({
                title: 'One of Item Type Description is not defined',
                msg: '<div>To create posting GI, please complete the <strong>item type</strong> on the item form.</div>',
                width: 400
            });
        }
        else {
            this.form.list = JSON.stringify(this.List);

            var URL = this.ComUrl + 'add';

            var checkCost = 1;
            for (let item of this.List) {
                if (!item.cost_center_kode) {
                    checkCost = 0;
                }
            }

            if (checkCost == 0) {
                this.core.OpenAlert({
                    title: 'One of Item Cost Center Code is not defined',
                    msg: '<div>To create posting GI, please complete the <strong>Cost Center</strong> according to cost center list which is displayed by system.</div>',
                    width: 400
                });
            }
            else {
                this.Busy = true;
                this.core.Do(URL, this.form).subscribe(
                    result => {

                        if (result.status == 1) {

                            this.dialogRef.close(result);

                        } else {

                            this.Busy = false;

                            var Alert = {
                                msg: result.error_msg
                            };
                            this.core.OpenAlert(Alert);
                        }
                    },
                    error => {
                        this.Busy = false;

                        console.error('Simpan', error);
                    }

                );
            }
        }

    }

    // => End : Simpan

}
