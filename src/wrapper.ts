declare const SCORM2004_Initialize: any;
declare const SCORM2004_CallGetValue: any;
declare const SCORM2004_CallSetValue: any;
declare const SCORM2004_GetBookmark: any;
declare const ConvertMilliSecondsIntoSCORM2004Time: any;
declare const SCORM2004_CallTerminate: any;
declare const SCORM2004_SetBookmark: any;
declare const SCORM2004_GetStatus: any;
declare const SCORM2004_GetDataChunk: any;
declare const SCORM2004_SetDataChunk: any;
declare const SCORM2004_SetObjectiveStatus: any;
declare const SCORM2004_FindObjectiveIndexFromID: any;
declare const SCORM2004_GetStudentName: any;
declare const SCORM2004_GetScore: any;
declare const SCORM2004_SetScore: any;
declare const SCORM2004_SaveTime: any;
declare const SCORM2004_Finish: any;
declare const SCORM2004_SetPassed: any;
declare const SCORM2004_SetFailed: any;
declare const SCORM2004_RecordInteraction: any;
declare const glossary: any;
declare const YT: any;
declare const $: any;

const wrapperPage = (window.location.href).search('/pages') < 0 ? true : false;
const SCORM = (typeof SCORM2004_Initialize === "function");
const prevBtn = document.getElementById('header-footer-pre')!;
const nextBtn = document.getElementById('header-footer-next')!;

var courseGated: boolean;
var lastUpdated: string;
var videoObj: VideoApp;
let company: string;
let companyLogo: string;
let courseName: string;
let retrieveNumOfAttempt: boolean;
let retrieveScore: boolean;
let shuffleAnswer: boolean;
let setSCORMcompleteAtTheLastPage: boolean;
let passingGrade: number;
let maxScore: number;
let minScore: number;

interface PageObj {
    pageName: string;
    opened: boolean;
}
interface Page {
    id: string;
    file: string;
    title: string;
    subtitle: string;
    description: string;
    audioProgress: number;
    audioPlayed: boolean;
    finish: boolean;
    type: string;
}
interface Quiz {
    id: string;
    file: string;
    title: string;
    subtitle: string;
    description: string;
    audioProgress: number;
    audioPlayed: boolean;
    finish: boolean;
    type: string;
    objectives: string;
    pattern: string;
    response: string;
    result: string;
}
interface VideoApp {
    vb_BookmarkTime: string;
    vb_JumpToBookmarkSlide: boolean;
    vb_PasswordNumber: number;
    vb_PasswordPhrases: string[];
    vb_Passwords: string;
    vb_SendCompletion: number;
    vb_ShowPassword: boolean;
    vb_ShowVideoIntro: boolean;
    vb_ThisVideoHasBeenSeen: boolean;
    vb_VideoFail: boolean;
    vb_VideoName: string;
    vb_VideoReady: boolean;
}
interface Settings {
    company: string;
    companyLogo: string;
    courseName: string;
    courseGated: boolean;
    retrieveNumOfAttempt: boolean;
    retrieveScore: boolean;
    shuffleAnswer: boolean;
    setSCORMcompleteAtTheLastPage: boolean;
    objectiveID: string;
    passingGrade:number;
    minScore: number;
    maxScore: number;
    lastUpdated: string;
    videoApp: VideoApp;
    pages: Page[];
    quizzes: Quiz[];
    specialPages: Page[];
}
interface WrapperObj {
    student: string;
    currentPage: number;
    score: number;
    pageProgress: number;
    numOfAttempt: number;
    videoBookMark: string;
}
var pages: PageObj[] = [];
var spagePages: PageObj[] = [];
var courseVolume = 0;
var pdfPath = "./pdf/";
var audioPath = "../media/audio/";
var videoPath = "./media/video/";
let quizes: PageObj[] = [];
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
let startTimeStamp: any = null;
let numOfAttempt = 1;
let repeatCourse = false;
let suspendData:any = null;

let wrapperObj: WrapperObj = {
    student: student,
    currentPage: 0,
    score: 0,
    pageProgress: 0,
    numOfAttempt: numOfAttempt,
    videoBookMark: ''
};

