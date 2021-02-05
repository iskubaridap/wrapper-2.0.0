var init = (json:Settings) => {
    if(wrapperPage) {
        // check if the course is in SCORM or in development
        if(SCORM && !courseStart) {
            initScorm(json);
        } else {
            loadPages(json);
        }
    }
};
fetch('./js/settings.json')
    .then(response => response.json())
    .then(json => init(json));