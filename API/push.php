<?php
$FCM_SERVER_KEY = "AAAAMA5Y5sc:APA91bEfzeA4Ph8_Y2Mj17RNdx8vjL-f0sFcYk8Foy6EfJtNsr48tkVEXBnai5tz0UjkqEvefRTl5l5rr9V4ulMuwI2Pqd__aenE_qEIqD-N7LHzNJ5MZ6YXjRelHVD4CCgpI5sZV2T1";

/*function sendFCM($message = "", $id = "") {

    $url = 'https://fcm.googleapis.com/fcm/send';

	if(!empty($id)){
		$fields['registration_ids'] = array(
			$id
		);
	}
	$fields['data'] = array(
		$message
	);
    $fields = json_encode ( $fields );

    $headers = array (
            'Authorization: key=' . $FCM_SERVER_KEY,
            'Content-Type: application/json'
    );
	
	echo $fields;

    $ch = curl_init ();
    curl_setopt ( $ch, CURLOPT_URL, $url );
    curl_setopt ( $ch, CURLOPT_POST, true );
    curl_setopt ( $ch, CURLOPT_HTTPHEADER, $headers );
    curl_setopt ( $ch, CURLOPT_RETURNTRANSFER, true );
    curl_setopt ( $ch, CURLOPT_POSTFIELDS, $fields );

    $result = curl_exec ( $ch );
    echo $result;
    curl_close ( $ch );
}*/

$EXPIRE = (3600 * 4) * 4;

$options = array(
	"to"				=> "dYso8FoZQZQ:APA91bEbGV1PZeqR3h6fiIs0uGHm_Mok7S7CUaJj-_fvupQXZTOmShNu3cY4kR9VMNINzfLuqD0LLOifXmq5KKqeUGPolD_4E_NxELbx1qNsZBCiuWsKIfXBrqfxXIiwz9WT14W7JxAh",
	"data"		=> array(
		"title"				=> "Promo Launching", 
		"body"				=> "Test isi notifikasi, kalau panjang jadinya seperti apa. mudah-mudahan sesuai dengan yang diharapkan ya. Super thank you deh kalo kayak gitu",
		"sound"				=> "default",
		"goto"				=> "test",
	),
	"priority"			=> "high", 
	"time_to_live"		=> $EXPIRE, 
	"restricted_package_name" => "com.arvisya.jaloka"
);
$url = 'https://fcm.googleapis.com/fcm/send';
	
$fields = json_encode ( $options );

$headers = array (
		'Authorization: key=' . $FCM_SERVER_KEY,
		'Content-Type: application/json'
);

$ch = curl_init ();
curl_setopt ( $ch, CURLOPT_URL, $url );
curl_setopt ( $ch, CURLOPT_SSL_VERIFYHOST, false );
curl_setopt ( $ch, CURLOPT_SSL_VERIFYPEER, false );
curl_setopt ( $ch, CURLOPT_POST, true );
curl_setopt ( $ch, CURLOPT_HTTPHEADER, $headers );
curl_setopt ( $ch, CURLOPT_RETURNTRANSFER, true );
curl_setopt ( $ch, CURLOPT_POSTFIELDS, $fields );

$result = curl_exec ( $ch );

if ($result === FALSE) {
	die('FCM Send Error: ' . curl_error($ch));
}
echo "result " . $result;
curl_close ( $ch );
?>