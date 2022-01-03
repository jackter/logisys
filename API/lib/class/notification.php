<?php
class Notif {

    function __construct(){

    }

    function __destruct(){

    }

    /**
     * Send Notification
     */
    static function Send($Options = array()){

        /**
         * OPTIONS:
         * ----------------------------------
         * company      : company
         * dept         : dept
         * title        : Title Notifikasi
         * content      : Content Notifikasi
         * data         : Stringify data JSON
         * url          : url
         * 
         * OPTIONS[sendback]:
         * user         : Notify to user only
         * company      : Notify to company
         * dept         : Notify to dept
         * 
         * OPTIONS[target][]:
         * modid: Next Module ID untuk digunakan sebagai triger pemilihan penerima notifikasi
         * auth: Syarat Permissions yang dimiliki user
         * company: Syart company yang dimiliki
         * dept: Syarat company yang dimiliki
         */

         if(!empty($Options)){

            // $DB = new DB;
            global $DB;

            /**
             * Configurations
             */
            $Table = array(
                'notif'         => 'notif',
                'notif_user'    => 'notif_user',
                'user'          => 'sys_user',
                'org'           => 'sys_user_org',
                'group'         => 'sys_group',
                'auth'          => 'sys_auth'
            );

            $Options['sender'] = Core::GetState('id');
            $NotifDate = date('Y-m-d H:i:s');
            //=> / Configurations

            /**
             * Insert Notif
             */
            if(
                !empty($Options['company']) && 
                //!empty($Options['dept']) && 
                !empty($Options['title']) && 
                !empty($Options['content'])
            ){

                $Field = array(
                    'title'     => $Options['title'],
                    'content'   => $Options['content'],
                    'sender'    => $Options['sender'],
                    'url'       => $Options['url'],
                    'create_date'   => $NotifDate
                );
                if(!empty($Options['data'])){
                    $Field['data'] = json_encode($Options['data']);
                }

                if($DB->Insert(
                    $Table['notif'],
                    $Field
                )){

                    /**
                     * Select Notif
                     */
                    $Notif = $DB->Result($DB->Query(
                        $Table['notif'],
                        array('id'),
                        "
                            WHERE
                                sender = '" . $Options['sender'] . "' AND 
                                create_date = '" . $NotifDate . "'
                        "
                    ));
                    //=> / END : Select Notif

                    /**
                     * Send to Target
                     */
                    if(!empty($Options['target'])){

                        for($i = 0; $i < sizeof($Options['target']); $i++){

                            /**
                             * Extract Auth
                             */
                            $Q_Auth = $DB->Query(
                                $Table['auth'],
                                array(
                                    'gperm'
                                ),
                                "
                                    WHERE   
                                        module REGEXP '[^}]*\"mod\"[^}]*:[^}]*\"" . $Options['target'][$i]['modid'] . "\"[^}]*' AND 
                                        module REGEXP '[^}]*\"perm\"[^}]*:[^}]*[^,]*(" . $Options['target'][$i]['auth'] . ")[,$]*[^}]*'
                                "
                            );
                            $R_Auth = $DB->Row($Q_Auth);
                            if($R_Auth > 0){

                                /**
                                 * Set Clause User
                                 */
                                $CLAUSE = "";
                                if(!empty($Options['company'])){
                                    $CLAUSE .= "
                                        AND 
                                            (
                                                CONCAT(',', O.company ,',') LIKE '%," . $Options['company'] . ",%' OR
                                                O.company = 'X'
                                            )
                                    ";
                                }
                                if(!empty($Options['dept'])){
                                    $CLAUSE .= "
                                        AND 
                                            (
                                                CONCAT(',', O.dept ,',') LIKE '%," . $Options['dept'] . ",%' OR
                                                O.dept = 'X'
                                            )
                                    ";
                                }
                                
                                $CLAUSE .= "
                                    AND 
                                        (
                                            CONCAT(',', O.users ,',') LIKE '%," . $Options['sender'] . ",%' OR
                                            O.users = 'X'
                                        )
                                ";
                                //=> / END : Set Clause User

                                while($Auth = $DB->Result($Q_Auth)){

                                    /**
                                     * Extract User
                                     */
                                    /*$Q_User = $DB->Query(
                                        $Table['user'],
                                        array('id'),
                                        "
                                            WHERE
                                                FIND_IN_SET(" . $Auth['gperm'] . ", gperm)
                                        "
                                    );*/
                                    $Q_User = $DB->QueryPort("
                                        SELECT
                                            U.id,
                                            O.company,
                                            O.dept,
                                            O.users
                                        FROM
                                            " . $Table['user'] . " AS U,
                                            " . $Table['org'] . " AS O
                                        WHERE
                                            O.uid = U.id AND 
                                            FIND_IN_SET(" . $Auth['gperm'] . ", U.gperm)
                                            $CLAUSE
                                    ");
                                    $R_User = $DB->Row($Q_User);
                                    if($R_User > 0){
                                        while($User = $DB->Result($Q_User)){

                                            $CheckUser = $DB->Row($DB->Query(
                                                $Table['notif_user'],
                                                array('id'),
                                                "
                                                    WHERE
                                                        notif = '" . $Notif['id'] . "' AND 
                                                        recipient = '" . $User['id'] . "'
                                                "
                                            ));

                                            //=> Insert Notification Recipient
                                            if($User['id'] != Core::GetState('id') && $CheckUser <= 0){
                                                $DB->Insert(
                                                    $Table['notif_user'],
                                                    array(
                                                        'notif'     => $Notif['id'],
                                                        'recipient' => $User['id'],
                                                        'create_by' => $Options['sender'],
                                                        'create_date'   => date('Y-m-d H:i:s')
                                                    )
                                                );
                                            }
                                            //=> / Insert Notification Recipient

                                        }
                                    }
                                    //=> / END : Extract User

                                }
                            }
                            //=> / END : Extract Auth
                        }

                    }
                    //=> / END : Send to Target

                    /**
                     * SEND BACK
                     */
                    if(!empty($Options['sendback'])){

                        //=> SEND BACK SINGLE USER
                        /*if(!empty($Options['sendback']['user']) && $Options['sendback']['user'] != Core::GetState('id')){
                            //=> Insert Notification Recipient
                            $DB->Insert(
                                $Table['notif_user'],
                                array(
                                    'notif'     => $Notif['id'],
                                    'recipient' => $Options['sendback']['user'],
                                    'create_by' => $Options['sender'],
                                    'create_date'   => date('Y-m-d H:i:s')
                                )
                            );
                            //=> / Insert Notification Recipient
                        }*/

                        /**
                         * Send Back Single User array
                         */
                        if(
                            !empty($Options['sendback'])
                        ){
                            for($i = 0; $i < sizeof($Options['sendback']); $i++){
                                if($Options['sendback'][$i] != Core::GetState('id')){

                                    //=> Insert Notification Recipient
                                    $DB->Insert(
                                        $Table['notif_user'],
                                        array(
                                            'notif'     => $Notif['id'],
                                            'recipient' => $Options['sendback'][$i],
                                            'create_by' => $Options['sender'],
                                            'create_date'   => date('Y-m-d H:i:s')
                                        )
                                    );
                                    //=> / Insert Notification Recipient

                                }
                            }
                        }
                        //=> / END : Send Back Single User array

                    }
                    //=> / END : SEND BACK

                }

            }
            //=> / END : Insert Notif

         }

    }
    //=> / END : Send Notification

}
?>