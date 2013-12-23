## EventCustomAfter

* 版本：1.0
* 教程：[http://gallery.kissyui.com/event-custom-after/1.0/guide/index.html](http://gallery.kissyui.com/event-custom-after/1.0/guide/index.html)
* demo：[http://gallery.kissyui.com/event-custom-after/1.0/demo/index.html](http://gallery.kissyui.com/event-custom-after/1.0/demo/index.html)

## 简介

> 提供自定义事件after方法，绑定执行defaultFn后的事件回调，兼容KISSY 1.3.0及以上版本

## 应用场景

假设写一个模拟下拉框组件，希望选中选项以后（after）能做一些行为，但目前自定义事件系统仅支持绑定默认行为之前的事件（before，即on）

    KISSY.use('base', function(S, Base) {
        var Select = Base.extend({
            
            initializer: function() {
                this.publish('select', {
                    defaultFn: this._defSelectFn
                });
            },
            
            select: function(item) {
                this.fire('select', {
                    item: item
                });
            },
            
            _defSelectFn: function(e) {
                e.item.addClass('selected');
            }
            
        });
        
        var select = new Select();
        
        //这个时候选项实际还未真正被选中
        select.on('select', function(e) {
            
            //Oops!!!
            //无法找到选中的选项
            this.node.one('.selected').css('color', 'white');
        });
    
    });
    
EventCustomAfter组件提供了绑定after事件的功能，作为Base的扩充类，可以扩充到组件中，上面代码稍作修改

    KISSY.use('base,gallery/event-custom-after/1.0/', function(S, Base, EventCustomAfter) {
    
        var Select = Base.extend([EventCustomAfter], {
            //...
        });
        
        var select = new Select();
        
        //这个时候选项已经被选中
        select.after('select', function(e) {
            
            //Yes!!!        
            this.node.one('.selected').css('color', 'white');
        });
    
    });

当然组件冒泡，解除绑定功能都能正常运行

    var child = new Select();
    var parent = new Select();
    
    child.addTarget(parent);
    
    child.on('select', function() {
        console.log('before child select');
    });
    parent.on('select', function() {
        console.log('before parent select');
    });
    child.after('select', function() {
        console.log('after child select');
    });
    parent.after('select', function() {
        console.log('after parent select');
    });
    
    child.select(item);
    
    //before child select
    //before parent select
    //after child select
    //after parent select
    
    child.detach('select');
    child.select(item);
    
    //before parent select
    //after parent select

## API

<div class="method-list">
    <div class="method-item">
        <h3>after <code>(type, fn, context)</code></h3>
        <p>绑定after事件（参数参考on）</p>
        <h4>参数</h4>
        <ul>
            <li>
                <code>type</code>
                <i>(String)</i>
                <p>时间类型</p>
            </li>
            <li>
                <code>fn</code>
                <i>(Function)</i>
                <p>绑定的回调</p>
            </li>
            <li>
                <code>context</code>
                <i>(Object)</i>
                <p>回调函数<code>fn</code>执行上下文</p>
            </li>
        </ul>
        <h4>返回值</h4>
        <ul>
            <li>
                <code>this</code>
                <p>可以链式调用</p>
            </li>
        </ul>
    </div>
</div>

## TODO

* 添加detachOn，detachAfter等针对defaultFn前后阶段的解除绑定方法