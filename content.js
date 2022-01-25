const input = document.activeElement

// Status: 1=success, 0=error
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if (request.data !== null){
            document.activeElement.value= request.data
            sendResponse({status: "1"});
        }
    }
);