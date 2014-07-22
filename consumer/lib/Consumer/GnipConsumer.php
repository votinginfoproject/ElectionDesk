<?php namespace Consumer;

class GnipConsumer extends Consumer {
    private $filters;
    private $endpoint;
    private $streamLabel = 'Prod';
    private $buffer = '';

    public function setEndpoint($endpoint) {
        // Save the endpoint
        $this->endpoint = $endpoint;
    }

    public function consume($filters)
    {
        // Save the filters
        $this->filters = $filters;

        // Update Gnip Filters
        $this->clearRules();

        Log::info('Consuming stream');
        $this->consumeStream();
    }

    private function consumeStream() {
        $url = 'https://stream.gnip.com/accounts/'. GNIP_ACCOUNT .'/publishers/'. $this->endpoint .'/streams/track/Prod.json';

        $that = $this;
        $callback = function($ch, $data) use ($that) {
            $chunk = trim($data);

            if (empty($chunk)) {
                Log::info('PING!');
            } else {
                Log::info('Got chunk');

                $that->handleChunk($chunk);
            }

            return strlen($data);
        };

        $ch = curl_init();
        curl_setopt_array($ch, array(
            CURLOPT_URL => $url,
            CURLOPT_ENCODING => 'gzip',
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_HTTPAUTH => CURLAUTH_BASIC,
            CURLOPT_USERPWD => GNIP_USERNAME . ':' . GNIP_PASSWORD,
            CURLOPT_WRITEFUNCTION => $callback,
            CURLOPT_BUFFERSIZE => 2000,
            CURLOPT_LOW_SPEED_LIMIT => 1,
            CURLOPT_LOW_SPEED_TIME => 60
            //CURLOPT_VERBOSE => true // uncomment for curl verbosity
        ));

        $running = null;

        $mh = curl_multi_init();
        curl_multi_add_handle($mh, $ch);

        // the event loop
        do {
            curl_multi_select($mh, 1);      // wait for activity
            curl_multi_exec($mh, $running); // perform activity
        } while($running > 0);

        curl_multi_remove_handle($mh, $ch);
        curl_multi_close($mh);
    }

    private function handleChunk($chunk) {
        $this->buffer .= $chunk;

        $lines = explode("\n", $this->buffer);

        foreach ($lines as $index => $line) {
            if (empty($line)) {
                unset($lines[$index]);
            } else {
                $json = json_decode($line);

                if ($json !== null) {
                    unset($lines[$index]);
                    $this->handlePost($json);
                }
            }
        }

        $this->buffer = implode("\n", $lines);
    }

    private function handlePost($post) {
        echo 'Got post!';
        var_dump($post);
        Log::info($post->verb);
    }

    private function clearRules() {
        // Initialize Guzzle client and define rules URL
        $client = new \GuzzleHttp\Client();
        $url = 'https://api.gnip.com/accounts/'. GNIP_ACCOUNT .'/publishers/'. $this->endpoint .'/streams/track/Prod/rules.json';

        // Get existing rules
        Log::info('Fetching existing rules');
        
        try {
            $res = $client->get($url, ['auth' =>  [GNIP_USERNAME, GNIP_PASSWORD]]);
        } catch (\Exception $e) {
            if ($e->hasResponse()) {
                Log::info('Error: ' . $e->getResponse()->getBody());
            } else {
                Log::info('Gnip API Request error');
            }
        }

        // Delete existing rules
        $rules = $res->json();

        if (count($rules['rules']) > 0) {
            Log::info('Deleting existing rules');
            
            try {
                $res = $client->delete($url, ['auth' => [GNIP_USERNAME, GNIP_PASSWORD], 'json' => $rules]);   
            } catch (\Exception $e) {
                if ($e->hasResponse()) {
                    Log::info('Error: ' . $e->getResponse()->getBody());
                } else {
                    Log::info('Gnip API Request error');
                }
            }
        }

        // Add new rules
        Log::info('Adding new rules');
        $rules = ['rules' => []];
        foreach ($this->filters as $filter) {
            $rules['rules'][] = [
                'tag' => $filter->id,
                'value' => str_replace("\n", " ", $filter->query_gnip)
            ];
        }

        try {
            $res = $client->post($url, ['auth' => [GNIP_USERNAME, GNIP_PASSWORD], 'json' => $rules]);
        } catch (\Exception $e) {
            if ($e->hasResponse()) {
                Log::info('Error: ' . $e->getResponse()->getBody());
            } else {
                Log::info('Gnip API Request error');
            }
        }
    }

}