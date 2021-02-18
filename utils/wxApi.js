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

module.exports = {
    wxLogin,
    isLogin
}