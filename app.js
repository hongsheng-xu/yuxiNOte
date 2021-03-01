//app.js
const Towxml = require('/towxml/main');
App({
    globalData: {
        noteId: "",
        content: "",
        title: "",
        setdata: false,
        FROM:"",
    },
    towxml:new Towxml(),
    onLaunch(){
        console.log(this.globalData);
        this.globalData.noteId = ""
    }
})