var initScorm = (json:Settings) => {
    // keeping this "if" statement for future use
    if (SCORM && !courseStart) {
        SCORM2004_Initialize();
        startTimeStamp = new Date();

        let continueCourse = null;
        let completionStatus = SCORM2004_GetStatus();
        suspendData = SCORM2004_GetDataChunk() ? JSON.parse(SCORM2004_GetDataChunk()) : wrapperObj;

        if (completionStatus == null) {
            // set it to 4 (LESSON_STATUS_INCOMPLETE) rather than 6 (LESSON_STATUS_NOT_ATTEMPTED)
            SCORM2004_SetObjectiveStatus(SCORM2004_FindObjectiveIndexFromID(json.objectiveID), 4)
        }
        wrapperObj.student = SCORM2004_GetStudentName();

        if (retrieveScore) {
            wrapperObj.score = SCORM2004_GetScore() ? SCORM2004_GetScore() : 0;
        }
        else {
            wrapperObj.score = 0;
        }

        if (retrieveNumOfAttempt) {
            numOfAttempt = suspendData.numOfAttempt >= 3 ? 3 : suspendData.numOfAttempt;
            wrapperObj.numOfAttempt = suspendData.numOfAttempt;
        }

        scaledScore = wrapperObj.score / maxScore;
        SCORM2004_SetScore(0, json.maxScore, json.minScore);
        const courseName = document.getElementById('course-name-txt') as HTMLElement;
        courseName.innerText = json.courseName;
        if(parseInt(SCORM2004_GetBookmark()) > 0) {
            loadResumeRestart(json);
        } else {
            loadPages(json);
        }
        courseStart = true;
    }
}
var loadResumeRestart = (json:Settings) => {
    const resumeRestartWrap = document.getElementById('resume-restart-wrap') as HTMLElement;
    const loader = document.getElementById('content-loader') as HTMLElement;
    loader.classList.add('d-none');
    resumeRestartWrap.classList.remove('d-none');

    // the user choose to resume the course
    (document.getElementById('resume-btn') as HTMLElement).addEventListener('click', () => {
        const page = parseInt(SCORM2004_GetBookmark());
        if(page == (json.pages.length - 1)) {
            wrapperObj.currentPage = (json.pages.length - 1);
        } else if(page >= 1 && page < json.pages.length) {
            wrapperObj.currentPage = 1;
        } else if(page <= 0) {
            wrapperObj.currentPage = 1;
        } else {
            // just giving a fallback
            wrapperObj.currentPage = 1;
        }
        wrapperObj.videoBookMark = (<any> suspendData).videoBookMark;
        if(((<any> suspendData).videoBookMark).length > 0) {
            json.videoApp.vb_BookmarkTime = (<any> suspendData).videoBookMark;
        }
        loadPages(json);
        loader.classList.remove('d-none');
        resumeRestartWrap.classList.add('d-none');
    });

    // the user choose to restart the course
    (document.getElementById('restart-btn') as HTMLElement).addEventListener('click', () => {
        wrapperObj.currentPage = 0;
        loadPages(json);
        loader.classList.remove('d-none');
        resumeRestartWrap.classList.add('d-none');
    });
}
var lastPageInfo = () => {
    // reserve code
}
var setLastPage = () => {
    if(setSCORMcompleteAtTheLastPage)
    {
        setSCORMcomplete();
    } else {
        // reserve code
    }
}
var retakeCourse = () => {
    // reserve code
}
var addScore = () => {
    const iframe = document.querySelectorAll('#content .page')[wrapperObj.currentPage] as HTMLIFrameElement;
    const iframeObj = (<any>iframe.contentWindow);
    wrapperObj.score += iframeObj.scoreValue ? parseFloat(iframeObj.scoreValue) : 0;
    wrapperObj.score = wrapperObj.score >= 99 ? 100 : wrapperObj.score;
    if(SCORM && courseStart)
    {
        SCORM2004_SetScore(wrapperObj.score, maxScore, minScore)
    }
}
var doUnload = (strExitType:string = 'suspend') => {
    // don't call this function twice
    if (processedUnload == true){return}

    processedUnload = true;

    //record the session time
    var endTimeStamp = new Date();
    var totalMilliseconds = (endTimeStamp.getTime() - startTimeStamp.getTime());
    SCORM2004_CallSetValue("cmi.exit", strExitType.toUpperCase());
    SCORM2004_CallSetValue("adl.nav.request", "exitAll");

    SCORM2004_SaveTime(totalMilliseconds);

    SCORM2004_CallTerminate();
}
var closeCourse = (strExitType:string = 'suspend') => {
    setSCORMcomplete();
    if(SCORM && courseStart)
    {
        doUnload(strExitType);
    }
}
var setSCORMvalues = () => {
    if (SCORM && courseStart) {
        SCORM2004_SetDataChunk(JSON.stringify(wrapperObj));
    }
}
var setSCORMcomplete = () => {
    if (SCORM && courseStart) {
        wrapperObj.pageProgress = (pageProgress / pages.length * 100);
        setSCORMvalues();

        if(setSCORMcompleteAtTheLastPage) {
            SCORM2004_SetPassed();
        } else if (wrapperObj.score >= passingGrade) {
            SCORM2004_SetPassed();
        } else {
            SCORM2004_SetFailed();
        }
    }
}
var setCMIInteractions = (settings: any) => {
    var obj = new Object() as any;
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
        // keeping this for now
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
}
var getInteractionsCount = () => {
    var num = 0;
    if (SCORM) {
        num = SCORM2004_CallGetValue("cmi.interactions._count");
    }
    return num;
}
var setCMIInteractionsLatency = (count: number, response: string, result: string, time: number) => {
    if (SCORM) {
        // keeping this for now
        SCORM2004_CallSetValue(("cmi.interactions." + count + ".learner_response"), response);
        SCORM2004_CallSetValue(("cmi.interactions." + count + ".result"), result);
        SCORM2004_CallSetValue(("cmi.interactions." + count + ".latency"), ConvertMilliSecondsIntoSCORM2004Time(time));
    }
}
var setPageWhenGettingOut = () => {
    const currentPage = document.querySelectorAll('#content .page')[wrapperObj.currentPage] as HTMLIFrameElement;
    const currentPageContentWindow = (<any> currentPage.contentWindow);
    if(typeof currentPageContentWindow.pageReset === 'function') {
        currentPageContentWindow.pageReset();
    }
    Array.prototype.forEach.call((document.querySelectorAll('#content .page')), function(el, i){
        let iframeElem = el as HTMLIFrameElement;
        if(iframeElem.classList.contains('active')) {
            iframeElem.classList.remove('active');
        }
    });
}
var nextPage = () => {
    const iframePages = document.querySelectorAll('#content .page') as NodeList;
    const currentPage = document.querySelectorAll('#content .page')[wrapperObj.currentPage] as HTMLIFrameElement;
    const currentPageContentWindow = currentPage.contentWindow;
    let jumpToPage = () => {
        if((iframePages[wrapperObj.currentPage] as HTMLIFrameElement).getAttribute('data-type') == 'specialPage') {
            wrapperObj.currentPage += 1;
            jumpToPage();
        }
    };
    setPageWhenGettingOut();
    wrapperObj.currentPage += 1;
    jumpToPage();
    setPage();
}
var prevPage = () => {
    const iframePages = document.querySelectorAll('#content .page') as NodeList;
    const currentPage = document.querySelectorAll('#content .page')[wrapperObj.currentPage] as HTMLIFrameElement;
    const currentPageContentWindow = currentPage.contentWindow;
    let jumpToPage = () => {
        if((iframePages[wrapperObj.currentPage] as HTMLIFrameElement).getAttribute('data-type') == 'specialPage') {
            wrapperObj.currentPage -= 1;
            jumpToPage();
        }
    };
    setPageWhenGettingOut();
    wrapperObj.currentPage -= 1;
    jumpToPage();
    setPage();
}
var showCertainPage = (id:string) => {
    const currentPage = document.querySelectorAll('#content .page')[wrapperObj.currentPage] as HTMLIFrameElement;
    const currentPageContentWindow = currentPage.contentWindow;
    setPageWhenGettingOut();

    pages.forEach((element: PageObj, index) => {
        if(element.pageName == id) {
            wrapperObj.currentPage = index;
            return false;
        }
    });
    setPage();
}
var setResourceBalloon = () => {
    let resourceWrap = document.getElementById('header-footer-resources-wrap')!;
    let resource = document.getElementById('header-footer-resources')!;
    let speechBalloon =  document.getElementById('header-footer-resources-speech-balloon')!;
    let showHideSpeechBallon = () => {
        if(speechBalloon.classList.contains('active')) {
            speechBalloon.classList.remove('active');
        } else {
            speechBalloon.classList.add('active');
        }
    };
    resource.addEventListener('click', showHideSpeechBallon);
    // reserve code
    // speechBalloon.addEventListener('mouseout', showHideSpeechBallon);
}
var setVolume = () => {
    const iframe = document.querySelectorAll('#content .page')[wrapperObj.currentPage] as HTMLIFrameElement;
    const iframeObj = (<any>iframe.contentWindow);
    const volumeIcon = document.getElementById('header-footer-icon') as HTMLElement;
    const volumeSlider = (document.getElementById('volume-slider') as HTMLInputElement);
    let setVolumeIcon = (value:number) => {
        if(value <= 0) {
            if(volumeIcon.classList.contains('bi-volume-down-fill')) {
                volumeIcon.classList.remove('bi-volume-down-fill');
            } else if(volumeIcon.classList.contains('bi-volume-up-fill')) {
                volumeIcon.classList.remove('bi-volume-up-fill');
            }
            volumeIcon.classList.add('bi-volume-off-fill');
        } else if (value > 0 && value <= 25) {
            if(volumeIcon.classList.contains('bi-volume-off-fill')) {
                volumeIcon.classList.remove('bi-volume-off-fill');
            } else if(volumeIcon.classList.contains('bi-volume-up-fill')) {
                volumeIcon.classList.remove('bi-volume-up-fill');
            }
            volumeIcon.classList.add('bi-volume-down-fill');
        } else if(value >= 75) {
            if(volumeIcon.classList.contains('bi-volume-off-fill')) {
                volumeIcon.classList.remove('bi-volume-off-fill');
            } else if(volumeIcon.classList.contains('bi-volume-down-fill')) {
                volumeIcon.classList.remove('bi-volume-down-fill');
            }
            volumeIcon.classList.add('bi-volume-up-fill');
        }
    };
    volumeSlider.style.background = `linear-gradient(to right, #8db305 0%, #8db305 ${volumeSlider.value} %, #cccccc ${volumeSlider.value}%, #cccccc 100%)`;
    volumeSlider.oninput = (e:Event | any) => {
        let elem = e.target;
        let value = (elem.value - elem.min) / (elem.max - elem.min);
        courseVolume = value;
        elem.style.background = `linear-gradient(to right, #8db305 0%, #8db305 ${(value * 100)}%, #cccccc ${(value * 100)}%, #cccccc 100%)`;
        setVolumeIcon(Math.round((courseVolume * 100)));
        if(iframeObj.setPageVolume) {
            iframeObj.setPageVolume(courseVolume);
        }
      };
    setVolumeIcon(Math.round(parseInt(volumeSlider.value)));
}
var disablePrevBtn = () => {
    if(prevBtn.classList.contains('active')) {
        prevBtn.classList.remove('active');
    }
    prevBtn.removeEventListener('click', prevPage);
}
var enablePrevBtn = () => {
    if(!prevBtn.classList.contains('active')) {
        prevBtn.classList.add('active');
    }
    prevBtn.removeEventListener('click', prevPage);
    prevBtn.addEventListener('click', prevPage);
}
var disableNextBtn = () => {
    if(nextBtn.classList.contains('active')) {
        nextBtn.classList.remove('active');
    }
    nextBtn.removeEventListener('click', nextPage);
}
var enableNextBtn = () => {
    if(!nextBtn.classList.contains('active')) {
        nextBtn.classList.add('active');
    }
    nextBtn.removeEventListener('click', nextPage);
    nextBtn.addEventListener('click', nextPage);
}
var setPage = () => {
    const iframe = document.querySelectorAll('#content .page')[wrapperObj.currentPage] as HTMLIFrameElement;
    const iframeObj = (<any>iframe.contentWindow);
    const setVideoOverlayWrapTop = () => {
        const videoOverlayWrapElem = (document.getElementById('video-overlay-wrap') as HTMLElement);
        const rectY = iframe.getBoundingClientRect().y;
        const rectWidth = (<any> (iframeObj.document.getElementById('my-video') as HTMLVideoElement).getClientRects())[0].width;
        if(rectY <= 58) {
            videoOverlayWrapElem.style.top = `58px`;
        } else {
            videoOverlayWrapElem.style.top = `${rectY}px`;
        }
        videoOverlayWrapElem.style.width = `${rectWidth}px`;
    }
    if(SCORM && courseStart) {
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
    } else if (wrapperObj.currentPage == 1 && iframe.getAttribute('data-id') == 'goToVideoPage') {
        enablePrevBtn();
        disableNextBtn();
    } else if (wrapperObj.currentPage > 1 && iframe.getAttribute('data-id') == 'lastPage') {
        enablePrevBtn();
        disableNextBtn();
        setLastPage();
    } else if(iframe.getAttribute('data-id') == 'videoPage') {
        enablePrevBtn();
        disableNextBtn();
    } else {
        disablePrevBtn();
        disableNextBtn();
    }
    iframe.classList.add('active');
    pages[wrapperObj.currentPage].opened = true;
    setVolume();
    if(iframeObj.initPage) {
        iframeObj.initPage();
    }
    if(iframeObj.setPageVolume) {
        iframeObj.setPageVolume(courseVolume);
    }
    if(iframe.getAttribute('data-id') == 'videoPage') {
        setVideoOverlayWrapTop();
        window.removeEventListener('resize', setVideoOverlayWrapTop);
        window.addEventListener('resize', setVideoOverlayWrapTop);
    }
}
var GetPlayer = () => {
    let playerObj: VideoApp = videoObj;
    return {
        GetPlayerObj: () => {
            return playerObj;
        },
        SetPlayerObj: (obj: VideoApp) => {
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
        SetVar: (property: string, value: string|boolean|number) => {
            if(playerObj.hasOwnProperty(property)) {
                (<any> playerObj)[property] = value;
                if(property == 'vb_VideoReady' && value == true) {
                    const goToVideoPage = document.querySelector('#content .page[data-id="goToVideoPage"]') as HTMLIFrameElement;
                    const contentWindow = (<any> goToVideoPage.contentWindow).document;
                    const videoIframe  = (<any> (document.querySelector('.page[data-id="videoPage"]') as HTMLIFrameElement));
                    const videoElem  = ((videoIframe.contentWindow).document.getElementById('my-video') as HTMLVideoElement);
                    
                    (contentWindow.getElementById('go-to-video-loading') as HTMLElement).classList.add('d-none');
                    (contentWindow.getElementById('go-to-video') as HTMLElement).classList.remove('d-none');
                    videoElem.addEventListener('canplay', (e) => {
                        const duration = videoElem.duration ? videoElem.duration : 0;
                        let durationText = '';
                        if(duration > 60) {
                            durationText = ((duration / 60) > 1 ? `${duration / 60} minutes ` : `${duration / 60} minute `) + (duration > 0) ? `${duration} seconds` : `${duration} second`;
                        } else {
                            durationText = (duration > 0) ? `${duration} seconds` : `${duration} second`;
                        }
                        ((<any> (document.querySelector('.page[data-id="goToVideoPage"]') as HTMLIFrameElement).contentWindow).document.getElementById('page-video-duration') as HTMLElement).innerText = durationText;
                    });
                }
                if(property == 'vb_ThisVideoHasBeenSeen' && value == true) {
                    /* 
                        this make sure that the user is in the videoPage before running this
                        "if statement" to prevent any issue when the user Resume when re-opening
                        the course.
                    */
                    const iframe = document.querySelectorAll('#content .page')[wrapperObj.currentPage] as HTMLIFrameElement;
                    if(iframe.getAttribute('data-id') == 'videoPage') {
                        showCertainPage('videoEnd');
                    }
                }
                if(property == 'vb_BookmarkTime' && value != '') {
                    wrapperObj.videoBookMark = <string> value;
                }
                if(property == 'vb_SendCompletion' && value == 1) {
                    wrapperObj.videoBookMark = playerObj.vb_BookmarkTime;
                    if(typeof SCORM2004_CallSetValue == 'function') {
                        setSCORMvalues();
                    }
                }
                return true;
            } else {
                return false;
            }
        },
        GetVar: (property: string) => {
            if(playerObj.hasOwnProperty(property)) {
                return (<any> playerObj)[property];
            } else {
                return false;
            }
        }
    };
};
var showTogglePassword = () => {
    const videoWrap = document.getElementById('video-password-wrap') as HTMLElement;

    const slideDown = gsap.to('#video-password-wrap', {
        duration: 0.6, 
        height: 'auto',
        paused: true
    })
    const slideUp = gsap.to('#video-password-wrap', {
        duration: 1, 
        height: '0',
        paused: true
    })
    slideDown.play();
    setTimeout(() => slideUp.play(), 5000);
}
var hidePassword = () => {
    const videoWrap = document.getElementById('video-password-wrap') as HTMLElement;

    const slideUp = gsap.to('#video-password-wrap', {
        duration: 1, 
        height: '0',
        ease: "back.inOut(1.7)",
        paused: true
    })
    slideUp.play();
}
var showVideoOverlay = () => {
    let elem = (document.getElementById('video-overlay-wrap') as HTMLElement);
    if(elem.classList.contains('d-none')) {
        elem.classList.remove('d-none');
    }
}
var hideVideoOverlay = () => {
    let elem = (document.getElementById('video-overlay-wrap') as HTMLElement);
    if(!elem.classList.contains('d-none')) {
        elem.classList.add('d-none');
    }
}
var loadPages = (json:Settings) => {
    const contentElem = document.getElementById('content')!;
    let totalPages = 0;
    let pagesLoaded = 0;
    let allPagesLoaded = () => {
        const loader = document.getElementById('content-loader');
        loader?.classList.add('d-none');
        setResourceBalloon();
        setPage();
    };
    let generatePage = (obj: Page | Quiz, index: number, type: string) => {
        let iframeElem = document.createElement('iframe');
        iframeElem.src = `./pages/${obj.file}`;
        iframeElem.setAttribute('data-type', type); 
        iframeElem.setAttribute('data-id', obj.id); 
        iframeElem.className = 'page';
        contentElem.appendChild(iframeElem);
        contentElem.querySelectorAll('.page')[index].addEventListener('load', (e) => {
            var elem = e.target as HTMLIFrameElement;
            var iframeWin = (<any> elem.contentWindow);
            
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
            if(iframeWin.setPageVolume) {
                iframeWin.setPageVolume();
            }
            if(iframeWin.pageSet) {
                iframeWin.pageSet();
            }
            if(pagesLoaded == totalPages) {
                allPagesLoaded();
            }
        });
    };
    let setPageForAry = (obj:Page, type: string) => {
        let page: PageObj = {
            pageName: obj.id,
            opened: false
        };
        if(type == 'specialPage') {
            spagePages.push(page);
        } else if(type == 'quiz') {
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
    minScore = json.minScore;
    lastUpdated = json.lastUpdated;
    videoObj = json.videoApp;
    if(document.getElementById('course-name-txt')) {
        (document.getElementById('course-name-txt') as HTMLElement).innerHTML = `${courseName}`;
    }
    if(json.pages) {
        totalPages += json.pages.length;
        json.pages.forEach((value, index) => {
            switch(value.type) {
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
}
(document.getElementById('continue-save-btn') as HTMLElement)?.addEventListener('click', () => {
    showCertainPage('continueSave');
});
(document.getElementById('video-password-ok-btn') as HTMLElement)?.addEventListener('click', hidePassword);