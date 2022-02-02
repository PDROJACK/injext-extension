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

local_cache = {}

chrome.storage.sync.get(['userId']).then(res => {
  local_cache.userId = res.userId;
  console.log(local_cache)
})

const api = "http://localhost:3000"

const getTemplateNames = async ( userId ) => {
  const user = "86c8e255-56fc-48f6-8440-f62496fa74a2";
  const response  = await fetch(`${api}/templates/${user}`, {
      method: "GET",
      mode: "no-cors",
      headers: {
          'Content-Type': "application/json"
      }
  })
  return response.json();
}

const getTemplateData = async ( userId, templateName ) => {
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

      getTemplateData( local_cache.userId , info.menuItemId).then( res => {
          const body = res.template;
          chrome.tabs.sendMessage(selectedTab.id, { data: body }, function(response) {
              console.log("success")
          });
      })


  });
}

// First level , add directly to parents 
const parentMenu = chrome.contextMenus.create({
  title: "injext",
  id: "parent",
  contexts: ["editable"]
})




if(local_cache !== null) {
     
    const templates = getTemplateNames(local_cache.userId);

    templates.then( body => {

      body.data.map( t => {
        if(t.key ==="#") {
          
          // First level , add directly to parents 
          t.value.map( c => {
            
            chrome.contextMenus.create({
              title: c.split(".")[0],
              id: c.split(".")[0],
              parentId: "parent",
              contexts: ["editable"]
            })
            
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
              title: c.split(".")[0],
              id: c,
              parentId: t.key,
              contexts: ["editable"]
            })
            
          })
        }
      })

    })
      
}

// getTemplateNames(chrome.storage.sync.get("userId")).then( res => {
//   const templates = res.body();
//   console.log(templates);


// })

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