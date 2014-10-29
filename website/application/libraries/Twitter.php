<?php if (!defined('BASEPATH')) exit('No direct script access allowed');

/**
 * Twitter
 * 
 * A Word on Caching:
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

/**
 * Twitter class
 *
 * @author      Tijs Verkoyen <php-twitter@verkoyen.eu>
 * @version     2.3.1
 * @copyright   Copyright (c), Tijs Verkoyen. All rights reserved.
 * @license     BSD License
 */
class Twitter {

    // internal constant to enable/disable debugging
    const DEBUG = false;

    // url for the twitter-api
    const API_URL = 'https://api.twitter.com/1.1';
    const SECURE_API_URL = 'https://api.twitter.com';

    // port for the twitter-api
    const API_PORT = 443;
    const SECURE_API_PORT = 443;

    // current version
    const VERSION = '2.3.1';

    /**
     * A cURL instance
     *
     * @var resource
     */
    protected $curl;

    /**
     * The consumer key
     *
     * @var string
     */
    protected $consumerKey;

    /**
     * The consumer secret
     *
     * @var string
     */
    protected $consumerSecret;

    /**
     * The oAuth-token
     *
     * @var string
     */
    protected $oAuthToken = '';

    /**
     * The oAuth-token-secret
     *
     * @var string
     */
    protected $oAuthTokenSecret = '';

    /**
     * The timeout
     *
     * @var int
     */
    protected $timeOut = 10;

    /**
     * The user agent
     *
     * @var string
     */
    protected $userAgent;
    
    
    /**
     * Default constructor
     */
    public function __construct()
    {
        /* Load the config */
        $this->load->config('twitter');
        
        $this->load->helper('url');

        $arrConfig = $this->config->item('twitter');

        $this->setConsumerKey($arrConfig['consumer_key']);
        $this->setConsumerSecret($arrConfig['consumer_secret']);

        $this->_check_login();
    }

