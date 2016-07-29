/*
 *  Licensed Materials - Property of IBM
 *  5725-I43 (C) Copyright IBM Corp. 2011, 2013. All Rights Reserved.
 *  US Government Users Restricted Rights - Use, duplication or
 *  disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

/**
 *  WL.Server.invokeHttp(parameters) accepts the following json object as an argument:
 *  
 *  {
 *  	// Mandatory 
 *  	method : 'get' , 'post', 'delete' , 'put' or 'head' 
 *  	path: value,
 *
 *  	// Optional
 *  	returnedContentType: any known mime-type or one of "json", "css", "csv", "plain", "xml", "html"
 *  	returnedContentEncoding : 'encoding',
 *  	parameters: {name1: value1, ... },
 *  	headers: {name1: value1, ... },
 *  	cookies: {name1: value1, ... },
 *  	body: {
 *  		contentType: 'text/xml; charset=utf-8' or similar value,
 *  		content: stringValue
 *  	},
 *  	transformation: {
 *  		type: 'default', or 'xslFile',
 *  		xslFile: fileName
 *  	}
 *  }
 */

/**
 * @param tag
 *            must be either MobileFirst_Platform or MobileFirst_Playground
 * @returns json list of items
 */
function checkUser(phone) {
	var input = {
		method : 'get',
		returnedContentType : 'json',
		path : 'OllyRESTJerseyExample/olly/user/' + phone
	};

	return WL.Server.invokeHttp(input);
}

function verifyMPIN(phone, mpin, attr1, attr2) {
	var input = {
		method : 'get',
		returnedContentType : 'json',
		path : 'OllyRESTJerseyExample/olly/user/' + phone + '/' + mpin
	};
	if (attr1 != '')
		input.path += '/' + attr1;
	if (attr2 != '')
		input.path += '/' + attr2;
	return WL.Server.invokeHttp(input);
}

function checkFedNetId(phone, fednetId) {
	var input = {
		method : 'get',
		returnedContentType : 'json',
		path : 'olly/olly/user/fednet/' + phone + '/'
				+ fednetId
	};

	return WL.Server.invokeHttp(input);
}

function addCard(phone, card) {
	var input = {
		method : 'get',
		returnedContentType : 'json',
		path : 'OllyRESTJerseyExample/olly/user/card/' + phone + '/' + card
	};

	return WL.Server.invokeHttp(input);
}

function toggleSwitch(phone, switchName, switchState) {
	if (switchState)
		switchState = 1;
	else
		switchState = 0;
	var input = {
		method : 'put',
		returnedContentType : 'json',
		path : 'OllyRESTJerseyExample/olly/user/switch/' + phone + '/'
				+ switchName + '/' + switchState
	};

	return WL.Server.invokeHttp(input);
}

function saveTimerSettings(phone, startTime, endTime) {
	var input = {
		method : 'put',
		returnedContentType : 'json',
		path : 'OllyRESTJerseyExample/olly/user/timer/' + phone + '/'
				+ encodeURI(startTime) + '/' + 
				encodeURI(endTime)
	};

	return WL.Server.invokeHttp(input);
}