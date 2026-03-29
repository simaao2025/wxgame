;(function(){
  var _oe=window.onerror;
  window.onerror=function(m,s,l,c,e){
    var ms=String(m);
    if(ms.indexOf('TextView')>-1||ms.indexOf('ImageView')>-1)return true;
    if(_oe)return _oe.apply(this,arguments);
    return false;
  };
  var _ce=console.error;
  console.error=function(){
    var a=Array.prototype.slice.call(arguments);
    if(a.join(' ').indexOf('TextView')>-1||a.join(' ').indexOf('ImageView')>-1)return;
    _ce.apply(console,a);
  };
  var _cw=console.warn;
  console.warn=function(){
    var a=Array.prototype.slice.call(arguments);
    var s=a.join(' ');
    if(s.indexOf('TextView')>-1||s.indexOf('ImageView')>-1)return;
    if(s.indexOf('listeners of event')>-1&&s.indexOf('Canplay')>-1)return;
    _cw.apply(console,a);
  };
  var _sm=['insert','update','remove'];
  var _sv=['Text','Image'];
  var _mk=function(n){return function(o){
    if(o&&typeof o.success==='function')setTimeout(function(){o.success({errMsg:n+':ok'});},0);
    if(o&&typeof o.complete==='function')setTimeout(function(){o.complete({errMsg:n+':ok'});},0);
  };};
  _sm.forEach(function(a){
    _sv.forEach(function(b){
      var k=a+b+'View';
      try{if(!wx[k])wx[k]=_mk(k);}catch(e){}
    });
  });
})();

import './weapp-adapter'

// The real DPR fix is in godot-loader.js (_rsz uses window.innerWidth directly).
// godot-sdk.js forces window.devicePixelRatio>=2 on PC which is correct behavior
// (PC WeChat real DPR is 2). canvas.getContext in weapp-adapter uses windowWidth*dpr
// which gives the correct physical size. No interception needed here.

import './godot-loader'

function _chkUp(){
  var _um=wx.getUpdateManager();
  _um.onCheckForUpdate(function(){});
  _um.onUpdateReady(function(){
    wx.showModal({
      title:'\u66f4\u65b0\u63d0\u793a',
      content:'\u65b0\u7248\u672c\u5df2\u7ecf\u51c6\u5907\u597d\uff0c\u662f\u5426\u91cd\u542f\u5e94\u7528\uff1f',
      success:function(r){if(r.confirm)_um.applyUpdate();}
    });
  });
  _um.onUpdateFailed(function(){});
}
_chkUp();

var _cfg={
  textConfig:{
    firstStartText:'\u9996\u6b21\u542f\u52a8\u00b7\u6b63\u5728\u4e0b\u8f7d\u6e38\u620f\u8d44\u6e90',
    downloadingText:[
      '\u661f\u6d77\u4e16\u754c\u52a0\u8f7d\u4e2d\uff0c\u8bf7\u7a0d\u5019\u2026',
      '\u6b63\u5728\u94fe\u63a5\u661f\u6d77\u4e16\u754c\u2026',
      '\u6d77\u6d6a\u7ffb\u6d8c\uff0c\u8d44\u6e90\u88c5\u8f7d\u4e2d\u2026'
    ],
    compilingText:'\u661f\u6d77\u4e16\u754c\u52a0\u8f7d\u4e2d\u2026',
    initText:'\u626c\u5e06\u8d77\u822a\uff0c\u5373\u5c06\u51fa\u53d1\u2026',
    completeText:'\u8d77\u9501\uff01\u51fa\u6d77\u6355\u9c7c',
    textDuration:1500,
    style:{color:'#d0eeff',fontSize:14}
  },
  barConfig:{
    style:{
      width:260,height:22,
      backgroundColor:'rgba(0,20,50,0.65)',
      foregroundColor:'#00c8ff',
      foregroundColorEnd:'#0066cc',
      glowColor:'rgba(0,200,255,0.5)',
      borderRadius:11,padding:3
    }
  },
  iconConfig:{visible:false,style:{width:74,height:30,bottom:20}},
  creditConfig:{
    text:'Developed by Godot Engine',
    style:{color:'#ffffff',fontSize:11,bottom:22}
  },
  materialConfig:{backgroundImage:'images/background.jpg',backgroundVideo:'',iconImage:''}
};
GameGlobal.godotLoader=new GodotLoader(canvas,_cfg);
