/*
TODO: Needs Review and Spec
*/

var moment = require('moment');
var assign = require('object-assign');

module.exports = function (req, res) {
	var papaparse = require('papaparse');
	var keystone = req.keystone;

	var format = req.params.format.split('.')[1]; // json or csv
	var where = {};
	var filters = req.query.filters;
	if (filters && typeof filters === 'string') {
		try { filters = JSON.parse(req.query.filters); }
		catch (e) { /* */ }
	}
	if (typeof filters === 'object') {
		assign(where, req.list.addFiltersToQuery(filters));
	}
	if (req.query.search) {
		assign(where, req.list.addSearchToQuery(req.query.search));
	}
	var query = req.list.model.find(where);
	if (req.query.populate) {
		query.populate(req.query.populate);
	}
	if (req.query.expandRelationshipFields) {
		req.list.relationshipFields.forEach(function (i) {
			query.populate(i.path);
		});
	}
	var sort = req.list.expandSort(req.query.sort);
	query.sort(sort.string);
	query.exec(function (err, results) {
		var data;
		var fields = [];
		if (err) return res.apiError('database error', err);
		if (format === 'csv') {
			data = results.map(function (item) {
				var row = req.list.getCSVData(item, {
					expandRelationshipFields: req.query.expandRelationshipFields,
					fields: req.query.select,
					user: req.user,
				});

				Object.keys(row).forEach(function (i) {
					if (fields.indexOf(i) === -1) fields.push(i);
				});
				return row;
			});
			res.attachment(req.list.path + '-' + moment().format('YYYYMMDD-HHMMSS') + '.csv');
			res.setHeader('Content-Type', 'application/octet-stream');
			var content = papaparse.unparse({
				data: data,
				fields: fields,
			}, {
				delimiter: keystone.get('csv field delimiter') || ',',
			});
			// 解决用Excel打开乱码的问题
			var BOM = Buffer.from('\uFEFF');
			const bomCsv = Buffer.concat([BOM, Buffer.from(content)]);
			res.end(bomCsv, 'utf-8');
		} else {
			data = results.map(function (item) {
				return req.list.getData(item, req.query.select, req.query.expandRelationshipFields);
			});
			res.json(data);
		}
	});
};