    /**
     * Default destructor
     */
    public function __destruct()
    {
        if($this->curl != null) curl_close($this->curl);
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

    private function _check_login() {
        // Oauth token
        $token = $this->input->get('oauth_token');

        // Verifier token
        $verifier = $this->input->get('oauth_verifier');

        // Request access token
        if ($token && $verifier) {
            $accessToken = Twitter::oAuthAccessToken($token, $verifier);

            $this->set_db_accesstoken($accessToken);
        } else {
            $this->refreshTokens();
        }
    }

    public function refreshTokens() {
        $arrKeys = $this->get_db_accesstoken();
                
        if (is_array($arrKeys) && array_key_exists('oauth_token', $arrKeys)) {
            $this->setOAuthToken($arrKeys['oauth_token']);
            $this->setOAuthTokenSecret($arrKeys['oauth_token_secret']);
        }
    }
    
 // OAuth resources
    /**
     * Allows a Consumer application to use an OAuth request_token to request user authorization. 
     * This method is a replacement fulfills Secion 6.2 of the OAuth 1.0 authentication flow for 
     * applications using the Sign in with Twitter authentication flow. The method will use the 
     * currently logged in user as the account to for access authorization unless the force_login 
     * parameter is set to true
     *
     * @param string $token The token.
     * @param bool[optional] $force Force the authentication.
     * @param string[optional] $screen_name Prefill the username input box of the OAuth login.
     */
    public function oAuthAuthenticate($token, $force = true, $screen_name = false)
    {
        $url = self::SECURE_API_URL . '/oauth/authenticate?oauth_token=' . $token;
        if ($force) {
            $url .= '&force_login=true';
        }
        if ($screen_name) {
            $url .= '&screen_name=' . $screen_name;
        }

        header('Location: ' . $url);
    }

    /**
     * Will redirect to the page to authorize the applicatione
     *
     * @param string $token The token.
     */
    public function oAuthAuthorize($token)
    {
        header('Location: ' . self::SECURE_API_URL .
               '/oauth/authorize?oauth_token=' . $token);
    }

    /**
     * Allows a Consumer application to exchange the OAuth Request Token for an OAuth Access Token.
     * This method fulfills Secion 6.3 of the OAuth 1.0 authentication flow.
     *
     * @param  string $token    The token to use.
     * @param  string $verifier The verifier.
     * @return array
     */
    public function oAuthAccessToken($token, $verifier)
    {
        // init var
        $parameters = array();
        $parameters['oauth_token'] = (string) $token;
        $parameters['oauth_verifier'] = (string) $verifier;

        // make the call
        $response = $this->doOAuthCall('access_token', $parameters);

        // set some properties
        if (isset($response['oauth_token'])) {
            $this->setOAuthToken($response['oauth_token']);
        }
        if (isset($response['oauth_token_secret'])) {
            $this->setOAuthTokenSecret($response['oauth_token_secret']);
        }

        // return
        return $response;
    }

    /**
     * Allows a Consumer application to obtain an OAuth Request Token to request user authorization.
     * This method fulfills Secion 6.1 of the OAuth 1.0 authentication flow.
     *
     * @param  string[optional] $callbackURL The callback URL.
     * @return array            An array containg the token and the secret
     */
    public function oAuthRequestToken($callbackURL = null)
    {
        // init var
        $parameters = null;

        // set callback
        if ($callbackURL != null) {
            $parameters['oauth_callback'] = (string) $callbackURL;
        }

        // make the call
        $response = $this->doOAuthCall('request_token', $parameters);

        // validate
        if (!isset($response['oauth_token'], $response['oauth_token_secret'])) {
            throw new Exception(implode(', ', array_keys($response)));
        }

        // set some properties
        if (isset($response['oauth_token'])) {
            $this->setOAuthToken($response['oauth_token']);
        }
        if (isset($response['oauth_token_secret'])) {
            $this->setOAuthTokenSecret($response['oauth_token_secret']);
        }

        // return
        return $response;
    }   
    
       /**
     * Format the parameters as a querystring
     *
     * @param  array  $parameters The parameters.
     * @return string
     */
    protected function buildQuery(array $parameters)
    {
        // no parameters?
        if(empty($parameters)) return '';

        // encode the keys
        $keys = self::urlencode_rfc3986(array_keys($parameters));

        // encode the values
        $values = self::urlencode_rfc3986(array_values($parameters));

        // reset the parameters
        $parameters = array_combine($keys, $values);

        // sort parameters by key
        uksort($parameters, 'strcmp');

        // loop parameters
        foreach ($parameters as $key => $value) {
            // sort by value
            if(is_array($value)) $parameters[$key] = natsort($value);
        }

        // process parameters
        foreach ($parameters as $key => $value) {
            $chunks[] = $key . '=' . str_replace('%25', '%', $value);
        }

        // return
        return implode('&', $chunks);
    }

    /**
     * All OAuth 1.0 requests use the same basic algorithm for creating a
     * signature base string and a signature. The signature base string is
     * composed of the HTTP method being used, followed by an ampersand ("&")
     * and then the URL-encoded base URL being accessed, complete with path
     * (but not query parameters), followed by an ampersand ("&"). Then, you
     * take all query parameters and POST body parameters (when the POST body is
     * of the URL-encoded type, otherwise the POST body is ignored), including
     * the OAuth parameters necessary for negotiation with the request at hand,
     * and sort them in lexicographical order by first parameter name and then
     * parameter value (for duplicate parameters), all the while ensuring that
     * both the key and the value for each parameter are URL encoded in
     * isolation. Instead of using the equals ("=") sign to mark the key/value
     * relationship, you use the URL-encoded form of "%3D". Each parameter is
     * then joined by the URL-escaped ampersand sign, "%26".
     *
     * @param  string $url        The URL.
     * @param  string $method     The method to use.
     * @param  array  $parameters The parameters.
     * @return string
     */
    protected function calculateBaseString($url, $method, array $parameters)
    {
        // redefine
        $url = (string) $url;
        $parameters = (array) $parameters;

        // init var
        $pairs = array();
        $chunks = array();

        // sort parameters by key
        uksort($parameters, 'strcmp');

        // loop parameters
        foreach ($parameters as $key => $value) {
            // sort by value
            if(is_array($value)) $parameters[$key] = natsort($value);
        }

        // process queries
        foreach ($parameters as $key => $value) {
            // only add if not already in the url
            if (substr_count($url, $key . '=' . $value) == 0) {
                $chunks[] = self::urlencode_rfc3986($key) . '%3D' .
                            self::urlencode_rfc3986($value);
            }
        }

        // buils base
        $base = $method . '&';
        $base .= urlencode($url);
        $base .= (substr_count($url, '?')) ? '%26' : '&';
        $base .= implode('%26', $chunks);
        $base = str_replace('%3F', '&', $base);

        // return
        return $base;
    }

    /**
     * Build the Authorization header
     * @later: fix me
     *
     * @param  array  $parameters The parameters.
     * @param  string $url        The URL.
     * @return string
     */
    protected function calculateHeader(array $parameters, $url)
    {
        // redefine
        $url = (string) $url;

        // divide into parts
        $parts = parse_url($url);

        // init var
        $chunks = array();

        // process queries
        foreach ($parameters as $key => $value) {
            $chunks[] = str_replace(
                '%25', '%',
                self::urlencode_rfc3986($key) . '="' . self::urlencode_rfc3986($value) . '"'
            );
        }

        // build return
        $return = 'Authorization: OAuth realm="' . $parts['scheme'] . '://' .
                  $parts['host'] . $parts['path'] . '", ';
        $return .= implode(',', $chunks);

        // prepend name and OAuth part
        return $return;
    }

    /**
     * Make an call to the oAuth
     * @todo    refactor me
     *
     * @param  string          $method     The method.
     * @param  array[optional] $parameters The parameters.
     * @return array
     */
    protected function doOAuthCall($method, array $parameters = null)
    {
        // redefine
        $method = (string) $method;

        // append default parameters
        $parameters['oauth_consumer_key'] = $this->getConsumerKey();
        $parameters['oauth_nonce'] = md5(microtime() . rand());
        $parameters['oauth_timestamp'] = time();
        $parameters['oauth_signature_method'] = 'HMAC-SHA1';
        $parameters['oauth_version'] = '1.0';

        // calculate the base string
        $base = $this->calculateBaseString(
            self::SECURE_API_URL . '/oauth/' . $method, 'POST', $parameters
        );

        // add sign into the parameters
        $parameters['oauth_signature'] = $this->hmacsha1(
            $this->getConsumerSecret() . '&' . $this->getOAuthTokenSecret(),
            $base
        );

        // calculate header
        $header = $this->calculateHeader(
            $parameters,
            self::SECURE_API_URL . '/oauth/' . $method
        );

        // set options
        $options[CURLOPT_URL] = self::SECURE_API_URL . '/oauth/' . $method;
        $options[CURLOPT_PORT] = self::SECURE_API_PORT;
        $options[CURLOPT_USERAGENT] = $this->getUserAgent();
        if (ini_get('open_basedir') == '' && ini_get('safe_mode' == 'Off')) {
            $options[CURLOPT_FOLLOWLOCATION] = true;
        }
        $options[CURLOPT_RETURNTRANSFER] = true;
        $options[CURLOPT_TIMEOUT] = (int) $this->getTimeOut();
        $options[CURLOPT_SSL_VERIFYPEER] = false;
        $options[CURLOPT_SSL_VERIFYHOST] = false;
        $options[CURLOPT_HTTPHEADER] = array('Expect:');
        $options[CURLOPT_POST] = true;
        $options[CURLOPT_POSTFIELDS] = $this->buildQuery($parameters);

        // init
        $this->curl = curl_init();

        // set options
        curl_setopt_array($this->curl, $options);

        // execute
        $response = curl_exec($this->curl);
        $headers = curl_getinfo($this->curl);

        // fetch errors
        $errorNumber = curl_errno($this->curl);
        $errorMessage = curl_error($this->curl);

        // error?
        if ($errorNumber != '') {
            throw new Exception($errorMessage, $errorNumber);
        }

        // init var
        $return = array();

        // parse the string
        parse_str($response, $return);

        // return
        return $return;
    }

    /**
     * Make the call
     *
     * @param  string           $url           The url to call.
     * @param  array[optional]  $parameters    Optional parameters.
     * @param  bool[optional]   $authenticate  Should we authenticate.
     * @param  bool[optional]   $method        The method to use. Possible values are GET, POST.
     * @param  string[optional] $filePath      The path to the file to upload.
     * @param  bool[optional]   $expectJSON    Do we expect JSON.
     * @param  bool[optional]   $returnHeaders Should the headers be returned?
     * @return string
     */
    protected function doCall(
        $url, array $parameters = null, $authenticate = false, $method = 'GET',
        $filePath = null, $expectJSON = true, $returnHeaders = false
    )
    {
        // allowed methods
        $allowedMethods = array('GET', 'POST');

        // redefine
        $url = (string) $url . '.json';
        $parameters = (array) $parameters;
        $authenticate = (bool) $authenticate;
        $method = (string) $method;
        $expectJSON = (bool) $expectJSON;

        // validate method
        if (!in_array($method, $allowedMethods)) {
            throw new Exception(
                'Unknown method (' . $method . '). Allowed methods are: ' .
                implode(', ', $allowedMethods)
            );
        }

        // append default parameters
        $oauth['oauth_consumer_key'] = $this->getConsumerKey();
        $oauth['oauth_nonce'] = md5(microtime() . rand());
        $oauth['oauth_timestamp'] = time();
        $oauth['oauth_token'] = $this->getOAuthToken();
        $oauth['oauth_signature_method'] = 'HMAC-SHA1';
        $oauth['oauth_version'] = '1.0';

        // set data
        $data = $oauth;
        if(!empty($parameters)) $data = array_merge($data, $parameters);

        // calculate the base string
        $base = $this->calculateBaseString(
            self::API_URL . '/' . $url, $method, $data
        );

        // based on the method, we should handle the parameters in a different way
        if ($method == 'POST') {
            // file provided?
            if ($filePath != null) {
                // build a boundary
                $boundary = md5(time());

                // process file
                $fileInfo = pathinfo($filePath);

                // set mimeType
                $mimeType = 'application/octet-stream';
                if ($fileInfo['extension'] == 'jpg' || $fileInfo['extension'] == 'jpeg') {
                    $mimeType = 'image/jpeg';
                } elseif($fileInfo['extension'] == 'gif') $mimeType = 'image/gif';
                elseif($fileInfo['extension'] == 'png') $mimeType = 'image/png';

                // init var
                $content = '--' . $boundary . "\r\n";

                // set file
                $content .= 'Content-Disposition: form-data; name=image; filename="' .
                            $fileInfo['basename'] . '"' . "\r\n";
                $content .= 'Content-Type: ' . $mimeType . "\r\n";
                $content .= "\r\n";
                $content .= file_get_contents($filePath);
                $content .= "\r\n";
                $content .= "--" . $boundary . '--';

                // build headers
                $headers[] = 'Content-Type: multipart/form-data; boundary=' . $boundary;
                $headers[] = 'Content-Length: ' . strlen($content);

                // set content
                $options[CURLOPT_POSTFIELDS] = $content;
            }

            // no file
            else $options[CURLOPT_POSTFIELDS] = $this->buildQuery($parameters);

            // enable post
            $options[CURLOPT_POST] = true;
        } else {
            // add the parameters into the querystring
            if(!empty($parameters)) $url .= '?' . $this->buildQuery($parameters);
            $options[CURLOPT_POST] = false;
        }

        // add sign into the parameters
        $oauth['oauth_signature'] = $this->hmacsha1(
            $this->getConsumerSecret() . '&' . $this->getOAuthTokenSecret(),
            $base
        );

        $headers[] = $this->calculateHeader($oauth, self::API_URL . '/' . $url);
        $headers[] = 'Expect:';

        // set options
        $options[CURLOPT_URL] = self::API_URL . '/' . $url;
        $options[CURLOPT_PORT] = self::API_PORT;
        $options[CURLOPT_USERAGENT] = $this->getUserAgent();
        if (ini_get('open_basedir') == '' && ini_get('safe_mode' == 'Off')) {
            $options[CURLOPT_FOLLOWLOCATION] = true;
        }
        $options[CURLOPT_RETURNTRANSFER] = true;
        $options[CURLOPT_TIMEOUT] = (int) $this->getTimeOut();
        $options[CURLOPT_SSL_VERIFYPEER] = false;
        $options[CURLOPT_SSL_VERIFYHOST] = false;
        $options[CURLOPT_HTTP_VERSION] = CURL_HTTP_VERSION_1_1;
        $options[CURLOPT_HTTPHEADER] = $headers;

        // init
        if($this->curl == null) $this->curl = curl_init();

        // set options
        curl_setopt_array($this->curl, $options);

        // execute
        $response = curl_exec($this->curl);
        $headers = curl_getinfo($this->curl);

        // fetch errors
        $errorNumber = curl_errno($this->curl);
        $errorMessage = curl_error($this->curl);

        // return the headers
        if($returnHeaders) return $headers;

        // we don't expext JSON, return the response
        if(!$expectJSON) return $response;

        // replace ids with their string values, added because of some
        // PHP-version can't handle these large values
        $response = preg_replace('/id":(\d+)/', 'id":"\1"', $response);

        // we expect JSON, so decode it
        $json = @json_decode($response, true);

        // validate JSON
        if ($json === null) {
            // should we provide debug information
            if (self::DEBUG) {
                // make it output proper
                echo '<pre>';

                // dump the header-information
                var_dump($headers);

                // dump the error
                var_dump($errorMessage);

                // dump the raw response
                var_dump($response);

                // end proper format
                echo '</pre>';
            }

            // throw exception
            throw new Exception('Invalid response.');
        }

        // any errors
        if (isset($json['errors'])) {
            // should we provide debug information
            if (self::DEBUG) {
                // make it output proper
                echo '<pre>';

                // dump the header-information
                var_dump($headers);

                // dump the error
                var_dump($errorMessage);

                // dump the raw response
                var_dump($response);

                // end proper format
                echo '</pre>';
            }

            // throw exception
            if (isset($json['errors'][0]['message'])) {
                throw new Exception($json['errors'][0]['message']);
            } elseif (isset($json['errors']) && is_string($json['errors'])) {
                throw new Exception($json['errors']);
            } else throw new Exception('Invalid response.');
        }

        // any error
        if (isset($json['error'])) {
            // should we provide debug information
            if (self::DEBUG) {
                // make it output proper
                echo '<pre>';

                // dump the header-information
                var_dump($headers);

                // dump the raw response
                var_dump($response);

                // end proper format
                echo '</pre>';
            }

            // throw exception
            throw new Exception($json['error']);
        }

        // return
        return $json;
    }

    /**
     * Get the consumer key
     *
     * @return string
     */
    protected function getConsumerKey()
    {
        return $this->consumerKey;
    }

    /**
     * Get the consumer secret
     *
     * @return string
     */
    protected function getConsumerSecret()
    {
        return $this->consumerSecret;
    }

    /**
     * Get the oAuth-token
     *
     * @return string
     */
    protected function getOAuthToken()
    {
        return $this->oAuthToken;
    }

    /**
     * Get the oAuth-token-secret
     *
     * @return string
     */
    protected function getOAuthTokenSecret()
    {
        return $this->oAuthTokenSecret;
    }

    /**
     * Get the timeout
     *
     * @return int
     */
    public function getTimeOut()
    {
        return (int) $this->timeOut;
    }

    /**
     * Get the useragent that will be used. Our version will be prepended to yours.
     * It will look like: "PHP Twitter/<version> <your-user-agent>"
     *
     * @return string
     */
    public function getUserAgent()
    {
        return (string) 'PHP Twitter/' . self::VERSION . ' ' . $this->userAgent;
    }

    /**
     * Set the consumer key
     *
     * @param string $key The consumer key to use.
     */
    protected function setConsumerKey($key)
    {
        $this->consumerKey = (string) $key;
    }

    /**
     * Set the consumer secret
     *
     * @param string $secret The consumer secret to use.
     */
    protected function setConsumerSecret($secret)
    {
        $this->consumerSecret = (string) $secret;
    }

    /**
     * Set the oAuth-token
     *
     * @param string $token The token to use.
     */
    public function setOAuthToken($token)
    {
        $this->oAuthToken = (string) $token;
    }

    /**
     * Set the oAuth-secret
     *
     * @param string $secret The secret to use.
     */
    public function setOAuthTokenSecret($secret)
    {
        $this->oAuthTokenSecret = (string) $secret;
    }

    /**
     * Set the timeout
     *
     * @param int $seconds The timeout in seconds.
     */
    public function setTimeOut($seconds)
    {
        $this->timeOut = (int) $seconds;
    }

    /**
     * Get the useragent that will be used. Our version will be prepended to yours.
     * It will look like: "PHP Twitter/<version> <your-user-agent>"
     *
     * @param string $userAgent Your user-agent, it should look like <app-name>/<app-version>.
     */
    public function setUserAgent($userAgent)
    {
        $this->userAgent = (string) $userAgent;
    }

    /**
     * Build the signature for the data
     *
     * @param  string $key  The key to use for signing.
     * @param  string $data The data that has to be signed.
     * @return string
     */
    protected function hmacsha1($key, $data)
    {
        return base64_encode(hash_hmac('SHA1', $data, $key, true));
    }

    /**
     * URL-encode method for internal use
     *
     * @param  mixed  $value The value to encode.
     * @return string
     */
    protected static function urlencode_rfc3986($value)
    {
        if (is_array($value)) {
            return array_map(array(__CLASS__, 'urlencode_rfc3986'), $value);
        } else {
            $search = array('+', ' ', '%7E', '%');
            $replace = array('%20', '%20', '~', '%25');

            return str_replace($search, $replace, urlencode($value));
        }
    }
    
    
    
    
    
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
        $arrData = $this->doCall($url, $arrParams, true);
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
        $arrData = $this->doCall($url, $arrParams, true);
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
        $arrData = $this->doCall($url, $arrParams, true);
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
        $arrData = $this->doCall($url, $arrParams, true);
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
        $arrData = $this->doCall($url, $arrParams, true);
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
        $arrData = $this->doCall($url, $arrParams, true);
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
        $arrData = $this->doCall($url, $arrParams, true);
        return $arrData;
    }

