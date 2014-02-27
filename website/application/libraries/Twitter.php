<?php if (!defined('BASEPATH')) exit('No direct script access allowed');

/**
 * Twitter
 * 
 * A Word on Caching:
 *  Most of the requests to the Twitter API are cached. To
 *  see how this works, refer to the _get_cache() method and
 *  the CI caching documentation.  This makes it both quicker
 *  and reduces the risk of Twitter stopping your service as
 *  most are limited.
 * 
 *  It uses APC by default, but you should make your cache
 *  directory writable as it uses file as a backup.
 *
 * @link http://codeigniter.com/user_guide/libraries/caching.html
 * 
 * @license GNU v3
 * @uses CI Cache library
 * @uses CI Session library
 * @author Simon Emms <simon@simonemms.com>
 */
class Twitter {
    
    
    /* Set in the config file */
    protected $_connection,
        $_tokens,
        $_api_url,
        $_callback,
        $_curl,
        $_arrRequests,
        $_arrResponses,
        $_mch,
        $_token_session,
        $_user_url,
        $_search_url,
        $_request_token_url,
        $_authorization_url;
    
    
    /* Timeout in seconds */
    protected $cache_timeout = 300;
    
    
    /* Do we force the login */
    protected $_force_login = false;
    
    
    /* List of errors */
    protected $_arrErrors = array();
    
    
    /* Are we debugging */
    protected $_debug = false;
    
    
    /* Opens links in a new window */
    protected $_open_in_new_window = true;
    
    /* Cache method */
    protected $_cache_method = false;
    
    
    /* Target name */
    protected $_new_window_target = '_blank';
    
    
    /* Where errors live */
    protected $_error_message = null;
    
    
    /* Properties for the cURL - used when decoding the response */
    protected $_arrProperties = array(
        'code' => CURLINFO_HTTP_CODE,
        'time' => CURLINFO_TOTAL_TIME,
        'length' => CURLINFO_CONTENT_LENGTH_DOWNLOAD,
        'type' => CURLINFO_CONTENT_TYPE,
    );
    
    
    
    public function __construct() {
        /* Load the config */
        $this->load->config('twitter');
        
        $this->load->helper('url');
        
        $arrConfig = $this->config->item('twitter');
        
        if(is_array($arrConfig) && count($arrConfig) > 0) {
            foreach($arrConfig as $key => $value) {
                if($key == '_cache_method') {
                    if(!is_array($value) || !array_key_exists('adapter', $value) || empty($value['adapter'])) {
                        /* Invalid cache method */
                        $value = false;
                    }
                }
                $this->$key = $value;
            }
        }
        
        /* Parse login details */
        $this->_check_login();
    }
    
    
    
    
    
    
    
    /**
     * Destruct
     * 
     * Shows errors 
     */
    public function __destruct() {
        if($this->_debug && count($this->_arrErrors) > 0) {
            echo '<pre>'.print_r($this->_arrErrors, true).'</pre>';exit;
        }
    }
    
    
    
    
    
    
    
    /**
     * __get
     *
     * Allows models to access CI's loaded classes using the same
     * syntax as controllers.
     *
     * @param string
     * @access private
     */
    public function __get($key) {
        $CI =& get_instance();
        return $CI->$key;
    }
    
    
    
    
    
    
    
    
    /**
     * Add cURL
     * 
     * Add cURL stuff
     * 
     * @param string $url
     * @param array $arrParams
     * @return mixed
     */
    protected function _add_curl($url, $arrParams = array()) {
        if(!empty($arrParams['oauth'])) {
            $this->_add_oauth_headers($this->_curl, $url, $arrParams['oauth']);
        }

        $ch = $this->_curl;

        $key = (string) $ch;
        $this->_arrRequests[$key] = $ch;
        
        if(is_null($this->_mch)) {
            $this->_mch = curl_multi_init();
        }

        $response = curl_multi_add_handle($this->_mch, $ch);

        if($response === CURLM_OK || $response === CURLM_CALL_MULTI_PERFORM) {
            do {
                $mch = curl_multi_exec($this->_mch, $active);
            } while($mch === CURLM_CALL_MULTI_PERFORM);

            return $this->_get_response($key);
        } else {
            return $response;
        }
    }
    
    
    
    
    
    
    /**
     * Add OAuth Headers
     * 
     * Add the headers to the OAuth connection
     * 
     * @param resource $ch
     * @param string $url
     * @param array $arrHeaders
     */
    protected function _add_oauth_headers(&$ch, $url, $arrHeaders) {
        $_h = array('Expect:');
        $arrUrl = parse_url($url);
        $oauth = 'Authorization: OAuth realm="'.$arrUrl['path'].'",';
        
        if(count($arrHeaders) > 0) {
            foreach($arrHeaders as $name => $value ) {
                $oauth .= "{$name}=\"{$value}\",";
            }
        }
        
        $_h[] = substr($oauth, 0, -1);
        
        curl_setopt($ch, CURLOPT_HTTPHEADER, $_h);
    }
    
    
    
    
    
    
    
    
    /**
     * Build XML Array
     * 
     * Converts an XML feed into an array
     * 
     * @param mixed $arrObjData
     * @param array $arrSkipIndices
     * @return array
     */
    protected function _build_xml_array($arrObjData, $arrSkipIndices = array()) {
        
        $arrData = array();

        // if input is object, convert into array
        if(is_object($arrObjData)) {
            $arrObjData = get_object_vars($arrObjData);
        }

        if(is_array($arrObjData)) {
            foreach($arrObjData as $index => $value) {
                if(is_object($value) || is_array($value)) {
                    $value = $this->_build_xml_array($value, $arrSkipIndices); // recursive call
                }
                if(in_array($index, $arrSkipIndices)) {
                    continue;
                }
                $arrData[$index] = $value;
            }
        }
        return $arrData;
        
    }
    
    
    
    
    
    
    
