import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import swal from 'sweetalert2';
import { BroadcasterService } from 'ng-broadcaster';

@Component({
    selector: 'dialog-form-bom',
    templateUrl: './form.html',
    styleUrls: ['../bom.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class BomFormDialogComponent implements OnInit {

    Material: any[] = [{
        i: 0
    }];
    Output: any[] = [{
        i: 0
    }];
    Utility: any[] = [{
        i: 0
    }];

    form: any = {};
    perm: any = {};
    Default: any = {};

    ComUrl;
    Com;
    Busy;

    Delay;

    constructor(
        public core: Core,
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<BomFormDialogComponent>,
        private broadcaster: BroadcasterService
    ) {


    }


    ngOnInit() {

        this.Alokasi = this.Default.params.alokasi_coa.value;

        if (this.form.id != 'add') {

            setTimeout(() => {
                this.Material = this.form.material;
                this.Output = this.form.output;
                this.Utility = this.form.utility;

                this.StorelocLast = this.form.storeloc_nama;
            }, 100);
        }

    }

    /**
     * AC Cost center
     */
    Cost: any;
    CostFilter(val: string) {

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            var Params = {
                NoLoader: 1,
                keyword: val,
                company: 3
            };

            this.core.Do(this.ComUrl + 'list.cost', Params).subscribe(
                result => {

                    if (result) {
                        this.Cost = result;
                    }
                },
                error => {
                    this.core.OpenNotif(error);
                }
            );

        }, 250);
    }
    CostSelect(e, item) {

        if (e.isUserInput) {

            this.form.cost = item.id;
            this.form.cost_kode = item.kode;
            this.form.cost_nama = item.nama;

            this.form.company = item.company;

            var i = 0;
            for (let item of this.Material) {

                if (i < this.Material.length - 1) {
                    item.cost_center = this.form.cost;
                    item.cost_center_kode = this.form.cost_kode;
                    item.cost_center_nama = this.form.cost_nama;
                }

                i++;

            }

            setTimeout(() => {
                $('#material-nama-0').focus();
            }, 100);

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
     * AC COA Alokasi
     */

    Alokasi: any = [];
    COAAlokasiFilter(val: string, i: number) {

        if (val) {

            val = val.toString().toLowerCase();

            let i = 0;
            let Filtered = [];

            for (let item of this.Default.params.alokasi_coa.value) {

                var Combine = item.nama + ' (' + item.kode + ')';

                if (Combine.toLowerCase().indexOf(val) != -1) {
                    Filtered[i] = item;
                    i++;
                }

            }
            this.Alokasi = Filtered;
            this.WaitItemMaterial[i] = false;
        } else {
            this.Alokasi = this.Default.params.alokasi_coa.value;
        }

    }
    COAAlokasiSelect(e, item, i) {

        if (e.isUserInput) {

            this.Material[i].coa_alokasi = item.id;
            this.Material[i].coa_alokasi_nama = item.nama;

        }

    }
    RemoveCoaAlokasi(i) {
        this.Material[i].coa_alokasi = null;
        this.Material[i].coa_alokasi_nama = null;

        this.Material[i].coa = null;
        this.Material[i].coa_kode = null;
        this.Material[i].coa_nama = null;

        setTimeout(() => {
            this.COA = [];
        }, 250);

        this.COAAlokasiFilter('', i);
    }

    // => / END : AC COA Alokasi

    /**
     * AC COA
     */
    COA: any;
    COAFilter(val: string, alokasi: string, i: number) {

        this.COA = [];

        // if (val) {

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            val = val.toString().toLowerCase();

            var Params = {
                NoLoader: 1,
                company: 3,
                alokasi: alokasi,
                keyword: val
            };

            this.core.Do(this.ComUrl + 'coa.list', Params).subscribe(
                result => {

                    if (result) {
                        this.COA = result;
                    }

                    this.WaitItemMaterial[i] = false;
                },
                error => {
                    console.error('Coa Filter', error);
                    this.core.OpenNotif(error);
                    this.WaitItemMaterial[i] = false;
                }

            );

        }, 100);

        // }

    }
    COASelect(e, item, i: number) {

        if (e.isUserInput) {

            this.Material[i].coa = item.id;
            this.Material[i].coa_kode = item.kode;
            this.Material[i].coa_nama = item.nama;

            setTimeout(() => {
                this.COA = [];
            }, 250);

        }
    }
    RemoveCoa(i) {
        this.Material[i].coa = null;
        this.Material[i].coa_kode = null;
        this.Material[i].coa_nama = null;

        setTimeout(() => {
            this.COA = [];
        }, 250);
    }
    // => End AC COA

    /**
     * AC Item
     */
    Item: any;
    WaitItemMaterial: any[] = [];
    WaitItemOutput: any[] = [];
    WaitItemUtility: any[] = [];
    ItemFilter(val: string, i: number, type: number) {

        if (val) {

            clearTimeout(this.Delay);
            this.Delay = setTimeout(() => {

                if (type == 1) {
                    this.WaitItemMaterial[i] = true;
                } else
                    if (type == 2) {
                        this.WaitItemOutput[i] = true;
                    } else
                        if (type == 3) {
                            this.WaitItemUtility[i] = true;
                        }

                val = val.toString().toLowerCase();

                var Params = {
                    NoLoader: 1,
                    keyword: val
                };

                this.core.Do('e/stock/item/inc/list.normal', Params).subscribe(
                    result => {

                        if (result) {
                            this.Item = result;
                        }

                        if (type == 1) {
                            this.WaitItemMaterial[i] = false;
                        } else
                            if (type == 2) {
                                this.WaitItemOutput[i] = false;
                            } else
                                if (type == 3) {
                                    this.WaitItemUtility[i] = false;
                                }

                    },
                    error => {
                        console.error('ItemFilter', error);
                        this.core.OpenNotif(error);

                        if (type == 1) {
                            this.WaitItemMaterial[i] = false;
                        } else
                            if (type == 2) {
                                this.WaitItemOutput[i] = false;
                            } else
                                if (type == 3) {
                                    this.WaitItemUtility[i] = false;
                                }
                    }
                );

            }, 100);

        }

    }
    ItemSelect(e, item, i: number, type: number) {

        if (e.isUserInput) {

            var LIST;
            var Active;

            if (type == 1) {
                LIST = this.Material;
                Active = 'material';
            } else
                if (type == 2) {
                    LIST = this.Output;
                    Active = 'output';
                } else
                    if (type == 3) {
                        LIST = this.Utility;
                        Active = 'utility';
                    }

            var Find = this.core.FJSON(LIST, 'id', item.id);

            setTimeout(() => {

                if (Find.length <= 0) {
                    LIST[i] = item;
                    LIST[i]['i'] = i;

                    this.Item = [];

                    this.CreateList(i, type);

                    setTimeout(() => {
                        $('#' + Active + '-qty-' + i).focus();
                    }, 100);
                } else {
                    var SelectExists = Find[0].i;

                    LIST[i].nama = '';

                    setTimeout(() => {
                        if (type == 1) {
                            this.WaitItemMaterial[i] = false;
                        } else
                            if (type == 2) {
                                this.WaitItemOutput[i] = false;
                            } else
                                if (type == 3) {
                                    this.WaitItemUtility[i] = false;
                                }
                        $('#' + Active + 'qty-' + SelectExists).focus();
                    }, 250);
                }

            }, 0);

        }

    }
    // => / END : AC Item

    /**
     * AC Job Alocation
     */
    JobAlocation: any = [];
    FilterJobAlocation(val: string, i: number) {
        this.JobAlocation = [];

        if (val) {

            clearTimeout(this.Delay);
            this.Delay = setTimeout(() => {

                val = val.toString().toLowerCase();

                var Params = {
                    NoLoader: 1,
                    company: this.form.company,
                    keyword: val
                };

                this.core.Do(this.ComUrl + 'list.job', Params).subscribe(
                    result => {

                        if (result.job_alocation) {
                            this.JobAlocation = result.job_alocation;
                        }

                        this.WaitItemMaterial[i] = false;
                    },
                    error => {
                        console.error('Job Alocation Filter', error);
                        this.core.OpenNotif(error);
                        this.WaitItemMaterial[i] = false;
                    }

                );

            }, 100);

        }

    }

    SelectJobAlocation(e, item, i: number) {
        if (e.isUserInput) {

            this.Material[i].job_alocation = item.id;
            this.Material[i].job_alocation_nama = item.nama;
            this.Material[i].coa = item.coa;
            this.Material[i].coa_kode = item.coa_kode;
            this.Material[i].coa_nama = item.coa_nama;

            setTimeout(() => {
                this.JobAlocation = [];
            }, 250);

        }
    }

    RemoveJobAlocation(i) {
        this.Material[i].job_alocation = null
        this.Material[i].job_alocation_nama = null;
        this.Material[i].coa = null;
        this.Material[i].coa_kode = null;
        this.Material[i].coa_nama = null;
        setTimeout(() => {
            this.JobAlocation = [];
        }, 250);
    }
    //=> END : AC Job Alocation

    /**
     * List
     */
    CreateList(i, type: number) {

        var LIST;

        if (type == 1) {
            LIST = this.Material;
        } else
            if (type == 2) {
                LIST = this.Output;
            } else
                if (type == 3) {
                    LIST = this.Utility;
                }

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            // => Check List
            if (!LIST[i].kode) {
                LIST[i] = {};
            }

            // => Check Next Input
            var next = Number(i) + 1;
            let DataNext = {
                i: next
            };

            if (!LIST[next]) {
                LIST.push(DataNext);
            }

        }, 100);

    }

    DeleteList(del, type: number) {

        swal({
            title: 'Delete List?',
            html: '<div>Are you sure to continue?</div>',
            type: 'error',
            reverseButtons: true,
            focusCancel: true,
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'Cancel'
        }).then(
            result => {

                if (result.value) {

                    var LIST;

                    if (type == 1) {
                        LIST = this.Material;
                    } else
                        if (type == 2) {
                            LIST = this.Output;
                        } else
                            if (type == 3) {
                                LIST = this.Utility;
                            }

                    var DATA = Object.keys(LIST);

                    // => Delete
                    var NewList = [];
                    let index = 0;
                    for (let i = 0; i < DATA.length; i++) {
                        if (del == i) {

                            delete LIST[i];

                        } else {

                            LIST[i].i = index;

                            NewList[index] = LIST[i];
                            index++;
                        }
                    }

                    // => Recreaten
                    LIST = NewList;

                    if (type == 1) {
                        this.Material = LIST;
                    } else
                        if (type == 2) {
                            this.Output = LIST;
                        } else
                            if (type == 3) {
                                this.Utility = LIST;
                            }

                }

            }
        );

    }
    // => / END : List

    Edit() {
        this.form.is_detail = null;
        setTimeout(() => {
            $('*[name="description"]').focus();
        }, 100);
    }

    /**
     * AC Storeloc
     */
    Storeloc: any = [];
    StorelocLast;
    async StorelocFilter() {

        this.Storeloc = this.Default.storeloc;

        var val = this.form.storeloc_nama;

        if (val != this.StorelocLast) {

            this.form.storeloc = null;
            this.form.storeloc_kode = null;

            $('*[name="storeloc_nama"]').focus();

        }

        if (val) {

            val = val.toString().toLowerCase();

            let i = 0;
            let Filtered = [];
            for (let item of this.Default.storeloc) {

                var Combine = item.kode + ' : ' + item.nama;
                if (
                    item.kode.toLowerCase().indexOf(val) != -1 ||
                    item.nama.toLowerCase().indexOf(val) != -1 ||
                    Combine.toLowerCase().indexOf(val) != -1
                ) {
                    Filtered[i] = item;
                    i++;
                }

            }
            this.Storeloc = Filtered;

        }

    }
    StorelocSelect(e, item) {
        if (e.isUserInput) {

            this.form.storeloc = item.id;
            this.form.storeloc_nama = item.nama;
            this.form.storeloc_kode = item.kode;

            this.StorelocLast = item.nama;

            this.Item = [];

            setTimeout(() => {
                $('*[name="cost_nama"]').focus();
            }, 100);

        }
    }
    StorelocReset() {
        /**
         * Reset Storeloc
         */
        this.form.storeloc = null;
        this.form.storeloc_kode = null;
        this.form.storeloc_nama = null;
        // => / END : Reset Storeloc
    }
    // => / END : AC Storeloc

    /**
    * Simpan
    */
    Simpan() {

        this.form.material = JSON.stringify(this.Material);
        this.form.output = JSON.stringify(this.Output);
        this.form.utility = JSON.stringify(this.Utility);

        // console.log(this.form);

        var URL = this.ComUrl + 'edit';
        if (this.form.id == 'add') {
            URL = this.ComUrl + 'add';
        }

        this.Busy = true;
        this.core.Do(URL, this.form).subscribe(
            result => {

                // console.log(result);
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

                this.core.OpenNotif(error);
                console.error('Submit', error);
            }
        );

    }
    // => / END : Simpan

    /**
     * Verify
     */
    Verify() {
        swal({
            title: 'Please Confirm to Verify?',
            html: '<div>Are you sure to continue?</div>',
            type: 'warning',
            reverseButtons: true,
            focusCancel: true,
            showCancelButton: true,
            confirmButtonText: 'Verify',
            cancelButtonText: 'Cancel'
        }).then(
            result => {

                if (result.value) {

                    var Params = {
                        id: this.form.id,
                        kode: this.form.kode,
                    };

                    this.Busy = true;
                    this.core.Do(this.ComUrl + 'verify', Params).subscribe(
                        result => {

                            if (result.status == 1) {

                                var Success = {
                                    type: 'success',
                                    showConfirmButton: false,
                                    title: 'Verify Complete',
                                    msg: 'Your Request will Continue to Approval Process'
                                };
                                this.core.OpenAlert(Success);

                                this.dialogRef.close(result);

                            } else {
                                var Alert = {
                                    msg: result.error_msg
                                };
                                this.core.OpenAlert(Alert);

                                this.Busy = false;
                            }

                        },
                        error => {
                            console.error('Verify', error);
                            this.core.OpenNotif(error);

                            this.Busy = false;
                        }
                    );

                }

            }
        );
    }
    // => / END : Verify

}