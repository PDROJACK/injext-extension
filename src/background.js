let local_cache = {
  menu: []
};

const api = "https://api.github.com";

const getTemplateNames = async (username, repo) => {
  var event = new Event("menu");

  const response = await fetch(
    api + `/repos/${username}/${repo}/contents`,
    {
      method: "GET",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const data = await response.json();

  data.forEach(async (i) => {
    if (i.type === "file") {
      local_cache.menu.push({ key: "#", value: [i.name] });
      
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
    
  });

  dispatchEvent(event);

};

const getTemplateData = async (username, repo, path) => {
  

  path = path[0] === "injext" ? path[1] : path[0] + "/" + path[1];

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

  return atob(d.content.replace("\n", ""));

};

function setupIfRepoLinked () {
  chrome.storage.sync.get(["repo"]).then(async (res) => {
    local_cache.username = res.repo.split("/").at(-2);
    local_cache.repoName = res.repo.split("/").at(-1).split(".").at(0);

    // First level , add directly to parents
    const parentMenu = chrome.contextMenus.create({
      title: "injext",
      id: "injext",
      contexts: ["editable"],
    });

    await getTemplateNames(
      local_cache.username,
      local_cache.repoName
    );

  });
}

function setupContextMenu() {
  
  chrome.contextMenus.remove("injext");

  local_cache.menu = [];

  // First level , add directly to parents
  const parentMenu = chrome.contextMenus.create({
    title: "injext",
    id: "injext",
    contexts: ["editable"],
  });

  setupIfRepoLinked();

}

chrome.runtime.onMessage.addListener(function (req, sender, sendRes) {
  
  if (req.action === "link") {
      setupContextMenu();
  }

});

addEventListener("menu", function prepare() {
  
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

});

chrome.contextMenus.onClicked.addListener( (info, selectedTab) => {

  chrome.tabs.query({ active: true, currentWindow: true }, async function () {
    
    const res = await getTemplateData(
      local_cache.username,
      local_cache.repoName,
      [info.parentMenuItemId, info.menuItemId]
    );

    chrome.tabs.sendMessage(selectedTab.id, { res }, function (response) {
      console.log("success");
    });

  });

});

setupIfRepoLinked();