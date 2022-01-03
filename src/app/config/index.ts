import { FuseConfig } from 'fuse/types';

/**
 * Default Fuse Configuration
 *
 * You can edit these options to change the default options. All these options also can be changed per component
 * basis. See `app/main/pages/authentication/login/login.component.ts` constructor method to learn more
 * about changing these options per component basis.
 */

export const fuseConfig: FuseConfig = {
    // Color themes can be defined in src/app/app.theme.scss
    themes          : {
        name    : 'Logisys',
        logo    : 'assets/logo.png',
        logo2    : 'assets/logo.png'
    },
    colorTheme      : 'theme-default',
    customScrollbars: true,
    layout          : {
        style    : 'vertical-layout-1',
        width    : 'fullwidth',
        navbar   : {
            primaryBackground  : 'primary-700',
            secondaryBackground: 'primary-900',
            folded             : false,
            hidden             : false,
            position           : 'left',
            variant            : 'vertical-style-1'
        },
        toolbar  : {
            customBackgroundColor: true,
            background           : 'primary-900',
            hidden               : false,
            position             : 'below-fixed'
        },
        footer   : {
            customBackgroundColor: true,
            background           : 'fuse-navy-900',
            hidden               : true,
            position             : 'below-fixed'
        },
        sidepanel: {
            hidden  : true,
            position: 'right'
        }
    }
};