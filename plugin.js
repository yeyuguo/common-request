
// plugin.js

// default Hanlder
// todo 无效: 无法替换 response
export function defaultHandle(response) {
	if(response instanceof Promise) return response
	// todo 丰富返回值， 只返回接口值
  response = response.data
}


export function commonError(response, next) {
  const { code } = response.data
  if (code === 200) {
    next()
  } else {
    return Promise.reject(response.data);
  }
}


export function loginHandle(response, next) {
  // 未登录
  const { data } = response || {}
  // -2 是历史逻辑,  403/413 是最新逻辑
  const codeLogin = [-2, 403, 413]
  if(codeLogin.includes(data.code)) {
    const { protocol } = location
    let { href } = location
    // 追加参数 isLogin=1
    const isLogin = 'isLogin=1'
    if(href.indexOf('?')>-1) {
      href += `&${isLogin}`
    }else{
      href += `?${isLogin}`
    }
    const LOGIN_URL = `www.baidu.com`;
    window.location.href = LOGIN_URL
  } else {
    next()
  }
}




// mock 请求模拟
export function mockRequestColor({mockBaseURL, method, functionId, params}) {
	/** functionId 转换 url 的path
	 * {functionId, params:{funName}} 转换成mock的url  /functionId/functionName
	 */
	const transFunctionID2Url = function({functionId, params}) {
		let url = '/'
		if (functionId) {
			url += functionId
		}
		if (params && params.funName) {
			url += ('/' + params.funName)
		}
		return url
	}

  return {
		baseURL: mockBaseURL,
		method,
		url: transFunctionID2Url({functionId, params}),
		params: params && params.param
	}
}

// 公共请求的限制
export function limitNumber() {
  // todo
}



export function toQuery(obj) {
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


// todo 走接口防抖限制
export function debounce(func, wait, immediate) {
  let timeout, args, context, timestamp, result;
  const later = function() {
    const last = new Date().getTime() - timestamp;
    if (last < wait && last >= 0) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;
      if (!immediate) {
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      }
    }
  };

  return function(...args) {
    context = this;
    timestamp =new Date().getTime();
    const callNow = immediate && !timeout;
    if (!timeout) timeout = setTimeout(later, wait);
    if (callNow) {
      result = func.apply(context, ...args);
      context = args = null;
    }

    return result;
  };
}