    /**
     * Check Login
     * 
     * Saves the login data
     */
    protected function _check_login() {
        if($this->input->get('oauth_token') !== false) {
            /* Get from the string */
            $token = $this->input->get('oauth_token');
            
            $this->_set_access_key($token);
            
            $arrTokens = $this->_get_access_token();
            
            $arrKeys = array(
                'oauth_token',
                'oauth_token_secret',
                'user_id',
                'screen_name',
            );

            /* Set the data */
            if(array_keys_exist($arrKeys, $arrTokens)) {
                $this->_set_access_key($arrTokens['oauth_token']);
                $this->_set_access_secret($arrTokens['oauth_token_secret']);
                $this->_set_access_userId($arrTokens['user_id']);
                $this->_set_access_username($arrTokens['screen_name']);
            }
            
            /* Redirect without the GET strings */
            redirect(current_url());
        }
        
    }
    
    
    
    
    
    
    
    /**
     * Decode Response
     * 
     * Decode the response from the server
     * 
     * @param object $objData 
     * @return array
     */
    protected function _decode_response($objData) {
        /* Decode the data based on type */
        $arrResponse = array();
        if(preg_match('/(json)/', $objData->type)) {
            /* Decode a JSON string */
            $arrResponse = _object_to_array(json_decode($objData->data));
        } elseif(preg_match('/(xml)/', $objData->type)) {
            /* Decode an XML string */
            $objXML = new SimpleXMLElement($objData->data, null, false);
            $arrResponse = $this->_build_xml_array($objXML);
            
            /* Make the last element the array */
            $arrResponse = $arrResponse[end(array_keys($arrResponse))];
        } else {
            /* Text string */
            if(isset($objData->data)) {
                parse_str($objData->data, $arrResponse);
            }
        }
        return $arrResponse;
    }
    
    
    
    
    
    
    
    /**
     * Encode RFC3986
     * 
     * Encode the string in RFC3986
     * 
     * @param string $string
     * @return string
     */
    protected function _encode_rfc3986($string) {
        return str_replace('+', ' ', str_replace('%7E', '~', rawurlencode(($string))));
    }
    
    
    
    
    
    
    
    /**
     * Generate Nonce
     * 
     * Generate the none string
     * 
     * @return string
     */
    protected function _generate_nonce() { return md5(uniqid(rand(), true)); }
    
    
    
    
    
    
    
    
    /**
     * Generate Signature
     * 
     * Generates the signature
     * 
     * @param string $method
     * @param string $url
     * @param array $arrParams
     * @return string
     */
    protected function _generate_signature($method = null, $url = null, $arrParams = null) {
        
        if(empty($method) || empty($url)) { return false; }
        
        $concatenatedParams = '';
        if(count($arrParams) > 0) {
            foreach($arrParams as $k => $v) {
                $v = $this->_encode_rfc3986($v);
                $concatenatedParams .= "{$k}={$v}&";
            }
            
            $concatenatedParams = $this->_encode_rfc3986(substr($concatenatedParams, 0, -1));
        }
        
        $normalizedUrl = $this->_encode_rfc3986($this->_normalize_url($url));
        $method = $this->_encode_rfc3986($method); // don't need this but why not?
        
        $signatureBaseString = "{$method}&{$normalizedUrl}&{$concatenatedParams}";
        
        return $this->_sign_string($signatureBaseString);
        
    }
    
    
    
    
    
    
    
    
    /**
     * Get
     * 
     * Performs a GET request
     * 
     * @param string $url
     * @param array $arrParams
     * @return array
     */
    protected function _get($url, $arrParams) {
        if(isset($arrParams['request']) && count($arrParams['request']) > 0 ) {
            $url .= '?';
            foreach($arrParams['request'] as $k => $v ) {
                $url .= "{$k}={$v}&";
            }

            $url = substr($url, 0, -1);
        }
        
        $this->_init_connection($url);
        $response = $this->_add_curl($url, $arrParams);

        echo '<pre>';
        echo $url . PHP_EOL;
        print_r($arrParams);
        echo PHP_EOL . PHP_EOL;
        print_r($response);
        
        return $response;
    }
    
    
    
    
    
    
    
    /**
     * Gett Access Token
     * 
     * Gets the access tokens from Twitter
     * 
     * @return array
     */
    protected function _get_access_token() {
        $arrData = $this->_http_request('GET', $this->_access_token_url, array('_cache' => false, 'oauth_verifier' => $_GET['oauth_verifier']));
        
        return $arrData['data'];
    }
    
    
    
    
    
    
    /**
     * Get Authorization URL
     * 
     * Gets the URL which Twitter uses to
     * authorize the application.  Sets to
     * force login if required
     * 
     * @return string
     */
    protected function _get_authorisation_url() {
        $arrData = $this->_get_request_token();
        
        $arrGet = array();
        /* Add the token */
        if(array_key_exists('oauth_token', $arrData)) {
            $arrGet['oauth_token'] = $arrData['oauth_token'];
        }
        
        /* Do we force login */
        if($this->_force_login) { $arrGet['force_login'] = 1; }
        
        /* Build the URL */
        $arrUrl = array(
            $this->_authorization_url,
            http_build_query($arrGet),
        );
        
        return implode('?', $arrUrl);
    }
    
    
    
    
    
    
    
