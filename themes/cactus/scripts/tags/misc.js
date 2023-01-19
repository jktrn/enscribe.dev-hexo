'use strict';

const showdown = require('showdown');
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

function parseArgs(arr) {
    let result = {};
    for(const i of arr) {
        let [key, ...value] = i.split(":");
        result[key] = value.join(":");
    }
    return result;
}
