const showdown = require('showdown');
const hljs = require('highlight.js');
const yaml = require('js-yaml');
const { htmlTag } = require('hexo-util');

showdown.extension('only-inline-stuff', function () {
    return [{
        type: 'output',
        filter: function (text) {
            text = text.replace(/<\/?p[^>]*>/g, '');
            return text;
        }
    }];
});

let conv = new showdown.Converter({
    extensions: ['only-inline-stuff']
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

hexo.extend.tag.register('fontawesome', function () {
    return htmlTag('script', {src: "https://kit.fontawesome.com/129342a70b.js", crossorigin: "anonymous"}, "", false);
}, {
    async: true
});

hexo.extend.tag.register('cimage', function (args, content) {
    const parsedArgs = parseArgs(args);
    let sub = parsedArgs.sub ? htmlTag('div', {class: "subtitle"}, conv.makeHtml(parsedArgs.sub), false) : "";
    return htmlTag('p', {}, htmlTag('img', parsedArgs, "", false) + sub, false);
});

//create a hexo tag that returns a flagcounter
hexo.extend.tag.register('flagcounter', function (args, content) {
    return htmlTag("img", {src: "https://s01.flagcounter.com/count2/8Xkk/bg_161616/txt_C9CACC/border_E9D3B6/columns_3/maxflags_12/viewers_3/labels_0/pageviews_1/flags_1/percent_0/"});
}, {
    ends: false,
    async: true
});

hexo.extend.tag.register('twitter', function(args, content) {
    const parsedArgs = parseArgs(args);

    parsedArgs.url ??= "javascript;";
    parsedArgs.width ??= "auto";

    return htmlTag("div", {class: "twitter-wrapper"}, htmlTag("blockquote", {class: "twitter-tweet tw-align-center", "data-theme": "dark", style: `width: ${parsedArgs.width}`}, htmlTag("a", {href: `https://${parsedArgs.url}`}, "", false), false), false) + htmlTag("script", {async: "", defer: "", src: "https://platform.twitter.com/widgets.js", charset: "utf-8"}, "", false);
},{
  async: true,
  ends: false
});

const members = {
    'enscribe': {
        'name': 'enscribe',
        'url': 'https://github.com/jktrn',
        'img': 'https://avatars.githubusercontent.com/u/71956291'
    },
    'MrTea': {
        'name': 'MrTea',
        'url': 'https://github.com/MrTeaa',
        'img': 'https://avatars.githubusercontent.com/u/71956135'
    },
    'sahuang': {
        'name': 'sahuang',
        'url': 'https://github.com/sahuang',
        'img': 'https://cdn.discordapp.com/avatars/111834400383070208/4eb453ae0e3cda1b9c783e85e0a65692.png'
    },
    'Battlemonger': {
        'name': 'Battlemonger',
        'url': 'javascript:;',
        'img': 'https://cdn.discordapp.com/avatars/632614070867984420/a90072cdeafe74ef8ec59fcf3c086fc1.png'
    },
    'neil': {
        'name': 'neil',
        'url': 'javascript:;',
        'img': 'https://support.discord.com/hc/user_images/l12c7vKVRCd-XLIdDkLUDg.png'
    },
    'blueset': {
        'name': 'blueset',
        'url': 'https://github.com/blueset',
        'img': 'https://avatars.githubusercontent.com/u/553831'
    }
};

hexo.extend.tag.register('newchallenge', function(args, content) {
    let parsedArgs = yaml.load(content);
    parsedArgs.description &&= `${conv.makeHtml(parsedArgs.description)}`;

    parsedArgs.size &&= {style: `font-size: ${parsedArgs.size}`};
    parsedArgs.genre &&= `${htmlTag("i", {class: "fa-solid fa-tag"}, "", false)} ${htmlTag("b", {}, "genre", false)}: ${parsedArgs.genre + htmlTag("br")}`;
    parsedArgs.points &&= `${htmlTag("i", {class: "fa-solid fa-circle-plus"}, "", false)} ${htmlTag("b", {}, "points", false)}: ${parsedArgs.points + htmlTag("br")}`;
    parsedArgs.files &&= `${htmlTag("i", {class: "fa-solid fa-file"}, "", false)} ${htmlTag("b", {}, "files", false)}: ${conv.makeHtml(parsedArgs.files) + htmlTag("br")}`;
    let solverText = `${htmlTag("i", {class: "fa-solid fa-user"}, "", false)} ${htmlTag("b", {}, "solvers", false)}: `;

    if(parsedArgs.title) {
        parsedArgs.level ??= "h2"
        parsedArgs.title = htmlTag("div", {class: "challenge-title"}, htmlTag(parsedArgs.level, {id: `${parsedArgs.title.replace(/\s/g, '-')}`, class: "chall-title"}, htmlTag("a", {href: `#${parsedArgs.title.replace(/\s/g, '-')}`, class: "headerlink", title: `${parsedArgs.title}`}, "", false) + parsedArgs.title, false), false);
    }

    if(parsedArgs.hints) {
        //TO-DO
    }
});

hexo.extend.tag.register('challenge', function(args, content) {
    let obj = yaml.load(content);

    obj.description &&= `${conv.makeHtml(obj.description)}`;
    obj.size &&= `style="font-size: ${obj.size}"`
    obj.genre &&= `<i class="fa-solid fa-tag"></i> <b>genre</b>: ${obj.genre}<br>`;
    obj.points &&= `<i class="fa-solid fa-circle-plus"></i> <b>points</b>: ${obj.points}<br>`;
    obj.files &&= `<i class="fa-solid fa-file"></i> <b>files</b>: ${conv.makeHtml(obj.files)}<br>`;
    let solverText = `<i class="fa-solid fa-user"></i> <b>solvers</b>:<br>`;

    if(obj.title && obj.level == 'h2') {
        obj.title = `<div class="challenge-title"><h2 id="${obj.title.replace(/\s/g, '-')}" class="chal-title"><a href="#${obj.title.replace(/\s/g, '-')}" class="headerlink" title="${obj.title}"></a>${obj.title}</h2></div>`;
    } else if(obj.title) {
        obj.title = `<div class="challenge-title"><h3 id="${obj.title.replace(/\s/g, '-')}" class="chal-title"><a href="#${obj.title.replace(/\s/g, '-')}" class="headerlink" title="${obj.title}"></a>${obj.title}</h3></div>`;
    }

    if(obj.hints) {
        let concat = "";
        if(Array.isArray(obj.hints)) {
            for(const hint of obj.hints) {
                concat += `${conv.makeHtml(hint)}<br>`
            }
        } else {
            concat = `${conv.makeHtml(obj.hints)}<br>`
        }
        obj.hints = `<br><details><summary><b>Hints</b>:</summary><br>${concat}</details>`
    }

    if(obj.solvers) {
        if(Array.isArray(obj.solvers)) {
            for(const solver of obj.solvers) {
                if(solver.includes(' --flag')) {
                    const flagger = solver.replace(' --flag', ''); 
                    solverText += ` - <img style="display: inline-block; border-radius: 50%; width: 20px; margin-bottom: -6px;" src="${members[flagger]?.img}"> <a target="_blank" rel="noopener" href="${members[flagger]?.url}">${members[flagger]?.name}</a> <i class="fa-solid fa-flag"></i><br>`;
                } else {
                    solverText += ` - <img style="display: inline-block; border-radius: 50%; width: 20px; margin-bottom: -6px;" src="${members[solver]?.img}"> <a target="_blank" rel="noopener" href="${members[solver]?.url}">${members[solver]?.name}</a><br>`;
                }
            }
        } else {
            solverText = `<i class="fa-solid fa-user"></i> <b>solver</b>: <img style="display: inline-block; border-radius: 50%; width: 20px; margin-bottom: -6px;" src="${members[obj.solvers]?.img}"> <a target="_blank" rel="noopener" href="${members[obj.solvers]?.url}">${members[obj.solvers]?.name}</a><br>`
        }
    } else {
        solverText = "";
    }

    if (obj.authors) {
        if(members[obj.authors]) {
            if(Array.isArray(obj.authors)) {
                let arr = obj.authors.map(x => `<br> - <img style="display: inline-block; border-radius: 50%; width: 20px; margin-bottom: -6px;" src="${members[x]?.img}"> <a target="_blank" rel="noopener" href="${members[x]?.url}">${members[x]?.name}</a>`).join("");
                obj.authors = `<i class="fa-solid fa-square-pen"></i> <b>authors</b>: ${arr}<br>`;
            } else {
                obj.authors = `<i class="fa-solid fa-square-pen"></i> <b>author</b>: <img style="display: inline-block; border-radius: 50%; width: 20px; margin-bottom: -6px;" src="${members[obj.authors]?.img}"> <a target="_blank" rel="noopener" href="${members[obj.authors]?.url}">${members[obj.authors]?.name}</a><br>`;
            }
        } else {
            if(Array.isArray(obj.authors)) {
                let arr = obj.authors.map(x => `<br> - ${x}`).join("");
                obj.authors = `<i class="fa-solid fa-square-pen"></i> <b>authors</b>: ${arr}<br>`;
            } else {
                obj.authors = `<i class="fa-solid fa-square-pen"></i> <b>author</b>: ${obj.authors}<br>`;
            }
        }
    }

    ["title", "description", "hints", "authors", "genre", "solvers", "files", "points", "size"].forEach((element) => {
        obj[element] ??= "";
    });

    return `<div class="challenge">
    ${obj.title}
    <div style="display:flex;" class="no-highlight">
        <div class="challenge-info">
            <div class="center-align">
                ${solverText}
                ${obj.authors}
                ${obj.genre}
                ${obj.points}
                ${obj.files}
            </div>
        </div>
        <div class="challenge-description">
            <div class="center-align" ${obj.size}>
                ${obj.description}
                ${obj.hints}
            </div>
        </div>
    </div>
    </div>`;
}, {
    async: true,
    ends: true
});

hexo.extend.tag.register('grid', function (args, content) {
    const yaml = require('js-yaml');
    const parsedArgs = parseArgs(args);
    let grid = yaml.load(content);
    let gridItems = [];
    parsedArgs.container = parsedArgs.container ? "container" : "";
    for (const [key, value] of Object.entries(grid)) {
        let actions = [];
        let badge, badge2, badge3, image, border, background, actionsBox;
        if (value.button && Array.isArray(value.button.text)) {
            for (let i = 0; i < value.button.text.length; i++) {
                actions.push(`<a href="${value.button.link[i]}" class="action-button-primary">${value.button.text[i]}</a>`);
            }
        } else if(value.button) {
            actions.push(`<a href="${value.button.link}" class="action-button-primary">${value.button.text}</a>`);
        }
        actions = actions.join("");
        badge = value.badge ? `<span class="badge no-select ${value.badge.type}">${value.badge.text}</span>` : "";
        badge2 = value.badge2 ? `<span class="badge no-select ${value.badge2.type}">${value.badge2.text}` : "";
        badge3 = value.badge3 ? `<span class="badge no-select ${value.badge3.type}">${value.badge3.text}</span>` : "";
        image = value.image ? `<div class="cover-img"><img src="${value.image}" alt="${key}"></div>` : "";
        border = value.border ? `border: 2px solid #${value.border};` : "";
        background = value.background ? `background: ${value.background};` : "";
        
        if(badge || badge2 || badge3 || actions) {
            actionsBox = `<div class="actions">
            <div class="left">
                ${badge}
                ${badge2}
                ${badge3}
            </div>
            <div class="right">
                ${actions}
            </div>
            </div>`;
        } else {
            actionsBox = "";
        }
        gridItems.push(`<div class="card" style="${border}${background}">
        ${image}
        <div class="contents">
            <p class="title">${key}</p>
            <p class="description">${conv.makeHtml(value.description)}</p>
        </div>
        ${actionsBox}
        </div>`);
    } if(parsedArgs.columns == "2") {
        return `<div class="${parsedArgs.container}"><div class="card-grid-2">${gridItems.join("")}</div></div>`;
    } else {
        return `<div class="${parsedArgs.container}"><div class="card-grid">${gridItems.join("")}</div></div>`;
    }
}, {
    ends: true,
    async: true
});

//<img class="inline-image" src="https://flagcdn.com/24x18/tr.png">
// hexo tag for returning a small flag icon of country
hexo.extend.tag.register('countryflag', function (args) {
    const countryCode = getCountryCode(args[0]);
    return htmlTag('img', {
        src: `https://flagcdn.com/24x18/${countryCode}.png`,
        class: "inline-image" 
    });
}, {
    async: true
});

//function that returns ISO 3166-1 alpha-2 country code from country name
function getCountryCode(countryName) {
    if(countryName.length == 2) return countryName.toLowerCase();
    const countryCodes = require("i18n-iso-countries");
    const countryCode = countryCodes.getAlpha2Code(countryName, "en")?.toLowerCase();
    return countryCode;
}