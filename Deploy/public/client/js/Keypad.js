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

const Keypad = (function() {

	this.MEM = {}

	this.DOM = {
		body : {
			doc : document.body,
			home : document.getElementById('Keypad.body.home'),
			arrow : document.getElementById('Keypad.body.arrow')
		},
		key : {
			0 : document.getElementById('Keypad.key.0'),
			1 : document.getElementById('Keypad.key.1'),
			2 : document.getElementById('Keypad.key.2'),
			3 : document.getElementById('Keypad.key.3'),
			4 : document.getElementById('Keypad.key.4'),
			5 : document.getElementById('Keypad.key.5'),
			6 : document.getElementById('Keypad.key.6'),
			7 : document.getElementById('Keypad.key.7'),
			8 : document.getElementById('Keypad.key.8'),
			9 : document.getElementById('Keypad.key.9'),
			bs : document.getElementById('Keypad.key.bs'),
			clear : document.getElementById('Keypad.key.clear'),
			conf : document.getElementById('Keypad.key.enter')
		}
	}

	this.EVT = {
		handleKeyInput : evt_handleKeyInput.bind(this),
		handleDocumentInput : evt_handleDocumentInput.bind(this)
	}

	this.API = {
		attachTo : api_attachTo.bind(this),
		close : api_close.bind(this)
	}

	init.apply(this);
	return this;

	function init() {

		this.DOM.body.arrow.addEventListener('mousedown', this.EVT.handleKeyInput);
		this.DOM.body.arrow.addEventListener('touchstart', this.EVT.handleKeyInput);
		this.DOM.body.doc.addEventListener('click', this.EVT.handleDocumentInput);

	}

	function evt_handleDocumentInput(evt) {


		if(!this.DOM.body.arrow.classList.contains('show')) {
			return;
		}

		if(this.MEM.skipClose) {
			this.MEM.skipClose = false;
			return;
		}

		let elem = evt.target;
		while(elem.parentNode && elem !== this.DOM.body.arrow) {
			elem = elem.parentNode;
		}

		if(elem === this.DOM.body.arrow) {
			return;
		}

		this.API.close();

	}

	function api_close() {

		this.DOM.body.arrow.classList.remove('show');
		TableManager.API.unlock();

	}

	function evt_handleKeyInput(evt) {

		evt.preventDefault();
		evt.stopPropagation();

		let elem = evt.target;
		if(elem.tagName !== 'BUTTON') {
			return;
		}

		TableManager.API.triggerSave();

		let id = elem.getAttribute('id');
		let leaf = id.split('.').pop();
		
		switch(leaf) {
		case 'bs':
			
			if(this.MEM.elem.value.length > 0) {
				let len = this.MEM.elem.value.length;
				this.MEM.elem.value = this.MEM.elem.value.substr(0, len - 1);
			}

			break;
		case 'dot':
			
			if(this.MEM.elem.value.indexOf('.') === -1) {
				this.MEM.elem.value += '.';
			}

			break;
		case 'clear':

			this.MEM.elem.value = '';

			break;
		case 'enter':
			
			this.API.close();
			TableManager.API.implementSave();

			break;
		default:
			this.MEM.elem.value += leaf;
			break;
		}

		let str = this.MEM.elem.value.replace(/,/g, '');
		console.log("Current String!!");

		str = str.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		console.log(str);

		this.MEM.elem.value = str;

		let userData = this.MEM.elem.userData;

		if(!this.MEM.isRight) {
			userData.data.weight = this.MEM.elem.value;
		} else {
			userData.data.count = this.MEM.elem.value;
		}
		
		TableManager.API.updateWeight();

	}

	function api_attachTo(elem, isRight) {

		this.MEM.skipClose = true;
		
		let rel = elem.parentNode;
		let rect = rel.children[1].getBoundingClientRect();
		
		let left = rect.left;
		let top = rect.bottom + 22;
		
		this.DOM.body.arrow.classList.add('show');
		this.DOM.body.arrow.style.left = `calc(${left}px - var(--keypad-width) / 2)`;
		this.DOM.body.arrow.style.top = `${top}px`;
		
		this.MEM.isRight = isRight;

		/*
		if(isRight) {
			this.DOM.body.arrow.classList.add('right');
		} else {
			this.DOM.body.arrow.classList.remove('right');
		}
		*/

		this.MEM.elem = elem;
		TableManager.API.lock();

	}

}).apply({});
