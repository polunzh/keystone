import DateInput from '../../components/DateInput';
import Field from '../Field';
import moment from 'moment';
import React from 'react';
import {
	Button,
	FormInput,
	InlineGroup as Group,
	InlineGroupSection as Section,
} from '../../../admin/client/App/elemental';

/*
TODO: Implement yearRange Prop, or deprecate for max / min values (better)
*/

const DEFAULT_INPUT_FORMAT = 'YYYY-MM-DD';
const DEFAULT_FORMAT_STRING = 'Do MMM YYYY';

module.exports = Field.create({
	displayName: 'DateField',
	statics: {
		type: 'Date',
	},
	propTypes: {
		formatString: React.PropTypes.string,
		inputFormat: React.PropTypes.string,
		label: React.PropTypes.string,
		note: React.PropTypes.string,
		onChange: React.PropTypes.func,
		path: React.PropTypes.string,
		value: React.PropTypes.string,
	},

	getDefaultProps () {
		return {
			formatString: DEFAULT_FORMAT_STRING,
			inputFormat: DEFAULT_INPUT_FORMAT,
		};
	},
	valueChanged ({ value }) {
		this.props.onChange({
			path: this.props.path,
			value: value,
		});
	},
	moment (value) {
		var m = moment(value);
		if (this.props.isUTC) m.utc();
		return m;
	},
	isValid (value) {
		return this.moment(value, this.inputFormat).isValid();
	},
	format (value) {
		return value ? this.moment(value).format(this.props.formatString) : '';
	},
	setToday () {
		this.valueChanged({
			value: this.moment(new Date()).format(this.props.inputFormat),
		});
	},
	renderValue () {
		return (
			<FormInput noedit>
				{this.format(this.props.value)}
			</FormInput>
		);
	},
	renderField () {
		let value = this.moment(this.props.value);
		value = this.props.value && value.isValid()
			? value.format(this.props.inputFormat)
			: this.props.value;
		return (
			<Group>
				<Section grow>
					<DateInput
						format={this.props.inputFormat}
						name={this.getInputName(this.props.path)}
						onChange={this.valueChanged}
						ref="dateInput"
						value={value}
					/>
				</Section>
				{!this.props.hideChooseDateBtn &&
				<Section>
					<Button onClick={this.setToday}>Today</Button>
				</Section>
				}
			</Group>
		);
	},

});
