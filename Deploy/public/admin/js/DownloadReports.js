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

const DownloadReports = (function() {

	this.MEM = {}

	this.DOM = {
		table : {
			body : document.getElementById('DownloadReports.table.body')
		}
	}

	this.EVT = {
		handleDownloadClick : evt_handleDownloadClick.bind(this)
	}

	this.API = {
		selectCompleteReports : api_selectCompleteReports.bind(this),
		renderReportTable : api_renderReportTable.bind(this),
		convertReportToCSV : api_convertReportToCSV.bind(this)
	}

	init.apply(this);
	return this;

	function init() {

		this.API.selectCompleteReports();

	}
	
	function api_convertReportToCSV(stat, report) {

		console.log("convert report to csv");

		const lines = [];

		let comment = [
			'# 場所',
			'棚卸資産の種類',
			'品種',
			'次工程',
			'品名',
			'正味重量',
			'単位',
			'フレコン数量',
			'換数量',
			'備考'
		].join(',');

		lines.push(comment);

		report.forEach(line => {
			
			let row = [
				line.pos,
				line.type,
				line.variety,
				line.next_process,
				line.product,
				line.manager_weight,
				line.unit,
				line.manager_count,
				line.calc_weight,
				line.notes
			].join(',');
			
			if(row.length === 9) {
				return;
			}

			lines.push(row);

		});

		let y = stat.report_year;
		let m = stat.report_month;
		if(m.length < 2) {
			m = '0' + m;
		}
		let n = stat.location_name;
		let filename = `${y}_${m}_${n}.csv`;
		let csv = lines.join('\n');
		var file = new File([csv], filename, {type: "text/plain;charset=utf-8"});
		saveAs(file);

	}

	function evt_handleDownloadClick(evt) {

		let elem = evt.target;
		let userData = elem.userData;

		if(!userData) {
			return;
		}

		const params = {
			status_uuid : userData.status_uuid
		}

		const ajax = new XMLHttpRequest();
		ajax.open('POST', '/admin/api/v1/downloadReport');
		ajax.setRequestHeader('Content-Type', 'application/json');
		ajax.responseType = 'json';
		ajax.send(JSON.stringify(params));

		ajax.onload = () => {
			
			let res = ajax.response;
			if(res.err) {
				throw res.msg;
			}

			let report = res.msg;
			this.API.convertReportToCSV(userData, report);

		}

	}

	function api_selectCompleteReports() {

		const params = {}

		const ajax = new XMLHttpRequest();
		ajax.open('POST', '/admin/api/v1/selectCompleteReport');
		ajax.setRequestHeader('Content-Type', 'application/json');
		ajax.responseType = 'json';
		ajax.send(JSON.stringify(params));

		ajax.onload = () => {

			let res = ajax.response;
			if(res.err) {
				throw res.msg;
			}

			let msg = res.msg || {};
			msg.staff = msg.staff || [];
			this.MEM.status = msg.status || [];

			this.MEM.staff = {};
			msg.staff.forEach( staff => {
				this.MEM.staff[staff.staff_uuid] = staff;
			});
			
			this.API.renderReportTable();

		}

	}

	function api_renderReportTable() {

		let index = 0;
		let table = this.DOM.table.body;
		this.DOM.table.body.innerHTML = '';

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

			c0.setAttribute('class', 'no');

			c0a.setAttribute('class', 'type');
			c0b.setAttribute('class', 'type');

			c1.setAttribute('class', 'location');
			c2.setAttribute('class', 'year');
			c3.setAttribute('class', 'month');
			c5.setAttribute('class', 'date');
			c6.setAttribute('class', 'datetime');
			c8.setAttribute('class', 'datetime');
			ca.setAttribute('class', 'datetime');
			cb.setAttribute('class', 'datetime');
			cc.setAttribute('class', 'icon');

			c0a.textContent = stat.group_1 || "";
			c0b.textContent = stat.group_2 || "";

			// No.

			let str = index.toString();
			while(str.length < 3) {
				str = "0" + str;
			}

			c0.textContent = str;

			// ロケーション名

			c1.textContent = stat.location_name;

			// 売上年

			c2.textContent = stat.report_year;

			// 売上月

			c3.textContent = stat.report_month;

			// 担当者名
			
			let assign_to = this.MEM.staff[stat.assign_to_uuid];
			if(assign_to) {
				c4.textContent = assign_to.staff_name;
			}

			// 実施日

			c5.textContent = stat.date_of_implementation || '-';

			// 現場入力

			c6.textContent = stat.input_complete_time || '-';

			// 承認者1
			
			let manager = this.MEM.staff[stat.manager_uuid];

			if(manager) {
				let name = manager.staff_name;
				let position = manager.staff_position;
				c7.textContent = `${name} (${position})`;
			}

			// 承認1時間

			c8.textContent = stat.manager_approval_time || '-';

			// 承認者2
			
			let director = this.MEM.staff[stat.director_uuid];

			if(director) {
				let name = director.staff_name;
				let position = director.staff_position;
				c9.textContent = `${name} (${position})`;
			}

			// 承認2時間

			ca.textContent = stat.director_approval_time || '-';

			// 財務確定

			cb.textContent = stat.admin_approval_time || '-';

			// Download icon
			
			const span = document.createElement('span');
			span.setAttribute('class', 'circle');
			cc.appendChild(span);

			span.userData = stat;
			span.addEventListener('click', this.EVT.handleDownloadClick);

		});



	}

}).apply({});
