<?php
namespace Robot\App\MemoManage;
/*
 * 备忘录管理
 * */
//use \GatewayWorker\Lib\Db;
//use Overtrue\Pinyin\Pinyin;
//
//use \Robot\Base\TemplateManage;
use \Robot\Base\CommonApp;
//use \GatewayWorker\Lib\Gateway;

class Index extends CommonApp{
//    private static $stateArr = array();

    private static $textArr = array();

//    private static $fileMemoPath = '/var/www/memoContent/';

//    private static $webMemoPath = '/memoContent/';

    public function start()
    {
        self::$textArr[$this->clientId] = array();
        //第一次触发关键词进入当前自动机
        if(!array_key_exists($this->clientId, self::$stateArr)){
            $msg = self::judgeType($this->clientId,$this->msg);
            $this->reply($msg);
        }
        return true;
    }

    public function run()
    {
        switch (self::$stateArr[$this->clientId]){
            case 2:
                if(self::judgeEnd($this->msg)){
                    $dbMemo = $this->getInstance('dbMemo');

                    $content = implode('',self::$textArr[$this->clientId]);
//                    $pinyin = new Pinyin('Overtrue\Pinyin\MemoryFileDictLoader');
                    $contentPinyinArr = $this->getPinyin($content);
                    $contentPinyin = implode(' ',$contentPinyinArr);

                    $dbMemo->insert('memoRecord')->cols(array('content'=>$content,'pinyin'=>$contentPinyin))->query();

                    unset(self::$stateArr[$this->clientId]);
                    unset(self::$textArr[$this->clientId]);
                    unset($pinyin);
                    $this->reply("已经记录好了。face[可爱] ");
                    self::end($clientId);
                    return true;
                }
                self::itemAnalyse($this->msg,$this->clientId);
                $this->reply("收到了，还有么？ ");
                break;
            case 3:
                $contentPinyinArr = $this->getPinyin($this->msg);
                $contentPinyin = implode(' ',$contentPinyinArr);

                $sql = "select * from memoRecord where content like '%{$this->msg}%'";

                $dbMemo = $this->getInstance('dbMemo');

                $res = $dbMemo->query($sql);

                unset(self::$textArr[$this->clientId]);

                if(!empty($res)){
                    $this->reply("给您搜索到这些：");
                    foreach ($res as $item){
                        $content = self::generatePage($item);
                        $this->reply("{$content}");
                    }
                }
                else{
                    $this->reply("没有在我的资料库中查到你需要的东西");
                }
                $this->end();
                break;

            default:
                break;
        }
    }

    private static function generatePage($content)
    {
        $htmlContent = htmlspecialchars_decode($content['content']);
        $tpl = file_get_contents(Root_Path.'/App/MemoManage/MemoManage.tpl');
        $html = str_replace('${content}',htmlspecialchars_decode($htmlContent) ,$tpl );
        $html = preg_replace('/img\[(.*)\]/i','<img class="layui-layim-photos" src="${1}">',$html );
        $fullPath = \Robot\App\MemoManage\MemoConfig::$fileMemoPath .'/'. $content['iId'] .'.html';
        if(!is_dir(\Robot\App\MemoManage\MemoConfig::$fileMemoPath)){
            mkdir(\Robot\App\MemoManage\MemoConfig::$fileMemoPath);
        }
        $file = fopen($fullPath,'w');
        fwrite($file,$html );
        fclose($file);

        if(mb_strlen($htmlContent,'utf-8') <= 50){
            var_dump($htmlContent);

            return $htmlContent;
        }
        else{
            $desc = mb_substr($htmlContent, 0,50,'utf-8');
            var_dump($desc);
            $desc = $desc . '...';
            return $desc ." a(".\Robot\App\MemoManage\MemoConfig::$webMemoPath ."{$content['iId']}.html)[查看全文]";
        }



    }

    private static function itemAnalyse($text,$clientId)
    {
        array_push(self::$textArr[$clientId],htmlspecialchars('<p>'.$text.'</p>'));
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
            return "我开始记录啦，把你要记录的直接告诉我哈？";
        }

    }
}