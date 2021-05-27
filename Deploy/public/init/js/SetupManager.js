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

const SetupManager = (function() {

	this.MEM = {}

	this.DOM = {
		database : {
			format : document.getElementById('SetupManager.database.format'),
			hostname : document.getElementById('SetupManager.database.hostname'),
			username: document.getElementById('SetupManager.database.username'),
			password : document.getElementById('SetupManager.database.password'),
			port : document.getElementById('SetupManager.database.port'),
			name : document.getElementById('SetupManager.database.name')
		},
		admin : {
			login_id : document.getElementById('SetupManager.admin.login_id'),
			email : document.getElementById('SetupManager.admin.email'),
			display : document.getElementById('SetupManager.admin.display'),
			password : document.getElementById('SetupManager.admin.password'),
			generate : document.getElementById('SetupManager.admin.generate'),
			strength : document.getElementById('SetupManager.admin.strength'),
			label : document.getElementById('SetupManager.admin.label'),
			checkbox : document.getElementById('SetupManager.admin.checkbox')
		},
		email : {
			format : document.getElementById('SetupManager.email.format'),
			username : document.getElementById('SetupManager.email.username'),
			password : document.getElementById('SetupManager.email.password')
		},
		submit : document.getElementById('SetupManager.submit')
	}

	this.EVT = {
		handleGenerateClick : evt_handleGenerateClick.bind(this),
		handleSubmitClick : evt_handleSubmitClick.bind(this),
		handlePasswordInput : evt_handlePasswordInput.bind(this)
	}

	this.API = {
		checkPassword : api_checkPassword.bind(this),
		generatePassword : api_generatePassword.bind(this),
		checkFormInput : api_checkFormInput.bind(this),
		validateEmail : api_validateEmail.bind(this)
	}

	init.apply(this);
	return this;

	function init() {

		// Default DOM Attributes
		
		/*
		this.DOM.database.hostname.setAttribute('disabled', 'disabled');
		this.DOM.database.username.setAttribute('disabled', 'disabled');
		this.DOM.database.password.setAttribute('disabled', 'disabled');
		this.DOM.database.port.setAttribute('disabled', 'disabled');
		this.DOM.database.name.setAttribute('disabled', 'disabled');
		this.API.generatePassword();
		*/

		this.DOM.admin.label.setAttribute('class', 'disabled');

		// Add Event Listeners

		this.DOM.admin.generate.addEventListener('click', this.EVT.handleGenerateClick);
		this.DOM.submit.addEventListener('click', this.EVT.handleSubmitClick);
		this.DOM.admin.password.addEventListener('input', this.EVT.handlePasswordInput);

		// Call Internal Functions

		this.API.checkPassword();

	}

	function evt_handlePasswordInput() {

		this.API.checkPassword();

	}

	function evt_handleGenerateClick() {

		this.API.generatePassword();
		this.API.checkPassword();

	}

	function api_checkFormInput() {
		
		console.log("check the form input!!!");

		let errors = [];

		if(this.MEM.pass_strength === 1) {
			errors.push('Password is invalid');
		}

		if(this.MEM.pass_strength === 2 && !this.DOM.admin.checkbox.checked) {
			errors.push('Must confirm weak password');
		}

		if(this.DOM.admin.login_id.value.length === 0) {
			errors.push('Must create a login id for the admin');
		}

		if(!this.API.validateEmail(this.DOM.admin.email.value)) {
			errors.push('Must enter a valid admin email address');
		}

		if(!this.API.validateEmail(this.DOM.email.username.value)) {
			errors.push('Must enter a valid email username');
		}

		if(this.DOM.email.password.value.length === 0) {
			errors.push('Must enter an email password');
		}

		return errors;

	}

	function evt_handleSubmitClick() {
		
		console.log("Submit click!!");

		let errors = this.API.checkFormInput();
		console.log(errors);

		if(errors.length) {
			return alert(errors.join('\n'));
		}

		const params = {
			admin : {
				login_id : this.DOM.admin.login_id.value,
				display : this.DOM.admin.display.value,
				email : this.DOM.admin.email.value,
				password : this.DOM.admin.password.value
			},
			email : {
				format : this.DOM.email.format.value,
				username : this.DOM.email.username.value,
				password : this.DOM.email.password.value
			}
		}

		console.log(params);

		const ajax = new XMLHttpRequest();
		ajax.open('POST', '/session/setup');
		ajax.setRequestHeader('Content-Type', 'application/json');
		ajax.responseType = 'json';
		ajax.send(JSON.stringify(params));

		ajax.onload = () => {

			let res = ajax.response;
			if(res.err) {
				 return alert(res.msg);
			}

			localStorage.setItem('prelogin', JSON.stringify({
				username : this.DOM.admin.login_id.value,
				password : this.DOM.admin.password.value
			}));

			window.location.href = res.msg;

		}


	}

	function api_checkPassword() {

		let password = this.DOM.admin.password.value;

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

		this.DOM.admin.strength.textContent = strength[strengthIndicator];

		switch(strengthIndicator) {
		case 1:
			this.DOM.admin.checkbox.checked = false;
			break;
		case 2:
			this.DOM.admin.checkbox.checked = false;
			this.DOM.admin.label.classList.remove('disabled');
			break;
		default:
			this.DOM.admin.checkbox.checked = true;
			this.DOM.admin.label.classList.add('disabled');
			break;
		}

		this.MEM.pass_strength = strengthIndicator;
	}

	function api_generatePassword() {
		let length = 20;
		let string = "abcdefghijklmnopqrstuvwxyz"; //to upper 
		let numeric = '0123456789';
		let punctuation = '!@#$%^&*()_+~`|}{[]\:;?><,./-=';
		let password = "";
		let character = "";
		let crunch = true;

		while( password.length < length ) {
			let entity1 = Math.ceil(string.length * Math.random()*Math.random());
			let entity2 = Math.ceil(numeric.length * Math.random()*Math.random());
			let entity3 = Math.ceil(punctuation.length * Math.random()*Math.random());
			let hold = string.charAt( entity1 );
			hold = (password.length%2==0)?(hold.toUpperCase()):(hold);
			character += hold;
			character += numeric.charAt( entity2 );
			character += punctuation.charAt( entity3 );
			password = character;
		}

		password=password.split('').sort(function(){
			return 0.5-Math.random()
		}).join('');

		this.DOM.admin.password.value = password.substr(0,length);
	}

	function api_validateEmail(mail) {
		
		let re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
		return re.test(mail);

	}

}).apply({});
