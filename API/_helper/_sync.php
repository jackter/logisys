<?php
exit();
include ("vendor/autoload.php");

// TEST

use ElephantIO\Client;
use ElephantIO\Engine\SocketIO\Version2X;

$Key = "LogisysSyncServer";

$Content = explode(";", $_SERVER["CONTENT_TYPE"]);
$Content = base64_decode(base64_decode($Content[1]));
$Content = explode(";", $Content);
$Content = $Content[0];

if($Content == $Key){

    function On2Lo($str){
        switch($str){
            case "citraborneo_logisys":
                $return = "cbi_logisys";
                break;
            case "citraborneo_master":
                $return = "cbi_master";
                break;
            default:
                $return = "Error!";
        }
    
        return $return;
    }

    $DBOnline = array(
        'host'      => 'citraborneo.id',
        'user'      => 'citraborneo_indah',
        'pass'      => 'O2D8nKTw_Nda',
        'db'        => 'citraborneo_logisys'
    );

    $DB = new mysqli(
        DB_HOST,
        DB_USER,
        DB_PASS,
        DB_NAME,
        DB_PORT
    );

    $DEF = "citraborneo_logisys";

    $DBOL = new mysqli(
        $DBOnline['host'],
        $DBOnline['user'],
        $DBOnline['pass'],
        $DEF
    );
    $DBOL->select_db($DEF);
    
    $Query = "
        SELECT
            *
        FROM
            _tocl
        WHERE
            status = 0
        ORDER BY 
            `time` 
        ASC
    ";
    $Query = $DBOL->query($Query);

    $R_Data = $Query->num_rows;
    if($R_Data > 0){

        $Result = [];
        while($Data = $Query->fetch_array(MYSQLI_ASSOC)){

            $Result[] = array(
                'table'     => $Data['table'],
                'action'    => $Data['action'],
                'time'      => $Data['time']
            );

            /**
             * Run Query on Local
             */
            $SrcQuery = $Data['query'];

            $DBName = On2Lo($Data['table']);
    
            if($Execute = $DB->query($SrcQuery)){

                /*if($Data['action'] == 'insert'){
                    $DBOL->select_db($Data['db']);
                    $DBOL->query($SrcQuery);
                }*/

                 /**
                 * Delete Online
                 */
                $DBOL->select_db($DEF);
                //$Delete = "DELETE FROM _tocl WHERE id = '" . $Data['id'] . "'";
                $Delete = "UPDATE _tocl SET status = 1 WHERE id = '" . $Data['id'] . "'";
                $DBOL->query($Delete);
                //=> / END : Delete Online

            }
            //=> / END : Run Query On Local

        }

        /**
         * Emit Local
         */
        $Options = array(
            'context'   => array(
                'ssl'   => array(
                    'verify_peer_name' => false, 
                    'verify_peer' => false
                )
            )
        );

        $version = new Version2X("http://localhost:9090", $Options);
        $client = new Client($version);

        $Data =  array(
            'detail'  => "After Sync - " . date_db(date('Y-m-d')) . " " . date('H:i:s')
        );

        $client->Initialize();
        $client->emit('get', $Data);
        $client->close();
        //=> / END : Emit Local

        //echo json_encode($Result);

    }

    $DBOL->close();

}
?>