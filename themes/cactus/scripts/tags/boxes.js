'use strict';

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

hexo.extend.tag.register('box', (args, content) => {
    const parsedArgs = parseArgs(args);
    return htmlTag("div", {class: "box", ...parsedArgs}, conv.makeHtml(content), false);
}, {
    ends: true,
    async: true
});

hexo.extend.tag.register('info', (args, content) => {
    const parsedArgs = parseArgs(args);
    const parsedContent = `${htmlTag("i", {class: "fa-solid fa-circle-info"}, "")} ${conv.makeHtml(content)}`
    return htmlTag("div", {class: "text-info no-highlight", ...parsedArgs}, parsedContent, false);
}, {
    ends: true,
    async: true
});

hexo.extend.tag.register('warning', (args, content) => {
    const parsedArgs = parseArgs(args);
    const parsedContent = `${htmlTag("i", {class: "fa-solid fa-triangle-exclamation"}, "")} ${conv.makeHtml(content)}`
    return htmlTag("div", {class: "text-warning no-highlight", ...parsedArgs}, parsedContent, false);
}, {
    ends: true,
    async: true
});

hexo.extend.tag.register('definition', (args, content) => {
    const parsedArgs = parseArgs(args);
    const parsedContent = `${htmlTag("i", {class: "fa-solid fa-book"}, "")} ${conv.makeHtml(content)}`
    return htmlTag("div", {class: "text-definition no-highlight", ...parsedArgs}, parsedContent, false);
}, {
    ends: true,
    async: true
});

hexo.extend.tag.register('theorem', (args, content) => {
    const parsedArgs = parseArgs(args);
    const parsedContent = `${htmlTag("i", {class: "fa-solid fa-square-check"}, "")} ${conv.makeHtml(content)}`
    return htmlTag("div", {class: "text-theorem no-highlight", ...parsedArgs}, parsedContent, false);
}, {
    ends: true,
    async: true
});

hexo.extend.tag.register('flag', (args, content) => {
    const parsedArgs = parseArgs(args);
    const parsedContent = `${htmlTag("i", {class: "fa-solid fa-flag"}, "")} ${conv.makeHtml(content)}`
    return htmlTag("div", {class: "text-flag no-highlight", ...parsedArgs}, parsedContent, false);
}, {
    ends: true,
    async: true
});

function parseArgs(arr) {
    let result = {};
    for(const i of arr) {
        let [key, ...value] = i.split(":");
        result[key] = value.join(":");
    }
    return result;
}