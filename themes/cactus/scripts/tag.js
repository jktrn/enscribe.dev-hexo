let showdown = require('showdown');
let hljs = require('highlight.js');
const yaml = require('js-yaml');

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

hexo.extend.tag.register('box', function (args, content) {
    const argText = args ? ` style="${args}"` : "";
    return `<div class="box no-highlight"${argText}>${conv.makeHtml(content)}</div>`;
}, {
    ends: true,
    async: true
});

hexo.extend.tag.register('info', function (args, content) {
    const argText = args ? ` style="${args}"` : "";
    let appended = `<i class="fa-solid fa-circle-info"></i> ${content}`;
    return `<div class="text-info no-highlight"${argText}>${conv.makeHtml(appended)}</div>`;
}, {
    ends: true,
    async: true
});

hexo.extend.tag.register('warning', function (args, content) {
    const argText = args ? ` style="${args}"` : "";
    let appended = `<i class="fa-solid fa-triangle-exclamation"></i> ${content}`;
    return `<div class="text-warning no-highlight"${argText}>${conv.makeHtml(appended)}</div>`;
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
    // parse args
    let obj = {};
    args.forEach(function(item) {
        let key = item.split(':')[0];
        let value = item.split(':')[1];
        obj[key] = value;
    });
    let lang = obj.lang ? obj.lang : "text";
    let gutter1 = obj.gutter1 ? parseRange(obj.gutter1).map(x => {
        if(x == "S") return `<div style="margin:1.2em 0"><span class="line"> </span></div>`;
        else return `<span class="line">${x}</span><br>`;
    }).join("") : undefined;

    let gutter2 = obj.gutter2 ? parseRange(obj.gutter2).map(x => {
        if(x == "S") return `<div style="margin:1.1em 0"><span class="line"> </span></div>`;
        else return `<span class="line">${x}</span><br>`;
    }).join("") : undefined;

    let caption = obj.caption ? obj.caption : undefined;
    let scrollable = obj.scrollable == 'true' ? true : false;
    let wrapped = obj.wrapped == 'true' ? true : false;
    let diff_add = obj.diff_add ? parseRange(obj.diff_add).map(x => parseInt(x)) : undefined;
    let diff_del = obj.diff_del ? parseRange(obj.diff_del).map(x => parseInt(x)) : undefined;
    let highlight = obj.highlight ? parseRange(obj.highlight).map(x => parseInt(x)) : undefined;
    let url = obj.url ? obj.url : undefined;
    let url_text = obj.url_text ? obj.url_text : undefined;
    let terminal = obj.terminal == 'true' ? true : false;
    let highlighted = hljs.highlight(content, {
        language: lang
    }).value;
    let lines = obj.html == 'true' ? content.split('\n') : highlighted.split('\n');
    
    lines = lines.map(line => {
        if (line.indexOf("SKIP_LINE") != -1) {
            return `<div class="skip-highlight">(${line.match(/\((.*)\)/)[1]})</div>`;
        } else {
            return line;
        }
    });

    if(diff_add) {
        diff_add.forEach(function (line) {
            lines[line - 1] = `<div class="diff-highlight-add">${lines[line - 1]}</div>`;
        });
    }

    if(diff_del) {
        diff_del.forEach(function (line) {
            lines[line - 1] = `<div class="diff-highlight-del">${lines[line - 1]}</div>`;
        });
    }

    if(highlight) {
        highlight.forEach(function (line) {
            lines[line - 1] = `<div class="code-highlight">${lines[line - 1]}</div>`;
        });
    }

    highlighted = lines.join('\n');

    const scrollableText = scrollable ? `<div style="height:400px; overflow:auto; margin:1rem 0;">` : "";
    const scrollableStyle = scrollable ? `margin:0` : "";
    const scrollableEnd = scrollable ? `</div>` : "";
    const wrappedStyle = wrapped ? ` style="white-space: pre-wrap;"` : "";
    const urlText = url ? `<a target="_blank" rel="noopener" href="https://${url}"><span style="color:#e9d3b6">[${url_text}]</span></a>` : "";
    let langText;
    if(terminal) {
        langText = `<figure style="background-color:#1D1D1D;${scrollableStyle}" class="highlight text">`;
    } else if(lang) {
        langText = `<figure class="highlight ${lang}" style="${scrollableStyle}">`;
    } else {
        langText = `<figure class="highlight text" style="${scrollableStyle}">`;
    }
    const captionText = caption ? `<figcaption><span>${caption}</span>${urlText}</figcaption>` : "";
    const gutter1Text = gutter1 ? `<td class="gutter"><pre>${gutter1}</pre></td>`: "";
    const gutter2Text = gutter2 ? `<td class="gutter"><pre>${gutter2}</pre></td>`: "";
    return `${scrollableText}${langText}<table>${captionText}<tr>${gutter1Text}${gutter2Text}<td class="code"><pre${wrappedStyle}>${highlighted}</pre></td></tr></table></figure>${scrollableEnd}`;
}, {
    ends: true,
    async: true
});

