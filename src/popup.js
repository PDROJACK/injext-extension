let button = document.getElementById("git");
let home = document.getElementById("home");
let inputArea = document.getElementById("git-input");
let inputButton = document.getElementById("input-button");
let changeRepo = document.getElementById("change-repo");

const API = "https://api.github.com";

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

const clickkk = function sendRepo() {

  let repo = document.getElementById("text-input").value;

  if (repo.split(".").pop() === "git") {

    const data = repo.split("/")
    const user = data.at(-2)
    const repoName = data.at(-1).split(".").at(0)

    fetch(API+`/repos/${user}/${repoName}`, {
          method: "GET",
          mode: "cors",
          headers: {
            "Content-Type": "application/json"
          }}
        ).then(async (response) => {
          const res = await response.json();
          if(!res.private){
            chrome.storage.sync.set({ repo }, ()=>{
              console.log("linkeds")
              inputArea.style.display = "none";
              changeRepo.style.display = "inline";
            })
          }
      }).catch(err => console.log(err));
    } else {
      alert("Invalid URL please enter again");
    }

}

inputButton.addEventListener("click", clickkk);
