<?php
namespace Robot\Base;

class TemplateManage{



    /*
    * ��������
    */
    public static function getInfo($content){
        $msg =  json_encode(array(
            "avatar"=> "/robot/pic/timg.jpg",
            "id"=>-1,
            "type" => "kefu",
            "username" => 'СR',
            "content" => $content
        ));
        return $msg;
    }
}