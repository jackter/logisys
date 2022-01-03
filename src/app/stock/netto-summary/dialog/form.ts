
import { OnInit, Component } from '@angular/core';
import swal from 'sweetalert2';
import { Core } from 'providers/core';
import { MatDialogRef } from '@angular/material';
import * as moment from 'moment';

@Component({
    selector: 'dialog-form-netto',
    templateUrl: './form.html'
})
export class NettoSummaryFormComponent implements OnInit {

    form: any = {};
    perm: any = {};
    Default: any = {};

    ComUrl;
    Com;
    Busy;

    Delay;

    minDate = moment(new Date()).subtract(3, 'days').format('YYYY-MM-DD').toString();
    maxDate = moment(new Date()).format('YYYY-MM-DD').toString();

    Produk = [
        {item:238, item_kode:'CANG0001', item_nama:'Cangkang', item_satuan:'Kg'},
        {item:1918, item_kode:'PDS0001', item_nama:'Petro-4/Diesel - Solar', item_satuan:'Ltr'},
        {item:2021, item_kode:'CPOC0001', item_nama:'Crude Palm Oil (CPO)', item_satuan:'Kg'},
        {item:2022, item_kode:'SBES0001', item_nama:'Spent Bleaching Earth (SBE)', item_satuan:'Kg'},
        {item:5229, item_kode:'PCIU0002', item_nama:'Plastic Container Industrial Use 620 x 415 x 145 mm', item_satuan:'Pcs'},
        {item:5557, item_kode:'PAK0003', item_nama:'Phosporic Acid (in Kg)', item_satuan:'Kg'}
    ];
    
    constructor(
        private core: Core,
        private dialogRef: MatDialogRef<NettoSummaryFormComponent>
    ) { }


    ngOnInit() {
        this.Company = this.Default.company;

        /**
         * Check Company
         * 
         * Jika Company hanya 1, maka system akan melakukan Autoselect
         * dan Mematikan fungsi Auto Complete
         */
        this.CompanyLen = Object.keys(this.Company).length;
        if (this.CompanyLen == 1) {
            this.form.company = this.Company[0].id;
            this.form.company_abbr = this.Company[0].abbr;
            this.form.company_nama = this.Company[0].nama;
        }
        // => / Check Company
        
    }

    Edit() {
        this.form.is_detail = null;
        setTimeout(() => {
            $('*[name="remarks"]').focus();
        }, 100);
    }

    ProdukSelect(e, item) {
        if (e.isUserInput) {
            this.form.item = item.item;
            this.form.item_kode = item.item_kode;
            this.form.item_nama = item.item_nama;
            this.form.item_satuan = item.item_satuan;
            if(this.form.id == 'add'){

                this.GetStartTiket();
            }
        }
    }

    ProdukRemove() {
        this.form.item = null;
        this.form.item_kode = null;
        this.form.item_nama = null;
        this.form.item_satuan = null;
    }

    /**
     * AC Company
     */
    Company: any = [];
    CompanyLen: number;
    CompanyLast;

    CompanyFilter() {

        var val = this.form.company_nama;

        // if (val != this.CompanyLast) {
        //     this.form.company = null;
        //     this.form.company_abbr = null;
        // }

        if (val) {

            val = val.toString().toLowerCase();

            let i = 0;
            let Filtered = [];
            for (let item of this.Default.company) {

                var Combine = item.nama + ' (' + item.abbr + ')';
                if (
                    item.abbr.toLowerCase().indexOf(val) != -1 ||
                    item.nama.toLowerCase().indexOf(val) != -1 ||
                    Combine.toLowerCase().indexOf(val) != -1
                ) {
                    Filtered[i] = item;
                    i++;
                }

            }
            this.Company = Filtered;

        } else {
            this.Company = this.Default.company;
        }

    }
    CompanySelect(e, item) {
        if (e.isUserInput) {
            this.form.company = item.id;
            this.form.company_nama = item.nama;
            this.form.company_abbr = item.abbr;

            // this.CompanyLast = item.nama;

            setTimeout(() => {
                $('*[name="tanggal"]').focus();
            }, 100);
        }
    }
    CompanyRemove() {

        $('#company_nama').blur();

        this.form.company_nama = '';
        setTimeout(() => {
            this.CompanyFilter();
        }, 100);
    }
    // => / END : AC Company

