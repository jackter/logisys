import {
	Component,
    OnInit,
    ViewEncapsulation
} from '@angular/core';

import { default as swal } from 'sweetalert2';
import { LocalStorageService } from 'angular-2-local-storage';
import { Router } from '@angular/router';
import { fuseAnimations } from 'fuse/animations';
import { Core } from '../../../providers/core';

@Component({
	selector: 'app-cpass',
	templateUrl: './cpass.component.html',
    styleUrls: ['./cpass.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class CpassComponent implements OnInit {

    form: any = {};

	constructor(
        private core: Core,
        private router: Router,
        private LS: LocalStorageService
    ) {}

	ngOnInit() {
        setTimeout(() => {
            $('input[name="current"]').focus();
        }, 1000);
    }

    Cpass(){

        this.core.Do('e/_system/cpass', this.form).subscribe(
            result => {

                if(result.status == 1){

                    swal({
                        title: 'Berhasil!',
                        html: 'Password Berhasil Di Ganti',
                        type: 'success',
                        showConfirmButton: false
                    }).then(
                        result => {
                            
                            this.Logout();
                            
                        }
                    );

                    setTimeout(() => {
                        this.Logout();
                    }, 2000);

                }else{
                    var Alert = {
                        type: 'error',
                        msg: result.error_msg
                    }
                    this.core.OpenAlert(Alert);
                }

            },
            error => {
                this.core.OpenNotif(error);
            }
        );

    }

    Logout(){
        this.LS.clearAll();
        this.router.navigate(['/system/login']);
    }

}