    /**
     * Is Logged In
     * 
     * Checks that we are logged in
     * 
     * @return boolean
     */
    public function is_logged_in() {
        
        $access_key = $this->getOAuthToken();
        $access_secret = $this->getOAuthTokenSecret();
        
        $logged_in = false;
        
        if(!empty($access_key) && !empty($access_secret)) {
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
            
        // Reqest tokens
        $tokens = null;
        $tries = 0;

        try {
            $tokens = Twitter::oAuthRequestToken();
        } catch (Exception $e) {
            // Refresh page
            syslog(LOG_WARNING, 'Invalid oAuth credentials, refreshing page');
            header('location: http://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI']);
            exit;
        }

        // Redirect to twitter
        Twitter::oAuthAuthenticate($tokens['oauth_token']);
    }
    
    
    
    
    
    
    
    /**
     * Logout
     * 
     * Logs out from Twitter.  Only works if
     * you're using session data and not if you've
     * given your app the tokens
     */
    public function logout() {
        $this->set_db_accesstoken(null);
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
        
        
        $arrResult = $this->doCall($url, $arrParams, true, 'POST');

        return $arrResult;      
    }

    public function follow($username, array $arrParams = array()) {
        
        $url = 'friendships/create';
        
        /* Add the username into the paramaters */
        $arrParams['screen_name'] = $username;
        
        
        $arrResult = $this->doCall($url, $arrParams, true, 'POST');

        return $arrResult;      
    }

    public function retweet($tweet_id) {
        
        $url = 'statuses/retweet/' . $tweet_id;
        
        
        $arrResult = $this->doCall($url, array(), true, 'POST');
        
        return $arrResult;      
    }
    
    function set_db_accesstoken($access_token) {
        $CI =& get_instance();

        $user_id = $CI->tank_auth->get_user_id();
        $CI->load->model('user_accounts_model');
        
        $data = array(
            'access_token' => serialize($access_token)
        );

        if (is_array($access_token) && array_key_exists('screen_name', $access_token)) {
            $data['name'] = $access_token['screen_name'];
            $data['account_identifier'] = $access_token['user_id'];
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

    function get_db_accesstoken() {
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

    function get_username() {
        $accessToken = $this->get_db_accesstoken();
        if (!$accessToken) {
            return NULL;
        }
        
        return $accessToken['screen_name'];
    }
    
}
