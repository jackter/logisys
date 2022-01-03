import { OnInit, Component } from '@angular/core';
import * as moment from 'moment';
import { Core } from 'providers/core';
import { MatDialogRef } from '@angular/material';

@Component({
    selector: 'dialog-form-incoming_dobi',
    templateUrl: './form.html',
    styleUrls: ['../input-dobi.component.scss']
})
export class InputDobiFormDialogComponent implements OnInit {

    form: any = {};
    perm: any = {};
    Default: any = {};

    ComUrl;
    Com;
    Busy;

    Delay;

    maxDate = moment(new Date).format('YYYY-MM-DD').toString();

    constructor(
        private core: Core,
        private dialogRef: MatDialogRef<InputDobiFormDialogComponent>
    ){

    }
 
    ngOnInit(){

        this.PKS = JSON.parse(JSON.stringify(this.Default.source));

        if(this.form.id == 'add'){
        }

    }

    Edit(){
        this.form.is_detail = null;

        setTimeout(() => {
            $('*[name="dobi"]').focus();
        }, 100);
    }

    FillTime(){
        if(this.form.start_date){
            this.form.end_date = moment(this.form.start_date).add(1, 'days').format('YYYY-MM-DD').toString();

            this.form.start_time = "07:00";
            this.form.end_time = "06:59";

            this.FocusPKS();
        }
    }

    /**
     * FocusPKS
     */
    FocusPKS() {
        setTimeout(() => {
            $('*[name="pks_nama"]').focus();
        }, 100);
    }
    // => / END : FocusPKS

    /**
     * AC PKS
     */
    PKS: any = [];
    PKSLen: number;
    PKSLast;

    PKSFilter() {

        var val = this.form.pks_nama;

        if (val != this.PKSLast) {
            this.form.pks = null;
        }

        if (val) {

            val = val.toString().toLowerCase();

            let i = 0;
            let Filtered = [];
            for (let item of this.Default.source) {

                var Combine = item.pks;
                if (
                    item.pks.toLowerCase().indexOf(val) != -1 ||
                    Combine.toLowerCase().indexOf(val) != -1
                ) {
                    Filtered[i] = item;
                    i++;
                }

            }
            this.PKS = JSON.parse(JSON.stringify(Filtered));

        } else {
            this.PKS = JSON.parse(JSON.stringify(this.Default.source));
        }

    }

    PKSSelect(e, item) {
        if (e.isUserInput) {
            this.form.pks = item.pks;
            this.form.pks_nama = item.pks;

            this.PKSLast = item.pks;

            setTimeout(() => {
                $('*[name="dobi"]').focus();
            }, 200);
        }
    }
    PKSReset(){
        this.form.pks = null; 
        this.form.pks_nama = null;

        this.PKSFilter();

        setTimeout(() => {
            $('*[name="pks_nama"]').blur();
            setTimeout(() => {
                $('*[name="pks_nama"]').focus();
            }, 250);
        }, 200);
    }
    // => / END : AC PKS

    /**
     * Simpan
     */
    Simpan(){

        this.form.start_date = moment(this.form.start_date).format('YYYY-MM-DD');
        this.form.end_date = moment(this.form.end_date).format('YYYY-MM-DD');

        console.log(this.form);

        var URL = this.ComUrl + 'edit';
        if (this.form.id == 'add') {
            URL = this.ComUrl + 'add';
        }

        this.Busy = true;
        this.core.Do(URL, this.form).subscribe(
            result => {

                if (result.status == 1) {

                    this.core.Sharing('reload', 'reload');

                    var Success = {
                        type: 'success',
                        showConfirmButton: false,
                        title: 'Dobi Adjusted',
                        msg: 'All data in periode time are updated.'
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
    //=> / END : Simpan

}