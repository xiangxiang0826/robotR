<?php
namespace Robot\Base;

class TypeAnalyse{
    public static $sentenceLib= array();

    public static function judgeSentenceType($words)
    {
        foreach (self::$sentenceLib['type'] as $singleType){
            if(array_key_exists('keyWords',$singleType)){
                foreach ($singleType['keyWords'] as $wordGroup){
                    if(strpos($words,$wordGroup) !== false){
                        return $singleType['type'];
                    }
                }
                unset($word);
            }

        }
        unset($singleType);
        $lastType = self::$sentenceLib['type'][count(self::$sentenceLib['type']) - 1];
        return $lastType['type'];

    }

    public static function initLan(){
        $configDir = Root_Path . '/ReplyConfig/*.json';
        foreach (glob($configDir) as $file){
            $nameArr = explode('.', $file);
            if(!array_key_exists($nameArr[1],self::$sentenceLib)){
                self::$sentenceLib[$nameArr[1]] = json_decode(file_get_contents($file),true);
            }
        }
    }

}