    /**
     * Get Response
     * 
     * Gets the response from the API
     * 
     * @param string $key
     * @return array
     */
    protected function _get_response($key = null) {
        if(is_null($key)) { return false; }
        
        if(is_array($this->_arrResponses) && array_key_exists($key, $this->_arrResponses)) {
            return $this->_arrResponses[$key];
        } else {
            $running = null;
            
            do {
                $response = curl_multi_exec($this->_mch, $running_curl);
                
                if(is_null($running) === false && $running_curl != $running) {
                    $this->_set_response($key);
                    
                    if(is_array($this->_arrResponses) && array_key_exists($key, $this->_arrResponses)) {
                        
                        /* Convert to an object - reduces errors if key not present */
                        $objData = (object) $this->_arrResponses[$key];
                        
                        /* Decode the response */
                        $arrResponse = $this->_decode_response($objData);
                        
                        /* If not 200, throw an error */
                        if($objData->code != 200) {
                            $message = '';
                            /* How do we do errors */
                            if($this->_debug) {
                                /* Output errors */
                                if(array_key_exists('error', $arrResponse)) {
                                    $message = ' - ';
                                    $message .= $arrResponse['error'];
                                } else {
                                    $message = $objData->data;
                                }
                                throw new Twitter_Exception($objData->code.' | Request failed'.$message);
                            }
                        }
                        
                        $arrReturn = array(
                            'data' => $arrResponse, /* The data lives here */
                            '_raw' => $objData, /* Used for debugging purposes */
                        );
                        
                        return $arrReturn;
                        
                    }
                }
                
                $running = $running_curl;
            } while($running_curl > 0);
        }
    }
    
    
    
    
    
    
    
    
    /**
     * Get Cache
     * 
     * Gets the cache of the feed
     * 
     * @param string $method
     * @param string $url
     * @param array $arrParams
     * @return mixed
     */
    protected function _get_cache($method, $url, $arrParams) {
        
        if($this->_cache_method !== false) {
            /* Load the cache driver */
            $this->load->driver('cache', $this->_cache_method);

            /* Get the name */
            $name = $this->_get_cache_name($method, $url, $arrParams);

            $arrData = $this->cache->get('twitter_'.$name);

            if($arrData === false) {
                return null;
            } else {
                return $arrData;
            }
        }
        
        return null;
        
    }
    
    
    
    
    
    
    
    
    /**
     * Get Cache Name
     * 
     * Gets the name for the cache
     * 
     * @param string $method
     * @param string $url
     * @param array $arrParams
     * @return string
     */
    protected function _get_cache_name($method, $url, $arrParams) {
        
        $arrCache = array(
            $method,
            $url,
            $arrParams,
        );
        
        $name = md5(serialize($arrCache));
        
        return $name;
    }
    
    
    
    
    
    
    
    /**
     * Get Error
     * 
     * Checks the return array from Twitter for an
     * error
     * 
     * @param array $arrResult
     * @return string/false
     */
    protected function _get_error($arrResult) {
        
        /* Default to no error */
        $error = false;
        if(is_array($arrResult)) {
            if (array_key_exists('error', $arrResult)) {
                /* Has error - return the message */
                $error = $arrResult['error'];
            } elseif (array_key_exists('errors', $arrResult)) {
                /* Has error - return the message */
                $error = $arrResult['errors'];
            }

            if ($error !== false) {            
                /* Save the error message */
                $this->_error_message = $error;
            }
        }
        
        return $error;
        
    }
    
    
    
    
    
    
    
    /**
     * Get Request Token
     * 
     * Gets the request token to allow us
     * to login
     * 
     * @return array
     */
    protected function _get_request_token() {
        $arrData = $this->_http_request('GET', $this->_request_token_url, array('_cache' => false));
        
        return $arrData['data'];
    }








    /**
     * HTTP Request
     * 
     * Performs an HTTP request
     * 
     * @param string $method
     * @param string $url
     * @param array $arrParams
     * @return resource/null
     */
    protected function _http_request($method = null, $url = null, $arrParams = null) {
        if(empty($method) || empty($url)) { return null; }
        
        /* Add OAuth signature - not for public calls */
        $arrParams = $this->_prepare_parameters($method, $url, $arrParams);
        
        /* Check for no cache instruction */
        $cache = true;
        if(is_array($arrParams['request']) && array_key_exists('_cache', $arrParams['request'])) {
            $cache = $arrParams['request']['_cache'];
            /* Ensure either int or bool */
            if(is_numeric($cache)) {
                $cache = (int) $cache;
            } else {
                $cache = (bool) $cache;
            }
            unset($arrParams['request']['_cache']);
        }
        
        if($cache !== false) {
            /* Check the cache */
            $arrReturn = $this->_get_cache($method, $url, $arrParams['request']);
            
            /* We have cached data - do not recache */
            if(!is_null($arrReturn)) { $cache = false; }
        } else {
            $arrReturn = null;
        }
        
        /* Nothing in cache - get from the API */
        if(is_null($arrReturn)) {
        
            switch($method) {
                case 'GET':
                    $arrReturn = $this->_get($url, $arrParams);
                    break;

                case 'POST':
                    $arrReturn = $this->_post($url, $arrParams);
                    break;

                case 'PUT':
                    $arrReturn = null;
                    break;

                case 'DELETE':
                    $arrReturn = null;
                    break;
            }
        
        }
        
        /* Cache the data */
        if($cache !== false) {
            $this->_save_cache($method, $url, $arrParams['request'], $arrReturn, $cache);
        }
        
        return $arrReturn;
    }
    
    
    
    
    
    
    
    
    /**
     * Init Connection
     * 
     * Initialize the cURL connection
     * 
     * @param string $url 
     */
    protected function _init_connection($url) {
        $this->_curl = curl_init($url);
        curl_setopt($this->_curl, CURLOPT_RETURNTRANSFER, true);
    }
    
    
    
    
    

    
    /**
     * Normalize URL
     * 
     * Make sure the URL is in the correct format
     * 
     * @param string $url
     * @return string
     */
    protected function _normalize_url($url = NULL) {
        $arrUrl = parse_url($url);

        if(!isset($arrUrl['port'])) { $arrUrl['port'] = 80; }

        $scheme = strtolower($arrUrl['scheme']);
        $host = strtolower($arrUrl['host']);
        $port = intval($arrUrl['port']);

        $retval = "{$scheme}://{$host}";

        if ( $port > 0 && ( $scheme === 'http' && $port !== 80 ) || ( $scheme === 'https' && $port !== 443 ) ) {
            $retval .= ":{$port}";
        }

        $retval .= $arrUrl['path'];

        if(!empty($arrUrl['query'])) {
            $retval .= "?{$arrUrl['query']}";
        }

        return $retval;
    }
    
    
    
    
    
    
    
    
    /**
     * Post
     * 
     * Performs a POST request
     * 
     * @param string $url
     * @param array $arrParams
     * @return array
     */
    protected function _post($url, $arrParams) {
		$post = '';
        if(is_array($arrParams['request']) && count($arrParams['request']) > 0 ) {
            foreach($arrParams['request'] as $k => $v) {
                $post .= $k . "=" . urlencode($v) . "&";
            }
            
            $post = substr($post, 0, -1);
            
        }
        
        $this->_init_connection($url);
        curl_setopt($this->_curl, CURLOPT_POST, 1);
        curl_setopt($this->_curl, CURLOPT_POSTFIELDS, $post);
        
        $response = $this->_add_curl($url, $arrParams);
        
        return $response;
    }
    
    
    
    
    
    
    
    

