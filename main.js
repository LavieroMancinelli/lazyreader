import { animate } from "https://cdn.jsdelivr.net/npm/motion@latest/+esm";

//const textEntryButton = document.querySelector(".text-entry-button");
//textEntryButton.addEventListener("click", textEntrySubmit);
const playButton = document.querySelector(".play-button");
playButton.addEventListener("click", beginPlayFromPanel);
const configButton = document.querySelector(".open-config-button");
configButton.addEventListener("click", openConfigMenu);
const textEntryField = document.querySelector(".text-entry");
textEntryField.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        textEntrySubmit();
    }
});
const wpmInput = document.querySelector(".wpm-input");
wpmInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        wpmInputSubmit();
    }
});



const CHARS_PER_LINE = 55;
const LINES_DISPLAYED = 5;
let WPM = 360;
let effectiveWPM = WPM;

let lines = [];
let line = [];
let word = "";
let lineCharCount = 0;
let passages = [];
passages[0] = document.querySelector(".passage0");
passages[1] = document.querySelector(".passage1");
passages[2] = document.querySelector(".passage2");
passages[3] = document.querySelector(".passage3");
passages[4] = document.querySelector(".passage4");
let curLine = 0;
let curWordInLine = 0; // index of highlighted word (in context of current line)
let curWord = 0; // index of highlighted word overall
let wordsInPassage = 0;
let passageXTrans = 0;
let passageYTrans = 0;
let playing = false;


document.addEventListener('keydown', function(event) {
    if (event.key === ' ') {
        effectiveWPM = WPM / 2;
    }
});
document.addEventListener('keyup', function(event) {
    if (event.key === ' ') {
        effectiveWPM = WPM;
    }
});

function addWordToLine() {
    line += (word + ' ');
    word = "";
    ++lineCharCount; // for the space char
    ++wordsInPassage;
}

function pushLine() {
    lines.push(line);
    line = "";
    lineCharCount = 0;
}

function processTextEntry(element, index)  {
    if (lineCharCount >= CHARS_PER_LINE) {
        pushLine();
    }
    if (element != ' ') {
        word += element;
        ++lineCharCount;
    } else {
        addWordToLine();
    }
}

function updatePassageDisplay() {
    for (let i = 0; i < LINES_DISPLAYED; ++i) {
        let lineToRead = curLine + i - (LINES_DISPLAYED-1)/2;
        if (lineToRead >= 0 && lineToRead < lines.length) {
            passages[i].innerHTML = lines[lineToRead]; 
        } else {
            passages[i].innerHTML = ""; 
        }
    }
}

function clearLines() {
    curWord = 0;
    curLine = 0;
    curWordInLine = 0;
    wordsInPassage = 0;
    for (let i = 0; i < passages.length; ++i)
        passages[i].innerHTML = "";
    lines = [];
    line = "";
}

function textEntrySubmit() {
    //clearLines();
    Array.from(textEntryField.value, processTextEntry);
    addWordToLine();
    pushLine(); // for end of input
    updatePassageDisplay();
}

function wpmInputSubmit() {
    WPM = wpmInput.valueAsNumber;
    effectiveWPM = WPM;
}

function movePassage(x, y) {
    animate(".passage", { x: x, y: y }, { ease: ["linear", "linear"] });
}

function delay(amt) {
    return new Promise(resolve => setTimeout(resolve, amt));
}

async function beginPlayFromPanel() {
    animate(".passage", { x: 0 }, { steps: 1})
    animate(".config-panel", {y: -1000});
    document.querySelector(".config-panel-bg").style.display = "none";
    await delay(250);
    document.querySelector(".config-panel-wrap").style.display = "none";
    beginPlay();
}

async function beginPlay() {

    playing = true;
    textEntrySubmit();
    wpmInputSubmit();

    //let delay_amt = 60/ effectiveWPM * 1000;
    let unMarkedLine = [];
    while (curWord < wordsInPassage && playing) {
        if (curLine >= 0 && curLine < lines.length) 
            unMarkedLine = lines[curLine];
        else continue;
        //unMarkedLine = curLine >= 0 ? lines[curLine] : [];
        let curLineSplit = unMarkedLine.split(' ');
        curLineSplit.pop();
        let curLineLength = curLineSplit.length;
        //passageXTrans -= 11*curLineSplit[curWordInLine].length;
        passageXTrans -= 10 * (unMarkedLine.length / curLineLength);
        // could just scroll smoothly based off of width of line (in words)
        animate(".passage", { x: (passageXTrans) }, { ease: "circInOut" });
        curLineSplit[curWordInLine] = "<mark>" + curLineSplit[curWordInLine] + "</mark>";
        let curLineMarked = curLineSplit.join(' ');
        lines[curLine] = curLineMarked;
        updatePassageDisplay();
        lines[curLine] = unMarkedLine;
        ++curWord;
        ++curWordInLine;
        if (curWordInLine >= curLineLength) {
            curWordInLine = 0;
            passageXTrans = 0;
            ++curLine;
        }
        
        //console.log("curWord: ", curWord, " wordsInPassage: ", wordsInPassage, " curLineLength: ", curLineLength, "curLine: ", curLine);
        
        await delay(60 / effectiveWPM * 1000);
        
    }
} 

// add check for if passage text changed -> reset read position
async function openConfigMenu() {
    playing = false;

    // assuming no resume
    clearLines();
    animate(".passage", { x: 0 }, { steps: 1})

    document.querySelector(".config-panel-wrap").style.display = "flex";
    document.querySelector(".config-panel-bg").style.display = "flex";
    animate(".config-panel", {y: 0});
    await delay(500);
}