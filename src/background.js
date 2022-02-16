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

const api = "https://api.injext.tech/api"

local_cache = {}

// First level , add directly to parents 
const parentMenu = chrome.contextMenus.create({
  title: "injext",
  id: "injext",
  contexts: ["editable"]
})

chrome.storage.sync.get(['userId']).then(res => {

  local_cache.userId = res.userId;

  const templates = getTemplateNames(res.userId);

  templates.then( body => {

    body.data.map( t => {

      if(t.key ==="#") {
        
        // First level , add directly to parents 
        t.value.map( c => {
          
          chrome.contextMenus.create({
            title: c.split(".")[0],
            id: c,
            parentId: "injext",
            contexts: ["editable"]
          })
          
        })
        
      } else {
        
        // Second Level directories, add directories to parent then children to these directories
        chrome.contextMenus.create({
          title: t.key,
          id: t.key,
          parentId: "injext",
          contexts: ["editable"]
        })
        
        t.value.map( c => {
          
          chrome.contextMenus.create({
            title: c.split(".")[0],
            id: c,
            parentId: t.key,
            contexts: ["editable"]
          })
          
        })
      }

    })

  })

})

const getTemplateNames = async ( userId ) => {

  const response  = await fetch(`${api}/templates/${userId}`, {
      method: "GET",
      mode: "no-cors",
      headers: {
          'Content-Type': "application/json"
      }
  })

  return response.json();

}

const getTemplateData = async ( userId, templateName ) => {
  
  templateName = JSON.stringify(templateName)

  const response  = await fetch(`${api}/servetemplate/${userId}/${templateName}`, {
      method: "GET",
      mode: "no-cors",
      headers: {
          'Content-Type': "application/json"
      }
  })
  
  return response.json();

} 

const clickSelection = function (info, selectedTab) {

  chrome.tabs.query({active: true, currentWindow: true}, function() {

      getTemplateData( local_cache.userId , [info.parentMenuItemId, info.menuItemId]).then( res => {
          const body = res.template;
          chrome.tabs.sendMessage(selectedTab.id, { data: body }, function(response) {
              console.log("success")
          });
      })

  });

}

chrome.contextMenus.onClicked.addListener(clickSelection);

// Setup UUID for user
chrome.runtime.onInstalled.addListener(async function(){

    function uuidv4() {
      return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
      );
    }
    
    let newUserId = await uuidv4()

    // Check if userId in DB
    chrome.storage.sync.get(['userId']).then( res => {
        if (res === null || res.userId === null){
          // Generate Id
          chrome.storage.sync.set({
            "userId": newUserId
          }, function(){
            console.log("new User Id: " + newUserId);
          })
        }
    }).catch( err => {
      console.log(err)
    })

});