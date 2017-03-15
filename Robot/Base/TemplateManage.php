<?php
namespace Robot\Base;

class TemplateManage{



    /*
    * ·¢ËÍÄÚÈİ
    */
    public static function getInfo($content){
        $msg =  json_encode(array(
            "avatar"=> "/robot/pic/timg.jpg",
            "id"=>-1,
            "type" => "kefu",
            "username" => 'Ğ¡R',
            "content" => $content
        ));
        return $msg;
    }
}