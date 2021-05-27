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

const StatusManager = (function() {

	this.MEM = {}

	this.DOM = {
		table : {
			body : document.getElementById('StatusManager.table.body'),
			refresh : document.getElementById('StatusManager.table.refresh')
		},
		tfoot : {
			date : document.getElementById('StatusManager.tfoot.date'),
			complete : document.getElementById('StatusManager.tfoot.complete'),
			submit : document.getElementById('StatusManager.tfoot.submit')
		}
	}

	this.EVT = {
		handleEditClick : evt_handleEditClick.bind(this),
		handleSaveClick : evt_handleSaveClick.bind(this),
		handleCancelClick : evt_handleCancelClick.bind(this),
		handleSubmitClick : evt_handleSubmitClick.bind(this),
		handleRefreshClick : evt_handleRefreshClick.bind(this)
	}

	this.API = {
		selectStaff : api_selectStaff.bind(this),
		selectTypes : api_selectTypes.bind(this),
		selectStatus : api_selectStatus.bind(this),
		renderStatus : api_renderStatus.bind(this),
		updateStatus : api_updateStatus.bind(this),
		renderFooter : api_renderFooter.bind(this)
	}

	init.apply(this);
	return this;

	function init() {

		this.API.selectStaff();

		this.DOM.tfoot.submit.addEventListener('click', this.EVT.handleSubmitClick);
		this.DOM.table.refresh.addEventListener('click', this.EVT.handleRefreshClick);

	}

	function evt_handleRefreshClick() {

		console.log("Refresh click!!!!");

		const params = {};

		let ajax = new XMLHttpRequest();
		ajax.open('POST', '/admin/api/v1/refreshMonth');
		ajax.setRequestHeader('Content-Type', 'application/json');
		ajax.responseType = 'json';
		ajax.send(JSON.stringify(params));

		ajax.onload = () => {

			let res = ajax.response;
			if(res.err) {
				throw res.msg;
			}

			console.log(res);
			this.API.selectStaff();

		}

	}

	function evt_handleSubmitClick() {

		let bool = confirm("Would you like to complete this month?");
		if(!bool) {
			return;
		}

		let ajax = new XMLHttpRequest();
		ajax.open('POST', '/admin/api/v1/completeMonth');
		ajax.setRequestHeader('Content-Type', 'application/json');
		ajax.responseType = 'json';
		ajax.send(JSON.stringify({}));

		ajax.onload = () => {
			
			let res = ajax.response;
			if(res.err) {
				return alert(res.msg);
			}

			this.API.selectStatus();
			ReviewReports.API.selectPending();
			DownloadReports.API.selectCompleteReports();

		}

	}

	function api_selectStaff() {

		const ajax = new XMLHttpRequest();
		ajax.open('POST', '/admin/api/v1/selectStatusRep');
		ajax.setRequestHeader('Content-Type', 'application/json');
		ajax.responseType = 'json';
		ajax.send(JSON.stringify({}));

		ajax.onload = () => {
			
			this.MEM.staff = ajax.response.msg;
			this.MEM.staff_lookup = {};
			this.MEM.staff.forEach( staff => {
				this.MEM.staff_lookup[staff.staff_uuid] = staff;
			});

			this.API.selectTypes();

		}

	}

	function api_selectTypes() {

		const ajax = new XMLHttpRequest();
		ajax.open('POST', '/admin/api/v1/selectAggregate');
		ajax.setRequestHeader('Content-Type', 'application/json');
		ajax.responseType = 'json';
		ajax.send(JSON.stringify({}));

		ajax.onload = () => {
			
			let res = ajax.response;
			if(res.err) {
				throw res.msg;
			}
			
			this.MEM.types = {};
			res.msg.forEach( type => {
				if(!this.MEM.types[type.aggregate_group]) {
					this.MEM.types[type.aggregate_group] = []
				}
				this.MEM.types[type.aggregate_group].push(type.aggregate_name);
			});
			
			this.API.selectStatus();

		}

	}

	function evt_handleEditClick(evt) {

		let elem = evt.target;
		let userData = elem.userData;
		if(!userData) {
			return;
		}

		userData.inputs[2].removeAttribute('disabled');
		userData.inputs[3].removeAttribute('disabled');

		if(!userData.data.input_complete_time) {
			userData.inputs[4].removeAttribute('disabled');
		}
		
		if(!userData.data.manager_approval_time) {
			userData.inputs[0].removeAttribute('disabled');
		}
		
		if(!userData.data.director_approval_time) {
			userData.inputs[1].removeAttribute('disabled');
		}

		userData.buttons.edit.classList.add('hide');
		userData.buttons.save.classList.remove('hide');
		userData.buttons.cancel.classList.remove('hide');

	}

	function evt_handleSaveClick(evt) {

		let elem = evt.target;
		let userData = elem.userData;
		if(!userData) {
			return;
		}

		userData.inputs.forEach(input => {
			input.setAttribute('disabled', 'disabled');
		});

		userData.buttons.edit.classList.remove('hide');
		userData.buttons.save.classList.add('hide');
		userData.buttons.cancel.classList.add('hide');
		
		// Update Values

		let a, b;

		let stat = userData.data;

		if(userData.inputs[0].selectedIndex === 0) {
			a = null;
		} else {
			a = userData.inputs[0].value;
		}

		if(userData.inputs[1].selectedIndex === 0) {
			b = null;
		} else {
			b = userData.inputs[1].value;
		}

		if(a && b && a === b) {
			alert('承認者は同じ人選択できません');
			return;
		}
		
		stat.manager_uuid = a;
		stat.director_uuid = b;

		if(userData.inputs[2].selectedIndex === 0) {
			stat.group_1 = null;
		} else {
			stat.group_1 = userData.inputs[2].value;
		}

		if(userData.inputs[3].selectedIndex === 0) {
			stat.group_2 = null;
		} else {
			stat.group_2 = userData.inputs[3].value;
		}

		if(userData.inputs[4].selectedIndex === 0) {
			stat.assign_to_uuid = null;
		} else {
			stat.assign_to_uuid = userData.inputs[4].value;
		}

		this.API.updateStatus(stat);

	}

	function api_updateStatus(stat) {

		const params = {
			assign_to_uuid : stat.assign_to_uuid,
			status_uuid : stat.status_uuid,
			assign_to_name : stat.assign_to_name,
			manager_uuid : stat.manager_uuid,
			director_uuid : stat.director_uuid,
			group_1 : stat.group_1,
			group_2 : stat.group_2
		};

		const ajax = new XMLHttpRequest();
		ajax.open('POST', '/admin/api/v1/updateStatusRep');
		ajax.setRequestHeader('Content-Type', 'application/json');
		ajax.responseType = 'json';
		ajax.send(JSON.stringify(params));

		ajax.onload = () => {

			console.log(ajax.response);

		}

	}

	function evt_handleCancelClick(evt) {

		let elem = evt.target;
		let userData = elem.userData;
		if(!userData) {
			return;
		}

		userData.inputs.forEach(input => {
			input.setAttribute('disabled', 'disabled');
		});

		userData.buttons.edit.classList.remove('hide');
		userData.buttons.save.classList.add('hide');
		userData.buttons.cancel.classList.add('hide');
		
		// Revert Values

		let stat = userData.data;

		if(!stat.manager_uuid) {
			userData.inputs[0].selectedIndex = 0;
		} else {
			userData.inputs[0].value = stat.manager_uuid;
		}

		if(!stat.director_uuid) {
			userData.inputs[1].selectedIndex = 0;
		} else {
			userData.inputs[1].value = stat.director_uuid;
		}

		if(!stat.group_1) {
			userData.inputs[2].selectedIndex = 0;
		} else {
			userData.inputs[2].value = stat.group_1;
		}

		if(!stat.group_2) {
			userData.inputs[3].selectedIndex = 0;
		} else {
			userData.inputs[3].value = stat.group_2;
		}

		if(!stat.assign_to_uuid) {
			userData.inputs[4].selectedIndex = 0;
		} else {
			userData.inputs[4].value = stat.assign_to_uuid;
		}


	}

	function api_selectStatus() {

		const params = {};

		const ajax = new XMLHttpRequest();
		ajax.open('POST', '/admin/api/v1/selectStatus');
		ajax.setRequestHeader('Content-Type', 'application/json');
		ajax.responseType = 'json';
		ajax.send(JSON.stringify(params));

		ajax.onload = () => {
		
			let res = ajax.response;
			if(res.err) {
				
				switch(res.err) {
				case 101:
					return;
				default:
					throw res.msg;
					break;
				}

			}

			this.MEM.status = res.msg;
			this.API.renderStatus();
			this.API.renderFooter();

		}


	}

	function api_renderFooter() {

		let count = 0;
		this.DOM.tfoot.date.textContent = '';
		this.MEM.status.forEach( stat => {

			let year = stat.report_year;
			let month = stat.report_month;

			if(month.length < 2) {
				month = '0' + month;
			}

			this.DOM.tfoot.date.textContent = `${year}年${month}月`;
			
			if(stat.admin_approval_time) {
				count++;
			}
		});

		let length = this.MEM.status.length;
		this.DOM.tfoot.complete.textContent = `${count} / ${length}`;
		
		/*
		if(count < length) {
			this.DOM.tfoot.submit.setAttribute('disabled', 'disabled');
		} else {
			this.DOM.tfoot.submit.removeAttribute('disabled');
		}
		*/
		this.DOM.tfoot.submit.removeAttribute('disabled');

	}

	function api_renderStatus() {
		
		this.DOM.table.body.innerHTML = '';

		let index = 0;
		let table = this.DOM.table.body;
		this.MEM.status.forEach( stat => {

			const userData = {
				data : stat,
				inputs : [],
				buttons : {}
			}

			index++;
			const row = table.insertRow();

			const c0 = row.insertCell();
			const c0a = row.insertCell();
			const c0b = row.insertCell();
			const c1 = row.insertCell();
			const c2 = row.insertCell();
			const c3 = row.insertCell();
			const c4 = row.insertCell();
			const c5 = row.insertCell();
			const c6 = row.insertCell();
			const c7 = row.insertCell();
			const c8 = row.insertCell();
			const c9 = row.insertCell();
			const ca = row.insertCell();
			const cb = row.insertCell();
			const cc = row.insertCell();
			const cd = row.insertCell();

			c0.setAttribute('class', 'no');
			c0a.setAttribute('class', 'type');
			c0b.setAttribute('class', 'type');
			c1.setAttribute('class', 'location');
			c2.setAttribute('class', 'year');
			c3.setAttribute('class', 'month');
			c4.setAttribute('class', 'indent');
			c5.setAttribute('class', 'date');
			c6.setAttribute('class', 'datetime');
			c7.setAttribute('class', 'authorizer');
			c8.setAttribute('class', 'datetime');
			c9.setAttribute('class', 'authorizer');
			ca.setAttribute('class', 'datetime');
			cb.setAttribute('class', 'datetime');
			cc.setAttribute('class', 'action');
			cd.setAttribute('class', 'action');

			// No.

			let str = index.toString();
			while(str.length < 3) {
				str = "0" + str;
			}

			c0.textContent = str;

			// Add the Select Options

			const select3 = document.createElement('select');
			select3.innerHTML = `<option></option>`;
			select3.setAttribute('disabled', 'disabled');
			c0a.appendChild(select3);

			let vals = this.MEM.types['group_1'] || [];
			vals.forEach( name => {
				const option = document.createElement('option');
				option.setAttribute('value', name);
				option.textContent = name;
				select3.appendChild(option);
			});

			if(stat.group_1) {
				select3.value = stat.group_1;
			}

			const select4 = document.createElement('select');
			select4.innerHTML = `<option></option>`;
			select4.setAttribute('disabled', 'disabled');
			c0b.appendChild(select4);

			vals = this.MEM.types['group_2'] || [];
			vals.forEach( name => {
				const option = document.createElement('option');
				option.setAttribute('value', name);
				option.textContent = name;
				select4.appendChild(option);
			});

			if(stat.group_2) {
				select4.value = stat.group_2;
			}

			// ロケーション名

			c1.textContent = stat.location_name;

			// 売上年
			
			c2.textContent = stat.report_year;

			// 売上月
			
			c3.textContent = stat.report_month;

			// 担当者名

			const select5 = document.createElement('select');
			select5.innerHTML = '<option></option>';
			select5.setAttribute('disabled', 'disabled');
			c4.appendChild(select5);

			// 実施日
			
			c5.textContent = stat.date_of_implementation || '-';

			// 現場入力

			c6.textContent = stat.input_complete_time || '-';

			// 承認者1

			const select1 = document.createElement('select');
			select1.innerHTML = '<option></option>';
			select1.setAttribute('disabled', 'disabled');
			c7.appendChild(select1);
			userData.inputs.push(select1);

			// 承認1時間
			
			c8.textContent = stat.manager_approval_time || '-';

			// 承認者2

			const select2 = document.createElement('select');
			select2.innerHTML = '<option></option>';
			select2.setAttribute('disabled', 'disabled');
			c9.appendChild(select2);
			userData.inputs.push(select2);
			userData.inputs.push(select3);
			userData.inputs.push(select4);
			userData.inputs.push(select5);

			// 承認2時間
			
			ca.textContent = stat.director_approval_time || '-';

			// 財務確定
			
			cb.textContent = stat.admin_approval_time || '-';

			// 保存

			const save = document.createElement('span');
			save.userData = userData;
			save.setAttribute('class', 'hide');
			save.textContent = '保存';
			cc.appendChild(save);
			save.addEventListener('click', this.EVT.handleSaveClick);
			userData.buttons.save = save;

			// 編集

			const edit = document.createElement('span');
			edit.userData = userData;
			edit.textContent = '編集';
			cd.appendChild(edit);
			edit.addEventListener('click', this.EVT.handleEditClick);
			userData.buttons.edit = edit;

			const cancel = document.createElement('span');
			cancel.userData = userData;
			cancel.setAttribute('class', 'hide');
			cancel.textContent = '取消';
			cd.appendChild(cancel);
			cancel.addEventListener('click', this.EVT.handleCancelClick);
			userData.buttons.cancel = cancel;

			// Render Staff Options

			this.MEM.staff.forEach( mem => {

				if(mem.staff_position === '担当') {
					return;
				}
				
				if(mem.staff_position === '財務') {
					return;
				}

				if(mem.staff_location.indexOf(stat.location_uuid) === -1) {
					return;
				}

				let a = mem.staff_position;
				let b = mem.staff_name;

				let opt1 = document.createElement('option');
				let opt2 = document.createElement('option');

				opt1.textContent = `${a}) ${b}`;
				opt2.textContent = `${a}) ${b}`;

				opt1.setAttribute('value', mem.staff_uuid);
				opt2.setAttribute('value', mem.staff_uuid);

				select1.appendChild(opt1);
				select2.appendChild(opt2);

			});

			this.MEM.staff.forEach( mem => {

				if(mem.staff_position !== '担当') {
					return;
				}

				if(mem.staff_location.indexOf(stat.location_uuid) === -1) {
					return;
				}
				
				let opt1 = document.createElement('option');
				opt1.textContent = mem.staff_name;
				opt1.setAttribute('value', mem.staff_uuid);
				select5.appendChild(opt1);

			});

			if(stat.manager_uuid) {
				select1.value = stat.manager_uuid;
			}

			if(stat.director_uuid) {
				select2.value = stat.director_uuid;
			}
			
			if(stat.assign_to_uuid) {
				select5.value = stat.assign_to_uuid;
			}

		});

	}

}).apply({});
