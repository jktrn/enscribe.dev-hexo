let showdown = require('showdown');
let hljs = require('highlight.js');

showdown.extension('only-inline-stuff', function () {
    return [{
        type: 'output',
        filter: function (text) {
            text = text.replace(/<\/?p[^>]*>/g, '');
            text = text.replace(/<\/?code[^>]*>/g, '');
            return text;
        }
    }];
});

let conv = new showdown.Converter({
    extensions: ['only-inline-stuff']
});


hexo.extend.tag.register('box', function (args, content) {
    if (!args) return `<div class="box no-highlight">${conv.makeHtml(content)}</div>`;
    else return `<div class="box no-highlight" style="${args}">${conv.makeHtml(content)}</div>`;
}, {
    ends: true
});

hexo.extend.tag.register('info', function (args, content) {
    if (!args) return `<div class="text-info no-highlight">${conv.makeHtml(content)}</div>`;
    else return `<div class="text-info no-highlight" style="${args}">${conv.makeHtml(content)}</div>`;
}, {
    ends: true
});

hexo.extend.tag.register('warning', function (args, content) {
    if (!args) return `<div class="text-warning no-highlight">${conv.makeHtml(content)}</div>`;
    else return `<div class="text-warning no-highlight" style="${args}">${conv.makeHtml(content)}</div>`;
}, {
    ends: true
});

function parseRange(str) {
    let range = str.split(',');
    let result = [];
    for (let i = 0; i < range.length; i++) {
        let r = range[i].split('-');
        if (r.length == 1) {
            result.push(r[0]);
        } else {
            for (let j = parseInt(r[0]); j <= parseInt(r[1]); j++) {
                result.push(j);
            }
        }
    }
    return result;
}

hexo.extend.tag.register('customcodeblock', function (args, content) {
    let obj = {};
    args.forEach(function(item) {
        let key = item.split(':')[0];
        let value = item.split(':')[1];
        obj[key] = value;
    });

    let lang = obj.lang ? obj.lang : "text";
    let gutter1 = obj.gutter1 ? parseRange(obj.gutter1).map(x => `<span class="line">${x}</span><br>`).join("") : undefined;
    let gutter2 = obj.gutter2 ? parseRange(obj.gutter2).map(x => `<span class="line">${x}</span><br>`).join("") : undefined;
    let caption = obj.caption ? obj.caption : undefined;
    let wrap_text = obj.wrap_text ? obj.wrap_text : undefined;
    let diff_add = obj.diff_add ? parseRange(obj.diff_add).map(x => parseInt(x)) : undefined;
    let diff_del = obj.diff_del ? parseRange(obj.diff_del).map(x => parseInt(x)) : undefined;
    let highlighted = hljs.highlight(content, {
        language: lang
    }).value;
    let lines = highlighted.split('\n');

    // if any line in lines contains "SKIP_LINE", replace the entire line with "TEST"
    lines = lines.map(line => {
        if (line.indexOf("SKIP_LINE") != -1) {
            return `<div class="skip-highlight">(${line.match(/\((.*)\)/)[1]})</div>`;
        } else {
            return line;
        }
    });
    console.log(lines);

    // for each number in diffAdd array, wrap the corresponding line in lines with <div class="diff-highlight-add">
    if (diff_add && gutter2) {
        diff_add.forEach(function (line) {
            lines[line - 1] = `<div class="diff-highlight-add-590">${lines[line - 1]}</div>`;
        });
    } else if(diff_add) {
        diff_add.forEach(function (line) {
            lines[line - 1] = `<div class="diff-highlight-add">${lines[line - 1]}</div>`;
        });
    }

    // for each number in diffDel array, wrap the corresponding line in lines with <div class="diff-highlight-add">
    if (diff_del && gutter2) {
        diff_del.forEach(function (line) {
            lines[line - 1] = `<div class="diff-highlight-del-590">${lines[line - 1]}</div>`;
        });
    } else if(diff_del) {
        diff_del.forEach(function (line) {
            lines[line - 1] = `<div class="diff-highlight-del">${lines[line - 1]}</div>`;
        });
    }

    highlighted = lines.join('\n');

    const langText = lang ? `<figure class="highlight ${lang}">`: `<figure class="highlight text">`
    const captionText = caption ? `<figcaption><span>${caption}</span></figcaption>` : "";
    const gutter1Text = gutter1 ? `<td class="gutter"><pre>${gutter1}</pre></td>`: "";
    const gutter2Text = gutter2 ? `<td class="gutter"><pre>${gutter2}</pre></td>`: "";
    return `${langText}<table>${captionText}<tr>${gutter1Text}${gutter2Text}<td class="code"><pre>${highlighted}</pre></td></tr></table></figure>`;
}, {
    ends: true
});