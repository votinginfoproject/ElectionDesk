<?php namespace Consumer;

class GnipConsumer extends Consumer {
    private $filter;
    private $endpoint;
    private $streamLabel = 'Prod';

    public function setEndpoint($endpoint) {
        // Save the endpoint
        $this->endpoint = $endpoint;
    }

    public function consume($filter)
    {
        // Save the filter
        $this->filter = $filter;

        // Update Gnip Filters
        $this->getRules();

        sleep(10);
    }

    private function getRules() {
        $client = new \GuzzleHttp\Client();
        $res = $client->get($this->endpoint . 'rules.json', ['auth' =>  [GNIP_USERNAME, GNIP_PASSWORD]]);
        echo $res->getStatusCode();
        echo $res->getBody();
    }

}