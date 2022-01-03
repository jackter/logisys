import { Component, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material';
import * as moment from 'moment';
import swal from 'sweetalert2';
import * as _ from 'lodash';

@Component({
    selector: 'dialog-form-wo-process',
    templateUrl: './form.html',
    styleUrls: ['../wo-process.component.scss']
})
export class WOProcessFormDialogComponent implements OnInit {

    form: any = {};
    wo: any = {};
    perm: any = {};
    Default: any = {};
    Maintenance: any = {};
    DeptSection: any = {};

    ComUrl;
    Com;
    Busy;

    Delay;

    PIC: any = [];

    Material: any = [];
    Mechanic: any[] = [{
        i: 0
    }];
    JobTitle: any[] = [{
        i: 0
    }];
    JobExplan: any[] = [{
        i: 0
    }];

    AditionalMaterial: any[] = [{
        i: 0
    }];
    JobOvertime: any[] = [{
        i: 0
    }];

    DateToday = moment(new Date()).format('DD/MM/YYYY');
    maxDate = moment(new Date());

    constructor(
        public core: Core,
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<WOProcessFormDialogComponent>,
    ) {

    }

    ngOnInit() {

        if(this.form.id == 'add'){
            this.form.tanggal = this.DateToday;
        }else{
            this.form.tanggal = moment(this.form.tanggal, 'YYYY-MM-DD').format('DDMMYYYY').toString();
        }

        if (this.form.id != 'add') {

            if(this.form.mechanic) {
                this.Mechanic = this.form.mechanic;
            }

            if(this.form.overtime) {
                this.JobOvertime = this.form.overtime;
            }

            if(this.form.aditional) {
                this.AditionalMaterial = this.form.aditional;
            }

            if(this.form.job_explain) {
                this.JobExplan = JSON.parse(this.form.job_explain);
             
                if(!this.form.is_detail) {
                    this.JobExplan.push({i: 0});
                }
            }

        }

        
    }

    AutoFocus(key){

        setTimeout(() => {
            $(key).focus();
        }, 100);

    }

    setDate(val, model){
        if(val){
            this.form[model] = moment(val, "DD/MM/YYYY").format('DDMMYYYY').toString();
        }
    }

    /**
     * Edit
     */
    Edit() {
        if (this.form.is_detail) {
            this.form.is_detail = null;

            if(this.form.mechanic) {
                this.Mechanic.push({i:0});
            }

            if(this.form.overtime) {
                this.JobOvertime.push({i:0});
            }

            if(this.form.job_explain) {
                this.JobExplan = JSON.parse(this.form.job_explain);
             
                if(!this.form.is_detail) {
                    this.JobExplan.push({i: 0});
                }
            }

            if(this.form.aditional){
                if(!this.form.is_detail) {
                    this.AditionalMaterial.push({i: 0});
                }
            }
        }
    }
    // => END : Edit

    Calculate(item, type){

        if(type == 'manpower'){
            if(item.start_time && item.end_time){

                var Start = moment(item.start_time, 'HH:mm:ss');
                var End = moment(item.end_time, 'HH:mm:ss');
    
                item.start_format = moment(Start).format('HH:mm:ss');
                item.end_format = moment(End).format('HH:mm:ss');
    
                var total = Math.abs(End.diff(Start, 'minutes'));

                var durasi = 0;
                if(Start > End){
                    durasi = 1440 - total;
                }else{
                    durasi = total;
                }
    
                var jam = Math.floor(durasi/60);
                var menit = durasi - (jam * 60);
    
                item.act_hours_text = jam + ' Jam '+ menit +' Menit';
    
                item.act_hours = durasi/60;
                
            }
        }else{
            if(item.start_time_over && item.end_time_over){

                var Start = moment(item.start_time_over, 'HH:mm:ss');
                var End = moment(item.end_time_over, 'HH:mm:ss');
    
                item.start_over_format = moment(Start).format('HH:mm:ss');
                item.end_over_format = moment(End).format('HH:mm:ss');

                var total = Math.abs(End.diff(Start, 'minutes'));
                var durasi = 0;
                if(Start > End){
                    durasi = 1440 - total;
                }else{
                    durasi = total;
                }
    
                var jam = Math.floor(durasi/60);
                var menit = durasi - (jam * 60);
    
                item.over_time_text = jam + ' Jam '+ menit +' Menit';
    
                item.over_time = durasi/60;
                
            }
            
        }
        

    }

    /**
     * AC Mechanic
     */
    ListMechanic: any = [];
    WaitMechanic: any[] = [];
    FilterMechanic(val, i: number) {

        this.ListMechanic = [];

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            this.WaitMechanic[i] = true;

            var Params = {
                NoLoader: 1,
                keyword: val
            };

            this.core.Do(this.ComUrl + 'list.karyawan', Params).subscribe(
                result => {
                    if (result.list_karyawan) {
                        this.ListMechanic = result.list_karyawan;
                        
                        this.WaitMechanic[i] = false;
                    } else {
                        this.ListMechanic = [];
                        this.CreateList(i, 2);
                    }
                },
                error => {
                    this.core.OpenNotif(error);
                    this.WaitMechanic[i] = false;
                }
            );
        }, 100);
    }

    SelectMechanic(e, item, i: number, type: number) {
        if (e.isUserInput) {

            var Find = this.core.FJSON(this.Mechanic, 'id', item.id)

            setTimeout(() => {

                if(Find.length <= 0){
                    this.Mechanic[i] = item;
                    this.Mechanic[i]['i'] = i

                    this.ListMechanic = [];
                    this.CreateList(i, type);
                }else{

                    var SelectExists = Find[0].i;

                    this.Mechanic[i].nama = '';

                }


                // setTimeout(() => {
                //     $('#est_hours-' + i).focus();
                // }, 100);
            });
        }
    }
    //=> END : AC Mechanic

    /**
     * select overtime mekanik
     */
    SelectManPower(e, item, i: number, type: number) {
        if (e.isUserInput) {

            var Find = this.core.FJSON(this.JobOvertime, 'id', item.id);
            setTimeout(() => {

                if(Find.length <= 0){
                    this.JobOvertime[i] = item;
                    this.JobOvertime[i]['i'] = i

                    this.CreateList(i, type);
                }else{
                    // var SelectExists = Find[0].i;

                    this.JobOvertime[i].nama = '';
                }

            });
        }
    }
    //=> END select overtime mekanik


    /**
     * Create List
     */
    CreateList(i, type: number) {


        if(type == 2){
            if (!this.Mechanic[i].nama) {
                this.Mechanic[i] = {};
            }

            //=> Check Next Input
            var next = Number(i) + 1;
            let DataNext = {
                i: next
            }

            if (!this.Mechanic[next]) {
                this.Mechanic.push(DataNext);
            }
        } else 
        if (type == 4) {
            if (!this.JobExplan[i].job_explan) {
                this.JobExplan[i] = {};
            }

            //=> Check Next Input
            var next = Number(i) + 1;
            let DataNext = {
                i: next
            }

            if (!this.JobExplan[next]) {
                this.JobExplan.push(DataNext);
            }
        } else 
        if (type == 6) {
            if (!this.JobOvertime[i].nama) {
                this.JobOvertime[i] = {};
            }

            //=> Check Next Input
            var next = Number(i) + 1;
            let DataNext = {
                i: next
            }

            if (!this.JobOvertime[next]) {
                this.JobOvertime.push(DataNext);
            }
            
        }else 
        if (type == 7) {
            if (!this.AditionalMaterial[i].item_nama) {
                this.AditionalMaterial[i] = {};
            }

            //=> Check Next Input
            var next = Number(i) + 1;
            let DataNext = {
                i: next
            }

            if (!this.AditionalMaterial[next]) {
                this.AditionalMaterial.push(DataNext);
            }     
            
        }
    }

    DeleteList(del, type) {

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

                    if (type == 1) {
                        var DATA = Object.keys(this.Material);

                        // => Delete
                        var NewList = [];
                        let index = 0;
                        for (let i = 0; i < DATA.length; i++) {
                            if (del == i) {
    
                                delete this.Material[i];
    
                            } else {
    
                                this.Material[i].i = index;
    
                                NewList[index] = this.Material[i];
                                index++;
                            }
                        }
    
                        // => Recreaten
                        this.Material = NewList;
                    } else
                    if (type == 2) {
                        var DATA = Object.keys(this.Mechanic);

                        // => Delete
                        var NewList = [];
                        let index = 0;
                        for (let i = 0; i < DATA.length; i++) {
                            if (del == i) {
    
                                delete this.Mechanic[i];
    
                            } else {
    
                                this.Mechanic[i].i = index;
    
                                NewList[index] = this.Mechanic[i];
                                index++;
                            }
                        }
    
                        // => Recreaten
                        this.Mechanic = NewList;
                    
                    } else
                    if (type == 3) {
                        var DATA = Object.keys(this.JobOvertime);

                        // => Delete
                        var NewList = [];
                        let index = 0;
                        for (let i = 0; i < DATA.length; i++) {
                            if (del == i) {
    
                                delete this.JobOvertime[i];
    
                            } else {
    
                                this.JobOvertime[i].i = index;
    
                                NewList[index] = this.JobOvertime[i];
                                index++;
                            }
                        }
    
                        // => Recreaten
                        this.JobOvertime = NewList;
                    } else
                    if (type == 4) {
                        
                        var DATA = Object.keys(this.AditionalMaterial);

                        // => Delete
                        var NewList = [];
                        let index = 0;
                        for (let i = 0; i < DATA.length; i++) {
                            if (del == i) {
    
                                delete this.AditionalMaterial[i];
    
                            } else {
    
                                this.AditionalMaterial[i].i = index;
    
                                NewList[index] = this.AditionalMaterial[i];
                                index++;
                            }
                        }
    
                        // => Recreaten
                        this.AditionalMaterial = NewList;
                    }
                }
            }
        );

    }
    // => / END : List

    /**
     * AC Item
     */
    // Item: any;
    // WaitItem: any[] = [];
    // ItemFilter(val: string, i: number) {

    //     if (val) {

    //         clearTimeout(this.Delay);
    //         this.Delay = setTimeout(() => {

    //             this.WaitItem[i] = true;

    //             val = val.toString().toLowerCase();

    //             var Params = {
    //                 NoLoader: 1,
    //                 company: this.form.company,
    //                 keyword: val
    //             };

    //             this.core.Do('e/stock/item/inc/list.normal', Params).subscribe(
    //                 result => {

    //                     if (result) {
    //                         this.Item = result;
    //                     }

    //                     this.WaitItem[i] = false;

    //                 },
    //                 error => {
    //                     console.error('ItemFilter', error);
    //                     this.core.OpenNotif(error);
    //                     this.WaitItem[i] = false;
    //                 }
    //             );

    //         }, 100);

    //     }

    // }

    // ItemSelect(e, item, i: number, type: number) {
    //     if (e.isUserInput) {
    //         setTimeout(() => {

    //             this.Material[i].item = item.id;
    //             this.Material[i].item_kode = item.kode;
    //             this.Material[i].item_nama = item.nama;
    //             this.Material[i].satuan = item.satuan;

    //             this.CreateList(i, type);

    //         }, 0);
    //     }
    // }

    /**
     * Simpan
     */
    Simpan() {

        swal(
            {
                title: 'Please Confirm to Save?',
                html: '<div>Are you sure to continue?',
                type: 'warning',
                reverseButtons: true,
                focusCancel: true,
                showCancelButton: true,
                confirmButtonText: 'Yes',
                cancelButtonText: 'Cancel'
            }
        ).then(
            result => {
                if (result.value) {

                    var URL = this.ComUrl + 'edit';
                    if (this.form.id == 'add') {
                        URL = this.ComUrl + 'add';
                    }
                    
                    if (this.form.tanggal) {
                        this.form.tanggal_send = moment(this.form.tanggal, 'DD-MM-YYYY').format('YYYY-MM-DD');
                    }

                    this.form.list_mechanic = JSON.stringify(this.Mechanic);
                    this.form.list_overtime = JSON.stringify(this.JobOvertime);
                    
                    
                    var JobExplan = [];
                    for(let item of this.JobExplan) {
                        if(item.job_explan) {
                            JobExplan.push(item);
                        }
                    }
                    this.form.job_explan = JSON.stringify(JobExplan);
                    
                    this.form.list_aditional = JSON.stringify(this.AditionalMaterial);
                    
                    this.core.Do(URL, this.form).subscribe(
                        result => {

                            if (result.status == 1) {
                                if(this.form.id == 'add') {
                                    var ADD = {
                                        type: 'success',
                                        showConfirmButton: false,
                                        title: 'Saved Successfully',
                                        msg: 'Your Request will Continue to Approval Process'
                                    };
                                    this.core.OpenAlert(ADD);
                                }

                                this.dialogRef.close(result);
                            } else {
                                var Alert = {
                                    msg: result.error_msg
                                };
                                this.core.OpenAlert(Alert);
                            }
                        },
                        error => {
                            this.core.OpenNotif(error);
                        }
                    );
                }
            }
        );
    }
    // => / END : Simpan

    


}
