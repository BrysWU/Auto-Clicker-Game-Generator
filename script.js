// Utility for zipping files in the browser
// Uses JSZip (https://stuk.github.io/jszip/)
let zipScriptLoaded = false;
function loadJSZip(cb) {
    if (zipScriptLoaded) { cb(); return; }
    const js = document.createElement('script');
    js.src = "https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js";
    js.onload = () => { zipScriptLoaded = true; cb(); };
    document.head.appendChild(js);
}

// Tab switching for code previews
document.addEventListener("DOMContentLoaded", function() {
    const tabButtons = document.querySelectorAll(".tab-button");
    tabButtons.forEach(btn => {
        btn.addEventListener("click", function() {
            tabButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            ["code-html", "code-css", "code-js"].forEach(id => {
                document.getElementById(id).style.display = "none";
            });
            document.getElementById("code-" + btn.dataset.tab).style.display = "";
        });
    });
});

// Code generation logic
function generateCode(options) {
    // HTML
    let html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>My Autoclicker Game</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="game-container">
        <h1>Autoclicker Game</h1>
        <img src="${options.clickerImage || 'clicker.png'}" id="clicker" alt="Clicker" class="clicker-img">
        <div>Clicks: <span id="clicks">0</span></div>
        <button id="autoClickBtn">Auto-Click (+1)</button>
        ${options.shop ? `<div id="shop" class="shop"><h2>Shop</h2></div>` : ''}
        ${options.upgrades ? `<div id="upgrades" class="upgrades"><h2>Upgrades</h2></div>` : ''}
        ${options.achievements ? `<div id="achievements" class="achievements"><h2>Achievements</h2></div>` : ''}
    </div>
    <script src="script.js"></script>
</body>
</html>
    `.trim();

    // CSS
    let css = `
body {
    background: #222;
    color: #fff;
    font-family: 'Segoe UI', Arial, sans-serif;
    margin: 0;
    padding: 0;
}
.game-container {
    max-width: 400px;
    margin: 40px auto;
    background: #2a2d3a;
    padding: 2em;
    border-radius: 12px;
    text-align: center;
    box-shadow: 0 4px 24px #0005;
}
h1 {
    margin-bottom: 1em;
}
.clicker-img {
    width: 120px;
    height: 120px;
    cursor: pointer;
    margin-bottom: 10px;
}
#autoClickBtn {
    margin: 10px auto 20px auto;
    padding: 0.6em 1.2em;
    font-size: 1.2em;
    border-radius: 8px;
    border: none;
    background: #21d07a;
    color: #fff;
    cursor: pointer;
    transition: background 0.2s;
}
#autoClickBtn:hover {
    background: #168e52;
}
.shop, .upgrades, .achievements {
    background: #23253c;
    margin: 1em 0;
    padding: 1em 0.5em;
    border-radius: 8px;
    text-align: left;
}
.shop h2, .upgrades h2, .achievements h2 {
    margin-top: 0;
}
    `.trim();

    // JavaScript
    let js = `
let clicks = 0;
const clicker = document.getElementById("clicker");
const clicksSpan = document.getElementById("clicks");
const autoClickBtn = document.getElementById("autoClickBtn");
${options.shop ? 'const shopDiv = document.getElementById("shop");' : ""}
${options.upgrades ? 'const upgradesDiv = document.getElementById("upgrades");' : ""}
${options.achievements ? 'const achievementsDiv = document.getElementById("achievements");' : ""}

function updateClicks() {
    clicksSpan.textContent = clicks;
}

function click() {
    clicks++;
    updateClicks();
    ${options.achievements ? 'checkAchievements();' : ''}
    ${options.sound ? 'playClickSound();' : ''}
}

clicker.addEventListener("click", click);
autoClickBtn.addEventListener("click", click);

${options.shop ? `
// Simple Shop Example
const shopItems = [
    { name: "Auto-Clicker", cost: 50, effect: () => { setInterval(click, 1000); } }
];
shopItems.forEach(item => {
    const btn = document.createElement("button");
    btn.textContent = item.name + " ($" + item.cost + ")";
    btn.onclick = function() {
        if (clicks >= item.cost) {
            clicks -= item.cost;
            item.effect();
            btn.disabled = true;
            btn.textContent += " (Purchased)";
            updateClicks();
        }
    };
    shopDiv.appendChild(btn);
});
` : ''}

${options.upgrades ? `
// Simple Upgrades Example
let clickValue = 1;
const upgrades = [
    { name: "Double Clicks", cost: 100, effect: () => { clickValue = 2; } }
];
upgrades.forEach(upg => {
    const btn = document.createElement("button");
    btn.textContent = upg.name + " ($" + upg.cost + ")";
    btn.onclick = function() {
        if (clicks >= upg.cost) {
            clicks -= upg.cost;
            upg.effect();
            btn.disabled = true;
            btn.textContent += " (Upgraded)";
            updateClicks();
        }
    };
    upgradesDiv.appendChild(btn);
});
function click() {
    clicks += clickValue;
    updateClicks();
    ${options.achievements ? 'checkAchievements();' : ''}
    ${options.sound ? 'playClickSound();' : ''}
}
` : ''}

${options.achievements ? `
// Simple Achievements Example
const achievements = [
    { name: "First Click!", condition: () => clicks >= 1 },
    { name: "Click Master", condition: () => clicks >= 100 }
];
let unlocked = {};
function checkAchievements() {
    achievements.forEach(a => {
        if (!unlocked[a.name] && a.condition()) {
            unlocked[a.name] = true;
            const div = document.createElement("div");
            div.textContent = "🏆 " + a.name;
            achievementsDiv.appendChild(div);
        }
    });
}
` : ''}

${options.sound ? `
// Simple Sound Example
function playClickSound() {
    const audio = new Audio("https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg");
    audio.volume = 0.3;
    audio.play();
}
` : ''}
    `.trim();

    return { html, css, js };
}

// Form logic & output
document.getElementById("generatorForm").addEventListener("submit", function(e) {
    e.preventDefault();
    const options = {
        clickerImage: document.getElementById("clickerImage").value.trim(),
        shop: document.getElementById("shop").checked,
        upgrades: document.getElementById("upgrades").checked,
        achievements: document.getElementById("achievements").checked,
        sound: document.getElementById("sound").checked
    };
    const code = generateCode(options);

    document.getElementById("code-html").textContent = code.html;
    document.getElementById("code-css").textContent = code.css;
    document.getElementById("code-js").textContent = code.js;
    document.getElementById("outputSection").style.display = "";

    // Default to HTML tab
    document.querySelectorAll(".tab-button").forEach(btn => btn.classList.remove("active"));
    document.querySelector(".tab-button[data-tab='html']").classList.add("active");
    document.getElementById("code-html").style.display = "";
    document.getElementById("code-css").style.display = "none";
    document.getElementById("code-js").style.display = "none";
});

// Download as .zip logic
document.getElementById("downloadZip").addEventListener("click", function() {
    const html = document.getElementById("code-html").textContent;
    const css = document.getElementById("code-css").textContent;
    const js = document.getElementById("code-js").textContent;
    loadJSZip(() => {
        const zip = new JSZip();
        zip.file("index.html", html);
        zip.file("style.css", css);
        zip.file("script.js", js);
        zip.generateAsync({ type: "blob" }).then(function(content) {
            const a = document.createElement("a");
            a.href = URL.createObjectURL(content);
            a.download = "autoclicker_game.zip";
            a.click();
        });
    });
});