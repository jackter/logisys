import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MatChipInputEvent } from '@angular/material';
import { Core } from '../../../../providers/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import * as _ from 'lodash';

@Component({
    selector: 'app-form-dialog',
    templateUrl: './form.html'
})
export class UserDialogComponent implements OnInit {

    ComUrl;
    form;
    perm;

    Group;
    Default: any;
    DelayAutocomplete;

    constructor(
        private core: Core,
        private dialogRef: MatDialogRef<UserDialogComponent>
    ) {

    }

    ViewUser = [
        {
            val: 1,
            nama: 'Specific Users'
        },
        {
            val: 'X',
            nama: 'All Users'
        }
    ];

    Perusahaan = [
        {
            val: 1,
            nama: 'Specific Perusahaan'
        },
        {
            val: 'X',
            nama: 'Semua Perusahaan'
        }
    ];

    ViewDept = [
        {
            val: 1,
            nama: 'Specific Department'
        },
        {
            val: 'X',
            nama: 'All Department'
        }
    ];

    ViewCostCenter = [
        {
            val: 1,
            nama: 'Specific Cost Center'
        },
        {
            val: 'X',
            nama: 'All Cost Center'
        }
    ];

    ngOnInit() {

        this.Company = this.Default.company;
        this.Dept = this.Default.all_dept;
        this.User = this.Default.user;
        this.CostCenter = this.Default.all_cost_center;

        this.Company = _.sortBy(this.Company, [
            'id'
        ]);


        /**
         * Definition by form.id
         */
        if (this.form.id == 'add') {
            this.form.view_user = 1;
        } else {
            /**
             * Extract Company Selected
             */
            if (this.form.company_selected) {
                var Company;
                for (let item of this.form.company_selected) {
                    // Company = this.core.FJSON(this.Company, 'id', item);
                    Company = _.findKey(this.Company, {
                        id: item
                    });

                    if (Company) {
                        this.CompanySelected.push({
                            id: this.Company[Company].id,
                            nama: this.Company[Company].nama,
                            abbr: this.Company[Company].abbr
                        });
                    }

                }
            }
            // => / END : Extract Company Selected

            /**
             * Extract Dept Selected
             */
            if (this.form.dept_selected) {
                var Dept;
                for (let item of this.form.dept_selected) {

                    // Dept = this.core.FJSON(this.Dept, 'id', item);
                    Dept = _.findKey(this.Dept, {
                        id: item
                    });

                    if (Dept) {
                        this.DeptSelected.push({
                            id: this.Dept[Dept].id,
                            nama: this.Dept[Dept].company_abbr + ' - ' + this.Dept[Dept].nama,
                            abbr: this.Dept[Dept].abbr,
                            company_abbr: this.Dept[Dept].company_abbr
                        });
                    }

                }
            }
            // => / END : Extract Dept Selected

            /**
            * Extract Cost Center Selected
            */
             if (this.form.cost_center_selected) {
                var CostCenter;
                for (let item of this.form.cost_center_selected) {

                    //Dept = this.core.FJSON(this.Dept, 'id', item);
                    CostCenter = _.findKey(this.CostCenter, {
                        id: item
                    });

                    if (CostCenter) {
                        this.CostCenterSelected.push({
                            id: this.CostCenter[CostCenter].id,
                            nama: this.CostCenter[CostCenter].company_abbr + ' - ' + this.CostCenter[CostCenter].nama,
                            kode: this.CostCenter[CostCenter].kode,
                            company_abbr: this.CostCenter[CostCenter].company_abbr
                        });
                    }

                }

            }
            //=> / END : Extract Cost Center Selected

            /**
             * Extract User Selected
             */
            if (this.form.user_selected) {
                var User;
                for (let item of this.form.user_selected) {

                    // User = this.core.FJSON(this.User, 'id', item);
                    User = _.findKey(this.User, {
                        id: item
                    });

                    if (User) {
                        this.UserSelected.push({
                            id: this.User[User].id,
                            nama: this.User[User].nama,
                            username: this.User[User].username
                        });
                    }

                }
            }
            // => / END : Extract User Selected
        }
        // => / END : Definition by form.id

    }

    /**
     * Autocomplete Company
     * 
     * Fungsi yang menangani kebutuhan AutoComplete company
     */
    CompanySelected = [];
    removable = true;
    selectable = true;
    separatorKeysCodes: number[] = [ENTER, COMMA];

