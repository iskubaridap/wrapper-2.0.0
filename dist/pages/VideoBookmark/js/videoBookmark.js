/*

Video Bookmark V.2

Helpful notes:

  Find this Web Object in Storyline:
  var theFrame = document.getElementsByTagName("iframe");
  theFrame[0].contentWindow.loadSettings(videoSettings, passwords);

*/

var videoName, videoSrc, myButton, myReplayButton, scrubber, VideoHTML, tracker;

myTime = [];
myPassword = [];
myReplayButton = document.getElementById("round-button-replay");
var player = parent.GetPlayer();
videoName = player.GetVar("vb_VideoName");
videoSrc = "../../media/video/" + videoName;
console.log(videoName);
vb_BookmarkTime = JSON.parse(player.GetVar("vb_BookmarkTime"));
passwords = player.GetVar("vb_Passwords").split(",");

// Code to fire when this Web Object loads.
function loadMe() {
  player.SetVar("vb_ThisVideoHasBeenSeen", false);
  scrubber = document.getElementById("my-scrubber");
  myButton = document.getElementById("round-button");
  VideoHTML = document.getElementById("my-video");
  tracker = document.getElementById("tracker");
  /* console.log(`
  variables 1:
  videoName:${videoName}
  videoSrc:${videoSrc}
  vb_BookmarkTime:${vb_BookmarkTime}
  VideoHTML:${VideoHTML}
  `) */

  if (passwords != "0") {
    for (i = 0; i < passwords.length; i += 2) {
      res = passwords[i].split(":");
      res = parseFloat(res[0]) * 60 + parseFloat(res[1]);
      myTime[i / 2 + 1] = res;
      myPassword[i / 2 + 1] = passwords[i + 1];
    }
  }

  // set video link
  // add listeners to video
  // prepare to play or fail

  VideoHTML.src = videoSrc;
  VideoHTML.addEventListener("timeupdate", getThatBookmark);
  VideoHTML.addEventListener("canplay", videoReady);
  VideoHTML.addEventListener("error", videoFail);
  VideoHTML.addEventListener("ended", imDone);

  // Check vb_BookmarkTime for existing bookmark in Storyline.
  // Add video to vb_BookmarkTime if new.

  if (!vb_BookmarkTime.hasOwnProperty(videoName)) {
    vb_BookmarkTime[videoName] = 0;
  }
  player.SetVar("vb_BookmarkTime", JSON.stringify(vb_BookmarkTime));
}

// Code to fire as the video plays
function getThatBookmark() {
  var ct = VideoHTML.currentTime;
  var d = VideoHTML.duration;

  // move srubber
  scrubber.style.width = (ct / d) * window.innerWidth + "px";

  // update bookmark time
  if (ct > vb_BookmarkTime[videoName]) {
    vb_BookmarkTime[videoName] = VideoHTML.currentTime.toFixed(3);
    document.getElementById("bookmarkTime").style =
      "visibility:visible;position:absolute;bottom:0vh;left:calc(" +
      (VideoHTML.currentTime / d) * window.innerWidth +
      "px - 10px);";
    player.SetVar("vb_BookmarkTime", JSON.stringify(vb_BookmarkTime));
  }

  // password check
  if (passwords != 0) {
    passwordCheck = Math.floor(ct);
    for (i = 0; i < myTime.length; i++) {
      if (passwordCheck == myTime[i]) {
        player.SetVar("vb_PasswordPhrase", myPassword[i]);
        player.SetVar("vb_PasswordNumber", i);
        player.SetVar("vb_ShowPassword", true);
      }
    }
  }

  // chapter unlock
  /*   for (i = 0; i < chapters.length; i++) {
      if (ct > chapters[i].timeSeconds) {
        if (!$("#chapter" + (i + 1)).hasClass("unlocked")) {
          $("#chapter" + (i + 1)).addClass("unlocked");
        }
      }
    } */
}

// code to fire when the video is ready to play.
// Moves the marker to vb_BookmarkTime (if bookmarked).
function videoReady() {
  player.SetVar("vb_VideoReady", true);
  d = VideoHTML.duration;

  // set bookmark marker
  document.getElementById("bookmarkTime").style =
    "visibility:visible;position:absolute;bottom:0vh;left:calc(" +
    (vb_BookmarkTime[videoName] / d) * window.innerWidth +
    "px - 10px);";

  // If the video has not been seen to the end,
  // start at the Bookmark.
  // If the video has been seen to the end,
  // start at the beginning.

  if (d != vb_BookmarkTime[videoName]) {
    VideoHTML.currentTime = vb_BookmarkTime[videoName];
    player.SetVar("vb_ThisVideoHasBeenSeen", false);
  } else {
    VideoHTML.currentTime = 0;
    player.SetVar("vb_ThisVideoHasBeenSeen", true);
  }
  VideoHTML.removeEventListener("canplay", videoReady);
}

// Trigger video fail message in Storyline.
function videoFail() {
  player.SetVar("vb_VideoFail", true);
}

// Toggle pause/play on click.
function togglePlay() {
  player.SetVar("vb_SendCompletion", 0);
  if (VideoHTML.paused) {
    myButton.classList.add("play");
    myButton.classList.remove("pause");
    VideoHTML.play();
  } else {
    myButton.classList.remove("play");
    myButton.classList.add("pause");
    VideoHTML.pause();
  }
}

// Send completion
function imDone() {
  player.SetVar("vb_SendCompletion", 1);
  vb_BookmarkTime[videoName] = VideoHTML.duration;
  player.SetVar("vb_BookmarkTime", JSON.stringify(vb_BookmarkTime));
  player.SetVar("vb_ThisVideoHasBeenSeen", true);
}

function rewindVideo(event) {
  var ct = VideoHTML.currentTime;
  var d = VideoHTML.duration;
  var position = event.clientX;
  var scrubTo = (position / window.innerWidth) * d;
  if (scrubTo < vb_BookmarkTime[videoName]) {
    VideoHTML.currentTime = scrubTo;
  } else {
    VideoHTML.currentTime = vb_BookmarkTime[videoName];
  }
}

function scrubOn() {
  tracker.style.visibility = "visible";
}

function scrubOff() {
  tracker.style.visibility = "hidden";
}

function scrubRoll(event) {
  var ct = VideoHTML.currentTime;
  var d = VideoHTML.duration;
  var position = event.clientX;
  var scrubTo = (position / window.innerWidth) * d;
  if (scrubTo < vb_BookmarkTime[videoName]) {
    tracker.style.visibility = "visible";
    tracker.style.left = position + "px";
  } else {
    tracker.style.visibility = "hidden";
  }
}
