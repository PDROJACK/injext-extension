let local_cache = {
  menu: []
};

const api = "https://api.github.com";

// First level , add directly to parents
const parentMenu = chrome.contextMenus.create({
  title: "injext",
  id: "injext",
  contexts: ["editable"],
});

const getTemplateNames = async (username, repo) => {

  var event = new Event('menu')

  const response = await fetch(api + `/repos/${username}/${repo}/contents`, {
    method: "GET",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  data.forEach( async (i) => {
    if (i.type === "file") {
      local_cache.menu.push({ key: "#", value: [i.name]})
      dispatchEvent(event);
    } else {
      const response2 = await fetch(
        api + `/repos/${username}/${repo}/contents/${i.name}`,
        {
          method: "GET",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data2 = await response2.json();

      const data2Arr = [];

      data2.forEach((j) => {
        if (j.type == "file") {
          data2Arr.push(j.name);
        }
      });

      local_cache.menu.push({ key: i.name, value: data2Arr });

    }
    dispatchEvent(event);
  });
};


addEventListener("menu", function prepare(){
  local_cache.menu.map((t) => {
    if (t.key === "#") {
      // First level , add directly to parents
      t.value.map((c) => {
        chrome.contextMenus.create({
          title: c.split(".")[0],
          id: c,
          parentId: "injext",
          contexts: ["editable"],
        });
      });
    } else {
      // Second Level directories, add directories to parent then children to these directories
      chrome.contextMenus.create({
        title: t.key,
        id: t.key,
        parentId: "injext",
        contexts: ["editable"],
      });

      t.value.map((c) => {
        chrome.contextMenus.create({
          title: c.split(".")[0],
          id: c,
          parentId: t.key,
          contexts: ["editable"],
        });
      });
    }
  });
})

chrome.storage.sync
  .get(["repo"])
  .then(async (res) => {
    local_cache.username = res.repo.split("/").at(-2);
    local_cache.repoName = res.repo.split("/").at(-1).split(".").at(0);

      const templates = getTemplateNames(
        local_cache.username,
        local_cache.repoName
      )

})

const getTemplateData = async (username, repo, path) => {

  if(path[0] == "injext"){
    path = path[1]
  } else {
    path = path[0] + "/" + path[1]
  }
  
  const response = await fetch(
    api + `/repos/${username}/${repo}/contents/${path}`,
    {
      method: "GET",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  const d = await response.json();

  return atob(d.content.replace("\n",""));
};

const clickSelection = function (info, selectedTab) {
  chrome.tabs.query({ active: true, currentWindow: true }, function () {
    getTemplateData(local_cache.username, local_cache.repoName, [
      info.parentMenuItemId,
      info.menuItemId,
    ]).then((res) => {
      const body = res.template;
      chrome.tabs.sendMessage(
        selectedTab.id,
        { data: body },
        function (response) {
          console.log("success");
        }
      );
    });
  });
};

chrome.contextMenus.onClicked.addListener(clickSelection);

// Setup UUID for user
chrome.runtime.onInstalled.addListener(async function () {
  function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
      (
        c ^
        (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
      ).toString(16)
    );
  }

  let newUserId = await uuidv4();

  // Check if userId in DB
  chrome.storage.sync
    .get(["userId"])
    .then((res) => {
      if (res === null || res.userId === null) {
        // Generate Id
        chrome.storage.sync.set(
          {
            userId: newUserId,
          },
          function () {
            console.log("new User Id: " + newUserId);
          }
        );
      }
    })
    .catch((err) => {
      console.log(err);
    });
});