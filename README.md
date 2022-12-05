# Kong Homework

Implement Kong API interface schemas form generator.

## Problems

Routes-Schemas-'Hosts' field offers some match_all and match_any patterns. But these patterns are not working normally. If the test value includes wildcard no matter how much, the patterns would test false. There are my test instances below:

```js
let a = new RegExp('^[^*]*%*?[^*]*$')
let b = new RegExp('^%*%.')
let c = new RegExp("%.%*$")
let d = new RegExp("^[^*]*$")

a.test('127.0.0.1')
// true
a.test('127.0.0.*')
// false
a.test('127.0.*.*')
// false
a.test('127.0.*.**')
// false
a.test('*.com')
// false
b.test('*.com')
// false
c.test('*.com')
// false
d.test('*.com')
// false
```
