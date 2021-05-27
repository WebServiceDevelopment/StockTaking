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

const LoginManager = (function() {

	this.MEM = {}

	this.DOM = {
		preloader : document.getElementById('LoginManager.preloader'),
		form : {
			username : document.getElementById('LoginManager.form.username'),
			password : document.getElementById('LoginManager.form.password'),
			remember_me : document.getElementById('LoginManager.form.remember_me'),
			submit : document.getElementById('LoginManager.form.submit'),
			forgot : document.getElementById('LoginManager.form.forgot')
		},
		reset : {
			username : document.getElementById('LoginManager.reset.username'),
			code : document.getElementById('LoginManager.reset.code'),
			submit : document.getElementById('LoginManager.reset.submit'),
			return : document.getElementById('LoginManager.reset.return')
		},
		update : {
			password : document.getElementById('LoginManager.update.password'),
			confirm : document.getElementById('LoginManager.update.confirm'),
			submit : document.getElementById('LoginManager.update.submit'), 
			cancel : document.getElementById('LoginManager.update.cancel'),
			strength : document.getElementById('LoginManager.update.strength'),
			txt : document.getElementById('LoginManager.update.txt')
		},
		pages : {
			login : document.getElementById('PageManager.pages.login'),
			reset : document.getElementById('PageManager.pages.reset'),
			update : document.getElementById('PageManager.pages.update')
		}
	}

	this.EVT = {
		handleForgotClick : evt_handleForgotClick.bind(this),
		handleSubmitClick : evt_handleSubmitClick.bind(this),
		handleReturnClick : evt_handleReturnClick.bind(this),
		handleCodeSubmit : evt_handleCodeSubmit.bind(this),
		handleCancelClick : evt_handleCancelClick.bind(this),
		handlePasswordSubmit : evt_handlePasswordSubmit.bind(this),
		handlePasswordChange : evt_handlePasswordChange.bind(this)
	}

	this.API = {
		attemptLogin : api_attemptLogin.bind(this),
		resolveUsername : api_resolveUsername.bind(this),
		showPreloader : api_showPreloader.bind(this),
		hidePreloader : api_hidePreloader.bind(this),
		confirmCode : api_confirmCode.bind(this),
		updatePassword : api_updatePassword.bind(this)
	};

	init.apply(this);
	return this;

	function init() {

		// Force Login

		let prelogin = localStorage.getItem('prelogin');
		if(prelogin) {
			localStorage.removeItem('prelogin');
			prelogin = JSON.parse(prelogin);

			this.DOM.form.username.value = prelogin.username;
			this.DOM.form.password.value = prelogin.password;
		}

		// Sample Values for Debug Purposed

		this.MEM.strength = 1;
		this.MEM.username = null;
		this.MEM.code = null;
		this.MEM.reset_uuid = null;

		// Reset Password Strength 

		this.DOM.update.txt.setAttribute('class', '');
		this.DOM.update.strength.setAttribute('class', '');
		this.DOM.update.password.value = '';
		this.DOM.update.confirm.value = '';
		
		// Add in Event Listeners

		this.DOM.form.forgot.addEventListener('click', this.EVT.handleForgotClick);
		this.DOM.form.submit.addEventListener('click', this.EVT.handleSubmitClick);

		this.DOM.reset.submit.addEventListener('click', this.EVT.handleCodeSubmit);
		this.DOM.reset.return.addEventListener('click', this.EVT.handleReturnClick);

		this.DOM.update.cancel.addEventListener('click', this.EVT.handleCancelClick);
		this.DOM.update.submit.addEventListener('click', this.EVT.handlePasswordSubmit);
		this.DOM.update.password.addEventListener('input', this.EVT.handlePasswordChange);

	}

	function evt_handlePasswordChange() {

		console.log("password strength!!");

		let password = this.DOM.update.password.value;

		let strength = {
			1 : '無効',
			2 : '弱い',
			3 : 'まあまあ',
			4 : '強固',
			5 : 'とても強固'
		};

		let strengthValue = {
			'caps': false,
			'length': false,
			'special': false,
			'numbers': false,
			'small': false
		};
		
		if(password.length >= 8) {
			strengthValue.length = true;
		}

		for(let index=0; index < password.length; index++) {
			let char = password.charCodeAt(index);
			if(!strengthValue.caps && char >= 65 && char <= 90) {
				strengthValue.caps = true;
			} else if(!strengthValue.numbers && char >=48 && char <= 57){
				strengthValue.numbers = true;
			} else if(!strengthValue.small && char >=97 && char <= 122){
				strengthValue.small = true;
			} else if(!strengthValue.numbers && char >=48 && char <= 57){
				strengthValue.numbers = true;
			} else if(!strengthValue.special && (char >=33 && char <= 47) || (char >=58 && char <= 64)) {
				strengthValue.special = true;
			}
		}

		let strengthIndicator = 0;
		for(let metric in strengthValue) {
			if(strengthValue[metric] === true) {
				strengthIndicator++;
			}
		}
		
		strengthIndicator = strengthIndicator || 1;
		if(!strengthValue.length) {
			strengthIndicator = 1;
		}

		this.DOM.update.txt.textContent = strength[strengthIndicator];

		switch(strengthIndicator) {
		case 1:
			this.DOM.update.txt.setAttribute('class', '');
			this.DOM.update.strength.setAttribute('class', '');
			break;
		case 2:
			this.DOM.update.txt.setAttribute('class', 'weak');
			this.DOM.update.strength.setAttribute('class', 'weak');
			break;
		case 3:
			this.DOM.update.txt.setAttribute('class', 'good');
			this.DOM.update.strength.setAttribute('class', 'good');
			break;
		case 4:
			this.DOM.update.txt.setAttribute('class', 'strong');
			this.DOM.update.strength.setAttribute('class', 'strong');
			break;
		case 5:
			this.DOM.update.txt.setAttribute('class', 'very_strong');
			this.DOM.update.strength.setAttribute('class', 'very_strong');
			break;
		}

		this.MEM.strength = strengthIndicator;

	}

	function evt_handleCancelClick() {

		console.log("cancel click!!!");

		// Sample Values for Debug Purposed

		this.MEM.username = null;
		this.MEM.code = null;
		this.MEM.reset_uuid = null;
		this.MEM.strength = 1;

		// Reset Password Strength 

		this.DOM.update.txt.setAttribute('class', '');
		this.DOM.update.strength.setAttribute('class', '');
		this.DOM.update.password.value = '';
		this.DOM.update.confirm.value = '';

		// Change the page

		this.DOM.pages.update.classList.remove('open');
		this.DOM.pages.login.classList.add('open');

	}

	function evt_handlePasswordSubmit() {

		if(this.MEM.strength === 1) {
			return alert("Password is too weak");
		}

		if(this.DOM.update.password.value !== this.DOM.update.confirm.value) {
			return alert("Password is too weak");
		}

		this.API.updatePassword();

	}

	function api_showPreloader() {

		this.DOM.preloader.classList.add("open");

	}

	function api_hidePreloader() {

		this.DOM.preloader.classList.remove("open");

	}

	function evt_handleReturnClick() {

		this.MEM.reset_uuid = null;
		this.DOM.reset.username.value = '';
		this.DOM.reset.code.value = '';

		this.DOM.pages.login.classList.add('open');
		this.DOM.pages.reset.classList.remove('open');

	}

	function evt_handleCodeSubmit() {

		let str = this.DOM.reset.code.value;
		str = str.replace(/\s/g,'');

		if(str.length !== 6) {
			return alert('6桁のコードを入力してください');
		}

		this.API.confirmCode();

	}

	function evt_handleForgotClick(evt) {

		let str = this.DOM.form.username.value;
		str = str.replace(/\s/g,'');

		if(!str.length) {
			return alert("Please enter a username");
		}

		this.API.resolveUsername();

	}

	function evt_handleSubmitClick(evt) {

		evt.preventDefault();
		this.API.attemptLogin();

	}

	function api_attemptLogin() {

		const params = {
			username : this.DOM.form.username.value,
			password : this.DOM.form.password.value,
			remember_me : this.DOM.form.remember_me.checked ? 1 : 0
		};

		const ajax = new XMLHttpRequest();
		ajax.open('POST', '/session/login');
		ajax.setRequestHeader('Content-Type', 'application/json');
		ajax.responseType = 'json';
		ajax.send(JSON.stringify(params));

		ajax.onload = () => {

			let res = ajax.response;
			if(res.err) {
				 return alert(res.msg);
			}

			window.location.href = res.msg.href;
			
		}

	}

	function api_resolveUsername() {

		this.API.showPreloader();

		const params = {
			username : this.DOM.form.username.value
		}

		const ajax = new XMLHttpRequest();
		ajax.open('POST', '/session/getCode');
		ajax.setRequestHeader('Content-Type', 'application/json');
		ajax.responseType = 'json';
		ajax.send(JSON.stringify(params));

		ajax.onload = () => {

			let res = ajax.response;
			if(res.err) {
				return alert(res.msg);
			}

			// For the message, we should get a UUID
			
			this.MEM.reset_uuid = res.msg;
			this.MEM.username = this.DOM.form.username.value;

			this.DOM.reset.username.value = this.DOM.form.username.value;
			this.DOM.reset.code.value = '';
			this.DOM.reset.code.focus();

			this.API.hidePreloader();
			this.DOM.pages.login.classList.remove('open');
			this.DOM.pages.reset.classList.add('open');

		}

	}

	function api_confirmCode() {

		this.API.showPreloader();

		const params = {
			reset_uuid : this.MEM.reset_uuid,
			username : this.DOM.reset.username.value,
			code : this.DOM.reset.code.value
		}

		const ajax = new XMLHttpRequest();
		ajax.open('POST', '/session/confirmCode');
		ajax.setRequestHeader('Content-Type', 'application/json');
		ajax.responseType = 'json';
		ajax.send(JSON.stringify(params));

		ajax.onload = () => {
			this.API.hidePreloader();

			let res = ajax.response;
			if(res.err) {
				return alert(res.msg);
			}

			// Save information to memory

			this.MEM.code = this.DOM.reset.code.value;
			this.MEM.username = this.DOM.reset.username.value;
			
			// Clear the reset form
			
			this.DOM.reset.username.value = '';
			this.DOM.reset.code.value = '';

			// Move to the next page for reset password

			this.DOM.pages.reset.classList.remove('open');
			this.DOM.pages.update.classList.add('open');
			this.MEM.strength = 1

		}

	}

	function api_updatePassword() {

		this.API.showPreloader();

		const params = {
			reset_uuid : this.MEM.reset_uuid,
			username : this.MEM.username,
			code : this.MEM.code,
			password : this.DOM.update.password.value
		}

		const ajax = new XMLHttpRequest();
		ajax.open('POST', '/session/updatePassword');
		ajax.setRequestHeader('Content-Type', 'application/json');
		ajax.responseType = 'json';
		ajax.send(JSON.stringify(params));

		ajax.onload = () => {
			this.API.hidePreloader();

			let res = ajax.response;
			if(res.err) {
				return alert(res.msg);
			}
			

			window.location.href = res.msg.href;

		}

	}

}).apply({});
