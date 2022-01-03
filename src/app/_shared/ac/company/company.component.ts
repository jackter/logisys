import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'sh-company',
    templateUrl: './company.component.html',
    styleUrls: ['./company.component.scss']
})
export class CompanyComponent implements OnInit {

    @Input() Default: any;
    @Input() form: any;

    @Output() onSelect = new EventEmitter();
    @Output() onReset = new EventEmitter();

    Data: any = {};

    constructor() { }

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
            this.Data.company = this.Company[0].id;
            this.Data.company_abbr = this.Company[0].abbr;
            this.Data.company_nama = this.Company[0].nama;

            // this.Dept = this.Company[0].dept;
            // this.DeptKeep = this.Company[0].dept;

            // this.DeptLen = Object.keys(this.Dept).length;
            // if (this.DeptLen == 1) {
            //     this.Data.dept = this.Dept[0].id;
            //     this.Data.dept_nama = this.Dept[0].nama;
            //     this.Data.dept_abbr = this.Dept[0].abbr;

            //     this.DeptReady = true;
            // }
        }
        // => / Check Company

        if (this.form.id != 'add') {
            this.Data.company = this.form.company;
            this.Data.company_abbr = this.form.company_abbr;
            this.Data.company_nama = this.form.company_nama;
        }

    }

    /**
     * AC Company
     */
    Company: any = [];
    CompanyLen: number;
    CompanyLast;

    CompanyFilter() {

        var val = this.Data.company_nama;

        // if (val != this.CompanyLast) {
        //     this.Data.company = null;
        //     this.Data.company_abbr = null;

        //     this.Data.dept = null;
        //     this.Data.dept_abbr = null;
        //     this.Data.dept_nama = null;
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
            this.Data.company = item.id;

            this.onSelect.emit(item);
        }
    }
    CompanyReset() {
        this.Data.company = null;
        this.Data.company_nama = null;
        this.Data.company_abbr = null;

        this.CompanyFilter();

        this.onReset.emit();

        setTimeout(() => {
            $('[name="company_nama"]').blur();
            setTimeout(() => {
                $('[name="company_nama"]').focus();
            }, 100);
        }, 100);

    }
    // => / END : AC Company

}
