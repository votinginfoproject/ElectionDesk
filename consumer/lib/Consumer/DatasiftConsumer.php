<?php
namespace Consumer;

class DatasiftConsumer extends Consumer implements DataSift_IStreamConsumerEventHandler
{
    private $user;
    private $filter;

    public function __construct($user)
    {
        $this->user = $user;
    }

    public function consume($filter)
    {
        // Save the filter
        $this->filter = $filter;

        $definition = new DataSift_Definition($this->user, $filter->csdl);

        // Create the consumer
        $consumer = $definition->getConsumer(DataSift_StreamConsumer::TYPE_HTTP, $this);

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
        echo 'Connected'.PHP_EOL;
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
        echo 'Type: '.$interaction['interaction']['type']."\n";
        echo 'Content: '.$interaction['interaction']['content']."\n--\n";

        // Convert all created_at columns to the MongoDate type
        $this->convertDates($interaction);

        $interaction['internal'] = array(
            'filter_id' => $this->filterId
        );

        // Twitter specific operations
        if ($interaction['interaction']['type'] == 'twitter') {
            // If we have a tweet location
            if (array_key_exists('geo', $interaction['twitter'])) {        
                $location = $this->reverse_geocode(
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
            $interaction['internal']['location']['country'] != 'US') {
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
                echo 'STATUS: '.$type.PHP_EOL;
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
        echo 'WARNING: '.$message.PHP_EOL;
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
        echo 'ERROR: '.$message.PHP_EOL;
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
        echo 'Disconnected'.PHP_EOL;
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
        echo PHP_EOL.'Stopped: '.$reason.PHP_EOL.PHP_EOL;
    }
}