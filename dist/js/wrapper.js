"use strict";
var _a, _b;
const wrapperPage = (window.location.href).search('/pages') < 0 ? true : false;
const SCORM = (typeof SCORM2004_Initialize === "function");
const prevBtn = document.getElementById('header-footer-pre');
const nextBtn = document.getElementById('header-footer-next');
var courseGated;
var lastUpdated;
var videoObj;
let company;
let companyLogo;
let courseName;
let retrieveNumOfAttempt;
let retrieveScore;
let shuffleAnswer;
let setSCORMcompleteAtTheLastPage;
let passingGrade;
let maxScore;
var pages = [];
var spagePages = [];
var courseVolume = 0;
var pdfPath = "./pdf/";
var audioPath = "../media/audio/";
var videoPath = "./media/video/";
let quizes = [];
let coursePass = false;
let quizPageIndex = 0;
let quizNames = null;
let pageNames = null;
let totalQuestions = 10;
let scorePercent = 0;
let student = "";
let courseStart = false;
let pageProgress = 0;
let scaledScore = 0;
let processedUnload = false;
let startTimeStamp = null;
let numOfAttempt = 1;
let repeatCourse = false;
let suspendData = null;
let wrapperObj = {
    student: student,
    currentPage: 0,
    score: 0,
    pageProgress: 0,
    numOfAttempt: numOfAttempt,
    videoBookMark: ''
};
var initScorm = () => {
    // keeping this "if" statement for future use
    if (SCORM && !courseStart) {
        SCORM2004_Initialize();
        startTimeStamp = new Date();
        let continueCourse = null;
        let completionStatus = SCORM2004_CallGetValue("cmi.completion_status", true);
        suspendData = SCORM2004_CallGetValue("cmi.suspend_data") ? JSON.parse(SCORM2004_CallGetValue("cmi.suspend_data")) : wrapperObj;
        if (completionStatus == "unknown") {
            SCORM2004_CallSetValue("cmi.completion_status", "incomplete");
        }
        wrapperObj.student = SCORM2004_CallGetValue("cmi.learner_name");
        if (retrieveScore) {
            wrapperObj.score = SCORM2004_CallGetValue("cmi.score.raw") ? SCORM2004_CallGetValue("cmi.score.raw") : 0;
        }
        else {
            wrapperObj.score = 0;
        }
        if (retrieveNumOfAttempt) {
            numOfAttempt = suspendData.numOfAttempt >= 3 ? 3 : suspendData.numOfAttempt;
            wrapperObj.numOfAttempt = suspendData.numOfAttempt;
        }
        scaledScore = wrapperObj.score / maxScore;
        SCORM2004_CallSetValue("cmi.score.scaled", scaledScore);
        fetch('./js/settings.json')
            .then(response => response.json())
            .then(json => {
            const courseName = document.getElementById('course-name-txt');
            courseName.innerText = json.courseName;
            if (parseInt(SCORM2004_GetBookmark()) > 0) {
                loadResumeRestart(json);
            }
            else {
                loadPages(json);
            }
        });
        courseStart = true;
    }
};
var loadResumeRestart = (json) => {
    const resumeRestartWrap = document.getElementById('resume-restart-wrap');
    const loader = document.getElementById('content-loader');
    loader.classList.add('d-none');
    resumeRestartWrap.classList.remove('d-none');
    // the user choose to resume the course
    document.getElementById('resume-btn').addEventListener('click', () => {
        const page = parseInt(SCORM2004_GetBookmark());
        if (page >= 1) {
            wrapperObj.currentPage = 1;
        }
        else if (page <= 0) {
            wrapperObj.currentPage = 1;
        }
        else {
            // just giving a fallback
            wrapperObj.currentPage = 1;
        }
        wrapperObj.videoBookMark = suspendData.videoBookMark;
        if ((suspendData.videoBookMark).length > 0) {
            json.videoApp.vb_BookmarkTime = suspendData.videoBookMark;
        }
        loadPages(json);
        loader.classList.remove('d-none');
        resumeRestartWrap.classList.add('d-none');
    });
    // the user choose to restart the course
    document.getElementById('restart-btn').addEventListener('click', () => {
        wrapperObj.currentPage = 0;
        loadPages(json);
        loader.classList.remove('d-none');
        resumeRestartWrap.classList.add('d-none');
    });
};
var lastPageInfo = () => {
    // reserve code
};
var setLastPage = () => {
    if (setSCORMcompleteAtTheLastPage) {
        setSCORMcomplete();
    }
    else {
        // reserve code
    }
};
var retakeCourse = () => {
    // reserve code
};
var addScore = () => {
    const iframe = document.querySelectorAll('#content .page')[wrapperObj.currentPage];
    const iframeObj = iframe.contentWindow;
    wrapperObj.score += iframeObj.scoreValue ? parseFloat(iframeObj.scoreValue) : 0;
    wrapperObj.score = wrapperObj.score >= 99 ? 100 : wrapperObj.score;
    if (SCORM && courseStart) {
        SCORM2004_CallSetValue("cmi.score.min", 0);
        SCORM2004_CallSetValue("cmi.score.max", maxScore);
        SCORM2004_CallSetValue("cmi.score.raw", wrapperObj.score);
        scaledScore = wrapperObj.score / maxScore;
        scaledScore = scaledScore >= 99 ? 100 : scaledScore;
        SCORM2004_CallSetValue("cmi.score.scaled", scaledScore);
        if (wrapperObj.score >= passingGrade) {
            SCORM2004_CallSetValue("cmi.completion_status", "completed");
            SCORM2004_CallSetValue("cmi.success_status", "passed");
        }
        else {
            SCORM2004_CallSetValue("cmi.completion_status", "incomplete");
            SCORM2004_CallSetValue("cmi.success_status", "failed");
        }
    }
};
var doUnload = () => {
    // don't call this function twice
    if (processedUnload == true) {
        return;
    }
    processedUnload = true;
    //record the session time
    var endTimeStamp = new Date();
    var totalMilliseconds = (endTimeStamp.getTime() - startTimeStamp.getTime());
    var scormTime = ConvertMilliSecondsIntoSCORM2004Time(totalMilliseconds);
    SCORM2004_CallSetValue("cmi.session_time", scormTime);
    SCORM2004_CallTerminate();
};
var closeCourse = () => {
    setSCORMcomplete();
    if (SCORM && courseStart) {
        doUnload();
    }
};
var setSCORMvalues = () => {
    if (SCORM && courseStart) {
        SCORM2004_CallSetValue("cmi.suspend_data", JSON.stringify(wrapperObj));
    }
};
var setSCORMcomplete = () => {
    if (SCORM && courseStart) {
        wrapperObj.pageProgress = (pageProgress / pages.length * 100);
        SCORM2004_CallSetValue("cmi.suspend_data", JSON.stringify(wrapperObj));
        if (setSCORMcompleteAtTheLastPage) {
            SCORM2004_CallSetValue("cmi.completion_status", "completed");
            SCORM2004_CallSetValue("cmi.success_status", "passed");
        }
        else if (wrapperObj.score >= passingGrade) {
            SCORM2004_CallSetValue("cmi.completion_status", "completed");
            SCORM2004_CallSetValue("cmi.success_status", "passed");
        }
        else {
            SCORM2004_CallSetValue("cmi.completion_status", "completed");
            SCORM2004_CallSetValue("cmi.success_status", "failed");
        }
        SCORM2004_CallSetValue("cmi.exit", "");
        SCORM2004_CallSetValue("adl.nav.request", "exitAll");
    }
};
var setCMIInteractions = (settings) => {
    var obj = new Object();
    obj.num = settings.num ? settings.num : getInteractionsCount();
    obj.type = settings.type ? settings.type : "true-false";
    obj.id = settings.id ? settings.id : "Quiz" + obj.num;
    obj.objectives = settings.objectives ? settings.objectives : "Quiz" + obj.num;
    // temporary disabled obj.timestamp = ConvertDateToIso8601TimeStamp(new Date());
    obj.correctResponses = settings.correctResponses ? settings.correctResponses : "true";
    obj.weighting = settings.weighting ? settings.weighting : 1;
    obj.learnerResponse = settings.learnerResponse ? settings.learnerResponse : "true";
    obj.result = settings.result ? settings.result : "incorrect";
    // temporary disabled obj.latency = ConvertMilliSecondsIntoSCORM2004Time(new Date((new Date()).getMilliseconds()));
    obj.description = settings.description ? settings.description : "Question" + obj.num + " text";
    if (SCORM) {
        SCORM2004_CallSetValue(("cmi.interactions." + obj.num + ".id"), obj.id);
        SCORM2004_CallSetValue(("cmi.interactions." + obj.num + ".type"), obj.type);
        SCORM2004_CallSetValue(("cmi.interactions." + obj.num + ".objectives.0.id"), obj.objectives);
        SCORM2004_CallSetValue(("cmi.interactions." + obj.num + ".timestamp"), obj.timestamp);
        SCORM2004_CallSetValue(("cmi.interactions." + obj.num + ".correct_responses.0.pattern"), obj.correctResponses);
        SCORM2004_CallSetValue(("cmi.interactions." + obj.num + ".weighting"), obj.weighting);
        SCORM2004_CallSetValue(("cmi.interactions." + obj.num + ".learner_response"), obj.learnerResponse);
        SCORM2004_CallSetValue(("cmi.interactions." + obj.num + ".result"), obj.result);
        //SCORM2004_CallSetValue(("cmi.interactions." + obj.num + ".latency"),obj.latency);
        SCORM2004_CallSetValue(("cmi.interactions." + obj.num + ".description"), obj.description);
    }
};
var getInteractionsCount = () => {
    var num = 0;
    if (SCORM) {
        num = SCORM2004_CallGetValue("cmi.interactions._count");
    }
    return num;
};
var setCMIInteractionsLatency = (count, response, result, time) => {
    if (SCORM) {
        SCORM2004_CallSetValue(("cmi.interactions." + count + ".learner_response"), response);
        SCORM2004_CallSetValue(("cmi.interactions." + count + ".result"), result);
        SCORM2004_CallSetValue(("cmi.interactions." + count + ".latency"), ConvertMilliSecondsIntoSCORM2004Time(time));
    }
};
var setPageWhenGettingOut = () => {
    const currentPage = document.querySelectorAll('#content .page')[wrapperObj.currentPage];
    const currentPageContentWindow = currentPage.contentWindow;
    if (typeof currentPageContentWindow.pageReset === 'function') {
        currentPageContentWindow.pageReset();
    }
    Array.prototype.forEach.call((document.querySelectorAll('#content .page')), function (el, i) {
        let iframeElem = el;
        if (iframeElem.classList.contains('active')) {
            iframeElem.classList.remove('active');
        }
    });
    // if(currentPageContentWindow.audioPlay) {
    //     currentPageContentWindow.pauseAudio();
    // }
};
var nextPage = () => {
    const iframePages = document.querySelectorAll('#content .page');
    const currentPage = document.querySelectorAll('#content .page')[wrapperObj.currentPage];
    const currentPageContentWindow = currentPage.contentWindow;
    let jumpToPage = () => {
        if (iframePages[wrapperObj.currentPage].getAttribute('data-type') == 'specialPage') {
            wrapperObj.currentPage += 1;
            jumpToPage();
        }
    };
    setPageWhenGettingOut();
    wrapperObj.currentPage += 1;
    jumpToPage();
    setPage();
};
var prevPage = () => {
    const iframePages = document.querySelectorAll('#content .page');
    const currentPage = document.querySelectorAll('#content .page')[wrapperObj.currentPage];
    const currentPageContentWindow = currentPage.contentWindow;
    let jumpToPage = () => {
        if (iframePages[wrapperObj.currentPage].getAttribute('data-type') == 'specialPage') {
            wrapperObj.currentPage -= 1;
            jumpToPage();
        }
    };
    setPageWhenGettingOut();
    wrapperObj.currentPage -= 1;
    jumpToPage();
    setPage();
};
var showCertainPage = (id) => {
    const currentPage = document.querySelectorAll('#content .page')[wrapperObj.currentPage];
    const currentPageContentWindow = currentPage.contentWindow;
    setPageWhenGettingOut();
    pages.forEach((element, index) => {
        if (element.pageName == id) {
            wrapperObj.currentPage = index;
            return false;
        }
    });
    setPage();
};
var setResourceBalloon = () => {
    let resourceWrap = document.getElementById('header-footer-resources-wrap');
    let resource = document.getElementById('header-footer-resources');
    let speechBalloon = document.getElementById('header-footer-resources-speech-balloon');
    let showHideSpeechBallon = () => {
        if (speechBalloon.classList.contains('active')) {
            speechBalloon.classList.remove('active');
        }
        else {
            speechBalloon.classList.add('active');
        }
    };
    resource.addEventListener('click', showHideSpeechBallon);
    // reserve code
    // speechBalloon.addEventListener('mouseout', showHideSpeechBallon);
};
var setVolume = () => {
    const iframe = document.querySelectorAll('#content .page')[wrapperObj.currentPage];
    const iframeObj = iframe.contentWindow;
    const volumeIcon = document.getElementById('header-footer-icon');
    const volumeSlider = document.getElementById('volume-slider');
    let setVolumeIcon = (value) => {
        if (value <= 0) {
            if (volumeIcon.classList.contains('bi-volume-down-fill')) {
                volumeIcon.classList.remove('bi-volume-down-fill');
            }
            else if (volumeIcon.classList.contains('bi-volume-up-fill')) {
                volumeIcon.classList.remove('bi-volume-up-fill');
            }
            volumeIcon.classList.add('bi-volume-off-fill');
        }
        else if (value > 0 && value <= 25) {
            if (volumeIcon.classList.contains('bi-volume-off-fill')) {
                volumeIcon.classList.remove('bi-volume-off-fill');
            }
            else if (volumeIcon.classList.contains('bi-volume-up-fill')) {
                volumeIcon.classList.remove('bi-volume-up-fill');
            }
            volumeIcon.classList.add('bi-volume-down-fill');
        }
        else if (value >= 75) {
            if (volumeIcon.classList.contains('bi-volume-off-fill')) {
                volumeIcon.classList.remove('bi-volume-off-fill');
            }
            else if (volumeIcon.classList.contains('bi-volume-down-fill')) {
                volumeIcon.classList.remove('bi-volume-down-fill');
            }
            volumeIcon.classList.add('bi-volume-up-fill');
        }
    };
    volumeSlider.style.background = `linear-gradient(to right, #8db305 0%, #8db305 ${volumeSlider.value} %, #cccccc ${volumeSlider.value}%, #cccccc 100%)`;
    volumeSlider.oninput = (e) => {
        let elem = e.target;
        let value = (elem.value - elem.min) / (elem.max - elem.min);
        courseVolume = value;
        elem.style.background = `linear-gradient(to right, #8db305 0%, #8db305 ${(value * 100)}%, #cccccc ${(value * 100)}%, #cccccc 100%)`;
        setVolumeIcon(Math.round((courseVolume * 100)));
        if (iframeObj.setPageVolume) {
            iframeObj.setPageVolume(courseVolume);
        }
    };
    setVolumeIcon(Math.round(parseInt(volumeSlider.value)));
};
var disablePrevBtn = () => {
    if (prevBtn.classList.contains('active')) {
        prevBtn.classList.remove('active');
    }
    prevBtn.removeEventListener('click', prevPage);
};
var enablePrevBtn = () => {
    if (!prevBtn.classList.contains('active')) {
        prevBtn.classList.add('active');
    }
    prevBtn.removeEventListener('click', prevPage);
    prevBtn.addEventListener('click', prevPage);
};
var disableNextBtn = () => {
    if (nextBtn.classList.contains('active')) {
        nextBtn.classList.remove('active');
    }
    nextBtn.removeEventListener('click', nextPage);
};
var enableNextBtn = () => {
    if (!nextBtn.classList.contains('active')) {
        nextBtn.classList.add('active');
    }
    nextBtn.removeEventListener('click', nextPage);
    nextBtn.addEventListener('click', nextPage);
};
var setPage = () => {
    const iframe = document.querySelectorAll('#content .page')[wrapperObj.currentPage];
    const iframeObj = iframe.contentWindow;
    if (SCORM && courseStart) {
        SCORM2004_SetBookmark((wrapperObj.currentPage).toString());
        setSCORMvalues();
    }
    // reserve code....
    /* if (wrapperObj.currentPage == 0 && courseGated && !iframeObj.pageFinish) {
        disablePrevBtn();
        disableNextBtn();
    } else if (wrapperObj.currentPage == 0 && courseGated && iframeObj.pageFinish ||
        wrapperObj.currentPage == 0 && !courseGated && !iframeObj.pageFinish ||
        wrapperObj.currentPage == 0 && !courseGated && iframeObj.pageFinish) {
        disablePrevBtn();
        enableNextBtn();
    } else if (wrapperObj.currentPage == (pages.length - 1)) {
        disableNextBtn();
        enablePrevBtn();
        setLastPage();
    } else if (wrapperObj.currentPage > 0 && wrapperObj.currentPage < (pages.length - 1) && !courseGated) {
        enablePrevBtn();
        enableNextBtn();
    } else if (wrapperObj.currentPage > 0 && wrapperObj.currentPage < (pages.length - 1) && courseGated && !iframeObj.pageFinish) {
        disableNextBtn();
        enablePrevBtn();
    } else if (wrapperObj.currentPage > 0 && wrapperObj.currentPage < (pages.length - 1) && courseGated && iframeObj.pageFinish ||
        wrapperObj.currentPage > 0 && wrapperObj.currentPage < (pages.length - 1) && !courseGated && !iframeObj.pageFinish) {
        enablePrevBtn();
        enableNextBtn();
    } */
    // as far as i can see in this app, the 1st, 2nd, VideoBookMark and last page as are the only pages
    // were the user can navigate.
    if (wrapperObj.currentPage == 0) {
        disablePrevBtn();
        enableNextBtn();
    }
    else if (wrapperObj.currentPage == 1 && iframe.getAttribute('data-id') == 'goToVideoPage') {
        enablePrevBtn();
        disableNextBtn();
    }
    else if (wrapperObj.currentPage > 1 && iframe.getAttribute('data-id') == 'lastPage') {
        enablePrevBtn();
        disableNextBtn();
        setLastPage();
    }
    else if (iframe.getAttribute('data-id') == 'videoPage') {
        enablePrevBtn();
        disableNextBtn();
    }
    else {
        disablePrevBtn();
        disableNextBtn();
    }
    iframe.classList.add('active');
    pages[wrapperObj.currentPage].opened = true;
    setVolume();
    if (iframeObj.initPage) {
        iframeObj.initPage();
    }
    if (iframeObj.setPageVolume) {
        iframeObj.setPageVolume(courseVolume);
    }
};
var GetPlayer = () => {
    let playerObj = videoObj;
    return {
        GetPlayerObj: () => {
            return playerObj;
        },
        SetPlayerObj: (obj) => {
            playerObj.vb_BookmarkTime = obj.vb_BookmarkTime;
            playerObj.vb_JumpToBookmarkSlide = obj.vb_JumpToBookmarkSlide;
            playerObj.vb_PasswordNumber = obj.vb_PasswordNumber;
            playerObj.vb_PasswordPhrases = obj.vb_PasswordPhrases;
            playerObj.vb_Passwords = obj.vb_Passwords;
            playerObj.vb_SendCompletion = obj.vb_SendCompletion;
            playerObj.vb_ShowPassword = obj.vb_ShowPassword;
            playerObj.vb_ShowVideoIntro = obj.vb_ShowVideoIntro;
            playerObj.vb_ThisVideoHasBeenSeen = obj.vb_ThisVideoHasBeenSeen;
            playerObj.vb_VideoFail = obj.vb_VideoFail;
            playerObj.vb_VideoName = obj.vb_VideoName;
            playerObj.vb_VideoReady = obj.vb_VideoReady;
        },
        SetVar: (property, value) => {
            if (playerObj.hasOwnProperty(property)) {
                playerObj[property] = value;
                if (property == 'vb_VideoReady' && value == true) {
                    const goToVideoPage = document.querySelector('#content .page[data-id="goToVideoPage"]');
                    const contentWindow = goToVideoPage.contentWindow.document;
                    contentWindow.getElementById('go-to-video-loading').classList.add('d-none');
                    contentWindow.getElementById('go-to-video').classList.remove('d-none');
                }
                if (property == 'vb_ThisVideoHasBeenSeen' && value == true) {
                    showCertainPage('videoEnd');
                }
                if (property == 'vb_BookmarkTime' && value != '') {
                    wrapperObj.videoBookMark = value;
                    if (typeof SCORM2004_CallSetValue == 'function') {
                        SCORM2004_CallSetValue("cmi.suspend_data", JSON.stringify(wrapperObj));
                    }
                    setSCORMvalues();
                }
                if (property == 'vb_SendCompletion' && value == 1) {
                    wrapperObj.videoBookMark = playerObj.vb_BookmarkTime;
                    if (typeof SCORM2004_CallSetValue == 'function') {
                        SCORM2004_CallSetValue("cmi.suspend_data", JSON.stringify(wrapperObj));
                    }
                    setSCORMvalues();
                }
                return true;
            }
            else {
                return false;
            }
        },
        GetVar: (property) => {
            if (playerObj.hasOwnProperty(property)) {
                return playerObj[property];
            }
            else {
                return false;
            }
        }
    };
};
var showTogglePassword = () => {
    const videoWrap = document.getElementById('video-password-wrap');
    const slideDown = gsap.to('#video-password-wrap', {
        duration: 0.6,
        height: 'auto',
        paused: true
    });
    const slideUp = gsap.to('#video-password-wrap', {
        duration: 1,
        height: '0',
        paused: true
    });
    slideDown.play();
    setTimeout(() => slideUp.play(), 5000);
};
var hidePassword = () => {
    const videoWrap = document.getElementById('video-password-wrap');
    const slideUp = gsap.to('#video-password-wrap', {
        duration: 1,
        height: '0',
        ease: "back.inOut(1.7)",
        paused: true
    });
    slideUp.play();
};
var showVideoOverlay = () => {
    let elem = document.getElementById('video-overlay-wrap');
    if (elem.classList.contains('d-none')) {
        elem.classList.remove('d-none');
    }
};
var hideVideoOverlay = () => {
    let elem = document.getElementById('video-overlay-wrap');
    if (!elem.classList.contains('d-none')) {
        elem.classList.add('d-none');
    }
};
var loadPages = (json) => {
    const contentElem = document.getElementById('content');
    let totalPages = 0;
    let pagesLoaded = 0;
    let allPagesLoaded = () => {
        const loader = document.getElementById('content-loader');
        const videoIframe = document.querySelector('.page[data-id="videoPage"]');
        const videoElem = (videoIframe.contentWindow).document.getElementById('my-video');
        videoElem.addEventListener('canplay', (e) => {
            const duration = videoElem.duration ? videoElem.duration : 0;
            document.querySelector('.page[data-id="goToVideoPage"]').contentWindow.document.getElementById('page-video-duration').innerText = (duration).toString();
        });
        loader === null || loader === void 0 ? void 0 : loader.classList.add('d-none');
        setResourceBalloon();
        setPage();
    };
    let generatePage = (obj, index, type) => {
        let iframeElem = document.createElement('iframe');
        iframeElem.src = `./pages/${obj.file}`;
        iframeElem.setAttribute('data-type', type);
        iframeElem.setAttribute('data-id', obj.id);
        iframeElem.className = 'page';
        contentElem.appendChild(iframeElem);
        contentElem.querySelectorAll('.page')[index].addEventListener('load', (e) => {
            var elem = e.target;
            var iframeWin = elem.contentWindow;
            pagesLoaded++;
            iframeWin.info.id = obj.id;
            iframeWin.info.file = obj.file;
            iframeWin.info.title = obj.title;
            iframeWin.info.subtitle = obj.subtitle;
            iframeWin.info.description = obj.description;
            iframeWin.info.company = company;
            iframeWin.info.companyLogo = companyLogo;
            iframeWin.info.courseName = courseName;
            iframeWin.info.shuffleAnswer = shuffleAnswer;
            iframeWin.info.lastUpdated = lastUpdated;
            if (iframeWin.setPageVolume) {
                iframeWin.setPageVolume();
            }
            if (iframeWin.pageSet) {
                iframeWin.pageSet();
            }
            if (pagesLoaded == totalPages) {
                allPagesLoaded();
            }
        });
    };
    let setPageForAry = (obj, type) => {
        let page = {
            pageName: obj.id,
            opened: false
        };
        if (type == 'specialPage') {
            spagePages.push(page);
        }
        else if (type == 'quiz') {
            quizes.push(page);
        }
        pages.push(page);
    };
    // wrapperObj.currentPage = 0;
    company = json.company;
    companyLogo = json.companyLogo;
    courseName = json.courseName;
    courseGated = json.courseGated;
    retrieveNumOfAttempt = json.retrieveNumOfAttempt;
    retrieveScore = json.retrieveScore;
    shuffleAnswer = json.shuffleAnswer;
    setSCORMcompleteAtTheLastPage = json.setSCORMcompleteAtTheLastPage;
    passingGrade = json.passingGrade;
    maxScore = json.maxScore;
    lastUpdated = json.lastUpdated;
    videoObj = json.videoApp;
    if (document.getElementById('course-name-txt')) {
        document.getElementById('course-name-txt').innerHTML = `<i class="bi bi-book"></i> &nbsp;${courseName}`;
    }
    if (json.pages) {
        totalPages += json.pages.length;
        json.pages.forEach((value, index) => {
            switch (value.type) {
                case 'page':
                    setPageForAry(value, 'page');
                    generatePage(value, index, 'page');
                    break;
                case 'quiz':
                    setPageForAry(value, 'quiz');
                    generatePage(value, index, 'quiz');
                    break;
                case 'specialPage':
                    setPageForAry(value, 'specialPage');
                    generatePage(value, index, 'specialPage');
                    break;
            }
        });
    }
};
(_a = document.getElementById('continue-save-btn')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => {
    showCertainPage('continueSave');
});
(_b = document.getElementById('video-password-ok-btn')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', hidePassword);
