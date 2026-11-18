/* Sảnh Văn Phòng AI 3D – dựng từ app Văn Phòng AI (build/mobile-lobby.js), không sửa tay. three.js © mrdoob (MIT) */
(()=>{var Al="169";var Su=0,hc=1,bu=2;var Kr=1,wu=2,Nn=3,Jn=0,je=1,fe=2,En=0,Hi=1,Sr=2,uc=3,fc=4,Tu=5,hi=100,Au=101,Ru=102,Cu=103,Pu=104,Iu=200,Lu=201,Du=202,Uu=203,ta=204,ea=205,Nu=206,Fu=207,zu=208,Ou=209,Hu=210,Bu=211,ku=212,Gu=213,Vu=214,na=0,ia=1,sa=2,Vi=3,ra=4,oa=5,aa=6,la=7,_h=0,Wu=1,Xu=2,$n=0,qu=1,Yu=2,Zu=3,Rl=4,$u=5,Ju=6,Ku=7;var vh=300,Wi=301,Xi=302,ca=303,ha=304,jr=306,Kn=1e3,di=1001,ua=1002,Ke=1003,ju=1004;var Vs=1005;var xn=1006,_o=1007;var pi=1008;var zn=1009,Mh=1010,Eh=1011,ms=1012,Cl=1013,mi=1014,Mn=1015,Is=1016,Pl=1017,Il=1018,qi=1020,Sh=35902,bh=1021,wh=1022,yn=1023,Th=1024,Ah=1025,Bi=1026,Yi=1027,Ll=1028,Dl=1029,Rh=1030,Ul=1031;var Nl=1033,xr=33776,yr=33777,_r=33778,vr=33779,fa=35840,da=35841,pa=35842,ma=35843,ga=36196,xa=37492,ya=37496,_a=37808,va=37809,Ma=37810,Ea=37811,Sa=37812,ba=37813,wa=37814,Ta=37815,Aa=37816,Ra=37817,Ca=37818,Pa=37819,Ia=37820,La=37821,Mr=36492,Da=36494,Ua=36495,Ch=36283,Na=36284,Fa=36285,za=36286;var br=2300,Oa=2301,vo=2302,dc=2400,pc=2401,mc=2402;var Qu=3200,tf=3201;var Ph=0,ef=1,Zn="",xe="srgb",ei="srgb-linear",Fl="display-p3",Qr="display-p3-linear",wr="linear",pe="srgb",Tr="rec709",Ar="p3";var Ei=7680;var gc=519,nf=512,sf=513,rf=514,Ih=515,of=516,af=517,lf=518,cf=519,xc=35044,Lh=35048;var yc="300 es",Fn=2e3,Rr=2001,jn=class{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[t]===void 0&&(n[t]=[]),n[t].indexOf(e)===-1&&n[t].push(e)}hasEventListener(t,e){if(this._listeners===void 0)return!1;let n=this._listeners;return n[t]!==void 0&&n[t].indexOf(e)!==-1}removeEventListener(t,e){if(this._listeners===void 0)return;let s=this._listeners[t];if(s!==void 0){let r=s.indexOf(e);r!==-1&&s.splice(r,1)}}dispatchEvent(t){if(this._listeners===void 0)return;let n=this._listeners[t.type];if(n!==void 0){t.target=this;let s=n.slice(0);for(let r=0,o=s.length;r<o;r++)s[r].call(this,t);t.target=null}}},Oe=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];var Mo=Math.PI/180,Ha=180/Math.PI;function ji(){let i=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Oe[i&255]+Oe[i>>8&255]+Oe[i>>16&255]+Oe[i>>24&255]+"-"+Oe[t&255]+Oe[t>>8&255]+"-"+Oe[t>>16&15|64]+Oe[t>>24&255]+"-"+Oe[e&63|128]+Oe[e>>8&255]+"-"+Oe[e>>16&255]+Oe[e>>24&255]+Oe[n&255]+Oe[n>>8&255]+Oe[n>>16&255]+Oe[n>>24&255]).toLowerCase()}function Fe(i,t,e){return Math.max(t,Math.min(e,i))}function hf(i,t){return(i%t+t)%t}function Eo(i,t,e){return(1-e)*i+e*t}function ns(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("Invalid component type.")}}function Je(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("Invalid component type.")}}var Mt=class i{constructor(t=0,e=0){i.prototype.isVector2=!0,this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){let e=this.x,n=this.y,s=t.elements;return this.x=s[0]*e+s[3]*n+s[6],this.y=s[1]*e+s[4]*n+s[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let n=this.dot(t)/e;return Math.acos(Fe(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,n=this.y-t.y;return e*e+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){let n=Math.cos(e),s=Math.sin(e),r=this.x-t.x,o=this.y-t.y;return this.x=r*n-o*s+t.x,this.y=r*s+o*n+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},te=class i{constructor(t,e,n,s,r,o,a,l,c){i.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,o,a,l,c)}set(t,e,n,s,r,o,a,l,c){let f=this.elements;return f[0]=t,f[1]=s,f[2]=a,f[3]=e,f[4]=r,f[5]=l,f[6]=n,f[7]=o,f[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){let e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],this}extractBasis(t,e,n){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(t){let e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let n=t.elements,s=e.elements,r=this.elements,o=n[0],a=n[3],l=n[6],c=n[1],f=n[4],h=n[7],d=n[2],p=n[5],g=n[8],_=s[0],m=s[3],u=s[6],y=s[1],v=s[4],M=s[7],A=s[2],S=s[5],w=s[8];return r[0]=o*_+a*y+l*A,r[3]=o*m+a*v+l*S,r[6]=o*u+a*M+l*w,r[1]=c*_+f*y+h*A,r[4]=c*m+f*v+h*S,r[7]=c*u+f*M+h*w,r[2]=d*_+p*y+g*A,r[5]=d*m+p*v+g*S,r[8]=d*u+p*M+g*w,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],o=t[4],a=t[5],l=t[6],c=t[7],f=t[8];return e*o*f-e*a*c-n*r*f+n*a*l+s*r*c-s*o*l}invert(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],o=t[4],a=t[5],l=t[6],c=t[7],f=t[8],h=f*o-a*c,d=a*l-f*r,p=c*r-o*l,g=e*h+n*d+s*p;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);let _=1/g;return t[0]=h*_,t[1]=(s*c-f*n)*_,t[2]=(a*n-s*o)*_,t[3]=d*_,t[4]=(f*e-s*l)*_,t[5]=(s*r-a*e)*_,t[6]=p*_,t[7]=(n*l-c*e)*_,t[8]=(o*e-n*r)*_,this}transpose(){let t,e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){let e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,n,s,r,o,a){let l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*o+c*a)+o+t,-s*c,s*l,-s*(-c*o+l*a)+a+e,0,0,1),this}scale(t,e){return this.premultiply(So.makeScale(t,e)),this}rotate(t){return this.premultiply(So.makeRotation(-t)),this}translate(t,e){return this.premultiply(So.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,n,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){let e=this.elements,n=t.elements;for(let s=0;s<9;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<9;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){let n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t}clone(){return new this.constructor().fromArray(this.elements)}},So=new te;function Dh(i){for(let t=i.length-1;t>=0;--t)if(i[t]>=65535)return!0;return!1}function gs(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function uf(){let i=gs("canvas");return i.style.display="block",i}var _c={};function Er(i){i in _c||(_c[i]=!0,console.warn(i))}function ff(i,t,e){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(t,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,e);break;default:n()}}setTimeout(r,e)})}function df(i){let t=i.elements;t[2]=.5*t[2]+.5*t[3],t[6]=.5*t[6]+.5*t[7],t[10]=.5*t[10]+.5*t[11],t[14]=.5*t[14]+.5*t[15]}function pf(i){let t=i.elements;t[11]===-1?(t[10]=-t[10]-1,t[14]=-t[14]):(t[10]=-t[10],t[14]=-t[14]+1)}var vc=new te().set(.8224621,.177538,0,.0331941,.9668058,0,.0170827,.0723974,.9105199),Mc=new te().set(1.2249401,-.2249404,0,-.0420569,1.0420571,0,-.0196376,-.0786361,1.0982735),is={[ei]:{transfer:wr,primaries:Tr,luminanceCoefficients:[.2126,.7152,.0722],toReference:i=>i,fromReference:i=>i},[xe]:{transfer:pe,primaries:Tr,luminanceCoefficients:[.2126,.7152,.0722],toReference:i=>i.convertSRGBToLinear(),fromReference:i=>i.convertLinearToSRGB()},[Qr]:{transfer:wr,primaries:Ar,luminanceCoefficients:[.2289,.6917,.0793],toReference:i=>i.applyMatrix3(Mc),fromReference:i=>i.applyMatrix3(vc)},[Fl]:{transfer:pe,primaries:Ar,luminanceCoefficients:[.2289,.6917,.0793],toReference:i=>i.convertSRGBToLinear().applyMatrix3(Mc),fromReference:i=>i.applyMatrix3(vc).convertLinearToSRGB()}},mf=new Set([ei,Qr]),he={enabled:!0,_workingColorSpace:ei,get workingColorSpace(){return this._workingColorSpace},set workingColorSpace(i){if(!mf.has(i))throw new Error(`Unsupported working color space, "${i}".`);this._workingColorSpace=i},convert:function(i,t,e){if(this.enabled===!1||t===e||!t||!e)return i;let n=is[t].toReference,s=is[e].fromReference;return s(n(i))},fromWorkingColorSpace:function(i,t){return this.convert(i,this._workingColorSpace,t)},toWorkingColorSpace:function(i,t){return this.convert(i,t,this._workingColorSpace)},getPrimaries:function(i){return is[i].primaries},getTransfer:function(i){return i===Zn?wr:is[i].transfer},getLuminanceCoefficients:function(i,t=this._workingColorSpace){return i.fromArray(is[t].luminanceCoefficients)}};function ki(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function bo(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}var Si,Ba=class{static getDataURL(t){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let e;if(t instanceof HTMLCanvasElement)e=t;else{Si===void 0&&(Si=gs("canvas")),Si.width=t.width,Si.height=t.height;let n=Si.getContext("2d");t instanceof ImageData?n.putImageData(t,0,0):n.drawImage(t,0,0,t.width,t.height),e=Si}return e.width>2048||e.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",t),e.toDataURL("image/jpeg",.6)):e.toDataURL("image/png")}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){let e=gs("canvas");e.width=t.width,e.height=t.height;let n=e.getContext("2d");n.drawImage(t,0,0,t.width,t.height);let s=n.getImageData(0,0,t.width,t.height),r=s.data;for(let o=0;o<r.length;o++)r[o]=ki(r[o]/255)*255;return n.putImageData(s,0,0),e}else if(t.data){let e=t.data.slice(0);for(let n=0;n<e.length;n++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[n]=Math.floor(ki(e[n]/255)*255):e[n]=ki(e[n]);return{data:e,width:t.width,height:t.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}},gf=0,Cr=class{constructor(t=null){this.isSource=!0,Object.defineProperty(this,"id",{value:gf++}),this.uuid=ji(),this.data=t,this.dataReady=!0,this.version=0}set needsUpdate(t){t===!0&&this.version++}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];let n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let o=0,a=s.length;o<a;o++)s[o].isDataTexture?r.push(wo(s[o].image)):r.push(wo(s[o]))}else r=wo(s);n.url=r}return e||(t.images[this.uuid]=n),n}};function wo(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?Ba.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}var xf=0,Ve=class i extends jn{constructor(t=i.DEFAULT_IMAGE,e=i.DEFAULT_MAPPING,n=di,s=di,r=xn,o=pi,a=yn,l=zn,c=i.DEFAULT_ANISOTROPY,f=Zn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:xf++}),this.uuid=ji(),this.name="",this.source=new Cr(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new Mt(0,0),this.repeat=new Mt(1,1),this.center=new Mt(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new te,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=f,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(t=null){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];let n={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),e||(t.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==vh)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case Kn:t.x=t.x-Math.floor(t.x);break;case di:t.x=t.x<0?0:1;break;case ua:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case Kn:t.y=t.y-Math.floor(t.y);break;case di:t.y=t.y<0?0:1;break;case ua:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}};Ve.DEFAULT_IMAGE=null;Ve.DEFAULT_MAPPING=vh;Ve.DEFAULT_ANISOTROPY=1;var Me=class i{constructor(t=0,e=0,n=0,s=1){i.prototype.isVector4=!0,this.x=t,this.y=e,this.z=n,this.w=s}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,n,s){return this.x=t,this.y=e,this.z=n,this.w=s,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){let e=this.x,n=this.y,s=this.z,r=this.w,o=t.elements;return this.x=o[0]*e+o[4]*n+o[8]*s+o[12]*r,this.y=o[1]*e+o[5]*n+o[9]*s+o[13]*r,this.z=o[2]*e+o[6]*n+o[10]*s+o[14]*r,this.w=o[3]*e+o[7]*n+o[11]*s+o[15]*r,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);let e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,n,s,r,l=t.elements,c=l[0],f=l[4],h=l[8],d=l[1],p=l[5],g=l[9],_=l[2],m=l[6],u=l[10];if(Math.abs(f-d)<.01&&Math.abs(h-_)<.01&&Math.abs(g-m)<.01){if(Math.abs(f+d)<.1&&Math.abs(h+_)<.1&&Math.abs(g+m)<.1&&Math.abs(c+p+u-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;let v=(c+1)/2,M=(p+1)/2,A=(u+1)/2,S=(f+d)/4,w=(h+_)/4,P=(g+m)/4;return v>M&&v>A?v<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(v),s=S/n,r=w/n):M>A?M<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(M),n=S/s,r=P/s):A<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(A),n=w/r,s=P/r),this.set(n,s,r,e),this}let y=Math.sqrt((m-g)*(m-g)+(h-_)*(h-_)+(d-f)*(d-f));return Math.abs(y)<.001&&(y=1),this.x=(m-g)/y,this.y=(h-_)/y,this.z=(d-f)/y,this.w=Math.acos((c+p+u-1)/2),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this.z=Math.max(t.z,Math.min(e.z,this.z)),this.w=Math.max(t.w,Math.min(e.w,this.w)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this.w=Math.max(t,Math.min(e,this.w)),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this.w=t.w+(e.w-t.w)*n,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},ka=class extends jn{constructor(t=1,e=1,n={}){super(),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=1,this.scissor=new Me(0,0,t,e),this.scissorTest=!1,this.viewport=new Me(0,0,t,e);let s={width:t,height:e,depth:1};n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:xn,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},n);let r=new Ve(s,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace);r.flipY=!1,r.generateMipmaps=n.generateMipmaps,r.internalFormat=n.internalFormat,this.textures=[];let o=n.count;for(let a=0;a<o;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0;this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.depthTexture=n.depthTexture,this.samples=n.samples}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}setSize(t,e,n=1){if(this.width!==t||this.height!==e||this.depth!==n){this.width=t,this.height=e,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=t,this.textures[s].image.height=e,this.textures[s].image.depth=n;this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let n=0,s=t.textures.length;n<s;n++)this.textures[n]=t.textures[n].clone(),this.textures[n].isRenderTargetTexture=!0;let e=Object.assign({},t.texture.image);return this.texture.source=new Cr(e),this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,t.depthTexture!==null&&(this.depthTexture=t.depthTexture.clone()),this.samples=t.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}},On=class extends ka{constructor(t=1,e=1,n={}){super(t,e,n),this.isWebGLRenderTarget=!0}},Pr=class extends Ve{constructor(t=null,e=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=Ke,this.minFilter=Ke,this.wrapR=di,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}};var Ga=class extends Ve{constructor(t=null,e=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=Ke,this.minFilter=Ke,this.wrapR=di,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var We=class{constructor(t=0,e=0,n=0,s=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=n,this._w=s}static slerpFlat(t,e,n,s,r,o,a){let l=n[s+0],c=n[s+1],f=n[s+2],h=n[s+3],d=r[o+0],p=r[o+1],g=r[o+2],_=r[o+3];if(a===0){t[e+0]=l,t[e+1]=c,t[e+2]=f,t[e+3]=h;return}if(a===1){t[e+0]=d,t[e+1]=p,t[e+2]=g,t[e+3]=_;return}if(h!==_||l!==d||c!==p||f!==g){let m=1-a,u=l*d+c*p+f*g+h*_,y=u>=0?1:-1,v=1-u*u;if(v>Number.EPSILON){let A=Math.sqrt(v),S=Math.atan2(A,u*y);m=Math.sin(m*S)/A,a=Math.sin(a*S)/A}let M=a*y;if(l=l*m+d*M,c=c*m+p*M,f=f*m+g*M,h=h*m+_*M,m===1-a){let A=1/Math.sqrt(l*l+c*c+f*f+h*h);l*=A,c*=A,f*=A,h*=A}}t[e]=l,t[e+1]=c,t[e+2]=f,t[e+3]=h}static multiplyQuaternionsFlat(t,e,n,s,r,o){let a=n[s],l=n[s+1],c=n[s+2],f=n[s+3],h=r[o],d=r[o+1],p=r[o+2],g=r[o+3];return t[e]=a*g+f*h+l*p-c*d,t[e+1]=l*g+f*d+c*h-a*p,t[e+2]=c*g+f*p+a*d-l*h,t[e+3]=f*g-a*h-l*d-c*p,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,n,s){return this._x=t,this._y=e,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){let n=t._x,s=t._y,r=t._z,o=t._order,a=Math.cos,l=Math.sin,c=a(n/2),f=a(s/2),h=a(r/2),d=l(n/2),p=l(s/2),g=l(r/2);switch(o){case"XYZ":this._x=d*f*h+c*p*g,this._y=c*p*h-d*f*g,this._z=c*f*g+d*p*h,this._w=c*f*h-d*p*g;break;case"YXZ":this._x=d*f*h+c*p*g,this._y=c*p*h-d*f*g,this._z=c*f*g-d*p*h,this._w=c*f*h+d*p*g;break;case"ZXY":this._x=d*f*h-c*p*g,this._y=c*p*h+d*f*g,this._z=c*f*g+d*p*h,this._w=c*f*h-d*p*g;break;case"ZYX":this._x=d*f*h-c*p*g,this._y=c*p*h+d*f*g,this._z=c*f*g-d*p*h,this._w=c*f*h+d*p*g;break;case"YZX":this._x=d*f*h+c*p*g,this._y=c*p*h+d*f*g,this._z=c*f*g-d*p*h,this._w=c*f*h-d*p*g;break;case"XZY":this._x=d*f*h-c*p*g,this._y=c*p*h-d*f*g,this._z=c*f*g+d*p*h,this._w=c*f*h+d*p*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){let n=e/2,s=Math.sin(n);return this._x=t.x*s,this._y=t.y*s,this._z=t.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(t){let e=t.elements,n=e[0],s=e[4],r=e[8],o=e[1],a=e[5],l=e[9],c=e[2],f=e[6],h=e[10],d=n+a+h;if(d>0){let p=.5/Math.sqrt(d+1);this._w=.25/p,this._x=(f-l)*p,this._y=(r-c)*p,this._z=(o-s)*p}else if(n>a&&n>h){let p=2*Math.sqrt(1+n-a-h);this._w=(f-l)/p,this._x=.25*p,this._y=(s+o)/p,this._z=(r+c)/p}else if(a>h){let p=2*Math.sqrt(1+a-n-h);this._w=(r-c)/p,this._x=(s+o)/p,this._y=.25*p,this._z=(l+f)/p}else{let p=2*Math.sqrt(1+h-n-a);this._w=(o-s)/p,this._x=(r+c)/p,this._y=(l+f)/p,this._z=.25*p}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let n=t.dot(e)+1;return n<Number.EPSILON?(n=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=n):(this._x=0,this._y=-t.z,this._z=t.y,this._w=n)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=n),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(Fe(this.dot(t),-1,1)))}rotateTowards(t,e){let n=this.angleTo(t);if(n===0)return this;let s=Math.min(1,e/n);return this.slerp(t,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){let n=t._x,s=t._y,r=t._z,o=t._w,a=e._x,l=e._y,c=e._z,f=e._w;return this._x=n*f+o*a+s*c-r*l,this._y=s*f+o*l+r*a-n*c,this._z=r*f+o*c+n*l-s*a,this._w=o*f-n*a-s*l-r*c,this._onChangeCallback(),this}slerp(t,e){if(e===0)return this;if(e===1)return this.copy(t);let n=this._x,s=this._y,r=this._z,o=this._w,a=o*t._w+n*t._x+s*t._y+r*t._z;if(a<0?(this._w=-t._w,this._x=-t._x,this._y=-t._y,this._z=-t._z,a=-a):this.copy(t),a>=1)return this._w=o,this._x=n,this._y=s,this._z=r,this;let l=1-a*a;if(l<=Number.EPSILON){let p=1-e;return this._w=p*o+e*this._w,this._x=p*n+e*this._x,this._y=p*s+e*this._y,this._z=p*r+e*this._z,this.normalize(),this}let c=Math.sqrt(l),f=Math.atan2(c,a),h=Math.sin((1-e)*f)/c,d=Math.sin(e*f)/c;return this._w=o*h+this._w*d,this._x=n*h+this._x*d,this._y=s*h+this._y*d,this._z=r*h+this._z*d,this._onChangeCallback(),this}slerpQuaternions(t,e,n){return this.copy(t).slerp(e,n)}random(){let t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(t),s*Math.cos(t),r*Math.sin(e),r*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},U=class i{constructor(t=0,e=0,n=0){i.prototype.isVector3=!0,this.x=t,this.y=e,this.z=n}set(t,e,n){return n===void 0&&(n=this.z),this.x=t,this.y=e,this.z=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(Ec.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(Ec.setFromAxisAngle(t,e))}applyMatrix3(t){let e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[3]*n+r[6]*s,this.y=r[1]*e+r[4]*n+r[7]*s,this.z=r[2]*e+r[5]*n+r[8]*s,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){let e=this.x,n=this.y,s=this.z,r=t.elements,o=1/(r[3]*e+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*e+r[4]*n+r[8]*s+r[12])*o,this.y=(r[1]*e+r[5]*n+r[9]*s+r[13])*o,this.z=(r[2]*e+r[6]*n+r[10]*s+r[14])*o,this}applyQuaternion(t){let e=this.x,n=this.y,s=this.z,r=t.x,o=t.y,a=t.z,l=t.w,c=2*(o*s-a*n),f=2*(a*e-r*s),h=2*(r*n-o*e);return this.x=e+l*c+o*h-a*f,this.y=n+l*f+a*c-r*h,this.z=s+l*h+r*f-o*c,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){let e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[4]*n+r[8]*s,this.y=r[1]*e+r[5]*n+r[9]*s,this.z=r[2]*e+r[6]*n+r[10]*s,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this.z=Math.max(t.z,Math.min(e.z,this.z)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){let n=t.x,s=t.y,r=t.z,o=e.x,a=e.y,l=e.z;return this.x=s*l-r*a,this.y=r*o-n*l,this.z=n*a-s*o,this}projectOnVector(t){let e=t.lengthSq();if(e===0)return this.set(0,0,0);let n=t.dot(this)/e;return this.copy(t).multiplyScalar(n)}projectOnPlane(t){return To.copy(this).projectOnVector(t),this.sub(To)}reflect(t){return this.sub(To.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let n=this.dot(t)/e;return Math.acos(Fe(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,n=this.y-t.y,s=this.z-t.z;return e*e+n*n+s*s}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,n){let s=Math.sin(e)*t;return this.x=s*Math.sin(n),this.y=Math.cos(e)*t,this.z=s*Math.cos(n),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,n){return this.x=t*Math.sin(e),this.y=n,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){let e=this.setFromMatrixColumn(t,0).length(),n=this.setFromMatrixColumn(t,1).length(),s=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=n,this.z=s,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let t=Math.random()*Math.PI*2,e=Math.random()*2-1,n=Math.sqrt(1-e*e);return this.x=n*Math.cos(t),this.y=e,this.z=n*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},To=new U,Ec=new We,Hn=class{constructor(t=new U(1/0,1/0,1/0),e=new U(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e+=3)this.expandByPoint(dn.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,n=t.count;e<n;e++)this.expandByPoint(dn.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){let n=dn.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(n),this.max.copy(t).add(n),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);let n=t.geometry;if(n!==void 0){let r=n.getAttribute("position");if(e===!0&&r!==void 0&&t.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)t.isMesh===!0?t.getVertexPosition(o,dn):dn.fromBufferAttribute(r,o),dn.applyMatrix4(t.matrixWorld),this.expandByPoint(dn);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),Ws.copy(t.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Ws.copy(n.boundingBox)),Ws.applyMatrix4(t.matrixWorld),this.union(Ws)}let s=t.children;for(let r=0,o=s.length;r<o;r++)this.expandByObject(s[r],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,dn),dn.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,n;return t.normal.x>0?(e=t.normal.x*this.min.x,n=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,n=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,n+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,n+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,n+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,n+=t.normal.z*this.min.z),e<=-t.constant&&n>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(ss),Xs.subVectors(this.max,ss),bi.subVectors(t.a,ss),wi.subVectors(t.b,ss),Ti.subVectors(t.c,ss),Gn.subVectors(wi,bi),Vn.subVectors(Ti,wi),ii.subVectors(bi,Ti);let e=[0,-Gn.z,Gn.y,0,-Vn.z,Vn.y,0,-ii.z,ii.y,Gn.z,0,-Gn.x,Vn.z,0,-Vn.x,ii.z,0,-ii.x,-Gn.y,Gn.x,0,-Vn.y,Vn.x,0,-ii.y,ii.x,0];return!Ao(e,bi,wi,Ti,Xs)||(e=[1,0,0,0,1,0,0,0,1],!Ao(e,bi,wi,Ti,Xs))?!1:(qs.crossVectors(Gn,Vn),e=[qs.x,qs.y,qs.z],Ao(e,bi,wi,Ti,Xs))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,dn).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(dn).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(Pn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),Pn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),Pn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),Pn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),Pn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),Pn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),Pn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),Pn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(Pn),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}},Pn=[new U,new U,new U,new U,new U,new U,new U,new U],dn=new U,Ws=new Hn,bi=new U,wi=new U,Ti=new U,Gn=new U,Vn=new U,ii=new U,ss=new U,Xs=new U,qs=new U,si=new U;function Ao(i,t,e,n,s){for(let r=0,o=i.length-3;r<=o;r+=3){si.fromArray(i,r);let a=s.x*Math.abs(si.x)+s.y*Math.abs(si.y)+s.z*Math.abs(si.z),l=t.dot(si),c=e.dot(si),f=n.dot(si);if(Math.max(-Math.max(l,c,f),Math.min(l,c,f))>a)return!1}return!0}var yf=new Hn,rs=new U,Ro=new U,Sn=class{constructor(t=new U,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){let n=this.center;e!==void 0?n.copy(e):yf.setFromPoints(t).getCenter(n);let s=0;for(let r=0,o=t.length;r<o;r++)s=Math.max(s,n.distanceToSquared(t[r]));return this.radius=Math.sqrt(s),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){let e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){let n=this.center.distanceToSquared(t);return e.copy(t),n>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;rs.subVectors(t,this.center);let e=rs.lengthSq();if(e>this.radius*this.radius){let n=Math.sqrt(e),s=(n-this.radius)*.5;this.center.addScaledVector(rs,s/n),this.radius+=s}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(Ro.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(rs.copy(t.center).add(Ro)),this.expandByPoint(rs.copy(t.center).sub(Ro))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}},In=new U,Co=new U,Ys=new U,Wn=new U,Po=new U,Zs=new U,Io=new U,xs=class{constructor(t=new U,e=new U(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,In)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);let n=e.dot(this.direction);return n<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){let e=In.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(In.copy(this.origin).addScaledVector(this.direction,e),In.distanceToSquared(t))}distanceSqToSegment(t,e,n,s){Co.copy(t).add(e).multiplyScalar(.5),Ys.copy(e).sub(t).normalize(),Wn.copy(this.origin).sub(Co);let r=t.distanceTo(e)*.5,o=-this.direction.dot(Ys),a=Wn.dot(this.direction),l=-Wn.dot(Ys),c=Wn.lengthSq(),f=Math.abs(1-o*o),h,d,p,g;if(f>0)if(h=o*l-a,d=o*a-l,g=r*f,h>=0)if(d>=-g)if(d<=g){let _=1/f;h*=_,d*=_,p=h*(h+o*d+2*a)+d*(o*h+d+2*l)+c}else d=r,h=Math.max(0,-(o*d+a)),p=-h*h+d*(d+2*l)+c;else d=-r,h=Math.max(0,-(o*d+a)),p=-h*h+d*(d+2*l)+c;else d<=-g?(h=Math.max(0,-(-o*r+a)),d=h>0?-r:Math.min(Math.max(-r,-l),r),p=-h*h+d*(d+2*l)+c):d<=g?(h=0,d=Math.min(Math.max(-r,-l),r),p=d*(d+2*l)+c):(h=Math.max(0,-(o*r+a)),d=h>0?r:Math.min(Math.max(-r,-l),r),p=-h*h+d*(d+2*l)+c);else d=o>0?-r:r,h=Math.max(0,-(o*d+a)),p=-h*h+d*(d+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,h),s&&s.copy(Co).addScaledVector(Ys,d),p}intersectSphere(t,e){In.subVectors(t.center,this.origin);let n=In.dot(this.direction),s=In.dot(In)-n*n,r=t.radius*t.radius;if(s>r)return null;let o=Math.sqrt(r-s),a=n-o,l=n+o;return l<0?null:a<0?this.at(l,e):this.at(a,e)}intersectsSphere(t){return this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){let e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(t.normal)+t.constant)/e;return n>=0?n:null}intersectPlane(t,e){let n=this.distanceToPlane(t);return n===null?null:this.at(n,e)}intersectsPlane(t){let e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let n,s,r,o,a,l,c=1/this.direction.x,f=1/this.direction.y,h=1/this.direction.z,d=this.origin;return c>=0?(n=(t.min.x-d.x)*c,s=(t.max.x-d.x)*c):(n=(t.max.x-d.x)*c,s=(t.min.x-d.x)*c),f>=0?(r=(t.min.y-d.y)*f,o=(t.max.y-d.y)*f):(r=(t.max.y-d.y)*f,o=(t.min.y-d.y)*f),n>o||r>s||((r>n||isNaN(n))&&(n=r),(o<s||isNaN(s))&&(s=o),h>=0?(a=(t.min.z-d.z)*h,l=(t.max.z-d.z)*h):(a=(t.max.z-d.z)*h,l=(t.min.z-d.z)*h),n>l||a>s)||((a>n||n!==n)&&(n=a),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,e)}intersectsBox(t){return this.intersectBox(t,In)!==null}intersectTriangle(t,e,n,s,r){Po.subVectors(e,t),Zs.subVectors(n,t),Io.crossVectors(Po,Zs);let o=this.direction.dot(Io),a;if(o>0){if(s)return null;a=1}else if(o<0)a=-1,o=-o;else return null;Wn.subVectors(this.origin,t);let l=a*this.direction.dot(Zs.crossVectors(Wn,Zs));if(l<0)return null;let c=a*this.direction.dot(Po.cross(Wn));if(c<0||l+c>o)return null;let f=-a*Wn.dot(Io);return f<0?null:this.at(f/o,r)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Xt=class i{constructor(t,e,n,s,r,o,a,l,c,f,h,d,p,g,_,m){i.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,o,a,l,c,f,h,d,p,g,_,m)}set(t,e,n,s,r,o,a,l,c,f,h,d,p,g,_,m){let u=this.elements;return u[0]=t,u[4]=e,u[8]=n,u[12]=s,u[1]=r,u[5]=o,u[9]=a,u[13]=l,u[2]=c,u[6]=f,u[10]=h,u[14]=d,u[3]=p,u[7]=g,u[11]=_,u[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new i().fromArray(this.elements)}copy(t){let e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],e[9]=n[9],e[10]=n[10],e[11]=n[11],e[12]=n[12],e[13]=n[13],e[14]=n[14],e[15]=n[15],this}copyPosition(t){let e=this.elements,n=t.elements;return e[12]=n[12],e[13]=n[13],e[14]=n[14],this}setFromMatrix3(t){let e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,n){return t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(t,e,n){return this.set(t.x,e.x,n.x,0,t.y,e.y,n.y,0,t.z,e.z,n.z,0,0,0,0,1),this}extractRotation(t){let e=this.elements,n=t.elements,s=1/Ai.setFromMatrixColumn(t,0).length(),r=1/Ai.setFromMatrixColumn(t,1).length(),o=1/Ai.setFromMatrixColumn(t,2).length();return e[0]=n[0]*s,e[1]=n[1]*s,e[2]=n[2]*s,e[3]=0,e[4]=n[4]*r,e[5]=n[5]*r,e[6]=n[6]*r,e[7]=0,e[8]=n[8]*o,e[9]=n[9]*o,e[10]=n[10]*o,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){let e=this.elements,n=t.x,s=t.y,r=t.z,o=Math.cos(n),a=Math.sin(n),l=Math.cos(s),c=Math.sin(s),f=Math.cos(r),h=Math.sin(r);if(t.order==="XYZ"){let d=o*f,p=o*h,g=a*f,_=a*h;e[0]=l*f,e[4]=-l*h,e[8]=c,e[1]=p+g*c,e[5]=d-_*c,e[9]=-a*l,e[2]=_-d*c,e[6]=g+p*c,e[10]=o*l}else if(t.order==="YXZ"){let d=l*f,p=l*h,g=c*f,_=c*h;e[0]=d+_*a,e[4]=g*a-p,e[8]=o*c,e[1]=o*h,e[5]=o*f,e[9]=-a,e[2]=p*a-g,e[6]=_+d*a,e[10]=o*l}else if(t.order==="ZXY"){let d=l*f,p=l*h,g=c*f,_=c*h;e[0]=d-_*a,e[4]=-o*h,e[8]=g+p*a,e[1]=p+g*a,e[5]=o*f,e[9]=_-d*a,e[2]=-o*c,e[6]=a,e[10]=o*l}else if(t.order==="ZYX"){let d=o*f,p=o*h,g=a*f,_=a*h;e[0]=l*f,e[4]=g*c-p,e[8]=d*c+_,e[1]=l*h,e[5]=_*c+d,e[9]=p*c-g,e[2]=-c,e[6]=a*l,e[10]=o*l}else if(t.order==="YZX"){let d=o*l,p=o*c,g=a*l,_=a*c;e[0]=l*f,e[4]=_-d*h,e[8]=g*h+p,e[1]=h,e[5]=o*f,e[9]=-a*f,e[2]=-c*f,e[6]=p*h+g,e[10]=d-_*h}else if(t.order==="XZY"){let d=o*l,p=o*c,g=a*l,_=a*c;e[0]=l*f,e[4]=-h,e[8]=c*f,e[1]=d*h+_,e[5]=o*f,e[9]=p*h-g,e[2]=g*h-p,e[6]=a*f,e[10]=_*h+d}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(_f,t,vf)}lookAt(t,e,n){let s=this.elements;return nn.subVectors(t,e),nn.lengthSq()===0&&(nn.z=1),nn.normalize(),Xn.crossVectors(n,nn),Xn.lengthSq()===0&&(Math.abs(n.z)===1?nn.x+=1e-4:nn.z+=1e-4,nn.normalize(),Xn.crossVectors(n,nn)),Xn.normalize(),$s.crossVectors(nn,Xn),s[0]=Xn.x,s[4]=$s.x,s[8]=nn.x,s[1]=Xn.y,s[5]=$s.y,s[9]=nn.y,s[2]=Xn.z,s[6]=$s.z,s[10]=nn.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let n=t.elements,s=e.elements,r=this.elements,o=n[0],a=n[4],l=n[8],c=n[12],f=n[1],h=n[5],d=n[9],p=n[13],g=n[2],_=n[6],m=n[10],u=n[14],y=n[3],v=n[7],M=n[11],A=n[15],S=s[0],w=s[4],P=s[8],D=s[12],x=s[1],E=s[5],N=s[9],z=s[13],I=s[2],V=s[6],F=s[10],Q=s[14],Y=s[3],X=s[7],it=s[11],rt=s[15];return r[0]=o*S+a*x+l*I+c*Y,r[4]=o*w+a*E+l*V+c*X,r[8]=o*P+a*N+l*F+c*it,r[12]=o*D+a*z+l*Q+c*rt,r[1]=f*S+h*x+d*I+p*Y,r[5]=f*w+h*E+d*V+p*X,r[9]=f*P+h*N+d*F+p*it,r[13]=f*D+h*z+d*Q+p*rt,r[2]=g*S+_*x+m*I+u*Y,r[6]=g*w+_*E+m*V+u*X,r[10]=g*P+_*N+m*F+u*it,r[14]=g*D+_*z+m*Q+u*rt,r[3]=y*S+v*x+M*I+A*Y,r[7]=y*w+v*E+M*V+A*X,r[11]=y*P+v*N+M*F+A*it,r[15]=y*D+v*z+M*Q+A*rt,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){let t=this.elements,e=t[0],n=t[4],s=t[8],r=t[12],o=t[1],a=t[5],l=t[9],c=t[13],f=t[2],h=t[6],d=t[10],p=t[14],g=t[3],_=t[7],m=t[11],u=t[15];return g*(+r*l*h-s*c*h-r*a*d+n*c*d+s*a*p-n*l*p)+_*(+e*l*p-e*c*d+r*o*d-s*o*p+s*c*f-r*l*f)+m*(+e*c*h-e*a*p-r*o*h+n*o*p+r*a*f-n*c*f)+u*(-s*a*f-e*l*h+e*a*d+s*o*h-n*o*d+n*l*f)}transpose(){let t=this.elements,e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,n){let s=this.elements;return t.isVector3?(s[12]=t.x,s[13]=t.y,s[14]=t.z):(s[12]=t,s[13]=e,s[14]=n),this}invert(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],o=t[4],a=t[5],l=t[6],c=t[7],f=t[8],h=t[9],d=t[10],p=t[11],g=t[12],_=t[13],m=t[14],u=t[15],y=h*m*c-_*d*c+_*l*p-a*m*p-h*l*u+a*d*u,v=g*d*c-f*m*c-g*l*p+o*m*p+f*l*u-o*d*u,M=f*_*c-g*h*c+g*a*p-o*_*p-f*a*u+o*h*u,A=g*h*l-f*_*l-g*a*d+o*_*d+f*a*m-o*h*m,S=e*y+n*v+s*M+r*A;if(S===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let w=1/S;return t[0]=y*w,t[1]=(_*d*r-h*m*r-_*s*p+n*m*p+h*s*u-n*d*u)*w,t[2]=(a*m*r-_*l*r+_*s*c-n*m*c-a*s*u+n*l*u)*w,t[3]=(h*l*r-a*d*r-h*s*c+n*d*c+a*s*p-n*l*p)*w,t[4]=v*w,t[5]=(f*m*r-g*d*r+g*s*p-e*m*p-f*s*u+e*d*u)*w,t[6]=(g*l*r-o*m*r-g*s*c+e*m*c+o*s*u-e*l*u)*w,t[7]=(o*d*r-f*l*r+f*s*c-e*d*c-o*s*p+e*l*p)*w,t[8]=M*w,t[9]=(g*h*r-f*_*r-g*n*p+e*_*p+f*n*u-e*h*u)*w,t[10]=(o*_*r-g*a*r+g*n*c-e*_*c-o*n*u+e*a*u)*w,t[11]=(f*a*r-o*h*r-f*n*c+e*h*c+o*n*p-e*a*p)*w,t[12]=A*w,t[13]=(f*_*s-g*h*s+g*n*d-e*_*d-f*n*m+e*h*m)*w,t[14]=(g*a*s-o*_*s-g*n*l+e*_*l+o*n*m-e*a*m)*w,t[15]=(o*h*s-f*a*s+f*n*l-e*h*l-o*n*d+e*a*d)*w,this}scale(t){let e=this.elements,n=t.x,s=t.y,r=t.z;return e[0]*=n,e[4]*=s,e[8]*=r,e[1]*=n,e[5]*=s,e[9]*=r,e[2]*=n,e[6]*=s,e[10]*=r,e[3]*=n,e[7]*=s,e[11]*=r,this}getMaxScaleOnAxis(){let t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],n=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],s=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,n,s))}makeTranslation(t,e,n){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,n,0,0,0,1),this}makeRotationX(t){let e=Math.cos(t),n=Math.sin(t);return this.set(1,0,0,0,0,e,-n,0,0,n,e,0,0,0,0,1),this}makeRotationY(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,0,n,0,0,1,0,0,-n,0,e,0,0,0,0,1),this}makeRotationZ(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,0,n,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){let n=Math.cos(e),s=Math.sin(e),r=1-n,o=t.x,a=t.y,l=t.z,c=r*o,f=r*a;return this.set(c*o+n,c*a-s*l,c*l+s*a,0,c*a+s*l,f*a+n,f*l-s*o,0,c*l-s*a,f*l+s*o,r*l*l+n,0,0,0,0,1),this}makeScale(t,e,n){return this.set(t,0,0,0,0,e,0,0,0,0,n,0,0,0,0,1),this}makeShear(t,e,n,s,r,o){return this.set(1,n,r,0,t,1,o,0,e,s,1,0,0,0,0,1),this}compose(t,e,n){let s=this.elements,r=e._x,o=e._y,a=e._z,l=e._w,c=r+r,f=o+o,h=a+a,d=r*c,p=r*f,g=r*h,_=o*f,m=o*h,u=a*h,y=l*c,v=l*f,M=l*h,A=n.x,S=n.y,w=n.z;return s[0]=(1-(_+u))*A,s[1]=(p+M)*A,s[2]=(g-v)*A,s[3]=0,s[4]=(p-M)*S,s[5]=(1-(d+u))*S,s[6]=(m+y)*S,s[7]=0,s[8]=(g+v)*w,s[9]=(m-y)*w,s[10]=(1-(d+_))*w,s[11]=0,s[12]=t.x,s[13]=t.y,s[14]=t.z,s[15]=1,this}decompose(t,e,n){let s=this.elements,r=Ai.set(s[0],s[1],s[2]).length(),o=Ai.set(s[4],s[5],s[6]).length(),a=Ai.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),t.x=s[12],t.y=s[13],t.z=s[14],pn.copy(this);let c=1/r,f=1/o,h=1/a;return pn.elements[0]*=c,pn.elements[1]*=c,pn.elements[2]*=c,pn.elements[4]*=f,pn.elements[5]*=f,pn.elements[6]*=f,pn.elements[8]*=h,pn.elements[9]*=h,pn.elements[10]*=h,e.setFromRotationMatrix(pn),n.x=r,n.y=o,n.z=a,this}makePerspective(t,e,n,s,r,o,a=Fn){let l=this.elements,c=2*r/(e-t),f=2*r/(n-s),h=(e+t)/(e-t),d=(n+s)/(n-s),p,g;if(a===Fn)p=-(o+r)/(o-r),g=-2*o*r/(o-r);else if(a===Rr)p=-o/(o-r),g=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=c,l[4]=0,l[8]=h,l[12]=0,l[1]=0,l[5]=f,l[9]=d,l[13]=0,l[2]=0,l[6]=0,l[10]=p,l[14]=g,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(t,e,n,s,r,o,a=Fn){let l=this.elements,c=1/(e-t),f=1/(n-s),h=1/(o-r),d=(e+t)*c,p=(n+s)*f,g,_;if(a===Fn)g=(o+r)*h,_=-2*h;else if(a===Rr)g=r*h,_=-1*h;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-d,l[1]=0,l[5]=2*f,l[9]=0,l[13]=-p,l[2]=0,l[6]=0,l[10]=_,l[14]=-g,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(t){let e=this.elements,n=t.elements;for(let s=0;s<16;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<16;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){let n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t[e+9]=n[9],t[e+10]=n[10],t[e+11]=n[11],t[e+12]=n[12],t[e+13]=n[13],t[e+14]=n[14],t[e+15]=n[15],t}},Ai=new U,pn=new Xt,_f=new U(0,0,0),vf=new U(1,1,1),Xn=new U,$s=new U,nn=new U,Sc=new Xt,bc=new We,Xe=class i{constructor(t=0,e=0,n=0,s=i.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=n,this._order=s}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,n,s=this._order){return this._x=t,this._y=e,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,n=!0){let s=t.elements,r=s[0],o=s[4],a=s[8],l=s[1],c=s[5],f=s[9],h=s[2],d=s[6],p=s[10];switch(e){case"XYZ":this._y=Math.asin(Fe(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-f,p),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(d,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Fe(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(a,p),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-h,r),this._z=0);break;case"ZXY":this._x=Math.asin(Fe(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-h,p),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-Fe(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(d,p),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(Fe(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-f,c),this._y=Math.atan2(-h,r)):(this._x=0,this._y=Math.atan2(a,p));break;case"XZY":this._z=Math.asin(-Fe(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-f,p),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,n===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,n){return Sc.makeRotationFromQuaternion(t),this.setFromRotationMatrix(Sc,e,n)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return bc.setFromEuler(this),this.setFromQuaternion(bc,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Xe.DEFAULT_ORDER="XYZ";var ys=class{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}},Mf=0,wc=new U,Ri=new We,Ln=new Xt,Js=new U,os=new U,Ef=new U,Sf=new We,Tc=new U(1,0,0),Ac=new U(0,1,0),Rc=new U(0,0,1),Cc={type:"added"},bf={type:"removed"},Ci={type:"childadded",child:null},Lo={type:"childremoved",child:null},Re=class i extends jn{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Mf++}),this.uuid=ji(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let t=new U,e=new Xe,n=new We,s=new U(1,1,1);function r(){n.setFromEuler(e,!1)}function o(){e.setFromQuaternion(n,void 0,!1)}e._onChange(r),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new Xt},normalMatrix:{value:new te}}),this.matrix=new Xt,this.matrixWorld=new Xt,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new ys,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return Ri.setFromAxisAngle(t,e),this.quaternion.multiply(Ri),this}rotateOnWorldAxis(t,e){return Ri.setFromAxisAngle(t,e),this.quaternion.premultiply(Ri),this}rotateX(t){return this.rotateOnAxis(Tc,t)}rotateY(t){return this.rotateOnAxis(Ac,t)}rotateZ(t){return this.rotateOnAxis(Rc,t)}translateOnAxis(t,e){return wc.copy(t).applyQuaternion(this.quaternion),this.position.add(wc.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(Tc,t)}translateY(t){return this.translateOnAxis(Ac,t)}translateZ(t){return this.translateOnAxis(Rc,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(Ln.copy(this.matrixWorld).invert())}lookAt(t,e,n){t.isVector3?Js.copy(t):Js.set(t,e,n);let s=this.parent;this.updateWorldMatrix(!0,!1),os.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Ln.lookAt(os,Js,this.up):Ln.lookAt(Js,os,this.up),this.quaternion.setFromRotationMatrix(Ln),s&&(Ln.extractRotation(s.matrixWorld),Ri.setFromRotationMatrix(Ln),this.quaternion.premultiply(Ri.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(Cc),Ci.child=t,this.dispatchEvent(Ci),Ci.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(bf),Lo.child=t,this.dispatchEvent(Lo),Lo.child=null),this}removeFromParent(){let t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),Ln.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),Ln.multiply(t.parent.matrixWorld)),t.applyMatrix4(Ln),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(Cc),Ci.child=t,this.dispatchEvent(Ci),Ci.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let n=0,s=this.children.length;n<s;n++){let o=this.children[n].getObjectByProperty(t,e);if(o!==void 0)return o}}getObjectsByProperty(t,e,n=[]){this[t]===e&&n.push(this);let s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].getObjectsByProperty(t,e,n);return n}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(os,t,Ef),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(os,Sf,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);let e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}traverse(t){t(this);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverseVisible(t)}traverseAncestors(t){let e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].updateMatrixWorld(t)}updateWorldMatrix(t,e){let n=this.parent;if(t===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),e===!0){let s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].updateWorldMatrix(!1,!0)}}toJSON(t){let e=t===void 0||typeof t=="string",n={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.visibility=this._visibility,s.active=this._active,s.bounds=this._bounds.map(a=>({boxInitialized:a.boxInitialized,boxMin:a.box.min.toArray(),boxMax:a.box.max.toArray(),sphereInitialized:a.sphereInitialized,sphereRadius:a.sphere.radius,sphereCenter:a.sphere.center.toArray()})),s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.geometryCount=this._geometryCount,s.matricesTexture=this._matricesTexture.toJSON(t),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(s.boundingSphere={center:s.boundingSphere.center.toArray(),radius:s.boundingSphere.radius}),this.boundingBox!==null&&(s.boundingBox={min:s.boundingBox.min.toArray(),max:s.boundingBox.max.toArray()}));function r(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(t.geometries,this.geometry);let a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){let l=a.shapes;if(Array.isArray(l))for(let c=0,f=l.length;c<f;c++){let h=l[c];r(t.shapes,h)}else r(t.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(t.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(r(t.materials,this.material[l]));s.material=a}else s.material=r(t.materials,this.material);if(this.children.length>0){s.children=[];for(let a=0;a<this.children.length;a++)s.children.push(this.children[a].toJSON(t).object)}if(this.animations.length>0){s.animations=[];for(let a=0;a<this.animations.length;a++){let l=this.animations[a];s.animations.push(r(t.animations,l))}}if(e){let a=o(t.geometries),l=o(t.materials),c=o(t.textures),f=o(t.images),h=o(t.shapes),d=o(t.skeletons),p=o(t.animations),g=o(t.nodes);a.length>0&&(n.geometries=a),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),f.length>0&&(n.images=f),h.length>0&&(n.shapes=h),d.length>0&&(n.skeletons=d),p.length>0&&(n.animations=p),g.length>0&&(n.nodes=g)}return n.object=s,n;function o(a){let l=[];for(let c in a){let f=a[c];delete f.metadata,l.push(f)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let n=0;n<t.children.length;n++){let s=t.children[n];this.add(s.clone())}return this}};Re.DEFAULT_UP=new U(0,1,0);Re.DEFAULT_MATRIX_AUTO_UPDATE=!0;Re.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var mn=new U,Dn=new U,Do=new U,Un=new U,Pi=new U,Ii=new U,Pc=new U,Uo=new U,No=new U,Fo=new U,zo=new Me,Oo=new Me,Ho=new Me,ui=class i{constructor(t=new U,e=new U,n=new U){this.a=t,this.b=e,this.c=n}static getNormal(t,e,n,s){s.subVectors(n,e),mn.subVectors(t,e),s.cross(mn);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(t,e,n,s,r){mn.subVectors(s,e),Dn.subVectors(n,e),Do.subVectors(t,e);let o=mn.dot(mn),a=mn.dot(Dn),l=mn.dot(Do),c=Dn.dot(Dn),f=Dn.dot(Do),h=o*c-a*a;if(h===0)return r.set(0,0,0),null;let d=1/h,p=(c*l-a*f)*d,g=(o*f-a*l)*d;return r.set(1-p-g,g,p)}static containsPoint(t,e,n,s){return this.getBarycoord(t,e,n,s,Un)===null?!1:Un.x>=0&&Un.y>=0&&Un.x+Un.y<=1}static getInterpolation(t,e,n,s,r,o,a,l){return this.getBarycoord(t,e,n,s,Un)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,Un.x),l.addScaledVector(o,Un.y),l.addScaledVector(a,Un.z),l)}static getInterpolatedAttribute(t,e,n,s,r,o){return zo.setScalar(0),Oo.setScalar(0),Ho.setScalar(0),zo.fromBufferAttribute(t,e),Oo.fromBufferAttribute(t,n),Ho.fromBufferAttribute(t,s),o.setScalar(0),o.addScaledVector(zo,r.x),o.addScaledVector(Oo,r.y),o.addScaledVector(Ho,r.z),o}static isFrontFacing(t,e,n,s){return mn.subVectors(n,e),Dn.subVectors(t,e),mn.cross(Dn).dot(s)<0}set(t,e,n){return this.a.copy(t),this.b.copy(e),this.c.copy(n),this}setFromPointsAndIndices(t,e,n,s){return this.a.copy(t[e]),this.b.copy(t[n]),this.c.copy(t[s]),this}setFromAttributeAndIndices(t,e,n,s){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,n),this.c.fromBufferAttribute(t,s),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return mn.subVectors(this.c,this.b),Dn.subVectors(this.a,this.b),mn.cross(Dn).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return i.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return i.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,n,s,r){return i.getInterpolation(t,this.a,this.b,this.c,e,n,s,r)}containsPoint(t){return i.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return i.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){let n=this.a,s=this.b,r=this.c,o,a;Pi.subVectors(s,n),Ii.subVectors(r,n),Uo.subVectors(t,n);let l=Pi.dot(Uo),c=Ii.dot(Uo);if(l<=0&&c<=0)return e.copy(n);No.subVectors(t,s);let f=Pi.dot(No),h=Ii.dot(No);if(f>=0&&h<=f)return e.copy(s);let d=l*h-f*c;if(d<=0&&l>=0&&f<=0)return o=l/(l-f),e.copy(n).addScaledVector(Pi,o);Fo.subVectors(t,r);let p=Pi.dot(Fo),g=Ii.dot(Fo);if(g>=0&&p<=g)return e.copy(r);let _=p*c-l*g;if(_<=0&&c>=0&&g<=0)return a=c/(c-g),e.copy(n).addScaledVector(Ii,a);let m=f*g-p*h;if(m<=0&&h-f>=0&&p-g>=0)return Pc.subVectors(r,s),a=(h-f)/(h-f+(p-g)),e.copy(s).addScaledVector(Pc,a);let u=1/(m+_+d);return o=_*u,a=d*u,e.copy(n).addScaledVector(Pi,o).addScaledVector(Ii,a)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}},Uh={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},qn={h:0,s:0,l:0},Ks={h:0,s:0,l:0};function Bo(i,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?i+(t-i)*6*e:e<1/2?t:e<2/3?i+(t-i)*6*(2/3-e):i}var Gt=class{constructor(t,e,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,n)}set(t,e,n){if(e===void 0&&n===void 0){let s=t;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(t,e,n);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=xe){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,he.toWorkingColorSpace(this,e),this}setRGB(t,e,n,s=he.workingColorSpace){return this.r=t,this.g=e,this.b=n,he.toWorkingColorSpace(this,s),this}setHSL(t,e,n,s=he.workingColorSpace){if(t=hf(t,1),e=Fe(e,0,1),n=Fe(n,0,1),e===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+e):n+e-n*e,o=2*n-r;this.r=Bo(o,r,t+1/3),this.g=Bo(o,r,t),this.b=Bo(o,r,t-1/3)}return he.toWorkingColorSpace(this,s),this}setStyle(t,e=xe){function n(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+t+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(t)){let r,o=s[1],a=s[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,e);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,e);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,e);break;default:console.warn("THREE.Color: Unknown color model "+t)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(t)){let r=s[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,e);if(o===6)return this.setHex(parseInt(r,16),e);console.warn("THREE.Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=xe){let n=Uh[t.toLowerCase()];return n!==void 0?this.setHex(n,e):console.warn("THREE.Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=ki(t.r),this.g=ki(t.g),this.b=ki(t.b),this}copyLinearToSRGB(t){return this.r=bo(t.r),this.g=bo(t.g),this.b=bo(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=xe){return he.fromWorkingColorSpace(He.copy(this),t),Math.round(Fe(He.r*255,0,255))*65536+Math.round(Fe(He.g*255,0,255))*256+Math.round(Fe(He.b*255,0,255))}getHexString(t=xe){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=he.workingColorSpace){he.fromWorkingColorSpace(He.copy(this),e);let n=He.r,s=He.g,r=He.b,o=Math.max(n,s,r),a=Math.min(n,s,r),l,c,f=(a+o)/2;if(a===o)l=0,c=0;else{let h=o-a;switch(c=f<=.5?h/(o+a):h/(2-o-a),o){case n:l=(s-r)/h+(s<r?6:0);break;case s:l=(r-n)/h+2;break;case r:l=(n-s)/h+4;break}l/=6}return t.h=l,t.s=c,t.l=f,t}getRGB(t,e=he.workingColorSpace){return he.fromWorkingColorSpace(He.copy(this),e),t.r=He.r,t.g=He.g,t.b=He.b,t}getStyle(t=xe){he.fromWorkingColorSpace(He.copy(this),t);let e=He.r,n=He.g,s=He.b;return t!==xe?`color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(t,e,n){return this.getHSL(qn),this.setHSL(qn.h+t,qn.s+e,qn.l+n)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,n){return this.r=t.r+(e.r-t.r)*n,this.g=t.g+(e.g-t.g)*n,this.b=t.b+(e.b-t.b)*n,this}lerpHSL(t,e){this.getHSL(qn),t.getHSL(Ks);let n=Eo(qn.h,Ks.h,e),s=Eo(qn.s,Ks.s,e),r=Eo(qn.l,Ks.l,e);return this.setHSL(n,s,r),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){let e=this.r,n=this.g,s=this.b,r=t.elements;return this.r=r[0]*e+r[3]*n+r[6]*s,this.g=r[1]*e+r[4]*n+r[7]*s,this.b=r[2]*e+r[5]*n+r[8]*s,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},He=new Gt;Gt.NAMES=Uh;var wf=0,Qn=class extends jn{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:wf++}),this.uuid=ji(),this.name="",this.type="Material",this.blending=Hi,this.side=Jn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=ta,this.blendDst=ea,this.blendEquation=hi,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Gt(0,0,0),this.blendAlpha=0,this.depthFunc=Vi,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=gc,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Ei,this.stencilZFail=Ei,this.stencilZPass=Ei,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(let e in t){let n=t[e];if(n===void 0){console.warn(`THREE.Material: parameter '${e}' has value of undefined.`);continue}let s=this[e];if(s===void 0){console.warn(`THREE.Material: '${e}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[e]=n}}toJSON(t){let e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});let n={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(t).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(t).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(t).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(t).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(t).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==Hi&&(n.blending=this.blending),this.side!==Jn&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==ta&&(n.blendSrc=this.blendSrc),this.blendDst!==ea&&(n.blendDst=this.blendDst),this.blendEquation!==hi&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==Vi&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==gc&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Ei&&(n.stencilFail=this.stencilFail),this.stencilZFail!==Ei&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==Ei&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){let o=[];for(let a in r){let l=r[a];delete l.metadata,o.push(l)}return o}if(e){let r=s(t.textures),o=s(t.images);r.length>0&&(n.textures=r),o.length>0&&(n.images=o)}return n}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;let e=t.clippingPlanes,n=null;if(e!==null){let s=e.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=e[r].clone()}return this.clippingPlanes=n,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}},ne=class extends Qn{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Gt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Xe,this.combine=_h,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}};var Te=new U,js=new Mt,Ae=class{constructor(t,e,n=!1){if(Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=n,this.usage=xc,this.updateRanges=[],this.gpuType=Mn,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,n){t*=this.itemSize,n*=e.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[t+s]=e.array[n+s];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,n=this.count;e<n;e++)js.fromBufferAttribute(this,e),js.applyMatrix3(t),this.setXY(e,js.x,js.y);else if(this.itemSize===3)for(let e=0,n=this.count;e<n;e++)Te.fromBufferAttribute(this,e),Te.applyMatrix3(t),this.setXYZ(e,Te.x,Te.y,Te.z);return this}applyMatrix4(t){for(let e=0,n=this.count;e<n;e++)Te.fromBufferAttribute(this,e),Te.applyMatrix4(t),this.setXYZ(e,Te.x,Te.y,Te.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)Te.fromBufferAttribute(this,e),Te.applyNormalMatrix(t),this.setXYZ(e,Te.x,Te.y,Te.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)Te.fromBufferAttribute(this,e),Te.transformDirection(t),this.setXYZ(e,Te.x,Te.y,Te.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let n=this.array[t*this.itemSize+e];return this.normalized&&(n=ns(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=Je(n,this.array)),this.array[t*this.itemSize+e]=n,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=ns(e,this.array)),e}setX(t,e){return this.normalized&&(e=Je(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=ns(e,this.array)),e}setY(t,e){return this.normalized&&(e=Je(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=ns(e,this.array)),e}setZ(t,e){return this.normalized&&(e=Je(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=ns(e,this.array)),e}setW(t,e){return this.normalized&&(e=Je(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,n){return t*=this.itemSize,this.normalized&&(e=Je(e,this.array),n=Je(n,this.array)),this.array[t+0]=e,this.array[t+1]=n,this}setXYZ(t,e,n,s){return t*=this.itemSize,this.normalized&&(e=Je(e,this.array),n=Je(n,this.array),s=Je(s,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this}setXYZW(t,e,n,s,r){return t*=this.itemSize,this.normalized&&(e=Je(e,this.array),n=Je(n,this.array),s=Je(s,this.array),r=Je(r,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this.array[t+3]=r,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(t.name=this.name),this.usage!==xc&&(t.usage=this.usage),t}};var Ir=class extends Ae{constructor(t,e,n){super(new Uint16Array(t),e,n)}};var Lr=class extends Ae{constructor(t,e,n){super(new Uint32Array(t),e,n)}};var ee=class extends Ae{constructor(t,e,n){super(new Float32Array(t),e,n)}},Tf=0,cn=new Xt,ko=new Re,Li=new U,sn=new Hn,as=new Hn,De=new U,Ee=class i extends jn{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Tf++}),this.uuid=ji(),this.name="",this.type="BufferGeometry",this.index=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(Dh(t)?Lr:Ir)(t,1):this.index=t,this}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,n=0){this.groups.push({start:t,count:e,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){let e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new te().getNormalMatrix(t);n.applyNormalMatrix(r),n.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(t),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(t){return cn.makeRotationFromQuaternion(t),this.applyMatrix4(cn),this}rotateX(t){return cn.makeRotationX(t),this.applyMatrix4(cn),this}rotateY(t){return cn.makeRotationY(t),this.applyMatrix4(cn),this}rotateZ(t){return cn.makeRotationZ(t),this.applyMatrix4(cn),this}translate(t,e,n){return cn.makeTranslation(t,e,n),this.applyMatrix4(cn),this}scale(t,e,n){return cn.makeScale(t,e,n),this.applyMatrix4(cn),this}lookAt(t){return ko.lookAt(t),ko.updateMatrix(),this.applyMatrix4(ko.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Li).negate(),this.translate(Li.x,Li.y,Li.z),this}setFromPoints(t){let e=[];for(let n=0,s=t.length;n<s;n++){let r=t[n];e.push(r.x,r.y,r.z||0)}return this.setAttribute("position",new ee(e,3)),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Hn);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new U(-1/0,-1/0,-1/0),new U(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let n=0,s=e.length;n<s;n++){let r=e[n];sn.setFromBufferAttribute(r),this.morphTargetsRelative?(De.addVectors(this.boundingBox.min,sn.min),this.boundingBox.expandByPoint(De),De.addVectors(this.boundingBox.max,sn.max),this.boundingBox.expandByPoint(De)):(this.boundingBox.expandByPoint(sn.min),this.boundingBox.expandByPoint(sn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Sn);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new U,1/0);return}if(t){let n=this.boundingSphere.center;if(sn.setFromBufferAttribute(t),e)for(let r=0,o=e.length;r<o;r++){let a=e[r];as.setFromBufferAttribute(a),this.morphTargetsRelative?(De.addVectors(sn.min,as.min),sn.expandByPoint(De),De.addVectors(sn.max,as.max),sn.expandByPoint(De)):(sn.expandByPoint(as.min),sn.expandByPoint(as.max))}sn.getCenter(n);let s=0;for(let r=0,o=t.count;r<o;r++)De.fromBufferAttribute(t,r),s=Math.max(s,n.distanceToSquared(De));if(e)for(let r=0,o=e.length;r<o;r++){let a=e[r],l=this.morphTargetsRelative;for(let c=0,f=a.count;c<f;c++)De.fromBufferAttribute(a,c),l&&(Li.fromBufferAttribute(t,c),De.add(Li)),s=Math.max(s,n.distanceToSquared(De))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=e.position,s=e.normal,r=e.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Ae(new Float32Array(4*n.count),4));let o=this.getAttribute("tangent"),a=[],l=[];for(let P=0;P<n.count;P++)a[P]=new U,l[P]=new U;let c=new U,f=new U,h=new U,d=new Mt,p=new Mt,g=new Mt,_=new U,m=new U;function u(P,D,x){c.fromBufferAttribute(n,P),f.fromBufferAttribute(n,D),h.fromBufferAttribute(n,x),d.fromBufferAttribute(r,P),p.fromBufferAttribute(r,D),g.fromBufferAttribute(r,x),f.sub(c),h.sub(c),p.sub(d),g.sub(d);let E=1/(p.x*g.y-g.x*p.y);isFinite(E)&&(_.copy(f).multiplyScalar(g.y).addScaledVector(h,-p.y).multiplyScalar(E),m.copy(h).multiplyScalar(p.x).addScaledVector(f,-g.x).multiplyScalar(E),a[P].add(_),a[D].add(_),a[x].add(_),l[P].add(m),l[D].add(m),l[x].add(m))}let y=this.groups;y.length===0&&(y=[{start:0,count:t.count}]);for(let P=0,D=y.length;P<D;++P){let x=y[P],E=x.start,N=x.count;for(let z=E,I=E+N;z<I;z+=3)u(t.getX(z+0),t.getX(z+1),t.getX(z+2))}let v=new U,M=new U,A=new U,S=new U;function w(P){A.fromBufferAttribute(s,P),S.copy(A);let D=a[P];v.copy(D),v.sub(A.multiplyScalar(A.dot(D))).normalize(),M.crossVectors(S,D);let E=M.dot(l[P])<0?-1:1;o.setXYZW(P,v.x,v.y,v.z,E)}for(let P=0,D=y.length;P<D;++P){let x=y[P],E=x.start,N=x.count;for(let z=E,I=E+N;z<I;z+=3)w(t.getX(z+0)),w(t.getX(z+1)),w(t.getX(z+2))}}computeVertexNormals(){let t=this.index,e=this.getAttribute("position");if(e!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new Ae(new Float32Array(e.count*3),3),this.setAttribute("normal",n);else for(let d=0,p=n.count;d<p;d++)n.setXYZ(d,0,0,0);let s=new U,r=new U,o=new U,a=new U,l=new U,c=new U,f=new U,h=new U;if(t)for(let d=0,p=t.count;d<p;d+=3){let g=t.getX(d+0),_=t.getX(d+1),m=t.getX(d+2);s.fromBufferAttribute(e,g),r.fromBufferAttribute(e,_),o.fromBufferAttribute(e,m),f.subVectors(o,r),h.subVectors(s,r),f.cross(h),a.fromBufferAttribute(n,g),l.fromBufferAttribute(n,_),c.fromBufferAttribute(n,m),a.add(f),l.add(f),c.add(f),n.setXYZ(g,a.x,a.y,a.z),n.setXYZ(_,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let d=0,p=e.count;d<p;d+=3)s.fromBufferAttribute(e,d+0),r.fromBufferAttribute(e,d+1),o.fromBufferAttribute(e,d+2),f.subVectors(o,r),h.subVectors(s,r),f.cross(h),n.setXYZ(d+0,f.x,f.y,f.z),n.setXYZ(d+1,f.x,f.y,f.z),n.setXYZ(d+2,f.x,f.y,f.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let t=this.attributes.normal;for(let e=0,n=t.count;e<n;e++)De.fromBufferAttribute(t,e),De.normalize(),t.setXYZ(e,De.x,De.y,De.z)}toNonIndexed(){function t(a,l){let c=a.array,f=a.itemSize,h=a.normalized,d=new c.constructor(l.length*f),p=0,g=0;for(let _=0,m=l.length;_<m;_++){a.isInterleavedBufferAttribute?p=l[_]*a.data.stride+a.offset:p=l[_]*f;for(let u=0;u<f;u++)d[g++]=c[p++]}return new Ae(d,f,h)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let e=new i,n=this.index.array,s=this.attributes;for(let a in s){let l=s[a],c=t(l,n);e.setAttribute(a,c)}let r=this.morphAttributes;for(let a in r){let l=[],c=r[a];for(let f=0,h=c.length;f<h;f++){let d=c[f],p=t(d,n);l.push(p)}e.morphAttributes[a]=l}e.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let a=0,l=o.length;a<l;a++){let c=o[a];e.addGroup(c.start,c.count,c.materialIndex)}return e}toJSON(){let t={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.type,this.name!==""&&(t.name=this.name),Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(t[c]=l[c]);return t}t.data={attributes:{}};let e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});let n=this.attributes;for(let l in n){let c=n[l];t.data.attributes[l]=c.toJSON(t.data)}let s={},r=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],f=[];for(let h=0,d=c.length;h<d;h++){let p=c[h];f.push(p.toJSON(t.data))}f.length>0&&(s[l]=f,r=!0)}r&&(t.data.morphAttributes=s,t.data.morphTargetsRelative=this.morphTargetsRelative);let o=this.groups;o.length>0&&(t.data.groups=JSON.parse(JSON.stringify(o)));let a=this.boundingSphere;return a!==null&&(t.data.boundingSphere={center:a.center.toArray(),radius:a.radius}),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let e={};this.name=t.name;let n=t.index;n!==null&&this.setIndex(n.clone(e));let s=t.attributes;for(let c in s){let f=s[c];this.setAttribute(c,f.clone(e))}let r=t.morphAttributes;for(let c in r){let f=[],h=r[c];for(let d=0,p=h.length;d<p;d++)f.push(h[d].clone(e));this.morphAttributes[c]=f}this.morphTargetsRelative=t.morphTargetsRelative;let o=t.groups;for(let c=0,f=o.length;c<f;c++){let h=o[c];this.addGroup(h.start,h.count,h.materialIndex)}let a=t.boundingBox;a!==null&&(this.boundingBox=a.clone());let l=t.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}},Ic=new Xt,ri=new xs,Qs=new Sn,Lc=new U,tr=new U,er=new U,nr=new U,Go=new U,ir=new U,Dc=new U,sr=new U,ut=class extends Re{constructor(t=new Ee,e=new ne){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){let s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){let a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(t,e){let n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,o=n.morphTargetsRelative;e.fromBufferAttribute(s,t);let a=this.morphTargetInfluences;if(r&&a){ir.set(0,0,0);for(let l=0,c=r.length;l<c;l++){let f=a[l],h=r[l];f!==0&&(Go.fromBufferAttribute(h,t),o?ir.addScaledVector(Go,f):ir.addScaledVector(Go.sub(e),f))}e.add(ir)}return e}raycast(t,e){let n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Qs.copy(n.boundingSphere),Qs.applyMatrix4(r),ri.copy(t.ray).recast(t.near),!(Qs.containsPoint(ri.origin)===!1&&(ri.intersectSphere(Qs,Lc)===null||ri.origin.distanceToSquared(Lc)>(t.far-t.near)**2))&&(Ic.copy(r).invert(),ri.copy(t.ray).applyMatrix4(Ic),!(n.boundingBox!==null&&ri.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(t,e,ri)))}_computeIntersections(t,e,n){let s,r=this.geometry,o=this.material,a=r.index,l=r.attributes.position,c=r.attributes.uv,f=r.attributes.uv1,h=r.attributes.normal,d=r.groups,p=r.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,_=d.length;g<_;g++){let m=d[g],u=o[m.materialIndex],y=Math.max(m.start,p.start),v=Math.min(a.count,Math.min(m.start+m.count,p.start+p.count));for(let M=y,A=v;M<A;M+=3){let S=a.getX(M),w=a.getX(M+1),P=a.getX(M+2);s=rr(this,u,t,n,c,f,h,S,w,P),s&&(s.faceIndex=Math.floor(M/3),s.face.materialIndex=m.materialIndex,e.push(s))}}else{let g=Math.max(0,p.start),_=Math.min(a.count,p.start+p.count);for(let m=g,u=_;m<u;m+=3){let y=a.getX(m),v=a.getX(m+1),M=a.getX(m+2);s=rr(this,o,t,n,c,f,h,y,v,M),s&&(s.faceIndex=Math.floor(m/3),e.push(s))}}else if(l!==void 0)if(Array.isArray(o))for(let g=0,_=d.length;g<_;g++){let m=d[g],u=o[m.materialIndex],y=Math.max(m.start,p.start),v=Math.min(l.count,Math.min(m.start+m.count,p.start+p.count));for(let M=y,A=v;M<A;M+=3){let S=M,w=M+1,P=M+2;s=rr(this,u,t,n,c,f,h,S,w,P),s&&(s.faceIndex=Math.floor(M/3),s.face.materialIndex=m.materialIndex,e.push(s))}}else{let g=Math.max(0,p.start),_=Math.min(l.count,p.start+p.count);for(let m=g,u=_;m<u;m+=3){let y=m,v=m+1,M=m+2;s=rr(this,o,t,n,c,f,h,y,v,M),s&&(s.faceIndex=Math.floor(m/3),e.push(s))}}}};function Af(i,t,e,n,s,r,o,a){let l;if(t.side===je?l=n.intersectTriangle(o,r,s,!0,a):l=n.intersectTriangle(s,r,o,t.side===Jn,a),l===null)return null;sr.copy(a),sr.applyMatrix4(i.matrixWorld);let c=e.ray.origin.distanceTo(sr);return c<e.near||c>e.far?null:{distance:c,point:sr.clone(),object:i}}function rr(i,t,e,n,s,r,o,a,l,c){i.getVertexPosition(a,tr),i.getVertexPosition(l,er),i.getVertexPosition(c,nr);let f=Af(i,t,e,n,tr,er,nr,Dc);if(f){let h=new U;ui.getBarycoord(Dc,tr,er,nr,h),s&&(f.uv=ui.getInterpolatedAttribute(s,a,l,c,h,new Mt)),r&&(f.uv1=ui.getInterpolatedAttribute(r,a,l,c,h,new Mt)),o&&(f.normal=ui.getInterpolatedAttribute(o,a,l,c,h,new U),f.normal.dot(n.direction)>0&&f.normal.multiplyScalar(-1));let d={a,b:l,c,normal:new U,materialIndex:0};ui.getNormal(tr,er,nr,d.normal),f.face=d,f.barycoord=h}return f}var Kt=class i extends Ee{constructor(t=1,e=1,n=1,s=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:n,widthSegments:s,heightSegments:r,depthSegments:o};let a=this;s=Math.floor(s),r=Math.floor(r),o=Math.floor(o);let l=[],c=[],f=[],h=[],d=0,p=0;g("z","y","x",-1,-1,n,e,t,o,r,0),g("z","y","x",1,-1,n,e,-t,o,r,1),g("x","z","y",1,1,t,n,e,s,o,2),g("x","z","y",1,-1,t,n,-e,s,o,3),g("x","y","z",1,-1,t,e,n,s,r,4),g("x","y","z",-1,-1,t,e,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new ee(c,3)),this.setAttribute("normal",new ee(f,3)),this.setAttribute("uv",new ee(h,2));function g(_,m,u,y,v,M,A,S,w,P,D){let x=M/w,E=A/P,N=M/2,z=A/2,I=S/2,V=w+1,F=P+1,Q=0,Y=0,X=new U;for(let it=0;it<F;it++){let rt=it*E-z;for(let bt=0;bt<V;bt++){let It=bt*x-N;X[_]=It*y,X[m]=rt*v,X[u]=I,c.push(X.x,X.y,X.z),X[_]=0,X[m]=0,X[u]=S>0?1:-1,f.push(X.x,X.y,X.z),h.push(bt/w),h.push(1-it/P),Q+=1}}for(let it=0;it<P;it++)for(let rt=0;rt<w;rt++){let bt=d+rt+V*it,It=d+rt+V*(it+1),K=d+(rt+1)+V*(it+1),lt=d+(rt+1)+V*it;l.push(bt,It,lt),l.push(It,K,lt),Y+=6}a.addGroup(p,Y,D),p+=Y,d+=Q}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}};function Zi(i){let t={};for(let e in i){t[e]={};for(let n in i[e]){let s=i[e][n];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][n]=null):t[e][n]=s.clone():Array.isArray(s)?t[e][n]=s.slice():t[e][n]=s}}return t}function ke(i){let t={};for(let e=0;e<i.length;e++){let n=Zi(i[e]);for(let s in n)t[s]=n[s]}return t}function Rf(i){let t=[];for(let e=0;e<i.length;e++)t.push(i[e].clone());return t}function Nh(i){let t=i.getRenderTarget();return t===null?i.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:he.workingColorSpace}var Cf={clone:Zi,merge:ke},Pf=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,If=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,bn=class extends Qn{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Pf,this.fragmentShader=If,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=Zi(t.uniforms),this.uniformsGroups=Rf(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this}toJSON(t){let e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(let s in this.uniforms){let o=this.uniforms[s].value;o&&o.isTexture?e.uniforms[s]={type:"t",value:o.toJSON(t).uuid}:o&&o.isColor?e.uniforms[s]={type:"c",value:o.getHex()}:o&&o.isVector2?e.uniforms[s]={type:"v2",value:o.toArray()}:o&&o.isVector3?e.uniforms[s]={type:"v3",value:o.toArray()}:o&&o.isVector4?e.uniforms[s]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?e.uniforms[s]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?e.uniforms[s]={type:"m4",value:o.toArray()}:e.uniforms[s]={value:o}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;let n={};for(let s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(e.extensions=n),e}},Dr=class extends Re{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Xt,this.projectionMatrix=new Xt,this.projectionMatrixInverse=new Xt,this.coordinateSystem=Fn}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(t,e){super.updateWorldMatrix(t,e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}},Yn=new U,Uc=new Mt,Nc=new Mt,Ge=class extends Dr{constructor(t=50,e=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){let e=.5*this.getFilmHeight()/t;this.fov=Ha*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){let t=Math.tan(Mo*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return Ha*2*Math.atan(Math.tan(Mo*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,n){Yn.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(Yn.x,Yn.y).multiplyScalar(-t/Yn.z),Yn.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Yn.x,Yn.y).multiplyScalar(-t/Yn.z)}getViewSize(t,e){return this.getViewBounds(t,Uc,Nc),e.subVectors(Nc,Uc)}setViewOffset(t,e,n,s,r,o){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=this.near,e=t*Math.tan(Mo*.5*this.fov)/this.zoom,n=2*e,s=this.aspect*n,r=-.5*s,o=this.view;if(this.view!==null&&this.view.enabled){let l=o.fullWidth,c=o.fullHeight;r+=o.offsetX*s/l,e-=o.offsetY*n/c,s*=o.width/l,n*=o.height/c}let a=this.filmOffset;a!==0&&(r+=t*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,e,e-n,t,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}},Di=-90,Ui=1,Va=class extends Re{constructor(t,e,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new Ge(Di,Ui,t,e);s.layers=this.layers,this.add(s);let r=new Ge(Di,Ui,t,e);r.layers=this.layers,this.add(r);let o=new Ge(Di,Ui,t,e);o.layers=this.layers,this.add(o);let a=new Ge(Di,Ui,t,e);a.layers=this.layers,this.add(a);let l=new Ge(Di,Ui,t,e);l.layers=this.layers,this.add(l);let c=new Ge(Di,Ui,t,e);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let t=this.coordinateSystem,e=this.children.concat(),[n,s,r,o,a,l]=e;for(let c of e)this.remove(c);if(t===Fn)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(t===Rr)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(let c of e)this.add(c),c.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());let[r,o,a,l,c,f]=this.children,h=t.getRenderTarget(),d=t.getActiveCubeFace(),p=t.getActiveMipmapLevel(),g=t.xr.enabled;t.xr.enabled=!1;let _=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,t.setRenderTarget(n,0,s),t.render(e,r),t.setRenderTarget(n,1,s),t.render(e,o),t.setRenderTarget(n,2,s),t.render(e,a),t.setRenderTarget(n,3,s),t.render(e,l),t.setRenderTarget(n,4,s),t.render(e,c),n.texture.generateMipmaps=_,t.setRenderTarget(n,5,s),t.render(e,f),t.setRenderTarget(h,d,p),t.xr.enabled=g,n.texture.needsPMREMUpdate=!0}},Ur=class extends Ve{constructor(t,e,n,s,r,o,a,l,c,f){t=t!==void 0?t:[],e=e!==void 0?e:Wi,super(t,e,n,s,r,o,a,l,c,f),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}},Wa=class extends On{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;let n={width:t,height:t,depth:1},s=[n,n,n,n,n,n];this.texture=new Ur(s,e.mapping,e.wrapS,e.wrapT,e.magFilter,e.minFilter,e.format,e.type,e.anisotropy,e.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=e.generateMipmaps!==void 0?e.generateMipmaps:!1,this.texture.minFilter=e.minFilter!==void 0?e.minFilter:xn}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new Kt(5,5,5),r=new bn({name:"CubemapFromEquirect",uniforms:Zi(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:je,blending:En});r.uniforms.tEquirect.value=e;let o=new ut(s,r),a=e.minFilter;return e.minFilter===pi&&(e.minFilter=xn),new Va(1,10,this).update(t,o),e.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(t,e,n,s){let r=t.getRenderTarget();for(let o=0;o<6;o++)t.setRenderTarget(this,o),t.clear(e,n,s);t.setRenderTarget(r)}},Vo=new U,Lf=new U,Df=new te,gn=class{constructor(t=new U(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,n,s){return this.normal.set(t,e,n),this.constant=s,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,n){let s=Vo.subVectors(n,e).cross(Lf.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(s,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){let t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e){let n=t.delta(Vo),s=this.normal.dot(n);if(s===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;let r=-(t.start.dot(this.normal)+this.constant)/s;return r<0||r>1?null:e.copy(t.start).addScaledVector(n,r)}intersectsLine(t){let e=this.distanceToPoint(t.start),n=this.distanceToPoint(t.end);return e<0&&n>0||n<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){let n=e||Df.getNormalMatrix(t),s=this.coplanarPoint(Vo).applyMatrix4(t),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}},oi=new Sn,or=new U,gi=class{constructor(t=new gn,e=new gn,n=new gn,s=new gn,r=new gn,o=new gn){this.planes=[t,e,n,s,r,o]}set(t,e,n,s,r,o){let a=this.planes;return a[0].copy(t),a[1].copy(e),a[2].copy(n),a[3].copy(s),a[4].copy(r),a[5].copy(o),this}copy(t){let e=this.planes;for(let n=0;n<6;n++)e[n].copy(t.planes[n]);return this}setFromProjectionMatrix(t,e=Fn){let n=this.planes,s=t.elements,r=s[0],o=s[1],a=s[2],l=s[3],c=s[4],f=s[5],h=s[6],d=s[7],p=s[8],g=s[9],_=s[10],m=s[11],u=s[12],y=s[13],v=s[14],M=s[15];if(n[0].setComponents(l-r,d-c,m-p,M-u).normalize(),n[1].setComponents(l+r,d+c,m+p,M+u).normalize(),n[2].setComponents(l+o,d+f,m+g,M+y).normalize(),n[3].setComponents(l-o,d-f,m-g,M-y).normalize(),n[4].setComponents(l-a,d-h,m-_,M-v).normalize(),e===Fn)n[5].setComponents(l+a,d+h,m+_,M+v).normalize();else if(e===Rr)n[5].setComponents(a,h,_,v).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),oi.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{let e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),oi.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(oi)}intersectsSprite(t){return oi.center.set(0,0,0),oi.radius=.7071067811865476,oi.applyMatrix4(t.matrixWorld),this.intersectsSphere(oi)}intersectsSphere(t){let e=this.planes,n=t.center,s=-t.radius;for(let r=0;r<6;r++)if(e[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(t){let e=this.planes;for(let n=0;n<6;n++){let s=e[n];if(or.x=s.normal.x>0?t.max.x:t.min.x,or.y=s.normal.y>0?t.max.y:t.min.y,or.z=s.normal.z>0?t.max.z:t.min.z,s.distanceToPoint(or)<0)return!1}return!0}containsPoint(t){let e=this.planes;for(let n=0;n<6;n++)if(e[n].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};function Fh(){let i=null,t=!1,e=null,n=null;function s(r,o){e(r,o),n=i.requestAnimationFrame(s)}return{start:function(){t!==!0&&e!==null&&(n=i.requestAnimationFrame(s),t=!0)},stop:function(){i.cancelAnimationFrame(n),t=!1},setAnimationLoop:function(r){e=r},setContext:function(r){i=r}}}function Uf(i){let t=new WeakMap;function e(a,l){let c=a.array,f=a.usage,h=c.byteLength,d=i.createBuffer();i.bindBuffer(l,d),i.bufferData(l,c,f),a.onUploadCallback();let p;if(c instanceof Float32Array)p=i.FLOAT;else if(c instanceof Uint16Array)a.isFloat16BufferAttribute?p=i.HALF_FLOAT:p=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)p=i.SHORT;else if(c instanceof Uint32Array)p=i.UNSIGNED_INT;else if(c instanceof Int32Array)p=i.INT;else if(c instanceof Int8Array)p=i.BYTE;else if(c instanceof Uint8Array)p=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)p=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:d,type:p,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:h}}function n(a,l,c){let f=l.array,h=l.updateRanges;if(i.bindBuffer(c,a),h.length===0)i.bufferSubData(c,0,f);else{h.sort((p,g)=>p.start-g.start);let d=0;for(let p=1;p<h.length;p++){let g=h[d],_=h[p];_.start<=g.start+g.count+1?g.count=Math.max(g.count,_.start+_.count-g.start):(++d,h[d]=_)}h.length=d+1;for(let p=0,g=h.length;p<g;p++){let _=h[p];i.bufferSubData(c,_.start*f.BYTES_PER_ELEMENT,f,_.start,_.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(a){return a.isInterleavedBufferAttribute&&(a=a.data),t.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);let l=t.get(a);l&&(i.deleteBuffer(l.buffer),t.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){let f=t.get(a);(!f||f.version<a.version)&&t.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}let c=t.get(a);if(c===void 0)t.set(a,e(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,a,l),c.version=a.version}}return{get:s,remove:r,update:o}}var ie=class i extends Ee{constructor(t=1,e=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:n,heightSegments:s};let r=t/2,o=e/2,a=Math.floor(n),l=Math.floor(s),c=a+1,f=l+1,h=t/a,d=e/l,p=[],g=[],_=[],m=[];for(let u=0;u<f;u++){let y=u*d-o;for(let v=0;v<c;v++){let M=v*h-r;g.push(M,-y,0),_.push(0,0,1),m.push(v/a),m.push(1-u/l)}}for(let u=0;u<l;u++)for(let y=0;y<a;y++){let v=y+c*u,M=y+c*(u+1),A=y+1+c*(u+1),S=y+1+c*u;p.push(v,M,S),p.push(M,A,S)}this.setIndex(p),this.setAttribute("position",new ee(g,3)),this.setAttribute("normal",new ee(_,3)),this.setAttribute("uv",new ee(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.width,t.height,t.widthSegments,t.heightSegments)}},Nf=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Ff=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,zf=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Of=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Hf=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Bf=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,kf=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,Gf=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Vf=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,Wf=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Xf=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,qf=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Yf=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,Zf=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,$f=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,Jf=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,Kf=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,jf=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Qf=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,td=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,ed=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,nd=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,id=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,sd=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,rd=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,od=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,ad=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,ld=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,cd=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,hd=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,ud="gl_FragColor = linearToOutputTexel( gl_FragColor );",fd=`
const mat3 LINEAR_SRGB_TO_LINEAR_DISPLAY_P3 = mat3(
	vec3( 0.8224621, 0.177538, 0.0 ),
	vec3( 0.0331941, 0.9668058, 0.0 ),
	vec3( 0.0170827, 0.0723974, 0.9105199 )
);
const mat3 LINEAR_DISPLAY_P3_TO_LINEAR_SRGB = mat3(
	vec3( 1.2249401, - 0.2249404, 0.0 ),
	vec3( - 0.0420569, 1.0420571, 0.0 ),
	vec3( - 0.0196376, - 0.0786361, 1.0982735 )
);
vec4 LinearSRGBToLinearDisplayP3( in vec4 value ) {
	return vec4( value.rgb * LINEAR_SRGB_TO_LINEAR_DISPLAY_P3, value.a );
}
vec4 LinearDisplayP3ToLinearSRGB( in vec4 value ) {
	return vec4( value.rgb * LINEAR_DISPLAY_P3_TO_LINEAR_SRGB, value.a );
}
vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,dd=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,pd=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,md=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,gd=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,xd=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,yd=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,_d=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,vd=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Md=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Ed=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,Sd=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,bd=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,wd=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Td=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,Ad=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,Rd=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Cd=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Pd=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Id=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Ld=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Dd=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Ud=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Nd=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,Fd=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,zd=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Od=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Hd=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Bd=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,kd=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Gd=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Vd=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Wd=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Xd=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,qd=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Yd=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Zd=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,$d=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Jd=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,Kd=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,jd=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,Qd=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,tp=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,ep=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,np=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,ip=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,sp=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,rp=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,op=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,ap=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,lp=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,cp=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,hp=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,up=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,fp=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,dp=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,pp=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,mp=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,gp=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,xp=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,yp=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,_p=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,vp=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Mp=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,Ep=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Sp=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,bp=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,wp=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Tp=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Ap=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,Rp=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,Cp=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
		
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
		
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		
		#else
		
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,Pp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Ip=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Lp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,Dp=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,Up=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Np=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Fp=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,zp=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Op=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Hp=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Bp=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,kp=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,Gp=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,Vp=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,Wp=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Xp=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,qp=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Yp=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Zp=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,$p=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Jp=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Kp=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,jp=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,Qp=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,t0=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,e0=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,n0=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,i0=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,s0=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,r0=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,o0=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,a0=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,l0=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,c0=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,h0=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,u0=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,f0=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,d0=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Qt={alphahash_fragment:Nf,alphahash_pars_fragment:Ff,alphamap_fragment:zf,alphamap_pars_fragment:Of,alphatest_fragment:Hf,alphatest_pars_fragment:Bf,aomap_fragment:kf,aomap_pars_fragment:Gf,batching_pars_vertex:Vf,batching_vertex:Wf,begin_vertex:Xf,beginnormal_vertex:qf,bsdfs:Yf,iridescence_fragment:Zf,bumpmap_pars_fragment:$f,clipping_planes_fragment:Jf,clipping_planes_pars_fragment:Kf,clipping_planes_pars_vertex:jf,clipping_planes_vertex:Qf,color_fragment:td,color_pars_fragment:ed,color_pars_vertex:nd,color_vertex:id,common:sd,cube_uv_reflection_fragment:rd,defaultnormal_vertex:od,displacementmap_pars_vertex:ad,displacementmap_vertex:ld,emissivemap_fragment:cd,emissivemap_pars_fragment:hd,colorspace_fragment:ud,colorspace_pars_fragment:fd,envmap_fragment:dd,envmap_common_pars_fragment:pd,envmap_pars_fragment:md,envmap_pars_vertex:gd,envmap_physical_pars_fragment:Ad,envmap_vertex:xd,fog_vertex:yd,fog_pars_vertex:_d,fog_fragment:vd,fog_pars_fragment:Md,gradientmap_pars_fragment:Ed,lightmap_pars_fragment:Sd,lights_lambert_fragment:bd,lights_lambert_pars_fragment:wd,lights_pars_begin:Td,lights_toon_fragment:Rd,lights_toon_pars_fragment:Cd,lights_phong_fragment:Pd,lights_phong_pars_fragment:Id,lights_physical_fragment:Ld,lights_physical_pars_fragment:Dd,lights_fragment_begin:Ud,lights_fragment_maps:Nd,lights_fragment_end:Fd,logdepthbuf_fragment:zd,logdepthbuf_pars_fragment:Od,logdepthbuf_pars_vertex:Hd,logdepthbuf_vertex:Bd,map_fragment:kd,map_pars_fragment:Gd,map_particle_fragment:Vd,map_particle_pars_fragment:Wd,metalnessmap_fragment:Xd,metalnessmap_pars_fragment:qd,morphinstance_vertex:Yd,morphcolor_vertex:Zd,morphnormal_vertex:$d,morphtarget_pars_vertex:Jd,morphtarget_vertex:Kd,normal_fragment_begin:jd,normal_fragment_maps:Qd,normal_pars_fragment:tp,normal_pars_vertex:ep,normal_vertex:np,normalmap_pars_fragment:ip,clearcoat_normal_fragment_begin:sp,clearcoat_normal_fragment_maps:rp,clearcoat_pars_fragment:op,iridescence_pars_fragment:ap,opaque_fragment:lp,packing:cp,premultiplied_alpha_fragment:hp,project_vertex:up,dithering_fragment:fp,dithering_pars_fragment:dp,roughnessmap_fragment:pp,roughnessmap_pars_fragment:mp,shadowmap_pars_fragment:gp,shadowmap_pars_vertex:xp,shadowmap_vertex:yp,shadowmask_pars_fragment:_p,skinbase_vertex:vp,skinning_pars_vertex:Mp,skinning_vertex:Ep,skinnormal_vertex:Sp,specularmap_fragment:bp,specularmap_pars_fragment:wp,tonemapping_fragment:Tp,tonemapping_pars_fragment:Ap,transmission_fragment:Rp,transmission_pars_fragment:Cp,uv_pars_fragment:Pp,uv_pars_vertex:Ip,uv_vertex:Lp,worldpos_vertex:Dp,background_vert:Up,background_frag:Np,backgroundCube_vert:Fp,backgroundCube_frag:zp,cube_vert:Op,cube_frag:Hp,depth_vert:Bp,depth_frag:kp,distanceRGBA_vert:Gp,distanceRGBA_frag:Vp,equirect_vert:Wp,equirect_frag:Xp,linedashed_vert:qp,linedashed_frag:Yp,meshbasic_vert:Zp,meshbasic_frag:$p,meshlambert_vert:Jp,meshlambert_frag:Kp,meshmatcap_vert:jp,meshmatcap_frag:Qp,meshnormal_vert:t0,meshnormal_frag:e0,meshphong_vert:n0,meshphong_frag:i0,meshphysical_vert:s0,meshphysical_frag:r0,meshtoon_vert:o0,meshtoon_frag:a0,points_vert:l0,points_frag:c0,shadow_vert:h0,shadow_frag:u0,sprite_vert:f0,sprite_frag:d0},Tt={common:{diffuse:{value:new Gt(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new te},alphaMap:{value:null},alphaMapTransform:{value:new te},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new te}},envmap:{envMap:{value:null},envMapRotation:{value:new te},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new te}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new te}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new te},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new te},normalScale:{value:new Mt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new te},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new te}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new te}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new te}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Gt(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Gt(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new te},alphaTest:{value:0},uvTransform:{value:new te}},sprite:{diffuse:{value:new Gt(16777215)},opacity:{value:1},center:{value:new Mt(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new te},alphaMap:{value:null},alphaMapTransform:{value:new te},alphaTest:{value:0}}},vn={basic:{uniforms:ke([Tt.common,Tt.specularmap,Tt.envmap,Tt.aomap,Tt.lightmap,Tt.fog]),vertexShader:Qt.meshbasic_vert,fragmentShader:Qt.meshbasic_frag},lambert:{uniforms:ke([Tt.common,Tt.specularmap,Tt.envmap,Tt.aomap,Tt.lightmap,Tt.emissivemap,Tt.bumpmap,Tt.normalmap,Tt.displacementmap,Tt.fog,Tt.lights,{emissive:{value:new Gt(0)}}]),vertexShader:Qt.meshlambert_vert,fragmentShader:Qt.meshlambert_frag},phong:{uniforms:ke([Tt.common,Tt.specularmap,Tt.envmap,Tt.aomap,Tt.lightmap,Tt.emissivemap,Tt.bumpmap,Tt.normalmap,Tt.displacementmap,Tt.fog,Tt.lights,{emissive:{value:new Gt(0)},specular:{value:new Gt(1118481)},shininess:{value:30}}]),vertexShader:Qt.meshphong_vert,fragmentShader:Qt.meshphong_frag},standard:{uniforms:ke([Tt.common,Tt.envmap,Tt.aomap,Tt.lightmap,Tt.emissivemap,Tt.bumpmap,Tt.normalmap,Tt.displacementmap,Tt.roughnessmap,Tt.metalnessmap,Tt.fog,Tt.lights,{emissive:{value:new Gt(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Qt.meshphysical_vert,fragmentShader:Qt.meshphysical_frag},toon:{uniforms:ke([Tt.common,Tt.aomap,Tt.lightmap,Tt.emissivemap,Tt.bumpmap,Tt.normalmap,Tt.displacementmap,Tt.gradientmap,Tt.fog,Tt.lights,{emissive:{value:new Gt(0)}}]),vertexShader:Qt.meshtoon_vert,fragmentShader:Qt.meshtoon_frag},matcap:{uniforms:ke([Tt.common,Tt.bumpmap,Tt.normalmap,Tt.displacementmap,Tt.fog,{matcap:{value:null}}]),vertexShader:Qt.meshmatcap_vert,fragmentShader:Qt.meshmatcap_frag},points:{uniforms:ke([Tt.points,Tt.fog]),vertexShader:Qt.points_vert,fragmentShader:Qt.points_frag},dashed:{uniforms:ke([Tt.common,Tt.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Qt.linedashed_vert,fragmentShader:Qt.linedashed_frag},depth:{uniforms:ke([Tt.common,Tt.displacementmap]),vertexShader:Qt.depth_vert,fragmentShader:Qt.depth_frag},normal:{uniforms:ke([Tt.common,Tt.bumpmap,Tt.normalmap,Tt.displacementmap,{opacity:{value:1}}]),vertexShader:Qt.meshnormal_vert,fragmentShader:Qt.meshnormal_frag},sprite:{uniforms:ke([Tt.sprite,Tt.fog]),vertexShader:Qt.sprite_vert,fragmentShader:Qt.sprite_frag},background:{uniforms:{uvTransform:{value:new te},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Qt.background_vert,fragmentShader:Qt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new te}},vertexShader:Qt.backgroundCube_vert,fragmentShader:Qt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Qt.cube_vert,fragmentShader:Qt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Qt.equirect_vert,fragmentShader:Qt.equirect_frag},distanceRGBA:{uniforms:ke([Tt.common,Tt.displacementmap,{referencePosition:{value:new U},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Qt.distanceRGBA_vert,fragmentShader:Qt.distanceRGBA_frag},shadow:{uniforms:ke([Tt.lights,Tt.fog,{color:{value:new Gt(0)},opacity:{value:1}}]),vertexShader:Qt.shadow_vert,fragmentShader:Qt.shadow_frag}};vn.physical={uniforms:ke([vn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new te},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new te},clearcoatNormalScale:{value:new Mt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new te},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new te},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new te},sheen:{value:0},sheenColor:{value:new Gt(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new te},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new te},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new te},transmissionSamplerSize:{value:new Mt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new te},attenuationDistance:{value:0},attenuationColor:{value:new Gt(0)},specularColor:{value:new Gt(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new te},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new te},anisotropyVector:{value:new Mt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new te}}]),vertexShader:Qt.meshphysical_vert,fragmentShader:Qt.meshphysical_frag};var ar={r:0,b:0,g:0},ai=new Xe,p0=new Xt;function m0(i,t,e,n,s,r,o){let a=new Gt(0),l=r===!0?0:1,c,f,h=null,d=0,p=null;function g(y){let v=y.isScene===!0?y.background:null;return v&&v.isTexture&&(v=(y.backgroundBlurriness>0?e:t).get(v)),v}function _(y){let v=!1,M=g(y);M===null?u(a,l):M&&M.isColor&&(u(M,1),v=!0);let A=i.xr.getEnvironmentBlendMode();A==="additive"?n.buffers.color.setClear(0,0,0,1,o):A==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,o),(i.autoClear||v)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function m(y,v){let M=g(v);M&&(M.isCubeTexture||M.mapping===jr)?(f===void 0&&(f=new ut(new Kt(1,1,1),new bn({name:"BackgroundCubeMaterial",uniforms:Zi(vn.backgroundCube.uniforms),vertexShader:vn.backgroundCube.vertexShader,fragmentShader:vn.backgroundCube.fragmentShader,side:je,depthTest:!1,depthWrite:!1,fog:!1})),f.geometry.deleteAttribute("normal"),f.geometry.deleteAttribute("uv"),f.onBeforeRender=function(A,S,w){this.matrixWorld.copyPosition(w.matrixWorld)},Object.defineProperty(f.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(f)),ai.copy(v.backgroundRotation),ai.x*=-1,ai.y*=-1,ai.z*=-1,M.isCubeTexture&&M.isRenderTargetTexture===!1&&(ai.y*=-1,ai.z*=-1),f.material.uniforms.envMap.value=M,f.material.uniforms.flipEnvMap.value=M.isCubeTexture&&M.isRenderTargetTexture===!1?-1:1,f.material.uniforms.backgroundBlurriness.value=v.backgroundBlurriness,f.material.uniforms.backgroundIntensity.value=v.backgroundIntensity,f.material.uniforms.backgroundRotation.value.setFromMatrix4(p0.makeRotationFromEuler(ai)),f.material.toneMapped=he.getTransfer(M.colorSpace)!==pe,(h!==M||d!==M.version||p!==i.toneMapping)&&(f.material.needsUpdate=!0,h=M,d=M.version,p=i.toneMapping),f.layers.enableAll(),y.unshift(f,f.geometry,f.material,0,0,null)):M&&M.isTexture&&(c===void 0&&(c=new ut(new ie(2,2),new bn({name:"BackgroundMaterial",uniforms:Zi(vn.background.uniforms),vertexShader:vn.background.vertexShader,fragmentShader:vn.background.fragmentShader,side:Jn,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(c)),c.material.uniforms.t2D.value=M,c.material.uniforms.backgroundIntensity.value=v.backgroundIntensity,c.material.toneMapped=he.getTransfer(M.colorSpace)!==pe,M.matrixAutoUpdate===!0&&M.updateMatrix(),c.material.uniforms.uvTransform.value.copy(M.matrix),(h!==M||d!==M.version||p!==i.toneMapping)&&(c.material.needsUpdate=!0,h=M,d=M.version,p=i.toneMapping),c.layers.enableAll(),y.unshift(c,c.geometry,c.material,0,0,null))}function u(y,v){y.getRGB(ar,Nh(i)),n.buffers.color.setClear(ar.r,ar.g,ar.b,v,o)}return{getClearColor:function(){return a},setClearColor:function(y,v=1){a.set(y),l=v,u(a,l)},getClearAlpha:function(){return l},setClearAlpha:function(y){l=y,u(a,l)},render:_,addToRenderList:m}}function g0(i,t){let e=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=d(null),r=s,o=!1;function a(x,E,N,z,I){let V=!1,F=h(z,N,E);r!==F&&(r=F,c(r.object)),V=p(x,z,N,I),V&&g(x,z,N,I),I!==null&&t.update(I,i.ELEMENT_ARRAY_BUFFER),(V||o)&&(o=!1,M(x,E,N,z),I!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,t.get(I).buffer))}function l(){return i.createVertexArray()}function c(x){return i.bindVertexArray(x)}function f(x){return i.deleteVertexArray(x)}function h(x,E,N){let z=N.wireframe===!0,I=n[x.id];I===void 0&&(I={},n[x.id]=I);let V=I[E.id];V===void 0&&(V={},I[E.id]=V);let F=V[z];return F===void 0&&(F=d(l()),V[z]=F),F}function d(x){let E=[],N=[],z=[];for(let I=0;I<e;I++)E[I]=0,N[I]=0,z[I]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:E,enabledAttributes:N,attributeDivisors:z,object:x,attributes:{},index:null}}function p(x,E,N,z){let I=r.attributes,V=E.attributes,F=0,Q=N.getAttributes();for(let Y in Q)if(Q[Y].location>=0){let it=I[Y],rt=V[Y];if(rt===void 0&&(Y==="instanceMatrix"&&x.instanceMatrix&&(rt=x.instanceMatrix),Y==="instanceColor"&&x.instanceColor&&(rt=x.instanceColor)),it===void 0||it.attribute!==rt||rt&&it.data!==rt.data)return!0;F++}return r.attributesNum!==F||r.index!==z}function g(x,E,N,z){let I={},V=E.attributes,F=0,Q=N.getAttributes();for(let Y in Q)if(Q[Y].location>=0){let it=V[Y];it===void 0&&(Y==="instanceMatrix"&&x.instanceMatrix&&(it=x.instanceMatrix),Y==="instanceColor"&&x.instanceColor&&(it=x.instanceColor));let rt={};rt.attribute=it,it&&it.data&&(rt.data=it.data),I[Y]=rt,F++}r.attributes=I,r.attributesNum=F,r.index=z}function _(){let x=r.newAttributes;for(let E=0,N=x.length;E<N;E++)x[E]=0}function m(x){u(x,0)}function u(x,E){let N=r.newAttributes,z=r.enabledAttributes,I=r.attributeDivisors;N[x]=1,z[x]===0&&(i.enableVertexAttribArray(x),z[x]=1),I[x]!==E&&(i.vertexAttribDivisor(x,E),I[x]=E)}function y(){let x=r.newAttributes,E=r.enabledAttributes;for(let N=0,z=E.length;N<z;N++)E[N]!==x[N]&&(i.disableVertexAttribArray(N),E[N]=0)}function v(x,E,N,z,I,V,F){F===!0?i.vertexAttribIPointer(x,E,N,I,V):i.vertexAttribPointer(x,E,N,z,I,V)}function M(x,E,N,z){_();let I=z.attributes,V=N.getAttributes(),F=E.defaultAttributeValues;for(let Q in V){let Y=V[Q];if(Y.location>=0){let X=I[Q];if(X===void 0&&(Q==="instanceMatrix"&&x.instanceMatrix&&(X=x.instanceMatrix),Q==="instanceColor"&&x.instanceColor&&(X=x.instanceColor)),X!==void 0){let it=X.normalized,rt=X.itemSize,bt=t.get(X);if(bt===void 0)continue;let It=bt.buffer,K=bt.type,lt=bt.bytesPerElement,pt=K===i.INT||K===i.UNSIGNED_INT||X.gpuType===Cl;if(X.isInterleavedBufferAttribute){let yt=X.data,Nt=yt.stride,Ot=X.offset;if(yt.isInstancedInterleavedBuffer){for(let Vt=0;Vt<Y.locationSize;Vt++)u(Y.location+Vt,yt.meshPerAttribute);x.isInstancedMesh!==!0&&z._maxInstanceCount===void 0&&(z._maxInstanceCount=yt.meshPerAttribute*yt.count)}else for(let Vt=0;Vt<Y.locationSize;Vt++)m(Y.location+Vt);i.bindBuffer(i.ARRAY_BUFFER,It);for(let Vt=0;Vt<Y.locationSize;Vt++)v(Y.location+Vt,rt/Y.locationSize,K,it,Nt*lt,(Ot+rt/Y.locationSize*Vt)*lt,pt)}else{if(X.isInstancedBufferAttribute){for(let yt=0;yt<Y.locationSize;yt++)u(Y.location+yt,X.meshPerAttribute);x.isInstancedMesh!==!0&&z._maxInstanceCount===void 0&&(z._maxInstanceCount=X.meshPerAttribute*X.count)}else for(let yt=0;yt<Y.locationSize;yt++)m(Y.location+yt);i.bindBuffer(i.ARRAY_BUFFER,It);for(let yt=0;yt<Y.locationSize;yt++)v(Y.location+yt,rt/Y.locationSize,K,it,rt*lt,rt/Y.locationSize*yt*lt,pt)}}else if(F!==void 0){let it=F[Q];if(it!==void 0)switch(it.length){case 2:i.vertexAttrib2fv(Y.location,it);break;case 3:i.vertexAttrib3fv(Y.location,it);break;case 4:i.vertexAttrib4fv(Y.location,it);break;default:i.vertexAttrib1fv(Y.location,it)}}}}y()}function A(){P();for(let x in n){let E=n[x];for(let N in E){let z=E[N];for(let I in z)f(z[I].object),delete z[I];delete E[N]}delete n[x]}}function S(x){if(n[x.id]===void 0)return;let E=n[x.id];for(let N in E){let z=E[N];for(let I in z)f(z[I].object),delete z[I];delete E[N]}delete n[x.id]}function w(x){for(let E in n){let N=n[E];if(N[x.id]===void 0)continue;let z=N[x.id];for(let I in z)f(z[I].object),delete z[I];delete N[x.id]}}function P(){D(),o=!0,r!==s&&(r=s,c(r.object))}function D(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:a,reset:P,resetDefaultState:D,dispose:A,releaseStatesOfGeometry:S,releaseStatesOfProgram:w,initAttributes:_,enableAttribute:m,disableUnusedAttributes:y}}function x0(i,t,e){let n;function s(c){n=c}function r(c,f){i.drawArrays(n,c,f),e.update(f,n,1)}function o(c,f,h){h!==0&&(i.drawArraysInstanced(n,c,f,h),e.update(f,n,h))}function a(c,f,h){if(h===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,f,0,h);let p=0;for(let g=0;g<h;g++)p+=f[g];e.update(p,n,1)}function l(c,f,h,d){if(h===0)return;let p=t.get("WEBGL_multi_draw");if(p===null)for(let g=0;g<c.length;g++)o(c[g],f[g],d[g]);else{p.multiDrawArraysInstancedWEBGL(n,c,0,f,0,d,0,h);let g=0;for(let _=0;_<h;_++)g+=f[_];for(let _=0;_<d.length;_++)e.update(g,n,d[_])}}this.setMode=s,this.render=r,this.renderInstances=o,this.renderMultiDraw=a,this.renderMultiDrawInstances=l}function y0(i,t,e,n){let s;function r(){if(s!==void 0)return s;if(t.has("EXT_texture_filter_anisotropic")===!0){let w=t.get("EXT_texture_filter_anisotropic");s=i.getParameter(w.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function o(w){return!(w!==yn&&n.convert(w)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(w){let P=w===Is&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(w!==zn&&n.convert(w)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE)&&w!==Mn&&!P)}function l(w){if(w==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";w="mediump"}return w==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=e.precision!==void 0?e.precision:"highp",f=l(c);f!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",f,"instead."),c=f);let h=e.logarithmicDepthBuffer===!0,d=e.reverseDepthBuffer===!0&&t.has("EXT_clip_control");if(d===!0){let w=t.get("EXT_clip_control");w.clipControlEXT(w.LOWER_LEFT_EXT,w.ZERO_TO_ONE_EXT)}let p=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),g=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),_=i.getParameter(i.MAX_TEXTURE_SIZE),m=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),u=i.getParameter(i.MAX_VERTEX_ATTRIBS),y=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),v=i.getParameter(i.MAX_VARYING_VECTORS),M=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),A=g>0,S=i.getParameter(i.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:h,reverseDepthBuffer:d,maxTextures:p,maxVertexTextures:g,maxTextureSize:_,maxCubemapSize:m,maxAttributes:u,maxVertexUniforms:y,maxVaryings:v,maxFragmentUniforms:M,vertexTextures:A,maxSamples:S}}function _0(i){let t=this,e=null,n=0,s=!1,r=!1,o=new gn,a=new te,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(h,d){let p=h.length!==0||d||n!==0||s;return s=d,n=h.length,p},this.beginShadows=function(){r=!0,f(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(h,d){e=f(h,d,0)},this.setState=function(h,d,p){let g=h.clippingPlanes,_=h.clipIntersection,m=h.clipShadows,u=i.get(h);if(!s||g===null||g.length===0||r&&!m)r?f(null):c();else{let y=r?0:n,v=y*4,M=u.clippingState||null;l.value=M,M=f(g,d,v,p);for(let A=0;A!==v;++A)M[A]=e[A];u.clippingState=M,this.numIntersection=_?this.numPlanes:0,this.numPlanes+=y}};function c(){l.value!==e&&(l.value=e,l.needsUpdate=n>0),t.numPlanes=n,t.numIntersection=0}function f(h,d,p,g){let _=h!==null?h.length:0,m=null;if(_!==0){if(m=l.value,g!==!0||m===null){let u=p+_*4,y=d.matrixWorldInverse;a.getNormalMatrix(y),(m===null||m.length<u)&&(m=new Float32Array(u));for(let v=0,M=p;v!==_;++v,M+=4)o.copy(h[v]).applyMatrix4(y,a),o.normal.toArray(m,M),m[M+3]=o.constant}l.value=m,l.needsUpdate=!0}return t.numPlanes=_,t.numIntersection=0,m}}function v0(i){let t=new WeakMap;function e(o,a){return a===ca?o.mapping=Wi:a===ha&&(o.mapping=Xi),o}function n(o){if(o&&o.isTexture){let a=o.mapping;if(a===ca||a===ha)if(t.has(o)){let l=t.get(o).texture;return e(l,o.mapping)}else{let l=o.image;if(l&&l.height>0){let c=new Wa(l.height);return c.fromEquirectangularTexture(i,o),t.set(o,c),o.addEventListener("dispose",s),e(c.texture,o.mapping)}else return null}}return o}function s(o){let a=o.target;a.removeEventListener("dispose",s);let l=t.get(a);l!==void 0&&(t.delete(a),l.dispose())}function r(){t=new WeakMap}return{get:n,dispose:r}}var $i=class extends Dr{constructor(t=-1,e=1,n=1,s=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=n,this.bottom=s,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,n,s,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=n-t,o=n+t,a=s+e,l=s-e;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,f=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,o=r+c*this.view.width,a-=f*this.view.offsetY,l=a-f*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}},zi=4,Fc=[.125,.215,.35,.446,.526,.582],fi=20,Wo=new $i,zc=new Gt,Xo=null,qo=0,Yo=0,Zo=!1,ci=(1+Math.sqrt(5))/2,Ni=1/ci,Oc=[new U(-ci,Ni,0),new U(ci,Ni,0),new U(-Ni,0,ci),new U(Ni,0,ci),new U(0,ci,-Ni),new U(0,ci,Ni),new U(-1,1,-1),new U(1,1,-1),new U(-1,1,1),new U(1,1,1)],Nr=class{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(t,e=0,n=.1,s=100){Xo=this._renderer.getRenderTarget(),qo=this._renderer.getActiveCubeFace(),Yo=this._renderer.getActiveMipmapLevel(),Zo=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);let r=this._allocateTargets();return r.depthBuffer=!0,this._sceneToCubeUV(t,n,s,r),e>0&&this._blur(r,0,0,e),this._applyPMREM(r),this._cleanup(r),r}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=kc(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Bc(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodPlanes.length;t++)this._lodPlanes[t].dispose()}_cleanup(t){this._renderer.setRenderTarget(Xo,qo,Yo),this._renderer.xr.enabled=Zo,t.scissorTest=!1,lr(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===Wi||t.mapping===Xi?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),Xo=this._renderer.getRenderTarget(),qo=this._renderer.getActiveCubeFace(),Yo=this._renderer.getActiveMipmapLevel(),Zo=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=e||this._allocateTargets();return this._textureToCubeUV(t,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,n={magFilter:xn,minFilter:xn,generateMipmaps:!1,type:Is,format:yn,colorSpace:ei,depthBuffer:!1},s=Hc(t,e,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Hc(t,e,n);let{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=M0(r)),this._blurMaterial=E0(r,t,e)}return s}_compileMaterial(t){let e=new ut(this._lodPlanes[0],t);this._renderer.compile(e,Wo)}_sceneToCubeUV(t,e,n,s){let a=new Ge(90,1,e,n),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],f=this._renderer,h=f.autoClear,d=f.toneMapping;f.getClearColor(zc),f.toneMapping=$n,f.autoClear=!1;let p=new ne({name:"PMREM.Background",side:je,depthWrite:!1,depthTest:!1}),g=new ut(new Kt,p),_=!1,m=t.background;m?m.isColor&&(p.color.copy(m),t.background=null,_=!0):(p.color.copy(zc),_=!0);for(let u=0;u<6;u++){let y=u%3;y===0?(a.up.set(0,l[u],0),a.lookAt(c[u],0,0)):y===1?(a.up.set(0,0,l[u]),a.lookAt(0,c[u],0)):(a.up.set(0,l[u],0),a.lookAt(0,0,c[u]));let v=this._cubeSize;lr(s,y*v,u>2?v:0,v,v),f.setRenderTarget(s),_&&f.render(g,a),f.render(t,a)}g.geometry.dispose(),g.material.dispose(),f.toneMapping=d,f.autoClear=h,t.background=m}_textureToCubeUV(t,e){let n=this._renderer,s=t.mapping===Wi||t.mapping===Xi;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=kc()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Bc());let r=s?this._cubemapMaterial:this._equirectMaterial,o=new ut(this._lodPlanes[0],r),a=r.uniforms;a.envMap.value=t;let l=this._cubeSize;lr(e,0,0,3*l,2*l),n.setRenderTarget(e),n.render(o,Wo)}_applyPMREM(t){let e=this._renderer,n=e.autoClear;e.autoClear=!1;let s=this._lodPlanes.length;for(let r=1;r<s;r++){let o=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),a=Oc[(s-r-1)%Oc.length];this._blur(t,r-1,r,o,a)}e.autoClear=n}_blur(t,e,n,s,r){let o=this._pingPongRenderTarget;this._halfBlur(t,o,e,n,s,"latitudinal",r),this._halfBlur(o,t,n,n,s,"longitudinal",r)}_halfBlur(t,e,n,s,r,o,a){let l=this._renderer,c=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");let f=3,h=new ut(this._lodPlanes[s],c),d=c.uniforms,p=this._sizeLods[n]-1,g=isFinite(r)?Math.PI/(2*p):2*Math.PI/(2*fi-1),_=r/g,m=isFinite(r)?1+Math.floor(f*_):fi;m>fi&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${fi}`);let u=[],y=0;for(let w=0;w<fi;++w){let P=w/_,D=Math.exp(-P*P/2);u.push(D),w===0?y+=D:w<m&&(y+=2*D)}for(let w=0;w<u.length;w++)u[w]=u[w]/y;d.envMap.value=t.texture,d.samples.value=m,d.weights.value=u,d.latitudinal.value=o==="latitudinal",a&&(d.poleAxis.value=a);let{_lodMax:v}=this;d.dTheta.value=g,d.mipInt.value=v-n;let M=this._sizeLods[s],A=3*M*(s>v-zi?s-v+zi:0),S=4*(this._cubeSize-M);lr(e,A,S,3*M,2*M),l.setRenderTarget(e),l.render(h,Wo)}};function M0(i){let t=[],e=[],n=[],s=i,r=i-zi+1+Fc.length;for(let o=0;o<r;o++){let a=Math.pow(2,s);e.push(a);let l=1/a;o>i-zi?l=Fc[o-i+zi-1]:o===0&&(l=0),n.push(l);let c=1/(a-2),f=-c,h=1+c,d=[f,f,h,f,h,h,f,f,h,h,f,h],p=6,g=6,_=3,m=2,u=1,y=new Float32Array(_*g*p),v=new Float32Array(m*g*p),M=new Float32Array(u*g*p);for(let S=0;S<p;S++){let w=S%3*2/3-1,P=S>2?0:-1,D=[w,P,0,w+2/3,P,0,w+2/3,P+1,0,w,P,0,w+2/3,P+1,0,w,P+1,0];y.set(D,_*g*S),v.set(d,m*g*S);let x=[S,S,S,S,S,S];M.set(x,u*g*S)}let A=new Ee;A.setAttribute("position",new Ae(y,_)),A.setAttribute("uv",new Ae(v,m)),A.setAttribute("faceIndex",new Ae(M,u)),t.push(A),s>zi&&s--}return{lodPlanes:t,sizeLods:e,sigmas:n}}function Hc(i,t,e){let n=new On(i,t,e);return n.texture.mapping=jr,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function lr(i,t,e,n,s){i.viewport.set(t,e,n,s),i.scissor.set(t,e,n,s)}function E0(i,t,e){let n=new Float32Array(fi),s=new U(0,1,0);return new bn({name:"SphericalGaussianBlur",defines:{n:fi,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:zl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:En,depthTest:!1,depthWrite:!1})}function Bc(){return new bn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:zl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:En,depthTest:!1,depthWrite:!1})}function kc(){return new bn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:zl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:En,depthTest:!1,depthWrite:!1})}function zl(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function S0(i){let t=new WeakMap,e=null;function n(a){if(a&&a.isTexture){let l=a.mapping,c=l===ca||l===ha,f=l===Wi||l===Xi;if(c||f){let h=t.get(a),d=h!==void 0?h.texture.pmremVersion:0;if(a.isRenderTargetTexture&&a.pmremVersion!==d)return e===null&&(e=new Nr(i)),h=c?e.fromEquirectangular(a,h):e.fromCubemap(a,h),h.texture.pmremVersion=a.pmremVersion,t.set(a,h),h.texture;if(h!==void 0)return h.texture;{let p=a.image;return c&&p&&p.height>0||f&&p&&s(p)?(e===null&&(e=new Nr(i)),h=c?e.fromEquirectangular(a):e.fromCubemap(a),h.texture.pmremVersion=a.pmremVersion,t.set(a,h),a.addEventListener("dispose",r),h.texture):null}}}return a}function s(a){let l=0,c=6;for(let f=0;f<c;f++)a[f]!==void 0&&l++;return l===c}function r(a){let l=a.target;l.removeEventListener("dispose",r);let c=t.get(l);c!==void 0&&(t.delete(l),c.dispose())}function o(){t=new WeakMap,e!==null&&(e.dispose(),e=null)}return{get:n,dispose:o}}function b0(i){let t={};function e(n){if(t[n]!==void 0)return t[n];let s;switch(n){case"WEBGL_depth_texture":s=i.getExtension("WEBGL_depth_texture")||i.getExtension("MOZ_WEBGL_depth_texture")||i.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":s=i.getExtension("EXT_texture_filter_anisotropic")||i.getExtension("MOZ_EXT_texture_filter_anisotropic")||i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":s=i.getExtension("WEBGL_compressed_texture_s3tc")||i.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":s=i.getExtension("WEBGL_compressed_texture_pvrtc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:s=i.getExtension(n)}return t[n]=s,s}return{has:function(n){return e(n)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(n){let s=e(n);return s===null&&Er("THREE.WebGLRenderer: "+n+" extension not supported."),s}}}function w0(i,t,e,n){let s={},r=new WeakMap;function o(h){let d=h.target;d.index!==null&&t.remove(d.index);for(let g in d.attributes)t.remove(d.attributes[g]);for(let g in d.morphAttributes){let _=d.morphAttributes[g];for(let m=0,u=_.length;m<u;m++)t.remove(_[m])}d.removeEventListener("dispose",o),delete s[d.id];let p=r.get(d);p&&(t.remove(p),r.delete(d)),n.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,e.memory.geometries--}function a(h,d){return s[d.id]===!0||(d.addEventListener("dispose",o),s[d.id]=!0,e.memory.geometries++),d}function l(h){let d=h.attributes;for(let g in d)t.update(d[g],i.ARRAY_BUFFER);let p=h.morphAttributes;for(let g in p){let _=p[g];for(let m=0,u=_.length;m<u;m++)t.update(_[m],i.ARRAY_BUFFER)}}function c(h){let d=[],p=h.index,g=h.attributes.position,_=0;if(p!==null){let y=p.array;_=p.version;for(let v=0,M=y.length;v<M;v+=3){let A=y[v+0],S=y[v+1],w=y[v+2];d.push(A,S,S,w,w,A)}}else if(g!==void 0){let y=g.array;_=g.version;for(let v=0,M=y.length/3-1;v<M;v+=3){let A=v+0,S=v+1,w=v+2;d.push(A,S,S,w,w,A)}}else return;let m=new(Dh(d)?Lr:Ir)(d,1);m.version=_;let u=r.get(h);u&&t.remove(u),r.set(h,m)}function f(h){let d=r.get(h);if(d){let p=h.index;p!==null&&d.version<p.version&&c(h)}else c(h);return r.get(h)}return{get:a,update:l,getWireframeAttribute:f}}function T0(i,t,e){let n;function s(d){n=d}let r,o;function a(d){r=d.type,o=d.bytesPerElement}function l(d,p){i.drawElements(n,p,r,d*o),e.update(p,n,1)}function c(d,p,g){g!==0&&(i.drawElementsInstanced(n,p,r,d*o,g),e.update(p,n,g))}function f(d,p,g){if(g===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,p,0,r,d,0,g);let m=0;for(let u=0;u<g;u++)m+=p[u];e.update(m,n,1)}function h(d,p,g,_){if(g===0)return;let m=t.get("WEBGL_multi_draw");if(m===null)for(let u=0;u<d.length;u++)c(d[u]/o,p[u],_[u]);else{m.multiDrawElementsInstancedWEBGL(n,p,0,r,d,0,_,0,g);let u=0;for(let y=0;y<g;y++)u+=p[y];for(let y=0;y<_.length;y++)e.update(u,n,_[y])}}this.setMode=s,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=f,this.renderMultiDrawInstances=h}function A0(i){let t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,o,a){switch(e.calls++,o){case i.TRIANGLES:e.triangles+=a*(r/3);break;case i.LINES:e.lines+=a*(r/2);break;case i.LINE_STRIP:e.lines+=a*(r-1);break;case i.LINE_LOOP:e.lines+=a*r;break;case i.POINTS:e.points+=a*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function s(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:s,update:n}}function R0(i,t,e){let n=new WeakMap,s=new Me;function r(o,a,l){let c=o.morphTargetInfluences,f=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,h=f!==void 0?f.length:0,d=n.get(a);if(d===void 0||d.count!==h){let D=function(){w.dispose(),n.delete(a),a.removeEventListener("dispose",D)};d!==void 0&&d.texture.dispose();let p=a.morphAttributes.position!==void 0,g=a.morphAttributes.normal!==void 0,_=a.morphAttributes.color!==void 0,m=a.morphAttributes.position||[],u=a.morphAttributes.normal||[],y=a.morphAttributes.color||[],v=0;p===!0&&(v=1),g===!0&&(v=2),_===!0&&(v=3);let M=a.attributes.position.count*v,A=1;M>t.maxTextureSize&&(A=Math.ceil(M/t.maxTextureSize),M=t.maxTextureSize);let S=new Float32Array(M*A*4*h),w=new Pr(S,M,A,h);w.type=Mn,w.needsUpdate=!0;let P=v*4;for(let x=0;x<h;x++){let E=m[x],N=u[x],z=y[x],I=M*A*4*x;for(let V=0;V<E.count;V++){let F=V*P;p===!0&&(s.fromBufferAttribute(E,V),S[I+F+0]=s.x,S[I+F+1]=s.y,S[I+F+2]=s.z,S[I+F+3]=0),g===!0&&(s.fromBufferAttribute(N,V),S[I+F+4]=s.x,S[I+F+5]=s.y,S[I+F+6]=s.z,S[I+F+7]=0),_===!0&&(s.fromBufferAttribute(z,V),S[I+F+8]=s.x,S[I+F+9]=s.y,S[I+F+10]=s.z,S[I+F+11]=z.itemSize===4?s.w:1)}}d={count:h,texture:w,size:new Mt(M,A)},n.set(a,d),a.addEventListener("dispose",D)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",o.morphTexture,e);else{let p=0;for(let _=0;_<c.length;_++)p+=c[_];let g=a.morphTargetsRelative?1:1-p;l.getUniforms().setValue(i,"morphTargetBaseInfluence",g),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",d.texture,e),l.getUniforms().setValue(i,"morphTargetsTextureSize",d.size)}return{update:r}}function C0(i,t,e,n){let s=new WeakMap;function r(l){let c=n.render.frame,f=l.geometry,h=t.get(l,f);if(s.get(h)!==c&&(t.update(h),s.set(h,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",a)===!1&&l.addEventListener("dispose",a),s.get(l)!==c&&(e.update(l.instanceMatrix,i.ARRAY_BUFFER),l.instanceColor!==null&&e.update(l.instanceColor,i.ARRAY_BUFFER),s.set(l,c))),l.isSkinnedMesh){let d=l.skeleton;s.get(d)!==c&&(d.update(),s.set(d,c))}return h}function o(){s=new WeakMap}function a(l){let c=l.target;c.removeEventListener("dispose",a),e.remove(c.instanceMatrix),c.instanceColor!==null&&e.remove(c.instanceColor)}return{update:r,dispose:o}}var Fr=class extends Ve{constructor(t,e,n,s,r,o,a,l,c,f=Bi){if(f!==Bi&&f!==Yi)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");n===void 0&&f===Bi&&(n=mi),n===void 0&&f===Yi&&(n=qi),super(null,s,r,o,a,l,f,n,c),this.isDepthTexture=!0,this.image={width:t,height:e},this.magFilter=a!==void 0?a:Ke,this.minFilter=l!==void 0?l:Ke,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.compareFunction=t.compareFunction,this}toJSON(t){let e=super.toJSON(t);return this.compareFunction!==null&&(e.compareFunction=this.compareFunction),e}},zh=new Ve,Gc=new Fr(1,1),Oh=new Pr,Hh=new Ga,Bh=new Ur,Vc=[],Wc=[],Xc=new Float32Array(16),qc=new Float32Array(9),Yc=new Float32Array(4);function Qi(i,t,e){let n=i[0];if(n<=0||n>0)return i;let s=t*e,r=Vc[s];if(r===void 0&&(r=new Float32Array(s),Vc[s]=r),t!==0){n.toArray(r,0);for(let o=1,a=0;o!==t;++o)a+=e,i[o].toArray(r,a)}return r}function Pe(i,t){if(i.length!==t.length)return!1;for(let e=0,n=i.length;e<n;e++)if(i[e]!==t[e])return!1;return!0}function Ie(i,t){for(let e=0,n=t.length;e<n;e++)i[e]=t[e]}function to(i,t){let e=Wc[t];e===void 0&&(e=new Int32Array(t),Wc[t]=e);for(let n=0;n!==t;++n)e[n]=i.allocateTextureUnit();return e}function P0(i,t){let e=this.cache;e[0]!==t&&(i.uniform1f(this.addr,t),e[0]=t)}function I0(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Pe(e,t))return;i.uniform2fv(this.addr,t),Ie(e,t)}}function L0(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(i.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(Pe(e,t))return;i.uniform3fv(this.addr,t),Ie(e,t)}}function D0(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Pe(e,t))return;i.uniform4fv(this.addr,t),Ie(e,t)}}function U0(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(Pe(e,t))return;i.uniformMatrix2fv(this.addr,!1,t),Ie(e,t)}else{if(Pe(e,n))return;Yc.set(n),i.uniformMatrix2fv(this.addr,!1,Yc),Ie(e,n)}}function N0(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(Pe(e,t))return;i.uniformMatrix3fv(this.addr,!1,t),Ie(e,t)}else{if(Pe(e,n))return;qc.set(n),i.uniformMatrix3fv(this.addr,!1,qc),Ie(e,n)}}function F0(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(Pe(e,t))return;i.uniformMatrix4fv(this.addr,!1,t),Ie(e,t)}else{if(Pe(e,n))return;Xc.set(n),i.uniformMatrix4fv(this.addr,!1,Xc),Ie(e,n)}}function z0(i,t){let e=this.cache;e[0]!==t&&(i.uniform1i(this.addr,t),e[0]=t)}function O0(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Pe(e,t))return;i.uniform2iv(this.addr,t),Ie(e,t)}}function H0(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Pe(e,t))return;i.uniform3iv(this.addr,t),Ie(e,t)}}function B0(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Pe(e,t))return;i.uniform4iv(this.addr,t),Ie(e,t)}}function k0(i,t){let e=this.cache;e[0]!==t&&(i.uniform1ui(this.addr,t),e[0]=t)}function G0(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Pe(e,t))return;i.uniform2uiv(this.addr,t),Ie(e,t)}}function V0(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Pe(e,t))return;i.uniform3uiv(this.addr,t),Ie(e,t)}}function W0(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Pe(e,t))return;i.uniform4uiv(this.addr,t),Ie(e,t)}}function X0(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(Gc.compareFunction=Ih,r=Gc):r=zh,e.setTexture2D(t||r,s)}function q0(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture3D(t||Hh,s)}function Y0(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTextureCube(t||Bh,s)}function Z0(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture2DArray(t||Oh,s)}function $0(i){switch(i){case 5126:return P0;case 35664:return I0;case 35665:return L0;case 35666:return D0;case 35674:return U0;case 35675:return N0;case 35676:return F0;case 5124:case 35670:return z0;case 35667:case 35671:return O0;case 35668:case 35672:return H0;case 35669:case 35673:return B0;case 5125:return k0;case 36294:return G0;case 36295:return V0;case 36296:return W0;case 35678:case 36198:case 36298:case 36306:case 35682:return X0;case 35679:case 36299:case 36307:return q0;case 35680:case 36300:case 36308:case 36293:return Y0;case 36289:case 36303:case 36311:case 36292:return Z0}}function J0(i,t){i.uniform1fv(this.addr,t)}function K0(i,t){let e=Qi(t,this.size,2);i.uniform2fv(this.addr,e)}function j0(i,t){let e=Qi(t,this.size,3);i.uniform3fv(this.addr,e)}function Q0(i,t){let e=Qi(t,this.size,4);i.uniform4fv(this.addr,e)}function tm(i,t){let e=Qi(t,this.size,4);i.uniformMatrix2fv(this.addr,!1,e)}function em(i,t){let e=Qi(t,this.size,9);i.uniformMatrix3fv(this.addr,!1,e)}function nm(i,t){let e=Qi(t,this.size,16);i.uniformMatrix4fv(this.addr,!1,e)}function im(i,t){i.uniform1iv(this.addr,t)}function sm(i,t){i.uniform2iv(this.addr,t)}function rm(i,t){i.uniform3iv(this.addr,t)}function om(i,t){i.uniform4iv(this.addr,t)}function am(i,t){i.uniform1uiv(this.addr,t)}function lm(i,t){i.uniform2uiv(this.addr,t)}function cm(i,t){i.uniform3uiv(this.addr,t)}function hm(i,t){i.uniform4uiv(this.addr,t)}function um(i,t,e){let n=this.cache,s=t.length,r=to(e,s);Pe(n,r)||(i.uniform1iv(this.addr,r),Ie(n,r));for(let o=0;o!==s;++o)e.setTexture2D(t[o]||zh,r[o])}function fm(i,t,e){let n=this.cache,s=t.length,r=to(e,s);Pe(n,r)||(i.uniform1iv(this.addr,r),Ie(n,r));for(let o=0;o!==s;++o)e.setTexture3D(t[o]||Hh,r[o])}function dm(i,t,e){let n=this.cache,s=t.length,r=to(e,s);Pe(n,r)||(i.uniform1iv(this.addr,r),Ie(n,r));for(let o=0;o!==s;++o)e.setTextureCube(t[o]||Bh,r[o])}function pm(i,t,e){let n=this.cache,s=t.length,r=to(e,s);Pe(n,r)||(i.uniform1iv(this.addr,r),Ie(n,r));for(let o=0;o!==s;++o)e.setTexture2DArray(t[o]||Oh,r[o])}function mm(i){switch(i){case 5126:return J0;case 35664:return K0;case 35665:return j0;case 35666:return Q0;case 35674:return tm;case 35675:return em;case 35676:return nm;case 5124:case 35670:return im;case 35667:case 35671:return sm;case 35668:case 35672:return rm;case 35669:case 35673:return om;case 5125:return am;case 36294:return lm;case 36295:return cm;case 36296:return hm;case 35678:case 36198:case 36298:case 36306:case 35682:return um;case 35679:case 36299:case 36307:return fm;case 35680:case 36300:case 36308:case 36293:return dm;case 36289:case 36303:case 36311:case 36292:return pm}}var Xa=class{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.setValue=$0(e.type)}},qa=class{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=mm(e.type)}},Ya=class{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,n){let s=this.seq;for(let r=0,o=s.length;r!==o;++r){let a=s[r];a.setValue(t,e[a.id],n)}}},$o=/(\w+)(\])?(\[|\.)?/g;function Zc(i,t){i.seq.push(t),i.map[t.id]=t}function gm(i,t,e){let n=i.name,s=n.length;for($o.lastIndex=0;;){let r=$o.exec(n),o=$o.lastIndex,a=r[1],l=r[2]==="]",c=r[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===s){Zc(e,c===void 0?new Xa(a,i,t):new qa(a,i,t));break}else{let h=e.map[a];h===void 0&&(h=new Ya(a),Zc(e,h)),e=h}}}var Gi=class{constructor(t,e){this.seq=[],this.map={};let n=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let s=0;s<n;++s){let r=t.getActiveUniform(e,s),o=t.getUniformLocation(e,r.name);gm(r,o,this)}}setValue(t,e,n,s){let r=this.map[e];r!==void 0&&r.setValue(t,n,s)}setOptional(t,e,n){let s=e[n];s!==void 0&&this.setValue(t,n,s)}static upload(t,e,n,s){for(let r=0,o=e.length;r!==o;++r){let a=e[r],l=n[a.id];l.needsUpdate!==!1&&a.setValue(t,l.value,s)}}static seqWithValue(t,e){let n=[];for(let s=0,r=t.length;s!==r;++s){let o=t[s];o.id in e&&n.push(o)}return n}};function $c(i,t,e){let n=i.createShader(t);return i.shaderSource(n,e),i.compileShader(n),n}var xm=37297,ym=0;function _m(i,t){let e=i.split(`
`),n=[],s=Math.max(t-6,0),r=Math.min(t+6,e.length);for(let o=s;o<r;o++){let a=o+1;n.push(`${a===t?">":" "} ${a}: ${e[o]}`)}return n.join(`
`)}function vm(i){let t=he.getPrimaries(he.workingColorSpace),e=he.getPrimaries(i),n;switch(t===e?n="":t===Ar&&e===Tr?n="LinearDisplayP3ToLinearSRGB":t===Tr&&e===Ar&&(n="LinearSRGBToLinearDisplayP3"),i){case ei:case Qr:return[n,"LinearTransferOETF"];case xe:case Fl:return[n,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space:",i),[n,"LinearTransferOETF"]}}function Jc(i,t,e){let n=i.getShaderParameter(t,i.COMPILE_STATUS),s=i.getShaderInfoLog(t).trim();if(n&&s==="")return"";let r=/ERROR: 0:(\d+)/.exec(s);if(r){let o=parseInt(r[1]);return e.toUpperCase()+`

`+s+`

`+_m(i.getShaderSource(t),o)}else return s}function Mm(i,t){let e=vm(t);return`vec4 ${i}( vec4 value ) { return ${e[0]}( ${e[1]}( value ) ); }`}function Em(i,t){let e;switch(t){case qu:e="Linear";break;case Yu:e="Reinhard";break;case Zu:e="Cineon";break;case Rl:e="ACESFilmic";break;case Ju:e="AgX";break;case Ku:e="Neutral";break;case $u:e="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",t),e="Linear"}return"vec3 "+i+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}var cr=new U;function Sm(){he.getLuminanceCoefficients(cr);let i=cr.x.toFixed(4),t=cr.y.toFixed(4),e=cr.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function bm(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(hs).join(`
`)}function wm(i){let t=[];for(let e in i){let n=i[e];n!==!1&&t.push("#define "+e+" "+n)}return t.join(`
`)}function Tm(i,t){let e={},n=i.getProgramParameter(t,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){let r=i.getActiveAttrib(t,s),o=r.name,a=1;r.type===i.FLOAT_MAT2&&(a=2),r.type===i.FLOAT_MAT3&&(a=3),r.type===i.FLOAT_MAT4&&(a=4),e[o]={type:r.type,location:i.getAttribLocation(t,o),locationSize:a}}return e}function hs(i){return i!==""}function Kc(i,t){let e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function jc(i,t){return i.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var Am=/^[ \t]*#include +<([\w\d./]+)>/gm;function Za(i){return i.replace(Am,Cm)}var Rm=new Map;function Cm(i,t){let e=Qt[t];if(e===void 0){let n=Rm.get(t);if(n!==void 0)e=Qt[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,n);else throw new Error("Can not resolve #include <"+t+">")}return Za(e)}var Pm=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Qc(i){return i.replace(Pm,Im)}function Im(i,t,e,n){let s="";for(let r=parseInt(t);r<parseInt(e);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function th(i){let t=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?t+=`
#define HIGH_PRECISION`:i.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}function Lm(i){let t="SHADOWMAP_TYPE_BASIC";return i.shadowMapType===Kr?t="SHADOWMAP_TYPE_PCF":i.shadowMapType===wu?t="SHADOWMAP_TYPE_PCF_SOFT":i.shadowMapType===Nn&&(t="SHADOWMAP_TYPE_VSM"),t}function Dm(i){let t="ENVMAP_TYPE_CUBE";if(i.envMap)switch(i.envMapMode){case Wi:case Xi:t="ENVMAP_TYPE_CUBE";break;case jr:t="ENVMAP_TYPE_CUBE_UV";break}return t}function Um(i){let t="ENVMAP_MODE_REFLECTION";if(i.envMap)switch(i.envMapMode){case Xi:t="ENVMAP_MODE_REFRACTION";break}return t}function Nm(i){let t="ENVMAP_BLENDING_NONE";if(i.envMap)switch(i.combine){case _h:t="ENVMAP_BLENDING_MULTIPLY";break;case Wu:t="ENVMAP_BLENDING_MIX";break;case Xu:t="ENVMAP_BLENDING_ADD";break}return t}function Fm(i){let t=i.envMapCubeUVHeight;if(t===null)return null;let e=Math.log2(t)-2,n=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),7*16)),texelHeight:n,maxMip:e}}function zm(i,t,e,n){let s=i.getContext(),r=e.defines,o=e.vertexShader,a=e.fragmentShader,l=Lm(e),c=Dm(e),f=Um(e),h=Nm(e),d=Fm(e),p=bm(e),g=wm(r),_=s.createProgram(),m,u,y=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(m=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter(hs).join(`
`),m.length>0&&(m+=`
`),u=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter(hs).join(`
`),u.length>0&&(u+=`
`)):(m=[th(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+f:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",e.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(hs).join(`
`),u=[th(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+c:"",e.envMap?"#define "+f:"",e.envMap?"#define "+h:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor||e.batchingColor?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",e.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==$n?"#define TONE_MAPPING":"",e.toneMapping!==$n?Qt.tonemapping_pars_fragment:"",e.toneMapping!==$n?Em("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",Qt.colorspace_pars_fragment,Mm("linearToOutputTexel",e.outputColorSpace),Sm(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(hs).join(`
`)),o=Za(o),o=Kc(o,e),o=jc(o,e),a=Za(a),a=Kc(a,e),a=jc(a,e),o=Qc(o),a=Qc(a),e.isRawShaderMaterial!==!0&&(y=`#version 300 es
`,m=[p,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,u=["#define varying in",e.glslVersion===yc?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===yc?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+u);let v=y+m+o,M=y+u+a,A=$c(s,s.VERTEX_SHADER,v),S=$c(s,s.FRAGMENT_SHADER,M);s.attachShader(_,A),s.attachShader(_,S),e.index0AttributeName!==void 0?s.bindAttribLocation(_,0,e.index0AttributeName):e.morphTargets===!0&&s.bindAttribLocation(_,0,"position"),s.linkProgram(_);function w(E){if(i.debug.checkShaderErrors){let N=s.getProgramInfoLog(_).trim(),z=s.getShaderInfoLog(A).trim(),I=s.getShaderInfoLog(S).trim(),V=!0,F=!0;if(s.getProgramParameter(_,s.LINK_STATUS)===!1)if(V=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,_,A,S);else{let Q=Jc(s,A,"vertex"),Y=Jc(s,S,"fragment");console.error("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(_,s.VALIDATE_STATUS)+`

Material Name: `+E.name+`
Material Type: `+E.type+`

Program Info Log: `+N+`
`+Q+`
`+Y)}else N!==""?console.warn("THREE.WebGLProgram: Program Info Log:",N):(z===""||I==="")&&(F=!1);F&&(E.diagnostics={runnable:V,programLog:N,vertexShader:{log:z,prefix:m},fragmentShader:{log:I,prefix:u}})}s.deleteShader(A),s.deleteShader(S),P=new Gi(s,_),D=Tm(s,_)}let P;this.getUniforms=function(){return P===void 0&&w(this),P};let D;this.getAttributes=function(){return D===void 0&&w(this),D};let x=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return x===!1&&(x=s.getProgramParameter(_,xm)),x},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(_),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=ym++,this.cacheKey=t,this.usedTimes=1,this.program=_,this.vertexShader=A,this.fragmentShader=S,this}var Om=0,$a=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t){let e=t.vertexShader,n=t.fragmentShader,s=this._getShaderStage(e),r=this._getShaderStage(n),o=this._getShaderCacheForMaterial(t);return o.has(s)===!1&&(o.add(s),s.usedTimes++),o.has(r)===!1&&(o.add(r),r.usedTimes++),this}remove(t){let e=this.materialCache.get(t);for(let n of e)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(t),this}getVertexShaderID(t){return this._getShaderStage(t.vertexShader).id}getFragmentShaderID(t){return this._getShaderStage(t.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){let e=this.materialCache,n=e.get(t);return n===void 0&&(n=new Set,e.set(t,n)),n}_getShaderStage(t){let e=this.shaderCache,n=e.get(t);return n===void 0&&(n=new Ja(t),e.set(t,n)),n}},Ja=class{constructor(t){this.id=Om++,this.code=t,this.usedTimes=0}};function Hm(i,t,e,n,s,r,o){let a=new ys,l=new $a,c=new Set,f=[],h=s.logarithmicDepthBuffer,d=s.reverseDepthBuffer,p=s.vertexTextures,g=s.precision,_={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function m(x){return c.add(x),x===0?"uv":`uv${x}`}function u(x,E,N,z,I){let V=z.fog,F=I.geometry,Q=x.isMeshStandardMaterial?z.environment:null,Y=(x.isMeshStandardMaterial?e:t).get(x.envMap||Q),X=Y&&Y.mapping===jr?Y.image.height:null,it=_[x.type];x.precision!==null&&(g=s.getMaxPrecision(x.precision),g!==x.precision&&console.warn("THREE.WebGLProgram.getParameters:",x.precision,"not supported, using",g,"instead."));let rt=F.morphAttributes.position||F.morphAttributes.normal||F.morphAttributes.color,bt=rt!==void 0?rt.length:0,It=0;F.morphAttributes.position!==void 0&&(It=1),F.morphAttributes.normal!==void 0&&(It=2),F.morphAttributes.color!==void 0&&(It=3);let K,lt,pt,yt;if(it){let $e=vn[it];K=$e.vertexShader,lt=$e.fragmentShader}else K=x.vertexShader,lt=x.fragmentShader,l.update(x),pt=l.getVertexShaderID(x),yt=l.getFragmentShaderID(x);let Nt=i.getRenderTarget(),Ot=I.isInstancedMesh===!0,Vt=I.isBatchedMesh===!0,Jt=!!x.map,ct=!!x.matcap,C=!!Y,Et=!!x.aoMap,W=!!x.lightMap,q=!!x.bumpMap,ot=!!x.normalMap,dt=!!x.displacementMap,mt=!!x.emissiveMap,R=!!x.metalnessMap,b=!!x.roughnessMap,G=x.anisotropy>0,et=x.clearcoat>0,st=x.dispersion>0,j=x.iridescence>0,Rt=x.sheen>0,St=x.transmission>0,At=G&&!!x.anisotropyMap,jt=et&&!!x.clearcoatMap,ft=et&&!!x.clearcoatNormalMap,H=et&&!!x.clearcoatRoughnessMap,nt=j&&!!x.iridescenceMap,xt=j&&!!x.iridescenceThicknessMap,gt=Rt&&!!x.sheenColorMap,Dt=Rt&&!!x.sheenRoughnessMap,zt=!!x.specularMap,$t=!!x.specularColorMap,O=!!x.specularIntensityMap,_t=St&&!!x.transmissionMap,tt=St&&!!x.thicknessMap,ht=!!x.gradientMap,Ct=!!x.alphaMap,Lt=x.alphaTest>0,re=!!x.alphaHash,we=!!x.extensions,Ze=$n;x.toneMapped&&(Nt===null||Nt.isXRRenderTarget===!0)&&(Ze=i.toneMapping);let ae={shaderID:it,shaderType:x.type,shaderName:x.name,vertexShader:K,fragmentShader:lt,defines:x.defines,customVertexShaderID:pt,customFragmentShaderID:yt,isRawShaderMaterial:x.isRawShaderMaterial===!0,glslVersion:x.glslVersion,precision:g,batching:Vt,batchingColor:Vt&&I._colorsTexture!==null,instancing:Ot,instancingColor:Ot&&I.instanceColor!==null,instancingMorph:Ot&&I.morphTexture!==null,supportsVertexTextures:p,outputColorSpace:Nt===null?i.outputColorSpace:Nt.isXRRenderTarget===!0?Nt.texture.colorSpace:ei,alphaToCoverage:!!x.alphaToCoverage,map:Jt,matcap:ct,envMap:C,envMapMode:C&&Y.mapping,envMapCubeUVHeight:X,aoMap:Et,lightMap:W,bumpMap:q,normalMap:ot,displacementMap:p&&dt,emissiveMap:mt,normalMapObjectSpace:ot&&x.normalMapType===ef,normalMapTangentSpace:ot&&x.normalMapType===Ph,metalnessMap:R,roughnessMap:b,anisotropy:G,anisotropyMap:At,clearcoat:et,clearcoatMap:jt,clearcoatNormalMap:ft,clearcoatRoughnessMap:H,dispersion:st,iridescence:j,iridescenceMap:nt,iridescenceThicknessMap:xt,sheen:Rt,sheenColorMap:gt,sheenRoughnessMap:Dt,specularMap:zt,specularColorMap:$t,specularIntensityMap:O,transmission:St,transmissionMap:_t,thicknessMap:tt,gradientMap:ht,opaque:x.transparent===!1&&x.blending===Hi&&x.alphaToCoverage===!1,alphaMap:Ct,alphaTest:Lt,alphaHash:re,combine:x.combine,mapUv:Jt&&m(x.map.channel),aoMapUv:Et&&m(x.aoMap.channel),lightMapUv:W&&m(x.lightMap.channel),bumpMapUv:q&&m(x.bumpMap.channel),normalMapUv:ot&&m(x.normalMap.channel),displacementMapUv:dt&&m(x.displacementMap.channel),emissiveMapUv:mt&&m(x.emissiveMap.channel),metalnessMapUv:R&&m(x.metalnessMap.channel),roughnessMapUv:b&&m(x.roughnessMap.channel),anisotropyMapUv:At&&m(x.anisotropyMap.channel),clearcoatMapUv:jt&&m(x.clearcoatMap.channel),clearcoatNormalMapUv:ft&&m(x.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:H&&m(x.clearcoatRoughnessMap.channel),iridescenceMapUv:nt&&m(x.iridescenceMap.channel),iridescenceThicknessMapUv:xt&&m(x.iridescenceThicknessMap.channel),sheenColorMapUv:gt&&m(x.sheenColorMap.channel),sheenRoughnessMapUv:Dt&&m(x.sheenRoughnessMap.channel),specularMapUv:zt&&m(x.specularMap.channel),specularColorMapUv:$t&&m(x.specularColorMap.channel),specularIntensityMapUv:O&&m(x.specularIntensityMap.channel),transmissionMapUv:_t&&m(x.transmissionMap.channel),thicknessMapUv:tt&&m(x.thicknessMap.channel),alphaMapUv:Ct&&m(x.alphaMap.channel),vertexTangents:!!F.attributes.tangent&&(ot||G),vertexColors:x.vertexColors,vertexAlphas:x.vertexColors===!0&&!!F.attributes.color&&F.attributes.color.itemSize===4,pointsUvs:I.isPoints===!0&&!!F.attributes.uv&&(Jt||Ct),fog:!!V,useFog:x.fog===!0,fogExp2:!!V&&V.isFogExp2,flatShading:x.flatShading===!0,sizeAttenuation:x.sizeAttenuation===!0,logarithmicDepthBuffer:h,reverseDepthBuffer:d,skinning:I.isSkinnedMesh===!0,morphTargets:F.morphAttributes.position!==void 0,morphNormals:F.morphAttributes.normal!==void 0,morphColors:F.morphAttributes.color!==void 0,morphTargetsCount:bt,morphTextureStride:It,numDirLights:E.directional.length,numPointLights:E.point.length,numSpotLights:E.spot.length,numSpotLightMaps:E.spotLightMap.length,numRectAreaLights:E.rectArea.length,numHemiLights:E.hemi.length,numDirLightShadows:E.directionalShadowMap.length,numPointLightShadows:E.pointShadowMap.length,numSpotLightShadows:E.spotShadowMap.length,numSpotLightShadowsWithMaps:E.numSpotLightShadowsWithMaps,numLightProbes:E.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:x.dithering,shadowMapEnabled:i.shadowMap.enabled&&N.length>0,shadowMapType:i.shadowMap.type,toneMapping:Ze,decodeVideoTexture:Jt&&x.map.isVideoTexture===!0&&he.getTransfer(x.map.colorSpace)===pe,premultipliedAlpha:x.premultipliedAlpha,doubleSided:x.side===fe,flipSided:x.side===je,useDepthPacking:x.depthPacking>=0,depthPacking:x.depthPacking||0,index0AttributeName:x.index0AttributeName,extensionClipCullDistance:we&&x.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(we&&x.extensions.multiDraw===!0||Vt)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:x.customProgramCacheKey()};return ae.vertexUv1s=c.has(1),ae.vertexUv2s=c.has(2),ae.vertexUv3s=c.has(3),c.clear(),ae}function y(x){let E=[];if(x.shaderID?E.push(x.shaderID):(E.push(x.customVertexShaderID),E.push(x.customFragmentShaderID)),x.defines!==void 0)for(let N in x.defines)E.push(N),E.push(x.defines[N]);return x.isRawShaderMaterial===!1&&(v(E,x),M(E,x),E.push(i.outputColorSpace)),E.push(x.customProgramCacheKey),E.join()}function v(x,E){x.push(E.precision),x.push(E.outputColorSpace),x.push(E.envMapMode),x.push(E.envMapCubeUVHeight),x.push(E.mapUv),x.push(E.alphaMapUv),x.push(E.lightMapUv),x.push(E.aoMapUv),x.push(E.bumpMapUv),x.push(E.normalMapUv),x.push(E.displacementMapUv),x.push(E.emissiveMapUv),x.push(E.metalnessMapUv),x.push(E.roughnessMapUv),x.push(E.anisotropyMapUv),x.push(E.clearcoatMapUv),x.push(E.clearcoatNormalMapUv),x.push(E.clearcoatRoughnessMapUv),x.push(E.iridescenceMapUv),x.push(E.iridescenceThicknessMapUv),x.push(E.sheenColorMapUv),x.push(E.sheenRoughnessMapUv),x.push(E.specularMapUv),x.push(E.specularColorMapUv),x.push(E.specularIntensityMapUv),x.push(E.transmissionMapUv),x.push(E.thicknessMapUv),x.push(E.combine),x.push(E.fogExp2),x.push(E.sizeAttenuation),x.push(E.morphTargetsCount),x.push(E.morphAttributeCount),x.push(E.numDirLights),x.push(E.numPointLights),x.push(E.numSpotLights),x.push(E.numSpotLightMaps),x.push(E.numHemiLights),x.push(E.numRectAreaLights),x.push(E.numDirLightShadows),x.push(E.numPointLightShadows),x.push(E.numSpotLightShadows),x.push(E.numSpotLightShadowsWithMaps),x.push(E.numLightProbes),x.push(E.shadowMapType),x.push(E.toneMapping),x.push(E.numClippingPlanes),x.push(E.numClipIntersection),x.push(E.depthPacking)}function M(x,E){a.disableAll(),E.supportsVertexTextures&&a.enable(0),E.instancing&&a.enable(1),E.instancingColor&&a.enable(2),E.instancingMorph&&a.enable(3),E.matcap&&a.enable(4),E.envMap&&a.enable(5),E.normalMapObjectSpace&&a.enable(6),E.normalMapTangentSpace&&a.enable(7),E.clearcoat&&a.enable(8),E.iridescence&&a.enable(9),E.alphaTest&&a.enable(10),E.vertexColors&&a.enable(11),E.vertexAlphas&&a.enable(12),E.vertexUv1s&&a.enable(13),E.vertexUv2s&&a.enable(14),E.vertexUv3s&&a.enable(15),E.vertexTangents&&a.enable(16),E.anisotropy&&a.enable(17),E.alphaHash&&a.enable(18),E.batching&&a.enable(19),E.dispersion&&a.enable(20),E.batchingColor&&a.enable(21),x.push(a.mask),a.disableAll(),E.fog&&a.enable(0),E.useFog&&a.enable(1),E.flatShading&&a.enable(2),E.logarithmicDepthBuffer&&a.enable(3),E.reverseDepthBuffer&&a.enable(4),E.skinning&&a.enable(5),E.morphTargets&&a.enable(6),E.morphNormals&&a.enable(7),E.morphColors&&a.enable(8),E.premultipliedAlpha&&a.enable(9),E.shadowMapEnabled&&a.enable(10),E.doubleSided&&a.enable(11),E.flipSided&&a.enable(12),E.useDepthPacking&&a.enable(13),E.dithering&&a.enable(14),E.transmission&&a.enable(15),E.sheen&&a.enable(16),E.opaque&&a.enable(17),E.pointsUvs&&a.enable(18),E.decodeVideoTexture&&a.enable(19),E.alphaToCoverage&&a.enable(20),x.push(a.mask)}function A(x){let E=_[x.type],N;if(E){let z=vn[E];N=Cf.clone(z.uniforms)}else N=x.uniforms;return N}function S(x,E){let N;for(let z=0,I=f.length;z<I;z++){let V=f[z];if(V.cacheKey===E){N=V,++N.usedTimes;break}}return N===void 0&&(N=new zm(i,E,x,r),f.push(N)),N}function w(x){if(--x.usedTimes===0){let E=f.indexOf(x);f[E]=f[f.length-1],f.pop(),x.destroy()}}function P(x){l.remove(x)}function D(){l.dispose()}return{getParameters:u,getProgramCacheKey:y,getUniforms:A,acquireProgram:S,releaseProgram:w,releaseShaderCache:P,programs:f,dispose:D}}function Bm(){let i=new WeakMap;function t(o){return i.has(o)}function e(o){let a=i.get(o);return a===void 0&&(a={},i.set(o,a)),a}function n(o){i.delete(o)}function s(o,a,l){i.get(o)[a]=l}function r(){i=new WeakMap}return{has:t,get:e,remove:n,update:s,dispose:r}}function km(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.material.id!==t.material.id?i.material.id-t.material.id:i.z!==t.z?i.z-t.z:i.id-t.id}function eh(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.z!==t.z?t.z-i.z:i.id-t.id}function nh(){let i=[],t=0,e=[],n=[],s=[];function r(){t=0,e.length=0,n.length=0,s.length=0}function o(h,d,p,g,_,m){let u=i[t];return u===void 0?(u={id:h.id,object:h,geometry:d,material:p,groupOrder:g,renderOrder:h.renderOrder,z:_,group:m},i[t]=u):(u.id=h.id,u.object=h,u.geometry=d,u.material=p,u.groupOrder=g,u.renderOrder=h.renderOrder,u.z=_,u.group=m),t++,u}function a(h,d,p,g,_,m){let u=o(h,d,p,g,_,m);p.transmission>0?n.push(u):p.transparent===!0?s.push(u):e.push(u)}function l(h,d,p,g,_,m){let u=o(h,d,p,g,_,m);p.transmission>0?n.unshift(u):p.transparent===!0?s.unshift(u):e.unshift(u)}function c(h,d){e.length>1&&e.sort(h||km),n.length>1&&n.sort(d||eh),s.length>1&&s.sort(d||eh)}function f(){for(let h=t,d=i.length;h<d;h++){let p=i[h];if(p.id===null)break;p.id=null,p.object=null,p.geometry=null,p.material=null,p.group=null}}return{opaque:e,transmissive:n,transparent:s,init:r,push:a,unshift:l,finish:f,sort:c}}function Gm(){let i=new WeakMap;function t(n,s){let r=i.get(n),o;return r===void 0?(o=new nh,i.set(n,[o])):s>=r.length?(o=new nh,r.push(o)):o=r[s],o}function e(){i=new WeakMap}return{get:t,dispose:e}}function Vm(){let i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"DirectionalLight":e={direction:new U,color:new Gt};break;case"SpotLight":e={position:new U,direction:new U,color:new Gt,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new U,color:new Gt,distance:0,decay:0};break;case"HemisphereLight":e={direction:new U,skyColor:new Gt,groundColor:new Gt};break;case"RectAreaLight":e={color:new Gt,position:new U,halfWidth:new U,halfHeight:new U};break}return i[t.id]=e,e}}}function Wm(){let i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Mt};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Mt};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Mt,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[t.id]=e,e}}}var Xm=0;function qm(i,t){return(t.castShadow?2:0)-(i.castShadow?2:0)+(t.map?1:0)-(i.map?1:0)}function Ym(i){let t=new Vm,e=Wm(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new U);let s=new U,r=new Xt,o=new Xt;function a(c){let f=0,h=0,d=0;for(let D=0;D<9;D++)n.probe[D].set(0,0,0);let p=0,g=0,_=0,m=0,u=0,y=0,v=0,M=0,A=0,S=0,w=0;c.sort(qm);for(let D=0,x=c.length;D<x;D++){let E=c[D],N=E.color,z=E.intensity,I=E.distance,V=E.shadow&&E.shadow.map?E.shadow.map.texture:null;if(E.isAmbientLight)f+=N.r*z,h+=N.g*z,d+=N.b*z;else if(E.isLightProbe){for(let F=0;F<9;F++)n.probe[F].addScaledVector(E.sh.coefficients[F],z);w++}else if(E.isDirectionalLight){let F=t.get(E);if(F.color.copy(E.color).multiplyScalar(E.intensity),E.castShadow){let Q=E.shadow,Y=e.get(E);Y.shadowIntensity=Q.intensity,Y.shadowBias=Q.bias,Y.shadowNormalBias=Q.normalBias,Y.shadowRadius=Q.radius,Y.shadowMapSize=Q.mapSize,n.directionalShadow[p]=Y,n.directionalShadowMap[p]=V,n.directionalShadowMatrix[p]=E.shadow.matrix,y++}n.directional[p]=F,p++}else if(E.isSpotLight){let F=t.get(E);F.position.setFromMatrixPosition(E.matrixWorld),F.color.copy(N).multiplyScalar(z),F.distance=I,F.coneCos=Math.cos(E.angle),F.penumbraCos=Math.cos(E.angle*(1-E.penumbra)),F.decay=E.decay,n.spot[_]=F;let Q=E.shadow;if(E.map&&(n.spotLightMap[A]=E.map,A++,Q.updateMatrices(E),E.castShadow&&S++),n.spotLightMatrix[_]=Q.matrix,E.castShadow){let Y=e.get(E);Y.shadowIntensity=Q.intensity,Y.shadowBias=Q.bias,Y.shadowNormalBias=Q.normalBias,Y.shadowRadius=Q.radius,Y.shadowMapSize=Q.mapSize,n.spotShadow[_]=Y,n.spotShadowMap[_]=V,M++}_++}else if(E.isRectAreaLight){let F=t.get(E);F.color.copy(N).multiplyScalar(z),F.halfWidth.set(E.width*.5,0,0),F.halfHeight.set(0,E.height*.5,0),n.rectArea[m]=F,m++}else if(E.isPointLight){let F=t.get(E);if(F.color.copy(E.color).multiplyScalar(E.intensity),F.distance=E.distance,F.decay=E.decay,E.castShadow){let Q=E.shadow,Y=e.get(E);Y.shadowIntensity=Q.intensity,Y.shadowBias=Q.bias,Y.shadowNormalBias=Q.normalBias,Y.shadowRadius=Q.radius,Y.shadowMapSize=Q.mapSize,Y.shadowCameraNear=Q.camera.near,Y.shadowCameraFar=Q.camera.far,n.pointShadow[g]=Y,n.pointShadowMap[g]=V,n.pointShadowMatrix[g]=E.shadow.matrix,v++}n.point[g]=F,g++}else if(E.isHemisphereLight){let F=t.get(E);F.skyColor.copy(E.color).multiplyScalar(z),F.groundColor.copy(E.groundColor).multiplyScalar(z),n.hemi[u]=F,u++}}m>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=Tt.LTC_FLOAT_1,n.rectAreaLTC2=Tt.LTC_FLOAT_2):(n.rectAreaLTC1=Tt.LTC_HALF_1,n.rectAreaLTC2=Tt.LTC_HALF_2)),n.ambient[0]=f,n.ambient[1]=h,n.ambient[2]=d;let P=n.hash;(P.directionalLength!==p||P.pointLength!==g||P.spotLength!==_||P.rectAreaLength!==m||P.hemiLength!==u||P.numDirectionalShadows!==y||P.numPointShadows!==v||P.numSpotShadows!==M||P.numSpotMaps!==A||P.numLightProbes!==w)&&(n.directional.length=p,n.spot.length=_,n.rectArea.length=m,n.point.length=g,n.hemi.length=u,n.directionalShadow.length=y,n.directionalShadowMap.length=y,n.pointShadow.length=v,n.pointShadowMap.length=v,n.spotShadow.length=M,n.spotShadowMap.length=M,n.directionalShadowMatrix.length=y,n.pointShadowMatrix.length=v,n.spotLightMatrix.length=M+A-S,n.spotLightMap.length=A,n.numSpotLightShadowsWithMaps=S,n.numLightProbes=w,P.directionalLength=p,P.pointLength=g,P.spotLength=_,P.rectAreaLength=m,P.hemiLength=u,P.numDirectionalShadows=y,P.numPointShadows=v,P.numSpotShadows=M,P.numSpotMaps=A,P.numLightProbes=w,n.version=Xm++)}function l(c,f){let h=0,d=0,p=0,g=0,_=0,m=f.matrixWorldInverse;for(let u=0,y=c.length;u<y;u++){let v=c[u];if(v.isDirectionalLight){let M=n.directional[h];M.direction.setFromMatrixPosition(v.matrixWorld),s.setFromMatrixPosition(v.target.matrixWorld),M.direction.sub(s),M.direction.transformDirection(m),h++}else if(v.isSpotLight){let M=n.spot[p];M.position.setFromMatrixPosition(v.matrixWorld),M.position.applyMatrix4(m),M.direction.setFromMatrixPosition(v.matrixWorld),s.setFromMatrixPosition(v.target.matrixWorld),M.direction.sub(s),M.direction.transformDirection(m),p++}else if(v.isRectAreaLight){let M=n.rectArea[g];M.position.setFromMatrixPosition(v.matrixWorld),M.position.applyMatrix4(m),o.identity(),r.copy(v.matrixWorld),r.premultiply(m),o.extractRotation(r),M.halfWidth.set(v.width*.5,0,0),M.halfHeight.set(0,v.height*.5,0),M.halfWidth.applyMatrix4(o),M.halfHeight.applyMatrix4(o),g++}else if(v.isPointLight){let M=n.point[d];M.position.setFromMatrixPosition(v.matrixWorld),M.position.applyMatrix4(m),d++}else if(v.isHemisphereLight){let M=n.hemi[_];M.direction.setFromMatrixPosition(v.matrixWorld),M.direction.transformDirection(m),_++}}}return{setup:a,setupView:l,state:n}}function ih(i){let t=new Ym(i),e=[],n=[];function s(f){c.camera=f,e.length=0,n.length=0}function r(f){e.push(f)}function o(f){n.push(f)}function a(){t.setup(e)}function l(f){t.setupView(e,f)}let c={lightsArray:e,shadowsArray:n,camera:null,lights:t,transmissionRenderTarget:{}};return{init:s,state:c,setupLights:a,setupLightsView:l,pushLight:r,pushShadow:o}}function Zm(i){let t=new WeakMap;function e(s,r=0){let o=t.get(s),a;return o===void 0?(a=new ih(i),t.set(s,[a])):r>=o.length?(a=new ih(i),o.push(a)):a=o[r],a}function n(){t=new WeakMap}return{get:e,dispose:n}}var Ka=class extends Qn{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Qu,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}},ja=class extends Qn{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}},$m=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Jm=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function Km(i,t,e){let n=new gi,s=new Mt,r=new Mt,o=new Me,a=new Ka({depthPacking:tf}),l=new ja,c={},f=e.maxTextureSize,h={[Jn]:je,[je]:Jn,[fe]:fe},d=new bn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Mt},radius:{value:4}},vertexShader:$m,fragmentShader:Jm}),p=d.clone();p.defines.HORIZONTAL_PASS=1;let g=new Ee;g.setAttribute("position",new Ae(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let _=new ut(g,d),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Kr;let u=this.type;this.render=function(S,w,P){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||S.length===0)return;let D=i.getRenderTarget(),x=i.getActiveCubeFace(),E=i.getActiveMipmapLevel(),N=i.state;N.setBlending(En),N.buffers.color.setClear(1,1,1,1),N.buffers.depth.setTest(!0),N.setScissorTest(!1);let z=u!==Nn&&this.type===Nn,I=u===Nn&&this.type!==Nn;for(let V=0,F=S.length;V<F;V++){let Q=S[V],Y=Q.shadow;if(Y===void 0){console.warn("THREE.WebGLShadowMap:",Q,"has no shadow.");continue}if(Y.autoUpdate===!1&&Y.needsUpdate===!1)continue;s.copy(Y.mapSize);let X=Y.getFrameExtents();if(s.multiply(X),r.copy(Y.mapSize),(s.x>f||s.y>f)&&(s.x>f&&(r.x=Math.floor(f/X.x),s.x=r.x*X.x,Y.mapSize.x=r.x),s.y>f&&(r.y=Math.floor(f/X.y),s.y=r.y*X.y,Y.mapSize.y=r.y)),Y.map===null||z===!0||I===!0){let rt=this.type!==Nn?{minFilter:Ke,magFilter:Ke}:{};Y.map!==null&&Y.map.dispose(),Y.map=new On(s.x,s.y,rt),Y.map.texture.name=Q.name+".shadowMap",Y.camera.updateProjectionMatrix()}i.setRenderTarget(Y.map),i.clear();let it=Y.getViewportCount();for(let rt=0;rt<it;rt++){let bt=Y.getViewport(rt);o.set(r.x*bt.x,r.y*bt.y,r.x*bt.z,r.y*bt.w),N.viewport(o),Y.updateMatrices(Q,rt),n=Y.getFrustum(),M(w,P,Y.camera,Q,this.type)}Y.isPointLightShadow!==!0&&this.type===Nn&&y(Y,P),Y.needsUpdate=!1}u=this.type,m.needsUpdate=!1,i.setRenderTarget(D,x,E)};function y(S,w){let P=t.update(_);d.defines.VSM_SAMPLES!==S.blurSamples&&(d.defines.VSM_SAMPLES=S.blurSamples,p.defines.VSM_SAMPLES=S.blurSamples,d.needsUpdate=!0,p.needsUpdate=!0),S.mapPass===null&&(S.mapPass=new On(s.x,s.y)),d.uniforms.shadow_pass.value=S.map.texture,d.uniforms.resolution.value=S.mapSize,d.uniforms.radius.value=S.radius,i.setRenderTarget(S.mapPass),i.clear(),i.renderBufferDirect(w,null,P,d,_,null),p.uniforms.shadow_pass.value=S.mapPass.texture,p.uniforms.resolution.value=S.mapSize,p.uniforms.radius.value=S.radius,i.setRenderTarget(S.map),i.clear(),i.renderBufferDirect(w,null,P,p,_,null)}function v(S,w,P,D){let x=null,E=P.isPointLight===!0?S.customDistanceMaterial:S.customDepthMaterial;if(E!==void 0)x=E;else if(x=P.isPointLight===!0?l:a,i.localClippingEnabled&&w.clipShadows===!0&&Array.isArray(w.clippingPlanes)&&w.clippingPlanes.length!==0||w.displacementMap&&w.displacementScale!==0||w.alphaMap&&w.alphaTest>0||w.map&&w.alphaTest>0){let N=x.uuid,z=w.uuid,I=c[N];I===void 0&&(I={},c[N]=I);let V=I[z];V===void 0&&(V=x.clone(),I[z]=V,w.addEventListener("dispose",A)),x=V}if(x.visible=w.visible,x.wireframe=w.wireframe,D===Nn?x.side=w.shadowSide!==null?w.shadowSide:w.side:x.side=w.shadowSide!==null?w.shadowSide:h[w.side],x.alphaMap=w.alphaMap,x.alphaTest=w.alphaTest,x.map=w.map,x.clipShadows=w.clipShadows,x.clippingPlanes=w.clippingPlanes,x.clipIntersection=w.clipIntersection,x.displacementMap=w.displacementMap,x.displacementScale=w.displacementScale,x.displacementBias=w.displacementBias,x.wireframeLinewidth=w.wireframeLinewidth,x.linewidth=w.linewidth,P.isPointLight===!0&&x.isMeshDistanceMaterial===!0){let N=i.properties.get(x);N.light=P}return x}function M(S,w,P,D,x){if(S.visible===!1)return;if(S.layers.test(w.layers)&&(S.isMesh||S.isLine||S.isPoints)&&(S.castShadow||S.receiveShadow&&x===Nn)&&(!S.frustumCulled||n.intersectsObject(S))){S.modelViewMatrix.multiplyMatrices(P.matrixWorldInverse,S.matrixWorld);let z=t.update(S),I=S.material;if(Array.isArray(I)){let V=z.groups;for(let F=0,Q=V.length;F<Q;F++){let Y=V[F],X=I[Y.materialIndex];if(X&&X.visible){let it=v(S,X,D,x);S.onBeforeShadow(i,S,w,P,z,it,Y),i.renderBufferDirect(P,null,z,it,S,Y),S.onAfterShadow(i,S,w,P,z,it,Y)}}}else if(I.visible){let V=v(S,I,D,x);S.onBeforeShadow(i,S,w,P,z,V,null),i.renderBufferDirect(P,null,z,V,S,null),S.onAfterShadow(i,S,w,P,z,V,null)}}let N=S.children;for(let z=0,I=N.length;z<I;z++)M(N[z],w,P,D,x)}function A(S){S.target.removeEventListener("dispose",A);for(let P in c){let D=c[P],x=S.target.uuid;x in D&&(D[x].dispose(),delete D[x])}}}var jm={[na]:ia,[sa]:aa,[ra]:la,[Vi]:oa,[ia]:na,[aa]:sa,[la]:ra,[oa]:Vi};function Qm(i){function t(){let O=!1,_t=new Me,tt=null,ht=new Me(0,0,0,0);return{setMask:function(Ct){tt!==Ct&&!O&&(i.colorMask(Ct,Ct,Ct,Ct),tt=Ct)},setLocked:function(Ct){O=Ct},setClear:function(Ct,Lt,re,we,Ze){Ze===!0&&(Ct*=we,Lt*=we,re*=we),_t.set(Ct,Lt,re,we),ht.equals(_t)===!1&&(i.clearColor(Ct,Lt,re,we),ht.copy(_t))},reset:function(){O=!1,tt=null,ht.set(-1,0,0,0)}}}function e(){let O=!1,_t=!1,tt=null,ht=null,Ct=null;return{setReversed:function(Lt){_t=Lt},setTest:function(Lt){Lt?pt(i.DEPTH_TEST):yt(i.DEPTH_TEST)},setMask:function(Lt){tt!==Lt&&!O&&(i.depthMask(Lt),tt=Lt)},setFunc:function(Lt){if(_t&&(Lt=jm[Lt]),ht!==Lt){switch(Lt){case na:i.depthFunc(i.NEVER);break;case ia:i.depthFunc(i.ALWAYS);break;case sa:i.depthFunc(i.LESS);break;case Vi:i.depthFunc(i.LEQUAL);break;case ra:i.depthFunc(i.EQUAL);break;case oa:i.depthFunc(i.GEQUAL);break;case aa:i.depthFunc(i.GREATER);break;case la:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}ht=Lt}},setLocked:function(Lt){O=Lt},setClear:function(Lt){Ct!==Lt&&(i.clearDepth(Lt),Ct=Lt)},reset:function(){O=!1,tt=null,ht=null,Ct=null}}}function n(){let O=!1,_t=null,tt=null,ht=null,Ct=null,Lt=null,re=null,we=null,Ze=null;return{setTest:function(ae){O||(ae?pt(i.STENCIL_TEST):yt(i.STENCIL_TEST))},setMask:function(ae){_t!==ae&&!O&&(i.stencilMask(ae),_t=ae)},setFunc:function(ae,$e,Cn){(tt!==ae||ht!==$e||Ct!==Cn)&&(i.stencilFunc(ae,$e,Cn),tt=ae,ht=$e,Ct=Cn)},setOp:function(ae,$e,Cn){(Lt!==ae||re!==$e||we!==Cn)&&(i.stencilOp(ae,$e,Cn),Lt=ae,re=$e,we=Cn)},setLocked:function(ae){O=ae},setClear:function(ae){Ze!==ae&&(i.clearStencil(ae),Ze=ae)},reset:function(){O=!1,_t=null,tt=null,ht=null,Ct=null,Lt=null,re=null,we=null,Ze=null}}}let s=new t,r=new e,o=new n,a=new WeakMap,l=new WeakMap,c={},f={},h=new WeakMap,d=[],p=null,g=!1,_=null,m=null,u=null,y=null,v=null,M=null,A=null,S=new Gt(0,0,0),w=0,P=!1,D=null,x=null,E=null,N=null,z=null,I=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),V=!1,F=0,Q=i.getParameter(i.VERSION);Q.indexOf("WebGL")!==-1?(F=parseFloat(/^WebGL (\d)/.exec(Q)[1]),V=F>=1):Q.indexOf("OpenGL ES")!==-1&&(F=parseFloat(/^OpenGL ES (\d)/.exec(Q)[1]),V=F>=2);let Y=null,X={},it=i.getParameter(i.SCISSOR_BOX),rt=i.getParameter(i.VIEWPORT),bt=new Me().fromArray(it),It=new Me().fromArray(rt);function K(O,_t,tt,ht){let Ct=new Uint8Array(4),Lt=i.createTexture();i.bindTexture(O,Lt),i.texParameteri(O,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(O,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let re=0;re<tt;re++)O===i.TEXTURE_3D||O===i.TEXTURE_2D_ARRAY?i.texImage3D(_t,0,i.RGBA,1,1,ht,0,i.RGBA,i.UNSIGNED_BYTE,Ct):i.texImage2D(_t+re,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,Ct);return Lt}let lt={};lt[i.TEXTURE_2D]=K(i.TEXTURE_2D,i.TEXTURE_2D,1),lt[i.TEXTURE_CUBE_MAP]=K(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),lt[i.TEXTURE_2D_ARRAY]=K(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),lt[i.TEXTURE_3D]=K(i.TEXTURE_3D,i.TEXTURE_3D,1,1),s.setClear(0,0,0,1),r.setClear(1),o.setClear(0),pt(i.DEPTH_TEST),r.setFunc(Vi),W(!1),q(hc),pt(i.CULL_FACE),C(En);function pt(O){c[O]!==!0&&(i.enable(O),c[O]=!0)}function yt(O){c[O]!==!1&&(i.disable(O),c[O]=!1)}function Nt(O,_t){return f[O]!==_t?(i.bindFramebuffer(O,_t),f[O]=_t,O===i.DRAW_FRAMEBUFFER&&(f[i.FRAMEBUFFER]=_t),O===i.FRAMEBUFFER&&(f[i.DRAW_FRAMEBUFFER]=_t),!0):!1}function Ot(O,_t){let tt=d,ht=!1;if(O){tt=h.get(_t),tt===void 0&&(tt=[],h.set(_t,tt));let Ct=O.textures;if(tt.length!==Ct.length||tt[0]!==i.COLOR_ATTACHMENT0){for(let Lt=0,re=Ct.length;Lt<re;Lt++)tt[Lt]=i.COLOR_ATTACHMENT0+Lt;tt.length=Ct.length,ht=!0}}else tt[0]!==i.BACK&&(tt[0]=i.BACK,ht=!0);ht&&i.drawBuffers(tt)}function Vt(O){return p!==O?(i.useProgram(O),p=O,!0):!1}let Jt={[hi]:i.FUNC_ADD,[Au]:i.FUNC_SUBTRACT,[Ru]:i.FUNC_REVERSE_SUBTRACT};Jt[Cu]=i.MIN,Jt[Pu]=i.MAX;let ct={[Iu]:i.ZERO,[Lu]:i.ONE,[Du]:i.SRC_COLOR,[ta]:i.SRC_ALPHA,[Hu]:i.SRC_ALPHA_SATURATE,[zu]:i.DST_COLOR,[Nu]:i.DST_ALPHA,[Uu]:i.ONE_MINUS_SRC_COLOR,[ea]:i.ONE_MINUS_SRC_ALPHA,[Ou]:i.ONE_MINUS_DST_COLOR,[Fu]:i.ONE_MINUS_DST_ALPHA,[Bu]:i.CONSTANT_COLOR,[ku]:i.ONE_MINUS_CONSTANT_COLOR,[Gu]:i.CONSTANT_ALPHA,[Vu]:i.ONE_MINUS_CONSTANT_ALPHA};function C(O,_t,tt,ht,Ct,Lt,re,we,Ze,ae){if(O===En){g===!0&&(yt(i.BLEND),g=!1);return}if(g===!1&&(pt(i.BLEND),g=!0),O!==Tu){if(O!==_||ae!==P){if((m!==hi||v!==hi)&&(i.blendEquation(i.FUNC_ADD),m=hi,v=hi),ae)switch(O){case Hi:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Sr:i.blendFunc(i.ONE,i.ONE);break;case uc:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case fc:i.blendFuncSeparate(i.ZERO,i.SRC_COLOR,i.ZERO,i.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",O);break}else switch(O){case Hi:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Sr:i.blendFunc(i.SRC_ALPHA,i.ONE);break;case uc:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case fc:i.blendFunc(i.ZERO,i.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",O);break}u=null,y=null,M=null,A=null,S.set(0,0,0),w=0,_=O,P=ae}return}Ct=Ct||_t,Lt=Lt||tt,re=re||ht,(_t!==m||Ct!==v)&&(i.blendEquationSeparate(Jt[_t],Jt[Ct]),m=_t,v=Ct),(tt!==u||ht!==y||Lt!==M||re!==A)&&(i.blendFuncSeparate(ct[tt],ct[ht],ct[Lt],ct[re]),u=tt,y=ht,M=Lt,A=re),(we.equals(S)===!1||Ze!==w)&&(i.blendColor(we.r,we.g,we.b,Ze),S.copy(we),w=Ze),_=O,P=!1}function Et(O,_t){O.side===fe?yt(i.CULL_FACE):pt(i.CULL_FACE);let tt=O.side===je;_t&&(tt=!tt),W(tt),O.blending===Hi&&O.transparent===!1?C(En):C(O.blending,O.blendEquation,O.blendSrc,O.blendDst,O.blendEquationAlpha,O.blendSrcAlpha,O.blendDstAlpha,O.blendColor,O.blendAlpha,O.premultipliedAlpha),r.setFunc(O.depthFunc),r.setTest(O.depthTest),r.setMask(O.depthWrite),s.setMask(O.colorWrite);let ht=O.stencilWrite;o.setTest(ht),ht&&(o.setMask(O.stencilWriteMask),o.setFunc(O.stencilFunc,O.stencilRef,O.stencilFuncMask),o.setOp(O.stencilFail,O.stencilZFail,O.stencilZPass)),dt(O.polygonOffset,O.polygonOffsetFactor,O.polygonOffsetUnits),O.alphaToCoverage===!0?pt(i.SAMPLE_ALPHA_TO_COVERAGE):yt(i.SAMPLE_ALPHA_TO_COVERAGE)}function W(O){D!==O&&(O?i.frontFace(i.CW):i.frontFace(i.CCW),D=O)}function q(O){O!==Su?(pt(i.CULL_FACE),O!==x&&(O===hc?i.cullFace(i.BACK):O===bu?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):yt(i.CULL_FACE),x=O}function ot(O){O!==E&&(V&&i.lineWidth(O),E=O)}function dt(O,_t,tt){O?(pt(i.POLYGON_OFFSET_FILL),(N!==_t||z!==tt)&&(i.polygonOffset(_t,tt),N=_t,z=tt)):yt(i.POLYGON_OFFSET_FILL)}function mt(O){O?pt(i.SCISSOR_TEST):yt(i.SCISSOR_TEST)}function R(O){O===void 0&&(O=i.TEXTURE0+I-1),Y!==O&&(i.activeTexture(O),Y=O)}function b(O,_t,tt){tt===void 0&&(Y===null?tt=i.TEXTURE0+I-1:tt=Y);let ht=X[tt];ht===void 0&&(ht={type:void 0,texture:void 0},X[tt]=ht),(ht.type!==O||ht.texture!==_t)&&(Y!==tt&&(i.activeTexture(tt),Y=tt),i.bindTexture(O,_t||lt[O]),ht.type=O,ht.texture=_t)}function G(){let O=X[Y];O!==void 0&&O.type!==void 0&&(i.bindTexture(O.type,null),O.type=void 0,O.texture=void 0)}function et(){try{i.compressedTexImage2D.apply(i,arguments)}catch(O){console.error("THREE.WebGLState:",O)}}function st(){try{i.compressedTexImage3D.apply(i,arguments)}catch(O){console.error("THREE.WebGLState:",O)}}function j(){try{i.texSubImage2D.apply(i,arguments)}catch(O){console.error("THREE.WebGLState:",O)}}function Rt(){try{i.texSubImage3D.apply(i,arguments)}catch(O){console.error("THREE.WebGLState:",O)}}function St(){try{i.compressedTexSubImage2D.apply(i,arguments)}catch(O){console.error("THREE.WebGLState:",O)}}function At(){try{i.compressedTexSubImage3D.apply(i,arguments)}catch(O){console.error("THREE.WebGLState:",O)}}function jt(){try{i.texStorage2D.apply(i,arguments)}catch(O){console.error("THREE.WebGLState:",O)}}function ft(){try{i.texStorage3D.apply(i,arguments)}catch(O){console.error("THREE.WebGLState:",O)}}function H(){try{i.texImage2D.apply(i,arguments)}catch(O){console.error("THREE.WebGLState:",O)}}function nt(){try{i.texImage3D.apply(i,arguments)}catch(O){console.error("THREE.WebGLState:",O)}}function xt(O){bt.equals(O)===!1&&(i.scissor(O.x,O.y,O.z,O.w),bt.copy(O))}function gt(O){It.equals(O)===!1&&(i.viewport(O.x,O.y,O.z,O.w),It.copy(O))}function Dt(O,_t){let tt=l.get(_t);tt===void 0&&(tt=new WeakMap,l.set(_t,tt));let ht=tt.get(O);ht===void 0&&(ht=i.getUniformBlockIndex(_t,O.name),tt.set(O,ht))}function zt(O,_t){let ht=l.get(_t).get(O);a.get(_t)!==ht&&(i.uniformBlockBinding(_t,ht,O.__bindingPointIndex),a.set(_t,ht))}function $t(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),c={},Y=null,X={},f={},h=new WeakMap,d=[],p=null,g=!1,_=null,m=null,u=null,y=null,v=null,M=null,A=null,S=new Gt(0,0,0),w=0,P=!1,D=null,x=null,E=null,N=null,z=null,bt.set(0,0,i.canvas.width,i.canvas.height),It.set(0,0,i.canvas.width,i.canvas.height),s.reset(),r.reset(),o.reset()}return{buffers:{color:s,depth:r,stencil:o},enable:pt,disable:yt,bindFramebuffer:Nt,drawBuffers:Ot,useProgram:Vt,setBlending:C,setMaterial:Et,setFlipSided:W,setCullFace:q,setLineWidth:ot,setPolygonOffset:dt,setScissorTest:mt,activeTexture:R,bindTexture:b,unbindTexture:G,compressedTexImage2D:et,compressedTexImage3D:st,texImage2D:H,texImage3D:nt,updateUBOMapping:Dt,uniformBlockBinding:zt,texStorage2D:jt,texStorage3D:ft,texSubImage2D:j,texSubImage3D:Rt,compressedTexSubImage2D:St,compressedTexSubImage3D:At,scissor:xt,viewport:gt,reset:$t}}function sh(i,t,e,n){let s=tg(n);switch(e){case bh:return i*t;case Th:return i*t;case Ah:return i*t*2;case Ll:return i*t/s.components*s.byteLength;case Dl:return i*t/s.components*s.byteLength;case Rh:return i*t*2/s.components*s.byteLength;case Ul:return i*t*2/s.components*s.byteLength;case wh:return i*t*3/s.components*s.byteLength;case yn:return i*t*4/s.components*s.byteLength;case Nl:return i*t*4/s.components*s.byteLength;case xr:case yr:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case _r:case vr:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case da:case ma:return Math.max(i,16)*Math.max(t,8)/4;case fa:case pa:return Math.max(i,8)*Math.max(t,8)/2;case ga:case xa:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case ya:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case _a:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case va:return Math.floor((i+4)/5)*Math.floor((t+3)/4)*16;case Ma:return Math.floor((i+4)/5)*Math.floor((t+4)/5)*16;case Ea:return Math.floor((i+5)/6)*Math.floor((t+4)/5)*16;case Sa:return Math.floor((i+5)/6)*Math.floor((t+5)/6)*16;case ba:return Math.floor((i+7)/8)*Math.floor((t+4)/5)*16;case wa:return Math.floor((i+7)/8)*Math.floor((t+5)/6)*16;case Ta:return Math.floor((i+7)/8)*Math.floor((t+7)/8)*16;case Aa:return Math.floor((i+9)/10)*Math.floor((t+4)/5)*16;case Ra:return Math.floor((i+9)/10)*Math.floor((t+5)/6)*16;case Ca:return Math.floor((i+9)/10)*Math.floor((t+7)/8)*16;case Pa:return Math.floor((i+9)/10)*Math.floor((t+9)/10)*16;case Ia:return Math.floor((i+11)/12)*Math.floor((t+9)/10)*16;case La:return Math.floor((i+11)/12)*Math.floor((t+11)/12)*16;case Mr:case Da:case Ua:return Math.ceil(i/4)*Math.ceil(t/4)*16;case Ch:case Na:return Math.ceil(i/4)*Math.ceil(t/4)*8;case Fa:case za:return Math.ceil(i/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function tg(i){switch(i){case zn:case Mh:return{byteLength:1,components:1};case ms:case Eh:case Is:return{byteLength:2,components:1};case Pl:case Il:return{byteLength:2,components:4};case mi:case Cl:case Mn:return{byteLength:4,components:1};case Sh:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${i}.`)}function eg(i,t,e,n,s,r,o){let a=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new Mt,f=new WeakMap,h,d=new WeakMap,p=!1;try{p=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(R,b){return p?new OffscreenCanvas(R,b):gs("canvas")}function _(R,b,G){let et=1,st=mt(R);if((st.width>G||st.height>G)&&(et=G/Math.max(st.width,st.height)),et<1)if(typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&R instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&R instanceof ImageBitmap||typeof VideoFrame<"u"&&R instanceof VideoFrame){let j=Math.floor(et*st.width),Rt=Math.floor(et*st.height);h===void 0&&(h=g(j,Rt));let St=b?g(j,Rt):h;return St.width=j,St.height=Rt,St.getContext("2d").drawImage(R,0,0,j,Rt),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+st.width+"x"+st.height+") to ("+j+"x"+Rt+")."),St}else return"data"in R&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+st.width+"x"+st.height+")."),R;return R}function m(R){return R.generateMipmaps&&R.minFilter!==Ke&&R.minFilter!==xn}function u(R){i.generateMipmap(R)}function y(R,b,G,et,st=!1){if(R!==null){if(i[R]!==void 0)return i[R];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+R+"'")}let j=b;if(b===i.RED&&(G===i.FLOAT&&(j=i.R32F),G===i.HALF_FLOAT&&(j=i.R16F),G===i.UNSIGNED_BYTE&&(j=i.R8)),b===i.RED_INTEGER&&(G===i.UNSIGNED_BYTE&&(j=i.R8UI),G===i.UNSIGNED_SHORT&&(j=i.R16UI),G===i.UNSIGNED_INT&&(j=i.R32UI),G===i.BYTE&&(j=i.R8I),G===i.SHORT&&(j=i.R16I),G===i.INT&&(j=i.R32I)),b===i.RG&&(G===i.FLOAT&&(j=i.RG32F),G===i.HALF_FLOAT&&(j=i.RG16F),G===i.UNSIGNED_BYTE&&(j=i.RG8)),b===i.RG_INTEGER&&(G===i.UNSIGNED_BYTE&&(j=i.RG8UI),G===i.UNSIGNED_SHORT&&(j=i.RG16UI),G===i.UNSIGNED_INT&&(j=i.RG32UI),G===i.BYTE&&(j=i.RG8I),G===i.SHORT&&(j=i.RG16I),G===i.INT&&(j=i.RG32I)),b===i.RGB_INTEGER&&(G===i.UNSIGNED_BYTE&&(j=i.RGB8UI),G===i.UNSIGNED_SHORT&&(j=i.RGB16UI),G===i.UNSIGNED_INT&&(j=i.RGB32UI),G===i.BYTE&&(j=i.RGB8I),G===i.SHORT&&(j=i.RGB16I),G===i.INT&&(j=i.RGB32I)),b===i.RGBA_INTEGER&&(G===i.UNSIGNED_BYTE&&(j=i.RGBA8UI),G===i.UNSIGNED_SHORT&&(j=i.RGBA16UI),G===i.UNSIGNED_INT&&(j=i.RGBA32UI),G===i.BYTE&&(j=i.RGBA8I),G===i.SHORT&&(j=i.RGBA16I),G===i.INT&&(j=i.RGBA32I)),b===i.RGB&&G===i.UNSIGNED_INT_5_9_9_9_REV&&(j=i.RGB9_E5),b===i.RGBA){let Rt=st?wr:he.getTransfer(et);G===i.FLOAT&&(j=i.RGBA32F),G===i.HALF_FLOAT&&(j=i.RGBA16F),G===i.UNSIGNED_BYTE&&(j=Rt===pe?i.SRGB8_ALPHA8:i.RGBA8),G===i.UNSIGNED_SHORT_4_4_4_4&&(j=i.RGBA4),G===i.UNSIGNED_SHORT_5_5_5_1&&(j=i.RGB5_A1)}return(j===i.R16F||j===i.R32F||j===i.RG16F||j===i.RG32F||j===i.RGBA16F||j===i.RGBA32F)&&t.get("EXT_color_buffer_float"),j}function v(R,b){let G;return R?b===null||b===mi||b===qi?G=i.DEPTH24_STENCIL8:b===Mn?G=i.DEPTH32F_STENCIL8:b===ms&&(G=i.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):b===null||b===mi||b===qi?G=i.DEPTH_COMPONENT24:b===Mn?G=i.DEPTH_COMPONENT32F:b===ms&&(G=i.DEPTH_COMPONENT16),G}function M(R,b){return m(R)===!0||R.isFramebufferTexture&&R.minFilter!==Ke&&R.minFilter!==xn?Math.log2(Math.max(b.width,b.height))+1:R.mipmaps!==void 0&&R.mipmaps.length>0?R.mipmaps.length:R.isCompressedTexture&&Array.isArray(R.image)?b.mipmaps.length:1}function A(R){let b=R.target;b.removeEventListener("dispose",A),w(b),b.isVideoTexture&&f.delete(b)}function S(R){let b=R.target;b.removeEventListener("dispose",S),D(b)}function w(R){let b=n.get(R);if(b.__webglInit===void 0)return;let G=R.source,et=d.get(G);if(et){let st=et[b.__cacheKey];st.usedTimes--,st.usedTimes===0&&P(R),Object.keys(et).length===0&&d.delete(G)}n.remove(R)}function P(R){let b=n.get(R);i.deleteTexture(b.__webglTexture);let G=R.source,et=d.get(G);delete et[b.__cacheKey],o.memory.textures--}function D(R){let b=n.get(R);if(R.depthTexture&&R.depthTexture.dispose(),R.isWebGLCubeRenderTarget)for(let et=0;et<6;et++){if(Array.isArray(b.__webglFramebuffer[et]))for(let st=0;st<b.__webglFramebuffer[et].length;st++)i.deleteFramebuffer(b.__webglFramebuffer[et][st]);else i.deleteFramebuffer(b.__webglFramebuffer[et]);b.__webglDepthbuffer&&i.deleteRenderbuffer(b.__webglDepthbuffer[et])}else{if(Array.isArray(b.__webglFramebuffer))for(let et=0;et<b.__webglFramebuffer.length;et++)i.deleteFramebuffer(b.__webglFramebuffer[et]);else i.deleteFramebuffer(b.__webglFramebuffer);if(b.__webglDepthbuffer&&i.deleteRenderbuffer(b.__webglDepthbuffer),b.__webglMultisampledFramebuffer&&i.deleteFramebuffer(b.__webglMultisampledFramebuffer),b.__webglColorRenderbuffer)for(let et=0;et<b.__webglColorRenderbuffer.length;et++)b.__webglColorRenderbuffer[et]&&i.deleteRenderbuffer(b.__webglColorRenderbuffer[et]);b.__webglDepthRenderbuffer&&i.deleteRenderbuffer(b.__webglDepthRenderbuffer)}let G=R.textures;for(let et=0,st=G.length;et<st;et++){let j=n.get(G[et]);j.__webglTexture&&(i.deleteTexture(j.__webglTexture),o.memory.textures--),n.remove(G[et])}n.remove(R)}let x=0;function E(){x=0}function N(){let R=x;return R>=s.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+R+" texture units while this GPU supports only "+s.maxTextures),x+=1,R}function z(R){let b=[];return b.push(R.wrapS),b.push(R.wrapT),b.push(R.wrapR||0),b.push(R.magFilter),b.push(R.minFilter),b.push(R.anisotropy),b.push(R.internalFormat),b.push(R.format),b.push(R.type),b.push(R.generateMipmaps),b.push(R.premultiplyAlpha),b.push(R.flipY),b.push(R.unpackAlignment),b.push(R.colorSpace),b.join()}function I(R,b){let G=n.get(R);if(R.isVideoTexture&&ot(R),R.isRenderTargetTexture===!1&&R.version>0&&G.__version!==R.version){let et=R.image;if(et===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(et.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{It(G,R,b);return}}e.bindTexture(i.TEXTURE_2D,G.__webglTexture,i.TEXTURE0+b)}function V(R,b){let G=n.get(R);if(R.version>0&&G.__version!==R.version){It(G,R,b);return}e.bindTexture(i.TEXTURE_2D_ARRAY,G.__webglTexture,i.TEXTURE0+b)}function F(R,b){let G=n.get(R);if(R.version>0&&G.__version!==R.version){It(G,R,b);return}e.bindTexture(i.TEXTURE_3D,G.__webglTexture,i.TEXTURE0+b)}function Q(R,b){let G=n.get(R);if(R.version>0&&G.__version!==R.version){K(G,R,b);return}e.bindTexture(i.TEXTURE_CUBE_MAP,G.__webglTexture,i.TEXTURE0+b)}let Y={[Kn]:i.REPEAT,[di]:i.CLAMP_TO_EDGE,[ua]:i.MIRRORED_REPEAT},X={[Ke]:i.NEAREST,[ju]:i.NEAREST_MIPMAP_NEAREST,[Vs]:i.NEAREST_MIPMAP_LINEAR,[xn]:i.LINEAR,[_o]:i.LINEAR_MIPMAP_NEAREST,[pi]:i.LINEAR_MIPMAP_LINEAR},it={[nf]:i.NEVER,[cf]:i.ALWAYS,[sf]:i.LESS,[Ih]:i.LEQUAL,[rf]:i.EQUAL,[lf]:i.GEQUAL,[of]:i.GREATER,[af]:i.NOTEQUAL};function rt(R,b){if(b.type===Mn&&t.has("OES_texture_float_linear")===!1&&(b.magFilter===xn||b.magFilter===_o||b.magFilter===Vs||b.magFilter===pi||b.minFilter===xn||b.minFilter===_o||b.minFilter===Vs||b.minFilter===pi)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(R,i.TEXTURE_WRAP_S,Y[b.wrapS]),i.texParameteri(R,i.TEXTURE_WRAP_T,Y[b.wrapT]),(R===i.TEXTURE_3D||R===i.TEXTURE_2D_ARRAY)&&i.texParameteri(R,i.TEXTURE_WRAP_R,Y[b.wrapR]),i.texParameteri(R,i.TEXTURE_MAG_FILTER,X[b.magFilter]),i.texParameteri(R,i.TEXTURE_MIN_FILTER,X[b.minFilter]),b.compareFunction&&(i.texParameteri(R,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(R,i.TEXTURE_COMPARE_FUNC,it[b.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(b.magFilter===Ke||b.minFilter!==Vs&&b.minFilter!==pi||b.type===Mn&&t.has("OES_texture_float_linear")===!1)return;if(b.anisotropy>1||n.get(b).__currentAnisotropy){let G=t.get("EXT_texture_filter_anisotropic");i.texParameterf(R,G.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(b.anisotropy,s.getMaxAnisotropy())),n.get(b).__currentAnisotropy=b.anisotropy}}}function bt(R,b){let G=!1;R.__webglInit===void 0&&(R.__webglInit=!0,b.addEventListener("dispose",A));let et=b.source,st=d.get(et);st===void 0&&(st={},d.set(et,st));let j=z(b);if(j!==R.__cacheKey){st[j]===void 0&&(st[j]={texture:i.createTexture(),usedTimes:0},o.memory.textures++,G=!0),st[j].usedTimes++;let Rt=st[R.__cacheKey];Rt!==void 0&&(st[R.__cacheKey].usedTimes--,Rt.usedTimes===0&&P(b)),R.__cacheKey=j,R.__webglTexture=st[j].texture}return G}function It(R,b,G){let et=i.TEXTURE_2D;(b.isDataArrayTexture||b.isCompressedArrayTexture)&&(et=i.TEXTURE_2D_ARRAY),b.isData3DTexture&&(et=i.TEXTURE_3D);let st=bt(R,b),j=b.source;e.bindTexture(et,R.__webglTexture,i.TEXTURE0+G);let Rt=n.get(j);if(j.version!==Rt.__version||st===!0){e.activeTexture(i.TEXTURE0+G);let St=he.getPrimaries(he.workingColorSpace),At=b.colorSpace===Zn?null:he.getPrimaries(b.colorSpace),jt=b.colorSpace===Zn||St===At?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,b.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,b.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,b.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,jt);let ft=_(b.image,!1,s.maxTextureSize);ft=dt(b,ft);let H=r.convert(b.format,b.colorSpace),nt=r.convert(b.type),xt=y(b.internalFormat,H,nt,b.colorSpace,b.isVideoTexture);rt(et,b);let gt,Dt=b.mipmaps,zt=b.isVideoTexture!==!0,$t=Rt.__version===void 0||st===!0,O=j.dataReady,_t=M(b,ft);if(b.isDepthTexture)xt=v(b.format===Yi,b.type),$t&&(zt?e.texStorage2D(i.TEXTURE_2D,1,xt,ft.width,ft.height):e.texImage2D(i.TEXTURE_2D,0,xt,ft.width,ft.height,0,H,nt,null));else if(b.isDataTexture)if(Dt.length>0){zt&&$t&&e.texStorage2D(i.TEXTURE_2D,_t,xt,Dt[0].width,Dt[0].height);for(let tt=0,ht=Dt.length;tt<ht;tt++)gt=Dt[tt],zt?O&&e.texSubImage2D(i.TEXTURE_2D,tt,0,0,gt.width,gt.height,H,nt,gt.data):e.texImage2D(i.TEXTURE_2D,tt,xt,gt.width,gt.height,0,H,nt,gt.data);b.generateMipmaps=!1}else zt?($t&&e.texStorage2D(i.TEXTURE_2D,_t,xt,ft.width,ft.height),O&&e.texSubImage2D(i.TEXTURE_2D,0,0,0,ft.width,ft.height,H,nt,ft.data)):e.texImage2D(i.TEXTURE_2D,0,xt,ft.width,ft.height,0,H,nt,ft.data);else if(b.isCompressedTexture)if(b.isCompressedArrayTexture){zt&&$t&&e.texStorage3D(i.TEXTURE_2D_ARRAY,_t,xt,Dt[0].width,Dt[0].height,ft.depth);for(let tt=0,ht=Dt.length;tt<ht;tt++)if(gt=Dt[tt],b.format!==yn)if(H!==null)if(zt){if(O)if(b.layerUpdates.size>0){let Ct=sh(gt.width,gt.height,b.format,b.type);for(let Lt of b.layerUpdates){let re=gt.data.subarray(Lt*Ct/gt.data.BYTES_PER_ELEMENT,(Lt+1)*Ct/gt.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,tt,0,0,Lt,gt.width,gt.height,1,H,re,0,0)}b.clearLayerUpdates()}else e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,tt,0,0,0,gt.width,gt.height,ft.depth,H,gt.data,0,0)}else e.compressedTexImage3D(i.TEXTURE_2D_ARRAY,tt,xt,gt.width,gt.height,ft.depth,0,gt.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else zt?O&&e.texSubImage3D(i.TEXTURE_2D_ARRAY,tt,0,0,0,gt.width,gt.height,ft.depth,H,nt,gt.data):e.texImage3D(i.TEXTURE_2D_ARRAY,tt,xt,gt.width,gt.height,ft.depth,0,H,nt,gt.data)}else{zt&&$t&&e.texStorage2D(i.TEXTURE_2D,_t,xt,Dt[0].width,Dt[0].height);for(let tt=0,ht=Dt.length;tt<ht;tt++)gt=Dt[tt],b.format!==yn?H!==null?zt?O&&e.compressedTexSubImage2D(i.TEXTURE_2D,tt,0,0,gt.width,gt.height,H,gt.data):e.compressedTexImage2D(i.TEXTURE_2D,tt,xt,gt.width,gt.height,0,gt.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):zt?O&&e.texSubImage2D(i.TEXTURE_2D,tt,0,0,gt.width,gt.height,H,nt,gt.data):e.texImage2D(i.TEXTURE_2D,tt,xt,gt.width,gt.height,0,H,nt,gt.data)}else if(b.isDataArrayTexture)if(zt){if($t&&e.texStorage3D(i.TEXTURE_2D_ARRAY,_t,xt,ft.width,ft.height,ft.depth),O)if(b.layerUpdates.size>0){let tt=sh(ft.width,ft.height,b.format,b.type);for(let ht of b.layerUpdates){let Ct=ft.data.subarray(ht*tt/ft.data.BYTES_PER_ELEMENT,(ht+1)*tt/ft.data.BYTES_PER_ELEMENT);e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,ht,ft.width,ft.height,1,H,nt,Ct)}b.clearLayerUpdates()}else e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,ft.width,ft.height,ft.depth,H,nt,ft.data)}else e.texImage3D(i.TEXTURE_2D_ARRAY,0,xt,ft.width,ft.height,ft.depth,0,H,nt,ft.data);else if(b.isData3DTexture)zt?($t&&e.texStorage3D(i.TEXTURE_3D,_t,xt,ft.width,ft.height,ft.depth),O&&e.texSubImage3D(i.TEXTURE_3D,0,0,0,0,ft.width,ft.height,ft.depth,H,nt,ft.data)):e.texImage3D(i.TEXTURE_3D,0,xt,ft.width,ft.height,ft.depth,0,H,nt,ft.data);else if(b.isFramebufferTexture){if($t)if(zt)e.texStorage2D(i.TEXTURE_2D,_t,xt,ft.width,ft.height);else{let tt=ft.width,ht=ft.height;for(let Ct=0;Ct<_t;Ct++)e.texImage2D(i.TEXTURE_2D,Ct,xt,tt,ht,0,H,nt,null),tt>>=1,ht>>=1}}else if(Dt.length>0){if(zt&&$t){let tt=mt(Dt[0]);e.texStorage2D(i.TEXTURE_2D,_t,xt,tt.width,tt.height)}for(let tt=0,ht=Dt.length;tt<ht;tt++)gt=Dt[tt],zt?O&&e.texSubImage2D(i.TEXTURE_2D,tt,0,0,H,nt,gt):e.texImage2D(i.TEXTURE_2D,tt,xt,H,nt,gt);b.generateMipmaps=!1}else if(zt){if($t){let tt=mt(ft);e.texStorage2D(i.TEXTURE_2D,_t,xt,tt.width,tt.height)}O&&e.texSubImage2D(i.TEXTURE_2D,0,0,0,H,nt,ft)}else e.texImage2D(i.TEXTURE_2D,0,xt,H,nt,ft);m(b)&&u(et),Rt.__version=j.version,b.onUpdate&&b.onUpdate(b)}R.__version=b.version}function K(R,b,G){if(b.image.length!==6)return;let et=bt(R,b),st=b.source;e.bindTexture(i.TEXTURE_CUBE_MAP,R.__webglTexture,i.TEXTURE0+G);let j=n.get(st);if(st.version!==j.__version||et===!0){e.activeTexture(i.TEXTURE0+G);let Rt=he.getPrimaries(he.workingColorSpace),St=b.colorSpace===Zn?null:he.getPrimaries(b.colorSpace),At=b.colorSpace===Zn||Rt===St?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,b.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,b.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,b.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,At);let jt=b.isCompressedTexture||b.image[0].isCompressedTexture,ft=b.image[0]&&b.image[0].isDataTexture,H=[];for(let ht=0;ht<6;ht++)!jt&&!ft?H[ht]=_(b.image[ht],!0,s.maxCubemapSize):H[ht]=ft?b.image[ht].image:b.image[ht],H[ht]=dt(b,H[ht]);let nt=H[0],xt=r.convert(b.format,b.colorSpace),gt=r.convert(b.type),Dt=y(b.internalFormat,xt,gt,b.colorSpace),zt=b.isVideoTexture!==!0,$t=j.__version===void 0||et===!0,O=st.dataReady,_t=M(b,nt);rt(i.TEXTURE_CUBE_MAP,b);let tt;if(jt){zt&&$t&&e.texStorage2D(i.TEXTURE_CUBE_MAP,_t,Dt,nt.width,nt.height);for(let ht=0;ht<6;ht++){tt=H[ht].mipmaps;for(let Ct=0;Ct<tt.length;Ct++){let Lt=tt[Ct];b.format!==yn?xt!==null?zt?O&&e.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ht,Ct,0,0,Lt.width,Lt.height,xt,Lt.data):e.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ht,Ct,Dt,Lt.width,Lt.height,0,Lt.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):zt?O&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ht,Ct,0,0,Lt.width,Lt.height,xt,gt,Lt.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ht,Ct,Dt,Lt.width,Lt.height,0,xt,gt,Lt.data)}}}else{if(tt=b.mipmaps,zt&&$t){tt.length>0&&_t++;let ht=mt(H[0]);e.texStorage2D(i.TEXTURE_CUBE_MAP,_t,Dt,ht.width,ht.height)}for(let ht=0;ht<6;ht++)if(ft){zt?O&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ht,0,0,0,H[ht].width,H[ht].height,xt,gt,H[ht].data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ht,0,Dt,H[ht].width,H[ht].height,0,xt,gt,H[ht].data);for(let Ct=0;Ct<tt.length;Ct++){let re=tt[Ct].image[ht].image;zt?O&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ht,Ct+1,0,0,re.width,re.height,xt,gt,re.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ht,Ct+1,Dt,re.width,re.height,0,xt,gt,re.data)}}else{zt?O&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ht,0,0,0,xt,gt,H[ht]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ht,0,Dt,xt,gt,H[ht]);for(let Ct=0;Ct<tt.length;Ct++){let Lt=tt[Ct];zt?O&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ht,Ct+1,0,0,xt,gt,Lt.image[ht]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ht,Ct+1,Dt,xt,gt,Lt.image[ht])}}}m(b)&&u(i.TEXTURE_CUBE_MAP),j.__version=st.version,b.onUpdate&&b.onUpdate(b)}R.__version=b.version}function lt(R,b,G,et,st,j){let Rt=r.convert(G.format,G.colorSpace),St=r.convert(G.type),At=y(G.internalFormat,Rt,St,G.colorSpace);if(!n.get(b).__hasExternalTextures){let ft=Math.max(1,b.width>>j),H=Math.max(1,b.height>>j);st===i.TEXTURE_3D||st===i.TEXTURE_2D_ARRAY?e.texImage3D(st,j,At,ft,H,b.depth,0,Rt,St,null):e.texImage2D(st,j,At,ft,H,0,Rt,St,null)}e.bindFramebuffer(i.FRAMEBUFFER,R),q(b)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,et,st,n.get(G).__webglTexture,0,W(b)):(st===i.TEXTURE_2D||st>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&st<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,et,st,n.get(G).__webglTexture,j),e.bindFramebuffer(i.FRAMEBUFFER,null)}function pt(R,b,G){if(i.bindRenderbuffer(i.RENDERBUFFER,R),b.depthBuffer){let et=b.depthTexture,st=et&&et.isDepthTexture?et.type:null,j=v(b.stencilBuffer,st),Rt=b.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,St=W(b);q(b)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,St,j,b.width,b.height):G?i.renderbufferStorageMultisample(i.RENDERBUFFER,St,j,b.width,b.height):i.renderbufferStorage(i.RENDERBUFFER,j,b.width,b.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,Rt,i.RENDERBUFFER,R)}else{let et=b.textures;for(let st=0;st<et.length;st++){let j=et[st],Rt=r.convert(j.format,j.colorSpace),St=r.convert(j.type),At=y(j.internalFormat,Rt,St,j.colorSpace),jt=W(b);G&&q(b)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,jt,At,b.width,b.height):q(b)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,jt,At,b.width,b.height):i.renderbufferStorage(i.RENDERBUFFER,At,b.width,b.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function yt(R,b){if(b&&b.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(e.bindFramebuffer(i.FRAMEBUFFER,R),!(b.depthTexture&&b.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");(!n.get(b.depthTexture).__webglTexture||b.depthTexture.image.width!==b.width||b.depthTexture.image.height!==b.height)&&(b.depthTexture.image.width=b.width,b.depthTexture.image.height=b.height,b.depthTexture.needsUpdate=!0),I(b.depthTexture,0);let et=n.get(b.depthTexture).__webglTexture,st=W(b);if(b.depthTexture.format===Bi)q(b)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,et,0,st):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,et,0);else if(b.depthTexture.format===Yi)q(b)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,et,0,st):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,et,0);else throw new Error("Unknown depthTexture format")}function Nt(R){let b=n.get(R),G=R.isWebGLCubeRenderTarget===!0;if(b.__boundDepthTexture!==R.depthTexture){let et=R.depthTexture;if(b.__depthDisposeCallback&&b.__depthDisposeCallback(),et){let st=()=>{delete b.__boundDepthTexture,delete b.__depthDisposeCallback,et.removeEventListener("dispose",st)};et.addEventListener("dispose",st),b.__depthDisposeCallback=st}b.__boundDepthTexture=et}if(R.depthTexture&&!b.__autoAllocateDepthBuffer){if(G)throw new Error("target.depthTexture not supported in Cube render targets");yt(b.__webglFramebuffer,R)}else if(G){b.__webglDepthbuffer=[];for(let et=0;et<6;et++)if(e.bindFramebuffer(i.FRAMEBUFFER,b.__webglFramebuffer[et]),b.__webglDepthbuffer[et]===void 0)b.__webglDepthbuffer[et]=i.createRenderbuffer(),pt(b.__webglDepthbuffer[et],R,!1);else{let st=R.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,j=b.__webglDepthbuffer[et];i.bindRenderbuffer(i.RENDERBUFFER,j),i.framebufferRenderbuffer(i.FRAMEBUFFER,st,i.RENDERBUFFER,j)}}else if(e.bindFramebuffer(i.FRAMEBUFFER,b.__webglFramebuffer),b.__webglDepthbuffer===void 0)b.__webglDepthbuffer=i.createRenderbuffer(),pt(b.__webglDepthbuffer,R,!1);else{let et=R.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,st=b.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,st),i.framebufferRenderbuffer(i.FRAMEBUFFER,et,i.RENDERBUFFER,st)}e.bindFramebuffer(i.FRAMEBUFFER,null)}function Ot(R,b,G){let et=n.get(R);b!==void 0&&lt(et.__webglFramebuffer,R,R.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),G!==void 0&&Nt(R)}function Vt(R){let b=R.texture,G=n.get(R),et=n.get(b);R.addEventListener("dispose",S);let st=R.textures,j=R.isWebGLCubeRenderTarget===!0,Rt=st.length>1;if(Rt||(et.__webglTexture===void 0&&(et.__webglTexture=i.createTexture()),et.__version=b.version,o.memory.textures++),j){G.__webglFramebuffer=[];for(let St=0;St<6;St++)if(b.mipmaps&&b.mipmaps.length>0){G.__webglFramebuffer[St]=[];for(let At=0;At<b.mipmaps.length;At++)G.__webglFramebuffer[St][At]=i.createFramebuffer()}else G.__webglFramebuffer[St]=i.createFramebuffer()}else{if(b.mipmaps&&b.mipmaps.length>0){G.__webglFramebuffer=[];for(let St=0;St<b.mipmaps.length;St++)G.__webglFramebuffer[St]=i.createFramebuffer()}else G.__webglFramebuffer=i.createFramebuffer();if(Rt)for(let St=0,At=st.length;St<At;St++){let jt=n.get(st[St]);jt.__webglTexture===void 0&&(jt.__webglTexture=i.createTexture(),o.memory.textures++)}if(R.samples>0&&q(R)===!1){G.__webglMultisampledFramebuffer=i.createFramebuffer(),G.__webglColorRenderbuffer=[],e.bindFramebuffer(i.FRAMEBUFFER,G.__webglMultisampledFramebuffer);for(let St=0;St<st.length;St++){let At=st[St];G.__webglColorRenderbuffer[St]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,G.__webglColorRenderbuffer[St]);let jt=r.convert(At.format,At.colorSpace),ft=r.convert(At.type),H=y(At.internalFormat,jt,ft,At.colorSpace,R.isXRRenderTarget===!0),nt=W(R);i.renderbufferStorageMultisample(i.RENDERBUFFER,nt,H,R.width,R.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+St,i.RENDERBUFFER,G.__webglColorRenderbuffer[St])}i.bindRenderbuffer(i.RENDERBUFFER,null),R.depthBuffer&&(G.__webglDepthRenderbuffer=i.createRenderbuffer(),pt(G.__webglDepthRenderbuffer,R,!0)),e.bindFramebuffer(i.FRAMEBUFFER,null)}}if(j){e.bindTexture(i.TEXTURE_CUBE_MAP,et.__webglTexture),rt(i.TEXTURE_CUBE_MAP,b);for(let St=0;St<6;St++)if(b.mipmaps&&b.mipmaps.length>0)for(let At=0;At<b.mipmaps.length;At++)lt(G.__webglFramebuffer[St][At],R,b,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+St,At);else lt(G.__webglFramebuffer[St],R,b,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+St,0);m(b)&&u(i.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(Rt){for(let St=0,At=st.length;St<At;St++){let jt=st[St],ft=n.get(jt);e.bindTexture(i.TEXTURE_2D,ft.__webglTexture),rt(i.TEXTURE_2D,jt),lt(G.__webglFramebuffer,R,jt,i.COLOR_ATTACHMENT0+St,i.TEXTURE_2D,0),m(jt)&&u(i.TEXTURE_2D)}e.unbindTexture()}else{let St=i.TEXTURE_2D;if((R.isWebGL3DRenderTarget||R.isWebGLArrayRenderTarget)&&(St=R.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),e.bindTexture(St,et.__webglTexture),rt(St,b),b.mipmaps&&b.mipmaps.length>0)for(let At=0;At<b.mipmaps.length;At++)lt(G.__webglFramebuffer[At],R,b,i.COLOR_ATTACHMENT0,St,At);else lt(G.__webglFramebuffer,R,b,i.COLOR_ATTACHMENT0,St,0);m(b)&&u(St),e.unbindTexture()}R.depthBuffer&&Nt(R)}function Jt(R){let b=R.textures;for(let G=0,et=b.length;G<et;G++){let st=b[G];if(m(st)){let j=R.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:i.TEXTURE_2D,Rt=n.get(st).__webglTexture;e.bindTexture(j,Rt),u(j),e.unbindTexture()}}}let ct=[],C=[];function Et(R){if(R.samples>0){if(q(R)===!1){let b=R.textures,G=R.width,et=R.height,st=i.COLOR_BUFFER_BIT,j=R.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,Rt=n.get(R),St=b.length>1;if(St)for(let At=0;At<b.length;At++)e.bindFramebuffer(i.FRAMEBUFFER,Rt.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+At,i.RENDERBUFFER,null),e.bindFramebuffer(i.FRAMEBUFFER,Rt.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+At,i.TEXTURE_2D,null,0);e.bindFramebuffer(i.READ_FRAMEBUFFER,Rt.__webglMultisampledFramebuffer),e.bindFramebuffer(i.DRAW_FRAMEBUFFER,Rt.__webglFramebuffer);for(let At=0;At<b.length;At++){if(R.resolveDepthBuffer&&(R.depthBuffer&&(st|=i.DEPTH_BUFFER_BIT),R.stencilBuffer&&R.resolveStencilBuffer&&(st|=i.STENCIL_BUFFER_BIT)),St){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,Rt.__webglColorRenderbuffer[At]);let jt=n.get(b[At]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,jt,0)}i.blitFramebuffer(0,0,G,et,0,0,G,et,st,i.NEAREST),l===!0&&(ct.length=0,C.length=0,ct.push(i.COLOR_ATTACHMENT0+At),R.depthBuffer&&R.resolveDepthBuffer===!1&&(ct.push(j),C.push(j),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,C)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,ct))}if(e.bindFramebuffer(i.READ_FRAMEBUFFER,null),e.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),St)for(let At=0;At<b.length;At++){e.bindFramebuffer(i.FRAMEBUFFER,Rt.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+At,i.RENDERBUFFER,Rt.__webglColorRenderbuffer[At]);let jt=n.get(b[At]).__webglTexture;e.bindFramebuffer(i.FRAMEBUFFER,Rt.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+At,i.TEXTURE_2D,jt,0)}e.bindFramebuffer(i.DRAW_FRAMEBUFFER,Rt.__webglMultisampledFramebuffer)}else if(R.depthBuffer&&R.resolveDepthBuffer===!1&&l){let b=R.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[b])}}}function W(R){return Math.min(s.maxSamples,R.samples)}function q(R){let b=n.get(R);return R.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&b.__useRenderToTexture!==!1}function ot(R){let b=o.render.frame;f.get(R)!==b&&(f.set(R,b),R.update())}function dt(R,b){let G=R.colorSpace,et=R.format,st=R.type;return R.isCompressedTexture===!0||R.isVideoTexture===!0||G!==ei&&G!==Zn&&(he.getTransfer(G)===pe?(et!==yn||st!==zn)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",G)),b}function mt(R){return typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement?(c.width=R.naturalWidth||R.width,c.height=R.naturalHeight||R.height):typeof VideoFrame<"u"&&R instanceof VideoFrame?(c.width=R.displayWidth,c.height=R.displayHeight):(c.width=R.width,c.height=R.height),c}this.allocateTextureUnit=N,this.resetTextureUnits=E,this.setTexture2D=I,this.setTexture2DArray=V,this.setTexture3D=F,this.setTextureCube=Q,this.rebindTextures=Ot,this.setupRenderTarget=Vt,this.updateRenderTargetMipmap=Jt,this.updateMultisampleRenderTarget=Et,this.setupDepthRenderbuffer=Nt,this.setupFrameBufferTexture=lt,this.useMultisampledRTT=q}function ng(i,t){function e(n,s=Zn){let r,o=he.getTransfer(s);if(n===zn)return i.UNSIGNED_BYTE;if(n===Pl)return i.UNSIGNED_SHORT_4_4_4_4;if(n===Il)return i.UNSIGNED_SHORT_5_5_5_1;if(n===Sh)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===Mh)return i.BYTE;if(n===Eh)return i.SHORT;if(n===ms)return i.UNSIGNED_SHORT;if(n===Cl)return i.INT;if(n===mi)return i.UNSIGNED_INT;if(n===Mn)return i.FLOAT;if(n===Is)return i.HALF_FLOAT;if(n===bh)return i.ALPHA;if(n===wh)return i.RGB;if(n===yn)return i.RGBA;if(n===Th)return i.LUMINANCE;if(n===Ah)return i.LUMINANCE_ALPHA;if(n===Bi)return i.DEPTH_COMPONENT;if(n===Yi)return i.DEPTH_STENCIL;if(n===Ll)return i.RED;if(n===Dl)return i.RED_INTEGER;if(n===Rh)return i.RG;if(n===Ul)return i.RG_INTEGER;if(n===Nl)return i.RGBA_INTEGER;if(n===xr||n===yr||n===_r||n===vr)if(o===pe)if(r=t.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===xr)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===yr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===_r)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===vr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=t.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===xr)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===yr)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===_r)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===vr)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===fa||n===da||n===pa||n===ma)if(r=t.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===fa)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===da)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===pa)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===ma)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===ga||n===xa||n===ya)if(r=t.get("WEBGL_compressed_texture_etc"),r!==null){if(n===ga||n===xa)return o===pe?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===ya)return o===pe?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===_a||n===va||n===Ma||n===Ea||n===Sa||n===ba||n===wa||n===Ta||n===Aa||n===Ra||n===Ca||n===Pa||n===Ia||n===La)if(r=t.get("WEBGL_compressed_texture_astc"),r!==null){if(n===_a)return o===pe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===va)return o===pe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Ma)return o===pe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Ea)return o===pe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===Sa)return o===pe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===ba)return o===pe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===wa)return o===pe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Ta)return o===pe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Aa)return o===pe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Ra)return o===pe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Ca)return o===pe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Pa)return o===pe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Ia)return o===pe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===La)return o===pe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Mr||n===Da||n===Ua)if(r=t.get("EXT_texture_compression_bptc"),r!==null){if(n===Mr)return o===pe?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Da)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Ua)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Ch||n===Na||n===Fa||n===za)if(r=t.get("EXT_texture_compression_rgtc"),r!==null){if(n===Mr)return r.COMPRESSED_RED_RGTC1_EXT;if(n===Na)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Fa)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===za)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===qi?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:e}}var Qa=class extends Ge{constructor(t=[]){super(),this.isArrayCamera=!0,this.cameras=t}},Yt=class extends Re{constructor(){super(),this.isGroup=!0,this.type="Group"}},ig={type:"move"},us=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Yt,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Yt,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new U,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new U),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Yt,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new U,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new U),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){let e=this._hand;if(e)for(let n of t.hand.values())this._getHandJoint(e,n)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,n){let s=null,r=null,o=null,a=this._targetRay,l=this._grip,c=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(c&&t.hand){o=!0;for(let _ of t.hand.values()){let m=e.getJointPose(_,n),u=this._getHandJoint(c,_);m!==null&&(u.matrix.fromArray(m.transform.matrix),u.matrix.decompose(u.position,u.rotation,u.scale),u.matrixWorldNeedsUpdate=!0,u.jointRadius=m.radius),u.visible=m!==null}let f=c.joints["index-finger-tip"],h=c.joints["thumb-tip"],d=f.position.distanceTo(h.position),p=.02,g=.005;c.inputState.pinching&&d>p+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!c.inputState.pinching&&d<=p-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else l!==null&&t.gripSpace&&(r=e.getPose(t.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1));a!==null&&(s=e.getPose(t.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(a.matrix.fromArray(s.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,s.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(s.linearVelocity)):a.hasLinearVelocity=!1,s.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(s.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(ig)))}return a!==null&&(a.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){let n=new Yt;n.matrixAutoUpdate=!1,n.visible=!1,t.joints[e.jointName]=n,t.add(n)}return t.joints[e.jointName]}},sg=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,rg=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,tl=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e,n){if(this.texture===null){let s=new Ve,r=t.properties.get(s);r.__webglTexture=e.texture,(e.depthNear!=n.depthNear||e.depthFar!=n.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=s}}getMesh(t){if(this.texture!==null&&this.mesh===null){let e=t.cameras[0].viewport,n=new bn({vertexShader:sg,fragmentShader:rg,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new ut(new ie(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},el=class extends jn{constructor(t,e){super();let n=this,s=null,r=1,o=null,a="local-floor",l=1,c=null,f=null,h=null,d=null,p=null,g=null,_=new tl,m=e.getContextAttributes(),u=null,y=null,v=[],M=[],A=new Mt,S=null,w=new Ge;w.layers.enable(1),w.viewport=new Me;let P=new Ge;P.layers.enable(2),P.viewport=new Me;let D=[w,P],x=new Qa;x.layers.enable(1),x.layers.enable(2);let E=null,N=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(K){let lt=v[K];return lt===void 0&&(lt=new us,v[K]=lt),lt.getTargetRaySpace()},this.getControllerGrip=function(K){let lt=v[K];return lt===void 0&&(lt=new us,v[K]=lt),lt.getGripSpace()},this.getHand=function(K){let lt=v[K];return lt===void 0&&(lt=new us,v[K]=lt),lt.getHandSpace()};function z(K){let lt=M.indexOf(K.inputSource);if(lt===-1)return;let pt=v[lt];pt!==void 0&&(pt.update(K.inputSource,K.frame,c||o),pt.dispatchEvent({type:K.type,data:K.inputSource}))}function I(){s.removeEventListener("select",z),s.removeEventListener("selectstart",z),s.removeEventListener("selectend",z),s.removeEventListener("squeeze",z),s.removeEventListener("squeezestart",z),s.removeEventListener("squeezeend",z),s.removeEventListener("end",I),s.removeEventListener("inputsourceschange",V);for(let K=0;K<v.length;K++){let lt=M[K];lt!==null&&(M[K]=null,v[K].disconnect(lt))}E=null,N=null,_.reset(),t.setRenderTarget(u),p=null,d=null,h=null,s=null,y=null,It.stop(),n.isPresenting=!1,t.setPixelRatio(S),t.setSize(A.width,A.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(K){r=K,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(K){a=K,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(K){c=K},this.getBaseLayer=function(){return d!==null?d:p},this.getBinding=function(){return h},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function(K){if(s=K,s!==null){if(u=t.getRenderTarget(),s.addEventListener("select",z),s.addEventListener("selectstart",z),s.addEventListener("selectend",z),s.addEventListener("squeeze",z),s.addEventListener("squeezestart",z),s.addEventListener("squeezeend",z),s.addEventListener("end",I),s.addEventListener("inputsourceschange",V),m.xrCompatible!==!0&&await e.makeXRCompatible(),S=t.getPixelRatio(),t.getSize(A),s.renderState.layers===void 0){let lt={antialias:m.antialias,alpha:!0,depth:m.depth,stencil:m.stencil,framebufferScaleFactor:r};p=new XRWebGLLayer(s,e,lt),s.updateRenderState({baseLayer:p}),t.setPixelRatio(1),t.setSize(p.framebufferWidth,p.framebufferHeight,!1),y=new On(p.framebufferWidth,p.framebufferHeight,{format:yn,type:zn,colorSpace:t.outputColorSpace,stencilBuffer:m.stencil})}else{let lt=null,pt=null,yt=null;m.depth&&(yt=m.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,lt=m.stencil?Yi:Bi,pt=m.stencil?qi:mi);let Nt={colorFormat:e.RGBA8,depthFormat:yt,scaleFactor:r};h=new XRWebGLBinding(s,e),d=h.createProjectionLayer(Nt),s.updateRenderState({layers:[d]}),t.setPixelRatio(1),t.setSize(d.textureWidth,d.textureHeight,!1),y=new On(d.textureWidth,d.textureHeight,{format:yn,type:zn,depthTexture:new Fr(d.textureWidth,d.textureHeight,pt,void 0,void 0,void 0,void 0,void 0,void 0,lt),stencilBuffer:m.stencil,colorSpace:t.outputColorSpace,samples:m.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1})}y.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await s.requestReferenceSpace(a),It.setContext(s),It.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return _.getDepthTexture()};function V(K){for(let lt=0;lt<K.removed.length;lt++){let pt=K.removed[lt],yt=M.indexOf(pt);yt>=0&&(M[yt]=null,v[yt].disconnect(pt))}for(let lt=0;lt<K.added.length;lt++){let pt=K.added[lt],yt=M.indexOf(pt);if(yt===-1){for(let Ot=0;Ot<v.length;Ot++)if(Ot>=M.length){M.push(pt),yt=Ot;break}else if(M[Ot]===null){M[Ot]=pt,yt=Ot;break}if(yt===-1)break}let Nt=v[yt];Nt&&Nt.connect(pt)}}let F=new U,Q=new U;function Y(K,lt,pt){F.setFromMatrixPosition(lt.matrixWorld),Q.setFromMatrixPosition(pt.matrixWorld);let yt=F.distanceTo(Q),Nt=lt.projectionMatrix.elements,Ot=pt.projectionMatrix.elements,Vt=Nt[14]/(Nt[10]-1),Jt=Nt[14]/(Nt[10]+1),ct=(Nt[9]+1)/Nt[5],C=(Nt[9]-1)/Nt[5],Et=(Nt[8]-1)/Nt[0],W=(Ot[8]+1)/Ot[0],q=Vt*Et,ot=Vt*W,dt=yt/(-Et+W),mt=dt*-Et;if(lt.matrixWorld.decompose(K.position,K.quaternion,K.scale),K.translateX(mt),K.translateZ(dt),K.matrixWorld.compose(K.position,K.quaternion,K.scale),K.matrixWorldInverse.copy(K.matrixWorld).invert(),Nt[10]===-1)K.projectionMatrix.copy(lt.projectionMatrix),K.projectionMatrixInverse.copy(lt.projectionMatrixInverse);else{let R=Vt+dt,b=Jt+dt,G=q-mt,et=ot+(yt-mt),st=ct*Jt/b*R,j=C*Jt/b*R;K.projectionMatrix.makePerspective(G,et,st,j,R,b),K.projectionMatrixInverse.copy(K.projectionMatrix).invert()}}function X(K,lt){lt===null?K.matrixWorld.copy(K.matrix):K.matrixWorld.multiplyMatrices(lt.matrixWorld,K.matrix),K.matrixWorldInverse.copy(K.matrixWorld).invert()}this.updateCamera=function(K){if(s===null)return;let lt=K.near,pt=K.far;_.texture!==null&&(_.depthNear>0&&(lt=_.depthNear),_.depthFar>0&&(pt=_.depthFar)),x.near=P.near=w.near=lt,x.far=P.far=w.far=pt,(E!==x.near||N!==x.far)&&(s.updateRenderState({depthNear:x.near,depthFar:x.far}),E=x.near,N=x.far);let yt=K.parent,Nt=x.cameras;X(x,yt);for(let Ot=0;Ot<Nt.length;Ot++)X(Nt[Ot],yt);Nt.length===2?Y(x,w,P):x.projectionMatrix.copy(w.projectionMatrix),it(K,x,yt)};function it(K,lt,pt){pt===null?K.matrix.copy(lt.matrixWorld):(K.matrix.copy(pt.matrixWorld),K.matrix.invert(),K.matrix.multiply(lt.matrixWorld)),K.matrix.decompose(K.position,K.quaternion,K.scale),K.updateMatrixWorld(!0),K.projectionMatrix.copy(lt.projectionMatrix),K.projectionMatrixInverse.copy(lt.projectionMatrixInverse),K.isPerspectiveCamera&&(K.fov=Ha*2*Math.atan(1/K.projectionMatrix.elements[5]),K.zoom=1)}this.getCamera=function(){return x},this.getFoveation=function(){if(!(d===null&&p===null))return l},this.setFoveation=function(K){l=K,d!==null&&(d.fixedFoveation=K),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=K)},this.hasDepthSensing=function(){return _.texture!==null},this.getDepthSensingMesh=function(){return _.getMesh(x)};let rt=null;function bt(K,lt){if(f=lt.getViewerPose(c||o),g=lt,f!==null){let pt=f.views;p!==null&&(t.setRenderTargetFramebuffer(y,p.framebuffer),t.setRenderTarget(y));let yt=!1;pt.length!==x.cameras.length&&(x.cameras.length=0,yt=!0);for(let Ot=0;Ot<pt.length;Ot++){let Vt=pt[Ot],Jt=null;if(p!==null)Jt=p.getViewport(Vt);else{let C=h.getViewSubImage(d,Vt);Jt=C.viewport,Ot===0&&(t.setRenderTargetTextures(y,C.colorTexture,d.ignoreDepthValues?void 0:C.depthStencilTexture),t.setRenderTarget(y))}let ct=D[Ot];ct===void 0&&(ct=new Ge,ct.layers.enable(Ot),ct.viewport=new Me,D[Ot]=ct),ct.matrix.fromArray(Vt.transform.matrix),ct.matrix.decompose(ct.position,ct.quaternion,ct.scale),ct.projectionMatrix.fromArray(Vt.projectionMatrix),ct.projectionMatrixInverse.copy(ct.projectionMatrix).invert(),ct.viewport.set(Jt.x,Jt.y,Jt.width,Jt.height),Ot===0&&(x.matrix.copy(ct.matrix),x.matrix.decompose(x.position,x.quaternion,x.scale)),yt===!0&&x.cameras.push(ct)}let Nt=s.enabledFeatures;if(Nt&&Nt.includes("depth-sensing")){let Ot=h.getDepthInformation(pt[0]);Ot&&Ot.isValid&&Ot.texture&&_.init(t,Ot,s.renderState)}}for(let pt=0;pt<v.length;pt++){let yt=M[pt],Nt=v[pt];yt!==null&&Nt!==void 0&&Nt.update(yt,lt,c||o)}rt&&rt(K,lt),lt.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:lt}),g=null}let It=new Fh;It.setAnimationLoop(bt),this.setAnimationLoop=function(K){rt=K},this.dispose=function(){}}},li=new Xe,og=new Xt;function ag(i,t){function e(m,u){m.matrixAutoUpdate===!0&&m.updateMatrix(),u.value.copy(m.matrix)}function n(m,u){u.color.getRGB(m.fogColor.value,Nh(i)),u.isFog?(m.fogNear.value=u.near,m.fogFar.value=u.far):u.isFogExp2&&(m.fogDensity.value=u.density)}function s(m,u,y,v,M){u.isMeshBasicMaterial||u.isMeshLambertMaterial?r(m,u):u.isMeshToonMaterial?(r(m,u),h(m,u)):u.isMeshPhongMaterial?(r(m,u),f(m,u)):u.isMeshStandardMaterial?(r(m,u),d(m,u),u.isMeshPhysicalMaterial&&p(m,u,M)):u.isMeshMatcapMaterial?(r(m,u),g(m,u)):u.isMeshDepthMaterial?r(m,u):u.isMeshDistanceMaterial?(r(m,u),_(m,u)):u.isMeshNormalMaterial?r(m,u):u.isLineBasicMaterial?(o(m,u),u.isLineDashedMaterial&&a(m,u)):u.isPointsMaterial?l(m,u,y,v):u.isSpriteMaterial?c(m,u):u.isShadowMaterial?(m.color.value.copy(u.color),m.opacity.value=u.opacity):u.isShaderMaterial&&(u.uniformsNeedUpdate=!1)}function r(m,u){m.opacity.value=u.opacity,u.color&&m.diffuse.value.copy(u.color),u.emissive&&m.emissive.value.copy(u.emissive).multiplyScalar(u.emissiveIntensity),u.map&&(m.map.value=u.map,e(u.map,m.mapTransform)),u.alphaMap&&(m.alphaMap.value=u.alphaMap,e(u.alphaMap,m.alphaMapTransform)),u.bumpMap&&(m.bumpMap.value=u.bumpMap,e(u.bumpMap,m.bumpMapTransform),m.bumpScale.value=u.bumpScale,u.side===je&&(m.bumpScale.value*=-1)),u.normalMap&&(m.normalMap.value=u.normalMap,e(u.normalMap,m.normalMapTransform),m.normalScale.value.copy(u.normalScale),u.side===je&&m.normalScale.value.negate()),u.displacementMap&&(m.displacementMap.value=u.displacementMap,e(u.displacementMap,m.displacementMapTransform),m.displacementScale.value=u.displacementScale,m.displacementBias.value=u.displacementBias),u.emissiveMap&&(m.emissiveMap.value=u.emissiveMap,e(u.emissiveMap,m.emissiveMapTransform)),u.specularMap&&(m.specularMap.value=u.specularMap,e(u.specularMap,m.specularMapTransform)),u.alphaTest>0&&(m.alphaTest.value=u.alphaTest);let y=t.get(u),v=y.envMap,M=y.envMapRotation;v&&(m.envMap.value=v,li.copy(M),li.x*=-1,li.y*=-1,li.z*=-1,v.isCubeTexture&&v.isRenderTargetTexture===!1&&(li.y*=-1,li.z*=-1),m.envMapRotation.value.setFromMatrix4(og.makeRotationFromEuler(li)),m.flipEnvMap.value=v.isCubeTexture&&v.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=u.reflectivity,m.ior.value=u.ior,m.refractionRatio.value=u.refractionRatio),u.lightMap&&(m.lightMap.value=u.lightMap,m.lightMapIntensity.value=u.lightMapIntensity,e(u.lightMap,m.lightMapTransform)),u.aoMap&&(m.aoMap.value=u.aoMap,m.aoMapIntensity.value=u.aoMapIntensity,e(u.aoMap,m.aoMapTransform))}function o(m,u){m.diffuse.value.copy(u.color),m.opacity.value=u.opacity,u.map&&(m.map.value=u.map,e(u.map,m.mapTransform))}function a(m,u){m.dashSize.value=u.dashSize,m.totalSize.value=u.dashSize+u.gapSize,m.scale.value=u.scale}function l(m,u,y,v){m.diffuse.value.copy(u.color),m.opacity.value=u.opacity,m.size.value=u.size*y,m.scale.value=v*.5,u.map&&(m.map.value=u.map,e(u.map,m.uvTransform)),u.alphaMap&&(m.alphaMap.value=u.alphaMap,e(u.alphaMap,m.alphaMapTransform)),u.alphaTest>0&&(m.alphaTest.value=u.alphaTest)}function c(m,u){m.diffuse.value.copy(u.color),m.opacity.value=u.opacity,m.rotation.value=u.rotation,u.map&&(m.map.value=u.map,e(u.map,m.mapTransform)),u.alphaMap&&(m.alphaMap.value=u.alphaMap,e(u.alphaMap,m.alphaMapTransform)),u.alphaTest>0&&(m.alphaTest.value=u.alphaTest)}function f(m,u){m.specular.value.copy(u.specular),m.shininess.value=Math.max(u.shininess,1e-4)}function h(m,u){u.gradientMap&&(m.gradientMap.value=u.gradientMap)}function d(m,u){m.metalness.value=u.metalness,u.metalnessMap&&(m.metalnessMap.value=u.metalnessMap,e(u.metalnessMap,m.metalnessMapTransform)),m.roughness.value=u.roughness,u.roughnessMap&&(m.roughnessMap.value=u.roughnessMap,e(u.roughnessMap,m.roughnessMapTransform)),u.envMap&&(m.envMapIntensity.value=u.envMapIntensity)}function p(m,u,y){m.ior.value=u.ior,u.sheen>0&&(m.sheenColor.value.copy(u.sheenColor).multiplyScalar(u.sheen),m.sheenRoughness.value=u.sheenRoughness,u.sheenColorMap&&(m.sheenColorMap.value=u.sheenColorMap,e(u.sheenColorMap,m.sheenColorMapTransform)),u.sheenRoughnessMap&&(m.sheenRoughnessMap.value=u.sheenRoughnessMap,e(u.sheenRoughnessMap,m.sheenRoughnessMapTransform))),u.clearcoat>0&&(m.clearcoat.value=u.clearcoat,m.clearcoatRoughness.value=u.clearcoatRoughness,u.clearcoatMap&&(m.clearcoatMap.value=u.clearcoatMap,e(u.clearcoatMap,m.clearcoatMapTransform)),u.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=u.clearcoatRoughnessMap,e(u.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),u.clearcoatNormalMap&&(m.clearcoatNormalMap.value=u.clearcoatNormalMap,e(u.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(u.clearcoatNormalScale),u.side===je&&m.clearcoatNormalScale.value.negate())),u.dispersion>0&&(m.dispersion.value=u.dispersion),u.iridescence>0&&(m.iridescence.value=u.iridescence,m.iridescenceIOR.value=u.iridescenceIOR,m.iridescenceThicknessMinimum.value=u.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=u.iridescenceThicknessRange[1],u.iridescenceMap&&(m.iridescenceMap.value=u.iridescenceMap,e(u.iridescenceMap,m.iridescenceMapTransform)),u.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=u.iridescenceThicknessMap,e(u.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),u.transmission>0&&(m.transmission.value=u.transmission,m.transmissionSamplerMap.value=y.texture,m.transmissionSamplerSize.value.set(y.width,y.height),u.transmissionMap&&(m.transmissionMap.value=u.transmissionMap,e(u.transmissionMap,m.transmissionMapTransform)),m.thickness.value=u.thickness,u.thicknessMap&&(m.thicknessMap.value=u.thicknessMap,e(u.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=u.attenuationDistance,m.attenuationColor.value.copy(u.attenuationColor)),u.anisotropy>0&&(m.anisotropyVector.value.set(u.anisotropy*Math.cos(u.anisotropyRotation),u.anisotropy*Math.sin(u.anisotropyRotation)),u.anisotropyMap&&(m.anisotropyMap.value=u.anisotropyMap,e(u.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=u.specularIntensity,m.specularColor.value.copy(u.specularColor),u.specularColorMap&&(m.specularColorMap.value=u.specularColorMap,e(u.specularColorMap,m.specularColorMapTransform)),u.specularIntensityMap&&(m.specularIntensityMap.value=u.specularIntensityMap,e(u.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,u){u.matcap&&(m.matcap.value=u.matcap)}function _(m,u){let y=t.get(u).light;m.referencePosition.value.setFromMatrixPosition(y.matrixWorld),m.nearDistance.value=y.shadow.camera.near,m.farDistance.value=y.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function lg(i,t,e,n){let s={},r={},o=[],a=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(y,v){let M=v.program;n.uniformBlockBinding(y,M)}function c(y,v){let M=s[y.id];M===void 0&&(g(y),M=f(y),s[y.id]=M,y.addEventListener("dispose",m));let A=v.program;n.updateUBOMapping(y,A);let S=t.render.frame;r[y.id]!==S&&(d(y),r[y.id]=S)}function f(y){let v=h();y.__bindingPointIndex=v;let M=i.createBuffer(),A=y.__size,S=y.usage;return i.bindBuffer(i.UNIFORM_BUFFER,M),i.bufferData(i.UNIFORM_BUFFER,A,S),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,v,M),M}function h(){for(let y=0;y<a;y++)if(o.indexOf(y)===-1)return o.push(y),y;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(y){let v=s[y.id],M=y.uniforms,A=y.__cache;i.bindBuffer(i.UNIFORM_BUFFER,v);for(let S=0,w=M.length;S<w;S++){let P=Array.isArray(M[S])?M[S]:[M[S]];for(let D=0,x=P.length;D<x;D++){let E=P[D];if(p(E,S,D,A)===!0){let N=E.__offset,z=Array.isArray(E.value)?E.value:[E.value],I=0;for(let V=0;V<z.length;V++){let F=z[V],Q=_(F);typeof F=="number"||typeof F=="boolean"?(E.__data[0]=F,i.bufferSubData(i.UNIFORM_BUFFER,N+I,E.__data)):F.isMatrix3?(E.__data[0]=F.elements[0],E.__data[1]=F.elements[1],E.__data[2]=F.elements[2],E.__data[3]=0,E.__data[4]=F.elements[3],E.__data[5]=F.elements[4],E.__data[6]=F.elements[5],E.__data[7]=0,E.__data[8]=F.elements[6],E.__data[9]=F.elements[7],E.__data[10]=F.elements[8],E.__data[11]=0):(F.toArray(E.__data,I),I+=Q.storage/Float32Array.BYTES_PER_ELEMENT)}i.bufferSubData(i.UNIFORM_BUFFER,N,E.__data)}}}i.bindBuffer(i.UNIFORM_BUFFER,null)}function p(y,v,M,A){let S=y.value,w=v+"_"+M;if(A[w]===void 0)return typeof S=="number"||typeof S=="boolean"?A[w]=S:A[w]=S.clone(),!0;{let P=A[w];if(typeof S=="number"||typeof S=="boolean"){if(P!==S)return A[w]=S,!0}else if(P.equals(S)===!1)return P.copy(S),!0}return!1}function g(y){let v=y.uniforms,M=0,A=16;for(let w=0,P=v.length;w<P;w++){let D=Array.isArray(v[w])?v[w]:[v[w]];for(let x=0,E=D.length;x<E;x++){let N=D[x],z=Array.isArray(N.value)?N.value:[N.value];for(let I=0,V=z.length;I<V;I++){let F=z[I],Q=_(F),Y=M%A,X=Y%Q.boundary,it=Y+X;M+=X,it!==0&&A-it<Q.storage&&(M+=A-it),N.__data=new Float32Array(Q.storage/Float32Array.BYTES_PER_ELEMENT),N.__offset=M,M+=Q.storage}}}let S=M%A;return S>0&&(M+=A-S),y.__size=M,y.__cache={},this}function _(y){let v={boundary:0,storage:0};return typeof y=="number"||typeof y=="boolean"?(v.boundary=4,v.storage=4):y.isVector2?(v.boundary=8,v.storage=8):y.isVector3||y.isColor?(v.boundary=16,v.storage=12):y.isVector4?(v.boundary=16,v.storage=16):y.isMatrix3?(v.boundary=48,v.storage=48):y.isMatrix4?(v.boundary=64,v.storage=64):y.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",y),v}function m(y){let v=y.target;v.removeEventListener("dispose",m);let M=o.indexOf(v.__bindingPointIndex);o.splice(M,1),i.deleteBuffer(s[v.id]),delete s[v.id],delete r[v.id]}function u(){for(let y in s)i.deleteBuffer(s[y]);o=[],s={},r={}}return{bind:l,update:c,dispose:u}}var zr=class{constructor(t={}){let{canvas:e=uf(),context:n=null,depth:s=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:f="default",failIfMajorPerformanceCaveat:h=!1}=t;this.isWebGLRenderer=!0;let d;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");d=n.getContextAttributes().alpha}else d=o;let p=new Uint32Array(4),g=new Int32Array(4),_=null,m=null,u=[],y=[];this.domElement=e,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=xe,this.toneMapping=$n,this.toneMappingExposure=1;let v=this,M=!1,A=0,S=0,w=null,P=-1,D=null,x=new Me,E=new Me,N=null,z=new Gt(0),I=0,V=e.width,F=e.height,Q=1,Y=null,X=null,it=new Me(0,0,V,F),rt=new Me(0,0,V,F),bt=!1,It=new gi,K=!1,lt=!1,pt=new Xt,yt=new Xt,Nt=new U,Ot=new Me,Vt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Jt=!1;function ct(){return w===null?Q:1}let C=n;function Et(T,B){return e.getContext(T,B)}try{let T={alpha:!0,depth:s,stencil:r,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:f,failIfMajorPerformanceCaveat:h};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${Al}`),e.addEventListener("webglcontextlost",ht,!1),e.addEventListener("webglcontextrestored",Ct,!1),e.addEventListener("webglcontextcreationerror",Lt,!1),C===null){let B="webgl2";if(C=Et(B,T),C===null)throw Et(B)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(T){throw console.error("THREE.WebGLRenderer: "+T.message),T}let W,q,ot,dt,mt,R,b,G,et,st,j,Rt,St,At,jt,ft,H,nt,xt,gt,Dt,zt,$t,O;function _t(){W=new b0(C),W.init(),zt=new ng(C,W),q=new y0(C,W,t,zt),ot=new Qm(C),q.reverseDepthBuffer&&ot.buffers.depth.setReversed(!0),dt=new A0(C),mt=new Bm,R=new eg(C,W,ot,mt,q,zt,dt),b=new v0(v),G=new S0(v),et=new Uf(C),$t=new g0(C,et),st=new w0(C,et,dt,$t),j=new C0(C,st,et,dt),xt=new R0(C,q,R),ft=new _0(mt),Rt=new Hm(v,b,G,W,q,$t,ft),St=new ag(v,mt),At=new Gm,jt=new Zm(W),nt=new m0(v,b,G,ot,j,d,l),H=new Km(v,j,q),O=new lg(C,dt,q,ot),gt=new x0(C,W,dt),Dt=new T0(C,W,dt),dt.programs=Rt.programs,v.capabilities=q,v.extensions=W,v.properties=mt,v.renderLists=At,v.shadowMap=H,v.state=ot,v.info=dt}_t();let tt=new el(v,C);this.xr=tt,this.getContext=function(){return C},this.getContextAttributes=function(){return C.getContextAttributes()},this.forceContextLoss=function(){let T=W.get("WEBGL_lose_context");T&&T.loseContext()},this.forceContextRestore=function(){let T=W.get("WEBGL_lose_context");T&&T.restoreContext()},this.getPixelRatio=function(){return Q},this.setPixelRatio=function(T){T!==void 0&&(Q=T,this.setSize(V,F,!1))},this.getSize=function(T){return T.set(V,F)},this.setSize=function(T,B,Z=!0){if(tt.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}V=T,F=B,e.width=Math.floor(T*Q),e.height=Math.floor(B*Q),Z===!0&&(e.style.width=T+"px",e.style.height=B+"px"),this.setViewport(0,0,T,B)},this.getDrawingBufferSize=function(T){return T.set(V*Q,F*Q).floor()},this.setDrawingBufferSize=function(T,B,Z){V=T,F=B,Q=Z,e.width=Math.floor(T*Z),e.height=Math.floor(B*Z),this.setViewport(0,0,T,B)},this.getCurrentViewport=function(T){return T.copy(x)},this.getViewport=function(T){return T.copy(it)},this.setViewport=function(T,B,Z,$){T.isVector4?it.set(T.x,T.y,T.z,T.w):it.set(T,B,Z,$),ot.viewport(x.copy(it).multiplyScalar(Q).round())},this.getScissor=function(T){return T.copy(rt)},this.setScissor=function(T,B,Z,$){T.isVector4?rt.set(T.x,T.y,T.z,T.w):rt.set(T,B,Z,$),ot.scissor(E.copy(rt).multiplyScalar(Q).round())},this.getScissorTest=function(){return bt},this.setScissorTest=function(T){ot.setScissorTest(bt=T)},this.setOpaqueSort=function(T){Y=T},this.setTransparentSort=function(T){X=T},this.getClearColor=function(T){return T.copy(nt.getClearColor())},this.setClearColor=function(){nt.setClearColor.apply(nt,arguments)},this.getClearAlpha=function(){return nt.getClearAlpha()},this.setClearAlpha=function(){nt.setClearAlpha.apply(nt,arguments)},this.clear=function(T=!0,B=!0,Z=!0){let $=0;if(T){let k=!1;if(w!==null){let vt=w.texture.format;k=vt===Nl||vt===Ul||vt===Dl}if(k){let vt=w.texture.type,Pt=vt===zn||vt===mi||vt===ms||vt===qi||vt===Pl||vt===Il,Ut=nt.getClearColor(),Ft=nt.getClearAlpha(),Wt=Ut.r,qt=Ut.g,Ht=Ut.b;Pt?(p[0]=Wt,p[1]=qt,p[2]=Ht,p[3]=Ft,C.clearBufferuiv(C.COLOR,0,p)):(g[0]=Wt,g[1]=qt,g[2]=Ht,g[3]=Ft,C.clearBufferiv(C.COLOR,0,g))}else $|=C.COLOR_BUFFER_BIT}B&&($|=C.DEPTH_BUFFER_BIT,C.clearDepth(this.capabilities.reverseDepthBuffer?0:1)),Z&&($|=C.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),C.clear($)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){e.removeEventListener("webglcontextlost",ht,!1),e.removeEventListener("webglcontextrestored",Ct,!1),e.removeEventListener("webglcontextcreationerror",Lt,!1),At.dispose(),jt.dispose(),mt.dispose(),b.dispose(),G.dispose(),j.dispose(),$t.dispose(),O.dispose(),Rt.dispose(),tt.dispose(),tt.removeEventListener("sessionstart",nc),tt.removeEventListener("sessionend",ic),ni.stop()};function ht(T){T.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),M=!0}function Ct(){console.log("THREE.WebGLRenderer: Context Restored."),M=!1;let T=dt.autoReset,B=H.enabled,Z=H.autoUpdate,$=H.needsUpdate,k=H.type;_t(),dt.autoReset=T,H.enabled=B,H.autoUpdate=Z,H.needsUpdate=$,H.type=k}function Lt(T){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",T.statusMessage)}function re(T){let B=T.target;B.removeEventListener("dispose",re),we(B)}function we(T){Ze(T),mt.remove(T)}function Ze(T){let B=mt.get(T).programs;B!==void 0&&(B.forEach(function(Z){Rt.releaseProgram(Z)}),T.isShaderMaterial&&Rt.releaseShaderCache(T))}this.renderBufferDirect=function(T,B,Z,$,k,vt){B===null&&(B=Vt);let Pt=k.isMesh&&k.matrixWorld.determinant()<0,Ut=_u(T,B,Z,$,k);ot.setMaterial($,Pt);let Ft=Z.index,Wt=1;if($.wireframe===!0){if(Ft=st.getWireframeAttribute(Z),Ft===void 0)return;Wt=2}let qt=Z.drawRange,Ht=Z.attributes.position,ue=qt.start*Wt,de=(qt.start+qt.count)*Wt;vt!==null&&(ue=Math.max(ue,vt.start*Wt),de=Math.min(de,(vt.start+vt.count)*Wt)),Ft!==null?(ue=Math.max(ue,0),de=Math.min(de,Ft.count)):Ht!=null&&(ue=Math.max(ue,0),de=Math.min(de,Ht.count));let ve=de-ue;if(ve<0||ve===1/0)return;$t.setup(k,$,Ut,Z,Ft);let tn,le=gt;if(Ft!==null&&(tn=et.get(Ft),le=Dt,le.setIndex(tn)),k.isMesh)$.wireframe===!0?(ot.setLineWidth($.wireframeLinewidth*ct()),le.setMode(C.LINES)):le.setMode(C.TRIANGLES);else if(k.isLine){let kt=$.linewidth;kt===void 0&&(kt=1),ot.setLineWidth(kt*ct()),k.isLineSegments?le.setMode(C.LINES):k.isLineLoop?le.setMode(C.LINE_LOOP):le.setMode(C.LINE_STRIP)}else k.isPoints?le.setMode(C.POINTS):k.isSprite&&le.setMode(C.TRIANGLES);if(k.isBatchedMesh)if(k._multiDrawInstances!==null)le.renderMultiDrawInstances(k._multiDrawStarts,k._multiDrawCounts,k._multiDrawCount,k._multiDrawInstances);else if(W.get("WEBGL_multi_draw"))le.renderMultiDraw(k._multiDrawStarts,k._multiDrawCounts,k._multiDrawCount);else{let kt=k._multiDrawStarts,Ne=k._multiDrawCounts,ce=k._multiDrawCount,fn=Ft?et.get(Ft).bytesPerElement:1,Mi=mt.get($).currentProgram.getUniforms();for(let en=0;en<ce;en++)Mi.setValue(C,"_gl_DrawID",en),le.render(kt[en]/fn,Ne[en])}else if(k.isInstancedMesh)le.renderInstances(ue,ve,k.count);else if(Z.isInstancedBufferGeometry){let kt=Z._maxInstanceCount!==void 0?Z._maxInstanceCount:1/0,Ne=Math.min(Z.instanceCount,kt);le.renderInstances(ue,ve,Ne)}else le.render(ue,ve)};function ae(T,B,Z){T.transparent===!0&&T.side===fe&&T.forceSinglePass===!1?(T.side=je,T.needsUpdate=!0,Gs(T,B,Z),T.side=Jn,T.needsUpdate=!0,Gs(T,B,Z),T.side=fe):Gs(T,B,Z)}this.compile=function(T,B,Z=null){Z===null&&(Z=T),m=jt.get(Z),m.init(B),y.push(m),Z.traverseVisible(function(k){k.isLight&&k.layers.test(B.layers)&&(m.pushLight(k),k.castShadow&&m.pushShadow(k))}),T!==Z&&T.traverseVisible(function(k){k.isLight&&k.layers.test(B.layers)&&(m.pushLight(k),k.castShadow&&m.pushShadow(k))}),m.setupLights();let $=new Set;return T.traverse(function(k){if(!(k.isMesh||k.isPoints||k.isLine||k.isSprite))return;let vt=k.material;if(vt)if(Array.isArray(vt))for(let Pt=0;Pt<vt.length;Pt++){let Ut=vt[Pt];ae(Ut,Z,k),$.add(Ut)}else ae(vt,Z,k),$.add(vt)}),y.pop(),m=null,$},this.compileAsync=function(T,B,Z=null){let $=this.compile(T,B,Z);return new Promise(k=>{function vt(){if($.forEach(function(Pt){mt.get(Pt).currentProgram.isReady()&&$.delete(Pt)}),$.size===0){k(T);return}setTimeout(vt,10)}W.get("KHR_parallel_shader_compile")!==null?vt():setTimeout(vt,10)})};let $e=null;function Cn(T){$e&&$e(T)}function nc(){ni.stop()}function ic(){ni.start()}let ni=new Fh;ni.setAnimationLoop(Cn),typeof self<"u"&&ni.setContext(self),this.setAnimationLoop=function(T){$e=T,tt.setAnimationLoop(T),T===null?ni.stop():ni.start()},tt.addEventListener("sessionstart",nc),tt.addEventListener("sessionend",ic),this.render=function(T,B){if(B!==void 0&&B.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(M===!0)return;if(T.matrixWorldAutoUpdate===!0&&T.updateMatrixWorld(),B.parent===null&&B.matrixWorldAutoUpdate===!0&&B.updateMatrixWorld(),tt.enabled===!0&&tt.isPresenting===!0&&(tt.cameraAutoUpdate===!0&&tt.updateCamera(B),B=tt.getCamera()),T.isScene===!0&&T.onBeforeRender(v,T,B,w),m=jt.get(T,y.length),m.init(B),y.push(m),yt.multiplyMatrices(B.projectionMatrix,B.matrixWorldInverse),It.setFromProjectionMatrix(yt),lt=this.localClippingEnabled,K=ft.init(this.clippingPlanes,lt),_=At.get(T,u.length),_.init(),u.push(_),tt.enabled===!0&&tt.isPresenting===!0){let vt=v.xr.getDepthSensingMesh();vt!==null&&mo(vt,B,-1/0,v.sortObjects)}mo(T,B,0,v.sortObjects),_.finish(),v.sortObjects===!0&&_.sort(Y,X),Jt=tt.enabled===!1||tt.isPresenting===!1||tt.hasDepthSensing()===!1,Jt&&nt.addToRenderList(_,T),this.info.render.frame++,K===!0&&ft.beginShadows();let Z=m.state.shadowsArray;H.render(Z,T,B),K===!0&&ft.endShadows(),this.info.autoReset===!0&&this.info.reset();let $=_.opaque,k=_.transmissive;if(m.setupLights(),B.isArrayCamera){let vt=B.cameras;if(k.length>0)for(let Pt=0,Ut=vt.length;Pt<Ut;Pt++){let Ft=vt[Pt];rc($,k,T,Ft)}Jt&&nt.render(T);for(let Pt=0,Ut=vt.length;Pt<Ut;Pt++){let Ft=vt[Pt];sc(_,T,Ft,Ft.viewport)}}else k.length>0&&rc($,k,T,B),Jt&&nt.render(T),sc(_,T,B);w!==null&&(R.updateMultisampleRenderTarget(w),R.updateRenderTargetMipmap(w)),T.isScene===!0&&T.onAfterRender(v,T,B),$t.resetDefaultState(),P=-1,D=null,y.pop(),y.length>0?(m=y[y.length-1],K===!0&&ft.setGlobalState(v.clippingPlanes,m.state.camera)):m=null,u.pop(),u.length>0?_=u[u.length-1]:_=null};function mo(T,B,Z,$){if(T.visible===!1)return;if(T.layers.test(B.layers)){if(T.isGroup)Z=T.renderOrder;else if(T.isLOD)T.autoUpdate===!0&&T.update(B);else if(T.isLight)m.pushLight(T),T.castShadow&&m.pushShadow(T);else if(T.isSprite){if(!T.frustumCulled||It.intersectsSprite(T)){$&&Ot.setFromMatrixPosition(T.matrixWorld).applyMatrix4(yt);let Pt=j.update(T),Ut=T.material;Ut.visible&&_.push(T,Pt,Ut,Z,Ot.z,null)}}else if((T.isMesh||T.isLine||T.isPoints)&&(!T.frustumCulled||It.intersectsObject(T))){let Pt=j.update(T),Ut=T.material;if($&&(T.boundingSphere!==void 0?(T.boundingSphere===null&&T.computeBoundingSphere(),Ot.copy(T.boundingSphere.center)):(Pt.boundingSphere===null&&Pt.computeBoundingSphere(),Ot.copy(Pt.boundingSphere.center)),Ot.applyMatrix4(T.matrixWorld).applyMatrix4(yt)),Array.isArray(Ut)){let Ft=Pt.groups;for(let Wt=0,qt=Ft.length;Wt<qt;Wt++){let Ht=Ft[Wt],ue=Ut[Ht.materialIndex];ue&&ue.visible&&_.push(T,Pt,ue,Z,Ot.z,Ht)}}else Ut.visible&&_.push(T,Pt,Ut,Z,Ot.z,null)}}let vt=T.children;for(let Pt=0,Ut=vt.length;Pt<Ut;Pt++)mo(vt[Pt],B,Z,$)}function sc(T,B,Z,$){let k=T.opaque,vt=T.transmissive,Pt=T.transparent;m.setupLightsView(Z),K===!0&&ft.setGlobalState(v.clippingPlanes,Z),$&&ot.viewport(x.copy($)),k.length>0&&ks(k,B,Z),vt.length>0&&ks(vt,B,Z),Pt.length>0&&ks(Pt,B,Z),ot.buffers.depth.setTest(!0),ot.buffers.depth.setMask(!0),ot.buffers.color.setMask(!0),ot.setPolygonOffset(!1)}function rc(T,B,Z,$){if((Z.isScene===!0?Z.overrideMaterial:null)!==null)return;m.state.transmissionRenderTarget[$.id]===void 0&&(m.state.transmissionRenderTarget[$.id]=new On(1,1,{generateMipmaps:!0,type:W.has("EXT_color_buffer_half_float")||W.has("EXT_color_buffer_float")?Is:zn,minFilter:pi,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:he.workingColorSpace}));let vt=m.state.transmissionRenderTarget[$.id],Pt=$.viewport||x;vt.setSize(Pt.z,Pt.w);let Ut=v.getRenderTarget();v.setRenderTarget(vt),v.getClearColor(z),I=v.getClearAlpha(),I<1&&v.setClearColor(16777215,.5),v.clear(),Jt&&nt.render(Z);let Ft=v.toneMapping;v.toneMapping=$n;let Wt=$.viewport;if($.viewport!==void 0&&($.viewport=void 0),m.setupLightsView($),K===!0&&ft.setGlobalState(v.clippingPlanes,$),ks(T,Z,$),R.updateMultisampleRenderTarget(vt),R.updateRenderTargetMipmap(vt),W.has("WEBGL_multisampled_render_to_texture")===!1){let qt=!1;for(let Ht=0,ue=B.length;Ht<ue;Ht++){let de=B[Ht],ve=de.object,tn=de.geometry,le=de.material,kt=de.group;if(le.side===fe&&ve.layers.test($.layers)){let Ne=le.side;le.side=je,le.needsUpdate=!0,oc(ve,Z,$,tn,le,kt),le.side=Ne,le.needsUpdate=!0,qt=!0}}qt===!0&&(R.updateMultisampleRenderTarget(vt),R.updateRenderTargetMipmap(vt))}v.setRenderTarget(Ut),v.setClearColor(z,I),Wt!==void 0&&($.viewport=Wt),v.toneMapping=Ft}function ks(T,B,Z){let $=B.isScene===!0?B.overrideMaterial:null;for(let k=0,vt=T.length;k<vt;k++){let Pt=T[k],Ut=Pt.object,Ft=Pt.geometry,Wt=$===null?Pt.material:$,qt=Pt.group;Ut.layers.test(Z.layers)&&oc(Ut,B,Z,Ft,Wt,qt)}}function oc(T,B,Z,$,k,vt){T.onBeforeRender(v,B,Z,$,k,vt),T.modelViewMatrix.multiplyMatrices(Z.matrixWorldInverse,T.matrixWorld),T.normalMatrix.getNormalMatrix(T.modelViewMatrix),k.onBeforeRender(v,B,Z,$,T,vt),k.transparent===!0&&k.side===fe&&k.forceSinglePass===!1?(k.side=je,k.needsUpdate=!0,v.renderBufferDirect(Z,B,$,k,T,vt),k.side=Jn,k.needsUpdate=!0,v.renderBufferDirect(Z,B,$,k,T,vt),k.side=fe):v.renderBufferDirect(Z,B,$,k,T,vt),T.onAfterRender(v,B,Z,$,k,vt)}function Gs(T,B,Z){B.isScene!==!0&&(B=Vt);let $=mt.get(T),k=m.state.lights,vt=m.state.shadowsArray,Pt=k.state.version,Ut=Rt.getParameters(T,k.state,vt,B,Z),Ft=Rt.getProgramCacheKey(Ut),Wt=$.programs;$.environment=T.isMeshStandardMaterial?B.environment:null,$.fog=B.fog,$.envMap=(T.isMeshStandardMaterial?G:b).get(T.envMap||$.environment),$.envMapRotation=$.environment!==null&&T.envMap===null?B.environmentRotation:T.envMapRotation,Wt===void 0&&(T.addEventListener("dispose",re),Wt=new Map,$.programs=Wt);let qt=Wt.get(Ft);if(qt!==void 0){if($.currentProgram===qt&&$.lightsStateVersion===Pt)return lc(T,Ut),qt}else Ut.uniforms=Rt.getUniforms(T),T.onBeforeCompile(Ut,v),qt=Rt.acquireProgram(Ut,Ft),Wt.set(Ft,qt),$.uniforms=Ut.uniforms;let Ht=$.uniforms;return(!T.isShaderMaterial&&!T.isRawShaderMaterial||T.clipping===!0)&&(Ht.clippingPlanes=ft.uniform),lc(T,Ut),$.needsLights=Mu(T),$.lightsStateVersion=Pt,$.needsLights&&(Ht.ambientLightColor.value=k.state.ambient,Ht.lightProbe.value=k.state.probe,Ht.directionalLights.value=k.state.directional,Ht.directionalLightShadows.value=k.state.directionalShadow,Ht.spotLights.value=k.state.spot,Ht.spotLightShadows.value=k.state.spotShadow,Ht.rectAreaLights.value=k.state.rectArea,Ht.ltc_1.value=k.state.rectAreaLTC1,Ht.ltc_2.value=k.state.rectAreaLTC2,Ht.pointLights.value=k.state.point,Ht.pointLightShadows.value=k.state.pointShadow,Ht.hemisphereLights.value=k.state.hemi,Ht.directionalShadowMap.value=k.state.directionalShadowMap,Ht.directionalShadowMatrix.value=k.state.directionalShadowMatrix,Ht.spotShadowMap.value=k.state.spotShadowMap,Ht.spotLightMatrix.value=k.state.spotLightMatrix,Ht.spotLightMap.value=k.state.spotLightMap,Ht.pointShadowMap.value=k.state.pointShadowMap,Ht.pointShadowMatrix.value=k.state.pointShadowMatrix),$.currentProgram=qt,$.uniformsList=null,qt}function ac(T){if(T.uniformsList===null){let B=T.currentProgram.getUniforms();T.uniformsList=Gi.seqWithValue(B.seq,T.uniforms)}return T.uniformsList}function lc(T,B){let Z=mt.get(T);Z.outputColorSpace=B.outputColorSpace,Z.batching=B.batching,Z.batchingColor=B.batchingColor,Z.instancing=B.instancing,Z.instancingColor=B.instancingColor,Z.instancingMorph=B.instancingMorph,Z.skinning=B.skinning,Z.morphTargets=B.morphTargets,Z.morphNormals=B.morphNormals,Z.morphColors=B.morphColors,Z.morphTargetsCount=B.morphTargetsCount,Z.numClippingPlanes=B.numClippingPlanes,Z.numIntersection=B.numClipIntersection,Z.vertexAlphas=B.vertexAlphas,Z.vertexTangents=B.vertexTangents,Z.toneMapping=B.toneMapping}function _u(T,B,Z,$,k){B.isScene!==!0&&(B=Vt),R.resetTextureUnits();let vt=B.fog,Pt=$.isMeshStandardMaterial?B.environment:null,Ut=w===null?v.outputColorSpace:w.isXRRenderTarget===!0?w.texture.colorSpace:ei,Ft=($.isMeshStandardMaterial?G:b).get($.envMap||Pt),Wt=$.vertexColors===!0&&!!Z.attributes.color&&Z.attributes.color.itemSize===4,qt=!!Z.attributes.tangent&&(!!$.normalMap||$.anisotropy>0),Ht=!!Z.morphAttributes.position,ue=!!Z.morphAttributes.normal,de=!!Z.morphAttributes.color,ve=$n;$.toneMapped&&(w===null||w.isXRRenderTarget===!0)&&(ve=v.toneMapping);let tn=Z.morphAttributes.position||Z.morphAttributes.normal||Z.morphAttributes.color,le=tn!==void 0?tn.length:0,kt=mt.get($),Ne=m.state.lights;if(K===!0&&(lt===!0||T!==D)){let ln=T===D&&$.id===P;ft.setState($,T,ln)}let ce=!1;$.version===kt.__version?(kt.needsLights&&kt.lightsStateVersion!==Ne.state.version||kt.outputColorSpace!==Ut||k.isBatchedMesh&&kt.batching===!1||!k.isBatchedMesh&&kt.batching===!0||k.isBatchedMesh&&kt.batchingColor===!0&&k.colorTexture===null||k.isBatchedMesh&&kt.batchingColor===!1&&k.colorTexture!==null||k.isInstancedMesh&&kt.instancing===!1||!k.isInstancedMesh&&kt.instancing===!0||k.isSkinnedMesh&&kt.skinning===!1||!k.isSkinnedMesh&&kt.skinning===!0||k.isInstancedMesh&&kt.instancingColor===!0&&k.instanceColor===null||k.isInstancedMesh&&kt.instancingColor===!1&&k.instanceColor!==null||k.isInstancedMesh&&kt.instancingMorph===!0&&k.morphTexture===null||k.isInstancedMesh&&kt.instancingMorph===!1&&k.morphTexture!==null||kt.envMap!==Ft||$.fog===!0&&kt.fog!==vt||kt.numClippingPlanes!==void 0&&(kt.numClippingPlanes!==ft.numPlanes||kt.numIntersection!==ft.numIntersection)||kt.vertexAlphas!==Wt||kt.vertexTangents!==qt||kt.morphTargets!==Ht||kt.morphNormals!==ue||kt.morphColors!==de||kt.toneMapping!==ve||kt.morphTargetsCount!==le)&&(ce=!0):(ce=!0,kt.__version=$.version);let fn=kt.currentProgram;ce===!0&&(fn=Gs($,B,k));let Mi=!1,en=!1,go=!1,Se=fn.getUniforms(),kn=kt.uniforms;if(ot.useProgram(fn.program)&&(Mi=!0,en=!0,go=!0),$.id!==P&&(P=$.id,en=!0),Mi||D!==T){q.reverseDepthBuffer?(pt.copy(T.projectionMatrix),df(pt),pf(pt),Se.setValue(C,"projectionMatrix",pt)):Se.setValue(C,"projectionMatrix",T.projectionMatrix),Se.setValue(C,"viewMatrix",T.matrixWorldInverse);let ln=Se.map.cameraPosition;ln!==void 0&&ln.setValue(C,Nt.setFromMatrixPosition(T.matrixWorld)),q.logarithmicDepthBuffer&&Se.setValue(C,"logDepthBufFC",2/(Math.log(T.far+1)/Math.LN2)),($.isMeshPhongMaterial||$.isMeshToonMaterial||$.isMeshLambertMaterial||$.isMeshBasicMaterial||$.isMeshStandardMaterial||$.isShaderMaterial)&&Se.setValue(C,"isOrthographic",T.isOrthographicCamera===!0),D!==T&&(D=T,en=!0,go=!0)}if(k.isSkinnedMesh){Se.setOptional(C,k,"bindMatrix"),Se.setOptional(C,k,"bindMatrixInverse");let ln=k.skeleton;ln&&(ln.boneTexture===null&&ln.computeBoneTexture(),Se.setValue(C,"boneTexture",ln.boneTexture,R))}k.isBatchedMesh&&(Se.setOptional(C,k,"batchingTexture"),Se.setValue(C,"batchingTexture",k._matricesTexture,R),Se.setOptional(C,k,"batchingIdTexture"),Se.setValue(C,"batchingIdTexture",k._indirectTexture,R),Se.setOptional(C,k,"batchingColorTexture"),k._colorsTexture!==null&&Se.setValue(C,"batchingColorTexture",k._colorsTexture,R));let xo=Z.morphAttributes;if((xo.position!==void 0||xo.normal!==void 0||xo.color!==void 0)&&xt.update(k,Z,fn),(en||kt.receiveShadow!==k.receiveShadow)&&(kt.receiveShadow=k.receiveShadow,Se.setValue(C,"receiveShadow",k.receiveShadow)),$.isMeshGouraudMaterial&&$.envMap!==null&&(kn.envMap.value=Ft,kn.flipEnvMap.value=Ft.isCubeTexture&&Ft.isRenderTargetTexture===!1?-1:1),$.isMeshStandardMaterial&&$.envMap===null&&B.environment!==null&&(kn.envMapIntensity.value=B.environmentIntensity),en&&(Se.setValue(C,"toneMappingExposure",v.toneMappingExposure),kt.needsLights&&vu(kn,go),vt&&$.fog===!0&&St.refreshFogUniforms(kn,vt),St.refreshMaterialUniforms(kn,$,Q,F,m.state.transmissionRenderTarget[T.id]),Gi.upload(C,ac(kt),kn,R)),$.isShaderMaterial&&$.uniformsNeedUpdate===!0&&(Gi.upload(C,ac(kt),kn,R),$.uniformsNeedUpdate=!1),$.isSpriteMaterial&&Se.setValue(C,"center",k.center),Se.setValue(C,"modelViewMatrix",k.modelViewMatrix),Se.setValue(C,"normalMatrix",k.normalMatrix),Se.setValue(C,"modelMatrix",k.matrixWorld),$.isShaderMaterial||$.isRawShaderMaterial){let ln=$.uniformsGroups;for(let yo=0,Eu=ln.length;yo<Eu;yo++){let cc=ln[yo];O.update(cc,fn),O.bind(cc,fn)}}return fn}function vu(T,B){T.ambientLightColor.needsUpdate=B,T.lightProbe.needsUpdate=B,T.directionalLights.needsUpdate=B,T.directionalLightShadows.needsUpdate=B,T.pointLights.needsUpdate=B,T.pointLightShadows.needsUpdate=B,T.spotLights.needsUpdate=B,T.spotLightShadows.needsUpdate=B,T.rectAreaLights.needsUpdate=B,T.hemisphereLights.needsUpdate=B}function Mu(T){return T.isMeshLambertMaterial||T.isMeshToonMaterial||T.isMeshPhongMaterial||T.isMeshStandardMaterial||T.isShadowMaterial||T.isShaderMaterial&&T.lights===!0}this.getActiveCubeFace=function(){return A},this.getActiveMipmapLevel=function(){return S},this.getRenderTarget=function(){return w},this.setRenderTargetTextures=function(T,B,Z){mt.get(T.texture).__webglTexture=B,mt.get(T.depthTexture).__webglTexture=Z;let $=mt.get(T);$.__hasExternalTextures=!0,$.__autoAllocateDepthBuffer=Z===void 0,$.__autoAllocateDepthBuffer||W.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),$.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(T,B){let Z=mt.get(T);Z.__webglFramebuffer=B,Z.__useDefaultFramebuffer=B===void 0},this.setRenderTarget=function(T,B=0,Z=0){w=T,A=B,S=Z;let $=!0,k=null,vt=!1,Pt=!1;if(T){let Ft=mt.get(T);if(Ft.__useDefaultFramebuffer!==void 0)ot.bindFramebuffer(C.FRAMEBUFFER,null),$=!1;else if(Ft.__webglFramebuffer===void 0)R.setupRenderTarget(T);else if(Ft.__hasExternalTextures)R.rebindTextures(T,mt.get(T.texture).__webglTexture,mt.get(T.depthTexture).__webglTexture);else if(T.depthBuffer){let Ht=T.depthTexture;if(Ft.__boundDepthTexture!==Ht){if(Ht!==null&&mt.has(Ht)&&(T.width!==Ht.image.width||T.height!==Ht.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");R.setupDepthRenderbuffer(T)}}let Wt=T.texture;(Wt.isData3DTexture||Wt.isDataArrayTexture||Wt.isCompressedArrayTexture)&&(Pt=!0);let qt=mt.get(T).__webglFramebuffer;T.isWebGLCubeRenderTarget?(Array.isArray(qt[B])?k=qt[B][Z]:k=qt[B],vt=!0):T.samples>0&&R.useMultisampledRTT(T)===!1?k=mt.get(T).__webglMultisampledFramebuffer:Array.isArray(qt)?k=qt[Z]:k=qt,x.copy(T.viewport),E.copy(T.scissor),N=T.scissorTest}else x.copy(it).multiplyScalar(Q).floor(),E.copy(rt).multiplyScalar(Q).floor(),N=bt;if(ot.bindFramebuffer(C.FRAMEBUFFER,k)&&$&&ot.drawBuffers(T,k),ot.viewport(x),ot.scissor(E),ot.setScissorTest(N),vt){let Ft=mt.get(T.texture);C.framebufferTexture2D(C.FRAMEBUFFER,C.COLOR_ATTACHMENT0,C.TEXTURE_CUBE_MAP_POSITIVE_X+B,Ft.__webglTexture,Z)}else if(Pt){let Ft=mt.get(T.texture),Wt=B||0;C.framebufferTextureLayer(C.FRAMEBUFFER,C.COLOR_ATTACHMENT0,Ft.__webglTexture,Z||0,Wt)}P=-1},this.readRenderTargetPixels=function(T,B,Z,$,k,vt,Pt){if(!(T&&T.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Ut=mt.get(T).__webglFramebuffer;if(T.isWebGLCubeRenderTarget&&Pt!==void 0&&(Ut=Ut[Pt]),Ut){ot.bindFramebuffer(C.FRAMEBUFFER,Ut);try{let Ft=T.texture,Wt=Ft.format,qt=Ft.type;if(!q.textureFormatReadable(Wt)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!q.textureTypeReadable(qt)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}B>=0&&B<=T.width-$&&Z>=0&&Z<=T.height-k&&C.readPixels(B,Z,$,k,zt.convert(Wt),zt.convert(qt),vt)}finally{let Ft=w!==null?mt.get(w).__webglFramebuffer:null;ot.bindFramebuffer(C.FRAMEBUFFER,Ft)}}},this.readRenderTargetPixelsAsync=async function(T,B,Z,$,k,vt,Pt){if(!(T&&T.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Ut=mt.get(T).__webglFramebuffer;if(T.isWebGLCubeRenderTarget&&Pt!==void 0&&(Ut=Ut[Pt]),Ut){let Ft=T.texture,Wt=Ft.format,qt=Ft.type;if(!q.textureFormatReadable(Wt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!q.textureTypeReadable(qt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(B>=0&&B<=T.width-$&&Z>=0&&Z<=T.height-k){ot.bindFramebuffer(C.FRAMEBUFFER,Ut);let Ht=C.createBuffer();C.bindBuffer(C.PIXEL_PACK_BUFFER,Ht),C.bufferData(C.PIXEL_PACK_BUFFER,vt.byteLength,C.STREAM_READ),C.readPixels(B,Z,$,k,zt.convert(Wt),zt.convert(qt),0);let ue=w!==null?mt.get(w).__webglFramebuffer:null;ot.bindFramebuffer(C.FRAMEBUFFER,ue);let de=C.fenceSync(C.SYNC_GPU_COMMANDS_COMPLETE,0);return C.flush(),await ff(C,de,4),C.bindBuffer(C.PIXEL_PACK_BUFFER,Ht),C.getBufferSubData(C.PIXEL_PACK_BUFFER,0,vt),C.deleteBuffer(Ht),C.deleteSync(de),vt}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(T,B=null,Z=0){T.isTexture!==!0&&(Er("WebGLRenderer: copyFramebufferToTexture function signature has changed."),B=arguments[0]||null,T=arguments[1]);let $=Math.pow(2,-Z),k=Math.floor(T.image.width*$),vt=Math.floor(T.image.height*$),Pt=B!==null?B.x:0,Ut=B!==null?B.y:0;R.setTexture2D(T,0),C.copyTexSubImage2D(C.TEXTURE_2D,Z,0,0,Pt,Ut,k,vt),ot.unbindTexture()},this.copyTextureToTexture=function(T,B,Z=null,$=null,k=0){T.isTexture!==!0&&(Er("WebGLRenderer: copyTextureToTexture function signature has changed."),$=arguments[0]||null,T=arguments[1],B=arguments[2],k=arguments[3]||0,Z=null);let vt,Pt,Ut,Ft,Wt,qt;Z!==null?(vt=Z.max.x-Z.min.x,Pt=Z.max.y-Z.min.y,Ut=Z.min.x,Ft=Z.min.y):(vt=T.image.width,Pt=T.image.height,Ut=0,Ft=0),$!==null?(Wt=$.x,qt=$.y):(Wt=0,qt=0);let Ht=zt.convert(B.format),ue=zt.convert(B.type);R.setTexture2D(B,0),C.pixelStorei(C.UNPACK_FLIP_Y_WEBGL,B.flipY),C.pixelStorei(C.UNPACK_PREMULTIPLY_ALPHA_WEBGL,B.premultiplyAlpha),C.pixelStorei(C.UNPACK_ALIGNMENT,B.unpackAlignment);let de=C.getParameter(C.UNPACK_ROW_LENGTH),ve=C.getParameter(C.UNPACK_IMAGE_HEIGHT),tn=C.getParameter(C.UNPACK_SKIP_PIXELS),le=C.getParameter(C.UNPACK_SKIP_ROWS),kt=C.getParameter(C.UNPACK_SKIP_IMAGES),Ne=T.isCompressedTexture?T.mipmaps[k]:T.image;C.pixelStorei(C.UNPACK_ROW_LENGTH,Ne.width),C.pixelStorei(C.UNPACK_IMAGE_HEIGHT,Ne.height),C.pixelStorei(C.UNPACK_SKIP_PIXELS,Ut),C.pixelStorei(C.UNPACK_SKIP_ROWS,Ft),T.isDataTexture?C.texSubImage2D(C.TEXTURE_2D,k,Wt,qt,vt,Pt,Ht,ue,Ne.data):T.isCompressedTexture?C.compressedTexSubImage2D(C.TEXTURE_2D,k,Wt,qt,Ne.width,Ne.height,Ht,Ne.data):C.texSubImage2D(C.TEXTURE_2D,k,Wt,qt,vt,Pt,Ht,ue,Ne),C.pixelStorei(C.UNPACK_ROW_LENGTH,de),C.pixelStorei(C.UNPACK_IMAGE_HEIGHT,ve),C.pixelStorei(C.UNPACK_SKIP_PIXELS,tn),C.pixelStorei(C.UNPACK_SKIP_ROWS,le),C.pixelStorei(C.UNPACK_SKIP_IMAGES,kt),k===0&&B.generateMipmaps&&C.generateMipmap(C.TEXTURE_2D),ot.unbindTexture()},this.copyTextureToTexture3D=function(T,B,Z=null,$=null,k=0){T.isTexture!==!0&&(Er("WebGLRenderer: copyTextureToTexture3D function signature has changed."),Z=arguments[0]||null,$=arguments[1]||null,T=arguments[2],B=arguments[3],k=arguments[4]||0);let vt,Pt,Ut,Ft,Wt,qt,Ht,ue,de,ve=T.isCompressedTexture?T.mipmaps[k]:T.image;Z!==null?(vt=Z.max.x-Z.min.x,Pt=Z.max.y-Z.min.y,Ut=Z.max.z-Z.min.z,Ft=Z.min.x,Wt=Z.min.y,qt=Z.min.z):(vt=ve.width,Pt=ve.height,Ut=ve.depth,Ft=0,Wt=0,qt=0),$!==null?(Ht=$.x,ue=$.y,de=$.z):(Ht=0,ue=0,de=0);let tn=zt.convert(B.format),le=zt.convert(B.type),kt;if(B.isData3DTexture)R.setTexture3D(B,0),kt=C.TEXTURE_3D;else if(B.isDataArrayTexture||B.isCompressedArrayTexture)R.setTexture2DArray(B,0),kt=C.TEXTURE_2D_ARRAY;else{console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");return}C.pixelStorei(C.UNPACK_FLIP_Y_WEBGL,B.flipY),C.pixelStorei(C.UNPACK_PREMULTIPLY_ALPHA_WEBGL,B.premultiplyAlpha),C.pixelStorei(C.UNPACK_ALIGNMENT,B.unpackAlignment);let Ne=C.getParameter(C.UNPACK_ROW_LENGTH),ce=C.getParameter(C.UNPACK_IMAGE_HEIGHT),fn=C.getParameter(C.UNPACK_SKIP_PIXELS),Mi=C.getParameter(C.UNPACK_SKIP_ROWS),en=C.getParameter(C.UNPACK_SKIP_IMAGES);C.pixelStorei(C.UNPACK_ROW_LENGTH,ve.width),C.pixelStorei(C.UNPACK_IMAGE_HEIGHT,ve.height),C.pixelStorei(C.UNPACK_SKIP_PIXELS,Ft),C.pixelStorei(C.UNPACK_SKIP_ROWS,Wt),C.pixelStorei(C.UNPACK_SKIP_IMAGES,qt),T.isDataTexture||T.isData3DTexture?C.texSubImage3D(kt,k,Ht,ue,de,vt,Pt,Ut,tn,le,ve.data):B.isCompressedArrayTexture?C.compressedTexSubImage3D(kt,k,Ht,ue,de,vt,Pt,Ut,tn,ve.data):C.texSubImage3D(kt,k,Ht,ue,de,vt,Pt,Ut,tn,le,ve),C.pixelStorei(C.UNPACK_ROW_LENGTH,Ne),C.pixelStorei(C.UNPACK_IMAGE_HEIGHT,ce),C.pixelStorei(C.UNPACK_SKIP_PIXELS,fn),C.pixelStorei(C.UNPACK_SKIP_ROWS,Mi),C.pixelStorei(C.UNPACK_SKIP_IMAGES,en),k===0&&B.generateMipmaps&&C.generateMipmap(kt),ot.unbindTexture()},this.initRenderTarget=function(T){mt.get(T).__webglFramebuffer===void 0&&R.setupRenderTarget(T)},this.initTexture=function(T){T.isCubeTexture?R.setTextureCube(T,0):T.isData3DTexture?R.setTexture3D(T,0):T.isDataArrayTexture||T.isCompressedArrayTexture?R.setTexture2DArray(T,0):R.setTexture2D(T,0),ot.unbindTexture()},this.resetState=function(){A=0,S=0,w=null,ot.reset(),$t.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Fn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;let e=this.getContext();e.drawingBufferColorSpace=t===Fl?"display-p3":"srgb",e.unpackColorSpace=he.workingColorSpace===Qr?"display-p3":"srgb"}};var Ji=class extends Re{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Xe,this.environmentIntensity=1,this.environmentRotation=new Xe,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){let e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(e.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(e.object.backgroundIntensity=this.backgroundIntensity),e.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(e.object.environmentIntensity=this.environmentIntensity),e.object.environmentRotation=this.environmentRotation.toArray(),e}};var nl=class extends Ve{constructor(t=null,e=1,n=1,s,r,o,a,l,c=Ke,f=Ke,h,d){super(null,o,a,l,c,f,s,r,h,d),this.isDataTexture=!0,this.image={data:t,width:e,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var _s=class extends Ae{constructor(t,e,n,s=1){super(t,e,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(t){return super.copy(t),this.meshPerAttribute=t.meshPerAttribute,this}toJSON(){let t=super.toJSON();return t.meshPerAttribute=this.meshPerAttribute,t.isInstancedBufferAttribute=!0,t}},Fi=new Xt,rh=new Xt,hr=[],oh=new Hn,cg=new Xt,ls=new ut,cs=new Sn,rn=class extends ut{constructor(t,e,n){super(t,e),this.isInstancedMesh=!0,this.instanceMatrix=new _s(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<n;s++)this.setMatrixAt(s,cg)}computeBoundingBox(){let t=this.geometry,e=this.count;this.boundingBox===null&&(this.boundingBox=new Hn),t.boundingBox===null&&t.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,Fi),oh.copy(t.boundingBox).applyMatrix4(Fi),this.boundingBox.union(oh)}computeBoundingSphere(){let t=this.geometry,e=this.count;this.boundingSphere===null&&(this.boundingSphere=new Sn),t.boundingSphere===null&&t.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,Fi),cs.copy(t.boundingSphere).applyMatrix4(Fi),this.boundingSphere.union(cs)}copy(t,e){return super.copy(t,e),this.instanceMatrix.copy(t.instanceMatrix),t.morphTexture!==null&&(this.morphTexture=t.morphTexture.clone()),t.instanceColor!==null&&(this.instanceColor=t.instanceColor.clone()),this.count=t.count,t.boundingBox!==null&&(this.boundingBox=t.boundingBox.clone()),t.boundingSphere!==null&&(this.boundingSphere=t.boundingSphere.clone()),this}getColorAt(t,e){e.fromArray(this.instanceColor.array,t*3)}getMatrixAt(t,e){e.fromArray(this.instanceMatrix.array,t*16)}getMorphAt(t,e){let n=e.morphTargetInfluences,s=this.morphTexture.source.data.data,r=n.length+1,o=t*r+1;for(let a=0;a<n.length;a++)n[a]=s[o+a]}raycast(t,e){let n=this.matrixWorld,s=this.count;if(ls.geometry=this.geometry,ls.material=this.material,ls.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),cs.copy(this.boundingSphere),cs.applyMatrix4(n),t.ray.intersectsSphere(cs)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,Fi),rh.multiplyMatrices(n,Fi),ls.matrixWorld=rh,ls.raycast(t,hr);for(let o=0,a=hr.length;o<a;o++){let l=hr[o];l.instanceId=r,l.object=this,e.push(l)}hr.length=0}}setColorAt(t,e){this.instanceColor===null&&(this.instanceColor=new _s(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),e.toArray(this.instanceColor.array,t*3)}setMatrixAt(t,e){e.toArray(this.instanceMatrix.array,t*16)}setMorphAt(t,e){let n=e.morphTargetInfluences,s=n.length+1;this.morphTexture===null&&(this.morphTexture=new nl(new Float32Array(s*this.count),s,this.count,Ll,Mn));let r=this.morphTexture.source.data.data,o=0;for(let c=0;c<n.length;c++)o+=n[c];let a=this.geometry.morphTargetsRelative?1:1-o,l=s*t;r[l]=a,r.set(n,l+1)}updateMorphTargets(){}dispose(){return this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null),this}};var vs=class extends Qn{constructor(t){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new Gt(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.size=t.size,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}},ah=new Xt,il=new xs,ur=new Sn,fr=new U,Or=class extends Re{constructor(t=new Ee,e=new vs){super(),this.isPoints=!0,this.type="Points",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}raycast(t,e){let n=this.geometry,s=this.matrixWorld,r=t.params.Points.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),ur.copy(n.boundingSphere),ur.applyMatrix4(s),ur.radius+=r,t.ray.intersectsSphere(ur)===!1)return;ah.copy(s).invert(),il.copy(t.ray).applyMatrix4(ah);let a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=n.index,h=n.attributes.position;if(c!==null){let d=Math.max(0,o.start),p=Math.min(c.count,o.start+o.count);for(let g=d,_=p;g<_;g++){let m=c.getX(g);fr.fromBufferAttribute(h,m),lh(fr,m,l,s,t,e,this)}}else{let d=Math.max(0,o.start),p=Math.min(h.count,o.start+o.count);for(let g=d,_=p;g<_;g++)fr.fromBufferAttribute(h,g),lh(fr,g,l,s,t,e,this)}}updateMorphTargets(){let e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){let s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){let a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}};function lh(i,t,e,n,s,r,o){let a=il.distanceSqToPoint(i);if(a<e){let l=new U;il.closestPointToPoint(i,l),l.applyMatrix4(n);let c=s.ray.origin.distanceTo(l);if(c<s.near||c>s.far)return;r.push({distance:c,distanceToRay:Math.sqrt(a),point:l,index:t,face:null,faceIndex:null,barycoord:null,object:o})}}var qe=class extends Ve{constructor(t,e,n,s,r,o,a,l,c){super(t,e,n,s,r,o,a,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}},hn=class{constructor(){this.type="Curve",this.arcLengthDivisions=200}getPoint(){return console.warn("THREE.Curve: .getPoint() not implemented."),null}getPointAt(t,e){let n=this.getUtoTmapping(t);return this.getPoint(n,e)}getPoints(t=5){let e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return e}getSpacedPoints(t=5){let e=[];for(let n=0;n<=t;n++)e.push(this.getPointAt(n/t));return e}getLength(){let t=this.getLengths();return t[t.length-1]}getLengths(t=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===t+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let e=[],n,s=this.getPoint(0),r=0;e.push(0);for(let o=1;o<=t;o++)n=this.getPoint(o/t),r+=n.distanceTo(s),e.push(r),s=n;return this.cacheArcLengths=e,e}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(t,e){let n=this.getLengths(),s=0,r=n.length,o;e?o=e:o=t*n[r-1];let a=0,l=r-1,c;for(;a<=l;)if(s=Math.floor(a+(l-a)/2),c=n[s]-o,c<0)a=s+1;else if(c>0)l=s-1;else{l=s;break}if(s=l,n[s]===o)return s/(r-1);let f=n[s],d=n[s+1]-f,p=(o-f)/d;return(s+p)/(r-1)}getTangent(t,e){let s=t-1e-4,r=t+1e-4;s<0&&(s=0),r>1&&(r=1);let o=this.getPoint(s),a=this.getPoint(r),l=e||(o.isVector2?new Mt:new U);return l.copy(a).sub(o).normalize(),l}getTangentAt(t,e){let n=this.getUtoTmapping(t);return this.getTangent(n,e)}computeFrenetFrames(t,e){let n=new U,s=[],r=[],o=[],a=new U,l=new Xt;for(let p=0;p<=t;p++){let g=p/t;s[p]=this.getTangentAt(g,new U)}r[0]=new U,o[0]=new U;let c=Number.MAX_VALUE,f=Math.abs(s[0].x),h=Math.abs(s[0].y),d=Math.abs(s[0].z);f<=c&&(c=f,n.set(1,0,0)),h<=c&&(c=h,n.set(0,1,0)),d<=c&&n.set(0,0,1),a.crossVectors(s[0],n).normalize(),r[0].crossVectors(s[0],a),o[0].crossVectors(s[0],r[0]);for(let p=1;p<=t;p++){if(r[p]=r[p-1].clone(),o[p]=o[p-1].clone(),a.crossVectors(s[p-1],s[p]),a.length()>Number.EPSILON){a.normalize();let g=Math.acos(Fe(s[p-1].dot(s[p]),-1,1));r[p].applyMatrix4(l.makeRotationAxis(a,g))}o[p].crossVectors(s[p],r[p])}if(e===!0){let p=Math.acos(Fe(r[0].dot(r[t]),-1,1));p/=t,s[0].dot(a.crossVectors(r[0],r[t]))>0&&(p=-p);for(let g=1;g<=t;g++)r[g].applyMatrix4(l.makeRotationAxis(s[g],p*g)),o[g].crossVectors(s[g],r[g])}return{tangents:s,normals:r,binormals:o}}clone(){return new this.constructor().copy(this)}copy(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}toJSON(){let t={metadata:{version:4.6,type:"Curve",generator:"Curve.toJSON"}};return t.arcLengthDivisions=this.arcLengthDivisions,t.type=this.type,t}fromJSON(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}},Ms=class extends hn{constructor(t=0,e=0,n=1,s=1,r=0,o=Math.PI*2,a=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=t,this.aY=e,this.xRadius=n,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=o,this.aClockwise=a,this.aRotation=l}getPoint(t,e=new Mt){let n=e,s=Math.PI*2,r=this.aEndAngle-this.aStartAngle,o=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(o?r=0:r=s),this.aClockwise===!0&&!o&&(r===s?r=-s:r=r-s);let a=this.aStartAngle+t*r,l=this.aX+this.xRadius*Math.cos(a),c=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){let f=Math.cos(this.aRotation),h=Math.sin(this.aRotation),d=l-this.aX,p=c-this.aY;l=d*f-p*h+this.aX,c=d*h+p*f+this.aY}return n.set(l,c)}copy(t){return super.copy(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}toJSON(){let t=super.toJSON();return t.aX=this.aX,t.aY=this.aY,t.xRadius=this.xRadius,t.yRadius=this.yRadius,t.aStartAngle=this.aStartAngle,t.aEndAngle=this.aEndAngle,t.aClockwise=this.aClockwise,t.aRotation=this.aRotation,t}fromJSON(t){return super.fromJSON(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}},sl=class extends Ms{constructor(t,e,n,s,r,o){super(t,e,n,n,s,r,o),this.isArcCurve=!0,this.type="ArcCurve"}};function Ol(){let i=0,t=0,e=0,n=0;function s(r,o,a,l){i=r,t=a,e=-3*r+3*o-2*a-l,n=2*r-2*o+a+l}return{initCatmullRom:function(r,o,a,l,c){s(o,a,c*(a-r),c*(l-o))},initNonuniformCatmullRom:function(r,o,a,l,c,f,h){let d=(o-r)/c-(a-r)/(c+f)+(a-o)/f,p=(a-o)/f-(l-o)/(f+h)+(l-a)/h;d*=f,p*=f,s(o,a,d,p)},calc:function(r){let o=r*r,a=o*r;return i+t*r+e*o+n*a}}}var dr=new U,Jo=new Ol,Ko=new Ol,jo=new Ol,rl=class extends hn{constructor(t=[],e=!1,n="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=t,this.closed=e,this.curveType=n,this.tension=s}getPoint(t,e=new U){let n=e,s=this.points,r=s.length,o=(r-(this.closed?0:1))*t,a=Math.floor(o),l=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/r)+1)*r:l===0&&a===r-1&&(a=r-2,l=1);let c,f;this.closed||a>0?c=s[(a-1)%r]:(dr.subVectors(s[0],s[1]).add(s[0]),c=dr);let h=s[a%r],d=s[(a+1)%r];if(this.closed||a+2<r?f=s[(a+2)%r]:(dr.subVectors(s[r-1],s[r-2]).add(s[r-1]),f=dr),this.curveType==="centripetal"||this.curveType==="chordal"){let p=this.curveType==="chordal"?.5:.25,g=Math.pow(c.distanceToSquared(h),p),_=Math.pow(h.distanceToSquared(d),p),m=Math.pow(d.distanceToSquared(f),p);_<1e-4&&(_=1),g<1e-4&&(g=_),m<1e-4&&(m=_),Jo.initNonuniformCatmullRom(c.x,h.x,d.x,f.x,g,_,m),Ko.initNonuniformCatmullRom(c.y,h.y,d.y,f.y,g,_,m),jo.initNonuniformCatmullRom(c.z,h.z,d.z,f.z,g,_,m)}else this.curveType==="catmullrom"&&(Jo.initCatmullRom(c.x,h.x,d.x,f.x,this.tension),Ko.initCatmullRom(c.y,h.y,d.y,f.y,this.tension),jo.initCatmullRom(c.z,h.z,d.z,f.z,this.tension));return n.set(Jo.calc(l),Ko.calc(l),jo.calc(l)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let s=t.points[e];this.points.push(s.clone())}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}toJSON(){let t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){let s=this.points[e];t.points.push(s.toArray())}return t.closed=this.closed,t.curveType=this.curveType,t.tension=this.tension,t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let s=t.points[e];this.points.push(new U().fromArray(s))}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}};function ch(i,t,e,n,s){let r=(n-t)*.5,o=(s-e)*.5,a=i*i,l=i*a;return(2*e-2*n+r+o)*l+(-3*e+3*n-2*r-o)*a+r*i+e}function hg(i,t){let e=1-i;return e*e*t}function ug(i,t){return 2*(1-i)*i*t}function fg(i,t){return i*i*t}function fs(i,t,e,n){return hg(i,t)+ug(i,e)+fg(i,n)}function dg(i,t){let e=1-i;return e*e*e*t}function pg(i,t){let e=1-i;return 3*e*e*i*t}function mg(i,t){return 3*(1-i)*i*i*t}function gg(i,t){return i*i*i*t}function ds(i,t,e,n,s){return dg(i,t)+pg(i,e)+mg(i,n)+gg(i,s)}var Hr=class extends hn{constructor(t=new Mt,e=new Mt,n=new Mt,s=new Mt){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=t,this.v1=e,this.v2=n,this.v3=s}getPoint(t,e=new Mt){let n=e,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(ds(t,s.x,r.x,o.x,a.x),ds(t,s.y,r.y,o.y,a.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}},ol=class extends hn{constructor(t=new U,e=new U,n=new U,s=new U){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=t,this.v1=e,this.v2=n,this.v3=s}getPoint(t,e=new U){let n=e,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(ds(t,s.x,r.x,o.x,a.x),ds(t,s.y,r.y,o.y,a.y),ds(t,s.z,r.z,o.z,a.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}},Br=class extends hn{constructor(t=new Mt,e=new Mt){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=t,this.v2=e}getPoint(t,e=new Mt){let n=e;return t===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1)),n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new Mt){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},al=class extends hn{constructor(t=new U,e=new U){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=t,this.v2=e}getPoint(t,e=new U){let n=e;return t===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1)),n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new U){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},kr=class extends hn{constructor(t=new Mt,e=new Mt,n=new Mt){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new Mt){let n=e,s=this.v0,r=this.v1,o=this.v2;return n.set(fs(t,s.x,r.x,o.x),fs(t,s.y,r.y,o.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},ll=class extends hn{constructor(t=new U,e=new U,n=new U){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new U){let n=e,s=this.v0,r=this.v1,o=this.v2;return n.set(fs(t,s.x,r.x,o.x),fs(t,s.y,r.y,o.y),fs(t,s.z,r.z,o.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},Gr=class extends hn{constructor(t=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=t}getPoint(t,e=new Mt){let n=e,s=this.points,r=(s.length-1)*t,o=Math.floor(r),a=r-o,l=s[o===0?o:o-1],c=s[o],f=s[o>s.length-2?s.length-1:o+1],h=s[o>s.length-3?s.length-1:o+2];return n.set(ch(a,l.x,c.x,f.x,h.x),ch(a,l.y,c.y,f.y,h.y)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let s=t.points[e];this.points.push(s.clone())}return this}toJSON(){let t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){let s=this.points[e];t.points.push(s.toArray())}return t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let s=t.points[e];this.points.push(new Mt().fromArray(s))}return this}},cl=Object.freeze({__proto__:null,ArcCurve:sl,CatmullRomCurve3:rl,CubicBezierCurve:Hr,CubicBezierCurve3:ol,EllipseCurve:Ms,LineCurve:Br,LineCurve3:al,QuadraticBezierCurve:kr,QuadraticBezierCurve3:ll,SplineCurve:Gr}),hl=class extends hn{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(t){this.curves.push(t)}closePath(){let t=this.curves[0].getPoint(0),e=this.curves[this.curves.length-1].getPoint(1);if(!t.equals(e)){let n=t.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new cl[n](e,t))}return this}getPoint(t,e){let n=t*this.getLength(),s=this.getCurveLengths(),r=0;for(;r<s.length;){if(s[r]>=n){let o=s[r]-n,a=this.curves[r],l=a.getLength(),c=l===0?0:1-o/l;return a.getPointAt(c,e)}r++}return null}getLength(){let t=this.getCurveLengths();return t[t.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let t=[],e=0;for(let n=0,s=this.curves.length;n<s;n++)e+=this.curves[n].getLength(),t.push(e);return this.cacheLengths=t,t}getSpacedPoints(t=40){let e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return this.autoClose&&e.push(e[0]),e}getPoints(t=12){let e=[],n;for(let s=0,r=this.curves;s<r.length;s++){let o=r[s],a=o.isEllipseCurve?t*2:o.isLineCurve||o.isLineCurve3?1:o.isSplineCurve?t*o.points.length:t,l=o.getPoints(a);for(let c=0;c<l.length;c++){let f=l[c];n&&n.equals(f)||(e.push(f),n=f)}}return this.autoClose&&e.length>1&&!e[e.length-1].equals(e[0])&&e.push(e[0]),e}copy(t){super.copy(t),this.curves=[];for(let e=0,n=t.curves.length;e<n;e++){let s=t.curves[e];this.curves.push(s.clone())}return this.autoClose=t.autoClose,this}toJSON(){let t=super.toJSON();t.autoClose=this.autoClose,t.curves=[];for(let e=0,n=this.curves.length;e<n;e++){let s=this.curves[e];t.curves.push(s.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.autoClose=t.autoClose,this.curves=[];for(let e=0,n=t.curves.length;e<n;e++){let s=t.curves[e];this.curves.push(new cl[s.type]().fromJSON(s))}return this}},Es=class extends hl{constructor(t){super(),this.type="Path",this.currentPoint=new Mt,t&&this.setFromPoints(t)}setFromPoints(t){this.moveTo(t[0].x,t[0].y);for(let e=1,n=t.length;e<n;e++)this.lineTo(t[e].x,t[e].y);return this}moveTo(t,e){return this.currentPoint.set(t,e),this}lineTo(t,e){let n=new Br(this.currentPoint.clone(),new Mt(t,e));return this.curves.push(n),this.currentPoint.set(t,e),this}quadraticCurveTo(t,e,n,s){let r=new kr(this.currentPoint.clone(),new Mt(t,e),new Mt(n,s));return this.curves.push(r),this.currentPoint.set(n,s),this}bezierCurveTo(t,e,n,s,r,o){let a=new Hr(this.currentPoint.clone(),new Mt(t,e),new Mt(n,s),new Mt(r,o));return this.curves.push(a),this.currentPoint.set(r,o),this}splineThru(t){let e=[this.currentPoint.clone()].concat(t),n=new Gr(e);return this.curves.push(n),this.currentPoint.copy(t[t.length-1]),this}arc(t,e,n,s,r,o){let a=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(t+a,e+l,n,s,r,o),this}absarc(t,e,n,s,r,o){return this.absellipse(t,e,n,n,s,r,o),this}ellipse(t,e,n,s,r,o,a,l){let c=this.currentPoint.x,f=this.currentPoint.y;return this.absellipse(t+c,e+f,n,s,r,o,a,l),this}absellipse(t,e,n,s,r,o,a,l){let c=new Ms(t,e,n,s,r,o,a,l);if(this.curves.length>0){let h=c.getPoint(0);h.equals(this.currentPoint)||this.lineTo(h.x,h.y)}this.curves.push(c);let f=c.getPoint(1);return this.currentPoint.copy(f),this}copy(t){return super.copy(t),this.currentPoint.copy(t.currentPoint),this}toJSON(){let t=super.toJSON();return t.currentPoint=this.currentPoint.toArray(),t}fromJSON(t){return super.fromJSON(t),this.currentPoint.fromArray(t.currentPoint),this}},ul=class i extends Ee{constructor(t=[new Mt(0,-.5),new Mt(.5,0),new Mt(0,.5)],e=12,n=0,s=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:t,segments:e,phiStart:n,phiLength:s},e=Math.floor(e),s=Fe(s,0,Math.PI*2);let r=[],o=[],a=[],l=[],c=[],f=1/e,h=new U,d=new Mt,p=new U,g=new U,_=new U,m=0,u=0;for(let y=0;y<=t.length-1;y++)switch(y){case 0:m=t[y+1].x-t[y].x,u=t[y+1].y-t[y].y,p.x=u*1,p.y=-m,p.z=u*0,_.copy(p),p.normalize(),l.push(p.x,p.y,p.z);break;case t.length-1:l.push(_.x,_.y,_.z);break;default:m=t[y+1].x-t[y].x,u=t[y+1].y-t[y].y,p.x=u*1,p.y=-m,p.z=u*0,g.copy(p),p.x+=_.x,p.y+=_.y,p.z+=_.z,p.normalize(),l.push(p.x,p.y,p.z),_.copy(g)}for(let y=0;y<=e;y++){let v=n+y*f*s,M=Math.sin(v),A=Math.cos(v);for(let S=0;S<=t.length-1;S++){h.x=t[S].x*M,h.y=t[S].y,h.z=t[S].x*A,o.push(h.x,h.y,h.z),d.x=y/e,d.y=S/(t.length-1),a.push(d.x,d.y);let w=l[3*S+0]*M,P=l[3*S+1],D=l[3*S+0]*A;c.push(w,P,D)}}for(let y=0;y<e;y++)for(let v=0;v<t.length-1;v++){let M=v+y*t.length,A=M,S=M+t.length,w=M+t.length+1,P=M+1;r.push(A,S,P),r.push(w,P,S)}this.setIndex(r),this.setAttribute("position",new ee(o,3)),this.setAttribute("uv",new ee(a,2)),this.setAttribute("normal",new ee(c,3))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.points,t.segments,t.phiStart,t.phiLength)}},Le=class i extends ul{constructor(t=1,e=1,n=4,s=8){let r=new Es;r.absarc(0,-e/2,t,Math.PI*1.5,0),r.absarc(0,e/2,t,0,Math.PI*.5),super(r.getPoints(n),s),this.type="CapsuleGeometry",this.parameters={radius:t,length:e,capSegments:n,radialSegments:s}}static fromJSON(t){return new i(t.radius,t.length,t.capSegments,t.radialSegments)}},wn=class i extends Ee{constructor(t=1,e=32,n=0,s=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:t,segments:e,thetaStart:n,thetaLength:s},e=Math.max(3,e);let r=[],o=[],a=[],l=[],c=new U,f=new Mt;o.push(0,0,0),a.push(0,0,1),l.push(.5,.5);for(let h=0,d=3;h<=e;h++,d+=3){let p=n+h/e*s;c.x=t*Math.cos(p),c.y=t*Math.sin(p),o.push(c.x,c.y,c.z),a.push(0,0,1),f.x=(o[d]/t+1)/2,f.y=(o[d+1]/t+1)/2,l.push(f.x,f.y)}for(let h=1;h<=e;h++)r.push(h,h+1,0);this.setIndex(r),this.setAttribute("position",new ee(o,3)),this.setAttribute("normal",new ee(a,3)),this.setAttribute("uv",new ee(l,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radius,t.segments,t.thetaStart,t.thetaLength)}},J=class i extends Ee{constructor(t=1,e=1,n=1,s=32,r=1,o=!1,a=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:e,height:n,radialSegments:s,heightSegments:r,openEnded:o,thetaStart:a,thetaLength:l};let c=this;s=Math.floor(s),r=Math.floor(r);let f=[],h=[],d=[],p=[],g=0,_=[],m=n/2,u=0;y(),o===!1&&(t>0&&v(!0),e>0&&v(!1)),this.setIndex(f),this.setAttribute("position",new ee(h,3)),this.setAttribute("normal",new ee(d,3)),this.setAttribute("uv",new ee(p,2));function y(){let M=new U,A=new U,S=0,w=(e-t)/n;for(let P=0;P<=r;P++){let D=[],x=P/r,E=x*(e-t)+t;for(let N=0;N<=s;N++){let z=N/s,I=z*l+a,V=Math.sin(I),F=Math.cos(I);A.x=E*V,A.y=-x*n+m,A.z=E*F,h.push(A.x,A.y,A.z),M.set(V,w,F).normalize(),d.push(M.x,M.y,M.z),p.push(z,1-x),D.push(g++)}_.push(D)}for(let P=0;P<s;P++)for(let D=0;D<r;D++){let x=_[D][P],E=_[D+1][P],N=_[D+1][P+1],z=_[D][P+1];t>0&&(f.push(x,E,z),S+=3),e>0&&(f.push(E,N,z),S+=3)}c.addGroup(u,S,0),u+=S}function v(M){let A=g,S=new Mt,w=new U,P=0,D=M===!0?t:e,x=M===!0?1:-1;for(let N=1;N<=s;N++)h.push(0,m*x,0),d.push(0,x,0),p.push(.5,.5),g++;let E=g;for(let N=0;N<=s;N++){let I=N/s*l+a,V=Math.cos(I),F=Math.sin(I);w.x=D*F,w.y=m*x,w.z=D*V,h.push(w.x,w.y,w.z),d.push(0,x,0),S.x=V*.5+.5,S.y=F*.5*x+.5,p.push(S.x,S.y),g++}for(let N=0;N<s;N++){let z=A+N,I=E+N;M===!0?f.push(I,I+1,z):f.push(I+1,I,z),P+=3}c.addGroup(u,P,M===!0?1:2),u+=P}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},Be=class i extends J{constructor(t=1,e=1,n=32,s=1,r=!1,o=0,a=Math.PI*2){super(0,t,e,n,s,r,o,a),this.type="ConeGeometry",this.parameters={radius:t,height:e,radialSegments:n,heightSegments:s,openEnded:r,thetaStart:o,thetaLength:a}}static fromJSON(t){return new i(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},Vr=class i extends Ee{constructor(t=[],e=[],n=1,s=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:t,indices:e,radius:n,detail:s};let r=[],o=[];a(s),c(n),f(),this.setAttribute("position",new ee(r,3)),this.setAttribute("normal",new ee(r.slice(),3)),this.setAttribute("uv",new ee(o,2)),s===0?this.computeVertexNormals():this.normalizeNormals();function a(y){let v=new U,M=new U,A=new U;for(let S=0;S<e.length;S+=3)p(e[S+0],v),p(e[S+1],M),p(e[S+2],A),l(v,M,A,y)}function l(y,v,M,A){let S=A+1,w=[];for(let P=0;P<=S;P++){w[P]=[];let D=y.clone().lerp(M,P/S),x=v.clone().lerp(M,P/S),E=S-P;for(let N=0;N<=E;N++)N===0&&P===S?w[P][N]=D:w[P][N]=D.clone().lerp(x,N/E)}for(let P=0;P<S;P++)for(let D=0;D<2*(S-P)-1;D++){let x=Math.floor(D/2);D%2===0?(d(w[P][x+1]),d(w[P+1][x]),d(w[P][x])):(d(w[P][x+1]),d(w[P+1][x+1]),d(w[P+1][x]))}}function c(y){let v=new U;for(let M=0;M<r.length;M+=3)v.x=r[M+0],v.y=r[M+1],v.z=r[M+2],v.normalize().multiplyScalar(y),r[M+0]=v.x,r[M+1]=v.y,r[M+2]=v.z}function f(){let y=new U;for(let v=0;v<r.length;v+=3){y.x=r[v+0],y.y=r[v+1],y.z=r[v+2];let M=m(y)/2/Math.PI+.5,A=u(y)/Math.PI+.5;o.push(M,1-A)}g(),h()}function h(){for(let y=0;y<o.length;y+=6){let v=o[y+0],M=o[y+2],A=o[y+4],S=Math.max(v,M,A),w=Math.min(v,M,A);S>.9&&w<.1&&(v<.2&&(o[y+0]+=1),M<.2&&(o[y+2]+=1),A<.2&&(o[y+4]+=1))}}function d(y){r.push(y.x,y.y,y.z)}function p(y,v){let M=y*3;v.x=t[M+0],v.y=t[M+1],v.z=t[M+2]}function g(){let y=new U,v=new U,M=new U,A=new U,S=new Mt,w=new Mt,P=new Mt;for(let D=0,x=0;D<r.length;D+=9,x+=6){y.set(r[D+0],r[D+1],r[D+2]),v.set(r[D+3],r[D+4],r[D+5]),M.set(r[D+6],r[D+7],r[D+8]),S.set(o[x+0],o[x+1]),w.set(o[x+2],o[x+3]),P.set(o[x+4],o[x+5]),A.copy(y).add(v).add(M).divideScalar(3);let E=m(A);_(S,x+0,y,E),_(w,x+2,v,E),_(P,x+4,M,E)}}function _(y,v,M,A){A<0&&y.x===1&&(o[v]=y.x-1),M.x===0&&M.z===0&&(o[v]=A/2/Math.PI+.5)}function m(y){return Math.atan2(y.z,-y.x)}function u(y){return Math.atan2(-y.y,Math.sqrt(y.x*y.x+y.z*y.z))}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.vertices,t.indices,t.radius,t.details)}},Ss=class i extends Vr{constructor(t=1,e=0){let n=(1+Math.sqrt(5))/2,s=1/n,r=[-1,-1,-1,-1,-1,1,-1,1,-1,-1,1,1,1,-1,-1,1,-1,1,1,1,-1,1,1,1,0,-s,-n,0,-s,n,0,s,-n,0,s,n,-s,-n,0,-s,n,0,s,-n,0,s,n,0,-n,0,-s,n,0,-s,-n,0,s,n,0,s],o=[3,11,7,3,7,15,3,15,13,7,19,17,7,17,6,7,6,15,17,4,8,17,8,10,17,10,6,8,0,16,8,16,2,8,2,10,0,12,1,0,1,18,0,18,16,6,10,2,6,2,13,6,13,15,2,16,18,2,18,3,2,3,13,18,1,9,18,9,11,18,11,3,4,14,12,4,12,0,4,0,8,11,9,5,11,5,19,11,19,7,19,5,14,19,14,4,19,4,17,1,12,14,1,14,5,1,5,9];super(r,o,t,e),this.type="DodecahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new i(t.radius,t.detail)}};var bs=class extends Es{constructor(t){super(t),this.uuid=ji(),this.type="Shape",this.holes=[]}getPointsHoles(t){let e=[];for(let n=0,s=this.holes.length;n<s;n++)e[n]=this.holes[n].getPoints(t);return e}extractPoints(t){return{shape:this.getPoints(t),holes:this.getPointsHoles(t)}}copy(t){super.copy(t),this.holes=[];for(let e=0,n=t.holes.length;e<n;e++){let s=t.holes[e];this.holes.push(s.clone())}return this}toJSON(){let t=super.toJSON();t.uuid=this.uuid,t.holes=[];for(let e=0,n=this.holes.length;e<n;e++){let s=this.holes[e];t.holes.push(s.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.uuid=t.uuid,this.holes=[];for(let e=0,n=t.holes.length;e<n;e++){let s=t.holes[e];this.holes.push(new Es().fromJSON(s))}return this}},xg={triangulate:function(i,t,e=2){let n=t&&t.length,s=n?t[0]*e:i.length,r=kh(i,0,s,e,!0),o=[];if(!r||r.next===r.prev)return o;let a,l,c,f,h,d,p;if(n&&(r=Eg(i,t,r,e)),i.length>80*e){a=c=i[0],l=f=i[1];for(let g=e;g<s;g+=e)h=i[g],d=i[g+1],h<a&&(a=h),d<l&&(l=d),h>c&&(c=h),d>f&&(f=d);p=Math.max(c-a,f-l),p=p!==0?32767/p:0}return ws(r,o,e,a,l,p,0),o}};function kh(i,t,e,n,s){let r,o;if(s===Dg(i,t,e,n)>0)for(r=t;r<e;r+=n)o=hh(r,i[r],i[r+1],o);else for(r=e-n;r>=t;r-=n)o=hh(r,i[r],i[r+1],o);return o&&eo(o,o.next)&&(As(o),o=o.next),o}function xi(i,t){if(!i)return i;t||(t=i);let e=i,n;do if(n=!1,!e.steiner&&(eo(e,e.next)||_e(e.prev,e,e.next)===0)){if(As(e),e=t=e.prev,e===e.next)break;n=!0}else e=e.next;while(n||e!==t);return t}function ws(i,t,e,n,s,r,o){if(!i)return;!o&&r&&Ag(i,n,s,r);let a=i,l,c;for(;i.prev!==i.next;){if(l=i.prev,c=i.next,r?_g(i,n,s,r):yg(i)){t.push(l.i/e|0),t.push(i.i/e|0),t.push(c.i/e|0),As(i),i=c.next,a=c.next;continue}if(i=c,i===a){o?o===1?(i=vg(xi(i),t,e),ws(i,t,e,n,s,r,2)):o===2&&Mg(i,t,e,n,s,r):ws(xi(i),t,e,n,s,r,1);break}}}function yg(i){let t=i.prev,e=i,n=i.next;if(_e(t,e,n)>=0)return!1;let s=t.x,r=e.x,o=n.x,a=t.y,l=e.y,c=n.y,f=s<r?s<o?s:o:r<o?r:o,h=a<l?a<c?a:c:l<c?l:c,d=s>r?s>o?s:o:r>o?r:o,p=a>l?a>c?a:c:l>c?l:c,g=n.next;for(;g!==t;){if(g.x>=f&&g.x<=d&&g.y>=h&&g.y<=p&&Oi(s,a,r,l,o,c,g.x,g.y)&&_e(g.prev,g,g.next)>=0)return!1;g=g.next}return!0}function _g(i,t,e,n){let s=i.prev,r=i,o=i.next;if(_e(s,r,o)>=0)return!1;let a=s.x,l=r.x,c=o.x,f=s.y,h=r.y,d=o.y,p=a<l?a<c?a:c:l<c?l:c,g=f<h?f<d?f:d:h<d?h:d,_=a>l?a>c?a:c:l>c?l:c,m=f>h?f>d?f:d:h>d?h:d,u=fl(p,g,t,e,n),y=fl(_,m,t,e,n),v=i.prevZ,M=i.nextZ;for(;v&&v.z>=u&&M&&M.z<=y;){if(v.x>=p&&v.x<=_&&v.y>=g&&v.y<=m&&v!==s&&v!==o&&Oi(a,f,l,h,c,d,v.x,v.y)&&_e(v.prev,v,v.next)>=0||(v=v.prevZ,M.x>=p&&M.x<=_&&M.y>=g&&M.y<=m&&M!==s&&M!==o&&Oi(a,f,l,h,c,d,M.x,M.y)&&_e(M.prev,M,M.next)>=0))return!1;M=M.nextZ}for(;v&&v.z>=u;){if(v.x>=p&&v.x<=_&&v.y>=g&&v.y<=m&&v!==s&&v!==o&&Oi(a,f,l,h,c,d,v.x,v.y)&&_e(v.prev,v,v.next)>=0)return!1;v=v.prevZ}for(;M&&M.z<=y;){if(M.x>=p&&M.x<=_&&M.y>=g&&M.y<=m&&M!==s&&M!==o&&Oi(a,f,l,h,c,d,M.x,M.y)&&_e(M.prev,M,M.next)>=0)return!1;M=M.nextZ}return!0}function vg(i,t,e){let n=i;do{let s=n.prev,r=n.next.next;!eo(s,r)&&Gh(s,n,n.next,r)&&Ts(s,r)&&Ts(r,s)&&(t.push(s.i/e|0),t.push(n.i/e|0),t.push(r.i/e|0),As(n),As(n.next),n=i=r),n=n.next}while(n!==i);return xi(n)}function Mg(i,t,e,n,s,r){let o=i;do{let a=o.next.next;for(;a!==o.prev;){if(o.i!==a.i&&Pg(o,a)){let l=Vh(o,a);o=xi(o,o.next),l=xi(l,l.next),ws(o,t,e,n,s,r,0),ws(l,t,e,n,s,r,0);return}a=a.next}o=o.next}while(o!==i)}function Eg(i,t,e,n){let s=[],r,o,a,l,c;for(r=0,o=t.length;r<o;r++)a=t[r]*n,l=r<o-1?t[r+1]*n:i.length,c=kh(i,a,l,n,!1),c===c.next&&(c.steiner=!0),s.push(Cg(c));for(s.sort(Sg),r=0;r<s.length;r++)e=bg(s[r],e);return e}function Sg(i,t){return i.x-t.x}function bg(i,t){let e=wg(i,t);if(!e)return t;let n=Vh(e,i);return xi(n,n.next),xi(e,e.next)}function wg(i,t){let e=t,n=-1/0,s,r=i.x,o=i.y;do{if(o<=e.y&&o>=e.next.y&&e.next.y!==e.y){let d=e.x+(o-e.y)*(e.next.x-e.x)/(e.next.y-e.y);if(d<=r&&d>n&&(n=d,s=e.x<e.next.x?e:e.next,d===r))return s}e=e.next}while(e!==t);if(!s)return null;let a=s,l=s.x,c=s.y,f=1/0,h;e=s;do r>=e.x&&e.x>=l&&r!==e.x&&Oi(o<c?r:n,o,l,c,o<c?n:r,o,e.x,e.y)&&(h=Math.abs(o-e.y)/(r-e.x),Ts(e,i)&&(h<f||h===f&&(e.x>s.x||e.x===s.x&&Tg(s,e)))&&(s=e,f=h)),e=e.next;while(e!==a);return s}function Tg(i,t){return _e(i.prev,i,t.prev)<0&&_e(t.next,i,i.next)<0}function Ag(i,t,e,n){let s=i;do s.z===0&&(s.z=fl(s.x,s.y,t,e,n)),s.prevZ=s.prev,s.nextZ=s.next,s=s.next;while(s!==i);s.prevZ.nextZ=null,s.prevZ=null,Rg(s)}function Rg(i){let t,e,n,s,r,o,a,l,c=1;do{for(e=i,i=null,r=null,o=0;e;){for(o++,n=e,a=0,t=0;t<c&&(a++,n=n.nextZ,!!n);t++);for(l=c;a>0||l>0&&n;)a!==0&&(l===0||!n||e.z<=n.z)?(s=e,e=e.nextZ,a--):(s=n,n=n.nextZ,l--),r?r.nextZ=s:i=s,s.prevZ=r,r=s;e=n}r.nextZ=null,c*=2}while(o>1);return i}function fl(i,t,e,n,s){return i=(i-e)*s|0,t=(t-n)*s|0,i=(i|i<<8)&16711935,i=(i|i<<4)&252645135,i=(i|i<<2)&858993459,i=(i|i<<1)&1431655765,t=(t|t<<8)&16711935,t=(t|t<<4)&252645135,t=(t|t<<2)&858993459,t=(t|t<<1)&1431655765,i|t<<1}function Cg(i){let t=i,e=i;do(t.x<e.x||t.x===e.x&&t.y<e.y)&&(e=t),t=t.next;while(t!==i);return e}function Oi(i,t,e,n,s,r,o,a){return(s-o)*(t-a)>=(i-o)*(r-a)&&(i-o)*(n-a)>=(e-o)*(t-a)&&(e-o)*(r-a)>=(s-o)*(n-a)}function Pg(i,t){return i.next.i!==t.i&&i.prev.i!==t.i&&!Ig(i,t)&&(Ts(i,t)&&Ts(t,i)&&Lg(i,t)&&(_e(i.prev,i,t.prev)||_e(i,t.prev,t))||eo(i,t)&&_e(i.prev,i,i.next)>0&&_e(t.prev,t,t.next)>0)}function _e(i,t,e){return(t.y-i.y)*(e.x-t.x)-(t.x-i.x)*(e.y-t.y)}function eo(i,t){return i.x===t.x&&i.y===t.y}function Gh(i,t,e,n){let s=mr(_e(i,t,e)),r=mr(_e(i,t,n)),o=mr(_e(e,n,i)),a=mr(_e(e,n,t));return!!(s!==r&&o!==a||s===0&&pr(i,e,t)||r===0&&pr(i,n,t)||o===0&&pr(e,i,n)||a===0&&pr(e,t,n))}function pr(i,t,e){return t.x<=Math.max(i.x,e.x)&&t.x>=Math.min(i.x,e.x)&&t.y<=Math.max(i.y,e.y)&&t.y>=Math.min(i.y,e.y)}function mr(i){return i>0?1:i<0?-1:0}function Ig(i,t){let e=i;do{if(e.i!==i.i&&e.next.i!==i.i&&e.i!==t.i&&e.next.i!==t.i&&Gh(e,e.next,i,t))return!0;e=e.next}while(e!==i);return!1}function Ts(i,t){return _e(i.prev,i,i.next)<0?_e(i,t,i.next)>=0&&_e(i,i.prev,t)>=0:_e(i,t,i.prev)<0||_e(i,i.next,t)<0}function Lg(i,t){let e=i,n=!1,s=(i.x+t.x)/2,r=(i.y+t.y)/2;do e.y>r!=e.next.y>r&&e.next.y!==e.y&&s<(e.next.x-e.x)*(r-e.y)/(e.next.y-e.y)+e.x&&(n=!n),e=e.next;while(e!==i);return n}function Vh(i,t){let e=new dl(i.i,i.x,i.y),n=new dl(t.i,t.x,t.y),s=i.next,r=t.prev;return i.next=t,t.prev=i,e.next=s,s.prev=e,n.next=e,e.prev=n,r.next=n,n.prev=r,n}function hh(i,t,e,n){let s=new dl(i,t,e);return n?(s.next=n.next,s.prev=n,n.next.prev=s,n.next=s):(s.prev=s,s.next=s),s}function As(i){i.next.prev=i.prev,i.prev.next=i.next,i.prevZ&&(i.prevZ.nextZ=i.nextZ),i.nextZ&&(i.nextZ.prevZ=i.prevZ)}function dl(i,t,e){this.i=i,this.x=t,this.y=e,this.prev=null,this.next=null,this.z=0,this.prevZ=null,this.nextZ=null,this.steiner=!1}function Dg(i,t,e,n){let s=0;for(let r=t,o=e-n;r<e;r+=n)s+=(i[o]-i[r])*(i[r+1]+i[o+1]),o=r;return s}var ps=class i{static area(t){let e=t.length,n=0;for(let s=e-1,r=0;r<e;s=r++)n+=t[s].x*t[r].y-t[r].x*t[s].y;return n*.5}static isClockWise(t){return i.area(t)<0}static triangulateShape(t,e){let n=[],s=[],r=[];uh(t),fh(n,t);let o=t.length;e.forEach(uh);for(let l=0;l<e.length;l++)s.push(o),o+=e[l].length,fh(n,e[l]);let a=xg.triangulate(n,s);for(let l=0;l<a.length;l+=3)r.push(a.slice(l,l+3));return r}};function uh(i){let t=i.length;t>2&&i[t-1].equals(i[0])&&i.pop()}function fh(i,t){for(let e=0;e<t.length;e++)i.push(t[e].x),i.push(t[e].y)}var Wr=class i extends Ee{constructor(t=new bs([new Mt(.5,.5),new Mt(-.5,.5),new Mt(-.5,-.5),new Mt(.5,-.5)]),e={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:t,options:e},t=Array.isArray(t)?t:[t];let n=this,s=[],r=[];for(let a=0,l=t.length;a<l;a++){let c=t[a];o(c)}this.setAttribute("position",new ee(s,3)),this.setAttribute("uv",new ee(r,2)),this.computeVertexNormals();function o(a){let l=[],c=e.curveSegments!==void 0?e.curveSegments:12,f=e.steps!==void 0?e.steps:1,h=e.depth!==void 0?e.depth:1,d=e.bevelEnabled!==void 0?e.bevelEnabled:!0,p=e.bevelThickness!==void 0?e.bevelThickness:.2,g=e.bevelSize!==void 0?e.bevelSize:p-.1,_=e.bevelOffset!==void 0?e.bevelOffset:0,m=e.bevelSegments!==void 0?e.bevelSegments:3,u=e.extrudePath,y=e.UVGenerator!==void 0?e.UVGenerator:Ug,v,M=!1,A,S,w,P;u&&(v=u.getSpacedPoints(f),M=!0,d=!1,A=u.computeFrenetFrames(f,!1),S=new U,w=new U,P=new U),d||(m=0,p=0,g=0,_=0);let D=a.extractPoints(c),x=D.shape,E=D.holes;if(!ps.isClockWise(x)){x=x.reverse();for(let ct=0,C=E.length;ct<C;ct++){let Et=E[ct];ps.isClockWise(Et)&&(E[ct]=Et.reverse())}}let z=ps.triangulateShape(x,E),I=x;for(let ct=0,C=E.length;ct<C;ct++){let Et=E[ct];x=x.concat(Et)}function V(ct,C,Et){return C||console.error("THREE.ExtrudeGeometry: vec does not exist"),ct.clone().addScaledVector(C,Et)}let F=x.length,Q=z.length;function Y(ct,C,Et){let W,q,ot,dt=ct.x-C.x,mt=ct.y-C.y,R=Et.x-ct.x,b=Et.y-ct.y,G=dt*dt+mt*mt,et=dt*b-mt*R;if(Math.abs(et)>Number.EPSILON){let st=Math.sqrt(G),j=Math.sqrt(R*R+b*b),Rt=C.x-mt/st,St=C.y+dt/st,At=Et.x-b/j,jt=Et.y+R/j,ft=((At-Rt)*b-(jt-St)*R)/(dt*b-mt*R);W=Rt+dt*ft-ct.x,q=St+mt*ft-ct.y;let H=W*W+q*q;if(H<=2)return new Mt(W,q);ot=Math.sqrt(H/2)}else{let st=!1;dt>Number.EPSILON?R>Number.EPSILON&&(st=!0):dt<-Number.EPSILON?R<-Number.EPSILON&&(st=!0):Math.sign(mt)===Math.sign(b)&&(st=!0),st?(W=-mt,q=dt,ot=Math.sqrt(G)):(W=dt,q=mt,ot=Math.sqrt(G/2))}return new Mt(W/ot,q/ot)}let X=[];for(let ct=0,C=I.length,Et=C-1,W=ct+1;ct<C;ct++,Et++,W++)Et===C&&(Et=0),W===C&&(W=0),X[ct]=Y(I[ct],I[Et],I[W]);let it=[],rt,bt=X.concat();for(let ct=0,C=E.length;ct<C;ct++){let Et=E[ct];rt=[];for(let W=0,q=Et.length,ot=q-1,dt=W+1;W<q;W++,ot++,dt++)ot===q&&(ot=0),dt===q&&(dt=0),rt[W]=Y(Et[W],Et[ot],Et[dt]);it.push(rt),bt=bt.concat(rt)}for(let ct=0;ct<m;ct++){let C=ct/m,Et=p*Math.cos(C*Math.PI/2),W=g*Math.sin(C*Math.PI/2)+_;for(let q=0,ot=I.length;q<ot;q++){let dt=V(I[q],X[q],W);yt(dt.x,dt.y,-Et)}for(let q=0,ot=E.length;q<ot;q++){let dt=E[q];rt=it[q];for(let mt=0,R=dt.length;mt<R;mt++){let b=V(dt[mt],rt[mt],W);yt(b.x,b.y,-Et)}}}let It=g+_;for(let ct=0;ct<F;ct++){let C=d?V(x[ct],bt[ct],It):x[ct];M?(w.copy(A.normals[0]).multiplyScalar(C.x),S.copy(A.binormals[0]).multiplyScalar(C.y),P.copy(v[0]).add(w).add(S),yt(P.x,P.y,P.z)):yt(C.x,C.y,0)}for(let ct=1;ct<=f;ct++)for(let C=0;C<F;C++){let Et=d?V(x[C],bt[C],It):x[C];M?(w.copy(A.normals[ct]).multiplyScalar(Et.x),S.copy(A.binormals[ct]).multiplyScalar(Et.y),P.copy(v[ct]).add(w).add(S),yt(P.x,P.y,P.z)):yt(Et.x,Et.y,h/f*ct)}for(let ct=m-1;ct>=0;ct--){let C=ct/m,Et=p*Math.cos(C*Math.PI/2),W=g*Math.sin(C*Math.PI/2)+_;for(let q=0,ot=I.length;q<ot;q++){let dt=V(I[q],X[q],W);yt(dt.x,dt.y,h+Et)}for(let q=0,ot=E.length;q<ot;q++){let dt=E[q];rt=it[q];for(let mt=0,R=dt.length;mt<R;mt++){let b=V(dt[mt],rt[mt],W);M?yt(b.x,b.y+v[f-1].y,v[f-1].x+Et):yt(b.x,b.y,h+Et)}}}K(),lt();function K(){let ct=s.length/3;if(d){let C=0,Et=F*C;for(let W=0;W<Q;W++){let q=z[W];Nt(q[2]+Et,q[1]+Et,q[0]+Et)}C=f+m*2,Et=F*C;for(let W=0;W<Q;W++){let q=z[W];Nt(q[0]+Et,q[1]+Et,q[2]+Et)}}else{for(let C=0;C<Q;C++){let Et=z[C];Nt(Et[2],Et[1],Et[0])}for(let C=0;C<Q;C++){let Et=z[C];Nt(Et[0]+F*f,Et[1]+F*f,Et[2]+F*f)}}n.addGroup(ct,s.length/3-ct,0)}function lt(){let ct=s.length/3,C=0;pt(I,C),C+=I.length;for(let Et=0,W=E.length;Et<W;Et++){let q=E[Et];pt(q,C),C+=q.length}n.addGroup(ct,s.length/3-ct,1)}function pt(ct,C){let Et=ct.length;for(;--Et>=0;){let W=Et,q=Et-1;q<0&&(q=ct.length-1);for(let ot=0,dt=f+m*2;ot<dt;ot++){let mt=F*ot,R=F*(ot+1),b=C+W+mt,G=C+q+mt,et=C+q+R,st=C+W+R;Ot(b,G,et,st)}}}function yt(ct,C,Et){l.push(ct),l.push(C),l.push(Et)}function Nt(ct,C,Et){Vt(ct),Vt(C),Vt(Et);let W=s.length/3,q=y.generateTopUV(n,s,W-3,W-2,W-1);Jt(q[0]),Jt(q[1]),Jt(q[2])}function Ot(ct,C,Et,W){Vt(ct),Vt(C),Vt(W),Vt(C),Vt(Et),Vt(W);let q=s.length/3,ot=y.generateSideWallUV(n,s,q-6,q-3,q-2,q-1);Jt(ot[0]),Jt(ot[1]),Jt(ot[3]),Jt(ot[1]),Jt(ot[2]),Jt(ot[3])}function Vt(ct){s.push(l[ct*3+0]),s.push(l[ct*3+1]),s.push(l[ct*3+2])}function Jt(ct){r.push(ct.x),r.push(ct.y)}}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){let t=super.toJSON(),e=this.parameters.shapes,n=this.parameters.options;return Ng(e,n,t)}static fromJSON(t,e){let n=[];for(let r=0,o=t.shapes.length;r<o;r++){let a=e[t.shapes[r]];n.push(a)}let s=t.options.extrudePath;return s!==void 0&&(t.options.extrudePath=new cl[s.type]().fromJSON(s)),new i(n,t.options)}},Ug={generateTopUV:function(i,t,e,n,s){let r=t[e*3],o=t[e*3+1],a=t[n*3],l=t[n*3+1],c=t[s*3],f=t[s*3+1];return[new Mt(r,o),new Mt(a,l),new Mt(c,f)]},generateSideWallUV:function(i,t,e,n,s,r){let o=t[e*3],a=t[e*3+1],l=t[e*3+2],c=t[n*3],f=t[n*3+1],h=t[n*3+2],d=t[s*3],p=t[s*3+1],g=t[s*3+2],_=t[r*3],m=t[r*3+1],u=t[r*3+2];return Math.abs(a-f)<Math.abs(o-c)?[new Mt(o,1-l),new Mt(c,1-h),new Mt(d,1-g),new Mt(_,1-u)]:[new Mt(a,1-l),new Mt(f,1-h),new Mt(p,1-g),new Mt(m,1-u)]}};function Ng(i,t,e){if(e.shapes=[],Array.isArray(i))for(let n=0,s=i.length;n<s;n++){let r=i[n];e.shapes.push(r.uuid)}else e.shapes.push(i.uuid);return e.options=Object.assign({},t),t.extrudePath!==void 0&&(e.options.extrudePath=t.extrudePath.toJSON()),e}var ze=class i extends Vr{constructor(t=1,e=0){let n=(1+Math.sqrt(5))/2,s=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1],r=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(s,r,t,e),this.type="IcosahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new i(t.radius,t.detail)}};var ti=class i extends Ee{constructor(t=.5,e=1,n=32,s=1,r=0,o=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:t,outerRadius:e,thetaSegments:n,phiSegments:s,thetaStart:r,thetaLength:o},n=Math.max(3,n),s=Math.max(1,s);let a=[],l=[],c=[],f=[],h=t,d=(e-t)/s,p=new U,g=new Mt;for(let _=0;_<=s;_++){for(let m=0;m<=n;m++){let u=r+m/n*o;p.x=h*Math.cos(u),p.y=h*Math.sin(u),l.push(p.x,p.y,p.z),c.push(0,0,1),g.x=(p.x/e+1)/2,g.y=(p.y/e+1)/2,f.push(g.x,g.y)}h+=d}for(let _=0;_<s;_++){let m=_*(n+1);for(let u=0;u<n;u++){let y=u+m,v=y,M=y+n+1,A=y+n+2,S=y+1;a.push(v,M,S),a.push(M,A,S)}}this.setIndex(a),this.setAttribute("position",new ee(l,3)),this.setAttribute("normal",new ee(c,3)),this.setAttribute("uv",new ee(f,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.innerRadius,t.outerRadius,t.thetaSegments,t.phiSegments,t.thetaStart,t.thetaLength)}};var wt=class i extends Ee{constructor(t=1,e=32,n=16,s=0,r=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:n,phiStart:s,phiLength:r,thetaStart:o,thetaLength:a},e=Math.max(3,Math.floor(e)),n=Math.max(2,Math.floor(n));let l=Math.min(o+a,Math.PI),c=0,f=[],h=new U,d=new U,p=[],g=[],_=[],m=[];for(let u=0;u<=n;u++){let y=[],v=u/n,M=0;u===0&&o===0?M=.5/e:u===n&&l===Math.PI&&(M=-.5/e);for(let A=0;A<=e;A++){let S=A/e;h.x=-t*Math.cos(s+S*r)*Math.sin(o+v*a),h.y=t*Math.cos(o+v*a),h.z=t*Math.sin(s+S*r)*Math.sin(o+v*a),g.push(h.x,h.y,h.z),d.copy(h).normalize(),_.push(d.x,d.y,d.z),m.push(S+M,1-v),y.push(c++)}f.push(y)}for(let u=0;u<n;u++)for(let y=0;y<e;y++){let v=f[u][y+1],M=f[u][y],A=f[u+1][y],S=f[u+1][y+1];(u!==0||o>0)&&p.push(v,M,S),(u!==n-1||l<Math.PI)&&p.push(M,A,S)}this.setIndex(p),this.setAttribute("position",new ee(g,3)),this.setAttribute("normal",new ee(_,3)),this.setAttribute("uv",new ee(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}};var ye=class i extends Ee{constructor(t=1,e=.4,n=12,s=48,r=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:t,tube:e,radialSegments:n,tubularSegments:s,arc:r},n=Math.floor(n),s=Math.floor(s);let o=[],a=[],l=[],c=[],f=new U,h=new U,d=new U;for(let p=0;p<=n;p++)for(let g=0;g<=s;g++){let _=g/s*r,m=p/n*Math.PI*2;h.x=(t+e*Math.cos(m))*Math.cos(_),h.y=(t+e*Math.cos(m))*Math.sin(_),h.z=e*Math.sin(m),a.push(h.x,h.y,h.z),f.x=t*Math.cos(_),f.y=t*Math.sin(_),d.subVectors(h,f).normalize(),l.push(d.x,d.y,d.z),c.push(g/s),c.push(p/n)}for(let p=1;p<=n;p++)for(let g=1;g<=s;g++){let _=(s+1)*p+g-1,m=(s+1)*(p-1)+g-1,u=(s+1)*(p-1)+g,y=(s+1)*p+g;o.push(_,m,y),o.push(m,u,y)}this.setIndex(o),this.setAttribute("position",new ee(a,3)),this.setAttribute("normal",new ee(l,3)),this.setAttribute("uv",new ee(c,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc)}};var Zt=class extends Qn{constructor(t){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.type="MeshStandardMaterial",this.color=new Gt(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Gt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Ph,this.normalScale=new Mt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Xe,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}};function gr(i,t,e){return!i||!e&&i.constructor===t?i:typeof t.BYTES_PER_ELEMENT=="number"?new t(i):Array.prototype.slice.call(i)}function Fg(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}var Ki=class{constructor(t,e,n,s){this.parameterPositions=t,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new e.constructor(n),this.sampleValues=e,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(t){let e=this.parameterPositions,n=this._cachedIndex,s=e[n],r=e[n-1];n:{t:{let o;e:{i:if(!(t<s)){for(let a=n+2;;){if(s===void 0){if(t<r)break i;return n=e.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(r=s,s=e[++n],t<s)break t}o=e.length;break e}if(!(t>=r)){let a=e[1];t<a&&(n=2,r=a);for(let l=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(s=r,r=e[--n-1],t>=r)break t}o=n,n=0;break e}break n}for(;n<o;){let a=n+o>>>1;t<e[a]?o=a:n=a+1}if(s=e[n],r=e[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return n=e.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,s)}return this.interpolate_(n,r,t,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(t){let e=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=t*s;for(let o=0;o!==s;++o)e[o]=n[r+o];return e}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}},pl=class extends Ki{constructor(t,e,n,s){super(t,e,n,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:dc,endingEnd:dc}}intervalChanged_(t,e,n){let s=this.parameterPositions,r=t-2,o=t+1,a=s[r],l=s[o];if(a===void 0)switch(this.getSettings_().endingStart){case pc:r=t,a=2*e-n;break;case mc:r=s.length-2,a=e+s[r]-s[r+1];break;default:r=t,a=n}if(l===void 0)switch(this.getSettings_().endingEnd){case pc:o=t,l=2*n-e;break;case mc:o=1,l=n+s[1]-s[0];break;default:o=t-1,l=e}let c=(n-e)*.5,f=this.valueSize;this._weightPrev=c/(e-a),this._weightNext=c/(l-n),this._offsetPrev=r*f,this._offsetNext=o*f}interpolate_(t,e,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=t*a,c=l-a,f=this._offsetPrev,h=this._offsetNext,d=this._weightPrev,p=this._weightNext,g=(n-e)/(s-e),_=g*g,m=_*g,u=-d*m+2*d*_-d*g,y=(1+d)*m+(-1.5-2*d)*_+(-.5+d)*g+1,v=(-1-p)*m+(1.5+p)*_+.5*g,M=p*m-p*_;for(let A=0;A!==a;++A)r[A]=u*o[f+A]+y*o[c+A]+v*o[l+A]+M*o[h+A];return r}},ml=class extends Ki{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t,e,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=t*a,c=l-a,f=(n-e)/(s-e),h=1-f;for(let d=0;d!==a;++d)r[d]=o[c+d]*h+o[l+d]*f;return r}},gl=class extends Ki{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t){return this.copySampleValue_(t-1)}},_n=class{constructor(t,e,n,s){if(t===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(e===void 0||e.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+t);this.name=t,this.times=gr(e,this.TimeBufferType),this.values=gr(n,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(t){let e=t.constructor,n;if(e.toJSON!==this.toJSON)n=e.toJSON(t);else{n={name:t.name,times:gr(t.times,Array),values:gr(t.values,Array)};let s=t.getInterpolation();s!==t.DefaultInterpolation&&(n.interpolation=s)}return n.type=t.ValueTypeName,n}InterpolantFactoryMethodDiscrete(t){return new gl(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodLinear(t){return new ml(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodSmooth(t){return new pl(this.times,this.values,this.getValueSize(),t)}setInterpolation(t){let e;switch(t){case br:e=this.InterpolantFactoryMethodDiscrete;break;case Oa:e=this.InterpolantFactoryMethodLinear;break;case vo:e=this.InterpolantFactoryMethodSmooth;break}if(e===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(t!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return console.warn("THREE.KeyframeTrack:",n),this}return this.createInterpolant=e,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return br;case this.InterpolantFactoryMethodLinear:return Oa;case this.InterpolantFactoryMethodSmooth:return vo}}getValueSize(){return this.values.length/this.times.length}shift(t){if(t!==0){let e=this.times;for(let n=0,s=e.length;n!==s;++n)e[n]+=t}return this}scale(t){if(t!==1){let e=this.times;for(let n=0,s=e.length;n!==s;++n)e[n]*=t}return this}trim(t,e){let n=this.times,s=n.length,r=0,o=s-1;for(;r!==s&&n[r]<t;)++r;for(;o!==-1&&n[o]>e;)--o;if(++o,r!==0||o!==s){r>=o&&(o=Math.max(o,1),r=o-1);let a=this.getValueSize();this.times=n.slice(r,o),this.values=this.values.slice(r*a,o*a)}return this}validate(){let t=!0,e=this.getValueSize();e-Math.floor(e)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),t=!1);let n=this.times,s=this.values,r=n.length;r===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),t=!1);let o=null;for(let a=0;a!==r;a++){let l=n[a];if(typeof l=="number"&&isNaN(l)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,a,l),t=!1;break}if(o!==null&&o>l){console.error("THREE.KeyframeTrack: Out of order keys.",this,a,l,o),t=!1;break}o=l}if(s!==void 0&&Fg(s))for(let a=0,l=s.length;a!==l;++a){let c=s[a];if(isNaN(c)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,a,c),t=!1;break}}return t}optimize(){let t=this.times.slice(),e=this.values.slice(),n=this.getValueSize(),s=this.getInterpolation()===vo,r=t.length-1,o=1;for(let a=1;a<r;++a){let l=!1,c=t[a],f=t[a+1];if(c!==f&&(a!==1||c!==t[0]))if(s)l=!0;else{let h=a*n,d=h-n,p=h+n;for(let g=0;g!==n;++g){let _=e[h+g];if(_!==e[d+g]||_!==e[p+g]){l=!0;break}}}if(l){if(a!==o){t[o]=t[a];let h=a*n,d=o*n;for(let p=0;p!==n;++p)e[d+p]=e[h+p]}++o}}if(r>0){t[o]=t[r];for(let a=r*n,l=o*n,c=0;c!==n;++c)e[l+c]=e[a+c];++o}return o!==t.length?(this.times=t.slice(0,o),this.values=e.slice(0,o*n)):(this.times=t,this.values=e),this}clone(){let t=this.times.slice(),e=this.values.slice(),n=this.constructor,s=new n(this.name,t,e);return s.createInterpolant=this.createInterpolant,s}};_n.prototype.TimeBufferType=Float32Array;_n.prototype.ValueBufferType=Float32Array;_n.prototype.DefaultInterpolation=Oa;var yi=class extends _n{constructor(t,e,n){super(t,e,n)}};yi.prototype.ValueTypeName="bool";yi.prototype.ValueBufferType=Array;yi.prototype.DefaultInterpolation=br;yi.prototype.InterpolantFactoryMethodLinear=void 0;yi.prototype.InterpolantFactoryMethodSmooth=void 0;var xl=class extends _n{};xl.prototype.ValueTypeName="color";var yl=class extends _n{};yl.prototype.ValueTypeName="number";var _l=class extends Ki{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t,e,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=(n-e)/(s-e),c=t*a;for(let f=c+a;c!==f;c+=4)We.slerpFlat(r,0,o,c-a,o,c,l);return r}},Xr=class extends _n{InterpolantFactoryMethodLinear(t){return new _l(this.times,this.values,this.getValueSize(),t)}};Xr.prototype.ValueTypeName="quaternion";Xr.prototype.InterpolantFactoryMethodSmooth=void 0;var _i=class extends _n{constructor(t,e,n){super(t,e,n)}};_i.prototype.ValueTypeName="string";_i.prototype.ValueBufferType=Array;_i.prototype.DefaultInterpolation=br;_i.prototype.InterpolantFactoryMethodLinear=void 0;_i.prototype.InterpolantFactoryMethodSmooth=void 0;var vl=class extends _n{};vl.prototype.ValueTypeName="vector";var dh={enabled:!1,files:{},add:function(i,t){this.enabled!==!1&&(this.files[i]=t)},get:function(i){if(this.enabled!==!1)return this.files[i]},remove:function(i){delete this.files[i]},clear:function(){this.files={}}},Ml=class{constructor(t,e,n){let s=this,r=!1,o=0,a=0,l,c=[];this.onStart=void 0,this.onLoad=t,this.onProgress=e,this.onError=n,this.itemStart=function(f){a++,r===!1&&s.onStart!==void 0&&s.onStart(f,o,a),r=!0},this.itemEnd=function(f){o++,s.onProgress!==void 0&&s.onProgress(f,o,a),o===a&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(f){s.onError!==void 0&&s.onError(f)},this.resolveURL=function(f){return l?l(f):f},this.setURLModifier=function(f){return l=f,this},this.addHandler=function(f,h){return c.push(f,h),this},this.removeHandler=function(f){let h=c.indexOf(f);return h!==-1&&c.splice(h,2),this},this.getHandler=function(f){for(let h=0,d=c.length;h<d;h+=2){let p=c[h],g=c[h+1];if(p.global&&(p.lastIndex=0),p.test(f))return g}return null}}},zg=new Ml,Rs=class{constructor(t){this.manager=t!==void 0?t:zg,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(t,e){let n=this;return new Promise(function(s,r){n.load(t,s,e,r)})}parse(){}setCrossOrigin(t){return this.crossOrigin=t,this}setWithCredentials(t){return this.withCredentials=t,this}setPath(t){return this.path=t,this}setResourcePath(t){return this.resourcePath=t,this}setRequestHeader(t){return this.requestHeader=t,this}};Rs.DEFAULT_MATERIAL_NAME="__DEFAULT";var El=class extends Rs{constructor(t){super(t)}load(t,e,n,s){this.path!==void 0&&(t=this.path+t),t=this.manager.resolveURL(t);let r=this,o=dh.get(t);if(o!==void 0)return r.manager.itemStart(t),setTimeout(function(){e&&e(o),r.manager.itemEnd(t)},0),o;let a=gs("img");function l(){f(),dh.add(t,this),e&&e(this),r.manager.itemEnd(t)}function c(h){f(),s&&s(h),r.manager.itemError(t),r.manager.itemEnd(t)}function f(){a.removeEventListener("load",l,!1),a.removeEventListener("error",c,!1)}return a.addEventListener("load",l,!1),a.addEventListener("error",c,!1),t.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(a.crossOrigin=this.crossOrigin),r.manager.itemStart(t),a.src=t,a}};var qr=class extends Rs{constructor(t){super(t)}load(t,e,n,s){let r=new Ve,o=new El(this.manager);return o.setCrossOrigin(this.crossOrigin),o.setPath(this.path),o.load(t,function(a){r.image=a,r.needsUpdate=!0,e!==void 0&&e(r)},n,s),r}},Cs=class extends Re{constructor(t,e=1){super(),this.isLight=!0,this.type="Light",this.color=new Gt(t),this.intensity=e}dispose(){}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){let e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,this.groundColor!==void 0&&(e.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(e.object.distance=this.distance),this.angle!==void 0&&(e.object.angle=this.angle),this.decay!==void 0&&(e.object.decay=this.decay),this.penumbra!==void 0&&(e.object.penumbra=this.penumbra),this.shadow!==void 0&&(e.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(e.object.target=this.target.uuid),e}},Yr=class extends Cs{constructor(t,e,n){super(t,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Re.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Gt(e)}copy(t,e){return super.copy(t,e),this.groundColor.copy(t.groundColor),this}},Qo=new Xt,ph=new U,mh=new U,Sl=class{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Mt(512,512),this.map=null,this.mapPass=null,this.matrix=new Xt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new gi,this._frameExtents=new Mt(1,1),this._viewportCount=1,this._viewports=[new Me(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(t){let e=this.camera,n=this.matrix;ph.setFromMatrixPosition(t.matrixWorld),e.position.copy(ph),mh.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(mh),e.updateMatrixWorld(),Qo.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Qo),n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(Qo)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.mapSize.copy(t.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){let t={};return this.intensity!==1&&(t.intensity=this.intensity),this.bias!==0&&(t.bias=this.bias),this.normalBias!==0&&(t.normalBias=this.normalBias),this.radius!==1&&(t.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(t.mapSize=this.mapSize.toArray()),t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}};var bl=class extends Sl{constructor(){super(new $i(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Ps=class extends Cs{constructor(t,e){super(t,e),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Re.DEFAULT_UP),this.updateMatrix(),this.target=new Re,this.shadow=new bl}dispose(){this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}},Zr=class extends Cs{constructor(t,e){super(t,e),this.isAmbientLight=!0,this.type="AmbientLight"}};var $r=class{constructor(t=!0){this.autoStart=t,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=gh(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let t=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){let e=gh();t=(e-this.oldTime)/1e3,this.oldTime=e,this.elapsedTime+=t}return t}};function gh(){return performance.now()}var Hl="\\[\\]\\.:\\/",Og=new RegExp("["+Hl+"]","g"),Bl="[^"+Hl+"]",Hg="[^"+Hl.replace("\\.","")+"]",Bg=/((?:WC+[\/:])*)/.source.replace("WC",Bl),kg=/(WCOD+)?/.source.replace("WCOD",Hg),Gg=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Bl),Vg=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Bl),Wg=new RegExp("^"+Bg+kg+Gg+Vg+"$"),Xg=["material","materials","bones","map"],wl=class{constructor(t,e,n){let s=n||ge.parseTrackName(e);this._targetGroup=t,this._bindings=t.subscribe_(e,s)}getValue(t,e){this.bind();let n=this._targetGroup.nCachedObjects_,s=this._bindings[n];s!==void 0&&s.getValue(t,e)}setValue(t,e){let n=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=n.length;s!==r;++s)n[s].setValue(t,e)}bind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,n=t.length;e!==n;++e)t[e].bind()}unbind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,n=t.length;e!==n;++e)t[e].unbind()}},ge=class i{constructor(t,e,n){this.path=e,this.parsedPath=n||i.parseTrackName(e),this.node=i.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,e,n){return t&&t.isAnimationObjectGroup?new i.Composite(t,e,n):new i(t,e,n)}static sanitizeNodeName(t){return t.replace(/\s/g,"_").replace(Og,"")}static parseTrackName(t){let e=Wg.exec(t);if(e===null)throw new Error("PropertyBinding: Cannot parse trackName: "+t);let n={nodeName:e[2],objectName:e[3],objectIndex:e[4],propertyName:e[5],propertyIndex:e[6]},s=n.nodeName&&n.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=n.nodeName.substring(s+1);Xg.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,s),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+t);return n}static findNode(t,e){if(e===void 0||e===""||e==="."||e===-1||e===t.name||e===t.uuid)return t;if(t.skeleton){let n=t.skeleton.getBoneByName(e);if(n!==void 0)return n}if(t.children){let n=function(r){for(let o=0;o<r.length;o++){let a=r[o];if(a.name===e||a.uuid===e)return a;let l=n(a.children);if(l)return l}return null},s=n(t.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(t,e){t[e]=this.targetObject[this.propertyName]}_getValue_array(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)t[e++]=n[s]}_getValue_arrayElement(t,e){t[e]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(t,e){this.resolvedProperty.toArray(t,e)}_setValue_direct(t,e){this.targetObject[this.propertyName]=t[e]}_setValue_direct_setNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++]}_setValue_array_setNeedsUpdate(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(t,e){this.resolvedProperty[this.propertyIndex]=t[e]}_setValue_arrayElement_setNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(t,e){this.resolvedProperty.fromArray(t,e)}_setValue_fromArray_setNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(t,e){this.bind(),this.getValue(t,e)}_setValue_unbound(t,e){this.bind(),this.setValue(t,e)}bind(){let t=this.node,e=this.parsedPath,n=e.objectName,s=e.propertyName,r=e.propertyIndex;if(t||(t=i.findNode(this.rootNode,e.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=e.objectIndex;switch(n){case"materials":if(!t.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}t=t.material.materials;break;case"bones":if(!t.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}t=t.skeleton.bones;for(let f=0;f<t.length;f++)if(t[f].name===c){c=f;break}break;case"map":if("map"in t){t=t.map;break}if(!t.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}t=t.material.map;break;default:if(t[n]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}t=t[n]}if(c!==void 0){if(t[c]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,t);return}t=t[c]}}let o=t[s];if(o===void 0){let c=e.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+c+"."+s+" but it wasn't found.",t);return}let a=this.Versioning.None;this.targetObject=t,t.needsUpdate!==void 0?a=this.Versioning.NeedsUpdate:t.matrixWorldNeedsUpdate!==void 0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!t.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!t.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}t.morphTargetDictionary[r]!==void 0&&(r=t.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=r}else o.fromArray!==void 0&&o.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(l=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=s;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};ge.Composite=wl;ge.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};ge.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};ge.prototype.GetterByBindingType=[ge.prototype._getValue_direct,ge.prototype._getValue_array,ge.prototype._getValue_arrayElement,ge.prototype._getValue_toArray];ge.prototype.SetterByBindingTypeAndVersioning=[[ge.prototype._setValue_direct,ge.prototype._setValue_direct_setNeedsUpdate,ge.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[ge.prototype._setValue_array,ge.prototype._setValue_array_setNeedsUpdate,ge.prototype._setValue_array_setMatrixWorldNeedsUpdate],[ge.prototype._setValue_arrayElement,ge.prototype._setValue_arrayElement_setNeedsUpdate,ge.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[ge.prototype._setValue_fromArray,ge.prototype._setValue_fromArray_setNeedsUpdate,ge.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var Vx=new Float32Array(1);var xh=new Xt,Jr=class{constructor(t,e,n=0,s=1/0){this.ray=new xs(t,e),this.near=n,this.far=s,this.camera=null,this.layers=new ys,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(t,e){this.ray.set(t,e)}setFromCamera(t,e){e.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(t.x,t.y,.5).unproject(e).sub(this.ray.origin).normalize(),this.camera=e):e.isOrthographicCamera?(this.ray.origin.set(t.x,t.y,(e.near+e.far)/(e.near-e.far)).unproject(e),this.ray.direction.set(0,0,-1).transformDirection(e.matrixWorld),this.camera=e):console.error("THREE.Raycaster: Unsupported camera type: "+e.type)}setFromXRController(t){return xh.identity().extractRotation(t.matrixWorld),this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(xh),this}intersectObject(t,e=!0,n=[]){return Tl(t,this,n,e),n.sort(yh),n}intersectObjects(t,e=!0,n=[]){for(let s=0,r=t.length;s<r;s++)Tl(t[s],this,n,e);return n.sort(yh),n}};function yh(i,t){return i.distance-t.distance}function Tl(i,t,e,n){let s=!0;if(i.layers.test(t.layers)&&i.raycast(t,e)===!1&&(s=!1),s===!0&&n===!0){let r=i.children;for(let o=0,a=r.length;o<a;o++)Tl(r[o],t,e,!0)}}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Al}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Al);var no=class{constructor(t,e,n,s,r=.2){this.minX=t,this.minZ=e,this.cell=r,this.cols=Math.ceil((n-t)/r),this.rows=Math.ceil((s-e)/r),this.blocked=new Uint8Array(this.cols*this.rows)}idx(t,e){return e*this.cols+t}toCell(t,e){return{c:Math.max(0,Math.min(this.cols-1,Math.floor((t-this.minX)/this.cell))),r:Math.max(0,Math.min(this.rows-1,Math.floor((e-this.minZ)/this.cell)))}}center(t,e){return{x:this.minX+(t+.5)*this.cell,z:this.minZ+(e+.5)*this.cell}}blockRect(t,e,n,s,r=.22){let o=this.toCell(Math.min(t,n)-r,Math.min(e,s)-r),a=this.toCell(Math.max(t,n)+r,Math.max(e,s)+r);for(let l=o.r;l<=a.r;l++)for(let c=o.c;c<=a.c;c++)this.blocked[this.idx(c,l)]=1}isFree(t,e){let{c:n,r:s}=this.toCell(t,e);return!this.blocked[this.idx(n,s)]}nearestFree(t,e){if(!this.blocked[this.idx(t,e)])return{c:t,r:e};for(let n=1;n<12;n++)for(let s=-n;s<=n;s++)for(let r=-n;r<=n;r++){let o=t+r,a=e+s;if(!(o<0||a<0||o>=this.cols||a>=this.rows)&&!this.blocked[this.idx(o,a)])return{c:o,r:a}}return{c:t,r:e}}lineFree(t,e){let n=Math.hypot(e.x-t.x,e.z-t.z),s=Math.max(1,Math.ceil(n/(this.cell*.5)));for(let r=1;r<s;r++){let o=r/s;if(!this.isFree(t.x+(e.x-t.x)*o,t.z+(e.z-t.z)*o))return!1}return!0}find(t,e){let n=this.toCell(t.x,t.z),s=this.nearestFree(...Object.values(this.toCell(e.x,e.z))),r=this.idx(n.c,n.r),o=this.idx(s.c,s.r);if(r===o)return[{x:e.x,z:e.z}];let a=this.cols*this.rows,l=new Float32Array(a).fill(1/0),c=new Int32Array(a).fill(-1),f=new Uint8Array(a),h=[],d=(S,w)=>{h.push([w,S]);let P=h.length-1;for(;P>0;){let D=P-1>>1;if(h[D][0]<=h[P][0])break;[h[D],h[P]]=[h[P],h[D]],P=D}},p=()=>{let S=h[0],w=h.pop();if(h.length){h[0]=w;let P=0;for(;;){let D=2*P+1,x=D+1,E=P;if(D<h.length&&h[D][0]<h[E][0]&&(E=D),x<h.length&&h[x][0]<h[E][0]&&(E=x),E===P)break;[h[E],h[P]]=[h[P],h[E]],P=E}}return S[1]},g=S=>{let w=Math.abs(S%this.cols-s.c),P=Math.abs(Math.floor(S/this.cols)-s.r);return w+P+(Math.SQRT2-2)*Math.min(w,P)};l[r]=0,d(r,g(r));let _=[[1,0,1],[-1,0,1],[0,1,1],[0,-1,1],[1,1,Math.SQRT2],[1,-1,Math.SQRT2],[-1,1,Math.SQRT2],[-1,-1,Math.SQRT2]],m=!1;for(;h.length;){let S=p();if(f[S])continue;if(S===o){m=!0;break}f[S]=1;let w=S%this.cols,P=Math.floor(S/this.cols);for(let[D,x,E]of _){let N=w+D,z=P+x;if(N<0||z<0||N>=this.cols||z>=this.rows)continue;let I=this.idx(N,z);if(this.blocked[I]&&I!==o||D&&x&&(this.blocked[this.idx(w+D,P)]||this.blocked[this.idx(w,P+x)]))continue;let V=l[S]+E;V<l[I]&&(l[I]=V,c[I]=S,d(I,V+g(I)))}}if(!m)return[{x:e.x,z:e.z}];let u=[];for(let S=o;S!==-1&&S!==r;S=c[S])u.push(S);u.reverse();let y=u.map(S=>this.center(S%this.cols,Math.floor(S/this.cols)));y[y.length-1]={x:e.x,z:e.z};let v=[],M={x:t.x,z:t.z},A=0;for(;A<y.length;){let S=A;for(let w=y.length-1;w>A;w--)if(this.lineFree(M,y[w])){S=w;break}v.push(y[S]),M=y[S],A=S+1}return v}};var Bn=(i,t=.85)=>new Zt({color:i,roughness:t}),kl=[{x:.4,z:.4},{x:-1.6,z:.6},{x:1.9,z:0},{x:-5,z:2.6},{x:5.4,z:-3.3},{x:-2.4,z:3.9},{x:2.6,z:3.8},{x:-5.6,z:-2.8},{x:.2,z:-2.2},{x:4.4,z:-3.7},{x:6,z:12.6},{x:16.4,z:12},{x:22,z:6.2}],io=class{constructor(t,e){this.nav=e,this.root=new Yt,this.body=new Yt,this.root.add(this.body);let n=Bn("#e39a4e"),s=Bn("#b86e2c"),r=Bn("#fbf3e6"),o=Bn("#f2a3a3"),a=(h,d,p,g,_,m)=>{let u=new ut(d,p);return u.position.set(g,_,m),u.castShadow=!0,h.add(u),u},l=a(this.body,new Le(.11,.26,6,12),n,0,.2,0);l.rotation.x=Math.PI/2,a(this.body,new wt(.075,10,8),r,0,.17,.12).scale.set(1,1,.7);for(let h of[-.06,.04])a(this.body,new Kt(.2,.03,.05),s,0,.3,h).rotation.x=.1;this.head=new Yt,this.head.position.set(0,.32,.2),this.body.add(this.head),a(this.head,new wt(.1,14,12),n,0,0,0).scale.set(1.05,.95,.95),a(this.head,new wt(.05,10,8),r,0,-.03,.07).scale.set(1.2,.8,.7);for(let h of[-1,1]){let d=a(this.head,new Be(.035,.07,4),n,h*.055,.09,-.01);d.rotation.z=-h*.25,a(this.head,new wt(.012,6,6),Bn("#1d1a17",.3),h*.038,.02,.088)}a(this.head,new wt(.01,6,6),o,0,-.01,.1),this.legs=[];for(let[h,d]of[[-.06,.12],[.06,.12],[-.06,-.12],[.06,-.12]]){let p=new Yt;p.position.set(h,.15,d),this.body.add(p),a(p,new J(.025,.022,.15,6),n,0,-.075,0),a(p,new wt(.026,6,6),r,0,-.15,.01),this.legs.push(p)}this.tail=[];let c=this.body,f=[0,.24,-.24];for(let h=0;h<5;h++){let d=new Yt;d.position.set(...f),c.add(d),a(d,new J(.022-h*.002,.025-h*.002,.08,6),h===4?s:n,0,.04,0),this.tail.push(d),c=d,f=[0,.08,0]}this.tail[0].rotation.x=-.9,this.pos={x:1,z:.8},this.facing=0,this.path=[],this.mode="sit",this.until=performance.now()/1e3+4,this.phase=0,this.root.position.set(this.pos.x,0,this.pos.z),t.add(this.root)}pet(){this.path=[],this.mode="happy",this.until=performance.now()/1e3+2.6}headWorld(t){return this.head.updateWorldMatrix(!0,!1),t.set(0,.2,0).applyMatrix4(this.head.matrixWorld)}props(){if(this.bowl)return;let t=this.root.parent;this.bowl=new Yt;let e=new ut(new J(.13,.1,.06,16,1,!0),Bn("#e1262d",.5));e.material.side=fe,e.position.y=.03;let n=new ut(new J(.115,.115,.02,16),Bn("#b8742f",.9));n.position.y=.045,this.bowl.add(e,n),this.food=n,this.bowl.visible=!1,t.add(this.bowl),this.yarn=new Yt;let s=new ut(new wt(.07,12,10),Bn("#ff7aa8",.9));s.position.y=.07;let r=new ut(new ye(.07,.008,6,20),Bn("#e84f87",.9));r.position.y=.07,r.rotation.y=.6,this.yarn.add(s,r),this.yarn.visible=!1,t.add(this.yarn)}command(t,e=0){if(!t||this.cmd&&t.seq<=this.cmd.seq&&t.at<=this.cmd.at)return;this.remote=!0;let n=this.cmd&&this.cmd.seq!==t.seq&&t.act;this.cmd=t,this.skew=e,this.props(),this.bowl&&(this.bowl.visible=!1,this.yarn.visible=!1),this.goTo(t.target),this.mode="walk",this.followId=t.mode==="follow"?t.by:null,n&&t.act==="call"&&this.onFx&&this.onFx("\u{1F43E}"),t.act==="feed"&&(this.bowl.position.set(this.dest.x+.3,0,this.dest.z),this.food.scale.set(1,1,1),this.bowl.visible=!0)}goTo(t){let e=this.nav.toCell(t.x,t.z),n=this.nav.nearestFree(e.c,e.r);this.dest=this.nav.center(n.c,n.r),this.path=this.nav.find(this.pos,this.dest)}pickTarget(){for(let t=0;t<8;t++){let e=kl[Math.floor(Math.random()*kl.length)];if(Math.hypot(e.x-this.pos.x,e.z-this.pos.z)>1.5)return e}return kl[0]}arrive(t){let e=this.cmd,s=!e||!e.until||Date.now()+(this.skew||0)>e.until+6e4?0:Math.min(12,(e.until-e.at)/1e3),r=e?e.then:"sit";r==="pet"&&s>0?(this.mode="happy",this.until=t+s,this.onFx&&this.onFx("\u{1F495}")):r==="feed"&&s>0?(this.mode="eat",this.until=t+s,this.facing=Math.atan2(this.bowl.position.x-this.pos.x,this.bowl.position.z-this.pos.z),this.onFx&&this.onFx("\u{1F60B}")):r==="play"&&s>0?(this.mode="play",this.until=t+s,this.playC={x:this.pos.x,z:this.pos.z},this.yarn.visible=!0,this.onFx&&this.onFx("\u{1F9F6}")):(this.mode=r==="loaf"?"loaf":"sit",this.until=t+1e6,this.bowl&&(this.bowl.visible=!1,this.yarn.visible=!1))}update(t,e,n){this.remote?this.remoteTick(t,e,n):(this.mode==="happy"&&e>this.until&&(this.mode="sit",this.until=e+3+Math.random()*5),this.mode!=="walk"&&this.mode!=="happy"&&e>this.until&&(this.path=this.nav.find(this.pos,this.pickTarget()),this.mode="walk"));let s=!1;if(this.mode==="walk"){let c=this.path[0];if(c){let f=this.followId||this.cmd&&this.cmd.act?1.5:.75,h=c.x-this.pos.x,d=c.z-this.pos.z,p=Math.hypot(h,d),g=f*t;p<=g?(this.pos.x=c.x,this.pos.z=c.z,this.path.shift()):(this.pos.x+=h/p*g,this.pos.z+=d/p*g),this.turn(Math.atan2(h,d),t),s=!0}else if(this.remote)this.arrive(e);else{let f=Math.random();this.mode=f<.35?"loaf":"sit",this.until=e+5+Math.random()*12}}if(this.mode==="play"){let c=e*2.2,f=this.playC;this.yarn.position.set(f.x+Math.cos(c)*.45,0,f.z+Math.sin(c)*.45),this.yarn.rotation.z=-c*3;let h=this.yarn.position.x-this.pos.x,d=this.yarn.position.z-this.pos.z,p=Math.hypot(h,d);p>.22&&(this.pos.x+=h/p*Math.min(p-.2,1.4*t),this.pos.z+=d/p*Math.min(p-.2,1.4*t),s=!0),this.turn(Math.atan2(h,d),t)}this.mode==="eat"&&this.food&&(this.food.scale.y=Math.max(.15,this.food.scale.y-t*.12)),this.phase+=t*(s?11:0);let r=1-Math.exp(-t*8);this.legs.forEach((c,f)=>{let h=Math.sin(this.phase+(f%2?Math.PI:0)+(f>1?Math.PI/2:0));c.rotation.x+=((s?h*.6:this.mode==="loaf"?-1.3:0)-c.rotation.x)*r});let o=this.mode==="sit"?-.45:this.mode==="eat"?.18:0,a=this.mode==="loaf"?-.1:this.mode==="sit"?-.03:this.mode==="eat"?-.02:Math.abs(Math.sin(this.phase))*.01;this.body.rotation.x+=(o-this.body.rotation.x)*r,this.body.position.y+=(a-this.body.position.y)*r,this.mode==="sit"?this.body.position.z+=(-.08-this.body.position.z)*r:this.body.position.z+=(0-this.body.position.z)*r,this.mode==="happy"&&(this.body.position.y=Math.abs(Math.sin(e*9))*.12),this.mode==="play"&&(this.body.position.y=Math.max(0,Math.sin(e*7))*.1),this.head.rotation.x=this.mode==="sit"?.45:this.mode==="happy"?-.3:this.mode==="eat"?.75+Math.sin(e*10)*.08:0,this.head.rotation.y=s||this.mode==="eat"?0:Math.sin(e*.7)*.6;let l=this.mode==="happy"||this.mode==="play";this.tail.forEach((c,f)=>{f&&(c.rotation.z=Math.sin(e*(l?14:s?6:2.2)+f*.7)*(.18+f*.03)),c.rotation.x=f?l?.05:.25:this.mode==="loaf"?-1.45:l?-.15:-.9}),this.root.position.set(this.pos.x,0,this.pos.z),this.root.rotation.y=this.facing}turn(t,e){let n=((t-this.facing+Math.PI)%(2*Math.PI)+2*Math.PI)%(2*Math.PI)-Math.PI;this.facing+=n*Math.min(1,e*8)}remoteTick(t,e,n){let s=this.cmd;if(!s)return;let r=this.followId&&s.until&&Date.now()+(this.skew||0)>s.until;if(this.followId&&!r&&n&&n.posOf){let o=n.posOf(this.followId);o&&(!this.nextFollow||e>this.nextFollow)&&(this.nextFollow=e+.7,Math.hypot(o.x-this.pos.x,o.z-this.pos.z)>1.1&&(this.goTo({x:o.x+.45,z:o.z+.35}),this.mode="walk"))}(r||["happy","eat","play"].includes(this.mode)&&e>this.until)&&(this.followId=null,this.bowl&&(this.bowl.visible=!1,this.yarn.visible=!1),this.mode="sit",this.until=e+1e6)}};function Tn(i,t=!1){let e=i[0].index!==null,n=new Set(Object.keys(i[0].attributes)),s=new Set(Object.keys(i[0].morphAttributes)),r={},o={},a=i[0].morphTargetsRelative,l=new Ee,c=0;for(let f=0;f<i.length;++f){let h=i[f],d=0;if(e!==(h.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+f+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(let p in h.attributes){if(!n.has(p))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+f+'. All geometries must have compatible attributes; make sure "'+p+'" attribute exists among all geometries, or in none of them.'),null;r[p]===void 0&&(r[p]=[]),r[p].push(h.attributes[p]),d++}if(d!==n.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+f+". Make sure all geometries have the same number of attributes."),null;if(a!==h.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+f+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(let p in h.morphAttributes){if(!s.has(p))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+f+".  .morphAttributes must be consistent throughout all geometries."),null;o[p]===void 0&&(o[p]=[]),o[p].push(h.morphAttributes[p])}if(t){let p;if(e)p=h.index.count;else if(h.attributes.position!==void 0)p=h.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+f+". The geometry must have either an index or a position attribute"),null;l.addGroup(c,p,f),c+=p}}if(e){let f=0,h=[];for(let d=0;d<i.length;++d){let p=i[d].index;for(let g=0;g<p.count;++g)h.push(p.getX(g)+f);f+=i[d].attributes.position.count}l.setIndex(h)}for(let f in r){let h=Wh(r[f]);if(!h)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+f+" attribute."),null;l.setAttribute(f,h)}for(let f in o){let h=o[f][0].length;if(h===0)break;l.morphAttributes=l.morphAttributes||{},l.morphAttributes[f]=[];for(let d=0;d<h;++d){let p=[];for(let _=0;_<o[f].length;++_)p.push(o[f][_][d]);let g=Wh(p);if(!g)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+f+" morphAttribute."),null;l.morphAttributes[f].push(g)}}return l}function Wh(i){let t,e,n,s=-1,r=0;for(let c=0;c<i.length;++c){let f=i[c];if(t===void 0&&(t=f.array.constructor),t!==f.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(e===void 0&&(e=f.itemSize),e!==f.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(n===void 0&&(n=f.normalized),n!==f.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(s===-1&&(s=f.gpuType),s!==f.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;r+=f.count*e}let o=new t(r),a=new Ae(o,e,n),l=0;for(let c=0;c<i.length;++c){let f=i[c];if(f.isInterleavedBufferAttribute){let h=l/e;for(let d=0,p=f.count;d<p;d++)for(let g=0;g<e;g++){let _=f.getComponent(d,g);a.setComponent(d+h,g,_)}}else o.set(f.array,l);l+=f.count*e}return s!==void 0&&(a.gpuType=s),a}var Xh=["#f1c9a5","#e2ae84","#f6d7bd","#c98e62","#ebbf98","#d9a074"];var qh=["short","long","spiky","bun","bob","short"],qg=(i,t,e)=>i+(t-i)*e,Yh={},Bt=(i,t)=>Yh[i]||(Yh[i]=t()),An=new Map;function me(i,t=.75){let e=String(i).toLowerCase()+"|"+t,n=An.get(e);return n||(n=new Zt({color:i,roughness:t,metalness:0}),An.set(e,n)),n}var so=null;function Yg(){if(so)return so;let i=document.createElement("canvas");i.width=32,i.height=256;let t=i.getContext("2d"),e=t.createLinearGradient(0,0,0,256);e.addColorStop(0,"#f3e2ae"),e.addColorStop(1,"#e2c983"),t.fillStyle=e,t.fillRect(0,0,32,256),t.fillStyle="rgba(150,110,50,.45)";for(let s=1;s<16;s++)t.fillRect(0,Math.round(s*256/16),32,2);let n=new qe(i);return n.colorSpace=xe,so=new Zt({map:n,roughness:.85,side:fe}),so}var Zg=()=>An.get("cheek")||An.set("cheek",new Zt({color:"#ff8f8f",transparent:!0,opacity:.35,roughness:1})).get("cheek"),Ls={robe:"#ec8a1c",under:"#d06a17",sash:"#a8401a",shoes:"#5b3a24"},ro=null;function $g(){if(ro)return ro;let i=document.createElement("canvas");i.width=256,i.height=128;let t=i.getContext("2d");t.fillStyle="#a8401a",t.fillRect(0,0,256,128),t.strokeStyle="#f2c14e",t.lineWidth=8,t.strokeRect(8,8,240,112),t.fillStyle="#ffd56a",t.font='900 72px "Segoe UI", "Noto Sans", Arial, sans-serif',t.textAlign="center",t.textBaseline="middle",t.fillText("SIMI",128,68);let e=new qe(i);return e.colorSpace=xe,ro=new Zt({map:e,roughness:.8}),ro}var Ds=class{constructor(t,e){this.index=e,this.root=new Yt,this.body=new Yt,this.root.add(this.body),this.joint={},this.pose={hip:0,foot:0,legL:0,legR:0,legLz:0,legRz:0,armLx:0,armRx:0,armLz:.08,armRz:-.08,headY:0,headX:0,lean:0,lift:0,turn:0,wig:0},this.phase=Math.random()*10,this.blinkAt=performance.now()/1e3+1+Math.random()*3,this.talkUntil=0,this.action=null,this.dance=null,this.actionUntil=0,this.build(t)}build(t){this.agent=t,t={...t},t.outfit==="kasaya"&&Object.assign(t,{shirt:Ls.robe,pants:Ls.under,shoes:Ls.shoes});let e=t.skin||Xh[this.index%Xh.length],n=t.hairStyle||qh[this.index%qh.length];for(this.body.traverse(u=>{u.isMesh&&u.geometry.userData.own&&u.geometry.dispose()});this.body.children.length;)this.body.remove(this.body.children[0]);let s={shirt:me(t.shirt||"#3b6fb6",.8),skin:me(e,.6),hair:me(t.hair||"#2b1d14",.9),pants:me(t.pants||"#2f3342",.85),shoe:me(t.shoes||"#1d1d24",.6),dark:me("#1f1a17",.4),white:me("#ffffff",.3),mouth:me("#7a3434",.6),cheek:Zg()};this.mats=s;let r=(u,y,v,M=0,A=0,S=0)=>{let w=new ut(y,v);return w.position.set(M,A,S),w.castShadow=!0,u.add(w),w},o=.42;this.shoes=[];let a=Bt("leg",()=>new Le(.078,.25,3,8)),l=Bt("shoe",()=>new Kt(.14,.08,.22));for(let u of[-1,1]){let y=new Yt;y.position.set(u*.095,o,0),r(y,a,s.pants,0,-.2,0),this.shoes.push(r(y,l,s.shoe,0,-.375,.045)),this.body.add(y),this.joint[u<0?"legL":"legR"]=y}let c=r(this.body,Bt("torso",()=>new Le(.19,.2,4,12)),s.shirt,0,.68,0);c.scale.set(1,1,.78),this.torso=c,r(this.body,Bt("belt",()=>new J(.185,.185,.05,12)),s.pants,0,.47,0).scale.set(1,1,.8);let f=Bt("arm",()=>new Le(.062,.22,3,8)),h=Bt("hand",()=>new wt(.068,8,6));for(let u of[-1,1]){let y=new Yt;y.position.set(u*.255,.86,0),r(y,f,s.shirt,0,-.15,0),r(y,h,s.skin,0,-.35,0),this.body.add(y),this.joint[u<0?"armL":"armR"]=y}this.cup=r(this.joint.armR,Bt("cup",()=>new J(.05,.04,.11,12)),me("#e9f3fb",.3),0,-.4,.05),this.cup.visible=!1,this.stick=r(this.joint.armR,Bt("stick",()=>{let u=new J(.012,.022,1.35,8);return u.translate(0,.5,0),u}),me("#c99a5b",.45),0,-.36,.02),this.stick.rotation.x=1.35,this.stick.visible=!1,this.paper=r(this.joint.armL,Bt("paper",()=>new Kt(.2,.02,.26)),me("#fffdf5",.9),0,-.4,.08),this.paper.visible=!1;let d=new Yt;d.position.set(0,1,0),this.body.add(d),this.joint.head=d,r(d,Bt("neck",()=>new J(.07,.08,.1,10)),s.skin,0,-.03,0),r(d,Bt("head",()=>new wt(.25,20,14)),s.skin,0,.19,0);let p=Bt("eye",()=>new wt(.034,10,8)),g=Bt("hl",()=>new wt(.011,6,6));this.eyes=[];for(let u of[-1,1]){let y=r(d,p,s.dark,u*.088,.21,.222);y.scale.set(1,1.15,.6),r(y,g,s.white,.012,.014,.03).castShadow=!1,this.eyes.push(y);let v=r(d,Bt("cheek",()=>new wt(.045,10,8)),s.cheek,u*.15,.13,.19);v.scale.set(1,.6,.3),v.castShadow=!1}if(this.mouth=r(d,Bt("mouth",()=>new Kt(.075,.02,.02)),s.mouth,0,.1,.238),n==="bald"){let u=r(d,Bt("shine",()=>new wt(.06,10,8)),An.get("shine")||An.set("shine",new ne({color:"#ffffff",transparent:!0,opacity:.35,depthWrite:!1})).get("shine"),-.07,.42,.1);u.scale.set(1.3,.35,.8),u.castShadow=!1}else{let u=r(d,Bt("cap",()=>new wt(.268,20,10,0,Math.PI*2,0,Math.PI*.52)),s.hair,0,.2,-.005);if(u.rotation.x=-.32,n==="buzz"?u.scale.set(.97,.9,.97):r(d,Bt("bang",()=>new wt(.2,12,8)),s.hair,0,.36,.12).scale.set(1.15,.38,.62),n==="curly"){let y=Bt("curl",()=>new wt(.085,8,6));for(let v=0;v<14;v++){let M=v/14*Math.PI*2,A=v%2?.36:.28;r(d,y,s.hair,Math.sin(M)*.24,A+Math.cos(M*2)*.03,Math.cos(M)*.22-.03)}r(d,y,s.hair,0,.47,0),r(d,y,s.hair,.1,.45,-.08),r(d,y,s.hair,-.1,.45,-.08)}else if(n==="ponytail"){r(d,Bt("tie2",()=>new wt(.06,10,8)),me(t.accent||"#e1262d",.5),0,.33,-.25);let y=r(d,Bt("tail",()=>new Le(.075,.26,4,10)),s.hair,0,.16,-.32);y.rotation.x=.35}else if(n==="long"){r(d,Bt("long",()=>new Le(.2,.28,6,12)),s.hair,0,.05,-.12).scale.set(1.15,1,.55);for(let v of[-1,1])r(d,Bt("lock",()=>new Le(.06,.24,4,8)),s.hair,v*.22,.07,.02)}else if(n==="bun"&&t.accessory!=="nonla")r(d,Bt("bun",()=>new wt(.11,14,10)),s.hair,0,.45,-.13);else if(n==="spiky"&&t.accessory!=="nonla"){let y=Bt("spike",()=>new Be(.07,.17,6));[[-.12,.44,.02,.4],[0,.48,0,0],[.12,.44,.02,-.4],[-.06,.45,-.12,.2],[.07,.45,-.12,-.2]].forEach(([v,M,A,S])=>{let w=r(d,y,s.hair,v,M,A);w.rotation.z=S,w.rotation.x=-.25})}else if(n==="bob"){let y=r(d,Bt("bob",()=>new wt(.29,20,12,0,Math.PI*2,0,Math.PI*.62)),s.hair,0,.16,-.03);y.rotation.x=-.15}}let _=t.accessory||"none",m=me(t.accent||"#e1262d",.5);if(_==="cap"){let u=r(d,Bt("capTop",()=>new wt(.275,20,12,0,Math.PI*2,0,Math.PI*.5)),m,0,.24,-.01);u.rotation.x=-.18;let y=r(d,Bt("brim",()=>new J(.17,.17,.025,20,1,!1,-Math.PI/2,Math.PI)),m,0,.3,.2);y.rotation.x=.12}else if(_==="nonla"){let u=r(d,Bt("nonla",()=>new Be(.47,.33,32,1,!0)),Yg(),0,.545,-.01);u.rotation.x=-.12;let y=r(d,Bt("nonlaRim",()=>new ye(.47,.009,5,40)),me("#c9a45c",.7),0,.38,.01);y.rotation.x=Math.PI/2-.12;let v=r(d,Bt("nonlaStrap",()=>new ye(.235,.011,5,24,Math.PI)),m,0,.27,.05);v.rotation.set(-.55,0,Math.PI),v.castShadow=!1}else if(_==="headphones"){let u=r(d,Bt("band",()=>new ye(.28,.022,8,24,Math.PI)),me("#2b2b33",.4),0,.2,0);u.rotation.z=0;for(let y of[-1,1])r(d,Bt("cup2",()=>new J(.075,.075,.06,16)),m,y*.27,.18,0).rotation.z=Math.PI/2}else if(_==="bow"){for(let u of[-1,1]){let y=r(d,Bt("bowW",()=>new Be(.07,.13,4)),m,u*.07,.43,.06);y.rotation.z=u*Math.PI/2}r(d,Bt("bowK",()=>new wt(.035,8,6)),m,0,.43,.06)}else if(_==="crown")r(d,Bt("crown",()=>new J(.14,.15,.1,5,1,!0)),An.get("crown")||An.set("crown",new Zt({color:"#f5c518",roughness:.3,side:fe})).get("crown"),0,.5,-.02);else if(_==="headset"){let u=me("#23262f",.4);r(d,Bt("hsBand",()=>new ye(.275,.014,6,24,Math.PI)),u,0,.2,0),r(d,Bt("hsCup",()=>new J(.06,.06,.05,14)),m,-.27,.18,0).rotation.z=Math.PI/2,r(d,Bt("hsCup2",()=>new J(.035,.035,.03,10)),u,.265,.18,0).rotation.z=Math.PI/2,r(d,Bt("hsBoom",()=>new J(.009,.009,.22,6)),u,-.2,.12,.13).rotation.set(Math.PI/2,0,-.95),r(d,Bt("hsMic",()=>new wt(.022,8,6)),u,-.1,.09,.225)}if(t.outfit==="blazer"){r(this.body,Bt("vShirt",()=>new Kt(.13,.2,.02)),s.white,0,.77,.148),r(this.body,Bt("vTie",()=>new Kt(.04,.17,.012)),me(t.accent||"#f5c518",.5),0,.76,.16);for(let u of[-1,1]){let y=r(this.body,Bt("vLapel",()=>new Kt(.045,.24,.016)),me(t.lapel||"#0b3f86",.6),u*.075,.76,.155);y.rotation.z=u*.32}r(this.body,Bt("vBadge",()=>new Kt(.075,.032,.01)),me("#f5c518",.3),.12,.8,.14).rotation.y=.45}if(t.outfit==="kasaya"){let u=me(Ls.sash,.85);for(let S of[.152,-.152]){let w=r(this.body,Bt("ksSash",()=>new Kt(.11,.48,.02)),u,.02,.7,S);w.rotation.z=-.62}r(this.body,Bt("ksShoulder",()=>new wt(.085,12,8)),u,-.2,.9,0).scale.set(1,.6,1.2);let y=An.get("skirt")||An.set("skirt",new Zt({color:Ls.robe,roughness:.85,side:fe})).get("skirt");r(this.body,Bt("ksSkirt",()=>new J(.195,.25,.3,18,1,!0)),y,0,.32,0).scale.set(1,1,.85);let v=r(this.body,Bt("ksHem",()=>new ye(.25,.012,6,24)),u,0,.17,0);v.rotation.x=Math.PI/2,v.scale.set(1,.85,1);let M=r(this.body,Bt("ksBeads",()=>new ye(.2,.022,6,18)),me("#5b3418",.5),0,.9,.01);M.rotation.x=Math.PI/2-.35,M.scale.set(1,.8,1),r(this.body,Bt("ksBead",()=>new wt(.035,10,8)),me("#f2c14e",.3),0,.84,.17);let A=r(this.body,Bt("ksBack",()=>new ie(.22,.11)),$g(),0,.66,-.156);A.rotation.y=Math.PI,A.castShadow=!1}if(_==="glasses"&&!t.isReviewer&&(t={...t,isReviewer:!0}),_==="tie"&&!t.isManager&&(t={...t,isManager:!0}),t.isManager&&(r(this.body,Bt("tie",()=>new Kt(.06,.24,.02)),me("#b3362f",.5),0,.73,.155),r(this.body,Bt("knot",()=>new Kt(.075,.05,.03)),me("#8f2a24",.5),0,.86,.15)),t.isReviewer){let u=me("#2b2b33",.4),y=Bt("glass",()=>new ye(.062,.012,8,20));for(let v of[-1,1])r(d,y,u,v*.088,.21,.245);r(d,Bt("bridge",()=>new Kt(.06,.012,.012)),u,0,.215,.25)}this.mergeParts()}mergeParts(){let t=new Set([...this.eyes,this.mouth,this.torso,...this.shoes,this.cup,this.stick,this.paper]);for(let e of[this.body,...Object.values(this.joint)]){let n=new Map;for(let s of e.children){if(!s.isMesh||t.has(s)||s.children.length||!s.visible)continue;let r=s.material.uuid;n.has(r)||n.set(r,[]),n.get(r).push(s)}for(let s of n.values())if(!(s.length<2))try{let r=s.map(l=>{l.updateMatrix();let c=l.geometry.clone();c.applyMatrix4(l.matrix);for(let f of Object.keys(c.attributes))["position","normal","uv"].includes(f)||c.deleteAttribute(f);return c.index?c:null});if(r.some(l=>!l))continue;let o=Tn(r,!1);if(r.forEach(l=>l.dispose()),!o)continue;o.userData.own=!0;let a=new ut(o,s[0].material);a.castShadow=s[0].castShadow,a.receiveShadow=s[0].receiveShadow;for(let l of s)e.remove(l);e.add(a)}catch{}}}say(t){this.talkUntil=performance.now()/1e3+t/1e3}doAction(t,e){this.action=t,this.actionUntil=performance.now()/1e3+e/1e3}animate(t,e,{moving:n,speed:s,seated:r,typing:o,beat:a,meditate:l,kneel:c}){let f=this.pose,h={hip:0,foot:0,legL:0,legR:0,legLz:0,legRz:0,armLx:0,armRx:0,armLz:.1,armRz:-.1,headY:0,headX:0,lean:0,lift:0,turn:0,wig:0};if(this.action&&e>this.actionUntil&&(this.action=null),n){this.phase+=t*(4+s*3.2);let u=Math.sin(this.phase);h.legL=u*.62,h.legR=-u*.62,h.armLx=-u*.55,h.armRx=u*.55,h.lift=Math.abs(Math.cos(this.phase))*.04,h.lean=.06}else if(r&&c){let u=this.bowPeriod||3.2;this.bowPh=((this.bowPh||0)+t/u)%1;let y=this.bowPh<.55?Math.sin(this.bowPh/.55*Math.PI):0;h.hip=1,h.foot=1.5,h.lean=1.12*y,h.legL=h.legR=1.5-h.lean,h.legLz=-.1,h.legRz=.1,h.armLx=-1.45-.85*y,h.armRx=h.armLx,h.armLz=-.5+.62*y,h.armRz=-h.armLz,h.headX=.1+.25*y,this.bowDown=y}else r&&l?(h.legL=-1.47,h.legR=-1.33,h.legLz=.62,h.legRz=-.62,h.armLx=-.48,h.armRx=-.48,h.armLz=.36,h.armRz=-.36,h.headX=.14,h.lean=.04+Math.sin(e*.9+this.index)*.015,h.lift=Math.sin(e*.9+this.index)*.006):r?(h.legL=h.legR=-1.48,h.lift=.06,o?(h.armLx=-1.18+Math.sin(e*17)*.13,h.armRx=-1.18+Math.sin(e*17+1.7)*.13,h.armLz=.22,h.armRz=-.22,h.lean=.12,h.headX=.12,h.headY=Math.sin(e*.7+this.index)*.15):(h.armLx=-.7,h.armRx=-.7,h.armLz=.18,h.armRz=-.18,h.headY=Math.sin(e*.4+this.index*2)*.25)):h.lift=Math.sin(e*2.2+this.index)*.006;if(this.action==="stretch"){let u=Math.sin(e*3)*.12;h.armLx=-2.85+u,h.armRx=-2.85-u,h.armLz=.25,h.armRz=-.25,h.headX=-.2,h.lean=-.1}else if(this.action==="drink")h.armRx=-2.1,h.armRz=.35,h.headX=-.28;else if(this.action==="look")h.headY=Math.sin(e*1.6)*.7;else if(this.action==="wave")h.armRx=-2.7,h.armRz=-.35+Math.sin(e*13)*.4,h.headX=-.1,h.headY=.15;else if(this.action==="dance"){let u=Math.sin(e*8);h.armLx=-1.6+u*1.1,h.armRx=-1.6-u*1.1,h.armLz=.5,h.armRz=-.5,r||(h.lift=Math.abs(Math.sin(e*8))*.1,h.legL=u*.35,h.legR=-u*.35),h.headY=Math.sin(e*4)*.3}else if(this.action==="cheer"){let u=Math.sin(e*9);h.armLx=-2.9+u*.2,h.armRx=-2.9-u*.2,h.armLz=.45,h.armRz=-.45,h.headX=-.25,r||(h.lift=Math.abs(Math.sin(e*7))*.16)}else if(this.action==="place")h.armLx=-1.2,h.armRx=-1.2,h.lean=.25,h.headX=.25;else if(this.action==="highfive"){let u=this.actionUntil-e;h.armRx=-2.55,h.armRz=-.15,h.headX=-.12,u<1&&u>.7&&(h.armRx=-2.2,r||(h.lift=.08))}else if(this.action==="hug")h.armLx=-1.35,h.armRx=-1.35,h.armLz=-.55,h.armRz=.55,h.lean=.16,h.headY=.25,r||(h.lift=Math.sin(e*3)*.015);else if(this.action==="cheers"){let u=this.actionUntil-e;h.armRx=u<1.3&&u>.9?-1.95:-1.55,h.armRz=.05,h.headX=-.05}else if(this.action==="cue"||this.holdCue&&!n&&!this.action){let u=this.action==="cue"?Math.max(0,Math.sin((this.actionUntil-e)*9)):0;h.lean=.42,h.headX=.34,h.armLx=-1.2,h.armLz=.32,h.armRx=-.95-u*.35,h.armRz=-.06,r||(h.legL=.18,h.legR=-.12)}else this.action==="give"&&(h.armRx=-1.35,h.armRz=.12,h.lean=.08,h.headX=.1);this.dance&&!n&&!this.action&&this.dancePose(h,a===void 0?e*2:a,r);let d=e<this.talkUntil;d&&!r&&!n&&!this.action?(h.armRx=-.55+Math.sin(e*5.5)*.35,h.armRz=-.25,h.headX=Math.sin(e*4)*.08):d&&(h.headX+=Math.sin(e*4)*.06),this.cup.visible=this.action==="drink"||this.action==="cheers"||this.action==="give",this.stick.visible=this.action==="cue"||!!this.holdCue,this.paper.visible=this.action==="place"||this.carrying===!0,(this.carrying&&!n&&!this.action||this.carrying&&n)&&(h.armLx=-.9);let p=1-Math.exp(-t*11);for(let u of Object.keys(h))f[u]=qg(f[u],h[u],p);let g=this.joint;g.legL.rotation.set(f.legL,0,f.legLz),g.legR.rotation.set(f.legR,0,f.legRz);for(let u of this.shoes)u.rotation.x=f.foot;g.armL.rotation.set(f.armLx,0,f.armLz),g.armR.rotation.set(f.armRx,0,f.armRz),g.head.rotation.set(f.headX,f.headY,0),this.body.rotation.order="YXZ",this.body.rotation.set(f.lean,f.turn,f.wig);let _=f.hip*.42;this.body.position.set(0,f.lift+_*(1-Math.cos(f.lean)),-_*Math.sin(f.lean)),this.torso.scale.y=1+Math.sin(e*2.2+this.index)*.012;let m=1.15;e>this.blinkAt&&(m=.15,e>this.blinkAt+.12&&(this.blinkAt=e+2+Math.random()*4)),l&&r&&!n&&!d&&!this.action&&(m=.15),c&&r&&!n&&(this.bowDown||0)>.3&&(m=.15);for(let u of this.eyes)u.scale.y=m;this.mouth.scale.set(d?.8:1,d?1+Math.abs(Math.sin(e*17))*2.6:1,1)}dancePose(t,e,n){let s=e*Math.PI,r=Math.abs(Math.sin(s));switch(this.dance){case"disco":{let o=Math.sin(s/2)>0;t.armRx=o?-2.75:-.5,t.armRz=o?-.55:-.2,t.armLx=-.25,t.armLz=.95,t.headY=o?.3:-.1,t.headX=o?-.2:.05,n||(t.lift=r*.05,t.legL=Math.sin(s)*.22,t.legR=-Math.sin(s)*.08);break}case"robot":{let o=Math.sin(s)>0?1:-1,a=Math.sin(s/2)>0?1:-1;t.armLx=-1.45-o*.45,t.armRx=-1.45+o*.45,t.armLz=.15,t.armRz=-.15,t.headY=a*.4,t.headX=0,t.lean=0,n||(t.lift=o>0?.02:0,t.legL=o>0?.15:0,t.legR=o<0?.15:0);break}case"shuffle":{let o=Math.sin(s*2);t.armLx=o*.7,t.armRx=-o*.7,t.armLz=.25,t.armRz=-.25,t.lean=.08,t.headY=Math.sin(s)*.15,n||(t.legL=o*.55,t.legR=-o*.55,t.lift=Math.abs(o)*.07);break}case"spin":t.armLx=-.15,t.armRx=-.15,t.armLz=1.35,t.armRz=-1.35,t.headX=-.1,n||(t.lift=r*.06);break;case"twerk":{let o=Math.floor(e)%8===7,a=Math.sin(s*2);if(n){t.armLx=-.4,t.armRx=-.4,t.headY=a*.3,t.wig=a*.08;break}t.turn=o?0:Math.PI,t.lean=o?.05:.42,t.wig=o?0:a*.2,t.armLx=o?-2.6:-.55,t.armRx=o?-.4:-.55,t.armLz=o?.5:.32,t.armRz=o?-.2:-.32,t.legLz=.2,t.legRz=-.2,t.legL=o?0:-.25,t.legR=o?0:-.25,t.headY=o?0:.75*(Math.sin(s/2)>0?1:-1),t.headX=o?-.15:-.35,t.lift=Math.abs(a)*.035;break}case"hands":t.armLx=-2.9+Math.sin(s)*.25,t.armRx=-2.9-Math.sin(s)*.25,t.armLz=.45+Math.sin(s)*.2,t.armRz=-.45+Math.sin(s)*.2,t.headX=-.22,n||(t.lift=r*.13);break;default:{let o=Math.sin(s);t.armLx=-1.6+o*1,t.armRx=-1.6-o*1,t.armLz=.5,t.armRz=-.5,t.headY=Math.sin(s/2)*.3,n||(t.lift=r*.09,t.legL=o*.3,t.legR=-o*.3)}}}headWorld(t){return this.joint.head.updateWorldMatrix(!0,!1),t.set(0,.5,0).applyMatrix4(this.joint.head.matrixWorld)}};var on=(i,t,e,n,s=1,r=1,o=1)=>{let a=i.clone();return a.scale(s,r,o),a.translate(t,e,n),a},Jg=i=>{for(let t of Object.keys(i.attributes))t!=="position"&&t!=="normal"&&i.deleteAttribute(t);return i.index?i.toNonIndexed():i},Us=i=>Tn(i.map(Jg),!1);function Kg(){let i=new Le(.19,.2,2,8),t=new Le(.062,.22,2,6),e=new Le(.078,.25,2,6),n=new wt(.25,12,9),s=new wt(.068,6,4),r=new wt(.268,12,6,0,Math.PI*2,0,Math.PI*.52),o=new wt(.036,6,4);return{shirt:Us([on(i,0,.68,0,1,1,.78),on(t,-.255,.71,0),on(t,.255,.71,0)]),pants:Us([on(e,-.095,.22,0),on(e,.095,.22,0),on(new J(.185,.185,.05,8),0,.47,0,1,1,.8)]),skin:Us([on(n,0,1.19,0),on(s,-.255,.51,0),on(s,.255,.51,0),on(new J(.07,.08,.1,6),0,.97,0)]),hair:Us([on(r,0,1.2,-.01)]),eyes:Us([on(o,-.09,1.21,.225,1,1.3,.6),on(o,.09,1.21,.225,1,1.3,.6)])}}var oo=class{constructor(t,{cap:e=256,blobGeo:n,blobMat:s}={}){this.cap=e,this.n=0;let r=Kg(),o=(l,c,f)=>{let h=new rn(l,c,e);return h.count=0,h.frustumCulled=!1,h.castShadow=!1,h.receiveShadow=!1,f&&h.setColorAt(0,new Gt("#ffffff")),h.instanceMatrix.setUsage(Lh),t.add(h),h},a=l=>new Zt({color:"#ffffff",roughness:l,metalness:0});this.parts={shirt:o(r.shirt,a(.8),!0),pants:o(r.pants,a(.85),!0),skin:o(r.skin,a(.6),!0),hair:o(r.hair,a(.9),!0),eyes:o(r.eyes,new Zt({color:"#1f1a17",roughness:.4}),!1)},this.blob=n&&s?o(n,s,!1):null,this.blob&&(this.blob.renderOrder=1),this.m=new Xt,this.legM=new Xt,this.t=new Xt,this.q=new We,this.e=new Xe(0,0,0,"YXZ"),this.v=new U,this.s=new U(1,1,1),this.blobM=new Xt}begin(){this.n=0}add(t,e,n,s,r,{seated:o=!1,bob:a=0,wig:l=0,lean:c=0,turn:f=0}={}){if(this.n>=this.cap)return!1;let h=this.n++;this.e.set(c,r+f,l),this.q.setFromEuler(this.e),this.v.set(e,n+a,s),this.m.compose(this.v,this.q,this.s);let d=this.parts,p=t.mats;return d.shirt.setMatrixAt(h,this.m),d.skin.setMatrixAt(h,this.m),d.hair.setMatrixAt(h,this.m),d.eyes.setMatrixAt(h,this.m),o?(this.legM.makeTranslation(0,.42,0).multiply(this.t.makeRotationX(-1.45)).multiply(this.t.makeTranslation(0,-.42,0)),d.pants.setMatrixAt(h,this.t.multiplyMatrices(this.m,this.legM))):d.pants.setMatrixAt(h,this.m),d.shirt.setColorAt(h,p.shirt.color),d.pants.setColorAt(h,p.pants.color),d.skin.setColorAt(h,p.skin.color),d.hair.setColorAt(h,p.hair.color),this.blob&&!o&&(this.blobM.makeRotationX(-Math.PI/2).setPosition(e,.012,s),this.blob.setMatrixAt(this.blobN=this.blobN||0,this.blobM),this.blobN++),!0}end(){for(let t of Object.values(this.parts))t.count=this.n,t.instanceMatrix.needsUpdate=!0,t.instanceColor&&(t.instanceColor.needsUpdate=!0);this.blob&&(this.blob.count=this.blobN||0,this.blob.instanceMatrix.needsUpdate=!0,this.blobN=0)}};var Zh={2027:[2,6,"\u0110inh M\xF9i"],2028:[1,26,"M\u1EADu Th\xE2n"],2029:[2,13,"K\u1EF7 D\u1EADu"],2030:[2,3,"Canh Tu\u1EA5t"],2031:[1,23,"T\xE2n H\u1EE3i"],2032:[2,11,"Nh\xE2m T\xFD"]},Kh=864e5;function jh(i=new Date){for(let t of Object.keys(Zh).map(Number).sort()){let[e,n,s]=Zh[t],r=new Date(t,e-1,n);if(i.getTime()<=r.getTime()+15*Kh)return{year:t,at:r,name:s}}return null}function Qh(i,t=new Date){if(i==="on")return!0;if(i==="off")return!1;let e=jh(t);return!!e&&t.getTime()>=e.at.getTime()-84*Kh}var Gl=new Map,Qe=(i,t=.7,e={})=>{let n=i+t+JSON.stringify(e);return Gl.has(n)||Gl.set(n,new Zt({color:i,roughness:t,metalness:0,...e})),Gl.get(n)},Wl="#d7261e",Ns="#f5c518";function tu(i,t,e){let n=document.createElement("canvas");n.width=i,n.height=t,e(n.getContext("2d"),i,t);let s=new qe(n);return s.colorSpace=xe,s.anisotropy=4,s}function Xl(i){let t=i>>>0;return()=>(t=t*1664525+1013904223>>>0)/4294967296}function eu(i,t,e){let n=new ut(new J(t,t*.72,e,20),Qe("#b3201a",.35));n.position.y=e/2,n.castShadow=!0,n.receiveShadow=!0,i.add(n);for(let o of[e-.02,.05]){let a=new ut(new ye(o>.1?t:t*.74,.022,6,24),Qe(Ns,.3,{metalness:.4}));a.rotation.x=Math.PI/2,a.position.y=o,i.add(a)}let s=new ut(new J(t*.92,t*.92,.02,20),Qe("#4a3426",.95));s.position.y=e-.03,i.add(s);let r=new ut(new wn(t*.38,24),Jh||(Jh=new Zt({map:jg(),roughness:.4,transparent:!0})));r.position.set(0,e*.52,t*.88),r.rotation.x=-.08,i.add(r)}var $h=null,Jh=null;function jg(){return $h||($h=tu(128,128,(i,t)=>{i.fillStyle=Ns,i.beginPath(),i.arc(t/2,t/2,t/2-2,0,Math.PI*2),i.fill(),i.fillStyle=Wl,i.font='bold 54px "Segoe UI", Arial, sans-serif',i.textAlign="center",i.textBaseline="middle",i.fillText("\u798F",t/2,t/2+4)}))}function ao({kind:i="mai",h:t=1.7,seed:e=1,envelopes:n=6}={}){let s=new Yt,r=Xl(e),o=.42*t/1.7,a=.3*t/1.7;eu(s,a,o);let l=Qe(i==="mai"?"#5b3a24":"#4a2c22",.9),c=[],f=(A,S,w,P,D,x,E)=>{let N=new U(Math.sin(x)*Math.cos(D),Math.cos(x),Math.sin(x)*Math.sin(D)),z=new U(A,S,w).addScaledVector(N,P),I=.045*Math.pow(.62,E)*t/1.7+.006,V=new ut(new J(I*.65,I,P,6),l);if(V.position.set((A+z.x)/2,(S+z.y)/2,(w+z.z)/2),V.quaternion.setFromUnitVectors(new U(0,1,0),N),V.castShadow=!0,s.add(V),c.push({p:z.clone(),d:E,from:new U(A,S,w)}),E<3){let F=E===0?4:2+(r()<.5?1:0);for(let Q=0;Q<F;Q++)f(z.x,z.y,z.z,P*(.62+r()*.15),D+Q/F*Math.PI*2+r()*.9,Math.min(1.25,x+.35+r()*.35),E+1)}};f(0,o-.02,0,t*.36,r()*6,.12,0);let h=i==="mai"?["#ffd21f","#ffc400","#ffe066","#ffb000"]:["#ff8fb8","#ffb3cf","#ff6fa3","#ffd0e0"],d=[];for(let A of c)if(A.d>=1)for(let S=0;S<(A.d===3?7:4);S++)d.push(A.from.clone().lerp(A.p,.25+r()*.8).add(new U((r()-.5)*.06,(r()-.5)*.06,(r()-.5)*.06)));let p=new rn(new ze(.034*t/1.7,0),new Zt({roughness:.6,emissive:i==="mai"?"#5a3c00":"#4a1028",emissiveIntensity:.35}),d.length),g=new Xt,_=new We,m=new U,u=new Gt;if(d.forEach((A,S)=>{let w=.7+r()*.7;m.set(w,w*.6,w),_.setFromEuler(new Xe(r()*3,r()*3,r()*3)),g.compose(A,_,m),p.setMatrixAt(S,g),p.setColorAt(S,u.set(h[S%h.length]))}),p.castShadow=!0,s.add(p),i==="mai"){let A=d.filter(()=>r()<.25),S=new rn(new wt(.022*t/1.7,6,4),Qe("#7cc142",.8),A.length);A.forEach((w,P)=>{g.compose(w.clone().add(new U(.02,.01,0)),_.identity(),m.set(1.4,.5,.8)),S.setMatrixAt(P,g)}),s.add(S)}let y=c.filter(A=>A.d===2).sort(()=>r()-.5).slice(0,n),v=Qe(Wl,.5),M=Qe(Ns,.3,{metalness:.4});for(let A of y){let S=new Yt;S.position.copy(A.p).add(new U(0,-.07,0)),S.rotation.y=r()*Math.PI;let w=new ut(new Kt(.07,.11,.012),v);w.castShadow=!0,S.add(w);let P=new ut(new Kt(.05,.012,.014),M);P.position.y=.02,S.add(P),s.add(S)}return s.userData.top=t,s}function Qg({h:i=1.2,seed:t=3}={}){let e=new Yt,n=Xl(t);eu(e,.26,.36);let s=new ut(new J(.03,.04,.4,6),Qe("#5b3a24",.9));s.position.y=.55,e.add(s);let r=Qe("#2f7d3a",.85,{flatShading:!0});for(let l=0;l<5;l++){let c=new ut(new ze(.26,1),r);c.position.set((n()-.5)*.25,.85+n()*.3,(n()-.5)*.25),c.scale.setScalar(.9+n()*.3),c.castShadow=!0,e.add(c)}let o=new rn(new wt(.035,8,6),Qe("#ff8a00",.4,{emissive:"#6a2a00",emissiveIntensity:.3}),40),a=new Xt;for(let l=0;l<40;l++){let c=n()*Math.PI*2,f=.7+n()*.55,h=.33-Math.abs(f-.97)*.45;a.makeTranslation(Math.cos(c)*h,f,Math.sin(c)*h),o.setMatrixAt(l,a)}return e.add(o),e}var lo=null;function tx(){if(lo)return lo;let i=new Yt,t=Qe("#7a1410",.7),e=Qe(Ns,.35,{metalness:.4}),n=new ut(new J(.006,.006,.3,4),t);n.position.y=-.15,i.add(n);let s=new ut(new wt(.17,18,12),Qe(Wl,.45,{emissive:"#ff3b1f",emissiveIntensity:.55}));s.scale.set(1,.82,1),s.position.y=-.44,s.castShadow=!0,i.add(s);for(let o=0;o<6;o++){let a=new ut(new ye(.171,.006,4,20),t);a.position.y=-.44,a.scale.set(1,.82,1),a.rotation.y=o/6*Math.PI,i.add(a)}for(let o of[-.29,-.59]){let a=new ut(new J(.07,.07,.04,12),e);a.position.y=o,i.add(a)}let r=new ut(new Be(.035,.2,8),e);return r.position.y=-.72,r.rotation.x=Math.PI,i.add(r),nu(i),lo=i.children.map(o=>({geo:o.geometry,mat:o.material,cast:o.castShadow})),lo}function ex(){let i=[],t={add(e,n,s,r=1){i.push({x:e,y:n,z:s,s:r,ph:i.length*.9})},finish(e){i.length&&(t.meshes=tx().map(({geo:n,mat:s,cast:r})=>{let o=new rn(n,s,i.length);return o.castShadow=r,o.frustumCulled=!1,e.add(o),o}),t.tick(0))},tick(e){if(!t.meshes)return;let n=new Xt,s=new We,r=new Xe,o=new U,a=new U;i.forEach((l,c)=>{s.setFromEuler(r.set(Math.cos(e*1.1+l.ph)*.04,0,Math.sin(e*1.4+l.ph)*.07)),n.compose(o.set(l.x,l.y,l.z),s,a.setScalar(l.s));for(let f of t.meshes)f.setMatrixAt(c,n)});for(let l of t.meshes)l.instanceMatrix.needsUpdate=!0}};return t}function nx(i,t,e,{vertical:n=!1,sub:s=""}={}){return tu(t,e,r=>{let o=r.createLinearGradient(0,0,0,e);if(o.addColorStop(0,"#e2332a"),o.addColorStop(1,"#b51912"),r.fillStyle=o,r.fillRect(0,0,t,e),r.strokeStyle=Ns,r.lineWidth=Math.max(4,t*.012),r.strokeRect(r.lineWidth*2,r.lineWidth*2,t-r.lineWidth*4,e-r.lineWidth*4),r.fillStyle="#ffd94a",r.textAlign="center",r.textBaseline="middle",r.shadowColor="rgba(80,0,0,.45)",r.shadowOffsetY=3,r.shadowBlur=4,n){let a=i.length,l=(e-t*.5)/a;r.font=`bold ${Math.round(Math.min(t*.42,l*.62))}px "Segoe UI", Arial, sans-serif`,i.forEach((c,f)=>r.fillText(c,t/2,t*.25+l*(f+.5)))}else{r.font=`bold ${Math.round(e*(s?.38:.5))}px "Segoe UI", Arial, sans-serif`,r.fillText(i[0],t/2,e*(s?.4:.52)),s&&(r.font=`600 ${Math.round(e*.2)}px "Segoe UI", Arial, sans-serif`,r.fillText(s,t/2,e*.76));for(let a of[e*.45,t-e*.45])for(let l=0;l<5;l++){let c=l/5*Math.PI*2;r.fillStyle="#ffd21f",r.beginPath(),r.arc(a+Math.cos(c)*e*.1,e/2+Math.sin(c)*e*.1,e*.08,0,Math.PI*2),r.fill()}}})}function Vl(i,t,e,n){return new ut(new ie(t,e),new Zt({map:nx(i,Math.round(t*256),Math.round(e*256),n),roughness:.6,emissive:"#3a0000",emissiveIntensity:.25}))}function ix(i,t,e,n,s=90){let r=Xl(77),o=new Float32Array(s*3),a=new Float32Array(s*3),l=[],c=new Gt;for(let p=0;p<s;p++)o.set([i+r()*(t-i),r()*4,e+r()*(n-e)],p*3),c.set(p%2?"#ffd21f":"#ff9ac0"),a.set([c.r,c.g,c.b],p*3),l.push({v:.25+r()*.35,w:r()*6,a:.3+r()*.5});let f=new Ee;f.setAttribute("position",new Ae(o,3)),f.setAttribute("color",new Ae(a,3));let h=new Or(f,new vs({size:.07,vertexColors:!0,transparent:!0,opacity:.9,depthWrite:!1}));return h.frustumCulled=!1,{pts:h,tick:(p,g=.016)=>{let _=f.attributes.position.array;for(let m=0;m<s;m++){let u=l[m];_[m*3+1]-=u.v*g,_[m*3]+=Math.sin(p*1.3+u.w)*u.a*g,_[m*3+2]+=Math.cos(p*.9+u.w)*u.a*.5*g,_[m*3+1]<.02&&(_[m*3+1]=3.6+r()*.6,_[m*3]=i+r()*(t-i),_[m*3+2]=e+r()*(n-e))}f.attributes.position.needsUpdate=!0}}}function nu(i){i.updateMatrixWorld(!0);let t=new Xt().copy(i.matrixWorld).invert(),e=new Map,n=[],s=new Xt;i.traverse(r=>{if(!r.isMesh||r.isInstancedMesh)return;let o=r.geometry.index?r.geometry.toNonIndexed():r.geometry.clone();for(let l of Object.keys(o.attributes))["position","normal","uv"].includes(l)||o.deleteAttribute(l);o.attributes.uv||o.setAttribute("uv",new ee(new Float32Array(o.attributes.position.count*2),2)),o.applyMatrix4(s.multiplyMatrices(t,r.matrixWorld));let a=r.material.uuid+"|"+r.castShadow;e.has(a)||e.set(a,{mat:r.material,cast:r.castShadow,geos:[]}),e.get(a).geos.push(o),n.push(r)}),n.forEach(r=>r.parent.remove(r));for(let{mat:r,cast:o,geos:a}of e.values()){let l=Tn(a,!1);if(!l)continue;let c=new ut(l,r);c.castShadow=o,c.receiveShadow=!0,i.add(c)}return i}var sx=(i,t,e,n)=>!i.some(([s,r,o,a])=>t+n>s&&t-n<o&&e+n>r&&e-n<a);function iu(i,t,e){let n=new Yt;n.name="tet",i.add(n);let s=new Yt;n.add(s);let r=ex(),o=(m,u,y,v,M=0)=>sx(t.obstacles,u,y,v)?(m.position.set(u,0,y),m.rotation.y=M,s.add(m),t.obstacles.push([u-v,y-v,u+v,y+v]),!0):!1,{gate:a}=e;o(ao({kind:"mai",h:2,seed:11,envelopes:8}),a.x-a.half+.05,a.z-.75,.34),o(ao({kind:"dao",h:2,seed:23,envelopes:8}),a.x+a.half-.05,a.z-.75,.34);for(let m of[-1.3,1.3])r.add(a.x+m,2.78,a.z,1.1);let l=2.35,c=e.minZ+.06,f=Vl(["Xu\xE2n","an","khang","th\u1ECBnh","v\u01B0\u1EE3ng"],.42,1.9,{vertical:!0});f.position.set(e.cinemaX-3,l,c),s.add(f);let h=Vl(["T\u1EBFt","sum","v\u1EA7y","ph\xE1t","t\xE0i"],.42,1.9,{vertical:!0});h.position.set(e.cinemaX+3,l,c),s.add(h);let d=jh(),p=Vl(["Ch\xFAc M\u1EEBng N\u0103m M\u1EDBi"],3.8,.62,{sub:d?`Xu\xE2n ${d.name} ${d.year} \xB7 An khang th\u1ECBnh v\u01B0\u1EE3ng`:"An khang th\u1ECBnh v\u01B0\u1EE3ng"});p.position.set(e.barX,3.2,e.minZ+.07),s.add(p);for(let m of[e.barX+3.3,e.barX+4.9,e.barX+6.5])r.add(m,3.45,e.minZ+.45,.95);[[e.minX+1,e.inZ-.9,"quat"],[e.minX+1,e.inZ-2.6,"mai"],[e.cinemaX-3.6,e.minZ+1.2,"dao"],[e.cinemaX+3.6,e.minZ+1.2,"quat"]].forEach(([m,u,y],v)=>o(y==="quat"?Qg({seed:40+v}):ao({kind:y,h:1.6,seed:60+v,envelopes:4}),m,u,.3,v));for(let[m,u]of e.umbrellas||[])for(let y of[.6,.6+Math.PI])r.add(m+Math.cos(y)*1.2,2.28,u+Math.sin(y)*1.2,.7);for(let[m,u]of e.lamps||[]){let y=new ut(new Kt(.42,.03,.03),Qe("#2b2b33",.4));y.position.set(m+.21,1.95,u),s.add(y),r.add(m+.4,1.95,u,.75)}[[-12.9,3.6,"mai"],[5.4,9.1,"dao"],[-3.6,9.1,"mai"],[24.6,9,"mai"],[-12.9,-6.5,"dao"]].forEach(([m,u,y],v)=>o(ao({kind:y,h:2.3,seed:90+v,envelopes:7}),m,u,.36,v*1.3));let _=ix(e.minX+1,e.maxX-1,e.inZ+.5,e.maxZ-.6,110);return n.add(_.pts),nu(s),r.finish(n),t.animated.push((m,u)=>{r.tick(m),_.tick(m,Math.min(.05,u||.016))}),t.tet=n,n}var Fs=new U;function un(i,t,e,n,s,r){let o=2*Math.PI*s/4,a=Math.max(r-2*s,0),l=Math.PI/4;Fs.copy(t),Fs[n]=0,Fs.normalize();let c=.5*o/(o+a),f=1-Fs.angleTo(i)/l;return Math.sign(Fs[e])===1?f*c:a/(o+a)+c+c*(1-f)}var zs=class extends Kt{constructor(t=1,e=1,n=1,s=2,r=.1){if(s=s*2+1,r=Math.min(t/2,e/2,n/2,r),super(1,1,1,s,s,s),s===1)return;let o=this.toNonIndexed();this.index=null,this.attributes.position=o.attributes.position,this.attributes.normal=o.attributes.normal,this.attributes.uv=o.attributes.uv;let a=new U,l=new U,c=new U(t,e,n).divideScalar(2).subScalar(r),f=this.attributes.position.array,h=this.attributes.normal.array,d=this.attributes.uv.array,p=f.length/6,g=new U,_=.5/s;for(let m=0,u=0;m<f.length;m+=3,u+=2)switch(a.fromArray(f,m),l.copy(a),l.x-=Math.sign(l.x)*_,l.y-=Math.sign(l.y)*_,l.z-=Math.sign(l.z)*_,l.normalize(),f[m+0]=c.x*Math.sign(a.x)+l.x*r,f[m+1]=c.y*Math.sign(a.y)+l.y*r,f[m+2]=c.z*Math.sign(a.z)+l.z*r,h[m+0]=l.x,h[m+1]=l.y,h[m+2]=l.z,Math.floor(m/p)){case 0:g.set(1,0,0),d[u+0]=un(g,l,"z","y",r,n),d[u+1]=1-un(g,l,"y","z",r,e);break;case 1:g.set(-1,0,0),d[u+0]=1-un(g,l,"z","y",r,n),d[u+1]=1-un(g,l,"y","z",r,e);break;case 2:g.set(0,1,0),d[u+0]=1-un(g,l,"x","z",r,t),d[u+1]=un(g,l,"z","x",r,n);break;case 3:g.set(0,-1,0),d[u+0]=1-un(g,l,"x","z",r,t),d[u+1]=1-un(g,l,"z","x",r,n);break;case 4:g.set(0,0,1),d[u+0]=1-un(g,l,"x","y",r,t),d[u+1]=1-un(g,l,"y","x",r,e);break;case 5:g.set(0,0,-1),d[u+0]=un(g,l,"x","y",r,t),d[u+1]=1-un(g,l,"y","x",r,e);break}}};var at={minX:-14,maxX:26,minZ:-10,maxZ:18,wallH:3.6,inZ:10},Os=-9.6,ho=3,rx=[{x:18.6,z:-4.4},{x:23,z:-4.4}],ts={w:1.25,l:2.5},ql=new Map,L=(i,t=.75,e={})=>{let n=JSON.stringify([i,t,e.metalness||0,e.emissive||"",e.emissiveIntensity||0,e.side||0,!!e.flatShading]);return ql.has(n)||ql.set(n,new Zt({color:i,roughness:t,metalness:0,...e})),ql.get(n)},be=(i,t=1.6)=>L(i,.4,{emissive:i,emissiveIntensity:t});function Ce(i,t,e){let n=document.createElement("canvas");n.width=i,n.height=t,e(n.getContext("2d"),i,t);let s=new qe(n);return s.colorSpace=xe,s.anisotropy=8,s}function Ye(i){let t=i>>>0;return()=>(t=t*1664525+1013904223>>>0)/4294967296}function ox(){let i=Ye(21),t=Ce(1024,1024,(e,n,s)=>{for(let o=0;o<s;o+=64){let a=-Math.floor(i()*360);for(;a<n;){let l=260+Math.floor(i()*260),c=i();e.fillStyle=`rgb(${Math.round(232+c*12)},${Math.round(208+c*12)},${Math.round(170+c*14)})`,e.fillRect(a,o,l,64),e.strokeStyle="rgba(165,120,75,.10)",e.lineWidth=1.2;for(let f=0;f<4;f++){let h=o+8+i()*48;e.beginPath(),e.moveTo(a,h);for(let d=a;d<a+l;d+=40)e.lineTo(d,h+Math.sin(d*.02+f)*2.5);e.stroke()}e.fillStyle="rgba(140,100,60,.22)",e.fillRect(a,o,2,64),a+=l}e.fillStyle="rgba(140,100,60,.25)",e.fillRect(0,o,n,2)}});return t.wrapS=t.wrapT=Kn,t.repeat.set(4,2.9),t}function Yl(i,t,e){return Ce(512,512,(n,s,r)=>{n.fillStyle=i,n.fillRect(0,0,s,r),n.strokeStyle=t,n.lineWidth=22,n.strokeRect(26,26,s-52,r-52),n.lineWidth=4,n.strokeRect(54,54,s-108,r-108),n.fillStyle=e;for(let o=100;o<r-90;o+=44)for(let a=100+o/44%2*22;a<s-90;a+=44)n.beginPath(),n.arc(a,o,5,0,7),n.fill()})}function ax(){return Ce(1024,576,(i,t,e)=>{let n=i.createLinearGradient(0,0,t,e);n.addColorStop(0,"#141a33"),n.addColorStop(1,"#2a1f45"),i.fillStyle=n,i.fillRect(0,0,t,e),i.fillStyle="rgba(255,255,255,.06)";for(let s=0;s<9;s++)i.beginPath(),i.arc(120+s*110,470-s%3*30,60+s%4*14,0,Math.PI*2),i.fill();i.textAlign="center",i.fillStyle="#ffffff",i.font="900 86px Nunito, sans-serif",i.fillText("\u{1F3AC} SIMI CINEMA",t/2,e/2-20),i.font="700 34px Nunito, sans-serif",i.fillStyle="rgba(255,255,255,.75)",i.fillText('B\u1EA5m "\u{1F3AC} M\xE0n chi\u1EBFu" v\xE0 d\xE1n link YouTube',t/2,e/2+50),i.fillText("\u0111\u1EC3 c\u1EA3 qu\xE1n c\xF9ng xem",t/2,e/2+95)})}function lx(){return Ce(512,640,(i,t,e)=>{let n=i.createLinearGradient(0,0,0,e);n.addColorStop(0,"#7fbcf2"),n.addColorStop(.65,"#cfe6fb"),n.addColorStop(1,"#f5efe2"),i.fillStyle=n,i.fillRect(0,0,t,e),i.fillStyle="rgba(255,255,255,.85)";for(let[r,o,a]of[[120,120,40],[170,110,52],[220,128,36],[360,220,30],[400,210,42]])i.beginPath(),i.arc(r,o,a,0,7),i.fill();let s=Ye(9);for(let r=0;r<t;r+=46+s()*30){let o=120+s()*220,a=40+s()*40;i.fillStyle=`rgba(${90+s()*40},${120+s()*40},${160+s()*40},.55)`,i.fillRect(r,e-o,a,o),i.fillStyle="rgba(255,255,255,.45)";for(let l=e-o+12;l<e-10;l+=18)for(let c=r+6;c<r+a-6;c+=12)i.fillRect(c,l,5,8)}})}function cx(){return Ce(1024,256,(i,t,e)=>{i.clearRect(0,0,t,e),i.font='900 118px "Nunito", "Segoe UI", sans-serif',i.textAlign="center",i.textBaseline="middle";for(let[n,s]of[[38,"#2f8cf0"],[18,"#7cc4ff"],[0,"#ffffff"]])i.shadowColor="#2f8cf0",i.shadowBlur=n,i.fillStyle=s,i.fillText("SIMI BAR",t/2-110,e/2+4);i.font='italic 900 92px "Nunito", "Segoe UI", sans-serif';for(let[n,s]of[[34,"#ff4fa3"],[14,"#ff9ccf"],[0,"#fff3fa"]])i.shadowColor="#ff4fa3",i.shadowBlur=n,i.fillStyle=s,i.fillText("chill",t/2+300,e/2+10)})}function hx(){return Ce(512,640,(i,t,e)=>{i.fillStyle="#26332e",i.fillRect(0,0,t,e),i.fillStyle="#f7f3e8",i.textAlign="center",i.font='900 64px "Nunito", "Segoe UI", sans-serif',i.fillText("MENU",t/2,92),i.font='700 34px "Nunito", "Segoe UI", sans-serif',i.textAlign="left",[["C\xE0 ph\xEA s\u1EEFa \u0111\xE1","25k"],["Tr\xE0 \u0111\xE0o cam s\u1EA3","35k"],["Matcha latte","39k"],["Soda chanh d\xE2y","32k"],["B\xE1nh m\xEC AI \u2728","20k"]].forEach(([n,s],r)=>{i.fillStyle="#f7f3e8",i.fillText(n,46,190+r*82),i.fillStyle="#ffd26a",i.textAlign="right",i.fillText(s,t-46,190+r*82),i.textAlign="left"}),i.strokeStyle="rgba(247,243,232,.5)",i.lineWidth=3,i.strokeRect(18,18,t-36,e-36)})}var co=null;function ux(){return co||(co=Ce(256,256,(i,t)=>{let e=i.createRadialGradient(t/2,t/2,0,t/2,t/2,t/2);e.addColorStop(0,"rgba(255,255,255,.95)"),e.addColorStop(.45,"rgba(255,255,255,.35)"),e.addColorStop(1,"rgba(255,255,255,0)"),i.fillStyle=e,i.fillRect(0,0,t,t)}),co)}function an(i,t,e,n,s,r=.35){let o=new ut(new ie(n*2,n*2),new ne({map:ux(),color:s,transparent:!0,opacity:r,depthWrite:!1,blending:Sr,toneMapped:!1}));return o.rotation.x=-Math.PI/2,o.position.set(t,.015,e),o.renderOrder=2,i.add(o),o}function su(i,t){new qr().load((globalThis.VP_ASSET_BASE||"")+i,e=>{e.colorSpace=xe,e.anisotropy=8,t(e)},void 0,()=>{})}function ou(i,t={}){let e={animated:[],seats:[],obstacles:[],seatMeshes:[],clickables:[]},n=[],s=(H,nt,xt,gt,Dt,zt=i,{cast:$t=!0,receive:O=!0}={})=>{let _t=new ut(H,nt);return _t.position.set(xt,gt,Dt),_t.castShadow=$t,_t.receiveShadow=O,zt.add(_t),n.push(_t),_t},r=(H,nt,xt,gt=0)=>gt>0?new zs(H,nt,xt,2,Math.min(gt,H/2-.001,nt/2-.001,xt/2-.001)):new Kt(H,nt,xt),o=(H,nt,xt,gt)=>e.obstacles.push([Math.min(H,xt),Math.min(nt,gt),Math.max(H,xt),Math.max(nt,gt)]),a=at.maxX-at.minX,l=at.maxZ-at.minZ,c=(at.minX+at.maxX)/2,f=(at.minZ+at.maxZ)/2,h=at.inZ-at.minZ,d=(at.minZ+at.inZ)/2,p={cast:!1};s(r(a+.7,.5,l+.7,.12),L("#e8dfd1",.85),c,-.26,f,i,{cast:!1,receive:!0}),s(r(a+.75,.08,l+.75,.03),L("#d3c4ae",.8),c,-.47,f,i,p);let g=ox();g.repeat.set(4*a/28,2.9*h/20);let _=new ut(new ie(a,h),new Zt({color:"#ffffff",roughness:.62,map:g}));_.rotation.x=-Math.PI/2,_.position.set(c,.001,d),_.receiveShadow=!0,i.add(_),e.floor=_;let m=L("#f6f0e6",.95),u=L("#e3d5bf",.8),y=L("#b98d5e",.5),v=L("#9b7048",.6);s(r(a+.2,at.wallH,.22),m,c,at.wallH/2,at.minZ-.11,i,p),s(r(.22,at.wallH,h),m,at.minX-.11,at.wallH/2,d,i,p),s(r(a,1,.05),u,c,.5,at.minZ+.025,i,p),s(r(.05,1,h),u,at.minX+.025,.5,d,i,p),s(r(a,.06,.09),y,c,1.02,at.minZ+.045,i,p),s(r(.09,.06,h),y,at.minX+.045,1.02,d,i,p),s(r(a-.02,.12,.07),v,c,.06,at.minZ+.035,i,p),s(r(.07,.12,h-.02),v,at.minX+.035,.06,d,i,p),s(r(a+.22,.12,.3,.03),L("#ffffff",.6),c,at.wallH+.06,at.minZ-.08,i,p),s(r(.3,.12,h,.03),L("#ffffff",.6),at.minX-.08,at.wallH+.06,d,i,p),s(r(.34,at.wallH+.12,.34,.04),L("#ffffff",.6),at.minX-.15,(at.wallH+.12)/2,at.inZ,i,p);for(let H=at.minX+.6;H<at.maxX;H+=.6)s(r(.02,.83,.02),y,H,.545,at.minZ+.06,i,p);for(let H=at.minZ+.6;H<at.inZ-.2;H+=.6)s(r(.02,.83,.02),y,at.minX+.06,.545,H,i,p);let M=Os-2.4,A=Os+2.4,S=-8.1,w=(M+A)/2;s(r(A-M+1.6,at.wallH-.02,.07),L("#1d2b4f",.9),w,at.wallH/2,at.minZ+.02,i,p),s(r(A-M,1.05,.72,.06),L("#8a5a3b",.55),w,.525,S);for(let H=M+.25;H<A-.1;H+=.28)s(r(.12,.86,.04,.015),L("#a8724c",.5),H,.53,S+.37,i,p);s(r(A-M+.24,.07,.92,.03),L("#f6f3ee",.22,{metalness:.05}),w,1.09,S+.05),s(r(A-M,.04,.04),be("#4aa8ff",2.4),w,.1,S+.39,i,p),s(r(A-M,.03,.4),L("#b9c2cf",.3,{metalness:.6}),w,.06,S+.6,i,p),o(M-.1,S-.5,A+.1,S+.45),o(M-.1,at.minZ,A+.1,S);let P=Ye(5),D=["#ff6fb5","#4aa8ff","#ffd34d","#45d2b4","#ff9a52","#c3a6ff","#ff5a5f","#9fd6ff"],x=new J(.05,.06,1,12),E=new J(.018,.022,.08,8);for(let H=0;H<3;H++){let nt=1.45+H*.55;s(r(A-M-.4,.05,.34,.015),L("#c79a6a",.5),w,nt,at.minZ+.22,i,p),s(r(A-M-.4,.035,.03),be("#ffd8a0",1),w,nt-.04,at.minZ+.37,i,p);for(let xt=M+.2;xt<A-.3;xt+=.32+P()*.2){let gt=D[Math.floor(P()*D.length)],Dt=.22+P()*.14,zt=s(x,L(gt,.18,{emissive:gt,emissiveIntensity:.25}),xt,nt+Dt/2+.03,at.minZ+.22,i,p);zt.scale.y=Dt,s(E,L("#2b2b33"),xt,nt+Dt+.07,at.minZ+.22,i,p)}}let N=new ut(new ie(4.6,1.15),new ne({map:cx(),transparent:!0,toneMapped:!1,depthWrite:!1}));N.position.set(w,3.12,at.minZ+.06),i.add(N),N.material.opacity=.95;let z=new Zt({color:"#e6f6ff",roughness:.05,transparent:!0,opacity:.55});for(let H=0;H<3;H++)s(new J(.05,.04,.13,12),z,M+1.2+H*1.2,1.19,S-.1,i,p);s(r(.55,.48,.38,.05),L("#cfd6df",.25,{metalness:.65}),A-.8,1.37,S-.1),s(r(.3,.06,.2,.02),L("#2b2b33",.4),A-.8,1.64,S-.1,i,p),s(new J(.1,.08,.14,14),L("#ffffff",.5),M+.5,1.2,S-.15,i,p),s(new ze(.13,1),L("#5fb36f",.8,{flatShading:!0}),M+.5,1.36,S-.15,i,p);let I=new ut(new ie(1.1,1.38),new Zt({map:hx(),roughness:.9}));I.position.set(A+2.2,2,at.minZ+.05),i.add(I),s(r(1.24,1.52,.05,.02),L("#8a5a3b",.5),A+2.2,2,at.minZ+.02,i,p);let V=L("#c2cad6",.25,{metalness:.7}),F=[L("#2f8cf0",.55),L("#ff7a6b",.55)],Q=new J(.21,.21,.1,22),Y=0;for(let H=M+.6;H<=A-.5;H+=1.05){let nt=S+.85,xt=new Yt;xt.position.set(H,0,nt),i.add(xt),s(Q,F[Y%2],0,.75,0,xt),s(new J(.035,.035,.7,10),V,0,.36,0,xt),s(new J(.19,.22,.03,20),V,0,.015,0,xt),s(new ye(.16,.014,8,20),V,0,.3,0,xt,p).rotation.x=Math.PI/2,ft(`b${++Y}`,H,nt,Math.PI,.78,{x:H,z:nt+.55})}let X=L("#fbf7f0",.35),it=L("#b8875a",.5);gx({scene:i,add:s,box:r,block:o,seat:ft,out:e});let rt=[L("#8fc9b0",.85),L("#a99be0",.85),L("#8cc3f5",.85)],bt=[L("#ffd34d",.8),L("#ff9a6b",.8),L("#ffffff",.8)],It=[Yl("#f3ead9","#8fc9b0","rgba(143,201,176,.5)"),Yl("#efe9f8","#a99be0","rgba(169,155,224,.5)"),Yl("#eaf3fc","#8cc3f5","rgba(140,195,245,.5)")];[[-10.2,-.6],[-10.2,4]].forEach(([H,nt],xt)=>{let gt=rt[xt],Dt=new Yt;Dt.position.set(H-2.6,0,nt),i.add(Dt),s(r(.92,.3,2.6,.08),gt,0,.27,0,Dt),s(r(.8,.14,2.3,.07),gt,.05,.47,0,Dt),s(r(.26,.72,2.6,.1),gt,-.34,.6,0,Dt);for(let $t of[-1,1])s(r(.92,.55,.22,.09),gt,0,.42,$t*1.25,Dt);for(let[$t,O]of[[-.75,.2],[.75,-.2]])s(r(.14,.34,.34,.07),bt[xt],-.13,.66,$t,Dt).rotation.set(O,0,.22);for(let[$t,O]of[[-.35,-1.2],[.35,-1.2],[-.35,1.2],[.35,1.2]])s(new J(.03,.02,.12,8),it,$t,.06,O,Dt,p);o(H-3.1,nt-1.4,H-2.1,nt+1.4),s(new J(.55,.55,.06,32),L("#c79a6a",.45),H-.4,.38,nt),s(new J(.08,.12,.34,12),L("#9b7048",.5),H-.4,.18,nt),s(new J(.06,.06,.08,12),be("#ffb35c",.9),H-.4,.45,nt+.2,i,p),s(new J(.05,.04,.12,12),z,H-.55,.47,nt-.2,i,p),o(H-.95,nt-.6,H+.15,nt+.6);for(let $t=-1;$t<=1;$t++)ft(`s${xt+1}${$t+2}`,H-2.5,nt+$t*.8,Math.PI/2,.44,{x:H-1.75,z:nt+$t*.8});let zt=new ut(new ie(3.4,3.2),new Zt({map:It[xt],roughness:.95}));zt.rotation.x=-Math.PI/2,zt.position.set(H-1,.006,nt),zt.receiveShadow=!0,i.add(zt),an(i,H-1.2,nt,2,"#ffd9a8",.18)});for(let[H,nt]of[[-13.2,-8.4],[-13.2,6.4]])s(new J(.16,.2,.04,18),L("#3a3a44",.4),H,.02,nt),s(new J(.02,.02,1.6,8),L("#3a3a44",.4),H,.82,nt),s(new J(.2,.28,.34,20,1,!0),L("#fff1d6",.6,{side:fe,emissive:"#ffd9a0",emissiveIntensity:.7}),H,1.72,nt,i,p),an(i,H+.4,nt,1.4,"#ffd9a8",.25);let K=["#ff6fb5","#4aa8ff","#ffd34d","#45d2b4","#c3a6ff"].map(H=>new Gt(H)),lt=new Gt("#2a3150"),pt=new rn(r(.94,.05,.94,.02),new ne({toneMapped:!1}),30),yt=new Xt,Nt=new Gt;for(let H=0;H<6;H++)for(let nt=0;nt<5;nt++)yt.makeTranslation(-4.5+H,.025,2.5+nt),pt.setMatrixAt(H*5+nt,yt),pt.setColorAt(H*5+nt,lt);pt.receiveShadow=!0,i.add(pt),s(r(6.2,.04,5.2,.02),L("#c2cad6",.3,{metalness:.6}),-2,.012,4.5,i,p),e.animated.push(H=>{for(let nt=0;nt<30;nt++){let xt=.5+.5*Math.sin(H*.6+nt*1.7);Nt.copy(lt).lerp(K[(Math.floor(nt/5)+nt)%5],.4+.3*xt),pt.setColorAt(nt,Nt)}pt.instanceColor.needsUpdate=!0});let Ot=new ut(new ze(.35,1),new Zt({color:"#eef3fa",roughness:.1,metalness:.9,flatShading:!0}));Ot.position.set(-2,3,5),Ot.castShadow=!0,i.add(Ot),s(new J(.01,.01,.6,4),L("#888"),-2,3.45,5,i,p),e.animated.push(H=>{Ot.rotation.y=H*.8});let Vt=an(i,-2,4,1.4,"#ff6fb5",.4),Jt=an(i,-2,6,1.4,"#4aa8ff",.4);e.animated.push(H=>{Vt.position.set(-2+Math.sin(H*.5)*2.2,.06,4.5+Math.cos(H*.5)*1.6),Jt.position.set(-2+Math.sin(H*.5+Math.PI)*2.2,.06,4.5+Math.cos(H*.5+Math.PI)*1.6)}),s(r(2.2,.95,.8,.06),L("#24304f",.4),-11.5,.475,8.3),s(r(2.2,.05,.05),be("#ff6fb5",2),-11.5,.9,7.88,i,p),s(r(2.1,.05,.72,.02),L("#3a3a44",.4),-11.5,.97,8.3);for(let H of[-.5,.5])s(new J(.22,.22,.04,24),L("#16161c",.2),-11.5+H,1.02,8.3,i,p);s(r(.4,.04,.3,.01),be("#4aa8ff",1.2),-11.5,1.01,8.3,i,p);for(let H of[-13,-10])s(r(.7,1.6,.6,.06),L("#24304f",.5),H,.8,9.2),s(new J(.22,.22,.02,24),L("#3a3a44",.3),H,1.05,8.89,i,p).rotation.x=Math.PI/2,s(new J(.12,.12,.02,20),L("#3a3a44",.3),H,.5,8.89,i,p).rotation.x=Math.PI/2;o(-13.4,7.85,-9.6,9.6),[[.6,-3.4],[3,-2.6]].forEach(([H,nt],xt)=>{s(new J(.42,.42,.05,28),X,H,1.08,nt),s(new J(.04,.05,1.06,10),L("#3a3a44",.4),H,.53,nt),s(new J(.26,.3,.03,20),L("#3a3a44",.4),H,.015,nt),s(new J(.05,.04,.13,12),z,H+.12,1.17,nt-.05,i,p),s(new wt(.06,10,8),L(["#ff7aa8","#ffd34d"][xt],.7),H-.12,1.15,nt+.06,i,p),o(H-.45,nt-.45,H+.45,nt+.45)});let ct=lx();for(let H of[-7.6,8.4]){let nt=new ut(new ie(1.7,1.6),new ne({map:ct,toneMapped:!1}));nt.position.set(at.minX+.03,2.15,H),nt.rotation.y=Math.PI/2,i.add(nt),s(r(.08,1.8,1.9,.02),L("#ffffff",.5),at.minX+.02,2.15,H,i,p),s(r(.1,.05,1.7),L("#ffffff",.5),at.minX+.06,2.15,H,i,p),s(r(.1,1.6,.05),L("#ffffff",.5),at.minX+.06,2.15,H,i,p),s(r(.22,.06,1.95,.02),L("#ffffff",.5),at.minX+.1,1.32,H,i,p)}xx({scene:i,add:s,box:r,block:o,seat:ft,out:e}),vx({scene:i,add:s,box:r,block:o,out:e}),Ex({scene:i,add:s,box:r,block:o,out:e});let C=[L("#f6f1e8",.6),L("#d98b5f",.75)],Et=[L("#5fb36f",.85,{flatShading:!0}),L("#3f9a5a",.85,{flatShading:!0})],W=new ze(1,1);[[-13.3,-9.3],[-13.3,9.3],[-6,-9.3],[-13.3,-3.6],[14.3,9.2],[25.5,6.8]].forEach(([H,nt],xt)=>{s(new J(.26,.19,.5,18),C[xt%2],H,.25,nt),s(new J(.24,.24,.03,18),L("#6b4a32",.9),H,.49,nt,i,p);let gt=Ye(30+xt);for(let Dt=0;Dt<5;Dt++)s(W,Et[Dt%2],H+(gt()-.5)*.3,.8+gt()*.55,nt+(gt()-.5)*.3).scale.setScalar(.2+gt()*.12);o(H-.35,nt-.35,H+.35,nt+.35)});for(let H=M+1;H<A;H+=2.4)s(new J(.015,.015,1.1,8),L("#7c818d"),H,at.wallH-.55,S+.1,i,p),s(new Be(.2,.22,20,1,!0),L("#c99a5b",.4,{side:fe}),H,at.wallH-1.15,S+.1,i,p),s(new wt(.07,12,8),be("#ffd28a",3),H,at.wallH-1.23,S+.1,i,p),an(i,H,S+.9,1.25,"#ffd9a0",.32);let q=["#ffd28a","#ff9ccf","#9fd0ff","#b6f5d8"].map(H=>new Gt(H)),ot=96,dt=new rn(new wt(.035,8,6),new ne({toneMapped:!1}),ot),mt=new Xt;for(let H=0;H<ot;H++){let nt=H/(ot-1),xt=nt<.6,gt=xt?at.maxX-.4-nt/.6*(a-.8):at.minX+.1,Dt=xt?at.minZ+.1:at.minZ+.4+(nt-.6)/.4*(h-.8),zt=at.wallH-.25-Math.abs(Math.sin(H*.55))*.22;mt.makeTranslation(gt,zt,Dt),dt.setMatrixAt(H,mt),dt.setColorAt(H,q[H%4])}i.add(dt);let R=new ne({color:"#ffffff",toneMapped:!1}),b=new ut(new ie(2.4,3.2),R);b.position.set(at.minX+.075,2,-3.6),b.rotation.y=Math.PI/2,i.add(b),s(r(.06,3.36,2.56,.03),L("#1d2b4f",.4),at.minX+.03,2,-3.6,i,p),su("brand/simi-banner.jpg",H=>{R.map=H,R.needsUpdate=!0});let G=(H,nt,xt,gt,Dt,zt,$t,O)=>{let _t=new Yt;_t.position.set(Dt,zt,$t),_t.rotation.y=O,i.add(_t),s(r(nt+.18,xt+.18,.05,.03),L(gt,.5),0,0,0,_t,p);let tt=new ut(new ie(nt,xt),new ne({transparent:!0,opacity:0,toneMapped:!1}));tt.position.z=.03,_t.add(tt),su(H,ht=>{tt.material.map=ht,tt.material.opacity=1,tt.material.needsUpdate=!0})};G("brand/uniq.png",1.6,.57,"#142c5a",at.minX+.05,2.4,1.6,Math.PI/2),G("brand/crenot.png",1.8,.44,"#ffffff",at.minX+.05,2.4,6,Math.PI/2),G("brand/simi.png",1.3,.39,"#0a78f0",at.minX+.05,2.4,-.8,Math.PI/2);let et=4.8,st=2.7,j=ho,Rt=1.95,St=at.minZ+.17;s(r(et+.3,st+.3,.08,.04),L("#16161c",.35),j,Rt,at.minZ+.12,i,p),s(r(et+.6,.08,.3,.03),L("#2b2b33",.4),j,Rt-st/2-.22,at.minZ+.2,i,p);for(let H of[-1,1])s(r(.42,1,.36,.05),L("#22222a",.5),j+H*(et/2+.55),.5,at.minZ+.3);for(let H of[-1,1])for(let nt of[.72,.3])s(new J(nt>.5?.08:.13,nt>.5?.08:.13,.02,20),L("#3a3a44",.3),j+H*(et/2+.55),nt,at.minZ+.49,i,p).rotation.x=Math.PI/2;o(j-et/2-.8,at.minZ,j-et/2-.3,at.minZ+.5),o(j+et/2+.3,at.minZ,j+et/2+.8,at.minZ+.5);let At=new ut(new ie(et,st),new ne({map:ax(),toneMapped:!1}));At.position.set(j,Rt,St),i.add(At);let jt=new ut(new ie(et,st),new ne({color:0,opacity:0,blending:En,toneMapped:!1}));jt.position.set(j,Rt,St+.002),jt.visible=!1,i.add(jt),jt.userData.cinema=!0,At.userData.cinema=!0,e.cinema={x:j,y:Rt,z:St+.004,w:et,h:st,idle:At,hole:jt},Ax({scene:i,add:s,box:r,block:o,seat:ft,out:e,statics:n,flat:p,glassM:z}),Px({scene:i,add:s,box:r,block:o,seat:ft,out:e,flat:p,glassM:z,tableTop:X});function ft(H,nt,xt,gt,Dt,zt,$t,O){e.seats.push({id:H,x:nt,z:xt,face:gt,h:Dt,approach:zt,kind:$t,...O?{theme:O}:{}});let _t=new ut(new J(.32,.32,Dt+.1,10),new ne({visible:!1}));_t.position.set(nt,(Dt+.1)/2,xt),_t.userData.seatId=H,i.add(_t),e.seatMeshes.push(_t)}return t.tet&&iu(i,e,{minX:at.minX,maxX:at.maxX,minZ:at.minZ,maxZ:at.maxZ,inZ:at.inZ,cinemaX:ho,barX:Os,gate:{x:12.5,z:at.maxZ-.35,half:2.2},umbrellas:[[-10.4,13.4],[-6,15.4],[-1.6,13.2],[3,15.3]],lamps:[[-8,17],[-.5,11.4],[5.6,11.4],[17,17],[23.2,11.4],[-12.6,11.2]]}),fx(i,n),e.spawn={minX:8,maxX:16,minZ:13,maxZ:16.5},e}function fx(i,t){i.updateMatrixWorld(!0);let e=new Map;for(let n of t){let s=n.geometry.index?n.geometry.toNonIndexed():n.geometry.clone();for(let o of Object.keys(s.attributes))["position","normal","uv"].includes(o)||s.deleteAttribute(o);s.attributes.uv||s.setAttribute("uv",new ee(new Float32Array(s.attributes.position.count*2),2)),s.applyMatrix4(n.matrixWorld);let r=`${n.material.uuid}|${n.castShadow}|${n.receiveShadow}`;e.has(r)||e.set(r,{mat:n.material,cast:n.castShadow,receive:n.receiveShadow,geos:[]}),e.get(r).geos.push(s),n.parent.remove(n)}for(let{mat:n,cast:s,receive:r,geos:o}of e.values()){let a=Tn(o,!1);if(!a)continue;let l=new ut(a,n);l.castShadow=s,l.receiveShadow=r,l.matrixAutoUpdate=!1,i.add(l)}for(let n of[...i.children])n.isGroup&&n.children.length===0&&i.remove(n)}var se={cx:8,cz:.6,r:1.75,x1:4.9,x2:13.1,z1:-2.3,z2:3.5,gx1:5.4,gx2:10.6,gz1:5.2,gz2:8.4};function dx(){return Ce(256,512,(i,t,e)=>{let n=Ye(7);i.fillStyle="#d5d3a2",i.fillRect(0,0,t,e);for(let s=0;s<e;s+=4){let r=n();i.fillStyle=`rgba(${150+r*40},${150+r*30},${80+r*20},.18)`,i.fillRect(0,s,t,2)}i.fillStyle="#2f3b2c",i.fillRect(0,0,14,e),i.fillRect(t-14,0,14,e),i.fillStyle="rgba(255,255,255,.12)",i.fillRect(14,0,2,e),i.fillRect(t-16,0,2,e),i.fillStyle="rgba(90,80,40,.35)",i.fillRect(0,0,t,2),i.fillRect(0,e-2,t,2)})}function px(i){let n=1040/(se.gx2-se.gx1),s=640/(se.gz2-se.gz1);return Ce(1040,640,r=>{r.fillStyle="#ece5d3",r.fillRect(0,0,1040,640);let o=a=>{r.lineWidth=3,r.strokeStyle="rgba(150,135,105,.38)",a(0),r.lineWidth=2,r.strokeStyle="rgba(255,255,255,.75)",a(3)};o(a=>{for(let l=14;l<640;l+=18)r.beginPath(),r.moveTo(0,l+a),r.lineTo(1040,l+a),r.stroke()});for(let[a,l,c]of i){let f=(a-se.gx1)*n,h=(l-se.gz1)*s,d=c*n;r.fillStyle="#ece5d3",r.beginPath(),r.arc(f,h,d+6*18,0,Math.PI*2),r.fill(),o(p=>{for(let g=1;g<=6;g++)r.beginPath(),r.arc(f,h,d+g*18+p,0,Math.PI*2),r.stroke()})}})}function mx(){return Ce(768,240,(i,t,e)=>{let n=i.createLinearGradient(0,0,0,e);n.addColorStop(0,"#5b3a22"),n.addColorStop(1,"#3e2615"),i.fillStyle=n,i.fillRect(0,0,t,e),i.strokeStyle="rgba(0,0,0,.18)",i.lineWidth=2;for(let s=12;s<e;s+=17)i.beginPath(),i.moveTo(0,s),i.bezierCurveTo(t*.3,s+6,t*.6,s-6,t,s+3),i.stroke();i.strokeStyle="#d9b46a",i.lineWidth=5,i.strokeRect(12,12,t-24,e-24),i.textAlign="center",i.textBaseline="middle",i.fillStyle="#f3d58c",i.font='bold 74px "Segoe UI", "Noto Sans", "Helvetica Neue", Arial, sans-serif',i.fillText("THI\u1EC0N \xB7 D\u01AF\u1EE0NG SINH".normalize("NFC"),t/2,e*.42),i.fillStyle="#ead9b0",i.font='600 34px "Segoe UI", "Noto Sans", "Helvetica Neue", Arial, sans-serif',i.fillText("T\u0129nh t\xE2m \xB7 H\xEDt th\u1EDF \xB7 An nhi\xEAn".normalize("NFC"),t/2,e*.76)})}function gx({scene:i,add:t,box:e,block:n,seat:s,out:r}){let o={cast:!1},{cx:a,cz:l}=se,c=L("#6b4528",.6),f=L("#a77b4f",.6),h=L("#a9a59b",.95,{flatShading:!0}),d=se.x2-se.x1,p=se.z2-se.z1,g=(se.x1+se.x2)/2,_=(se.z1+se.z2)/2;t(e(d+.2,.03,p+.2,.01),c,g,.015,_,i,o);let m=dx();m.wrapS=m.wrapT=Kn,m.repeat.set(d/.9,p/1.8);let u=new ut(new ie(d,p),new Zt({map:m,roughness:.9}));u.rotation.x=-Math.PI/2,u.position.set(g,.032,_),u.receiveShadow=!0,i.add(u);let y=[L("#34446e",.95),L("#6d3b30",.95)],v=[L("#d98a2b",.9),L("#46598a",.9)],M=e(.74,.04,.74,.015),A=new J(.22,.24,.14,22);for(let W=0;W<8;W++){let q=W/8*Math.PI*2,ot=a+Math.sin(q)*se.r,dt=l+Math.cos(q)*se.r,mt=new Yt;mt.position.set(ot,0,dt),mt.rotation.y=q,i.add(mt),t(M,y[W%2],0,.052,.1,mt,o),t(A,v[W%2],0,.142,.05,mt),t(new ye(.23,.012,6,22),L("#f1e3c2",.8),0,.142,.05,mt,o).rotation.x=Math.PI/2,s(`z${W+1}`,ot+Math.sin(q)*.05,dt+Math.cos(q)*.05,q+Math.PI,.21,{x:a+Math.sin(q)*(se.r+.8),z:l+Math.cos(q)*(se.r+.8)},"zen")}t(new J(.5,.5,.05,32),L("#5a2219",.32),a,.3,l),t(new J(.51,.51,.015,32),L("#c9a14a",.4,{metalness:.5}),a,.27,l,i,o);for(let W=0;W<4;W++){let q=W*Math.PI/2+Math.PI/4;t(e(.06,.26,.06,.01),L("#3c1610",.4),a+Math.sin(q)*.36,.14,l+Math.cos(q)*.36)}let S=L("#9a7432",.35,{metalness:.7});t(new J(.11,.09,.1,18),S,a,.38,l),t(new ye(.11,.015,6,18),S,a,.43,l,i,o).rotation.x=Math.PI/2;for(let W of[-.03,0,.03])t(new J(.004,.004,.2,4),L("#7a3b22",.8),a+W,.53,l,i,o);for(let W of[-.03,0,.03])t(new wt(.01,6,4),be("#ff6a2a",3),a+W,.635,l,i,o);t(new J(.06,.08,.16,14),L("#e9eef2",.25),a-.27,.41,l+.12,i,o);for(let W=0;W<6;W++){let q=W*Math.PI/3;t(new wt(.05,8,6),L("#f39bb8",.7),a-.27+Math.sin(q)*.05,.52,l+.12+Math.cos(q)*.05,i,o).scale.set(.7,1.3,.7)}t(new wt(.035,8,6),L("#ffd84d",.6),a-.27,.53,l+.12,i,o),t(new J(.035,.035,.09,12),L("#fff6e4",.6),a+.25,.37,l-.15,i,o),t(new wt(.018,8,6),be("#ffcf6a",3),a+.25,.435,l-.15,i,o).scale.set(1,1.6,1),t(new J(.11,.11,.05,16),L("#6d3b30",.9),a+.2,.355,l+.22,i,o),t(new wt(.1,18,8,0,Math.PI*2,Math.PI/2,Math.PI/2),L("#c79b3c",.3,{metalness:.8,side:fe}),a+.2,.47,l+.22,i,o),n(a-.6,l-.6,a+.6,l+.6);let w=[];for(let W=0;W<6;W++){let q=new ut(new wt(.035,8,6),new ne({color:"#f4f1ea",transparent:!0,opacity:0,depthWrite:!1}));q.renderOrder=3,i.add(q),w.push(q)}r.animated.push(W=>{w.forEach((q,ot)=>{let dt=(W*.22+ot/w.length)%1;q.position.set(a+Math.sin(W*.9+ot*1.7)*.07*dt,.66+dt*1.3,l+Math.cos(W*.7+ot)*.05*dt),q.scale.setScalar(1+dt*3.2),q.material.opacity=.32*Math.sin(Math.PI*Math.min(1,dt*1.25))})}),an(i,a,l,3,"#d9f3cf",.26);let P=new Zt({color:"#fff1d6",roughness:.6,emissive:"#ffcf8a",emissiveIntensity:1.1}),D=L("#2c2420",.5),x=L("#5d5048",.8);for(let W=0;W<4;W++){let q=W*Math.PI/2+Math.PI/4,ot=a+Math.sin(q)*1.15,dt=l+Math.cos(q)*1.15,mt=2.55+W%2*.15;t(new J(.006,.006,at.wallH-mt-.22,4),x,ot,(at.wallH+mt+.22)/2,dt,i,o),t(new J(.1,.12,.04,16),D,ot,mt+.23,dt,i,o),t(new J(.1,.12,.04,16),D,ot,mt-.23,dt,i,o);let R=new ut(new wt(.2,18,12),P);R.scale.set(1,1.25,1),R.position.set(ot,mt,dt),i.add(R);for(let b=-1;b<=1;b++)t(new ye(.2*Math.sqrt(1-(b*.12/.25)**2),.004,4,20),D,ot,mt+b*.12,dt,i,o).rotation.x=Math.PI/2}r.animated.push(W=>{P.emissiveIntensity=1+Math.sin(W*.8)*.18});let E=12.1,N=.6;t(e(.8,.05,.55,.02),L("#4a2f1c",.45),E,.28,N);for(let[W,q]of[[-.34,-.22],[.34,-.22],[-.34,.22],[.34,.22]])t(e(.05,.25,.05,.01),L("#3a2414",.5),E+W,.14,N+q);t(e(.42,.02,.26,.01),f,E,.315,N,i,o),t(new wt(.075,16,12),L("#7a3a24",.4),E-.08,.39,N,i,o).scale.set(1,.85,1),t(new J(.012,.02,.09,8),L("#7a3a24",.4),E-.16,.4,N,i,o).rotation.z=.9,t(new ye(.04,.01,6,12),L("#7a3a24",.4),E+0,.4,N,i,o),t(new wt(.015,8,6),L("#7a3a24",.4),E-.08,.455,N,i,o);for(let W of[.07,.14])t(new J(.027,.02,.04,12),L("#f3efe4",.3),E+W,.345,N+(W>.1?.06:-.05),i,o);for(let[W,q]of[[-1,0],[1,Math.PI]]){let ot=N+W*.62,dt=new Yt;dt.position.set(E,0,ot),dt.rotation.y=q,i.add(dt),t(M,y[1],0,.052,0,dt,o),t(A,v[W<0?0:1],0,.142,-.04,dt),s(`zt${W<0?1:2}`,E,ot-W*.04,q,.21,{x:E,z:N+W*1.35},"zen")}n(E-.45,N-.32,E+.45,N+.32),an(i,E,N,1.4,"#ffe2b0",.2);let I=[[6.5,6.2,.38],[8.9,7.4,.3],[9.7,6,.22]],V=se.gx2-se.gx1,F=se.gz2-se.gz1,Q=(se.gx1+se.gx2)/2,Y=(se.gz1+se.gz2)/2,X=new ut(new ie(V,F),new Zt({map:px(I),roughness:1}));X.rotation.x=-Math.PI/2,X.position.set(Q,.07,Y),X.receiveShadow=!0,i.add(X),t(e(V,.06,F),L("#d9d1bd",1),Q,.03,Y,i,o);for(let[W,q,ot,dt]of[[V+.24,.12,Q,se.gz1-.06],[V+.24,.12,Q,se.gz2+.06],[.12,F,se.gx1-.06,Y],[.12,F,se.gx2+.06,Y]])t(e(W,.13,q,.02),c,ot,.065,dt);let it=[L("#8f8a80",.95,{flatShading:!0}),L("#76726b",.95,{flatShading:!0})],rt=L("#6f9a4a",.95,{flatShading:!0});I.forEach(([W,q,ot],dt)=>{let mt=t(new Ss(ot,0),it[dt%2],W,.07+ot*.45,q);mt.scale.set(1.15,.8+(dt===0?.35:0),.9),mt.rotation.set(.3*dt,.9*dt,.15);let R=Ye(40+dt);for(let b=0;b<4;b++){let G=R()*Math.PI*2;t(new ze(.1+R()*.07,0),rt,W+Math.sin(G)*ot*1.05,.08,q+Math.cos(G)*ot*1.05,i,o).scale.set(1.3,.45,1.3)}}),n(se.gx1-.15,se.gz1-.15,se.gx2+.15,se.gz2+.15);let bt=11.15,It=7.6;t(new J(.3,.34,.32,9),h,bt,.16,It);let K=new ut(new wn(.2,20),new Zt({color:"#6fb6d8",roughness:.1,emissive:"#2a7fb0",emissiveIntensity:.25}));K.rotation.x=-Math.PI/2,K.position.set(bt,.322,It),i.add(K);for(let[W,q,ot]of[[.42,.1,.12],[-.3,.38,.09],[.15,.42,.1]])t(new Ss(ot,0),h,bt+W,ot*.6,It+q,i,o);let lt=L("#9cba5a",.55);t(new J(.03,.03,.62,10),lt,bt+.45,.31,It-.25);let pt=t(new J(.022,.022,.42,10),lt,bt+.25,.55,It-.14,i,o);pt.rotation.set(0,0,Math.PI/2+.25),pt.rotation.y=-.5;let yt=new ut(new wt(.014,6,4),new ne({color:"#d6efff"}));i.add(yt);let Nt=new ut(new ti(.03,.045,20),new ne({color:"#ffffff",transparent:!0,opacity:0,depthWrite:!1}));Nt.rotation.x=-Math.PI/2,Nt.position.set(bt+.07,.326,It-.04),i.add(Nt),r.animated.push(W=>{let q=W*.8%1;yt.position.set(bt+.07,.5-q*q*.17,It-.04),yt.visible=q<.95;let ot=W*.8%1;Nt.scale.setScalar(1+ot*3),Nt.material.opacity=.6*(1-ot)}),n(bt-.5,It-.5,bt+.6,It+.6);let Ot=be("#ffd28a",1.5);for(let[W,q]of[[4.5,4.4],[11.4,4.4]]){t(new J(.2,.24,.1,6),h,W,.05,q),t(new J(.075,.09,.55,8),h,W,.37,q),t(e(.42,.07,.42,.02),h,W,.68,q),t(e(.3,.26,.3,.02),h,W,.85,q),t(e(.31,.15,.17),Ot,W,.86,q,i,o),t(e(.17,.15,.31),Ot,W,.86,q,i,o);let ot=t(new Be(.36,.22,4),h,W,1.09,q);ot.rotation.y=Math.PI/4,t(new wt(.05,8,6),h,W,1.23,q,i,o),an(i,W,q,1.1,"#ffd9a0",.22),n(W-.3,q-.3,W+.3,q+.3)}let Vt=L("#6fa64a",.55),Jt=L("#4e7d33",.6),ct=[L("#5f9e45",.85,{flatShading:!0}),L("#79b856",.85,{flatShading:!0})];[[5,-3,1],[13.5,3.3,3],[4.6,8.7,4]].forEach(([W,q,ot])=>{let dt=Ye(ot*13);t(new J(.42,.46,.12,14),L("#cfc6b4",.95),W,.06,q);for(let mt=0;mt<6;mt++){let R=dt()*Math.PI*2,b=.08+dt()*.24,G=W+Math.sin(R)*b,et=q+Math.cos(R)*b,st=2.2+dt()*.9;t(new J(.03,.036,st,8),Vt,G,st/2,et);for(let j=.4;j<st-.1;j+=.38)t(new J(.04,.04,.025,8),Jt,G,j,et,i,o);for(let j=0;j<3;j++){let Rt=dt()*Math.PI*2,St=t(new ze(.2+dt()*.1,0),ct[j%2],G+Math.sin(Rt)*.18,st-.2-j*.32,et+Math.cos(Rt)*.18,i,o);St.scale.set(1.4,.35,.8),St.rotation.y=Rt}}n(W-.5,q-.5,W+.5,q+.5)});let C=new Yt;C.position.set(4.55,0,3.45),C.rotation.y=.6,i.add(C);for(let W of[-.62,.62])t(e(.07,1.45,.07,.015),c,W,.725,0,C);t(e(1.42,.08,.1,.02),c,0,1.47,0,C,o);let Et=new ut(new ie(1.2,.375),new Zt({map:mx(),roughness:.6}));Et.position.set(0,1.13,.04),C.add(Et),t(e(1.26,.42,.05,.015),c,0,1.13,0,C,o),n(4.55-.7,3.45-.45,4.55+.7,3.45+.45)}var Zl={x:11.8,rows:[-8.1,-7,-5.9,-4.8,-3.7],cols:[-1.4,-.7,0,.7,1.4]},Hs={x:8.75,z:at.minZ+.55},Jl={x:7,y:2.33,w:1.44,h:1.56};function xx({scene:i,add:t,box:e,block:n,seat:s,out:r}){let o={cast:!1},a=Zl.x,l=at.minZ,c=L("#8c1d18",.35),f=L("#5c120f",.4),h=L("#d9a63e",.3,{metalness:.6}),d=L("#4a2a17",.55),p=new ut(new ie(2.3,2.6),new Zt({map:yx(),roughness:.7,emissive:"#3a0a06",emissiveIntensity:.25}));p.position.set(a,2.2,l+.1),i.add(p),t(e(2.42,2.72,.05,.02),d,a,2.2,l+.07,i,o);let g=l+.45;t(e(1.95,.08,.62,.02),c,a,1,g),t(e(1.95,.16,.03,.01),f,a,.88,g+.3,i,o),t(e(1.75,.025,.012),h,a,.88,g+.32,i,o);for(let[D,x]of[[-.9,-.26],[.9,-.26],[-.9,.26],[.9,.26]])t(e(.08,.96,.08,.015),f,a+D,.48,g+x);t(e(2.15,.42,.42,.03),c,a,.21,g+.55),t(e(2,.025,.012),h,a,.33,g+.767,i,o),n(a-1.15,l,a+1.15,g+.85);let _=g-.2;$l("thantai",a-.3,1.04,_,1.4,i,t,r),$l("ongdia",a+.3,1.04,_,1.4,i,t,r),$l("meo",a,.42,g+.56,1.5,i,t,r);let m=L("#9a7432",.35,{metalness:.7}),u=g+.18;t(new J(.11,.09,.11,16),m,a,1.095,u);for(let D of[-.035,0,.035])t(new J(.004,.004,.24,4),L("#7a3b22",.8),a+D,1.27,u,i,o);for(let D of[-.035,0,.035])t(new wt(.011,6,4),be("#ff6a2a",3),a+D,1.39,u,i,o);let y=[];for(let D=0;D<6;D++){let x=new ut(new wt(.035,8,6),new ne({color:"#f4f1ea",transparent:!0,opacity:0,depthWrite:!1}));x.renderOrder=3,i.add(x),y.push(x)}r.animated.push(D=>{y.forEach((x,E)=>{let N=(D*.2+E/y.length)%1;x.position.set(a+Math.sin(D*.8+E*1.9)*.08*N,1.42+N*1.1,u+Math.cos(D*.6+E)*.05*N),x.scale.setScalar(1+N*3),x.material.opacity=.3*Math.sin(Math.PI*Math.min(1,N*1.25))})});for(let D of[-1,1]){t(new J(.05,.07,.05,12),h,a+D*.82,1.065,g+.05,i,o),t(new J(.035,.035,.26,12),L("#c8231b",.5),a+D*.82,1.22,g+.05,i,o),t(new wt(.03,8,6),be("#ffcf6a",3),a+D*.82,1.38,g+.05,i,o).scale.set(1,1.5,1),t(new J(.06,.08,.22,14),L("#f3efe6",.25),a+D*.72,1.15,g-.17,i,o);for(let x=0;x<5;x++){let E=x*1.256;t(new wt(.07,10,8),L("#ffcc2e",.75),a+D*.72+Math.sin(E)*.07,1.36+x%2*.04,g-.17+Math.cos(E)*.07,i,o)}}let v=a-.5,M=g+.18;t(new J(.16,.13,.03,20),h,v,1.055,M,i,o),t(new wt(.1,14,10),L("#b9d65a",.7),v,1.15,M-.04,i,o);for(let[D,x,E]of[[-.1,.07,"#ff8a1e"],[.1,.07,"#d8261c"],[0,.11,"#ff8a1e"],[-.12,-.05,"#d8261c"]])t(new wt(.05,10,8),L(E,.55),v+D,1.11,M+x,i,o);for(let D=0;D<4;D++)t(new Le(.022,.15,4,8),L("#f5d23c",.6),v+.05+D*.03,1.22,M-.02,i,o).rotation.set(.2,0,.9-D*.15);for(let D=0;D<3;D++)t(e(.11,.04,.055,.012),h,a+.42+D*.1,1.06+(D===1?.04:0),g+.2,i,o);for(let D=0;D<4;D++)t(new J(.05,.05,.016,16),h,a+.62,1.05+D*.018,g+.05,i,o);for(let D of[-1,1])for(let x=0;x<2;x++)t(e(.12,.045,.06,.012),h,a+D*(.42+x*.14),.445,g+.58,i,o);let A=new Zt({color:"#e2261b",roughness:.5,emissive:"#ff3a1a",emissiveIntensity:.6});for(let D of[-1,1]){let x=a+D*1.45,E=2.85;t(new J(.006,.006,at.wallH-E-.25,4),L("#5d5048",.8),x,(at.wallH+E+.25)/2,l+.55,i,o);let N=new ut(new wt(.22,18,12),A);N.scale.set(1,.85,1),N.position.set(x,E,l+.55),i.add(N),t(new J(.09,.09,.05,14),h,x,E+.2,l+.55,i,o),t(new J(.09,.09,.05,14),h,x,E-.2,l+.55,i,o),t(new J(.012,.012,.22,6),L("#f5c518",.6),x,E-.34,l+.55,i,o);let z=a+D*1.55,I=l+.6;t(new J(.24,.18,.4,16),L("#2f6fb5",.4),z,.2,I),t(new J(.245,.245,.04,16),L("#f3efe6",.4),z,.39,I,i,o);let V=Ye(77+D);for(let F=0;F<6;F++)t(new ze(.2,1),L(F%2?"#3f8a3f":"#4f9d4a",.85,{flatShading:!0}),z+(V()-.5)*.3,.62+F*.1,I+(V()-.5)*.3,i,o).scale.setScalar(1-F*.1);for(let F=0;F<14;F++){let Q=V()*Math.PI*2,Y=.55+V()*.55,X=.2+(1-(Y-.55)/.55)*.08;t(new wt(.03,8,6),L("#ff9a1a",.5),z+Math.sin(Q)*X,Y,I+Math.cos(Q)*X,i,o)}n(z-.3,I-.3,z+.3,I+.3)}r.animated.push(D=>{A.emissiveIntensity=.55+Math.sin(D*1.3)*.12}),an(i,a,l+1.6,2.4,"#ffcf8a",.28);let S=[L("#d9a63e",.85),L("#b3241b",.9)],w=new J(.2,.22,.09,20),P=0;Zl.rows.forEach((D,x)=>Zl.cols.forEach(E=>{t(w,S[x%2],a+E,.045,D+.12,i,o),s(`k${++P}`,a+E,D,Math.PI,.09,{x:a+E,z:D+.6},"kneel","thantai")}))}function yx(){return Ce(900,1e3,(i,t,e)=>{let n=i.createLinearGradient(0,0,0,e);n.addColorStop(0,"#b3140f"),n.addColorStop(1,"#7a0c09"),i.fillStyle=n,i.fillRect(0,0,t,e),i.strokeStyle="rgba(255,215,110,.12)",i.lineWidth=5;for(let o=120;o<e;o+=120)for(let a=o/120%2*90;a<t;a+=180)i.beginPath(),i.arc(a,o,26,0,Math.PI*2),i.stroke(),i.beginPath(),i.arc(a,o,9,0,Math.PI*2),i.stroke();i.strokeStyle="#f2c14e",i.lineWidth=14,i.strokeRect(12,12,t-24,e-24),i.lineWidth=3,i.strokeRect(32,32,t-64,e-64),i.textAlign="center",i.textBaseline="middle";let s=(o,a)=>`${o} ${a}px "Segoe UI", "Noto Sans", Arial, sans-serif`;i.fillStyle="#3d1d0f",i.fillRect(90,60,t-180,170),i.strokeStyle="#f2c14e",i.lineWidth=7,i.strokeRect(102,72,t-204,146),i.fillStyle="#ffd56a",i.font=s(900,92),i.fillText("TH\u1EA6N T\xC0I".normalize("NFC"),t/2,148),i.fillStyle="#ffe9b0",i.font=s(800,40),i.fillText("C\u1EA7u nhi\u1EC1u \u0111\u01A1n \xB7 B\xE1n \u0111\u1EAFt nh\u01B0 t\xF4m t\u01B0\u01A1i".normalize("NFC"),t/2,290),i.save(),i.translate(t/2,520),i.rotate(Math.PI/4),i.fillStyle="#e8262b",i.fillRect(-120,-120,240,240),i.strokeStyle="#ffd56a",i.lineWidth=8,i.strokeRect(-108,-108,216,216),i.restore(),i.fillStyle="#ffd56a",i.font=s(900,74),i.fillText("L\u1ED8C".normalize("NFC"),t/2,525),i.strokeStyle="#7dff9a",i.lineWidth=12,i.lineJoin="round",i.beginPath(),[[250,900],[340,860],[410,880],[500,800],[580,820],[660,720]].forEach(([o,a],l)=>l?i.lineTo(o,a):i.moveTo(o,a)),i.stroke(),i.fillStyle="#7dff9a",i.beginPath(),i.moveTo(700,690),i.lineTo(640,700),i.lineTo(675,745),i.closePath(),i.fill();let r=(o,a)=>{i.fillStyle="#e8262b",i.fillRect(o-58,330,116,620),i.strokeStyle="#ffd56a",i.lineWidth=5,i.strokeRect(o-51,337,102,606),i.fillStyle="#ffd56a",i.font=s(800,38),a.forEach((l,c)=>i.fillText(l.normalize("NFC"),o,390+c*(540/a.length)))};r(100,["Kh\xE1ch","v\xE0o","nh\u01B0","n\u01B0\u1EDBc"]),r(t-100,["Ch\u1ED1t","\u0111\u01A1n","\u1EA7m","\u1EA7m"])})}function $l(i,t,e,n,s,r,o,a){let l={cast:!1},c=new Yt;c.position.set(t,e,n),c.scale.setScalar(s),r.add(c);let f=L("#f3c79a",.6),h=L("#e0ae3c",.28,{metalness:.65}),d=L("#d92a1c",.5);if(i==="thantai"){o(new J(.13,.17,.32,16),L("#e9b425",.35,{metalness:.3}),0,.16,0,c),o(new wt(.1,14,10),f,0,.42,0,c),o(new J(.08,.1,.09,14),L("#1d1d22",.5),0,.53,0,c,l);for(let p of[-1,1])o(new Kt(.08,.025,.03),L("#1d1d22",.5),p*.11,.53,0,c,l);o(new Le(.025,.08,4,8),L("#1d1d22",.6),0,.34,.09,c,l).rotation.x=.3,o(new zs(.13,.05,.06,2,.015),h,0,.2,.15,c,l)}else if(i==="ongdia")o(new wt(.17,16,12),L("#f08a2a",.5),0,.17,0,c).scale.set(1,.95,.9),o(new wt(.1,12,8),f,0,.15,.1,c,l).scale.set(1,1,.6),o(new wt(.11,14,10),f,0,.42,0,c),o(new ye(.045,.012,6,12,Math.PI),L("#8a2a1a",.6),0,.4,.1,c,l).rotation.z=Math.PI,o(new wn(.11,14,0,Math.PI),L("#f6e7c4",.6,{side:fe}),.17,.28,.05,c,l).rotation.set(0,-.4,.5);else{let p=L("#fbf8f2",.45);o(new wt(.085,14,10),p,0,.085,0,c).scale.set(1,1.1,.9),o(new wt(.075,14,10),p,0,.22,0,c);for(let m of[-1,1])o(new Be(.025,.05,6),p,m*.045,.29,0,c,l);o(new ye(.06,.01,6,16),d,0,.165,0,c,l).rotation.x=Math.PI/2,o(new J(.03,.03,.01,12),h,0,.13,.075,c,l).rotation.x=Math.PI/2;for(let m of[-1,1])o(new wt(.009,6,4),L("#1d1d22",.4),m*.028,.23,.068,c,l);let g=new Yt;g.position.set(.07,.2,0),c.add(g);let _=new ut(new Le(.022,.07,4,8),p);_.position.y=.05,g.add(_),a.animated.push(m=>{g.rotation.z=-.25+Math.sin(m*5)*.45})}return c}function _x(){return Ce(960,640,(i,t,e)=>{let n=i.createLinearGradient(0,0,0,e);n.addColorStop(0,"#7a1712"),n.addColorStop(1,"#4e0c09"),i.fillStyle=n,i.fillRect(0,0,t,e),i.strokeStyle="#f2c14e",i.lineWidth=16,i.strokeRect(12,12,t-24,e-24),i.lineWidth=4,i.strokeRect(36,36,t-72,e-72),i.textAlign="center",i.textBaseline="middle";let s=(o,a)=>`${o} ${a}px "Segoe UI", "Noto Sans", Arial, sans-serif`,r=(o,a,l,c,f)=>{for(o=o.normalize("NFC"),i.font=s(a,l);l>24&&i.measureText(o).width>t-120;)l-=2,i.font=s(a,l);i.fillStyle=f,i.fillText(o,t/2,c)};i.shadowColor="rgba(255,190,60,.7)",i.shadowBlur=18,r("\u{1F38B} XIN QU\u1EBA",900,150,170,"#ffd56a"),i.shadowBlur=0,r("\u0110\u1EA6U NG\xC0Y",900,96,300,"#ffe9b0"),r("M\u1ED7i ng\xE0y 1 qu\u1EBB may m\u1EAFn \u2728",800,54,420,"#fff3cf"),r("\u{1F449} B\u1EA5m v\xE0o \u1ED1ng qu\u1EBB",900,58,530,"#f5c518")})}function vx({scene:i,add:t,box:e,block:n,out:s}){let r={cast:!1},o=Hs.x,a=Hs.z,l=at.minZ,c=L("#a8191b",.4),f=L("#e0ae3c",.28,{metalness:.65}),h=L("#5b341c",.6);t(e(1.3,.06,.6,.02),c,o,.8,a),t(e(1.36,.03,.66,.01),f,o,.765,a,i,r);for(let[v,M]of[[-.58,-.24],[.58,-.24],[-.58,.24],[.58,.24]])t(e(.06,.77,.06,.015),h,o+v,.385,a+M);t(e(1.22,.32,.02,.01),L("#c8231b",.7),o,.6,a+.3,i,r),t(e(1.1,.03,.012),f,o,.46,a+.312,i,r);let d=new Yt;d.position.set(o-.15,.83,a-.02),i.add(d);let p=L("#c99a4a",.55);t(new J(.13,.12,.42,20,1,!0),L("#c99a4a",.55,{side:fe}),0,.21,0,d),t(new J(.12,.12,.02,20),p,0,.01,0,d,r);for(let v of[.08,.36])t(new ye(.128,.012,6,24),L("#8a6a2e",.5),0,v,0,d,r).rotation.x=Math.PI/2;t(new J(.131,.131,.06,20,1,!0),L("#b3241b",.6,{side:fe}),0,.22,0,d,r);let g=Ye(91);for(let v=0;v<22;v++){let M=g()*Math.PI*2,A=g()*.08,S=.5+g()*.12,w=new Yt;w.position.set(Math.cos(M)*A,.02,Math.sin(M)*A),w.rotation.set((g()-.5)*.25,M,(g()-.5)*.25),d.add(w),t(new Kt(.014,S,.006),L("#e6c27a",.6),0,S/2,0,w,r),t(new Kt(.016,.05,.008),L("#d22a1f",.5),0,S-.02,0,w,r)}t(new J(.16,.13,.025,20),f,o+.3,.845,a+.06,i,r),t(new Kt(.014,.5,.006),L("#e6c27a",.6),o+.3,.87,a+.06,i,r).rotation.set(Math.PI/2,0,.6),t(new J(.05,.04,.06,14),L("#9a7432",.35,{metalness:.7}),o+.5,.86,a-.18,i,r);for(let v of[-.012,.012])t(new wt(.007,6,4),be("#ff6a2a",3),o+.5+v,.98,a-.18,i,r);let m=new ut(new ie(1.8,1.2),new Zt({map:_x(),roughness:.75,emissive:"#2a0604",emissiveIntensity:.25}));m.position.set(o,2.12,l+.1),i.add(m),t(e(1.9,1.3,.05,.02),h,o,2.12,l+.07,i,r);let u=new ut(new Be(.05,.22,10),be("#e2261b",.6));u.position.set(o-.92,1.38,l+.12),i.add(u),s.animated.push(v=>{u.rotation.z=Math.sin(v*2.2)*.18}),an(i,o,a+.7,1.1,"#ffd9a0",.26),n(o-.7,l,o+.7,a+.35);let y=new ut(new Kt(1.4,1.5,.9),new ne({visible:!1}));y.position.set(o,.75,a),y.userData.action="fortune",i.add(y),s.clickables.push(y)}function Mx(i,t,e,n){let s=i.createLinearGradient(0,0,0,e);s.addColorStop(0,"#1259c8"),s.addColorStop(1,"#0a3483"),i.fillStyle=s,i.fillRect(0,0,t,e),i.strokeStyle="#f2c14e",i.lineWidth=14,i.strokeRect(10,10,t-20,e-20),i.strokeStyle="rgba(255,255,255,.35)",i.lineWidth=3,i.strokeRect(30,30,t-60,e-60),i.textAlign="center",i.textBaseline="middle";let r=(h,d)=>`${h} ${d}px "Segoe UI", "Noto Sans", Arial, sans-serif`,o=(h,d,p,g,_,m,u=t-110,y="center")=>{for(h=String(h||"").normalize("NFC"),i.textAlign=y,i.font=r(d,p);p>18&&i.measureText(h).width>u;)p-=2,i.font=r(d,p);i.fillStyle=m,i.fillText(h,g,_),i.textAlign="center"};i.shadowColor="rgba(0,0,0,.35)",i.shadowBlur=10,o("\u{1F4EE} H\xD2M TH\u01AF G\xD3P \xDD",900,76,t/2,104,"#ffd56a"),i.shadowBlur=0,o("C\xF9ng x\xE2y s\u1EA3n ph\u1EA9m SIMI t\u1ED1t h\u01A1n",700,34,t/2,168,"#e3eeff");let a=n&&n.summary||null,l=[["mobile","\u{1F4F1}","App mobile"],["zalo","\u{1F4AC}","Mini app Zalo"],["web","\u{1F310}","Website"],["other","\u2728","Kh\xE1c"]],c=216,f=134;l.forEach(([h,d,p],g)=>{let _=c+g*f;i.fillStyle="rgba(255,255,255,.12)",i.beginPath(),i.roundRect?i.roundRect(56,_,t-112,f-16,18):i.rect(56,_,t-112,f-16),i.fill(),o(d,400,56,112,_+(f-16)/2+2,"#fff",80),o(p,900,46,168,_+40,"#ffffff",t-260,"left");let m=a&&a[h];o(m?`${m.open} \u0111ang x\u1EED l\xFD \xB7 ${m.done} \u0111\xE3 c\u1EADp nh\u1EADt`:"G\u1EEDi \xFD t\u01B0\u1EDFng, b\xE1o l\u1ED7i\u2026",700,30,168,_+86,"#ffd56a",t-260,"left")}),i.fillStyle="#f2c14e",i.beginPath(),i.roundRect?i.roundRect(110,e-112,t-220,70,35):i.rect(110,e-112,t-220,70),i.fill(),o("\u{1F449} B\u1EA5m \u0111\u1EC3 g\u1EEDi g\xF3p \xFD",900,40,t/2,e-76,"#0a3483",t-260)}function Ex({scene:i,add:t,box:e,block:n,out:s}){let r={cast:!1},{x:o,y:a,w:l,h:c}=Jl,f=at.minZ,h=document.createElement("canvas");h.width=768,h.height=832;let d=new qe(h);d.colorSpace=xe,d.anisotropy=8;let p=D=>{try{Mx(h.getContext("2d"),h.width,h.height,D),d.needsUpdate=!0}catch{}};p(null);let g=new ut(new ie(l,c),new Zt({map:d,roughness:.55,emissive:"#0a2a6a",emissiveIntensity:.25}));g.position.set(o,a,f+.1),i.add(g),t(e(l+.1,c+.1,.05,.02),L("#d9a63e",.3,{metalness:.6}),o,a,f+.07,i,r),s.ideasBoard={draw:p,mesh:g};let _=f+.5,m=L("#d4231c",.45,{metalness:.15}),u=L("#3a1210",.6);t(e(.09,.78,.09,.02),L("#2d3440",.5,{metalness:.5}),o,.39,_),t(new J(.2,.22,.04,20),L("#2d3440",.5,{metalness:.5}),o,.02,_,i,r),t(e(.56,.42,.4,.04),m,o,.99,_);let y=t(new J(.2,.2,.56,24,1,!1,0,Math.PI),m,o,1.2,_);y.rotation.z=Math.PI/2,t(e(.34,.035,.02,.008),u,o,1.1,_+.205,i,r);let v=t(e(.22,.12,.006),L("#fffdf5",.8),o+.02,1.15,_+.215,i,r);v.rotation.z=-.12,t(e(.08,.05,.008),L("#e8493f",.6),o+.03,1.16,_+.219,i,r);let M=document.createElement("canvas");M.width=256,M.height=96;let A=M.getContext("2d");A.fillStyle="#ffd56a",A.fillRect(0,0,256,96),A.fillStyle="#7a1410",A.font='900 50px "Segoe UI", Arial, sans-serif',A.textAlign="center",A.textBaseline="middle",A.fillText("G\xD3P \xDD",128,52);let S=new qe(M);S.colorSpace=xe;let w=new ut(new ie(.3,.11),new Zt({map:S,roughness:.6}));w.position.set(o,.93,_+.202),i.add(w);let P=new Yt;P.position.set(o+.29,1.02,_),i.add(P);for(let[D,x,E,N]of[[new Kt(.02,.3,.02),L("#9aa3b0",.4,{metalness:.6}),.15,0],[new Kt(.012,.1,.14),L("#f5c518",.5),.26,.07]]){let z=new ut(D,x);z.position.set(0,E,N),z.castShadow=!0,P.add(z)}P.rotation.z=-Math.PI/2+.15,s.ideasFlag=P,n(o-.32,_-.25,o+.32,_+.25);for(let[D,x,E,N]of[[l+.1,c+.1,a,f+.15],[.7,1.45,.72,_]]){let z=new ut(new Kt(D,x,.5),new ne({visible:!1}));z.position.set(o,E,N),z.userData.action="ideas",i.add(z),s.clickables.push(z)}}function Sx(){return Ce(512,512,(i,t,e)=>{i.fillStyle="#2c3a6e",i.fillRect(0,0,t,e);let n=Ye(77);i.strokeStyle="rgba(150,175,245,.22)",i.lineWidth=3;for(let r=-64;r<e+64;r+=64)for(let o=-64;o<t+64;o+=64)i.beginPath(),i.moveTo(o,r+32),i.lineTo(o+32,r),i.lineTo(o+64,r+32),i.lineTo(o+32,r+64),i.closePath(),i.stroke();let s=["#ff6fb5","#4aa8ff","#ffd34d","#45d2b4"];for(let r=0;r<70;r++)i.fillStyle=s[r%4],i.globalAlpha=.35,i.beginPath(),i.arc(n()*t,n()*e,2+n()*2.5,0,7),i.fill();i.globalAlpha=1})}function ru(i){return Ce(256,200,(t,e,n)=>{let s=Ye(i),r=t.createLinearGradient(0,0,0,n);r.addColorStop(0,["#140a3a","#05263a","#2a0a26"][i%3]),r.addColorStop(1,"#000"),t.fillStyle=r,t.fillRect(0,0,e,n);for(let a=0;a<40;a++)t.fillStyle="rgba(255,255,255,.6)",t.fillRect(s()*e,s()*n*.7,2,2);let o=["#ff4fa3","#45d2b4","#ffd34d","#4aa8ff"];for(let a=0;a<9;a++){t.fillStyle=o[(a+i)%4];let l=30+a%3*70+s()*10,c=30+Math.floor(a/3)*34;t.fillRect(l,c,22,14),t.fillRect(l-6,c+6,34,6)}t.fillStyle="#ffffff",t.fillRect(e/2-14,n-40,28,12),t.fillRect(e/2-4,n-50,8,10),t.fillStyle="#ffd34d",t.font="bold 18px monospace",t.fillText("SCORE 0"+(12e3+i*3170),12,n-10)})}function bx(i,t,e){return Ce(1024,256,(n,s,r)=>{n.clearRect(0,0,s,r),n.textAlign="center",n.textBaseline="middle",n.font='900 120px "Nunito", "Segoe UI", sans-serif';for(let[o,a]of[[40,t],[16,t],[0,"#ffffff"]])n.shadowColor=t,n.shadowBlur=o,n.fillStyle=a,n.fillText(i,s/2,e?r/2-22:r/2);e&&(n.font='800 46px "Nunito", "Segoe UI", sans-serif',n.shadowBlur=12,n.fillStyle="#ffffff",n.fillText(e,s/2,r/2+72))})}function wx(){return Ce(256,256,(i,t)=>{let e=t/2;i.fillStyle="#1a1a1a",i.beginPath(),i.arc(e,e,e,0,7),i.fill();for(let n=0;n<20;n++){let s=n/20*Math.PI*2-Math.PI/20,r=s+Math.PI/10;for(let[o,a,l,c]of[[30,100,"#f3e6c8","#151515"],[100,112,"#1d8a4a","#d8262e"],[12,30,"#f3e6c8","#151515"],[70,80,"#1d8a4a","#d8262e"]])i.fillStyle=n%2?l:c,i.beginPath(),i.arc(e,e,a,s,r),i.arc(e,e,o,r,s,!0),i.closePath(),i.fill()}i.fillStyle="#1d8a4a",i.beginPath(),i.arc(e,e,12,0,7),i.fill(),i.fillStyle="#d8262e",i.beginPath(),i.arc(e,e,6,0,7),i.fill()})}var Tx=["#fbfaf5","#f5c518","#1f5fd1","#d8262e","#5b2c8f","#f07a1a","#1d8a4a","#8a1f2b","#141414","#f5c518","#1f5fd1","#d8262e","#5b2c8f","#f07a1a","#1d8a4a","#8a1f2b"];function Ax({scene:i,add:t,box:e,block:n,seat:s,out:r}){let o={cast:!1},a=14.6,l=at.maxX,c=at.minZ,f=9.6,h=Sx();h.wrapS=h.wrapT=Kn,h.repeat.set((l-a)/3,(f-c)/3);let d=new ut(new ie(l-a,f-c),new Zt({map:h,roughness:.95}));d.rotation.x=-Math.PI/2,d.position.set((a+l)/2,.006,(c+f)/2),d.receiveShadow=!0,i.add(d),t(e(.06,.02,f-c),be("#7c5cff",1.4),a+.03,.012,(c+f)/2,i,o),t(e(l-a,.02,.06),be("#7c5cff",1.4),(a+l)/2,.012,f-.03,i,o),t(e(l-a-.3,at.wallH-.02,.07),L("#231a4a",.9),(a+l)/2,at.wallH/2,at.minZ+.02,i,o);let p=new ut(new ie(4.4,1.1),new ne({map:bx("GAME ZONE","#b26bff"),transparent:!0,toneMapped:!1,depthWrite:!1}));p.position.set(20.8,2.95,at.minZ+.07),i.add(p),[15.5,16.65,17.8].forEach((I,V)=>{let F=new Yt;F.position.set(I,0,at.minZ+.5),i.add(F);let Q=L(["#ff4fa3","#2f8cf0","#45d2b4"][V],.5);t(e(.82,1.2,.72,.04),L("#20203a",.5),0,.6,0,F),t(e(.86,.06,.74,.02),Q,0,1.22,0,F,o),t(e(.82,.62,.42,.04),L("#20203a",.5),0,1.55,-.14,F),t(e(.86,.2,.5,.03),Q,0,1.96,-.1,F,o),t(e(.7,.12,.02),be(["#ff9ccf","#9fd0ff","#b6f5d8"][V],1.6),0,1.96,.16,F,o),t(e(.76,.06,.3,.02),L("#2b2b40",.5),0,1.04,.3,F,o),t(new wt(.035,10,8),L("#ff5a5f",.3),-.18,1.1,.32,F,o),t(new J(.03,.03,.04,10),L("#ffd34d",.3),.1,1.08,.3,F,o),t(new J(.03,.03,.04,10),L("#4aa8ff",.3),.2,1.08,.3,F,o);let Y=new ut(new ie(.66,.5),new ne({map:ru(V+3),toneMapped:!1}));Y.position.set(0,1.56,.075),Y.rotation.x=-.18,F.add(Y),an(i,I,at.minZ+1.3,.8,["#ff6fb5","#4aa8ff","#45d2b4"][V],.28)}),n(15,at.minZ,18.3,at.minZ+1),t(e(1.3,1.3,.06,.02),L("#8a5a3b",.5),20.8,1.55,at.minZ+.08,i,o);for(let I=0;I<6;I++)t(new J(.012,.018,1.2,8),L(I%2?"#c99a5b":"#9b6b3e",.45),20.3+I*.2,1.55,at.minZ+.14,i,o);let g=new ut(new wn(.34,40),new Zt({map:wx(),roughness:.8}));g.position.set(24.6,1.75,at.minZ+.1),i.add(g),t(new J(.42,.42,.05,40),L("#2b1a0e",.6),24.6,1.75,at.minZ+.07,i,o).rotation.x=Math.PI/2,t(e(1,.012,.05),be("#ffd34d",1.2),24.6,.012,at.minZ+2.4,i,o);let _=L("#169a63",.95),m=L("#6b3f22",.45),u=L("#0f6b45",.85),y=L("#0b0b0b",.9),v=L("#c9b06b",.35,{metalness:.5}),M=new wt(.032,14,10);r.poolTables=rx.map((I,V)=>{let{w:F,l:Q}=ts;t(e(F+.36,.16,Q+.36,.06),m,I.x,.74,I.z),t(e(F+.08,.05,Q+.08,.02),u,I.x,.83,I.z,i,o),t(e(F,.02,Q),_,I.x,.85,I.z,i,o),t(e(F+.1,.42,Q-.2,.05),m,I.x,.45,I.z);for(let[rt,bt]of[[-1,-1],[1,-1],[-1,1],[1,1]])t(e(.16,.66,.16,.04),m,I.x+rt*(F/2+.06),.33,I.z+bt*(Q/2+.06));for(let[rt,bt]of[[-1,-1],[1,-1],[-1,0],[1,0],[-1,1],[1,1]])t(new J(.06,.06,.03,16),y,I.x+rt*(F/2+.01),.855,I.z+bt*(Q/2+.01),i,o),t(new J(.075,.075,.02,16),v,I.x+rt*(F/2+.03),.825,I.z+bt*(Q/2+.03),i,o);t(e(.42,.12,1.9,.04),L("#1d2b4f",.5),I.x,2.45,I.z,i,o),t(e(.34,.02,1.8),be("#fff1d6",1.5),I.x,2.38,I.z,i,o);for(let rt of[-.6,.6])t(new J(.008,.008,.9,6),L("#7c818d"),I.x,2.95,I.z+rt,i,o);an(i,I.x,I.z,1.7,"#fff1d6",.32),n(I.x-F/2-.2,I.z-Q/2-.2,I.x+F/2+.2,I.z+Q/2+.2);let Y=new rn(M,new Zt({roughness:.2}),16);Y.castShadow=!1,Y.receiveShadow=!1,Tx.forEach((rt,bt)=>Y.setColorAt(bt,new Gt(rt))),i.add(Y);let X=new ut(new Kt(F+.4,1,Q+.4),new ne({visible:!1}));X.position.set(I.x,.5,I.z),X.userData.poolTable=V,i.add(X);let it=new ut(new ie(.34,.1),new ne({map:Ce(256,76,(rt,bt,It)=>{rt.fillStyle="#f3e3c3",rt.fillRect(0,0,bt,It),rt.fillStyle="#3a2412",rt.font="900 46px Nunito, sans-serif",rt.textAlign="center",rt.textBaseline="middle",rt.fillText(`B\xC0N ${V+1}`,bt/2,It/2+2)})}));return it.position.set(I.x,.74,I.z+Q/2+.185),i.add(it),{...I,index:V,balls:Y,hit:X,spots:[{x:I.x,z:I.z-Q/2-.55,face:0},{x:I.x,z:I.z+Q/2+.55,face:Math.PI}]}});let A=17.2,S=3.4;t(e(1.3,.22,.8,.05),L("#2f8cf0",.5),A,.82,S),t(e(1.12,.02,.64),L("#169a63",.9),A,.93,S,i,o),t(e(1,.7,.6,.05),L("#1d2b4f",.5),A,.36,S);for(let I=0;I<6;I++){let V=A-.48+I*.19;t(new J(.012,.012,1.15,6),L("#c2cad6",.25,{metalness:.7}),V,.98,S,i,o).rotation.x=Math.PI/2;for(let F of[-1,1])t(new J(.035,.035,.07,10),L(I%2?"#ff5a5f":"#ffd34d",.4),V,.98,S+F*.66,i,o).rotation.x=Math.PI/2;for(let F=0;F<2;F++)t(e(.03,.08,.03),L(I%2?"#ff5a5f":"#ffd34d",.4),V,.95,S-.15+F*.3,i,o)}n(A-.7,S-.75,A+.7,S+.75),t(e(2.2,.45,.5,.05),L("#2b2b40",.5),22.4,.225,1),t(e(2.4,1.36,.08,.03),L("#16161c",.35),22.4,1.25,1.05);let w=new ut(new ie(2.26,1.22),new ne({map:ru(9),toneMapped:!1}));w.position.set(22.4,1.25,1.095),i.add(w),n(21.2,.6,23.6,1.4);let P=L("#7c5cff",.85),D=L("#ffd34d",.8),x=new Yt;x.position.set(22.4,0,4),x.rotation.y=Math.PI,i.add(x),t(e(2.5,.32,.9,.08),P,0,.27,0,x),t(e(2.3,.14,.78,.07),P,0,.47,.04,x),t(e(2.5,.7,.24,.1),P,0,.62,-.34,x);for(let I of[-1,1])t(e(.22,.52,.9,.09),P,I*1.24,.42,0,x);for(let I of[-.7,.7])t(e(.34,.32,.12,.06),D,I,.68,-.2,x).rotation.x=-.2;for(let I=-1;I<=1;I++)s(`gs${I+2}`,22.4-I*.75,4.05,Math.PI,.47,{x:22.4-I*.75,z:3.2});n(21.1,3.5,23.7,4.5),t(new J(.42,.42,.04,28),L("#fbf7f0",.4),22.4,.42,2.55),t(new J(.06,.09,.4,10),L("#3a3a44",.4),22.4,.2,2.55),t(e(.18,.04,.1,.02),L("#1a1a1a",.4),22.3,.46,2.5,i,o),t(e(.18,.04,.1,.02),L("#f5f5f5",.4),22.55,.46,2.62,i,o),n(21.95,2.1,22.85,3);let E=[L("#ff9a6b",.95),L("#45d2b4",.95)];[[20.3,2.6,Math.PI*.82],[24.5,2.6,-Math.PI*.82]].forEach(([I,V,F],Q)=>{t(new wt(.44,18,12),E[Q],I,.26,V).scale.set(1,.6,1);let X=t(new wt(.3,14,10),E[Q],I-Math.sin(F)*.26,.48,V-Math.cos(F)*.26);X.scale.set(1.1,.9,.7),X.rotation.y=F,s(`gb${Q+1}`,I,V,F,.36,{x:I+Math.sin(F)*.8,z:V+Math.cos(F)*.8})});let N=17.6,z=7.2;t(e(2.3,.05,1.28,.02),L("#1f5fd1",.6),N,.76,z),t(e(2.3,.006,.02),L("#ffffff",.6),N,.788,z,i,o),t(e(.02,.006,1.26),L("#ffffff",.6),N-1.14,.788,z,i,o),t(e(.02,.006,1.26),L("#ffffff",.6),N+1.14,.788,z,i,o),t(e(.02,.16,1.4),L("#f6f3ee",.8),N,.86,z,i,o);for(let[I,V]of[[-.95,-.5],[.95,-.5],[-.95,.5],[.95,.5]])t(e(.06,.74,.06),L("#3a3a44",.4),N+I,.37,z+V,i,o);t(e(.16,.02,.15,.01),L("#d8262e",.6),N-.6,.8,z+.3,i,o),t(new wt(.02,8,6),L("#ffffff",.4),N+.4,.82,z-.2,i,o),n(N-1.2,z-.7,N+1.2,z+.7),[[23.3,"#ff7aa8"],[24.5,"#4aa8ff"]].forEach(([I,V])=>{t(e(1,.85,.9,.05),L(V,.5),I,.425,8.5),t(e(.96,.95,.86),new Zt({color:"#dff1ff",roughness:.05,transparent:!0,opacity:.35}),I,1.33,8.5,i,o),t(e(1.02,.22,.92,.05),L(V,.5),I,1.91,8.5,i,o),t(e(.8,.1,.02),be("#fff1d6",1.4),I,1.91,8.97,i,o);let F=Ye(Math.round(I*10));for(let Q=0;Q<9;Q++)t(new wt(.1,10,8),L(["#ffd34d","#ff9ccf","#9fd0ff","#b6f5d8","#c3a6ff"][Q%5],.8),I-.3+Q%3*.3+F()*.05,.95+Math.floor(Q/3)*.05,8.3+F()*.3,i,o);t(e(.04,.3,.04),L("#c2cad6",.3,{metalness:.6}),I+.1,1.6,8.5,i,o),n(I-.55,8,I+.55,9)}),t(e(.95,1.95,.75,.05),L("#e1262d",.45),21.8,.975,8.6),t(e(.6,1.3,.02),be("#d9f1ff",.9),21.68,1.15,8.98,i,o);for(let I=0;I<4;I++)for(let V=0;V<4;V++)t(new J(.035,.035,.13,10),L(["#ffd34d","#45d2b4","#ff9ccf","#4aa8ff"][V],.4),21.48+V*.13,.65+I*.3,8.95,i,o);t(e(.18,.5,.02),L("#2b2b33",.4),22.13,1.2,8.98,i,o),n(21.3,8.2,22.3,9);for(let I=.8;I<=6.2;I+=1.8){t(e(.5,.45,1.5,.06),L("#e3d5bf",.8),14.3,.225,I);for(let V=0;V<3;V++)t(new ze(.22,1),L(V%2?"#5fb36f":"#3f9a5a",.85,{flatShading:!0}),14.3+(V-1)*.04,.6,I-.45+V*.45);n(14,I-.8,14.6,I+.8)}}function Rx(){let i=Ye(55),t=Ce(1024,512,(e,n,s)=>{for(let o=0;o<s;o+=48){let a=-Math.floor(i()*300);for(;a<n;){let l=300+Math.floor(i()*300),c=i();e.fillStyle=`rgb(${Math.round(196+c*16)},${Math.round(150+c*14)},${Math.round(104+c*12)})`,e.fillRect(a,o,l,48),e.strokeStyle="rgba(120,80,45,.12)",e.lineWidth=1.2;for(let f=0;f<3;f++){let h=o+8+i()*32;e.beginPath(),e.moveTo(a,h);for(let d=a;d<a+l;d+=40)e.lineTo(d,h+Math.sin(d*.02+f)*2);e.stroke()}e.fillStyle="rgba(90,60,30,.35)",e.fillRect(a,o,3,48),a+=l}e.fillStyle="rgba(90,60,30,.4)",e.fillRect(0,o,n,3)}});return t.wrapS=t.wrapT=Kn,t}function Cx(){return Ce(1024,192,(i,t,e)=>{let n=i.createLinearGradient(0,0,t,0);n.addColorStop(0,"#0a5cc2"),n.addColorStop(1,"#0a78f0"),i.fillStyle=n,i.fillRect(0,0,t,e),i.fillStyle="#ffffff",i.textAlign="center",i.textBaseline="middle",i.font='900 86px "Nunito", "Segoe UI", sans-serif',i.fillText("V\u0102N PH\xD2NG AI",t/2,e/2-12),i.font='800 36px "Nunito", "Segoe UI", sans-serif',i.fillStyle="#ffd34d",i.fillText("SIMI \xB7 BAR \xB7 GAME \xB7 CINEMA",t/2,e/2+56)})}function Px({scene:i,add:t,box:e,block:n,seat:s,out:r,glassM:o,tableTop:a}){let l={cast:!1},c=at.inZ,f=at.maxZ,h=at.minX,d=at.maxX,p=Rx();p.repeat.set((d-h)/10,(f-c)/5);let g=new ut(new ie(d-h,f-c),new Zt({map:p,roughness:.85}));g.rotation.x=-Math.PI/2,g.position.set((h+d)/2,.001,(c+f)/2),g.receiveShadow=!0,i.add(g),r.deck=g,t(e(d-h,.03,.24,.01),L("#d8d2c6",.8),(h+d)/2,.015,c,i,l);let _=L("#4f9d5d",.9),m=L("#5fb36f",.9,{flatShading:!0}),u=(X,it,rt,bt)=>{let It=Math.abs(rt-X)||.5,K=Math.abs(bt-it)||.5;t(e(It,.7,K,.18),_,(X+rt)/2,.35,(it+bt)/2);let lt=Math.max(2,Math.round(Math.max(It,K)/.7));for(let pt=0;pt<lt;pt++){let yt=(pt+.5)/lt;t(new ze(.3,1),m,X+(rt-X)*yt,.72,it+(bt-it)*yt,i).scale.set(1,.6,1)}n(Math.min(X,rt)-.25,Math.min(it,bt)-.25,Math.max(X,rt)+.25,Math.max(it,bt)+.25)};u(h+.3,c+.6,h+.3,f-.35),u(d-.3,c+.6,d-.3,f-.35),u(h+.6,f-.35,10,f-.35),u(15,f-.35,d-.6,f-.35);let y=[L("#ff7aa8",.7),L("#ffd34d",.7),L("#ffffff",.7),L("#c3a6ff",.7)],v=Ye(91);for(let[X,it]of[[h+1.2,9.4],[15.6,d-1.2]])for(let rt=X;rt<it;rt+=.55)t(new wt(.07,8,6),y[Math.floor(v()*4)],rt+v()*.2,.12,f-.95+v()*.15,i,l);let M=12.5,A=f-.35;for(let X of[-2.2,2.2])t(e(.32,3,.32,.05),L("#ffffff",.5),M+X,1.5,A),t(e(.5,.18,.5,.04),L("#d8d2c6",.7),M+X,.09,A),n(M+X-.25,A-.25,M+X+.25,A+.25);t(e(4.9,.7,.24,.06),L("#0a5cc2",.5),M,3.1,A);let S=new ut(new ie(4.6,.62),new ne({map:Cx(),toneMapped:!1}));S.position.set(M,3.1,A+.125),i.add(S);let w=new ut(new ie(2.6,1.3),new Zt({map:Ce(512,256,(X,it,rt)=>{X.fillStyle="#0a5cc2",X.fillRect(0,0,it,rt),X.strokeStyle="#ffd34d",X.lineWidth=10,X.strokeRect(14,14,it-28,rt-28),X.fillStyle="#fff",X.font="900 64px Nunito, sans-serif",X.textAlign="center",X.textBaseline="middle",X.fillText("XIN CH\xC0O",it/2,rt/2+4)}),roughness:.95}));w.rotation.x=-Math.PI/2,w.position.set(M,.006,A-1.1),i.add(w);let P=[L("#0a78f0",.7,{side:fe}),L("#ff7a6b",.7,{side:fe}),L("#2fc1a5",.7,{side:fe}),L("#ffd34d",.7,{side:fe})],D=L("#e9eef5",.4,{metalness:.3}),x=L("#f6f3ee",.5);[[-10.4,13.4],[-6,15.4],[-1.6,13.2],[3,15.3]].forEach(([X,it],rt)=>{t(new J(.52,.52,.04,28),a,X,.74,it),t(new J(.04,.05,.72,10),D,X,.36,it),t(new J(.26,.3,.03,20),D,X,.015,it),t(new J(.025,.025,2.4,8),x,X,1.2,it,i,l),t(new Be(1.15,.45,8,1,!0),P[rt],X,2.45,it),t(new wt(.05,8,6),x,X,2.7,it,i,l),t(new J(.05,.04,.12,12),o,X+.15,.82,it,i,l),t(new J(.05,.04,.12,12),o,X-.12,.82,it+.12,i,l),n(X-.58,it-.58,X+.58,it+.58);for(let bt=0;bt<3;bt++){let It=bt/3*Math.PI*2+.5,K=X+Math.sin(It)*.95,lt=it+Math.cos(It)*.95,pt=new Yt;pt.position.set(K,0,lt),pt.rotation.y=It+Math.PI,i.add(pt),t(new J(.22,.22,.05,18),D,0,.46,0,pt),t(e(.4,.34,.04,.02),D,0,.7,-.2,pt);for(let[yt,Nt]of[[-.15,-.15],[.15,-.15],[-.15,.15],[.15,.15]])t(new J(.014,.014,.46,6),D,yt,.23,Nt,pt,l);s(`o${rt+1}${"abc"[bt]}`,K,lt,It+Math.PI,.48,{x:X+Math.sin(It)*1.55,z:it+Math.cos(It)*1.55})}});let E=20.2,N=13.8;t(new J(1.5,1.6,.45,40),L("#e7e1d6",.7),E,.225,N),t(new J(1.32,1.32,.04,40),L("#cfc7b8",.7),E,.44,N,i,l);let z=new ut(new J(1.3,1.3,.02,40),new Zt({color:"#7cc4ff",roughness:.1,emissive:"#2f8cf0",emissiveIntensity:.35,transparent:!0,opacity:.85}));z.position.set(E,.43,N),i.add(z),t(new J(.16,.22,.9,16),L("#e7e1d6",.7),E,.9,N),t(new J(.55,.2,.18,24),L("#e7e1d6",.7),E,1.4,N);let I=new ut(new J(.03,.08,.6,10),new ne({color:"#d6efff",transparent:!0,opacity:.7}));I.position.set(E,1.75,N),i.add(I);let V=[0,1].map(()=>{let X=new ut(new ti(.3,.36,40),new ne({color:"#ffffff",transparent:!0,opacity:.5,depthWrite:!1}));return X.rotation.x=-Math.PI/2,X.position.set(E,.47,N),i.add(X),X});r.animated.push(X=>{V.forEach((it,rt)=>{let bt=(X*.35+rt*.5)%1;it.scale.setScalar(1+bt*2.6),it.material.opacity=.45*(1-bt)}),I.scale.y=1+Math.sin(X*6)*.06}),n(E-1.65,N-1.65,E+1.65,N+1.65);let F=L("#d8d2c6",.8);[[E-3,N,Math.PI/2],[E+3,N,-Math.PI/2],[E,N-3,0]].forEach(([X,it,rt],bt)=>{let It=new Yt;It.position.set(X,0,it),It.rotation.y=rt,i.add(It),t(e(1.7,.1,.5,.04),L("#b8875a",.6),0,.46,0,It),t(e(1.7,.4,.07,.03),L("#b8875a",.6),0,.72,-.24,It);for(let pt of[-.65,.65])t(e(.14,.42,.44,.03),F,pt,.21,0,It);let K=Math.cos(rt),lt=Math.sin(rt);for(let pt of[-.42,.42])s(`fb${bt+1}${pt<0?"a":"b"}`,X+pt*K,it-pt*lt,rt,.5,{x:X+pt*K+lt*.7,z:it-pt*lt+K*.7});n(X-.9*Math.abs(K)-.3*Math.abs(lt),it-.9*Math.abs(lt)-.3*Math.abs(K),X+.9*Math.abs(K)+.3*Math.abs(lt),it+.9*Math.abs(lt)+.3*Math.abs(K))});let Q=L("#8a5a3b",.8),Y=[L("#4f9d5d",.85,{flatShading:!0}),L("#5fb36f",.85,{flatShading:!0}),L("#3f8a4f",.85,{flatShading:!0})];[[-12.4,16.4],[25,16.4],[24.9,11.2],[7.3,16.6]].forEach(([X,it],rt)=>{t(new J(.12,.18,1.8,10),Q,X,.9,it);let bt=Ye(140+rt);for(let It=0;It<6;It++)t(new ze(1,1),Y[It%3],X+(bt()-.5)*.9,2.1+bt()*.8,it+(bt()-.5)*.9).scale.setScalar(.45+bt()*.25);n(X-.3,it-.3,X+.3,it+.3)});for(let[X,it]of[[-8,17],[-.5,11.4],[5.6,11.4],[17,17],[23.2,11.4],[-12.6,11.2]])t(new J(.14,.18,.12,14),L("#2b2b33",.4),X,.06,it),t(new J(.035,.035,2.1,8),L("#2b2b33",.4),X,1.1,it),t(new wt(.17,14,10),be("#fff1d0",1.6),X,2.25,it,i,l),an(i,X,it,1.4,"#ffe3b0",.22),n(X-.18,it-.18,X+.18,it+.18)}var Ix=[.37,1.9,4.3,9.7,23.1];function Lx(i,t){let e=new Set,n=new Set,s=(r,o)=>{if(!(!r||typeof r!="object"||n.has(r)||o>4)){if(n.add(r),r.isObject3D){r.traverse(a=>e.add(a));return}if(!(r.isMaterial||r.isTexture||r.isBufferGeometry))for(let a of Object.keys(r))a!=="animated"&&s(r[a],o+1)}};for(let r of t||Object.keys(i))r!=="animated"&&s(i[r],1);return e}var Dx=i=>[i.visible,i.opacity,i.color&&i.color.getHex(),i.emissive&&i.emissive.getHex(),i.emissiveIntensity,i.map&&i.map.offset.x,i.map&&i.map.offset.y,i.map&&i.map.rotation].join("|");function Ux(i,t){let e=[];i.traverse(l=>{l.isMesh&&e.push(l)});let n=new Set;e.forEach(l=>[].concat(l.material).forEach(c=>n.add(c)));let s=()=>(i.updateMatrixWorld(!0),{m:new Map(e.map(l=>[l,l.matrixWorld.elements.join(",")+"|"+au(l)])),mat:new Map([...n].map(l=>[l,Dx(l)]))}),r=s(),o=new Set,a=new Set;for(let l of Ix){for(let f of t)try{f(l,.016)}catch{}let c=s();for(let f of e)c.m.get(f)!==r.m.get(f)&&o.add(f);for(let f of n)c.mat.get(f)!==r.mat.get(f)&&a.add(f)}return{movers:o,live:a}}function au(i){for(let t=i;t;t=t.parent)if(!t.visible)return 0;return 1}var lu=i=>i.isMeshStandardMaterial&&!i.map&&!i.emissiveMap&&!i.normalMap&&!i.roughnessMap&&!i.alphaMap&&!i.aoMap&&!i.lightMap&&!i.bumpMap&&!i.envMap&&(!i.emissive||i.emissive.getHex()===0||!i.emissiveIntensity)&&!i.vertexColors&&!(i.userData&&Object.keys(i.userData).length);function Nx(i){let t={plain:lu(i)};for(let e of["type","side","flatShading","vertexColors","toneMapped","roughness","metalness","emissiveIntensity","opacity","transparent","alphaTest","depthWrite","wireframe","fog","blending"])t[e]=i[e];for(let e of["emissive","specular"])i[e]&&i[e].getHex&&(t[e]=i[e].getHex());!t.plain&&i.color&&(t.color=i.color.getHex());for(let e of["map","emissiveMap","normalMap","roughnessMap","alphaMap","envMap","lightMap","aoMap","bumpMap"])t[e]=i[e]?i[e].uuid:null;return i.userData&&Object.keys(i.userData).length&&(t.ud=i.uuid),JSON.stringify(t)}function cu(i,t,{keep:e}={}){i.updateMatrixWorld(!0);let n=Lx(t,e),{movers:s,live:r}=Ux(i,t.animated||[]);i.updateMatrixWorld(!0);let o=new Map,a=0,l={},c=g=>{l[g]=(l[g]||0)+1};i.traverse(g=>{if(!g.isMesh)return;if(a++,g.isInstancedMesh||g.isSkinnedMesh)return c("instanced");if(n.has(g))return c("ref");if(s.has(g))return c("moves");if(!au(g))return c("hidden");if(Object.keys(g.userData||{}).length||g.parent&&Object.keys(g.parent.userData||{}).length)return c("userData");if(Array.isArray(g.material))return c("multimat");let _=g.material;if(!_||r.has(_))return c("livemat");if(_.transparent||!_.visible||_.isShaderMaterial)return c("transparent");if(g.onBeforeRender!==Re.prototype.onBeforeRender)return c("hook");let m=g.geometry;if(!m||!m.attributes.position||m.morphAttributes&&Object.keys(m.morphAttributes).length)return c("geo");let u=[Nx(_),g.castShadow?1:0,g.receiveShadow?1:0,g.renderOrder].join("|");o.has(u)||o.set(u,{mat:_,plain:lu(_),cast:g.castShadow,recv:g.receiveShadow,order:g.renderOrder,items:[]}),o.get(u).items.push(g)});let f=0,h=0;for(let g of o.values()){if(g.items.length<2)continue;let _=!!g.mat.map,m=g.items.some(A=>!A.geometry.index),u=[];for(let A of g.items){let S=A.geometry;m&&S.index&&(S=S.toNonIndexed());let w=new Ee,P=D=>(D.isInterleavedBufferAttribute,D.clone());if(w.setAttribute("position",P(S.attributes.position)),S.attributes.normal&&w.setAttribute("normal",P(S.attributes.normal)),_&&S.attributes.uv&&w.setAttribute("uv",P(S.attributes.uv)),!m&&S.index&&w.setIndex(S.index.clone()),w.attributes.normal||w.computeVertexNormals(),g.plain){let D=A.material.color,x=w.attributes.position.count,E=new Float32Array(x*3);for(let N=0;N<x;N++)E[N*3]=D.r,E[N*3+1]=D.g,E[N*3+2]=D.b;w.setAttribute("color",new Ae(E,3))}w.applyMatrix4(A.matrixWorld),u.push(w),S!==A.geometry&&S.dispose()}let y=Tn(u,!1);if(u.forEach(A=>A.dispose()),!y)continue;let v=g.mat;g.plain&&(v=g.mat.clone(),v.color=new Gt(1,1,1),v.vertexColors=!0,v.needsUpdate=!0);let M=new ut(y,v);M.castShadow=g.cast,M.receiveShadow=g.recv,M.renderOrder=g.order,M.matrixAutoUpdate=!1,M.name="merged",i.add(M);for(let A of g.items)A.parent.remove(A),h++;f++}let d=[];i.traverse(g=>{g!==i&&g.type==="Group"&&!g.children.length&&!n.has(g)&&d.push(g)});for(let g of d)g.parent&&g.parent.remove(g);i.updateMatrixWorld(!0);let p=[...o.values()].map(g=>g.items.length).sort((g,_)=>_-g);return{before:a,removed:h,merged:f,why:l,groups:o.size,sizes:p.slice(0,12)}}var hu=new U,Fx=new We,uu=new U,uo=class extends Re{constructor(t=document.createElement("div")){super(),this.isCSS3DObject=!0,this.element=t,this.element.style.position="absolute",this.element.style.pointerEvents="auto",this.element.style.userSelect="none",this.element.setAttribute("draggable",!1),this.addEventListener("removed",function(){this.traverse(function(e){e.element instanceof Element&&e.element.parentNode!==null&&e.element.parentNode.removeChild(e.element)})})}copy(t,e){return super.copy(t,e),this.element=t.element.cloneNode(!0),this}};var Rn=new Xt,zx=new Xt,fo=class{constructor(t={}){let e=this,n,s,r,o,a={camera:{style:""},objects:new WeakMap},l=t.element!==void 0?t.element:document.createElement("div");l.style.overflow="hidden",this.domElement=l;let c=document.createElement("div");c.style.transformOrigin="0 0",c.style.pointerEvents="none",l.appendChild(c);let f=document.createElement("div");f.style.transformStyle="preserve-3d",c.appendChild(f),this.getSize=function(){return{width:n,height:s}},this.render=function(m,u){let y=u.projectionMatrix.elements[5]*o;u.view&&u.view.enabled?(c.style.transform=`translate( ${-u.view.offsetX*(n/u.view.width)}px, ${-u.view.offsetY*(s/u.view.height)}px )`,c.style.transform+=`scale( ${u.view.fullWidth/u.view.width}, ${u.view.fullHeight/u.view.height} )`):c.style.transform="",m.matrixWorldAutoUpdate===!0&&m.updateMatrixWorld(),u.parent===null&&u.matrixWorldAutoUpdate===!0&&u.updateMatrixWorld();let v,M;u.isOrthographicCamera&&(v=-(u.right+u.left)/2,M=(u.top+u.bottom)/2);let A=u.view&&u.view.enabled?u.view.height/u.view.fullHeight:1,S=u.isOrthographicCamera?`scale( ${A} )scale(`+y+")translate("+h(v)+"px,"+h(M)+"px)"+d(u.matrixWorldInverse):`scale( ${A} )translateZ(`+y+"px)"+d(u.matrixWorldInverse),P=(u.isPerspectiveCamera?"perspective("+y+"px) ":"")+S+"translate("+r+"px,"+o+"px)";a.camera.style!==P&&(f.style.transform=P,a.camera.style=P),_(m,m,u,S)},this.setSize=function(m,u){n=m,s=u,r=n/2,o=s/2,l.style.width=m+"px",l.style.height=u+"px",c.style.width=m+"px",c.style.height=u+"px",f.style.width=m+"px",f.style.height=u+"px"};function h(m){return Math.abs(m)<1e-10?0:m}function d(m){let u=m.elements;return"matrix3d("+h(u[0])+","+h(-u[1])+","+h(u[2])+","+h(u[3])+","+h(u[4])+","+h(-u[5])+","+h(u[6])+","+h(u[7])+","+h(u[8])+","+h(-u[9])+","+h(u[10])+","+h(u[11])+","+h(u[12])+","+h(-u[13])+","+h(u[14])+","+h(u[15])+")"}function p(m){let u=m.elements;return"translate(-50%,-50%)"+("matrix3d("+h(u[0])+","+h(u[1])+","+h(u[2])+","+h(u[3])+","+h(-u[4])+","+h(-u[5])+","+h(-u[6])+","+h(-u[7])+","+h(u[8])+","+h(u[9])+","+h(u[10])+","+h(u[11])+","+h(u[12])+","+h(u[13])+","+h(u[14])+","+h(u[15])+")")}function g(m){m.isCSS3DObject&&(m.element.style.display="none");for(let u=0,y=m.children.length;u<y;u++)g(m.children[u])}function _(m,u,y,v){if(m.visible===!1){g(m);return}if(m.isCSS3DObject){let M=m.layers.test(y.layers)===!0,A=m.element;if(A.style.display=M===!0?"":"none",M===!0){m.onBeforeRender(e,u,y);let S;m.isCSS3DSprite?(Rn.copy(y.matrixWorldInverse),Rn.transpose(),m.rotation2D!==0&&Rn.multiply(zx.makeRotationZ(m.rotation2D)),m.matrixWorld.decompose(hu,Fx,uu),Rn.setPosition(hu),Rn.scale(uu),Rn.elements[3]=0,Rn.elements[7]=0,Rn.elements[11]=0,Rn.elements[15]=1,S=p(Rn)):S=p(m.matrixWorld);let w=a.objects.get(m);if(w===void 0||w.style!==S){A.style.transform=S;let P={style:S};a.objects.set(m,P)}A.parentNode!==f&&f.appendChild(A),m.onAfterRender(e,u,y)}}for(let M=0,A=m.children.length;M<A;M++)_(m.children[M],u,y,v)}}};var oe=at;function Kl(i,t,e){let n=((t-i+Math.PI)%(2*Math.PI)+2*Math.PI)%(2*Math.PI)-Math.PI;return i+n*e}var fu={idle:"\u2615",chat:"\u{1F4AC}",work:"\u{1F3E2}",image:"\u{1F3A8}",video:"\u{1F3AC}",web:"\u{1F50E}",doc:"\u{1F4C4}",away:"\u{1F319}"},Ox={"\u{1F44B}":"wave","\u{1F57A}":"dance","\u{1F389}":"cheer","\u{1F64C}":"cheer","\u2615":"drink"},po={x1:-5.1,x2:1.1,z1:1.9,z2:7.1},Hx=120,Bx={hug:.5,dance:.95,highfive:.62,cheers:.62,coffee:.68},du={highfive:"\u{1F64C}",hug:"\u{1F917}",cheers:"\u{1F942}",coffee:"\u2615",dance:"\u{1F483}"},Ue={x:12.5,z:12.5,face:.32},pu=()=>({x:Ue.x+Math.sin(Ue.face)*2,z:Ue.z+Math.cos(Ue.face)*2}),kx={id:"npc",name:"Tr\u1EE3 l\xFD SIMI",shirt:"#0a5cc2",pants:"#142c5a",shoes:"#1d1d24",hair:"#2b1d14",hairStyle:"bob",accessory:"headset",accent:"#f5c518",skin:"#f1c9a5",outfit:"blazer",lapel:"#083d80"},jl={x:6,z:4,zoom:.31},Ql={npc:{x:Ue.x,z:Ue.z,y:1.1,zoom:1.45},altar:{x:11.8,z:-8.4,y:1.2,zoom:1},fortune:{x:8.75,z:-9.2,y:1,zoom:1.15},bar:{x:Os,z:-7.6,y:1,zoom:.95},dance:{x:-2,z:4.5,y:.2,zoom:1.05},cinema:{x:ho,z:-9,y:1.9,zoom:.95},game:{x:20.8,z:-4.4,y:.9,zoom:.95},zen:{x:8.4,z:2.2,y:.4,zoom:.92},garden:{x:8,z:14.2,y:.4,zoom:.62}};function ec(i){let t=i.avatar||{},e=0;for(let s of String(i.id||i.name||""))e=e*31+s.charCodeAt(0)>>>0;let n=s=>s[e%s.length];return{id:i.id,name:i.name,hair:t.hair||n(["#2b1d14","#5a3a1e","#1a1a1a","#7a2e2e","#b07a3c","#3b3b46"]),skin:t.skin||n(["#f1c9a5","#e2ae84","#f6d7bd","#ebbf98","#d9a074"]),shirt:t.shirt||n(["#0a78f0","#2fc1a5","#f5b51b","#4a3592","#e1262d","#142c5a","#ff8a3d"]),pants:t.pants,shoes:t.shoes,accent:t.accent,hairStyle:t.hairStyle||n(["short","long","spiky","bun","bob","curly","ponytail"]),accessory:t.accessory||"none",outfit:t.outfit||"none"}}var Gx=2,es=()=>Math.min(window.devicePixelRatio||1,Gx);function xu(i){let t=new zr({canvas:i,antialias:(window.devicePixelRatio||1)<1.5,alpha:!0,powerPreference:"high-performance"});if(!t.getContext())throw new Error("WebGL kh\xF4ng kh\u1EA3 d\u1EE5ng");return t.setPixelRatio(es()),t.shadowMap.enabled=!0,t.shadowMap.type=Kr,t.toneMapping=Rl,t.outputColorSpace=xe,t.setClearColor(0,0),t}var mu=new wn(.34,24),gu=(()=>{let i=document.createElement("canvas");i.width=i.height=64;let t=i.getContext("2d"),e=t.createRadialGradient(32,32,0,32,32,32);return e.addColorStop(0,"rgba(60,40,20,.42)"),e.addColorStop(.6,"rgba(60,40,20,.18)"),e.addColorStop(1,"rgba(60,40,20,0)"),t.fillStyle=e,t.fillRect(0,0,64,64),new ne({map:new qe(i),transparent:!0,depthWrite:!1})})();function yu(i,t=2048,e={x:0,z:0},n={x:17,z:14}){i.add(new Yr("#ffffff","#d8c6aa",1.05),new Zr("#ffffff",.18));let s=new Ps("#fff0dc",2.1);s.position.set(e.x-6,15,e.z+10),s.target.position.set(e.x,0,e.z),s.castShadow=!0,s.shadow.mapSize.set(t,t),Object.assign(s.shadow.camera,{left:-n.x,right:n.x,top:n.z,bottom:-n.z,near:1,far:50}),s.shadow.bias=-5e-4,s.shadow.normalBias=.03,s.shadow.radius=2.5;let r=new Ps("#dbe8ff",.5);r.position.set(9,7,-3),i.add(s,s.target,r)}var Bs=class{constructor(t,e={}){this.root=t,this.opts=e,this.people=new Map,this.bubbles=new Set,this.emotes=new Set,this.keys=new Set,this.dead=!1;let n=document.createElement("canvas");n.className="office3d-canvas",n.tabIndex=0,this.renderer=xu(n),this.wrap=document.createElement("div"),this.wrap.className="office3d-wrap",this.layer=document.createElement("div"),this.layer.className="office3d-layer",this.cssBox=document.createElement("div"),this.cssBox.className="office3d-css",n.style.position="relative",n.style.zIndex="1",this.layer.style.zIndex="2",this.wrap.append(this.cssBox,n,this.layer),t.appendChild(this.wrap),this.canvas=n,this.scene=new Ji,this.crowd=new oo(this.scene,{cap:300,blobGeo:mu,blobMat:gu}),this.v1=new U,yu(this.scene,2048,{x:(oe.minX+oe.maxX)/2,z:(oe.minZ+oe.maxZ)/2},{x:(oe.maxX-oe.minX)/2+3,z:(oe.maxZ-oe.minZ)/2+4}),this.world=ou(this.scene,{tet:Qh(e.tet)}),this.pool=(this.world.poolTables||[]).map(o=>({...o,state:null,anim:null})),this.games=new Map,this.seats=new Map(this.world.seats.map(o=>[o.id,o])),this.follow=!0,this.cam=new $i(-10,10,6,-6,.1,100),this.view={az:.72,el:.7,zoom:.85,target:new U(0,.6,.6)},this.goal={az:.72,el:.7,zoom:.85},this.perf={acc:0,n:0,dpr:es(),slow:0,fast:0,ceil:es(),min:1},this.nav=new no(oe.minX,oe.minZ,oe.maxX,oe.maxZ,.2),this.nav.blockRect(oe.minX,oe.minZ,oe.maxX,oe.minZ+.25,.15),this.nav.blockRect(oe.minX,oe.minZ,oe.minX+.25,oe.maxZ,.15),this.nav.blockRect(oe.maxX-.2,oe.minZ,oe.maxX,oe.maxZ,.15),this.nav.blockRect(oe.minX,oe.maxZ-.2,oe.maxX,oe.maxZ,.15);for(let o of this.world.obstacles)this.nav.blockRect(...o);if(!e.noMerge&&!window.VP_NO_MERGE)try{this.mergeStats=cu(this.scene,this.world,{keep:["cinema","clickables","poolTables","seatMeshes","seats","ideasFlag"]})}catch(o){this.mergeStats={error:String(o&&o.message||o)}}this.buildNpcDesk();for(let o of this.pool)this.setTableBalls(o,null);this.cat=new io(this.scene,this.nav),this.cat.onFx=o=>this.fx(null,o),this.setNpc(null),this.skew=0,this.light=!1,this.capFps=!1,this.lastInput=performance.now(),this.raycaster=new Jr,this.ndc=new Mt,this.tmpV=new U,this.frustum=new gi,this.projM=new Xt,this.sph=new Sn(new U,1.1),this.floorPlane=new gn(new U(0,1,0),0),this.marker=new ut(new ti(.16,.24,28),new ne({color:"#0a78f0",transparent:!0,opacity:0})),this.marker.rotation.x=-Math.PI/2,this.marker.position.y=.02,this.scene.add(this.marker);let s=pu();this.npcRing=new Yt,this.npcRing.position.set(s.x,.025,s.z);for(let[o,a,l]of[[.55,.7,.85],[.95,1.02,.45]]){let c=new ut(new ti(o,a,48),new ne({color:"#f5c518",transparent:!0,opacity:l,depthWrite:!1}));c.rotation.x=-Math.PI/2,c.userData.o=l,this.npcRing.add(c)}this.scene.add(this.npcRing),this.stick={x:0,y:0},this.bindInput(),e.mobile&&(this.renderer.shadowMap.enabled=!1,this.perf.noShadow=!0,this.perf.min=1.25,this.goal.zoom=this.view.zoom=.7),this.ro=new ResizeObserver(()=>this.resize()),this.ro.observe(t),this.resize();try{let o=this.renderer.getContext(),a=o.getExtension("WEBGL_debug_renderer_info");this.gpu=String(a?o.getParameter(a.UNMASKED_RENDERER_WEBGL):o.getParameter(o.RENDERER)||""),/swiftshader|llvmpipe|softpipe|software|basic render/i.test(this.gpu)&&!e.keepFull&&(this.softGpu=!0,this.setLight(!0),this.capFps=!0)}catch{}this.clock=new $r;let r=o=>{if(this.dead||(this.raf=requestAnimationFrame(r),this.paused))return;let a=window.VP_WIN;if(this.bg=!!(a&&!a.focused)&&performance.now()-(this.lastInput||0)>3e3,a&&a.minimized)return;let l=this.bg?80:this.slowMode()?31:0;l&&o-(this.lastTs||0)<l||(this.lastTs=o,this.frame())};r()}slowMode(){return this.capFps||this.light||this.opts.mobile&&performance.now()-(this.lastInput||0)>4e4}poke(){this.lastInput=performance.now()}updateCamera(){let{az:t,el:e,zoom:n,target:s}=this.view,r=30;this.cam.position.set(s.x+Math.sin(t)*Math.cos(e)*r,s.y+Math.sin(e)*r,s.z+Math.cos(t)*Math.cos(e)*r),this.cam.lookAt(s);let o=this.cssW||800,a=this.cssH||500,l=o/a,c=Math.max(8.4,15.6/l)/n;Object.assign(this.cam,{left:-c*l/2,right:c*l/2,top:c/2,bottom:-c/2}),this.cam.updateProjectionMatrix()}lookAt(t){let e=Ql[t];return e?(this.follow=!1,this.panTo=new U(e.x,.6,e.z),Object.assign(this.goal,{zoom:e.zoom,az:.72,el:.7}),!0):!1}placeScreen(t){let e=Ql[t];if(!e)return null;let n=this.project(this.tmpV.set(e.x,e.y,e.z)),s=this.canvas.getBoundingClientRect();return{x:s.left+n.x,y:s.top+n.y,r:Math.max(70,Math.min(170,110*this.view.zoom))}}resetView(){Object.assign(this.goal,{az:.72,el:.7,zoom:.85}),this.follow=!0}overview(){this.follow=!1,this.goal.zoom=jl.zoom,this.goal.el=.82,this.panTo=new U(jl.x,.6,jl.z)}focusSelf(){this.follow=!0,this.goal.zoom=.85,this.panTo=null}resize(){let t=this.root.getBoundingClientRect(),e=Math.max(200,Math.floor(t.width)),n=Math.max(200,Math.floor(t.height));this.cssW=e,this.cssH=n,this.renderer.setSize(e,n,!1),this.canvas.style.width=e+"px",this.canvas.style.height=n+"px",this.wrap.style.width=e+"px",this.wrap.style.height=n+"px",this.cssRenderer&&this.cssRenderer.setSize(e,n),this.updateCamera()}setCinemaFrame(t){let e=this.world.cinema;if(e){if(this.cinemaObj&&(this.cssScene.remove(this.cinemaObj),this.cinemaObj.element.remove(),this.cinemaObj=null),t){this.cssRenderer||(this.cssRenderer=new fo({element:this.cssBox}),this.cssScene=new Ji,this.cssRenderer.setSize(this.cssW||800,this.cssH||500));let n=1280;t.style.width=n+"px",t.style.height=Math.round(n*e.h/e.w)+"px";let s=new uo(t);s.position.set(e.x,e.y,e.z),s.scale.setScalar(e.w/n),this.cssScene.add(s),this.cinemaObj=s}e.idle.visible=!t,e.hole.visible=!!t}}viewScreen(t=0){let e=this.world.cinema;if(!e)return;let n=1.25,s=this.cssW||800,r=this.cssH||500,o=Math.max(8.4,15.6/(s/r))/n/r;this.follow=!1,this.panTo=new U(e.x-t*o,.6,e.z+3.2),Object.assign(this.goal,{az:.05,el:.32,zoom:n})}ray(t,e){let n=this.canvas.getBoundingClientRect();return this.ndc.set((t-n.left)/n.width*2-1,-((e-n.top)/n.height)*2+1),this.raycaster.setFromCamera(this.ndc,this.cam),this.raycaster}pickPerson(t,e){let n=this.ray(t,e),s=null;for(let r of this.people.values()){let o=n.intersectObject(r.person.root,!0)[0];o&&(!s||o.distance<s.d)&&(s={p:r,d:o.distance})}return s&&s.p}pickNpc(t,e){return!!this.npc&&this.ray(t,e).intersectObjects([this.npc.person.root,this.npcDesk],!0).length>0}pickCat(t,e){return this.ray(t,e).intersectObject(this.cat.root,!0).length>0}pickTable(t,e){if(!this.pool.length)return-1;let n=this.ray(t,e).intersectObjects(this.pool.map(s=>s.hit),!1)[0];return n?n.object.userData.poolTable:-1}pickAction(t,e){let n=this.world.clickables||[];if(!n.length)return null;let s=this.ray(t,e).intersectObjects(n,!1)[0];return s?s.object.userData.action:null}pickSeat(t,e){let n=this.ray(t,e).intersectObjects(this.world.seatMeshes,!1)[0];return n?this.seats.get(n.object.userData.seatId):null}seatTaken(t,e){return[...this.people.values()].some(n=>n.m.id!==e&&(n.seat===t||n.pendingSeat===t))}pickFloor(t,e){let n=new U;return this.ray(t,e).ray.intersectPlane(this.floorPlane,n)?n:null}bindInput(){let t=this.canvas,e=null;t.addEventListener("contextmenu",c=>c.preventDefault());let n=new Map,s=null,r=()=>{let[c,f]=[...n.values()];return Math.hypot(c.x-f.x,c.y-f.y)||1};t.addEventListener("pointerdown",c=>{if(this.poke(),t.focus(),t.setPointerCapture(c.pointerId),n.set(c.pointerId,{x:c.clientX,y:c.clientY}),n.size===2){s={d:r(),zoom:this.goal.zoom},e&&(e.moved=!0);return}e={x:c.clientX,y:c.clientY,az:this.goal.az,el:this.goal.el,moved:!1}});let o=c=>{n.delete(c.pointerId),n.size<2&&(s=null)};t.addEventListener("pointercancel",c=>{o(c),e=null});let a=0,l=0;t.addEventListener("pointermove",c=>{if(n.has(c.pointerId)&&n.set(c.pointerId,{x:c.clientX,y:c.clientY}),s&&n.size>=2){this.goal.zoom=Math.max(.28,Math.min(2.6,s.zoom*r()/s.d));return}if(e){let p=c.clientX-e.x,g=c.clientY-e.y;Math.hypot(p,g)>5&&(e.moved=!0),e.moved&&(this.goal.az=Math.max(.05,Math.min(1.52,e.az-p*.005)),this.goal.el=Math.max(.34,Math.min(1.28,e.el+g*.0035)),t.style.cursor="grabbing");return}let f=c.clientX,h=c.clientY,d=()=>{a=performance.now(),t.style.cursor=this.pickPerson(f,h)||this.pickNpc(f,h)||this.pickCat(f,h)||this.pickTable(f,h)>=0||this.pickAction(f,h)||this.pickSeat(f,h)?"pointer":"crosshair"};clearTimeout(l),performance.now()-a>80?d():l=setTimeout(d,90)}),t.addEventListener("pointerup",c=>{if(o(c),e&&!e.moved){let f=this.pickPerson(c.clientX,c.clientY),h=!f&&this.pickNpc(c.clientX,c.clientY),d=!f&&!h&&this.pickCat(c.clientX,c.clientY),p=!f&&!h&&!d?this.pickTable(c.clientX,c.clientY):-1,g=!f&&!h&&!d&&p<0?this.pickAction(c.clientX,c.clientY):null,_=!f&&!d&&!h&&p<0&&!g&&this.pickSeat(c.clientX,c.clientY);if(g==="fortune")this.walkSelf(Hs.x,Hs.z+.9,!0),this.opts.onFortune&&this.opts.onFortune();else if(g==="ideas")this.walkSelf(Jl.x+.6,at.minZ+1.3,!0),this.opts.onIdeas&&this.opts.onIdeas();else if(h)this.npcWave(),this.opts.onNpcClick&&this.opts.onNpcClick(c.clientX,c.clientY);else if(p>=0)this.opts.onTableClick&&this.opts.onTableClick(p,c.clientX,c.clientY);else if(d)this.opts.onCatClick&&this.opts.onCatClick(c.clientX,c.clientY);else if(f&&!f.me)this.opts.onPersonClick&&this.opts.onPersonClick(f.m.id,c.clientX,c.clientY);else if(f&&f.me)this.opts.onSelfClick&&this.opts.onSelfClick(c.clientX,c.clientY);else if(_)this.sitSelf(_.id);else{let m=this.pickFloor(c.clientX,c.clientY);m&&this.walkSelf(m.x,m.z,!0)}}e=null,t.style.cursor="crosshair"}),t.addEventListener("wheel",c=>{c.preventDefault(),this.goal.zoom=Math.max(.28,Math.min(2.6,this.goal.zoom*Math.exp(-Math.max(-240,Math.min(240,c.deltaY))*.0014)))},{passive:!1}),t.addEventListener("dblclick",c=>{this.pickPerson(c.clientX,c.clientY)||this.resetView()}),t.addEventListener("keydown",c=>{let f=c.key.toLowerCase();["w","a","s","d","arrowup","arrowdown","arrowleft","arrowright"].includes(f)&&(this.keys.add(f),c.preventDefault())}),t.addEventListener("keyup",c=>this.keys.delete(c.key.toLowerCase())),t.addEventListener("blur",()=>this.keys.clear())}setMembers(t){let e=new Set;t.forEach((n,s)=>{e.add(n.id);let r=this.people.get(n.id),o=ec(n),a=JSON.stringify(o);if(r&&r.sig!==a&&(this.scene.remove(r.person.root),r.person=this.makePerson(o,s,r.pos,r.facing),r.person.dance=r.dance||null,r.sig=a),!r){let l=this.freeSpot(n.pos?n.pos.x:s%5*1.4-3,n.pos?n.pos.z:1+Math.floor(s/5));r={m:n,me:!!n.me,pos:l,path:[],facing:Math.random()*6,sig:a,speed:1.9,seat:null,pendingSeat:null},r.person=this.makePerson(o,s,r.pos,r.facing),this.makePlate(r),this.people.set(n.id,r);let c=n.pos&&n.pos.seat&&this.seats.get(n.pos.seat);c&&!this.seatTaken(c.id,n.id)&&this.sitNow(r,c)}r.m=n,r.me=!!n.me,!r.me&&(n.dance||null)!==(r.dance||null)&&!r.meet&&this.setDance(n.id,n.dance||null),this.updatePlate(r)});for(let[n,s]of[...this.people])e.has(n)||this.removePerson(n,s)}makePerson(t,e,n,s){let r=new Ds(t,e);return r.root.userData.character=!0,r.root.position.set(n.x,0,n.z),r.root.rotation.y=s||0,r.root.traverse(o=>{o.isMesh&&(o.castShadow=!1)}),r.blob=new ut(mu,gu),r.blob.rotation.x=-Math.PI/2,r.blob.renderOrder=1,r.root.add(r.blob),this.scene.add(r.root),r}removePerson(t,e){this.scene.remove(e.person.root),e.plate.remove(),this.people.delete(t);for(let n of[...this.bubbles])n._p===e&&(n.remove(),this.bubbles.delete(n))}freeSpot(t,e){let n=this.nav.toCell(Math.max(oe.minX+.6,Math.min(oe.maxX-.6,t)),Math.max(oe.minZ+.6,Math.min(oe.maxZ-.6,e))),s=this.nav.nearestFree(n.c,n.r);return this.nav.center(s.c,s.r)}makePlate(t){let e=document.createElement("div");e.className="plate3d lobby"+(t.me?" me":""),e.innerHTML='<span class="pl-bubble" hidden></span><span class="pl-row"><span class="pl-name"></span></span><span class="pl-sub"><span class="pl-title"></span></span>',e.addEventListener("click",n=>{let s=e.getBoundingClientRect();t.me?this.opts.onSelfClick&&this.opts.onSelfClick(s.left+s.width/2,s.bottom):this.opts.onPersonClick&&this.opts.onPersonClick(t.m.id,s.left+s.width/2,s.bottom),n.stopPropagation()}),this.layer.append(e),t.plate=e}updatePlate(t){let e=t.m,n=e.status||{};t.plate.querySelector(".pl-name").textContent=(t.me?"\u2B50 ":"")+e.name,t.plate.querySelector(".pl-title").textContent=t.game?"\u{1F3B1} \u0110ang ch\u01A1i bida":t.dance?"\u{1F483} \u0110ang nh\u1EA3y":n.text?new RegExp("^\\p{Extended_Pictographic}","u").test(n.text)?n.text:`${fu[n.activity]||"\u2615"} ${n.text}`:`${fu[n.activity]||"\u2615"} ${e.teamName||""}`.trim(),t.plate.classList.toggle("dancing",!!t.dance),t.plate.classList.toggle("busy",!!n.activity&&!["idle","away"].includes(n.activity)),t.busy=!!n.activity&&!["idle","away"].includes(n.activity);let s=t.plate.querySelector(".pl-bubble");if(s){let r=t.busy&&!t.game&&!t.dance&&n.task?String(n.task):"";s.dataset.t!==r&&(s.dataset.t=r,s.textContent=r,s.hidden=!r)}t.plate.title=`${e.name} \xB7 ${e.teamName||""}${e.role?" \xB7 "+e.role:""}`}standUp(t){t.seat=null,t.pendingSeat=null,t.sitting=!1,t.seatKind=null,t.person&&(t.person.bowPh=0)}stopMoves(t){t.meet=null,t.dance&&(t.dance=null,t.person.dance=null,this.updatePlate(t),t.me&&this.opts.onDance&&this.opts.onDance(null,!0))}sitNow(t,e){t.path=[],t.pos={x:e.x,z:e.z},t.facing=e.face,t.seat=e.id,t.pendingSeat=null,t.sitting=!0,t.seatH=e.h,t.seatKind=e.kind||null,e.kind==="zen"&&(t.zenFx=performance.now()/1e3+2+Math.random()*3,t.me&&this.opts.onToast&&this.opts.onToast("\u{1F9D8} H\xEDt v\xE0o th\u1EADt ch\u1EADm\u2026 th\u1EDF ra nh\u1EB9 nh\xE0ng. B\u1EA5m \u0111i ch\u1ED7 kh\xE1c l\xE0 \u0111\u1EE9ng d\u1EADy.")),e.kind==="kneel"&&(t.zenFx=performance.now()/1e3+1.5+Math.random()*2,t.seatTheme=e.theme||null,t.me&&this.opts.onToast&&this.opts.onToast(e.theme==="thantai"?"\u{1F4B0} Th\u1EA7n T\xE0i ph\xF9 h\u1ED9: kh\xE1ch v\xE0o nh\u01B0 n\u01B0\u1EDBc, ch\u1ED1t \u0111\u01A1n \u1EA7m \u1EA7m, doanh s\u1ED1 x10! B\u1EA5m \u0111i ch\u1ED7 kh\xE1c l\xE0 \u0111\u1EE9ng d\u1EADy.":"\u{1F64F} Th\xE0nh t\xE2m kh\u1EA5n: c\u1EA7u kh\xF4ng bug, token \u0111\u1EA7y kho, deadline l\xF9i! B\u1EA5m \u0111i ch\u1ED7 kh\xE1c l\xE0 \u0111\u1EE9ng d\u1EADy."))}walk(t,e,n){this.standUp(t),this.stopMoves(t);let s=this.freeSpot(e,n);return t.path=this.nav.find({x:t.pos.x,z:t.pos.z},s),this.pace(t),s}pace(t){let e=0,n=t.pos;for(let s of t.path)e+=Math.hypot(s.x-n.x,s.z-n.z),n=s;return t.speed=e>9?3.4:1.9,e}walkToSeat(t,e){this.standUp(t),this.stopMoves(t),t.pendingSeat=e.id,t.path=[...this.nav.find({x:t.pos.x,z:t.pos.z},this.freeSpot(e.approach.x,e.approach.z)),{x:e.x,z:e.z}],this.pace(t)}moveMember(t,e,n,s){let r=this.people.get(t);if(!r||r.me)return;let o=s&&this.seats.get(s);o?this.walkToSeat(r,o):this.walk(r,e,n)}walkSelf(t,e,n){let s=this.self();if(!s)return;let r=this.walk(s,t,e);n&&(this.marker.position.set(r.x,.02,r.z),this.marker.material.opacity=.9),this.follow=!0,this.opts.onMove&&this.opts.onMove({x:r.x,z:r.z,seat:null})}sitSelf(t){let e=this.self(),n=this.seats.get(t);if(!(!e||!n)&&e.seat!==t){if(this.seatTaken(t,e.m.id)){this.opts.onToast&&this.opts.onToast("Gh\u1EBF n\xE0y c\xF3 ng\u01B0\u1EDDi ng\u1ED3i r\u1ED3i \u{1F605}");return}this.walkToSeat(e,n),this.marker.position.set(n.x,.02,n.z),this.marker.material.opacity=.9,this.follow=!0,this.opts.onMove&&this.opts.onMove({x:n.x,z:n.z,seat:t})}}self(){return[...this.people.values()].find(t=>t.me)}selfPos(){let t=this.self();return t?{...t.pos,seat:t.seat}:null}say(t,e,n=5200){let s=t==="npc"?this.npc:this.people.get(t);if(!s)return;for(let o of[...this.bubbles])o._p===s&&(o.remove(),this.bubbles.delete(o));let r=document.createElement("div");r.className="bubble3d k-chat",r.style.zIndex="5000",r.textContent=e.length>110?e.slice(0,109)+"\u2026":e,r._p=s,this.layer.appendChild(r),this.bubbles.add(r),s.person.say(Math.min(n,2400)),requestAnimationFrame(()=>r.classList.add("show")),setTimeout(()=>{r.classList.remove("show"),setTimeout(()=>{this.bubbles.delete(r),r.remove()},220)},n)}emote(t,e){let n=this.people.get(t);if(!n)return;let s=Ox[e]||(/❤|💖|😍|🥰/.test(e)?"wave":"cheer");n.person.doAction(s,s==="dance"?2600:1800),s==="dance"&&(n.danceUntil=performance.now()/1e3+2.6);let r=document.createElement("div");r.className="emote",r.textContent=e,r._p=n,this.layer.appendChild(r),this.emotes.add(r),setTimeout(()=>{this.emotes.delete(r),r.remove()},1700)}fx(t,e,n=1700){let s=document.createElement("div");s.className="emote",s.textContent=e,s._p=t,s._cat=!t,this.layer.appendChild(s),this.emotes.add(s),setTimeout(()=>{this.emotes.delete(s),s.remove()},n)}buildNpcDesk(){let t=new Yt;t.position.set(Ue.x,0,Ue.z),t.rotation.y=Ue.face;let e=(M,A=.6,S={})=>new Zt({color:M,roughness:A,...S}),n=[],s=(M,A,S,w,P,D=!0)=>{let x=new ut(M,A);return x.position.set(S,w,P),x.castShadow=D,x.receiveShadow=!0,t.add(x),n.push(x),x},r=(M,A,S)=>{let w=new bs,P=24;for(let D=0;D<=P;D++){let x=-S+2*S*D/P,E=[Math.sin(x)*A,-Math.cos(x)*A];D===0?w.moveTo(...E):w.lineTo(...E)}for(let D=P;D>=0;D--){let x=-S+2*S*D/P;w.lineTo(Math.sin(x)*M,-Math.cos(x)*M)}return w},o=(M,A)=>{let S=new Wr(M,{depth:A,bevelEnabled:!1,curveSegments:24});return S.rotateX(-Math.PI/2),S};s(o(r(.62,.92,.85),.92),e("#ffffff",.45),0,0,0),s(o(r(.6,.98,.88),.05),e("#c79a6a",.35),0,.92,0),s(o(r(.925,.94,.85),.04),e("#0a78f0",.4,{emissive:"#2f8cf0",emissiveIntensity:1.2}),0,.16,0,!1);let a=document.createElement("canvas");a.width=512,a.height=128;let l=a.getContext("2d");l.fillStyle="#0a5cc2",l.fillRect(0,0,512,128),l.fillStyle="#ffd34d",l.font="900 54px Nunito, sans-serif",l.textAlign="center",l.textBaseline="middle",l.fillText("L\u1EC4 T\xC2N",256,50),l.fillStyle="#ffffff",l.font="800 28px Nunito, sans-serif",l.fillText("H\u1ECFi Tr\u1EE3 l\xFD SIMI",256,100);let c=new qe(a);c.colorSpace=xe,c.anisotropy=4;let f=new ut(new ie(.62,.155),new ne({map:c}));f.position.set(0,.6,.935),t.add(f);let h=s(new Kt(.42,.28,.03),e("#1d2b4f",.4),-.42,1.18,.62);h.rotation.y=Math.PI+.5,s(new Kt(.06,.18,.06),e("#c2cad6",.3),-.42,1.03,.64),s(new J(.06,.07,.02,16),e("#c2cad6",.3,{metalness:.6}),.36,.98,.78,!1),s(new wt(.05,14,8,0,Math.PI*2,0,Math.PI/2),e("#f5c518",.25,{metalness:.6}),.36,.99,.78,!1),s(new J(.04,.035,.1,12),e("#0a78f0",.4),.55,1.02,.6,!1),s(new Kt(2.5,1.85,.1),e("#0a5cc2",.55),0,.925,-.82),s(new Kt(2.6,.08,.16),e("#ffffff",.5),0,1.89,-.82);let d=document.createElement("canvas");d.width=1024,d.height=720;let p=d.getContext("2d"),g=p.createLinearGradient(0,0,1024,720);g.addColorStop(0,"#0a78f0"),g.addColorStop(1,"#0a4aa8"),p.fillStyle=g,p.fillRect(0,0,1024,720),p.fillStyle="rgba(255,255,255,.08)";for(let M=0;M<7;M++)p.beginPath(),p.arc(120+M*150,640-M%2*60,90,0,7),p.fill();p.fillStyle="#ffd34d",p.beginPath(),p.arc(512,250,150,0,7),p.fill(),p.fillStyle="#0a4aa8",p.font="900 230px Nunito, sans-serif",p.textAlign="center",p.textBaseline="middle",p.fillText("?",512,262),p.fillStyle="#ffffff",p.font="900 96px Nunito, sans-serif",p.fillText("Tr\u1EE3 l\xFD SIMI",512,500),p.font="800 46px Nunito, sans-serif",p.fillStyle="rgba(255,255,255,.85)",p.fillText("H\u01B0\u1EDBng d\u1EABn \xB7 M\u1EB9o AI \xB7 H\u1ECFi \u0111\xE1p",512,590);let _=new qe(d);_.colorSpace=xe,_.anisotropy=4;let m=new ut(new ie(2.36,1.66),new ne({map:_,toneMapped:!1}));m.position.set(0,.94,-.765),t.add(m);for(let M of[-1,1]){s(new J(.2,.15,.42,16),e("#f6f1e8",.6),M*1.5,.21,-.7);for(let A=0;A<4;A++)s(new ze(.2,1),e(A%2?"#5fb36f":"#3f9a5a",.85,{flatShading:!0}),M*1.5+(A%2?.08:-.08),.6+A*.17,-.7+(A>1?.06:-.06)).scale.setScalar(1-A*.12)}this.scene.add(t),this.npcDesk=t;let u=Math.cos(Ue.face),y=Math.sin(Ue.face),v=[[-1.75,-.95],[1.75,-.95],[-1,1],[1,1],[-1.75,.2],[1.75,.2]].map(([M,A])=>[Ue.x+M*u+A*y,Ue.z-M*y+A*u]);this.nav.blockRect(Math.min(...v.map(M=>M[0])),Math.min(...v.map(M=>M[1])),Math.max(...v.map(M=>M[0])),Math.max(...v.map(M=>M[1])),.05)}setNpc(t){let e={...kx},n=JSON.stringify(e);if(!this.npc){let s=document.createElement("div");s.className="plate3d lobby npc",s.innerHTML='<span class="npc-q">?</span><span class="pl-row"><span class="pl-name"></span></span><span class="pl-sub"><span class="pl-title">B\u1EA5m \u0111\u1EC3 h\u1ECFi m\xECnh</span></span>',s.addEventListener("click",r=>{let o=s.getBoundingClientRect();this.npcWave(),this.opts.onNpcClick&&this.opts.onNpcClick(o.left+o.width/2,o.bottom),r.stopPropagation()}),this.layer.append(s),this.npc={plate:s,facing:Ue.face,pos:{x:Ue.x-Math.sin(Ue.face)*.08,z:Ue.z-Math.cos(Ue.face)*.08},m:{id:"npc"}}}this.npc.sig!==n&&(this.npc.person&&this.scene.remove(this.npc.person.root),this.npc.person=this.makePerson(e,7,this.npc.pos,this.npc.facing),this.npc.person.root.scale.setScalar(1.06),this.npc.sig=n),this.npc.plate.querySelector(".pl-name").textContent=t&&t.name?t.name:"Tr\u1EE3 l\xFD SIMI"}npcWave(){this.npc&&this.npc.person.doAction("wave",1500)}goNpc(){let t=pu(),e=this.self();return e&&Math.hypot(e.pos.x-t.x,e.pos.z-t.z)<.6&&!e.path.length?(this.focusSelf(),!0):(this.walkSelf(t.x,t.z,!0),this.focusSelf(),!1)}nearNpc(){let t=this.self();return!!(t&&this.npc&&Math.hypot(t.pos.x-this.npc.pos.x,t.pos.z-this.npc.pos.z)<2.6&&!t.path.length)}npcScreen(){if(!this.npc)return null;let t=this.project(this.tmpV.set(this.npc.pos.x,1.6,this.npc.pos.z));return{x:t.x,y:t.y,w:this.cssW,h:this.cssH}}npcSay(t,e=5200){this.npc&&(this.npc.lastSay=t,this.say("npc",t,e))}setTableBalls(t,e){let n=window.VPPool,s=e||(n?n.rack().balls:null);if(!s){t.balls.visible=!1;return}let r=this._m||(this._m=new Xt),o=!Array.isArray(s);for(let a=0;a<16;a++){let l=o?s[a*3]:s[a][0],c=o?s[a*3+1]:s[a][1],f=o?s[a*3+2]:s[a][2],h=t.x-ts.w/2+c/500*ts.w,d=t.z-ts.l/2+l/1e3*ts.l;r.makeTranslation(h,f?-1:.892,d),t.balls.setMatrixAt(a,r)}t.balls.instanceMatrix.needsUpdate=!0,t.balls.visible=!0}setGames(t){let e=new Map;for(let n of t||[])n.players.forEach((s,r)=>e.set(s,{table:n.table,idx:r}));for(let n of this.pool){let s=(t||[]).find(r=>r.table===n.index);s&&!n.anim&&(n.state=s.state?s.state.balls:null,this.setTableBalls(n,n.state))}this.games=e;for(let n of this.people.values()){let s=e.get(n.m.id)||null;!!s!=!!n.game?(n.game=s,s||(n.person.holdCue=!1),this.updatePlate(n)):n.game=s}}goToTable(t,e){let n=this.pool[t];if(!n)return;let s=n.spots[e%2];this.walkSelf(s.x,s.z,!0)}poolCue(t){let e=this.people.get(t);e&&e.person.doAction("cue",900)}poolShot(t,e,n,s,r){let o=this.pool[t];if(!o)return;this.poolCue(e);let a=window.VPPool;if(a&&n)try{o.anim={frames:a.simulate(n,s).frames,t0:performance.now(),end:r.balls};return}catch{}o.state=r.balls,this.setTableBalls(o,o.state)}poolEnd(t){let e=this.pool[t];e&&(clearTimeout(e.resetT),e.resetT=setTimeout(()=>{e.anim||(e.state=null,this.setTableBalls(e,null))},6e3))}setIdeas(t){let e=this.world||{};e.ideasBoard&&e.ideasBoard.draw(t?{summary:t}:null);let n=t?Object.values(t).reduce((s,r)=>s+(r.fresh||0),0):0;e.ideasFlag&&(e.ideasFlag.rotation.z=n?0:-Math.PI/2+.15)}setSkew(t){this.skew=Number(t)||0}setCat(t){this.cat.command(t,this.skew)}beat(){return(Date.now()+this.skew)/1e3*Hx/60}setDance(t,e){let n=this.people.get(t);n&&(n.dance=e||null,n.person.dance=n.dance,e&&n.pendingSeat&&(n.pendingSeat=null,n.path=[]),this.updatePlate(n))}danceSelf(t){let e=this.self();e&&(this.setDance(e.m.id,t),this.opts.onDance&&this.opts.onDance(t||null,!1))}onFloor(t){return!!t&&t.pos.x>po.x1&&t.pos.x<po.x2&&t.pos.z>po.z1&&t.pos.z<po.z2}interact(t){let e=this.people.get(t.a),n=this.people.get(t.b);if(!e||!n||e===n)return;(t.kind==="hug"||t.kind==="dance")&&n.sitting&&this.standUp(n);let s=Math.atan2(e.pos.x-n.pos.x,e.pos.z-n.pos.z)||.6,r=Bx[t.kind]||.65,o=this.freeSpot(n.pos.x+Math.sin(s)*r,n.pos.z+Math.cos(s)*r);this.standUp(e),e.path=this.nav.find({x:e.pos.x,z:e.pos.z},o);let a=this.pace(e);e.meet={other:n,kind:t.kind,style:t.style,deadline:performance.now()/1e3+Math.max(7,a/e.speed+3)},e.me&&(this.follow=!0)}startMeet(t,e){let n=e.other;t.path=[],t.facing=Math.atan2(n.pos.x-t.pos.x,n.pos.z-t.pos.z),n.sitting||(n.facing=Math.atan2(t.pos.x-n.pos.x,t.pos.z-n.pos.z));let s=e.kind;if(s==="coffee")t.person.doAction("give",1500),setTimeout(()=>{this.people.has(n.m.id)&&n.person.doAction("drink",2400)},1100);else if(s==="dance")for(let r of[t,n])r.dance=e.style||"groove",r.person.dance=r.dance,this.updatePlate(r);else for(let r of[t,n])r.person.doAction(s,s==="hug"?2800:s==="cheers"?2300:1700);this.fx(t,du[s]||"\u2728"),(s==="hug"||s==="highfive")&&this.fx(n,du[s])}setQuality(t){this.quality=t==="light"||t==="high"?t:"auto",this.quality==="high"&&(this.capFps=!1,this.perf.noShadow=!1),this.setLight(this.quality==="light")}setLight(t){this.light=!!t;let e=t?1:es();this.perf.dpr=e,this.perf.ceil=e,this.renderer.setPixelRatio(e);let n=!t&&!this.perf.noShadow;this.renderer.shadowMap.enabled!==n&&(this.renderer.shadowMap.enabled=n,this.scene.traverse(s=>{s.material&&[].concat(s.material).forEach(r=>{r.needsUpdate=!0})})),this.resize()}frame(){let t=this.clock.getDelta(),e=Math.min(.05,t),n=this.t=(this.t||0)+e,s=performance.now()/1e3;for(let u of this.world.animated)u(n,e);for(let u of this.pool){if(!u.anim)continue;let y=Math.floor((performance.now()-u.anim.t0)/(1e3/60));y>=u.anim.frames.length-1?(u.state=u.anim.end,u.anim=null,this.setTableBalls(u,u.state)):this.setTableBalls(u,u.anim.frames[y])}let r=this.beat();this.cat.update(e,s,{posOf:u=>{let y=this.people.get(u);return y&&y.pos}}),this.keyboardMove(e),this.marker.material.opacity=Math.max(0,this.marker.material.opacity-e*.8),this.projM.multiplyMatrices(this.cam.projectionMatrix,this.cam.matrixWorldInverse),this.frustum.setFromProjectionMatrix(this.projM);let o=this.people.size>24;this.lodTick=!this.lodTick;let a=this.quality==="high"?this.people.size>40?38:0:this.light||this.softGpu?this.people.size>8?90:0:this.people.size>14?60:0;this.crowd.begin();for(let u of this.people.values()){let y=!1;if(u.path.length){let x=u.path[0],E=x.x-u.pos.x,N=x.z-u.pos.z,z=Math.hypot(E,N),I=u.speed*e;if(z<=I){if(u.pos.x=x.x,u.pos.z=x.z,u.path.shift(),!u.path.length&&u.pendingSeat){let V=this.seats.get(u.pendingSeat);V&&this.sitNow(u,V)}}else u.pos.x+=E/z*I,u.pos.z+=N/z*I;u.meet&&s>u.meet.deadline&&(u.path=[]),z>.001&&(u.facing=Kl(u.facing,Math.atan2(E,N),1-Math.exp(-e*12))),y=u.path.length>0}else u.keyMove&&(y=!0);if(u.meet&&!u.path.length){let x=u.meet;u.meet=null,this.startMeet(u,x)}if(u.game){let x=this.pool[u.game.table]&&this.pool[u.game.table].spots[u.game.idx%2],E=x&&!y&&Math.hypot(u.pos.x-x.x,u.pos.z-x.z)<.45;u.person.holdCue=!!E,E&&(u.facing=Kl(u.facing,x.face,1-Math.exp(-e*8)))}u.danceUntil&&s<u.danceUntil&&!y&&(u.facing+=e*5),u.dance==="spin"&&!y&&!u.sitting&&(u.facing+=e*3.2);let v=!!u.sitting&&!y,M=v&&u.seatKind==="zen",A=v&&u.seatKind==="kneel",S=M?(u.seatH||.2)-.4:A?(u.seatH||.09)-.32:v?Math.max(0,(u.seatH||.45)-.45):0;if(M&&s>(u.zenFx||0)&&(u.zenFx=s+6+Math.random()*5,this.fx(u,["\u{1F9D8}","\u{1F343}","\u2728","\u{1F33F}","\u262F\uFE0F","\u{1F549}\uFE0F"][Math.floor(Math.random()*6)],2200)),A&&s>(u.zenFx||0)){u.zenFx=s+5+Math.random()*4;let x=u.seatTheme==="thantai"?["\u{1F4B0}","\u{1F9E7}","\u{1F4C8}","\u{1F431}","\u{1F4B8}","\u{1F6D2}"]:["\u{1F64F}","\u{1F647}","\u2728","\u{1F4B0}","\u{1F340}"];this.fx(u,x[Math.floor(Math.random()*x.length)],2e3)}u.person.root.position.set(u.pos.x,S,u.pos.z),u.person.blob&&(u.person.blob.position.y=.012-S,u.person.blob.visible=!v||S<.05),u.person.root.rotation.y=u.facing,u.busy&&!y&&!v&&!u.person.action&&Math.random()<e*.15&&u.person.doAction("look",1600),u.keyMove=!1,this.sph.center.set(u.pos.x,S+.8,u.pos.z);let w=u.me||this.frustum.intersectsSphere(this.sph);if(u.onScreen=w,u.animAcc=(u.animAcc||0)+e,!w){u.animAcc=Math.min(u.animAcc,.25),u.person.root.visible&&(u.person.root.visible=!1);continue}let P=!1;if(a&&!u.me&&!u.game&&!u.meet&&!u.person.action&&!u.person.holdCue){this.v1.set(u.pos.x,S,u.pos.z).applyMatrix4(this.projM);let x=this.v1.y;this.v1.set(u.pos.x,S+1.45,u.pos.z).applyMatrix4(this.projM),P=Math.abs(this.v1.y-x)*this.cssH/2<a*(u.lodNow?1.15:1)}if(u.lodNow=P,u.person.root.visible!==!P&&(u.person.root.visible=!P),P){u.animAcc=Math.min(u.animAcc,.25);let x=r*Math.PI,E=u.dance&&!y?u.dance:null;this.crowd.add(u.person,u.pos.x,S,u.pos.z,u.facing,{seated:v,bob:y?Math.abs(Math.sin(s*9))*.035:E?Math.abs(Math.sin(x))*.06:0,wig:E?Math.sin(x*2)*(E==="twerk"?.2:.1):0,lean:E==="twerk"?.4:0,turn:E==="twerk"?Math.PI:0});continue}if(o&&!u.me&&!u.dance&&!y&&(u.person.index||0)%2===0===this.lodTick)continue;let D=Math.min(.1,u.animAcc);u.animAcc=0,u.person.animate(D,s,{moving:y,speed:u.speed,seated:v,typing:v&&!M&&!A&&u.busy&&!u.dance,beat:r,meditate:M,kneel:A})}if(this.crowd.end(),this.npcRing){let u=s*.9%1,[y,v]=this.npcRing.children;y.material.opacity=y.userData.o*(.75+.25*Math.sin(s*3)),v.scale.setScalar(.6+u*.9),v.material.opacity=v.userData.o*(1-u)}if(this.npc){let u=this.npc;u.person.root.position.set(u.pos.x,0,u.pos.z),u.person.root.rotation.y=u.facing,u.person.animate(e,s,{moving:!1,speed:0,seated:!1,typing:!1,beat:r});let y=this.self();y&&Math.hypot(y.pos.x-u.pos.x,y.pos.z-u.pos.z)<2.3&&(!u.greetAt||s-u.greetAt>90)&&(u.greetAt=s,this.npcWave(),this.npcSay(this.opts.npcGreeting?this.opts.npcGreeting():"C\u1EA7n gi\xFAp g\xEC kh\xF4ng? B\u1EA5m v\xE0o m\xECnh nh\xE9 \u{1F44B}"))}let l=this.self(),c=this.onFloor(l)&&!(l&&l.path.length);c!==this.wasFloor&&(this.wasFloor=c,this.opts.onFloor&&this.opts.onFloor(c));let f=this.view,h=this.goal,d=1-Math.exp(-e*10);f.az+=(h.az-f.az)*d,f.el+=(h.el-f.el)*d,f.zoom*=Math.exp((Math.log(h.zoom)-Math.log(f.zoom))*d);let p=this.self(),g=this.follow&&p?{x:p.pos.x,z:p.pos.z}:this.panTo;if(g){let u=1-Math.exp(-e*4.5);f.target.x+=(g.x-f.target.x)*u,f.target.z+=(g.z-f.target.z)*u}this.updateCamera();let _=f.zoom<.7;_!==this.far&&(this.far=_,this.layer.classList.toggle("far",_));let m=this.renderer.shadowMap;m.enabled&&(m.autoUpdate=!1,(this.shadowTick=(this.shadowTick||0)+1)%(this.quality==="high"?2:4)===1&&(m.needsUpdate=!0)),this.renderer.render(this.scene,this.cam),this.cinemaObj&&this.cssRenderer.render(this.cssScene,this.cam),this.placeDom(),this.adapt(t)}adapt(t){let e=this.perf,n=this.slowMode();if(t>1||n!==e.mode||this.bg||this.quality==="high"||this.quality==="light"){e.acc=0,e.n=0,e.mode=n;return}if(e.acc+=t,e.n++,e.acc<2)return;let s=e.acc/e.n;e.acc=0,e.n=0;let r=this.slowMode()?1/30:1/60;s>r*1.4?(e.slow++,e.fast=0,e.dpr>e.min+.01?(e.ceil=e.dpr-.25,e.dpr=Math.max(e.min,e.dpr-.25),this.renderer.setPixelRatio(e.dpr),this.resize()):e.slow>=2&&this.renderer.shadowMap.enabled?(this.renderer.shadowMap.enabled=!1,e.noShadow=!0,this.scene.traverse(o=>{o.material&&[].concat(o.material).forEach(a=>{a.needsUpdate=!0})})):e.slow>=4&&!this.capFps&&(this.capFps=!0,e.slow=0,this.opts.onSlow&&this.opts.onSlow())):(e.slow=0,s<r*1.12&&!this.light&&e.dpr<Math.min(e.ceil,es())-.01&&++e.fast>=3&&(e.fast=0,e.dpr=Math.min(e.ceil,es(),e.dpr+.25),this.renderer.setPixelRatio(e.dpr),this.resize()))}keyboardMove(t){let e=Math.hypot(this.stick.x,this.stick.y);if(!this.keys.size&&e<.15)return;let n=[...this.people.values()].find(g=>g.me);if(!n)return;let s=0,r=0,o=1;if(e>=.15&&(s=this.stick.x,r=this.stick.y,o=Math.min(1,e)),(this.keys.has("w")||this.keys.has("arrowup"))&&(r-=1),(this.keys.has("s")||this.keys.has("arrowdown"))&&(r+=1),(this.keys.has("a")||this.keys.has("arrowleft"))&&(s-=1),(this.keys.has("d")||this.keys.has("arrowright"))&&(s+=1),!s&&!r)return;let a=this.view.az,l=Math.hypot(s,r),c=(s*Math.cos(a)+r*Math.sin(a))/l,f=(-s*Math.sin(a)+r*Math.cos(a))/l,h=n.pos.x+c*2.4*o*t,d=n.pos.z+f*2.4*o*t;n.path=[],(n.sitting||n.pendingSeat)&&this.standUp(n),(n.dance||n.meet)&&this.stopMoves(n),this.follow=!0,this.nav.isFree(h,d)?(n.pos.x=h,n.pos.z=d):this.nav.isFree(h,n.pos.z)?n.pos.x=h:this.nav.isFree(n.pos.x,d)&&(n.pos.z=d),n.facing=Kl(n.facing,Math.atan2(c,f),1-Math.exp(-t*14)),n.keyMove=!0;let p=performance.now();(!this.lastKeySend||p-this.lastKeySend>350)&&(this.lastKeySend=p,this.opts.onMove&&this.opts.onMove({x:n.pos.x,z:n.pos.z,seat:null}))}setStick(t,e){this.poke();let n=Math.hypot(this.stick.x,this.stick.y)>=.15;if(this.stick.x=Number(t)||0,this.stick.y=Number(e)||0,n&&Math.hypot(this.stick.x,this.stick.y)<.15){let s=this.self();s&&this.opts.onMove&&this.opts.onMove({x:s.pos.x,z:s.pos.z,seat:null})}}project(t){let e=t.project(this.cam);return{x:(e.x+1)/2*this.cssW,y:(1-e.y)/2*this.cssH}}placeDom(){let t=this.npc&&this.npc.person?[...this.people.values(),this.npc]:this.people.values(),e=this.people.size>24?new Set([...this.bubbles,...this.emotes].map(s=>s._p).filter(Boolean)):null;for(let s of t){let r=s.onScreen===!1||e&&s.lodNow&&!e.has(s);if(r!==!!s.plateOff&&(s.plateOff=r,s.plate.style.visibility=r?"hidden":""),r)continue;let o=this.project(s.person.headWorld(this.tmpV).setY(this.tmpV.y+.12));s.anchor=o,s.plateH||(s.plateH=s.plate.offsetHeight||34);let a=Math.round(o.x*2)/2,l=Math.round(o.y*2)/2;if(a!==s.tx||l!==s.ty){s.tx=a,s.ty=l,s.plate.style.transform=`translate3d(${a}px, ${l}px, 0) translate(-50%, -100%)`;let c=Math.round(l/6)*6+(s.me?2e3:0);c!==s.z&&(s.z=c,s.plate.style.zIndex=String(c))}}for(let s of this.bubbles){let r=s._p.anchor;if(!r)continue;let o=this.cssW,a=Math.max(120,Math.min(o-120,r.x));s.style.transform=`translate(${a}px, ${r.y-(s._p.plateH||34)-8}px) translate(-50%, -100%)`,s.style.setProperty("--tail",r.x-a+"px")}let n=null;for(let s of this.emotes){if(s._cat){n=n||this.project(this.cat.headWorld(this.tmpV)),s.style.transform=`translate(${n.x}px, ${n.y-8}px) translate(-50%, -100%)`;continue}let r=s._p.anchor;r&&(s.style.transform=`translate(${r.x+24}px, ${r.y-(s._p.plateH||34)-4}px) translate(-50%, -100%)`)}}destroy(){this.dead=!0,cancelAnimationFrame(this.raf),this.ro.disconnect(),this.renderer.dispose(),this.wrap.remove()}},tc=class{constructor(t){this.root=t;let e=document.createElement("canvas");e.className="avatar-preview",t.appendChild(e),this.canvas=e,this.renderer=xu(e),this.renderer.shadowMap.enabled=!1,this.scene=new Ji,yu(this.scene,512);let n=new ut(new J(.75,.8,.06,40),new Zt({color:"#dbe9fb",roughness:.6}));n.position.y=-.03,this.scene.add(n),this.cam=new Ge(30,1,.1,50),this.cam.position.set(0,1.25,4.1),this.cam.lookAt(0,.75,0),this.angle=.4,this.dead=!1,this.ro=new ResizeObserver(()=>this.resize()),this.ro.observe(t),this.resize();let s=performance.now(),r=o=>{if(this.dead)return;this.raf=requestAnimationFrame(r);let a=Math.min(.05,(o-s)/1e3);s=o,this.person&&(this.angle+=a*.6,this.person.root.rotation.y=Math.sin(this.angle)*.9,this.person.animate(a,o/1e3,{moving:!1,speed:0,seated:!1,typing:!1})),this.renderer.render(this.scene,this.cam)};this.raf=requestAnimationFrame(r)}resize(){let t=this.root.clientWidth||220,e=this.root.clientHeight||260;this.renderer.setSize(t,e,!1),this.cam.aspect=t/e,this.cam.updateProjectionMatrix()}update(t){this.person&&this.scene.remove(this.person.root),this.person=new Ds(ec(t),0),this.scene.add(this.person.root)}wave(){this.person&&this.person.doAction("wave",1600)}destroy(){this.dead=!0,cancelAnimationFrame(this.raf),this.ro.disconnect(),this.renderer.dispose(),this.canvas.remove()}};Bs.ROOM=oe;Bs.PLACES=Ql;window.Lobby3D=Bs;window.avatarToLook=ec;window.AvatarPreview=tc;})();
