import { Component, ViewEncapsulation } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { animation } from '@angular/animations';
import { fuseAnimations } from 'fuse/animations';
import { Core } from '../../../../providers/core';

@Component({
    selector: 'app-list-dialog',
    templateUrl: './permissions.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class PermListDialogComponent {

    ComUrl;

    Data;
    perm;

    id;

    constructor(
        private core: Core,
        public dialogPerm: MatDialogRef<PermListDialogComponent>
    ) {}

    Simpan() {

        var Params = {
            id: this.id,
            data: JSON.stringify(this.Data)
        };

        this.core.Do(this.ComUrl + 'perm.set', Params).subscribe(
            success => {

                if (success.status == 1) {
                    this.dialogPerm.close(success);
                } else {
                    this.core.OpenNotif(success.error_msg);
                }

            },
            error => {

                this.core.OpenNotif(error);

            }
        );
    }

    CheckChecked(suffix, clickon) {

        var I = suffix.split('-');

        if (clickon == 'com') {   // => Select All child.action

            let LEN = this.Data[I[0]].children[I[1]].action.length;
            var ischecked = this.Data[I[0]].children[I[1]].checked;

            var tocheck = true;
            if (!ischecked) {
                tocheck = false;
            }

            for (let i = 0; i < LEN; i++) {
                this.Data[I[0]].children[I[1]].action[i].checked = tocheck;
            }

        } else {

            setTimeout(() => {

                let count = 0;

                var Checkbox = $('input[type="checkbox"][name*=act-' + suffix + ']');
                $(Checkbox).each((i) => {
                    var ischecked = $('input[type="checkbox"][name="act-' + suffix + '-' + i + '"]').parent().parent().parent().parent().find('.mat-checkbox-checked').length;

                    if (ischecked > 0) {
                        count++;
                    }
                });

                this.Data[I[0]].children[I[1]].count = count;

                if (count != this.Data[I[0]].children[I[1]].action.length) {
                    this.Data[I[0]].children[I[1]].checked = false;
                }

            }, 500);

        }

        // var LEN = $('input[type="checkbox"][name*=act-' + suffix + ']').parent().parent().parent().parent().html();

        // console.log(LEN);
    }

}
