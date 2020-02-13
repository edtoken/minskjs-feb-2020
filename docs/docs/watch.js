const chokidar = require('chokidar');
const buildHTML = require('./build-index-html');

buildHTML();

const watchPath = [
    './ru/*.html',
    './pictures/*',
    './index.ru.tpl.html',
    './slides.json',
];

watchPath.forEach(itemPath => {
    chokidar.watch(itemPath).on('all', (event, path) => {
        console.log('watch', event, path);
        buildHTML();
    });
});
