<?php

if(isset($_GET['page']) && isset($_GET['com'])){
    $page = $_GET['page'];
    $com = $_GET['com'];

    //BY MODULE CONFIG
    $cekMod = is_dir(MODULE . "/" . $page . "/" . $com);
    if($cekMod && !empty($page)){	
        $GLOBALS['use-config-meta'] = true;
        include Module::CFG($page, $com);
        $webdesc = $WEBDESC;
        $keyword = $KEYWORDS;
        $webtitle = $WEBTITLE;
        $HEADCUSTOM = $HEADCUSTOM;
    //STATIC META INFO
    }else{
        //STATIC
        $HEADCUSTOM = "";
        switch($page){
        
            //index														
            case "error":
                $webdesc = "";
                $keyword = "";
                
                if($_GET['case'] == 400){
                    $webtitle = "Error 400";
                }elseif($_GET['case'] == 401){
                    $webtitle = "Error 401";
                }elseif($_GET['case'] == 403){
                    $webtitle = "Error 403";
                }elseif($_GET['case'] == 404){
                    $webtitle = "Error 404";
                }
                
                break;

            default:
                $webdesc = "";
                $keyword = "";
                $webtitle = "Ruang Warga - Ruang Kontribusi Informasi Warga";
            
        }	
    }

    if(empty($webdesc) && empty($keyword) && empty($webtitle)){
        $webdesc = "";
        $keyword = "";
        $webtitle = "JRuang Warga - Ruang Kontribusi Informasi Warga";
        
        $HEADCUSTOM = "";
    }
        
    //DEFINER
    define ("KEYWEB", $keyword);
    define ("WEBDESC", $webdesc);
    define ("WEBTITLE", $webtitle);	
    define ("HEADCUSTOM", $HEADCUSTOM);

}
?>