    /**
     * Prepare Parameters
     * 
     * Prepares the parameters for the uery
     * 
     * @param string $method
     * @param string $url
     * @param array $arrParams
     * @return array
     */
    protected function _prepare_parameters($method = NULL, $url = NULL, $arrParams = NULL) {
        if(empty($method) || empty($url)) { return FALSE; }
        
        $public = false;
        if(is_array($arrParams) && array_key_exists('public', $arrParams)) {
            $public = (bool) $arrParams['public'];
            unset($arrParams['public']);
        }
        
        $arrOauth = array();
        
        if($public === false) {
            /* Set the main OAuth info */
            $arrOauth = array(
                'oauth_consumer_key' => $this->get_consumer_key(),
                'oauth_token' => $this->get_access_key(),
                'oauth_nonce' => $this->_generate_nonce(),
                'oauth_timestamp' => time(),
                'oauth_signature_method' => $this->_signature_method,
                'oauth_version' => $this->_version,
            );
        }
        
        /* Get the callback URL */
        $callback = $this->get_callback();
        
        /* Set the callback URL */
        if(!empty($callback)) { $arrOauth['oauth_callback'] = $callback; }
	
        /* Reset the callback URL */
        $this->set_callback(null);
        
        array_walk($arrOauth, array($this, '_encode_rfc3986'));
        
        $arrEncoded = array_merge($arrOauth, (array) $arrParams);
        
        unset($arrEncoded['_cache']);
			
        ksort($arrEncoded);
        
        $arrOauth['oauth_signature'] = $this->_encode_rfc3986($this->_generate_signature($method, $url, $arrEncoded));
        
        $arrReturn = array(
            'request' => $arrParams,
            'oauth' => $arrOauth,
        );
        
        return $arrReturn;
    }
    
    
    
    
    
    
    
    
    /**
     * Save Cache
     * 
     * Saves the cache
     * 
     * @param string $method
     * @param string $url
     * @param array $arrParams
     * @param array $arrReturn
     * @param bool/float $cache_override
     */
    protected function _save_cache($method, $url, $arrParams, $arrReturn, $cache_override) {
        
        /* Do we cache - should be done anyway, but double-checking */
        if($this->_cache_method !== false) {
            /* Get the cache name */
            $name = $this->_get_cache_name($method, $url, $arrParams);
            
            $cache_timeout = $this->cache_timeout;
            if(is_int($cache_override)) {
                $cache_timeout = $cache_override;
            }

            /* Save the array */
            $this->cache->save('twitter_'.$name, $arrReturn, $cache_timeout);
        }
        
    }
    
    
    
    
    
    
    
    /**
     * Set Access Key
     * 
     * Sets the access key
     * 
     * @param string $key
     */
    protected function _set_access_key($key) {
        
        /* Get the data */
        $arrTokens = $this->_update_access('access_key', $key);
        
        /* Save it to the session */
        $this->set_db_accesstoken($this->_token_session, $arrTokens);
    }
    
    
    
    
    
    
    
    /**
     * Set Access Secret
     * 
     * Sets the secret code
     * 
     * @param string $key
     */
    protected function _set_access_secret($key) {
        
        /* Get the data */
        $arrTokens = $this->_update_access('access_secret', $key);
        
        /* Save it to the session */
        $this->set_db_accesstoken($this->_token_session, $arrTokens);
    }
    
    
    
    
    
    
    
    /**
     * Set User ID
     * 
     * Sets the userId
     * 
     * @param string $id
     */
    protected function _set_access_userId($id) {
        
        /* Get the data */
        $arrTokens = $this->_update_access('userId', $id);
        
        /* Save it to the session */
        $this->set_db_accesstoken($this->_token_session, $arrTokens);
        
    }
    
    
    
    
    
    
    
    /**
     * Set User ID
     * 
     * Sets the userId
     * 
     * @param string $user
     */
    protected function _set_access_username($user) {
        
        /* Get the data */
        $arrTokens = $this->_update_access('username', $user);
        
        /* Save it to the session */
        $this->set_db_accesstoken($this->_token_session, $arrTokens);
        
    }
    
    
    
    
    
    
    
    /**
     * Set Response
     * 
     * Set the responses from the server
     * 
     * @param string $key 
     */
    protected function _set_response($key) {
        while($done = curl_multi_info_read($this->_mch)) {
            $key = (string) $done['handle'];
            
            $this->_arrResponses[$key]['data'] = curl_multi_getcontent($done['handle']);
            
            foreach($this->_arrProperties as $curl_key => $value) {
                $this->_arrResponses[$key][$curl_key] = curl_getinfo($done['handle'], $value);
                
                curl_multi_remove_handle($this->_mch, $done['handle']);
            }
        }
    }
    
    
    
    
    
    
    /**
     * Sign String
     * 
     * Signs the string
     * 
     * @param string $string
     * @return string
     */
    protected function _sign_string($string) {
        $retval = FALSE;
        switch($this->_signature_method ) {
            case 'HMAC-SHA1':
                $key = $this->_encode_rfc3986($this->get_consumer_secret()) . '&' . $this->_encode_rfc3986($this->get_access_secret());
                $retval = base64_encode(hash_hmac('sha1', $string, $key, true));
                break;
        }
        return $retval;
    }
    
    
    
    
    
    
    
