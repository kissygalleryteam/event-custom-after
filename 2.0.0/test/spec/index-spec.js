KISSY.add(function (S, Node,Demo) {
    var $ = Node.all;
    describe('event-custom-after', function () {
        it('Instantiation of components',function(){
            var demo = new Demo();
            expect(S.isObject(demo)).toBe(true);
        })
    });

},{requires:['node','kg/event-custom-after/2.0.0/']});