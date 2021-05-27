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

const TableManager = (function() {

	this.MEM = {
		over : false,
		down : false,
		clientX : -1,
		clientY : -1
	}

	this.DOM = {
		session : {
			exit : document.getElementById('TableManager.session.exit')
		},
		tabs : {
			inventory : document.getElementById('TableManager.tabs.inventory'),
			stock : document.getElementById('TableManager.tabs.stock')
		},
		map : {
			toggle : document.getElementById('TableManager.map.toggle'),
			preview : document.getElementById('TableManager.map.preview')
		},
		report : {
			view : document.getElementById('TableManager.report.view'),
			tbody : document.getElementById('TableManager.report.tbody'),
			saveRow : document.getElementById('TableManager.report.saveRow'),
			delRow : document.getElementById('TableManager.report.delRow'),
			addRow : document.getElementById('TableManager.report.addRow'),
			rowCount : document.getElementById('TableManager.report.rowCount'),
			thumb : document.getElementById('TableManager.report.thumb'),
			slide : document.getElementById('TableManager.report.slide'),
			meta : document.getElementById('TableManager.report.meta'),
			prompt : document.getElementById('TableManager.report.prompt'),
			options : document.getElementById('TableManager.report.options'),
			shade : document.getElementById('TableManager.report.shade'),
			yes : document.getElementById('TableManager.report.yes'),
			no : document.getElementById('TableManager.report.no'),
			submit : document.getElementById('TableManager.report.submit')
		},
		status : {
			report_month : document.getElementById('TableManager.status.report_month'),
			assigned_to : document.getElementById('TableManager.status.assigned_to'),
			report_date : document.getElementById('TableManager.status.report_date'),
			location : document.getElementById('TableManager.status.location'),
			calc_weight : document.getElementById('TableManager.status.calc_weight'),
			auth1 : document.getElementById('TableManager.status.auth1'),
			auth2 : document.getElementById('TableManager.status.auth2')
		}
	}

	this.EVT = {
		handleLogoutClick : evt_handleLogoutClick.bind(this),
		handleTabClick : evt_handleTabClick.bind(this),
		handleAddRowClick : evt_handleAddRowClick.bind(this),
		handleDelRowClick : evt_handleDelRowClick.bind(this),
		handlePlaceChange : evt_handlePlaceChange.bind(this),
		handleSelectType : evt_handleSelectType.bind(this),
		handleSelectVariety : evt_handleSelectVariety.bind(this),
		handleSelectName : evt_handleSelectName.bind(this),
		handleUnitChange : evt_handleUnitChange.bind(this),
		handleInputFocus : evt_handleInputFocus.bind(this),
		handleInputRightFocus : evt_handleInputRightFocus.bind(this),
		handleMouseDown : evt_handleMouseDown.bind(this),
		handleMouseUp : evt_handleMouseUp.bind(this),
		handleMouseMove : evt_handleMouseMove.bind(this),
		handleYesClick : evt_handleYesClick.bind(this),
		handleNoClick : evt_handleNoClick.bind(this),
		handleMapToggle : evt_handleMapToggle.bind(this)
	}

	this.API = {
		loadReport : api_loadReport.bind(this),
		renderStatus : api_renderStatus.bind(this),
		renderInventory : api_renderInventory.bind(this),
		renderStock : api_renderStock.bind(this),
		appendRowI : api_appendRowI.bind(this),
		appendRowS : api_appendRowS.bind(this),
		updateWeight : api_updateWeight.bind(this),
		implementSave : api_implementSave.bind(this),
		triggerSave : api_triggerSave.bind(this),
		lock : api_lock.bind(this),
		unlock : api_unlock.bind(this)
	}

	init.apply(this);
	return this;

	function init() {

		// Reset DOM Elements

		this.DOM.tabs.stock.classList.remove('active');
		this.DOM.tabs.inventory.classList.add('active');
		this.DOM.report.saveRow.classList.add('disabled');
		
		// Append Events to DOM Elements

		this.DOM.map.toggle.addEventListener('click', this.EVT.handleMapToggle);

		for(let key in this.DOM.tabs) {
			this.DOM.tabs[key].addEventListener('click', this.EVT.handleTabClick);
		}

		this.DOM.session.exit.addEventListener('click', this.EVT.handleLogoutClick);
		this.DOM.report.addRow.addEventListener('click', this.EVT.handleAddRowClick);
		this.DOM.report.delRow.addEventListener('click', this.EVT.handleDelRowClick);

		this.DOM.report.yes.addEventListener('click', this.EVT.handleYesClick);
		this.DOM.report.no.addEventListener('click', this.EVT.handleNoClick);

		this.DOM.report.thumb.addEventListener('mousedown', this.EVT.handleMouseDown);
		document.body.addEventListener('mouseup', this.EVT.handleMouseUp);
		document.body.addEventListener('mousemove', this.EVT.handleMouseMove);

		this.DOM.report.thumb.addEventListener('touchstart', this.EVT.handleMouseDown);
		document.body.addEventListener('touchend', this.EVT.handleMouseUp);
		document.body.addEventListener('touchmove', this.EVT.handleMouseMove);

		// Call Functions

		this.API.loadReport();

	}

	function evt_handleMapToggle(evt) {

		let elem = evt.target;
		elem.parentNode.classList.toggle('zoom');

	}

	function api_lock() {
		
		this.DOM.report.view.classList.add('lock');

	}

	function api_unlock() {
		
		this.DOM.report.view.classList.remove('lock');

	}

	function evt_handleUnitChange(evt) {

		let elem = evt.target;
		let userData = elem.userData;
		userData.data.unit = elem.value;
		this.API.triggerSave();

	}

	function evt_handleYesClick(evt) {

		const params = {
			status_uuid : this.MEM.status.status_uuid,
			on_site_report : this.MEM.inventory,
			on_site_stock : this.MEM.stock
		}

		const ajax = new XMLHttpRequest();
		ajax.open('POST', '/client/api/v1/submitReport');
		ajax.setRequestHeader('Content-Type', 'application/json');
		ajax.responseType = 'json';
		ajax.send(JSON.stringify(params));

		ajax.onload = () => {
			
			let res = ajax.response;
			if(res.err) {
				throw res.msg;
			}
			
			this.DOM.report.meta.classList.remove('hide');
			this.DOM.report.submit.classList.remove('up');

			this.DOM.report.prompt.classList.add('hide');
			this.DOM.report.options.classList.add('hide');
		}

	}

	function evt_handleNoClick(evt) {

		this.DOM.report.slide.classList.remove('hide');
		this.DOM.report.shade.classList.add('hide');
		this.DOM.report.meta.classList.remove('hide');
		
		this.DOM.report.prompt.classList.add('hide');
		this.DOM.report.options.classList.add('hide');
		this.DOM.report.submit.classList.remove('up');

	}

	function evt_handleMouseDown(evt) {

		console.log("MOUSE DOWN!!!");

		this.MEM.down = true;

		if(evt.touches && evt.touches.length) {
			this.MEM.clientX = evt.touches[0].clientX;
			this.MEM.clientY = evt.touches[0].clientY;
		} else {
			this.MEM.clientX = evt.clientX;
			this.MEM.clientY = evt.clientY;
		}

	}

	function evt_handleMouseUp(evt) {
		
		this.MEM.down = false;
		
		if(!this.MEM.trigger) {
			this.DOM.report.thumb.style.transform = 'translateX(0px)';
			return;
		}

		this.MEM.trigger = false;
		this.DOM.report.slide.classList.add('hide');
		this.DOM.report.shade.classList.remove('hide');
		this.DOM.report.meta.classList.add('hide');
		this.DOM.report.thumb.classList.remove('lite');
		
		this.DOM.report.prompt.classList.remove('hide');
		this.DOM.report.options.classList.remove('hide');

		this.DOM.report.submit.classList.add('up');
		
		this.API.implementSave();
		setTimeout( () => {
			this.DOM.report.thumb.style.transform = 'translateX(0px)';
		}, 300);

	}
	
	function evt_handleMouseMove(evt) {

		if(!this.MEM.down) {
			this.DOM.report.thumb.style.transform = 'translateX(0px)';
			return;
		}

		let clientX;
		if(evt.touches && evt.touches.length) {
			clientX = evt.touches[0].clientX;
		} else {
			clientX = evt.clientX;
		}

		let diff = clientX - this.MEM.clientX;
		if(diff < 0) {
			diff = 0;
			this.MEM.trigger = false;
			this.DOM.report.thumb.classList.remove('lite');
		} else if (diff < 210) {
			this.MEM.trigger = false;
			this.DOM.report.thumb.classList.remove('lite');
		} else if(diff > 210) {
			diff = 210;
			this.MEM.trigger = true;
			this.DOM.report.thumb.classList.add('lite');
		}

		this.DOM.report.thumb.style.transform = `translateX(${diff}px)`;

	}

	function evt_handleInputRightFocus(evt) {

		let elem = evt.target;
		if(!elem.classList.contains('rel')) {
			return;
		}
		elem = elem.children[0];
		Keypad.API.attachTo(elem, true);
		evt.preventDefault();

	}

	function evt_handleInputFocus(evt) {

		let elem = evt.target;
		if(!elem.classList.contains('rel')) {
			return;
		}
		elem = elem.children[0];
		Keypad.API.attachTo(elem, false);
		evt.preventDefault();

	}

	function evt_handleSelectType(evt) {

		let elem = evt.target;
        let userData = elem.userData;
        if(!userData) {
            return;
        }

        if(elem.value === userData.data.type) {
            return;
        }

        userData.data.type = elem.value;
        userData.data.variety = '';
        userData.data.product = '';
        userData.data.unit = '';
		userData.unit.value = '';

        switch(elem.value) {
        case '':

            userData.variety.innerHTML = `<option value=''></option>`;
            userData.variety.setAttribute('disabled', 'disabled');

            userData.product.innerHTML = `<option value=''></option>`;
            userData.product.setAttribute('disabled', 'disabled');

            break;
        case '製品':

            userData.variety.innerHTML = `<option value=''></option>`;
            userData.variety.removeAttribute('disabled');

            for(let key in this.MEM.products['製品']) {
                let option = document.createElement('option');
                option.setAttribute('value', key);
                option.textContent = key;
                userData.variety.appendChild(option);
            }

            userData.product.innerHTML = `<option value=''></option>`;
            userData.product.setAttribute('disabled', 'disabled');

            break;
        case '原材料':

            userData.variety.innerHTML = `<option value=''></option>`;
            userData.variety.setAttribute('disabled', 'disabled');

            userData.product.innerHTML = `<option value=''></option>`;

            for(let key in this.MEM.products['原材料']) {
                let option = document.createElement('option');
				
                let val = this.MEM.products['原材料'][key].name;
                option.setAttribute('value', val);
                option.textContent = val;
                userData.product.appendChild(option);
            }

            userData.product.removeAttribute('disabled');
			break;
        case '仕掛品':

            userData.variety.innerHTML = `<option value=''></option>`;
            userData.variety.setAttribute('disabled', 'disabled');

            userData.product.innerHTML = `<option value=''></option>`;
            for(let key in this.MEM.products['仕掛品']) {
                let option = document.createElement('option');
                let val = this.MEM.products['仕掛品'][key].name;
                option.setAttribute('value', val);
                option.textContent = val;
                userData.product.appendChild(option);
            }
            userData.product.removeAttribute('disabled');

            break;
        case 'ダスト':

            userData.variety.innerHTML = `<option value=''></option>`;
            userData.variety.setAttribute('disabled', 'disabled');

            userData.product.innerHTML = `<option value=''></option>`;
            for(let key in this.MEM.products['ダスト']) {
                let option = document.createElement('option');
                let val = this.MEM.products['ダスト'][key].name;
                option.setAttribute('value', val);
                option.textContent = val;
                userData.product.appendChild(option);
            }

            userData.product.removeAttribute('disabled');

            break;
        case '貯蔵品':
            userData.variety.innerHTML = `<option value=''></option>`;
            userData.variety.setAttribute('disabled', 'disabled');

            userData.product.innerHTML = `<option value=''></option>`;
            for(let key in this.MEM.products['貯蔵品']) {
                let option = document.createElement('option');
                let val = this.MEM.products['貯蔵品'][key].name;
                option.setAttribute('value', val);
                option.textContent = val;
                userData.product.appendChild(option);
            }

            userData.product.removeAttribute('disabled');
            break;
        }

        this.API.triggerSave();


	}

	function evt_handleSelectVariety(evt) {
		
        let elem = evt.target;
        let userData = elem.userData;
        if(!userData) {
            return;
        }

        if(elem.value === userData.data.variety) {
            return;
        }

        userData.data.variety = elem.value;
        userData.data.product = '';

        userData.product.innerHTML = `<option value=''></option>`;
        for(let key in this.MEM.products['製品'][elem.value]) {
            let option = document.createElement('option');
            let val = this.MEM.products['製品'][elem.value][key].name;
            option.setAttribute('value', val);
            option.textContent = val;
            userData.product.appendChild(option);
        }

        userData.product.removeAttribute('disabled');
        if(elem.selectedIndex === 0) {
            userData.product.setAttribute('disabled', 'disabled');
        }

		userData.unit.value = '';
		userData.data.unit = '';

        this.API.triggerSave();

	}

	function evt_handleSelectName(evt) {
		
		let elem = evt.target;
		let userData = elem.userData;
		userData.data.product = elem.value;


		// Then we need to Trackdown units

		let t = userData.type.value;
		let s = userData.variety.value;
		let r = userData.product.value

		let group = this.MEM.products[t];
		group = this.MEM.products[t][s] || group;
			
		let obj;
		for(let key in group) {
			if(r !== group[key].name) {
				continue;
			}
			obj = group[key];
			break;
		}

		if(!obj) {
			userData.data.unit = '';
			userData.data.next = '';
			userData.unit.value = '';

			if(t === '原材料') {
				userData.variety.innerHTML = `<option></option>`;
			}

        	this.API.triggerSave();
			return;
		}
		
		userData.data.unit = obj.unit;
		userData.unit.value = obj.unit;
		userData.data.next = obj.next || '';
		this.API.triggerSave();

		// Then we check for next process

		if(t !== '原材料') {
			return;
		}
		
		userData.data.next = obj.next;
		userData.variety.innerHTML = `
			<option>${obj.next}</option>
		`;

	}

	function evt_handlePlaceChange(evt) {
		
		let elem = evt.target;
		let userData = elem.userData;

		if(elem.value === 'copy') {
			
			let index = this.MEM.userData.indexOf(userData);
			if(index === 0) {
				return evt.preventDefault();
			}
			
			let fromData = this.MEM.userData[index - 1];

			for(let key in fromData.data) {
				userData.data[key] = fromData.data[key];
			}

			for(let key in fromData) {
				let e = fromData[key];
				if(! (e instanceof HTMLElement)) {
					continue;
				}

				if(e.tagName === 'SELECT') {
					userData[key].innerHTML = e.innerHTML;
				}

				userData[key].value = e.value;			
				if(e.getAttribute('disabled')) {
					userData[key].setAttribute('disabled', 'disabled');
				} else {
					userData[key].removeAttribute('disabled');
				}

			}
			
			this.API.implementSave();
		} else if (elem.value === 'remove'){
			
			for(let key in userData.data) {
				userData.data[key] = '';
			}

			for(let key in userData) {
				let e = userData[key];
				if(! (e instanceof HTMLElement)) {
					continue;
				}

				e.value = '';
				
				if(e.tagName !== 'SELECT') {
					continue;
				}

				if(['pos', 'type', 'unit'].indexOf(key) !== -1) {
					continue;
				}

				e.innerHTML = '';
				e.setAttribute('disabled', 'disabled');

			}

		} else {
			userData.data.pos = elem.value;
		}

		this.API.triggerSave();

	}

	function api_implementSave() {
		
		this.DOM.report.saveRow.classList.add('disabled');

		const params = {
			status_uuid : this.MEM.status.status_uuid,
			inventory : this.MEM.inventory,
			stock : this.MEM.stock
		}

		const ajax = new XMLHttpRequest();
		ajax.open('POST', '/client/api/v1/updateInvReport');
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

	function api_triggerSave() {
		
		this.API.updateWeight();
		if(this.MEM.timeout) {
			window.clearTimeout(this.MEM.timeout);
		}
		
		this.DOM.report.saveRow.classList.remove('disabled');
		this.MEM.timeout = window.setTimeout(this.API.implementSave, 4000);

	}

	function evt_handleAddRowClick() {
	
		let array = this.MEM.array;
		let data = {};
		for(let key in array[0]) {
			data[key] = "";
		}

		array.push(data);
		switch(this.MEM.view) {
		case 'inventory':
			this.API.appendRowI(data);
			break;
		case 'stock':
			this.API.appendRowS(data);
			break;
		}

		this.API.implementSave();
		this.DOM.report.delRow.removeAttribute('disabled');
		this.DOM.report.rowCount.textContent = array.length;

	}

	function evt_handleDelRowClick() {

		this.MEM.array.pop();
		if(this.MEM.array.length <= 15) {
			this.DOM.report.delRow.setAttribute('disabled', 'disabled');
		}

		let table = this.DOM.report.tbody;
		let rowCount = table.rows.length;
		let row = table.rows[rowCount - 1];
		table.deleteRow(rowCount - 1);
		this.API.implementSave();
		this.MEM.userData.pop();

		this.DOM.report.rowCount.textContent = this.MEM.array.length;

	}

	function evt_handleLogoutClick() {

		const params = {}

		const ajax = new XMLHttpRequest();
		ajax.open('POST', '/client/session/logout');
		ajax.setRequestHeader('Content-Type', 'application/json');
		ajax.responseType = 'json';
		ajax.send(JSON.stringify(params));

		ajax.onload = () => {
			
			let res = ajax.response;
			if(res.err) {
				throw res.msg;
			}

			window.location.href = '/';

		}

	}

	function evt_handleTabClick(evt) {

		let elem = evt.target;
		while(elem.parentNode && elem.tagName !== "TD") {
			elem = elem.parentNode;
		}

		let id = elem.getAttribute('id');
		if(!id) {
			return;
		}

		let leaf = id.split('.').pop();

		switch(leaf) {
		case 'inventory':

			this.DOM.tabs.stock.classList.remove('active');
			this.DOM.tabs.inventory.classList.add('active');
			this.API.renderInventory();

			break;
		case 'stock':

			this.DOM.tabs.stock.classList.add('active');
			this.DOM.tabs.inventory.classList.remove('active');
			this.API.renderStock();

			break;
		}

	}

	function api_loadReport() {

		const params = {}

		const ajax = new XMLHttpRequest();
		ajax.open('POST', '/client/api/v1/selectInvReport');
		ajax.setRequestHeader('Content-Type', 'application/json');
		ajax.responseType = 'json';
		ajax.send(JSON.stringify(params));

		ajax.onload = () => {

			let res = ajax.response;
			if(res.err) {
				throw res.msg;
			}
			

			// Set the memory

			this.MEM.inventory = res.msg.inventory;
			this.MEM.stock = res.msg.stock;
			this.MEM.status = res.msg.status;
			this.MEM.location = res.msg.location;
			this.MEM.managers = res.msg.managers;
			this.MEM.products = this.MEM.location.location_products;

			// Add Managers
			
			this.DOM.status.auth1.textContent = '';
			this.DOM.status.auth2.textContent = '';

			if(res.msg.managers[0]) {
				let m = res.msg.managers[0];
				this.DOM.status.auth1.textContent = `
					[${m.staff_position}] ${m.staff_name}
				`;
			}

			if(res.msg.managers[1]) {
				let m = res.msg.managers[1];
				this.DOM.status.auth2.textContent = `
					[${m.staff_position}] ${m.staff_name}
				`;
			}

			// Call the Render Functions

			this.API.renderStatus();
			this.API.renderInventory();

			if(this.MEM.status.input_complete_time) {
				this.DOM.report.shade.classList.remove('hide');
				this.DOM.report.meta.classList.remove('hide');
				this.DOM.report.meta.parentNode.classList.add('down');

				this.DOM.report.prompt.classList.add('hide');
				this.DOM.report.options.classList.add('hide');
				this.DOM.report.slide.classList.add('hide');
			}

		}

	}

	function api_renderStatus() {

		let src = `url('${this.MEM.location.location_map}')`;
		this.DOM.map.preview.style.backgroundImage = src;

		let year = this.MEM.status.report_year;
		let month = this.MEM.status.report_month;
		if(month.length < 2) {
			month = "0" + month;
		}

		let report_month = `${year}年${month}月`;
		this.DOM.status.report_month.textContent = report_month;
		
		let staff_name = this.MEM.status.staff_name;
		this.DOM.status.assigned_to.textContent = staff_name;

		let date = new Date();
		let y = date.getFullYear();
		let m = date.getMonth() + 1;
		let d = date.getDate();

		if(m < 10) {
			m = "0" + m;
		}

		if(d < 10) {
			d = "0" + d;
		}

		let report_date = `${y}年${m}月${d}日`;
		this.DOM.status.report_date.textContent = report_date;

		let loc_name = this.MEM.location.location_name;
		this.DOM.status.location.textContent = loc_name;

		this.DOM.status.calc_weight.textContent = '0 kg';

	}

	function api_renderStock() {

		this.MEM.view = 'stock';
		this.DOM.report.tbody.innerHTML = '';
		this.MEM.stock = this.MEM.stock || [];
		let array = this.MEM.stock;

		while(array.length < 15) {
			array.push({
				calc_weight : '',
				count : '',
				notes : '',
				pos : '',
				product : '',
				type : '',
				unit : '',
				variety : '',
				weight : ''
			});
		}
		
		this.MEM.userData = []
		for(let i = 0; i < array.length; i++) {
			this.API.appendRowS(array[i]);
		}

		this.MEM.array = array;
		this.API.updateWeight();
		
		if(array.length > 15) {
			this.DOM.report.delRow.removeAttribute('disabled');
		} else {
			this.DOM.report.delRow.setAttribute('disabled', 'disabled');
		}
		
		this.DOM.report.rowCount.textContent = array.length;

	}

	function api_renderInventory() {

		this.MEM.view = 'inventory';

		this.DOM.report.tbody.innerHTML = '';
		this.MEM.inventory = this.MEM.inventory || [];
		let array = this.MEM.inventory;

		while(array.length < 15) {
			array.push({
				calc_weight : '',
				count : '',
				notes : '',
				pos : '',
				product : '',
				type : '',
				unit : '',
				variety : '',
				weight : ''
			});
		}
		
		this.MEM.userData = []
		for(let i = 0; i < array.length; i++) {
			this.API.appendRowI(array[i]);
		}

		this.MEM.array = array;
		this.API.updateWeight();

		if(array.length > 15) {
			this.DOM.report.delRow.removeAttribute('disabled');
		} else {
			this.DOM.report.delRow.setAttribute('disabled', 'disabled');
		}
		
		this.DOM.report.rowCount.textContent = array.length;

	}

	function api_appendRowS(data) {

		const userData = {
			data : data
		}

		this.MEM.userData.push(userData);
		const row = this.DOM.report.tbody.insertRow();
		row.userData = userData;

		// Insert Cells

		const ca = row.insertCell();
		const cb = row.insertCell();
		const cc = row.insertCell();
		const cd = row.insertCell();
		const ce = row.insertCell();
		const cf = row.insertCell();
		const cg = row.insertCell();
		const ch = row.insertCell();
		const ci = row.insertCell();

		// Set Classes

		ca.setAttribute('class', 'a');
		cb.setAttribute('class', 'b');
		cc.setAttribute('class', 'c');
		cd.setAttribute('class', 'd');
		ce.setAttribute('class', 'e');
		cf.setAttribute('class', 'f');
		cg.setAttribute('class', 'g');
		ch.setAttribute('class', 'h');
		ci.setAttribute('class', 'i');

		// No.

		let str = this.DOM.report.tbody.rows.length.toString();
		while(str.length < 2) {
			str = '0' + str;
		}
		ca.textContent = str;

		// 場所

		const select1 = document.createElement('select');
		select1.innerHTML = `<option></option>`;
		cb.appendChild(select1);

		userData.pos = select1;
		select1.userData = userData;

		this.MEM.location.location_places.forEach( no => {
			let option = document.createElement('option');

			let str = no.toString();
			if(str.length < 2) {
				str = '0' + str;
			}

			option.setAttribute('value', 'No.' + str);
			option.textContent = str;
			select1.appendChild(option);
		});
		
		let opt1 = document.createElement('option');
		opt1.textContent = '上と同じ';
		opt1.value = 'copy';
		select1.appendChild(opt1);
		
		let opt2 = document.createElement('option');
		opt2.textContent = '行クリア';
		opt2.value = 'remove';
		select1.appendChild(opt2);

		select1.addEventListener('change', this.EVT.handlePlaceChange);

		if(data.pos.length) {
			select1.value = data.pos;
		}

		// 棚卸資産の種類

		const select2 = document.createElement('select');
		select2.innerHTML = `<option value=''></option>`;
		cc.appendChild(select2);

		userData.type = select2;
		select2.userData = userData;
		select2.addEventListener('change', this.EVT.handleSelectType);

		let option = document.createElement('option');
		option.setAttribute('value', '貯蔵品');
		option.textContent = '貯蔵品';
		select2.appendChild(option);

		if(data.type.length) {
			select2.value = data.type;
		}

		// 品種

		const select3 = document.createElement('select');
		select3.innerHTML = `<option></option>`;
		cd.appendChild(select3);

		userData.variety = select3;
		select3.userData = userData;
		select3.setAttribute('disabled', 'disabled');

		if(data.variety.length) {
			select3.value = data.variety;
		} else {
			select3.setAttribute('disabled', 'disabled');
		}

		// 品名

		const select4 = document.createElement('select');
		select4.innerHTML = `<option></option>`;
		select4.setAttribute('class', 'placeholder');
		ce.appendChild(select4);

		userData.product = select4;
		select4.userData = userData;
		select4.addEventListener('change', this.EVT.handleSelectName);

		if(this.MEM.products['貯蔵品']) {
			for(let key in this.MEM.products['貯蔵品']) {
				let option = document.createElement('option');
				let val = this.MEM.products['貯蔵品'][key].name;
				option.setAttribute('value', val);
				option.textContent = val;
				select4.appendChild(option);
			}
		}


		if(data.product.length) {
			select4.value = data.product;
		} else {
			select4.setAttribute('disabled', 'disabled');
		}
		select4.addEventListener('change', this.EVT.handleSelectName);

		// 正味重量

		let rel = document.createElement('div');
		const input1 = document.createElement('input');
		let center = document.createElement('div');
	
		rel.setAttribute('class', 'rel');
		input1.setAttribute('type', 'text');
		center.setAttribute('class', 'center');
		
		rel.addEventListener('mousedown', this.EVT.handleInputFocus);
		rel.addEventListener('touchstart', this.EVT.handleInputFocus);

		cf.appendChild(rel);
		rel.appendChild(input1);
		rel.appendChild(center);

		input1.value = data.weight;
		userData.weight = input1;
		input1.userData = userData;
		userData.w_center = center;

		// 単位

		const select5 = document.createElement('select');
		select5.innerHTML = `<option></option>`;
		cg.appendChild(select5);
		const opts = [ 'kg', '枚', '本', '式', '個' , '缶', '台'];

		opts.forEach( opt => {
			let option = document.createElement('option');
			option.setAttribute('value', opt);
			option.textContent = opt;
			select5.appendChild(option);
		});

		userData.unit = select5;
		select5.userData = userData;
		select5.setAttribute('disabled', 'disabled');

		if(data.unit.length) {
			select5.value = data.unit;
		}

		select5.addEventListener('change', this.EVT.handleUnitChange);
		
		// フレコン数量

		rel = document.createElement('div');
		const input2 = document.createElement('input');
		center = document.createElement('div');
	
		rel.setAttribute('class', 'rel');
		input2.setAttribute('type', 'text');
		center.setAttribute('class', 'center');

		ch.appendChild(rel);
		rel.appendChild(input2);
		rel.appendChild(center);

		input2.value = data.count;
		userData.count = input2;
		input2.userData = userData;
		userData.w_center = center;

		rel.addEventListener('mousedown', this.EVT.handleInputRightFocus);
		rel.addEventListener('touchstart', this.EVT.handleInputRightFocus);

		//  備考

		const input3 = document.createElement('input');
		input3.setAttribute('type', 'text');
		input3.setAttribute('class', 'note');
		ci.appendChild(input3);
		input3.value = data.notes;

		userData.notes = input3;
		input3.userData = userData;
	}

	function api_appendRowI(data) {

		const userData = {
			data : data
		}

		this.MEM.userData.push(userData);
		const row = this.DOM.report.tbody.insertRow();
		row.userData = userData;

		// Insert Cells

		const ca = row.insertCell();
		const cb = row.insertCell();
		const cc = row.insertCell();
		const cd = row.insertCell();
		const ce = row.insertCell();
		const cf = row.insertCell();
		const cg = row.insertCell();
		const ch = row.insertCell();
		const ci = row.insertCell();

		// Set Classes

		ca.setAttribute('class', 'a');
		cb.setAttribute('class', 'b');
		cc.setAttribute('class', 'c');
		cd.setAttribute('class', 'd');
		ce.setAttribute('class', 'e');
		cf.setAttribute('class', 'f');
		cg.setAttribute('class', 'g');
		ch.setAttribute('class', 'h');
		ci.setAttribute('class', 'i');

		// No.

		let str = this.DOM.report.tbody.rows.length.toString();
		while(str.length < 2) {
			str = '0' + str;
		}
		ca.textContent = str;

		// 場所

		const select1 = document.createElement('select');
		select1.innerHTML = `<option></option>`;
		cb.appendChild(select1);

		userData.pos = select1;
		select1.userData = userData;

		this.MEM.location.location_places.forEach( no => {
			let option = document.createElement('option');

			let str = no.toString();
			if(str.length < 2) {
				str = '0' + str;
			}

			option.setAttribute('value', 'No.' + str);
			option.textContent = str;
			select1.appendChild(option);
		});
		
		let opt1 = document.createElement('option');
		opt1.textContent = '上と同じ';
		opt1.value = 'copy';
		select1.appendChild(opt1);
		
		let opt2 = document.createElement('option');
		opt2.textContent = '行クリア';
		opt2.value = 'remove';
		select1.appendChild(opt2);

		select1.addEventListener('change', this.EVT.handlePlaceChange);

		if(data.pos.length) {
			select1.value = data.pos;
		}

		// 棚卸資産の種類

		const select2 = document.createElement('select');
		select2.innerHTML = `<option value=''></option>`;
		cc.appendChild(select2);

		userData.type = select2;
		select2.userData = userData;
		select2.addEventListener('change', this.EVT.handleSelectType);

		for(let key in this.MEM.products) {
			if(key === "貯蔵品") {
				continue;
			}

			let option = document.createElement('option');
			option.setAttribute('value', key);
			option.textContent = key;
			select2.appendChild(option);
		}

		if(data.type.length) {
			select2.value = data.type;
		}

		// 品種

		const select3 = document.createElement('select');
		select3.innerHTML = `<option></option>`;
		select3.setAttribute('class', 'placeholder');
		cd.appendChild(select3);

		userData.variety = select3;
		select3.userData = userData;
		select3.addEventListener('change', this.EVT.handleSelectVariety);

		switch(data.type) {
		case "製品":
			for(let key in this.MEM.products['製品']) {
				let option = document.createElement('option');
				option.setAttribute('value', key);
				option.textContent = key;
				select3.appendChild(option);
			}
			break;
		case "原材料":
			select3.innerHTML = `<option>${data.next}</option>`;
			select3.setAttribute('disabled', 'disabled');
			break;
		default:
			select3.setAttribute('disabled', 'disabled');
			break;
		}

		if(data.variety.length) {
			select3.value = data.variety;
		}

		// 品名

		const select4 = document.createElement('select');
		select4.innerHTML = `<option></option>`;
		select4.setAttribute('class', 'placeholder');
		ce.appendChild(select4);

		userData.product = select4;
		select4.userData = userData;
		select4.addEventListener('change', this.EVT.handleSelectName);

		switch(data.type) {
		case "製品":

			if(this.MEM.products['製品'][data.variety]) {

				for(let key in this.MEM.products['製品'][data.variety]) {
					let option = document.createElement('option');
					let val = this.MEM.products['製品'][data.variety][key].name;
					option.setAttribute('value', val);
					option.textContent = val;
					select4.appendChild(option);
				}

			} else {
				select4.setAttribute('disabled', 'disabled');
			}

			break;
		case "原材料":

			if(this.MEM.products['原材料']) {

				for(let key in this.MEM.products['原材料']) {
					let option = document.createElement('option');
					let val = this.MEM.products['原材料'][key].name;
					option.setAttribute('value', val); 
					option.textContent = val;
					select4.appendChild(option);
				}

			} else {
				select4.setAttribute('disabled', 'disabled');
			}

			break;
		case "仕掛品":

			if(this.MEM.products['仕掛品']) {

				for(let key in this.MEM.products['仕掛品']) {
					let option = document.createElement('option');
					let val = this.MEM.products['仕掛品'][key].name;
					option.setAttribute('value', val); 
					option.textContent = val;
					select4.appendChild(option);
				}

			} else {
				select4.setAttribute('disabled', 'disabled');
			}

			break;
		case "ダスト":

			if(this.MEM.products['ダスト']) {

				for(let key in this.MEM.products['ダスト']) {
					let option = document.createElement('option');
					let val = this.MEM.products['ダスト'][key].name;
					option.setAttribute('value', val); 
					option.textContent = val;
					select4.appendChild(option);
				}

			} else {
				select4.setAttribute('disabled', 'disabled');
			}

			break;
		default:
			select4.setAttribute('disabled', 'disabled');
			break;
		}

		if(data.product.length) {
			select4.value = data.product;
		}

		// 正味重量

		let rel = document.createElement('div');
		const input1 = document.createElement('input');
		let center = document.createElement('div');
	
		rel.setAttribute('class', 'rel');
		input1.setAttribute('type', 'text');
		center.setAttribute('class', 'center');
		
		rel.addEventListener('mousedown', this.EVT.handleInputFocus);
		rel.addEventListener('touchstart', this.EVT.handleInputFocus);

		cf.appendChild(rel);
		rel.appendChild(input1);
		rel.appendChild(center);
		
		let w = parseInt(data.weight.replace(/,/g, ''));

		if(w) {
			input1.value = w.toLocaleString();
		} else {
			input1.value = data.weight;
		}

		userData.weight = input1;
		input1.userData = userData;
		userData.w_center = center;

		// 単位

		const select5 = document.createElement('select');
		select5.innerHTML = `<option></option>`;
		cg.appendChild(select5);
		const opts = [ 'kg', '枚', '本', '式', '個' , '缶', '台'];
		select5.setAttribute('disabled', 'disabled');

		opts.forEach( opt => {
			let option = document.createElement('option');
			option.setAttribute('value', opt);
			option.textContent = opt;
			select5.appendChild(option);
		});

		userData.unit = select5;
		select5.userData = userData;

		if(data.unit.length) {
			select5.value = data.unit;
		}

		select5.addEventListener('change', this.EVT.handleUnitChange);
		
		// フレコン数量

		rel = document.createElement('div');
		const input2 = document.createElement('input');
		center = document.createElement('div');
	
		rel.setAttribute('class', 'rel');
		input2.setAttribute('type', 'text');
		center.setAttribute('class', 'center');

		ch.appendChild(rel);
		rel.appendChild(input2);
		rel.appendChild(center);

		input2.value = data.count;
		userData.count = input2;
		input2.userData = userData;
		userData.w_center = center;
		rel.addEventListener('mousedown', this.EVT.handleInputRightFocus);
		rel.addEventListener('touchstart', this.EVT.handleInputRightFocus);

		//  備考

		const input3 = document.createElement('input');
		input3.setAttribute('type', 'text');
		input3.setAttribute('class', 'note');
		ci.appendChild(input3);
		input3.value = data.notes;

		userData.notes = input3;
		input3.userData = userData;
	}

	function api_updateWeight() {
		
		let array = this.MEM.inventory;
		let weight = 0;

		for(let i = 0; i < array.length; i++) {
			let data = array[i];

			let w = parseInt(data.weight.replace(/,/g, ''));

			let unit = data.unit.toLowerCase();

			if(unit !== 'kg') {
				continue;
			}

			if(!w) {
				continue;
			}

			weight += w;
		}

		let str = weight.toLocaleString('en');
		this.DOM.status.calc_weight.textContent =  str + " kg";

	}

}).apply({});
