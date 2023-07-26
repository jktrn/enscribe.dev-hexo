const { htmlTag } = require('hexo-util');
const hljs = require('highlight.js');

/**
 * Creates a custom codeblock, with manual line numbers and diffing.
 * Usage example:
 * {% ccb lang:javascript gutter1:1-3,6 caption:'hello world' url:example.com url_text:'hello world' diff_add:2 %}
 * function helloWorld() {
 *    console.log('hello world');
 * }
 * //SKIP_LINE:(4-5)
 * helloWorld();
 * {% endccb %}
 * 
 * @param {string} lang - The language of the codeblock.
 * @param {string} gutter1 - First line numbers. Accepts comma-separated (no-space) numbers, ranges, and multiplications (i.e. 1,2,3-5,6x2).
 * @param {string} gutter2 - Second line numbers. Same accepts as gutter1.
 * @param {string} caption - The caption of the codeblock. Must be surrounded with quotes if it contains spaces.
 * @param {string} url - The url of the codeblock. Omit https://.
 * @param {string} url_text - The text of the url. Must be surrounded with quotes if it contains spaces.
 * @param {string} diff_add - Highlights specified lines with green. Same accepts as gutter1.
 * @param {string} diff_del - Highlights specified lines with red. Same accepts as gutter1.
 * @param {string} highlight - Highlights specified lines with yellow. Same accepts as gutter1.
 * @param {Boolean} html - Whether or not to use custom HTML in the codeblock. Default is false.
 * @param {Boolean} scrollable - Whether or not to make the codeblock scrollable. Default is false. Window is 400px.
 * @param {Boolean} wrapped - Whether or not to wrap text to next line. Default is false.
 * @param {Boolean} terminal - Whether or not to use a terminal theme. Default is false.
 * 
 * If you want a box to indicate skipped lines, comment SKIP_LINE:([start]-[end])
 */

hexo.extend.tag.register('ccb', function (args, content) {
    let parsedArgs = parseArgs(args);
    
    // Parse settings
    parsedArgs.lang         ??= "text";
    parsedArgs.gutter1      &&= parseGutterHTML(parseRange(parsedArgs.gutter1));
    parsedArgs.gutter2      &&= parseGutterHTML(parseRange(parsedArgs.gutter2));
    parsedArgs.diff_add     &&= parseRange(parsedArgs.diff_add);
    parsedArgs.diff_del     &&= parseRange(parsedArgs.diff_del);
    parsedArgs.highlight    &&= parseRange(parsedArgs.highlight);
    parsedArgs.scrollable   &&= Boolean(parsedArgs.scrollable);
    parsedArgs.wrapped      &&= Boolean(parsedArgs.wrapped);
    parsedArgs.terminal     &&= Boolean(parsedArgs.terminal);
    parsedArgs.html         &&= Boolean(parsedArgs.html);
    
    let highlightedContent = hljs.highlight(content, {language: parsedArgs.lang}).value;
    let lines = parsedArgs.html ? content.split('\n') : highlightedContent.split('\n');

    // Parses SKIP_LINE:([start]-[end]) comments
    lines = lines.map(line => {
        if (line.includes("SKIP_LINE")) return htmlTag("div", {class: "skip-highlight"}, line.match(/\((.*)\)/)[1], false);
        else return line;
    });

    // Parses diff_add, diff_del, and highlight
    if(parsedArgs.diff_add) lines  = parseHighlightHTML(lines, parsedArgs.diff_add, "diff-highlight-add");
    if(parsedArgs.diff_del) lines  = parseHighlightHTML(lines, parsedArgs.diff_del, "diff-highlight-del");
    if(parsedArgs.highlight) lines = parseHighlightHTML(lines, parsedArgs.highlight, "code-highlight");

    highlighted = lines.join('\n');

    // Building HTML
    let figureClasses = [];
    if(parsedArgs.scrollable) figureClasses.push("margin: 0;"); 
    if(parsedArgs.terminal) figureClasses.push("background-color: #1D1D1D;");

    const scrollableWrapper = parsedArgs.scrollable ? {style: "height: 400px; overflow: scroll; margin: 1rem 0;"} : {};
    const wrappedTextStyle  = parsedArgs.wrapped    ? {style: "white-space: pre-wrap; word-break: break-word;"} : {};

    const urlText           = parsedArgs.url_text   ? htmlTag("span", {}, `[${parsedArgs.url_text}]`, false) : "[link]";
    const urlWrapper        = parsedArgs.url        ? htmlTag("a", {href: `https://${parsedArgs.url}`}, urlText , false) : "";

    const captionText       = parsedArgs.caption    ? htmlTag("span", {}, parsedArgs.caption, false) : "";
    const captionWrapper    = parsedArgs.caption    ? htmlTag("figcaption", {}, captionText + urlWrapper, false) : "";

    const gutter1Wrapper    = parsedArgs.gutter1    ? htmlTag("td", {class: "gutter"}, htmlTag("pre", {}, parsedArgs.gutter1, false), false) : "";
    const gutter2Wrapper    = parsedArgs.gutter2    ? htmlTag("td", {class: "gutter"}, htmlTag("pre", {}, parsedArgs.gutter2, false), false) : "";

    const langText          = htmlTag("figure", {class: `highlight ${parsedArgs.lang}`, style: figureClasses.join(" ")});

    return htmlTag("div", {...scrollableWrapper}, langText + htmlTag("table", {}, captionWrapper + htmlTag("tr", {}, gutter1Wrapper + gutter2Wrapper + htmlTag("td", {class: "code"}, htmlTag("pre", {...wrappedTextStyle}, highlighted, false), false), false), false), false);
}, {
    ends: true,
    async: true
});

