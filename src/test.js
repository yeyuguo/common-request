
import PluginRegister from "./plugin-register"

function Test() {
  // 测试
  function test1(context, next) {
    console.log('test1 前')
    next()
    console.log('test1 后')
  }

  // 测试 拦截后面所有中间件
  function error(context, next) {
    console.log('error 前')
  }

  // 测试 数据变更前后
  function error2(context, next) {
    console.log('context: ', context);
    context.add = 'yes'
    next()
  }

  // 测试异步
  async function error3(context, next) {
    await new Promise(resolve=>{
      setTimeout(()=>{
        console.log('error 前', '延迟加载')
        resolve('tttt')
      }, 3000)
    })
    next()
  }

  // 测试多次 next
  function error4(context, next) {
    console.log('error 前')
    next()
    // next()
  }

  function test3(context, next) {
    console.log('test3 context: ', context);
    console.log('test3 前')
    context.add = 'yes'
    next()
    context.after = 'yes'
    // return Promise.reject('console reject error')
    console.log('test3 后') // return promise 存在就不打印
  }

  function test4(context, next) {
    console.log('test4 前')
    next()
    console.log('test4 后')
  }

  // 完整执行
  // use(test1)
  // // use(error) // 被拦截掉
  // use(test3)
  // use(test4)


  // 中间过程被拦截
  const next = function(context, next){
    console.log('context, next: ', context, next);
    console.log('test 输入的 next')
  }
  // composeOnion([test1, error4, test3, test4])({a:1}, next)


  const instance = new PluginRegister({a: 1}, next)
  instance.use([test1, error4, test3, test4])
  instance.run()


}

Test()
