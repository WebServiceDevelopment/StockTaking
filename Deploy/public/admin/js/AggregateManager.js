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

const AggregateManager = (function() {

	this.MEM = {}

	this.DOM = {
		form : {
			select : document.getElementById('AggregateManager.form.select'),
			name : document.getElementById('AggregateManager.form.name'),
			cancel : document.getElementById('AggregateManager.form.cancel'),
			submit : document.getElementById('AggregateManager.form.submit'),
			label : document.getElementById('AggregateManager.form.label')
		},
		table : {
			group_1 : document.getElementById('AggregateManager.form.group_1'),
			group_2 : document.getElementById('AggregateManager.form.group_2')
		}
	}

	this.EVT = {
		handleSubmitClick : evt_handleSubmitClick.bind(this),
		handleCancelClick : evt_handleCancelClick.bind(this),
		handleEditClick : evt_handleEditClick.bind(this),
		handleRemoveClick : evt_handleRemoveClick.bind(this)
	}

	this.API = {
		createAggregate : api_createAggregate.bind(this),
		selectAggregate : api_selectAggregate.bind(this),
		removeAggregate : api_removeAggregate.bind(this),
		updateAggregate : api_updateAggregate.bind(this),
		appendGroup : api_appendGroup.bind(this),
		clearForm : api_clearForm.bind(this)
	}

	init.apply(this);
	return this;

	function init() {

		this.DOM.form.cancel.addEventListener('click', this.EVT.handleCancelClick);
		this.DOM.form.submit.addEventListener('click', this.EVT.handleSubmitClick);

		this.API.selectAggregate();

	}

	function evt_handleSubmitClick() {

		if(!this.MEM.edit) {
			this.API.createAggregate();
		} else {
			this.API.updateAggregate();
		}

	}

	function evt_handleCancelClick() {

		this.API.clearForm();

	}

	function api_updateAggregate() {

		let group = this.MEM.edit;

		const params = {
			aggregate_uuid : group.data.aggregate_uuid,
			aggregate_group : this.DOM.form.select.value, 
			aggregate_name : this.DOM.form.name.value
		}

		const ajax = new XMLHttpRequest();
		ajax.open('POST', '/admin/api/v1/updateAggregate');
		ajax.setRequestHeader('Content-Type', 'application/json');
		ajax.responseType = 'json';
		ajax.send(JSON.stringify(params));

		ajax.onload = () => {

			let res = ajax.response;
			if(res.err) {
				throw res.msg;
			}
			
			this.API.clearForm();
			this.MEM.edit = null;
			this.API.selectAggregate();

		}

	}

	function api_createAggregate() {

		const params = {
			aggregate_group : this.DOM.form.select.value, 
			aggregate_name : this.DOM.form.name.value
		}

		const ajax = new XMLHttpRequest();
		ajax.open('POST', '/admin/api/v1/createAggregate');
		ajax.setRequestHeader('Content-Type', 'application/json');
		ajax.responseType = 'json';
		ajax.send(JSON.stringify(params));

		ajax.onload = () => {

			let res = ajax.response;
			if(res.err) {
				throw res.msg;
			}
			
			this.API.clearForm();
			this.API.appendGroup(res.msg);

		}

	}

	function api_selectAggregate() {
		
		this.MEM.groups = [];
		this.DOM.table.group_1.innerHTML = '';
		this.DOM.table.group_2.innerHTML = '';

		const params = {}

		const ajax = new XMLHttpRequest();
		ajax.open('POST', '/admin/api/v1/selectAggregate');
		ajax.setRequestHeader('Content-Type', 'application/json');
		ajax.responseType = 'json';
		ajax.send(JSON.stringify(params));

		ajax.onload = () => {

			let res = ajax.response;
			if(res.err) {
				throw res.msg;
			}
			
			res.msg.forEach( group => {
				this.API.appendGroup(group);
			});

		}

	}

	function api_appendGroup(group) {

		let table = this.DOM.table[group.aggregate_group];
		if(!table) {
			return;
		}

		const userData = {
			data : group
		}
		
		const row = table.insertRow();
		userData.row = row;

		const c0 = row.insertCell();
		const c1 = row.insertCell();
		const c2 = row.insertCell();
		const c3 = row.insertCell();

		userData.cells = [ c0, c1, c2, c3 ];

		c0.setAttribute('class', 'no');
		c2.setAttribute('class', 'edit_2');
		c3.setAttribute('class', 'edit_2');

		let str = table.rows.length.toString();
		while(str.length < 3) {
			str = '0' + str;
		}

		c0.textContent = str;
		c1.textContent = group.aggregate_name;

		const edit = document.createElement('span');
		edit.textContent = '編集';
		edit.addEventListener('click', this.EVT.handleEditClick);
		userData.edit = edit;
		edit.userData = userData;
		c2.appendChild(edit);
		
		const remove = document.createElement('span');
		remove.textContent = '削除';
		remove.addEventListener('click', this.EVT.handleRemoveClick);
		userData.remove = remove;
		remove.userData = userData;
		c3.appendChild(remove);

	}

	function api_clearForm() {
	
		this.DOM.form.label.textContent = '追加';
		this.DOM.form.select.selectedIndex = 0;
		this.DOM.form.name.value = '';

	}

	function evt_handleEditClick(evt) {

		let elem = evt.target;
		let userData = elem.userData;
		if(!userData) {
			return;
		}
		
		this.MEM.edit = userData;
		this.DOM.form.label.textContent = '編集';
		this.DOM.form.select.value = userData.data.aggregate_group;
		this.DOM.form.name.value = userData.data.aggregate_name;
		userData.row.classList.add('edit_2');

	}

	function evt_handleRemoveClick(evt) {

		let elem = evt.target;
		let userData = elem.userData;
		if(!userData) {
			return;
		}

		let bool = confirm('Would you like to remove this group?');
		if(!bool) {
			return;
		}

		this.API.removeAggregate(userData.data);
		
		let group = userData.data;
		let table = this.DOM.table[group.aggregate_group];

		let index;
		for(let i = 0; i < table.rows.length; i++) {
			if(userData.row !== table.rows[i]) {
				continue;
			}

			index = i;
			break;
		}
		table.deleteRow(index);
		
		let rows = table.rows;
		for(let i = 0; i < rows.length; i++) {
			let str = (i + 1).toString();
			while(str.length < 3) {
				str = '0' + str;
			}

			rows[i].cells[0].textContent = str;
		}

	}

	function api_removeAggregate(group) {

		const params = {
			aggregate_uuid : group.aggregate_uuid
		}

		const ajax = new XMLHttpRequest();
		ajax.open('POST', '/admin/api/v1/removeAggregate');
		ajax.setRequestHeader('Content-Type', 'application/json');
		ajax.responseType = 'json';
		ajax.send(JSON.stringify(params));

		ajax.onload = () => {

			let res = ajax.response;
			if(res.err) {
				throw res.msg;
			}
			
		}

	}

}).apply({});