    Company;
    LastCompany;
    CompanyFilter(val: string) {

        if (val) {
            this.Company = this._filterCompany(this.Default.company, val);
        } else {
            this.Company = this.Default.company;
        }

        /*if(val != this.LastCompany){

            //=> Clear If Company Change
            this.form.company = null;
            this.form.company_abbr = null;

        }

        if(val){

            //this.LastCompany = val;
            this.Company = this._filterCompany(this.Default.company, val);
            
        }else{
            this.Company = this.Default.company;
        }*/

    }
    private _filterCompany(Data, val: string) {
        const filterValue = val.toLowerCase();
        if (Data) {
            return Data.filter(
                item => item.nama.toLowerCase().indexOf(val) > -1 || item.abbr.toLowerCase().indexOf(val) > -1
            );
        }
    }
    private CompanySelect(event, e) {
        if (event.isUserInput) {
            clearTimeout(this.DelayAutocomplete);
            this.DelayAutocomplete = setTimeout(() => {

                var Exists = this.core.FJSON2(this.CompanySelected, 'id', e.id);

                if (Exists.length <= 0) {

                    this.CompanySelected.push({
                        id: e.id,
                        nama: e.nama,
                        abbr: e.abbr
                    });

                }

                $('*[name="company_nama"]').val('');

                /*var Semua = this.core.FJSON2(this.CompanySelected, 'id', 'X');
                    
                if(Exists.length <= 0 && Semua.length <= 0){

                    var ID = e.id;
                    if(ID == 0){
                        ID = 'X';
                    }

                    if(ID == 'X'){
                        this.CompanySelected = [];
                    }

                    this.CompanySelected.push({
                        id: ID,
                        nama: e.nama,
                        abbr: e.abbr
                    });

                }
                $('*[name="company_nama"]').val('');*/

            }, 100);
        }
    }

    add(event: MatChipInputEvent): void {

        $('*[name="company_nama"]').val('');
        this.CompanyFilter('');

    }

    remove(company: string): void {
        const index = this.CompanySelected.indexOf(company);

        if (index >= 0) {
            this.CompanySelected.splice(index, 1);
        }
    }
    // => / END : Autocomplete Company

    /**
     * Autocomplete Dept
     * 
     * Fungsi yang menangani kebutuhan AutoComplete Dept
     */
    DeptSelected = [];

    Dept;
    LastDept;
    DeptFilter(val: string) {

        if (val) {
            this.Dept = this._filterDept(this.Default.all_dept, val);
        } else {
            this.Dept = this.Default.all_dept;
        }

    }
    private _filterDept(Data, val: string) {
        const filterValue = val.toLowerCase();
        if (Data) {
            return Data.filter(
                item => item.nama.toLowerCase().indexOf(val) > -1 || item.abbr.toLowerCase().indexOf(val) > -1 || item.company_abbr.toLowerCase().indexOf(val) > -1 || item.company_nama.toLowerCase().indexOf(val) > -1
            );
        }
    }
    private DeptSelect(event, e) {
        if (event.isUserInput) {
            clearTimeout(this.DelayAutocomplete);
            this.DelayAutocomplete = setTimeout(() => {

                var Exists = this.core.FJSON2(this.DeptSelected, 'id', e.id);
                if (Exists.length <= 0) {

                    this.DeptSelected.push({
                        id: e.id,
                        nama: e.company_abbr + ' - ' + e.nama,
                        abbr: e.abbr,
                        company_abbr: e.company_abbr
                    });

                }
                $('*[name="dept_nama"]').val('');

            }, 100);
        }
    }

    DeptAdd(event: MatChipInputEvent): void {

        $('*[name="dept_nama"]').val('');
        this.DeptFilter('');

    }

    DeptRemove(user: string): void {
        const index = this.DeptSelected.indexOf(user);

        if (index >= 0) {
            this.DeptSelected.splice(index, 1);
        }
    }
    // => / END : Autocomplete Dept

    /**
     * Autocomplete User
     * 
     * Fungsi yang menangani kebutuhan AutoComplete User
     */
    UserSelected = [];

