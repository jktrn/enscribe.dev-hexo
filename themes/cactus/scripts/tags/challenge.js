'use strict';

const yaml = require('js-yaml');
const { htmlTag } = require('hexo-util');
const showdown = require('showdown');

showdown.extension('only-inline-stuff', () => {
    return [{
        type: 'output',
        filter: text => {
            text = text.replace(/<\/?p[^>]*>/g, '');
            return text;
        }
    }];
});

const conv = new showdown.Converter({
    extensions: ['only-inline-stuff']
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

    parsedArgs.size     &&= {style: `font-size: ${parsedArgs.size}`};
    parsedArgs.genre    &&= `${htmlTag("i", {class: "fa-solid fa-tag"}, "", false)} ${htmlTag("b", {}, "genre", false)}: ${parsedArgs.genre + htmlTag("br")}`;
    parsedArgs.points   &&= `${htmlTag("i", {class: "fa-solid fa-circle-plus"}, "", false)} ${htmlTag("b", {}, "points", false)}: ${parsedArgs.points + htmlTag("br")}`;
    parsedArgs.files    &&= `${htmlTag("i", {class: "fa-solid fa-file"}, "", false)} ${htmlTag("b", {}, "files", false)}: ${conv.makeHtml(parsedArgs.files) + htmlTag("br")}`;
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