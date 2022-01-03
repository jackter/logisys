import { Component, OnInit } from '@angular/core';
import { Core } from '../../../../providers/core';
import { MatDialogRef, MatDialog } from '@angular/material';

@Component({
    selector: 'dialog-form-item',
    templateUrl: './form.html',
})
export class ItemFormDialogComponent implements OnInit {

    global: any;
    form: any = {};
    perm: any = {};
    Default: any = {};

    ComUrl;
    Com;
    Busy;

    Delay;

    FroalaOptions: Object = {
        charCounterCount: true,
        wordAllowedStyleProps: [
            'font-size'
        ],
        wordDeniedAttrs: [
            'style'
        ],
        wordPasteModal: false,
        toolbarButtons: [
            'bold',
            'italic',
            'underline',
            'paragraphFormat',
            '|',
            'align',
            'formatOL',
            'formatUL',
            '|',
            'insertTable',
            '|',
            'strikeThrough',
            'subscript',
            'superscript',
            '|',
            'color',
            // 'inlineStyle',
            // '|',
        ],
        placeholder: 'Type Item Description',
        toolbarSticky: true,
        quickInsertEnabled: false
        /*events : {
            'froalaEditor.keyup' : (e, editor) => {
                
            }
        }*/

    };
    ShowEditor = false;

    constructor(
        private core: Core,
        private dialog: MatDialog,
        public dialogRef2: MatDialogRef<ItemFormDialogComponent>
    ) {

    }

    ngOnInit() {
        this.Satuan = this.Default.satuan;
        this.Grup = this.Default.grup;
        this.Brand = this.Default.brand;

        if (this.form.id != 'add') {
            this.form.item_type_val = this.form.item_type;
            this.form.sub_item_type_val = this.form.sub_item_type;
        }

        var Time = 1000;
        if (this.form.is_detail) {
            Time = 0;
        }

        setTimeout(() => {
            this.ShowEditor = true;
        }, Time);
    }

    /**
     * AC Item
     */
    Item: any;
    WaitItem = false;
    ItemFilter() {

        var val = this.form.nama;

        /*if(val && this.Item.length > 0){

            let i = 0;
            let Filtered = [];
            for(let item of this.Item){

                if(
                    item.kode.toLowerCase().indexOf(val) != -1 ||
                    item.nama.toLowerCase().indexOf(val) != -1
                ){
                    Filtered[i] = item;
                    i++;
                }
                
            }
            this.Item = Filtered;

        }*/

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            val = val.toString().toLowerCase();

            var Params = {
                NoLoader: 1,
                keyword: val
            };

            this.WaitItem = true;
            this.core.Do(this.ComUrl + 'global', Params).subscribe(
                result => {

                    if (result) {
                        this.Item = result;
                    }

                    this.WaitItem = false;

                },
                error => {
                    console.error('ItemFilter', error);
                    this.core.OpenNotif(error);
                    this.WaitItem = false;
                }
            );

        }, 500);

    }
    ItemSelect(e, item) {

        if (e.isUserInput) {

            setTimeout(() => {

                this.form.kode_old = item.kode;
                this.form.satuan_kode = item.unit;
                this.SatuanFilter();

                this.global = item;

                setTimeout(() => {
                    $('*[name="satuan_kode"]').focus();
                }, 100);

            }, 100);

        }

    }
    // => / END : AC Item

    /**
     * AC Satuan
     */
    Satuan: any = [];
    SatuanFilter() {

        var val = this.form.satuan_kode;

        if (val) {

            val = val.toString().toLowerCase();

            let i = 0;
            let Filtered = [];
            for (let item of this.Default.satuan) {

                var Combine = item.nama + ' (' + item.kode + ')';
                if (
                    item.kode.toLowerCase().indexOf(val) != -1 ||
                    item.nama.toLowerCase().indexOf(val) != -1 ||
                    Combine.toLowerCase().indexOf(val) != -1
                ) {
                    Filtered[i] = item;
                    i++;
                }

            }
            this.Satuan = Filtered;

        } else {
            this.Satuan = this.Default.satuan;
        }

    }
    SatuanSelect(e, item) {
        if (e.isUserInput) {
            this.form.satuan = item.id;
            this.form.satuan_nama = item.nama;
            this.form.satuan_kode = item.kode;

            setTimeout(() => {
                $('*[name="grup_nama"]').focus();
            }, 100);
        }
    }
    // => / END : AC Satuan

    /**
     * AC Grup
     */
    Grup: any = [];
    GrupFilter() {

        var val = this.form.grup_nama;

        if (val) {

            val = val.toString().toLowerCase();

            let i = 0;
            let Filtered = [];
            for (let item of this.Default.grup) {

                var Combine = item.nama + ' : ' + item.kode + ')';
                if (
                    item.kode.toLowerCase().indexOf(val) != -1 ||
                    item.nama.toLowerCase().indexOf(val) != -1 ||
                    Combine.toLowerCase().indexOf(val) != -1
                ) {
                    Filtered[i] = item;
                    i++;
                }

            }
            this.Grup = Filtered;

        } else {
            this.Grup = this.Default.grup;
        }

    }
    GrupSelect(e, item) {
        if (e.isUserInput) {
            this.form.grup = item.id;
            this.form.grup_nama = item.nama;
            this.form.grup_kode = item.kode;
        }
    }
    // => / END : AC Grup

    /**
     * AC Brand
     */
    Brand: any = [];
    BrandFilter() {

        var val = this.form.brand;

        if (val) {

            val = val.toString().toLowerCase();

            let i = 0;
            let Filtered = [];
            for (let item of this.Default.satuan) {

                if (
                    item.nama.toLowerCase().indexOf(val) != -1
                ) {
                    Filtered[i] = item;
                    i++;
                }

            }
            this.Brand = Filtered;

        } else {
            this.Brand = this.Default.brand;
        }

    }
    BrandSelect(e, item) {
        if (e.isUserInput) {
            this.form.brand = item.nama;
        }
    }
    // => / END : AC Brand

    /**
     * Simpan
     */
    Simpan() {

        var URL = this.ComUrl + 'edit';
        if (this.form.id == 'add') {
            URL = this.ComUrl + 'add';
        }

        if (this.form.item_type_val != 2) {
            this.form.sub_item_type_val = 0;
        }

        // => Clean Item Type
        if (this.form.item_type_val) {
            this.form.item_type = this.form.item_type_val;
        }
        if (this.form.sub_item_type_val) {
            this.form.sub_item_type = this.form.sub_item_type_val;
        }

        // => Clean Descriptions
        /*var OriDesc = null;
        if(this.form.desc){
            OriDesc = this.form.desc;
            this.form.desc = "[NOSTRIP]" + this.form.desc;
        }*/

        this.form.global = JSON.stringify(this.global);

        this.Busy = true;
        this.core.Do(URL, this.form).subscribe(
            result => {

                if (result.status == 1) {

                    this.dialogRef2.close(result);

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

}