    GetStartTiket(){

        this.form.tiket_start = null;
        this.form.tiket_start_kode = null;

        var Params = {
            NoLoader: 1,
            tanggal: moment(this.form.tanggal).format('YYYY-MM-DD'),
            item: this.form.item
        };

        this.core.Do(this.ComUrl + 'tiket', Params).subscribe(
            result => {

                if (result) {
                    this.form.tiket_start = result.start_tiket.tiket;
                    this.form.tiket_start_kode = result.start_tiket.tiket_kode;

                    this.Tiket = result.transaksi;
                    this.Tiket_Default = result.transaksi;
                }

            },
            error => {
                console.error('ItemFilter', error);
                this.core.OpenNotif(error);
            }
        );

        // setTimeout(() => {
        //     $('*[name="tiket_end_kode"]').focus();
        // }, 100);

    }

    Tiket: any = [];
    Tiket_Default: any = [];
    TiketFilter(){

        var val = this.form.tiket_end_kode;

        if (val) {

            val = val.toString().toLowerCase();

            let i = 0;
            let Filtered = [];
            for (let item of this.Tiket_Default) {

                if (
                    item.tiket_kode.toLowerCase().indexOf(val) != -1
                ) {
                    Filtered[i] = item;
                    i++;
                }

            }
            this.Tiket = Filtered;

        } else {
            this.Tiket = this.Tiket_Default;
        }
    }
    TiketSelect(e, item, index){
        if (e.isUserInput) {
            this.form.tiket_end = item.tiket;

            let TotalNetto : Number = 0;
            for (let i = 0; i <= index; i++){

                TotalNetto += this.Tiket_Default[i].netto;
            }

            this.form.total_netto = TotalNetto;

        }
    }
    TiketRemove() {

        $('#tiket_end_kode').blur();

        this.form.tiket_end = null;
        this.form.tiket_end_kode = null;

        if(this.form.id != 'add'){
            this.GetStartTiket();
        }

        setTimeout(() => {
            this.TiketFilter();
        }, 100);
    }

    

    /**
     * Simpan
     */
    Simpan() {

        var URL = this.ComUrl + 'edit';
        if (this.form.id == 'add') {
            URL = this.ComUrl + 'add';
        }
        this.form.tanggal_send = moment(this.form.tanggal).format('YYYY-MM-DD');

        // console.log(this.form);
        
        this.Busy = true;
        this.core.Do(URL, this.form).subscribe(
            result => {

                if (result.status == 1) {

                    var Success = {
                        type: 'success',
                        showConfirmButton: false,
                        title: 'Data Saved',
                        msg: 'Please Verify your input to confirm and continue the process!'
                    };
                    this.core.OpenAlert(Success);

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
    // => / END : Simpan

   
    /**
     * Approve
     */
    Approve() {
        swal({
            title: 'Please Confirm to Approve?',
            html: '<div>Are you sure to continue?</div>',
            type: 'warning',
            reverseButtons: true,
            focusCancel: true,
            showCancelButton: true,
            confirmButtonText: 'Approve',
            cancelButtonText: 'Cancel'
        }).then(
            result => {

                if (result.value) {

                    var Params = {
                        id: this.form.id,
                        kode: this.form.kode,
                        enable_journal: this.form.enable_journal,
                        notimeout: 1
                    };
                    // console.log(Params);

                    this.Busy = true;
                    this.core.Do(this.ComUrl + 'approve', Params).subscribe(
                        result => {

                            if (result.status == 1) {

                                var Success = {
                                    type: 'success',
                                    showConfirmButton: false,
                                    title: 'Approve Complete',
                                    msg: 'This Job Order now available for Actual Production'
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
                            console.error('Approve', error);
                            this.core.OpenNotif(error);

                            this.Busy = false;
                        }
                    );

                }

            }
        );
    }
    // => / END : Approve
}
