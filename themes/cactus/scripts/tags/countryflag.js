'use strict';

const { htmlTag } = require('hexo-util');
const countryCodes = require("i18n-iso-countries");

hexo.extend.tag.register('countryflag', function (args) {
    const countryCode = getCountryCode(args[0]);
    return htmlTag('img', {
        src: `https://flagcdn.com/24x18/${countryCode}.png`,
        class: "inline-image" 
    });
}, {
    async: true
});

function getCountryCode(countryName) {
    if(countryName.length == 2) return countryName.toLowerCase();
    const countryCode = countryCodes.getAlpha2Code(countryName, "en")?.toLowerCase();
    return countryCode;
}