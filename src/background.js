const { linkAccount, getTemplateData, getTemplateNames } = require("./api")

// Creates random token for user id
function getRandomToken() {
    // E.g. 8 * 32 = 256 bits token
    var randomPool = new Uint8Array(32);
    crypto.getRandomValues(randomPool);
    var hex = '';
    for (var i = 0; i < randomPool.length; ++i) {
        hex += randomPool[i].toString(16);
    }
    // E.g. db18458e2782b2b77e36769c569e263a53885a9944dd0a861e5064eac16f1a
    return hex;
}

const clickSelection = function (info, selectedTab) {

  chrome.tabs.query({active: true, currentWindow: true}, function() {
    chrome.tabs.sendMessage(selectedTab.id, { data: "active"}, function(response) {
      console.log(response.active);
    });
  });

}

if(chrome.storage.sync.get(userId) !== null) {

  getTemplateNames(chrome.storage.sync.get(userId)).then( res => {
    const templates = res.body();

    templates.map( t => {

        if(t.key ==="#") {

          // First level , add directly to parents 
          const parentMenu = chrome.contextMenus.create({
            title: "injext",
            id: "parent",
            contexts: ["editable"]
          })

        } else {

          // Second Level directories, add directories to parent then children to these directories
          chrome.contextMenus.create({
            title: t.key,
            id: t.key,
            parentId: "parent",
            contexts: ["editable"]
          })

          t.value.map( c => {

            chrome.contextMenus.create({
              title: "child" + c,
              id: c.split(".")[0],
              parentId: t.key,
              contexts: ["editable"]
            })

          })

        }

    })

  })
  
}
chrome.contextMenus.onClicked.addListener(clickSelection);

// Setup UUID for user
chrome.runtime.onInstalled.addListener(async function(){

    function uuidv4() {
      return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
      );
    }
    
    let userId = await uuidv4()

    chrome.storage.sync.set({
      userId
    }, function(){
      console.log("UUID set");
    })

});