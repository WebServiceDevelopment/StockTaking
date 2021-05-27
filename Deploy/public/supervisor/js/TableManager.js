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

	this.MEM = {}

	this.DOM = {
		tbody : document.getElementById('TableManager.tbody'),
		map : {
			div : document.getElementById('TableManager.map.div'),
			image : document.getElementById('TableManager.map.image'),
			zoom : document.getElementById('TableManager.map.zoom')
		},
		status : {
			date : document.getElementById('TableManager.status.date'),
			position : document.getElementById('TableManager.status.position'),
			execute : document.getElementById('TableManager.status.execute'),
			location : document.getElementById('TableManager.status.location'),
			textarea : document.getElementById('TableManager.status.textarea'),
			notes : document.getElementById('TableManager.status.notes'),
			weight : document.getElementById('TableManager.status.weight')
		},
		rows : {
			save : document.getElementById('TableManager.rows.save'),
			add : document.getElementById('TableManager.rows.add'),
			remove : document.getElementById('TableManager.rows.remove')
		},
		tabs : {
			inventory : document.getElementById('TableManager.rows.inventory'),
			stock : document.getElementById('TableManager.rows.stock')
		}
	}

	this.EVT = {
		handleSelectFocus : evt_handleSelectFocus.bind(this),
		handleSelectBlur : evt_handleSelectBlur.bind(this),
		handlePlaceholder : evt_handlePlaceholder.bind(this),
		handleSelectType : evt_handleSelectType.bind(this),
		handleSelectVariety : evt_handleSelectVariety.bind(this),
		handleSelectName : evt_handleSelectName.bind(this),
		handleWindowResize : evt_handleWindowResize.bind(this),
		handleMapZoomClick : evt_handleMapZoomClick.bind(this),
		handleInputChange : evt_handleInputChange.bind(this),
		handleAddRowClick : evt_handleAddRowClick.bind(this),
		handleRemoveRowClick : evt_handleRemoveRowClick.bind(this),
		handleSaveClick : evt_handleSaveClick.bind(this),
		handleInventoryClick : evt_handleInventoryClick.bind(this),
		handleStockClick : evt_handleStockClick.bind(this),

		handleInputFocus : evt_handleInputFocus.bind(this),
		handleInputBlur : evt_handleInputBlur.bind(this),
		handleInputUpdate : evt_handleInputUpdate.bind(this),
	}

	this.API = {
		appendRow : api_appendRow.bind(this),
		updateTableSize : api_updateTableSize.bind(this),
		openReport : api_openReport.bind(this),
		renderLocation : api_renderLocation.bind(this),
		renderStatus : api_renderStatus.bind(this),
		renderStock : api_renderStock.bind(this),
		renderInventory : api_renderInventory.bind(this),
		triggerSave : api_triggerSave.bind(this),
		implementSave : api_implementSave.bind(this),
		disableTable : api_disableTable.bind(this),
		appendStock : api_appendStock.bind(this),
		checkOpen : api_checkOpen.bind(this),
		renderFixNote : api_renderFixNote.bind(this),
		updateWeight : api_updateWeight.bind(this),
		formatNumber : api_formatNumber.bind(this)
	}

	init.apply(this);
	return this;

	function init() {

		window.addEventListener('resize', this.EVT.handleWindowResize);
		this.DOM.map.zoom.addEventListener('click', this.EVT.handleMapZoomClick);
		
		this.API.updateTableSize();
		
		this.DOM.rows.save.addEventListener('click', this.EVT.handleSaveClick);
		this.DOM.rows.add.addEventListener('click', this.EVT.handleAddRowClick);
		this.DOM.rows.remove.addEventListener('click', this.EVT.handleRemoveRowClick);

		this.DOM.tabs.inventory.addEventListener('click', this.EVT.handleInventoryClick);
		this.DOM.tabs.stock.addEventListener('click', this.EVT.handleStockClick);


	}

	function api_formatNumber(num) {

		num = num.toString();
		num = num.replace(/,/g, '');
		num = num.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		return num;

	}

	function evt_handleInputUpdate(evt) {

		console.log("input change!!!");

	}

	function evt_handleInputFocus(evt) {

		let elem = evt.target;
		let str = elem.value;
		str = str.replace(/,/g, '');
		elem.value = str;

		let userData = elem.userData;

	}

	function evt_handleInputBlur(evt) {

		console.log("input blur!!");

		let elem = evt.target;
		let val = elem.value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		elem.value = val;

		let userData = elem.userData;

	}

	function api_updateWeight() {

		let array = this.MEM.report.managers_report;

		let weight = 0;

		for(let i = 0; i < array.length; i++) {
			let data = array[i];
			let w = 0;

			switch(this.MEM.role) {
			case "manager":
				w = parseInt(data.manager_weight.replace(/,/g, ''));
				break;
			case "director":
				w = parseInt(data.director_weight.replace(/,/g, ''));
				break;
			case "fixed":
				w = parseInt(data.fixed_weight.replace(/,/g, ''));
				break;
			}

			if(!w) {
				continue;
			}

			if(data.unit.toLowerCase() !== 'kg') {
				continue;
			}

			weight += w;
		}

		this.DOM.status.weight.textContent = weight.toLocaleString('en') + " kg";;

	}

	function api_checkOpen() {

		return this.MEM.report ? true : false;

	}

	function evt_handleInventoryClick() {
		
		this.MEM.view = 'inventory';
		this.DOM.tabs.inventory.classList.add('active');
		this.DOM.tabs.stock.classList.remove('active');
		this.API.renderInventory();

	}

	function evt_handleStockClick() {

		this.MEM.view = 'stock';
		this.DOM.tabs.inventory.classList.remove('active');
		this.DOM.tabs.stock.classList.add('active');
		this.API.renderStock();

	}

	function api_disableTable() {
		
		this.MEM.locked = true;
		this.DOM.tbody.classList.add('locked');

		this.MEM.userData.forEach( data => {
			
			for(let key in data) {
				if(key === 'data') {
					continue;
				}
				data[key].setAttribute('disabled', 'disabled');
			}

		});

		this.DOM.rows.add.classList.add('disabled');
		this.DOM.rows.remove.classList.add('disabled');
		this.DOM.rows.save.classList.add('disabled');

	}

	function evt_handleSaveClick() {
		
		this.API.implementSave();

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
			this.API.appendRow(data);
			break;
		case 'stock':
			this.API.appendStock(data);
			break;
		}

		this.API.implementSave();
		this.DOM.rows.remove.classList.remove('disabled');

	}

	function evt_handleRemoveRowClick() {

		this.MEM.array.pop();
		if(this.MEM.array.length <= 15) {
			this.DOM.rows.remove.classList.add('disabled');
		}

		let table = this.DOM.tbody;
		let rowCount = table.rows.length;
		table.deleteRow(rowCount - 1);

		this.API.implementSave();

	}

	function evt_handleInputChange(evt) {
		
		let elem = evt.target;
		let userData = elem.userData;
		if(!userData) {
			return;
		}

		let keyName;
		for(let key in userData) {
			if(elem !== userData[key]) {
				continue;
			}
			userData.data[key] = elem.value;
			break;
		}

		this.API.triggerSave();

	}

	function api_triggerSave() {
		
		this.API.updateWeight();

		if(this.MEM.timeout) {
			window.clearTimeout(this.MEM.timeout);
		}

		this.MEM.timeout = window.setTimeout(this.API.implementSave, 4000);

	}

	function api_implementSave() {

		this.API.updateWeight();

		const params = {
			status_uuid : this.MEM.status.status_uuid,
			managers_report : this.MEM.report.managers_report,
			managers_stock : this.MEM.report.managers_stock
		}

		const ajax = new XMLHttpRequest();
		ajax.open('POST', '/supervisor/api/v1/updateReport');
		ajax.setRequestHeader('Content-Type', 'application/json');
		ajax.responseType = 'json';
		ajax.send(JSON.stringify(params));

		ajax.onload = () => {
			
			console.log(ajax.response);

		}

	}

	function evt_handleSelectType(evt) {
		
		console.log("update the type");

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
		userData.data.next = '';
		userData.data.unit = '';

		userData.next_process.value = '';
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
			userData.product.classList.add('placeholder');

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
			userData.product.classList.add('placeholder');

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
			userData.product.classList.add('placeholder');

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
			userData.product.classList.add('placeholder');

			break;
		}

		this.API.triggerSave();

	}

	function evt_handleSelectVariety(evt) {

		console.log("update vareity");

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

		userData.data.unit = '';
		userData.unit.value = '';



		userData.product.innerHTML = `<option value=''></option>`;
		for(let key in this.MEM.products['製品'][elem.value]) {
			let option = document.createElement('option');
			let val = this.MEM.products['製品'][elem.value][key].name;
			option.setAttribute('value', val);
			option.textContent = val;
			userData.product.appendChild(option);
		}

		userData.product.removeAttribute('disabled');
		userData.product.classList.add('placeholder');

		if(elem.selectedIndex === 0) {
			userData.product.setAttribute('disabled', 'disabled');
		}
		
		this.API.triggerSave();

	}

	function evt_handleSelectName(evt) {

		console.log("update name");

        let elem = evt.target;
        let userData = elem.userData;
        userData.data.product = elem.value;


        // Then we need to Trackdown units

        console.log(userData);
        console.log("--- Data --- ");
        console.log(userData.data);
        console.log(this.MEM.products);

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
			userData.next_process.value = '';
        	this.API.triggerSave();
            return;
        }

        userData.data.unit = obj.unit;
        userData.unit.value = obj.unit;
        userData.data.next = obj.next || '';
		userData.next_process.value = userData.data.next;
        this.API.triggerSave();

	}

	function evt_handleSelectFocus(evt) {
		
		let elem = evt.target;
		elem.classList.remove('placeholder');

	}

	function evt_handleSelectBlur(evt) {

		let elem = evt.target;
		if(elem.selectedIndex === 0) {
			elem.classList.add('placeholder');
		} else {
			elem.classList.remove('placeholder');
		}

	}

	function evt_handlePlaceholder(evt) {

		let elem = evt.target;
		if(elem.selectedIndex === 0) {
			elem.classList.add('placeholder');
		} else {
			elem.classList.remove('placeholder');
		}

	}

	function api_renderStock() {

		console.log("rendering the stock!!");
	
		this.DOM.tbody.innerHTML = '';
		let array = this.MEM.report.managers_stock;
		let length = array.length;
		if(length < 15) {
			length = 15;
		}

		if(length <= 15) {
			this.DOM.rows.remove.classList.add('disabled');
		} else {
			this.DOM.rows.remove.classList.remove('disabled');
		}

		this.MEM.userData = [];

		for(let i = 0; i < length; i++) {

			// Check for init function
			
			let data = array[i];

			switch(this.MEM.role) {
			case "manager":

				if(!data.hasOwnProperty("manager_weight")) {
					data.manager_weight = data.weight;
				}

				if(!data.hasOwnProperty("manager_count")) {
					data.manager_count = data.count;
				}

				break;
			case "director":

				if(!data.hasOwnProperty("director_weight")) {
					data.director_weight = data.weight;
				}

				if(!data.hasOwnProperty("director_count")) {
					data.director_count = data.count;
				}

				break;
			case "fixed":

				if(!data.hasOwnProperty("fixed_weight")) {

					switch(this.MEM.from) {
					case "manager":
						data.fixed_weight = data.manager_weight;
						break;
					case "director":
						data.fixed_weight = data.director_weight;
						break;
					}

				}

				if(!data.hasOwnProperty("fixed_count")) {

					switch(this.MEM.from) {
					case "manager":
						data.fixed_count = data.manager_count;
						break;
					case "director":
						data.fixed_count = data.director_count;
						break;
					}
				}

				break;
			}
			
			this.API.appendStock(array[i]);
		}

		this.MEM.array = array;

	}

	function api_renderInventory() {
	
		this.DOM.tbody.innerHTML = '';
		let array = this.MEM.report.managers_report;
		let length = array.length;
		if(length < 15) {
			length = 15;
		}

		if(length <= 15) {
			this.DOM.rows.remove.classList.add('disabled');
		} else {
			this.DOM.rows.remove.classList.remove('disabled');
		}

		this.MEM.userData = [];

		for(let i = 0; i < length; i++) {

			// Check for init function
			
			let data = array[i];

			switch(this.MEM.role) {
			case "manager":

				if(!data.hasOwnProperty("manager_weight")) {
					data.manager_weight = data.weight;
				}

				if(!data.hasOwnProperty("manager_count")) {
					data.manager_count = data.count;
				}

				break;
			case "director":

				if(!data.hasOwnProperty("director_weight")) {
					data.director_weight = data.weight;
				}

				if(!data.hasOwnProperty("director_count")) {
					data.director_count = data.count;
				}

				break;
			case "fixed":

				if(!data.hasOwnProperty("fixed_weight")) {

					switch(this.MEM.from) {
					case "manager":
						data.fixed_weight = data.manager_weight;
						break;
					case "director":
						data.fixed_weight = data.director_weight;
						break;
					}

				}

				if(!data.hasOwnProperty("fixed_count")) {

					switch(this.MEM.from) {
					case "manager":
						data.fixed_count = data.manager_count;
						break;
					case "director":
						data.fixed_count = data.director_count;
						break;
					}
				}


				break;
			}
			
			this.API.appendRow(array[i]);
		}

		this.MEM.array = array;
		this.API.updateWeight();

	}

	function api_renderStatus() {
		
		let y = this.MEM.status.report_year;
		let m = this.MEM.status.report_month;
		if(m.length < 2) {
			m = '0' + m;
		}

		this.DOM.status.date.textContent = `${y}年${m}月`;

		let assign_to = this.MEM.staff[this.MEM.status.assign_to_uuid].staff_name;
		this.DOM.status.position.textContent = assign_to;
		this.DOM.status.execute.textContent = this.MEM.status.date_of_implementation;
		this.DOM.status.location.textContent = this.MEM.status.location_name;

	}

	function api_renderLocation() {
		
		this.DOM.map.image.setAttribute('src', this.MEM.location.location_map);

	}

	function evt_handleMapZoomClick() {
		
		console.log("zoom click!!!");
		this.DOM.map.div.classList.toggle('zoom');

	}

	function evt_handleWindowResize() {

		this.API.updateTableSize();

	}

	function api_updateTableSize() {

		let p = this.DOM.tbody.parentNode;
		let t = this.DOM.tbody;

		let divHeight = p.offsetHeight;
		let tabHeight = t.offsetHeight;

		if(tabHeight > divHeight) {
			this.DOM.tbody.classList.remove('fill');
		} else {
			this.DOM.tbody.classList.add('fill');
		}

	}

	function api_appendRow(data) {

		const userData = {
			data : data
		}

		this.MEM.userData.push(userData);
		const row = this.DOM.tbody.insertRow();

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

		let str = this.DOM.tbody.rows.length.toString();
		while(str.length < 3) {
			str = '0' + str;
		}
		ca.textContent = str;

		// 場所
		
		const select1 = document.createElement('select');
		select1.innerHTML = `<option></option>`;
		select1.setAttribute('class', 'placeholder');
		cb.appendChild(select1);

		userData.pos = select1;
		select1.userData = userData;

		select1.addEventListener('change', this.EVT.handlePlaceholder);
		select1.addEventListener('focus', this.EVT.handleSelectFocus);
		select1.addEventListener('blur', this.EVT.handleSelectBlur);
		select1.addEventListener('change', this.EVT.handleInputChange);

		this.MEM.places.forEach( no => {
			let option = document.createElement('option');

			let str = no.toString();
			if(str.length < 2) {
				str = '0' + str;
			}
			str = 'No.' + str;
			option.setAttribute('value', str);
			option.textContent = str;
			select1.appendChild(option);
		});

		if(data && data.pos.length) {
			select1.value = data.pos;
			select1.classList.remove('placeholder');
		}

		if(this.MEM.locked) {
			select1.setAttribute('disabled', 'disabled');
		}

		// 棚卸資産の種類

		const select2 = document.createElement('select');
		select2.innerHTML = `<option value=''></option>`;
		select2.setAttribute('class', 'placeholder');
		cc.appendChild(select2);

		userData.type = select2;
		select2.userData = userData;

		select2.addEventListener('change', this.EVT.handlePlaceholder);
		select2.addEventListener('focus', this.EVT.handleSelectFocus);
		select2.addEventListener('blur', this.EVT.handleSelectBlur);
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

		if(data && data.type.length) {
			select2.value = data.type;
			select2.classList.remove('placeholder');
		}

		if(this.MEM.locked) {
			select2.setAttribute('disabled', 'disabled');
		}

		// 品種

		const select3 = document.createElement('select');
		select3.innerHTML = `<option></option>`;
		select3.setAttribute('class', 'placeholder');
		cd.appendChild(select3);

		userData.variety = select3;
		select3.userData = userData;

		select3.addEventListener('change', this.EVT.handlePlaceholder);
		select3.addEventListener('focus', this.EVT.handleSelectFocus);
		select3.addEventListener('blur', this.EVT.handleSelectBlur);
		select3.addEventListener('change', this.EVT.handleSelectVariety);
		
		if(data && data.type.length) {
			switch(data.type) {
			case "製品":

				for(let key in this.MEM.products['製品']) {
					let option = document.createElement('option');
					option.setAttribute('value', key);
					option.textContent = key;
					select3.appendChild(option);
				}

				break;
			default:
				select3.setAttribute('disabled', 'disabled');
				break;
			}
		}
		
		if(data && data.variety.length) {
			select3.value = data.variety;
			select3.classList.remove('placeholder');
		}

		if(this.MEM.locked) {
			select3.setAttribute('disabled', 'disabled');
		}

		// 品名

		const select5 = document.createElement('select');
		select5.innerHTML = `<option></option>`;
		select5.setAttribute('class', 'placeholder');
		ce.appendChild(select5);

		userData.product = select5;
		select5.userData = userData;

		select5.addEventListener('change', this.EVT.handlePlaceholder);
		select5.addEventListener('focus', this.EVT.handleSelectFocus);
		select5.addEventListener('blur', this.EVT.handleSelectBlur);
		select5.addEventListener('change', this.EVT.handleSelectName);

		console.log(data);

		if(data && data.type.length) {

			switch(data.type) {
			case "製品":
				
				if(this.MEM.products['製品'][data.variety]) {

					for(let key in this.MEM.products['製品'][data.variety]) {
						let option = document.createElement('option');
						let val = this.MEM.products['製品'][data.variety][key].name;
						option.setAttribute('value', val);
						option.textContent = val;
						select5.appendChild(option);
					}

				}

				break;
			case "原材料":

				if(this.MEM.products['原材料']) {

					for(let key in this.MEM.products['原材料']) {
						let option = document.createElement('option');
						let val = this.MEM.products['原材料'][key].name;
						option.setAttribute('value', val);
						option.textContent = val;
						select5.appendChild(option);
					}

				}

				break;
			case "仕掛品":

				if(this.MEM.products['仕掛品']) {

					for(let key in this.MEM.products['仕掛品']) {
						let option = document.createElement('option');
						let val = this.MEM.products['仕掛品'][key].name;
						option.setAttribute('value', val);
						option.textContent = val;
						select5.appendChild(option);
					}

				}

				break;
			case "ダスト":
				
				if(this.MEM.products['ダスト']) {

					for(let key in this.MEM.products['ダスト']) {
						let option = document.createElement('option');
						let val = this.MEM.products['ダスト'][key].name;
						option.setAttribute('value', val);
						option.textContent = val;
						select5.appendChild(option);
					}

				}

				break;
			}

		}
		
		if(data && data.product.length) {
			select5.value = data.product;
			select5.classList.remove('placeholder');
		}

		if(this.MEM.locked) {
			select5.setAttribute('disabled', 'disabled');
		}

		// 次工程

		const inp4 = document.createElement('input');
		inp4.setAttribute('type', 'text');
		inp4.setAttribute('readonly', 'readonly');
		cf.appendChild(inp4);

		userData.next_process = inp4;
		inp4.userData = userData;
		inp4.addEventListener('input', this.EVT.handleInputChange);
		
		inp4.value = data.next || "";
		if(this.MEM.locked) {
			inp4.setAttribute('disabled', 'disabled');
		}
		inp4.setAttribute('disabled', 'disabled');

		// 正味重量
	
		const div1 = document.createElement('div');
		div1.setAttribute('class', 'flex');
		
		const inp6a = document.createElement('input');
		const inp6b = document.createElement('input');
		const inp6c = document.createElement('input');
		const inp6d = document.createElement('input');
		
		if(data) {
			inp6a.value = this.API.formatNumber(data.weight);
			inp6b.value = this.API.formatNumber(data.manager_weight || "");
			inp6c.value = this.API.formatNumber(data.director_weight || "");
			inp6d.value = this.API.formatNumber(data.fixed_weight || "");
		}
		
		/*
		inp6a.setAttribute('pattern', '[0-9.]+');
		inp6b.setAttribute('pattern', '[0-9.]+');
		inp6c.setAttribute('pattern', '[0-9.]+');
		inp6d.setAttribute('pattern', '[0-9.]+');
		*/

		inp6a.setAttribute('type', 'text');
		inp6b.setAttribute('type', 'text');
		inp6c.setAttribute('type', 'text');
		inp6d.setAttribute('type', 'text');

		inp6a.setAttribute('disabled', 'disabled');
		
		userData.manager_weight = inp6b;
		userData.director_weight = inp6c;
		userData.fixed_weight = inp6d;
			
		inp6b.userData = userData;
		inp6c.userData = userData;
		inp6d.userData = userData;

		switch(this.MEM.role) {
		case "manager":
			inp6b.addEventListener('input', this.EVT.handleInputChange);
			inp6b.addEventListener('focus', this.EVT.handleInputFocus);
			inp6b.addEventListener('blur', this.EVT.handleInputBlur);
			
			//inp6b.addEventListener('input', this.EVT.handleInputUpdate);

			inp6c.setAttribute('disabled', 'disabled');
			inp6d.setAttribute('disabled', 'disabled');
			break;
		case "director":
			inp6c.addEventListener('input', this.EVT.handleInputChange);
			inp6c.addEventListener('focus', this.EVT.handleInputFocus);
			inp6c.addEventListener('blur', this.EVT.handleInputBlur);
			
			//inp6c.addEventListener('input', this.EVT.handleInputUpdate);

			inp6b.setAttribute('disabled', 'disabled');
			inp6d.setAttribute('disabled', 'disabled');
			break;
		case "fixed":
			inp6d.addEventListener('input', this.EVT.handleInputChange);
			inp6d.addEventListener('focus', this.EVT.handleInputFocus);
			inp6d.addEventListener('blur', this.EVT.handleInputBlur);
			
			// inp6d.addEventListener('input', this.EVT.handleInputUpdate);

			inp6b.setAttribute('disabled', 'disabled');
			inp6c.setAttribute('disabled', 'disabled');
			break;
		}

		div1.appendChild(inp6a);
		div1.appendChild(inp6b);
		div1.appendChild(inp6c);
		div1.appendChild(inp6d);
		cg.appendChild(div1);

		if(this.MEM.locked) {
			inp6a.setAttribute('disabled', 'disabled');
			inp6b.setAttribute('disabled', 'disabled');
			inp6c.setAttribute('disabled', 'disabled');
			inp6d.setAttribute('disabled', 'disabled');
		}

		// 単位

		const select7 = document.createElement('select');
		select7.innerHTML = `<option></option>`;
		select7.setAttribute('class', 'placeholder');
		ch.appendChild(select7);
		select7.addEventListener('change', this.EVT.handlePlaceholder);
		const opts = [ 'kg', '枚', '本', '式', '個' , '缶', '台'];

		opts.forEach( opt => {
			let option = document.createElement('option');
			option.setAttribute('value', opt);
			option.textContent = opt;
			select7.appendChild(option);
		});

		userData.unit = select7;
		select7.userData = userData;

		select7.addEventListener('change', this.EVT.handlePlaceholder);
		select7.addEventListener('focus', this.EVT.handleSelectFocus);
		select7.addEventListener('blur', this.EVT.handleSelectBlur);
		select7.addEventListener('change', this.EVT.handleInputChange);

		if(data && data.unit.length) {
			select7.value = data.unit;
			select7.classList.remove('placeholder');
		}

		if(this.MEM.locked) {
			select7.setAttribute('disabled', 'disabled');
		}
		select7.classList.add('units');
		select7.setAttribute('disabled', 'disabled');

		// フレコン数量
	
		const div2 = document.createElement('div');
		div2.setAttribute('class', 'flex');
		
		const inp8a = document.createElement('input');
		const inp8b = document.createElement('input');
		const inp8c = document.createElement('input');
		const inp8d = document.createElement('input');

		if(data) {
			inp8a.value = this.API.formatNumber(data.count);
			inp8b.value = this.API.formatNumber(data.manager_count || "");
			inp8c.value = this.API.formatNumber(data.director_count || "");
			inp8d.value = this.API.formatNumber(data.fixed_count || "");
		}
		
		/*
		inp8a.setAttribute('pattern', '[0-9.]+');
		inp8b.setAttribute('pattern', '[0-9.]+');
		inp8c.setAttribute('pattern', '[0-9.]+');
		inp8d.setAttribute('pattern', '[0-9.]+');
		*/

		inp8a.setAttribute('type', 'text');
		inp8b.setAttribute('type', 'text');
		inp8c.setAttribute('type', 'text');
		inp8d.setAttribute('type', 'text');
		inp8a.setAttribute('disabled', 'disabled');

		userData.manager_count = inp8b;
		userData.director_count = inp8c;
		userData.fixed_count = inp8d;
		
		inp8b.userData = userData;
		inp8c.userData = userData;
		inp8d.userData = userData;

		switch(this.MEM.role) {
		case "manager":
			inp8b.addEventListener('input', this.EVT.handleInputChange);
			inp8b.addEventListener('focus', this.EVT.handleInputFocus);
			inp8b.addEventListener('blur', this.EVT.handleInputBlur);

			inp8c.setAttribute('disabled', 'disabled');
			inp8d.setAttribute('disabled', 'disabled');
			break;
		case "director":
			inp8c.addEventListener('input', this.EVT.handleInputChange);
			inp8c.addEventListener('focus', this.EVT.handleInputFocus);
			inp8c.addEventListener('blur', this.EVT.handleInputBlur);

			inp8b.setAttribute('disabled', 'disabled');
			inp8d.setAttribute('disabled', 'disabled');
			break;
		case "fixed":
			inp8d.addEventListener('input', this.EVT.handleInputChange);
			inp8d.addEventListener('focus', this.EVT.handleInputFocus);
			inp8d.addEventListener('blur', this.EVT.handleInputBlur);

			inp8b.setAttribute('disabled', 'disabled');
			inp8c.setAttribute('disabled', 'disabled');
			break;
		}

		div2.appendChild(inp8a);
		div2.appendChild(inp8b);
		div2.appendChild(inp8c);
		div2.appendChild(inp8d);
		ci.appendChild(div2);

		if(this.MEM.locked) {
			inp8a.setAttribute('disabled', 'disabled');
			inp8b.setAttribute('disabled', 'disabled');
			inp8c.setAttribute('disabled', 'disabled');
			inp8d.setAttribute('disabled', 'disabled');
		}

		// 換数量

		const inp9 = document.createElement('input');
		inp9.setAttribute('pattern', '[0-9.]+');
		inp9.setAttribute('type', 'text');
		cj.appendChild(inp9);

		userData.calc_weight = inp9;
		inp9.userData = userData;
		inp9.addEventListener('input', this.EVT.handleInputChange);

		if(data) {
			inp9.value = data.calc_weight || '';
		}

		if(this.MEM.locked) {
			inp9.setAttribute('disabled', 'disabled');
		}

		//  備考

		const inp10 = document.createElement('input');
		inp10.setAttribute('type', 'text');
		ck.appendChild(inp10);

		if(data) {
			inp10.value = data.notes;
		}

		userData.notes = inp10;
		inp10.userData = userData;
		inp10.addEventListener('input', this.EVT.handleInputChange);

		if(this.MEM.locked) {
			inp10.setAttribute('disabled', 'disabled');
		}

	}

	function api_appendStock(data) {

		const userData = {
			data : data
		}

		this.MEM.userData.push(userData);
		const row = this.DOM.tbody.insertRow();

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

		let str = this.DOM.tbody.rows.length.toString();
		while(str.length < 3) {
			str = '0' + str;
		}
		ca.textContent = str;

		// 場所
		
		const select1 = document.createElement('select');
		select1.innerHTML = `<option></option>`;
		select1.setAttribute('class', 'placeholder');
		cb.appendChild(select1);

		userData.pos = select1;
		select1.userData = userData;

		select1.addEventListener('change', this.EVT.handlePlaceholder);
		select1.addEventListener('focus', this.EVT.handleSelectFocus);
		select1.addEventListener('blur', this.EVT.handleSelectBlur);
		select1.addEventListener('change', this.EVT.handleInputChange);

		this.MEM.places.forEach( no => {
			let option = document.createElement('option');

			let str = no.toString();
			if(str.length < 2) {
				str = '0' + str;
			}
			str = 'No.' + str;
			option.setAttribute('value', str);
			option.textContent = str;
			select1.appendChild(option);
		});

		if(data && data.pos.length) {
			select1.value = data.pos;
			select1.classList.remove('placeholder');
		}

		if(this.MEM.locked) {
			select1.setAttribute('disabled', 'disabled');
		}

		// 棚卸資産の種類

		const select2 = document.createElement('select');
		select2.innerHTML = `<option value=''></option>`;
		select2.setAttribute('class', 'placeholder');
		cc.appendChild(select2);

		userData.type = select2;
		select2.userData = userData;

		select2.addEventListener('change', this.EVT.handlePlaceholder);
		select2.addEventListener('change', this.EVT.handleSelectType);
		select2.addEventListener('focus', this.EVT.handleSelectFocus);
		select2.addEventListener('blur', this.EVT.handleSelectBlur);
		select2.addEventListener('change', this.EVT.handleInputChange);
		
		if(1){
			let option = document.createElement('option');
			option.setAttribute('value', '貯蔵品');
			option.textContent = '貯蔵品';
			select2.appendChild(option);
		}

		if(data && data.type.length) {
			select2.value = data.type;
			select2.classList.remove('placeholder');
		}

		if(this.MEM.locked) {
			select2.setAttribute('disabled', 'disabled');
		}

		// 品種

		const select3 = document.createElement('select');
		select3.innerHTML = `<option></option>`;
		select3.setAttribute('class', 'placeholder');
		cd.appendChild(select3);

		userData.variety = select3;
		select3.userData = userData;

		select3.addEventListener('change', this.EVT.handlePlaceholder);
		select3.addEventListener('focus', this.EVT.handleSelectFocus);
		select3.addEventListener('blur', this.EVT.handleSelectBlur);
		select3.setAttribute('disabled', 'disabled');

		if(this.MEM.locked) {
			select3.setAttribute('disabled', 'disabled');
		}

		// 品名

		const select5 = document.createElement('select');
		select5.innerHTML = `<option></option>`;
		select5.setAttribute('class', 'placeholder');
		ce.appendChild(select5);

		userData.product = select5;
		select5.userData = userData;

		select5.addEventListener('change', this.EVT.handlePlaceholder);
		select5.addEventListener('focus', this.EVT.handleSelectFocus);
		select5.addEventListener('blur', this.EVT.handleSelectBlur);
		select5.addEventListener('change', this.EVT.handleInputChange);

		if(data.type === '貯蔵品' && this.MEM.products['貯蔵品']) {
			for(let key in this.MEM.products['貯蔵品']) {
				let option = document.createElement('option');
				let val = this.MEM.products['貯蔵品'][key].name;
				option.setAttribute('value', val);
				option.textContent = val;
				select5.appendChild(option);
			}
		}
		
		if(data && data.product.length) {
			select5.value = data.product;
			select5.classList.remove('placeholder');
		}

		if(this.MEM.locked) {
			select5.setAttribute('disabled', 'disabled');
		}

		select5.addEventListener('change', this.EVT.handleSelectName);

		// 次工程

		const inp4 = document.createElement('input');
		inp4.setAttribute('type', 'text');
		inp4.setAttribute('disabled', 'disabled');
		cf.appendChild(inp4);

		userData.next_process = inp4;
		inp4.userData = userData;
		inp4.addEventListener('input', this.EVT.handleInputChange);

		if(this.MEM.locked) {
			inp4.setAttribute('disabled', 'disabled');
		}

		// 正味重量
	
		const div1 = document.createElement('div');
		div1.setAttribute('class', 'flex');
		
		const inp6a = document.createElement('input');
		const inp6b = document.createElement('input');
		const inp6c = document.createElement('input');
		const inp6d = document.createElement('input');
		
		if(data) {
			inp6a.value = this.API.formatNumber(data.weight);
			inp6b.value = this.API.formatNumber(data.manager_weight || "");
			inp6c.value = this.API.formatNumber(data.director_weight || "");
			inp6d.value = this.API.formatNumber(data.fixed_weight || "");
		}
		
		/*
		inp6a.setAttribute('pattern', '[0-9.]+');
		inp6b.setAttribute('pattern', '[0-9.]+');
		inp6c.setAttribute('pattern', '[0-9.]+');
		inp6d.setAttribute('pattern', '[0-9.]+');
		*/

		inp6a.setAttribute('type', 'text');
		inp6b.setAttribute('type', 'text');
		inp6c.setAttribute('type', 'text');
		inp6d.setAttribute('type', 'text');

		inp6a.setAttribute('disabled', 'disabled');
		
		userData.manager_weight = inp6b;
		userData.director_weight = inp6c;
		userData.fixed_weight = inp6d;
			
		inp6b.userData = userData;
		inp6c.userData = userData;
		inp6d.userData = userData;

		switch(this.MEM.role) {
		case "manager":
			inp6b.addEventListener('input', this.EVT.handleInputChange);
			inp6b.addEventListener('focus', this.EVT.handleInputFocus);
			inp6b.addEventListener('blur', this.EVT.handleInputBlur);

			inp6c.setAttribute('disabled', 'disabled');
			inp6d.setAttribute('disabled', 'disabled');
			break;
		case "director":
			inp6c.addEventListener('input', this.EVT.handleInputChange);
			inp6c.addEventListener('focus', this.EVT.handleInputFocus);
			inp6c.addEventListener('blur', this.EVT.handleInputBlur);

			inp6b.setAttribute('disabled', 'disabled');
			inp6d.setAttribute('disabled', 'disabled');
			break;
		case "fixed":
			inp6d.addEventListener('input', this.EVT.handleInputChange);
			inp6d.addEventListener('focus', this.EVT.handleInputFocus);
			inp6d.addEventListener('blur', this.EVT.handleInputBlur);

			inp6b.setAttribute('disabled', 'disabled');
			inp6c.setAttribute('disabled', 'disabled');
			break;
		}

		div1.appendChild(inp6a);
		div1.appendChild(inp6b);
		div1.appendChild(inp6c);
		div1.appendChild(inp6d);
		cg.appendChild(div1);

		if(this.MEM.locked) {
			inp6a.setAttribute('disabled', 'disabled');
			inp6b.setAttribute('disabled', 'disabled');
			inp6c.setAttribute('disabled', 'disabled');
			inp6d.setAttribute('disabled', 'disabled');
		}

		// 単位

		const select7 = document.createElement('select');
		select7.innerHTML = `<option></option>`;
		select7.setAttribute('class', 'placeholder');
		ch.appendChild(select7);
		select7.addEventListener('change', this.EVT.handlePlaceholder);
		const opts = [ 'kg', '枚', '本', '個', '式', '缶', '台'];

		opts.forEach( opt => {
			let option = document.createElement('option');
			option.setAttribute('value', opt);
			option.textContent = opt;
			select7.appendChild(option);
		});

		userData.unit = select7;
		select7.userData = userData;

		select7.addEventListener('change', this.EVT.handlePlaceholder);
		select7.addEventListener('focus', this.EVT.handleSelectFocus);
		select7.addEventListener('blur', this.EVT.handleSelectBlur);
		select7.addEventListener('change', this.EVT.handleInputChange);

		if(data && data.unit.length) {
			select7.value = data.unit;
			select7.classList.remove('placeholder');
		}
		
		if(this.MEM.locked) {
			select7.setAttribute('disabled', 'disabled');
		}

		select7.classList.add('units');
		select7.setAttribute('disabled', 'disabled');

		// フレコン数量
	
		const div2 = document.createElement('div');
		div2.setAttribute('class', 'flex');
		
		const inp8a = document.createElement('input');
		const inp8b = document.createElement('input');
		const inp8c = document.createElement('input');
		const inp8d = document.createElement('input');

		if(data) {
			inp8a.value = this.API.formatNumber(data.count);
			inp8b.value = this.API.formatNumber(data.manager_count || "");
			inp8c.value = this.API.formatNumber(data.director_count || "");
			inp8d.value = this.API.formatNumber(data.fixed_count || "");
		}
		
		/*
		inp8a.setAttribute('pattern', '[0-9.]+');
		inp8b.setAttribute('pattern', '[0-9.]+');
		inp8c.setAttribute('pattern', '[0-9.]+');
		inp8d.setAttribute('pattern', '[0-9.]+');
		*/

		inp8a.setAttribute('type', 'text');
		inp8b.setAttribute('type', 'text');
		inp8c.setAttribute('type', 'text');
		inp8d.setAttribute('type', 'text');
		inp8a.setAttribute('disabled', 'disabled');

		userData.manager_count = inp8b;
		userData.director_count = inp8c;
		userData.fixed_count = inp8d;
		
		inp8b.userData = userData;
		inp8c.userData = userData;
		inp8d.userData = userData;

		switch(this.MEM.role) {
		case "manager":
			inp8b.addEventListener('input', this.EVT.handleInputChange);
			inp8b.addEventListener('focus', this.EVT.handleInputFocus);
			inp8b.addEventListener('blur', this.EVT.handleInputBlur);

			inp8c.setAttribute('disabled', 'disabled');
			inp8d.setAttribute('disabled', 'disabled');
			break;
		case "director":
			inp8c.addEventListener('input', this.EVT.handleInputChange);
			inp8c.addEventListener('focus', this.EVT.handleInputFocus);
			inp8c.addEventListener('blur', this.EVT.handleInputBlur);

			inp8b.setAttribute('disabled', 'disabled');
			inp8d.setAttribute('disabled', 'disabled');
			break;
		case "fixed":
			inp8d.addEventListener('input', this.EVT.handleInputChange);
			inp8d.addEventListener('focus', this.EVT.handleInputFocus);
			inp8d.addEventListener('blur', this.EVT.handleInputBlur);

			inp8b.setAttribute('disabled', 'disabled');
			inp8c.setAttribute('disabled', 'disabled');
			break;
		}

		div2.appendChild(inp8a);
		div2.appendChild(inp8b);
		div2.appendChild(inp8c);
		div2.appendChild(inp8d);
		ci.appendChild(div2);

		if(this.MEM.locked) {
			inp8a.setAttribute('disabled', 'disabled');
			inp8b.setAttribute('disabled', 'disabled');
			inp8c.setAttribute('disabled', 'disabled');
			inp8d.setAttribute('disabled', 'disabled');
		}

		// 換数量

		const inp9 = document.createElement('input');
		inp9.setAttribute('pattern', '[0-9.]+');
		inp9.setAttribute('type', 'text');
		cj.appendChild(inp9);

		userData.calc_weight = inp9;
		inp9.userData = userData;
		inp9.addEventListener('input', this.EVT.handleInputChange);

		if(data) {
			inp9.value = data.calc_weight || "";
		}

		if(this.MEM.locked) {
			inp9.setAttribute('disabled', 'disabled');
		}

		//  備考

		const inp10 = document.createElement('input');
		inp10.setAttribute('type', 'text');
		ck.appendChild(inp10);

		if(data) {
			inp10.value = data.notes;
		}

		userData.notes = inp10;
		inp10.userData = userData;
		inp10.addEventListener('input', this.EVT.handleInputChange);

		if(this.MEM.locked) {
			inp10.setAttribute('disabled', 'disabled');
		}

	}

	function api_openReport(report, location, status, user_uuid) {
		
		this.MEM.locked = false;

		this.DOM.rows.add.classList.remove('disabled');
		this.DOM.rows.remove.classList.remove('disabled');
		this.DOM.rows.save.classList.remove('disabled');

		this.DOM.tbody.classList.remove('locked');

		this.MEM.user_uuid = user_uuid;
		this.MEM.report = report;
		this.MEM.location = location;
		this.MEM.status = status;
		this.MEM.products = JSON.parse(location.location_products);
		this.MEM.places = JSON.parse(location.location_places);

		this.MEM.staff = {};
		this.MEM.status.staff.forEach( staff => {
			if(!staff) {
				return;
			}
			this.MEM.staff[staff.staff_uuid] = staff;
		});

		if(this.MEM.status.manager_uuid === user_uuid) {
			this.MEM.role = "manager";
		} else if(this.MEM.status.director_uuid === user_uuid) {
			this.MEM.role = "director";
		}
		
		if(this.MEM.status.fix_attn_uuid === user_uuid) {
			let needs_fix = parseInt(this.MEM.status.require_fix);
			if(needs_fix) {
				this.MEM.from = this.MEM.role;
				this.MEM.role = "fixed";
			}
		}

		this.MEM.view = 'inventory';
		this.DOM.tabs.inventory.classList.add('active');
		this.DOM.tabs.stock.classList.remove('active');

		this.API.renderLocation();
		this.API.renderStatus();
		this.API.renderInventory();
		this.API.renderFixNote(status);

	}

	function api_renderFixNote(status) {

		if(!status.require_fix) {
			this.DOM.status.notes.classList.add('hide');
			return;
		}
		
		this.DOM.status.notes.classList.remove('hide');

		const params = {
			status_uuid : status.status_uuid
		}

		const ajax = new XMLHttpRequest();
		ajax.open('POST', '/supervisor/api/v1/fixMessage');
		ajax.setRequestHeader('Content-Type', 'application/json');
		ajax.responseType = 'json';
		ajax.send(JSON.stringify(params));

		ajax.onload = () => {
			
			this.DOM.status.textarea.value = ajax.response.msg.message;

		}

	}


}).apply({});
