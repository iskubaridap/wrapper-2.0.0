declare const gsap: any;

interface InfoPage {
    id: string;
    file: string;
    title: string;
    subtitle: string;
    description: string;
    company: string;
    companyLogo: string;
    courseName: string;
    shuffleAnswer: boolean;
    lastUpdated: string;
}
interface TweenObj {
    timing: number;
    tween: any;
}
var info: InfoPage = {
    id: '',
    file: '',
    title: '',
    subtitle: '',
    description: '',
    company: '',
    companyLogo: '',
    courseName: '',
    shuffleAnswer: false,
    lastUpdated: '',
};
var insideOfWrapper:boolean = self != top;
var pageFinish = false;
const audio = document.getElementById('audio') as HTMLAudioElement;
const videoBG = document.getElementById('video-bg') as HTMLAudioElement;
const videoPlayer = document.getElementById('my-video') as HTMLVideoElement;
const playBtn = document.getElementById('audio-play-btn') as HTMLElement;
const pageWrap = document.getElementById('page-ready-wrap') as HTMLDivElement;
const showPage = document.querySelectorAll('.show-page') as NodeList;
const saveCloseBtn = document.getElementById('save-video') as HTMLDivElement;
const closeCourseBtn = document.getElementById('close-course') as HTMLDivElement;
const courseVideo = document.getElementById('my-video') as HTMLVideoElement;
let tweenAry: TweenObj[] = new Array();

var showPlayBtn = () => {
    pageWrap.style.display = 'block';
}
var pageLoadAudio = () => {
    if(audio) {
        const audioSourceFirst = audio.querySelector('source') as HTMLSourceElement;
        const audioSourceArray = audio.querySelectorAll('source');
        // reserve code
        // const audioSourcePath = insideOfWrapper ? `../${(<any> parent).audioPath}${audioSourceFirst.getAttribute('data-path')}` : `../../media/audio/${audioSourceFirst.getAttribute('data-path')}`;
        // audioSourceFirst?.setAttribute('src', audioSourcePath);
        audio.load();
    }
}
var pageSet = () => {
    const titles = document.querySelectorAll('.page-title') as NodeList;
    const subtitles = document.querySelectorAll('.page-subtitle') as NodeList;
    const descriptions = document.querySelectorAll('.page-description') as NodeList;
    const logos = document.querySelectorAll('.company-logo') as NodeList;
    const lastUpdated = document.querySelectorAll('.last-updated') as NodeList;

    titles?.forEach((value, index) => {
        let elem = value as HTMLElement;
        elem.innerHTML = info.title;
    });
    subtitles?.forEach((value, index) => {
        let elem = value as HTMLElement;
        elem.innerHTML = info.subtitle;
    });
    descriptions?.forEach((value, index) => {
        let elem = value as HTMLElement;
        elem.innerHTML = info.description;
    });
    logos?.forEach((value, index) => {
        let elem = value as HTMLImageElement;
        elem.src = `../img/${info.companyLogo}`;
    });
    lastUpdated?.forEach((value, index) => {
        let elem = value as HTMLElement;
        elem.innerHTML = info.lastUpdated;
    });
}
var pageReset = ()=> {
    stopAudio();
    if(videoBG) {
        videoBG.pause();
        videoBG.currentTime = 0;
    }
    if(insideOfWrapper) {
        if(videoPlayer) {
            let playBtn = document.getElementById('round-button') as HTMLElement;
            // not sure if vb_ThisVideoHasBeenSeen is change into true, you can turn it back to false if needed.
            if((<any> parent).GetPlayer().GetVar('vb_ThisVideoHasBeenSeen') == true) {
                videoPlayer.pause();
                videoPlayer.currentTime = 0;
                if(playBtn.classList.contains('play')) {
                    playBtn.classList.remove('play');
                    playBtn.classList.add('pause');
                }
            } else {
                if(playBtn.classList.contains('play')) {
                    playBtn.classList.remove('play');
                    playBtn.classList.add('pause');
                }
                videoPlayer.pause();
            }
        }
    }
    tweenAry.forEach((value, index) => {
        value.tween.reverse();
    });
}
var pauseAudio = () => {
    if(audio) {
        audio.pause();
    }
    tweenAry.forEach((value, index) => {
        value.tween.pause();
    });
}
var audioPlay = () => {
    if(audio) {
        let playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.then(_ => {
                // Automatic playback started!
                // Show playing UI.
                videoBG?.play();
                playAnimation();
            })
            .catch(error => {
                // Auto-play was prevented
                // Show paused UI.
                stopAudio();
                showPlayBtn();
                videoBG?.pause();
                if(insideOfWrapper) {
                    (<any> parent).disableNextBtn();
                }
            });
        }
    }
}
var stopAudio = () => {
    if(audio) {
        audio.pause();
        audio.currentTime = 0;
    }
}
var setPageVolume = (vol?: number | null) => {
    if(insideOfWrapper && vol) {
        if(audio) {
            audio.volume = vol;
        }
        if(videoPlayer) {
            videoPlayer.volume = vol;
        }
    }
}
var audioFinish = () => {
    pageFinish = true;
    stopAudio();
    if(insideOfWrapper) {
        if((<any> parent).courseGated) {
            (<any> parent).enableNextBtn();
        }
    }
}
var playAnimation = () => {
    tweenAry.forEach((value, index) => {
        if(audio.currentTime >= value.timing && audio.currentTime <= (value.timing + 0.5)) {
            value.tween.play();
        }
    });
}
var initPage = () => {
    audioPlay();
    if(insideOfWrapper) {
        if(courseVideo) {
            (<any> parent).showVideoOverlay();
        } else {
            (<any> parent).hideVideoOverlay();
        }
    }
}
var slideUp = (elem: string, _timing: number = 0, _duration: number = 0.6, calllback?: Function) => {
    let height: number = 0;
    let execute = (target: string) => {
        let obj: TweenObj = {
            timing: _timing,
            tween: gsap.to(target, {
                duration: _duration, 
                height: 0,
                ease: "back.inOut(1.7)",
                paused: true,
                onComplete: () => {calllback} 
            })
        };
        tweenAry.push(obj);
    }
    if(document.querySelectorAll(elem).length > 0) {
        document.querySelectorAll(elem).forEach(value => {
            let _elem = value as HTMLElement;
            _elem.setAttribute('data-height', (<any> _elem).offsetHeight);
            _elem.setAttribute('style', '');
            _elem.style.overflow = 'auto';
        });
        execute(elem);
    }
}
var slideDown = (elem: string, _timing: number = 0, _duration: number = 0.6, calllback?: Function) => {
    let height: number = 0;
    let execute = (target: string) => {
        let obj: TweenObj = {
            timing: _timing,
            tween: gsap.to(target, {
                duration: _duration, 
                height: 'auto',
                ease: "back.inOut(1.7)",
                paused: true,
                onComplete: () => {calllback} 
            })
        };
        tweenAry.push(obj);
    }
    if(document.querySelectorAll(elem).length > 0) {
        document.querySelectorAll(elem).forEach(value => {
            let _elem = value as HTMLElement;
            _elem.setAttribute('style', '');
            _elem.style.height = '0';
            _elem.style.overflow = 'hidden';
        })
        execute(elem);
    }
}
var slideToggle = (elem: string) => {
    let _duration: number = 0.6;
    if(document.querySelectorAll(elem).length > 0) {
        document.querySelectorAll(elem).forEach(value => {
            let _elem = value as HTMLElement;
            _elem.style.overflow = 'hidden';
            if(_elem.style.height == '0px') {
                gsap.to(elem, {
                    duration: _duration, 
                    height: 'auto'
                })
            } else {
                gsap.to(elem, {
                    duration: _duration, 
                    height: '0'
                })
            }
        });
    }
}
var fadeIn = (elem: string, _timing: number = 0, _duration: number = 0.6, calllback?: Function) => {
    let execute = (target: string) => {
        let obj: TweenObj = {
            timing: _timing,
            tween: gsap.to(target, {
                duration: _duration, 
                // display: 'block', 
                opacity: 1, 
                ease: "none", 
                paused: true,
                onComplete: () => {calllback} 
            })
        };
        tweenAry.push(obj);
    }
    if(document.querySelectorAll(elem).length > 0) {
        document.querySelectorAll(elem).forEach(value => {
            let _elem = value as HTMLElement;
            _elem.setAttribute('style', '');
            // _elem.style.display = 'none';
            _elem.style.opacity = '0';
        })
        execute(elem);
    }
}
var fadeOut = (elem: string, _timing: number = 0, _duration: number = 0.6, calllback?: Function) => {
    let elemStyle: any = null;
    let execute = (target: string) => {
        console.log(target)
        let obj: TweenObj = {
            timing: _timing,
            tween: gsap.to(target, {
                duration: _duration, 
                // display: 'none', 
                opacity: 0, 
                ease: "none", 
                paused: true,
                onComplete: () => {calllback} 
            })
        };
        tweenAry.push(obj);
    }
    if(document.querySelectorAll(elem).length > 0) {
        execute(elem);
    }
}
var delay = (action: Function, time: number) => {
    setTimeout(action, time);
}

