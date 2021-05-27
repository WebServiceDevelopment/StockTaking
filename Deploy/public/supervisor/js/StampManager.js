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

const StampManager = (function() {

	this.MEM = {
		percent : 0,
		inc : false,
		mouseDown : false,
	}

	this.DOM = {
		auth1 : document.getElementById('auth1'),
		auth2 : document.getElementById('auth2'),
		auth3 : document.getElementById('auth3')
	}

	this.EVT = {
		handleMouseDown : evt_handleMouseDown.bind(this),
		handleMouseLeave : evt_handleMouseLeave.bind(this),
		handleMouseEnter :evt_handleMouseEnter.bind(this),
		handleMouseUp : evt_handleMouseUp.bind(this)
	}

	this.API = {
		setUserData : api_setUserData.bind(this),
		setReportData : api_setReportData.bind(this),
		startStamps : api_startStamps.bind(this),
		renderSign : api_renderSign.bind(this),
		disableTable : api_disableTable.bind(this),
		prepareCanvas : api_prepareCanvas.bind(this),
		sampleCircle : api_sampleCircle.bind(this),
		sampleText : api_sampleText.bind(this),
		animate : api_animate.bind(this),
		complete : api_complete.bind(this),
		render : api_render.bind(this),
		drawCircle : api_drawCircle.bind(this)
	}

	init.apply(this);
	return this;

	function init() {

	}

	function api_setUserData(data) {

		this.MEM.user = data;

		if(this.MEM.status) {
			this.API.startStamps();
		}

	}

	function api_setReportData(data) {
		
		this.MEM.status = data;

		if(this.MEM.user) {
			this.API.startStamps();
		}

	}

	function api_startStamps(status, me) {

		this.MEM.status = status;
		this.MEM.user_uuid = me;

		// Reset all of the canvases

		const auth1 = document.createElement("canvas");
		const auth2 = document.createElement("canvas");
		const auth3 = document.createElement("canvas");

		auth1.setAttribute("id", "auth1");
		auth2.setAttribute("id", "auth2");
		auth3.setAttribute("id", "auth3");

		auth1.setAttribute("width", "120");
		auth2.setAttribute("width", "120");
		auth3.setAttribute("width", "120");

		auth1.setAttribute("height", "120");
		auth2.setAttribute("height", "120");
		auth3.setAttribute("height", "120");

		this.DOM.auth1.parentNode.replaceChild(auth1, this.DOM.auth1);
		this.DOM.auth2.parentNode.replaceChild(auth2, this.DOM.auth2);
		this.DOM.auth3.parentNode.replaceChild(auth3, this.DOM.auth3);

		this.DOM.auth1 = auth1;
		this.DOM.auth2 = auth2;
		this.DOM.auth3 = auth3;

		// Create Lookup for the manager names

		let lookup = {};
		for(let i = 0; i < this.MEM.status.staff.length; i++) {
			let manager = this.MEM.status.staff[i];
			lookup[manager.staff_uuid] = manager.staff_name;
		}
		this.MEM.lookup = lookup;

		// First we check to see if these are signed

		if(this.MEM.status.manager_approval_time) {
			let name = lookup[this.MEM.status.manager_uuid];
			let date = this.MEM.status.manager_approval_time.substr(0,10);
			this.API.renderSign(this.DOM.auth1, name, date);
		}

		if(this.MEM.status.director_approval_time) {
			let name = lookup[this.MEM.status.director_uuid];
			let date = this.MEM.status.director_approval_time.substr(0,10);
			this.API.renderSign(this.DOM.auth2, name, date);
		}

		if(this.MEM.status.admin_approval_time) {
			let name = "admin";
			let date = this.MEM.status.admin_approval_time.substr(0,10);
			this.API.renderSign(this.DOM.auth3, name, date);
		}

		// Then we check to see if we need to disabled the table

		if(this.MEM.user_uuid === this.MEM.status.manager_uuid) {
			if(this.MEM.status.manager_approval_time) {
				this.API.disableTable();
			} else {
				this.MEM.role = "manager";
				this.API.prepareCanvas(this.DOM.auth1);
			}
		} else if(this.MEM.user_uuid === this.MEM.status.director_uuid) {
			if(this.MEM.status.director_approval_time) {
				this.API.disableTable();
			} else {
				this.MEM.role = "director";
				this.API.prepareCanvas(this.DOM.auth2);
			}
		}
		
	}

	function api_renderSign(canvas, name, date) {

		let ctx = canvas.getContext('2d');
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		ctx.strokeStyle = 'rgba(255, 0, 0, 1)';
		ctx.lineWidth = 10;

		let arc = (2 * Math.PI) + (-Math.PI / 2);
		ctx.beginPath();
		ctx.arc(canvas.width/2, canvas.height/2, 50, -Math.PI / 2, arc);
		ctx.stroke();

		ctx.fillStyle = '#ff0000';
		ctx.font = "14px Arial";
		ctx.textAlign = "center";
		ctx.textBaseline = "bottom";
		ctx.fillText(name, canvas.width/2, canvas.height/2);

		ctx.fillStyle = '#ff0000';
		ctx.font = "11px Arial";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText(date, canvas.width/2, canvas.height/2 + 20);


	}

	function api_complete() {

		const params = {
			role : this.MEM.role,
			status_uuid : this.MEM.status.status_uuid
		}
		
		const ajax = new XMLHttpRequest();
		ajax.open('POST', '/supervisor/api/v1/signReport');
		ajax.setRequestHeader('Content-Type', 'application/json');
		ajax.responseType = 'json';
		ajax.send(JSON.stringify(params));

		ajax.onload = () => {
			
			let name = this.MEM.lookup[this.MEM.user_uuid];
			let date = new Date();
			let year = date.getFullYear();
			let month = date.getMonth() + 1;
			month = month > 9 ? month.toString() : '0' + month;
			let day = date.getDay();
			let d = [ year, month, day ] .join('-');

			this.API.renderSign(this.MEM.canvas, name, d);

			this.API.disableTable();
			
			this.DOM.auth1.classList.remove("active");
			this.DOM.auth2.classList.remove("active");
			this.DOM.auth3.classList.remove("active");

			PanelManager.API.init();

		}

	}

	function api_disableTable() {
		
		/*
		const select = document.getElementsByTagName('select');
		const inputs = document.getElementsByTagName('input');

		for(let i = 0; i < select.length; i++) {
			select[i].setAttribute('disabled', 'disabled');
		}

		for(let i = 0; i < inputs.length; i++) {
			inputs[i].setAttribute('disabled', 'disabled');
			inputs[i].setAttribute('type', 'text');
		}
		*/

		TableManager.API.disableTable();

	}

	function api_prepareCanvas(canvas) {
	
		canvas.classList.add('active');
		this.MEM.canvas = canvas;
		this.MEM.ctx = canvas.getContext('2d');

		this.API.sampleCircle();
		this.API.sampleText();
		
		this.MEM.run = true;
		this.API.animate();

		canvas.addEventListener('mousedown', this.EVT.handleMouseDown);
		canvas.addEventListener('mouseleave', this.EVT.handleMouseLeave);
		canvas.addEventListener('mouseenter', this.EVT.handleMouseEnter);
		canvas.addEventListener('mouseup', this.EVT.handleMouseUp);
		
		canvas.addEventListener('touchstart', this.EVT.handleMouseDown);
		canvas.addEventListener('touchend', this.EVT.handleMouseUp);

	}

	function api_sampleCircle() {

		let ctx = this.MEM.ctx;
		let canvas = this.MEM.canvas;

		ctx.strokeStyle = 'rgba(255, 0, 0,0.3)';
		ctx.lineWidth = 10;

		ctx.beginPath();
		ctx.arc(canvas.width/2, canvas.height/2, 50, 0, 2 * Math.PI);
		ctx.stroke();

	}

	function api_sampleText() {

		let ctx = this.MEM.ctx;
		let canvas = this.MEM.canvas;

		ctx.fillStyle = '#7c7c7c';
		ctx.font = "15px Arial";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText("Click to Sign", canvas.width/2, canvas.height/2);

	}

	function api_animate() {

		if(!this.MEM.run) {
			return;
		}

		if(this.MEM.inc) {

			if(this.MEM.percent < 50) {
				this.MEM.percent += 4;
			} else if(this.MEM.percent < 80) {
				this.MEM.percent += 3.5;
			} else {
				this.MEM.percent += 3;
			}

		} else {
			this.MEM.percent -= 4;
		}

		if(this.MEM.percent < 0) {
			this.MEM.percent = 0;
		} if(this.MEM.percent > 100) {
			this.MEM.percent = 100;
		}

		this.API.render();
		window.setTimeout(this.API.animate, 15);

	}

	function evt_handleMouseDown() {
			
		this.MEM.inc = true;
		this.MEM.mouseDown = true;
		TableManager.API.implementSave();

	}

	function evt_handleMouseLeave() {

		this.MEM.inc = false;

	}

	function evt_handleMouseEnter() {

		if(!this.MEM.mouseDown) {
			return;
		}

		this.MEM.inc = true;

	}

	function evt_handleMouseUp() {
		
		this.MEM.inc = false;
		this.MEM.mouseDown = false;

		if(this.MEM.percent >= 100) {
			this.MEM.run = false;
			this.API.complete();
		}

	}

	function api_render() {

		let canvas = this.MEM.canvas;
		this.MEM.ctx.clearRect(0, 0, canvas.width, canvas.height);

		this.API.sampleCircle();
		this.API.sampleText();
		this.API.drawCircle();
		
	}

	function api_drawCircle() {

		let canvas = this.MEM.canvas;
		let ctx = this.MEM.ctx;
		let percent = this.MEM.percent;

		ctx.strokeStyle = 'rgba(255, 0, 0, 1)';
		ctx.lineWidth = 10;

		let arc = (percent / 100) * (2 * Math.PI) + (-Math.PI / 2);
		ctx.beginPath();
		ctx.arc(canvas.width/2, canvas.height/2, 50, -Math.PI / 2, arc);
		ctx.stroke();


	}

}).apply({});
