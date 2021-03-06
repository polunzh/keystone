/*
TODO: Needs Review and Spec
*/

var async = require('async');

module.exports = function (req, res) {
	var keystone = req.keystone;
	if (!keystone.security.csrf.validate(req)) {
		return res.apiError(403, 'invalid csrf');
	}
	// var updateCount = 0;
	async.map(req.body.items, function (data, done) {
		req.list.model.findById(data.id, function (err, item) {
			if (err) {
				return res.apiError(500, 'database error', err);
			}
			if (!item) {
				return res.apiError(404, 'not found', req.params.id);
			}
			req.list.updateItem(item, data, { files: req.files, user: req.user }, function (err) {
				if (err) {
					err.id = data.id;
					// validation errors send http 400; everything else sends http 500
					err.statusCode = err.error === 'validation errors' ? 400 : 500;
					return done(err);
				}
				// updateCount++;
				done(null, req.query.returnData ? req.list.getData(item) : item.id);
			});
		});
	}, function (err, results) {
		if (err) {
			return res.apiError(err.statusCode, err.error, err.id);
		}
		res.json({
			success: true,
			items: results,
		});
	});
};
