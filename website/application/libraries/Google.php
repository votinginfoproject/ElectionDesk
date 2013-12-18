<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed'); 
/* 
*	Google Plus Library 
*/
require_once 'google-api-php-client/src/apiClient.php';
require_once 'google-api-php-client/src/contrib/apiPlusService.php';

class Google { 
	
	private $client_id; 
	private $client_secret; 
	private $developer_key; 
	private $redirect_uri; 
	private $scopes;
	
	private $google_client; 
	private $plus;
	
	/*
	*	Constructor
	*/
	function __construct(){
		// Load Default Google Plus API Configuration
		$CI =& get_instance();
		$CI->load->config('google_config');
		
		$this->client_id = $CI->config->item('client_id');
		$this->client_secret = $CI->config->item('client_secret'); 
		$this->developer_key = $CI->config->item('developer_key');
		$this->redirect_uri = $CI->config->item('redirect_uri');
		$this->scopes = $CI->config->item('scopes');
		
		$this->google_client = new apiClient();
		$this->google_client->setClientId($this->client_id); 
		$this->google_client->setClientSecret($this->client_secret);
		$this->google_client->setRedirectUri($this->redirect_uri);
		$this->google_client->setDeveloperKey($this->redirect_uri);
		$this->google_client->setScopes(array($this->scopes));
		
		$this->plus = new apiPlusService($this->google_client);
	}
	
	/*
	*	Set Client Id 
	*
	*	@access	public
	*	@param	string	$client_id	your application client id
	*/
	function set_client_id($client_id = ''){
		if(empty($client_id) === FALSE){ 
			$this->client_id = $client_id;
		}
	}
	
	/*
	*	Set Client Secret
	*	@access	public
	*	@param	$client_secret your application client secret
	*/
	function set_client_secret($client_secret = ''){
		if(empty($client_secret) === FALSE){
			$this->client_secret = $client_secret;
		}
	}
	
	/*
	*	Set Developer Key
	*	@access	public
	*	@param	string	$developer_key	your google developer key
	*/
	function set_developer_key($developer_key = ''){
		if(empty($developer_key) === FALSE){
			$this->developer_key = $developer_key;
		}
	}
	
	/*
	*	Set Redirect URI
	*	@access public
	*	@param string $redirect_uri	your application redirect uri to callback page
	*/
	function set_redirect_uri($redirect_uri = ''){ 
		if(empty($redirect_uri) === FALSE){
			$this->redirect_uri = $redirect_uri;
		}
	}
	
	/*
	*	Set Permisssion Scopes
	*	@access public
	*	@param string $scopes scopes permission for your application
	*/
	function set_scopes($scopes = ''){
		if(empty($scopes) === FALSE){ 
			$this->scopes = $scopes;
		}
	}
	
	/*
	*	Generate URL for Authentication 
	*	@access public
	*	@return string authentication url
	*/
	function get_auth_login_url(){
		return $this->google_client->createAuthUrl();
	}
	
	/*
	*	Request Access Token
	*	access public 
	*/
	function request_access_token(){
		$this->google_client->authenticate();
		$this->set_db_accesstoken($this->google_client->getAccesstoken());		
	}

	function logout(){
		$this->set_db_accesstoken(null);		
	}
	
	/*
	*	Set Access Token
	* 	@access public
	*	@return string access token
	*/
	function get_access_token(){
		return $this->google_client->getAccessToken();
	}
	
	/*
	*	Set Token 
	*	@access public
	*	@param null
	*/
	function set_token(){
		$this->google_client->setAccessToken($this->get_db_accesstoken());
	}
	

	
	/*
	* 	Check is user has been authenticated
	*	@access public
	*	@return boolean 
	*/
	function is_auth(){ 
		if(!is_null($this->get_db_accesstoken())){ 
			return TRUE;
		}else{
			return FALSE;
		}
	}
	
