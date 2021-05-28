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

 Author(s): 
 	Benjamin Collins (collins@wsd.co.jp)
 	Ogawa Kousei (kogawa@wsd.co.jp)

**/

"use strict";

const DATE = new Date();

const REPORT = {
	status : {
		status_uuid : '3d542d34-5312-4d44-b66c-1c422578b1e5',
		report_year : DATE.getFullYear(),
		report_month : DATE.getMonth() + 1,
		assign_to_name : "Tanaka Tarou",
		date_of_implementation : 'yyyy-mm-dd',
		input_complete_time : null,
		manager_uuid : '',
		manager_approval_time : null,
		director_uuid : '',
		director_approval_time : null,
		admin_uuid : '',
		admin_approval_time : null,
		location_uuid : '42a318f9-dded-4643-bc3e-b810fdcbdcb2',
		staff_name : 'Grunty'
	},
	inventory : [],
	stock : [],
	location : {
		location_uuid : '42a318f9-dded-4643-bc3e-b810fdcbdcb2',
		location_name : 'Factory 1'
	},
	managers : [
		{
			staff_name : 'Manager',
			staff_position : '部長',
		}
		/*,
		{
			staff_name : 'Bob',
			staff_position : '課長',
		}
		*/
	]
};

const DataManager = (function () {

	this.MEM = {
		location: {
			location_uuid: localStorage.getItem('location_uuid'),
			location_name: localStorage.getItem('location_name')
		}
	}

	this.DOM = {
		conf: document.getElementById('conf'),
		cover: document.getElementById('cover'),
		save: document.getElementById('save'),
		sales_month: document.getElementById('sales_month'),
		person_in_charge: document.getElementById('person_in_charge'),
		inventory_date_of_treatment: document.getElementById('inventory_date_of_treatment'),
		location: document.getElementById('location'),
		inventory_line: document.getElementById('inventory_line'),
		map_widget: document.getElementById('map_widget'),
		logout: document.getElementById('logout')
	}

	this.EVT = {
		handleSaveClick: evt_handleSaveClick.bind(this),
		handleLogoutClick: evt_handleLogoutClick.bind(this)
	}

	this.API = {
		loadInventoryReport: api_loadInventoryReport.bind(this),
		updateInventoryReport: api_updateInventoryReport.bind(this),
		tableToDataForInventory: api_tableToDataForInventory.bind(this),
		dataToTableForInventory: api_dataToTableForInventory.bind(this),
		renderInventorySummary: api_renderInventorySummary.bind(this),
		loadInventorySummary: api_loadInventorySummary.bind(this),
		submitInventoryReport: api_submitInventoryReport.bind(this),

		loadStockReport: api_loadStockReport.bind(this),
		updateStockReport: api_updateStockReport.bind(this),
		tableToDataForStock: api_tableToDataForStock.bind(this),
		dataToTableForStock: api_dataToTableForStock.bind(this),
		renderStockSummary: api_renderStockSummary.bind(this),
		loadStockSummary: api_loadStockSummary.bind(this),
		submitStockReport: api_submitStockReport.bind(this),

		updateWeight : api_updateWeight.bind(this)

	}

	this.getLocationName = () => this.MEM.location.location_name;

	init.apply(this);
	return this;

	function init() {

		this.API.loadInventoryReport();
		this.DOM.save.addEventListener('click', this.EVT.handleSaveClick);
		this.DOM.logout.addEventListener('click', this.EVT.handleLogoutClick);

		// dummy_loadStockSummary();

	}

	function api_updateWeight() {

		let tab = document.getElementById('TabManager.a');
		if(!tab.classList.contains('active')) {
			return;
		}

		let tpage1 = _core.getTpage1();
		if (!tpage1) {
			return setTimeout(this.API.updateWeight, 100);
		}
		let length = tpage1.children.length;
		
		let count = 0;
		for(let i = 0; i < length; i++) {
			let id = `f_${i}_input`;
			let elem = document.getElementById(id);

			if(!elem) {
				continue;
			}

			let val = parseInt(elem.value);

			if(!val) {
				continue;
			}

			count += val;
		}

		document.getElementById('total_weight').textContent = count.toLocaleString();

	}

	function evt_handleLogoutClick() {

		// Need to clear out the local storage stuff

		const params = {};

		let url;
		switch (location.port) {
		case '3000':
			url = '/api/v1/clientLogout';
			break;
		default:
			url = '/client/session/logout';
			break;
		}

		const ajax = new XMLHttpRequest();
		ajax.open("POST", url);
		ajax.setRequestHeader('Content-Type', 'application/json');
		ajax.responseType = 'json';
		ajax.send(JSON.stringify(params));

		ajax.onload = () => {

			let res = ajax.response;
			if (res.err) {
				throw res.msg;
			}

			if (location.port === '3000') {
				window.location.href = 'index.html';
			} else {
				window.location.href = '/';
			}

		}


	}

	function dummy_loadStockSummary() {

		let tpage2 = _core.getTpage2();
		if (!tpage2) {
			return setTimeout(dummy_loadStockSummary, 100);
		}

		for (let i = 0; i < 15; i++) {
			Stock.addRowLine(1, "");
		}

	}

	function evt_handleSaveClick() {

		if (this.MEM.inventory.input_complete_time) {
			let bool = confirm("編集を有効にしますか？");
			if (!bool) {
				return;
			}

			this.DOM.cover.classList.remove('open');
		} else {

			this.API.tableToDataForInventory();
			this.API.tableToDataForStock();

			this.API.updateInventoryReport();
			// this.API.updateStockReport();

		}

	}

	/*
	 * Inventory
	 */

	function api_renderInventorySummary() {

		// First render the date

		let m = REPORT.status.report_month;
		if (m.length < 2) {
			m = "0" + m;
		}

		let y = REPORT.status.report_year;
		this.DOM.sales_month.textContent = `${y}年${m}月`;

		// Then we render the other information

		let date = new Date();
		let year = date.getFullYear();
		let month = date.getMonth() + 1;
		let day = date.getDate();

		if (month < 10) {
			month = '0' + month;
		}

		if (day < 10) {
			day = '0' + day;
		}

		this.DOM.inventory_date_of_treatment.textContent = `${year}年${month}月${day}日`;
		this.DOM.location.textContent = REPORT.location.location_name;
		this.DOM.person_in_charge.textContent = REPORT.status.staff_name;

		let managers = REPORT.managers; 

		let names = [];
		managers.forEach(manager => {
			let n = manager.staff_name;
			let p = manager.staff_position;
			names.push(`${n} (${p})`);
		});

		this.DOM.inventory_line.textContent = names.join(',');

		// We render the image

		let url = localStorage.getItem('location_map');
		// this.DOM.map_widget.style.backgroundImage = `url('${url}')`;
		this.API.loadInventorySummary();

	}

	//
	// If there is a Next Process, set the Next Process.
	// The judgment at this time is the location name.
	//
	
	/*
	 * Inventory
	 */

	function api_loadInventorySummary() {

		let tpage1 = _core.getTpage1();
		if (!tpage1) {
			return setTimeout(this.API.loadInventorySummary, 100);
		}

		let NextProcessAll = Inventory.getNextProcessAll();
		let next_process = NextProcessAll[this.DOM.location.textContent];
		if (next_process == undefined) {
			next_process = null;
		}

		Inventory.setNextProcess(next_process);
		Inventory.resetColumnNameWithNextProcess();

		this.MEM.inventory.forEach(data => {
			Inventory.addRowLine(1, data);
		});

		let diff = 15 - this.MEM.inventory.length;
		for (let i = 0; i < diff; i++) {
			Inventory.addRowLine(1);
		}

	}



	/*
	 * Stock
	 */
	function api_renderStockSummary() {

		this.API.loadStockSummary();

	}

	/*
	 * Stock
	 */
	function api_loadStockSummary() {

		let tpage2 = _core.getTpage2();
		if (!tpage2) {
			return setTimeout(this.API.loadStockSummary, 100);
		}

		this.MEM.stock.report.forEach(data => {
			Stock.addRowLine(1, data);
		});
	}



	/*
	 * Inventory
	 */
	function api_loadInventoryReport() {

		this.MEM.inventory = REPORT.inventory;
		this.MEM.stock = REPORT.stock;
		
		let a = localStorage.getItem('inventory');
		if(a) {
			this.MEM.inventory = JSON.parse(a);
		}

		let b = localStorage.getItem('stock');
		if(b) {
			this.MEM.stock = JSON.parse(b);
		}

		this.API.renderInventorySummary();
		this.API.dataToTableForStock();
		this.API.updateWeight();

	}

	/*
	 * Stock
	 */

	function api_loadStockReport() {

		const params = {
			location_uuid: this.MEM.location.location_uuid
		};

		// Note: Not found

		let url;
		switch (location.port) {
		case '3000':
			url = '/api/v1/selectReport_stock';
			break;
		default:
			url = '/client/api/v1/selectStock';
			break;
		}

		const ajax = new XMLHttpRequest();
		ajax.open('POST', url);
		ajax.setRequestHeader('Content-Type', 'application/json');
		ajax.responseType = 'json';
		ajax.send(JSON.stringify(params));

		ajax.onload = () => {

			this.MEM.stock = ajax.response.msg;
			this.API.dataToTableForStock();
			this.API.renderStockSummary();

			if (this.MEM.stock.input_complete_time) {
				this.DOM.cover.classList.add('open');
			}

		}

	}

	/*
	 * Inventory
	 */

	function api_updateInventoryReport() {

		localStorage.setItem('inventory', JSON.stringify(this.MEM.inventory));
		localStorage.setItem('stock', JSON.stringify(this.MEM.stock));

		/*
		const params = {
			status_uuid: this.MEM.inventory.status_uuid,
			on_site_report: this.MEM.inventory.report,
			on_site_stock: this.MEM.stock.report
		}

		let url;
		switch (location.port) {
		case '3000':
			url = '/api/v1/updateReport';
			break;
		default:
			url = '/client/api/v1/updateReport';
			break;
		}

		const ajax = new XMLHttpRequest();
		ajax.open('POST', url);
		ajax.setRequestHeader('Content-Type', 'application/json');
		ajax.responseType = 'json';
		ajax.send(JSON.stringify(params));

		ajax.onload = () => {

			console.log(ajax.response);

		}
		*/

	}

	/*
	 * Stock
	 */

	function api_updateStockReport() {

		const params = {
			status_uuid: this.MEM.inventory.status_uuid,
			on_site_stock: this.MEM.stock.report
		}

		let url;
		switch (location.port) {
		case '3000':
			url = '/api/v1/updateStock';
			break;
		default:
			url = '/client/api/v1/updateStock';
			break;
		}

		const ajax = new XMLHttpRequest();
		ajax.open('POST', url);
		ajax.setRequestHeader('Content-Type', 'application/json');
		ajax.responseType = 'json';
		ajax.send(JSON.stringify(params));

		ajax.onload = () => {

			console.log(ajax.response);

		}

	}

	/*
	 * Inventory
	 */
	function api_tableToDataForInventory() {

		//let tpage = document.getElementById('tpage');
		let tpage1 = _core.getTpage1();
		if (!tpage1) {
			return;
		}

		let li = tpage1.children;
		let count = tpage1.children.length;

		let data = [];
		for (let i = 0; i < count; i++) {

			let num = i + 1;

			let d = {
				'pos': document.getElementById(`b_${num}_select`).value,
				'type': document.getElementById(`c_${num}_select`).value,
				'variety': document.getElementById(`d_${num}_select`).value,
				'product': document.getElementById(`e_${num}_select`).value,
				'weight': document.getElementById(`f_${num}_input`).value,
				'unit': document.getElementById(`g_${num}_select`).value,
				'count': document.getElementById(`h_${num}_input`).value,
				'notes': document.getElementById(`i_${num}_input`).value,
				'locked': Inventory.getLocked(`${num}`),
			}

			data.push(d);

		}
		
		this.MEM.inventory = data;
		return data;

	}

	/*
	 * Stock
	 */

	function api_tableToDataForStock() {

		//let tpage = document.getElementById('tpage');
		let tpage2 = _core.getTpage2();
		if (!tpage2) {
			return;
		}

		let li = tpage2.children;
		let count = tpage2.children.length;

		let data = [];
		for (let i = 0; i < count; i++) {

			let num = i + 1;

			let d = {
				'pos': document.getElementById(`_b_${num}_select`).value,
				'type': document.getElementById(`_c_${num}_select`).value,
				'variety': document.getElementById(`_d_${num}_select`).value,
				'product': document.getElementById(`_e_${num}_select`).value,
				'weight': document.getElementById(`_f_${num}_input`).value,
				'unit': document.getElementById(`_g_${num}_select`).value,
				'count': document.getElementById(`_h_${num}_input`).value,
				'notes': document.getElementById(`_i_${num}_input`).value,
				'locked': Stock.getLocked(`${num}`),
			}

			data.push(d);

		}
		
		this.MEM.stock = data;
		return data;

	}

	/*
	 * Inventory
	 */

	function api_dataToTableForInventory() {

		//let tpage = document.getElementById('tpage');
		let tpage1 = _core.getTpage1();
		if (!tpage1) {
			return setTimeout(this.API.dataToTableForInventory, 50);
		}

		/*
				this.MEM.inventory.report.forEach( data => {
					Inventory.addRowLine(1, data);
				});
		*/

	}

	/*
	 * Stock
	 */
	function api_dataToTableForStock() {

		//let tpage = document.getElementById('tpage');
		let tpage2 = _core.getTpage2();
		if (!tpage2) {
			return setTimeout(this.API.dataToTableForStock, 50);
		}

		this.MEM.stock.forEach(data => {
			Stock.addRowLine(1, data);
		});

		let diff = 15 - this.MEM.stock.length;
		if (diff <= 0) {
			return;
		}

		for (let i = 0; i < diff; i++) {
			Stock.addRowLine(1);
		}

	}

	/*
	 * Inventory
	 */
	function api_submitInventoryReport() {

		this.API.tableToDataForInventory();

		const params = {
			status_uuid: this.MEM.inventory.status_uuid,
			on_site_report: this.MEM.inventory.report,
			on_site_stock: this.MEM.stock
		}

		let url;
		switch (location.port) {
		case '3000':
			url = '/api/v1/submitReport';
			break;
		default:
			url = '/client/api/v1/submitReport';
			break;
		}

		const ajax = new XMLHttpRequest();
		ajax.open('POST', url);
		ajax.setRequestHeader('Content-Type', 'application/json');
		ajax.responseType = 'json';
		ajax.send(JSON.stringify(params));

		ajax.onload = () => {

			this.DOM.conf.classList.add('close');

		}

	}

	/*
	 * Stock
	 */
	function api_submitStockReport() {

		this.API.tableToDataForStock();

		const params = {
			status_uuid: this.MEM.stock.status_uuid,
			on_site_report: this.MEM.stock.report
		}

		// Note : Not found

		let url;
		switch (location.port) {
		case '3000':
			url = '/api/v1/submitReport_stock';
			break;
		default:
			url = '/client/api/v1/submitStock';
			break;
		}

		const ajax = new XMLHttpRequest();
		ajax.open('POST', url);
		ajax.setRequestHeader('Content-Type', 'application/json');
		ajax.responseType = 'json';
		ajax.send(JSON.stringify(params));

		ajax.onload = () => {

			//this.DOM.conf.classList.add('close');

		}

	}

}).apply({});
