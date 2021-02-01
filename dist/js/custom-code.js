/* 
    This is provided to override any existing functions in wrapper.js, page.js and 
    quiz.js before initializing the course.
    Or just making any customize code for certain course.

    This is to maintain wrapper.js, page.js and 
    quiz.js what they are and using this js file if there
    is a certain course that has difference from the others.
 */
/* 
    vb_BookmarkTime: string (json - {"[video-name: string]": 0:number})
    vb_JumpToBookmarkSlide: boolean
    vb_PasswordNumber: number
    vb_PasswordPhrases: string
    vb_Passwords: string
    vb_SendCompletion: number
    vb_ShowPassword: boolean
    vb_ShowVideoIntro: boolean
    vb_ThisVideoHasBeenSeen: boolean
    vb_VideoFail: boolean
    vb_VideoName: string
    vb_VideoReady: boolean
*/

slideDown('#page-title-1-wrap', 4, 2);
fadeIn('#company-logo-bottom', 6, 0.8);
fadeIn('#last-updated-wrap', 7, 0.8);

slideDown('.page-2-title', 0.25, 1);
fadeIn('.page-2-text-content', 1.5, 0.5);
fadeIn('.page-2-content-bottom', 2, 0.5);
fadeIn('.page-2-bookmark-img', 1, 0.5);
fadeIn('.page-2-bookmark-text', 2, 0.5);

fadeIn('.your-place-title', 0.5, 0.5);
fadeIn('.your-place-content',0.75, 0.5);

fadeIn('.content-ended-text', 0.5, 0.5);

slideDown('.page-title-last-page', 0.25, 1);
fadeIn('.last-page-text-content', 1.5, 0.5);
fadeIn('.last-page-content-bottom', 1.5, 0.5);