function parseRange(str) {
    let arr = str.split(',');
    let result = [];
    for(const i of arr) {
        if (i.includes('-')) {
            let [start, end] = i.split('-');
            for(let j = parseInt(start); j <= parseInt(end); j++) {
                result.push(j.toString());
            }
        } else if (i.includes('x')) {
            let [left, right] = i.split('x');
            for(let j = 0; j < parseInt(right); j++) {
                result.push(left);
            } 
        } else {
            result.push(i);
        }
    }
    result = result.map(x => {
        if(isNaN(parseInt(x))) return x;
        else return parseInt(x);
    })
    return result;
}

function parseArgs(arr) {
    let result = {};
    for(const i of arr) {
        let [key, ...value] = i.split(":");
        result[key] = value.join(":");
    }
    return result;
}


function parseGutterHTML(rangeArray) {
    return rangeArray.map(x => {
        if(x == "S") {
            return htmlTag("div", {style: "margin:1.2em 0"}, htmlTag("span", {class: "line"}, " ", false), false);
        } else {
            return htmlTag("span", {class: "line"}, x, false) + htmlTag("br");
        }
    }).join("");
}

function parseHighlightHTML(lineArray, rangeArray, className) {
    rangeArray.forEach(function(line) {
        lineArray[line - 1] = htmlTag("div", {class: className}, lineArray[line - 1], false);
    });
    return lineArray;
}


// const { htmlTag } = require('hexo-util');
// const hljs = require('highlight.js');

/**
 * Creates a custom codeblock, with manual insertion-based line numbers (for custom purposes) and diffing.
 * 
 * Usage example:
 * {% ccb lang:js gutter1:1-3,6 caption:'hello world' url:https://example.com url_text:'hello world' diff_add:2 %}
 * function helloWorld() {
 *    console.log('hello world');
 * }
 * //SKIP_LINE:(4-5)
 * helloWorld();
 * {% endccb %}
 * 
 * @param {string} lang         - The language of the codeblock for HLJS. Accepts all Markdown/HLJS-supported highlighting.
 * @param {string} gutter1      - First line numbers. Accepts comma-separated (no-space) numbers, ranges, multiplications, 
 *                                  the string "S" (accommodates SKIP_LINE margins), and addition/subtraction signs (e.g. 1,2,3-5,6x2,-,+,S).
 * @param {string} gutter2      - Second line numbers. Same accepts as gutter1. Typically used for diffing (+, -).
 * @param {string} caption      - The caption of the codeblock. Must be surrounded with quotes if it contains spaces.
 * @param {string} url          - The URL of the codeblock (used for references, sources).
 * @param {string} url_text     - The text of URL. Must be surrounded with quotes if it contains spaces.
 * @param {string} diff_add     - Highlights specified lines with green. Same accepts as gutter1 (except -, +, S).
 * @param {string} diff_del     - Highlights specified lines with red. Same accepts as gutter1 (except -, +, S).
 * @param {string} highlight    - Highlights specified lines with yellow. Same accepts as gutter1 (except -, +, S).
 * @param {Boolean} html        - Whether or not to use custom HTML in the codeblock. Disables HLJS. Default is false.
 * @param {Boolean} scrollable  - Whether or not to make the codeblock scrollable. Window is 400px. Default is false.
 * @param {Boolean} wrapped     - Whether or not to wrap text to next line. Default is false.
 * @param {Boolean} terminal    - Whether or not to use a terminal background color scheme. Default is false.
 * 
 * If you want a box to indicate skipped lines, comment SKIP_LINE:([start]-[end])
 */