    User;
    LastUser;
    UserFilter(val: string) {

        if (val) {
            this.User = this._filterUser(this.Default.user, val);
        } else {
            this.User = this.Default.user;
        }

    }
    private _filterUser(Data, val: string) {
        const filterValue = val.toLowerCase();
        if (Data) {
            return Data.filter(
                item => item.nama.toLowerCase().indexOf(val) > -1 || item.username.toLowerCase().indexOf(val) > -1
            );
        }
    }
    private UserSelect(event, e) {
        if (event.isUserInput) {
            clearTimeout(this.DelayAutocomplete);
            this.DelayAutocomplete = setTimeout(() => {

                var Exists = this.core.FJSON2(this.UserSelected, 'id', e.id);
                if (Exists.length <= 0) {

                    this.UserSelected.push({
                        id: e.id,
                        nama: e.nama,
                        username: e.username
                    });

                }
                $('*[name="user_nama"]').val('');

            }, 100);
        }
    }

    UserAdd(event: MatChipInputEvent): void {

        $('*[name="user_nama"]').val('');
        this.UserFilter('');

    }

    UserRemove(user: string): void {
        const index = this.UserSelected.indexOf(user);

        if (index >= 0) {
            this.UserSelected.splice(index, 1);
        }
    }
    // => / END : Autocomplete User

    /**
     * Autocomplete CostCenter
     * 
     * Fungsi yang menangani kebutuhan AutoComplete CostCenter
     */
     CostCenterSelected = [];

     CostCenter;
     LastCostCenter;
     CostCenterFilter(val: string) {
 
         if (this.CompanySelected.length > 0) {
             var filterData = [];
             for (let item of this.Default.all_cost_center) {
                 for (let value of this.CompanySelected) {
                     if (value.id == item.company) {
                         filterData.push(item);
                     }
                 }
             }
 
             this.CostCenter = this._filterCostCenter(filterData, val);
         } else {
             this.CostCenter = this.Default.all_cost_center;
         }
 
     }
     private _filterCostCenter(Data, val: string) {
         const filterValue = val.toLowerCase();
         if (Data) {
             return Data.filter(
                 item =>
                     item.nama.toLowerCase().indexOf(val) > -1 ||
                     item.kode.toLowerCase().indexOf(val) > -1 ||
                     item.company_abbr.toLowerCase().indexOf(val) > -1 ||
                     item.company_nama.toLowerCase().indexOf(val) > -1
             );
         }
     }
     private CostCenterSelect(event, e) {
         if (event.isUserInput) {
             clearTimeout(this.DelayAutocomplete);
             this.DelayAutocomplete = setTimeout(() => {
 
                 var Exists = this.core.FJSON2(this.CostCenterSelected, 'id', e.id);
                 if (Exists.length <= 0) {
 
                     this.CostCenterSelected.push({
                         id: e.id,
                         nama: e.company_abbr + ' - ' + e.nama,
                         kode: e.kode,
                         company_abbr: e.company_abbr
                     });
 
                 }
                 $('*[name="cost_center_nama"]').val('');
 
             }, 100);
         }
     }
 
     CostCenterAdd(event: MatChipInputEvent): void {
 
         $('*[name="cost_center_nama"]').val('');
         this.CostCenterFilter('');
 
     }
 
     CostCenterRemove(user: string): void {
         const index = this.CostCenterSelected.indexOf(user);
 
         if (index >= 0) {
             this.CostCenterSelected.splice(index, 1);
         }
     }
     //=> / END : AC CostCenter

    /**
     * Simpan
     * 
     * fungsi yang digunakan untuk menyimpan data ke database
     */
    Simpan() {

        var URL = this.ComUrl + 'edit';
        if (this.form.id == 'add') {
            URL = this.ComUrl + 'add';
        }

        this.form.gperm = JSON.stringify(this.form.grup);

        if (this.form.perusahaan != 'X') {
            this.form.company = JSON.stringify(this.CompanySelected);
        }

        if (this.form.view_dept != 'X') {
            this.form.dept = JSON.stringify(this.DeptSelected);
        }
        
        if (this.form.view_cost_center != 'X') {
            this.form.cost_center = JSON.stringify(this.CostCenterSelected);
        }

        if (this.form.view_user != 'X') {
            this.form.users = JSON.stringify(this.UserSelected);
        }

        this.core.Do(URL, this.form).subscribe(
            result => {

                if (result.status == 1) {
                    this.dialogRef.close(result);
                } else {
                    var Alert = {
                        msg: result.error_msg
                    };
                    this.core.OpenAlert(Alert);
                }

            },
            error => {
                console.error(error);
                this.core.OpenNotif(error);
            }
        );

    }
    // => / END : Simpan

}
