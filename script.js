
function gid(x) {return document.getElementById(x)}
function ce(x) {return document.createElement(x)}
const params = new URLSearchParams(window.location.search);
const pageParam = params.get('p');
if (pageParam && pageParam.length>0) {
  createPage(pageParam)
} else {
  createPage("index")
}

async function fileExists(url) {
  try {
    const response = await fetch(url,{method:'HEAD'});
    return response.ok;
  } catch (err) {
    console.error('An error occurred:', err);
    return false;
  }
}

function randomPage() {
  let selected = Object.keys(pages)[Math.floor(Math.random()*Object.keys(pages).length)]
  return `./?p=${selected}`
}

gid("home_page").addEventListener("click",()=>{ window.location.href = "./"; })
gid("random_page").addEventListener("click",()=>{ window.location.href = randomPage(); })
gid("all_pages").addEventListener("click",()=>{ window.location.href = "?p=all"; })

function format(input) {
  return input.replace(/\[\[([^\[\]|]+)(?:\|([^\[\]]+))?\]\]/g, (m, url, label) => {
    const id = url.trim();
    const text = label?.trim() || id.trim();
    return `<a href="?p=${id}">${text}</a>`;
  }).replace(/\[person\[([^\]]+)\]person\]/g, (m, text) => {
    const parts = text.split("|");
    const name = parts[0]?.trim() || "";
    const img = parts[1]?.trim() || "";
    const details = parts.slice(2).map(item => {
      const separator = item.indexOf(":");
      if (separator === -1) {return "";}
      const name = item.slice(0, separator).trim();
      const value = item.slice(separator + 1).trim();
      return `
        <div class="person_detail">
          <strong>${name}</strong>
          <span>${value}</span>
        </div>
      `;
    }).join("");
    return `
      <div class="person_box">
        <span class="person_name">${name}</span>
        ${img?`<img class="person_image" src="${img}" alt="${name}">`:""}
        <div class="person_info">${details}</div>
      </div>
    `;
  }).replace(/\[img\[([^\]]+)\]img\]/g, (m, text) => {
    const parts = text.split("|");
    const img = parts[0]?.trim() || "";
    const caption = parts[1]?.trim() || "";
    return `
      <div class="image_box">
        <img src="${img}">
        <span class="image_caption">${caption}</span>
      </div>
    `;
  })
}

async function createPage(id,redirect = "") {
  if( id == "all") {
    let content = ce("div")
    content.classList.add("content")
    content.innerHTML += `<h1>All pages (A-Z)</h1><p>${Object.keys(pages).filter(key => !("redirect" in pages[key])).sort((a,b) => {return pages[a].title.localeCompare(pages[b].title)}).map(x => `<a href="?p=${x}">${pages[x].title}</a>`).join(" | ")}</p>`;
    gid("main").appendChild(content);
  } else if (pages[id]) {
    if (pages[id].redirect) {
      history.replaceState('', '', "./?p="+pages[id].redirect); 
      createPage(pages[id].redirect,id)
    } else {
      if (await fileExists(`./pages/${id}.txt`)) {
        let content = ce("div")
        content.classList.add("content")
        fetch(`./pages/${id}.txt`)
          .then(data => {return data.text()})
          .then(data => {content.innerHTML += `<h1>${pages[id].title}</h1>${(redirect == ""?"":`<span class="redirect_notice">redirected from ${pages[redirect].title}</span>`)}`+format(data)
        });
        gid("main").appendChild(content);
      }
    }
  } else if (pages[id.toLowerCase()]) {
    history.replaceState('', 'Title of the page', "./?p="+id.toLowerCase()); 
    createPage(id.toLowerCase())
  } else {
    let content = ce("div")
    content.classList.add("content")
    content.innerHTML += `<p>No page exists with the identifier "${id}". Maybe check your spelling?</p>`;
    gid("main").appendChild(content);
  }
}

// Theme and preference selection

let theme = 0;
if (localStorage.getItem("theme") !== null) {
  let savedTheme = localStorage.getItem("theme");
  if (typeof savedTheme !== "undefined") {theme = parseInt(savedTheme)};
}

const themeSelect = gid("theme_select");
themeSelect.onchange = themeChange;

setTheme(theme);

function saveTheme() {
  localStorage.setItem("theme", theme.toString());
}

function cssChange(variable, value) {document.documentElement.style.setProperty(("--").concat(variable), value);}

function themeChange() {
  theme = themeSelect.selectedIndex;
  saveTheme();
  setTheme(theme);
};

function setTheme(theme) {
  themeSelect.selectedIndex = theme
  let themes = [
    {"accent-color": "#142c94","bg-color": "#d0d4d8","bg-color2": "#302d3a","text-color": "#000000"},
    {"accent-color": "#901494","bg-color": "#d8d0d7","bg-color2": "#382d3a","text-color": "#000000"},
    {"accent-color": "#943814","bg-color": "#d8d3d0","bg-color2": "#4d3a2b","text-color": "#000000"},
  ]
  for (key in themes[theme]) {cssChange(key,themes[theme][key])}
};