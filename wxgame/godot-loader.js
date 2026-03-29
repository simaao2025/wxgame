var _GL=GameGlobal.GodotLoader=function(){
  var _P='a_position',_T='a_texCoord',_U='u_image',_W2='webgl2';
  var _VS=[
    'attribute vec2 '+_P+';',
    'attribute vec2 '+_T+';',
    'varying vec2 v_texCoord;',
    'void main(){',
    '  gl_Position=vec4('+_P+',0,1);',
    '  v_texCoord=vec2('+_T+'.x,1.0-'+_T+'.y);',
    '}'
  ].join('\n');
  var _FS=[
    'precision highp float;',
    'uniform sampler2D '+_U+';',
    'varying vec2 v_texCoord;',
    'void main(){',
    '  gl_FragColor=texture2D('+_U+',v_texCoord);',
    '}'
  ].join('\n');

  function _Ctor(cv,cfg){
    this._cv=cv;
    this._ov=document.createElement('canvas');
    this._cx=this._ov.getContext('2d');
    this._cf=cfg;
    this.config=cfg;
    this._pg=0;
    this._dp=0;
    this._tx=cfg.textConfig.firstStartText;
    this._bg=null;
    this._ic=null;
    // The weapp-adapter already bakes (windowWidth * realDpr) into window.innerWidth
    // and exports window.devicePixelRatio = 1. So the loader works in physical pixels
    // directly, and pr should always be 1 to avoid double-scaling on any platform.
    this._pr=1;
    this._dd=false;
    this._nr=true;
    this._st=Date.now();
    this._ldImg();
    this._rsz();
    this._wgl();
    var _self=this;
    this._rh=function(){_self._rsz();};
    window.addEventListener('resize',this._rh);
    this._rl=this._rl.bind(this);
    requestAnimationFrame(this._rl);
    this._lge();
  }

  _Ctor.prototype._wgl=function(){
    this._gl=this._cv.getContext(_W2);
    if(!this._gl)return;
    var g=this._gl;
    var vs=this._mkSh(g.VERTEX_SHADER,_VS);
    var fs=this._mkSh(g.FRAGMENT_SHADER,_FS);
    this._prg=this._mkPrg(vs,fs);
    this._aPos=g.getAttribLocation(this._prg,_P);
    this._aTex=g.getAttribLocation(this._prg,_T);
    this._bPos=g.createBuffer();
    g.bindBuffer(g.ARRAY_BUFFER,this._bPos);
    g.bufferData(g.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),g.STATIC_DRAW);
    this._bTex=g.createBuffer();
    g.bindBuffer(g.ARRAY_BUFFER,this._bTex);
    g.bufferData(g.ARRAY_BUFFER,new Float32Array([0,0,1,0,0,1,1,1]),g.STATIC_DRAW);
    this._tex=g.createTexture();
    g.bindTexture(g.TEXTURE_2D,this._tex);
    g.texParameteri(g.TEXTURE_2D,g.TEXTURE_WRAP_S,g.CLAMP_TO_EDGE);
    g.texParameteri(g.TEXTURE_2D,g.TEXTURE_WRAP_T,g.CLAMP_TO_EDGE);
    g.texParameteri(g.TEXTURE_2D,g.TEXTURE_MIN_FILTER,g.LINEAR);
    g.texParameteri(g.TEXTURE_2D,g.TEXTURE_MAG_FILTER,g.LINEAR);
  };

  _Ctor.prototype._mkSh=function(t,src){
    var g=this._gl;
    var sh=g.createShader(t);
    g.shaderSource(sh,src);
    g.compileShader(sh);
    if(!g.getShaderParameter(sh,g.COMPILE_STATUS)){
      g.deleteShader(sh);return null;
    }
    return sh;
  };

  _Ctor.prototype._mkPrg=function(vs,fs){
    var g=this._gl;
    var p=g.createProgram();
    g.attachShader(p,vs);g.attachShader(p,fs);
    g.linkProgram(p);
    if(!g.getProgramParameter(p,g.LINK_STATUS))return null;
    return p;
  };

  _Ctor.prototype._ldImg=function(){
    var mc=this._cf.materialConfig;
    var _self=this;
    if(mc.backgroundImage){
      this._bg=wx.createImage();
      this._bg.src=mc.backgroundImage;
      this._bg.onload=function(){
        _self._bgc=null; // 清除背景缓存，强制下帧重建
        _self._nr=true;
      };
    }
    if(mc.iconImage){
      this._ic=wx.createImage();
      this._ic.src=mc.iconImage;
      this._ic.onload=function(){_self._nr=true;};
    }
  };

  _Ctor.prototype._rsz=function(){
    // window.innerWidth/Height is already normalized by weapp-adapter to physical pixels
    // (windowWidth * realDpr). On PC WeChat, wx.getSystemInfoSync() returns the small
    // logical panel size (e.g. 414x736) which is smaller than the actual render window,
    // causing the canvas to render in only a corner of the panel. Using window.innerWidth
    // directly gives the correct full-panel physical dimensions on all platforms.
    var w=Math.floor(window.innerWidth);
    var h=Math.floor(window.innerHeight);
    // canvas physical size = full physical pixels
    this._cv.width=w;
    this._cv.height=h;
    // CSS logical size = physical size (adapter already exported devicePixelRatio=1,
    // so browser treats 1 CSS px = 1 physical px in this context)
    this._cv.style.width=w+'px';
    this._cv.style.height=h+'px';
    // Recover the real DPR: window.innerWidth is already physical pixels
    // (windowWidth * realDpr), so logical size = innerWidth / realDpr.
    // _rd() draws on _ov in "logical coords * sc" space, then WebGL upscales
    // _ov onto _cv. So _ov must be in logical pixel dimensions and _rs=realDpr.
    var realDpr=1;
    try{
      if(typeof GameGlobal!=='undefined'&&GameGlobal.__weappAdapterRealDpr){
        realDpr=GameGlobal.__weappAdapterRealDpr;
      } else {
        var si=wx.getSystemInfoSync();
        realDpr=si.devicePixelRatio||1;
      }
    }catch(e){}
    // Logical dimensions (design space that _rd() operates in)
    var lw=Math.floor(w/realDpr);
    var lh=Math.floor(h/realDpr);
    var mx=4096,sc=realDpr;
    if(lw*sc>mx||lh*sc>mx)sc=mx/Math.max(lw,lh);
    // _ov is the offscreen canvas that _rd() draws into using logical px * sc
    this._ov.width=Math.floor(lw*sc);
    this._ov.height=Math.floor(lh*sc);
    // _rs is the scale factor passed to _rd() for all design-unit measurements
    this._rs=sc;
    if(this._gl)this._gl.viewport(0,0,this._cv.width,this._cv.height);
    this._nr=true;
  };

  _Ctor.prototype._rl=function(){
    if(this._dd)return;
    var now=Date.now();
    // 限制最高 24fps，减少真机渲染压力
    if(now-this._lt<42){requestAnimationFrame(this._rl);return;}
    this._lt=now;
    var df=this._pg-this._dp;
    if(Math.abs(df)>0.0001){this._dp+=df*0.12;this._nr=true;}
    else if(this._dp!==this._pg){this._dp=this._pg;this._nr=true;}
    // 加载未完成时降低重绘频率：每3帧动画刷新一次
    if(this._dp<1){
      this._afc=(this._afc||0)+1;
      if(this._afc%2===0)this._nr=true;
    }
    if(this._nr){this._rd();this._nr=false;}
    requestAnimationFrame(this._rl);
  };

  _Ctor.prototype._rd=function(){
    var c=this._cx,ov=this._ov;
    var W=ov.width,H=ov.height,sc=this._rs;

    // 背景层：仅在首次或尺寸变化时重绘，缓存到 _bgCache canvas
    if(!this._bgc||this._bgc.width!==W||this._bgc.height!==H){
      this._bgc=document.createElement('canvas');
      this._bgc.width=W;this._bgc.height=H;
      var bc=this._bgc.getContext('2d');
      bc.clearRect(0,0,W,H);
      if(this._bg)bc.drawImage(this._bg,0,0,W,H);
      // 静态蒙层用纯色代替径向渐变，大幅降低开销
      bc.fillStyle='rgba(0,6,18,0.62)';
      bc.fillRect(0,0,W,H);
    }

    c.clearRect(0,0,W,H);
    c.drawImage(this._bgc,0,0);

    var el=(Date.now()-this._st)/1e3;
    var is=this._cf.iconConfig.style;
    var R=46*sc;
    var cx=W/2,cy=H-is.bottom*sc-is.height*sc-30*sc-R-8*sc;
    var thick=9*sc;

    // --- 粒子：用简单实心圆代替 RadialGradient，每帧省去 8 次 gradient 创建 ---
    c.save();
    c.globalAlpha=0.45;
    c.fillStyle='rgba(0,200,255,1)';
    for(var p=0;p<6;p++){
      var ang=el*0.6+p*(Math.PI*2/6);
      var px=cx+Math.cos(ang)*(R+16*sc);
      var py=cy+Math.sin(ang)*(R+16*sc);
      var pr3=2.2*sc*(0.6+0.4*Math.sin(el*2+p));
      c.beginPath();c.arc(px,py,pr3,0,Math.PI*2);c.fill();
    }
    c.globalAlpha=1;
    c.restore();

    // --- 圆环轨道 ---
    c.save();
    c.strokeStyle='rgba(255,255,255,0.1)';
    c.lineWidth=thick;
    c.beginPath();c.arc(cx,cy,R,0,Math.PI*2);c.stroke();
    c.restore();

    // --- 进度弧 ---
    if(this._dp>0){
      var startA=-Math.PI/2;
      var endA=startA+Math.PI*2*this._dp;
      c.save();
      c.shadowColor='rgba(0,200,255,0.7)';
      c.shadowBlur=12*sc;
      // 固定颜色代替每帧 createLinearGradient
      c.strokeStyle='#00ccff';
      c.lineWidth=thick;
      c.lineCap='round';
      c.beginPath();c.arc(cx,cy,R,startA,endA);c.stroke();
      c.restore();
      // 头部亮点：简单实心圆
      var hx=cx+Math.cos(endA)*R,hy=cy+Math.sin(endA)*R;
      c.save();
      c.fillStyle='rgba(200,245,255,0.95)';
      c.beginPath();c.arc(hx,hy,thick*0.7,0,Math.PI*2);c.fill();
      c.restore();
    }

    // --- 圆环内文字 ---
    var pct=Math.round(this._dp*100);
    c.save();
    c.textAlign='center';c.textBaseline='middle';
    c.font='bold '+(Math.round(26*sc))+'px "PingFang SC",sans-serif';
    c.fillStyle='#dff4ff';
    c.shadowColor='rgba(0,160,255,0.7)';c.shadowBlur=8*sc;
    c.fillText(pct+'%',cx,cy);
    c.shadowBlur=0;
    c.font=Math.round(9*sc)+'px sans-serif';
    c.fillStyle='rgba(140,210,255,0.75)';
    c.fillText('LOADING',cx,cy+18*sc);
    c.restore();

    // --- 状态文字 ---
    var tc=this._cf.textConfig;
    c.save();
    c.font='bold '+Math.round(12*sc)+'px "PingFang SC",sans-serif';
    c.fillStyle=tc.style.color;
    c.textAlign='center';c.textBaseline='middle';
    c.shadowColor='rgba(0,80,180,0.8)';c.shadowBlur=5*sc;
    c.fillText(this._tx,cx,cy+R+20*sc);
    c.restore();

    // --- credit ---
    var cc=this._cf.creditConfig;
    if(cc){
      c.save();
      c.font=Math.round(cc.style.fontSize*sc)+'px sans-serif';
      c.fillStyle=cc.style.color;c.globalAlpha=0.45;
      c.textAlign='center';c.textBaseline='middle';
      c.fillText(cc.text,W/2,H-cc.style.bottom*sc);
      c.restore();
    }

    this._wg();
  };

  _Ctor.prototype._rr=function(c,x,y,w,h,r){
    if(w<2*r)r=w/2;if(h<2*r)r=h/2;
    c.beginPath();
    c.moveTo(x+r,y);
    c.arcTo(x+w,y,x+w,y+h,r);
    c.arcTo(x+w,y+h,x,y+h,r);
    c.arcTo(x,y+h,x,y,r);
    c.arcTo(x,y,x+w,y,r);
    c.closePath();c.fill();
  };

  _Ctor.prototype._wg=function(){
    var g=this._gl;
    if(!g)return;
    g.bindTexture(g.TEXTURE_2D,this._tex);
    g.texImage2D(g.TEXTURE_2D,0,g.RGBA,g.RGBA,g.UNSIGNED_BYTE,this._ov);
    g.useProgram(this._prg);
    g.bindBuffer(g.ARRAY_BUFFER,this._bPos);
    g.enableVertexAttribArray(this._aPos);
    g.vertexAttribPointer(this._aPos,2,g.FLOAT,false,0,0);
    g.bindBuffer(g.ARRAY_BUFFER,this._bTex);
    g.enableVertexAttribArray(this._aTex);
    g.vertexAttribPointer(this._aTex,2,g.FLOAT,false,0,0);
    g.drawArrays(g.TRIANGLE_STRIP,0,4);
  };

  _Ctor.prototype.updateProgress=function(p,t){
    this._pg=p;
    if(t)this._tx=t;
    this._nr=true;
  };

  _Ctor.prototype._lge=function(){
    var _self=this;
    var sp=wx.loadSubpackage({
      name:'engine',
      success:function(){
        _self.updateProgress(1,_self._cf.textConfig.initText);
        _self._nr=true;
        setTimeout(function(){},100);
      },
      fail:function(e){console.error('subpackage load failed',e);}
    });
    sp.onProgressUpdate(function(r){
      var raw=r.progress,np=_self._pg;
      if(r.totalBytesExpectedToWrite>0){
        np=r.totalBytesWritten/r.totalBytesExpectedToWrite;
      }else if(typeof raw==='number'){
        if(raw<0||raw>100){if(_self._pg>0.9)np=1.0;}
        else np=raw>1?raw/100:raw;
      }
      if(np>_self._pg)_self.updateProgress(np,_self._cf.textConfig.downloadingText[0]);
    });
  };

  _Ctor.prototype.cleanup=function(){
    this._dd=true;
    window.removeEventListener('resize',this._rh);
    var g=this._gl;
    if(g){
      g.deleteProgram(this._prg);
      g.deleteBuffer(this._bPos);
      g.deleteBuffer(this._bTex);
      g.deleteTexture(this._tex);
    }
  };

  return _Ctor;
}();
