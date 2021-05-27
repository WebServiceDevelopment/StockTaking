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

const TabManager = (function() {

	this.MEM = {}

	this.DOM = {
		tabs : {
			staff : document.getElementById('TabManager.tabs.staff'),
			panel : document.getElementById('TabManager.tabs.panel'),
			table : document.getElementById('TabManager.tabs.table')
		},
		articles : {
			staff : document.getElementById('TabManager.article.staff'),
			panel : document.getElementById('TabManager.article.panel'),
			table : document.getElementById('TabManager.article.table')
		},
		session : {
			username : document.getElementById('TabManager.session.username'),
			logout : document.getElementById('TabManager.session.logout')
		}
	}

	this.EVT = {
		handleTabClick : evt_handleTabClick.bind(this),
		handleLogoutClick : evt_handleLogoutClick.bind(this)
	}

	this.API = {
		openPage : api_openPage.bind(this),
		getSessionData : api_getSessionData.bind(this)
	}

	init.apply(this);
	return this;

	function init() {

		for(let key in this.DOM.tabs) {
			this.DOM.tabs[key].addEventListener('click', this.EVT.handleTabClick);
		}

		this.DOM.session.logout.addEventListener('click', this.EVT.handleLogoutClick);

		this.API.openPage('panel');
		this.API.getSessionData();

	}

	function evt_handleLogoutClick() {

		const params = {}

		const ajax = new XMLHttpRequest();
		ajax.open('POST', '/supervisor/session/logout');
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
		if(elem.tagName === 'SPAN') {
			elem = elem.parentNode;
		}

		let id = elem.getAttribute('id');
		let leaf = id.split('.').pop();
		this.API.openPage(leaf);

	}

	function api_openPage(leaf) {

		if(leaf === 'table' && !TableManager.API.checkOpen()) {
			return;
		}

		for(let key in this.DOM.tabs) {
			this.DOM.tabs[key].classList.remove('active');
			this.DOM.articles[key].classList.remove('open');
		}

		this.DOM.tabs[leaf].classList.remove('disabled');
		this.DOM.tabs[leaf].classList.add('active');
		this.DOM.articles[leaf].classList.add('open');
		this.DOM.tabs[leaf].classList.remove('one-off');

	}

	function api_getSessionData() {

		const params = {}

		const ajax = new XMLHttpRequest();
		ajax.open('POST', '/supervisor/session/getData');
		ajax.setRequestHeader('Content-Type', 'application/json');
		ajax.responseType = 'json';
		ajax.send(JSON.stringify(params));

		ajax.onload = () => {
			
			let res = ajax.response;
			if(res.err) {
				throw res.msg;
			}

			let name = res.msg.staff_name;
			let position = res.msg.staff_position;

			this.DOM.session.username.textContent = `${name} (${position})`;

			PanelManager.API.setSession(res.msg);
			PanelManager.API.init();

		}

	}

}).apply({});
