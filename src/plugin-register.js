
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
 * !对外暴露的 use 注册接口, 必须明确是不满足场景下的处理: 不满足跳过、不满足熔断后续 (100%确定的)
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
   * todo 更换函数名为 useFused
   * todo 删除该函数, 对外暴露应该知道该插件的不满足功能
   * @param {Array|Function} plugin
   */
  use(plugin) {
    this.middleware = this.middleware.concat(plugin)
    return this
  }
  // 插件不满足, 就跳过, 命名来源与 rxjs 的 tap
  useTap() {
    return this
  }
  // 熔断机制, 下一个的执行依赖上一个执行
  useFused(plugin) {
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
let _temp_count = 0
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
        const nextPlugin = function () {
          return dispatch(current + 1)
        }
        const result = fn(context, nextPlugin)
        console.log('result: ', result, _temp_count++);
        // 不需要再执行后面中间件
        // TODO 返回值有心智成本
        if(result === 'intercept') {
          return Promise.reject(context)
        }
        return Promise.resolve(result)
        // return Promise.resolve(
        //   fn(context, function next() {
        //     return dispatch(current + 1)
        //   })
        // )
      } catch (error) {
        console.log('error: ', error);
        return Promise.reject(error)
      }
    }
  }
}











/* eslint-enable */