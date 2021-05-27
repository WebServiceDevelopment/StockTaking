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

const ReviewReports = (function() {

	this.MEM = {}

	this.DOM = {
		hopper : document.getElementById('ReviewReports.hopper'),
		table : document.getElementById('ReviewReports.table'),
		count : {
			all : document.getElementById('ReviewReports.count.all'),
			num : document.getElementById('ReviewReports.count.num'),
			cards : document.getElementById('ReviewReports.count.cards'),
			accept : document.getElementById('ReviewReports.count.accept'),
			reject : document.getElementById('ReviewReports.count.reject'),
			auth3 : document.getElementById('auth3')
		},
		tabs : {
			all : document.getElementById('ReviewReports.tabs.all'),
			input : document.getElementById('ReviewReports.tabs.input'),
			signed : document.getElementById('ReviewReports.tabs.signed'),
			complete : document.getElementById('ReviewReports.tabs.complete')
		},
		summary : {
			location : document.getElementById('ReviewReports.summary.location'),
			assigned_to : document.getElementById('ReviewReports.summary.assigned_to'),
			impl_date : document.getElementById('ReviewReports.summary.impl_date'),
			impl_time : document.getElementById('ReviewReports.summary.impl_time'),
			auth1_name : document.getElementById('ReviewReports.summary.auth1_name'),
			auth1_date : document.getElementById('ReviewReports.summary.auth1_date'),
			auth2_name : document.getElementById('ReviewReports.summary.auth2_name'),
			auth2_date : document.getElementById('ReviewReports.summary.auth2_date')
		},
		option : {
			accept_radio : document.getElementById('ReviewReports.option.accept_radio'),
			reject_radio : document.getElementById('ReviewReports.option.reject_radio'),
			accept_label : document.getElementById('ReviewReports.option.accept_label'),
			reject_label : document.getElementById('ReviewReports.option.reject_label'),
			reject_widget : document.getElementById('ReviewReports.option.reject_widget'),
			accept_widget : document.getElementById('ReviewReports.option.accept_widget'),
			textarea : document.getElementById('ReviewReports.option.textarea')
		},
		reject : {
			manager_radio : document.getElementById('ReviewReports.option.manager_radio'),
			director_radio : document.getElementById('ReviewReports.option.director_radio'),
			manager_label : document.getElementById('ReviewReports.option.manager_label'),
			director_label : document.getElementById('ReviewReports.option.director_label'),
			textarea : document.getElementById('ReviewReports.option.textarea'),
			word_count : document.getElementById('ReviewReports.option.word_count'),
			submit : document.getElementById('ReviewReports.option.submit')
		}
	}

	this.EVT = {
		handleHopperClick : evt_handleHopperClick.bind(this),
		handleAcceptSelect : evt_handleAcceptSelect.bind(this),
		handleRejectSelect : evt_handleRejectSelect.bind(this),
		handleRejectSubmit : evt_handleRejectSubmit.bind(this),
		handleAcceptSubmit : evt_handleAcceptSubmit.bind(this),
		handleTextareaInput : evt_handleTextareaInput.bind(this),
		handleWindowResize : evt_handleWindowResize.bind(this),
		handleTabClick : evt_handleTabClick.bind(this),
		handleTopClick : evt_handleTopClick.bind(this),
		handleBottomClick : evt_handleBottomClick.bind(this)
	}

	this.API = {
		selectHopper : api_selectHopper.bind(this),
		selectPending : api_selectPending.bind(this),
		renderHopper : api_renderHopper.bind(this),
		openReport : api_openReport.bind(this),
		clearReport : api_clearReport.bind(this),
		renderTable : api_renderTable.bind(this),
		renderSummary : api_renderSummary.bind(this),
		updateTableSize : api_updateTableSize.bind(this),
		openTab : api_openTab.bind(this),
		getReport : api_getReport.bind(this),
		manageSign : api_manageSign.bind(this)
	}

	init.apply(this);
	return this;

	function init() {
		
		/*
		this.API.selectPending();
		*/

		this.API.selectHopper();
		this.DOM.hopper.addEventListener('click', this.EVT.handleHopperClick);

		this.DOM.option.accept_radio.addEventListener('change', this.EVT.handleAcceptSelect);
		this.DOM.option.reject_radio.addEventListener('change', this.EVT.handleRejectSelect);
		this.DOM.reject.submit.addEventListener('click', this.EVT.handleRejectSubmit);
		this.DOM.reject.textarea.addEventListener('input', this.EVT.handleTextareaInput);

		window.addEventListener('resize', this.EVT.handleWindowResize);
		
		for(let key in this.DOM.tabs) {
			this.DOM.tabs[key].addEventListener('click', this.EVT.handleTabClick);
		}

		this.DOM.count.accept.addEventListener('click', this.EVT.handleBottomClick);
		this.DOM.count.reject.addEventListener('click', this.EVT.handleTopClick);

		this.API.openTab('all');
		
	}

	function evt_handleTopClick() {

		this.DOM.count.reject.classList.add('active');
		this.DOM.count.accept.classList.remove('active');
		this.DOM.option.reject_widget.classList.remove('hide');

	}

	function evt_handleBottomClick() {

		this.DOM.count.reject.classList.remove('active');
		this.DOM.count.accept.classList.add('active');
		this.DOM.option.reject_widget.classList.add('hide');

	}

	function api_selectHopper() {

		const params = {};

		const ajax = new XMLHttpRequest();
		ajax.open('POST', '/admin/api/v1/selectHopper');
		ajax.setRequestHeader('Content-Type', 'application/json');
		ajax.responseType = 'json';
		ajax.send(JSON.stringify(params));

		ajax.onload = () => {
			
			let res = ajax.response;
			if(res.err) {
				throw res.msg;
			}

			this.MEM.status = res.msg;
			this.API.renderHopper();

		}

	}

	function api_openTab(leaf) {

		this.DOM.tabs[leaf].classList.add('active');
		this.MEM.activeLeaf = leaf;

		if(!this.MEM.status) {
			return;
		}

		this.API.renderHopper();

	}

	function evt_handleTabClick(evt) {

		for(let key in this.DOM.tabs) {
			this.DOM.tabs[key].classList.remove('active');
		}
		
		let id = evt.target.getAttribute('id');
		let leaf = id.split('.').pop();
		this.API.openTab(leaf);

	}

	function evt_handleWindowResize() {
		
		this.API.updateTableSize();

	}

	function api_updateTableSize() {

        let p = this.DOM.table.parentNode;
        let t = this.DOM.table;

        let divHeight = p.offsetHeight;
        let tabHeight = t.offsetHeight;

        if(tabHeight > divHeight) {
            this.DOM.table.classList.remove('fill');
        } else {
            this.DOM.table.classList.add('fill');
        }

	}

	function evt_handleTextareaInput() {
		
		let val = this.DOM.reject.textarea.value;
		this.DOM.reject.word_count.textContent = val.length;

	}

	function evt_handleRejectSubmit() {

		const params = {
			status_uuid : this.MEM.activeStatus.status_uuid,
			message : this.DOM.option.textarea.value
		};

		if(this.DOM.reject.manager_radio.checked) {
			params.role = 'manager';
			params.fix_attn_uuid = this.MEM.activeStatus.manager_uuid;
		}

		if(this.DOM.reject.director_radio.checked) {
			params.role = 'director';
			params.fix_attn_uuid = this.MEM.activeStatus.director_uuid;
		}

		const ajax = new XMLHttpRequest();
		ajax.open('POST', '/admin/api/v1/rejectAdminReport');
		ajax.setRequestHeader('Content-Type', 'application/json');
		ajax.responseType = 'json';
		ajax.send(JSON.stringify(params));

		ajax.onload = () => {

			this.API.selectHopper();

		}

	}

	function evt_handleAcceptSubmit() {

		console.log("accept click!!");

	}

	function evt_handleAcceptSelect() {
		
		this.DOM.option.accept_label.classList.add('selected');
		this.DOM.option.reject_label.classList.remove('selected');
		
		this.API.renderTable('stock');

	}

	function evt_handleRejectSelect() {
		
		this.DOM.option.accept_label.classList.remove('selected');
		this.DOM.option.reject_label.classList.add('selected');

		this.API.renderTable('inventory');

	}

	function api_selectPending() {
		
		this.MEM.activeLi = null;
		this.API.clearReport();

		const ajax = new XMLHttpRequest();
		ajax.open('POST', '/admin/api/v1/selectAdminReport');
		ajax.setRequestHeader('Content-Type', 'application/json');
		ajax.responseType = 'json';
		ajax.send(JSON.stringify({}));

		ajax.onload = () => {
			
			let res = ajax.response;

			if(res.err) {
				throw res.msg;
			}
			
			res.msg = res.msg || {};
			res.msg.staff = res.msg.staff || [];
			res.msg.reports = res.msg.reports || [];
			res.msg.status = res.msg.status || [];

			this.MEM.staff = {};
			res.msg.staff.forEach( staff => {
				this.MEM.staff[staff.staff_uuid] = staff;
			});

			this.MEM.reports = {};
			this.MEM.stock = {};

			res.msg.reports.forEach( report => {
				
				if(report.managers_report && report.managers_report.length) {
					this.MEM.reports[report.status_uuid] = report.managers_report;
				} else {
					this.MEM.reports[report.status_uuid] = report.on_site_report;
				}

				if(report.managers_stock && report.managers_stock.length) {
					this.MEM.stock[report.status_uuid] = report.managers_stock;
				} else {
					this.MEM.stock[report.status_uuid] = report.on_site_stock;
				}

			});

			this.MEM.status = res.msg.status;
			this.API.renderHopper();
			
		}

	}

	function api_renderHopper() {

		this.DOM.hopper.innerHTML = '';
		this.DOM.count.all.textContent = this.MEM.status.length;

		let count = 0;
		this.MEM.status.forEach( stat => {
			
			const li = document.createElement('li');
			const table = document.createElement('table');

			let staff = stat.staff;
			let a = stat.input_complete_time;
			let b = stat.manager_approval_time;
			let c = stat.director_approval_time;
			let d = stat.admin_approval_time;
			let e = stat.require_fix;

			switch(this.MEM.activeLeaf) {
			case 'input':
				
				if(!a || d) {
					return;
				}

				if(!e && (b || c)) {
					return;
				}

				break;
			case 'signed':

				if(!a || d || e) {
					return;
				}

				if(!b && !c) {
					return;
				}

				break;
			case 'complete':

				if(!d) {
					return;
				}

				break;
			}

			count++;


			// Row 0 

			const r0 = table.insertRow();
			const c0a = r0.insertCell();
			const c0b = r0.insertCell();

			c0a.textContent = 'ロケーション';
			c0b.textContent = stat.location_name;

			// Row 1

			const r1 = table.insertRow();
			const c1a = r1.insertCell();
			const c1b = r1.insertCell();

			c1a.textContent = '売上月';
			let y = stat.report_year;
			let m = stat.report_month.toString();
			if(m.length < 2) {
				m = '0' + m;
			}
			c1b.textContent = `${y}年${m}月`;

			// Row 2

			const r2 = table.insertRow();
			const c2a = r2.insertCell();
			const c2b = r2.insertCell();

			c2a.textContent = '実施日';
			c2b.textContent = stat.date_of_implementation;

			// Row 3

			const r3 = table.insertRow();
			const c3a = r3.insertCell();
			const c3b = r3.insertCell();

			let manager = staff[stat.manager_uuid] || {};
			let aName = manager.staff_name || "";
			let aPos = manager.staff_position || "";

			c3a.textContent = '承認１';
			if(manager.staff_name) {
				c3b.textContent = `${aName} (${aPos})`;
			} else {
				c3b.textContent = '';
			}

			// Row 4

			const r4 = table.insertRow();
			const c4a = r4.insertCell();
			const c4b = r4.insertCell();

			let director = staff[stat.director_uuid] || {};
			let bName = director.staff_name || "";
			let bPos = director.staff_position || "";

			c4a.textContent = '承認２';

			if(director.staff_name) {
				c4b.textContent = `${bName} (${bPos})`;
			} else {
				c4b.textContent = '';
			}

			// Append Element to hopper

			li.userData = stat;
			li.appendChild(table);
			this.DOM.hopper.appendChild(li);
			
			if(!this.MEM.activeLi) {
				li.click();
			}

			if(this.MEM.activeStatus.status_uuid === stat.status_uuid) {
				li.click();
			}

		});

		this.DOM.count.num.textContent = count;

	}

	function evt_handleHopperClick(evt) {

		let elem = evt.target;
		while(elem.parentNode && elem.tagName !== 'LI') {
			if(elem === this.DOM.hopper) {
				return;
			}
			elem = elem.parentNode;
		}

		let userData = elem.userData;
		if(!userData) {
			return;
		}
	
		if(this.MEM.activeLi) {
			this.MEM.activeLi.classList.remove('active');
		}

		this.MEM.activeLi = elem;
		this.MEM.activeLi.classList.add('active');

		// this.API.openReport(userData.status_uuid, userData);
		this.MEM.activeStatus = userData;
		this.API.getReport();

	}

	function api_getReport() {

		const params = {
			status_uuid : this.MEM.activeStatus.status_uuid		
		};

		const ajax = new XMLHttpRequest();
		ajax.open('POST', '/admin/api/v1/selectInvReport');
		ajax.setRequestHeader('Content-Type', 'application/json');
		ajax.responseType = 'json';
		ajax.send(JSON.stringify(params));

		ajax.onload = () => {

			let res = ajax.response;
			if(res.err) {
				throw res.msg;
			}

			this.MEM.activeReport = res.msg;

			console.log(res.msg);
			
			let r = this.MEM.activeReport;
			if(!r.managers_report) {
				r.managers_report = r.on_site_report;
			}

			if(!r.managers_stock) {
				r.managers_stock = r.on_site_stock;
			}

			this.API.clearReport();
			this.API.renderTable('inventory');
			this.API.renderSummary();
			this.API.manageSign();
	
			// Set table options
	
			this.DOM.option.accept_label.classList.remove('selected');
			this.DOM.option.reject_label.classList.add('selected');

			this.DOM.option.accept_radio.checked = false;
			this.DOM.option.reject_radio.checked = true;

		}


	}

	function api_manageSign() {

		let stat = this.MEM.activeStatus;

		let a = stat.input_complete_time;
		let b = stat.manager_approval_time;
		let c = stat.director_approval_time;
		let d = stat.admin_approval_time;
		let e = stat.require_fix;

		this.DOM.count.accept.classList.add('active');
		this.DOM.count.reject.classList.remove('active');

		if(a && (b || c) && !(d || e)) {
			// Can do sign
			
			this.DOM.count.cards.classList.remove('disabled');
			this.DOM.count.auth3.classList.add('active');
			AuthManager.API.prepareCanvas();

		} else {
			// Can't do the sign
			
			this.DOM.count.cards.classList.add('disabled');
			this.DOM.count.auth3.classList.remove('active');
			AuthManager.API.cancelCanvas();

		}
		
		if(stat.admin_approval_time) {
			let dd = stat.admin_approval_time.substr(0, 10);
			AuthManager.API.renderSign(2, 'admin', dd);
		}
	}

	function api_openReport(report_uuid, report) {

		// Clear any existing reports

		this.API.clearReport();

		let allowSign;
		if(report.require_fix) {
			allowSign = false;
		} else if(!report.manager_approval_time && !report.director_approval_time) {
			allowSign = false;
		} else {
			allowSign = true;
		}
		
		if(allowSign) {
			AuthManager.API.prepareCanvas();
		} else {
			AuthManager.API.cancelCanvas();
		}

		// Set the current active report
		
		// Set Render Boolean
	
		this.MEM.hasManager = false;
		this.MEM.hasDirector = false;
		this.MEM.hasFix = false;
	
		// Set table options
	
		this.DOM.option.accept_label.classList.remove('selected');
		this.DOM.option.reject_label.classList.add('selected');
		this.DOM.option.accept_radio.checked = false;
		this.DOM.option.reject_radio.checked = true;

		// Render the Report

		this.MEM.report_uuid = report_uuid;
		this.MEM.report = this.MEM.reports[report_uuid];
		this.API.renderTable('report');
		this.API.renderSummary(report);
		this.MEM.stat = report;

	}

	function api_clearReport() {

		this.DOM.option.accept_radio.checked = false;
		this.DOM.option.reject_radio.checked = false;

		this.DOM.option.accept_label.classList.remove('selected');
		this.DOM.option.reject_label.classList.remove('selected');

		this.DOM.option.accept_widget.classList.remove('open');
		this.DOM.option.reject_widget.classList.remove('open');

		this.DOM.reject.director_radio.checked = true;
		this.DOM.reject.textarea.value = '';
		this.DOM.reject.word_count.textContent = '0';

		this.DOM.option.reject_widget.classList.add('hide');
		AuthManager.API.clearCanvas();
		this.DOM.table.innerHTML = '';
		
		this.DOM.summary.location.textContent = '';
		this.DOM.summary.assigned_to.textContent = '';
		this.DOM.summary.impl_date.textContent = '';
		this.DOM.summary.impl_time.textContent ='';
		this.DOM.summary.auth1_name.textContent = '';
		this.DOM.summary.auth1_date.textContent = '';
		this.DOM.summary.auth2_name.textContent = '';
		this.DOM.summary.auth2_date.textContent = '';

		this.DOM.reject.manager_label.textContent = '承認者１';
		this.DOM.reject.director_label.textContent = '承認者２';


	}

	function api_renderTable(type) {

		let table = this.DOM.table;
		table.innerHTML = '';
		let index = 0;

		let list;
		switch(type){
		case 'inventory':
			list = this.MEM.activeReport.managers_report;
			break;
		case 'stock':
			list = this.MEM.activeReport.managers_stock;
			break;
		}

		list.forEach(line => {
			
			index++;
			const row = table.insertRow();

			const ca = row.insertCell();
			const cb = row.insertCell();
			const cc = row.insertCell();
			const cd = row.insertCell();
			const ce = row.insertCell();
			const cf = row.insertCell();
			const cg = row.insertCell();
			const ch = row.insertCell();
			const ci = row.insertCell();
			const cj = row.insertCell();
			const ck = row.insertCell();

			ca.setAttribute('class', 'a');
			cb.setAttribute('class', 'b');
			cc.setAttribute('class', 'c');
			cd.setAttribute('class', 'd');
			ce.setAttribute('class', 'e');
			cf.setAttribute('class', 'f');
			cg.setAttribute('class', 'g');
			ch.setAttribute('class', 'h');
			ci.setAttribute('class', 'i');
			cj.setAttribute('class', 'j');
			ck.setAttribute('class', 'k');

			// No.

			let str = index.toString();
			if(str.length < 2) {
				str = '0' + str;
			}
			ca.textContent = str;

			// 場所
			
			cb.textContent = line.pos.replace('No.', '場所 ');

			// 棚卸資産の種類

			cc.textContent = line.type;

			// 品種
			
			cd.textContent = line.variety;

			// 次工程
		
			ce.textContent = line.next_process;

			// 品名
			
			cf.textContent = line.product;
			
			// 正味重量
			
			let weightDiv = document.createElement('div');
			weightDiv.setAttribute('class', 'flex');

			const weightA = document.createElement('input');
			const weightB = document.createElement('input');
			const weightC = document.createElement('input');
			const weightD = document.createElement('input');

			weightA.value = line.weight;
			weightB.value = line.manager_weight || '';
			weightC.value = line.director_weight || '';
			weightD.value = line.fixed_weight || '';

			weightA.setAttribute('readonly', 'readonly');

			if(line.manager_weight || this.MEM.hasManager) {
				this.MEM.hasManager = true;
				weightB.setAttribute('readonly', 'readonly');
			} else {
				weightB.setAttribute('disabled', 'disabled');
			}

			if(line.director_weight || this.MEM.hasDirector) {
				this.MEM.hasDirector = true;
				weightC.setAttribute('readonly', 'readonly');
			} else {
				weightC.setAttribute('disabled', 'disabled');
			}

			if(line.fixed_weight || this.MEM.hasFix) {
				this.MEM.hasFix = true;
				weightD.setAttribute('readonly', 'readonly');
			} else {
				weightD.setAttribute('disabled', 'disabled');
			}

			weightDiv.appendChild(weightA);
			weightDiv.appendChild(weightB);
			weightDiv.appendChild(weightC);
			weightDiv.appendChild(weightD);

			cg.appendChild(weightDiv);
			
			// 単位
		
			ch.textContent = line.unit;

			// フレコン数量

			let countDiv = document.createElement('div');
			countDiv.setAttribute('class', 'flex');

			const countA = document.createElement('input');
			const countB = document.createElement('input');
			const countC = document.createElement('input');
			const countD = document.createElement('input');
			
			countA.value = line.count;
			countB.value = line.manager_count || '';
			countC.value = line.director_count || '';
			countD.value = line.fixed_count || '';

			if(line.manager_weight || this.MEM.hasManager) {
				this.MEM.hasManager = true;
				countB.setAttribute('readonly', 'readonly');
			} else {
				countB.setAttribute('disabled', 'disabled');
			}

			if(line.director_weight || this.MEM.hasDirector) {
				this.MEM.hasDirector = true;
				countC.setAttribute('readonly', 'readonly');
			} else {
				countC.setAttribute('disabled', 'disabled');
			}

			if(line.fixed_weight || this.MEM.hasFix) {
				this.MEM.hasFix = true;
				countD.setAttribute('readonly', 'readonly');
			} else {
				countD.setAttribute('disabled', 'disabled');
			}

			countDiv.appendChild(countA);
			countDiv.appendChild(countB);
			countDiv.appendChild(countC);
			countDiv.appendChild(countD);

			ci.appendChild(countDiv);

			// 換数量

			cj.textContent = line.calc_weight || '';

			// 備考

			ck.textContent = line.notes;
	
		});

		this.API.updateTableSize();

	}

	function api_renderSummary() {
		
		let report = this.MEM.activeStatus;
		let staff = report.staff;

		this.DOM.summary.location.textContent = report.location_name;

		let assigned = staff[report.assign_to_uuid] || {};
		this.DOM.summary.assigned_to.textContent = assigned.staff_name;
		this.DOM.summary.impl_date.textContent = report.date_of_implementation;

		if(report.input_complete_time) {
			this.DOM.summary.impl_time.textContent = report.input_complete_time.substr(-8);
		} else {
			this.DOM.summary.impl_time.textContent = '';
		}

		let manager = staff[report.manager_uuid] || {};

		let aName = "";
		let aDate = "";
		
		if(manager.staff_name) {
			aName = manager.staff_name;
		}

		if(report.manager_approval_time) {
			aDate = report.manager_approval_time.substr(0, 10);
			this.DOM.reject.manager_radio.removeAttribute('disabled');
		} else {
			this.DOM.reject.manager_radio.setAttribute('disabled', 'disabled');
		}

		let director = staff[report.director_uuid] || {};
		let bName = "";
		let bDate = "";
		
		if(director.staff_name) {
			bName = director.staff_name;
		}

		if(report.director_approval_time) {
			bDate = report.director_approval_time.substr(0, 10);
			this.DOM.reject.director_radio.removeAttribute('disabled');
		} else {
			this.DOM.reject.director_radio.setAttribute('disabled', 'disabled');
		}

		this.DOM.summary.auth1_name.textContent = aName;
		this.DOM.summary.auth1_date.textContent = aDate;

		this.DOM.summary.auth2_name.textContent = bName;
		this.DOM.summary.auth2_date.textContent = bDate;
		
		this.DOM.reject.manager_label.textContent = aName;
		this.DOM.reject.director_label.textContent = bName;
		
		this.DOM.reject.manager_radio.checked = false;
		this.DOM.reject.director_radio.checked = false;
	
		if(report.manager_approval_time) {
			AuthManager.API.renderSign(0, aName, aDate)
		}
		
		if(report.director_approval_time) {
			AuthManager.API.renderSign(1, bName, bDate)
		}


	}

}).apply({});
