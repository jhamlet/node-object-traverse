/*globals describe, it, before, after, beforeEach, afterEach */

var should = require('should'),
    Jaunt = require('jaunt');

describe('Jaunt', function () {
    
    describe('#walk()', function () {
        it('should throw an error if not given a subject', function () {
            var jaunt = new Jaunt();
            (function () {
                jaunt.walk();
            }).should.throw();
        });
        
        it('should traverse in the correct order', function () {
            var traversal = [],
                opts = {
                    enter: function (pathCursor, jaunt) {
                        traversal.push(
                            'enter: ' +
                            pathCursor.
                                list.
                                slice().
                                map(function (n) {
                                    return n.name;
                                }).join(' -> ')
                        );
                    },
                    leave: function (pathCursor, jaunt) {
                        traversal.push(
                            'leave: ' +
                            pathCursor.
                                list.
                                slice().
                                map(function (n) {
                                    return n.name;
                                }).join(' -> ')
                        );
                    }
                },
                jaunt = new Jaunt(opts);
                
            jaunt.walk({
                name: 'foo',
                body: [
                    {
                        name: 'bar',
                        body: [
                            {
                                name: 'a'
                            },
                            {
                                name: 'b'
                            },
                            {
                                name: 'c'
                            }
                        ]
                    },
                    {
                        name: 'baz',
                        body: [
                            {
                                name: 'a'
                            },
                            {
                                name: 'b'
                            },
                            {
                                name: 'c'
                            }
                        ]
                    }
                ]
            });

            traversal[0].should.equal('enter: foo');
            traversal[1].should.equal('enter: foo -> bar');
            traversal[2].should.equal('enter: foo -> bar -> a');
            traversal[3].should.equal('leave: foo -> bar -> a');
            traversal[4].should.equal('enter: foo -> bar -> b');
            traversal[5].should.equal('leave: foo -> bar -> b');
            traversal[6].should.equal('enter: foo -> bar -> c');
            traversal[7].should.equal('leave: foo -> bar -> c');
            traversal[8].should.equal('leave: foo -> bar');
            traversal[9].should.equal('enter: foo -> baz');
            traversal[10].should.equal('enter: foo -> baz -> a');
            traversal[11].should.equal('leave: foo -> baz -> a');
            traversal[12].should.equal('enter: foo -> baz -> b');
            traversal[13].should.equal('leave: foo -> baz -> b');
            traversal[14].should.equal('enter: foo -> baz -> c');
            traversal[15].should.equal('leave: foo -> baz -> c');
            traversal[16].should.equal('leave: foo -> baz');
            traversal[17].should.equal('leave: foo');
            traversal.length.should.equal(18);
        });
        
    });
    
    describe('#getChildKeys()', function () {

        it('should only return child keys if given an array of child keys', function () {
            var jaunt = new Jaunt({ childKeys: ['foo', 'bar'] }),
                keys = jaunt.getChildKeys({ foo: 'foo', bar: 'bar', baz: 'baz' });

            keys.should.include('foo');
            keys.should.include('bar');
            keys.should.not.include('baz');
        });

        it('should only return keys defined by typeKey', function () {
            var jaunt = new Jaunt({
                    typeKey: 'type',
                    childKeys: {
                        foo: ['bar', 'baz']
                    }
                }),
                node = {
                    type: 'foo',
                    bar: ['a', 'b'],
                    baz: ['c', 'd'],
                    fuz: 'fuz'
                },
                keys = jaunt.getChildKeys(node);

            keys.should.include('bar');
            keys.should.include('baz');
            keys.should.not.include('fuz');
        });

        it('should return all an objects keys if childKeys are not defined', function () {
            var jaunt = new Jaunt(),
                node = { foo: 'foo', bar: 'bar' },
                keys = jaunt.getChildKeys(node);

            keys.should.include('foo');
            keys.should.include('bar');
        });

    });

    describe('#getAllChildren()', function () {

        it('should, if given an array for childKeys, only return those nodes', function () {
            var jaunt = new Jaunt({ childKeys: ['foo', 'bar'] }),
                node = {
                    foo: [
                        { name: 'a' },
                        { name: 'b' }
                    ],
                    bar: [
                        { name: 'c' },
                        { name: 'd' }
                    ],
                    fuz: 'fuz'
                },
                children = jaunt.getAllChildren(node);

            children[0].should.equal(node.foo[0]);
            children[1].should.equal(node.foo[1]);
            children[2].should.equal(node.bar[0]);
            children[3].should.equal(node.bar[1]);
            children.should.not.include('fuz');
        });

        it('should, if given a typeKey and childKeys map, only return those nodes', function () {
            var jaunt = new Jaunt({
                    typeKey: 'type',
                    childKeys: {
                        foo: ['bar', 'baz']
                    }
                }),
                node = {
                    type: 'foo',
                    bar: [
                        { name: 'a' },
                        { name: 'b' }
                    ],
                    baz: [
                        { name: 'c' },
                        { name: 'd' }
                    ],
                    fuz: 'fuz'
                },
                children = jaunt.getAllChildren(node);

            children[0].should.equal(node.bar[0]);
            children[1].should.equal(node.bar[1]);
            children[2].should.equal(node.baz[0]);
            children[3].should.equal(node.baz[1]);
            children.should.not.include('fuz');
        });

    });

    describe('#getChildren()', function () {

        it('should return a child node when given a key', function () {
            var jaunt = new Jaunt({ childKeys: ['foo'] }),
                node = {
                    foo: [{ name: 'a' }],
                    bar: [{ name: 'b' }]
                },
                children = jaunt.getChildren(node, 'foo');

            children[0].name.should.equal('a');
            children.length.should.equal(1);
        });

        it('should not return anything if given a key that is not in childKeys', function () {
            var jaunt = new Jaunt({ childKeys: ['foo'] }),
                node = { foo: ['a'], bar: ['b'] },
                children = jaunt.getChildren(node, 'bar');

            children.length.should.equal(0);
        });

    });
    
});
