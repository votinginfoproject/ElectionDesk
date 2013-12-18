<?php
class EndpointBase
{
	protected function convertDates(&$arr)
	{
	    foreach ($arr as $key => &$value)
	    {
	        if (is_string($key) && $key == 'created_at')
	        {
	            if (is_object($value) && get_class($value) == 'MongoDate')
	            {
	                $value = date('Y-m-d H:i:s', $value->sec); 
	            }
	            elseif (is_array($value) && is_object($value[0]))
	            {
	            	$value[0] = date('Y-m-d H:i:s', $value[0]->sec); 
	            }
	        }

	        if (is_array($value))
	        {
	           $this->convertDates($value);
	        }
	    }
	}

	protected function execute()
	{
		header("Content-Type: application/json");
		header("Access-Control-Allow-Origin: *");
	}
}