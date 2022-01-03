import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { merge, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { FuseNavigationService } from 'fuse/components/navigation/navigation.service';
import { Core } from 'providers/core';

@Component({
    selector       : 'fuse-navigation',
    templateUrl    : './navigation.component.html',
    styleUrls      : ['./navigation.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FuseNavigationComponent implements OnInit
{
    @Input()
    layout = 'vertical';

    @Input()
    navigation: any;

    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     *
     * @param {ChangeDetectorRef} _changeDetectorRef
     * @param {FuseNavigationService} _fuseNavigationService
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseNavigationService: FuseNavigationService,
        private core: Core
    )
    {
        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    Busy: boolean = false;
    ngOnInit(): void
    {
        // Load the navigation either from the input or from the service
        this.navigation = this.navigation || this._fuseNavigationService.getCurrentNavigation();

        // Subscribe to the current navigation changes
        // this._fuseNavigationService.onNavigationChanged
        //     .pipe(takeUntil(this._unsubscribeAll))
        //     .subscribe(() => {

        //         // Load the navigation
        //         this.navigation = this._fuseNavigationService.getCurrentNavigation();

        //         // Mark for check
        //         this._changeDetectorRef.markForCheck();
        //     });

        this.Busy = true;
        this.core.Do('e/menu', {notimeout: 1}).subscribe(
            result => {
                
                this._fuseNavigationService.onNavigationChanged
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe(() => {
                        this.navigation = result;
                        this.Busy = false;

                        // Mark for check
                        this._changeDetectorRef.markForCheck();
                    });
                    
            },
            error => {
                this.core.OpenNotif(error);
            }
        );

        // Subscribe to navigation item
        merge(
            this._fuseNavigationService.onNavigationItemAdded,
            this._fuseNavigationService.onNavigationItemUpdated,
            this._fuseNavigationService.onNavigationItemRemoved
        ).pipe(takeUntil(this._unsubscribeAll))
         .subscribe(() => {

             // Mark for check
             this._changeDetectorRef.markForCheck();
         });
    }
}