    /**
     * Update Access
     * 
     * Updates the login session
     * 
     * @param string $key
     * @param string $value
     * @return array
     */
    protected function _update_access($key = null, $value = null) {
        
        if(!is_null($key)) {
            $arrSession = $this->get_db_accesstoken($this->_token_session);

            /* Are we creating, updating or deleting */
            if(!is_null($value)) {
                /* Create/update */
                if(is_array($arrSession)) {
                    $arrSession[$key] = $value;
                } else {
                    $arrSession = array(
                        $key => $value,
                    );
                }
            } else {
                /* Deleting */
                unset($arrSession[$key]);
            }
        } else {
            /* Return blank array */
            $arrSession = array();
        }
        
        return $arrSession;
        
    }
    
    
    
    
    
    
    
    /**
     * Call
     * 
     * Call the API and return the data
     * 
     * '_cache' => false in the $arrArgs will not allow
     * the call to be cached
     * 
     * @param string $method
     * @param string $path
     * @param array $arrArgs
     * @param bool $public
     * @param bool $debug
     * @return array
     */
    public function call($method, $path, $arrArgs = null, $public = false, $debug = false) {
        $ext = strtolower($this->_method);
        
        $arrResponse = $this->_http_request(strtoupper($method), $this->_api_url.'/'.$path.'.'.$ext, $arrArgs);

        if(is_null($arrResponse)) {
            return array();
        } elseif($debug === true || array_key_exists('data', $arrResponse) === false) {
            echo '<pre>'.print_r($arrResponse['_raw'], true).'</pre>';exit;
        } else {
            return $arrResponse['data'];
        }
    }
    
    
    
    
    
    
    /**
     * Enable Debugging
     */
    public function debug() { $this->_debug = true; }
    
    
    
    
    
    
    
    
    /**
     * Fetch Home Timeline
     * 
     * Gets your main timeline (what the people
     * you are following are saying).  By default,
     * this is cached
     * 
     * The $arrParams allows you to put in the parameters
     * allowed by Twitter (see online documentation)
     * 
     * @link https://dev.twitter.com/docs/api/1/get/statuses/home_timeline
     * @params array $arrParams
     * @return array
     */
    public function fetch_home_timeline(array $arrParams = array()) {
        $url = 'statuses/home_timeline';
        if(!array_key_exists('include_entities', $arrParams)) { $arrParams['include_entities'] = 'true'; }
        $arrData = $this->call('get', $url, $arrParams);
        return $arrData;
    }
    
    
    
    
    
    /**
     * Fetch Mentions
     * 
     * Gets your mentions (what people have said
     * to you). By default, this is cached
     * 
     * The $arrParams allows you to put in the parameters
     * allowed by Twitter (see online documentation)
     * 
     * @link https://dev.twitter.com/docs/api/1/get/statuses/mentions
     * @params array $arrParams
     * @return array
     */
    public function fetch_mentions(array $arrParams = array()) {
        $url = 'statuses/mentions_timeline';
        if(!array_key_exists('include_entities', $arrParams)) { $arrParams['include_entities'] = 'true'; }
        $arrData = $this->call('get', $url, $arrParams);
        return $arrData;
    }
    
    
    
    
    
    
    
    /**
     * Fetch Public Timeline
     * 
     * Gets the public timeline.  By default, this is
     * cached.
     * 
     * The $arrParams allows you to put in the parameters
     * allowed by Twitter (see online documentation)
     * 
     * @link https://dev.twitter.com/docs/api/1/get/statuses/public_timeline
     * @param array $arrParams
     * @return array
     */
    public function fetch_public_timeline(array $arrParams = array()) {
        $url = 'statuses/public_timeline';
        if(!array_key_exists('include_entities', $arrParams)) { $arrParams['include_entities'] = 'true'; }
        $arrData = $this->call('get', $url, $arrParams);
        return $arrData;
    }
    
    
    
    
    
    
    
    /**
     * Fetch Retweeted By Me
     * 
     * Retweets that I have retweeted.  By default,
     * this is cached.
     * 
     * The $arrParams allows you to put in the parameters
     * allowed by Twitter (see online documentation)
     * 
     * @link https://dev.twitter.com/docs/api/1/get/statuses/retweeted_by_me
     * @param array $arrParams
     * @return array
     */
    public function fetch_retweeted_by_me(array $arrParams = array()) {
        $url = 'statuses/retweeted_by_me';
        if(!array_key_exists('include_entities', $arrParams)) { $arrParams['include_entities'] = 'true'; }
        $arrData = $this->call('get', $url, $arrParams);
        return $arrData;
    }
    
    
    
    
    
    
    
    /**
     * Fetch Retweets Of Me
     * 
     * Returns tweets of mine that have been retweeted. By
     * default, this is cached.
     * 
     * The $arrParams allows you to put in the parameters
     * allowed by Twitter (see online documentation)
     * 
     * @link https://dev.twitter.com/docs/api/1/get/statuses/retweets_of_me
     * @param array $arrParams
     * @return array
     */
    public function fetch_retweets_of_me(array $arrParams = array()) {
        $url = 'statuses/retweets_of_me';
        if(!array_key_exists('include_entities', $arrParams)) { $arrParams['include_entities'] = 'true'; }
        $arrData = $this->call('get', $url, $arrParams);
        return $arrData;
    }
    
    
    
    
    
    
    
