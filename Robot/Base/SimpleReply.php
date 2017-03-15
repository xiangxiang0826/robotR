<?php
namespace Robot\Base;
use Fukuball\Jieba\Jieba;

use \GatewayWorker\Lib\Gateway;


class SimpleReply{
    public static function showOutPut($clientId,$text,$msgType)
    {
        $machineName = \Robot\Base\StateManage::getMachine($clientId);

        if($machineName != false){
//            return $machineName::run();
            var_dump($machineName);
            $machine = new $machineName($clientId,$text);
            return $machine->run($clientId,$text);
        }

        $seg_list = Jieba::cut($text);
        var_dump($msgType);
        $answerLib = \Robot\Base\TypeAnalyse::$sentenceLib[$msgType];
        foreach ($answerLib as $item){
            $qArr = array();
            if(!is_array($item['q'])){
                array_push($qArr,$item['q']);
            }
            else{
                $qArr = $item['q'];
            }
            foreach ($qArr as $singleQuesion){
                $item_list = Jieba::cut($singleQuesion);
                $similarity = \Robot\Base\WordCompare::compare($seg_list,$item_list);
                if($similarity >= 0.6){
                    if(array_key_exists('machine',$item)){
                        $machineName = $item['machine'];
                        $nameSpace = "\\Robot\\App\\$machineName\\Index";
                        $machine = new $nameSpace($clientId,$text);
                        \Robot\Base\StateManage::setMachine($clientId,$nameSpace);
                        return $machine->start();
//                    \Robot\Base\StateManage::setMachine($clientId,$nameSpace);
//                    return $nameSpace::begin($clientId,$text);
                    }else {
                        if(is_array($item['n'])){
                            $info = $item['n'][rand(0,count($item['n'])-1)];
                            var_dump($info);
                            \Robot\Base\LogManage::addLog($text,$info);
                            return Gateway::sendToCurrentClient(TemplateManage::getInfo($info));
                        }
                        else{
                            \Robot\Base\LogManage::addLog($text,$item['n']);
                            return Gateway::sendToCurrentClient(TemplateManage::getInfo($item['n']));
                        }
                    }
                }
            }
        }
        if(\Config\GlobalConfig::$useTuring == true){
            $res = self::runCurl($text,$clientId);
            if(!empty($res)){
                \Robot\Base\LogManage::addLog($text,$res);
                return Gateway::sendToCurrentClient(TemplateManage::getInfo($res));

//                return $res;
            }
        }
        $msg = $answerLib[0]['n'][rand(0,count($answerLib[0]['n'])-1)];

        \Robot\Base\LogManage::addLog($text,$msg);
        return Gateway::sendToCurrentClient(TemplateManage::getInfo($msg));

//        return ;
    }


    public static function runCurl($info,$clientId)
    {
        $data = array("key" =>\Config\Turing::$appId, "info" => $info,"loc"=>"ÉîÛÚÊÐ","userid"=>$clientId);
        $data_string = json_encode($data);

        $ch = curl_init('http://www.tuling123.com/openapi/api');
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
        curl_setopt($ch, CURLOPT_POSTFIELDS,$data_string);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER,true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array(
                'Content-Type: application/json',
                'Content-Length: ' . strlen($data_string))
        );


        $result = curl_exec($ch);
        $resArr = json_decode($result,true);
        if($resArr['code'] == 100000){
            return $resArr['text'];
        }
        else{
            return ' ';

        }

    }
}