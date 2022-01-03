export interface FuseConfig
{
    themes : {
        name: string,
        logo: string,
        logo2: string
    },
    layout: {
        style: string,
        width: 'fullwidth' | 'boxed',
        navbar: {
            background: string,
            hidden: boolean,
            folded: boolean,
            position: 'left' | 'right' | 'top',
            variant: string
        },
        toolbar: {
            background: string,
            hidden: boolean,
            position: 'above' | 'above-static' | 'above-fixed' | 'below' | 'below-static' | 'below-fixed'
        }
        footer: {
            background: string,
            hidden: boolean,
            position: 'above' | 'above-static' | 'above-fixed' | 'below' | 'below-static' | 'below-fixed'
        }
    };
    customScrollbars: boolean;
}
