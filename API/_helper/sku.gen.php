<?php
/*echo SKU_gen('ZeroGround', 13, 2).'<br>'; // zrgr-0013
echo SKU_gen('ZeroGround', 13, 3).'<br>'; // zrgrn-0013
echo SKU_gen('Glock', 14, 3).'<br>'; // glc-0014
echo SKU_gen('CZ', 15, 3).'<br>'; // cz-0015
echo SKU_gen('Kizlyar', 20).'<br>'; // kz-0020*/

$nama = 'Woven Geotextile Solimat 25, Kuat Tarik MD= 56 KN/m (150m x 4m = 600m2)';

echo SKU_gen($nama, 13, 1) . "<br>";
echo strtoupper(App::Abbr($nama, 5));

function SKU_gen($string, $id = null, $l = 2){
    $results = ''; // empty string
    $vowels = array('a', 'e', 'i', 'o', 'u', 'y'); // vowels
    preg_match_all('/[A-Z][a-z]*/', ucfirst($string), $m); // Match every word that begins with a capital letter, added ucfirst() in case there is no uppercase letter
    foreach($m[0] as $substring){
        $substring = str_replace($vowels, '', strtolower($substring)); // String to lower case and remove all vowels
        $results .= preg_replace('/([a-z]{'.$l.'})(.*)/', '$1', $substring); // Extract the first N letters.
    }
    $results .= '-'. str_pad($id, 4, 0, STR_PAD_LEFT); // Add the ID
    return $results;
}
?>