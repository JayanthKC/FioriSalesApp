/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"com/kcc/ZFIORD_SALES/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});