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

/**
 * オブジェクトのベースとなるクラス
 */

class ShapeObject {
	constructor(x, y) {
		this.x = x;
		this.y = y;

		this.getX = () => this.x;
		this.getY = () => this.y;

		this.lineWidth = 1;
		this.getLineWidth = () => this.lineWidth;
		this.setLineWidth = (lineWidth) => this.lineWidth = lineWidth;

		this.mousedownFunction = null;
		this.setMousedownFunction = (mousedownFunction) => this.mousedownFunction = mousedownFunction;
		this.getMousedownFunction = () => this.mousedownFunction;
	}

	// 初期表示
	draw(ctx) {}
	// 自オブジェクトがクリックされたかどうか判定
	hitJudgment(point) {}
	// クリックされたときの処理
	clicked(ctx) {}
}

/**
 * 矩形オブジェクトのクラス
 */

class Box extends ShapeObject {
	constructor(x, y, w, h) {
		super(x, y);
		this.w = w;
		this.h = h;
	}

	draw(ctx) {
		ctx.save();
		ctx.fillStyle = "black";
		ctx.fillRect(this.x, this.y, this.w, this.h);
		ctx.restore();
	}

	clicked(ctx) {
		ctx.save();
		ctx.clearRect(this.x, this.y, this.w, this.h);
		ctx.fillStyle = "red";
		ctx.fillRect(this.x, this.y, this.w, this.h);
		ctx.restore();
	}

	hitJudgment(point) {
		return (this.x <= point.x && point.x <= this.x + this.w) &&
			(this.y <= point.y && point.y <= this.y + this.h);
	}
}

/**
 * 三角形オブジェクトのクラス
 */

class UpTriangle extends ShapeObject {
	constructor(x, y, w, h) {
		super(x, y);

		this.w = w;
		this.h = h;
		this.getW = () => this.w;
		this.getH = () => this.h;

		this.strokeStyle = "rgb(0,0,0)";
		this.getStrokeStyle = () => this.strokeStyle;

		//this.fillStyle="rgba(0,0,0,0.1)";
		this.fillStyle = "#EEE";
		this.getFillStyle = () => this.fillStyle;

		this.mousedownStrokeStyle = "#AAA";
		this.getMousedownStrokeStyle = () => this.mousedownStrokeStyle;

		this.mousedownFillStyle = "#78E";
		this.getMousedownFillStyle = () => this.mousedownFillStyle;

		return;
	}

	draw(ctx) {

		let x = this.getX();
		let y = this.getY();
		let w = this.getW();
		let h = this.getH();

		ctx.save();

		ctx.lineWidth = this.getLineWidth();
		ctx.beginPath();
		ctx.moveTo(x, y + h); //最初の点の場所
		ctx.lineTo(x + w / 2, y); //2番目の点の場所
		ctx.lineTo(x + w, y + h); //3番目の点の場所
		ctx.closePath(); //三角形の最後の線 closeさせる

		ctx.strokeStyle = this.getStrokeStyle(); //枠線の色
		ctx.stroke();

		ctx.fillStyle = this.getFillStyle(); //塗りつぶしの色
		ctx.fill();

		ctx.restore();
	}

	mousedown(ctx, e) {

		let x = this.getX();
		let y = this.getY();
		let w = this.getW();
		let h = this.getH();

		ctx.save();

		ctx.lineWidth = this.getLineWidth();
		ctx.beginPath();
		ctx.moveTo(x, y + h); //最初の点の場所
		ctx.lineTo(x + w / 2, y); //2番目の点の場所
		ctx.lineTo(x + w, y + h); //3番目の点の場所
		ctx.closePath(); //三角形の最後の線 closeさせる

		ctx.strokeStyle = this.getMousedownStrokeStyle(); //枠線の色
		ctx.stroke();

		ctx.fillStyle = this.getMousedownFillStyle(); //塗りつぶしの色
		ctx.fill();

		ctx.restore();

		if (this.mousedownFunction != null) {
			this.mousedownFunction(e);
		}
	}

	hitJudgment(point) {
		return (this.x <= point.x && point.x <= this.x + this.w) &&
			(this.y <= point.y && point.y <= this.y + this.h);
	}
}

/**
 * 三角形オブジェクトのクラス
 */

class DownTriangle extends ShapeObject {
	constructor(x, y, w, h) {
		super(x, y);

		this.w = w;
		this.h = h;
		this.getW = () => this.w;
		this.getH = () => this.h;

		this.strokeStyle = "rgb(0,0,0)";
		this.getStrokeStyle = () => this.strokeStyle;

		//this.fillStyle="rgba(0,0,0,0.1)";
		this.fillStyle = "#EEE";
		this.getFillStyle = () => this.fillStyle;

		this.mousedownStrokeStyle = "#AAA";
		this.getMousedownStrokeStyle = () => this.mousedownStrokeStyle;

		this.mousedownFillStyle = "#78E";
		this.getMousedownFillStyle = () => this.mousedownFillStyle;

		return;
	}