var showVideoPassword = () => {
    if(Math.round(courseVideo.currentTime) == 3) {
        if(insideOfWrapper) {
            (<any> parent).showTogglePassword();
        }
    }
}
var closeCourseAction = (strExitType: string) => {
    if(insideOfWrapper) {
        (<any> parent).closeCourse(strExitType);
    }
}


playBtn?.addEventListener('click', () => {
    audioPlay();
    if(insideOfWrapper) {
        if(!(<any> parent).courseGated) {
            (<any> parent).enableNextBtn();
        }
    }
    if(pageWrap.style.display != 'none') {
        pageWrap.style.display = 'none';
    }
})
audio?.addEventListener("timeupdate", playAnimation);
audio?.addEventListener("ended", function () {
    pageFinish = true;
});
courseVideo?.addEventListener('timeupdate', showVideoPassword);
closeCourseBtn?.addEventListener('click', () => closeCourseAction('suspend'));
saveCloseBtn?.addEventListener('click', () => closeCourseAction('suspend'));
showPage.forEach(elem => {
    const item = elem as HTMLElement;
    const id = item.getAttribute('data-page');
    if(insideOfWrapper) {
        item.addEventListener('click', () => {(<any> parent).showCertainPage(id)});
    }
});

if (insideOfWrapper) {
    // if this page is inside of the wrapper
} else {
    // if this page is NOT inside of the wrapper
    pageSet();
    initPage();
    setPageVolume();
}
pageLoadAudio();
// pauseAudio();