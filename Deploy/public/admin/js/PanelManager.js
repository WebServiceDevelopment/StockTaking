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
		ul1 : document.getElementById('Panel.ul1'),
		ul2 : document.getElementById('Panel.ul2'),
		ul3 : document.getElementById('Panel.ul3'),
		nav : {
			products : document.getElementById('Panel.nav.products'),
			aggregate : document.getElementById('Panel.nav.aggregate'),
			location2 : document.getElementById('Panel.nav.location2'),
			staff : document.getElementById('Panel.nav.staff'),
			location : document.getElementById('Panel.nav.location'),
			status : document.getElementById('Panel.nav.status'),
			review : document.getElementById('Panel.nav.review'),
			report : document.getElementById('Panel.nav.report'),
			logins : document.getElementById('Panel.nav.logins')
		},
		article : {
			products : document.getElementById('Panel.article.products'),
			aggregate : document.getElementById('Panel.article.aggregate'),
			location2 : document.getElementById('Panel.article.location2'),
			staff : document.getElementById('Panel.article.staff'),
			location : document.getElementById('Panel.article.location'),
			status : document.getElementById('Panel.article.status'),
			review : document.getElementById('Panel.article.review'),
			report : document.getElementById('Panel.article.report'),
			logins : document.getElementById('Panel.article.logins')
		},
		username : document.getElementById('Panel.username'),
		logout : document.getElementById('Panel.logout')
	}

	this.EVT = {
		handleNavClick : evt_handleNavClick.bind(this),
		handleLogoutClick : evt_handleLogoutClick.bind(this)
	}

	this.API = {
		openPage : api_openPage.bind(this),
		getSessionData : api_getSessionData.bind(this)
	}

	init.apply(this);
	return this;

	function init() {

		this.DOM.ul1.addEventListener('click', this.EVT.handleNavClick);
		this.DOM.ul2.addEventListener('click', this.EVT.handleNavClick);
		this.DOM.ul3.addEventListener('click', this.EVT.handleNavClick);

		let leaf = localStorage.getItem('admin_leaf') || 'products';
		this.API.openPage(leaf);

		this.DOM.logout.addEventListener('click', this.EVT.handleLogoutClick);
		this.API.getSessionData();

	}

	function evt_handleLogoutClick() {

		const params = {}

		const ajax = new XMLHttpRequest();
		ajax.open('POST', '/admin/session/logout');
		ajax.setRequestHeader('Content-Type', 'application/json');
		ajax.responseType = 'json';
		ajax.send(JSON.stringify(params));

		ajax.onload = () => {

			let res = ajax.response;
			if(res.err) {
				throw res.msg;
			}
			
			if(location.port === '3000') {
				window.location.href = 'index.html';
			} else {
				window.location.href = '/';
			}

		}

	}

	function api_getSessionData() {
		
		const params = {}

		const ajax = new XMLHttpRequest();
		ajax.open("POST", '/admin/session/getData');
		ajax.setRequestHeader('Content-Type', 'application/json');
		ajax.responseType = 'json';
		ajax.send(JSON.stringify(params));

		ajax.onload = () => {

			let res = ajax.response;
			if(res.err) {
				throw res.msg;
			}
			
			let data = res.msg;
			this.DOM.username.textContent = data.staff_email || data.admin_email;

		}

	}

	function evt_handleNavClick(evt) {

		let elem = evt.target;
		while(elem.parentNode && elem.tagName !== 'LI') {
			if(elem === this.DOM.ul) {
				return;
			}
			elem = elem.parentNode;
		}

		let id = elem.getAttribute('id');
		let leaf = id.split('.').pop();
		this.API.openPage(leaf);

	}

	function api_openPage(leaf) {

		for(let key in this.DOM.nav){
			this.DOM.nav[key].classList.remove('active');
		}

		for(let key in this.DOM.article){
			this.DOM.article[key].classList.remove('active');
		}
		
		this.DOM.nav[leaf].classList.add('active');
		this.DOM.article[leaf].classList.add('active');
		localStorage.setItem('admin_leaf', leaf);

	}

}).apply({});
