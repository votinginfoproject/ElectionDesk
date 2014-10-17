<?php namespace Consumer;

class DatasiftConsumer extends Consumer implements \DataSift_IStreamConsumerEventHandler {
    private $filter;

    public function consume($filter)
    {
        // Save the filter
        $this->filter = $filter;

        $definition = new \DataSift_Definition(new \DataSift_User(DATASIFT_USERNAME, DATASIFT_API_KEY), $filter->csdl);

        // Create the consumer
        $consumer = $definition->getConsumer(\DataSift_StreamConsumer::TYPE_HTTP, $this);

        // And start consuming (this will block)
        $consumer->consume();
    }

    /**
     * Called when the stream is connected.
     *
     * @param DataSift_StreamConsumer $consumer The consumer sending the event.
     *
     * @return void
     */
    public function onConnect($consumer)
    {
        Log::info('Connected');
    }

    /**
     * Called for each interaction consumed.
     *
     * @param DataSift_StreamConsumer $consumer    The consumer sending the
     *                                             event.
     * @param array                   $interaction The interaction data.
     * @param string                  $hash        The hash of the stream that
     *                                             matched this interaction.
     *
     * @return void
     */
    public function onInteraction($consumer, $interaction, $hash)
    {
        Log::info('Type: '.$interaction['interaction']['type']);

        // Convert all created_at columns to the MongoDate type
        $this->convertDates($interaction);

        $interaction['internal'] = array(
            'filter_id' => $this->filter->id
        );

        // Twitter specific operations
        if ($interaction['interaction']['type'] == 'twitter') {
            // If we have a tweet location
            if (array_key_exists('geo', $interaction['twitter'])) {        
                $location = $this->reverseGeocode(
                    $interaction['twitter']['geo']['latitude'],
                    $interaction['twitter']['geo']['longitude']
                );

                $interaction['internal']['location'] = array(
                    'source' => 'tweet',
                    'coords' => array(
                        $interaction['twitter']['geo']['longitude'],
                        $interaction['twitter']['geo']['latitude']
                    ),
                    'state' => $location['state'],
                    'county' => $location['county'],
                    'country' => $location['country'],
                );

            // Else get lat/lon from users bio location if available
            } elseif (array_key_exists('user', $interaction['twitter']) &&
                array_key_exists('location', $interaction['twitter']['user'])) {
                $location = $this->geocode($interaction['twitter']['user']['location']);

                Log::info('Got tweet with location ' . print_r($location, true));

                if (!is_null($location)) {
                    $interaction['internal']['location'] = array(
                        'source' => 'bio',
                        'coords' => array(
                            (float)$location['lon'],
                            (float)$location['lat']
                        ),
                        'state' => $location['state'],
                        'county' => $location['county'],
                        'country' => $location['country'],
                    );
                }
            }
        }

        // Skip non-american messages, if location is available
        if (array_key_exists('location', $interaction['internal']) &&
            array_key_exists('country', $interaction['internal']['location']) &&
            $interaction['internal']['location']['country'] != 'US' && $interaction['internal']['location']['country'] != 'USA') {
            Log::info('Skipping ' . $interaction['internal']['location']['country']);
            return;
        }

        // Insert interaction into the collection
        Interaction::insert($interaction);
    }

    private function convertDates(&$arr)
    {
        foreach ($arr as $key => &$value)
        {
            if (is_string($key) && $key == 'created_at')
            {
                if (is_string($value))
                {
                    $value = new \MongoDate(strtotime($value));
                }
                elseif (is_array($value))
                {
                    $value[0] = new \MongoDate(strtotime($value[0]));
                }
            }

            if (is_array($value))
            {
               $this->convertDates($value);
            }
        }
    }

    /**
     * Called for each deletion notification consumed.
     *
     * @param DataSift_StreamConsumer $consumer    The consumer sending the
     *                                             event.
     * @param array                   $interaction The interaction data.
     * @param string                  $hash        The hash of the stream that
     *                                             matched this interaction.
     *
     * @return void
     */
    public function onDeleted($consumer, $interaction, $hash)
    {
        // Remove from database (safely)
        Interaction::remove($interaction['interaction']['id']);
    }

    /**
     * Called when a status message is received.
     *
     * @param DataSift_StreamConsumer $consumer    The consumer sending the
     *                                             event.
     * @param string                  $type        The status type.
     * @param array                   $info        The data sent with the
     *                                             status message.
     */
    public function onStatus($consumer, $type, $info)
    {
        switch ($type) {
            default:
                Log::info('STATUS: '.$type);
                break;
        }
    }

    /**
     * Called when a warning occurs or is received down the stream.
     *
     * @param DataSift_StreamConsumer $consumer The consumer sending the event.
     * @param string $message The warning message.
     *
     * @return void
     */
    public function onWarning($consumer, $message)
    {
        Log::info('WARNING: '.$message);
    }

    /**
     * Called when an error occurs or is received down the stream.
     *
     * @param DataSift_StreamConsumer consumer The consumer sending the event.
     * @param string $message The error message.
     *
     * @return void
     */
    public function onError($consumer, $message)
    {
        Log::info('ERROR: '.$message);
    }

    /**
     * Called when the stream is disconnected.
     *
     * @param DataSift_StreamConsumer $consumer The consumer sending the event.
     *
     * @return void
     */
    public function onDisconnect($consumer)
    {
        Log::info('Disconnected');
    }

    /**
     * Called when the consumer stops for some reason.
     *
     * @param DataSift_StreamConsumer consumer The consumer sending the event.
     * @param string $reason The reason the consumer stopped.
     *
     * @return void
     */
    public function onStopped($consumer, $reason)
    {
        Log::info('Stopped: '.$reason);
    }
}