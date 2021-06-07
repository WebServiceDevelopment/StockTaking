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

 Author: Benjamin Collins (collins.wsd.co.jp)

**/

"use strict";

const ProductManager = (function() {

	this.MEM = {
		isEdit : null
	}

	this.DOM = {
		form : {
			type : document.getElementById('ProductManager.form.type'),
			variety : document.getElementById('ProductManager.form.variety'),
			name : document.getElementById('ProductManager.form.name'),
			next_process : document.getElementById('ProductManager.form.next_process'),
			unit : document.getElementById('ProductManager.form.unit'),
			cancel : document.getElementById('ProductManager.form.cancel'),
			submit : document.getElementById('ProductManager.form.submit'),
			label : document.getElementById('ProductManager.form.label'),
			select_all : document.getElementById('ProductManager.form.select_all'),
			deselect_all : document.getElementById('ProductManager.form.deselect_all'),
		},
		table : {
			body : document.getElementById('ProductManager.table.body'),
			file : document.getElementById('ProductManager.table.file'),
			copy : document.getElementById('ProductManager.table.copy'),
			all : document.getElementById('ProductManager.table.all'),
			count : document.getElementById('ProductManager.table.count')
		}
	}

	this.EVT = {
		handleSelectChange : evt_handleSelectChange.bind(this),
		handleToggleAll : evt_handleToggleAll.bind(this),
		handleCheckbox : evt_handleCheckbox.bind(this),
		handleTableEditClick : evt_handleTableEditClick.bind(this),
		handleTableRemoveClick : evt_handleTableRemoveClick.bind(this),
		handleFormSubmitClick : evt_handleFormSubmitClick.bind(this),
		handleFormCancelClick : evt_handleFormCancelClick.bind(this),
		handleTableExport : evt_handleTableExport.bind(this),
		handleTableCopy : evt_handleTableCopy.bind(this),
		handleSelectAll : evt_handleSelectAll.bind(this),
		handleDeselectAll : evt_handleDeselectAll.bind(this)
	}

	this.API = {
		clearForm : api_clearForm.bind(this),
		selectProducts : api_selectProducts.bind(this),
		renderProducts : api_renderProducts.bind(this),
		createProduct : api_createProduct.bind(this),
		updateProduct : api_updateProduct.bind(this),
		appendProduct : api_appendProduct.bind(this),
		createJSON : api_createJSON.bind(this),
		checkExportEnabled : api_checkExportEnabled.bind(this)
	}

	init.apply(this);
	return this;

	function init() {
		
		// Add Events to DOM Elements

		this.DOM.form.type.addEventListener('change', this.EVT.handleSelectChange);
		this.DOM.form.cancel.addEventListener('click', this.EVT.handleFormCancelClick);
		this.DOM.form.submit.addEventListener('click', this.EVT.handleFormSubmitClick);
		this.DOM.table.file.addEventListener('click', this.EVT.handleTableExport);

		// this.DOM.table.all.addEventListener('click', this.EVT.handleToggleAll);
		
		this.DOM.table.copy.addEventListener('click', this.EVT.handleTableCopy);
		this.DOM.form.select_all.addEventListener('click', this.EVT.handleSelectAll);
		this.DOM.form.deselect_all.addEventListener('click', this.EVT.handleDeselectAll);

		// Call internal functions

		this.API.selectProducts();
		this.API.clearForm();
		this.API.checkExportEnabled();

	}

	function api_checkExportEnabled() {

		if(!this.MEM.userData) {
			this.DOM.table.file.classList.add('disabled');
			this.DOM.table.copy.classList.add('disabled');
			return;
		}
		
		for(let i = 0; i < this.MEM.userData.length; i++) {
			if(!this.MEM.userData[i].checkbox.checked) {
				continue;
			}

			this.DOM.table.file.classList.remove('disabled');
			this.DOM.table.copy.classList.remove('disabled');
			return;
		}
		
		this.DOM.table.file.classList.add('disabled');
		this.DOM.table.copy.classList.add('disabled');
	}

	function api_createJSON() {

		const data = [];
		this.MEM.userData.forEach( u => {
			if(!u.checkbox.checked) {
				return;
			}

			data.push(u.data);
		});
		
		let json = {};
		data.forEach( d => {
			
			switch(d.product_type) {
			case '製品':
				json[d.product_type] = json[d.product_type] || {};
				if(!json[d.product_type][d.product_variety]) {
					json[d.product_type][d.product_variety] = [];
				}
				json[d.product_type][d.product_variety].push({
					name : d.product_name,
					unit : d.unit
				});
				break;
			case '原材料':
				json[d.product_type] = json[d.product_type] || [];
				json[d.product_type].push({
					name : d.product_name,
					next : d.next_process,
					unit : d.unit
				});
				break;
			default:
				json[d.product_type] = json[d.product_type] || [];
				json[d.product_type].push({
					name : d.product_name,
					unit : d.unit
				});
				break;
			}

		});

		return json;

	}

	function evt_handleSelectAll() {

		if(!this.MEM.userData) {
			return;
		}

		this.DOM.table.all.textContent = this.MEM.userData.length;
		this.API.clearForm();

		this.MEM.userData.forEach(u => {
			u.row.classList.add('selected');
			u.checkbox.checked = true;
		});
		
		this.API.checkExportEnabled();

	}

	function evt_handleDeselectAll() {

		if(!this.MEM.userData) {
			return;
		}

		this.DOM.table.all.textContent = '0';
		this.API.clearForm();

		this.MEM.userData.forEach(u => {
			u.row.classList.remove('selected');
			u.checkbox.checked = false;
		});
		
		this.API.checkExportEnabled();

	}

	function evt_handleTableCopy() {
		
		if(!this.MEM.userData) {
			return;
		}

		const data = [];
		this.MEM.userData.forEach( u => {
			if(!u.checkbox.checked) {
				return;
			}

			data.push(u.data);
		});
		
		let json = {};
		data.forEach( d => {
			
			switch(d.product_type) {
			case '製品':
				json[d.product_type] = json[d.product_type] || {};
				if(!json[d.product_type][d.product_variety]) {
					json[d.product_type][d.product_variety] = [];
				}
				json[d.product_type][d.product_variety].push(d.product_name);
				break;
			case '原材料':
				json[d.product_type] = json[d.product_type] || [];
				json[d.product_type].push({
					name : d.product_name,
					next : d.next_process
				});
				break;
			default:
				json[d.product_type] = json[d.product_type] || [];
				json[d.product_type].push(d.product_name);
				break;
			}

		});
		
		json = this.API.createJSON();
		let text = JSON.stringify(json, null, 4);
		copyTextToClipboard(text);
		alert('Copied JSON to Clipboard');
		
	}

	function evt_handleToggleAll() {
		
		this.DOM.table.all.textContent = '0';
		this.API.clearForm();

		if(!this.MEM.userData) {
			return;
		}

		this.MEM.userData.forEach(u => {
			u.row.classList.remove('selected');
			u.checkbox.checked = false;
		});

	}

	function evt_handleSelectChange() {

		switch(this.DOM.form.type.value) {
		case '':

			this.DOM.form.variety.setAttribute('disabled', 'disabled');
			this.DOM.form.name.setAttribute('disabled', 'disabled');
			this.DOM.form.next_process.setAttribute('disabled', 'disabled');
			this.DOM.form.unit.setAttribute('disabled', 'disabled');
			this.DOM.form.submit.setAttribute('disabled', 'disabled');

			break;
		case '原材料':

			this.DOM.form.variety.value = '';
			this.DOM.form.name.removeAttribute('disabled');
			this.DOM.form.variety.setAttribute('disabled', 'disabled');
			this.DOM.form.next_process.removeAttribute('disabled');
			this.DOM.form.unit.removeAttribute('disabled');
			this.DOM.form.submit.removeAttribute('disabled');

			break;
		case '仕掛品':

			this.DOM.form.variety.value = '';
			this.DOM.form.name.removeAttribute('disabled');
			this.DOM.form.variety.setAttribute('disabled', 'disabled');
			this.DOM.form.next_process.value = '';
			this.DOM.form.next_process.setAttribute('disabled', 'disabled');
			this.DOM.form.unit.removeAttribute('disabled');
			this.DOM.form.submit.removeAttribute('disabled');

			break;
		case '製品':

			this.DOM.form.name.removeAttribute('disabled');
			this.DOM.form.variety.removeAttribute('disabled');
			this.DOM.form.next_process.value = '';
			this.DOM.form.next_process.setAttribute('disabled', 'disabled');
			this.DOM.form.unit.removeAttribute('disabled');
			this.DOM.form.submit.removeAttribute('disabled');

			break;
		case '貯蔵品':

			this.DOM.form.name.removeAttribute('disabled');
			this.DOM.form.variety.value = '';
			this.DOM.form.variety.setAttribute('disabled', 'disabled');
			this.DOM.form.next_process.value = '';
			this.DOM.form.next_process.setAttribute('disabled', 'disabled');
			this.DOM.form.unit.removeAttribute('disabled');
			this.DOM.form.submit.removeAttribute('disabled');

			break;
		case 'ダスト':

			this.DOM.form.name.removeAttribute('disabled');
			this.DOM.form.variety.value = '';
			this.DOM.form.variety.setAttribute('disabled', 'disabled');
			this.DOM.form.next_process.value = '';
			this.DOM.form.next_process.setAttribute('disabled', 'disabled');
			this.DOM.form.unit.removeAttribute('disabled');
			this.DOM.form.submit.removeAttribute('disabled');

			break;
		}

	}

	function api_createProduct() {
		
		const params = {
			product_type : this.DOM.form.type.value,
			product_variety : this.DOM.form.variety.value,
			product_name : this.DOM.form.name.value,
			next_process : this.DOM.form.next_process.value,
			unit : this.DOM.form.unit.value
		}

		const ajax = new XMLHttpRequest();
		ajax.open('POST', '/admin/api/v1/createProduct');
		ajax.setRequestHeader('Content-Type', 'application/json');
		ajax.responseType = 'json';
		ajax.send(JSON.stringify(params));

		ajax.onload = () => {

			let res = ajax.response;

			if(res.err) {
				throw res.msg;
			}
			
			this.API.clearForm();
			this.API.appendProduct(res.msg);

		}

	}

	function api_updateProduct() {

		const params = {
			product_uuid : this.MEM.isEdit.data.product_uuid,
			product_type : this.DOM.form.type.value,
			product_variety : this.DOM.form.variety.value,
			product_name : this.DOM.form.name.value,
			next_process : this.DOM.form.next_process.value,
			unit : this.DOM.form.unit.value
		}

		const ajax = new XMLHttpRequest();
		ajax.open('POST', '/admin/api/v1/updateProduct');
		ajax.setRequestHeader('Content-Type', 'application/json');
		ajax.responseType = 'json';
		ajax.send(JSON.stringify(params));

		ajax.onload = () => {

			let res = ajax.response;

			if(res.err) {
				throw res.msg;
			}
	
			// Update the row
			
			console.log(this.MEM.isEdit);

			this.MEM.isEdit.data.product_type = this.DOM.form.type.value;
			this.MEM.isEdit.data.product_variety = this.DOM.form.variety.value;
			this.MEM.isEdit.data.product_name = this.DOM.form.name.value;
			this.MEM.isEdit.data.next_process = this.DOM.form.next_process.value;
			this.MEM.isEdit.data.unit = this.DOM.form.unit.value;

			this.MEM.isEdit.cells[2].textContent = this.MEM.isEdit.data.product_type;
			this.MEM.isEdit.cells[3].textContent = this.MEM.isEdit.data.product_variety;
			this.MEM.isEdit.cells[4].textContent = this.MEM.isEdit.data.product_name;
			this.MEM.isEdit.cells[5].textContent = this.MEM.isEdit.data.next_process;
			this.MEM.isEdit.cells[8].textContent = this.MEM.isEdit.data.unit;

			// Clear the form

			this.API.clearForm();

		}

	}

	function evt_handleFormCancelClick() {
		
		this.API.clearForm();

	}

	function evt_handleCheckbox(evt) {

		let elem = evt.target;
		let userData = elem.userData;
		if(!userData) {
			return;
		}
		
		if(elem.checked) {
			userData.row.classList.add('selected');
		} else {
			userData.row.classList.remove('selected');
		}
		
		let count = 0;
		this.MEM.userData.forEach(u => {
			if(!u.checkbox.checked) {
				return;
			}
			count++;
		});
		
		this.DOM.table.all.textContent = count;
		this.API.checkExportEnabled();


	}

	function evt_handleTableEditClick(evt) {
		
		evt.preventDefault();

		let elem = evt.target;
		let userData = elem.userData;
		if(!userData) {
			return;
		}
		

		this.MEM.isEdit = userData;
		userData.row.classList.add('edit');
		this.DOM.form.label.textContent = '編集';
		this.DOM.form.type.value = userData.data.product_type;
		this.DOM.form.variety.value = userData.data.product_variety;
		this.DOM.form.name.value = userData.data.product_name;
		this.DOM.form.next_process.value = userData.data.next_process;
		this.DOM.form.unit.value = userData.data.unit;
		
		this.EVT.handleSelectChange();

	}

	function evt_handleTableRemoveClick(evt) {

		evt.preventDefault();

		let elem = evt.target;
		let userData = elem.userData;
		if(!userData) {
			return;
		}

		let bool = confirm("Would you like to remove this product?");
		if(!bool) {
			return;
		}
		
		let params = {
			product_uuid : userData.data.product_uuid
		}

		const ajax = new XMLHttpRequest();
		ajax.open('POST', '/admin/api/v1/removeProduct');
		ajax.setRequestHeader('Content-Type', 'application/json');
		ajax.responseType = 'json';
		ajax.send(JSON.stringify(params));

		ajax.onload = () => {
			
			// Remove DOM element

			let label = userData.row.parentNode;
			label.parentNode.removeChild(label);
			
			// Remove reference from memory
			
			let index = this.MEM.userData.indexOf(userData);
			this.MEM.userData.splice(index, 1);
			
			// Update row numbers
			
			console.log(this.MEM.userData);

			let count = 0;
			for(let i = 0; i < this.MEM.userData.length; i++) {
				if(!this.MEM.userData[i].cells) {
					continue;
				}
				
				let str = (i + 1).toString();
				while(str.length < 3) {
					str = "0" + str;
				}
				this.MEM.userData[i].cells[1].textContent = str;

				if(this.MEM.userData[i].checkbox.checked) {
					count++;
				}
			}

			this.API.clearForm();
			this.DOM.table.all.textContent = count;
			this.DOM.table.count.textContent = this.MEM.userData.length;
			this.API.checkExportEnabled();

		}

	}

	function evt_handleTableExport() {
		
		if(!this.MEM.userData) {
			return;
		}

		const data = [];
		this.MEM.userData.forEach( u => {
			if(!u.checkbox.checked) {
				return;
			}

			data.push(u.data);
		});
		
		let json = {};
		data.forEach( d => {
			
			switch(d.product_type) {
			case '製品':
				json[d.product_type] = json[d.product_type] || {};
				if(!json[d.product_type][d.product_variety]) {
					json[d.product_type][d.product_variety] = [];
				}
				json[d.product_type][d.product_variety].push(d.product_name);
				break;
			case '原材料':
				json[d.product_type] = json[d.product_type] || [];
				json[d.product_type].push({
					name : d.product_name,
					next : d.next_process
				});
				break;
			default:
				json[d.product_type] = json[d.product_type] || [];
				json[d.product_type].push(d.product_name);
				break;
			}

		});
		
		json = this.API.createJSON();
		let text = JSON.stringify(json, null, 4);
		// copyTextToClipboard(text);
		
		let time = Date.now();
		let mime = {type: "text/plain;charset=utf-8"};
		let file = new File([text], time + ".json", mime);
		saveAs(file);

	}

	function evt_handleFormSubmitClick() {

		console.log(this.MEM);

		if(this.MEM.isEdit) {
			console.log("Doing the edit, update product");
			this.API.updateProduct();
		} else {
			console.log("Not an edit, creating product");
			this.API.createProduct();
		}

	}

	function api_clearForm() {

		this.MEM.isEdit = null;

		this.DOM.form.label.textContent = '追加';
		this.DOM.form.type.selectedIndex = 0;
		this.DOM.form.variety.value = '';
		this.DOM.form.name.value = '';
		this.DOM.form.next_process.value = '';
		this.DOM.form.unit.selectedIndex = 0;

		this.EVT.handleSelectChange();
		
		if(!this.MEM.userData) {
			return;
		}

		this.MEM.userData.forEach( u => {
			u.row.classList.remove('edit');
		});

	}

	function api_selectProducts() {
		
		const params = {}
		this.MEM.userData = [];
		this.DOM.table.body.innerHTML = '';

		const ajax = new XMLHttpRequest();
		ajax.open('POST', '/admin/api/v1/selectProducts');
		ajax.setRequestHeader('Content-Type', 'application/json');
		ajax.responseType = 'json';
		ajax.send(JSON.stringify(params));

		ajax.onload = () => {

			let res = ajax.response;
			if(res.err) {
				throw res.msg;
			}

			this.MEM.products = res.msg;
			this.API.renderProducts();

		}

	}

	function api_renderProducts() {
		
		this.DOM.table.count.textContent = this.MEM.products.length;

		this.MEM.products.forEach( product => {
			this.API.appendProduct(product);
		});

	}

	function api_appendProduct(product) {
		
		let tbl = this.DOM.table.body;

		// Prepare placeholder

		const userData = {
			data : product
		};

		this.MEM.userData.push(userData);
		this.DOM.table.count.textContent = this.MEM.userData.length;

		// Prepare the DOM elements

		const label = document.createElement('label');
		const table = document.createElement('table');
		const row = table.insertRow();
		userData.row = row;

		const c0 = row.insertCell();
		const c1 = row.insertCell();
		const c2 = row.insertCell();
		const c3 = row.insertCell();
		const c4 = row.insertCell();
		const c5 = row.insertCell();
		const c5a = row.insertCell();
		const c6 = row.insertCell();
		const c7 = row.insertCell();

		userData.cells = [ c0, c1, c2, c3, c4, c5, c6, c7, c5a ];

		c0.setAttribute('class', 'no');
		c1.setAttribute('class', 'no');
		
		c2.setAttribute('class', 'type');
		c3.setAttribute('class', 'var');
		c5.setAttribute('class', 'next');
		c5a.setAttribute('class', 'unit');

		c6.setAttribute('class', 'edit');
		c7.setAttribute('class', 'edit');

		// Cell 0

		let str = this.MEM.userData.length.toString();
		while(str.length < 3) {
			str = '0' + str;
		}
		c1.textContent = str;

		// Cell 1

		const checkbox = document.createElement('input');
		checkbox.setAttribute('type', 'checkbox');
		c0.appendChild(checkbox);
		checkbox.addEventListener('change', this.EVT.handleCheckbox);
		userData.checkbox = checkbox;

		// Cell 2

		c2.textContent = product.product_type;

		// Cell 3

		c3.textContent = product.product_variety;

		// Cell 4

		c4.textContent = product.product_name;

		// Cell 5

		c5.textContent = product.next_process;

		// Cell 5a
		
		c5a.textContent = product.unit;

		switch(product.product_type) {
		case '製品':
			c5.classList.add('disabled');
			break;
		case '仕掛品':
		case '貯蔵品':
		case 'ダスト':
			c3.classList.add('disabled');
			c5.classList.add('disabled');
			break;
		case '原材料':
			c3.classList.add('disabled');
			break;
		}

		// Cell 6

		const edit = document.createElement('span');
		edit.textContent = '編集';
		c6.appendChild(edit);
		edit.addEventListener('click', this.EVT.handleTableEditClick);
		userData.edit = edit;

		// Cell 7

		const remove = document.createElement('span');
		remove.textContent = '削除';
		c7.appendChild(remove);
		remove.addEventListener('click', this.EVT.handleTableRemoveClick);
		userData.remove = remove;

		// Append Userdata to DOM elements

		checkbox.userData = userData;
		edit.userData = userData;
		remove.userData = userData;

		// Append to Table

		label.appendChild(table);
		this.DOM.table.body.appendChild(label);

	}

}).apply({});