    /**
     * Fetch Retweeted To Me
     * 
     * Retweets done by people I follow.  By default,
     * this is cache.
     * 
     * The $arrParams allows you to put in the parameters
     * allowed by Twitter (see online documentation)
     * 
     * @link https://dev.twitter.com/docs/api/1/get/statuses/retweeted_to_me
     * @param array $arrParams
     * @return array
     */
    public function fetch_retweeted_to_me(array $arrParams = array()) {
        $url = 'statuses/retweeted_to_me';
        if(!array_key_exists('include_entities', $arrParams)) { $arrParams['include_entities'] = 'true'; }
        $arrData = $this->call('get', $url, $arrParams);
        return $arrData;
    }
    
    
    
    
    
    
    
    /**
     * Fetch User Timeline
     * 
     * Fetches the timeline of the given user.  By default,
     * this is cached.  You must set either a userId, or
     * a username
     * 
     * The $arrParams allows you to put in the parameters
     * allowed by Twitter (see online documentation)
     * 
     * @link https://dev.twitter.com/docs/api/1/get/statuses/user_timeline
     * @param array $arrParams
     * @return array
     */
    public function fetch_user_timeline($userId = null, $username = null, array $arrParams = array()) {
        if(!is_null($userId)) { $arrParams['user_id'] = $userId; }
        if(!is_null($username)) { $arrParams['screen_name'] = $username; }
        
        $url = 'statuses/user_timeline';
        if(!array_key_exists('include_entities', $arrParams)) { $arrParams['include_entities'] = 'true'; }
        $arrData = $this->call('get', $url, $arrParams);
        return $arrData;
    }
    
    
    
    
    
    
    
    /**
     * Get Access Key
     * 
     * Gets the access key
     * 
     * @return string/null
     */
    public function get_access_key() {
        /* Check the config first */
        $access_key = false;
        if(is_array($this->_tokens) && array_key_exists('access_key', $this->_tokens) && !empty($this->_tokens['access_key'])) {
            $access_key = $this->_tokens['access_key'];
        }
        
        if($access_key === false) {
            /* Not set in the system - check for a session/cookie */
            $access_key = null;
            $arrKeys = $this->get_db_accesstoken($this->_token_session);
            
            if(is_array($arrKeys) && array_key_exists('access_key', $arrKeys)) {
                $access_key = $arrKeys['access_key'];
            }
        }
        
        return $access_key;
    }
    
    
    
    
    
    
    
    /**
     * Get Access Secret
     * 
     * Gets the secret key
     * 
     * @return string
     */
    public function get_access_secret() {
        /* Check the config first */
        $access_secret = false;
        if(is_array($this->_tokens) && array_key_exists('access_secret', $this->_tokens) && !empty($this->_tokens['access_secret'])) {
            $access_secret = $this->_tokens['access_secret'];
        }
        
        if($access_secret === false) {
            /* Not set in the system - check for a session/cookie */
            $access_secret = null;
            $arrKeys = $this->get_db_accesstoken($this->_token_session);
            
            if(is_array($arrKeys) && array_key_exists('access_secret', $arrKeys)) {
                $access_secret = $arrKeys['access_secret'];
            }
        }
        
        return $access_secret;
    }
    
    
    
    
    
    
    
    /**
     * Get Callback
     * 
     * Gets the callback URL
     * 
     * @return string
     */
    public function get_callback() {
        return $this->_callback;
    }
    
    
    
    
    
    
    /**
     * Get Consumer Key
     * 
     * Gets the consumer key
     * 
     * @return string
     */
    public function get_consumer_key() { return $this->_tokens['consumer_key']; }
    
    
    
    
    
    
    
    
    /**
     * Get Consumer Secret
     * 
     * Gets the consumer secret
     * 
     * @return string
     */
    public function get_consumer_secret() { return $this->_tokens['consumer_secret']; }
    
    
    
    
    
    
    
    
    /**
     * Get Error
     * 
     * Gets the errors - used for API error messages
     * that can be returned to users
     * 
     * @return string
     */
    public function get_error() {
        $error = $this->_error_message;
        $this->_error_message = null;
        
        return $error;
    }
    
    
    
    
    
    
    
    
    /**
     * Get UserId
     * 
     * Gets the userId.  Returns null if not
     * logged in
     * 
     * @return number
     */
    public function get_userId() {
        
        $arrKeys = $this->get_db_accesstoken($this->_token_session);
            
        if(is_array($arrKeys) && array_key_exists('userId', $arrKeys)) {
            return $arrKeys['userId'];
        }
        
        /* Not set */
        return null;
    }
    
    
    
    
    
    
    
    
    /**
     * Get Username
     * 
     * Gets the logged-in username or null
     * if not set
     * 
     * @return string
     */
    public function get_username() {
        
        $arrKeys = $this->get_db_accesstoken($this->_token_session);
            
        if(is_array($arrKeys) && array_key_exists('username', $arrKeys)) {
            return $arrKeys['username'];
        }
        
        /* Not set */
        return null;
        
    }
    
    
    
    
    
    

    /**
     * Is Logged In
     * 
     * Checks that we are logged in
     * 
     * @return boolean
     */
    public function is_logged_in() {
        
        $access_key = $this->get_access_key();
        $access_secret = $this->get_access_secret();
        
        $logged_in = false;
        
        if(!is_null($access_key) && !is_null($access_secret)) {
            /* Set as true */
            $logged_in = true;
        }

        return $logged_in;
    }
    
    
    
    
    
    
    
    /**
     * Login
     * 
     * Logs into Twitter 
     */
    public function login() {
        $CI =& get_instance();
        
        $user_id = $CI->tank_auth->get_user_id();
        $CI->load->model('user_accounts_model');
        
        // Make sure that existing account is not primary first
        $accounts = $CI->user_accounts_model->get_by_user_id($user_id, 'TWITTER', NULL, true);
        $account = (count($accounts) > 0) ? $accounts[0] : NULL;

        if ($account) {   
            $CI->user_accounts_model->update($account->id, array('is_primary' => 0));
        }

        /* Check we're not logged in */
        if($this->is_logged_in() === false) {
            
            if(is_null($this->get_callback())) {
                $this->set_callback();
            }
            
            /* Go to the login page */
            echo $this->_get_authorisation_url();
            exit;
            redirect($this->_get_authorisation_url());
            
        }
    }
    
    
    
    
    
    
    
