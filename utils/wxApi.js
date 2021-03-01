const baseUrl = 'http://81.71.89.149:9000/yuyi/'
/**
 * 获取code,换屈openId
 */
const wxLogin = () => {
    return new Promise((resolve, reject) => {
        wx.login({
            timeout: 10000,
            success: (result) => {
                resolve(result);
            },
            fail: (error) => {
                reject(error);
            }
        });
    })
}

/**
*   判断用户是否登录
*   true: 登录
*   false: 未登录
*/
const isLogin = () => {
    let token = wx.getStorageSync("token") || "";
    if (token)
        return true;
    return false;
}

/**
 *  上传文件
 *  options:{
 *      
 *  }
 */
const wxUploadFile = (options) => {
    return new Promise((resolve, reject) => {
        const token = wx.getStorageSync("token");
        wx.uploadFile({
            url: baseUrl + '/upload',
            filePath: options.filePath,
            name: 'file',
            header: {
                'content-type': 'multipart/form-data',
                'token': token
            },
            formData: null,
            success: (result) => {
                resolve(result)
            },
            fail: (error) => {
                rejects(error)
            }
        });
    })

}

module.exports = {
    wxLogin,
    isLogin,
    wxUploadFile,
}