const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

function sanitizeReq(dirty) {
    if (typeof dirty === 'string') {
        return DOMPurify.sanitize(dirty);
    } else if (typeof dirty === 'object') {
        const sanitizedObj = {};
        for (const key in dirty) {
            if (typeof dirty[key] === 'string') {
                sanitizedObj[key] = DOMPurify.sanitize(dirty[key]);
            } else {
                sanitizedObj[key] = dirty[key];
            }
        }
        return sanitizedObj;
    } else {
        return dirty;
    }
}

module.exports = { sanitizeReq }