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

const AuthManager = (function() {

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
		prepareCanvas : api_prepareCanvas.bind(this),
		sampleCircle : api_sampleCircle.bind(this),
		sampleText : api_sampleText.bind(this),
		animate : api_animate.bind(this),
		complete : api_complete.bind(this),
		render : api_render.bind(this),
		drawCircle : api_drawCircle.bind(this),
		clearCanvas : api_clearCanvas.bind(this),
		cancelCanvas : api_cancelCanvas.bind(this)
	}

	init.apply(this);
	return this;

	function init() {
		
		let canvas = this.DOM.auth3;
		canvas.classList.add('active');
		this.MEM.canvas = canvas;
		this.MEM.ctx = canvas.getContext('2d');
		canvas.addEventListener('mousedown', this.EVT.handleMouseDown);
		canvas.addEventListener('mouseleave', this.EVT.handleMouseLeave);
		canvas.addEventListener('mouseenter', this.EVT.handleMouseEnter);
		canvas.addEventListener('mouseup', this.EVT.handleMouseUp);

	}

	function api_cancelCanvas() {
		
		this.MEM.run = false;
		this.DOM.auth3.classList.remove('active');

	}

	function api_clearCanvas() {
		
		this.MEM.run = false;
		let ctx1 = this.DOM.auth1.getContext('2d');
		ctx1.clearRect(0,0,this.DOM.auth1.width, this.DOM.auth1.height);

		let ctx2 = this.DOM.auth2.getContext('2d');
		ctx2.clearRect(0,0,this.DOM.auth2.width, this.DOM.auth2.height);

		let ctx3 = this.DOM.auth3.getContext('2d');
		ctx3.clearRect(0,0,this.DOM.auth3.width, this.DOM.auth3.height);

	}

	function api_setUserData(data) {

		this.MEM.user = data;

		if(this.MEM.report) {
			this.API.startStamps();
		}

	}

	function api_setReportData(data) {
		
		this.MEM.report = data;

		if(this.MEM.user) {
			this.API.startStamps();
		}

	}

	function api_startStamps() {

		// Create Lookup for the manager names

		let lookup = {};
		for(let i = 0; i < this.MEM.report.managers.length; i++) {
			let manager = this.MEM.report.managers[i];
			lookup[manager.staff_uuid] = manager.staff_name;
		}

		// First we check to see if these are signed

		if(this.MEM.report.manager_approval_time) {
			let name = lookup[this.MEM.report.manager_uuid];
			let date = this.MEM.report.manager_approval_time.substr(0,10);
			this.API.renderSign(this.DOM.auth1, name, date);
		}

		if(this.MEM.report.director_approval_time) {
			let name = lookup[this.MEM.report.director_uuid];
			let date = this.MEM.report.director_approval_time.substr(0,10);
			this.API.renderSign(this.DOM.auth2, name, date);
		}

		if(this.MEM.report.admin_approval_time) {
			let name = "admin";
			let date = this.MEM.report.admin_approval_time.substr(0,10);
			this.API.renderSign(this.DOM.auth3, name, date);
		}


	}

	function api_renderSign(index, name, date) {

		let canvas;

		switch(index) {
		case 0:
			canvas = this.DOM.auth1;
			break;
		case 1:
			canvas = this.DOM.auth2;
			break;
		case 2:
			canvas = this.DOM.auth3;
			break;
		}

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

		console.log("complete!!");

		let params = {
			status_uuid : ReviewReports.MEM.activeStatus.status_uuid
		}

		const ajax = new XMLHttpRequest();
		ajax.open('POST', '/admin/api/v1/acceptAdminReport');
		ajax.setRequestHeader('Content-Type', 'application/json');
		ajax.responseType = 'json';
		ajax.send(JSON.stringify(params));

		ajax.onload = () => {
			
			let name = '財務';
			let date = new Date();
			let year = date.getFullYear();
			let month = date.getMonth() + 1;
			month = month > 9 ? month.toString() : '0' + month;
			let day = date.getDay();
			let d = [ year, month, day ] .join('-');
			this.API.renderSign(2, name, d);
			
			// Set timeout to reload page
			
			this.MEM.percent = 0;
			ReviewReports.API.selectHopper();
			DownloadReports.API.selectCompleteReports();
			StatusManager.API.selectStatus();

		}

	}


	function api_prepareCanvas() {

		this.API.sampleCircle();
		this.API.sampleText();
		
		this.MEM.run = true;
		this.API.animate();
		this.DOM.auth3.classList.add('active');

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
