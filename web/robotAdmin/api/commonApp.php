<?php
/**
 * Created by PhpStorm.
 * User: larrylluo
 * Date: 2016/8/23
 * Time: 19:36
 */

require_once "DbConnection.php";
use \robotAdmin\Lib\DbConnection;
class commonApp{

    public function connectDb()
    {
        $db = new DbConnection('localhost',3306,'','','robotAdmin');
        return $db;
    }


    public function checkLogin()
    {

    }


    public function echoApi($code,$msg,$data=''){
//        \Workerman\Protocols\Http::header('Access-Controll-Allow-Methods:POST');
        if(empty($data)){
//            echo ;
            echo ("{\"ret\":$code,\"msg\":\"$msg\",\"data\":\"\"}");
            exit;
        }
//        echo ;
        echo("{\"ret\":$code,\"msg\":\"$msg\",\"data\":$data}");
        exit;
    }


    /*
    * @param array 二维数组
    * return array 去重后的二维数组
    * 对二维数组进行去重
    */
    public function td_array_unique($arr)
    {
        foreach($arr as &$r){
            $r = json_encode($r);
        }
        unset($r);
        array_unique($arr);
        foreach($arr as &$r){
            $r = json_decode($r,true);
        }
        return $arr;

    }

}


if( ! function_exists('array_column'))
{
    function array_column($input, $columnKey, $indexKey = NULL)
    {
        $columnKeyIsNumber = (is_numeric($columnKey)) ? TRUE : FALSE;
        $indexKeyIsNull = (is_null($indexKey)) ? TRUE : FALSE;
        $indexKeyIsNumber = (is_numeric($indexKey)) ? TRUE : FALSE;
        $result = array();

        foreach ((array)$input AS $key => $row)
        {
            if ($columnKeyIsNumber)
            {
                $tmp = array_slice($row, $columnKey, 1);
                $tmp = (is_array($tmp) && !empty($tmp)) ? current($tmp) : NULL;
            }
            else
            {
                $tmp = isset($row[$columnKey]) ? $row[$columnKey] : NULL;
            }
            if ( ! $indexKeyIsNull)
            {
                if ($indexKeyIsNumber)
                {
                    $key = array_slice($row, $indexKey, 1);
                    $key = (is_array($key) && ! empty($key)) ? current($key) : NULL;
                    $key = is_null($key) ? 0 : $key;
                }
                else
                {
                    $key = isset($row[$indexKey]) ? $row[$indexKey] : 0;
                }
            }

            $result[$key] = $tmp;
        }

        return $result;
    }
}