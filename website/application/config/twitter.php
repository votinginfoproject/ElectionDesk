<?php if (!defined('BASEPATH')) exit('No direct script access allowed');
/**
 * twitter
 * 
 * Config for Twitter
 *
 * @author Simon Emms <simon@simonemms.com>
 */

/* Access tokens */
$config['twitter'] = array(
    '_tokens' => array(
        'consumer_key' => TWITTER_CONSUMER_KEY,
        'consumer_secret' => TWITTER_CONSUMER_SECRET,
        //'access_key' => TWITTER_ACCESSTOKEN,
        //'access_secret' => TWITTER_ACCESSTOKEN_SECRET
    ),
    '_force_login' => false, /* Do we force the user to login */
    '_token_session' => 'twitter_oauth_tokens', /* Session name */
    '_open_in_new_window' => true, /* Do links in Tweets get opened in a new window (add target="_blank" if true) */
    '_new_window_target' => '_blank',
    '_search_url' => 'http://twitter.com/search?q=%search%', /* Link for searches - '%search% is where the search key lives */
    '_user_url' => 'http://twitter.com/%user%', /* Link for profiles - %user% is where the username lives */
    
    /* Cache method (remember to make /applications/cache writable) or false for no caching */
    '_cache_method' => array(
        'adapter' => 'apc',
        'backup' => 'file',
    ),
    'cache_timeout' => 60, /* Timeout in seconds */
    
    /* Most of these things shouldn't change */
    '_access_token_url' => 'http://api.twitter.com/oauth/access_token',
    '_api_url' => 'http://api.twitter.com/1.1',
    '_authorization_url' => 'http://api.twitter.com/oauth/authorize',
    '_request_token_url' => 'http://api.twitter.com/oauth/request_token',
    '_signature_method' => 'HMAC-SHA1',
    '_version' => '1.0',
    '_method' => 'json',
);

?>