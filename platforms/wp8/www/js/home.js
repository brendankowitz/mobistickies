(function (exports) {
    "use strict";

        var initialise = function () {

            Reveal.initialize({
                // Display controls in the bottom right corner
                controls: false,

                // Display a presentation progress bar
                progress: false,

                // Push each slide change to the browser history
                history: false,

                // Enable keyboard shortcuts for navigation
                keyboard: false,

                // Enable the slide overview mode
                overview: false,

                // Vertical centering of slides
                center: false,

                // Loop the presentation
                loop: true,

                // Change the presentation direction to be RTL
                rtl: false,

                // Number of milliseconds between automatically proceeding to the 
                // next slide, disabled when set to 0, this value can be overwritten
                // by using a data-autoslide attribute on your slides
                autoSlide: 0,

                // Enable slide navigation via mouse wheel
                mouseWheel: false,

                // Apply a 3D roll to links on hover
                rollingLinks: false,

                // Transition style
                transition: 'zoom' // default/cube/page/concave/zoom/linear/none
            });

            try {
                exports.stickManager = new StickyManager(document.querySelector(".homepage section[role=main]"));
                stickManager.loadStickies();

            } catch (ex) {
                //window.external.notify("LOG:exception:"+ex);
            }

            Reveal.addEventListener('slidechanged', function (event) {
                if (event.indexh == 0) {
                    AppBar.releaseBackButton();
                } else if (event.indexh >= 1) {
                    AppBar.captureBackButton();
                }
            });

            AppBar.addMenuItem("about");
            AppBar.addMenuButton("add sticky", "/www/images/appbar.add.png");
            AppBar.onBack(function() {
                Reveal.left();
            });

            var onAbout = function (title) {
                if (title == "about") {
                    Reveal.right();
                }
            };
            var onAddSticky = function (title) {
                if (title == "add sticky") {
                    stickManager.makeSticky({ content: "New Sticky" });
                }
            };
            AppBar.onTapped(onAbout);
            AppBar.onTapped(onAddSticky);
        };

        if (!!window.cordova) {
            document.addEventListener("deviceready", initialise, false);
        } else {
            $(function() { initialise(); });
        }
    
})(window);
