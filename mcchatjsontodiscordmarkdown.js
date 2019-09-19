module.exports = function (chatobj) {
    //minecraft chat json spec: https://wiki.vg/Chat

    let markeddown = "";

    //first step is to get to a semistanderd array of objects eg {"text":"example","strikethrough":false,"underlined":false,"bold":false,"italics":false,"obfuscated":false}
    if (chatobj.extra) {

    } else if (chatobj.text.includes("§")) {
        //rid the color codes (discord markdown doesnt support color (outside of code blocks which then wouldnt look good))
        chatobj.text.replace(/(§[a-f\d])/g,"");
        
    } else {return chatobj.text}



    




    return markeddown;
}