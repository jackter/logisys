import { Component, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialogRef, MatDialog } from '@angular/material';

@Component({
    selector: 'dialog-form-incoming',
    templateUrl: './form.html',
    styleUrls: ['../incoming.component.scss']
})
export class IncomingFormDialogComponent implements OnInit {

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
        public dialogRef: MatDialogRef<IncomingFormDialogComponent>
    ) {

    }

    ngOnInit() {

        this.form.dobi = this.Default.parameter[0].value;
        this.form.ffa = this.Default.parameter[1].value;
        this.form.mai = this.Default.parameter[2].value;
        
    }

    /**
     * AC Source
     */
    Source: any[] = [];
    SourceFilter(val: string) {

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            var Params = {
                NoLoader: 1,
                keyword: val
            };

            this.core.Do(this.ComUrl + 'list.pks', Params).subscribe(
                result => {

                    if (result) {

                        this.Source = result.source;
                        
                    }

                },
                error => {
                    this.core.OpenNotif(error);
                }
            );

        }, 250);

    }
    SourceSelect(e, item) {

        if (e.isUserInput) {

            this.form.pks = item.pks;

            setTimeout(() => {
                $('*[name="ffa_qc"]').focus();
            }, 100);

        }

    }
    SourceRemove() {

        this.form.pks = null;
    }
    // => END : AC Source

    /**
     * Simpan
     */
    Simpan() {        

        var URL = this.ComUrl + 'edit';
        if (this.form.id == 'add') {
            URL = this.ComUrl + 'add';
        }

        this.Busy = true;
        this.core.Do(URL, this.form).subscribe(
            result => {

                if (result.status == 1) {

                    var Success = {
                        type: 'success',
                        showConfirmButton: false,
                        title: 'Save Success',
                        // msg: 'Please Verify your input to confirm and continue the process!'
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