    /**
     * Logout
     * 
     * Logs out from Twitter.  Only works if
     * you're using session data and not if you've
     * given your app the tokens
     */
    public function logout() {
        $this->set_db_accesstoken($this->_token_session, null);
    }
    
    
    
    
    
    
    
    /**
     * Parse Hashtag
     * 
     * Detects hashtag in a string and makes it into
     * a URL.  If you force username, it returns the
     * whole string as a hashtag
     * 
     * @param string $string
     * @param string $target
     * @param bool $is_hashtag
     * @return string
     */
    public function parse_hashtag($string, $target = null, $is_hashtag = false) {
        
        /* Find the target */
        if(is_null($target)) { $target = $this->_open_in_new_window ? ' target="'.$this->_new_window_target.'"' : ''; }
        
        if(preg_match_all('/(\#(\w+)(\b|$))/', $string, $arrHash) || $is_hashtag) {
            
            if($is_hashtag) {
                /* We're forcing it to be a username */
                $arrHash = array(
                    array($string),
                    array($string),
                );
            }
            
            if(count($arrHash[0]) > 0) {
                foreach($arrHash[0] as $hash) {
                    $href = str_replace('%search%', urlencode($hash), $this->_search_url);
                    
                    /* Build the URL */
                    $url = '<a href="'.$href.'"'.$target.'>'.$hash.'</a>';
                    
                    /* Replace in tweet */
                    $string = str_replace($hash, $url, $string);
                }
            }
            
        }
        
        return $string;
        
    }
    
    
    
    
    
    
    
    
    /**
     * Parse Tweet
     * 
     * Parses a tweet so that it displays links, usernames
     * and hashtags as a link.
     * 
     * @param string $tweet
     * @param bool $parse_url
     * @return mixed
     */
    public function parse_tweet($tweet, $parse_url = true) {
        
        if(is_array($tweet)) {
            if(array_key_exists('text', $tweet)) {
                /* Do we have entities */
                if(array_key_exists('entities', $tweet)) {
                    /* Yes - get the URL */
                    if(count($tweet['entities']['urls']) > 0) {
                        $text = $tweet['text'];
                        
                        foreach($tweet['entities']['urls'] as $url) {
                            $href = $url['url'];
                            
                            $target = empty($this->_new_window_target) ? '_blank' : $this->_new_window_target;
        
                            $target = ' target="'.$target.'"';
                            
                            /* Might not always exist - if Tweet been wrongly RTed */
                            if(array_key_exists('display_url', $url)) {
                                $new_url = '<a href="'.$href.'"'.$target.'>'.$url['display_url'].'</a>';

                                /* Don't use the indices in case it's got mutliple links */
                                $tweet['text'] = str_replace($url['url'], $new_url, $tweet['text']);
                            }
                        }
                    }
                    
                    /* Parse the rest of the rules - don't bother running the URLs again though */
                    $tweet['parsed_text'] = $this->parse_tweet($tweet['text'], false);
                    return $tweet;
                } else {
                    /* Just parse the tweet as normal */
                    $tweet['parsed_text'] = $this->parse_tweet($tweet['text']);
                    return $tweet;
                }
                
            } elseif(count($tweet) > 0) {
                foreach($tweet as $key => $value) {
                    $tweet[$key] = $this->parse_tweet($value);
                }
                return $tweet;
            } else {
                return array();
            }
        } else {

            /* URL */
            if($parse_url) { $tweet = $this->parse_url($tweet); }

            /* Usernames */
            $tweet = $this->parse_username($tweet);

            /* Hashtags */
            $tweet = $this->parse_hashtag($tweet);

            return $tweet;
        }
    }
    
    
    
    
    
    
    
    
    
    /**
     * Parse URL
     * 
     * Detects url in a string and makes it into
     * a URL.  If you force url, it returns the
     * whole string as a url.
     * 
     * This is a best-guess.  The correct way to
     * use it is to make the query with "entities"
     * and use the parse_tweet method.
     * 
     * @param string $string
     * @param bool $is_url
     * @return string
     */
    public function parse_url($string, $is_url = false) {
        
        /* Force open in new window for links */
        $target = empty($this->_new_window_target) ? '_blank' : $this->_new_window_target;
        
        $target = ' target="'.$target.'"';
        
        /* Links - match anything with *.twitter.com and anything starting http */
        if(preg_match_all('/\b((([\w\.]+)twitter\.com)|(\w*\:\/\/))([\w\/\.]+)\b/', $string, $arrMatch) || $is_url) {
            
            if($is_url) { $arrMatch = array(array($string)); }
            
            if(count($arrMatch[0]) > 0) {
                foreach($arrMatch[0] as $url) {
                    /* Get the URL - add http if doesn't start with anything */
                    if(!preg_match('/^(\w*)\:\/\//', $url)) { $href = 'http://'.$url; }
                    else { $href = $url; }
                    
                    /* Build the URL */
                    $new_url = '<a href="'.$href.'"'.$target.'>'.$url.'</a>';
                    
                    /* Replace in tweet */
                    $string = str_replace($url, $new_url, $string);
                }
            }
        }
        
        return $string;
        
    }
    
    
    
    
    
    
    
    
    
