"use strict";
if ((window.location.href).search('/pages') < 0) {
    /* var init = (json) => {
        // check if the course is in SCORM or in development
        if (SCORM && !courseStart) {
            initScorm(json);
        }
        else {
            loadPages(json);
        }
    };
    fetch('./js/settings.json')
        .then(response => response.json())
        .then(json => init(json)); */
    if ((window.location.href).search('/pages') < 0) {
        var init = (json) => {
            // check if the course is in SCORM or in development
            if (SCORM && !courseStart) {
                initScorm(json);
            }
            else {
                loadPages(json);
            }
        };
        init(settings);
    }
}