	draw(ctx) {

		let x = this.getX();
		let y = this.getY();
		let w = this.getW();
		let h = this.getH();

		ctx.save();

		ctx.lineWidth = this.getLineWidth();
		ctx.beginPath();
		ctx.moveTo(x, y); //最初の点の場所
		ctx.lineTo(x + w / 2, y + h); //2番目の点の場所
		ctx.lineTo(x + w, y); //3番目の点の場所
		ctx.closePath(); //三角形の最後の線 closeさせる

		ctx.strokeStyle = this.getStrokeStyle(); //枠線の色
		ctx.stroke();

		ctx.fillStyle = this.getFillStyle(); //塗りつぶしの色
		ctx.fill();

		ctx.restore();
	}

	mousedown(ctx, e) {

		let x = this.getX();
		let y = this.getY();
		let w = this.getW();
		let h = this.getH();

		ctx.save();

		ctx.lineWidth = this.getLineWidth();
		ctx.beginPath();
		ctx.moveTo(x, y); //最初の点の場所
		ctx.lineTo(x + w / 2, y + h); //2番目の点の場所
		ctx.lineTo(x + w, y); //3番目の点の場所
		ctx.closePath(); //三角形の最後の線 closeさせる

		ctx.strokeStyle = this.getMousedownStrokeStyle(); //枠線の色
		ctx.stroke();

		ctx.fillStyle = this.getMousedownFillStyle(); //塗りつぶしの色
		ctx.fill();

		ctx.restore();

		if (this.mousedownFunction != null) {
			this.mousedownFunction(e);
		}
	}

	hitJudgment(point) {
		return (this.x <= point.x && point.x <= this.x + this.w) &&
			(this.y <= point.y && point.y <= this.y + this.h);
	}
}

/**
 * 円オブジェクトのクラス
 */

class Circle extends ShapeObject {
	constructor(x, y, r) {
		super(x, y);
		this.r = r;
	}

	draw(ctx) {
		ctx.save();

		ctx.beginPath();
		ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, true);
		ctx.fillStyle = "black";
		ctx.fill();

		ctx.restore();
	}

	clicked(ctx) {
		ctx.save();

		ctx.beginPath();
		ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, true);
		ctx.fillStyle = "red";
		ctx.fill();

		ctx.restore();
	}

	hitJudgment(point) {
		return (
			Math.pow(this.x - point.x, 2) + Math.pow(this.y - point.y, 2) <=
			Math.pow(this.r, 2)
		);
	}
}

/**
 * arrow　処理
 */

_core.arrowOfUpDown = (arrow, tenkey) => {

	let xpos = 1;
	let ypos = 1;
	let height = 27;
	let width = 36;
	let between = 50;

	const canvas = document.createElement("canvas");
	document.getElementById(arrow).appendChild(canvas);


	canvas.width = width + between + xpos * 2;
	canvas.height = height + 2;

	const ctx = canvas.getContext("2d");
	ctx.save();
	ctx.fillStyle = "transparent";
	//ctx.fillStyle = "#777";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.restore();

	const items = [];
	let item = null;

	const Uptriangle = new UpTriangle(xpos, ypos, width, height);
	items.push(Uptriangle);
	Uptriangle.setMousedownFunction(tenkey.up_arrow);
	Uptriangle.setLineWidth(1);

	const Downtriangle = new DownTriangle(xpos + between, ypos, width, height);
	Downtriangle.setLineWidth(1);
	Downtriangle.setMousedownFunction(tenkey.down_arrow);
	items.push(Downtriangle);


	// オブジェクトを描画する
	items.forEach(item => item.draw(ctx));

	/*
		canvas.addEventListener("click", e => {
			// マウスの座標をCanvas内の座標とあわせるため
		const rect = canvas.getBoundingClientRect();
		const point = {
			x: e.clientX - rect.left,
			y: e.clientY - rect.top
		};

		items.forEach(item => {
			if (item.hitJudgment(point)) {
				item.clicked(ctx);
			}
		});
		});
	*/

	if (_core.browser != 'safari') {

		canvas.addEventListener("mousedown", e => {
			// マウスの座標をCanvas内の座標とあわせるため
			const rect = canvas.getBoundingClientRect();
			const point = {
				x: e.clientX - rect.left,
				y: e.clientY - rect.top
			};

			items.forEach(item => {
				if (item.hitJudgment(point)) {
					item.mousedown(ctx, e);
				}
			});
		});

		canvas.addEventListener("mouseup", e => {

			// マウスの座標をCanvas内の座標とあわせるため
			const rect = canvas.getBoundingClientRect();
			const point = {
				x: e.clientX - rect.left,
				y: e.clientY - rect.top
			};

			items.forEach(item => {
				if (item.hitJudgment(point)) {
					item.draw(ctx, e);
				}
			});
		});

	} else {

		canvas.addEventListener("touchstart", e => {
			// マウスの座標をCanvas内の座標とあわせるため
			const rect = canvas.getBoundingClientRect();
			const touch = event.touches[0];
			const point = {
				x: touch.clientX - rect.left,
				y: touch.clientY - rect.top
			};

			items.forEach(item => {
				if (item.hitJudgment(point)) {
					item.mousedown(ctx, e);
					this.item = item;
				}
			});
		});

		canvas.addEventListener("touchend", e => {
			// マウスの座標をCanvas内の座標とあわせるため
			setTimeout(function (canvas, e) {
				this.item.draw(ctx, e);
				this.item = null;
			}.bind(this, canvas, e), 100);
		});

	}

};
