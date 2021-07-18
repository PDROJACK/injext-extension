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

// Check if user id in chrome storage or not
// chrome.storage.sync.get('userid', function(items) {
//     var userid = items.userid;
    
// });
