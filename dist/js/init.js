"use strict";
var init = (json) => {
    if (wrapperPage) {
        // check if the course is in SCORM or in development
        if (SCORM && !courseStart) {
            console.log(SCORM);
            console.log(courseStart);
            initScorm();
        }
        else {
            loadPages(json);
        }
    }
};
fetch('./js/settings.json')
    .then(response => response.json())
    .then(json => init(json));
/* {
    "company": "",
    "companyLogo": "",
    "courseName": "",
    "pages": [{
        "id": "",
        "title": "",
        "description": "",
        "audioProgress": 0,
        "audioPlayed": false,
        "finish": false
    }],
    "quizzes": [{
        "id": "",
        "title": "",
        "description": "",
        "audioProgress": 0,
        "audioPlayed": false,
        "finish": false,
        "type": "",
        "objectives": "",
        "pattern": "",
        "response": "",
        "result": ""
    }]
} */ 
