<?php
/*
 * 备忘录管理
 * */
use \GatewayWorker\Lib\Gateway;
use Fukuball\Jieba\Jieba;
use Fukuball\Jieba\Finalseg;

//use \GatewayWorker\Lib\Gateway;
use \GatewayWorker\Lib\Db;
//
//require_once Root_Path . "/pinyin/src/Pinyin.php";
//require_once Root_Path . "/pinyin/src/MemoryFileDictLoader.php";

// define('Web_Json_Path','/var/www/html/robotAdmin/json/');
// define('Web_Admin_Path','http://119.29.2.112/robotAdmin/index.html');
use Overtrue\Pinyin\Pinyin;
//use Fukuball\Jieba\Jieba;
// define('Web_Json_Path','/var/www/html/robotAdmin/json/');
// define('Web_Admin_Path','http://119.29.2.112/robotAdmin/index.html');
//use Overtrue\Pinyin\Pinyin;
class memoManage{
    private static $stateArr = array();

    private static $textArr = array();

    public static function showOutPut($clientId,$text)
    {
        //第一次触发关键词进入当前自动机
        if(!array_key_exists($clientId, self::$stateArr)){
            self::$textArr[$clientId] = array();
            stateManage::setState($clientId,'memoManage');
            return  self::judgeType($clientId, $text);
        }
        switch (self::$stateArr[$clientId]){
//            case 1:
//                Gateway::sendToCurrentClient(Events::getInfo("我开始记录啦，把你要知道的直接告诉我哈？"));
//                self::$stateArr[$clientId] = 2;
//                break;
            case 2:
                if(self::judgeEnd($text)){
                    stateManage::setState($clientId,'simpleReply');

                    $dbMemo = Db::instance('dbMemo');

                    $content = implode('',self::$textArr[$clientId]);
                    $pinyin = new Pinyin('Overtrue\Pinyin\MemoryFileDictLoader');
                    $contentPinyinArr = $pinyin->convert($content);
                    $contentPinyin = implode(' ',$contentPinyinArr);

                    $dbMemo->insert('memoRecord')->cols(array('content'=>$content,'pinyin'=>$contentPinyin))->query();

                    unset(self::$stateArr[$clientId]);
                    unset(self::$textArr[$clientId]);
                    unset($pinyin);

                    return "已经记录好了。face[可爱] ";
                }
                self::itemAnalyse($text,$clientId);
                return "收到了，还有么？ ";
                break;
            case 3:
                $pinyin = new Pinyin('Overtrue\Pinyin\MemoryFileDictLoader');
                $contentPinyinArr = $pinyin->convert($text);
                $contentPinyin = implode(' ',$contentPinyinArr);

//                $sql = "select * from memoRecord where match(`pinyin`) against('{$contentPinyin}' IN NATURAL LANGUAGE MODE)";
//                $sql = "select * from memoRecord where match(`content`) against('{$text}' IN NATURAL LANGUAGE MODE)";
                $item_list = Jieba::cut($text);
                if(empty($item_list)){
                    return "没有在我的资料库中查到你需要的东西";
                }
                $first = array_pop($item_list);
                $condition = "content like '%{$first}%'";
                foreach ($item_list as $word){
                    $condition .="OR content like '%{$word}%'";

                }
                $sql = "select * from memoRecord where {$condition}";

                var_dump($sql);

                $dbMemo = Db::instance('dbMemo');

                $res = $dbMemo->query($sql);
                stateManage::setState($clientId,'simpleReply');
                unset(self::$stateArr[$clientId]);
                unset(self::$textArr[$clientId]);
                unset($pinyin);

                if(!empty($res)){
                    $returnArr = array('给您搜索到这些：');
                    foreach ($res as $item){
                        array_push($returnArr, self::generatePage($item));
                    }
                    return $returnArr;
                }
                else{
                    return "没有在我的资料库中查到你需要的东西";
                }

                break;

            default:
                break;
        }
    }

    private static function generatePage($content)
    {
        $tpl = file_get_contents(Root_Path.'/automatic/adminManage.tpl');
        $html = str_replace('${content}',$content['content'] ,$tpl );
        $html = preg_replace('/img\[(.*)\]/i','<img class="layui-layim-photos" src="${1}">',$html );
        $fullPath = FILE_MEMO_PATH .'/'. $content['iId'] .'.html';
        if(!is_dir(FILE_MEMO_PATH)){
            mkdir(FILE_MEMO_PATH);
        }
        $file = fopen($fullPath,'w');
        fwrite($file,$html );
        fclose($file);

        if(mb_strlen($content['content'],'utf-8') <= 50){
            return $content['content'];
        }
        else{
            $desc = mb_substr($content['content'], 0,50,'utf-8');
            var_dump($desc);
            $desc = $desc . '...';
            return $desc ." a(".WEB_MEMO_PATH ."{$content['iId']}.html)[查看全文]";
        }



    }

    private static function itemAnalyse($text,$clientId)
    {
        array_push(self::$textArr[$clientId],htmlspecialchars($text));
    }

    private static function judgeEnd($text)
    {
        if(strpos($text,'没有了') !== false){
            return true;
        }
        else {
            return false;
        }
    }

    private static function judgeType($clientId,$text)
    {
        if(strpos($text, '查') !== false){
            self::$stateArr[$clientId] = 3;
            return "好的，输入你要查询的关键字哈。";
        }
        else{
            self::$stateArr[$clientId] = 2;
            return "我开始记录啦，把你要知道的直接告诉我哈？";
        }

    }
}