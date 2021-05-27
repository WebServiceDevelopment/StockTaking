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

function tenkey_class() {

	const inputPlace = "10key";

	this.onTenkey = _onTenkey;
	this.onFocus = _onFocus;
	this.onOpen = _onOpen.bind(this);
	this.onClose = _onClose.bind(this);
	this.cell;
	this.setCell = (cell) => this.cell = cell;
	this.getCell = () => this.cell;
	this.setValue = (value) => {
		let obj = document.getElementById(inputPlace);
		obj.value = value;
		setTimeout(function () {
			this.cell.blur();
		}.bind(this), 10);

	}

	setTimeout(() => this.tenkey = document.getElementById("tenkey"), 10);

	this.drawTenKey = _drawTenKey.bind(this);

	setTimeout(() => this.drawTenKey(), 20);

	this.column_string_obj;
	this.setColumnStringObj = (column_string_obj) => this.column_string_obj = column_string_obj;
	this.getColumnStringObj = () => this.column_string_obj;

	this.number_obj;
	this.setNumberObj = (number_obj) => this.number_obj = number_obj;
	this.getNumberObj = () => this.number_obj;

	this.product_name_obj;
	this.setProcuctNameObj = (product_name_obj) => this.product_name_obj = product_name_obj;

	this.getProcuctNameObj = () => this.product_name_obj;

	this.drawProcuctName = _drawProcuctName.bind(this);

	this.up_arrow = _up_arrow.bind(this);
	this.down_arrow = _down_arrow.bind(this);

	this.input_palce_obj;
	this.setInputPlaceObj = (input_palce_obj) => this.input_palce_obj = input_palce_obj;
	this.getInputPlaceObj = () => this.input_palce_obj;

	return;

	function _up_arrow(e) {
		let inp = this.getInputPlaceObj();
		if (inp.value == '') {
			inp.value = 1;
		} else {
			inp.value = parseInt(inp.value) + 1;
		}
	}

	function _down_arrow(e) {
		let inp = this.getInputPlaceObj();
		if (inp.value == '') {
			inp.value = 0;
		} else {
			inp.value = parseInt(inp.value) - 1;
		}
	}

	function _drawProcuctName(column_str, number, product_name) {

		let elm1 = this.getColumnStringObj();
		let elm2 = this.getNumberObj();
		let elm3 = this.getProcuctNameObj();

		elm1.innerText = column_str;
		elm2.innerText = number;
		elm3.innerText = product_name;

	}

	function _drawTenKey() {

		let nums = ["BS", 0, "Enter"];
		let tr, td, inp, num, br;

		let div = document.createElement('div');
		this.tenkey.appendChild(div);

		let span

		span = document.createElement('span');
		span.setAttribute("class", "tenkey_column_str");
		span.setAttribute("id", "tenkey_column_str");
		div.appendChild(span);
		this.setColumnStringObj(span);

		br = document.createElement('br');
		div.appendChild(br);

		span = document.createElement('span');
		span.setAttribute("class", "tenkey_str_value tenkey_str_1");
		span.setAttribute("id", "tenkey_number");
		div.appendChild(span);
		this.setNumberObj(span);

		span = document.createElement('span');
		span.setAttribute("class", "tenkey_str");
		div.appendChild(span);
		span.innerText = ".   "

		span = document.createElement('span');
		span.setAttribute("class", "tenkey_str_value");
		span.setAttribute("id", "tenkey_product_name");
		div.appendChild(span);
		this.setProcuctNameObj(span);

		span = document.createElement('span');
		span.setAttribute("class", "dli-close");
		div.appendChild(span);
		span.addEventListener('click', function (e) {
			_core.tenkey.onClose();
		});

		let div1 = document.createElement('div');
		div1.setAttribute("class", "calc-box");
		this.tenkey.appendChild(div1);

		let table1 = document.createElement('table');
		div1.appendChild(table1);

		tr = document.createElement('tr');
		table1.appendChild(tr);

		td = document.createElement('td');
		tr.appendChild(td);

		inp = document.createElement('input');
		inp.setAttribute("type", "text");
		inp.setAttribute("id", inputPlace);

		this.setInputPlaceObj(inp);

		inp.addEventListener('focus', function (e) {
			_core.tenkey.onFocus();
		});
		td.appendChild(inp);

		td = document.createElement('td');
		tr.appendChild(td);

		span = document.createElement('span');
		span.setAttribute("class", "input_up");
		span.setAttribute("id", "input_up");
		td.appendChild(span);
		span.addEventListener('click', function (e) {
			//alert("up click");
			this.up_arrow(e);
		}.bind(this));

		span = document.createElement('span');
		span.setAttribute("class", "input_down");
		span.setAttribute("id", "input_down");
		td.appendChild(span);
		span.addEventListener('click', function (e) {
			//alert("down click");
			this.down_arrow(e);
		}.bind(this));


		let table2 = document.createElement('table');
		div1.appendChild(table2);

		tr = document.createElement('tr');
		table2.appendChild(tr);

		num = 0;

		for (let i = 0; i < CALC_COLUMNS; i++) {
			drawkey(tr, ++num);
		}

		tr = document.createElement('tr');
		table2.appendChild(tr);

		for (let i = 0; i < CALC_COLUMNS; i++) {
			drawkey(tr, ++num);
		}

		tr = document.createElement('tr');
		table2.appendChild(tr);

		for (let i = 0; i < CALC_COLUMNS; i++) {
			drawkey(tr, ++num);
		}

		tr = document.createElement('tr');
		table2.appendChild(tr);


		for (let i = 0; i < CALC_COLUMNS; i++) {
			drawkey(tr, nums[i]);
		}
	}


	function drawkey(tr, num) {

		let td = document.createElement('td');

		tr.appendChild(td);
		let inp = document.createElement('input');

		inp.setAttribute("type", "button");
		inp.setAttribute("class", "tehkey");
		inp.value = num;

		onTenkey(inp, num);
		td.appendChild(inp);
	}

	function onTenkey(inp, num) {

		let evt = 'mouseup';
		if (_core.browser == "safari") {
			evt = 'touchend';
		}

		inp.addEventListener(evt, _core.tenkey.onTenkey.bind(_core.tenkey, num));
	};

	function _onTenkey(num) {

		let obj = document.getElementById(inputPlace);
		let tenley;

		switch (num) {
		case "Enter":

			this.cell.value = obj.value;
			setTimeout(() => this.tenkey.classList.remove('open'), 20);

			break;
		case "BS":

			let str = obj.value;
			if (str.length > 0) {
				obj.value = str.substr(0, str.length - 1);
			}
			break;
		default:
			obj.value += num;
			break;
		}

	}


	function _onOpen() {

		this.tenkey.classList.add('open');
	}

	function _onFocus() {
		//alert( inputPlace );
	}

	function _onClose() {

		console.log("I AM BEING CLOSED!!! 1");

		setTimeout(() => this.tenkey.classList.remove('open'), 20);
	}
}

