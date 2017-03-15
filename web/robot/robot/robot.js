(function(win, options, undefined){
	//'use strict';
	//系统的一些配置，不通过new robot传参数
	var	hideList = false 										//是否隐藏功能列表
		, cssfix = 'robot-r-'							//css类名前缀
		, cookieKey = 'SMARTNLP_USER'//用户名称的COOKIE键值
        , imgUpdateUrl = 'http://192.168.33.10/robotCommon/picUpload.php' //图片的上传地址
        , imgUpdateType = 'gif|jpg|jpeg|png|bmp'				//图片上传的类型
        , imgMaxSize = 5120

    var feature = {};
	feature.fileapi = $("<input type='file'/>").get(0).files !== undefined;
	feature.formdata = window.FormData !== undefined;
	$.fn.attr2 = $.fn.attr;

	var eventManger = {};

	//html代码转码，用于用户问题，回复不转码

	var _htmlEncode = function(str){
		var s = "";   
		if (str.length == 0) return "";
		s = str.replace(/\'/g, '&#39;');
		s = s.replace(/\"/g, '&quot;');
		s = s.replace(/\>/g, '&gt;');
		s = s.replace(/\</g, '&lt;');
		return s; 
	};


	/*上传准备函数  */
    var methods = {
		/*验证文件格式*/
        checkFile: function (filename) {
            var pos = filename.lastIndexOf(".");
            var str = filename.substring(pos, filename.length);
            var str1 = str.toLowerCase();
            if (typeof options.fileType !== 'string') { options.fileType = "gif|jpg|jpeg|png|bmp"; }
            var re = new RegExp("\.(" + options.fileType + ")$");
            return re.test(str1);
        },
		/*创建表单 */
        createForm: function () {
            var $form = document.createElement("form");
            $form.action = options.uploadUrl;
            $form.method = "post";
            $form.enctype = "multipart/form-data";
            $form.style.display = "none";
            //将表单加当document上，
            document.body.appendChild($form);  //创建表单后一定要加上这句否则得到的form不能上传。document后要加上body,否则火狐下不行。
            return $($form);
        },
        //创建图片
        createImage: function () {
            //不能用 new Image() 来创建图片，否则ie下不能改变img 的宽高
            var img = $(document.createElement("img"));
            img.attr({ "title": "双击图片可删除图片！" });
            if (options.width !== "") {
                img.attr({ "width": options.width });
            }
            if (options.height !== "") {
                img.attr({ "height": options.height });
            }
            return img;
        },
        showImage: function (filePath, $parent) {
            var $img = methods.createImage();
            $parent.find(options.imgSelector).find("img").remove();
            //要先append再给img赋值，否则在ie下不能缩小宽度。
            $img.appendTo($parent.find(options.imgSelector));
            $img.attr("src", filePath);
            this.bindDelete($parent);
        },
        bindDelete: function ($parent) {
            $parent.find(options.imgSelector).find("img").bind("dblclick", function () {
                options.deleteFn($parent, true);
            });
        },
        deleteImage: function ($parent, showMessage) {
            var $fileInput = $parent.find('[type="hidden"]');
            if ($fileInput.val() !== "") {

                var data = $.extend(options.deleteData, { filePath: $fileInput.val(), t: Math.random() });

                $.post(options.deleteUrl, data, function (response) {

                    if (showMessage) { alert(response.MessageContent) }

                    if (response.MessageType == 1) {
                        $fileInput.val("");
                        $parent.find(options.imgSelector).find("img").remove();
                    }
                }, "JSON");
            }
        },
        onload: function ($parent) {
            var hiddenInput = $parent.find('[type="hidden"]');
            if (typeof hiddenInput !== "undefined" && hiddenInput.val() !== "") {
                var img = methods.createImage();
                if ($parent.find(options.imgSelector).find("img").length > 0) { $parent.find(options.imgSelector).find("img").remove(); }
                img.appendTo($parent.find(options.imgSelector));
                img.attr("src", hiddenInput.val());
                methods.bindDelete($parent);
            }
        }
    };

	//监听事件
	var _addEvent = (function() {		
		var _eventCompat = function(event) {
			var type = event.type;
			if (type == 'DOMMouseScroll' || type == 'mousewheel') {
				event.delta = (event.wheelDelta) ? event.wheelDelta / 120 : -(event.detail || 0) / 3;
			}
			if (event.srcElement && !event.target) {
				event.target = event.srcElement;	
			}
			if (!event.preventDefault && event.returnValue !== undefined) {
				event.preventDefault = function() {
					event.returnValue = false;
				};
			};
			return event;
		};
		if (win.addEventListener) {
			return function(el, type, fn, capture) {
				if(!el){
					return false;
				};
				if (type === "mousewheel" && document.mozHidden !== undefined) {
					type = "DOMMouseScroll";
				}
				el.addEventListener(type, function(event) {
					fn.call(this, _eventCompat(event));
				}, capture || false);
			}
		} else if (win.attachEvent) {
			return function(el, type, fn, capture) {
				if(!el){
					return false;
				};
				el.attachEvent("on" + type, function(event) {
					event = event || win.event;
					fn.call(el, _eventCompat(event));	
				});
			}
		}
		return function(){};	
	})();


	//替换字符串左右的空格
	var _trim = function(){
		return this.replace(/(^\s*)|(\s*$)/g, "");
	};


	//日期格式化显示
	var _dateFormat =  function(fmt){
		var o = {
			"M+": this.getMonth() + 1,
			"d+": this.getDate(),
			"h+": this.getHours(),
			"m+": this.getMinutes(),
			"s+": this.getSeconds(),
			"q+": Math.floor((this.getMonth() + 3) / 3),
			"S": this.getMilliseconds()
		};
		if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
		for (var k in o)
		if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
		return fmt;
	};

	//创建Robot对象的HTML
	var _generateHtml = function(source){

		var html = []
			, _u = navigator.userAgent
			, _con = source.con
			, _colors = _con.colors;

		html.push('<div id="robot" class="robot-r" style=";position:fixed;z-index:'+_con.zIndex+';right: -284px;">')

		html.push('<div class="'+ cssfix +'header" onselectstart="return false">');
		html.push('<div class="'+ cssfix +'logo">');
		html.push('<img src="'+ _con.logo +'"/>');
		html.push('<span class="'+cssfix+'name">'+ _con.title +'</span>');
		html.push('<p class="'+cssfix+'sign">'+_con.sign+'</p></div>')
		html.push('<div class="'+ cssfix +'header-nav">');

		html.push('<a href="javascript:void(0);" class="'+ cssfix +'icon-max'+ (_con.ismax ? ' '+ cssfix +'icon-nor' : '') +'"><em class="'+ cssfix +'icon"></em></a>');

		html.push('</div>');
		html.push('</div>');
		//content
		html.push('<div class="'+ cssfix +'content">');
			html.push('<ul class="'+ cssfix +'slide" '+ (!_con.showSideBtn ? 'style="visibility: hidden;"' : '') +'>');
			html.push('<li class="'+ cssfix +'slide-btn" style="background-color:'+_colors.border+';"><a href="javascript:void(0);"><span class="'+ cssfix +'icon"></span>机器人</a></li>');
			html.push('</ul>');
		//左边区域
		html.push('<div class="'+ cssfix +'fl-area" style="'+ (!_con.showLeftPanel ? 'padding-right: 0;' : '') +'">');
		html.push('<div class="'+ cssfix +'nano">');
		html.push('<div class="'+ cssfix +'chat"></div>');
		//html.push('<div class="'+ cssfix +'pane" style="display: block; opacity: 1; visibility: visible;"><div class="'+ cssfix +'slider" style="height: 110px; top: 502px;"></div></div>');
		html.push('</div>');
		html.push('<div class="'+ cssfix +'edit '+ (_isMobile ? cssfix +'box' : '') +'">');
		html.push('<div class="'+ cssfix +'photo" '+ (_isIE ? 'style="display: none;"' : '') +'>');
		html.push(' <a class="'+ cssfix +'btn-emotion" title="发送表情"><i class="iconfont icon-manyi"></i></a></div>');
        html.push('<div class="'+ cssfix +'photo" '+ (_isIE ? 'style="display: none;"' : '') +'>');
        html.push('<input class="'+ cssfix +'file" type="file" name="file" />  <a class="'+ cssfix +'btn-pic" title="发送图片"><i class="iconfont icon-tupian"></i></a></div>');

        html.push('<div class="'+cssfix+'faces-box">' +
            ' <div class="'+cssfix+'faces-content">' +
            ' <div class="'+cssfix+'title"> ' +
            '<ul> ' +
            '<li class="'+cssfix+'title-name">常用表情</li>' +
            '<li class="'+cssfix+'faces-close"><span>&nbsp;</span></li></ul> ' +
            '</div> <div class="'+cssfix+'faces-main"> <ul> ' +
           generateEmotionHtml()+
            ' </ul> </div> </div> <div class="'+cssfix+'face-icon"> </div> </div>');
		html.push('<div class="'+ cssfix +'copy">');

		html.push('<div class="'+ cssfix +'input '+ (_isMobile ? cssfix +'box-flex' : '') +'">');
		html.push('<textarea class="'+ cssfix +'textarea"  style="'+ (_isIE ? 'color:#999;' : '') +'">'+ (_isIE ? _con.placeholder : '') +'</textarea>');
		html.push('</div>');
		html.push('<div class="'+ cssfix +'sub" onselectstart="return false">');
		html.push('<a class="'+ cssfix +'btn-send" style="background-color:'+ _colors.button +'">发送</a>');
		html.push('</div>');
		html.push('</div>');
		html.push('</div>');

		if(_con.showLeftPanel){
			//右侧导航信息
			html.push('<div class="'+ cssfix +'fr-area">');
			html.push('<div class="'+ cssfix +'fr-nav">');
			html.push('<a href="javascript:void(0);" data-index="0" class="'+ cssfix +'on">可以这样和我说</a>');

			html.push('</div>');
			//快捷查询信息显示区域-->');
			html.push('<div class="'+ cssfix +'fr-content">');
			html.push('<div class="'+ cssfix +'fr-panel"><ul>');
			for(var i=0,list = _con.quicks,len = list.length; i<len; i++){
				html.push('<li><a href="javascript:void(0);">'+ list[i] +'</a></li>');
			};
			html.push('</ul>');
			if(!hideList){
				html.push('<ol>');
				for(var i=0,list = _con.tools,len = list.length; i<len; i++){
					html.push('<li><a href="'+ list[i].href +'" target="new"><i style="background-image: url('+ list[i].icon +');"></i>'+ list[i].label +'</a></li>');
				};
				html.push('</ol>');
			};
			html.push('</div>');
			html.push('</div>');
			html.push('<ul class="'+ cssfix +'fr-footer">');

			html.push('<div class="'+ cssfix +'big-code"></div>')
			html.push('</ul>');
			html.push('</div>');
		}
		html.push('</div>');
		html.push('</div>');
		// alert(html.join(''));
		return html.join('');
	};

	//ROBOT插件内的变量
	var _isMobile = false										//手机
		, _isPad = false										//平板
		, _isIE = false											//是否低版本IE浏览器
		, _userName = $.cookie(cookieKey)						//从COOKIE里获取用户名称
		, _inited = false 										//是否初始化


	//判断浏览器是否为IE内核
	_isIE = (function(){
		return  /msie/.test(navigator.userAgent.toLowerCase());;
	})();

	var addEvent = function (eventName,obj) {
		new Event(eventName);
		eventManger[eventName] = obj;
    }

    var trigerCustomEvent = function (eventName,data) {
		if(typeof(eventName) == 'undefined'){
			for(var event in eventManger){
                // var eventObj = new CustomEvent(event,{'content':'test'});
				console.log(eventManger[event]);
                var eventObj = new CustomEvent(event, { 'detail': eventManger[event].value.trim() });
                // var eventObj = new CustomEvent(event,{'content':eventManger[event].value});
				eventManger[event].dispatchEvent(eventObj);
			}
		}
		else{
			if(eventManger.hasOwnProperty(eventName)){
                eventManger[event].dispatchEvent(event);
			}
		}
    }

    //表情库
    var faces = function(){
        var alt = ["[微笑]", "[嘻嘻]", "[哈哈]", "[可爱]", "[可怜]", "[挖鼻]", "[吃惊]", "[害羞]", "[挤眼]", "[闭嘴]", "[鄙视]", "[爱你]", "[泪]", "[偷笑]", "[亲亲]", "[生病]", "[太开心]", "[白眼]", "[右哼哼]", "[左哼哼]", "[嘘]", "[衰]", "[委屈]", "[吐]", "[哈欠]", "[抱抱]", "[怒]", "[疑问]", "[馋嘴]", "[拜拜]", "[思考]", "[汗]", "[困]", "[睡]", "[钱]", "[失望]", "[酷]", "[色]", "[哼]", "[鼓掌]", "[晕]", "[悲伤]", "[抓狂]", "[黑线]", "[阴险]", "[怒骂]", "[互粉]", "[心]", "[伤心]", "[猪头]", "[熊猫]", "[兔子]", "[ok]", "[耶]", "[good]", "[NO]", "[赞]", "[来]", "[弱]", "[草泥马]", "[神马]", "[囧]", "[浮云]", "[给力]", "[围观]", "[威武]", "[奥特曼]", "[礼物]", "[钟]", "[话筒]", "[蜡烛]", "[蛋糕]"], arr = {};
        $.each(alt, function(index, item){
            arr[item] = 'images/face/'+ index + '.gif';
        });
        return arr;
    }();

    var generateEmotionHtml = function () {
    	var _html = '';
    	for(var i in faces){
    		if(faces.hasOwnProperty(i)){
                _html += '<li><a href="javascript:;"> <img src="'+faces[i]+'" /></a></li>';
            }
        }
        return _html;
    }


    var translateContent = function (content) {
        //支持的html标签
        var html = function(end){
            return new RegExp('\\n*\\['+ (end||'') +'(pre|div|p|table|thead|th|tbody|tr|td|ul|li|ol|li|dl|dt|dd|h2|h3|h4|h5)([\\s\\S]*?)\\]\\n*', 'g');
        };
        content = (content||'').replace(/&(?!#?[a-zA-Z0-9]+;)/g, '&amp;')
            .replace(/@(\S+)(\s+?|$)/g, '@<a href="javascript:;">$1</a>$2') //转义@
            .replace(/\s{2}/g, '&nbsp') //转义空格
            .replace(/img\[([^\s]+?)\]/g, function(img){  //转义图片
                return '<img class="layui-layim-photos" src="' + img.replace(/(^img\[)|(\]$)/g, '') + '">';
            })
            .replace(/file\([\s\S]+?\)\[[\s\S]*?\]/g, function(str){ //转义文件
                var href = (str.match(/file\(([\s\S]+?)\)\[/)||[])[1];
                var text = (str.match(/\)\[([\s\S]*?)\]/)||[])[1];
                if(!href) return str;
                return '<a class="layui-layim-file" href="'+ href +'" download target="_blank"><i class="layui-icon">&#xe61e;</i><cite>'+ (text||href) +'</cite></a>';
            })
            .replace(/face\[([^\s\[\]]+?)\]/g, function(face){  //转义表情
                var alt = face.replace(/^face/g, '');
                return '<img alt="'+ alt +'" title="'+ alt +'" src="' + faces[alt] + '">';
            }).replace(/a\([\s\S]+?\)\[[\s\S]*?\]/g, function(str){ //转义链接
                var href = (str.match(/a\(([\s\S]+?)\)\[/)||[])[1];
                var text = (str.match(/\)\[([\s\S]*?)\]/)||[])[1];
                if(!href) return str;
                return '<a href="'+ href +'" target="_blank">'+ (text||href) +'</a>';
            }).replace(html(), '\<$1 $2\>').replace(html('/'), '\</$1\>') //转移HTML代码
            .replace(/\n/g, '<br>') //转义换行

		return content;

    }
	

	var $robotR = function(config){
		this.con = $.extend({
			/*显示模式，mini侧边，normal默认模式*/
			'mod': 'normal'
			/*初始时是否最大化窗口，normal模式时有效*/
			, 'ismax': false
			/*最小宽度*/
			, 'minWidth': 940
			/*最小高度*/
			, 'minHeight': 576
			/*头部title文本*/
			, 'title': '小R'
			/*快速提交问题列表*/
			, 'quicks': []
			/*左侧工具栏，格式{label: '文本',icon: 'icon图标地址60*60', href:'连接的地址'}*/
			, 'tools': []
			/*浮动层zindex*/
			, 'zindex': 999
			/*是否显示大窗口模式下的左边*/
			, 'showLeftPanel': true
			/*是否显示小窗口模式下的图标按钮*/
			, 'showSideBtn': true
			/*机器人欢迎语*/
			, 'welcome': 'Hi，我是$name'
			/*机器人名字*/
			, 'nick': '小R'
			/*消息发送后文本框是否自动失去焦点*/
			, 'autoblur': false
			, 'logo': 'http://img.alicdn.com/imgextra/i3/TB1UhE3JpXXXXbaXpXXwu0bFXXX.png'
			/*反馈按钮默认颜色*/
			, 'feedBtn': { 'color': '#20a56e'}
			/*客户端用户名*/
			, 'user': _userName
            ,'chatHeight':150
            ,'inputHeight':100
		}, config);
		this.init();
	};

	$robotR.prototype = {
		/*配置对象*/
		'con': {}
		, 'waiting': false
		, 'sendPic': function(){}
		//初始化
		, 'init': function(){
			var _this = this
				, _con = _this.con;
			var $wrap = _this.wrap = $(_generateHtml(_this));
			var $chat = _this.chat = $('.'+ cssfix +'chat', $wrap);
			//var $w = $(win);
			_this.input = $('textarea', $wrap);
			_this.view = $('.'+ cssfix +'nano', $wrap);

			addEvent('sendMessage',_this.input.get(0));
			$('.'+ cssfix +'fr-nav a', $wrap).on('click', $.proxy(_this.tab, _this));
			$('.'+ cssfix +'icon-max,.'+ cssfix +'slide-btn', $wrap).on('click', $.proxy(_this['zoom'], _this));
			$('.'+ cssfix +'btn-send', $wrap).on('click', $.proxy(_this['submit'], _this));
			$('.'+ cssfix +'fr-panel ul a', $wrap).on('click', function(){
				_this.input.val($(this).text());
				_this.submit();
			});
			$('.'+ cssfix +'icon-clo', $wrap).on('click', $.proxy(_this['remod'], _this));
            $('.'+cssfix+'btn-emotion',$wrap).click(function() {
                $('.'+cssfix+'faces-box').show()
            });
				// .mouseout(function() {
            //     $('.'+cssfix+'faces-box').hide()
            // });
            $('.'+cssfix+'faces-box',$wrap).mouseover(function() {
                $('.'+cssfix+'faces-box').show()
            }).mouseout(function() {
                $('.'+cssfix+'faces-box').hide()
            });
            $('.'+cssfix+'faces-close',$wrap).click(function() {
                $('.'+cssfix+'faces-box').hide()
            });

            $('.'+cssfix+'faces-main img',$wrap).click(function() {
                var src = $(this).attr("src");
                var str = '';
                for(var emotion in faces){
                	if(faces.hasOwnProperty(emotion) && faces[emotion] == src){
                		str = 'face'+emotion;
					}
				}
				$(_this.input.val($(_this.input).val() + str));

            });
			$wrap.on('load', '.'+ cssfix +'msg-img', $.proxy(_this.scroll, _this));
			_this.input.on('keyup', function(e){
				e = e || win.event;
				var currKey = e.keyCode || e.which || e.charCode;
				if(currKey == "13" && !e.ctrlKey){
                    return _this.submit();
                };
                if(currKey == "13" && e.ctrlKey){
                	// console.log(_this.input.val());
                    _this.input.val(_this.input.val()+'\r\n');
                    if(_this.input.scroll()){
                    	console.log(_this.input.scroll()[0].scrollHeight);
					}
                    _this.input.scrollTop(_this.input.scroll()[0].scrollHeight);
                };

			}).on('input', function(e){

			}).on('blur', function(e){
				if(_isIE){
					if(this.value === _con.placeholder || this.value === ''){
						this.value = _con.placeholder;
						this.style.color = '#999';
					};
				};
				if(_isPad){
					$wrap.css({'top': 0, "bottom": 'inherit'});
				};
			}).on('focus', function(){
				if(_isIE){
					if(this.value === _con.placeholder){
						this.value = '';
					};
					this.style.color = 'inherit';
				}else if(_isPad){
					$wrap.css({'top': 'inherit', "bottom": 0});
					$('body').scrollTop(10000);
				};

			});

			//禁止鼠标滚轮冒泡
			_addEvent(_this.view.get(0), "mousewheel", function(e){
				var _t = this;
				_t.scrollTop += e.delta < 0 ? 60 : -60;
				e.preventDefault && e.preventDefault();
			});
			_addEvent($wrap.get(0), "mousewheel", function(e){
				e.preventDefault && e.preventDefault();
			});

			$('body').append($wrap);


            //绑定图片上传事件
            _this.upload($('.'+ cssfix +'btn-pic'), {
                'uploadData': { id: "12233" }
                , 'successFn': function(res, statusText, xhr, $this) {
                	// var _this = this;
                    if(res.code == 0){
                    	_this.hidewait();
                        var _str = 'img['+res.data.src+']';
                        console.log(_str);
                        _this.input.val(_this.input.val()+_str);
                        console.log(_this);
                        _this.submit();
                    }

                }
                , 'deleteData': { id: function () { return "asdfasdf" }}
            });
			_this.resize();
			_this.move('.'+ cssfix +'header');
			$(win).resize($.proxy(_this.resize, this));
		},
		'showEmotion':function () {


        }
        , 'showwait': function(text){
            var _this = this;
            _this.waiting = true;
            _this.log(text, true);
        }
        , 'hidewait': function(){
            var _this =  this;
            _this.waiting = false;
            $('.'+ cssfix +'wait', _this.wrap).remove();
        }
        //显示一条提示信息
        , 'log': function(text, wait){
            var _this = this;
            _this.chat.append('<div class="'+ cssfix +'chat-t '+ (!!wait ? cssfix +'wait' : '') +'"><span>'+ text +'</span></div>');
            _this.scroll();
        }
        , 'upload': function($ele, settings){
            var _this = this;

            var options = $.extend({
                fileType: imgUpdateType,					   //允许的文件格式
                uploadUrl: imgUpdateUrl,	  //上传URL地址
                deleteUrl: imgUpdateUrl,	  //删除URL地址
                width: "",											  //图片显示的宽度
                height: 100,											//图片显示的高度
                imgSelector: ".imgdiv",								  //图片选择器
                uploadData: {},										 //上传时需要附加的参数
                deleteData: {},										 //删除时需要附加的参数
                deleteFn: function ($parent, showMessage) {			 //删除图片的方法(默认方法使用POST提交)
                    methods.deleteImage($parent, showMessage);
                },
                beforeSubmitFn: "beforeUpload",						 //上传前执行的方法 原型 beforeSubmit(arr, $form, options);
                successFn: function(res){
                    // alert(1);
                    // console.log(res);
                    // if(res.code == 0){
                		// var _str = 'img['+res.data.src+']';
                		// console.log(_str);
                		// _this.getMsg(_str);
					// }

				},							 //上传成功后执行的方法 uploadSuccess(response, statusText, xhr, $this)
                errorFn: "uploadError"								  //上传失败后执行的方法
            }, settings);

			/*上传准备函数  */
            var methods = {
				/*验证文件格式*/
                checkFile: function (filename) {
                    var pos = filename.lastIndexOf(".");
                    var str = filename.substring(pos, filename.length);
                    var str1 = str.toLowerCase();
                    if (typeof options.fileType !== 'string') { options.fileType = "gif|jpg|jpeg|png|bmp"; }
                    var re = new RegExp("\.(" + options.fileType + ")$");
                    return re.test(str1);
                },
				/*创建表单 */
                createForm: function () {
                    var $form = document.createElement("form");
                    $form.action = options.uploadUrl;
                    $form.method = "post";
                    $form.enctype = "multipart/form-data";
                    $form.style.display = "none";
                    //将表单加当document上，
                    document.body.appendChild($form);  //创建表单后一定要加上这句否则得到的form不能上传。document后要加上body,否则火狐下不行。
                    return $($form);
                },
                //创建图片
                createImage: function () {
                    //不能用 new Image() 来创建图片，否则ie下不能改变img 的宽高
                    var img = $(document.createElement("img"));
                    img.attr({ "title": "双击图片可删除图片！" });
                    if (options.width !== "") {
                        img.attr({ "width": options.width });
                    }
                    if (options.height !== "") {
                        img.attr({ "height": options.height });
                    }
                    return img;
                },
                showImage: function (filePath, $parent) {
                    var $img = methods.createImage();
                    $parent.find(options.imgSelector).find("img").remove();
                    //要先append再给img赋值，否则在ie下不能缩小宽度。
                    $img.appendTo($parent.find(options.imgSelector));
                    $img.attr("src", filePath);
                    this.bindDelete($parent);
                },
                bindDelete: function ($parent) {
                    $parent.find(options.imgSelector).find("img").bind("dblclick", function () {
                        options.deleteFn($parent, true);
                    });
                },
                deleteImage: function ($parent, showMessage) {
                    var $fileInput = $parent.find('[type="hidden"]');
                    if ($fileInput.val() !== "") {

                        var data = $.extend(options.deleteData, { filePath: $fileInput.val(), t: Math.random() });

                        $.post(options.deleteUrl, data, function (response) {

                            if (showMessage) { alert(response.MessageContent) }

                            if (response.MessageType == 1) {
                                $fileInput.val("");
                                $parent.find(options.imgSelector).find("img").remove();
                            }
                        }, "JSON");
                    }
                },
                onload: function ($parent) {
                    var hiddenInput = $parent.find('[type="hidden"]');
                    if (typeof hiddenInput !== "undefined" && hiddenInput.val() !== "") {
                        var img = methods.createImage();
                        if ($parent.find(options.imgSelector).find("img").length > 0) { $parent.find(options.imgSelector).find("img").remove(); }
                        img.appendTo($parent.find(options.imgSelector));
                        img.attr("src", hiddenInput.val());
                        methods.bindDelete($parent);
                    }
                }
            };
            $ele.each(function () {
                var $this = $(this);
                var $fileInput = $(this).parent().find('[type="file"]');

                methods.onload($this.parent());

                $this.click(function(){
                    if(!!_this.waiting){
                        return false;
                    };
                    $fileInput.trigger('click');
                });

                $fileInput.change(function(){

                    var fileBox = $fileInput.parent();

                    if ($fileInput.val() === "") {
                        return false;
                    };

                    if ( !_isMobile && !methods.checkFile($fileInput.val())) {
                        alert("图片格式错误，只支持" + options.fileType.replace(/\|/, '，') + "格式。");
                        $fileInput.val("");
                        return false;
                    };

                    try{
                        if($fileInput.get(0)["files"][0].size >= imgMaxSize * 1024){
                            alert("请上传小于 "+ (imgMaxSize > 1024 ? Math.floor(imgMaxSize / 1024) + 'M' : imgMaxSize +'K') +" 的图片");
                            $fileInput.val("");
                            return false;
                        }
                    }catch(e){};
                    _this.showwait('图片上传中…');

                    if ($fileInput.val() !== ""){

                    };

                    var $form = methods.createForm();

                    $fileInput.appendTo($form);

                    $this.attr("disabled", true);

                    var data = {};
                    data.data = options.uploadData;
                    data.type = "POST";
                    data.dataType = "JSON";

                    data.beforeSubmit = function (arr, $form, options) {
                        var beforeSubmitFn;
                        try { beforeSubmitFn = eval(options.beforeSubmitFn) } catch (err) { };
                        if (beforeSubmitFn) {
                            var $result = beforeSubmitFn(arr, $form, options);
                            if (typeof ($result) == "boolean")
                                return $result;
                        };
                    };

                    data.error = function (response, statusText, xhr, $form) {
                        _this.hidewait();
                        _this.log('图片上传失败');
                        $this.attr("disabled", false);
                        $fileInput.val("");
                        var errorFn;

                    };

                    //上传成功
                    data.success = function (response, statusText, xhr, $form) {

                        var successFn = options.successFn;
						// alert(0);
						console.log(successFn);
                        successFn(response);
                        _this.hidewait();
                        $this.attr("disabled", false);
                        $fileInput.val("");

                    };

                    $form.ajaxSubmit(data);
                });
            });
        }

        ,'on':function (eventName,func) {
			// var _this = this;
			if(eventManger.hasOwnProperty(eventName)){
				console.log(eventManger[eventName]);
				eventManger[eventName].addEventListener(eventName,func);
			}
        }
		//提交一条消息
		, 'submit': function(e){
        	console.log(this);
			var _this = this
				, _input = _this.input
				, _val = _trim.call(_input.val());
			if(_val === '' || _val === _this.con.placeholder){
				return;
			};
			console.log(_val);
			// _val = translateContent(_val);
            trigerCustomEvent();
			_this.send(_val);
			_input.val('');

			_input.trigger("blur");

		}
		//最大化对话窗口
		, 'zoom': function(e){
			var _this = this
				, _con = _this.con
				, $ele = $(e.target);
			if(!_inited){
				_inited = true;
			};
			_con.ismax = !_con.ismax;

			$ele.toggleClass(cssfix +'icon-nor');

			_this.resize();
		}
		//滚动对话内容到最后
		, 'scroll': function(){
			var _this = this;

			_this.view.scrollTop(_this.chat.height() - _this.view.height() + 20);

		}
		//发送一条消息
		, 'send': function(text){
			var _this = this;
			if(!!_this.waiting){
				return false;
			};
			if(!text || typeof text !== 'string'){
				return;
			};
			//text = text.replace(/\ /g,'');
			if(text === ""){
				return false;
			};
			console.log(1111111111111);
			console.log(_this.con);
			var _con = _this.con;
			text = translateContent(text);
			var $question = _this.cSendEle({'text': text})
				// , $answer = _this.cReplyEle({'text': '测试'});
			_this.chat.append($question);
			// _this.chat.append($answer);
			_this.scroll();
		},
		'getMsg':function (content) {
            if(content != null){
            	console.log(content);
            content = translateContent(content);
            console.log(content);
                var _this = this;
                $answer = _this.cReplyEle({'text': content});
                _this.chat.append($answer);
                _this.scroll();
			}


        }
		//重置对话窗口大小
		, 'resize': function(){
			var $w = $(win)
				, _this = this
				, _con = _this.con;
			var _w = $w.width()
				, _h = $w.height()
				, _mw = _con.minWidth
				, _mh = _con.minHeight
				, _ismax = _con.ismax;
				if(_ismax){
					var _h2 = _h > _mh ? _h : _mh;
					var _w2 = _w > _mw ? _w : _mw;
                    _this.view.height(_h2 - 192);
                    _this.wrap.css({
                        'height': _h2
                        , 'width': _w2
                        , 'top': _ismax ? 0 : (_h > _mh ? parseInt((_h - _mh) / 2) : 0)
                        , 'left': _ismax ? 0 : (_w > _mw ? parseInt((_w - _mw) / 2) : 0)
                    });
                    $('.'+ cssfix +'fr-content', _this.wrap).height(_h2 - 240);
                    // $('.'+ cssfix +'fr-area', _this.wrap).height(_h2 - 62);
                    $('.'+ cssfix +'fr-area', _this.wrap).height(_h2-65);
                    $('body').css('overflow',_ismax ? 'hidden' : 'auto');
				}
				else {
                    var chatHeight = _this.con.chatHeight;
                    var inputHeight = _this.con.inputHeight;
                    var headerHeight = $('.' + cssfix + 'header', _this.wrap).height();
                    _this.view.height(chatHeight);
                    _this.wrap.css({
                        'height': chatHeight + inputHeight + headerHeight
                        , 'width': _mw
                        , 'top': _ismax ? 0 : (_h > _mh ? parseInt((_h - _mh) / 2) : 0)
                        , 'left': _ismax ? 0 : (_w > _mw ? parseInt((_w - _mw) / 2) : 0)
                    });
                    $('.' + cssfix + 'fr-area', _this.wrap).height(chatHeight + inputHeight);
                    $('.' + cssfix + 'copy', _this.wrap).height(inputHeight);
                    var _submitHeight = $('.'+cssfix+'sub',_this.wrap).height();
                    $('.' + cssfix + 'textarea', _this.wrap).height(inputHeight - $('.'+cssfix+'photo',_this.wrap).height()  -_submitHeight -10);


                    // $('.'+ cssfix +'fr-area', _this.wrap).height(_h2 - 62);
                    // $('.'+ cssfix +'fr-area', _this.wrap).height(_h2-
                    $('body').css('overflow', _ismax ? 'hidden' : 'auto');


                }

			$('.'+ cssfix +'icon-max', _this.wrap)[(_con.ismax ? 'add' : 'remove') +'Class'](cssfix +'icon-nor');
			_this.scroll();
		}
		//拖动
		, move: function(target){
			var _doc = top.document
				, _body = _doc.body
				, $doc = $(_doc)
				, _this = this
				, _con = _this.con
				, $wrap = _this.wrap
				, $target = $(target, $wrap);
			var startX, startY, startL, startT;
			var _x, _y;
			var mouseCoords = function(ev){ 
				if(ev.pageX || ev.pageY){ 
					return {x:ev.pageX, y:ev.pageY}; 
				} 
				return{ 
					x:ev.clientX + _body.scrollLeft - _body.clientLeft, 
					y:ev.clientY + _body.scrollTop - _body.clientTop 
				}; 
			};
			var move = function(e){
				e = e || event;
				var poss = mouseCoords(e);
				var _w = _body.clientWidth;
				var _h = _body.clientHeight;
				_h = _h === 0 ? win.innerHeight : _h;
				var _left = startL + poss.x - startX
					, _top =  startT + poss.y - startY;
				_top = _top > _h - _y ?  _h - _y : _top;
				_top = _top < 0 ? 0 : _top;
				_left = _left > _w - _x ?  _w - _x : _left;
				_left = _left < 0 ? 0 : _left;
				$wrap.css({left: _left,top: _top});
				e.preventDefault && e.preventDefault();
			};
			$doc.on('mouseup', function(e){
				$doc.off('mousemove', move);
				$wrap.css('opacity', 1);
				$target.css('cursor', 'default');
			})
			$target.on('mousedown', function(e){
				if(_con.mod === 'normal' && !_con.ismax){
					e = e || event;
					var poss = mouseCoords(e);
					startX = poss.x;
					startY = poss.y;
					startL = parseInt($wrap.css('left'));
					startT = parseInt($wrap.css('top'));
					$doc.on('mousemove', move);
					$wrap.css('opacity', 0.9);
					_x = $wrap.width();
					_y = $wrap.height();
					$target.css('cursor', 'move');
				};
				e.preventDefault && e.preventDefault();
			});
		}
		//生成发送消息的HTML
		, cSendEle: function(opt){
			var _this = this
				, _con = _this.con;
			var O = $.extend({
				'text': '&nbsp;'
				, 'time': new Date()
				, 'nick': '关心小R的游客'
				, 'encode': false
				, 'img': ''
			}, opt);
			//是否转码输出
			O.text = !O.encode ? O.text : _htmlEncode(O.text);
			var $ele = $('<div class="'+ cssfix +'chat-ask"><div class="'+ cssfix +'chat-headimg"><img src="'+_con.visitImg+'"></div><div class="'+ cssfix +'chat-name">'+ O.nick +' '+ _dateFormat.call(O.time,'hh:mm:ss') +'</div><table class="'+ cssfix +'msg" cellspacing="0" cellpadding="0"><tbody><tr><td class="'+ cssfix +'msg-lt bg-msg-lr"></td><td class="'+ cssfix +'msg-tt bg-msg-tb"></td><td class="'+ cssfix +'msg-rt bg-msg-lr"></td></tr><tr><td class="'+ cssfix +'msg-lm bg-msg-lr"></td><td class="'+ cssfix +'msg-mm">'+ O.text +'</td><td class="'+ cssfix +'msg-rm bg-msg-lr"><span class="bg-msg-lr"></span></td></tr><tr><td class="'+ cssfix +'msg-lb bg-msg-lr"></td><td class="'+ cssfix +'msg-bm bg-msg-tb"></td><td class="'+ cssfix +'msg-rb bg-msg-lr"></td></tr></tbody></table></div>');
			$ele.find('.robot-r-msg-img').each(function(){
				this.onload = function(){
					_this.scroll();
				};
				$(this).click(_imgViews);
			});
			return $ele;
		}
		//生成返回消息的HTML
		, cReplyEle: function(opt){
			var _this = this
				, _con = _this.con;
			var O = $.extend({
				'text': '&nbsp;'
				, 'time': new Date()
				, 'nick': _con.nick
				, 'img': (!!_con.headImg ? '<img src="'+ _con.headImg +'"/>' : '')
			}, opt);
			var $ele = $('<div class="'+ cssfix +'chat-replay"><div class="'+ cssfix +'chat-headimg" >'+ O.img +'</div><div class="'+ cssfix +'chat-name">'+ O.nick +' '+ _dateFormat.call(O.time,'hh:mm:ss') +'</div><table class="'+ cssfix +'msg" cellspacing="0" cellpadding="0"><tbody><tr><td class="bg-msg-lr '+ cssfix +'msg-lt"></td><td class="bg-msg-tb '+ cssfix +'msg-tt"></td><td class="bg-msg-lr '+ cssfix +'msg-rt"></td></tr><tr><td class="bg-msg-lr '+ cssfix +'msg-lm"><span class="bg-msg-lr"></span></td><td class="'+ cssfix +'msg-mm"><div class="'+ cssfix +'htmcont">'+ O.text +'</div></td><td class="bg-msg-lr '+ cssfix +'msg-rm"></td></tr><tr><td class="bg-msg-lr '+ cssfix +'msg-lb"></td><td class="bg-msg-tb '+ cssfix +'msg-bm"></td><td class="bg-msg-lr '+ cssfix +'msg-rb"></td></tr><tr><td></td></tr></tbody></table></div>');
			$ele.find('img').each(function(){
				this.onload = function(){
					_this.scroll();
				};
				// $(this).click(_imgViews);
			});
			return $ele;
		}
	};
	window.$robotR = $robotR;
})(window);