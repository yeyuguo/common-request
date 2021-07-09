
/* eslint-disable */

// 解决 node 不能接收 try catch 的 promise
// if(process && process.on) {
//   process.on('unhandledRejection', (reason, p) => {
//     console.warn('Unhandled Rejection at: Promise', p, 'reason:', reason);
//     // application specific logging, throwing an error, or other logic here
//   });
// }

/**
 * 插件机制
 * 优先使用传递参数
 * @param {Object} context 对象输入
 * @param {Function} lastNext 洋葱机制的最后一次之后的 默认处理函数
 * */
export default class PluginRegister{
  constructor(context, lastNext) {
    this.middleware = []
    this.context = context
    this.next = lastNext
  }
  /** 建造者模式
   * !不能传入参数, 使用 use 来做解耦扩展
  */
  run() {
    PluginRegister.engine(this.middleware)(this.context, this.next)
  }
  /**
   * 注册插件  建造者模式
   * todo 单插件的注册, 使用依赖注入 思想提供 option, 参考 shout.js 机制
   * @param {Array|Function} plugin
   */
  use(plugin) {
    this.middleware = this.middleware.concat(plugin)
    return this
  }

  /**
   * 洋葱机制源码 
   * !设置为 static 静态方法方便外部直接使用洋葱算法
   * todo 未来丰富 熔断、跳过、全部链路必须通过实现机制
   * todo compose
   * @param {Array} plugins 插件机制
   * @return {Function} 
   */
  static engine(plugins) {
    return composeOnion(plugins) 
  }
}

/**
 * 洋葱机制实现
 */
function composeOnion(plugins) {
  if(!Array.isArray(plugins)){
    throw new TypeError('中间件需要是数组')
  }
  for(const _plugin of plugins){
    if(typeof _plugin !== 'function') {
      throw new TypeError('插件必须是函数')
    }
  }
  let _index = -1 // 只要小于0就行
  /**
   * @param {Object} context 传递的上下文对象
   * @param {Function} next 迭代向里执行的最后一次
   */
  return function(context, next) {
    dispatch(0)
    function dispatch(current) {
      // !当前索引必须大于上一次索引
      if(current <= _index) {
        return Promise.reject(new TypeError('next() 被调用多次'))
      }
      _index = current
      const plgFn = plugins[current]
      let fn
      if(_index === plugins.length) {
        // 多了一次 i+1 空执行, 跳出递归
        fn = next
      } else {
        fn = plgFn
      }
      if(!fn) {
        return Promise.resolve()
      }
      try {
        return Promise.resolve(
          fn(context, function next() {
            return dispatch(current + 1)
          })
        )
      } catch (error) {
        console.log('error: ', error);
        return Promise.reject(error)
      }
    }
  }
}












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

// Test()


/* eslint-enable */