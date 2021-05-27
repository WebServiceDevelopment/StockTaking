/**

 MIT License
 Copyright 2020 Web Service Development Inc.

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.

 Author: Ogawa Kousei (kogawa@wsd.co.jp)

**/

"use strict";

const DEBUG_PRINT_3 = 0;
const DEBUG_PRINT_4 = 0;

/*
 * Table object.
 */
const Stock = new function () {
	this.prefix = '_';
	this.getTpage = () => _core.getTpage2();

	this.id = 0;
	this.getId = () => this.id;

	this.add = () => ++this.id;
	this.minus = () => --this.id;

	this.addRow = () => this.addRowLine(1);
	this.addRow4 = () => this.addRowLine(4);
	this.addRow5 = () => this.addRowLine(5);
	this.addRow15 = () => this.addRowLine(15);
	this.addRowLine = _addRowLine.bind(this);

	this.minusRow = () => this.minusRowLine();
	this.minusRowLine = _minusRowLine.bind(this);

	this.copy_paste = _copy_paste.bind(this);
	this.deleteRow = _deleteRow.bind(this);

	this.addOption = _addOption;

	this.place_names = null;
	this.setPlaceNames = (place_names) => this.place_names = place_names;
	this.getPlaceNames = () => this.place_names;

	this.assets_names = null;
	this.setAssetsNames = (assets_names) => this.assets_names = assets_names;
	this.getAssetsNames = () => this.assets_names;

	this.assets_names = null;
	this.getAssetsNames = (assets_names) => this.assets_names = assets_names;
	this.getAssetsNames = () => this.assets_names;

	this.variety_names = null;
	this.setVarietyNames = (variety_names) => this.variety_names = variety_names;
	this.getVarietyNames = () => this.variety_names;

	/*
	 *	this.product_names	= null;
	 *	this.setProductNames	= (product_names) => this.product_names = product_names;
	 *	this.getProductNames	= () => this.product_names ;
	 */

	this.stock_names = null;
	this.setStockNames = (stock_names) => this.stock_names = stock_names;
	this.getStockNames = () => this.stock_names;

	this.unit_names = null;
	this.setUnitNames = (unit_names) => this.unit_names = unit_names;
	this.getUnitNames = () => this.unit_names;

	this.old_time = null;
	this.setOldTime = (time) => this.old_time = time;
	this.getOldTime = () => this.old_time;

	this.add_counter = 0;
	this.setAddCounter = (add_counter) => this.add_counter = add_counter;
	this.getAddCounter = () => this.add_counter;

	this.addButtonEnabled = _addButtonEnabled.bind(this);
	this.addButtonDisabled = _addButtonDisabled.bind(this);

	this.getSelectedOptionNumber = _getSelectedOptionNumber.bind(this);
	this.setSelectedOptionNumber = _setSelectedOptionNumber.bind(this);

	this.getSelectedOptionValue = _getSelectedOptionValue.bind(this);

	this.getInputValue = _getInputValue.bind(this);
	this.setInputValue = _setInputValue.bind(this);


	this.c_row_method_value = null;
	this.setC_row_method_value = (value) => this.c_row_method_value = value;
	this.getC_row_method_value = () => this.c_row_method_value;

	this.d_row_method_value = null;
	this.setD_row_method_value = (value) => this.d_row_method_value = value;
	this.getD_row_method_value = () => this.d_row_method_value;

	/*
	 *	this.c_row_start	= _c_row_start.bind(this);
	 *	this.c_row_method	= _c_row_method.bind(this);
	 */
	this.d_row_start = _d_row_start.bind(this);
	this.d_row_method = _d_row_method.bind(this);

	this.getSelectElement = _getSelectElement;
	this.getInputElement = _getInputElement;

	this.row_lock_unlock = _row_lock_unlock;
	this.getLocked = _getLocked;
	this.setLocked = _setLocked;

	this.setUnlocked = _setUnlocked;
	this.setLockedUnlocked = _setLockedUnlocked.bind(this);

	this.getTdElement = _getTdElement;

	this.resetColumnNameWithNextProcess = _resetColumnNameWithNextProcess.bind(this);

	this.getFColumnString = _getFColumnString;
	this.getHColumnString = _getHColumnString;

	this.getList = _getList.bind(this);

	this.next_process_all = null;
	this.setNextProcessAll = (next_process_all) => this.next_process_all = next_process_all;
	this.getNextProcessAll = () => this.next_process_all;

	this.next_process = null;
	this.setNextProcess = (next_process) => this.next_process = next_process;
	this.getNextProcess = () => this.next_process;

	this.names_next_process = null;
	this.setNamesNextProcess = (names_next_process) => this.names_next_process = names_next_process;
	this.getNamesNextProcess = () => this.names_next_process;

	this.addSelectElement = _addSelectElement.bind(this);
	this.addTdElement = _addTdElement.bind(this);
	this.addInputElement = _addInputElement.bind(this);

	return this;

	function _getFColumnString() {

		let names = this.getNamesNextProcess();
		if (names != null && names.length > F_COLUMN_NUMBER) {
			return names[F_COLUMN_NUMBER] + TENKEY_AFTER_STRING;
		}
	}

	function _getHColumnString() {


		let names = this.getNamesNextProcess();
		if (names != null && names.length > H_COLUMN_NUMBER) {
			return names[H_COLUMN_NUMBER].replace('\n', '') + TENKEY_AFTER_STRING;
		}
	}

	function _resetColumnNameWithNextProcess() {

		let p = this.prefix;
		let class_name = p + 'd';
		let cell = document.getElementById(`${class_name}_column`);
		let d_column_name;

		if (this.getNextProcess() == null) {
			return;
		}

		let names = this.getNamesNextProcess();
		if (names != null && names.length > 3) {
			cell.innerText = names[3];
		}
	}


	function _getSelectedOptionValue(class_name, j) {
		let objId = class_name + "_" + j + '_select';

		let obj = document.getElementById(objId);
		console.log("1 objId=" + objId);
		if (obj.selectedIndex == -1) {
			if (DEBUG_PRINT_3) {
				console.log("Error class name = " + class_name + "_" + j + '_select' + "obj.selectedIndex=" + obj.selectedIndex + ":obj.options.length=" + obj.options.length);
			}
			return false;
		}
		return obj.options[obj.selectedIndex].value;;
	}

	function _getSelectedOptionNumber(class_name, j) {
		let objId = class_name + "_" + j + '_select';

		let obj = document.getElementById(objId);
		//console.log("2 objId="+objId);
		let value = null;
		let options = obj.options;

		for (let i = 0, l = options.length; l > i; i++) {

			if (options[i].selected == true) {
				value = i;
				break;
			}
		}
		return value;
	}

	function _setSelectedOptionNumber(class_name, j, num) {
		let objId = class_name + "_" + j + '_select';

		let obj = document.getElementById(objId);
		//console.log("3 objId="+objId);
		let options = obj.options;

		for (let i = 0, l = options.length; l > i; i++) {

			if (options[i].selected) {

				options[i].selected = false;
				break;
			}
		}
		if (options.length <= num) return;
		if (num == null) return;
		if (DEBUG_PRINT_3) {
			console.log("j=" + j + ";options.length=" + options.length + ":num=" + num);
		}
		options[num].selected = true;
	}

	function _getInputValue(class_name, j) {
		let objId = class_name + "_" + j + '_input';

		let obj = document.getElementById(objId);
		//console.log("4 objId="+objId);
		let value = obj.value;
		return value;
	}

	function _setInputValue(class_name, j, value) {
		let objId = class_name + "_" + j + '_input';

		let obj = document.getElementById(objId);
		//console.log("5 objId="+objId);
		obj.value = value;
	}

	/*
	 * Delete one last line.
	 */
	function _minusRowLine() {

		//let tpage = _core.getTpage();
		let tpage = this.getTpage();
		//document.getElementById(DOT_COUNT_1).textContent = this.minus();
		_core.getDotCount1().textContent = this.minus();

		let j = this.getId();

		tpage.removeChild(tpage.lastChild);

		for (let i = 0; i < tpage.children.length; i++) {
			tpage.children[i].classList.remove('last');
		}
		tpage.children[tpage.children.length - 1].classList.add('last');

		//
		// Enable disabled to delete one line.
		//

		if (j <= DEFAULT_MIN_ROWS) {
			if (_core.getMinBtn2().disabled == false) {
				_core.getMinBtn2().disabled = true;
			}
		}
	};

	/*
	 * Delete one line other than the last line.
	 * The argument _J is the line to delete.
	 */
	function _deleteRow(_j) {
		let p = this.prefix;

		let j = parseInt(_j);
		if (j < 0) {
			return;
		}
		let max = this.getId();
		let b, c, d, e, f, g, h, i;

		//
		// Copy the contents of a line to the previous line.
		//

		let k;
		let material, value;
		for (k = j; k < max; k++) {

			b = this.getSelectedOptionNumber(p + 'b', k + 1);
			this.setSelectedOptionNumber(p + 'b', k, b);

			c = this.getSelectedOptionNumber(p + 'c', k + 1);
			this.setSelectedOptionNumber(p + 'c', k, c);


			d = this.getSelectedOptionNumber(p + 'd', k + 1);
			this.setSelectedOptionNumber(p + 'd', k, d);

			e = this.getSelectedOptionNumber(p + 'e', k + 1);
			this.setSelectedOptionNumber(p + 'e', k, e);


			f = this.getInputValue(p + 'f', k + 1);
			this.setInputValue(p + 'f', k, f);

			g = this.getSelectedOptionNumber(p + 'g', k + 1);
			this.setSelectedOptionNumber(p + 'g', k, g);

			h = this.getInputValue(p + 'h', k + 1);
			this.setInputValue(p + 'h', k, h);

			i = this.getInputValue(p + 'i', k + 1);
			this.setInputValue(p + 'i', k, i);

			//
			//  Reflection of Lock.
			//

			let inp = this.getInputElement(p + 'i', k);
			let l = this.getLocked(k + 1);
			if (l == true) {
				this.setLocked(inp, l, k);
			} else {
				this.setUnlocked(inp, l, k);
			}

			//
			//  Reflection of Lock.
			//

			inp = this.getInputElement(p + 'i', k);
			l = this.getLocked(k + 1);
			if (b != 0 || c != 0 || d != null || e != null ||
				(f != "" && f != null) || g != 0 ||
				(h != "" && h != null) ||
				(i != "" && i != null)) {
				if (l == true) {

					this.setLocked(inp, l, k);
				} else {

					this.setUnlocked(inp, l, k);
				}
			} else {

				this.setUnlocked(inp, l, k);
			}
			//console.log("k="+k+":b="+b +":"+c+":"+d+":"+e+":"+f+":"+g+":"+h+":"+i);

		}

		//
		// Delete rows if greater than DEFAULT_MIN_ROWS.
		//
		// Fill the rows with spaces if less than or equal to 
		// DEFAULT_MIN_ROWS.
		//

		if (j > DEFAULT_MIN_ROWS) {
			this.minusRow();
		} else {
			let s = 0;

			this.setSelectedOptionNumber(p + 'b', k, s);

			this.setSelectedOptionNumber(p + 'c', k, s);

			this.setSelectedOptionNumber(p + 'd', k, s);

			this.setSelectedOptionNumber(p + 'e', k, s);

			this.setInputValue(p + 'f', k, "");

			this.setSelectedOptionNumber(p + 'g', k, s);

			this.setInputValue(p + 'h', k, "");

			this.setInputValue(p + 'i', k, "");

			//console.log("here 1 k="+k);
			let inp = this.getInputElement(p + 'i', k);
			let l = false;
			this.setUnlocked(inp, l, k);
		}

		return;

		function deleteOption(className, j) {

			let id_name = className + '_' + j + '_select';
			let cell = document.getElementById(id_name);

			let i;
			let opt;
			if (cell == null) {
				return;
			}

			let l = cell.options.length;

			try {
				for (i = l - 1; i >= 0; i--) {
					cell.remove(i);
				}
			} catch (e) {
				alert(i + ":" + e);
			}
		}

		function addOption(cell, material) {
			if (material == null) {
				return;
			}

			let opt;
			for (let i = 0; i < material.length; i++) {

				opt = document.createElement("option");
				opt.value = material[i];
				opt.text = material[i];
				cell.add(opt);

			}
		}

	}

	/*
	 * Copy the contents of the line to the next line except the last line.
	 * The last line does not copy the line.
	 * In the last line, add an empty line.
	 * At the time of operation, the line next to the last line does not yet exist.
	 */

	function _copy_paste(_j) {
		let p = this.prefix;

		let j = parseInt(_j);
		if (j < 0) {
			return;
		}

		let k, l, inp;
		let max = this.getId();
		let value;
		let b, c, d, e, f, g, h, i;

		//
		// Other than the last line.
		//

		if (j < max) {

			this.setOldTime(null);

			if (max <= DEFAULT_MIN_ROWS) {
				k = DEFAULT_MIN_ROWS;
				//k = max;

				b = this.getSelectedOptionNumber(p + 'b', k);

				c = this.getSelectedOptionNumber(p + 'c', k);

				d = this.getSelectedOptionNumber(p + 'd', k);

				e = this.getSelectedOptionNumber(p + 'e', k);

				f = this.getInputValue(p + 'f', k);

				g = this.getSelectedOptionNumber(p + 'g', k);

				h = this.getInputValue(p + 'h', k);

				i = this.getInputValue(p + 'i', k);

				if (b != 0 || c != 0 || d != null ||
					(e != null && e != 0) ||
					(f != "" && f != null) || g != 0 ||
					(h != "" && h != null) ||
					(i != "" && i != null)) {
					//console.log("1:"+b+":"+c+":"+d+":"+e+":"+f+":"+g+":"+h+":"+h+":"+i);

					this.addRow();
					this.setAddCounter(1);
				} else {
					this.setAddCounter(0);
				}
			} else {
				k = max;

				b = this.getSelectedOptionNumber(p + 'b', k);

				c = this.getSelectedOptionNumber(p + 'c', k);

				d = this.getSelectedOptionNumber(p + 'd', k);

				e = this.getSelectedOptionNumber(p + 'e', k);

				f = this.getInputValue(p + 'f', k);

				g = this.getSelectedOptionNumber(p + 'g', k);

				h = this.getInputValue(p + 'h', k);

				i = this.getInputValue(p + 'i', k);

				if (b != 0 || c != 0 || d != null ||
					(e != null && e != 0) ||
					(f != "" && f != null) || g != 0 ||
					(h != "" && h != null) ||
					(i != "" && i != null)) {
					//console.log("3:"+b+":"+c+":"+d+":"+e+":"+f+":"+g+":"+h+":"+h+":"+i);

					this.addRow();
					this.setAddCounter(1);
				} else {
					this.setAddCounter(0);
				}
			}

			//
			// Copy the contents of one line to the next line.
			//
			max = this.getId();
			for (k = max - 1; k > j; k--) {
				//alert("k="+k);
				b = this.getSelectedOptionNumber(p + 'b', k);
				this.setSelectedOptionNumber(p + 'b', k + 1, b);

				c = this.getSelectedOptionNumber(p + 'c', k);
				this.setSelectedOptionNumber(p + 'c', k + 1, c);


				d = this.getSelectedOptionNumber(p + 'd', k);
				this.setSelectedOptionNumber(p + 'd', k + 1, d);

				e = this.getSelectedOptionNumber(p + 'e', k);
				this.setSelectedOptionNumber(p + 'e', k + 1, e);


				f = this.getInputValue(p + 'f', k);
				this.setInputValue(p + 'f', k + 1, f);

				g = this.getSelectedOptionNumber(p + 'g', k);
				this.setSelectedOptionNumber(p + 'g', k + 1, g);

				h = this.getInputValue(p + 'h', k);
				this.setInputValue(p + 'h', k + 1, h);

				i = this.getInputValue(p + 'i', k);
				this.setInputValue(p + 'i', k + 1, i);

				//
				//  Reflection of Lock.
				//

				inp = this.getInputElement(p + 'i', k + 1);
				l = this.getLocked(k);
				if (l == true) {
					this.setLocked(inp, l, k + 1);
				} else {
					this.setUnlocked(inp, l, k + 1);
				}

			}

			//
			// Copy the contents of one line to the next line.
			//

			b = this.getSelectedOptionNumber(p + 'b', j);
			this.setSelectedOptionNumber(p + 'b', j + 1, b);

			c = this.getSelectedOptionNumber(p + 'c', j);
			this.setSelectedOptionNumber(p + 'c', j + 1, c);


			d = this.getSelectedOptionNumber(p + 'd', j);
			this.setSelectedOptionNumber(p + 'd', j + 1, d);

			e = this.getSelectedOptionNumber(p + 'e', j);
			this.setSelectedOptionNumber(p + 'e', j + 1, e);


			//f = this.getInputValue(p+'f', j);
			this.setInputValue(p + 'f', j + 1, "");

			g = this.getSelectedOptionNumber(p + 'g', j);
			this.setSelectedOptionNumber(p + 'g', j + 1, g);

			//h = this.getInputValue(p+'h', j);
			this.setInputValue(p + 'h', j + 1, "");

			i = this.getInputValue(p + 'i', j);
			this.setInputValue(p + 'i', j + 1, i);

			//
			//  Reflection of Lock.
			//

			inp = this.getInputElement(p + 'i', j + 1);
			l = this.getLocked(j);
			if (l == true) {
				this.setLocked(inp, l, j + 1);
			} else {
				this.setUnlocked(inp, l, j + 1);
			}

			return;
		}

		//
		// If it is the last line, 
		// change the line increment at the interval of 
		// double-clicking.
		//
		try {

			let nowTime = new Date();
			let t1 = nowTime.getTime();
			if (this.getOldTime() == null) {
				console.log(1);

				this.addRow();
				this.setAddCounter(1);

			} else {
				console.log(2);

				let t2 = this.getOldTime().getTime();
				let diff = t1 - t2;

				if (diff < DOBLE_CLICK_TIMING_SLOW) {

					if (diff < DOBLE_CLICK_TIMING_FAST) {

						switch (this.getAddCounter()) {
						case 1:
							this.addRow4();
							this.addRow5();
							this.setAddCounter(9);
							break;
						case 4:
						case 9:
						case 5:
						case 10:
							this.addRow5();
							this.addRow5();
							this.setAddCounter(10);
							break;
						}
					} else {

						switch (this.getAddCounter()) {
						case 1:
							this.addRow4();
							this.setAddCounter(4);
							break;
						case 4:
						case 9:
						case 5:
						case 10:
							this.addRow5();
							this.setAddCounter(5);
							break;
						}
					}
				} else {

					this.addRow();
					this.setAddCounter(1);

				}
			}

			this.setOldTime(nowTime);

		} catch (e) {
			alert("Error AddRow() e=" + e);
		}

		return;

	}

	/*
	 * Add one line.
	 */
	function _addRowLine(max, data) {

		let p = this.prefix;

		//let tpage = _core.getTpage();
		let tpage = this.getTpage();
		let j = 0;
		let td, cell, inp_f, inp_h, inp_i, id_name, class_name;
		let parts_names;
		let userData = {};

		for (let i = 0; i < max; i++) {

			//document.getElementById(DOT_COUNT_1).textContent = this.add();
			_core.getDotCount1().textContent = this.add();

			j = this.getId();

			let li = document.createElement('li');
			tpage.appendChild(li);

			let table = document.createElement('table');
			li.appendChild(table);

			let tr = document.createElement('tr');
			table.appendChild(tr);

			// a
			class_name = p + "a";
			td = this.addTdElement(tr, class_name, j);

			td.textContent = j;

			if (_core.browser == "safari") {
				td.addEventListener('touchstart', function (j, e) {

					var e = e || window.event;
					if (event.touches[0] !== undefined &&
						event.touches[1] !== undefined) {
						if (event.touches[2] === undefined) {
							this.copy_paste(j);
						} else {
							this.deleteRow(j);
						}
					}
				}.bind(this, j));
			} else {

				td.addEventListener('contextmenu', function (j, e) {
					this.deleteRow(j);
				}.bind(this, j));

				td.addEventListener('click', function (j, e) {
					this.copy_paste(j);
				}.bind(this, j));
			}

			// b
			class_name = p + "b";
			td = this.addTdElement(tr, class_name, j);

			cell = this.addSelectElement(td, class_name, j);
			this.addOption(cell, this.place_names);
			userData.pos = cell;

			// c
			class_name = p + "c";
			td = this.addTdElement(tr, class_name, j);

			cell = this.addSelectElement(td, class_name, j);
			this.addOption(cell, this.getAssetsNames());

			/*
			 *			if(_core.browser == "safari"){
			 *				cell.addEventListener('focus',this.c_row_start.bind(this,j));
			 *				cell.addEventListener('blur',this.c_row_method.bind(this,j));
			 *				userData.event = 'blur';
			 *			} else {
			 *				cell.addEventListener('focus',this.c_row_start.bind(this,j));
			 *
			 *				cell.addEventListener('change',this.c_row_method.bind(this,j));
			 *				userData.event = 'change';
			 *			}
			 */
			userData.type = cell;

			// d
			class_name = p + "d";
			td = this.addTdElement(tr, class_name, j);

			cell = this.addSelectElement(td, class_name, j);

			//console.log(13+":"+data.type);
			if (data == undefined) {
				this.addOption(cell, this.variety_names);
			} else {
				switch (data.type) {
				case ASSET_IN_PROCESS_INVENTORY:
					let next_process = this.getNextProcess();
					this.addOption(cell, next_process);
					//console.log(1);
					break;
					deafult:
						this.addOption(cell, this.variety_names);
					//console.log(2);
					break;
				}
			}

			if (_core.browser == "safari") {
				cell.addEventListener('focus', this.d_row_start.bind(this, j));
				cell.addEventListener('blur', this.d_row_method.bind(this, j));
			} else {
				cell.addEventListener('focus', this.d_row_start.bind(this, j));
				cell.addEventListener('change', this.d_row_method.bind(this, j));
			}
			userData.variety = cell;

			// e
			class_name = p + "e";
			td = this.addTdElement(tr, class_name, j);

			cell = this.addSelectElement(td, class_name, j);
			//console.log(cell);
			this.addOption(cell, this.getStockNames());

			if (_core.browser == "safari") {
				td.addEventListener('touchstart', function (j, e) {

					_core.setLongPressOldTime(new Date());

				}.bind(this, j));

				td.addEventListener('touchend', function (j, cell, e) {

					let diff = new Date() - _core.getLongPressOldTime();

					if (diff > MINIMUM_LONG_PRESS_TIME) {
						//alert("diff="+diff);
						_core.selectionBoard.setCell(cell);
						_core.selectionBoard.setValue(cell.selectedIndex);

						let list = this.getList(j, cell);
						_core.selectionBoard.setList(list);

						_core.selectionBoard.selectionBoard.classList.add('open');
					}

				}.bind(this, j, cell));
			} else {

				td.addEventListener('mousedown', function (j, e) {
					_core.setLongPressOldTime(new Date());
				}.bind(this, j));

				td.addEventListener('mouseup', function (j, cell, e) {
					let diff = new Date() - _core.getLongPressOldTime();
					if (diff > MINIMUM_LONG_PRESS_TIME) {
						_core.selectionBoard.setCell(cell);
						_core.selectionBoard.setValue(cell.selectedIndex);

						let list = this.getList(j, cell);
						_core.selectionBoard.setList(list);

						_core.selectionBoard.selectionBoard.classList.add('open');
					}
				}.bind(this, j, cell));
			}

			userData.product = cell;

			// f
			class_name = p + "f";
			td = this.addTdElement(tr, class_name, j);

			inp_f = this.addInputElement(td, class_name, j, "number");
			inp_f.addEventListener('mousedown', function (inp, e) {

				_core.under_tenkey.setCell(inp);
				_core.under_tenkey.setValue(inp.value);

				_core.under_tenkey.onOpen();
				let str = this.getFColumnString();
				_core.under_tenkey.drawProcuctName(str, j, userData.product.value);

			}.bind(this, inp_f));

			userData.weight = inp_f;

			// g
			class_name = p + "g";
			td = this.addTdElement(tr, class_name, j);

			cell = this.addSelectElement(td, class_name, j);
			this.addOption(cell, this.unit_names);
			//alert("unit_names="+this.getUnitNames());
			userData.unit = cell;

			// h
			class_name = p + "h";
			td = this.addTdElement(tr, class_name, j);

			inp_h = this.addInputElement(td, class_name, j, "number");
			inp_h.addEventListener('mousedown', function (inp, e) {

				_core.under_tenkey.setCell(inp);
				_core.under_tenkey.setValue(inp.value);

				_core.under_tenkey.onOpen();
				let str = this.getHColumnString();
				_core.under_tenkey.drawProcuctName(str, j, userData.product.value);

			}.bind(this, inp_h));
			userData.count = inp_h;

			// i
			class_name = p + "i";
			td = this.addTdElement(tr, class_name, j);
			inp_i = this.addInputElement(td, class_name, j, "text");
			userData.notes = inp_i;
			if (data != null) {
				if (data.locked == true) {
					this.setLocked(inp_i, data.locked, j);
				} else {
					this.setUnlocked(inp_i, data.locked, j);
				}
			}

			if (_core.browser == "safari") {
				td.addEventListener('touchstart', function (j, e) {

					_core.setLongPressOldTime(new Date());

				}.bind(this, j));

				td.addEventListener('touchend', function (j, inp, e) {

					let diff = new Date() - _core.getLongPressOldTime();

					if (diff > MINIMUM_LONG_PRESS_TIME) {

						if (this.row_lock_unlock(inp, j) == true) {
							if (DEBUG_CONTROL) {
								DataManager.API.submitReport();
							}
						}
					}

				}.bind(this, j, inp_i));
			} else {

				td.addEventListener('mousedown', function (j, e) {
					_core.setLongPressOldTime(new Date());
				}.bind(this, j));

				td.addEventListener('mouseup', function (j, inp, e) {
					let diff = new Date() - _core.getLongPressOldTime();
					if (diff > MINIMUM_LONG_PRESS_TIME) {

						if (this.row_lock_unlock(inp, j) == true) {
							if (DEBUG_CONTROL) {
								DataManager.API.submitReport();
							}
						}
					}

				}.bind(this, j, inp_i));
			}


			if (!data) {
				continue;
			}


			userData.pos.value = data.pos;
			userData.type.value = data.type;
			userData.type.dispatchEvent(new Event(userData.event));
			userData.variety.value = data.variety;
			userData.variety.dispatchEvent(new Event(userData.event));
			userData.product.value = data.product;
			userData.weight.value = data.weight;
			userData.unit.value = data.unit;
			userData.count.value = data.count;
			userData.notes.value = data.notes;

		}

		for (let i = 0; i < tpage.children.length; i++) {

			tpage.children[i].classList.remove('last');

		}

		tpage.lastChild.classList.add('last');

		let tbody2 = _core.getTbody2();
		let bottom = tbody2.scrollHeight - tbody2.clientHeight;
		tbody2.scrollTo(0, bottom);

		//
		// Disable disabled for deleting one line.
		//

		if (j > DEFAULT_MIN_ROWS) {
			if (_core.getMinBtn2().disabled == true) {

				_core.getMinBtn2().disabled = false;

			}
		}

		return userData;
	};


	function _addSelectElement(td, class_name, j) {

		let id_name = class_name + "_" + j;
		let cell = document.createElement('select');
		cell.setAttribute("id", id_name + "_select");
		td.appendChild(cell);

		return cell;
	}

	function _addTdElement(tr, class_name, j) {

		let id_name = class_name + "_" + j;
		let td = document.createElement('td');
		td.setAttribute("class", class_name);
		td.setAttribute("id", id_name);
		tr.appendChild(td);

		return td;
	}

	function _addInputElement(td, class_name, j, type) {

		let id_name = class_name + "_" + j + "_input";
		let inp = document.createElement('input');
		inp.setAttribute("type", type);
		inp.setAttribute("id", id_name);
		td.appendChild(inp);

		return inp;
	}


	function _getList(j, cell) {

		return this.getStockNames();

	}

	/*
	 * Processing of Unlock.
	 */
	function _setUnlocked(inp, locked, j) {
		if (locked == true) return;

		inp.classList.remove('locked');

		let pointerEvents = "auto";
		let color = "transparent"

		this.setLockedUnlocked(inp, j, pointerEvents, color);
	}

	/*
	 * Processing of Lock.
	 */
	function _setLocked(inp, locked, j) {
		if (locked == false) return;

		inp.classList.add('locked');

		let pointerEvents = "none";
		let color = LOCK_REVERSE_COLOR;

		this.setLockedUnlocked(inp, j, pointerEvents, color);
	}

	/*
	 * Common processing of Lock and Unlock.
	 */
	function _setLockedUnlocked(inp, j, pointerEvents, color) {
		let p = this.prefix;

		inp.parentElement.parentElement.style.backgroundColor = color;

		let a = this.getTdElement(p + 'a', j);
		let b = this.getSelectElement(p + 'b', j);
		let c = this.getSelectElement(p + 'c', j);
		let d = this.getSelectElement(p + 'd', j);
		let e = this.getSelectElement(p + 'e', j);
		let f = this.getInputElement(p + 'f', j);
		let g = this.getSelectElement(p + 'g', j);
		let h = this.getInputElement(p + 'h', j);
		let i = this.getInputElement(p + 'i', j);

		a.style.pointerEvents = pointerEvents;
		b.style.pointerEvents = pointerEvents;
		c.style.pointerEvents = pointerEvents;
		d.style.pointerEvents = pointerEvents;
		e.style.pointerEvents = pointerEvents;
		f.style.pointerEvents = pointerEvents;
		g.style.pointerEvents = pointerEvents;
		h.style.pointerEvents = pointerEvents;


		f.style.backgroundColor = color;
		h.style.backgroundColor = color;
		i.style.backgroundColor = color;

		return;
	}

	/*
	 * Get locked.
	 */
	function _getLocked(num) {
		let p = this.prefix;
		let bool = document.getElementById(`${p}i_${num}_input`).classList.contains('locked');

		return bool;
	}

	function _getTdElement(class_name, j) {
		let id_name = `${class_name}_${j}`;
		let cell = document.getElementById(id_name);

		return cell;
	}

	function _getSelectElement(class_name, j) {
		let id_name = `${class_name}_${j}_select`;
		let cell = document.getElementById(id_name);

		return cell;
	}

	function _getInputElement(class_name, j) {
		let id_name = `${class_name}_${j}_input`;
		let cell = document.getElementById(id_name);

		return cell;
	}
	/*
	 * Locking or unlocking with _addRowLine.
	 * Press and hold to switch between locked and unlocked states.
	 */
	function _row_lock_unlock(inp, j) {

		let pointerEvents;
		let color;
		let rt;

		if (inp.classList.contains('locked') == true) {

			inp.classList.remove('locked');
			pointerEvents = "auto";
			color = "transparent";
			rt = true;

			if (DEBUG_PRINT_3) {
				console.log("Unlocked");
			}

		} else {
			inp.classList.add('locked');
			pointerEvents = "none";
			color = LOCK_REVERSE_COLOR;
			rt = false;

			if (DEBUG_PRINT_3) {
				console.log("Unlocked");
			}
		}

		this.setLockedUnlocked(inp, j, pointerEvents, color);

		return rt;
	}

	/*
	 * If the inventory name does not change, do not process.
	 * For this, save the first value at focus.
	 */
	/*
	 *	function _c_row_start(j,event) {
	 *
	 *		let value = `${event.target.value}`;
	 *		//alert("value="+value)
	 *		this.setC_row_method_value(value);
	 *		
	 *	}
	 */

	/*
	 * If the product name does not change, do not process.
	 * For this, save the first value at focus.
	 */
	function _d_row_start(j, event) {

		let value = `${event.target.value}`;
		//alert("value="+value)
		this.setD_row_method_value(value);

	}
	/*
	 * Processing in column c.
	 */
	function _c_row_method(j, event) {
		//
		// If the inventory name does not change, do not process.
		//
		let old_value = this.getC_row_method_value();
		this.setC_row_method_value(null);

		let value = `${event.target.value}`;

		if (old_value == value) {
			return;
		}

		let id_name_d = 'd' + "_" + j + "_select";
		let id_name_e = 'e' + "_" + j + "_select";
		let id_name_g = 'g' + "_" + j + "_select";
		let D = document.getElementById(id_name_d);
		let E = document.getElementById(id_name_e);
		let G = document.getElementById(id_name_g);
		let len;


		len = D.options.length;
		for (let i = len; i >= 0; i--) {
			D.remove(i);
		}

		len = E.options.length;
		for (let i = len; i >= 0; i--) {
			E.remove(i);
		}

		let material;
		let next_process;

		/*
		 *		switch(value) {
		 *		case ASSET_RAW_MATERIAL:
		 *
		 *			material = _core.getRawMaterials();
		 *			addOption(E, material);
		 *
		 *		break;
		 *		case ASSET_IN_PROCESS_INVENTORY:
		 *
		 *			next_process = this.getNextProcess();
		 *			if(next_process != false) {
		 *				addOption(D, next_process);
		 *			}
		 *
		 *			material = _core.getWorkInProcess();
		 *			addOption(E, material);
		 *
		 *		break;
		 *		case ASSET_PRODUCT:
		 *
		 *			material = _core.getProducts();
		 *			addOption(D, material);
		 *
		 *		break;
		 *		case ASSET_DUST:
		 *
		 *			material = _core.getDusts();
		 *			addOption(E, material);
		 *
		 *		break;
		 *		case ASSET_SAME :
		 *
		 *			this.copy_sameName(j,event);
		 *
		 *		break;
		 *		}
		 */

		//
		//Select kg as fixed
		//
		G.options[1].selected = true;

		return;

		function addOption(cell, material) {
			if (material == null) return false;
			let len;

			len = cell.options.length;
			for (let i = len; i >= 0; i--) {
				cell.remove(i);
			}

			let opt;
			for (let i = 0; i < material.length; i++) {

				opt = document.createElement("option");
				opt.value = material[i];
				opt.text = material[i];
				cell.add(opt);

			}
		}
	}

	/*
	 * Processing in column d.
	 */
	function _d_row_method(j, event) {
		return "";
		//
		// If the product name does not change, do not process.
		//
		let old_value = this.getD_row_method_value();
		this.setD_row_method_value(null);

		let value = `${event.target.value}`;

		if (old_value == value) {
			return;
		}

		const dusts = _core.getDusts();

		let id_name_c = 'c' + "_" + j + "_select";
		let id_name_d = 'd' + "_" + j + "_select";
		let id_name_e = 'e' + "_" + j + "_select";
		let C = document.getElementById(id_name_c);
		let D = document.getElementById(id_name_d);
		let E = document.getElementById(id_name_e);
		let len;

		//
		// Do not process anything other than product.
		//
		let m = C.options[C.selectedIndex].value;
		if (m != ASSET_PRODUCT) {
			return;
		}

		len = E.options.length;
		for (let i = len; i >= 0; i--) {
			E.remove(i);
		}


		let opt, material;
		switch (value) {
		case PRODUCT_IRON:
			material = _core.getIrons();
			break;
		case PRODUCT_RED_NON_FERROUS:
			material = _core.getRedNonFerrous();
			break;
		case PRODUCT_WHITE_NON_FERROUS:
			material = _core.getWhiteNonFerrous();
			break;
		case PRODUCT_BOARDS:
			material = _core.getBoards();
			break;
		case PRODUCT_PLASTIC:
			material = _core.getPra();
			break;
		case PRODUCT_GOLD_SILVER:
			material = _core.getGoldSilver();
			break;
		case PRODUCT_USED_PAPER:
			material = _core.getUsedPaper();
			break;
		case PRODUCT_OTHERS:
			material = _core.getOthers();
			break;
		default:
			return;
		}

		addOption(E, material);

		return;

		function addOption(cell, material) {
			let len;

			len = cell.options.length;
			for (let i = len; i >= 0; i--) {
				cell.remove(i);
			}


			for (let i = 0; i < material.length; i++) {
				opt = document.createElement("option");
				opt.value = material[i];
				opt.text = material[i];
				cell.add(opt);
			}
		}
	}


	/*
	 * Add Option in select tag.
	 */
	function _addOption(cell, parts_names) {
		if (parts_names == null) return;

		let k = parts_names.length;
		let i;
		let opt;
		if (cell != null) {

			let l = cell.options.length;

			for (i = l - 1; i >= 0; i--) {
				cell.remove(i);
			}
		}

		for (i = 0; i < k; i++) {

			opt = document.createElement("option");
			opt.text = parts_names[i];
			opt.value = parts_names[i];

			cell.add(opt, null);
		}
	}

	function _addButtonDisabled() {

		try {
			if (_core.getAddBtn2() !== null) {
				_core.getAddBtn2().disabled = true;
			}
		} catch (e) {
			alert("Error " + e);
		}

		try {
			if (_core.getMinBtn2() !== null) {
				_core.getMinBtn2().disabled = true;
			}
		} catch (e) {
			alert("Error " + e);
		}

	}

	function _addButtonEnabled() {

		try {
			if (_core.getAddBtn2() !== null) {
				_core.getAddBtn2().disabled = false;
			}
		} catch (e) {
			alert("Error " + e);
		}

		try {
			if (_core.getMinBtn2() !== null) {
				if (this.getId() > DEFAULT_MIN_ROWS) {
					_core.getMinBtn2().disabled = false;
				}
			}
		} catch (e) {
			alert("Error " + e);
		}

	}

};
