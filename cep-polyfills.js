// Local JavaScript compatibility for CEP 7 / Chromium 41. No network or filesystem APIs.
(function () {
  'use strict';
  function define(object, name, value) {
    if (typeof object[name] !== 'function') Object.defineProperty(object, name, {value:value, configurable:true, writable:true});
  }
  function object(value) { if (value === null || value === undefined) throw new TypeError('Missing object'); return Object(value); }
  function integer(value) { var n=Number(value); if (isNaN(n) || n===0) return 0; if (!isFinite(n)) return n; return (n<0?-1:1)*Math.floor(Math.abs(n)); }
  function length(value) { return Math.min(Math.max(integer(value),0),9007199254740991); }
  define(Object, 'assign', function (target) {
    var result=object(target), source, keys, i, k;
    for (i=1;i<arguments.length;i++) {
      if (arguments[i]===null || arguments[i]===undefined) continue;
      source=Object(arguments[i]);keys=Object.keys(source);
      if (typeof Object.getOwnPropertySymbols==='function') keys=keys.concat(Object.getOwnPropertySymbols(source));
      for (k=0;k<keys.length;k++) if (Object.prototype.propertyIsEnumerable.call(source,keys[k])) result[keys[k]]=source[keys[k]];
    }
    return result;
  });
  define(Object, 'values', function (source) { var o=object(source);return Object.keys(o).map(function(k){return o[k];}); });
  define(Array, 'from', function (value, map, context) {
    var o=object(value), result=[], n, i=0, iterator, step;
    if (map!==undefined && typeof map!=='function') throw new TypeError('Invalid map function');
    if (typeof Symbol==='function' && Symbol.iterator && typeof o[Symbol.iterator]==='function') {
      iterator=o[Symbol.iterator]();
      try { while (!(step=iterator.next()).done) { result.push(map===undefined?step.value:map.call(context,step.value,i));i++; } }
      catch (error) { if (iterator && typeof iterator['return']==='function') iterator['return'](); throw error; }
    } else {
      n=length(o.length);
      for (;i<n;i++) result.push(map===undefined?o[i]:map.call(context,o[i],i));
    }
    return result;
  });
  function find(indexOnly) { return function (callback, context) {
    var o=object(this), n=length(o.length), i;
    if (typeof callback!=='function') throw new TypeError('Invalid callback');
    for(i=0;i<n;i++) if(callback.call(context,o[i],i,o)) return indexOnly?i:o[i];
    return indexOnly?-1:undefined;
  }; }
  define(Array.prototype,'find',find(false));define(Array.prototype,'findIndex',find(true));
  define(Array.prototype,'includes',function (value, from) {
    var o=object(this),n=length(o.length),i=integer(from);i=i<0?Math.max(n+i,0):i;
    for(;i<n;i++)if(o[i]===value || (o[i]!==o[i] && value!==value))return true;
    return false;
  });
  function text(value, search) { if(value===null || value===undefined) throw new TypeError('Missing string');if(Object.prototype.toString.call(search)==='[object RegExp]')throw new TypeError('Invalid search');return String(value); }
  define(String.prototype,'includes',function (search,position) {var s=text(this,search);return s.indexOf(String(search),Math.max(integer(position),0))!==-1;});
  define(String.prototype,'startsWith',function (search,position) {var s=text(this,search),q=String(search),p=Math.min(Math.max(integer(position),0),s.length);return s.substr(p,q.length)===q;});
  define(String.prototype,'endsWith',function (search,position) {var s=text(this,search),q=String(search),p=position===undefined?s.length:Math.min(Math.max(integer(position),0),s.length);return p>=q.length && s.substring(p-q.length,p)===q;});
  define(Number,'isFinite',function (value) {return typeof value==='number' && isFinite(value);});
  define(Number,'isInteger',function (value) {return Number.isFinite(value) && Math.floor(value)===value;});
})();
