// CONFIG
const DOMAIN = 'localhost';
const DIR = process.cwd();
const PAGES_DIR = DIR + '/pages';
const BASE_CSS_DIR = DIR + '/css';
const OPTIMIZED_CSS_DIR = DIR + '/optimized';

const OUTPUT_DIR = OPTIMIZED_CSS_DIR + '/global';
const PAGES = [
    'homepage',
    'product',
    'category',
    'brand'
];
// CONFIG

// REQUIRES
const fs = require('fs');
const CSSParser = require('css');
const fetch = require('sync-fetch');
const matchAll = require("match-all");
const htmlparser2 = require("htmlparser2");
const optimizeCss = require('./src/optimize-css.js');
const isFileSync = require('./src/is-file-sync.js');
const writeFileRecursiveSync = require('./src/write-file-recursive-sync.js');
// REQUIRES

const documents = [];
const stylesheets = {};

for (const name of PAGES) {
    const source = fs.readFileSync(PAGES_DIR + '/' + name + '.html');
    const stylesheetLinks = matchAll(source, /<link[^>]*href="([^"]+\.css)"[^>]*>/g).toArray();

    for (const link of stylesheetLinks) {
        if (typeof stylesheets[link] === 'undefined') {
            const path = BASE_CSS_DIR + link;

            if (!isFileSync(path)) {
                let file = '';
                try {
                    file = fetch(DOMAIN + link).text();
                } catch (err) {}
                writeFileRecursiveSync(path, file);
            }

            stylesheets[link] = fs.readFileSync(path, { encoding: 'utf8' });
        }
    }

    documents.push(htmlparser2.parseDocument(source));
}

for (const link in stylesheets) {
    const stylesheet = stylesheets[link];

    if (stylesheet.length === 0) {
        console.log('File ' + link + ' wasn\'t found or is empty. Continuing...');
        continue;
    }
            
    const options = { silent: true, compress: false };
    const css = CSSParser.parse(stylesheet, options);

    const rules = css.stylesheet.rules;
    optimizeCss.iterateRules(documents, rules);
    css.stylesheet.rules = optimizeCss.filterRules(rules);
     
    writeFileRecursiveSync(OUTPUT_DIR + link, CSSParser.stringify(css, options)
        .replace(/\.\.\//g, '../../')); // Optimized files are meant to be put in a subdirectory for our use-case.
}