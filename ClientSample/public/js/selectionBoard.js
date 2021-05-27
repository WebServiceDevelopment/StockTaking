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

function selectionBoard_class() {
	const inputPlace = "selectionBoardInput";
	const MATERIAL_LIST = "material_list"

	this.onSelectionBoard = _onSelectionBoard;
	this.onFocus = _onFocus;

	this.cell;
	this.setCell = (cell) => this.cell = cell;
	this.getCell = () => this.cell;
	this.setValue = (selectedIndex) => {

		let obj = document.getElementById(inputPlace);
		if (selectedIndex != -1) {

			let value = this.cell.options[selectedIndex].value;
			obj.value = value;

		} else {
			obj.value = "";
		}

		setTimeout(function () {

			this.cell.blur();

		}.bind(this), 10);
	}

	this.list = null;
	this.setList = (list) => {
		this.list = list;
		drawList(list);
	}
	this.getList = () => this.list;

	setTimeout(() => this.selectionBoard = document.getElementById("selectionBoard"), 10);

	this.drawSelectionBoard = _drawSelectionBoard.bind(this);

	setTimeout(() => this.drawSelectionBoard(), 20);

	return;


	function _drawSelectionBoard() {

		let nums = ["Cancel", "OK"];
		let tr, td, inp, j, list;

		let div = document.createElement('div');
		div.setAttribute('class', 'card');
		this.selectionBoard.appendChild(div);


		let outline = document.createElement('div');
		outline.setAttribute('class', 'matline');
		div.appendChild(outline);

		let table2 = document.createElement('table');
		table2.setAttribute("id", MATERIAL_LIST);
		table2.setAttribute("class", MATERIAL_LIST);
		outline.appendChild(table2);


		let table1 = document.createElement('table');
		div.appendChild(table1);

		tr = document.createElement('tr');
		table1.appendChild(tr);

		td = document.createElement('td');
		tr.appendChild(td);

		inp = document.createElement('input');
		inp.setAttribute("type", "text");
		inp.setAttribute("id", inputPlace);

		inp.addEventListener('focus', function (evt) {
			_core.selectionBoard.onFocus();
		});
		td.appendChild(inp);


		for (let i = 0; i < nums.length; i++) {
			drawkey(tr, nums[i]);
		}
	}

	function drawList(list) {

		let table2 = document.getElementById(MATERIAL_LIST);
		let max = list.length;
		let i, j, tr;

		for (j = table2.rows.length - 1; j >= 0; j--) {
			table2.deleteRow(j);
		}

		for (j = 1; j < max;) {

			tr = document.createElement('tr');
			table2.appendChild(tr);

			for (i = 0; i < MATERIAL_COLUMNS; i++, j++) {

				drawCell(tr, list[j]);

				if (j >= max) {
					if (i < MATERIAL_COLUMNS) {
						for (; i < MATERIAL_COLUMNS; i++) {
							drawCell(tr, "");
						}
					}

					return;
				}
			}
		}
		let body = document.getElementById(MATERIAL_LIST);

	}

	function drawCell(tr, num) {

		let td = document.createElement('td');

		tr.appendChild(td);
		td.textContent = num;

		onSelectionBoard(td, num);
	}

	function drawkey(tr, num) {

		let td = document.createElement('td');

		tr.appendChild(td);
		let inp = document.createElement('input');

		inp.setAttribute("type", "button");
		inp.setAttribute("class", "tehkey");
		inp.value = num;

		onSelectionBoard(inp, num);
		td.appendChild(inp);
	}

	function onSelectionBoard(inp, num) {

		let evt = 'mouseup';
		if (_core.browser == "safari") {
			evt = 'touchend';
		}

		inp.addEventListener(evt, _core.selectionBoard.onSelectionBoard.bind(_core.selectionBoard, num));
	};

	function _onSelectionBoard(str) {

		let obj = document.getElementById(inputPlace);
		let tenley;

		switch (str) {
		case "OK":

			//this.cell.value = obj.value;
			let options = this.cell.options;
			let value = obj.value;


			let i, l;
			for (i = 0, l = options.length; l > i; i++) {
				options[i].selected = false;
			}

			for (i = 0, l = options.length; l > i; i++) {
				if (options[i].value == value) {
					console.log("value=" + value + ":i=" + i);
					options[i].selected = true;
					break;
				}
			}

			setTimeout(() => this.selectionBoard.classList.remove('open'), 20);

			break;
		case "Cancel":
			setTimeout(() => this.selectionBoard.classList.remove('open'), 20);

			break;
		default:
			obj.value = str;
			break;
		}

	}

	function _onFocus() {
		//alert( inputPlace );
	}
}
