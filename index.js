import request from '/src/axios-request'

for(let i=0;i<10;i++) {
  // const mockBaseURL = 'japi.jd.com/mock/902/testrequest'
  // const mockBaseURL = 'japi.jd.com/mock/902/testrequest?type=error'
  // const mockBaseURL = 'japi.jd.com/mock/902/testrequest?type=error'
  const list = [
    // http://japi.jd.com/mock/902/testrequest?type=success
    // {"code":200,"data":"success"}
    'success', 
    // http://japi.jd.com/mock/902/testrequest?type=error 
    // {"code":400,"message":"错误了"}
    'error' 
  ]
  request(
    {
      url:'japi.jd.com/mock/902', 
      functionId:'testrequest', 
      params: {
        param: {
          type: list[Math.round(Math.random())],
        }
      }
    },
    {mock: true, isErrorTip: true}
  )
  .then(data=>{
    console.log(`data-${i}:`, data);
  })
  .catch(error=>{
    console.log(`error-${i}:`, error);
  })
}
