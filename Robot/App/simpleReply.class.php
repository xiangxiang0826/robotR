<?php
use \GatewayWorker\Lib\Gateway;
use Fukuball\Jieba\Jieba;
use Fukuball\Jieba\Finalseg;
use App\AdminManage;

class simpleReply{
    public static function showOutPut($clientId,$text,$msgType)
    {
        $seg_list = Jieba::cut($text);
//        $sentenceType = self::judgeCentenceType($text);
        $answerLib = Events::$sentenceLib[$msgType];
        var_dump($msgType);
        foreach ($answerLib as $item){
            $item_list = Jieba::cut($item['q']);
            
            $similarity = TextSimilarity::compare($seg_list,$item_list);
//            var_dump($seg_list);
//            var_dump($item_list);
            var_dump($similarity);
            if($similarity >= 0.6){
                if(array_key_exists('machine',$item)){
                    $m = __DIR__;
//                    return App\$item['machine']\$item['machine']::showOutPut($clientId,$text);
                    $machineName = $item['machine'];
                    $nameSpace = "App\\$machineName\\$machineName";
                    return $nameSpace::showOutPut($clientId,$text);
                }else
                {
                    $info = $item['n'][rand(0,count($item['n'])-1)];
                   return $info;
                }

            }
        }
        return $answerLib[0]['n'][rand(0,count($answerLib[0]['n'])-1)];
    }

//    private static function judgeCentenceType($text)
//    {
//        $qKeyWords = array('为啥','?','为什么','吗','呢','什么','是不是','为何','如果','怎样','会怎样','假如','么','是否','对不对','？');
//        foreach ($qKeyWords as $word){
//            if(strpos($text,$word) !== false){
//                return 1;
//            }
//        }
//        return 2;
//
//    }
}