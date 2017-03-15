<?php
namespace Robot\Base;

/*
*   文本相似度（余弦定理）
*
*   Author:宋小北（@xiaobeicn）
*
*   参考：
*   http://www.ruanyifeng.com/blog/2013/03/cosine_similarity.html
*       http://my.oschina.net/BreathL/blog/42477
*
*   Use:
*   $obj = new TextSimilarity ($text1, $text2);
*   echo $obj->run();
*/

Class WordCompare{
    /**
     * [排除的词语]
     *
     * @var array
     */
    private static $_excludeArr = array('的','了','和','呢','啊','哦','恩','嗯','吧','呀');

    /**
     * [词语分布数组]
     *
     * @var array
     */
    private static $_words = array();

    /**
     * [分词后的数组一]
     *
     * @var array
     */
    private static $_segList1 = array();

    /**
     * [分词后的数组二]
     *
     * @var array
     */
    private static $_segList2 = array();

    /**
     * [分词两段文字]
     *
     * @param [type] $text1 [description]
     * @param [type] $text2 [description]
     */

    /**
     * [外部调用]
     *
     * @return [type] [description]
     */
    public static function compare($textArr1,$textArr2)
    {
//        $_segList1 = $textArr1;
//        self::$_segList2 = $textArr2;
//        var_dump($textArr1);
//        var_dump($textArr2);
        $tempArr = self::analyse($textArr1,$textArr2);
        $rate =self::handle($tempArr);
//        var_dump($rate);
        return $rate;
    }

    /**
     * [分析两段文字]
     */
    private static function analyse($textArr1,$textArr2)
    {
        $tempArr = array();
        //t1
        foreach($textArr1 as $v){
            if( !in_array($v , self::$_excludeArr) ){
                if( !array_key_exists($v , $tempArr) ){
                    $tempArr[$v] = array(1 , 0);
                }else{
                    $tempArr[$v][0] += 1;
                }
            }
        }

        //t2
        foreach($textArr2 as $v){
            if( !in_array($v , self::$_excludeArr) ){
                if( !array_key_exists($v , $tempArr) ){
                    $tempArr[$v] = array(0 , 1);
                }else{
                    $tempArr[$v][1] += 1;
                }
            }
        }
        return $tempArr;
    }

    /**
     * [处理相似度]
     *
     * @return [type] [description]
     */
    private static function handle($arr)
    {
        $sum = $sumT1 = $sumT2 = 0;
        foreach($arr as $word){
            $sum    += $word[0] * $word[1];
            $sumT1  += pow($word[0],2);
            $sumT2  += pow($word[1],2);
        }

        $rate = $sum / (sqrt($sumT1 * $sumT2));
        return $rate;
    }
}

//var_dump(TextSimilarity::compare(array('你'),array('你') ));
//var_dump(TextSimilarity::compare(array('你'),array('你') ));