//create a hexo tag that returns fontawesome script src
hexo.extend.tag.register('fontawesome', function () {
    return `<script src="https://kit.fontawesome.com/129342a70b.js" crossorigin="anonymous"></script>`;
}, {
    async: true
});

//create a hexo tag that accepts a url, width, alt text and a subtitle and returns an image tag
hexo.extend.tag.register('cimage', function (args, content) {
    let obj = {};
    args.forEach(function(item) {
        let key = item.split(':')[0];
        let value = item.split(':')[1];
        obj[key] = value;
    });
    let url = obj.url ? obj.url : undefined;
    let width = obj.width ? ` width="${obj.width}"` : "";
    let alt = obj.alt ? ` alt="${obj.alt}"` : "";
    let sub = obj.sub ? `<div class="subtitle">${obj.sub}</div>` : "";
    return `<p><img src="${url}"${width}${alt}>${sub}</p>`;
});

//create a hexo tag that returns a flagcounter
hexo.extend.tag.register('flagcounter', function (args, content) {
    return `<img src="https://s01.flagcounter.com/count2/8Xkk/bg_161616/txt_C9CACC/border_E9D3B6/columns_3/maxflags_12/viewers_3/labels_0/pageviews_1/flags_1/percent_0/">`
}, {
    ends: false,
    async: true
});