	/*
	*	Goto Authentication URL
	*	@access public 
	*	@param null
	*/
	function auth(){
		$CI =& get_instance(); 
		$CI->load->helper('url');
		redirect($this->google_client->createAuthUrl());
	}
	
	/*
	*	Get User Profile 
	* 	@access public
	*	@param string $user_id Google Plus User ID
	*/
	function get_user_profile($user_id = ''){		
		if(!is_null($this->get_db_accesstoken())){
			$this->set_token();
			$this->set_db_accesstoken($this->get_access_token());
			
			if($user_id === ''){ 
				return $this->plus->people->get('me');
			}else{
				return $this->plus->people->get($user_id);
			}
		}else{
			return NULL;
		}
	}
	
	/*
	*	Get List All of Activites 
	*	@access public 
	*	@param 
	*			string $user_id The ID of The user to get Activities For 
	*			string $max_result maximum number of activities to includes in the response, used for paging 
									default 20, acceptable values 1 to 100
	*	@return array
	*/
	function get_list_activities($user_id = '', $max_result = '20'){
		if(!is_null($this->get_db_accesstoken())){
			$this->set_token();
			$this->set_db_accesstoken($this->get_access_token());

			$opt_max_results = array('maxResults' => $max_result);
			
			if($user_id === ''){
				return $this->plus->activities->listActivities('me', 'public', $opt_max_results);
			}else{
				return $this->plus->activities->listActivities($user_id, 'public', $opt_max_results);
			}
			
		}else{
			return NULL;
		}
	}
	
	/*
	*	Get an Activity
	*	@access public
	*	@param	string $activity_id The ID of Activity to get
	*	@return array
	*/
	function get_activity($activity_id){
		if(!is_null($this->get_db_accesstoken())){
			$this->set_token();
			$this->set_db_accesstoken($this->get_access_token());
			
			if($activity_id === ''){
				return 'Invalid Activity ID';
			}else{
				return $this->plus->activities->get($activity_id);
			}
			
		}else{
			return NULL;
		}
	}

	function get_db_accesstoken(){
        $CI =& get_instance();
        $user_id = $CI->tank_auth->get_user_id();
        $CI->load->model('user_accounts_model');
        $profiles = $CI->user_accounts_model->get_by_user_id($user_id, 'GOOGLE', NULL, true);

        if (!$profiles || !is_array($profiles) || count($profiles) < 1)
            return NULL;

        if (is_null($profiles[0]->access_token))
            return NULL;
        
        return $profiles[0]->access_token;
    }

    function set_db_accesstoken($access_token) {
        $CI =& get_instance();
        
        $user_id = $CI->tank_auth->get_user_id();
        $CI->load->model('user_accounts_model');
        
        $data = array(
            'access_token' => $access_token
        );

		$profile = $this->plus->people->get('me');
		$data['account_identifier'] = $profile['id'];
		$data['name'] = $profile['displayName'];

        $accounts = $CI->user_accounts_model->get_by_user_id($user_id, 'GOOGLE', NULL, true);
        $account = (count($accounts) > 0) ? $accounts[0] : NULL;

        if (!$account) {
            $CI->user_accounts_model->delete_by_user_id($user_id, 'GOOGLE', $data['account_identifier']);

            $data['user_id'] = $user_id;
            $data['is_primary'] = 1;
            $data['type'] = 'GOOGLE';
            $CI->user_accounts_model->save($data);
        } else {
            $CI->user_accounts_model->update($account->id, $data);

            // Check if we have any duplicate accounts
            if (isset($data['account_identifier']) && !empty($data['account_identifier'])) {
                $accounts = $CI->user_accounts_model->get_by_user_id($user_id, 'GOOGLE', $data['account_identifier']);
                unset($accounts[0]); // Keep the newest
                
                foreach ($accounts as $account) {
                    $CI->user_accounts_model->delete($account->id);
                }
            }
            
        }
    }

}
/*	End of Google.php */
/*	Location: .application/libraries/Google.php */