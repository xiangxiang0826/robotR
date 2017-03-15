<?php
namespace Robot\App\Translate;
/*
 * 备忘录管理
 * */
use \GatewayWorker\Lib\Db;
use Overtrue\Pinyin\Pinyin;

use \Robot\Base\TemplateManage;
use \Robot\Base\CommonApp;
use \GatewayWorker\Lib\Gateway;

class Index extends CommonApp{

    public function start()
    {
        if(!array_key_exists($this->clientId, self::$stateArr)){
            self::$stateArr[$this->clientId] = 1;
        }
        $this->reply('输入你要翻译的内容哈。');
        return true;
    }

    public function run()
    {
        switch (self::$stateArr[$this->clientId]){
            case 1:
                require_once Root_Path .'/App/Translate/BaiduTransApi.php';

                $res = translate($this->msg,'auto','auto');

                var_dump($res);
                if(is_array($res) && array_key_exists('trans_result',$res)){
                    $this->reply("翻译的结果是：");
                    $this->reply($res['trans_result'][0]['dst']);
                }
                else{
                    $this->reply("额。翻译出问题了。");
                }

                $this->end();
                break;

            default:
                break;
        }
    }

}