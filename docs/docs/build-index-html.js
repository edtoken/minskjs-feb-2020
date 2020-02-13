const fs = require('fs');
const path = require('path');

const lang = 'ru';

const marks = {
    start: '<!-- SLIDES START -->',
    end: '<!-- SLIDES END -->',
};

const isDev = process.argv.find(arg => arg.includes('watch.js'));

module.exports = function () {

    const files = fs.readdirSync(path.resolve(__dirname, './ru')).filter(name => /\.html$/.test(name));
    const slidesOrder = JSON.parse(fs.readFileSync(path.resolve(__dirname, './slides.json'), 'utf8'));

    const unused = files.filter(name => {
        return !slidesOrder.includes(name.replace('.html', ''));
    });

    if(unused.length){
        console.log('unused', unused.length, unused);
    }

    const template = fs.readFileSync(path.resolve(__dirname, `./index.${lang}.tpl.html`), 'utf8');

    const [before, after] = [
        template.substr(0, template.indexOf(marks.start) + marks.start.length),
        template.substr(template.indexOf(marks.start) + marks.start.length, template.length),
    ];

    const chunks = slidesOrder.map(
        name => [name, fs.readFileSync(path.resolve(__dirname, `./${lang}/${name}.html`), 'utf8')],
    ).reduce((memo, [name, source]) => {

        const firstTagClose = source.indexOf('>');

        const content = [
            source.substr(0, firstTagClose + 1),
            isDev ? `<span class="slide-debug-name">${name}</span>` : '',
            source.substr(firstTagClose + 1, source.length),
        ].join('\r\n');

        memo += '\r\n';
        memo += `<!-- START SLIDE ${name} -->`;
        memo += '\r\n';
        memo += content;
        memo += '\r\n';
        memo += `<!-- END SLIDE ${name} -->`;
        memo += '\r\n';
        return memo;
    }, '');

    const output = [
        before,
        chunks,
        after,
    ].reduce((memo, chunk) => {
        memo += '\r\n';
        memo += chunk;
        memo += '\r\n';
        return memo;
    }, '');

    fs.writeFileSync(path.resolve(__dirname, './index.html'), output, 'utf8');
};
