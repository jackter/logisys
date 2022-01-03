import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import * as moment from 'moment';
import swal from 'sweetalert2';

@Component({
    selector: 'dialog-close-po',
    templateUrl: './close.html',
    styleUrls: ['../po.component.scss']
})
export class POCloseFormDialogComponent implements OnInit {

    form: any = {};
    perm: any = {};
    Default: any = {};

    ComUrl;
    Com;
    Busy;

    Delay;

    Initial;

    constructor(
        public core: Core,
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<POCloseFormDialogComponent>
    ) { }

    ngOnInit() {
        
    }

    /**
     * Simpan
     */
    Simpan() {

        this.Busy = true;
        if(this.Initial == 1){
            this.core.Do(this.ComUrl + 'backtopq', this.form).subscribe(
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
    
                    this.core.OpenNotif(error);
                    console.error('Submit', error);
                }
            );
        }else{

            this.core.Do(this.ComUrl + 'close.po', this.form).subscribe(
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
    
                    this.core.OpenNotif(error);
                    console.error('Submit', error);
                }
            );
        }
        
    }
    // => / END : Simpan

}
