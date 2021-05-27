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

const StaffManager = (function() {

	this.MEM = {
		userData : []
	}

	this.DOM = {
		table : {
			body : document.getElementById('StaffManager.table.body')
		},
		form : {
			staff_position : document.getElementById('StaffManager.form.staff_position'),
			staff_name : document.getElementById('StaffManager.form.staff_name'),
			staff_login : document.getElementById('StaffManager.form.staff_login'),
			staff_email : document.getElementById('StaffManager.form.staff_email'),
			staff_password : document.getElementById('StaffManager.form.staff_password'),
			staff_location : document.getElementById('StaffManager.form.staff_location'),
			cancel : document.getElementById('StaffManager.form.cancel'),
			submit : document.getElementById('StaffManager.form.submit'),
			label : document.getElementById('StaffManager.form.label')
		}
	}

	this.EVT = {
		handleCancelClick : evt_handleCancelClick.bind(this),
		handleSubmitClick : evt_handleSubmitClick.bind(this),
		handleEditClick : evt_handleEditClick.bind(this),
		handleRemoveClick : evt_handleRemoveClick.bind(this),
		handleLockClick : evt_handleLockClick.bind(this),
		handleUnlockClick : evt_handleUnlockClick.bind(this),
		handleSelectChange : evt_handleSelectChange.bind(this)
	}

	this.API = {
		clearForm : api_clearForm.bind(this),
		submitForm : api_submitForm.bind(this),
		selectStaff : api_selectStaff.bind(this),
		renderStaff : api_renderStaff.bind(this),
		renderLocations : api_renderLocations.bind(this),
		updateStaff : api_updateStaff.bind(this),
		updatePosition : api_updatePosition.bind(this)
	}

	init.apply(this);
	return this;

	function init() {

		// Add Event Listeners

		this.DOM.form.cancel.addEventListener('click', this.EVT.handleCancelClick);
		this.DOM.form.submit.addEventListener('click', this.EVT.handleSubmitClick);
		this.DOM.form.staff_position.addEventListener('click', this.EVT.handleSelectChange);

		// Call Internal Functions
		
		this.API.clearForm();
		this.API.selectStaff();
		this.API.updatePosition();

	}

	function evt_handleSelectChange() {

		this.API.updatePosition();

	}

	function api_updatePosition() {

		if(!this.MEM.inputs) {
			return setTimeout(this.API.updatePosition, 500);
		}

		if(this.DOM.form.staff_position.value === '') {

			this.DOM.form.staff_name.setAttribute('disabled', 'disabled');
			this.DOM.form.staff_login.setAttribute('disabled', 'disabled');
			this.DOM.form.staff_email.setAttribute('disabled', 'disabled');
			this.DOM.form.staff_password.setAttribute('disabled', 'disabled');
			this.DOM.form.submit.setAttribute('disabled', 'disabled');
			this.MEM.inputs.forEach(input => {
				input.checkbox.checked = false;
				input.checkbox.setAttribute('disabled', 'disabled');
			});

		} else if(this.DOM.form.staff_position.value === '担当') {

			this.DOM.form.staff_name.removeAttribute('disabled');
			this.DOM.form.staff_login.removeAttribute('disabled');
			this.DOM.form.staff_email.removeAttribute('disabled');
			this.DOM.form.staff_password.removeAttribute('disabled');
			this.DOM.form.submit.removeAttribute('disabled');

			this.MEM.inputs.forEach(input => {
				input.checkbox.checked = false;
				input.checkbox.setAttribute('type', 'radio');
				input.checkbox.removeAttribute('disabled');
			});

		} else {

			this.DOM.form.staff_name.removeAttribute('disabled');
			this.DOM.form.staff_login.removeAttribute('disabled');
			this.DOM.form.staff_email.removeAttribute('disabled');
			this.DOM.form.staff_password.removeAttribute('disabled');
			this.DOM.form.submit.removeAttribute('disabled');

			this.MEM.inputs.forEach(input => {
				input.checkbox.checked = false;
				input.checkbox.setAttribute('type', 'checkbox');
				input.checkbox.removeAttribute('disabled');
			});

		}


	}

	function evt_handleLockClick(evt) {

		let elem = evt.target;
		let userData = elem.userData;

		if(!userData) {
			return;
		}

		let bool = confirm("Would you like to lock this account?");
		if(!bool) {
			return;
		}

		// Send a lock request
		
		const params = {
			staff_uuid : userData.staff_uuid
		}

		const ajax = new XMLHttpRequest();
		ajax.open('POST', '/admin/api/v1/lockAccount');
		ajax.setRequestHeader('Content-Type', 'application/json');
		ajax.responseType = 'json';
		ajax.send(JSON.stringify(params));

		ajax.onload = () => {
			let res = ajax.response;
			if(res.err) {
				throw res.msg;
			}
			
			this.API.selectStaff();
		}

	}

	function evt_handleUnlockClick(evt) {

		let elem = evt.target;
		let userData = elem.userData;

		if(!userData) {
			return;
		}

		let bool = confirm("Would you like to unlock this account?");
		if(!bool) {
			return;
		}

		// Send an unlock request
		
		const params = {
			staff_uuid : userData.staff_uuid
		}

		const ajax = new XMLHttpRequest();
		ajax.open('POST', '/admin/api/v1/unlockAccount');
		ajax.setRequestHeader('Content-Type', 'application/json');
		ajax.responseType = 'json';
		ajax.send(JSON.stringify(params));

		ajax.onload = () => {
			let res = ajax.response;
			if(res.err) {
				throw res.msg;
			}
			
			this.API.selectStaff();
		}

	}

	function evt_handleEditClick(evt) {
		
		let elem = evt.target;
		let userData = elem.userData;
		if(!userData) {
			return;
		}

		userData.row.classList.add('edit');

		this.DOM.form.label.textContent = '編集';
		this.DOM.form.staff_position.value = userData.data.staff_position;
		this.DOM.form.staff_name.value = userData.data.staff_name;
		this.DOM.form.staff_login.setAttribute('disabled', 'disabled');
		this.DOM.form.staff_login.value = userData.data.staff_login;
		this.DOM.form.staff_email.value = userData.data.staff_email;
		
		this.DOM.form.staff_password.value = '';
		this.DOM.form.staff_password.setAttribute('placeholder', 'リセットする場合記入');
		this.API.updatePosition();

		this.MEM.inputs.forEach(input => {
		
			let loc_uuids = userData.data.staff_location || [];
			if(loc_uuids.indexOf(input.location_uuid) === -1) {
				input.checkbox.checked = false;
			} else {
				input.checkbox.checked = true;
			}

		});

		this.MEM.edit = userData;

	}

	function evt_handleRemoveClick(evt) {
		
		let elem = evt.target;
		let userData = elem.userData;
		if(!userData) {
			return;
		}
		
		let bool = confirm("Would you like to remove this staff?");
		if(!bool) {
			return;
		}

		const params = {
			staff_uuid : userData.data.staff_uuid
		}

		const ajax = new XMLHttpRequest();
		ajax.open('POST', '/admin/api/v1/removeStaff');
		ajax.setRequestHeader('Content-Type', 'application/json');
		ajax.responseType = 'json';
		ajax.send(JSON.stringify(params));

		ajax.onload = () => {

			let res = ajax.response;
			if(res.err) {
				throw res.msg;
			}

			this.API.clearForm();
			this.API.selectStaff();

		}

	}

	function api_renderLocations(locations) {
		
		locations.sort( (a, b) => {
			
			let nameA = a.location_name;
			let nameB = b.location_name;

			if (nameA > nameB) {
				return 1;
			} else if (nameA < nameB) {
				return -1;
			} else {
				return 0;
			}

		});
		
		this.MEM.inputs = [];
		this.DOM.form.staff_location.innerHTML = '';
		locations.forEach ( loc => {

			let label = document.createElement('label');
			let input = document.createElement('input');
			input.setAttribute('name', 'staff-sel-location');
			input.setAttribute('type', 'checkbox');

			let node = document.createTextNode(loc.location_name);
			label.appendChild(input);
			label.appendChild(node);
			this.DOM.form.staff_location.appendChild(label);

			this.MEM.inputs.push({
				checkbox : input,
				location_uuid : loc.location_uuid
			});

		});

	}

	function evt_handleCancelClick() {

		this.API.clearForm();

	}

	function evt_handleSubmitClick() {
		
		if(!this.MEM.edit) {
			this.API.submitForm();
		} else {
			this.API.updateStaff();
		}

	}

	function api_clearForm() {
		
		this.DOM.form.label.textContent = '追加';
		this.DOM.form.staff_position.selectedIndex = 0;
		this.DOM.form.staff_name.value = '';
		this.DOM.form.staff_login.value = '';
		this.DOM.form.staff_email.value = '';
		this.DOM.form.staff_password.value = '';
		this.DOM.form.staff_password.setAttribute('placeholder', 'Staff Password');
		this.DOM.form.staff_login.removeAttribute('disabled');
		
		this.MEM.userData.forEach( u => {
			u.row.classList.remove('edit');
		});
		
		this.MEM.edit = null;

		if(!this.MEM.inputs) {
			return;
		}

		this.MEM.inputs.forEach(input => {
			input.checkbox.checked = false;
		});
		

	}

	function api_submitForm() {

		let staff_locations = [];
		this.MEM.inputs.forEach( ipt => {
			if(!ipt.checkbox.checked) {
				return;
			}
			staff_locations.push(ipt.location_uuid);
		});

		const params = {
			staff_position : this.DOM.form.staff_position.value,
			staff_name : this.DOM.form.staff_name.value,
			staff_login : this.DOM.form.staff_login.value,
			staff_email : this.DOM.form.staff_email.value,
			staff_password : this.DOM.form.staff_password.value,
			staff_locations : staff_locations
		};

		const ajax = new XMLHttpRequest();
		ajax.open('POST', '/admin/api/v1/addStaff');
		ajax.setRequestHeader('Content-Type', 'application/json');
		ajax.responseType = 'json';
		ajax.send(JSON.stringify(params));

		ajax.onload = () => {

			let res = ajax.response;
			if(res.err) {
				throw res.msg;
			}

			this.API.clearForm();
			this.API.updatePosition();
			this.API.selectStaff();

		}

	}

	function api_updateStaff() {

		let staff_locations = [];
		this.MEM.inputs.forEach( ipt => {
			if(!ipt.checkbox.checked) {
				return;
			}
			staff_locations.push(ipt.location_uuid);
		});

		const params = {
			staff_uuid : this.MEM.edit.data.staff_uuid,
			staff_position : this.DOM.form.staff_position.value,
			staff_name : this.DOM.form.staff_name.value,
			staff_email : this.DOM.form.staff_email.value,
			staff_locations : staff_locations
		}

		if(this.DOM.form.staff_password.value.length) {
			params.staff_password = this.DOM.form.staff_password.value;
		}

		const ajax = new XMLHttpRequest();
		ajax.open('POST', '/admin/api/v1/updateStaff');
		ajax.setRequestHeader('Content-Type', 'application/json');
		ajax.responseType = 'json';
		ajax.send(JSON.stringify(params));

		ajax.onload = () => {

			let res = ajax.response;
			if(res.err) {
				throw res.msg;
			}

			this.API.clearForm();
			this.API.selectStaff();

		}


	}

	function api_selectStaff() {

		this.MEM.userData = [];

		const ajax = new XMLHttpRequest();
		ajax.open('POST', '/admin/api/v1/selectStaff');
		ajax.setRequestHeader('Content-Type', 'application/json');
		ajax.responseType = 'json';
		ajax.send(JSON.stringify({}));

		ajax.onload = () => {
			
			let res = ajax.response;

			if(res.err) {
				throw res.msg;
			}

			this.MEM.staff_list = res.msg.staff;
			this.MEM.loc_list = {};
			res.msg.locs.forEach( loc => {
				this.MEM.loc_list[loc.location_uuid] = loc.location_name;
			});

			this.API.renderStaff();

		}

	}

	function api_renderStaff() {

		this.DOM.table.body.innerHTML = '';
		let index = 0;

		this.MEM.staff_list.forEach( staff => {

			const userData = {
				data  : staff
			}
			this.MEM.userData.push(userData);

			index++;
			let row = this.DOM.table.body.insertRow();
			userData.row = row;
			
			let c0 = row.insertCell();
			let c1 = row.insertCell();
			let c1b = row.insertCell();
			let c2 = row.insertCell();
			let c3 = row.insertCell();
			let c4 = row.insertCell();
			let c7 = row.insertCell();
			let c8 = row.insertCell();
			let c5 = row.insertCell();
			let c6 = row.insertCell();

			c0.setAttribute('class', 'no');

			c1.setAttribute('class', 'sa');
			c1b.setAttribute('class', 'sb');
			c2.setAttribute('class', 'sc');
			c3.setAttribute('class', 'sd');
			c4.setAttribute('class', 'se');
			c7.setAttribute('class', 'sf');
			c8.setAttribute('class', 'lock');

			c5.setAttribute('class', 'edit');
			c6.setAttribute('class', 'edit');

			let str = index.toString();
			while(str.length < 3) {
				str = '0' + str;
			}

			c0.textContent = str;
			c1.textContent = staff.staff_position;
			c1b.textContent = staff.staff_name;
			c2.textContent = staff.staff_login;
			c3.textContent = staff.staff_email;

			if(!staff.last_active) {
				c4.textContent = 'Not Active';
			} else {
				let time = moment(staff.last_active);
				time.add(9, 'hours');
				c4.textContent = time.fromNow();
			}

			if(parseInt(staff.account_locked)) {

				let a = document.createElement("a");
				a.setAttribute("class", "lock ng");

				let txt = document.createTextNode(" ログイン不可");
				let i = document.createElement("i");
				i.setAttribute("class", "fas fa-lock");

				a.appendChild(i);
				a.appendChild(txt);
				c8.appendChild(a);
				
				a.userData = staff;
				a.addEventListener('click', this.EVT.handleUnlockClick);

			} else {
				
				let a = document.createElement("a");
				a.setAttribute("class", "lock okay");

				let txt = document.createTextNode(" ログイン可");
				let i = document.createElement("i");
				i.setAttribute("class", "fas fa-unlock");

				a.appendChild(i);
				a.appendChild(txt);
				c8.appendChild(a);
				
				a.userData = staff;
				a.addEventListener('click', this.EVT.handleLockClick);

			}

			const edit = document.createElement('span');
			edit.textContent = '編集';
			c5.appendChild(edit);
			userData.edit = edit;
			edit.userData = userData;
			edit.addEventListener('click', this.EVT.handleEditClick);

			const remove = document.createElement('span');
			remove.textContent = '削除';
			c6.appendChild(remove);
			userData.remove = remove;
			remove.userData = userData;
			remove.addEventListener('click', this.EVT.handleRemoveClick);
			
			if(!staff.staff_location) {
				return;
			}

			staff.staff_location.forEach( uuid => {
				let span = document.createElement("a");
				span.classList.add("block");
				span.textContent = this.MEM.loc_list[uuid];
				c7.appendChild(span);
			});

		});


	}

}).apply({});
