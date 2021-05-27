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

 Author: Benjamin Collins (collins@wsd.co.jp)

**/

"use strict";

const TabManager = (function () {

	this.MEM = {}

	this.DOM = {
		tabs: {
			a: document.getElementById('TabManager.a'),
			b: document.getElementById('TabManager.b')
		},
		card: document.getElementById('TabManager.card')
	}

	this.EVT = {
		handleTabClick: evt_handleTabClick.bind(this)
	}

	this.API = {
		setTab: api_setTab.bind(this),
		getTouch: api_getTouch.bind(this)
	}

	init.apply(this);
	return this;

	function init() {

		if (!this.API.getTouch()) {
			this.DOM.tabs.a.addEventListener('click', this.EVT.handleTabClick);
			this.DOM.tabs.b.addEventListener('click', this.EVT.handleTabClick);
		} else {
			this.DOM.tabs.a.addEventListener('touchstart', this.EVT.handleTabClick);
			this.DOM.tabs.b.addEventListener('touchstart', this.EVT.handleTabClick);
		}

		this.API.setTab('a');

	}

	function evt_handleTabClick(evt) {

		let elem = evt.target;
		let id = elem.getAttribute('id');
		let leaf = id.split('.').pop();
		this.API.setTab(leaf);

	}

	function api_setTab(leaf) {

		switch (leaf) {
		case 'a':
			this.DOM.tabs.a.classList.add('active');
			this.DOM.tabs.b.classList.remove('active');
			this.DOM.card.classList.remove('over');
			break;
		case 'b':
			this.DOM.tabs.a.classList.remove('active');
			this.DOM.tabs.b.classList.add('active');
			this.DOM.card.classList.add('over');
			break;
		}

	}

	function api_getTouch() {

		try {
			document.createEvent("TouchEvent");
			return true;
		} catch (e) {
			return false;
		}

	}

}).apply({});
