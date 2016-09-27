// Slider functions @Simon Goellner (http://codepen.io/simeydotme/pen/mJLPPq)

/* Progress bubble inspried by John Mothershed (http://codepen.io/wiseguy12851/pen/mJZNqN) */

$(document).ready(function() {
  // Import bell ding audio
  var audio = new Audio('https://d1490khl9dq1ow.cloudfront.net/sfx/mp3preview/bell-ding-resonate_GJjBP5Vd.mp3');

  // Setup slider animation
  $.extend($.ui.slider.prototype.options, {
    animate: 300
  });


  // Setup break slider
  $("#flat-slider")
    .slider({
      max: 60,
      min: 1,
      value: 5,
    })



  // Setup session slider
  $("#flat-slider-session")
    .slider({
      max: 60,
      min: 1,
      value: 25,
    })

  // Setup pips for sliders
  $('#flat-slider, #flat-slider-session')
    .slider("pips", {
      first: "pip",
      last: "pip"
    })
    .slider("float");


  // Initialize variables
  // Get intial slider values
  var breakValue = getBreakSlider() * 60;
  var sessionValue = getSessionSlider() * 60;

  // Convert session slider value into clock time
  var sessionMinutes = Math.floor(sessionValue / 60);
  var sessionSeconds = (sessionValue - sessionMinutes) * 60;
  var sessionClock = str_pad_left(sessionMinutes, '0', 2) + ':' + str_pad_left(sessionSeconds, '0', 2);

  // Convert break slider value into clock time
  var breakMinutes = Math.floor(breakValue / 60);
  var breakSeconds = (breakValue - breakMinutes) * 60;
  var breakClock = str_pad_left(breakMinutes, '0', 2) + ':' + str_pad_left(breakSeconds, '0', 2);

  // Default countDown to session time. Convert to clock time
  var countDown = sessionValue;
  var minutes = Math.floor(countDown / 60);
  var seconds = (countDown - minutes) * 60;
  var finalTime = str_pad_left(minutes, '0', 2) + ':' + str_pad_left(seconds, '0', 2);

  // Initialize startCount for use in starting count down later
  var startCount;
  // Variable for determining if app needs to pause/resume counting down
  var pause = true;
  // Current value counting down. Default to session
  var currentRun = 'session';

  // Bubble level variables
  var colorInc = 100 / 3;
  var perc;
  if (currentRun == 'session') {
    perc = Math.floor((countDown * 100) / sessionValue);
  } else if (currentRun == 'break') {
    perc = Math.floor((countDown * 100) / breakValue);
  }

  // Display initial starting times
  $('#countDown').text("Session: " + finalTime);
  $('#breakTime').text(breakClock);
  $('#sessionTime').text(sessionClock);


  // Progress bubble setup
  function updateBubble() {
    if (perc != "" &&
      !isNaN(perc) &&
      perc <= 100 &&
      perc >= 0) {

        var valOrig = perc;
        perc = 100 - perc;

        if (valOrig == 0) {
          //$("#percent-box").val(0);
          $(".progress .percent").text(0 + "%");
        } else $(".progress .percent").text(valOrig + "%");

        $(".progress").parent().removeClass();
        $(".progress .water").css("top", perc + "%");

        if (valOrig < colorInc * 1)
          $(".progress").parent().addClass("red");
        else if (valOrig < colorInc * 2)
          $(".progress").parent().addClass("orange");
        else
          $(".progress").parent().addClass("green");
    } else {
      $(".progress").parent().removeClass();
      $(".progress").parent().addClass("green");
      $(".progress .water").css("top", 100 - 67 + "%");
      $(".progress .percent").text(67 + "%");
      $("#percent-box").val("");
    }
  } updateBubble();

  // Get value of break slider
  function getBreakSlider() {
    return $('#flat-slider').slider("value");
  }

  // Get value of session slider
  function getSessionSlider() {
    return $('#flat-slider-session').slider("value");
  }

  // Convert times to clock format
  function str_pad_left(string, pad, length) {
    return (new Array(length + 1).join(pad) + string).slice(-length);
  }

  // Update times based on current slider values
  function updateTime() {
    sessionMinutes = sessionValue / 60;
    sessionSeconds = ((sessionValue / 60) - sessionMinutes) * 60;
    sessionClock = str_pad_left(sessionMinutes, '0', 2) + ':' + str_pad_left(sessionSeconds, '0', 2);

    breakMinutes = breakValue / 60;
    breakSeconds = ((breakValue / 60) - breakMinutes) * 60;
    breakClock = str_pad_left(breakMinutes, '0', 2) + ':' + str_pad_left(breakSeconds, '0', 2);

    minutes = Math.floor(countDown / 60);
    seconds = countDown - minutes * 60;
    finalTime = str_pad_left(minutes, '0', 2) + ':' + str_pad_left(seconds, '0', 2);

    if (currentRun === 'session') {
      $('#countDown').text("Session: " + sessionClock);
    } else if (currentRun === 'break') {
      $('#countDown').text("Break: " + breakClock);
    }
  }

  // Reset times to default values
  $('#reset').click(function() {
    pause = true;
    $('#flat-slider-session').slider('value', 25);
    sessionValue = getSessionSlider() * 60;
    $('#flat-slider').slider('value', 5);
    breakValue = getBreakSlider() * 60;
    countDown = sessionValue;
    updateTime();
    $('#countDown').text("Session: " + finalTime);
    $('#breakTime').text(breakClock);
    $('#sessionTime').text(sessionClock);
    stop();
  });

  // Get new value of break slider when changed
  $('#flat-slider').on("slidechange", function(event, ui) {
    breakValue = getBreakSlider() * 60;
    if (currentRun == 'break') {
      countDown = breakValue + 1;
    }
    updateTime();
    $('#breakTime').text(breakClock);
  });

  // Get new value of session slider when changed
  $('#flat-slider-session').on("slidechange", function(event, ui) {
    sessionValue = getSessionSlider() * 60;
    if (currentRun == 'session') {
      countDown = sessionValue + 1;
    }
    updateTime();
    $('#sessionTime').text(sessionClock);
  });

  // Begin/stop countdown on click
  $('#pause').click(function() {

    // Toggle pause/resume
    pause = !pause;

    // If not paused, begin countdown
    if (pause === false) {
      go(countDown);
    } else { // If paused, stop countdown
      stop();
    }
  });

  // Start countdown
  function go(whichCounter) {
    if (currentRun == 'session') {
      startCount = setInterval(startSessionTimer, 1000);
    } else if (currentRun == 'break') {
      startCount = setInterval(startBreakTimer, 1000);
    }
  }

  // Stop countdown
  function stop() {
    clearInterval(startCount);
  }

  // Countdown timer for session time
  function startSessionTimer() {
    countDown--;
    updateTime();
    perc = Math.floor((countDown * 100) / sessionValue);
    updateBubble();
    $('#countDown').text("Session: " + finalTime);
    if (countDown === 0) {
      audio.play();
      countDown = breakValue;
      perc = Math.floor((countDown * 100) / breakValue);
      stop();
      currentRun = 'break';
      go(breakValue);
    }
  }

  // Countdown timer for break time
  function startBreakTimer() {
    countDown--;
    updateTime();
    //breakValue = getBreakSlider()
    perc = Math.floor((countDown * 100) / breakValue);
    updateBubble();
    $('#countDown').text("Break: " + finalTime);
    if (countDown === 0) {
      audio.play();
      countDown = sessionValue;
      perc = Math.floor((countDown * 100) / sessionValue);
      stop();
      currentRun = 'session';
      go(sessionValue);
    }
  }


});
