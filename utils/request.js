const baseUrl = "http://81.71.89.149:9000/yuyi";    //请求地址

export const request = (params) => {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('token') || "";
    wx.request({
      header: { 'content-type': 'application/json', 'token': token },
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      ...params,
      url: baseUrl + params.url,
      success: (result) => {
        resolve(result);
      },
      fail: (error) => {
        reject(error);
      }
    });
  })
}

/*
    调用示例:
    const res =  await request({
    url: "/users/wxlogin",
    data: {
      encryptedData,
      rawData,
      iv,
      signature,
      code
    },
    method: "POST"
  })
  //method默认为GET
  const res =  await request({
    url: "/users/wxlogin",
    data: {
      encryptedData,
      rawData,
      iv,
      signature,
      code
    },
    method: "GET"
  })
*/