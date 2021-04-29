/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"com/kcc/ZFIORD_SALES/test/integration/AllJourneys"
	], function () {
		QUnit.start();
	});
});