/**
 * @fileoverview
 * Provides the JavaScript interactions for all pages.
 *
 * @author 
 * Ryan Brown
 */

/** namespace. */
var app = app || {};

app.FB_COLLECTION_COLOR_DATA = "ColorData";
app.FB_KEY_DATA = "data";

app.WEIGHTS = [-0.34017167361478273, -0.01362591782520721, -0.5328038568339214, 1.1326186404511025];

app.pageController = null;
app.pageManager = null;

function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

function sigmoid(x) {
	return 1/(1+Math.exp(-x));
}

app.PageController = class {
	constructor() {
		this.lightText = document.querySelector("#lightText");
		this.darkText = document.querySelector("#darkText");

		this.colorContainer = document.querySelector("#colorContainer");

		this.prediction = document.querySelector("#prediction");

		this.lightText.addEventListener("click", (event) => {
			this.onColorSelection(true);
		});
		
		this.darkText.addEventListener("click", (event) => {
			this.onColorSelection(false);
		})

		app.pageManager.beginListening(this.updateColor.bind(this));
		
	}

	onColorSelection(isLight) {
		if (isLight) {
			this.color.light = 1;
		} else {
			this.color.light = 0;
		}
		app.pageManager.add(this.color);
	}

	predict(r, g, b) {
		let z = app.WEIGHTS[0] * r + app.WEIGHTS[1] * g + app.WEIGHTS[2] * b + app.WEIGHTS[3];
		return sigmoid(z);
	}

	updateColor() {
		console.log("Color Update");
		var r = Math.random() * 255;
		var g = Math.random() * 255;
		var b = Math.random() * 255;
		
		this.prediction.innerHTML = this.predict(r/255, g/255, b/255);
		this.color = new app.DataEntry(r/255, g/255, b/255, null);
		this.colorContainer.style.backgroundColor = "rgb(" + r + ", " + g + ", " + b + ")";
		
		// this.colorContainer.style.backgroundColor = this.color.toRGB;
	}
}

app.DataEntry = class {
	constructor(r, g, b, light) { // 0: dark | 1: light
		this.r = r;
		this.g = g;
		this.b = b;
		this.light = light;
	}

	toString() {
		return "[" + this.r + ", " + this.g + ", " + this.b + ", " + this.light + "]";
	}
}

app.PageManager = class {
	constructor() {
		this._documentSnapshots = [];
		this._ref = firebase.firestore().collection(app.FB_COLLECTION_COLOR_DATA);
	}

	add(dataEntry) {
		this._ref.add({
			[app.FB_KEY_DATA]: dataEntry.toString()
		})
		.then((docRef) => {
			console.log("Reading for color: ", dataEntry.toString());
		})
		.catch((error) => {
			console.log("Error adding document: ", error);
		});
	}

	beginListening(changeListener) {
		this._unsubscribe = this._ref.onSnapshot((querySnapshot) => {
			console.log("Update");
			this._documentSnapshots = querySnapshot.docs;
			changeListener();
		});
	}
	stopListening() {
		this._unsubscribe();
	}

	getDataString() {
		let returnString = "[";
		for (let i = 0; i < this._documentSnapshots.length; i++) {
			if (i != 0) {
				returnString += ", ";
			}
			returnString += this._documentSnapshots[i].get(app.FB_KEY_DATA);
		}
		returnString += "]"
		return returnString;
	}
}

/* Main */
/** function and class syntax examples */
app.main = function () {
	app.pageManager = new app.PageManager();
	app.pageController = new app.PageController();
	
	console.log("Ready");
};

app.main();
