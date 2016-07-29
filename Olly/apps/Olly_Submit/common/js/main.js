function wlCommonInit() {
	/*
	 * Use of WL.Client.connect() API before any connectivity to a MobileFirst
	 * Server is required. This API should be called only once, before any other
	 * WL.Client methods that communicate with the MobileFirst Server. Don't
	 * forget to specify and implement onSuccess and onFailure callback
	 * functions for WL.Client.connect(), e.g:
	 * 
	 * WL.Client.connect({ onSuccess: onConnectSuccess, onFailure:
	 * onConnectFailure });
	 * 
	 */

	// Common initialization code goes here
	/**
	 * Created by shubhang on 09/06/16.
	 */

	var collectionName = 'user';
	var user = {};
	// Object that defines all the collections.
	var collections = {
		// Object that defines the 'people' collection.
		user : {
			'phone' : 'string'
		}
	};
	WL.JSONStore
			.init(collections)
			.then(
					function() {
						WL.JSONStore
								.get(collectionName)
								.count()
								.then(
										function(countResult) {
											if (countResult != 0) {
												WL.JSONStore
														.get(collectionName)
														.findAll()
														.then(
																function(
																		findResults) {
																	$(
																			"#login_content")
																			.removeClass(
																					'hide');
																	user.phone = findResults[0].json.phone;
																});
											} else {
												$.mobile.changePage("#pageone");
												$.mobile.firstPage.remove();
											}
										});
					}).fail(function(errObj) {
				WL.Logger.ctx({
					pretty : true
				}).debug(errObj);
			});

	$.mobile.pushStateEnabled = false;
	user.isFedNetEnabled = false;
	user.isFedMobileEnabled = false;
	user.isAtmEnabled = false;
	user.isOllyEnabled = true;
	user.isFedNetActivated = false;
	user.isFedMobileActivated = false;
	user.isAtmActivated = false;
	user.isTimerEnabled = false;
	user.startTime = '';
	user.endTime = '';

	var currentPage = '';
	var onBoarding = true;
	var editCard = 999;

	var timeinterval;
	var serverError = "Something went wrong. Please try again";

	$("#submit_phone").click(submitForm);
	$("#existing_user").click(goToLogin);
	$(".submit_mpin").click(submitMpin);
	$("#activate").click(goToChannelOnboarding);
	$(".go_home").click(goToHome);
	$("#change_phone").click(changePhone);
	$("#myonoffswitch").click(mainSwitchToggle);
	$("#channel_settings").click(goToChannelPage);
	$("#netbanking_small").change(toggleNetbankingSwitch);
	$("#mobile_banking_small").change(toggleMobiletbankingSwitch);
	$("#atm_small").change(toggleAtmbankingSwitch);
	$("#save_channel").click(goToHome);
	$("#timer_div").click(goToTimerSettings);
	$("#save_timer").click(saveTimerSettings);
	$("#submit_fednet_id").click(submitFedNet);
	$("#save_limit_fednet").click(saveLimitFedNet);
	$("#save_limit_atm").click(saveLimitAtm);
	$('#set_limit_fednet').click(setLimitFedNet);
	$('#change_limit_fednet').click(goBack);
	$("#confirm_limit_fednet").click(confirmLimitFedNet);
	$(".cancel").click(goBack);
	$("#skip_limit_fednet").click(confirmLimitFedNet);
	$("#skip_limit_atm").click(confirmLimitAtm);
	$("#set_limit_atm").click(setLimitAtm);
	$("#submit_card_number").click(submitCardNumber);
	// $('#set_limit_fedMobile').click(setLimitFedMobile);
	$("#remove_card").click(removeCard);
	$("#confirm_limit_atm").click(confirmLimitAtm);
	$("#submit_atm_mpin").click(submitAtmMpin);
	$("#skip_fednet").click(function(event) {
		event.preventDefault();
		currentPage = 'fedmobile';
		checkPage();
		if (onBoarding)
			$.mobile.changePage("#atm_pageone");
		else
			$.mobile.changePage("#fednet_pagetwo");
	});
	$("#skip_atm").click(function(event) {
		event.preventDefault();
		$.mobile.changePage("#homepage");
	});
	$("#continue_timer_popup").click(function(e) {
		e.preventDefault();
		$.mobile.changePage('#homepage', {
			reverse : false,
			changeHash : false
		});
	});
	$('#confirm_switch_off')
			.click(
					function(e) {
						makeApiCall(
								"/adapters/OllyUserAdapter/toggleSwitch",
								function(result) {
									if (result.responseJSON.map != null
											&& result.responseJSON.map.msg == 'successfully updated') {
										user.isFedNetEnabled = false;
										user.isFedMobileEnabled = false;
										user.isAtmEnabled = false;
										user.isOllyEnabled = false;
										goToHome(e);
									}
								}, function() {
								}, [ user.phone, 'ollyStatus', false ]);
					});
	$('#cancel_switch_off').click(function(e) {
		channelPageRefresh();
		$('#sure').popup('close');
	});

	$(document).on('click', '#add_card', function(event) {
		addCards(event);
	});

	$("#phone").focus(function() {
		$('#span_phone').addClass('span_tel_focus');
	});

	$(".blue_border").focusout(function() {
		$(this).addClass('blue_border');
	});

	function goToChannelOnboarding(event) {
		event.preventDefault();
		onBoarding = true;
		currentPage = 'fednet';
		checkPage();
		$.mobile.changePage("#fednet_pageone");
	}
	function addCards(event) {
		event.preventDefault();
		$("#card_number").val('');
		$.mobile.changePage("#atm_pageone");
	}
	function goBack(event) {
		event.preventDefault();
		if ((1 < history.length) && document.referrer) {
			WL.App.close();
		} else
			history.back();
	}
	function checkPage() {
		if (currentPage.indexOf('fednet') > -1) {
			$(".header_image").attr("src", "images/ic_steppers_1.png");
			$(".header_text").html("Let Olly access your FedNet <br> banking");
			$("#transaction_text").text(
					"Transactions through FedNet limited to");
			$("#limit_text")
					.html(
							"Do you want to set a amount limit for your <br> FedNet transactions?");
		} else if (currentPage.indexOf('fedmobile') > -1) {
			$(".header_image").attr("src", "images/ic_steppers_2.png");
			$(".header_text").html(
					"Let Olly access your FedMobile <br> banking");
			$("#transaction_text").text(
					"Transactions through FedMobile limited to");
			$("#limit_text")
					.html(
							"Do you want to set a amount limit for your <br> FedMobile transactions?");

		}
	}
	function removeCard(event) {
		event.preventDefault();
		$('#card_number').val('');
		user.cardsArray.splice(user.cardsArray.lenght - 1, 1);
		$.mobile.changePage('#atm_pageone', {
			reverse : false,
			changeHash : false
		});
	}
	function confirmLimitFedNet(event) {
		event.preventDefault();
		checkPage();
		$.mobile.changePage("#fednet_pagethree");
	}
	function confirmLimitAtm(event) {
		event.preventDefault();
		$.mobile.changePage("#atm_pagethree");
	}
	function saveLimitFedNet(event) {
		event.preventDefault();
		var amount = $("#fednet_limit_amount").val();
		if (amount == null || amount == "") {
			$("#err_fednet_limit").text("Please enter a limit");
			$("#err_fednet_limit").removeClass("hide");
			return false;
		}
		$("#selected_limit_fednet").text("₹ " + amount);
		checkPage();
		$.mobile.changePage("#confirm_limit_fednet_page");
	}

	function saveLimitAtm(event) {
		event.preventDefault();
		var amount = $("#atm_limit_amount").val();
		if (amount == null || amount == "") {
			$("#err_atm_limit").text("Please enter a limit");
			$("#err_atm_limit").removeClass("hide");
			return false;
		}
		$("#transaction_text_atm").text(
				"Transactions through ATM Card **** "
						+ user.cardsArray[user.cardsArray.length - 1]
						+ " limited to");
		$.mobile.changePage("#confirm_limit_atm_page");
	}

	function setLimitAtm(event) {
		event.preventDefault();
		$("#card_number_display").text(
				"Card **** " + user.cardsArray[user.cardsArray.length - 1]);
		$.mobile.changePage("#limit_atm_page");
	}

	function setLimitFedNet(event) {
		event.preventDefault();
		$.mobile.changePage("#limit_fednet_page");
	}
	function setLimitFedMobile(event) {
		event.preventDefault();
		$.mobile.changePage("#limit_fedmobile_page");
	}
	function saveTimerSettings(event) {
		event.preventDefault();
		if ($('#end_time').val() == null || $('#end_time').val() == ''
				|| $('#start_time').val() == null
				|| $('#start_time').val() == '') {
			$('#popup_header').text("Settings incomplete!");
			$("#popup_text").text("Timer setting will not be saved. Continue?");
			$("#confirm_timer_popup").removeClass('hide');
			$("#cancel_timer_popup").text('cancel');
			$("#confirm_incomplete").popup('open');
		} else {
			user.startTime = moment($("#start_time").val(), "hh:mm A").toDate();
			user.endTime = moment($("#end_time").val(), "hh:mm A").toDate();
			var t = getTimeRemaining(user.endTime, user.startTime);
			if (t.total <= 0) {
				user.endTime = moment(user.endTime).add(1, 'd');
			}
			makeApiCall(
					"/adapters/OllyUserAdapter/saveTimerSettings",
					function(result) {
						if (result.responseJSON.map != null
								&& result.responseJSON.map.msg == 'successfully updated') {
							user.isTimerEnabled = true;
						}
					},
					function() {
						$('#popup_header').text("Error");
						$("#popup_text").text(
								"Something went wrong! Please try again");
						$("#confirm_timer_popup").addClass('hide');
						$("#cancel_timer_popup").text('Okay');
						$("#confirm_incomplete").popup('open');
					},
					[
							user.phone,
							moment(user.startTime)
									.format("YYYY-MM-DD HH:mm:ss"),
							moment(user.endTime).format("YYYY-MM-DD HH:mm:ss") ]);

			$.mobile.changePage('#homepage', {
				reverse : false,
				changeHash : false
			});
		}
	}

	function goToTimerSettings(event) {
		event.preventDefault();
		var target = $(event.target);
		if (target.is('input:checkbox') || target.is('label')) {
			if (user.startTime != null && user.endTime != null
					&& user.startTime != '' && user.endTime != '') {
				user.isTimerEnabled = !user.isTimerEnabled;
				makeApiCall(
						"/adapters/OllyUserAdapter/toggleSwitch",
						function(result) {
							if (result.responseJSON.map != null
									&& result.responseJSON.map.msg == 'successfully updated') {
							}

						}, function() {

						}, [ user.phone, 'timerStatus', user.isTimerEnabled ]);

				checkTimerState();
				return;
			}
		}
		$.mobile.changePage("#timer_settings");
	}

	function areYouSure() {
		$("#sure").popup('open');
	}

	function toggleNetbankingSwitch() {
		if (user.isFedNetActivated) {
			if (user.isFedNetEnabled)
				if (!user.isFedMobileEnabled && !user.isAtmEnabled)
					areYouSure();
			user.isFedNetEnabled = !user.isFedNetEnabled;
			makeApiCall(
					"/adapters/OllyUserAdapter/toggleSwitch",
					function(result) {
						if (result.responseJSON.map != null
								&& result.responseJSON.map.msg == 'successfully updated') {
							if ($("#netbanking_small").is(':checked')) {
								$('#ic_netbanking_image').css(
										'background-image',
										'url(images/ic_netbanking_on.png)');
							} else {
								$('#ic_netbanking_image')
										.css('background-image',
												'url(images/ic_netbanking_off_blue4.png)');
							}
							$("#netbanking_div").toggleClass('disabled_grey');
							return;
						}

					}, function() {

					}, [ user.phone, 'fedNetStatus', user.isFedNetEnabled ]);

		} else {
			currentPage = 'fednet';
			checkPage();
			$.mobile.changePage("#fednet_pageone");
			$("#skip_fednet").addClass('hide');
		}
	}

	function toggleMobiletbankingSwitch() {
		if (user.isFedMobileActivated) {
			if (user.isFedMobileEnabled)
				if (!user.isFedNetEnabled && !user.isAtmEnabled) {
					areYouSure();
					return;
				}
			user.isFedMobileEnabled = !user.isFedMobileEnabled;
			makeApiCall(
					"/adapters/OllyUserAdapter/toggleSwitch",
					function(result) {
						if (result.responseJSON.map != null
								&& result.responseJSON.map.msg == 'successfully updated') {
							if ($("#mobile_banking_small").is(':checked'))
								$('#ic_mobilebanking_image').css(
										'background-image',
										'url(images/ic_mobilebanking_on.png)');
							else {
								$('#ic_mobilebanking_image')
										.css('background-image',
												'url(images/ic_mobilebanking_off_blue4.png)');
							}
							$("#mobilebanking_div")
									.toggleClass('disabled_grey');
						}
					}, function() {

					},
					[ user.phone, 'fedMobileStatus', user.isFedMobileEnabled ]);

		} else {
			currentPage = 'fedmobile';
			checkPage();
			$.mobile.changePage("#fednet_pagetwo");
		}
	}

	function toggleAtmbankingSwitch() {
		if (user.isAtmActivated) {
			if (user.isAtmEnabled)
				if (!user.isFedNetEnabled && !user.isFedMobileEnabled) {
					areYouSure();
					return;
				}
			user.isAtmEnabled = !user.isAtmEnabled;
			makeApiCall(
					"/adapters/OllyUserAdapter/toggleSwitch",
					function(result) {
						if (result.responseJSON.map != null
								&& result.responseJSON.map.msg == 'successfully updated') {
							if ($("#atm_small").is(':checked'))
								$('#ic_atm_image').css('background-image',
										'url(images/ic_card_on.png)');
							else {
								$('#ic_atm_image').css('background-image',
										'url(images/ic_card_off_blue4.png)');
							}
							$("#atm_div").toggleClass('disabled_grey');
						}
					}, function() {

					}, [ user.phone, 'atmStatus', user.isAtmEnabled ]);
		} else {
			$.mobile.changePage("#atm_pageone");
			$("#skip_atm").addClass('hide');
		}
	}

	function goToChannelPage() {
		$.mobile.changePage("#channel_page");
	}

	function showInactiveMessage() {
		$("#account_status").text("Account is switched off");
		// $('#account_status:contains(' + 'switched off' + ')', document.body)
		// .each(
		// function() {
		// $(this).html(
		// $(this).html().replace(
		// new RegExp('switched off', 'g'),
		// '<span class=link_yellow>'
		// + 'switched off'
		// + '</span>'));
		// });
	}

	function showPartiallyActiveMessage() {
		$("#account_status").text("Account is partially switched on");
		$('#account_status:contains(' + 'partially' + ')', document.body).each(
				function() {
					$(this).html(
							$(this).html().replace(
									new RegExp('partially', 'g'),
									'<span class=link_yellow>' + 'partially'
											+ '</span>'));
				});
	}

	function mainSwitchToggle() {
		user.isOllyEnabled = !user.isOllyEnabled;
		makeApiCall("/adapters/OllyUserAdapter/toggleSwitch", function(result) {
			if (result.responseJSON.map != null
					&& result.responseJSON.map.msg == 'successfully updated') {
				if (user.isOllyEnabled == true) {
					if (user.isFedNetActivated == true)
						user.isFedNetEnabled = true;
					if (user.isFedMobileActivated == true)
						user.isFedMobileEnabled = true;
					if (user.isAtmActivated == true)
						user.isAtmEnabled = true;
				}
				$("#footer_homepage").toggleClass('hide');
				// if ($("#footer_homepage").hasClass("hide")) {
				// showInactiveMessage();
				// } else {
				// showPartiallyActiveMessage();
				// }
				checkChannelStates();
			}
		}, function() {
		}, [ user.phone, 'ollyStatus', user.isOllyEnabled ]);
	}
	function changePhone() {
		$.mobile.changePage("#pageone");
	}

	$("#phone").focus(function() {
		$("#err_phone").addClass("hide");
		$("#span_phone").removeClass("span_tel_err");
	});

	$("#mpin").focus(function() {
		$("#err_mpin").addClass("hide");
		$("#mpin").removeClass("input_text_err");
	});

	$("#fednet_id").focus(function() {
		$("#err_fednet_id").addClass("hide");
		$("#fednet_id").removeClass("input_text_err");
	});

	$("#mpin_fednet").focus(function() {
		$("#err_mpin_fednet").addClass("hide");
		$("#mpin_fednet").removeClass("input_text_err");
	});

	$("#fednet_limit_amount").focus(function() {
		$("#err_fednet_limit").addClass("hide");
	});
	$("#card_number").focus(function() {
		$("#card_number").removeClass("input_text_err");
		$("#err_atm_id").addClass("hide");
	});
	$("#atm_mpin").focus(function() {
		$("#atm_mpin").removeClass("input_text_err");
		$("#err_atm_mpin").addClass("hide");
	});
	function submitForm(event) {
		event.preventDefault();
		user.phone = document.forms["onboarding1"]["phone"].value;
		if (user.phone == null || user.phone == "") {
			showErrorPhone("Please enter a phone number");
			return false;
		}
		var re = new RegExp(
				"^(?:(?:\\+|0{0,2})91(\\s*[\\-]\\s*)?|[0]?)?[789]\\d{9}$");
		if (re.test(user.phone)) {
			makeApiCall("/adapters/OllyUserAdapter/checkUser", successUserInfo,
					errorUserInfo, [ user.phone ]);
		} else {
			showErrorPhone("Please enter a valid phone number");
			return false;
		}
	}

	function successUserInfo(result) {
		if (result.responseJSON != null && result.responseJSON.phone != '') {
			$.mobile.changePage("#pagetwo");
			var text = user.phone
					.replace(/(\d{3})(\d{3})(\d{4})/, "$1\t$2\t$3");
			$("#entered_phone").text('+ 91 ' + text);
			return false;
		}
		showErrorPhone("User not found");
	}
	function errorUserInfo(result) {
		$("#err_phone").text();
		showErrorPhone(serverError);
	}
	function showErrorPhone(t) {
		$("#err_phone").text(t);
		$("#err_phone").removeClass("hide");
		$("#span_phone").addClass("span_tel_err");
	}
	function showErrorMpin(t) {
		$("#err_mpin").text(t);
		$("#err_mpin").removeClass("hide");
		$("#mpin").addClass("input_text_err");
	}
	function showErrorFedNet(t) {
		$("#err_fednet_id").text(t);
		$("#err_fednet_id").removeClass("hide");
		$("#fednet_id").addClass("input_text_err");
	}
	function showErrorFedNetMpin(t) {
		$("#err_mpin_fednet").text(t);
		$("#err_mpin_fednet").removeClass("hide");
		$("#mpin_fednet").addClass("input_text_err");
	}
	function showErrorCard(t) {
		$("#err_atm_id").text(t);
		$("#err_atm_id").removeClass("hide");
		$("#card_number").addClass("input_text_err");
	}
	function showErrorCardMpin(t) {
		$("#err_atm_mpin").text(t);
		$("#err_atm_mpin").removeClass("hide");
		$("#atm_mpin").addClass("input_text_err");
	}
	function submitAtmMpin(event) {
		event.preventDefault();
		user.mpin = $("#atm_mpin").val();
		if (user.mpin == null || user.mpin == "") {
			showErrorCardMpin("Please enter a PIN");
			return false;
		} else if (user.mpin.length != 4 && user.mpin.length != 6) {
			showErrorCardMpin("Invalid PIN format");
			return false;
		}
		makeApiCall("/adapters/OllyUserAdapter/verifyMPIN", successAtmMpin,
				errorMpin,
				[ user.phone, user.mpin, 'atmActivated', 'atmStatus' ]);
	}
	function successAtmMpin(result) {
		if (result.responseJSON.phone != undefined
				&& result.responseJSON.phone == user.phone) {
			user.isAtmEnabled = true;
			user.isAtmActivated = true;
			if (onBoarding == true) {
				goToHome(event);
			} else
				goToChannelPage();
			return;
		}
		showErrorCardMpin(result.responseJSON.error);
	}
	function submitMpin(event) {
		event.preventDefault();
		var loc = $.mobile.activePage.attr('id');
		user.mpin = $("#mpin").val();
		if (loc.toLowerCase().indexOf('fednet') > -1) {
			user.mpin = $("#mpin_fednet").val();
		}
		if (user.mpin == null || user.mpin == "") {
			if (loc.toLowerCase().indexOf('login') > -1) {
				user.mpin = document.forms["login_form"]["mpin"].value;
				if (user.mpin == null || user.mpin == "") {
					showErrorMpin("Please enter a PIN");
					return false;
				}
			} else {
				showErrorMpin("Please enter a PIN");
				showErrorFedNetMpin('Please enter a PIN');
				return false;
			}
		} else if (user.mpin.length != 4 && user.mpin.length != 6) {
			if (loc.toLowerCase().indexOf('fednet') > -1) {
				showErrorFedNetMpin('Invalid PIN format');
				return false;
			}
			showErrorMpin("Invalid PIN format");
			return false;
		}
		var successFunc = successMpin;
		var attr1 = '';
		var attr2 = '';
		if (loc.indexOf('login') > -1) {
			successFunc = successMpinLogin;
		} else if (currentPage.indexOf('fednet') > -1) {
			successFunc = successMpinFedNet;
			attr1 = 'fedNetActivated';
			attr2 = 'fedNetStatus';
		} else if (currentPage.indexOf('fedmobile') > -1) {
			successFunc = successMpinFedMobile;
			attr1 = 'fedMobileActivated';
			attr2 = 'fedMobileStatus';
		}
		makeApiCall("/adapters/OllyUserAdapter/verifyMPIN", successFunc,
				errorMpin, [ user.phone, user.mpin, attr1, attr2 ]);
	}

	function refreshUserData(json) {
		user.phone = json.phone;
		user.name = json.name;
		user.isFedNetActivated = json.fedNetActivated;
		user.isFedNetEnabled = json.fedNetStatus;
		user.isFedMobileActivated = json.fedMobileActivated;
		user.isFedMobileEnabled = json.fedMobileStatus;
		user.isAtmActivated = json.atmActivated;
		user.isAtmEnabled = json.atmStatus;
		user.isOllyActivated = json.ollyActivated;
		user.isOllyEnabled = json.ollyStatus;
		user.isTimerEnabled = json.timerStatus;
		user.startTime = json.startTime;
		user.endTime = json.endTime;
	}
	function successMpin(result) {
		if (result.responseJSON.phone != null
				&& result.responseJSON.errorCode == null) {
			refreshUserData(result.responseJSON);
			WL.JSONStore.get(collectionName).add([ {
				phone : user.phone
			} ]).then(function() {

			});
			$.mobile.changePage("#pagethree");
			return;
		}
		showErrorMpin(result.responseJSON.error);
	}
	function successMpinLogin(result) {
		if (result.responseJSON.phone != null
				&& result.responseJSON.errorCode == null) {
			refreshUserData(result.responseJSON);
			goToHome(event);
			return;
		}
		showErrorMpin(result.responseJSON.error);
	}
	function successMpinFedNet(result) {
		if (result.responseJSON.phone != null
				&& result.responseJSON.errorCode == null) {
			refreshUserData(result.responseJSON);
			if (onBoarding == true) {
				// currentPage = 'fedmobile';
				// checkPage();
				$.mobile.changePage("#atm_pageone");
			} else {
				goToChannelPage();
			}
			return;
		}
		showErrorFedNetMpin(result.responseJSON.error);
	}
	function successMpinFedMobile(result) {
		if (result.responseJSON.phone != null
				&& result.responseJSON.errorCode == null) {
			refreshUserData(result.responseJSON);
			if (onBoarding == true) {
				$.mobile.changePage("#atm_pageone");
			} else {
				goToChannelPage();
			}
			return;
		}
		showErrorFedNetMpin(result.responseJSON.error);
	}
	function errorMpin(result) {
		showErrorMpin(serverError);
		return false;
	}
	function makeApiCall(adapter, success, failure, params) {
		var resourceRequest = new WLResourceRequest(adapter,
				WLResourceRequest.GET);

		resourceRequest.setQueryParameter('params', params);
		resourceRequest.send().then(success, failure);
	}

	function goToHome(event) {
		if (event != null || event != undefined)
			event.preventDefault();
		$.mobile.changePage('#homepage', {
			reverse : false,
			changeHash : false
		});
	}

	function goToLogin() {
		$.mobile.changePage("#login_pageone");
	}

	function submitFedNet(event) {
		event.preventDefault();
		user.fednetId = document.forms["fednet_onboarding1"]["fednet_id"].value;
		if (user.fednetId == null || user.fednetId == "") {
			showErrorFedNet("Please enter a Id");
			return false;
		} else {
			makeApiCall("/adapters/OllyUserAdapter/checkFedNetId",
					successFedNetId, errorFedNetId,
					[ user.phone, user.fednetId ]);
		}
	}

	function successFedNetId(result) {
		if (result.responseJSON.map != undefined
				&& result.responseJSON.map.msg.indexOf("success") > -1) {
			// Include if limit needs to be added
			// $.mobile.changePage("#fednet_pagetwo");

			$.mobile.changePage("#fednet_pagethree");
			return;
		}
		showErrorFedNet(result.responseJSON.error);
	}
	function errorFedNetId(result) {
		showErrorFedNet("Something went wrong. Please try again");
	}
	function submitCardNumber(event) {
		event.preventDefault();
		var x = document.forms["atm_onboarding1"]["card_number"].value;
		if (x == null || x == "") {
			showErrorCard("Please enter card number");
			return false;
		} else if (x.length != 4) {
			showErrorCard("Please enter only last 4 digits of Atm Card Number");
			return false;
		}
		makeApiCall("/adapters/OllyUserAdapter/addCard", successAtmCard,
				errorAtmCardApi, [ user.phone, x ]);
	}
	user.cardsArray = [];
	function successAtmCard(result) {
		if (result.responseJSON.map != undefined
				&& result.responseJSON.map.msg.indexOf("valid") > -1) {
			if (editCard != 999) {
				user.cardsArray[editCard] = $('#card_number').val();
				editCard = 999;
			} else if ($.inArray($('#card_number').val(), user.cardsArray) > -1) {
				showErrorCard("Card already added in list");
				return false;
			} else
				user.cardsArray.push($('#card_number').val());

			// uncomment to enable limits in cards
			// $.mobile.changePage("#atm_pagetwo");
			$("#transaction_text_atm").text(
					"Transactions through ATM Card **** "
							+ user.cardsArray[user.cardsArray.length - 1]
							+ " limited to");
			$.mobile.changePage("#confirm_limit_atm_page");
			return;
		}
		showErrorCard(result.responseJSON.error);
	}
	function errorAtmCardApi(result) {
		showErrorCard(serverError);
	}
	function checkChannelStates() {
		if ((user.isFedNetEnabled == false && user.isFedMobileEnabled == false && user.isAtmEnabled == false)
				|| user.isOllyEnabled == false) {
			$("#myonoffswitch").attr('checked', false);
			$("#footer_homepage").addClass('hide');
			showInactiveMessage();
			user.isOllyEnabled = false;
		} else if (user.isFedNetEnabled == true
				&& user.isFedMobileEnabled == true && user.isAtmEnabled == true
				&& user.isOllyEnabled == true) {
			$("#channel_state").text("All activities are enabled");
			$("#channel_state").removeClass('hide');
			$("#channel_settings").css('top', '12px');
			$("#tick_channel_state").removeClass('hide');
			$("#fednet_status").addClass('hide');
			$("#fedmobile_status").addClass('hide');
			$("#atm_status").addClass('hide');
			$("#account_status").text("Account is active");
			if (onBoarding == true) {
				$("#myonoffswitch").attr('checked', true);
				$("#footer_homepage").removeClass('hide');
			}
			onBoarding = false;
			user.isOllyEnabled = true;
		} else {
			user.isOllyEnabled = true;
			showPartiallyActiveMessage();
			if (onBoarding == true) {
				$("#myonoffswitch").attr('checked', true);
				$("#footer_homepage").removeClass('hide');
			}
			onBoarding = false;
			$("#channel_state").text("");
			$("#channel_state").addClass('hide');
			$("#tick_channel_state").addClass('hide');
			if (user.isFedNetEnabled == false) {
				$("#fednet_status").removeClass('hide');
			} else {
				$("#fednet_status").addClass('hide');
			}
			if (user.isFedMobileEnabled == false) {
				$("#fedmobile_status").removeClass('hide');
			} else {
				$("#fedmobile_status").addClass('hide');
			}
			if (user.isAtmEnabled == false) {
				$("#atm_status").removeClass('hide');
			} else {
				$("#atm_status").addClass('hide');
			}
		}
	}

	function checkTimerState() {
		if (user.startTime != null && user.endTime != null
				&& user.startTime != '' && user.endTime != '') {
			$('#start_time').css('color', '#FFBE0E');
			$("#start_time").removeClass('disabled_grey');
			$("#to_hidden_text").removeClass('hide');
			$('#end_time').css('color', '#FFBE0E');
			$("#end_time").removeClass('disabled_grey');
			$('#start_time').val(moment(user.startTime).format('hh:mm A'));
			$('#end_time').val(moment(user.endTime).format('hh:mm A'));
		}
		if (user.isTimerEnabled == true) {
			$("#timer_text").text('Timer is on');
			$("#time_settings_text").html(
					'From <time>' + moment(user.startTime).format('hh:mm A')
							+ ' </time> to <time>'
							+ moment(user.endTime).format('hh:mm A'));
			$("#timeronoffswitch_small").prop('checked', true);
			$('#timer_clock').css('background-image',
					'url("images/ic_timer_active.png")');
			$('#timer_footer').removeClass('disabled_grey');
			$("#from_hidden_text").removeClass('hide');
		} else {
			$("#timer_text").text('Automatic switch off');
			$("#time_settings_text").text('Set time settings');
			$("#timeronoffswitch_small").prop('checked', false);
			$('#timer_clock').css('background-image',
					'url("images/ic_timer_inactive.png")');
			$('#timer_footer').addClass('disabled_grey');
		}
	}
	$('#start_time').bootstrapMaterialDatePicker({
		date : false,
		format : 'hh:mm A',
		shortTime : true,
		'cancelText' : 'Back',
		'okText' : 'Next'
	}).on('change', function(e, date) {
		$("#from_hidden_text").removeClass('hide');
		$('#start_time').css('color', '#FFBE0E');
		$("#start_time").removeClass('disabled_grey');
		if ($('#end_time').val() == null || $('#end_time').val() == '') {
			$('#end_time').bootstrapMaterialDatePicker({
				date : false,
				format : 'hh:mm A',
				shortTime : true,
				'cancelText' : 'Back',
				'okText' : 'Next'
			}).on('change', function(e, date) {
				$("#to_hidden_text").removeClass('hide');
				$('#end_time').css('color', '#FFBE0E');
				$("#end_time").removeClass('disabled_grey');
			});
			$("#end_time").focus();
		}
	});

	$('#end_time').focus(function(e) {
		e.preventDefault();
		var val = $('#start_time').val();
		if (val == null || val == '') {
			$('#start_time').focus();
		}
	});

	$(document).on("pageshow", "#timer_settings", function(event) {
		document.addEventListener('backbutton', backButtonCallback, false);
		function backButtonCallback(e) {
			if ($(".dtp").is(":visible")) {
				$(".dtp").click();
			} else {
				goBack(e);
			}
		}
	});

	$(document).on("pageshow", "#fednet_pagethree", function(event) {
		$('#mpin_fednet').val('');
		$("#err_mpin_fednet").addClass("hide");
		$("#mpin_fednet").removeClass("input_text_err");
	});

	$(document).on("pageshow", "#homepage", function(event) {
		checkChannelStates();
		checkTimerState();
		if (user.isTimerEnabled && !user.isOllyEnabled) {
			updateClock(); // run function once at first to avoid delay
			$("#countdown_timer_div").removeClass('hide');
			timeinterval = setInterval(updateClock, 60000);
		}
	});

	function updateClock() {
		var t = getTimeRemaining(user.endTime);
		$("#countdown_timer").text(
				('0' + t.hours).slice(-2) + ":" + ('0' + t.minutes).slice(-2));
		if (t.total <= 60000) {
			alert('inside');
			clearInterval(timeinterval);
			user.isOllyEnabled = true;

			user.isTimerEnabled = false;
			if (user.isOllyEnabled == true) {
				if (user.isFedNetActivated == true)
					user.isFedNetEnabled = true;
				if (user.isFedMobileActivated == true)
					user.isFedMobileEnabled = true;
				if (user.isAtmActivated == true)
					user.isAtmEnabled = true;
			}
			$("#footer_homepage").toggleClass('hide');
			checkChannelStates();
			checkTimerState();
		}
	}

	$(document)
			.on(
					"pageshow",
					"#confirm_limit_atm_page",
					function(event) {
						var displayHtml = "";
						for (var i = 0; i < user.cardsArray.length; i++) {
							var html = "<div class=\"blue_border\"style=\"text-align: "
									+ "left; margin-left: -16px; padding: 0px 16px; width: 100%;"
									+ " display: inline-block; background-color: #ffffff;\">"
									+ "<p class='color_gray' style=\"display: inline-block\">Card **** "
									+ user.cardsArray[i]
									+ "</p>"
									+ "<img id='edit_card_no"
									+ i
									+ "' style=\"float: right; margin-top: 16px; display: inline-block;"
									+ " width: 20px; height: 20px;\"src=\"images\/ic_edit.png\"\/></div>";
							// uncomment and remove </div> from above to add
							// limit
							// text
							// + "<p style=\"float: right; display:
							// inline-block; margin-right: 8px;\">"
							// + "₹ 200</p></div>";
							$("#hidden_div_cards").on(
									"click",
									"#edit_card_no" + i,
									function(e) {
										e.preventDefault();
										var id = $(this).attr('id')
												.split("_no");
										editCard = id[1];
										$.mobile.changePage("#atm_pageone");
									});
							displayHtml += html;
						}
						var html = "<div class=\"blue_border\" id=\"add_card\"style=\""
								+ "text-align: left; margin-left: -16px; padding: 16px; width: 100%; display: inline-block; background-color: #ffffff;\"><img src=\"images/ic_tick.png\" style=\"width: 20px; vertical-align: middle; height: 20px;\"\/> <a style=\"display: inline-block; vertical-align: middle;\"id=\"\" class=\"link_yellow\">Add another card<\/a><\/div>";
						displayHtml += html;
						$("#hidden_div_cards").html(displayHtml);
					});

	function channelPageRefresh() {
		if (user.isFedNetEnabled == false) {
			$('#ic_netbanking_image').css('background-image',
					'url(images/ic_netbanking_off_blue4.png)');
			$("#netbanking_div").addClass('disabled_grey');
			$("#netbanking_small").prop('checked', false);
		} else {
			$('#ic_netbanking_image').css('background-image',
					'url(images/ic_netbanking_on.png)');
			$("#netbanking_div").removeClass('disabled_grey');
			$("#netbanking_small").prop('checked', true);
		}

		if (user.isFedMobileEnabled == false) {
			$('#ic_mobilebanking_image').css('background-image',
					'url(images/ic_mobilebanking_off_blue4.png)');
			$("#mobilebanking_div").addClass('disabled_grey');
			$("#mobile_banking_small").prop('checked', false);
		} else {
			$('#ic_mobilebanking_image').css('background-image',
					'url(images/ic_mobilebanking_on.png)');
			$("#mobilebanking_div").removeClass('disabled_grey');
			$("#mobile_banking_small").prop('checked', true);
		}

		if (user.isAtmEnabled == false) {
			$('#ic_atm_image').css('background-image',
					'url(images/ic_card_off_blue4.png)');
			$("#atm_div").addClass('disabled_grey');
			$("#atm_small").prop('checked', false);
		} else {
			$('#ic_atm_image').css('background-image',
					'url(images/ic_card_on.png)');
			$("#atm_div").removeClass('disabled_grey');
			$("#atm_small").prop('checked', true);
		}
	}

	$(document).on("pageinit pageshow", "#channel_page", function() {
		channelPageRefresh();
	});

	$("button").ePulse();
	$("button").ePulse({
		// animation speed
		speed : 'fast',

		// ripple size
		size : 'medium',

		// background color
		bgColor : 'transparent',

		// trigger event
		event : 'click',

		autoDelete : true,
		reverseOpacity : false,
		forceContainerStyles : false

	});

	$(document).on('pagebeforehide', '[data-role="page"]', function() {
		$('.err').addClass('hide');
		$("input").removeClass("input_text_err");
		$("span").removeClass("span_tel_err");
	});

	$(document).on("pageshow", "#pageone", function(event) {
		WL.App.overrideBackButton(function checkQuit() {
			WL.App.close();
		});
	});
	function getTimeRemaining(endtime, starttime) {
		if (starttime == null)
			var t = Date.parse(endtime) - Date.parse(new Date());
		else
			var t = Date.parse(endtime) - Date.parse(starttime);
		var seconds = Math.floor((t / 1000) % 60);
		var minutes = Math.floor((t / 1000 / 60) % 60);
		var hours = Math.floor((t / (1000 * 60 * 60)) % 24);
		var days = Math.floor(t / (1000 * 60 * 60 * 24));
		return {
			'total' : t,
			'days' : days,
			'hours' : hours,
			'minutes' : minutes,
			'seconds' : seconds
		};
	}
}
