function validateRow(index) {
	if (index < 0 || index > this.keyboard.length-1) {
		return Math.abs(index % this.keyboard.length);
	}
	return index;
}

class ReplyMarkup {
	constructor() {
		this.keyboard = [];
	}

	/**
	 * Returns a reply_markup object
	 *
	 * @function export
	 * @memberof ReplyMarkup
	 * @params {Any} override - a value to be replaced to the keyboard content
	 * @returns {Object} - reply_markup
	 * @see https://core.telegram.org/bots/api#sendmessage
	 */

	export(override) {
		return {
			reply_markup: Object.assign({
				[this.type]: override || this.keyboard,
			})
		};
	}

	/**
	 * Returns an object containing the property with the content or the content itself,
	 * depending on its argument.
	 *
	 * @function extract
	 * @memberof ReplyMarkup
	 * @params {!string} level - the deep of extraction of the values
	 * @returns {<Object|Object[][]>} - Object containing the keyboard content or the keyboard content itself
	 * @see https://core.telegram.org/bots/api#inlinekeyboardmarkup
	 */

	extract(from) {
		if (!from["reply_markup"]) {
			console.error("'reply_markup' not found as property of Object 'from'.");
		}

		return ("reply_markup" in from) ? from["reply_markup"][this.type] : {};
	}
}

/**
 * Basic class for every inline keyboard
 *
 * @class InlineKeyboard
 * @classdesc main class containing inline keyboards creation
 * @params {Object} oneElement - one Telegram Inline Keyboard button to insert in the first line
 * @see https://core.telegram.org/bots/api#inlinekeyboardbutton
 */

class InlineKeyboard extends ReplyMarkup {

	constructor(oneElement) {
		super();
		if (oneElement && typeof oneElement === "object" && "text" in oneElement) {
			this.keyboard.push([oneElement]);
		}

		this.type = "inline_keyboard";
	}


	/**
	 * Adds a new row to the keyboard. Accepts all the keys to be pushed in that row.
	 *
	 * @member addRow
	 * @param {...Object} keys - Telegram's Inline Keyboard buttons
	 * @see https://core.telegram.org/bots/api#inlinekeyboardbutton
	 * @returns {Object} - new object with InlineKeyboard as prototype to allow methods concatenation and get this row length
	 */

	addRow(...keys) {
		this.keyboard.push([]);
		keys.forEach((key, index) => {
			if ("text" in key) {
				this.keyboard[this.keyboard.length-1].push(key);
			}
		});
		return Object.create(this, {
			length: {
				configurable: false,
				get: function() { return this.keyboard.length }
			}
		});
	}

	/**
	 * Pushes a new button to a specific row.
	 *
	 * @member push
	 * @param {number} rowIndex - row into which the button will be added; Starts from the last if negative.
	 * @param {Object} element - element to be added
	 * @returns {Object} - InlineKeyboard
	 */

	push(rowIndex, element) {
		let index = validateRow.call(this, rowIndex);

		if (Array.isArray(element)) {
			throw TypeError("Misusage: cannot add an array of elements to the keyboard.")
		}

		this.keyboard[index].push(element);
		return this;
	}

	/**
	 * Removes a row from the keyboard
	 *
	 * @member removeRow
	 * @param {number} rowIndex - index of the row to be removed (starts from begin if higher than keys quantity)
	 * @returns {Object} - new object with InlineKeyboard as prototype to allow methods concatenation and the length of this row
	 */

	removeRow(rowIndex) {
		let index = validateRow.call(this, rowIndex);

		this.keyboard.splice(index, 1);
		return Object.create(this, {
			length: {
				configurable: false,
				get: function() { return this.keyboard.length }
			}
		});
	}

	/**
	 * Removes row content
	 *
	 * @member emptyRow
	 * @param {number} rowIndex - index of the row to be emptied
	 * @returns {Object} - InlineKeyboard
	 */

	emptyRow(rowIndex) {
		let index = validateRow.call(this, rowIndex);

		this.keyboard[index] = [];
		return this;
	}

	/**
	 * Pops out the last row
	 *
	 * @member popRow
	 * @returns {Object} - new object with InlineKeyboard as prototype to allow methods concatenation and the length of this row
	 */

	popRow() {
		this.keyboard.pop();
		return Object.create(this, {
			length: {
				configurable: false,
				get: function() { return this.keyboard.length }
			}
		});
	}

	/**
	 * Removes last element of a row
	 *
	 * @member pop
	 * @param {number} rowIndex - index of the target row (starts from begin if higher than keys quantity)
	 * @returns {Object} - InlineKeyboard
	 */

	pop(rowIndex) {
		if (rowIndex > this.keyboard.length-1) {
			rowIndex = rowIndex % this.keyboard.length;
		}

		this.keyboard[rowIndex].pop();
		return this;
	}

	/**
	 * Retrieves a row length
	 *
	 * @member rowLength
	 * @param {number} rowIndex - index of the target row (starts from the end of keyboard if lower than 0)
	 * @returns {number} - target row's length
	 */

	rowLength(rowIndex) {
		if (rowIndex < 0) {
			rowIndex = this.keyboard.length + rowIndex;
		}
		return this.keyboard[rowIndex].length;
	}

	get length() {
		return this.keyboard.length;
	}
}

/**
 * Basic class for every Reply Keyboard
 *
 * @class Keyboard
 * @classdesc main class containing reply keyboards creation
 */

class ReplyKeyboard extends ReplyMarkup {
	constructor(...keys) {
		super();
		this.keys = [];
		if (keys && keys.length) {
			this.addRow(keys);
		}
	}

	/**
	 * Adds values in parameters as new keys of the keyboard
	 *
	 * @member addRow
	 * @param {...Object} keys - Telegram Keys texts
	 * @returns {Object} - The class (for concatenation)
	 */

	addRow(...keys) {
		this.keyboard.push([]);
		keys.forEach((key) => {
			this.keyboard[this.keyboard.length-1].push(key);
			this.keys.push(key);
		});

		return Object.create(this, {
			length: {
				configurable: false,
				get: function() { return this.keyboard.length }
			}
		});
	}

	/**
	 * Creates a new reply keyboard
	 *
	 * @member open
	 * @returns {Object} - reply markup object
	 * @see https://core.telegram.org/bots/api#replykeyboardmarkup
	 */

	open() {
		this.type = "keyboard";
		return Object.assign(this.export(), { resize_keyboard: true });
	}

	/**
	 * Closes the opened reply keyboard
	 *
	 * @member close
	 * @returns {Object} - reply markup object
	 * @see https://core.telegram.org/bots/api#replykeyboardremove
	 */

	close() {
		this.type = "remove_keyboard";
		return this.export(true);
	}

	get getKeys() {
		return this.keys;
	}
}

module.exports = {
	InlineKeyboard,
	ReplyKeyboard
};
