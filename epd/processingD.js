var pxInd,stInd;
var dispW,dispH;
var xhReq,dispX;
var rqPrf,rqMsg;

var prvPx,prvSt;
function ldPrv(){if(xhReq.status!=200){pxInd=prvPx;stInd=prvSt;}}
function svPrv(){prvPx=pxInd;prvSt=stInd;}

function byteToStr(v){return String.fromCharCode((v & 0xF) + 97, ((v >> 4) & 0xF) + 97);}
function wordToStr(v){return byteToStr(v&0xFF) + byteToStr((v>>8)&0xFF);}
//-------------------------------------------
function u_send(cmd,next){
    xhReq.open('POST',rqPrf+cmd, true);
    xhReq.send();
    if(next)stInd++;
    return 0; 
}
//-------------------------------------------
function u_next(){
    lnInd=0;
    pxInd=0;
    u_send('NEXT',true);
}
//-------------------------------------------
function u_done(){
    setInn('logTag','Complete!');
    return u_send('SHOW',true);
}
//-------------------------------------------
function u_loadA(a,k1,k2){
    var x=''+(k1+k2*pxInd/a.length);
    if(x.length>5)x=x.substring(0,5);
    setInn('logTag','Progress: '+x+'%');
     xhReq.open('POST',rqPrf+'LOAD', true);
  xhReq.send(rqMsg+wordToStr(rqMsg.length)+'LOAD');
  if(pxInd>=a.length)stInd++;
  return 0;
}
//-------------------------------------------
function u_loadB(a,k1,k2){
    var x=''+(k1+k2*pxInd/a.length);
    if(x.length>5)x=x.substring(0,5);
    setInn('logTag','Progress: '+x+'%');
    xhReq.open('POST',rqPrf+'LOAD', true);
    xhReq.send(rqMsg+wordToStr(rqMsg.length)+'LOAD');
    if(pxInd>=a.length)stInd++;
    return 0;
}
//-------------------------------------------
function u_dataA(a,c,k1,k2)
{
    rqMsg='';
    svPrv();

    if(c==-1)
    {
        while((pxInd<a.length)&&(rqMsg.length<1500))
        {
            var v=0;

            for (var i=0;i<16;i+=2)
            {
                if(pxInd<a.length)v|=(a[pxInd]<<i);
                pxInd++;
            }

            rqMsg += wordToStr(v);    
        }
    }else{  
        while((pxInd<a.length)&&(rqMsg.length<1500))
        {
           var v=0;

           for (var i=0;i<8;i++)
           {
                if((pxInd<a.length)&&(a[pxInd]!=c))v|=(128>>i);
                pxInd++;
            }

            rqMsg += byteToStr(v);
        }
    }
  
    return u_loadA(a,k1,k2);
}
//-------------------------------------------
function u_dataB(a,k1,k2){
    var x;
    rqMsg='';
    svPrv();

    while(rqMsg.length<1500)
    {
        x=0;

        while(x<122)
        {
            var v=0;
            for (var i=0;(i<8)&&(x<122);i++,x++)if(a[pxInd++]!=0)v|=(128>>i);
            rqMsg += byteToStr(v); 
        }
    }
    
    return u_loadB(a,k1,k2); 
} 
//-------------------------------------------
function uploadImage(){
    var c=getElm('canvas');
    var w=dispW=c.width;
    var h=dispH=c.height;
    var p=c.getContext('2d').getImageData(0,0,w,h);
    var a=new Array(w*h);
    var i=0;
    for(var y=0;y<h;y++)
        for(var x=0;x<w;x++,i++)
            a[i]=getVal(p,i<<2);
    dispX=0;
    pxInd=0;
    stInd=0;
    xhReq=new XMLHttpRequest();
    rqPrf='https://io.adafruit.com/Kahitar/feeds/slider/';
    
    xhReq.open('POST',rqPrf, true, "Kahitar", "98ca2bd016b545b1a366ec0b51fa3573");
    xhReq.send(a);
    return 0;


    var init='EPD';

    if (epdInd==3){  
        xhReq.onload=xhReq.onerror = function(){
            ldPrv();
            if(stInd==0)return u_dataB(a,0,100);
            if(stInd==1)return u_done();
        };
        
        xhReq.open('POST',init, true);
        xhReq.send(byteToStr(epdInd));
        return 0;  
    }

    
    if ((epdInd%3)==0){   
        xhReq.onload=xhReq.onerror=function(){
            ldPrv();
            if(stInd==0)return u_dataA(a,0,0,100);
            if(stInd==1)return u_done();
        };
        
         xhReq.open('POST',init, true);
        xhReq.send(byteToStr(epdInd));
        return 0;     
    }
    
    if (epdInd>=15){  
           
        xhReq.onload=xhReq.onerror=function(){
            ldPrv();
            if(stInd==0)return u_dataA(a,-1,0,100);
            if(stInd==1)return u_done();
        };
        
         xhReq.open('POST',init, true);
        xhReq.send(byteToStr(epdInd));
        return 0;
    }
    else{
        xhReq.onload=xhReq.onerror=function(){
            ldPrv();
            if(stInd==0)return u_dataA(a,(epdInd==1)||(epdInd==12)?-1:0,0,50);
            if(stInd==1)return u_next();
            if(stInd==2)return u_dataA(a,3,50,50); 
            if(stInd==3)return u_done();
         };
         xhReq.open('POST',init, true);
        xhReq.send(byteToStr(epdInd));
        return 0;
    }
}