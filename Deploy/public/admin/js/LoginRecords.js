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

const LoginRecords = (function() {

	this.MEM = {
		page : 1,
		limit : 50
	}

	this.DOM = {
		table : {
			body : document.getElementById('LoginRecords.table.body'),
			foot : document.getElementById('LoginRecords.table.foot')
		}
	}

	this.EVT = {
		handlePageClick : evt_handlePageClick.bind(this)
	}

	this.API = {
		getCount : api_getCount.bind(this),
		getRecords : api_getRecords.bind(this),
		renderPagination : api_renderPagination.bind(this),
		renderTable : api_renderTable.bind(this)
	}

	init.apply(this);
	return this;

	function init() {

		this.API.getCount();

	}

	function evt_handlePageClick(evt) {

		let elem = evt.target;
		switch(elem.textContent) {
		case "Prev":

			if(this.MEM.page === 1) {
				return;
			}

			this.MEM.page--;
			elem = this.MEM.pageNum[this.MEM.page - 1];

			break;
		case "Next":

			if(this.MEM.page === this.MEM.count) {
				return;
			}

			this.MEM.page++;
			elem = this.MEM.pageNum[this.MEM.page - 1];

			break;
		default:

			this.MEM.page = parseInt(elem.textContent);

			break;
		}

		if(this.MEM.activeSpan) {
			this.MEM.activeSpan.classList.remove('active');
		}

		this.MEM.activeSpan = elem;
		this.MEM.activeSpan.classList.add('active');
		this.API.getRecords();

	}

	function api_getCount() {

		const params = {}

		const ajax = new XMLHttpRequest();
		ajax.open('POST', '/admin/api/v1/countLogins');
		ajax.setRequestHeader('Content-Type', 'application/json');
		ajax.responseType = 'json';
		ajax.send(JSON.stringify(params));

		ajax.onload = () => {

			let res = ajax.response;
			if(res.err) {
				throw res.msg;
			}
			
			this.MEM.page = 1;
			this.MEM.count = Math.ceil(res.msg / this.MEM.limit);
			this.API.renderPagination();

		}

	}

	function api_getRecords() {

		const params = {
			page : this.MEM.page - 1,
			limit : this.MEM.limit
		}

		const ajax = new XMLHttpRequest();
		ajax.open('POST', '/admin/api/v1/selectLogins');
		ajax.setRequestHeader('Content-Type', 'application/json');
		ajax.responseType = 'json';
		ajax.send(JSON.stringify(params));

		ajax.onload = () => {

			let res = ajax.response;
			if(res.err) {
				throw res.msg;
			}
			
			this.MEM.data = res.msg;
			this.API.renderTable();

		}

	}

	function api_renderPagination() {

		// Do we set a max number of pages?

		if(this.MEM.count > 25) {
			this.MEM.count = 25;
		}

		// Reset the table

		let table = this.DOM.table.foot;
		table.innerHTML = '';
		let row = table.insertRow();

		// Create the first cell

		let firstCell = row.insertCell();
		firstCell.classList.add('word');
		let firstSpan = document.createElement("span");
		firstSpan.textContent = "Prev";
		firstCell.appendChild(firstSpan);
		firstSpan.addEventListener('click', this.EVT.handlePageClick);

		this.MEM.pageNum = [];

		// Add all of the page numbers

		for(let i = 0; i < this.MEM.count; i++) {
			
			let cell = row.insertCell();
			cell.classList.add('num');
			let span = document.createElement("span");
			span.textContent = (i + 1).toString();
			cell.appendChild(span);
			span.addEventListener('click', this.EVT.handlePageClick);

			this.MEM.pageNum[i] = span;

			if(i > 0) {
				continue;
			}

			span.classList.add('active');
			this.MEM.activeSpan = span;


		}

		// Add the last cell

		let lastCell = row.insertCell();
		lastCell.classList.add('word');
		let lastSpan = document.createElement("span");
		lastSpan.textContent = "Next";
		lastCell.appendChild(lastSpan);
		lastSpan.addEventListener('click', this.EVT.handlePageClick);

	}

	function api_renderTable() {

		this.DOM.table.body.innerHTML = '';
		let num = 0;
		let ofs = (this.MEM.page - 1) * this.MEM.limit;

		this.MEM.data.forEach( record => {
		
			const row = this.DOM.table.body.insertRow();

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
			
			c0.setAttribute('class', 'no');
			c1.setAttribute('class', 'datetime');
			c2.setAttribute('class', 'datetime');
			c3.setAttribute('class', '');
			c4.setAttribute('class', '');
			c5.setAttribute('class', '');
			c6.setAttribute('class', 'datetime');
			c7.setAttribute('class', 'datetime');
			c8.setAttribute('class', 'datetime');
			c9.setAttribute('class', 'icon');

			// No.

			num++;
			let str = (ofs + num).toString();
			while(str.length < 3) {
				str = "0" + str;
			}
			c0.textContent = str;

			// Attempt Time

			let attempt_time = moment(record.attempt_time).add(9, 'hours');
			c1.textContent = attempt_time.format('YYYY-MM-DD');

			// Staff Name

			c2.textContent = attempt_time.format('HH:mm:ss');

			// Staff Position
			
			if(record.staff_name || record.staff_position) {
				let name = record.staff_name || '';
				let pos = record.staff_position || '';
				c3.textContent = `${name} ( ${pos} )`
			}

			// Staff Login
			
			c4.textContent = record.staff_login;

			// Ip Address 
			
			let ip = record.real_ip || record.source_ip || '';
			c5.textContent = ip.replace('::ffff:', '');
	
			// Disconnect Time
			
			let end = moment();

			if(record.disconnect_time) {
				end = moment(record.disconnect_time).add(9, 'hours');
				let dc_time = moment(record.disconnect_time).add(9, 'hours');
				c6.textContent = dc_time.format('HH:mm:ss');
			}

			// Logout Time

			if(record.logout_time) {
				end = moment(record.logout_time).add(9, 'hours');
				let out_time = moment(record.logout_time).add(9, 'hours');
				c7.textContent = out_time.format('HH:mm:ss');
			}

			// Session Length

			if(record.login_time) {
				let start = moment(record.login_time).add(9, 'hours');
				let diff = end.diff(start, 'minutes');

				if(diff < 60) {
					c8.textContent = diff + '分';
				} else {

					let hours = Math.floor(diff / 60);
					let min = (diff % 60).toString();
					if(min.length < 2) {
						min = '0' + min;
					}

					c8.textContent = `${hours}時${min}分`;

				}
			}

			// Result

			c9.textContent = record.attempt_result;

		});

	}


}).apply({});
