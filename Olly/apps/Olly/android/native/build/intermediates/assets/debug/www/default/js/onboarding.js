
/* JavaScript content from js/onboarding.js in folder common */
/**
 * Created by shubhang on 09/06/16.
 */
function submitform() {
    var x = document.forms["onboarding1"]["phone"].value;
    if (x == null || x == "") {
        alert("Please enter phone number");
        return false;
    }
    var re = new RegExp("^(?:(?:\\+|0{0,2})91(\\s*[\\-]\\s*)?|[0]?)?[789]\\d{9}$");
    if (re.test(x)) {
        $.mobile.changePage("#pagetwo");
    } else {
        alert("Please enter valid phone number");
        return false;
    }
}

function submitmpin() {
    var x = document.forms["onboarding2"]["mpin"].value;
    if (x == null || x == "") {
        alert("Please enter mpin");
        return false;
    }
    var loc = window.location.pathname;
    if (loc.indexOf('onboarding_fednet') > -1) {
        $.mobile.changePage("#fednet_pagefour");
    }
    else if (loc.indexOf('onboarding_atm') > -1) {
        $.mobile.changePage("#atm_pagefour");
    }
    $.mobile.changePage("#pagethree");
}

function gotohome() {
    window.location.href = 'homepage.html';
}

function submitfednet() {
    var x = document.forms["fednet_onboarding1"]["fednet_id"].value;
    if (x == null || x == "") {
        alert("Please enter Fednet Id");
        return false;
    }
    $.mobile.changePage("#fednet_pagetwo");
}


function submitAtmId() {
    var x = document.forms["atm_onboarding1"]["atm_number"].value;
    if (x == null || x == "") {
        alert("Please enter Atm Card Number");
        return false;
    }
    else if (x.length != 4) {
        alert("Please enter only last 4 digits of Atm Card Number");
        return false;
    }
    $.mobile.changePage("#atm_pagetwo");
}

$(document).on("pagecreate", "#homepage", function () {

    /* change event handler */
    function flipChanged(e) {
        var id = this.id,
            value = this.value;
        console.log(id + " has been changed! " + value);
        //$.mobile.pageContainer.pagecontainer('change', 'onboarding_fednet.html', {
        //    transition: 'flow',
        //    reload    : true
        //});
        if (value == 'on') {
            if (id == "flip-1")
                window.location.href = 'onboarding_fednet.html';
            else if (id == "flip-3" || id == "flip-4")
                window.location.href = 'onboarding_atm.html';
            else if (id == "flip-2")
                window.location.href = 'onboarding_fedmobile.html';
        }

    }

    /* add listener - this will be removed once other buttons are clicked */
    $("#flip-1").on("change", flipChanged);
    $("#flip-2").on("change", flipChanged);
    $("#flip-3").on("change", flipChanged);
    $("#flip-4").on("change", flipChanged);
});

$(document).on("pagecreate", "#fednet_pagetwo", function () {

    /* change event handler */
    function flipChanged(e) {
        var id = this.id,
            value = this.value;
        console.log(id + " has been changed! " + value);
        $.mobile.changePage("#fednet_pagethree");
    }

    /* add listener - this will be removed once other buttons are clicked */
    $("#fednet_flip-1").on("change", flipChanged);
});

$(document).on("pagecreate", "#atm_pagetwo", function () {

    /* change event handler */
    function flipChanged(e) {
        var id = this.id,
            value = this.value;
        console.log(id + " has been changed! " + value);
        $.mobile.changePage("#atm_pagethree");
    }

    /* add listener - this will be removed once other buttons are clicked */
    $("#atm_flip-1").on("change", flipChanged);
});