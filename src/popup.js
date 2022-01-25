let button = document.getElementById("git");
let home = document.getElementById("home");
let inputArea = document.getElementById("git-input");
let inputButton = document.getElementById("input-button");
let changeRepo = document.getElementById("change-repo");

// https://github.com/PDROJACK/rpc_fileserver.git

chrome.storage.sync.get("repo", function ({ repo }) {
  // Display the git input or change input repo here
  if (!repo) {
    // If repo not setup then render input
    inputArea.style.display = "inline";
  } else {
    // Render button to change repo here
    changeRepo.style.display = "inline";
    inputArea.style.display = "none";
  }
});

changeRepo.addEventListener("click", function showChangeRepo() {
  inputArea.style.display = "inline";
  changeRepo.style.display = "none";
});

inputButton.addEventListener("click", function sendRepo() {
  let val = document.getElementById("text-input").value;

  if (val.split(".").pop() === "git") {
    // Send Request and set response here
    chrome.storage.sync.get("userId", ({ userId }) => {
      fetch("http://localhost:5000/link", {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          repo: val,
        }),
      }).then((response) => {
        chrome.storage.sync.set({ repo: val }, ()=>{
            inputArea.style.display = "none";
            changeRepo.style.display = "inline";
        });
      });
    });
  } else {
    // Invalid url please enter again
    alert("Invalid URL please enter again");
  }
});
