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

 Author: Ogawa Kousei (kogawa@wsd.co.jp)

**/

"use strict";

/*
 * Basic object.
 */

const _core = new function () {

	this.tbody1 = null;
	this.tpage1 = null;

	this.dot_count_1 = null;
	this.add_btn_1 = null;
	this.min_btn_1 = null;

	this.setTbody1 = (tbody1) => this.tbody1 = tbody1;
	this.getTbody1 = () => this.tbody1;

	this.setTpage1 = (tpage1) => this.tpage1 = tpage1;
	this.getTpage1 = () => this.tpage1;

	this.setDotCount1 = (dot_count_1) => this.dot_count_1 = dot_count_1;
	this.getDotCount1 = () => this.dot_count_1;

	this.setAddBtn1 = (add_btn_1) => this.add_btn_1 = add_btn_1;
	this.getAddBtn1 = () => this.add_btn_1;

	this.setMinBtn1 = (min_btn_1) => this.min_btn_1 = min_btn_1;
	this.getMinBtn1 = () => this.min_btn_1;

	this.tbody2 = null;
	this.tpage2 = null;

	this.dot_count_2 = null;
	this.add_btn_2 = null;
	this.min_btn_2 = null;

	this.setTbody2 = (tbody2) => this.tbody2 = tbody2;
	this.getTbody2 = () => this.tbody2;

	this.setTpage2 = (tpage2) => this.tpage2 = tpage2;
	this.getTpage2 = () => this.tpage2;

	this.setDotCount2 = (dot_count_2) => this.dot_count_2 = dot_count_2;
	this.getDotCount2 = () => this.dot_count_2;

	this.setAddBtn2 = (add_btn_2) => this.add_btn_2 = add_btn_2;
	this.getAddBtn2 = () => this.add_btn_2;

	this.setMinBtn2 = (min_btn_2) => this.min_btn_2 = min_btn_2;
	this.getMinBtn2 = () => this.min_btn_2;

	this.ua = window.navigator.userAgent.toLowerCase();
	this.browser = null;
	if (this.ua.indexOf('msie') != -1 ||
		this.ua.indexOf('trident') != -1) {
		this.browser = "msie";
	} else if (this.ua.indexOf('edge') != -1) {
		this.browser = "edge";
	} else if (this.ua.indexOf('chrome') != -1) {
		this.browser = "chrome";
	} else if (this.ua.indexOf('safari') != -1) {
		this.browser = "safari";

		/*
		 * iPadの場合 browser のuserAgentが2種類ある
		 * OS　versionが同一であってもブラウザは異なる場合がある
		 * 判定:core.js
		 *  ua:(ipad)
		 *   --slide-bar: 10px;
		 *  ua:(macintosh)
		 *   --slide-bar: 0px;
		 *
		 * document.documentElementに識別のためのclassNameを追加
		 * ipad or macintosh
		 * layout.cssで--slide-barを切り替える
		 */
		let doc = document.documentElement
		if (this.ua.indexOf('macintosh') != -1) {
			doc.className += 'macintosh ';
		} else {
			doc.className += 'ipad ';
		}

	} else if (this.ua.indexOf('firefox') != -1) {
		this.browser = "firefox";
	} else if (this.ua.indexOf('opera') != -1) {
		this.browser = "opera";
	} else {
		this.browser = "unkown";
	}
	//alert("this.browser ="+this.browser+":ua="+this.ua);


	this.work_in_process = null
	this.setWorkInProcess = (work_in_process) => this.work_in_process = work_in_process;
	this.getWorkInProcess = () => this.work_in_process;

	this.raw_materials = null;
	this.setRawMaterials = (raw_materials) => this.raw_materials = raw_materials;
	this.getRawMaterials = () => this.raw_materials;

	this.long_press_old_time = null;
	this.setLongPressOldTime = (long_press_old_time) => this.long_press_old_time = long_press_old_time;
	this.getLongPressOldTime = () => this.long_press_old_time;

	this.tenkey = new tenkey_class();
	this.under_tenkey = new under_tenkey_class();

	this.selectionBoard = new selectionBoard_class();

	this.init = _init;


	return this;

	function CreateTpage(tbody, id) {

		let tpage = document.createElement('div');
		tpage.setAttribute("class", "tpage");
		tpage.setAttribute("id", id);
		tbody.appendChild(tpage);
		return tpage;

	}

	function SetEvent(obj, addBtn, minBtn) {
		if (addBtn !== null) {
			addBtn.addEventListener('click', obj.addRow);
		}

		if (minBtn !== null) {
			minBtn.addEventListener('click', obj.minusRow);
		}
	}

	/*
	 * Initialization after loading.
	 */
	function _init() {

		//
		// Initialization of DOM object.
		//
		let tbody1 = document.getElementById('tbody1');
		_core.setTbody1(tbody1);

		let tpage1 = CreateTpage(tbody1, 'tpage1');

		_core.setTpage1(tpage1);

		_core.setDotCount1(document.getElementById(DOT_COUNT_1));
		_core.setAddBtn1(document.getElementById(ADD_BTN_1));
		_core.setMinBtn1(document.getElementById(MIN_BTN_1));

		SetEvent(Inventory, _core.getAddBtn1(), _core.getMinBtn1());

		//
		// Initialization of DOM object.
		//
		let tbody2 = document.getElementById('tbody2');
		_core.setTbody2(tbody2);

		let tpage2 = CreateTpage(tbody2, 'tpage2');

		_core.setTpage2(tpage2);

		_core.setDotCount2(document.getElementById(DOT_COUNT_2));
		_core.setAddBtn2(document.getElementById(ADD_BTN_2));
		_core.setMinBtn2(document.getElementById(MIN_BTN_2));

		SetEvent(Stock, _core.getAddBtn2(), _core.getMinBtn2());

		//
		// Submission of approval request.
		//

		const thumb = document.getElementById('thumb');
		const track = document.getElementById('track');

		let trackofs = 0;
		let thumb_down = false;
		let trackComplete = false;

		thumb.addEventListener('mousedown', function (evt) {

			if (trackComplete) {
				return;
			}

			thumb_down = true;
			let rect = track.getBoundingClientRect();
			trackofs = evt.clientX - rect.left;

		});

		document.addEventListener('mouseup', function () {

			thumb_down = false;

			if (!trackComplete) {
				thumb.style.transform = `translateX(0px)`;
			} else {
				document.getElementById('conf').classList.remove('close');
			}

		});

		document.getElementById('conf_cancel').addEventListener('click', function () {

			trackofs = 0;
			trackComplete = false;
			thumb.classList.remove('complete');
			thumb.style.transform = `translateX(0px)`;
			document.getElementById('conf').classList.add('close');

			Inventory.addButtonEnabled();
		});

		document.addEventListener('mousemove', function (evt) {

			if (!thumb_down) {
				return;
			}

			let rect = track.getBoundingClientRect();
			let xOfs = evt.clientX;
			let yOfs = evt.clientY;

			let start = rect.left;
			let end = rect.right;
			let diff = xOfs - start - trackofs;

			if (diff < 0) {

				diff = 0;
				trackComplete = false;
				thumb.classList.remove('complete');

			} else if (start + diff >= end - 60) {

				diff = end - start - 65;
				trackComplete = true;
				thumb.classList.add('complete');

			} else {

				trackComplete = false;
				thumb.classList.remove('complete');

			}

			thumb.style.transform = `translateX(${diff}px)`;

		});

		thumb.addEventListener('touchstart', function (evt) {

			console.log("touch start!!");

			if (trackComplete) {
				return;
			}

			evt.preventDefault();
			thumb_down = true;
			let rect = track.getBoundingClientRect();
			trackofs = evt.touches[0].clientX - rect.left;

		});

		document.addEventListener('touchend', function () {

			console.log("tocuh end!!");

			thumb_down = false;

			if (!trackComplete) {
				thumb.style.transform = `translateX(0px)`;
			} else {
				document.getElementById('conf').classList.remove('close');
			}

		});

		document.addEventListener('touchmove', function (evt) {

			if (!thumb_down) {
				return;
			}

			evt.preventDefault();
			console.log("doing the thin!!");

			let rect = track.getBoundingClientRect();
			let xOfs = evt.touches[0].clientX;
			let yOfs = evt.touches[0].clientY;

			let start = rect.left;
			let end = rect.right;
			let diff = xOfs - start - trackofs;

			if (diff < 0) {

				diff = 0;
				trackComplete = false;
				thumb.classList.remove('complete');

			} else if (start + diff >= end - 60) {

				diff = end - start - 65;
				trackComplete = true;
				thumb.classList.add('complete');

				Inventory.addButtonDisabled();

			} else {

				trackComplete = false;
				thumb.classList.remove('complete');

			}

			thumb.style.transform = `translateX(${diff}px)`;

		});


		function touchMove(evt) {

			console.log(rect);
			console.log(evt);

			console.log("moving!");

		}

		document.getElementById('modal1_cancel').addEventListener('click', function () {

			document.getElementById('modal1').classList.remove('open');

		});

		document.getElementById('conf_submit').addEventListener('click', function () {

			let rt = confirm("承認依頼を行います");
			if (rt == false) {
				return;
			}

			//alert("メール送信");

			let max = Inventory.getId();
			let table = Array(max);
			let a, b, c, d, e, f, g, h, i;
			let result = [];
			let wk = {};

			for (let k = 0, l = 1, m = 1; k < max; k++, l++) {

				table[k] = {};
				a = m;
				b = getValueOfSelect('b', l);
				c = getValueOfSelect('c', l);
				d = getValueOfSelect('d', l);
				e = getValueOfSelect('e', l);
				f = getValueOfInput('f', l);
				g = getValueOfSelect('g', l);
				h = getValueOfInput('h', l);
				i = getValueOfInput('i', l);

				table[k].a = a;
				table[k].b = b;
				table[k].c = c;
				table[k].d = d;
				table[k].e = e;
				table[k].f = f;
				table[k].g = g;
				table[k].h = h;
				table[k].i = i;

				if (b == "" && c == "" && d == "" && e == "" && f == "" && g == "" && h == "" && i == "") {
					continue;
				}
				wk.a = a;
				wk.b = b;
				wk.c = c;
				wk.d = d;
				wk.e = e;
				wk.f = f;
				wk.g = g;
				wk.h = h;
				wk.i = i;

				result.push(wk);

				m++;
			}

			wk = JSON.stringify(result);
			setTimeout(() => {
				let cover = document.getElementById("cover");
				cover.classList.add('open');

				DataManager.API.tableToDataForInventory();
				DataManager.API.tableToDataForStock();

				DataManager.API.submitInventoryReport();
			}, 20);

			return;

			function getValueOfSelect(c, j) {
				let elm, num;
				try {
					elm = document.getElementById(c + '_' + j + '_' + 'select');
				} catch (e) {
					console.log("id=" + c + '_' + j + '_' + 'select');
				}
				if (elm == null) {
					return null;
				}
				try {
					num = elm.selectedIndex;
				} catch (e) {
					console.log("1 id=" + c + '_' + j + '_' + 'select' + ":num=" + num);
				}
				if (elm.options.length == 0) {
					return null;
				}

				return elm.options[num].value;
			}

			function getValueOfInput(c, j) {

				let elm = document.getElementById(c + '_' + j + '_' + 'input');
				return elm.value;
			}

		});

		document.getElementById('map_toggle').addEventListener('click', function () {

			document.getElementById('map_widget').classList.toggle('small');

		});

		const inventory_names_next_process = [
			"No.", "置場", "棚卸資産", "品種 /\n次工程",
			"品名", "正味重量", "単位", "フレコン\n数量", "備考"
		];

		const stock_names_next_process = [
			"No.", "置場", "棚卸資産", "",
			"品名", "重量(kg)", "単位", "数量", "備考"
		];

		const inventory_header_names = ["No.", "置場", "棚卸資産", "品種 /\n次工程", "品名", "正味重量", "単位", "フレコン\n数量", "備考"];

		const stock_header_names = ["No.", "置場", "貯蔵品", "", "品名", "重量(kg)", "単位", "数量", "備考"];


		function drawTable(thead_name, names_basic) {
			const class_names = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'];

			let thead = document.getElementById(thead_name);
			let table = document.createElement('table');
			thead.appendChild(table);
			let tr = document.createElement('tr');
			table.appendChild(tr);

			let td, class_name;

			for (let i in class_names) {

				td = document.createElement('td');
				class_name = class_names[i];
				td.setAttribute("class", class_name);
				td.setAttribute("id", `${class_name}_column`);
				td.innerText = names_basic[i];
				tr.appendChild(td);

			}
		}

		drawTable('thead1', inventory_header_names);

		drawTable('thead2', stock_header_names);

		/*
		 * Sales month, 
		 * Person in charge,
		 * Inventory date,
		 * Location,
		 * Inventory line,
		 */
		const sales_month = "2020年11月";
		const person_in_charge = "田中";
		const inventory_date_of_treatment = "2020年11月30日";
		const location = "浜松工場";
		const inventory_line = "浜松";

		const place_names = ["", 
			"No.01", "No.02", "No.03", "No.04", "No.05",
			"No.06", "No.07", "No.08", "No.09", "No.10", 
			"No.11", "No.12", "No.13", "No.14", "No.15", 
			"No.16", "No.17", "No.18"
		];

		const inventory_assets_names = ["", "原材料", "仕掛品", "製品", "ダスト", "同じ"];

		const variety_names = "";

		const product_names = ""

		//const unit_names = ["", "kg", "枚", "本", "式"];
		const inventory_unit_names = ["", "kg", "台"];

		/*
		 *	elm = document.getElementById('sales_month');
		 *	elm.textContent = sales_month;
		 *
		 *	elm = document.getElementById('person_in_charge');
		 *	elm.textContent = person_in_charge;
		 *
		 *	elm = document.getElementById('inventory_date_of_treatment');
		 *	elm.textContent = inventory_date_of_treatment;
		 *
		 *	elm = document.getElementById('location');
		 *	elm.textContent = location;
		 *
		 *	elm = document.getElementById('inventory_line');
		 *	elm.textContent = inventory_line;
		 */

		Inventory.setPlaceNames(place_names);
		Inventory.setAssetsNames(inventory_assets_names);
		Inventory.setVarietyNames(variety_names);
		Inventory.setUnitNames(inventory_unit_names);
		Inventory.setProductNames(product_names);


		const products = ["", PRODUCT_IRON, PRODUCT_RED_NON_FERROUS, PRODUCT_WHITE_NON_FERROUS, PRODUCT_BOARDS, PRODUCT_PLASTIC, PRODUCT_GOLD_SILVER, PRODUCT_USED_PAPER, PRODUCT_OTHERS];

		const dusts = ["", "コンデンサー", "ダスト", "蛍光灯", "廃トナーカートリッジ", "廃材", "廃油", "埋め立てダスト"];

		const irons = ["", "18クロム", "Ｃプレス", "Ｈ１", "ＨＳ", "ＳＨＰ鉄", "UPS", "ウェザーストリップ鉄", "エンジン", "ガスメーター", "キュービクル", "コンデンサー", "コンバーター", "コンプレッサー", "シールドバッテリー", "シュレッダーA", "スチール缶プレス", "ダライ", "ダライ粉",
			"ダルマ線N", "トランス", "トランスコア", "バッテリー", "ビニール箔", "ビニール付アルミ箔", "ポリ付ハリ", "ポンチ", "マグネシウム", "マンガン鋼", "モーター", "モーターコア", "亜鉛金型", "安定器", "一軸線", "金型", "給湯器", "研磨粉", "黒モーター", "雑品", "自動車バッテリー", "室外機",
			"新断", "新断Ａ", "芯有モーター", "銑ダライ", "鉄屑", "廃却キカイ", "廃却機械", "配電盤", "発電機", "被覆アルミ線", "被覆トロリ線"
		];

		const red_non_ferrous = ["", "180 鉱行銅A", "181 鉱行銅A", "181 鉱行銅B", "182 鉱行銅B", "182 鉱行銅M", "183 鉱行銅M", "468 山A", "650 PM-8H", "651 偏向ﾖｰｸ 3", "652 銅管PT+15反A", "653 偏向ﾖｰｸ 3", "654 銅管KTA", "665　偏向ﾖｰｸ-3B", "PM-8H", "PMエナメル", "P銅", "SHP雑線",
			"エナメル線", "ステーターコア 3", "トランス重", "ハーネス", "パテ銅下", "パテ付き銅管", "パテ付銅管", "バルブ砲金", "ビスマス砲金", "ピッキング銅", "ミックス銅", "メッキ端子", "ラジミミ+8反", "ラジミミ３－８", "ラジミミ重", "ワイヤーカット", "一芯線", "家電線", "解体トランス",
			"鉱行真鍮粉", "鉱行銅粉", "鉱行砲金粉", "雑線A", "雑線B", "雑線下Ａ", "雑線未処理", "山A", "山B", "真鍮", "真鍮粉", "真鍮未処理", "洗エナメル", "洗モーター-8H", "端子ゴミ混じり", "鉄付トークラジエーター", "鉄付トークラジエータープレス", "銅ガマ", "銅管KTA", "銅管KT重", "銅管PT+15反A", "銅管PT+15反B", "銅管PT-15反", "銅系雑品", "銅系未処理", "銅雑品＋１５反",
			"銅雑品8-15反", "銅雑品-8H", "銅雑品跳ね返り", "白湯沸かし", "皮付銅管", "被覆線未処理", "被覆線70％", "偏向ヨーク 3", "偏向ヨーク 3B", "棒中", "洋白", "燐青銅"
		];

		const pra = ["", "COP樹脂", "LDPE", "ＯＡプラ", "PA12", "PA66GF-30", "PETキャップ", "PET粉砕品", "PEキャップ", "PSFR", "ＳＲ－ＭＩＸプラ", "TSライト", "UPPパージ粉砕", "サーマルプラ", "スギ：（黒）PP　　５：５", "スギ：PP　　５：５", "タモ：PP　　５：５", "ネンプラ", "フロス①", "ペレット", "液晶モニター", "王子向け３０ｍｍ", "水フロス", "製紙向け３０ｍｍ"];

		const boards = ["", "170 【N5】ﾉｰﾄ基板", "171 【N5】FX基板", "173 【N5】雑B基板", "174 【N5】雑C基板", "310 外SR2-4ﾍﾋﾞｰH", "310 外SR-2ﾍﾋﾞｰJ", "311 SR2-4ﾍﾋﾞｰJ", "311 外SR2-4ﾍﾋﾞｰH", "312 外SR2-4ﾍﾋﾞｰJ", "313 SR4-6ﾍﾋﾞｰR反応", "313 外SR6-8ﾍﾋﾞｰR反応", "314 SR4-6ﾍﾋﾞｰR非反", "314 外SR6-8ﾍﾋﾞｰR反応", "322 外SR6-8R反応", "323 外SR6-8R反応", "324 外SR6-8R非反", "325 外SR6-8R非反", "335 外SR2-4ﾍﾋﾞｰH", "450 TZSMIX2-4ﾐﾄﾞﾙR反応", "451 TZSMIX2-4ﾐﾄﾞﾙR非反", "452 TZSMIX2-4ﾐﾄﾞﾙR非反", "453 TZSMIX4-6ﾐﾄﾞﾙR反応", "454 TZSMIX4-6ﾐﾄﾞﾙR反応", "455 TZSMIX4-6ﾐﾄﾞﾙR非反",
			"456 HM+30-8HS3ﾐﾄﾞﾙ", "457 HM+30-5HS3ﾐﾄﾞﾙ", "458 TZ2-4S1ﾐﾄﾞﾙ", "459 SRHｼﾝｸ ", "460 TZ6-8Hｼﾝｸ", "461 TZ4-6Hｼﾝｸ", "462 SRHｼﾝｸ ", "463 TZSMIX-2S3ARTﾍﾋﾞ", "464 TZ-2S3ARTﾍﾋﾞｰ ", "465 TZ-2S3ARTﾍﾋﾞｰ ", "466 TZ4-6R反応", "467 100mmJ基盤", "655 TVｷﾊﾞﾝ破砕品", "656 TVｷﾊﾞﾝ破砕品", "657 A2M軽", "658 A2M軽", "659 工雑 8", "660 A2M8-15", "661 工雑+15重", "662 工雑8-15",
			"663 銅管KT非反", "664 ﾄﾗﾝｽ風選", "666 切換弁軽 8", "667 工雑風選", "668 銅管PT風選", "669 ﾓｰﾀｰ風選", "670 A2M+15重", "A2M軽", "ARTヘビー", "ARTミドル", "CO ASRHｼﾝｸ", "CP SRHｼﾝｸ", "CP②SRHｼﾝｸ ", "DD SRJﾌﾛｽ", "DG 家電Jﾌﾛｽ", "DK Jﾊｰﾈｽ", "DS SHP家電ｱﾝﾀﾞｰ", "DX 家電Jｼﾝｸ", "DY TZ6-8Hｼﾝｸ", "DZ TZ2-4TSﾍﾋﾞｰ", "EJ 被覆銅線", "EL A2M軽", "FA TZ4-6Hｼﾝｸ",
			"FB 基盤P3J", "FX基板", "Hシンク", "Jシンク", "Jハーネス", "Jフロス", "J基板", "NKTJ-8", "PM＋１５重", "PM8－15", "P基板", "Rキバン破砕品", "SHP家電-15", "SR2-4ヘビーH", "SR2-4ヘビーJ", "SR-2ヘビーH", "SR-2ヘビーJ", "SR4-6ヘビーR反応", "SR4-6ヘビーR非反応", "SR6-8ヘビーR反", "SR6-8ヘビーR非反", "SR8-15ヘビーLH", "SR8-15ヘビーR反", "SR8-15ヘビーR非反", "SRHシンク", "SRJフロス",
			"SRフロス", "TSヘビー", "TVキバン破砕品", "TZ4-6TSヘビー", "TZハーネス", "カード", "ノート基板", "モーター風選", "リン酸銅メッキプラ", "銀メッキプラ", "雑A基板", "雑B基板", "雑C基板", "銅雑品+15重", "銅雑品8-15", "銅雑品風選", "被覆銅線", "米キバンサイクロン", "偏向ヨーク3-8"
		];

		const gold_silver = ["", "315 HM0.5-2ﾍﾋﾞｰH ", "316 HM0.5-2ﾍﾋﾞｰH ", "317 HM0.5-2ﾍﾋﾞｰJ", "318 HM2-4ﾍﾋﾞｰH ", "319 HM2-4ﾍﾋﾞｰH ", "320 HM2-4ﾍﾋﾞｰH ", "321 HM2-4ﾍﾋﾞｰJ", "326 HM4-6ﾍﾋﾞｰH", "327 HM4-6ﾍﾋﾞｰJ", "328 HM4-6ﾍﾋﾞｰHR反応", "329 HM6-8ﾍﾋﾞｰJ", "330 HM6-8ﾍﾋﾞｰH1次ｼﾝｸ", "331 HM8-15ﾍﾋﾞｰR反応1次ｼ", "332 HM8-15ﾍﾋﾞｰR反応2次ｼ", "HM0.5-2ヘビーH", "HM2-4ヘビーH", "HM2-4ヘビーJ", "HM4-6ヘビーR反応", "HM6-8ヘビーH1次シンク", "HM6-8ヘビーH2次シンク", "HM6-8ヘビーJ"];

		const white_non_ferrous = ["", "6005", "6千系", "6千系アルミ粉", "6千系プレス", "7千系", "AT", "Aサッシ", "Aサッシプレス", "Bサッシプレス", "HDD", "PS板", "SB15", "SB-15", "SM", "SKD-12", "SUS310", "TiNi粉", "アルミ", "アルミブスバー", "アルミホイル", "アルミ缶", "アルミ缶プレス", "アルミ合金", "アルミ粉一般", "インコネル", "インコネル690", "インコネル800", "ガラプレス",
			"キバンAT", "クロメル線", "サーメット", "ステンレス", "ステン針", "ステン線材", "ステン粉鉄混じり", "チタン粉", "ニクロム線", "ベータチタン", "ミックスメタル", "ユニット屑", "亜鉛線", "解体アルミ", "解体ステンレス", "解体銅", "合金新切", "込キカイ", "雑品+15反",
			"触媒", "新コロA", "新コロB", "純チタン", "丹入", "超硬", "鉄付アルミ", "銅付アルミ", "白系未処理", "耐熱鋼", "非鉄解体物"
		];

		const work_in_process = ["", "A2-8", "A2ECS非鉄", "A2M反+15HGJ", "A2メタル反・風選", "ACS-5", "ACモーター 8-15非", "ASR", "ASR-5", "ASR（原料）", "ＡＳＲーＭＩＸ", "ＥＣＳ非鉄", "H-8", "HK0.5-2", "HM+30", "HM+30 -5H", "HMライトミドル類", "H風選", "Jシンク8-15反", "Li－ｉｏｎバッテリー", "Ｎｉ－ＭＨバッテリー", "PS", "SHP-15", "SMIX+30+15重", "SMIX0.5",
			"SMIX0.5-2", "SMIX15-30", "S-MIX15-30", "SMIX15-30ECS非反", "S-MIX15-30手選済", "SMIX2-4", "SMIX4-6", "SMIX6-8", "SR", "SR（原料）", "ＳＲ－１５ｍｍ", "SR-2", "SR2-4", "SR2-4ヘビー", "SR4-6", "SR4-6R非反", "SR4-6ヘビー", "SR6-8ヘビー", "SRー８ｍｍ重", "SRアンダー", "SR水フロス", "TTMライトミドル類", "アルミカーボン付き", "アルミラジエタ", "カーボン", "カーボン付き銅箔",
			"キバン+15軽", "キバン風選", "ステッピングモータ", "トレンゾライト8-15", "ビニール付き銅箔", "モーターコア", "ラジエタ", "ラジ耳", "液無しセル", "家電ミックス", "巻回体", "混合プラ", "自販機ラジ", "集塵物", "正極0.25㎜～5㎜", "正極材", "洗モーター＋１５重", "電源基板", "銅箔", "日本化学正極", "燃料電池",
			"富士エコ家電プラアンダー重選フロス", "富士エコ家電プラアンダー水選フロス", "富士エコ家電プラオーバー重選フロス", "富士エコ家電プラオーバー水選フロス", "母材", "豊田市-3", "豊田市3-8", "未破砕フロス ", "未破砕水フロス", "木屑ＭＩＸダスト"
		];

		const raw_materials = ["", "(黒)PP　（ASR)", "ACモーター", "ＡＳＲ", "ASR", "Ａプレス", "Bサッシ", "HDD", "HDDステンフタ", "HDPEタンク", "HDPEドラム缶", "HM+30", "ＯＡ機器（リコー）", "RPF母材", "SMIX", "SMIXアンダー", "ＳＲ", "SR", "SRアンダー", "アルミトランス", "アルミ缶", "エンジン",
			"ガス前", "ギロ材", "コンデンサー", "ステッピングモーター", "その他SRプレス", "チタン", "トナータンク", "ニカド電池", "ハイブリッドバッテリー", "パソコン", "ピッキングモーター", "プラパレ", "押入れBOX", "解体クローム", "解体ステンレス", "海底ケーブル", "魚箱", "金型", "黒モーター", "再生PP", "自販機", "小型家電", "水フロス",
			"切換弁", "洗モーター", "洗濯機キバン", "中継機", "中田屋家電", "銅トランス", "燃料電池", "廃プラ", "廃却機械", "複写機", "偏向ヨーク", "豊通液無セル", "豊通液有セル", "豊通群巻体", "木屑", "木粉（タモ）", "中田屋家電ミックス"
		];

		const used_paper = ["ダンボール"];

		const others = ["ＦＲＰ"];

		const next_process_for_row_material = {
			"ｸﾛｽﾌﾛｰ": ["", "二軸", "竪型"],
			"Sライン": ["", "二軸", "竪型"]
		}

		const next_process_all = {
			"分工場": ["", "RPF"],
			"Hライン": ["", "H", "PR", "R2"],
			"Sライン": ["", "S", "S3"],
			"トレンゾ": ["", "トレンゾ", "JIG", "高磁選", "リニア"],
			"SHP": ["", "H", "J", "竪型"],
			"SDP": ["", "H"],
			"竪型HSR": ["", "ECS", "F", "SDP"],
			"ｸﾛｽﾌﾛｰ": ["", "CFS", "竪型", "手選", "二軸"],
		}

		Inventory.setProducts(products);
		Inventory.setDusts(dusts);
		Inventory.setIrons(irons);
		Inventory.setRedNonFerrous(red_non_ferrous);
		Inventory.setPra(pra);
		Inventory.setBoards(boards);
		Inventory.setGoldSilver(gold_silver);
		Inventory.setWhiteNonFerrous(white_non_ferrous);
		Inventory.setUsedPaper(used_paper);
		Inventory.setOthers(others);


		Inventory.setNextProcessForRowMaterial(next_process_for_row_material);
		/*
		 *	_core.setNextProcessAll (next_process_all);
		 */
		Inventory.setNextProcessAll(next_process_all);

		_core.setWorkInProcess(work_in_process);
		_core.setRawMaterials(raw_materials);

		/*
		 *	_core.setNamesNextProcess (names_next_process);
		 */
		Inventory.setNamesNextProcess(inventory_names_next_process);

		const stock_assets_names = ["", "貯蔵品"];
		const stock_unit_names = ["", "kg", "枚", "本", "式", "缶", "個"];

		const stock_names = [
			"", "上刃ピンボルト", "下刃ピンボルト", "作動油No.68", "刃物", "廃却機械", "1軸破砕機回転刃",
			"1軸破砕機リテーナー", "エピノックグリースAP(N)2", "エピノックグリースAP2", "ギヤードモーター", "御池回転刃", "御池固定刃",
			"リングダイ", "作動油68", "作動油46", "一軸破砕機第二固定刃", "VAフィルター", "作動油３２",
			"後面リング", "ＲＰＦ　ＭＲ７/４０マルチローター用", "一軸破砕機第一固定刃", "三菱ギヤモーター1.5ｋｗ", "マルチプレス用", "ディスクブレーキ",
			"マルチプレス用", "シュリングディスク", "サイクロン減速機０．７５ｋｗ", "御池回転刃", "モータープーリーKPR　A513", "コスモジャバラグリス",
			"へグランド油圧ホース", "MR-7/40SHCマルチロータ用", "（1軸破砕機RPF）", "南星パイロットポンプモーター", "テールプーリー", "コンベアチェーン",
			"９６リンク", "Fコンベアディスクプーリー", "モーター減速機", "ＬＨＹＭ３－４Ｃ１６５－ＡＰＹ３－Ｂ－１７９", "プッシャーシリンダー", "ブッシュ・シールキット",
			"油圧シリンダ取付ピン類", "プッシャーライナー①", "プッシャーライナー②", "クーリングフィンガー", "ギヤドモーター", "電磁弁",
			"フェロシリコン", "マグネタイト", "中田屋家電ミックス", "ASR", "SR", "家電ミックス",
			"脱水機濾布", "タフデッキ1135×1045", "水選フィーダースクリーン", "タフデッキ1135×1025", "タフデッキ1135×1530", "ドラムローラー",
			"フロントライナー", "ケーシングライナー", "出窓スクリーン", "FRPドラム750HI", "第一重液ポンプモーター22kw", "トロンメルローラー", "10K125ボールバルブ",
			"10K100ボールバルブ", "出窓スクリーン", "ギヤドモーター", "ART網　荒目", "ART網　細目", "セラミック板",
			"WマグネットFRP", "モーター", "ドラムライナ投入口磨耗防止板", "ドラムライナ磨耗防止板", "インペラ投入口磨耗防止板", "インペラ磨耗防止板",
			"リム1フロントライナ", "ベアリング23134ｋ", "リム2ドラムライナブラケット", "円形篩網1500φ5", "電磁弁1200", "8ｍｍスクリーン", "スイーパーサイドブラシ",
			"刃物", "二次平型ライナ", "樹脂ベルト", "日工モータープーリー", "ＫＹＣモータープーリー", "ＫＹＣモーターＫＭＶＳ３５用", "三菱ギヤードモーター",
			"スーパーモジュラースリム", "回転刃", "固定刃", "ジャンピング格子", "ジャンピングマット", "ジャンピングマット", "スタースクリーン用チェーン",
			"フラットプレート", "メタルセンサー電磁弁", "ＦＲＰドラム", "モータープーリー", "モータープーリー", "テールローラー",
			"リテーナ", "ボンノックM220", "ボンノックM６８０", "内ノズル", "内ノズル", "ボスキャップオス",
			"ボスキャップメス", "WP300スクリュー", "バレルライナ", "ダイスプレートライナ", "ＮＴＮベアリング", "ＮＴＮベアリング",
			"歯車一式", "ブリッジスクリュー用モーター", "ダイスプレート", "オイルシール", "住友バディーボックス", "解破機カッター",
			"ラバースクリーン", "バケットコンベアベルト", "固定刃", "ホッパーインバーター", "バケットコンベアベルト（N-12）", "ブレーカーライナーボルトL", "ブレーカーライナーボルトS",
			"ブレーカーライナー", "スイーパーライナー", "スイーパーライナーボルト", "ローター本体", "グラインダー/ピン", "チョークリング/ガイド",
			"FRPドラム", "モータープーリー", "ディスチャージリング", "ディスチャージリングライナー", "下部投入フードライナー", "アイダル排出ライナー",
			"スクラバ、歩廊等、ファン", "破砕機（FECより）", "ホッパー、レジューサー", "ヒンジベルト"
		];


		Stock.setPlaceNames(place_names);
		Stock.setAssetsNames(stock_assets_names);
		Stock.setUnitNames(stock_unit_names);
		Stock.setStockNames(stock_names);
		Stock.setNamesNextProcess(stock_names_next_process);

		setTimeout(function () {
			_core.arrowOfUpDown("arrow1", _core.under_tenkey);
		}, 100);
	}
};


window.onload = _core.init;
