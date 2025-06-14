const utils = require('../helpers/utils')
module.exports.validator = (schema) => async (req, res, next) => {
    const OBJECT = Object.assign({});
    OBJECT.BODY = req.body;
    OBJECT.METHOD = req.method;
    OBJECT.PATH = req.originalUrl;
    OBJECT.PARAMS = req.params;
    OBJECT.QUERY = req.query;
    OBJECT.HEADERS = req.headers;
    OBJECT.DATE = new Date();
    const LINE = '----------------------------------------'
    require('fs').appendFileSync('requestLogs.txt', `${JSON.stringify(OBJECT)}\n${LINE}\n\n`);

    try {
        if (req.body.options && typeof req.body.options === 'string') req.body.options = JSON.parse(req.body.options)

        await schema.validate({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    } catch (err) {
        return res.status(400).send(utils.errorResponse(err?.message));
    }
};