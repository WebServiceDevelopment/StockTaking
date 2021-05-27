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

const LocationManager2 = (function() {

	this.MEM = {}

	this.DOM = {
		form : {
			name : document.getElementById('LocationManager2.form.name'),
			map_div : document.getElementById('LocationManager2.form.map_div'),
			map_file : document.getElementById('LocationManager2.form.map_file'),
			area : document.getElementById('LocationManager2.form.area'),
			json : document.getElementById('LocationManager2.form.json'),
			cancel : document.getElementById('LocationManager2.form.cancel'),
			submit : document.getElementById('LocationManager2.form.submit'),
			label : document.getElementById('LocationManager2.form.label'),
			preview : document.getElementById('LocationManager2.form.preview')
		},
		table : {
			body : document.getElementById('LocationManager2.table.body')
		}
	}

	this.EVT = {
		handleImageDrop : evt_handleImageDrop.bind(this),
		handleImageDragEnter : evt_handleImageDragEnter.bind(this),
		handleImageDragLeave : evt_handleImageDragLeave.bind(this),
		handleImageDragOver : evt_handleImageDragOver.bind(this),

		handleCancelClick : evt_handleCancelClick.bind(this),
		handleSubmitClick : evt_handleSubmitClick.bind(this),
		handleEditClick : evt_handleEditClick.bind(this),
		handleRemoveClick : evt_handleRemoveClick.bind(this),
		handleMapClick : evt_handleMapClick.bind(this),
		handleFileChange : evt_handleFileChange.bind(this)
	}

	this.API = {
		selectLocations : api_selectLocations.bind(this),
		appendLocation : api_appendLocation.bind(this),
		createLocation : api_createLocation.bind(this),
		updateLocation : api_updateLocation.bind(this),
		removeLocation : api_removeLocation.bind(this),
		readImageFile : api_readImageFile.bind(this),
		clearForm : api_clearForm.bind(this),
		updateStaff : api_updateStaff.bind(this)
	}

	init.apply(this);
	return this;

	function init() {

		this.API.selectLocations();

		this.DOM.form.cancel.addEventListener('click', this.EVT.handleCancelClick);
		this.DOM.form.submit.addEventListener('click', this.EVT.handleSubmitClick);

		this.DOM.form.map_div.addEventListener('click', this.EVT.handleMapClick);
		this.DOM.form.map_file.addEventListener('change', this.EVT.handleFileChange);

		this.DOM.form.map_div.addEventListener('drop', this.EVT.handleImageDrop);
		this.DOM.form.map_div.addEventListener('dragenter', this.EVT.handleImageDragEnter);
		this.DOM.form.map_div.addEventListener('dragleave', this.EVT.handleImageDragLeave);
		this.DOM.form.map_div.addEventListener('dragover', this.EVT.handleImageDragOver);

	}

	function evt_handleImageDrop(evt) {

		evt.stopPropagation();
		evt.preventDefault();
		
		this.DOM.form.map_div.classList.remove('hover');
		let files = evt.dataTransfer.files;
		this.API.readImageFile(files[0]);

	}

	function evt_handleImageDragEnter(evt) {

		this.DOM.form.map_div.classList.add('hover');
		evt.stopPropagation();
		evt.preventDefault();

	}

	function evt_handleImageDragLeave(evt) {

		this.DOM.form.map_div.classList.remove('hover');
		evt.stopPropagation();
		evt.preventDefault();

	}

	function evt_handleImageDragOver(evt) {

		evt.stopPropagation();
		evt.preventDefault();

	}


	function evt_handleMapClick() {
		
		this.DOM.form.map_file.click();

	}

	function evt_handleFileChange(evt) {

		let files = evt.target.files;
		if(!files.length) {
			return;
		}

		let file = files[0];
		this.API.readImageFile(file);

	}

	function evt_handleEditClick(evt) {

		console.log("handle edit click!!!");

		let elem = evt.target;
		let userData = elem.userData;
		if(!userData) {
			return;
		}
		
		this.MEM.edit = userData;
		userData.row.classList.add('edit');

		this.DOM.form.label.textContent = '編集';
		this.DOM.form.map_div.classList.add('open');

		const loc = userData.data;
		this.DOM.form.name.value = loc.location_name;

		let url = loc.location_map;
		this.DOM.form.preview.style.backgroundImage = `url('${url}')`;
		
		let places = JSON.parse(loc.location_places);
		this.DOM.form.area.value = '[' + places.join(',') + ']';

		const pre = document.createElement('pre');
		let products = JSON.parse(loc.location_products);
		this.DOM.form.json.value = JSON.stringify(products, null, 4);


	}

	function evt_handleRemoveClick(evt) {

		this.API.removeLocation(evt);

	}

	function evt_handleCancelClick() {

		this.API.clearForm();

	}

	function api_clearForm() {
		
		this.MEM.edit = null;
		this.MEM.base64 = null;

		this.MEM.userData.forEach( u => {
			u.row.classList.remove('edit');
		});

		this.DOM.form.label.textContent = '追加';
		this.DOM.form.map_div.classList.remove('open');
		this.DOM.form.preview.removeAttribute('style');

		this.DOM.form.name.value = '';
		this.DOM.form.area.value = '';
		this.DOM.form.json.value = '';

	}

	function evt_handleSubmitClick() {

		if(this.MEM.edit) {
			console.log("Update Location!!!");
			this.API.updateLocation();
		} else {
			console.log("Create Location!!");
			this.API.createLocation();
		}

	}

	function api_selectLocations() {
		
		this.MEM.userData = [];
		this.DOM.table.body.innerHTML = '';

		const params = {};

		const ajax = new XMLHttpRequest();
		ajax.open('POST', '/admin/api/v1/getLocations');
		ajax.setRequestHeader('Content-Type', 'application/json');
		ajax.responseType = 'json';
		ajax.send(JSON.stringify(params));

		ajax.onload = () => {
			
			let res = ajax.response;
			if(res.err) {
				throw res.msg;
			}
			
			this.MEM.locations = res.msg;

			this.MEM.locations.forEach( loc => {
				this.API.appendLocation(loc);
			});
			
			this.API.updateStaff();

		}

	}

	function api_appendLocation(loc) {

		const userData = {
			data : loc
		}

		this.MEM.userData.push(userData);

		const row = this.DOM.table.body.insertRow();
		userData.row = row;

		const c0 = row.insertCell();
		const c1 = row.insertCell();
		const c2 = row.insertCell();
		const c3 = row.insertCell();
		const c4 = row.insertCell();
		const c5 = row.insertCell();
		const c6 = row.insertCell();

		userData.cells = [ c0, c1, c2, c3, c4, c5, c6 ];
		
		c0.setAttribute('class', 'no');
		c5.setAttribute('class', 'edit');
		c6.setAttribute('class', 'edit');

		c1.setAttribute('class', 'la');
		c2.setAttribute('class', 'lb');
		c3.setAttribute('class', 'lc');
		c4.setAttribute('class', 'ld');
		
		// No.

		let str = this.DOM.table.body.rows.length.toString();
		while(str.length < 3) {
			str = '0' + str;
		}
		c0.textContent = str;

		// ロケーション名

		c1.textContent = loc.location_name;

		// 場所文字
		
		let places = JSON.parse(loc.location_places);
		c2.textContent = '[' + places.join(',') + ']';

		// ロケーションマップ

		let image = new Image();
		let url = loc.location_map;
		image.src = url;
		c3.appendChild(image);
		userData.image = image;

		// ロケーション品名

		const pre = document.createElement('pre');
		let products = JSON.parse(loc.location_products);
		pre.textContent = JSON.stringify(products, null, 4);
		c4.appendChild(pre);
		userData.pre = pre;

		// Edit

		const edit = document.createElement('span');
		edit.textContent = '編集';
		c5.appendChild(edit);
		edit.addEventListener('click', this.EVT.handleEditClick);
		userData.edit = edit;
		edit.userData = userData;
		
		// Remove

		const remove = document.createElement('span');
		remove.textContent = '削除';
		c6.appendChild(remove);
		remove.addEventListener('click', this.EVT.handleRemoveClick);
		userData.remove = remove;
		remove.userData = userData;

	}

	function api_createLocation() {
		
		const params = {
			location_name : this.DOM.form.name.value,
			location_map : this.MEM.base64 || '',
			location_places : this.DOM.form.area.value,
			location_types : '',
			location_variety : '',
			location_products : this.DOM.form.json.value
		}

		try {
			params.location_places = JSON.parse(params.location_places);
		} catch(err) {
			return alert('場所文字 is not valid JSON');
		}

		try {
			params.location_products = JSON.parse(params.location_products);
		} catch(err) {
			return alert('ロケーション品名 is not valid JSON');
		}

		const ajax = new XMLHttpRequest();
		ajax.open('POST', '/admin/api/v1/addLocation');
		ajax.setRequestHeader('Content-Type', 'application/json');
		ajax.responseType = 'json';
		ajax.send(JSON.stringify(params));

		ajax.onload = () => {
		
			let res = ajax.response;
			if(res.err) {
				throw res.msg;
			}

			let loc = {
				location_uuid : res.msg,
				location_name : this.DOM.form.name.value,
				location_places : this.DOM.form.area.value,
				location_types : '',
				location_variety : '',
				location_products : this.DOM.form.json.value,
				location_map : this.MEM.base64 || ''
			}

			this.API.appendLocation(loc);
			this.API.clearForm();
			this.API.updateStaff();

		}


	}

	function api_updateLocation() {
		
		const params = {
			location_uuid : this.MEM.edit.data.location_uuid,
			location_name : this.DOM.form.name.value,
			location_places : this.DOM.form.area.value,
			location_types : '',
			location_variety : '',
			location_products : this.DOM.form.json.value
		}
		
		if(this.MEM.base64) {
			params.location_map = this.MEM.base64 || '';
		}

		try {
			params.location_places = JSON.parse(params.location_places);
		} catch(err) {
			return alert('場所文字 is not valid JSON');
		}

		try {
			params.location_products = JSON.parse(params.location_products);
		} catch(err) {
			return alert('ロケーション品名 is not valid JSON');
		}

		const ajax = new XMLHttpRequest();
		ajax.open('POST', '/admin/api/v1/updateLocation');
		ajax.setRequestHeader('Content-Type', 'application/json');
		ajax.responseType = 'json';
		ajax.send(JSON.stringify(params));

		ajax.onload = () => {
			
			let res = ajax.response;
			if(res.err) {
				throw err;
			}

			let userData = this.MEM.edit;
			let loc = userData.data;

			userData.cells[1].textContent = this.DOM.form.name.value;
			loc.location_name = this.DOM.form.name.value;

			userData.cells[2].textContent = this.DOM.form.area.value;
			loc.location_places = this.DOM.form.area.value;

			if(this.MEM.base64) {
				loc.location_map = this.MEM.base64;
				userData.image.src = this.MEM.base64;
			}
			
			userData.pre.textContent = this.DOM.form.json.value;
			loc.location_products = this.DOM.form.json.value;

			this.API.clearForm();
			this.API.updateStaff();

		}

	}

	function api_removeLocation(evt) {
		
		let elem = evt.target;
		let userData = elem.userData;
		if(!userData) {
			return;
		}

		let bool = confirm("Would you like to remove this location?");
		if(!bool) {
			return;
		}
		
		const params = {
			location_uuid : userData.data.location_uuid
		}

		const ajax = new XMLHttpRequest();
		ajax.open('POST', '/admin/api/v1/removeLocation');
		ajax.setRequestHeader('Content-Type', 'application/json');
		ajax.responseType = 'json';
		ajax.send(JSON.stringify(params));

		ajax.onload = () => {

			let res = ajax.response;
			if(res.msg) {
				throw res.msg;
			}

			this.API.selectLocations();

		}

	}

	function api_readImageFile(file) {

		let reader = new FileReader();

		reader.onload = evt => {
			
			this.DOM.form.map_div.classList.add('open');
			this.MEM.base64 = reader.result;
			let url = reader.result;
			this.DOM.form.preview.style.backgroundImage = `url('${url}')`;

		}

		reader.readAsDataURL(file);

	}

	function api_updateStaff() {
		
		const list = [];
		for(let i = 0; i < this.MEM.userData.length; i++) {
			list.push(this.MEM.userData[i].data);
		}

		StaffManager.API.renderLocations(list);

	}

}).apply({});
