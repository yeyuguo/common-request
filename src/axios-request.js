// index.js
import axios from 'axios'
import PluginRegister from '/src/plugin-register'
// todo 封装到一个 request 对象上
import { loginHandle, commonError, mockRequestColor } from '/src/plugin'
const baseURL = process.env.VUE_APP_API || '/'
console.log('baseURL: ', baseURL);

const headers = {
  // 'X-Origin': baseURL
}

const instance = axios.create({
  baseURL,
  headers
})


instance.interceptors.response.use(async function(response){
  const { config } = response
  // let plugins = [loginHandle]
  // if(config.selfOption && config.selfOption.isErrorTip) {
  //   plugins = [loginHandle, commonError]
  // }
  let plugins =  [loginHandle, commonError]

  // const instance = new PluginRegister(response, defaultHandle) // defaultHandle 无法处理
  const instance = new PluginRegister(response)
  instance.use(plugins)
  try {
    instance.run()
  } catch (error) {
    console.log('error: ', error);
  }
  // !需要熔断后续所有处理
  if(response.break) {
    return null
  } else {
    return response ? response.data : {}
  }
})

// 单个插件加入机制
// instance.interceptors.response.use(commonError)
// instance.interceptors.response.use(defaultHandle)



// 参数转换
function toQuery(obj) {
  return Object.keys(obj)
    .reduce(
      (pre, cur) =>
        `${pre}${cur}=${
          typeof obj[cur] === 'string' ? obj[cur] : JSON.stringify(obj[cur])
        }&`,
      ''
    )
    .replace(/&$/, '')
}

// 普通参数转成 color 参数
function colorParams({ url, method, functionId, appid, loginType, params, isEncode }) {
	const query = {
    functionId,
    appid,
    loginType,
    _: Date.now()
  }
  
	if(method === 'GET') {
    query.body = params
  }
  url = url + toQuery(query)

	// 结果值
	const result = {
    url,
		method,
    withCredentials: true
	}

	if (method === 'POST') {
    let data
    if (isEncode) {
      data = `body=${params}`
    } else {
      data = `body=${JSON.stringify(params)}`
    }
    result.data = data
  }

	return result
}


export default function({url='/api?', method="GET", functionId, params, isEncode = false, loginType='2' ,appid='u', mockBaseURL="//japi.jd.com/mock/902"}, { mock=false, isErrorTip=false}={}) {
  // 执行 mock 机制
  if(mock) {
    return instance({
      ...mockRequestColor({mockBaseURL, method, functionId,  params}),
      selfOption: {
        mock, 
        isErrorTip
      }
    })
  }

  let requestParams
  //  color 接口
  if(functionId) {
    requestParams = colorParams({url, method, functionId, appid, loginType, params, isEncode})
  }
  console.log('requestParams: ', requestParams);

  return instance({ 
    url,
    method,
    ...requestParams,
    selfOption: {
      mock, 
      isErrorTip
    }
  })
}