hexo.extend.tag.register('twitter', function(args, content) {
    let obj = {};
    args.forEach(function(item) {
        let key = item.split(':')[0];
        let value = item.split(':')[1];
        obj[key] = value;
    });
    
    let url = obj.url ? obj.url : undefined;
    let width = obj.width ? `width=${obj.width}` : '';

  	return `<div class="twitter-wrapper"><blockquote class="twitter-tweet tw-align-center" data-theme="dark" ${width}><a href="https://${url}"></a></blockquote></div><script async defer src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>`;
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

// hexo.extend.tag.register('challenge', function(args, content) {
//     let lines = content.split('\n');
//     let obj = {};
//     lines.forEach(function(item) {
//         let key = item.split(': ')[0];
//         let value = item.split(': ')[1];
//         obj[key] = value;
//     });
//     let title;
//     if (obj.title) {
//         if(obj.level && obj.level == 'h2') {
//             title = `<div class="challenge-title"><h2 id="${obj.title.replace(/\s/g, '-')}" class="chal-title"><a href="#${obj.title.replace(/\s/g, '-')}" class="headerlink" title="${obj.title}"></a>${obj.title}</h2></div>`;
//         } else {
//             title = `<div class="challenge-title"><h3 id="${obj.title.replace(/\s/g, '-')}" class="chal-title"><a href="#${obj.title.replace(/\s/g, '-')}" class="headerlink" title="${obj.title}"></a>${obj.title}</h3></div>`;
//         } 
//     } else {
//         title = ""
//     }
//     let description = obj.description ? `${conv.makeHtml(obj.description)}` : "";
//     let size = obj.size ? `style="font-size: ${obj.size}"` : "";
//     let hints = obj.hints ? `<br><details><summary><b>Hints</b>:</summary><br>${conv.makeHtml(obj.hints)}</details>` : "";
//     let solvers, authors;
//     let solverText = `<i class="fa-solid fa-user"></i> <b>solvers</b>:<br>`;
//     // if solvers exists, split it into an array
//     if(obj.solvers) {
//         solvers = obj.solvers.split(', ').length > 1 ? obj.solvers.split(', ') : obj.solvers;
//     }

//     //if obj.solvers is an array
//     if(Array.isArray(solvers)) {
//         for(const solver of solvers) {
//             if(solver.includes(' --flag')) {
//                 const flagger = solver.replace(' --flag', ''); 
//                 solverText += ` - <img style="display: inline-block; border-radius: 50%; width: 20px; margin-bottom: -6px;" src="${members[flagger].img}"> <a href="${members[flagger].url}">${members[flagger].name}</a> <i class="fa-solid fa-flag"></i><br>`;
//             } else {
//                 solverText += ` - <img style="display: inline-block; border-radius: 50%; width: 20px; margin-bottom: -6px;" src="${members[solver].img}"> <a href="${members[solver].url}">${members[solver].name}</a><br>`;
//             }
//         }
//     } else {
//         solverText = `<i class="fa-solid fa-user"></i> <b>solver</b>: <img style="display: inline-block; border-radius: 50%; width: 20px; margin-bottom: -6px;" src="${members[solvers].img}"> <a href="${members[solvers].url}">${members[solvers].name}</a><br>`
//     }

//     if (obj.authors) {
//         if(obj.authors.split(', ').length > 1) {
//             let arr = obj.authors.split(',').map(x => `<br> - ${x}`).join("");
//             authors = `<i class="fa-solid fa-square-pen"></i> <b>authors</b>: ${arr}<br>`;
//         } else {
//             authors = `<i class="fa-solid fa-square-pen"></i> <b>author</b>: ${obj.authors}<br>`;
//         }
//     } else {
//         authors = "";
//     }

//     let genre = obj.genre ? `<i class="fa-solid fa-tag"></i> <b>genre</b>: ${obj.genre}<br>` : "";
//     let points = obj.points ? `<i class="fa-solid fa-circle-plus"></i> <b>points</b>: ${obj.points}<br>` : "";
//     let files = obj.files ? `<i class="fa-solid fa-file"></i> <b>files</b>: ${conv.makeHtml(obj.files)}<br>` : "";

//     return `<div class="challenge">
//     ${title}
//     <div style="display:flex;" class="no-highlight">
//         <div class="challenge-info">
//             <div class="center-align">
//                 ${solverText}
//                 ${authors}
//                 ${genre}
//                 ${points}
//                 ${files}
//             </div>
//         </div>
//         <div class="challenge-description">
//             <div class="center-align" ${size}>
//                 ${description}
//                 ${hints}
//             </div>
//         </div>
//     </div>
// </div>`;
// }, {
//     async: true,
//     ends: true
// });

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
                    solverText += ` - <img style="display: inline-block; border-radius: 50%; width: 20px; margin-bottom: -6px;" src="${members[flagger]?.img}"> <a href="${members[flagger]?.url}">${members[flagger]?.name}</a> <i class="fa-solid fa-flag"></i><br>`;
                } else {
                    solverText += ` - <img style="display: inline-block; border-radius: 50%; width: 20px; margin-bottom: -6px;" src="${members[solver]?.img}"> <a href="${members[solver]?.url}">${members[solver]?.name}</a><br>`;
                }
            }
        } else {
            solverText = `<i class="fa-solid fa-user"></i> <b>solver</b>: <img style="display: inline-block; border-radius: 50%; width: 20px; margin-bottom: -6px;" src="${members[obj.solvers]?.img}"> <a href="${members[obj.solvers]?.url}">${members[obj.solvers]?.name}</a><br>`
        }
    }

    if (obj.authors) {
        if(Array.isArray(obj.authors)) {
            let arr = obj.authors.map(x => `<br> - ${x}`).join("");
            obj.authors = `<i class="fa-solid fa-square-pen"></i> <b>authors</b>: ${arr}<br>`;
        } else {
            obj.authors = `<i class="fa-solid fa-square-pen"></i> <b>author</b>: ${obj.authors}<br>`;
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
    let grid = yaml.load(content);
    let gridItems = [];
    for (const [key, value] of Object.entries(grid)) {
        let actions = [];
        let badge, badge2, badge3, image, border, background;
        if (Array.isArray(value.button.text)) {
            for (let i = 0; i < value.button.text.length; i++) {
                actions.push(`<a href="${value.button.link[i]}" class="action-button-primary">${value.button.text[i]}</a>`);
            }
        } else {
            actions.push(`<a href="${value.button.link}" class="action-button-primary">${value.button.text}</a>`);
        }
        actions = actions.join("");
        badge = value.badge ? `<span class="badge no-select ${value.badge.type}">${value.badge.text}</span>` : "";
        badge2 = value.badge2 ? `<span class="badge no-select ${value.badge2.type}">${value.badge2.text}` : "";
        badge3 = value.badge3 ? `<span class="badge no-select ${value.badge3.type}">${value.badge3.text}</span>` : "";
        image = value.image ? `<div class="cover-img"><img src="${value.image}" alt="${key}"></div>` : "";
        border = value.border ? `border: 2px solid #${value.border};` : "";
        background = value.background ? `background: ${value.background};` : "";

        gridItems.push(`<div class="card" style="${border}${background}">
        ${image}
        <div class="contents">
            <p class="title">${key}</p>
            <p class="description">${value.description}</p>
        </div>
        <div class="actions">
            <div class="left">
                ${badge}
                ${badge2}
                ${badge3}
            </div>
            <div class="right">
                ${actions}
            </div>
        </div>
        </div>`);
    } if(args == "columns:2") {
        return `<div class="container"><div class="card-grid-2">${gridItems.join("")}</div></div>`;
    } else {
        return `<div class="container"><div class="card-grid">${gridItems.join("")}</div></div>`;
    }
}, {
    ends: true,
    async: true
});