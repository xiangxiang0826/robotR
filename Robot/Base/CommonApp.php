<?php
/**
 * Created by PhpStorm.
 * User: luo
 * Date: 2017/3/7
 * Time: 8:16
 */
namespace Robot\Base;

use \GatewayWorker\Lib\Gateway;
use Overtrue\Pinyin\Pinyin;
use \GatewayWorker\Lib\Db;

abstract class CommonApp{
    protected static $stateArr = array();
    protected $msg;
    protected $clientId;

    public function __construct($clientId,$msg)
    {
        $this->msg = $msg;
        $this->clientId = $clientId;

    }

    abstract public function start();
    abstract public function run();

    public function end()
    {
        \Robot\Base\StateManage::unsetMachine($this->clientId);
        unset(self::$stateArr[$this->clientId]);

    }

    public function reply($res){
        \Robot\Base\LogManage::addLog($this->msg,$res);
        Gateway::sendToCurrentClient(TemplateManage::getInfo($res));
    }

    /*
     * ººÓï×ª»»Æ´Òô
     */
    public function getPinyin($content)
    {
        $pinyin = new Pinyin('Overtrue\Pinyin\MemoryFileDictLoader');
        $contentPinyinArr = $pinyin->convert($content);
        unset($pinyin);
        return $contentPinyinArr;
    }


    public function getInstance($dbName)
    {

        return Db::instance($dbName);


    }


}