/**
 * @fileoverview 
 * @author 虎牙<huya.nzb@alibaba-inc.com>
 * @module event-custom-after
 **/
KISSY.add(function (S) {
    
    'use strict';
    
    //TODO
    //1.3.0 detach compatibility
    
    var SVersion = parseFloat(S.version);
    
    if (SVersion < 1.3) {
        //不支持KISSY 1.3以下版本
        S.log('KISSY which version lower than 1.3 does not support event-aop module', 'error', 'event-aop');
        return {};
    }
    
    var BaseEvent = S.require('event/base'),
        Observable = S.require('event/custom/observable'),
        
        Utils = BaseEvent.Utils || BaseEvent._Utils,
        getCustomEvent = SVersion < 1.4 ? function (target, type, create) {
            return Observable.getCustomEvent(target, type, create);
        } : function(target, type, create) {
            return target.getCustomEventObservable(type, create);
        },
        
        //插入自定义事件实例的方法
        //只给当前组件插入，不污染原型
        CEInjectMethods = {
            
            /**
             * 用afterObservers冒充observers调用原来的方法，小技巧
             * @method fakeObservers
             * @param {Object} callback 回调
             * @param {Object} args 参数
             */
            fakeObservers: function(callback, args) {
                var observers = this.observers,
                    ret; 
               
               this.observers = this.afterObservers || (this.afterObservers = []);
               ret = callback && callback.apply(this, args);
               this.observers = observers;
               
               return ret;
            },
            
            /**
             * 绑定after类事件
             * @method after
             */
            after: function() {
                return this.fakeObservers.call(this, this.on, S.makeArray(arguments));
            },
            
            /**
             * 触发事件
             * @method fire
             * @param {EventFacade} event 事件对象
             */
            fire: function(event) {
                var ret;
                
                //fire on
                if (!(event && event.target && event.target.notifyAfterObservers)) {
                    ret = this._fire.apply(this, arguments);
                    event = event.target.currentCustomEventObject;
                    
                    if (event.target === this.currentTarget) {
                        event.target.notifyAfterObservers = true;
                        event.target.currentNotifyRet = ret;
                        ret = this.fire(event);
                        delete event.target.currentCustomEventObject;                
                        delete event.target.notifyAfterObservers;  
                        delete event.target.currentNotifyRet;              
                    }
                    
                    return ret;
                }
                
                //fire after
                var self = this,
                    type = self.type,
                    bubbles = self.bubbles,
                    currentTarget = self.currentTarget,
                    customEventObject = event,
                    gRet = event.target.currentNotifyRet,
                    parents, parentsLen,
                    i, ret;
                
                //默认行为被阻止后，不触发事件
                if (customEventObject.isDefaultPrevented() || customEventObject.isImmediatePropagationStopped()) {
                    return gRet;
                }
                
                customEventObject.currentTarget = currentTarget;
                ret = self.notify(customEventObject, true);
                
                if (gRet !== false && ret != undefined) {
                    gRet = ret;
                }
                
                //冒泡
                if (bubbles && !customEventObject.isPropagationStopped()) {
    
                    parents = currentTarget.getTargets();
    
                    parentsLen = parents && parents.length || 0;
    
                    for (i = 0; i < parentsLen && !customEventObject.isPropagationStopped(); i++) {
    
                        ret = parents[i].fire(type, customEventObject);
    
                        // false 或者不返回任何东西
                        if (gRet !== false && ret !== undefined) {
                            gRet = ret;
                        }
    
                    }
                }
                
                return gRet;
            },
            
            /**
             * 通知回调触发
             * @method notify
             * @param {EventFacade} event 事件对象
             * @param {Object} after 是否是after类回调
             */
            notify: function(event, after) {
                if (after) {
                    return this.fakeObservers.call(this, this._notify, [event]);
                } else {
                    event.target.currentCustomEventObject = event;
                    return this._notify.call(this, event);
                }
            },
            
            /**
             * 解除绑定
             * @method detach
             */
            detach: function() {
                var ret = this.detachOn.apply(this, arguments),
                    afterRet = this.detachAfter(this, arguments);
                
                return afterRet || ret;
            },
            
            /**
             * 解除after所有回调
             * @method resetAfter
             */
            resetAfter: function() {
                this.afterObservers = [];
            },
            
            /**
             * 解除after绑定
             * @method resetAfter
             */
            detachAfter: function() {
                var reset = this.reset,
                    ret;
                
                this.reset = this.resetAfter;
                this.fakeObservers.call(this, this.detachOn, S.makeArray(arguments));
                this.reset = reset;
                
                return ret;
            },
            
            /**
             * 覆盖checkMemory，不需要删除
             * 1.3版本的bug，detach完把customEvent删去，导致defaultFn也无法执行，1.4已修复
             * @method checkMemory
             */
            checkMemory: function() {
                
            }
            
        };
    
    /**
     * 自定义事件after功能扩充类
        
        var Widget = Base.extend([EventCustomAfter], {});
        var widget = new Widget();
        
        widget.publish('show', {
           defaultFn: function() {
               console.log('default show');
           } 
        });
        
        widget.on('show', function() {
            console.log('before show');
        });
        
        widget.after('show', function() {
            console.log('after show');
        });
        
        widget.fire('show');
        
        //before show
        //default show
        //after show
        
        widget.detach('show');
        
        widget.fire('show');
        
        //default show
        
     * @constructor EventCustomAfter
     * @class
     */
    function EventCustomAfter() {}
    
    //原型
    S.augment(EventCustomAfter, {
        
        /**
         * 扩充自定义事件事件方法
         * @method injectCustomEvent
         * @param {CustomEvent} ce 自定义事件实例
         */
        injectCustomEvent: function(ce) {
            ce.afterObservers = [];
            ce._fire = ce.fire;
            ce._notify = ce.notify;
            ce.detachOn = ce.detach;
            S.mix(ce, CEInjectMethods, true);
        },
        
        /**
         * 绑定after事件
         * @method after
         * @param {Object} type 事件类型
         * @param {Object} fn 事件回调
         * @param {Object} context 事件上下文
         */
        after: function(type, fn, context) {
            var self = this;
            
            Utils.batchForType(function (type, fn, context) {
                var cfg = Utils.normalizeParam(type, fn, context),
                    customEvent;
                
                type = cfg.type;
                customEvent = getCustomEvent(self, type, true);
                
                if (!customEvent.afterObservers) {
                    self.injectCustomEvent(customEvent);
                }
                
                if (customEvent) {
                    customEvent.after(cfg);
                }
            }, 0, type, fn, context);
            
            return this;
        },
        
        /**
         * 解除事件绑定
         * @method detach
         * @param {Object} type 事件类型
         * @param {Object} fn 事件回调
         * @param {Object} context 事件上下文
         */
        detach: function(type, fn, context) {
            var self = this,
                args = S.makeArray(arguments),
                when = args[args.length - 1];
            
            if (when === 'on' || when === 'after') {
                args.pop();
            } else {
                when = false;
            }
            
            Utils.batchForType.apply(Utils, [function (type, fn, context) {
                var cfg = Utils.normalizeParam(type, fn, context),
                    customEvents,
                    customEvent;
                
                type = cfg.type;
                
                if (type) {
                    customEvent = getCustomEvent(self, type, true);
                    if (customEvent) {
                        if (when === 'on' && customEvent.detachOn) {
                            customEvent.detachOn(cfg);
                        } else if (when === 'after' && customEvent.detachAfter) {
                            customEvent.detachAfter(cfg);
                        } else {
                            customEvent.detach(cfg);
                        }
                    }
                } else {
                    customEvents = self.getCustomEvents();
                    S.each(customEvents, function (customEvent) {
                        if (when === 'on' && customEvent.detachOn) {
                            customEvent.detachOn(cfg);
                        } else if (when === 'after' && customEvent.detachAfter) {
                            customEvent.detachAfter(cfg);
                        } else {
                            customEvent.detach(cfg);
                        }
                    });
                }
            }, 0].concat(args));

            return self; // chain
        },
        
        /**
         * 解除on事件绑定
         * @method detachOn
         * @param {Object} type 事件类型
         * @param {Object} fn 事件回调
         * @param {Object} context 事件上下文
         */
        detachOn: function() {
            var args = S.makeArray(arguments);
            
            args.push('on');
            return this.detach.apply(this, args);
        },
        
        /**
         * 解除after事件绑定
         * @method detachAfter
         * @param {Object} type 事件类型
         * @param {Object} fn 事件回调
         * @param {Object} context 事件上下文
         */
        detachAfter: function() {
            var args = S.makeArray(arguments);
            
            args.push('after');
            return this.detach.apply(this, args);
        }
        
    });
    
    return EventCustomAfter;
    
});



