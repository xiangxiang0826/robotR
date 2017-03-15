<?php
namespace Robot\Base;

use \GatewayWorker\Lib\Db;

class LogManage{
    public static function addLog($question,$answer)
    {
        $dbLog = Db::instance('dbLog');
        $dbLog->insert('visitLog')->cols(array('question'=>$question,'answer'=>$answer))->query();
    }

}