import { Component, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material';
import * as moment from 'moment';
import swal from 'sweetalert2';
import { WorkOrderPrintDialogComponent } from './print';
import * as _ from 'lodash';

@Component({
    selector: 'dialog-form-work-order',
    templateUrl: './form.html',
    styleUrls: ['../work-order.component.scss']
})
export class WorkOrderFormDialogComponent implements OnInit {

    form: any = {};
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
    Comment: any[] = [{
        i: 0
    }];
    JobOvertime: any[] = [{
        i: 0
    }];
    AditionalMaterial: any[] = [{
        i: 0
    }];

    constructor(
        public core: Core,
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<WorkOrderFormDialogComponent>,
    ) {

    }

    ngOnInit() {
        this.Company = this.Default.company;

        if (this.Default.maintenance) {
            this.Maintenance = this.Default.maintenance.value;
        }

        if (this.form.id != 'add') {
            if(this.form.material) {

                var Item: any = Object.values(_.groupBy(this.form.material, 'item'));
                if(Item) {
                    for(let item of Item) {
                        if(item) {
                            var TotalQty = 0;
                            for(let detail of item) {
                                TotalQty += detail.qty;
                            }
                            this.Material.push({
                                item : item[0].item,
                                item_kode: item[0].item_kode,
                                item_nama: item[0].item_nama,
                                satuan: item[0].satuan,
                                keterangan: item[0].keterangan,
                                in_decimal: item[0].in_decimal,
                                total_qty: TotalQty
                            });   
                        }
                    }
                }
            }

            if(this.form.mechanic) {

                this.Mechanic = this.form.mechanic;
                var FilterData = [];
                var NewData = [];
                for(let item of this.Mechanic){

                    FilterData = _.filter(this.Mechanic, {
                        kid: item.kid
                    });

                    var TotAct: number = 0;
                    for(let detail of FilterData){
                        TotAct += detail.act_hours;
                    } 
                    
                    item.total_act_hours = TotAct;
       
                }

                var GroupKID = Object.values(_.groupBy(this.Mechanic, 'kid'));


                for(let item of GroupKID){

                    var durasi = item[0].total_act_hours* 60;

                    var jam = Math.floor(durasi/60);
                    var menit = durasi - (jam * 60);

                    NewData.push({
                        act_hours : jam + ' Jam '+ menit +' Menit',
                        kid: item[0].kid,
                        nama: item[0].nama,
                        level: item[0].level,
                        nik: item[0].nik,
                        man_days: item.length
                    });

                }
                
                this.Mechanic = NewData;
            }

            if(this.form.overtime) {
                
                this.JobOvertime = this.form.overtime;
                var FilterData = [];
                var NewData = [];
                for(let item of this.JobOvertime){

                    FilterData = _.filter(this.JobOvertime, {
                        kid: item.kid
                    });

                    var Tot: number = 0;
                    for(let detail of FilterData){
                        Tot += detail.over_time;
                    } 
                    
                    item.total_over_time = Tot;
       
                }

                var GroupKID = Object.values(_.groupBy(this.JobOvertime, 'kid'));


                for(let item of GroupKID){

                    var durasi = item[0].total_over_time* 60;

                    var jam = Math.floor(durasi/60);
                    var menit = durasi - (jam * 60);

                    NewData.push({
                        over_time : jam + ' Jam '+ menit +' Menit',
                        kid: item[0].kid,
                        nama: item[0].nama,
                        level: item[0].level,
                        nik: item[0].nik,
                        total_over_time: item[0].total_over_time,
                        over_days: item.length
                    });

                }
                
                this.JobOvertime = NewData;

                this.form.overtime = NewData;

            }

            // if(this.form.overtime) {
            //     this.JobOvertime = this.form.overtime;
            // }

            if(this.form.aditional) {
                this.AditionalMaterial = this.form.aditional;
            }

            if(this.form.job_title) {
                this.JobTitle = JSON.parse(this.form.job_title);
             
                if(!this.form.is_detail) {
                    // if(this.form.approved != 1) {
                        this.JobTitle.push({i: 0});
                    // }
                }
            }

            if(this.form.explain) {

                var Explain = [];
                var NewData = [];
                for(let item of this.form.explain){

                    Explain.push(JSON.parse(item.job_explain));
                     
                }
                
                var i = 0;
                for(let item of Explain){
                    for(var j = 0; j <= item.length - 1;j++){
                        NewData.push({
                            i : Explain[i][j].i,
                            job_explan: Explain[i][j].job_explan 
                        });
                    }
                    i++;
                }
                this.JobExplan = NewData;
                this.form.job_explan = NewData;

            }

            if(this.form.comment) {
                this.Comment = JSON.parse(this.form.comment);
             
                if(!this.form.is_detail) {
                    this.Comment.push({i: 0});
                }
            }

            if(this.perm.complete && this.form.submited == 1 && this.form.completed != 1) {
                this.Comment.push({i: 0});
            }

        }

        if (this.Default.dept_section) {
            this.DeptSection = _.orderBy(this.Default.dept_section.value, 'nama', ['asc']);
        }
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

            this.Dept = this.Company[0].dept;
            this.DeptKeep = this.Company[0].dept;

            this.DeptLen = Object.keys(this.Dept).length;
            if (this.DeptLen == 1) {
                this.form.dept = this.Dept[0].id;
                this.form.dept_nama = this.Dept[0].nama;
                this.form.dept_abbr = this.Dept[0].abbr;

                this.DeptReady = true;
            }
        }
        // => / Check Company
    }

    AutoFocus(key){

        setTimeout(() => {
            $(key).focus();
        }, 100);

    }

    Process(){

        this.form.proses = 1;

        this.form.is_detail = false;

        // if(this.form.mechanic) {
        //     this.Mechanic.push({i:0});
        // }

        // if(this.form.overtime) {
        //     this.JobOvertime.push({i:0});
        // }

        if(this.form.job_title) {
            this.JobTitle = JSON.parse(this.form.job_title);
         
            if(!this.form.is_detail) {
                this.JobTitle.push({i: 0});
            }
        }

        // if(this.form.job_explan) {
        //     this.JobExplan = JSON.parse(this.form.job_explan);
         
        //     if(!this.form.is_detail) {
        //         this.JobExplan.push({i: 0});
        //     }
        // }

        // if(this.form.aditional){
        //     if(!this.form.is_detail) {
        //         this.AditionalMaterial.push({i: 0});
        //     }
        // }
        

        if(this.form.comment) {
            this.Comment = JSON.parse(this.form.comment);
         
            if(!this.form.is_detail) {
                this.Comment.push({i: 0});
            }
        }

        if(this.perm.complete && this.form.submited == 1 && this.form.completed != 1) {
            this.Comment.push({i: 0});
        }

        // setTimeout(() => {
        //     $('*[name="pic_nama"]').focus();
        // }, 100);
        
    }

    Calculate(item){

        if(item.start_time && item.end_time){

            var Start = moment(item.start_time, 'HH:mm:ss');
            var End = moment(item.end_time, 'HH:mm:ss');

            item.start_format = moment(Start).format('HH:mm:ss');
            item.end_format = moment(End).format('HH:mm:ss');

            var total = End.diff(Start, 'minutes');

            var jam = Math.floor(total/60);
            var menit = total - (jam * 60);

            item.over_time_text = jam + ' Jam '+ menit +' Menit'

            item.over_time = total/60;
            
        }   

    }


    /**
     * AC Company
     */
    Company: any = [];
    CompanyLen: number;
    CompanyLast;
    CompanyFilter() {

        setTimeout(() => {

            var val = this.form.company_nama;

            if (val != this.CompanyLast) {
                this.form.company = null;
                this.form.company_abbr = null;

                this.form.dept = null;
                this.form.dept_abbr = null;
                this.form.dept_nama = null;

            }

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

        }, 0);

    }
    CompanySelect(e, item) {
        if (e.isUserInput) {
            this.form.company = item.id;
            this.form.company_nama = item.nama;
            this.form.company_abbr = item.abbr;

            this.CompanyLast = item.nama;

            this.Dept = item.dept;
            this.DeptKeep = item.dept;

            setTimeout(() => {
                $('*[name="dept_nama"]').focus();
            }, 100);
        }
    }
    CompanyRemove() {
        this.form.company = null;
        this.form.company_nama = null;
        this.form.company_abbr = null;

        this.form.dept = null;
        this.form.dept_abbr = null;
        this.form.dept_nama = null;
    }
    // => / END : AC Company

    /**
     * AC Dept
     */
    Dept: any = [];
    DeptKeep: any = [];
    DeptLast;
    DeptReady = false;
    DeptLen: number;

    DeptFilter() {

        this.DeptReady = false;

        var val = this.form.dept_nama;

        if (val != this.DeptLast) {
            this.form.dept = null;
            this.form.dept_abbr = null;

            this.Dept = this.DeptKeep;
        }

        if (val && this.DeptKeep) {

            val = val.toString().toLowerCase();

            let i = 0;
            let Filtered = [];
            for (let item of this.DeptKeep) {

                var Combine = item.abbr + ' : ' + item.nama;
                if (
                    item.abbr.toLowerCase().indexOf(val) != -1 ||
                    item.nama.toLowerCase().indexOf(val) != -1 ||
                    Combine.toLowerCase().indexOf(val) != -1
                ) {
                    Filtered[i] = item;
                    i++;
                }

            }
            this.Dept = Filtered;

        } else {

        }

    }

    DeptSelect(e, item) {
        if (e.isUserInput) {
            this.form.dept = item.id;
            this.form.dept_nama = item.nama;
            this.form.dept_abbr = item.abbr;

            this.DeptLast = item.nama;

            setTimeout(() => {
                $('*[name="dept_section_nama"]').focus();
            }, 100);

        }
    }
    DeptRemove() {
        this.form.dept = null;
        this.form.dept_nama = null;
        this.form.dept_abbr = null;

        this.DeptFilter();
    }
    // END: AC Dept

    SelectDeptSection(item) {

        this.form.dept_section_abbr = item.kode;
        
    }

    /**
     * AC Equipment
     */
    Equipment = [];
    FilterEquipment(val: string) {
        
        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            var Params = {
                NoLoader: 1,
                keyword: val
            };

            this.core.Do(this.ComUrl + 'list.equipment', Params).subscribe(
                result => {
                    if (result.list_equipment) {
                        this.Equipment = result.list_equipment;
                    }
                },
                error => {
                    this.core.OpenNotif(error);
                }
            );
        }, 100);
    }

    SelectEquipment(e, item) {
        if(e.isUserInput) {
            this.form.equipment = item.id;
            this.form.equipment_kode = item.kode;
            this.form.equipment_remarks = item.remarks;
        }
    }

    RemoveEquipment() {
        this.form.equipment = null;
        this.form.equipment_kode = null;
        this.form.equipment_remarks = null;
    }
    // => END : AC Equipment

    /**
     * AC lokasi
     */
    Lokasi = [];
    FilterLokasi(val: string) {
        
        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            var Params = {
                NoLoader: 1,
                keyword: val
            };

            this.core.Do(this.ComUrl + 'list.lokasi', Params).subscribe(
                result => {
                    if (result.list_lokasi) {
                        this.Lokasi = result.list_lokasi;
                    }
                },
                error => {
                    this.core.OpenNotif(error);
                }
            );
        }, 100);
    }

    SelectLokasi(e, item) {
        if(e.isUserInput) {
            this.form.lokasi = item.id;
            this.form.lokasi_nama = item.nama;
        }
    }

    RemoveLokasi() {
        this.form.lokasi = null;
        this.form.lokasi_nama = null;
    }
    // => END : AC Lokasi

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

            setTimeout(() => {

                this.Mechanic[i].kid = item.id;
                this.Mechanic[i].nik = item.nik;
                this.Mechanic[i].nama = item.nama;

                this.Mechanic[i]['i'] = i;

                this.ListMechanic = [];
                this.CreateList(i, type);

                setTimeout(() => {
                    $('#est_hours-' + i).focus();
                }, 100);
            });
        }
    }
    //=> END : AC Mechanic

    /**
     * select overtime mekanik
     */
    SelectManPower(e, item, i: number, type: number) {
        if (e.isUserInput) {

            setTimeout(() => {

                this.JobOvertime[i].kid = item.kid;
                this.JobOvertime[i].nama = item.nama;

                this.JobOvertime[i]['i'] = i;

                this.CreateList(i, type);

            });
        }
    }
    //=> END select overtime mekanik

    /**
     * Create List
     */
    CreateList(i, type: number) {

        if(type == 1) {
            if (!this.Material[i].item) {
                this.Material[i] = {};
            }
    
            // => Check Next Input
            var next = Number(i) + 1;
            let DataNext = {
                i: next
            };
    
            if (!this.Material[next]) {
                this.Material.push(DataNext);
            }
        } else 
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
        if (type == 3) {
            if (!this.JobTitle[i].job_title) {
                this.JobTitle[i] = {};
            }

            //=> Check Next Input
            var next = Number(i) + 1;
            let DataNext = {
                i: next
            }

            if (!this.JobTitle[next]) {
                this.JobTitle.push(DataNext);
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
        if (type == 5) {
            if (!this.Comment[i].comment) {
                this.Comment[i] = {};
            }

            //=> Check Next Input
            var next = Number(i) + 1;
            let DataNext = {
                i: next
            }

            if (!this.Comment[next]) {
                this.Comment.push(DataNext);
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
                        
                    }else
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
    Item: any;
    WaitItem: any[] = [];
    ItemFilter(val: string, i: number) {

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

                this.core.Do('e/stock/item/inc/list.normal', Params).subscribe(
                    result => {

                        if (result) {
                            this.Item = result;
                        }

                        this.WaitItem[i] = false;

                    },
                    error => {
                        console.error('ItemFilter', error);
                        this.core.OpenNotif(error);
                        this.WaitItem[i] = false;
                    }
                );

            }, 100);

        }

    }

    ItemSelect(e, item, i: number, type: number) {
        if (e.isUserInput) {
            setTimeout(() => {

                this.Material[i].item = item.id;
                this.Material[i].item_kode = item.kode;
                this.Material[i].item_nama = item.nama;
                this.Material[i].satuan = item.satuan;

                this.CreateList(i, type);

            }, 0);
        }
    }

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
                    
                    if (this.form.order_date) {
                        this.form.order_date_show = moment(this.form.order_date).format('YYYY-MM-DD');
                    }

                    if (this.form.est_date) {
                        this.form.est_date_show = moment(this.form.est_date).format('YYYY-MM-DD');
                    }

                    this.form.list_mechanic = JSON.stringify(this.Mechanic);
                    this.form.list_overtime = JSON.stringify(this.JobOvertime);

                    var JobTitle = [];
                    for(let item of this.JobTitle) {
                        if(item.job_title) {
                            JobTitle.push(item);
                        }
                    }
                    this.form.job_title = JSON.stringify(JobTitle);

                    var JobExplan = [];
                    for(let item of this.JobExplan) {
                        if(item.job_explan) {
                            JobExplan.push(item);
                        }
                    }
                    this.form.job_explan = JSON.stringify(JobExplan);

                    if(this.form.gm_apsesve){
                        this.form.gm_approve = 1;
                    }else{
                        this.form.gm_approve = 0;
                    }

                    this.form.list_aditional = JSON.stringify(this.AditionalMaterial);


                    // var Comment = [];
                    // for(let item of this.Comment) {
                    //     if(item.comment) {
                    //         Comment.push(item);
                    //     }
                    // }
                    // this.form.comment = JSON.stringify(Comment);
                    
                    this.core.Do(URL, this.form).subscribe(
                        result => {

                            if (result.status == 1) {
                                if(this.form.id == 'add' && this.form.approved != 1) {
                                    var ADD = {
                                        type: 'success',
                                        showConfirmButton: false,
                                        title: 'Saved Successfully',
                                        msg: 'Your Request will Continue to Approval Process'
                                    };
                                    this.core.OpenAlert(ADD);
                                }
                                if(this.form.id != 'add' && this.form.approved != 1) {
                                    var EDIT = {
                                        type: 'success',
                                        showConfirmButton: false,
                                        title: 'Updated Successfully',
                                        msg: 'Your Request will Continue to Approval Process'
                                    };
                                    this.core.OpenAlert(EDIT);
                                }
                                if(this.form.approved == 1 && this.form.processed != 1) {
                                    var SUBMIT = {
                                        type: 'success',
                                        showConfirmButton: false,
                                        title: 'Submited Successfully',
                                        msg: 'Your Request will Continue to Complete Process'
                                    };
                                    this.core.OpenAlert(SUBMIT);
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

    /**
     * Edit
     */
    Edit() {
        if (this.form.is_detail) {
            this.form.is_detail = null;
        }
    }
    // => END : Edit

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
            confirmButtonText: 'Confirm',
            cancelButtonText: 'Cancel'
        }).then(
            result => {

                if (result.value) {

                    /**
                     * Verify Continue
                     */
                    var Params = {
                        id: this.form.id,
                        notimeout: 1,
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
                    // => / END : Verify Continue

                }
            }
        );
    }
    // => / END : Verify

    /**
     * Reject
     */
    Reject() {
        swal({
            title: 'Please Confirm to Reject?',
            html: '<div>Are you sure to continue?</div>',
            type: 'error',
            reverseButtons: true,
            focusCancel: true,
            showCancelButton: true,
            confirmButtonText: 'Reject',
            cancelButtonText: 'Cancel'
        }).then(
            result => {

                if (result.value) {

                    var Params = {
                        id: this.form.id
                    };

                    this.Busy = true;
                    this.core.Do(this.ComUrl + 'reject', Params).subscribe(
                        result => {

                            if (result.status == 1) {

                                var Success = {
                                    type: 'error',
                                    showConfirmButton: false,
                                    title: 'Request Rejected',
                                    msg: 'Approved Rejected'
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
                            console.error('Reject', error);
                            this.core.OpenNotif(error);

                            this.Busy = false;
                        }
                    );
                }
            }
        );
    }
    // => / END : Reject

    /**
     * Approve
     */
    Approve() {
        swal({
            title: 'Please Confirm to Approve?',
            html: '<div>This action cannot be undone?</div>',
            type: 'success',
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
                        notimeout: 1
                    };

                    this.Busy = true;
                    this.core.Do(this.ComUrl + 'approve', Params).subscribe(
                        result => {

                            if (result.status == 1) {

                                var Success = {
                                    type: 'success',
                                    showConfirmButton: false,
                                    title: 'Approved',
                                    msg: 'Approve Success!'
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

    /**
     * Complete
     */
    Complete() {
        swal({
            title: 'Please Confirm to Complete?',
            html: '<div>Are you sure to continue?</div>',
            type: 'warning',
            reverseButtons: true,
            focusCancel: true,
            showCancelButton: true,
            confirmButtonText: 'Confirm',
            cancelButtonText: 'Cancel'
        }).then(
            result => {

                if (result.value) {

                    var Comment = [];
                    for(let item of this.Comment) {
                        if(item.comment) {
                            Comment.push(item);
                        }
                    }

                    var Params = {
                        id: this.form.id,
                        notimeout: 1,
                        comment: JSON.stringify(Comment)
                    };

                    this.Busy = true;
                    this.core.Do(this.ComUrl + 'complete', Params).subscribe(
                        result => {

                            if (result.status == 1) {

                                var Success = {
                                    type: 'success',
                                    showConfirmButton: false,
                                    title: 'Completed',
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
                            console.error('Complete', error);
                            this.core.OpenNotif(error);

                            this.Busy = false;
                        }
                    );
                }
            }
        );
    }
    //=> END : Complete

    /**
     * Accept
     */
    Accept() {
        swal({
            title: 'Please Confirm to Accept?',
            html: '<div>This action cannot be undone?</div>',
            type: 'success',
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
                        notimeout: 1
                    };

                    this.Busy = true;
                    this.core.Do(this.ComUrl + 'accept', Params).subscribe(
                        result => {

                            if (result.status == 1) {

                                var Success = {
                                    type: 'success',
                                    showConfirmButton: false,
                                    title: 'Accepted',
                                    msg: 'Accepted Successfully!'
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
                            console.error('Accept', error);
                            this.core.OpenNotif(error);

                            this.Busy = false;
                        }
                    );

                }

            }
        );
    }
    //=> END : Accept

    /** 
     * Dialog
    */
    dialogDetail: MatDialogRef<WorkOrderPrintDialogComponent>;
    dialogDetailConfig: MatDialogConfig = {
        disableClose: false,
        panelClass: 'event-form-dialog'
    };
    Print() {

        this.dialogDetail = this.dialog.open(
            WorkOrderPrintDialogComponent,
            this.dialogDetailConfig
        );

        this.dialogDetail.componentInstance.form = this.form;
        this.dialogDetail.componentInstance.Com = this.Com;

        /**
         * After Close
         */
        this.dialogDetail.afterClosed().subscribe(result => {

            this.dialogDetail = null;

        });

    }
    // => / END : Dialog

    // MR2dialogRef: MatDialogRef<MR2FormDialogComponent>;
    // MR2dialogRefConfig: MatDialogConfig = {
    //     disableClose: true,
    //     panelClass: 'event-form-dialog'
    // };
    // OpenResevation(){
    //     this.MR2dialogRef = this.dialog.open(
    //         MR2FormDialogComponent,
    //         this.MR2dialogRefConfig
    //     );

    //     /**
    //      * Inject Data to Dialog
    //      */
    //     this.dialogRef.componentInstance.perm = this.perm;
    //     this.dialogRef.componentInstance.form = this.form;
    //     // => / END : Inject Data to Dialog
    // }

}
