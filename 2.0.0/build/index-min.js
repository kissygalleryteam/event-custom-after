/*!build time : 2013-12-23 3:07:36 PM*/
KISSY.add("kg/event-custom-after/2.0.0/index",function(a){"use strict";function b(){}var c=parseFloat(a.version);if(1.3>c)return a.log("KISSY which version lower than 1.3 does not support event-aop module","error","event-aop"),{};var d=a.require("event/base"),e=a.require("event/custom/observable"),f=d.Utils||d._Utils,g=1.4>c?function(a,b,c){return e.getCustomEvent(a,b,c)}:function(a,b,c){return a.getCustomEventObservable(b,c)},h={fakeObservers:function(a,b){var c,d=this.observers;return this.observers=this.afterObservers||(this.afterObservers=[]),c=a&&a.apply(this,b),this.observers=d,c},after:function(){return this.fakeObservers.call(this,this.on,a.makeArray(arguments))},fire:function(a){var b;if(!(a&&a.target&&a.target.notifyAfterObservers))return b=this._fire.apply(this,arguments),a=a.target.currentCustomEventObject,a.target===this.currentTarget&&(a.target.notifyAfterObservers=!0,a.target.currentNotifyRet=b,b=this.fire(a),delete a.target.currentCustomEventObject,delete a.target.notifyAfterObservers,delete a.target.currentNotifyRet),b;var c,d,e,b,f=this,g=f.type,h=f.bubbles,i=f.currentTarget,j=a,k=a.target.currentNotifyRet;if(j.isDefaultPrevented()||j.isImmediatePropagationStopped())return k;if(j.currentTarget=i,b=f.notify(j,!0),k!==!1&&void 0!=b&&(k=b),h&&!j.isPropagationStopped())for(c=i.getTargets(),d=c&&c.length||0,e=0;d>e&&!j.isPropagationStopped();e++)b=c[e].fire(g,j),k!==!1&&void 0!==b&&(k=b);return k},notify:function(a,b){return b?this.fakeObservers.call(this,this._notify,[a]):(a.target.currentCustomEventObject=a,this._notify.call(this,a))},detach:function(){var a=this.detachOn.apply(this,arguments),b=this.detachAfter(this,arguments);return b||a},resetAfter:function(){this.afterObservers=[]},detachAfter:function(){var b,c=this.reset;return this.reset=this.resetAfter,this.fakeObservers.call(this,this.detachOn,a.makeArray(arguments)),this.reset=c,b},checkMemory:function(){}};return a.augment(b,{injectCustomEvent:function(b){b.afterObservers=[],b._fire=b.fire,b._notify=b.notify,b.detachOn=b.detach,a.mix(b,h,!0)},after:function(a,b,c){var d=this;return f.batchForType(function(a,b,c){var e,h=f.normalizeParam(a,b,c);a=h.type,e=g(d,a,!0),e.afterObservers||d.injectCustomEvent(e),e&&e.after(h)},0,a,b,c),this},detach:function(){var b=this,c=a.makeArray(arguments),d=c[c.length-1];return"on"===d||"after"===d?c.pop():d=!1,f.batchForType.apply(f,[function(c,e,h){var i,j,k=f.normalizeParam(c,e,h);c=k.type,c?(j=g(b,c,!0),j&&("on"===d&&j.detachOn?j.detachOn(k):"after"===d&&j.detachAfter?j.detachAfter(k):j.detach(k))):(i=b.getCustomEvents(),a.each(i,function(a){"on"===d&&a.detachOn?a.detachOn(k):"after"===d&&a.detachAfter?a.detachAfter(k):a.detach(k)}))},0].concat(c)),b},detachOn:function(){var b=a.makeArray(arguments);return b.push("on"),this.detach.apply(this,b)},detachAfter:function(){var b=a.makeArray(arguments);return b.push("after"),this.detach.apply(this,b)}}),b});