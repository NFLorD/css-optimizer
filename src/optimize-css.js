const CSSselect = require("css-select");

function iterateRules(documents, rules) {
    for (const i in rules) {
        const obj = rules[i];
        if (obj.type === 'rule') {
            if (!isApplied(documents, obj)) {
                delete rules[i];
            }
        } else if (obj.type === 'media') {
            iterateRules(documents, obj.rules);
        }
    }
}

function isApplied(documents, rule) {
    const pseudoElementsRegexes = [
        /:?:after/g,
        /:?:backdrop/g,
        /:?:before/g,
        /:?:cue/g,
        /:?:first-letter/g,
        /:?:first-line/g,
        /:?:grammar-error/g,
        /:?:marker/g,
        /:?:part/g,
        /:?:placeholder/g,
        /:?:selection/g,
        /:?:slotted\([^)]*\)/g,
        /:?:spelling-error/g,
        /:?:focus/g,
        /:?:-webkit-search-cancel-button/g,
        /:?:-webkit-search-decoration/g,
        /:?:-webkit-outer-spin-button/g,
        /:?:-webkit-inner-spin-button/g,
        /:?:-webkit-input-placeholder/g,
        /:?:-webkit-scrollbar-track/g,
        /:?:-webkit-scrollbar-thumb/g,
        /:?:-webkit-scrollbar/g,
        /:?:-webkit-full-screen/g,
        /:?:-webkit-media-text-track-display/g,
        /:?:-moz-placeholder/g,
        /:?:-moz-focus-inner/g,
        /:?:-moz-full-screen/g,
        /:?:-ms-input-placeholder/g,
        /:?:window-inactive/g,
    ];

    for (const i in rule.selectors) {
        const selector = pseudoElementsRegexes.reduce(function (selector, regex) {
            return selector.replace(regex, '');
        }, rule.selectors[i])
        // deleting pseudo-element selector part

        for (const document of documents) {
            try {
                if (CSSselect.selectOne(selector, document) !== null) {
                    return true;
                }
            } catch (err) {
                console.log(rule.selectors[i], "\n" + selector);
            }
        }
    }

    return false;
}

module.exports.iterateRules = iterateRules;

module.exports.filterRules = function (rules) {
    return rules.filter(function (rule) {
        if (rule !== null) {
            switch (rule.type) {
                case 'media':
                    rule.rules = rule.rules.filter(function (_rule) {
                        return _rule !== null;
                    });
                    return rule.rules.length > 0;
                case 'comment':
                    return false;
            }

            return true;
        }
        return false;
    })
};