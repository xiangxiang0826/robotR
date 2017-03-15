<?php
namespace Robot\Base;

class StateManage{
    private static $clientArr=array();
    
    public static function showOutPut()
    {
        
    }

    /**
     * @return array
     */
    public static function setState($clientId,$state)
    {
        self::$clientArr[$clientId] = $state;
    }

    public static function getState($clientId)
    {
        return self::$clientArr[$clientId];
    }

    public static function setMachine($clientId,$machineName)
    {
        self::$clientArr[$clientId] = array('machineName'=>$machineName,'startTime'=>time());
    }

    public static function getMachine($clientId)
    {
        var_dump($clientId);
        var_dump(self::$clientArr);
        if(array_key_exists($clientId,self::$clientArr)){
            if(self::$clientArr[$clientId]['startTime'] + 300 < time()){
                return false;
            }
            return self::$clientArr[$clientId]['machineName'];
        }
        return false;
    }

    public static function unsetMachine($clientId)
    {
        if(array_key_exists($clientId,self::$clientArr)){
            unset(self::$clientArr[$clientId]);
        }
    }
}