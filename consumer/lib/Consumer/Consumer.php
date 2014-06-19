<?php
namespace Consumer;

abstract class Consumer
{
    abstract function consume($filter);

    public function geocode($address)
    {
        $notFound = false;
        $address = trim($address);

        if (empty($address)) {
            return NULL;
        }

        // If address is a coordinate
        if (substr($address, 0, 3) == 'ÜT:') {
            $address = trim(substr($address, 4));
            list($lat, $lon) = explode(',', $address);

            $result = $this->reverse_geocode($lat, $lon);
            $result['lat'] = $lat;
            $result['lon'] = $lon;

            return $result;
        }

        // Look up in cache first
        $m = new \Memcached();
        $m->addServer('localhost', 11211);

        if ($result = $m->get(sha1($address)) && $m->getResultCode() != \Memcached::RES_NOTFOUND) {
            echo 'Loading ' . $address . ' from cache' . PHP_EOL;
            return $result;
        }

        if (GEOCODING_SERVICE == 'GOOGLE') {
            $url = 'http://maps.googleapis.com/maps/api/geocode/json?address='. urlencode($address) .'&sensor=false&key=' . urlencode(GOOGLE_API_KEY);
            $content = @file_get_contents($url);
            if (!$content) {
                return NULL;
            }
            
            $data = json_decode($content);

            if ($data->status != 'OK' || count($data->results) <= 0)
                $notFound = true;

            $result = $data->results[0];

            // Determine state and county
            $state = null;
            $county = null;
            $country = null;

            foreach ($result->address_components as $component) {
                if (in_array('administrative_area_level_1', $component->types)) {
                    $state = $component->short_name;
                } elseif (in_array('country', $component->types)) {
                    $country = $component->short_name;
                } elseif (in_array('administrative_area_level_2', $component->types)) {
                    $county = $component->long_name;
                }
            }

            // Determine location
            $location = $result->geometry->location;
            $lat = $location->lat;
            $lon = $location->lng;
        }
        elseif (GEOCODING_SERVICE == 'GEOCODIO')
        {
            $url = 'http://api.geocod.io/v1/geocode?q='. urlencode($address) .'&api_key=' . urlencode(GEOCODIO_API_KEY);
            
            $content = @file_get_contents($url);
            if (!$content) {
                return NULL;
            }
            
            $data = json_decode($content);

            if (!isset($data->results) || count($data->results) <= 0)
                $notFound = true;

            $result = $data->results[0];

            // Determine state and county
            $state = $result->address_components->state;
            $county = isset($result->address_components->county) ? $result->address_components->county : '';
            $country = 'USA';

            // Determine location
            $lat = $result->location->lat;
            $lon = $result->location->lng;
        }
        else
        {
            throw new Exception('Invalid geocoding service: ' . GEOCODING_SERVICE);
        }

        // Set result
        if (!$notFound) {
            $result = array(
                'lat' => $lat,
                'lon' => $lon,
                'state' => $state,
                'county' => $county,
                'country' => $country,
            );
        }

        // Save in cache
        $m->set(sha1($address), $result);

        return $result;
    }

    public function reverse_geocode($lat, $lon)
    {
        $notFound = false;

        // Look up in cache first
        $m = new \Memcached();
        $m->addServer('localhost', 11211);

        if ($result = $m->get(sha1($lat . $lon)) && $m->getResultCode() != \Memcached::RES_NOTFOUND) {
            return $result;
        }

        if (GEOCODING_SERVICE == 'GOOGLE') {
            $url = 'http://maps.googleapis.com/maps/api/geocode/json?latlng='. $lat .','. $lon .'&sensor=false&key=' . urlencode(GOOGLE_API_KEY);
            $content = @file_get_contents($url);
            if (!$content) {
                return NULL;
            }

            $data = json_decode($content);

            if ($data->status != 'OK' || count($data->results) <= 0)
                $notFound = true;

            $result = $data->results[0];

            // Determine state and county
            $state = null;
            $county = null;
            $country = null;

            foreach ($result->address_components as $component) {
                if (in_array('administrative_area_level_1', $component->types)) {
                    $state = $component->short_name;
                } elseif (in_array('country', $component->types)) {
                    $country = $component->short_name;
                } elseif (in_array('administrative_area_level_2', $component->types)) {
                    $county = $component->long_name;
                }
            }
            
            // Return result
            $result = array(
                'state' => $state,
                'county' => $county,
                'country' => $country,
            );

        }
        elseif (GEOCODING_SERVICE == 'GEOCODIO')
        {
            $url = 'http://api.geocod.io/v1/reverse?q='. $lat .','. $lon .'&api_key=' . urlencode(GEOCODIO_API_KEY);
            
            $content = @file_get_contents($url);
            if (!$content) {
                return NULL;
            }
            
            $data = json_decode($content);

            if (!isset($data->results) || count($data->results) <= 0)
                $notFound = true;

            $result = $data->results[0];

            // Return result
            $result = array(
                'state' => $result->address_components->state,
                'county' => isset($result->address_components->county) ? $result->address_components->county : '',
                'country' => 'USA',
            );
        }
        else
        {
            throw new Exception('Invalid geocoding service: ' . GEOCODING_SERVICE);
        }

        // Save in cache
        $m->set(sha1($lat . $lon), $result);
        print_r($result);

        return $result;
    }
}