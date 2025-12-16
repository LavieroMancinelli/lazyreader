import { animate } from "https://cdn.jsdelivr.net/npm/motion@latest/+esm"

const textEntryButton = document.querySelector(".text-entry-button");
textEntryButton.addEventListener("click", textEntrySubmit);
const playButton = document.querySelector(".play-button");
playButton.addEventListener("click", beginPlay);


const CHARS_PER_LINE = 55;
const LINES_DISPLAYED = 5;
const WPM = 180;

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
    //console.log("linecharcount", lineCharCount);
}

function clearPassages() {
    for (let i = 0; i < LINES_DISPLATED; ++i)
        passages[i].innerHTML = "";
}

function updatePassageDisplay() {
    for (let i = 0; i < LINES_DISPLAYED; ++i) {
        let lineToRead = curLine + i - (LINES_DISPLAYED-1)/2;
        if (lineToRead >= 0 && lineToRead < lines.length) {
            passages[i].innerHTML = lines[lineToRead]; 
            //console.log("line printed: ", i);
        } else {
            passages[i].innerHTML = ""; 
        }
    }
}

function textEntrySubmit() {
    const textEntryField = document.querySelector(".text-entry");
    Array.from(textEntryField.value, processTextEntry);
    addWordToLine();
    pushLine(); // for end of input
    updatePassageDisplay();
}

function movePassage(x, y) {
    animate(".passage", { x: x, y: y }, { ease: ["linear", "linear"] });
}

function delay(amt) {
    return new Promise(resolve => setTimeout(resolve, amt));
}

async function beginPlay() {
    console.log("playing");

    //clearPassages();

    curWord = 0;
    curWordInLine = 0;

    const delay_amt = 60/ WPM * 1000;
    let unMarkedLine = curLine >= 0 ? lines[curLine] : [];
    while (curWord < wordsInPassage) {
        unMarkedLine = lines[curLine];
        let curLineSplit = lines[curLine].split(' ');
        curLineSplit.pop();
        let curLineLength = curLineSplit.length;
        //passageXTrans -= 11*curLineSplit[curWordInLine].length;
        passageXTrans -= 10 * (lines[curLine].length / curLineLength);
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
        
        console.log("curWord: ", curWord, " wordsInPassage: ", wordsInPassage, " curLineLength: ", curLineLength, "curLine: ", curLine);
        
        await delay(delay_amt);
        
    }
    console.log("DONE");
}

//animate(".main", { y: 200 });