// hexo.extend.tag.register('ccb', function (args, content) {
//     let parsedArgs = parseArgs(args);
    
//     // Parse settings
//     parsedArgs.lang         ??= "text";
//     parsedArgs.gutter1      &&= parseGutterHTML(parseRange(parsedArgs.gutter1));
//     parsedArgs.gutter2      &&= parseGutterHTML(parseRange(parsedArgs.gutter2));
//     parsedArgs.diff_add     &&= parseRange(parsedArgs.diff_add);
//     parsedArgs.diff_del     &&= parseRange(parsedArgs.diff_del);
//     parsedArgs.highlight    &&= parseRange(parsedArgs.highlight);
//     parsedArgs.scrollable   &&= Boolean(parsedArgs.scrollable);
//     parsedArgs.wrapped      &&= Boolean(parsedArgs.wrapped);
//     parsedArgs.terminal     &&= Boolean(parsedArgs.terminal);
//     parsedArgs.html         &&= Boolean(parsedArgs.html);
    
//     let parsedContent = hljs.highlight(content, {language: parsedArgs.lang}).value;
//     let lines = parsedArgs.html ? content.split('\n') : parsedContent.split('\n');

//     // Parses SKIP_LINE:([start]-[end]) comments
//     lines = lines.map(line => {
//         if (line.includes("SKIP_LINE")) {
//             return htmlTag("div", {class: "skip-highlight"}, line.match(/\((.*)\)/)[1], false);
//         } else {
//             return line;
//         }
//     });

//     // Parses diff_add, diff_del, and highlight
//     if(parsedArgs.diff_add)  lines = parseHighlightHTML(lines, parsedArgs.diff_add, "diff-highlight-add");
//     if(parsedArgs.diff_del)  lines = parseHighlightHTML(lines, parsedArgs.diff_del, "diff-highlight-del");
//     if(parsedArgs.highlight) lines = parseHighlightHTML(lines, parsedArgs.highlight, "code-highlight");

//     const resultContent = lines.join('\n');

//     // Building HTML
//     const scrollableWrapper = parsedArgs.scrollable ? {class: "ccb scrollable-wrapper"} : {};
//     const wrappedTextStyle  = parsedArgs.wrapped    ? {class: "ccb wrapped-text"}       : {};

//     const scrollableStyle   = parsedArgs.scrollable ? "ccb scrollable-style"   : "";
//     const terminalStyle     = parsedArgs.terminal   ? "ccb terminal-style"     : "";

//     const gutter1Wrapper    = parsedArgs.gutter1    ? htmlTag("td", {class: "gutter"}, htmlTag("pre", {}, parsedArgs.gutter1, false), false) : "";
//     const gutter2Wrapper    = parsedArgs.gutter2    ? htmlTag("td", {class: "gutter"}, htmlTag("pre", {}, parsedArgs.gutter2, false), false) : "";
//     const urlText           = parsedArgs.url_text   ? htmlTag("span", {class: "ccb url-text"}, `[${parsedArgs.url_text}]`, false) : "[link]";
//     const urlTextWrapper    = parsedArgs.url        ? htmlTag("a", {href: `https://${parsedArgs.url}`}, urlText, false) : "";
//     const captionText       = parsedArgs.caption    ? htmlTag("span", {}, parsedArgs.caption, false) : "";
//     const captionWrapper    = parsedArgs.caption    ? htmlTag("figcaption", {}, captionText + urlTextWrapper, false) : "";

//     const langText          = htmlTag("figure", {class: `highlight ${parsedArgs.lang} ${scrollableStyle} ${terminalStyle}`});
//     console.log(langText);

//     // :INSANITY:
//     return htmlTag("div", {...scrollableWrapper}, langText + htmlTag("table", {}, captionWrapper + htmlTag("tr", {}, gutter1Wrapper + gutter2Wrapper + htmlTag("td", {class: "code"}, htmlTag("pre", {...wrappedTextStyle}, resultContent, false), false), false), false), false);
// }, {
//     ends: true,
//     async: true
// });
