let showdown = require('showdown');
let hljs = require('highlight.js');

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
    const scrollableStyle = scrollable ? ` style="margin: 0;"` : "";
    const scrollableEnd = scrollable ? `</div>` : "";
    const wrappedStyle = wrapped ? ` style="white-space: pre-wrap;"` : "";
    const urlText = url ? `<a target="_blank" rel="noopener" href="https://${url}"><span style="color:#82C4E4">[${url_text}]</span></a>` : "";
    const langText = lang ? `<figure class="highlight ${lang}"${scrollableStyle}>`: `<figure class="highlight text"${scrollableStyle}>`
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
    return `<img src="https://s01.flagcounter.com/count2/8Xkk/bg_212326/txt_C9CACC/border_C9CACC/columns_3/maxflags_12/viewers_3/labels_0/pageviews_1/flags_1/percent_0/">`
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