    /**
     * Parse Username
     * 
     * Detects username in a string and makes it into
     * a URL.  If you force username, it returns the
     * whole string as a username
     * 
     * @param string $string
     * @param string $target
     * @param bool $is_username
     * @return string
     */
    public function parse_username($string, $target = null, $is_username = false) {
        
        /* Find the target */
        if(is_null($target)) { $target = $this->_open_in_new_window ? ' target="'.$this->_new_window_target.'"' : ''; }
        
        if(preg_match_all('/\@([a-zA-Z0-9_]{1,})/', $string, $arrUser) || $is_username) {
            if($is_username) {
                /* We're forcing it to be a username */
                $arrUser = array(
                    array($string),
                    array($string),
                );
            }
            
            /* 0 is full @user, 1 is just user */
            if(count($arrUser[0]) > 0) {
                foreach($arrUser[0] as $regexId => $user) {
                    /* Get the link */
                    $href = str_replace('%user%', $arrUser[1][$regexId], $this->_user_url);
                    
                    /* Build the URL */
                    $url = '<a href="'.$href.'"'.$target.'>'.$user.'</a>';
                    
                    /* Replace in tweet */
                    $string = str_replace($user, $url, $string);
                }
            }
        }
        
        return $string;
        
    }
    
    
    
    
    
    
    
    /**
     * Post Tweet
     * 
     * Posts a tweet to your account.  It returns
     * the array of the tweet if it was successfully
     * posted, or false if not.  The error can be
     * fetched from $this->get_error();
     * 
     * @link https://dev.twitter.com/docs/api/1/post/statuses/update
     * @param string $tweet
     * @param array $arrParams
     * @return mixed
     */
    public function post_tweet($tweet, array $arrParams = array()) {
        
        $url = 'statuses/update';
        
        /* Add the tweet into the paramaters */
        $arrParams['status'] = $tweet;
        
        /* Don't cache it */
        $arrParams['_cache'] = false;
        
        $arrResult = $this->call('POST', $url, $arrParams);

        /* Check for an error */
        $error = $this->_get_error($arrResult);
        
        /* Return array (no error - posted) or false (error - not posted) */
        return $error === false ? $arrResult : false;        
    }

    public function follow($username, array $arrParams = array()) {
        
        $url = 'friendships/create';
        
        /* Add the username into the paramaters */
        $arrParams['screen_name'] = $username;
        
        /* Don't cache it */
        $arrParams['_cache'] = false;
        
        $arrResult = $this->call('POST', $url, $arrParams);

        /* Check for an error */
        $error = $this->_get_error($arrResult);
        
        /* Return array (no error - posted) or false (error - not posted) */
        return $error === false ? $arrResult : false;        
    }

    public function retweet($tweet_id) {
        
        $url = 'statuses/retweet/' . $tweet_id;
        
        /* Don't cache it */
        $arrParams['_cache'] = false;
        
        $arrResult = $this->call('POST', $url, $arrParams);
        
        /* Check for an error */
        $error = $this->_get_error($arrResult);
        
        /* Return array (no error - posted) or false (error - not posted) */
        return $error === false ? $arrResult : false;        
    }
    
    
    
    
    
    
    
    
    /**
     * Set Callback
     * 
     * Sets the callback URL
     * 
     * @param string $url
     */
    public function set_callback($url = null) {
        if(is_null($url)) { $url = current_url(); }
        $this->_callback = $url;
    }
    
    function set_db_accesstoken($key, $access_token) {
        $CI =& get_instance();
        
        $user_id = $CI->tank_auth->get_user_id();
        $CI->load->model('user_accounts_model');
        
        $data = array(
            'access_token' => serialize($access_token)
        );

        if (is_array($access_token) && array_key_exists('username', $access_token)) {
            $data['name'] = $access_token['username'];
            $data['account_identifier'] = $access_token['userId'];
        }

        $accounts = $CI->user_accounts_model->get_by_user_id($user_id, 'TWITTER', NULL, true);
        $account = (count($accounts) > 0) ? $accounts[0] : NULL;

        if (!$account) {
            $CI->user_accounts_model->delete_by_user_id($user_id, 'TWITTER', $data['account_identifier']);

            $data['user_id'] = $user_id;
            $data['is_primary'] = 1;
            $data['type'] = 'TWITTER';
            $CI->user_accounts_model->save($data);
        } else {
            $CI->user_accounts_model->update($account->id, $data);

            // Check if we have any duplicate accounts
            if (isset($data['account_identifier']) && !empty($data['account_identifier'])) {
                $accounts = $CI->user_accounts_model->get_by_user_id($user_id, 'TWITTER', $data['account_identifier']);
                unset($accounts[0]); // Keep the newest
                
                foreach ($accounts as $account) {
                    $CI->user_accounts_model->delete($account->id);
                }
            }
            
        }
    }

    function get_db_accesstoken($key){
        $CI =& get_instance();
        $user_id = $CI->tank_auth->get_user_id();
        $CI->load->model('user_accounts_model');
        $profiles = $CI->user_accounts_model->get_by_user_id($user_id, 'TWITTER', NULL, true);

        if (!$profiles || !is_array($profiles) || count($profiles) < 1)
            return NULL;

        if (is_null($profiles[0]->access_token))
            return NULL;
        
        $returnObject = unserialize($profiles[0]->access_token);

        return $returnObject;
    }
    
}







class Twitter_Exception extends Exception {
    
    public function __toString() {
        echo '<pre>'.print_r($this->getMessage(), true).'</pre>';exit;
    }

}



    
    
    
    
    
/**
 * Object To Array
 * 
 * Convert an object to an array
 * 
 * @param mixed $object
 * @return array 
 */
if(!function_exists('_object_to_array')) {
    function _object_to_array($object) {
        if(!is_object($object) && !is_array($object)) {
            return $object;
        }
        if(is_object($object)) {
            $object = get_object_vars($object);
        }
        return array_map( '_object_to_array', $object );
    }
}








/**
 * Array Keys Exist
 *
 * Does the array_key_exist function for many
 * keys
 *
 * @param array $arrKey
 * @param array $arrArray
 * @return bool
 */
if(!function_exists('array_keys_exist')) {
    function array_keys_exist($arrKey, $arrArray) {
        if(count($arrKey) > 0) {
            foreach($arrKey as $key) {
                if(!array_key_exists($key, $arrArray)) {
                    return false;
                }
            }
        }
        return true;
    }
}
?>