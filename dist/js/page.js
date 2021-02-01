"use strict";
var info = {
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
var insideOfWrapper = self != top;
var pageFinish = false;
const audio = document.getElementById('audio');
const videoBG = document.getElementById('video-bg');
const videoPlayer = document.getElementById('my-video');
const playBtn = document.getElementById('audio-play-btn');
const pageWrap = document.getElementById('page-ready-wrap');
const showPage = document.querySelectorAll('.show-page');
const saveCloseBtn = document.getElementById('save-video');
const closeCourseBtn = document.getElementById('close-course');
const courseVideo = document.getElementById('my-video');
let tweenAry = new Array();
var showPlayBtn = () => {
    pageWrap.style.display = 'block';
};
var pageLoadAudio = () => {
    if (audio) {
        const audioSourceFirst = audio.querySelector('source');
        const audioSourceArray = audio.querySelectorAll('source');
        // reserve code
        // const audioSourcePath = insideOfWrapper ? `../${(<any> parent).audioPath}${audioSourceFirst.getAttribute('data-path')}` : `../../media/audio/${audioSourceFirst.getAttribute('data-path')}`;
        // audioSourceFirst?.setAttribute('src', audioSourcePath);
        audio.load();
    }
};
var pageSet = () => {
    const titles = document.querySelectorAll('.page-title');
    const subtitles = document.querySelectorAll('.page-subtitle');
    const descriptions = document.querySelectorAll('.page-description');
    const logos = document.querySelectorAll('.company-logo');
    const lastUpdated = document.querySelectorAll('.last-updated');
    titles === null || titles === void 0 ? void 0 : titles.forEach((value, index) => {
        let elem = value;
        elem.innerHTML = info.title;
    });
    subtitles === null || subtitles === void 0 ? void 0 : subtitles.forEach((value, index) => {
        let elem = value;
        elem.innerHTML = info.subtitle;
    });
    descriptions === null || descriptions === void 0 ? void 0 : descriptions.forEach((value, index) => {
        let elem = value;
        elem.innerHTML = info.description;
    });
    logos === null || logos === void 0 ? void 0 : logos.forEach((value, index) => {
        let elem = value;
        elem.src = `../img/${info.companyLogo}`;
    });
    lastUpdated === null || lastUpdated === void 0 ? void 0 : lastUpdated.forEach((value, index) => {
        let elem = value;
        elem.innerHTML = info.lastUpdated;
    });
};
var pageReset = () => {
    stopAudio();
    if (videoBG) {
        videoBG.pause();
        videoBG.currentTime = 0;
    }
    if (insideOfWrapper) {
        if (videoPlayer) {
            let playBtn = document.getElementById('round-button');
            // not sure if vb_ThisVideoHasBeenSeen is change into true, you can turn it back to false if needed.
            if (parent.GetPlayer().GetVar('vb_ThisVideoHasBeenSeen') == true) {
                videoPlayer.pause();
                videoPlayer.currentTime = 0;
                if (playBtn.classList.contains('play')) {
                    playBtn.classList.remove('play');
                    playBtn.classList.add('pause');
                }
            }
            else {
                if (playBtn.classList.contains('play')) {
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
};
var pauseAudio = () => {
    if (audio) {
        audio.pause();
    }
    tweenAry.forEach((value, index) => {
        value.tween.pause();
    });
};
var audioPlay = () => {
    if (audio) {
        let playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.then(_ => {
                // Automatic playback started!
                // Show playing UI.
                videoBG === null || videoBG === void 0 ? void 0 : videoBG.play();
                playAnimation();
            })
                .catch(error => {
                // Auto-play was prevented
                // Show paused UI.
                stopAudio();
                showPlayBtn();
                videoBG === null || videoBG === void 0 ? void 0 : videoBG.pause();
                if (insideOfWrapper) {
                    parent.disableNextBtn();
                }
            });
        }
    }
};
var stopAudio = () => {
    if (audio) {
        audio.pause();
        audio.currentTime = 0;
    }
};
var setPageVolume = (vol) => {
    if (insideOfWrapper && vol) {
        if (audio) {
            audio.volume = vol;
        }
        if (videoPlayer) {
            videoPlayer.volume = vol;
        }
    }
};
var audioFinish = () => {
    pageFinish = true;
    stopAudio();
    if (insideOfWrapper) {
        if (parent.courseGated) {
            parent.enableNextBtn();
        }
    }
};
var playAnimation = () => {
    tweenAry.forEach((value, index) => {
        if (audio.currentTime >= value.timing && audio.currentTime <= (value.timing + 0.5)) {
            value.tween.play();
        }
    });
};
var initPage = () => {
    audioPlay();
    if (courseVideo) {
        parent.showVideoOverlay();
    }
    else {
        parent.hideVideoOverlay();
    }
};
// var slideDown = (elem: HTMLElement, delay: number = 0) => {
//     let execute = (target: HTMLElement) => {
//         elem.classList.add('active')
//         elem.style.height = "auto"
//         /** Get the computed height of the container. */
//         var height = elem.clientHeight + "px"
//         /** Set the height of the content as 0px, */
//         /** so we can trigger the slide down animation. */
//         elem.style.height = "0px"
//         /** Do this after the 0px has applied. */
//         /** It's like a delay or something. MAGIC! */
//         setTimeout(() => {
//             elem.style.height = height
//         }, 0)
//     }
//     if(elem) {
//          setTimeout(() => execute(elem), delay);
//     }
// }
// var slideUp = (elem: HTMLElement, delay: number = 0) => {
//     let execute = (target: HTMLElement) => {
//         /** Set the height as 0px to trigger the slide up animation. */
//         elem.style.height = "0px"
//         /** Remove the `active` class when the animation ends. */
//         elem.addEventListener('transitionend', () => {
//             elem.classList.remove('active')
//         }, {once: true})
//     }
//     if(elem) {
//          setTimeout(() => execute(elem), delay);
//     }
// }
// var fadeOut = (elem: HTMLElement, delay: number = 0, duration: number = 600, calllback?: Function) => {
//     let execute = (target: HTMLElement) => {
//         let element = (<any> elem);
//         let elemStyle = getComputedStyle(elem);
//         element.style.opacity = 1;
//         let last = +new Date();
//         let tick = () => {
//             let time = (<any> new Date());
//             element.style.opacity = - element.style.opacity + (time - last) / duration;
//             last = +new Date();
//             if (+element.style.opacity <= 1) {
//                 (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16);
//             } else {
//                 element.style.display = 'none'
//                 if(calllback) {
//                     calllback();
//                 }
//             }
//         };
//         tick();
//     }
//     if(elem) {
//         setTimeout(() => execute(elem), delay);
//     }
// }
// var fadeIn = (elem: HTMLElement, delay: number = 0, duration: number = 600, calllback?: Function) => {
//     let execute = (target: HTMLElement) => {
//         let element = (<any> target);
//         let elemStyle = getComputedStyle(target);
//         if(elemStyle.display == 'none') {
//             element.style.display = 'block';
//         } else {
//             element.style.display = '';
//         }
//         element.style.opacity = 0;
//         let last = +new Date();
//         let tick = () => {
//             let time = (<any> new Date());
//             element.style.opacity = + element.style.opacity + (time - last) / duration;
//             last = +new Date();
//             if (+element.style.opacity < 1) {
//                 (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16);
//             } else {
//                 if(calllback) {
//                     calllback();
//                 }
//             }
//         };
//         tick();
//     }
//     if(elem) {
//         setTimeout(() => execute(elem), delay);
//     }
// }
var slideUp = (elem, _timing = 0, _duration = 0.6, calllback) => {
    let height = 0;
    let execute = (target) => {
        let obj = {
            timing: _timing,
            tween: gsap.to(target, {
                duration: _duration,
                height: 0,
                ease: "back.inOut(1.7)",
                paused: true,
                onComplete: () => { calllback; }
            })
        };
        tweenAry.push(obj);
    };
    if (document.querySelectorAll(elem)) {
        document.querySelectorAll(elem).forEach(value => {
            let _elem = value;
            _elem.setAttribute('data-height', _elem.offsetHeight);
            _elem.setAttribute('style', '');
            _elem.style.overflow = 'auto';
        });
        execute(elem);
    }
};
var slideDown = (elem, _timing = 0, _duration = 0.6, calllback) => {
    let height = 0;
    let execute = (target) => {
        let obj = {
            timing: _timing,
            tween: gsap.to(target, {
                duration: _duration,
                height: 'auto',
                ease: "back.inOut(1.7)",
                paused: true,
                onComplete: () => { calllback; }
            })
        };
        tweenAry.push(obj);
    };
    if (document.querySelectorAll(elem)) {
        document.querySelectorAll(elem).forEach(value => {
            let _elem = value;
            _elem.setAttribute('style', '');
            _elem.style.height = '0';
            _elem.style.overflow = 'hidden';
        });
        execute(elem);
    }
};
var slideToggle = (elem) => {
    let _duration = 0.6;
    if (document.querySelectorAll(elem)) {
        document.querySelectorAll(elem).forEach(value => {
            let _elem = value;
            _elem.style.overflow = 'hidden';
            if (_elem.style.height == '0px') {
                gsap.to(elem, {
                    duration: _duration,
                    height: 'auto'
                });
            }
            else {
                gsap.to(elem, {
                    duration: _duration,
                    height: '0'
                });
            }
        });
    }
};
var fadeIn = (elem, _timing = 0, _duration = 0.6, calllback) => {
    let execute = (target) => {
        let obj = {
            timing: _timing,
            tween: gsap.to(target, {
                duration: _duration,
                // display: 'block', 
                opacity: 1,
                ease: "none",
                paused: true,
                onComplete: () => { calllback; }
            })
        };
        tweenAry.push(obj);
    };
    if (document.querySelectorAll(elem)) {
        document.querySelectorAll(elem).forEach(value => {
            let _elem = value;
            _elem.setAttribute('style', '');
            // _elem.style.display = 'none';
            _elem.style.opacity = '0';
        });
        execute(elem);
    }
};
var fadeOut = (elem, _timing = 0, _duration = 0.6, calllback) => {
    let elemStyle = null;
    let execute = (target) => {
        console.log(target);
        let obj = {
            timing: _timing,
            tween: gsap.to(target, {
                duration: _duration,
                // display: 'none', 
                opacity: 0,
                ease: "none",
                paused: true,
                onComplete: () => { calllback; }
            })
        };
        tweenAry.push(obj);
    };
    if (document.querySelectorAll(elem)) {
        execute(elem);
    }
};
var delay = (action, time) => {
    setTimeout(action, time);
};
var showVideoPassword = () => {
    if (Math.round(courseVideo.currentTime) == 3) {
        if (insideOfWrapper) {
            parent.showTogglePassword();
        }
    }
};
var closeCourseEvent = () => {
    if (insideOfWrapper) {
        parent.closeCourse();
    }
};
playBtn === null || playBtn === void 0 ? void 0 : playBtn.addEventListener('click', () => {
    audioPlay();
    if (insideOfWrapper) {
        if (!parent.courseGated) {
            parent.enableNextBtn();
        }
    }
    if (pageWrap.style.display != 'none') {
        pageWrap.style.display = 'none';
    }
});
audio === null || audio === void 0 ? void 0 : audio.addEventListener("timeupdate", playAnimation);
audio === null || audio === void 0 ? void 0 : audio.addEventListener("ended", function () {
    pageFinish = true;
});
courseVideo === null || courseVideo === void 0 ? void 0 : courseVideo.addEventListener('timeupdate', showVideoPassword);
closeCourseBtn === null || closeCourseBtn === void 0 ? void 0 : closeCourseBtn.addEventListener('click', closeCourseEvent);
saveCloseBtn === null || saveCloseBtn === void 0 ? void 0 : saveCloseBtn.addEventListener('click', closeCourseEvent);
showPage.forEach(elem => {
    const item = elem;
    const id = item.getAttribute('data-page');
    if (insideOfWrapper) {
        item.addEventListener('click', () => { parent.showCertainPage(id); });
    }
});
if (insideOfWrapper) {
    // if this page is inside of the wrapper
}
else {
    // if this page is NOT inside of the wrapper
    setPageVolume();
}
pageLoadAudio();
// pauseAudio();
