(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,67034,(e,t,T)=>{var E={675:function(e,t){"use strict";t.byteLength=function(e){var t=n(e),T=t[0],E=t[1];return(T+E)*3/4-E},t.toByteArray=function(e){var t,T,i=n(e),s=i[0],L=i[1],o=new r((s+L)*3/4-L),N=0,a=L>0?s-4:s;for(T=0;T<a;T+=4)t=E[e.charCodeAt(T)]<<18|E[e.charCodeAt(T+1)]<<12|E[e.charCodeAt(T+2)]<<6|E[e.charCodeAt(T+3)],o[N++]=t>>16&255,o[N++]=t>>8&255,o[N++]=255&t;return 2===L&&(t=E[e.charCodeAt(T)]<<2|E[e.charCodeAt(T+1)]>>4,o[N++]=255&t),1===L&&(t=E[e.charCodeAt(T)]<<10|E[e.charCodeAt(T+1)]<<4|E[e.charCodeAt(T+2)]>>2,o[N++]=t>>8&255,o[N++]=255&t),o},t.fromByteArray=function(e){for(var t,E=e.length,r=E%3,i=[],s=0,L=E-r;s<L;s+=16383)i.push(function(e,t,E){for(var r,i=[],s=t;s<E;s+=3)r=(e[s]<<16&0xff0000)+(e[s+1]<<8&65280)+(255&e[s+2]),i.push(T[r>>18&63]+T[r>>12&63]+T[r>>6&63]+T[63&r]);return i.join("")}(e,s,s+16383>L?L:s+16383));return 1===r?i.push(T[(t=e[E-1])>>2]+T[t<<4&63]+"=="):2===r&&i.push(T[(t=(e[E-2]<<8)+e[E-1])>>10]+T[t>>4&63]+T[t<<2&63]+"="),i.join("")};for(var T=[],E=[],r="u">typeof Uint8Array?Uint8Array:Array,i="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",s=0,L=i.length;s<L;++s)T[s]=i[s],E[i.charCodeAt(s)]=s;function n(e){var t=e.length;if(t%4>0)throw Error("Invalid string. Length must be a multiple of 4");var T=e.indexOf("=");-1===T&&(T=t);var E=T===t?0:4-T%4;return[T,E]}E[45]=62,E[95]=63},72:function(e,t,T){"use strict";var E=T(675),r=T(783),i="function"==typeof Symbol&&"function"==typeof Symbol.for?Symbol.for("nodejs.util.inspect.custom"):null;function s(e){if(e>0x7fffffff)throw RangeError('The value "'+e+'" is invalid for option "size"');var t=new Uint8Array(e);return Object.setPrototypeOf(t,L.prototype),t}function L(e,t,T){if("number"==typeof e){if("string"==typeof t)throw TypeError('The "string" argument must be of type string. Received type number');return N(e)}return n(e,t,T)}function n(e,t,T){if("string"==typeof e){var E=e,r=t;if(("string"!=typeof r||""===r)&&(r="utf8"),!L.isEncoding(r))throw TypeError("Unknown encoding: "+r);var i=0|U(E,r),n=s(i),o=n.write(E,r);return o!==i&&(n=n.slice(0,o)),n}if(ArrayBuffer.isView(e))return a(e);if(null==e)throw TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type "+typeof e);if(I(e,ArrayBuffer)||e&&I(e.buffer,ArrayBuffer)||"u">typeof SharedArrayBuffer&&(I(e,SharedArrayBuffer)||e&&I(e.buffer,SharedArrayBuffer)))return function(e,t,T){var E;if(t<0||e.byteLength<t)throw RangeError('"offset" is outside of buffer bounds');if(e.byteLength<t+(T||0))throw RangeError('"length" is outside of buffer bounds');return Object.setPrototypeOf(E=void 0===t&&void 0===T?new Uint8Array(e):void 0===T?new Uint8Array(e,t):new Uint8Array(e,t,T),L.prototype),E}(e,t,T);if("number"==typeof e)throw TypeError('The "value" argument must not be of type number. Received type number');var N=e.valueOf&&e.valueOf();if(null!=N&&N!==e)return L.from(N,t,T);var f=function(e){if(L.isBuffer(e)){var t=0|u(e.length),T=s(t);return 0===T.length||e.copy(T,0,0,t),T}return void 0!==e.length?"number"!=typeof e.length||function(e){return e!=e}(e.length)?s(0):a(e):"Buffer"===e.type&&Array.isArray(e.data)?a(e.data):void 0}(e);if(f)return f;if("u">typeof Symbol&&null!=Symbol.toPrimitive&&"function"==typeof e[Symbol.toPrimitive])return L.from(e[Symbol.toPrimitive]("string"),t,T);throw TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type "+typeof e)}function o(e){if("number"!=typeof e)throw TypeError('"size" argument must be of type number');if(e<0)throw RangeError('The value "'+e+'" is invalid for option "size"')}function N(e){return o(e),s(e<0?0:0|u(e))}function a(e){for(var t=e.length<0?0:0|u(e.length),T=s(t),E=0;E<t;E+=1)T[E]=255&e[E];return T}t.Buffer=L,t.SlowBuffer=function(e){return+e!=e&&(e=0),L.alloc(+e)},t.INSPECT_MAX_BYTES=50,t.kMaxLength=0x7fffffff,L.TYPED_ARRAY_SUPPORT=function(){try{var e=new Uint8Array(1),t={foo:function(){return 42}};return Object.setPrototypeOf(t,Uint8Array.prototype),Object.setPrototypeOf(e,t),42===e.foo()}catch(e){return!1}}(),!L.TYPED_ARRAY_SUPPORT&&"u">typeof console&&"function"==typeof console.error&&console.error("This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support."),Object.defineProperty(L.prototype,"parent",{enumerable:!0,get:function(){if(L.isBuffer(this))return this.buffer}}),Object.defineProperty(L.prototype,"offset",{enumerable:!0,get:function(){if(L.isBuffer(this))return this.byteOffset}}),L.poolSize=8192,L.from=function(e,t,T){return n(e,t,T)},Object.setPrototypeOf(L.prototype,Uint8Array.prototype),Object.setPrototypeOf(L,Uint8Array),L.alloc=function(e,t,T){return(o(e),e<=0)?s(e):void 0!==t?"string"==typeof T?s(e).fill(t,T):s(e).fill(t):s(e)},L.allocUnsafe=function(e){return N(e)},L.allocUnsafeSlow=function(e){return N(e)};function u(e){if(e>=0x7fffffff)throw RangeError("Attempt to allocate Buffer larger than maximum size: 0x7fffffff bytes");return 0|e}function U(e,t){if(L.isBuffer(e))return e.length;if(ArrayBuffer.isView(e)||I(e,ArrayBuffer))return e.byteLength;if("string"!=typeof e)throw TypeError('The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type '+typeof e);var T=e.length,E=arguments.length>2&&!0===arguments[2];if(!E&&0===T)return 0;for(var r=!1;;)switch(t){case"ascii":case"latin1":case"binary":return T;case"utf8":case"utf-8":return R(e).length;case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return 2*T;case"hex":return T>>>1;case"base64":return g(e).length;default:if(r)return E?-1:R(e).length;t=(""+t).toLowerCase(),r=!0}}function f(e,t,T){var r,i,s,L=!1;if((void 0===t||t<0)&&(t=0),t>this.length||((void 0===T||T>this.length)&&(T=this.length),T<=0||(T>>>=0)<=(t>>>=0)))return"";for(e||(e="utf8");;)switch(e){case"hex":return function(e,t,T){var E=e.length;(!t||t<0)&&(t=0),(!T||T<0||T>E)&&(T=E);for(var r="",i=t;i<T;++i)r+=m[e[i]];return r}(this,t,T);case"utf8":case"utf-8":return l(this,t,T);case"ascii":return function(e,t,T){var E="";T=Math.min(e.length,T);for(var r=t;r<T;++r)E+=String.fromCharCode(127&e[r]);return E}(this,t,T);case"latin1":case"binary":return function(e,t,T){var E="";T=Math.min(e.length,T);for(var r=t;r<T;++r)E+=String.fromCharCode(e[r]);return E}(this,t,T);case"base64":return r=this,i=t,s=T,0===i&&s===r.length?E.fromByteArray(r):E.fromByteArray(r.slice(i,s));case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return function(e,t,T){for(var E=e.slice(t,T),r="",i=0;i<E.length;i+=2)r+=String.fromCharCode(E[i]+256*E[i+1]);return r}(this,t,T);default:if(L)throw TypeError("Unknown encoding: "+e);e=(e+"").toLowerCase(),L=!0}}function c(e,t,T){var E=e[t];e[t]=e[T],e[T]=E}function d(e,t,T,E,r){var i;if(0===e.length)return -1;if("string"==typeof T?(E=T,T=0):T>0x7fffffff?T=0x7fffffff:T<-0x80000000&&(T=-0x80000000),(i=T*=1)!=i&&(T=r?0:e.length-1),T<0&&(T=e.length+T),T>=e.length)if(r)return -1;else T=e.length-1;else if(T<0)if(!r)return -1;else T=0;if("string"==typeof t&&(t=L.from(t,E)),L.isBuffer(t))return 0===t.length?-1:A(e,t,T,E,r);if("number"==typeof t){if(t&=255,"function"==typeof Uint8Array.prototype.indexOf)if(r)return Uint8Array.prototype.indexOf.call(e,t,T);else return Uint8Array.prototype.lastIndexOf.call(e,t,T);return A(e,[t],T,E,r)}throw TypeError("val must be string, number or Buffer")}function A(e,t,T,E,r){var i,s=1,L=e.length,n=t.length;if(void 0!==E&&("ucs2"===(E=String(E).toLowerCase())||"ucs-2"===E||"utf16le"===E||"utf-16le"===E)){if(e.length<2||t.length<2)return -1;s=2,L/=2,n/=2,T/=2}function o(e,t){return 1===s?e[t]:e.readUInt16BE(t*s)}if(r){var N=-1;for(i=T;i<L;i++)if(o(e,i)===o(t,-1===N?0:i-N)){if(-1===N&&(N=i),i-N+1===n)return N*s}else -1!==N&&(i-=i-N),N=-1}else for(T+n>L&&(T=L-n),i=T;i>=0;i--){for(var a=!0,u=0;u<n;u++)if(o(e,i+u)!==o(t,u)){a=!1;break}if(a)return i}return -1}L.isBuffer=function(e){return null!=e&&!0===e._isBuffer&&e!==L.prototype},L.compare=function(e,t){if(I(e,Uint8Array)&&(e=L.from(e,e.offset,e.byteLength)),I(t,Uint8Array)&&(t=L.from(t,t.offset,t.byteLength)),!L.isBuffer(e)||!L.isBuffer(t))throw TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array');if(e===t)return 0;for(var T=e.length,E=t.length,r=0,i=Math.min(T,E);r<i;++r)if(e[r]!==t[r]){T=e[r],E=t[r];break}return T<E?-1:+(E<T)},L.isEncoding=function(e){switch(String(e).toLowerCase()){case"hex":case"utf8":case"utf-8":case"ascii":case"latin1":case"binary":case"base64":case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return!0;default:return!1}},L.concat=function(e,t){if(!Array.isArray(e))throw TypeError('"list" argument must be an Array of Buffers');if(0===e.length)return L.alloc(0);if(void 0===t)for(T=0,t=0;T<e.length;++T)t+=e[T].length;var T,E=L.allocUnsafe(t),r=0;for(T=0;T<e.length;++T){var i=e[T];if(I(i,Uint8Array)&&(i=L.from(i)),!L.isBuffer(i))throw TypeError('"list" argument must be an Array of Buffers');i.copy(E,r),r+=i.length}return E},L.byteLength=U,L.prototype._isBuffer=!0,L.prototype.swap16=function(){var e=this.length;if(e%2!=0)throw RangeError("Buffer size must be a multiple of 16-bits");for(var t=0;t<e;t+=2)c(this,t,t+1);return this},L.prototype.swap32=function(){var e=this.length;if(e%4!=0)throw RangeError("Buffer size must be a multiple of 32-bits");for(var t=0;t<e;t+=4)c(this,t,t+3),c(this,t+1,t+2);return this},L.prototype.swap64=function(){var e=this.length;if(e%8!=0)throw RangeError("Buffer size must be a multiple of 64-bits");for(var t=0;t<e;t+=8)c(this,t,t+7),c(this,t+1,t+6),c(this,t+2,t+5),c(this,t+3,t+4);return this},L.prototype.toString=function(){var e=this.length;return 0===e?"":0==arguments.length?l(this,0,e):f.apply(this,arguments)},L.prototype.toLocaleString=L.prototype.toString,L.prototype.equals=function(e){if(!L.isBuffer(e))throw TypeError("Argument must be a Buffer");return this===e||0===L.compare(this,e)},L.prototype.inspect=function(){var e="",T=t.INSPECT_MAX_BYTES;return e=this.toString("hex",0,T).replace(/(.{2})/g,"$1 ").trim(),this.length>T&&(e+=" ... "),"<Buffer "+e+">"},i&&(L.prototype[i]=L.prototype.inspect),L.prototype.compare=function(e,t,T,E,r){if(I(e,Uint8Array)&&(e=L.from(e,e.offset,e.byteLength)),!L.isBuffer(e))throw TypeError('The "target" argument must be one of type Buffer or Uint8Array. Received type '+typeof e);if(void 0===t&&(t=0),void 0===T&&(T=e?e.length:0),void 0===E&&(E=0),void 0===r&&(r=this.length),t<0||T>e.length||E<0||r>this.length)throw RangeError("out of range index");if(E>=r&&t>=T)return 0;if(E>=r)return -1;if(t>=T)return 1;if(t>>>=0,T>>>=0,E>>>=0,r>>>=0,this===e)return 0;for(var i=r-E,s=T-t,n=Math.min(i,s),o=this.slice(E,r),N=e.slice(t,T),a=0;a<n;++a)if(o[a]!==N[a]){i=o[a],s=N[a];break}return i<s?-1:+(s<i)},L.prototype.includes=function(e,t,T){return -1!==this.indexOf(e,t,T)},L.prototype.indexOf=function(e,t,T){return d(this,e,t,T,!0)},L.prototype.lastIndexOf=function(e,t,T){return d(this,e,t,T,!1)};function l(e,t,T){T=Math.min(e.length,T);for(var E=[],r=t;r<T;){var i,s,L,n,o=e[r],N=null,a=o>239?4:o>223?3:o>191?2:1;if(r+a<=T)switch(a){case 1:o<128&&(N=o);break;case 2:(192&(i=e[r+1]))==128&&(n=(31&o)<<6|63&i)>127&&(N=n);break;case 3:i=e[r+1],s=e[r+2],(192&i)==128&&(192&s)==128&&(n=(15&o)<<12|(63&i)<<6|63&s)>2047&&(n<55296||n>57343)&&(N=n);break;case 4:i=e[r+1],s=e[r+2],L=e[r+3],(192&i)==128&&(192&s)==128&&(192&L)==128&&(n=(15&o)<<18|(63&i)<<12|(63&s)<<6|63&L)>65535&&n<1114112&&(N=n)}null===N?(N=65533,a=1):N>65535&&(N-=65536,E.push(N>>>10&1023|55296),N=56320|1023&N),E.push(N),r+=a}var u=E,U=u.length;if(U<=4096)return String.fromCharCode.apply(String,u);for(var f="",c=0;c<U;)f+=String.fromCharCode.apply(String,u.slice(c,c+=4096));return f}function h(e,t,T){if(e%1!=0||e<0)throw RangeError("offset is not uint");if(e+t>T)throw RangeError("Trying to access beyond buffer length")}function O(e,t,T,E,r,i){if(!L.isBuffer(e))throw TypeError('"buffer" argument must be a Buffer instance');if(t>r||t<i)throw RangeError('"value" argument is out of bounds');if(T+E>e.length)throw RangeError("Index out of range")}function p(e,t,T,E,r,i){if(T+E>e.length||T<0)throw RangeError("Index out of range")}function D(e,t,T,E,i){return t*=1,T>>>=0,i||p(e,t,T,4,34028234663852886e22,-34028234663852886e22),r.write(e,t,T,E,23,4),T+4}function X(e,t,T,E,i){return t*=1,T>>>=0,i||p(e,t,T,8,17976931348623157e292,-17976931348623157e292),r.write(e,t,T,E,52,8),T+8}L.prototype.write=function(e,t,T,E){if(void 0===t)E="utf8",T=this.length,t=0;else if(void 0===T&&"string"==typeof t)E=t,T=this.length,t=0;else if(isFinite(t))t>>>=0,isFinite(T)?(T>>>=0,void 0===E&&(E="utf8")):(E=T,T=void 0);else throw Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");var r,i,s,L,n,o,N,a,u=this.length-t;if((void 0===T||T>u)&&(T=u),e.length>0&&(T<0||t<0)||t>this.length)throw RangeError("Attempt to write outside buffer bounds");E||(E="utf8");for(var U=!1;;)switch(E){case"hex":return function(e,t,T,E){T=Number(T)||0;var r=e.length-T;E?(E=Number(E))>r&&(E=r):E=r;var i=t.length;E>i/2&&(E=i/2);for(var s=0;s<E;++s){var L,n=parseInt(t.substr(2*s,2),16);if((L=n)!=L)break;e[T+s]=n}return s}(this,e,t,T);case"utf8":case"utf-8":return r=t,i=T,y(R(e,this.length-r),this,r,i);case"ascii":return s=t,L=T,y(S(e),this,s,L);case"latin1":case"binary":return function(e,t,T,E){return y(S(t),e,T,E)}(this,e,t,T);case"base64":return n=t,o=T,y(g(e),this,n,o);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return N=t,a=T,y(function(e,t){for(var T,E,r=[],i=0;i<e.length&&!((t-=2)<0);++i)E=(T=e.charCodeAt(i))>>8,r.push(T%256),r.push(E);return r}(e,this.length-N),this,N,a);default:if(U)throw TypeError("Unknown encoding: "+E);E=(""+E).toLowerCase(),U=!0}},L.prototype.toJSON=function(){return{type:"Buffer",data:Array.prototype.slice.call(this._arr||this,0)}},L.prototype.slice=function(e,t){var T=this.length;e=~~e,t=void 0===t?T:~~t,e<0?(e+=T)<0&&(e=0):e>T&&(e=T),t<0?(t+=T)<0&&(t=0):t>T&&(t=T),t<e&&(t=e);var E=this.subarray(e,t);return Object.setPrototypeOf(E,L.prototype),E},L.prototype.readUIntLE=function(e,t,T){e>>>=0,t>>>=0,T||h(e,t,this.length);for(var E=this[e],r=1,i=0;++i<t&&(r*=256);)E+=this[e+i]*r;return E},L.prototype.readUIntBE=function(e,t,T){e>>>=0,t>>>=0,T||h(e,t,this.length);for(var E=this[e+--t],r=1;t>0&&(r*=256);)E+=this[e+--t]*r;return E},L.prototype.readUInt8=function(e,t){return e>>>=0,t||h(e,1,this.length),this[e]},L.prototype.readUInt16LE=function(e,t){return e>>>=0,t||h(e,2,this.length),this[e]|this[e+1]<<8},L.prototype.readUInt16BE=function(e,t){return e>>>=0,t||h(e,2,this.length),this[e]<<8|this[e+1]},L.prototype.readUInt32LE=function(e,t){return e>>>=0,t||h(e,4,this.length),(this[e]|this[e+1]<<8|this[e+2]<<16)+0x1000000*this[e+3]},L.prototype.readUInt32BE=function(e,t){return e>>>=0,t||h(e,4,this.length),0x1000000*this[e]+(this[e+1]<<16|this[e+2]<<8|this[e+3])},L.prototype.readIntLE=function(e,t,T){e>>>=0,t>>>=0,T||h(e,t,this.length);for(var E=this[e],r=1,i=0;++i<t&&(r*=256);)E+=this[e+i]*r;return E>=(r*=128)&&(E-=Math.pow(2,8*t)),E},L.prototype.readIntBE=function(e,t,T){e>>>=0,t>>>=0,T||h(e,t,this.length);for(var E=t,r=1,i=this[e+--E];E>0&&(r*=256);)i+=this[e+--E]*r;return i>=(r*=128)&&(i-=Math.pow(2,8*t)),i},L.prototype.readInt8=function(e,t){return(e>>>=0,t||h(e,1,this.length),128&this[e])?-((255-this[e]+1)*1):this[e]},L.prototype.readInt16LE=function(e,t){e>>>=0,t||h(e,2,this.length);var T=this[e]|this[e+1]<<8;return 32768&T?0xffff0000|T:T},L.prototype.readInt16BE=function(e,t){e>>>=0,t||h(e,2,this.length);var T=this[e+1]|this[e]<<8;return 32768&T?0xffff0000|T:T},L.prototype.readInt32LE=function(e,t){return e>>>=0,t||h(e,4,this.length),this[e]|this[e+1]<<8|this[e+2]<<16|this[e+3]<<24},L.prototype.readInt32BE=function(e,t){return e>>>=0,t||h(e,4,this.length),this[e]<<24|this[e+1]<<16|this[e+2]<<8|this[e+3]},L.prototype.readFloatLE=function(e,t){return e>>>=0,t||h(e,4,this.length),r.read(this,e,!0,23,4)},L.prototype.readFloatBE=function(e,t){return e>>>=0,t||h(e,4,this.length),r.read(this,e,!1,23,4)},L.prototype.readDoubleLE=function(e,t){return e>>>=0,t||h(e,8,this.length),r.read(this,e,!0,52,8)},L.prototype.readDoubleBE=function(e,t){return e>>>=0,t||h(e,8,this.length),r.read(this,e,!1,52,8)},L.prototype.writeUIntLE=function(e,t,T,E){if(e*=1,t>>>=0,T>>>=0,!E){var r=Math.pow(2,8*T)-1;O(this,e,t,T,r,0)}var i=1,s=0;for(this[t]=255&e;++s<T&&(i*=256);)this[t+s]=e/i&255;return t+T},L.prototype.writeUIntBE=function(e,t,T,E){if(e*=1,t>>>=0,T>>>=0,!E){var r=Math.pow(2,8*T)-1;O(this,e,t,T,r,0)}var i=T-1,s=1;for(this[t+i]=255&e;--i>=0&&(s*=256);)this[t+i]=e/s&255;return t+T},L.prototype.writeUInt8=function(e,t,T){return e*=1,t>>>=0,T||O(this,e,t,1,255,0),this[t]=255&e,t+1},L.prototype.writeUInt16LE=function(e,t,T){return e*=1,t>>>=0,T||O(this,e,t,2,65535,0),this[t]=255&e,this[t+1]=e>>>8,t+2},L.prototype.writeUInt16BE=function(e,t,T){return e*=1,t>>>=0,T||O(this,e,t,2,65535,0),this[t]=e>>>8,this[t+1]=255&e,t+2},L.prototype.writeUInt32LE=function(e,t,T){return e*=1,t>>>=0,T||O(this,e,t,4,0xffffffff,0),this[t+3]=e>>>24,this[t+2]=e>>>16,this[t+1]=e>>>8,this[t]=255&e,t+4},L.prototype.writeUInt32BE=function(e,t,T){return e*=1,t>>>=0,T||O(this,e,t,4,0xffffffff,0),this[t]=e>>>24,this[t+1]=e>>>16,this[t+2]=e>>>8,this[t+3]=255&e,t+4},L.prototype.writeIntLE=function(e,t,T,E){if(e*=1,t>>>=0,!E){var r=Math.pow(2,8*T-1);O(this,e,t,T,r-1,-r)}var i=0,s=1,L=0;for(this[t]=255&e;++i<T&&(s*=256);)e<0&&0===L&&0!==this[t+i-1]&&(L=1),this[t+i]=(e/s|0)-L&255;return t+T},L.prototype.writeIntBE=function(e,t,T,E){if(e*=1,t>>>=0,!E){var r=Math.pow(2,8*T-1);O(this,e,t,T,r-1,-r)}var i=T-1,s=1,L=0;for(this[t+i]=255&e;--i>=0&&(s*=256);)e<0&&0===L&&0!==this[t+i+1]&&(L=1),this[t+i]=(e/s|0)-L&255;return t+T},L.prototype.writeInt8=function(e,t,T){return e*=1,t>>>=0,T||O(this,e,t,1,127,-128),e<0&&(e=255+e+1),this[t]=255&e,t+1},L.prototype.writeInt16LE=function(e,t,T){return e*=1,t>>>=0,T||O(this,e,t,2,32767,-32768),this[t]=255&e,this[t+1]=e>>>8,t+2},L.prototype.writeInt16BE=function(e,t,T){return e*=1,t>>>=0,T||O(this,e,t,2,32767,-32768),this[t]=e>>>8,this[t+1]=255&e,t+2},L.prototype.writeInt32LE=function(e,t,T){return e*=1,t>>>=0,T||O(this,e,t,4,0x7fffffff,-0x80000000),this[t]=255&e,this[t+1]=e>>>8,this[t+2]=e>>>16,this[t+3]=e>>>24,t+4},L.prototype.writeInt32BE=function(e,t,T){return e*=1,t>>>=0,T||O(this,e,t,4,0x7fffffff,-0x80000000),e<0&&(e=0xffffffff+e+1),this[t]=e>>>24,this[t+1]=e>>>16,this[t+2]=e>>>8,this[t+3]=255&e,t+4},L.prototype.writeFloatLE=function(e,t,T){return D(this,e,t,!0,T)},L.prototype.writeFloatBE=function(e,t,T){return D(this,e,t,!1,T)},L.prototype.writeDoubleLE=function(e,t,T){return X(this,e,t,!0,T)},L.prototype.writeDoubleBE=function(e,t,T){return X(this,e,t,!1,T)},L.prototype.copy=function(e,t,T,E){if(!L.isBuffer(e))throw TypeError("argument should be a Buffer");if(T||(T=0),E||0===E||(E=this.length),t>=e.length&&(t=e.length),t||(t=0),E>0&&E<T&&(E=T),E===T||0===e.length||0===this.length)return 0;if(t<0)throw RangeError("targetStart out of bounds");if(T<0||T>=this.length)throw RangeError("Index out of range");if(E<0)throw RangeError("sourceEnd out of bounds");E>this.length&&(E=this.length),e.length-t<E-T&&(E=e.length-t+T);var r=E-T;if(this===e&&"function"==typeof Uint8Array.prototype.copyWithin)this.copyWithin(t,T,E);else if(this===e&&T<t&&t<E)for(var i=r-1;i>=0;--i)e[i+t]=this[i+T];else Uint8Array.prototype.set.call(e,this.subarray(T,E),t);return r},L.prototype.fill=function(e,t,T,E){if("string"==typeof e){if("string"==typeof t?(E=t,t=0,T=this.length):"string"==typeof T&&(E=T,T=this.length),void 0!==E&&"string"!=typeof E)throw TypeError("encoding must be a string");if("string"==typeof E&&!L.isEncoding(E))throw TypeError("Unknown encoding: "+E);if(1===e.length){var r,i=e.charCodeAt(0);("utf8"===E&&i<128||"latin1"===E)&&(e=i)}}else"number"==typeof e?e&=255:"boolean"==typeof e&&(e=Number(e));if(t<0||this.length<t||this.length<T)throw RangeError("Out of range index");if(T<=t)return this;if(t>>>=0,T=void 0===T?this.length:T>>>0,e||(e=0),"number"==typeof e)for(r=t;r<T;++r)this[r]=e;else{var s=L.isBuffer(e)?e:L.from(e,E),n=s.length;if(0===n)throw TypeError('The value "'+e+'" is invalid for argument "value"');for(r=0;r<T-t;++r)this[r+t]=s[r%n]}return this};var F=/[^+/0-9A-Za-z-_]/g;function R(e,t){t=t||1/0;for(var T,E=e.length,r=null,i=[],s=0;s<E;++s){if((T=e.charCodeAt(s))>55295&&T<57344){if(!r){if(T>56319||s+1===E){(t-=3)>-1&&i.push(239,191,189);continue}r=T;continue}if(T<56320){(t-=3)>-1&&i.push(239,191,189),r=T;continue}T=(r-55296<<10|T-56320)+65536}else r&&(t-=3)>-1&&i.push(239,191,189);if(r=null,T<128){if((t-=1)<0)break;i.push(T)}else if(T<2048){if((t-=2)<0)break;i.push(T>>6|192,63&T|128)}else if(T<65536){if((t-=3)<0)break;i.push(T>>12|224,T>>6&63|128,63&T|128)}else if(T<1114112){if((t-=4)<0)break;i.push(T>>18|240,T>>12&63|128,T>>6&63|128,63&T|128)}else throw Error("Invalid code point")}return i}function S(e){for(var t=[],T=0;T<e.length;++T)t.push(255&e.charCodeAt(T));return t}function g(e){return E.toByteArray(function(e){if((e=(e=e.split("=")[0]).trim().replace(F,"")).length<2)return"";for(;e.length%4!=0;)e+="=";return e}(e))}function y(e,t,T,E){for(var r=0;r<E&&!(r+T>=t.length)&&!(r>=e.length);++r)t[r+T]=e[r];return r}function I(e,t){return e instanceof t||null!=e&&null!=e.constructor&&null!=e.constructor.name&&e.constructor.name===t.name}var m=function(){for(var e="0123456789abcdef",t=Array(256),T=0;T<16;++T)for(var E=16*T,r=0;r<16;++r)t[E+r]=e[T]+e[r];return t}()},783:function(e,t){t.read=function(e,t,T,E,r){var i,s,L=8*r-E-1,n=(1<<L)-1,o=n>>1,N=-7,a=T?r-1:0,u=T?-1:1,U=e[t+a];for(a+=u,i=U&(1<<-N)-1,U>>=-N,N+=L;N>0;i=256*i+e[t+a],a+=u,N-=8);for(s=i&(1<<-N)-1,i>>=-N,N+=E;N>0;s=256*s+e[t+a],a+=u,N-=8);if(0===i)i=1-o;else{if(i===n)return s?NaN:1/0*(U?-1:1);s+=Math.pow(2,E),i-=o}return(U?-1:1)*s*Math.pow(2,i-E)},t.write=function(e,t,T,E,r,i){var s,L,n,o=8*i-r-1,N=(1<<o)-1,a=N>>1,u=5960464477539062e-23*(23===r),U=E?0:i-1,f=E?1:-1,c=+(t<0||0===t&&1/t<0);for(isNaN(t=Math.abs(t))||t===1/0?(L=+!!isNaN(t),s=N):(s=Math.floor(Math.log(t)/Math.LN2),t*(n=Math.pow(2,-s))<1&&(s--,n*=2),s+a>=1?t+=u/n:t+=u*Math.pow(2,1-a),t*n>=2&&(s++,n/=2),s+a>=N?(L=0,s=N):s+a>=1?(L=(t*n-1)*Math.pow(2,r),s+=a):(L=t*Math.pow(2,a-1)*Math.pow(2,r),s=0));r>=8;e[T+U]=255&L,U+=f,L/=256,r-=8);for(s=s<<r|L,o+=r;o>0;e[T+U]=255&s,U+=f,s/=256,o-=8);e[T+U-f]|=128*c}}},r={};function i(e){var t=r[e];if(void 0!==t)return t.exports;var T=r[e]={exports:{}},s=!0;try{E[e](T,T.exports,i),s=!1}finally{s&&delete r[e]}return T.exports}i.ab="/ROOT/node_modules/next/dist/compiled/buffer/",t.exports=i(72)},18566,(e,t,T)=>{t.exports=e.r(76562)},71230,2775,57957,53117,e=>{"use strict";var t=e.i(43476),T=e.i(18566),E=e.i(71645);e.i(47167);let r="/demos/clatians-lms";class i extends Error{to;constructor(e){super(`redirect:${e}`),this.to=e}}class s extends Error{constructor(){super("not-found")}}let L={get(e){if("u"<typeof document)return;let t=document.cookie.match(RegExp(`(?:^|; )${e}=([^;]*)`));return t?{name:e,value:decodeURIComponent(t[1])}:void 0},has:e=>!!L.get(e),getAll:()=>"u"<typeof document?[]:document.cookie.split("; ").filter(Boolean).map(e=>{let t=e.indexOf("=");return{name:e.slice(0,t),value:decodeURIComponent(e.slice(t+1))}}),set(e,t,T={}){"u">typeof document&&(document.cookie=`${e}=${encodeURIComponent(t)}; path=${r||"/"}; SameSite=Lax${T.maxAge?`; max-age=${T.maxAge}`:""}`,window.dispatchEvent(new Event("demo:auth-changed")))},delete(e){"u">typeof document&&(document.cookie=`${e}=; path=${r||"/"}; max-age=0`,window.dispatchEvent(new Event("demo:auth-changed")))}};async function n(){return L}async function o(){return new Headers({"user-agent":"u">typeof navigator?navigator.userAgent:"demo","x-forwarded-for":"127.0.0.1"})}function N(){return(0,t.jsxs)("div",{className:"w-full p-6","aria-busy":"true",children:[(0,t.jsx)("div",{className:"h-6 w-48 animate-pulse rounded bg-gray-200/70"}),(0,t.jsx)("div",{className:"mt-4 h-40 w-full animate-pulse rounded-xl bg-gray-200/60"})]})}function a(){return(0,t.jsxs)("div",{className:"mx-auto w-full max-w-2xl px-4 py-16 text-center",children:[(0,t.jsx)("h1",{className:"text-2xl font-bold",children:"Not found"}),(0,t.jsx)("p",{className:"mt-2 text-gray-500",children:"This record is not in the demo data (it may have been reset)."})]})}function u(){let[e,t]=(0,E.useState)(0);return(0,E.useEffect)(()=>{let e=()=>t(e=>e+1);return window.addEventListener("demo:data-changed",e),window.addEventListener("demo:auth-changed",e),()=>{window.removeEventListener("demo:data-changed",e),window.removeEventListener("demo:auth-changed",e)}},[]),e}function U(e,r){let L=(0,T.useRouter)(),[n,o]=(0,E.useState)(null);return(0,E.useEffect)(()=>{let T=!0;return Promise.resolve().then(e).then(e=>{T&&o(e??(0,t.jsx)(t.Fragment,{}))}).catch(e=>{T&&(e instanceof i?L.replace(e.to):(e instanceof s||console.warn("[demo] page failed",e),o((0,t.jsx)(a,{}))))}),()=>{T=!1}},r),n}function f({tree:e,marker:T,children:r}){return(0,t.jsx)(t.Fragment,{children:function e(t,T,r){if(t===T)return r;if(Array.isArray(t))return t.map(t=>e(t,T,r));if((0,E.isValidElement)(t)){let i=t.props??{};if(void 0===i.children)return t;let s=e(i.children,T,r);return s===i.children?t:(0,E.cloneElement)(t,void 0,s)}return t}(e,T,r)})}function c(e){return Array.from(e,e=>e.toString(16).padStart(2,"0")).join("")}function d(e){return{toString:()=>e,length:e.length/2}}function A(e){let t=new Uint8Array(e);if(globalThis.crypto?.getRandomValues)globalThis.crypto.getRandomValues(t);else for(let T=0;T<e;T++)t[T]=Math.floor(256*Math.random());return d(c(t))}function l(e,t){let T=new Uint8Array(t),E=0x811c9dc5;for(let r=0;r<t;r++){for(let t=0;t<e.length;t++)E^=e.charCodeAt(t)+r,E=Math.imul(E,0x1000193)>>>0;T[r]=255&E}return c(T)}function h(e){let t="",T={update:e=>(t+=e,T),digest:e=>l(t,20)};return T}e.s(["DemoNotFound",0,s,"DemoRedirect",0,i,"cookies",0,n,"hardNavigate",0,function(t){let T=t.startsWith(r)?t:`${r}${t}`;e.A(53377).then(e=>e.flushDb()).catch(()=>void 0).finally(()=>window.location.assign(T.endsWith("/")||T.includes("?")?T:`${T}/`))},"headers",0,o,"redirect",0,function(e){throw new i(e)},"revalidatePath",0,function(e,t){window.dispatchEvent(new Event("demo:data-changed"))}],2775),e.s(["demoLayout",0,function(e){return function({children:T}){let r=u(),[i,s]=(0,E.useState)(null),L="__demo_children__",n=U(()=>e({children:L,params:Promise.resolve({})}),[r]);return((0,E.useEffect)(()=>{s(n)},[n]),i)?(0,t.jsx)(f,{tree:i,marker:L,children:T}):(0,t.jsx)(N,{})}},"demoPage",0,function(e,r={}){function i({staticParams:E}){let s=(0,T.useSearchParams)(),L=u(),n=s.toString();return U(()=>{let t=Object.fromEntries(new URLSearchParams(n).entries());return e({params:Promise.resolve({...E??{},...Object.fromEntries(Object.entries(r).map(([e,T])=>[e,t[T]??""]))}),searchParams:Promise.resolve(t)})},[n,L,JSON.stringify(E??{})])??(0,t.jsx)(N,{})}return function(e){return(0,t.jsx)(E.Suspense,{fallback:(0,t.jsx)(N,{}),children:(0,t.jsx)(i,{staticParams:e?.staticParams})})}}],71230),e.s(["createHash",0,h,"randomBytes",0,A,"scryptSync",0,function(e,t,T){return d(l(`${t}:${e}`,T))},"timingSafeEqual",0,function(e,t){return e.toString("hex")===t.toString("hex")}],57957);var O=e.i(13389);async function p(e,t=[]){let T=await (0,O.sqlite)(),E=(0,O.toSqlite)(e),r=/^\s*(insert|update|delete|create|alter|drop|replace)/i.test(E)||/\breturning\b/i.test(E),i=T.prepare(E),s=E.replace(/'(?:[^']|'')*'/g,"''"),L=(s.match(/\?/g)??[]).length,n=Math.max(0,...(s.match(/\$(\d+)/g)??[]).map(e=>Number(e.slice(1))));t=t.slice(0,Math.max(L,n));try{t.length&&i.bind(t.map(e=>void 0===e?null:"boolean"==typeof e?+!!e:e instanceof Date?e.toISOString():Array.isArray(e)||e&&"object"==typeof e?JSON.stringify(e):e));let e=[];for(;i.step();)e.push(i.getAsObject());let E=r?T.getRowsModified():e.length;return r&&(0,O.persistSoon)(),{rows:e,rowCount:r?E:e.length}}finally{i.free()}}async function D(e){let t=await (0,O.sqlite)();for(let T of(0,O.toSqlite)(e).replace(/^\s*--.*$/gm,"").split(/;\s*(?:\n|$)/).map(e=>e.trim()).filter(Boolean))try{t.run(T)}catch(e){if(!/duplicate column name/i.test(String(e)))throw Error(`${String(e)} in: ${T.slice(0,120)}`)}(0,O.persistSoon)()}let X={query:(e,t)=>/;\s*\S/.test(e.trim())&&!t?.length?D(e).then(()=>({rows:[],rowCount:0})):p(e,t),connect:async()=>({query:(e,t)=>X.query(e,t),release(){}})};function F(){return Promise.resolve()}let R="(strftime('%Y-%m-%d %H:%M:%S','now'))",S="(strftime('%Y-%m-%d %H:%M:%f','now'))",g=`
  CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY);

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'student',
    status TEXT NOT NULL DEFAULT 'active', created_at TEXT NOT NULL DEFAULT ${R}
  );
  ALTER TABLE users ADD COLUMN IF NOT EXISTS notify_prefs TEXT NOT NULL DEFAULT '{"push":true,"email":true,"sms":false}';
  ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_credit INTEGER NOT NULL DEFAULT 0;
  CREATE TABLE IF NOT EXISTS guardian_links (
    guardian_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT ${R}, PRIMARY KEY (guardian_id, student_id)
  );
  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT ${R}
  );
  CREATE TABLE IF NOT EXISTS courses (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'active', price INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT ${R}
  );
  -- Catalog columns mirrored from the LexPrep Academy website's \`courses\` table, so a
  -- course looks the same in the app as it does on lexprep.example.com. \`price\` stays
  -- the integer the checkout charges; \`fee_text\` is the website's display string.
  ALTER TABLE courses ADD COLUMN IF NOT EXISTS slug TEXT;
  ALTER TABLE courses ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'offline';
  ALTER TABLE courses ADD COLUMN IF NOT EXISTS icon TEXT NOT NULL DEFAULT '📚';
  ALTER TABLE courses ADD COLUMN IF NOT EXISTS color TEXT NOT NULL DEFAULT 'var(--blue-dark)';
  ALTER TABLE courses ADD COLUMN IF NOT EXISTS bg TEXT NOT NULL DEFAULT 'var(--info-border)';
  ALTER TABLE courses ADD COLUMN IF NOT EXISTS tagline TEXT NOT NULL DEFAULT '';
  ALTER TABLE courses ADD COLUMN IF NOT EXISTS overview TEXT NOT NULL DEFAULT '';
  ALTER TABLE courses ADD COLUMN IF NOT EXISTS duration TEXT NOT NULL DEFAULT '';
  ALTER TABLE courses ADD COLUMN IF NOT EXISTS batch_size TEXT NOT NULL DEFAULT '';
  ALTER TABLE courses ADD COLUMN IF NOT EXISTS mode TEXT NOT NULL DEFAULT '';
  ALTER TABLE courses ADD COLUMN IF NOT EXISTS fee_text TEXT NOT NULL DEFAULT '';
  ALTER TABLE courses ADD COLUMN IF NOT EXISTS emi TEXT NOT NULL DEFAULT '';
  ALTER TABLE courses ADD COLUMN IF NOT EXISTS features TEXT NOT NULL DEFAULT '[]';
  ALTER TABLE courses ADD COLUMN IF NOT EXISTS includes TEXT NOT NULL DEFAULT '[]';
  ALTER TABLE courses ADD COLUMN IF NOT EXISTS curriculum TEXT NOT NULL DEFAULT '[]';
  ALTER TABLE courses ADD COLUMN IF NOT EXISTS who_for TEXT NOT NULL DEFAULT '[]';
  ALTER TABLE courses ADD COLUMN IF NOT EXISTS testimonial TEXT NOT NULL DEFAULT '{}';
  ALTER TABLE courses ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;
  CREATE UNIQUE INDEX IF NOT EXISTS courses_slug_key ON courses (slug) WHERE slug IS NOT NULL;
  -- The course a student has picked in the app (before or without buying it);
  -- it heads their home screen. Enrolled courses take precedence.
  ALTER TABLE users ADD COLUMN IF NOT EXISTS selected_course_id TEXT REFERENCES courses(id) ON DELETE SET NULL;
  CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY, user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    course_id TEXT REFERENCES courses(id) ON DELETE SET NULL, amount INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'paid', method TEXT NOT NULL DEFAULT 'upi',
    invoice_no TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT ${R}
  );
  CREATE TABLE IF NOT EXISTS enrollments (
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT ${R}, PRIMARY KEY (user_id, course_id)
  );
  CREATE TABLE IF NOT EXISTS content (
    id TEXT PRIMARY KEY, title TEXT NOT NULL, type TEXT NOT NULL, body TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'pending', author_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    course_id TEXT REFERENCES courses(id) ON DELETE SET NULL, created_at TEXT NOT NULL DEFAULT ${R}
  );
  CREATE TABLE IF NOT EXISTS live_classes (
    id TEXT PRIMARY KEY, title TEXT NOT NULL, subject TEXT NOT NULL DEFAULT '',
    course_id TEXT REFERENCES courses(id) ON DELETE CASCADE, teacher_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    start_at TEXT NOT NULL, duration_min INTEGER NOT NULL DEFAULT 60, join_url TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'scheduled', recording_url TEXT NOT NULL DEFAULT '',
    notes TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT ${R}
  );
  CREATE TABLE IF NOT EXISTS class_attendance (
    class_id TEXT NOT NULL REFERENCES live_classes(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TEXT NOT NULL DEFAULT ${R}, present INTEGER NOT NULL DEFAULT 1,
    PRIMARY KEY (class_id, user_id)
  );
  -- In-class chat. Private by design: each student has one thread with the
  -- class's teacher, and no student ever sees another student's messages.
  CREATE TABLE IF NOT EXISTS class_messages (
    id TEXT PRIMARY KEY, class_id TEXT NOT NULL REFERENCES live_classes(id) ON DELETE CASCADE,
    student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sender_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    sender_role TEXT NOT NULL DEFAULT 'student', body TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT ${S}
  );
  CREATE INDEX IF NOT EXISTS class_messages_thread ON class_messages (class_id, student_id, created_at);
  CREATE TABLE IF NOT EXISTS doubts (
    id TEXT PRIMARY KEY, student_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    course_id TEXT REFERENCES courses(id) ON DELETE SET NULL, subject TEXT NOT NULL DEFAULT '',
    body TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'open', answer TEXT NOT NULL DEFAULT '',
    answered_by TEXT REFERENCES users(id) ON DELETE SET NULL, created_at TEXT NOT NULL DEFAULT ${R}
  );
  CREATE TABLE IF NOT EXISTS doubt_messages (
    id TEXT PRIMARY KEY, doubt_id TEXT NOT NULL REFERENCES doubts(id) ON DELETE CASCADE,
    sender_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    sender_role TEXT NOT NULL DEFAULT 'student', body TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT ${S}
  );
  CREATE TABLE IF NOT EXISTS tests (
    id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL DEFAULT '',
    type TEXT NOT NULL DEFAULT 'mock', course_id TEXT REFERENCES courses(id) ON DELETE SET NULL,
    duration_min INTEGER NOT NULL DEFAULT 60, status TEXT NOT NULL DEFAULT 'draft',
    created_by TEXT REFERENCES users(id) ON DELETE SET NULL, created_at TEXT NOT NULL DEFAULT ${R}
  );
  CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY, test_id TEXT NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
    subject TEXT NOT NULL DEFAULT '', text TEXT NOT NULL, opt_a TEXT NOT NULL, opt_b TEXT NOT NULL,
    opt_c TEXT NOT NULL, opt_d TEXT NOT NULL, correct TEXT NOT NULL, marks REAL NOT NULL DEFAULT 1,
    negative REAL NOT NULL DEFAULT 0.25, order_idx INTEGER NOT NULL DEFAULT 0
  );
  -- The written solution shown in review. Practice papers always carry one;
  -- mocks may leave it blank and fall back to the AI explanation.
  ALTER TABLE questions ADD COLUMN IF NOT EXISTS explanation TEXT NOT NULL DEFAULT '';
  -- Passage-based sections (Reading Comprehension, Legal Principle + Facts) share
  -- one stimulus across several questions; blank for standalone questions.
  ALTER TABLE questions ADD COLUMN IF NOT EXISTS passage TEXT NOT NULL DEFAULT '';
  CREATE TABLE IF NOT EXISTS test_attempts (
    id TEXT PRIMARY KEY, test_id TEXT NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, score REAL NOT NULL DEFAULT 0,
    total REAL NOT NULL DEFAULT 0, correct_cnt INTEGER NOT NULL DEFAULT 0, wrong_cnt INTEGER NOT NULL DEFAULT 0,
    unattempted INTEGER NOT NULL DEFAULT 0, answers TEXT NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'in_progress', started_at TEXT NOT NULL DEFAULT ${R}, submitted_at TEXT
  );
  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL DEFAULT 'info', title TEXT NOT NULL, body TEXT NOT NULL DEFAULT '',
    is_read INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT ${R}
  );
  CREATE TABLE IF NOT EXISTS content_progress (
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content_id TEXT NOT NULL REFERENCES content(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT ${R}, PRIMARY KEY (user_id, content_id)
  );
  CREATE TABLE IF NOT EXISTS practice_sessions (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic TEXT NOT NULL DEFAULT '', subject TEXT NOT NULL DEFAULT '', difficulty TEXT NOT NULL DEFAULT 'medium',
    total INTEGER NOT NULL DEFAULT 0, correct INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT ${R}
  );
  CREATE TABLE IF NOT EXISTS booking_slots (
    id TEXT PRIMARY KEY, teacher_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_at TEXT NOT NULL, duration_min INTEGER NOT NULL DEFAULT 30,
    status TEXT NOT NULL DEFAULT 'open', booked_by TEXT REFERENCES users(id) ON DELETE SET NULL,
    topic TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT ${R}
  );
  CREATE TABLE IF NOT EXISTS announcements (
    id TEXT PRIMARY KEY, title TEXT NOT NULL, body TEXT NOT NULL DEFAULT '',
    course_id TEXT REFERENCES courses(id) ON DELETE SET NULL, audience TEXT NOT NULL DEFAULT 'All students',
    recipients INTEGER NOT NULL DEFAULT 0, sent_by TEXT REFERENCES users(id) ON DELETE SET NULL,
    created_at TEXT NOT NULL DEFAULT ${R}
  );
  CREATE TABLE IF NOT EXISTS study_tasks (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL, done INTEGER NOT NULL DEFAULT 0, due_date TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT ${R}
  );
  CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT '', body TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT ${R}, updated_at TEXT NOT NULL DEFAULT ${R}
  );
  CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, phone TEXT NOT NULL DEFAULT '', email TEXT NOT NULL DEFAULT '',
    interest TEXT NOT NULL DEFAULT '', demo_date TEXT NOT NULL DEFAULT '', message TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'new', notes TEXT NOT NULL DEFAULT '',
    referred_by TEXT REFERENCES users(id) ON DELETE SET NULL,
    created_at TEXT NOT NULL DEFAULT ${R}, updated_at TEXT NOT NULL DEFAULT ${R}
  );
  ALTER TABLE leads ADD COLUMN IF NOT EXISTS referred_by TEXT REFERENCES users(id) ON DELETE SET NULL;
  ALTER TABLE leads ADD COLUMN IF NOT EXISTS reward_given INTEGER NOT NULL DEFAULT 0;
  CREATE TABLE IF NOT EXISTS audit_log (
    id TEXT PRIMARY KEY, actor_id TEXT, actor_name TEXT NOT NULL DEFAULT '', actor_role TEXT NOT NULL DEFAULT '',
    action TEXT NOT NULL, detail TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT ${R}
  );
  CREATE TABLE IF NOT EXISTS saved_items (
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, kind TEXT NOT NULL, item_key TEXT NOT NULL,
    title TEXT NOT NULL DEFAULT '', subtitle TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT ${R}, PRIMARY KEY (user_id, kind, item_key)
  );
  CREATE TABLE IF NOT EXISTS resources (
    id TEXT PRIMARY KEY, type TEXT NOT NULL, title TEXT NOT NULL, body TEXT NOT NULL DEFAULT '',
    data TEXT NOT NULL DEFAULT '{}', status TEXT NOT NULL DEFAULT 'published',
    created_by TEXT REFERENCES users(id) ON DELETE SET NULL, order_idx INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT ${R}
  );
  CREATE TABLE IF NOT EXISTS ai_threads (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'New chat', created_at TEXT NOT NULL DEFAULT ${R}
  );
  CREATE TABLE IF NOT EXISTS ai_messages (
    id TEXT PRIMARY KEY, thread_id TEXT NOT NULL REFERENCES ai_threads(id) ON DELETE CASCADE,
    role TEXT NOT NULL, content TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT ${S}
  );
  CREATE TABLE IF NOT EXISTS course_categories (
    id TEXT PRIMARY KEY, key TEXT NOT NULL UNIQUE, label TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT '', color TEXT NOT NULL DEFAULT 'var(--blue-dark)',
    accent TEXT NOT NULL DEFAULT 'var(--blue-dark)', bg TEXT NOT NULL DEFAULT 'var(--info-border)',
    sort_order INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS subjects (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL DEFAULT '', icon TEXT NOT NULL DEFAULT '📖',
    color TEXT NOT NULL DEFAULT 'var(--blue-dark)', sort_order INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS modules (
    id TEXT PRIMARY KEY, course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    subject_id TEXT REFERENCES subjects(id) ON DELETE SET NULL,
    title TEXT NOT NULL, description TEXT NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT ${R}
  );
  CREATE TABLE IF NOT EXISTS chapters (
    id TEXT PRIMARY KEY, module_id TEXT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL, description TEXT NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT ${R}
  );
  CREATE TABLE IF NOT EXISTS lessons (
    id TEXT PRIMARY KEY, chapter_id TEXT NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    title TEXT NOT NULL, type TEXT NOT NULL DEFAULT 'video',
    body TEXT NOT NULL DEFAULT '', video_url TEXT NOT NULL DEFAULT '',
    duration_min INTEGER NOT NULL DEFAULT 0, is_free INTEGER NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT ${R}
  );
  -- A lesson is a syllabus *topic*: one place holding its video (video_url),
  -- written notes (body), an optional notes PDF/link, a practice test and the
  -- doubts students raise about it.
  ALTER TABLE lessons ADD COLUMN IF NOT EXISTS notes_url TEXT NOT NULL DEFAULT '';
  ALTER TABLE lessons ADD COLUMN IF NOT EXISTS test_id TEXT REFERENCES tests(id) ON DELETE SET NULL;
  -- Retired: a chapter's single test, before chapter_tests allowed several.
  ALTER TABLE chapters ADD COLUMN IF NOT EXISTS test_id TEXT REFERENCES tests(id) ON DELETE SET NULL;
  -- Chapter tests: papers with questions from every topic in the chapter; a chapter can have several.
  CREATE TABLE IF NOT EXISTS chapter_tests (
    chapter_id TEXT NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    test_id TEXT NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT ${R},
    PRIMARY KEY (chapter_id, test_id)
  );
  INSERT INTO chapter_tests (chapter_id, test_id) SELECT id, test_id FROM chapters WHERE test_id IS NOT NULL ON CONFLICT DO NOTHING;
  UPDATE chapters SET test_id = NULL WHERE test_id IS NOT NULL;
  -- Topic tests: a topic can have several (Topic Test 1, Topic Test 2…). lessons.test_id is retired.
  CREATE TABLE IF NOT EXISTS lesson_tests (
    lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    test_id TEXT NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT ${R},
    PRIMARY KEY (lesson_id, test_id)
  );
  INSERT INTO lesson_tests (lesson_id, test_id, sort_order) SELECT id, test_id, 1 FROM lessons WHERE test_id IS NOT NULL ON CONFLICT DO NOTHING;
  UPDATE lessons SET test_id = NULL WHERE test_id IS NOT NULL;
  ALTER TABLE doubts ADD COLUMN IF NOT EXISTS lesson_id TEXT REFERENCES lessons(id) ON DELETE SET NULL;
  -- Optional solution video a teacher attaches when answering (the topic's "Doubt solving videos").
  ALTER TABLE doubts ADD COLUMN IF NOT EXISTS video_url TEXT NOT NULL DEFAULT '';
  -- A photo or PDF the student attached to their doubt.
  ALTER TABLE doubts ADD COLUMN IF NOT EXISTS attachment_url TEXT NOT NULL DEFAULT '';
  -- Notes file permission: 0 = opens only inside the app, 1 = students may download it.
  ALTER TABLE lessons ADD COLUMN IF NOT EXISTS notes_download INTEGER NOT NULL DEFAULT 0;
  -- 0 = the website no longer sells this course: hidden from browsing, still open to students enrolled in it.
  ALTER TABLE courses ADD COLUMN IF NOT EXISTS listed INTEGER NOT NULL DEFAULT 1;
  CREATE TABLE IF NOT EXISTS lesson_progress (
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    completed INTEGER NOT NULL DEFAULT 0, watch_seconds INTEGER NOT NULL DEFAULT 0,
    last_position_sec INTEGER NOT NULL DEFAULT 0,
    completed_at TEXT,
    created_at TEXT NOT NULL DEFAULT ${R},
    PRIMARY KEY (user_id, lesson_id)
  );
  CREATE TABLE IF NOT EXISTS batches (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE,
    course_id TEXT REFERENCES courses(id) ON DELETE SET NULL,
    category TEXT NOT NULL DEFAULT 'offline', exam TEXT NOT NULL DEFAULT '',
    batch_code TEXT NOT NULL DEFAULT '', start_date TEXT NOT NULL DEFAULT '',
    end_date TEXT NOT NULL DEFAULT '', duration TEXT NOT NULL DEFAULT '',
    schedule TEXT NOT NULL DEFAULT '', mode TEXT NOT NULL DEFAULT '',
    seats INTEGER NOT NULL DEFAULT 30, filled INTEGER NOT NULL DEFAULT 0,
    fee INTEGER NOT NULL DEFAULT 0, original_fee INTEGER NOT NULL DEFAULT 0,
    emi TEXT NOT NULL DEFAULT '', offer TEXT NOT NULL DEFAULT '',
    color TEXT NOT NULL DEFAULT 'var(--blue-dark)', bg TEXT NOT NULL DEFAULT 'var(--info-border)',
    status TEXT NOT NULL DEFAULT 'upcoming', language TEXT NOT NULL DEFAULT 'Hinglish',
    batch_type TEXT NOT NULL DEFAULT '', chips TEXT NOT NULL DEFAULT '[]',
    faculty TEXT NOT NULL DEFAULT '[]', highlights TEXT NOT NULL DEFAULT '[]',
    syllabus TEXT NOT NULL DEFAULT '[]', description TEXT NOT NULL DEFAULT '',
    details TEXT NOT NULL DEFAULT '{}', created_at TEXT NOT NULL DEFAULT ${R}
  );
  CREATE TABLE IF NOT EXISTS batch_enrollments (
    id TEXT PRIMARY KEY, batch_id TEXT NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    enrolled_by TEXT REFERENCES users(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'active', amount INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT ${R}
  );
  CREATE TABLE IF NOT EXISTS faculty (
    id TEXT PRIMARY KEY, user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    name TEXT NOT NULL, designation TEXT NOT NULL DEFAULT '',
    subject TEXT NOT NULL DEFAULT '', specialization TEXT NOT NULL DEFAULT '',
    rating REAL NOT NULL DEFAULT 0, students_count TEXT NOT NULL DEFAULT '',
    experience TEXT NOT NULL DEFAULT '', avatar TEXT NOT NULL DEFAULT '',
    photo TEXT NOT NULL DEFAULT '', color TEXT NOT NULL DEFAULT 'var(--blue-dark)',
    bg TEXT NOT NULL DEFAULT 'var(--info-border)', tags TEXT NOT NULL DEFAULT '[]',
    bio TEXT NOT NULL DEFAULT '', education TEXT NOT NULL DEFAULT '[]',
    achievements TEXT NOT NULL DEFAULT '[]', courses TEXT NOT NULL DEFAULT '[]',
    expertise TEXT NOT NULL DEFAULT '[]', sort_order INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS faculty_assignments (
    id TEXT PRIMARY KEY, faculty_id TEXT NOT NULL REFERENCES faculty(id) ON DELETE CASCADE,
    batch_id TEXT REFERENCES batches(id) ON DELETE SET NULL,
    course_id TEXT REFERENCES courses(id) ON DELETE SET NULL,
    subject TEXT NOT NULL DEFAULT '', role TEXT NOT NULL DEFAULT 'faculty',
    created_at TEXT NOT NULL DEFAULT ${R}
  );
  CREATE TABLE IF NOT EXISTS mentorship_programs (
    id TEXT PRIMARY KEY, title TEXT NOT NULL, slug TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL DEFAULT 'mentorship', exam TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '', overview TEXT NOT NULL DEFAULT '',
    duration TEXT NOT NULL DEFAULT '', batch_size TEXT NOT NULL DEFAULT '',
    mode TEXT NOT NULL DEFAULT 'Online', fee INTEGER NOT NULL DEFAULT 0,
    original_fee INTEGER NOT NULL DEFAULT 0, emi TEXT NOT NULL DEFAULT '',
    features TEXT NOT NULL DEFAULT '[]', includes TEXT NOT NULL DEFAULT '[]',
    curriculum TEXT NOT NULL DEFAULT '[]', who_for TEXT NOT NULL DEFAULT '[]',
    color TEXT NOT NULL DEFAULT 'var(--purple)', bg TEXT NOT NULL DEFAULT '#EDE9FE',
    sort_order INTEGER NOT NULL DEFAULT 0, status TEXT NOT NULL DEFAULT 'active'
  );
  CREATE TABLE IF NOT EXISTS mentorship_enrollments (
    id TEXT PRIMARY KEY, program_id TEXT NOT NULL REFERENCES mentorship_programs(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mentor_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'active', goals TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL DEFAULT ${R}
  );
  CREATE TABLE IF NOT EXISTS mentorship_sessions (
    id TEXT PRIMARY KEY, enrollment_id TEXT NOT NULL REFERENCES mentorship_enrollments(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT '', type TEXT NOT NULL DEFAULT 'session',
    scheduled_at TEXT NOT NULL DEFAULT '', duration_min INTEGER NOT NULL DEFAULT 30,
    status TEXT NOT NULL DEFAULT 'scheduled', notes TEXT NOT NULL DEFAULT '',
    mentor_notes TEXT NOT NULL DEFAULT '', student_notes TEXT NOT NULL DEFAULT '',
    action_items TEXT NOT NULL DEFAULT '[]', feedback TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT ${R}
  );
  CREATE TABLE IF NOT EXISTS blog_posts (
    id TEXT PRIMARY KEY, slug TEXT NOT NULL UNIQUE, title TEXT NOT NULL,
    excerpt TEXT NOT NULL DEFAULT '', content TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT '', category_color TEXT NOT NULL DEFAULT '#08BD80',
    author TEXT NOT NULL DEFAULT '', author_avatar TEXT NOT NULL DEFAULT '',
    date TEXT NOT NULL DEFAULT '', read_time TEXT NOT NULL DEFAULT '',
    tags TEXT NOT NULL DEFAULT '[]', cover_image TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'published', sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT ${R}
  );
  CREATE TABLE IF NOT EXISTS exam_calendars (
    id TEXT PRIMARY KEY, exam TEXT NOT NULL UNIQUE, full_name TEXT NOT NULL,
    conducting_body TEXT NOT NULL DEFAULT '', participating_colleges INTEGER NOT NULL DEFAULT 0,
    seats INTEGER NOT NULL DEFAULT 0, duration_min INTEGER NOT NULL DEFAULT 0,
    total_questions INTEGER NOT NULL DEFAULT 0, total_marks INTEGER NOT NULL DEFAULT 150,
    negative_marking REAL NOT NULL DEFAULT 0.25, mode TEXT NOT NULL DEFAULT 'Online',
    sections TEXT NOT NULL DEFAULT '[]', color TEXT NOT NULL DEFAULT 'var(--blue-dark)',
    description TEXT NOT NULL DEFAULT '', important_dates TEXT NOT NULL DEFAULT '[]'
  );
  CREATE TABLE IF NOT EXISTS college_predictor (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, short_name TEXT NOT NULL,
    city TEXT NOT NULL DEFAULT '', ranking INTEGER NOT NULL DEFAULT 0,
    clat_cutoff_general INTEGER NOT NULL DEFAULT 0, clat_cutoff_obc INTEGER NOT NULL DEFAULT 0,
    clat_cutoff_sc INTEGER NOT NULL DEFAULT 0, clat_cutoff_st INTEGER NOT NULL DEFAULT 0,
    ailet_cutoff_general INTEGER NOT NULL DEFAULT 0, type TEXT NOT NULL DEFAULT 'NLU',
    established INTEGER NOT NULL DEFAULT 0, website TEXT NOT NULL DEFAULT '',
    color TEXT NOT NULL DEFAULT 'var(--blue-dark)', bg TEXT NOT NULL DEFAULT 'var(--info-border)',
    details TEXT NOT NULL DEFAULT '{}'
  );
  -- seedColleges() upserts with ON CONFLICT (name), which needs this index.
  CREATE UNIQUE INDEX IF NOT EXISTS college_predictor_name_key ON college_predictor (name);
  CREATE TABLE IF NOT EXISTS assignments (
    id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL DEFAULT '',
    course_id TEXT REFERENCES courses(id) ON DELETE SET NULL,
    subject_id TEXT REFERENCES subjects(id) ON DELETE SET NULL,
    teacher_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    due_date TEXT NOT NULL DEFAULT '', total_marks INTEGER NOT NULL DEFAULT 100,
    status TEXT NOT NULL DEFAULT 'published', created_at TEXT NOT NULL DEFAULT ${R}
  );
  CREATE TABLE IF NOT EXISTS assignment_submissions (
    id TEXT PRIMARY KEY, assignment_id TEXT NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    body TEXT NOT NULL DEFAULT '', file_url TEXT NOT NULL DEFAULT '',
    marks_obtained REAL, feedback TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'submitted', submitted_at TEXT NOT NULL DEFAULT ${R}
  );
  -- Supabase exposes every public table through its REST API to anyone holding
  -- the (public) anon key. The app talks to Postgres directly as the table
  -- owner, which RLS doesn't restrict, so RLS with no policies shuts the REST
  -- door without affecting the app. Re-runs with every schema change, so new
  -- tables are covered.
  DO $$ DECLARE r record; BEGIN
    FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND NOT rowsecurity LOOP
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', r.tablename);
    END LOOP;
  END $$;
`;h("sha1").update(g).digest("hex").slice(0,16),e.s(["db",0,{prepare:e=>({get:async(...t)=>(await F(),(await p(e,t)).rows[0]),all:async(...t)=>(await F(),(await p(e,t)).rows),run:async(...t)=>(await F(),{changes:(await p(e,t)).rowCount??0})}),pool:X},"newId",0,function(){return A(9).toString("hex")}],53117)}]);