// Status: 1=success, 0=error
// content_script.js
if (!chrome.runtime.onMessage.hasListeners()) {

  chrome.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
      console.log(request)
      document.activeElement.value = request.res;
      sendResponse(true);
    },
  );

}
