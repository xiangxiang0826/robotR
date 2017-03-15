
//checkLogin();
(function(){
    //window.parent.pageConfig = false;
    var commonAdmin = {};
    var tempJsonData ={};


    commonAdmin.initList = function () {
        var jsonName = getParentUrlParam('name');
        if(jsonName == ''){
            return false;
        }
        var _url = 'json/'+jsonName+'.json';

        $.getJSON(_url,function (data) {
            tempJsonData = data;
            initHeader(data.items);
            initBody(data);

        })
    }


    function initBody(data) {
        var itemInfo = data.items;
        var _html = '<thead><tr class="text-c">';
        _html = _html +'<th>ID</th>';
        console.log(itemInfo);
        //初始化body头部信息
        for(var item in itemInfo){
            if(itemInfo.hasOwnProperty(item)){
                console.log(itemInfo[item]);
                _html = _html +  '<th>'+itemInfo[item]["dsc"]+'</th>';
            }
        }
        // var _bodyList =
        _html = _html +'</tr></thead><tbody id="list-body"></tbody>';
        $("#item-list").html(_html);
        commonAdmin.getList(itemInfo);
    }
    
    function initHeader() {
        var _html = '<span class="l">';
        // _html = _html + '<a href="javascript:;" onclick="datadel()" class="' +
        //     'btn btn-danger radius"> <i class="Hui-iconfont">&#xe6e2;</i>批量删除 </a> ';
        _html = _html +'<a class="btn btn-primary radius" data-title="添加" href="javascript:commonAdmin.itemAdd()"' +
            '> ' +
            '<i class="Hui-iconfont">&#xe600;</i>添加 </a>';

        _html = _html +'</span>';
        
        $("#header-info").html(_html);
    }
    
    
    commonAdmin.itemAdd = function() {

        var _formHtml = [];
        var _formData = tempJsonData['items'];

        _formHtml.push('<div class="page-container"  id="article-edit">');
        _formHtml.push('<form action="" method="post" class="form form-horizontal" id="form-article-add">');
        var jsonName = getParentUrlParam('name');
        _formHtml.push('<input type="hidden" class="input-text" value="'+jsonName+'"  name="jsonName" >');
        for(var attr in _formData){
            if(!_formData.hasOwnProperty(attr)){
                return false;
            }
            if( _formData[attr]['type'] == 'pic'){
                _formHtml.push('<div class="row cl"> ' +
                    '<label class="form-label col-xs-4 col-sm-2">' +
                    '<span class="c-red"></span>'+_formData[attr]['dsc']+'：</label> ' +
                    '<div class="formControls col-xs-8 col-sm-9"> ' +
                    '<span class="btn-upload form-group"> ' +
                    '<input placeholder="'+_formData[attr]['dsc']+'" class="input-text upload-url" type="text" name="'+name+'" value="" readonly nullmsg="请添加附件！" style="width:400px"> ' +
                    '<a href="javascript:void(0);" class="btn btn-primary radius upload-btn"><i class="Hui-iconfont">&#xe642;</i> 浏览图片</a>' +
                    ' <input type="file" multiple name="'+_formData[attr]['name']+'" class="input-file" accept="image/gif,image/jpeg,image/jpg,image/png"> </span> </div> </div>')
            }
            if( _formData[attr]['type'] == 'text'){
                _formHtml.push('<div class="row cl"> <label class="form-label col-xs-4 col-sm-2">' +
                    '<span class="c-red"></span>'+_formData[attr]['dsc']+'：</label> ' +
                    '<div class="formControls col-xs-8 col-sm-9"> ' +
                    '<input placeholder="'+_formData[attr]['dsc']+'" type="text" class="input-text" value="" id="'+_formData[attr]['name']+'" name="'+_formData[attr]['name']+'" > ' +
                    '</div> </div>');
            }
            if(_formData[attr]['type'] == 'time' || _formData[attr]['type'] == 'date') {
                _formHtml.push('<div class="row cl"> <label class="form-label col-xs-4 col-sm-2"><span class="c-red"></span>'+_formData[attr]['dsc']+'：' +
                    '</label> <div class="formControls col-xs-8 col-sm-9"> ' +
                    '<input type="text" value="" onfocus="WdatePicker({skin:\'whyGreen\',minDate:\'2006-09-10\',maxDate:\'2018-12-20\'})" name="'+_formData[attr]['name']+'" id="'+_formData[attr]['name']+'-edit" class="input-text Wdate" style="width:180px;"> ' +
                    '</div> </div>');
            }
        }
        _formHtml.push('<div class="row cl"> <div class="col-xs-8 col-sm-9 col-xs-offset-4 col-sm-offset-2"> ' +
            '<button onClick="commonAdmin.article_save_submit();" class="btn btn-primary radius" type="button">' +
            '<i class="Hui-iconfont">&#xe632;</i> 提交</button> ' +
            '<button onClick="layer.closeAll();" class="btn btn-default radius" type="button">' +
            '&nbsp;&nbsp;取消&nbsp;&nbsp;</button> </div> </div> </form></div>');

        // _formHtml.push('')

        console.log('come');
        var index=layer.open({
            type: 1,
            content: _formHtml.join(""), //数组第二项即吸附元素选择器或者DOM
            // area:['1000px','1000px'],
            //moveOut:true,
            scrollbar:true,
            // zIndex:1000,
            //fixed:false,
            success:function(){
            }
        });
        layer.full(index);
        
    }

    /*
     增加文章
     */
    commonAdmin.article_save_submit= function(){

        var formObj = $('#form-article-add')[0];
        var _data = new FormData(formObj);
        var action = 'api/apiArticleEdit.php';
        var index = layer.load(0, {time: 10*10000});
        $.ajax({url:action,type:'POST',data:_data,dataType:'json',contentType:false,cache:false,
            success: function(res){
               console.log(res);
                if(res.ret == 0){
                    layer.msg('添加成功',{icon: 6,time:1000});
                    location.reload();
                }
            },
            processData:false}
        );
    }

    /*
     查询内容列表
     */
    commonAdmin.getList= function(itemsInfo){

        // var formObj = $('#form-article-add')[0];
        // var _data = new FormData(formObj);
        var action = 'api/apiArticleList.php';
        var jsonName = getParentUrlParam('name');

        var index = layer.load(0, {time: 10*10000});
        $.ajax({url:action,
            type:'POST',
            data:{"jsonName":jsonName},
            dataType:'json',contentType:'application/x-www-form-urlencoded',cache:false,
            success: function(res){
                console.log(res);
                layer.close(index);
                var _html = '';
                if(res.ret == 0){

                    for(var i = 0;i<res.data.length;i++){
                        _html = _html +'<tr class="text-c"><td class="text-c">'+res.data[i]['Id']+'</td>';

                        for(var j=0;j<itemsInfo.length;j++){
                            if(itemsInfo[j]['type'] == 'pic'){
                                _html = _html + '<td><a  href="javascript:void(0);"><img width="60" class="product-thumb" src="' +res.data[i][itemsInfo[j]['name']]+'"></a></td>';
                            }
                            if(itemsInfo[j]['type'] == 'text' ||itemsInfo[j]['type'] == 'time'||itemsInfo[j]['type'] == 'date' ){
                                _html = _html +'<td class="text-c">'+res.data[i][itemsInfo[j]['name']]+'</td>';
                            }
                        }
                        _html = _html +'</tr>';
                    }
                }
                // $("#list-body").html(_html);
                $("#item-list tbody").html(_html);
                console.log(_html);
                // return _html;
            }
        }
        );
    }




    function getNameByVal(arr,val){

        for(var i = 0; i < arr.length; i++){
            if(arr[i]['val'] == val){
                return arr[i]['name'];
            }
        }
    }



    /*
     获取链接参数
     */
    function getParentUrlParam(name){
        var tempUrl = window.parent.location.href;
        if(tempUrl.indexOf('?') == -1 ||tempUrl.indexOf(name+'=') == -1 ){
            return '';
        }
        var _query = tempUrl.substr(tempUrl.indexOf('?') +1);
        var _param = _query.split('&');
        for(var i =0; i<_param.length;i++){
            var _pos = _param[i].indexOf('=');
            if(_pos == -1){
                continue;
            }
            var _paramName = _param[i].substring(0,_pos);
            var _paramVal = _param[i].substring(_pos+1);
            if(_paramName == name){
                return _paramVal;
            }
        }
        return '';
    }

    window.commonAdmin = commonAdmin;
})();