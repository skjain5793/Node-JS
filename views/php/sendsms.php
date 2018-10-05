<?php

    function MyFunction($mobile,$message){ 
	//echo "HI";
		/* error_reporting (E_ALL ^ E_NOTICE);
		$username="NRAJIVVARMA";
		$password ="Bulksms123$";
		$number=9034019503;
		$sender="TESTID";
		$message="test";

		$url="login.bulksmsgateway.in/sendmessage.php?user=".urlencode($username)."&password=".urlencode($password)."&mobile=".urlencode($number)."&sender=".urlencode($sender)."&message=".urlencode($message)."&type=".urlencode('3'); 
		$ch = curl_init($url);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		echo $curl_scraped_page = curl_exec($ch);
		curl_close($ch);  */
		
		error_reporting (E_ALL ^ E_NOTICE);
		$username="NRAJIVVARMA";
		$password ="Bulksms123$";
		$number=$mobile;
		$sender="PROREV";
		//$message="test";

		$url="login.bulksmsgateway.in/sendmessage.php?user=".urlencode($username)."&password=".urlencode($password)."&mobile=".urlencode($number)."&sender=".urlencode($sender)."&message=".urlencode($message)."&type=".urlencode('3'); 
		$ch = curl_init($url);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		return $curl_scraped_page = curl_exec($ch);
		curl_close($ch); 
		
	  //return $a + $b; 
	
	}
?>