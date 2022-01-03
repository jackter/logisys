<?php
$Modid = 81;
Perm::Check($Modid, 'add');

#Default Statement
$return = [];
$RPL    = "";
$SENT   = Core::Extract($_POST, $RPL);

#Extract Array
if (isset($SENT)) {
    foreach ($SENT as $KEY => $VAL) {
        $$KEY = $VAL;
    }
}

libxml_use_internal_errors(true);

$DB->ManualCommit();
$tgl_scrape_success = "";
while($min_date_send <= $max_date_send){
	$my_url = 'https://www.ortax.org/ortax/?mod=kursbi&search='.$min_date_send;
	try {
		$html = file_get_contents($my_url);
		$dom = new DOMDocument();
		$dom->loadHTML($html);
		$xpath = new DOMXPath($dom);
		
		$my_xpath_query = "/html/body/div[1]/div/div[2]/div/div/div[2]/div[3]/ul/li/div";
		$result_rows = $xpath->query($my_xpath_query);
		
		$tanggal;
		$retry = 0;
		$maxretry = 5;
		while($retry < $maxretry){
			if(count($result_rows) != 0){
				$retry = $maxretry;
				foreach ($result_rows as $n){
					$val = $n->nodeValue;
					
					$x = (explode("Masa Berlaku ",$val));
					$tanggal = $x[1];
				}
				
				$arrData = array();
					
				$my_xpath_query = "/html/body/div[1]/div/div[2]/div/div/div[2]/div[5]/table/tr/td[1]/font";
				$result_rows = $xpath->query($my_xpath_query);
				
				$count = 0;
				foreach ($result_rows as $n){
					$val = $n->nodeValue;
					$arrData[$count] = array();
					$arrData[$count]['kode'] = $val;
					$count++;
				}
				
				$my_xpath_query = "/html/body/div[1]/div/div[2]/div/div/div[2]/div[5]/table/tr/td[5]/span";
				$result_rows = $xpath->query($my_xpath_query);
				
				$count = 0;			
				foreach ($result_rows as $n){
					$val = $n->nodeValue;
					$arrData[$count]['rate'] = $val;
					$count++;
				}
				$explo_tgl = explode(" ",$tanggal);
				$bln = "";
				switch($explo_tgl[2]){
					case 'Jan':
						$bln = 1;
						break;
					case 'Feb':
						$bln = 2;
						break;
					case 'Mar':
						$bln = 3;
						break;
					case 'Apr':
						$bln = 4;
						break;
					case 'Mei':
						$bln = 5;
						break;
					case 'Jun':
						$bln = 6;
						break;
					case 'Jul':
						$bln = 7;
						break;
					case 'Agust':
						$bln = 8;
						break;
					case 'Sept':
						$bln = 9;
						break;
					case 'Okt':
						$bln = 10;
						break;
					case 'Nop':
						$bln = 11;
						break;
					case 'Des':
						$bln = 12;
						break;
					default:
						$bln = 0;
				}
				$tgl = $explo_tgl[3].'-'.$bln.'-'.$explo_tgl[1];

				$Q_CUR = $DB->QueryPort("
					SELECT 
						id, 
						kode, 
						nama 
					FROM cur
				");

				$R_CUR = $DB->Row($Q_CUR);
				$ARR_CUR = array();
				if($R_CUR > 0){
					$i = 0;
					while($CUR = $DB->Result($Q_CUR)){
						$ARR_CUR[$i] = array();
						$ARR_CUR[$i]['id'] = $CUR['id'];
						$ARR_CUR[$i]['kode'] = $CUR['kode'];
						$ARR_CUR[$i]['nama'] = $CUR['nama'];
						$i++;
					}
				}
				
				if($DB->Delete(
					"exchange",
					"tanggal = '" . $min_date_send . "'"
				)){
					$Date = date("Y-m-d H:i:s");
					$count = 0;
					foreach ($arrData as $data) {						
						foreach ($ARR_CUR as $value) {
							if($value['kode'] == $data['kode']){
								$Field = array(
									'tanggal'       => $min_date_send,
									'cur'  			=> $value['id'],
									'cur_kode'  	=> $value['kode'],
									'cur_nama'      => $value['nama'],
									'rate'     		=> $data['rate'],
									'description'   => 'Kurs Tengah BI',
									'create_by'     => Core::GetState('id'),
									'create_date'   => $Date,
									'status'        => 1
								);

								$return['data'][$count] = $Field;

								$DB->Insert("exchange", $Field);

								$count++;
							}
						}
					}
				}

				$tgl_scrape_success = $min_date_send;
			}
			else{
				sleep(1);
				$retry++;
			}
		}
	} catch (Exception $e) {
		$return['status'] = 0;
	}

	$min_date_send = date('Y-m-d', strtotime("+1 day", strtotime($min_date_send)));
}

if($tgl_scrape_success != ""){
	$DB->Update(
		"parameter",
		array(
			'param_val'            => $max_date_send
		),
		"id = 'exchange_execution'"
	);
	
	$DB->Commit();
}
$return['status'] = 1;

echo Core::ReturnData($return);
?>