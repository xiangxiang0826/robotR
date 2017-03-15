<?php
/**
 * This file is part of workerman.
 *
 * Licensed under The MIT License
 * For full copyright and license information, please see the MIT-LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @author walkor<walkor@workerman.net>
 * @copyright walkor<walkor@workerman.net>
 * @link http://www.workerman.net/
 * @license http://www.opensource.org/licenses/mit-license.php MIT License
 */

/**
 * 用于检测业务代码死循环或者长时间阻塞等问题
 * 如果发现业务卡死，可以将下面declare打开（去掉//注释），并执行php start.php reload
 * 然后观察一段时间workerman.log看是否有process_timeout异常
 */
//declare(ticks=1);

use \GatewayWorker\Lib\Gateway;

define('Root_Path',dirname(__FILE__));

use Fukuball\Jieba\Jieba;
use Fukuball\Jieba\Finalseg;

/**
 * 主逻辑
 * 主要是处理 onConnect onMessage onClose 三个方法
 * onConnect 和 onClose 如果不需要可以不用实现并删除
 */
class Events
{

    public static $answer;
    public static $qAnswer;

    public static $jiebaInit = false;

    public static $sentenceLib;


   /**
    * 有消息时
    * @param int $client_id
    * @param mixed $message
    */
   public static function onMessage($client_id, $inputMessage)
   {
        // 客户端传递的是json数据
        $message_data = json_decode($inputMessage, true);
        if($message_data["type"] == 'chatMessage'){
            $msgType = \Robot\Base\TypeAnalyse::judgeSentenceType($message_data['data']);
            $msg = Robot\Base\SimpleReply::showOutPut($client_id,$message_data['data'],$msgType);
        }
       else{
           $msg = '我还没有出生，还在努力成长中face[悲伤]  ';
       }
   }
   
   /**
    * 当客户端断开连接时
    * @param integer $client_id 客户端id
    */
   public static function onClose($client_id)
   {

   }

    public static function onConnect($client_id)
    {

        Gateway::sendToCurrentClient(\Robot\Base\TemplateManage::getInfo('我是小R，还在努力成长中。face[嘻嘻] '));

    }


    public static function onWorkerStart()
    {
       
    }

}