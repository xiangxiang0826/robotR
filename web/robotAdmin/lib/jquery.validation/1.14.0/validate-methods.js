/*****************************************************************
                  jQuery Validate��չ��֤����  (linjq)       
*****************************************************************/
$(function(){
    // �ж�����value�Ƿ����0 
    jQuery.validator.addMethod("isIntEqZero", function(value, element) { 
         value=parseInt(value);      
         return this.optional(element) || value==0;       
    }, "��������Ϊ0"); 
      
    // �ж�����value�Ƿ����0
    jQuery.validator.addMethod("isIntGtZero", function(value, element) { 
         value=parseInt(value);      
         return this.optional(element) || value>0;       
    }, "�����������0"); 
      
    // �ж�����value�Ƿ���ڻ����0
    jQuery.validator.addMethod("isIntGteZero", function(value, element) { 
         value=parseInt(value);      
         return this.optional(element) || value>=0;       
    }, "����������ڻ����0");   
    
    // �ж�����value�Ƿ񲻵���0 
    jQuery.validator.addMethod("isIntNEqZero", function(value, element) { 
         value=parseInt(value);      
         return this.optional(element) || value!=0;       
    }, "�������벻����0");  
    
    // �ж�����value�Ƿ�С��0 
    jQuery.validator.addMethod("isIntLtZero", function(value, element) { 
         value=parseInt(value);      
         return this.optional(element) || value<0;       
    }, "��������С��0");  
    
    // �ж�����value�Ƿ�С�ڻ����0 
    jQuery.validator.addMethod("isIntLteZero", function(value, element) { 
         value=parseInt(value);      
         return this.optional(element) || value<=0;       
    }, "��������С�ڻ����0");  
    
    // �жϸ�����value�Ƿ����0 
    jQuery.validator.addMethod("isFloatEqZero", function(value, element) { 
         value=parseFloat(value);      
         return this.optional(element) || value==0;       
    }, "����������Ϊ0"); 
      
    // �жϸ�����value�Ƿ����0
    jQuery.validator.addMethod("isFloatGtZero", function(value, element) { 
         value=parseFloat(value);      
         return this.optional(element) || value>0;       
    }, "�������������0"); 
      
    // �жϸ�����value�Ƿ���ڻ����0
    jQuery.validator.addMethod("isFloatGteZero", function(value, element) { 
         value=parseFloat(value);      
         return this.optional(element) || value>=0;       
    }, "������������ڻ����0");   
    
    // �жϸ�����value�Ƿ񲻵���0 
    jQuery.validator.addMethod("isFloatNEqZero", function(value, element) { 
         value=parseFloat(value);      
         return this.optional(element) || value!=0;       
    }, "���������벻����0");  
    
    // �жϸ�����value�Ƿ�С��0 
    jQuery.validator.addMethod("isFloatLtZero", function(value, element) { 
         value=parseFloat(value);      
         return this.optional(element) || value<0;       
    }, "����������С��0");  
    
    // �жϸ�����value�Ƿ�С�ڻ����0 
    jQuery.validator.addMethod("isFloatLteZero", function(value, element) { 
         value=parseFloat(value);      
         return this.optional(element) || value<=0;       
    }, "����������С�ڻ����0");  
    
    // �жϸ�����  
    jQuery.validator.addMethod("isFloat", function(value, element) {       
         return this.optional(element) || /^[-\+]?\d+(\.\d+)?$/.test(value);       
    }, "ֻ�ܰ������֡�С������ַ�"); 
     
    // ƥ��integer
    jQuery.validator.addMethod("isInteger", function(value, element) {       
         return this.optional(element) || (/^[-\+]?\d+$/.test(value) && parseInt(value)>=0);       
    }, "ƥ��integer");  
     
    // �ж���ֵ���ͣ����������͸�����
    jQuery.validator.addMethod("isNumber", function(value, element) {       
         return this.optional(element) || /^[-\+]?\d+$/.test(value) || /^[-\+]?\d+(\.\d+)?$/.test(value);       
    }, "ƥ����ֵ���ͣ����������͸�����");  
    
    // ֻ������[0-9]����
    jQuery.validator.addMethod("isDigits", function(value, element) {       
         return this.optional(element) || /^\d+$/.test(value);       
    }, "ֻ������0-9����");  
    
    // �ж������ַ� 
    jQuery.validator.addMethod("isChinese", function(value, element) {       
         return this.optional(element) || /^[\u0391-\uFFE5]+$/.test(value);       
    }, "ֻ�ܰ��������ַ���");   
 
    // �ж�Ӣ���ַ� 
    jQuery.validator.addMethod("isEnglish", function(value, element) {       
         return this.optional(element) || /^[A-Za-z]+$/.test(value);       
    }, "ֻ�ܰ���Ӣ���ַ���");   
 
     // �ֻ�������֤    
    jQuery.validator.addMethod("isMobile", function(value, element) {    
      var length = value.length;    
      return this.optional(element) || (length == 11 && /^(((13[0-9]{1})|(15[0-35-9]{1})|(17[0-9]{1})|(18[0-9]{1}))+\d{8})$/.test(value));    
    }, "����ȷ��д�����ֻ����롣");

    // �绰������֤    
    jQuery.validator.addMethod("isPhone", function(value, element) {    
      var tel = /^(\d{3,4}-?)?\d{7,9}$/g;    
      return this.optional(element) || (tel.test(value));    
    }, "����ȷ��д���ĵ绰���롣");

    // ��ϵ�绰(�ֻ�/�绰�Կ�)��֤   
    jQuery.validator.addMethod("isTel", function(value,element) {   
        var length = value.length;   
        var mobile = /^(((13[0-9]{1})|(15[0-35-9]{1})|(17[0-9]{1})|(18[0-9]{1}))+\d{8})$/;
        var tel = /^(\d{3,4}-?)?\d{7,9}$/g;       
        return this.optional(element) || tel.test(value) || (length==11 && mobile.test(value));   
    }, "����ȷ��д������ϵ��ʽ"); 
 
     // ƥ��qq      
    jQuery.validator.addMethod("isQq", function(value, element) {       
         return this.optional(element) || /^[1-9]\d{4,12}$/;       
    }, "ƥ��QQ");   
 
     // ����������֤    
    jQuery.validator.addMethod("isZipCode", function(value, element) {    
      var zip = /^[0-9]{6}$/;    
      return this.optional(element) || (zip.test(value));    
    }, "����ȷ��д�����������롣");  
    
    // ƥ�����룬����ĸ��ͷ��������6-12֮�䣬ֻ�ܰ����ַ������ֺ��»��ߡ�      
    jQuery.validator.addMethod("isPwd", function(value, element) {       
         return this.optional(element) || /^[a-zA-Z]\\w{6,12}$/.test(value);       
    }, "����ĸ��ͷ��������6-12֮�䣬ֻ�ܰ����ַ������ֺ��»��ߡ�");  
    
    // ���֤������֤
    jQuery.validator.addMethod("isIdCardNo", function(value, element) { 
      //var idCard = /^(\d{6})()?(\d{4})(\d{2})(\d{2})(\d{3})(\w)$/;   
      return this.optional(element) || isIdCardNo(value);    
    }, "��������ȷ�����֤���롣"); 

    // IP��ַ��֤   
    jQuery.validator.addMethod("ip", function(value, element) {    
      return this.optional(element) || /^(([1-9]|([1-9]\d)|(1\d\d)|(2([0-4]\d|5[0-5])))\.)(([1-9]|([1-9]\d)|(1\d\d)|(2([0-4]\d|5[0-5])))\.){2}([1-9]|([1-9]\d)|(1\d\d)|(2([0-4]\d|5[0-5])))$/.test(value);    
    }, "����д��ȷ��IP��ַ��");
   
    // �ַ���֤��ֻ�ܰ������ġ�Ӣ�ġ����֡��»��ߵ��ַ���    
    jQuery.validator.addMethod("stringCheck", function(value, element) {       
         return this.optional(element) || /^[a-zA-Z0-9\u4e00-\u9fa5-_]+$/.test(value);       
    }, "ֻ�ܰ������ġ�Ӣ�ġ����֡��»��ߵ��ַ�");   
   
    // ƥ��english  
    jQuery.validator.addMethod("isEnglish", function(value, element) {       
         return this.optional(element) || /^[A-Za-z]+$/.test(value);       
    }, "ƥ��english");   
    
    // ƥ�人��  
    jQuery.validator.addMethod("isChinese", function(value, element) {       
         return this.optional(element) || /^[\u4e00-\u9fa5]+$/.test(value);       
    }, "ƥ�人��");   
    
    // ƥ������(�������ֺ��ַ�) 
    jQuery.validator.addMethod("isChineseChar", function(value, element) {       
         return this.optional(element) || /^[\u0391-\uFFE5]+$/.test(value);       
    }, "ƥ������(�������ֺ��ַ�) "); 
      
    // �ж��Ƿ�Ϊ�Ϸ��ַ�(a-zA-Z0-9-_)
    jQuery.validator.addMethod("isRightfulString", function(value, element) {       
         return this.optional(element) || /^[A-Za-z0-9_-]+$/.test(value);       
    }, "�ж��Ƿ�Ϊ�Ϸ��ַ�(a-zA-Z0-9-_)");   
    
    // �ж��Ƿ������Ӣ�������ַ�����Ӣ��"-_"�ַ���
    jQuery.validator.addMethod("isContainsSpecialChar", function(value, element) {  
         var reg = RegExp(/[(\ )(\`)(\~)(\!)(\@)(\#)(\$)(\%)(\^)(\&)(\*)(\()(\))(\+)(\=)(\|)(\{)(\})(\')(\:)(\;)(\')(',)(\[)(\])(\.)(\<)(\>)(\/)(\?)(\~)(\��)(\@)(\#)(\��)(\%)(\��)(\&)(\*)(\��)(\��)(\��)(\+)(\|)(\{)(\})(\��)(\��)(\��)(\��)(\��)(\��)(\��)(\��)(\��)(\��)(\��)(\��)]+/);   
         return this.optional(element) || !reg.test(value);       
    }, "������Ӣ�������ַ�");
});
//���֤�������֤����
function isIdCardNo(num){ 
��   //if (isNaN(num)) {alert("����Ĳ������֣�"); return false;} 
���� var len = num.length, re; 
���� if (len == 15) 
���� re = new RegExp(/^(\d{6})()?(\d{2})(\d{2})(\d{2})(\d{2})(\w)$/); 
���� else if (len == 18) 
���� re = new RegExp(/^(\d{6})()?(\d{4})(\d{2})(\d{2})(\d{3})(\w)$/); 
���� else {
		//alert("���������λ�����ԡ�"); 
		return false;
	} 
���� var a = num.match(re); 
���� if (a != null) 
���� { 
���� if (len==15) 
���� { 
���� var D = new Date("19"+a[3]+"/"+a[4]+"/"+a[5]); 
���� var B = D.getYear()==a[3]&&(D.getMonth()+1)==a[4]&&D.getDate()==a[5]; 
���� } 
���� else 
���� { 
���� var D = new Date(a[3]+"/"+a[4]+"/"+a[5]); 
���� var B = D.getFullYear()==a[3]&&(D.getMonth()+1)==a[4]&&D.getDate()==a[5]; 
���� } 
���� if (!B) {
		//alert("��������֤�� "+ a[0] +" ��������ڲ��ԡ�"); 
		return false;
	} 
���� } 
���� if(!re.test(num)){
		//alert("���֤���һλֻ�������ֺ���ĸ��");
		return false;
	}
���� return true; 
} 
//���ƺ�У��
function isPlateNo(plateNo){
    var re = /^[\u4e00-\u9fa5]{1}[A-Z]{1}[A-Z_0-9]{5}$/;
    if(re.test(plateNo)){
        return true;
    }
    return false;
}