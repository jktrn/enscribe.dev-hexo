'use strict';

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
 * 
 * If you want a box to indicate skipped lines, comment SKIP_LINE:([start]-[end])
 */

hexo.extend.tag.register('ccb', function (args, content) {
    let parsedArgs = parseArgs(args);
    
    parsedArgs.lang ??= "text";
    parsedArgs.gutter1 &&= parseRange(parsedArgs.gutter1).map(x => {
        if(x == "S") return htmlTag("div", {style: "margin:1.2em 0"}, htmlTag("span", {class: "line"}, " ", false), false);
        else return htmlTag("span", {class: "line"}, x, false) + htmlTag("br");
    }).join("");

    parsedArgs.gutter2 &&= parseRange(parsedArgs.gutter2).map(x => {
        if(x == "S") return htmlTag("div", {style: "margin:1.2em 0"}, htmlTag("span", {class: "line"}, " ", false), false);
        else return htmlTag("span", {class: "line"}, x, false) + htmlTag("br");
    }).join("");

    parsedArgs.scrollable &&= true;
    parsedArgs.wrapped &&= true;
    parsedArgs.terminal &&= true;
    parsedArgs.html &&= true;

    parsedArgs.diff_add &&= parseRange(parsedArgs.diff_add).map(x => parseInt(x));
    parsedArgs.diff_del &&= parseRange(parsedArgs.diff_del).map(x => parseInt(x));
    parsedArgs.highlight &&= parseRange(parsedArgs.highlight).map(x => parseInt(x));
    
    let highlightedContent = hljs.highlight(content, {
        language: parsedArgs.lang
    }).value;

    let lines = parsedArgs.html ? content.split('\n') : highlightedContent.split('\n');

    lines = lines.map(line => {
        if (line.includes("SKIP_LINE")) return htmlTag("div", {class: "skip-highlight"}, line.match(/\((.*)\)/)[1], false);
        else return line;
    });

    if(parsedArgs.diff_add) {
        parsedArgs.diff_add.forEach(function(line) {
            lines[line - 1] = htmlTag("div", {class: "diff-highlight-add"}, lines[line - 1], false);
        });
    }

    if(parsedArgs.diff_del) {
        parsedArgs.diff_del.forEach(function(line) {
            lines[line - 1] = htmlTag("div", {class: "diff-highlight-del"}, lines[line - 1], false);
        });
    }

    if(parsedArgs.highlight) {
        parsedArgs.highlight.forEach(function(line) {
            lines[line - 1] = htmlTag("div", {class: "code-highlight"}, lines[line - 1], false);
        });
    }

    highlighted = lines.join('\n');

    const scrollableText = parsedArgs.scrollable ? {style: "height:400px; overflow:auto; margin:1rem 0;"} : {};
    const scrollableStyle = parsedArgs.scrollable ? {style: "margin: 0;"} : {};
    const wrappedStyle = parsedArgs.wrapped ? {style: "whitespace: pre-wrap;"} : {};
    const urlText = parsedArgs.url ? htmlTag("a", {target: "_blank", rel: "noopener", href: `https://${parsedArgs.url}`}, htmlTag("span", {style: "color:#e9d3b6"}, `[${parsedArgs.url_text}]`, false), false) : "";
    
    let langText = htmlTag("figure", {class: "highlight text", ...scrollableStyle});
    if(parsedArgs.terminal) {
        langText = htmlTag("figure", {style: "background-color: #1D1D1D;", class: "highlight text", ...scrollableStyle});
    } else if(parsedArgs.lang) {
        langText = htmlTag("figure", {class: `highlight ${parsedArgs.lang}`, ...scrollableStyle})
    } 

    const captionText = parsedArgs.caption ? htmlTag("figcaption", {}, htmlTag("span", {}, parsedArgs.caption, false) + urlText, false) : "";
    const gutter1Text = parsedArgs.gutter1 ? htmlTag("td", {class: "gutter"}, htmlTag("pre", {}, parsedArgs.gutter1, false), false) : "";
    const gutter2Text = parsedArgs.gutter2 ? htmlTag("td", {class: "gutter"}, htmlTag("pre", {}, parsedArgs.gutter2, false), false) : "";
    
    return htmlTag("div", {...scrollableText}, langText + htmlTag("table", {}, captionText + htmlTag("tr", {}, gutter1Text + gutter2Text + htmlTag("td", {class: "code"}, htmlTag("pre", {...wrappedStyle}, highlighted, false), false), false), false), false);
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