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

const PanelManager = (function() {

	this.MEM = {}

	this.DOM = {
		tbody : document.getElementById('PanelManager.tbody')
	}

	this.EVT = {
		handleEditClick : evt_handleEditClick.bind(this),
		handleSaveClick : evt_handleSaveClick.bind(this),
		handleDisplayClick : evt_handleDisplayClick.bind(this)
	}

	this.API = {
		setSession : api_setSession.bind(this),
		init : api_init.bind(this),
		selectStaff : api_selectStaff.bind(this),
		selectPanel : api_selectPanel.bind(this),
		renderPanel : api_renderPanel.bind(this)
	}

	init.apply(this);
	return this;

	function init() {

	}

	function api_setSession(session) {
		
		this.MEM.session = session;

	}

	async function api_init() {
		
		try {
			await this.API.selectPanel();
		} catch(err) {
			throw err;
		}
		
		try {
			await this.API.selectStaff();
		} catch(err) {
			throw err;
		}

		this.API.renderPanel();

	}

	function api_selectStaff() {
		
		return new Promise( (resolve, reject) => {

			const params = {}

			const ajax = new XMLHttpRequest();
			ajax.open('POST', '/supervisor/api/v1/getStaff');
			ajax.setRequestHeader('Content-Type', 'application/json');
			ajax.responseType = 'json';
			ajax.send(JSON.stringify(params));

			ajax.onload = () => {

				let res = ajax.response;
				if(res.err) {
					return alert(res.msg);
				}
			
				this.MEM.staff = res.msg;
				resolve();
	
			}

		});

	}

	function api_selectPanel() {
		
		return new Promise( (resolve, reject) => {

			const params = {}

			const ajax = new XMLHttpRequest();
			ajax.open('POST', '/supervisor/api/v1/getPanel');
			ajax.setRequestHeader('Content-Type', 'application/json');
			ajax.responseType = 'json';
			ajax.send(JSON.stringify(params));

			ajax.onload = () => {

				let res = ajax.response;
				if(res.err) {
					return alert(res.msg);
				}
			
				this.MEM.status = res.msg;
				resolve();
	
			}

		});

	}


	function api_renderPanel() {

		this.MEM.userData = [];
		this.DOM.tbody.innerHTML = '';

		this.MEM.status.forEach( stat => {
			
			const userData = {
				data : stat,
				editMode : false
			}
			
			const staff = this.MEM.staff[stat.location_uuid];
			const row = this.DOM.tbody.insertRow();
			userData.row = row;

			const c0 = row.insertCell();
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
			c1.setAttribute('class', 'loc');
			c2.setAttribute('class', 'year');
			c3.setAttribute('class', 'month');
			c4.setAttribute('class', 'person-in-charge');
			c5.setAttribute('class', 'date');
			c6.setAttribute('class', 'time');
			c7.setAttribute('class', 'authorizer');
			c8.setAttribute('class', 'datetime');
			c9.setAttribute('class', 'authorizer');
			ca.setAttribute('class', 'datetime');

			cb.setAttribute('class', 'display');
			cc.setAttribute('class', 'display');
			cd.setAttribute('class', 'display');

			// No.

			let num = this.DOM.tbody.rows.length.toString();
			while(num.length < 3) {
				num = '0' + num;
			}
			c0.textContent = num;

			// ロケーション名
			
			c1.textContent = stat.location_name;

			// 棚卸年

			c2.textContent = stat.report_year;

			// 棚卸月

			let m = stat.report_month;
			if(m.length < 2) {
				m = '0' + m;
			}
			c3.textContent = m;

			// 担当者

			const select1 = document.createElement('select');
			select1.innerHTML = `<option>Select 担当</option>`;
			c4.appendChild(select1);
			select1.setAttribute('disabled', 'disabled');

			// Then we need to go ahead and add the options

			staff.forEach( member => {
				
				if(member.staff_position !== '担当') {
					return;
				}

				const option = document.createElement('option');
				option.setAttribute('value', member.staff_uuid);
				option.textContent = member.staff_name;
				select1.appendChild(option);

			});

			if(stat.assign_to_uuid) {
				select1.value = stat.assign_to_uuid;
			}

			// 実施日
		
			if(stat.date_of_implementation) {
				c5.textContent = stat.date_of_implementation;
			} else {
				c5.textContent = '-';
			}

			userData.select1 = select1;

			// 現場入力
			
			if(stat.input_complete_time) {
				c6.textContent = stat.input_complete_time.substr(11);
			} else {
				c6.textContent = '-';
			}
			
			// 承認者１

			const select2 = document.createElement('select');
			select2.innerHTML = `<option>Select 承認者１</option>`;
			c7.appendChild(select2);
			select2.setAttribute('disabled', 'disabled');
			userData.select2 = select2;

			staff.forEach( member => {
				
				if(member.staff_position === '担当') {
					return;
				}

				const option = document.createElement('option');
				option.setAttribute('value', member.staff_uuid);
				let name = member.staff_name;
				let position = member.staff_position;
				option.textContent = `${position}) ${name}`
				select2.appendChild(option);

			});

			if(stat.manager_uuid) {
				select2.value = stat.manager_uuid;
			}

			// 承認１時間
			
			if(stat.manager_approval_time) {
				c8.textContent = stat.manager_approval_time.substr(0, 10);
			} else {
				c8.textContent = '-';
			}
			
			// 承認者２

			const select3 = document.createElement('select');
			select3.innerHTML = `<option>Select 承認者２</option>`;
			c9.appendChild(select3);
			select3.setAttribute('disabled', 'disabled');

			staff.forEach( member => {
				
				if(member.staff_position === '担当') {
					return;
				}

				const option = document.createElement('option');
				option.setAttribute('value', member.staff_uuid);
				let name = member.staff_name;
				let position = member.staff_position;
				option.textContent = `${position}) ${name}`
				select3.appendChild(option);

			});

			if(stat.director_uuid) {
				select3.value = stat.director_uuid;
			}

			// 承認２時間
			
			if(stat.director_approval_time) {
				ca.textContent = stat.director_approval_time.substr(0, 10);
			} else {
				ca.textContent = '-';
			}

			userData.select3 = select3;

			// 編集
	
			const edit = document.createElement('span');
			edit.textContent = '編集';
			cb.appendChild(edit);
			userData.edit = edit;
			edit.userData = userData;
			edit.addEventListener('click', this.EVT.handleEditClick);

			if(stat.admin_approval_time) {
				edit.classList.add('disabled');
			}

			// 保存

			const save = document.createElement('span');
			save.setAttribute('class', 'disabled');
			save.textContent = '保存';
			cc.appendChild(save);
			userData.save = save;
			save.userData = userData;
			save.addEventListener('click', this.EVT.handleSaveClick);
			
			// 表示
	
			const display = document.createElement('span');
			display.textContent = '表示';
			cd.appendChild(display);
			userData.display = display;
			display.userData = userData;
			display.addEventListener('click', this.EVT.handleDisplayClick);
			display.addEventListener('touchstart', this.EVT.handleDisplayClick);

			if(!stat.input_complete_time) {
				display.classList.add('disabled');
			}

			// Then we need to figure out if the report needs to be
			// signed or not

			console.log(this.MEM.session);

			let needsSign = false;
			let suid = this.MEM.session.staff_uuid;

			if(!stat.director_approval_time && stat.director_uuid === suid) {
				needsSign = true;
			} else if(!stat.manager_approval_time && stat.manager_uuid === suid) {
				needsSign = true;
			}

			if(needsSign) {
				row.classList.add('highlight');	
				display.textContent = '承認';
			}

		});

	}

	function evt_handleEditClick(evt) {

		let elem = evt.target;
		let userData = elem.userData;
		if(!userData) {
			return;
		}

		if(userData.editMode) {
			
			// Otherwise Cancel Click

			userData.editMode = false;
			userData.row.classList.remove('edit');
			userData.edit.textContent = '編集';
			userData.save.classList.add('disabled');

			// Set the select disabled

			userData.select1.setAttribute('disabled', 'disabled');
			userData.select2.setAttribute('disabled', 'disabled');
			userData.select3.setAttribute('disabled', 'disabled');

			// Reset the first select

			if(!userData.data.assign_to_uuid) {
				userData.select1.selectedIndex = 0;
			} else {
				userData.select1.value = userData.data.assign_to_uuid;
			}

			// Reset the second select

			if(!userData.data.manager_uuid) {
				userData.select2.selectedIndex = 0;
			} else {
				userData.select2.value = userData.data.manager_uuid;
			}

			// Reset the third select

			if(!userData.data.director_uuid) {
				userData.select3.selectedIndex = 0;
			} else {
				userData.select3.value = userData.data.director_uuid;
			}

		} else {

			// Edit Click

			userData.editMode = true;
			userData.row.classList.add('edit');
			userData.edit.textContent = 'キャンセル';
			userData.save.classList.remove('disabled');

			// Enable the select

			if(!userData.data.input_complete_time) {
				userData.select1.removeAttribute('disabled');
			}

			if(!userData.data.manager_approval_time) {
				userData.select2.removeAttribute('disabled');
			}

			if(!userData.data.director_approval_time) {
				userData.select3.removeAttribute('disabled');
			}

		}
		

	}

	function evt_handleSaveClick(evt) {

		let elem = evt.target;
		let userData = elem.userData;
		if(!userData) {
			return;
		}
		
		const params = {
			status_uuid : userData.data.status_uuid
		};
		
		// Select 1

		if(userData.select1.selectedIndex === 0) {
			params.assign_to_uuid = null;
		} else {
			params.assign_to_uuid = userData.select1.value;
		}
		
		// Select 2

		if(userData.select2.selectedIndex === 0) {
			params.manager_uuid = null;
		} else {
			params.manager_uuid = userData.select2.value;
		}
		
		// Select 3

		if(userData.select3.selectedIndex === 0) {
			params.director_uuid = null;
		} else {
			params.director_uuid = userData.select3.value;
		}

		// Do a quick sanity check

		if(params.manager_uuid && params.manager_uuid === params.director_uuid) {
			
			let str = [
				"Auth User 1 and Auth User 2 cannot be the same person",
				"If you would like to only have only 1 Auth user, then",
				"plase set that person as Auth 2"
			].join('\n');
			
			return alert(str);
		}

		const ajax = new XMLHttpRequest();
		ajax.open('POST', '/supervisor/api/v1/updateStatus');
		ajax.setRequestHeader('Content-Type', 'application/json');
		ajax.responseType = 'json';
		ajax.send(JSON.stringify(params));

		ajax.onload = () => {
			
			let res = ajax.response;
			if(res.err) {
				throw res.msg;
			}

			userData.editMode = false;
			userData.row.classList.remove('edit');
			userData.edit.textContent = '編集';
			userData.save.classList.add('disabled');

			// Set the select disabled

			userData.select1.setAttribute('disabled', 'disabled');
			userData.select2.setAttribute('disabled', 'disabled');
			userData.select3.setAttribute('disabled', 'disabled');

			// Update Userdata

			userData.data.assign_to_uuid = params.assign_to_uuid;
			userData.data.manager_uuid = params.manager_uuid;
			userData.data.director_uuid = params.director_uuid;

		}


	}

	function evt_handleDisplayClick(evt) {

		let elem = evt.target;
		let userData = elem.userData;
		if(!userData) {
			return;
		}
		
		let params = {
			status_uuid : userData.data.status_uuid,
			location_uuid : userData.data.location_uuid,
			staff : [
				userData.data.assign_to_uuid,
				userData.data.manager_uuid,
				userData.data.director_uuid
			]
		};

		console.log(location.port);

		const ajax = new XMLHttpRequest();
		ajax.open('POST', '/supervisor/api/v1/getReport');
		ajax.setRequestHeader('Content-Type', 'application/json');
		ajax.responseType = 'json';
		ajax.send(JSON.stringify(params));

		ajax.onload = () => {

			this.MEM.user_uuid = ajax.response.msg.me;
			this.MEM.report = ajax.response.msg.report;
			this.MEM.location = ajax.response.msg.location;
			this.MEM.status = userData.data;
			this.MEM.staff = ajax.response.msg.staff;
			
			let m = this.MEM.user_uuid;
			let r = this.MEM.report;
			let l = this.MEM.location;
			let s = this.MEM.status;
			s.staff = this.MEM.staff;

			TableManager.API.openReport(r, l, s, m);
			TabManager.API.openPage('table');
			StampManager.API.startStamps(s, m);

		}

	}

}).apply({});
