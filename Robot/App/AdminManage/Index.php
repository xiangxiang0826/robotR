<?php
namespace Robot\App\AdminManage;

use \Robot\Base\CommonApp;

class Index extends CommonApp{
    private static $webJsonPath = '/var/www/robotAdmin/json/';
    private static $webAdminPath = '/robotAdmin/index.html';

    public function run()
    {
        //第一次触发关键词进入当前自动机

        switch (self::$stateArr[$this->clientId]){
//            case 1:
//                Gateway::sendToCurrentClient(TemplateManage::getInfo("欢迎建立管理端，把字段信息给我哈，多个字段空号分割。"));
//                Gateway::sendToCurrentClient(TemplateManage::getInfo("例如：图片 文字 时间"));
//                self::$stateArr[$clientId] = 2;
//                break;
            case 2:
                $res = $this->itemAnalyse($this->msg);
                $fileName = rand(0,10000) . date('YmdH',time()).'.json';

                if(!is_dir(self::$webJsonPath)){
                    mkdir(self::$webJsonPath,'0777',true);
                }
                $fullPath = self::$webJsonPath.$fileName;
                $fp = fopen($fullPath,'w');
                fwrite($fp,$res);
                fclose($fp);
                $tempName = explode('.',$fileName);
                unset(self::$stateArr[$this->clientId]);
                $this->reply("管理端建立OK,face[太开心] a(".self::$webAdminPath."?name={$tempName[0]})[点击查看]");
                $this->end();
                break;
            default:
                break;
        }
    }


    public function start()
    {
        if(!array_key_exists($this->clientId, self::$stateArr)){
            self::$stateArr[$this->clientId] = 2;
        }
        $this->reply("欢迎建立管理端，把字段信息给我哈，多个字段空号分割。");
        $this->reply("例如：图片 文字 时间");

    }

    private function itemAnalyse($text)
    {
        $textArr = explode(' ',$text);
//        $pinyin = new Pinyin();
        $resArr = array('tb'=>'tb'.date('YmdHis',time()),'items'=>array());
        foreach ($textArr as $item){
            $item = trim($item);
            var_dump($item);
            $word = $this->getPinyin($item);
//            $word = $word[0];
            if(strpos($item,'图片') !== false){
                $val = array('type'=>'pic','dsc'=>$item,'name'=>implode('', $word));
            }
            else if(strpos($item,'时间') !== false){
                $val = array('type'=>'time','dsc'=>$item,'name'=>implode('', $word));
            }
            else if(strpos($item,'日期') !== false){
                $val = array('type'=>'date','dsc'=>$item,'name'=>implode('',$word ));
            }
            else{
                $val = array('type'=>'text','dsc'=>$item,'name'=>implode('', $word));
            }
            array_push($resArr['items'], $val);
        }
        return json_encode($resArr);
    }
}