function under_tenkey_class() {

	const inputPlace = "_10key";

	this.onTenkey = _onTenkey;
	this.onFocus = _onFocus;
	this.onOpen = _onOpen.bind(this);
	this.onClose = _onClose.bind(this);
	this.cell;
	this.setCell = (cell) => this.cell = cell;
	this.getCell = () => this.cell;
	this.setValue = (value) => {
		let obj = document.getElementById(inputPlace);
		obj.value = value;
		setTimeout(function () {
			this.cell.blur();
		}.bind(this), 10);

	}

	setTimeout(() => this.tenkey = document.getElementById("under_tenkey"), 10);

	this.drawTenKey = _drawTenKey.bind(this);

	setTimeout(() => this.drawTenKey(), 20);

	this.column_string_obj;
	this.setColumnStringObj = (column_string_obj) => this.column_string_obj = column_string_obj;
	this.getColumnStringObj = () => this.column_string_obj;

	this.number_obj;
	this.setNumberObj = (number_obj) => this.number_obj = number_obj;
	this.getNumberObj = () => this.number_obj;

	this.product_name_obj;
	this.setProcuctNameObj = (product_name_obj) => this.product_name_obj = product_name_obj;

	this.getProcuctNameObj = () => this.product_name_obj;

	this.drawProcuctName = _drawProcuctName.bind(this);

	this.up_arrow = _up_arrow.bind(this);
	this.down_arrow = _down_arrow.bind(this);

	this.input_palce_obj;
	this.setInputPlaceObj = (input_palce_obj) => this.input_palce_obj = input_palce_obj;
	this.getInputPlaceObj = () => this.input_palce_obj;

	return;

	function _up_arrow(e) {
		let inp = this.getInputPlaceObj();
		if (inp.value == '') {
			inp.value = 1;
		} else {
			inp.value = parseInt(inp.value) + 1;
		}
	}

	function _down_arrow(e) {
		let inp = this.getInputPlaceObj();
		if (inp.value == '') {
			inp.value = 0;
		} else {
			inp.value = parseInt(inp.value) - 1;
		}
	}

	function _drawProcuctName(column_str, number, product_name) {

		let elm1 = this.getColumnStringObj();
		let elm2 = this.getNumberObj();
		let elm3 = this.getProcuctNameObj();

		elm1.innerText = column_str;
		elm2.innerText = number;
		elm3.innerText = product_name;

	}

	function _drawTenKey() {

		let nums = ["BS", 0, "Enter"];
		let tr, td, inp, num, br;

		let div = document.createElement('div');
		this.tenkey.appendChild(div);

		let span, arrow;

		span = document.createElement('span');
		span.setAttribute("class", "under_tenkey_column_str");
		span.setAttribute("id", "under_tenkey_column_str");
		div.appendChild(span);
		this.setColumnStringObj(span);

		span = document.createElement('span');
		span.setAttribute("class", "under_tenkey_str_value under_tenkey_str_1");
		span.setAttribute("id", "under_tenkey_number");
		div.appendChild(span);
		this.setNumberObj(span);

		span = document.createElement('span');
		span.setAttribute("class", "under_tenkey_str");
		div.appendChild(span);
		span.innerText = ".  "

		span = document.createElement('span');
		span.setAttribute("class", "under_tenkey_str_value");
		span.setAttribute("id", "under_tenkey_product_name");
		div.appendChild(span);
		this.setProcuctNameObj(span);

		span = document.createElement('span');
		span.setAttribute("class", "dli-close");
		div.appendChild(span);
		span.addEventListener('click', function (e) {
			console.log("Click close button!!");
			_core.under_tenkey.onClose();
		});

		let div1 = document.createElement('div');
		div1.setAttribute("class", "under_calc-box");
		this.tenkey.appendChild(div1);

		let table1 = document.createElement('table');
		div1.appendChild(table1);

		tr = document.createElement('tr');
		table1.appendChild(tr);

		td = document.createElement('td');
		tr.appendChild(td);

		inp = document.createElement('input');
		inp.setAttribute("type", "text");
		inp.setAttribute("id", inputPlace);

		this.setInputPlaceObj(inp);

		inp.addEventListener('focus', function (e) {
			_core.under_tenkey.onFocus();
		});
		td.appendChild(inp);

		td = document.createElement('td');
		tr.appendChild(td);

		/*
				span = document.createElement('span');
				span.setAttribute("class","input_up");
				span.setAttribute("id","input_up");
				td.appendChild(span);
				span.addEventListener('click', function(e) {
					//alert("up click");
					this.up_arrow(e);
				}.bind(this));

				span = document.createElement('span');
				span.setAttribute("class","input_down");
				span.setAttribute("id","input_down");
				td.appendChild(span);
				span.addEventListener('click', function(e) {
					//alert("down click");
					this.down_arrow(e);
				}.bind(this));
		*/
		arrow = document.createElement('arrow');
		arrow.setAttribute("id", "arrow1");
		td.appendChild(arrow);


		let table2 = document.createElement('table');
		div1.appendChild(table2);

		tr = document.createElement('tr');
		table2.appendChild(tr);

		num = 0;

		for (let i = 0; i < CALC_COLUMNS; i++) {
			drawkey(tr, ++num);
		}

		tr = document.createElement('tr');
		table2.appendChild(tr);

		for (let i = 0; i < CALC_COLUMNS; i++) {
			drawkey(tr, ++num);
		}

		tr = document.createElement('tr');
		table2.appendChild(tr);

		for (let i = 0; i < CALC_COLUMNS; i++) {
			drawkey(tr, ++num);
		}

		tr = document.createElement('tr');
		table2.appendChild(tr);


		for (let i = 0; i < CALC_COLUMNS; i++) {
			drawkey(tr, nums[i]);
		}
	}


	function drawkey(tr, num) {

		let td = document.createElement('td');

		tr.appendChild(td);
		let inp = document.createElement('input');

		inp.setAttribute("type", "button");
		inp.setAttribute("class", "tehkey");
		inp.value = num;

		onTenkey(inp, num);
		td.appendChild(inp);
	}

	function onTenkey(inp, num) {

		let evt = 'mouseup';
		if (_core.browser == "safari") {
			evt = 'touchend';
		}

		inp.addEventListener(evt, _core.under_tenkey.onTenkey.bind(_core.under_tenkey, num));
	};

	function _onTenkey(num) {

		let obj = document.getElementById(inputPlace);
		let tenley;

		switch (num) {
		case "Enter":

			let inp = _core.under_tenkey.getCell();
			inp.classList.remove('active');

			this.cell.value = obj.value;
			_core.under_tenkey.onClose();
			// setTimeout(() => this.tenkey.classList.remove('open'), 20);

			break;
		case "BS":

			let str = obj.value;
			if (str.length > 0) {
				obj.value = str.substr(0, str.length - 1);
			}
			break;
		default:
			obj.value += num;
			break;
		}

	}


	function _onOpen() {

		let inp = _core.under_tenkey.getCell();
		inp.classList.add('active');

		this.tenkey.classList.add('open');
	}

	function _onFocus() {
		//alert( inputPlace );
	}

	function _onClose() {
		let inp = _core.under_tenkey.getCell();
		inp.classList.remove('active');
		
		console.log("I AM BEING CLOSED!!! 2");

		DataManager.API.updateWeight();
		setTimeout(() => this.tenkey.classList.remove('open'), 20);

	}
}
