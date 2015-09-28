/* global DocumentTouch */

'use strict';

module.exports = {
    /**
     * Setup global options
     * These can and will be overwriteen if a config object is passed into this.init()
     */
    options: {
        breakpoints: {
            mobile: 640,
            tablet: 1024
        },
        throbberHTML: '<span class="throbber"><span class="dot"></span></span>',
        chaperoneHTML: '<div class="chaperone"><div class="chaperone__header"><div class="chaperone__title" data-hook="chaperone-title"></div><div class="chaperone__progress" data-hook="chaperone-progress">X of X</div></div><div class="chaperone__body" data-hook="chaperone-text"></div><div class="chaperone__controls"><div class="chaperone__controls__wrapper"><a class="close-chaperone" data-hook="close-chaperone"><span class="close thick"></span></a><a class="chaperone-btn" data-hook="chaperone-back">Back</a><a class="chaperone-btn chaperone-btn--next" data-hook="chaperone-next">Next</a><a class="chaperone-btn chaperone-btn--finish hide" data-hook="chaperone-finish">Finish</a></div></div></div>',
        pageContainerSelector: '',
        progressSelector: '[data-hook="chaperone-progress"]',
        textSelector: '[data-hook="chaperone-text"]',
        backSelector: '[data-hook="chaperone-back"]',
        nextSelector: '[data-hook="chaperone-next"]',
        finishSelector: '[data-hook="chaperone-finish"]',
        finishCallback: function() { return; },
        animationTime: 300,
        cycle: false,
        autoStart: true,
        steps: [
            {
                position: 'fixed',
                location: 'windowMiddle',
                title: 'Welcome to Chaperone.',
                message: 'Add some more steps already!'
            }
        ]
    },

    /**
     * initializeTour - Initialize function to bind events and set any global data
     * @version 1.0.0
     * @example
     * tour.init();
     * @param  {object} (config) - Congifuration object that is used to overwrite the defaults in this.options
     * @return {void}
     */
    init: function initializeTour( tour ) {
        var self = this;

        // Check to see if we should use document.body or document.documentElement
        document.documentElement.scrollTop = 1;
        this.documentElement = document.documentElement.scrollTop === 1 ? document.documentElement : document.body;

        // touch event testing
        if ( ( 'ontouchstart' in window ) || window.DocumentTouch && document instanceof DocumentTouch ) {
            document.body.style.cursor = 'pointer';
        }

        // Copy over ininitialization options to options object
        if ( tour instanceof Object ) {
            for ( var option in tour ) {
                if ( window.Object.hasOwnProperty.call( tour, option ) && window.Object.hasOwnProperty.call( this.options, option )) {
                    // If it's a nested object, loop through that one too
                    if ( typeof tour[ option ] === 'object' && !Array.isArray( tour[ option ] )) {
                        for ( var subkey in tour[ option ] ) {
                            if ( window.Object.hasOwnProperty.call( tour[ option ], subkey ) && window.Object.hasOwnProperty.call( this.options[ option ], subkey )) {
                                this.options[ option ][ subkey ] = tour[ option ][ subkey ];
                            }
                        }
                    } else {
                        this.options[ option ] = tour[ option ];
                    }
                }
            }
        }

        // Logic for handling a click event
        self.clickHandler = function clickHandler( evt ) {
            if ( !evt ) {
                evt = window.event;
            }

            var trigger = evt.target || evt.srcElement,
                stepId,
                finishClose;

            // check to see if this is the throbber dot and if it is.. make the trigger the throbber instead
            if ( self.hasClass( trigger , 'dot' ) || self.hasClass( trigger , 'close' )) {
                trigger = trigger.parentNode;
            }

            // set the step ID based on the data-stepid attr
            stepId = trigger.getAttribute( 'data-stepid' );

            // check if the trigger matches the selector set in the options or the close button
            finishClose = trigger.matches( self.options.finishSelector ) || trigger.matches( '[data-hook="close-chaperone"]' );

            // lets do something
            if ( stepId ) {
                if ( self.currentStep ) {
                    // if the user is clicking on the throbber for the open step itself...
                    if ( trigger === self.currentStep || trigger === self.currentTrigger ) {
                        return;
                    } else {
                        var children = self.currentStep.childNodes;

                        // loop through the child elements in the tooltip to see if one of them has been clicked
                        for ( var childNode in children ) {
                            if ( window.Object.hasOwnProperty( children, childNode )) {
                                if ( children[ childNode ] === trigger ) {
                                    return;
                                }
                            }
                        }
                        self.close();
                    }
                }
                // Store the trigger element
                self.currentTrigger = trigger;

                // Open the step!
                setTimeout( function() {
                    self.open( stepId );
                }, self.options.animationTime );
            }

            if ( finishClose ) {
                self.close();
                self.currentStep = null;
                self.endTour();
            }
        };


        // place the steps
        this.placeSteps( self.options.steps );

        // Add the global click handler
        this.addEventListener( document.body, 'click', self.clickHandler );

        this.windowChangeHandler = function windowChangeHandler() {
            var stepTextContainer = document.body.querySelector( self.options.textSelector ),
                titleContainer = document.body.querySelector( '[data-hook="chaperone-title"]' ),
                chaperoneActive = document.querySelector( '.chaperone-active' );

            stepTextContainer.innerText = 'Your window has been resized. The tour is variable based on your screen size, please refresh your browser then, if necessary, restart the tour.'
            self.addClass( chaperoneActive, 'message' );

            return;
        };

        // If a throbber is open and the user resizes the page, tour needs to keep up with the trigger
        this.addEventListener( window, 'resize', this.windowChangeHandler );
    },
    /**
     * placeSteps - create the throbbers on the page appropriate to the screen size.
     * @version 1.0.0
     * @example
     * this.placeSteps( steps )
     * @param  [array] (steps) - All of the steps passed in to the init through (tour)
     * @return {void}
     */
    placeSteps: function placeSteps( steps ) {
        var self = this,
            currentSize = self.getCurrentScreenSize();

        // function to filter the steps down to just what we need for the current sceen size
        self.shownSteps = steps.filter( function( step ) {
            var hasCurrentSize;

            if ( step.shownOn ) {
                hasCurrentSize = self.arrayContains( step.shownOn, currentSize );
            } else {
                hasCurrentSize = true;
            }

            return hasCurrentSize;
        });

        self.shownSteps.forEach( function( step, i ) {
            var throbber = self.createDOMElement( self.options.throbberHTML ),
                target = step.target ? document.body.querySelector( step.target ) : document.body,
                location = step.location,
                targetPosLeft = self.getOffset( target ).left,
                targetPosTop = step.position === 'fixed' ? target.offsetTop : self.getOffset( target ).top,
                // targetPosRight = targetPosLeft + target.offsetWidth,
                targetPosBottom = targetPosTop + target.getBoundingClientRect().height,
                targetPosVertMiddle = targetPosTop + ( target.getBoundingClientRect().height / 2 ),
                targetPosCenter = targetPosLeft + ( target.getBoundingClientRect().width / 2 ),
                targetZindex = step.zIndex || parseInt( self.getZindex( target ) ) + 1,
                windowPosVertMiddle = window.innerHeight / 2,
                windowPosCenter = window.innerWidth / 2;

            self.addClass( self.options.pageContainerSelector ? document.body.querySelector( self.options.pageContainerSelector ) : document.body , 'chaperone-active' );

            // put the stepid/index in an attribute on the throbber
            throbber.setAttribute( 'data-stepid', i );

            // handle locked positioning
            if ( step.position === 'locked' ) {
                throbber.style.position = 'absolute';
                throbber.style.marginTop = step.lockedTop + 'px';
                throbber.style.marginLeft = step.lockedLeft + 'px';
            } else {
                throbber.style.position = step.position || 'absolute';
            }

            // set the z-index to +1 of the target
            throbber.style.zIndex = targetZindex;

            // handle different position options
            switch ( location ) {
                case 'bottomMiddle':
                    throbber.style.left = targetPosCenter + 'px';
                    throbber.style.top = targetPosBottom + 'px';
                    break;
                case 'centerMiddle':
                    throbber.style.left = targetPosCenter + 'px';
                    throbber.style.top = targetPosVertMiddle + 'px';
                    break;
                case 'windowMiddle':
                    throbber.style.zIndex = 1000;
                    throbber.style.left = windowPosCenter + 'px';
                    throbber.style.top = windowPosVertMiddle + 'px';
                    break;
            }

            // Append the throbber based on its desired position
            if ( step.position === 'locked' ) {
                target.insertAdjacentHTML( 'afterend', throbber.outerHTML );
            } else {
                document.body.appendChild( throbber );
            }
        });

        if ( self.options.autoStart ) {
            self.open( 0 );
        }
    },

    /**
     * openStep - Main open function to prepare and insert the chaperone with the step loaded
     * @version 1.0.0
     * @example
     * tour.open( 1 );
     * @param  {number} stepId - The index of the step to be opened
     * @return {object} - Returns the step object
     */
    open: function openStep( stepId ) {
        var self = this,
            stepIndex = parseInt( stepId ),
            step = self.shownSteps[ stepIndex ],
            stepTitle = step.title,
            stepText = step.message,
            stepNumber = parseInt( stepIndex + 1 ),
            stepsTotal = self.shownSteps.length,
            currentThrobber = document.body.querySelector( '[data-stepid="' + stepId + '"]' ),
            chaperone = self.createDOMElement( self.options.chaperoneHTML ),
            stepTextContainer,
            titleContainer,
            progressContainer,
            nextBtn,
            backBtn,
            finishBtn,
            currentElement,
            targetPosTop,
            chaperoneHeight;

        // if there is a target to the step, select the element and find its position.
        if ( step.target ) {
            currentElement = document.body.querySelector( step.target );
            targetPosTop = Math.round( currentElement.offsetTop ) - 150;
        }

        // scroll to the throbber
        if ( step.position !== 'fixed' ) {
            console.log( targetPosTop );
            self.scrollTo( document.body, targetPosTop, self.options.animationTime );
        }
        // activate the throbber
        self.addClass( currentThrobber, 'active' );

        // Insert the html for the chaperone
        document.body.appendChild( chaperone );

        chaperoneHeight = chaperone.offsetHeight;

        // Show the chaperone
        setTimeout( function() {
            // fill vars with elements as they now exist
            progressContainer = document.body.querySelector( self.options.progressSelector );
            stepTextContainer = document.body.querySelector( self.options.textSelector );
            titleContainer = document.body.querySelector( '[data-hook="chaperone-title"]' );
            nextBtn = document.body.querySelector( self.options.nextSelector );
            backBtn = document.body.querySelector( self.options.backSelector );
            finishBtn = document.body.querySelector( self.options.finishSelector );
            // Place the step progress in the chaperone
            progressContainer.innerText = stepNumber + ' of ' + stepsTotal;
            // Place the help text in the chaperone
            if ( stepTitle ) {
                titleContainer.innerText = stepTitle;
            }
            stepTextContainer.innerText = stepText;
            // Set up the buttons
            nextBtn.setAttribute( 'data-stepid', parseInt( stepIndex + 1 ));
            backBtn.setAttribute( 'data-stepid', parseInt( stepIndex - 1 ));
            // Show the chaperone
            self.addClass( chaperone, 'active' );


            // hide the back button if this is the first step
            if ( stepNumber === 1 ) {
                self.addClass( backBtn, 'chaperone-disabled' );
            }

            // if this is the last step then show the finish button instead of the next button
            if ( stepNumber === stepsTotal ) {
                self.addClass( nextBtn, 'hide' );
                self.removeClass( finishBtn, 'hide' );
            }

            // if there is an openEvent callback then run it
            if ( step.openEvent ) {
                step.openEvent();
            }
        }, 10 );

        // set the currentStep
        self.currentStep = stepNumber;
    },

    /**
     * closeStep - Main close function to close a specific step
     * @version 1.0.0
     * @example
     * tour.closeStep();
     * @return {void}
     */
    close: function closeStep() {
        var self = this,
            currentChaperone = document.body.querySelector( '.chaperone' ),
            activeThrobber = document.body.querySelector( '.throbber.active' ),
            activeIndex = activeThrobber.getAttribute( 'data-stepid' );

        // deactivate old throbber
        if ( activeThrobber ) {
            self.removeClass( activeThrobber, 'active' );
        }
        // if there's a closeEvent let's do it
        if ( self.shownSteps[ activeIndex ].closeEvent ) {
            self.shownSteps[ activeIndex ].closeEvent();
        }
        // animate the old step out
        if ( currentChaperone ) {
            self.removeClass( currentChaperone, 'active' );

            setTimeout( function() {
                // remove the old step
                currentChaperone.parentNode.removeChild( currentChaperone );
            }, self.options.animationTime );
        }
        self.currentStep = null;
    },

    endTour: function endTour() {
        'use strict';

        var self = this,
            throbbers = Array.prototype.slice.call( document.body.querySelectorAll( '.throbber' ) );

        throbbers.forEach( function( throbber ) {
            throbber.parentNode.removeChild( throbber );
        });

        self.removeClass( self.options.pageContainerSelector ? document.body.querySelector( self.options.pageContainerSelector ) : document.body , 'chaperone-active' );
    },

    /**
     * addEventListener - Small function to add an event listener. Should be compatible with IE8+
     * @version 1.0.0
     * @example
     * this.addEventListener( document.body, 'click', this.open( this.currentTooltip ));
     * @param  {element} el - The element node that needs to have the event listener added
     * @param  {string} eventName - The event name (sans the "on")
     * @param  {function} handler - The function to be run when the event is triggered
     * @return {element} - The element that had an event bound
     * @api private
     */
    addEventListener: function addEventListener( el, eventName, handler, useCapture ) {
        if ( !useCapture ) {
            useCapture = false;
        }

        if ( el.addEventListener ) {
            el.addEventListener( eventName, handler, useCapture );

            return el;
        } else {
            if ( eventName === 'focus' ) {
                eventName = 'focusin';
            }

            el.attachEvent( 'on' + eventName, function() {
                handler.call( el );
            });

            return el;
        }
    },

    /**
     * removeEventListener - Small function to remove and event listener. Should be compatible with IE8+
     * @version 1.0.0
     * @example
     * this.removeEventListener( document.body, 'click', this.open( this.currentTooltip ));
     * @param  {element} el - The element node that needs to have the event listener removed
     * @param  {string} eventName - The event name (sans the "on")
     * @param  {function} handler - The function that was to be run when the event is triggered
     * @return {element} - The element that had an event removed
     * @api private
     */
    removeEventListener: function removeEventListener( el, eventName, handler, useCapture ) {
        if ( !useCapture ) {
            useCapture = false;
        }

        if ( !el ) {
            return;
        }

        if ( el.removeEventListener ) {
            el.removeEventListener( eventName, handler, useCapture );
        } else {
            if ( eventName === 'focus' ) {
                eventName = 'focusin';
            }

            el.detachEvent( 'on' + eventName, function() {
                handler.call( el );
            });
        }

        return el;
    },

    /**
     * hasClass - Small function to see if an element has a specific class. Should be compatible with IE8+
     * @version 1.0.0
     * @example
     * this.hasClass( this.currentTooltip, 'visible' );
     * @param  {element} el - The element to check the class existence on
     * @param  {string} className - The class to check for
     * @return {boolean} - True or false depending on if the element has the class
     * @api private
     */
    hasClass: function hasClass( el, className ) {
        if ( el.classList ) {
            return el.classList.contains( className );
        } else {
            return new RegExp( '(^| )' + className + '( |$)', 'gi' ).test( el.className );
        }
    },

    /**
     * addClass - Small function to add a class to an element. Should be compatible with IE8+
     * @version 1.0.0
     * @example
     * this.addClass( this.currentTooltip, 'visible' );
     * @param  {element} el - The element to add the class to
     * @param  {string} className - The class name to add to the element
     * @return {element} - The element that had the class added to it
     * @api private
     */
    addClass: function addClass( el, className ) {
        if ( el.classList ) {
            el.classList.add( className );
        } else {
            el.className += ' ' + className;
        }

        return el;
    },

    /**
     * removeClass - Small function to remove a class from an element. Should be compatible with IE8+
     * @version 1.0.0
     * @example
     * this.removeClass( this.currentTooltip, 'visible' );
     * @param  {element} el - The element to remove the class from
     * @param  {string} className - The class name to remove from the element
     * @return {element} - The element that had the class removed from it
     * @api private
     */
    removeClass: function removeClass( el, className ) {
        if ( el ) {
            if ( el.classList ) {
                el.classList.remove( className );
            } else {
                el.className = el.className.replace( new RegExp( '(^|\\b)' + className.split( ' ' ).join( '|' ) + '(\\b|$)', 'gi' ), ' ' );
            }
        }

        return el;
    },

    /**
     * setInnerText - Small function to set the inner text of an element. Should be compatible with IE8+
     * @version 1.0.0
     * @example
     * this.setInnerText( this.currentTooltip, 'Hello world' );
     * @param  {element} el - The element to have the text inserted into
     * @param  {string} text - The text to insert into the element
     * @return {element} - The element with the new inner text
     * @api private
     */
    setInnerText: function setInnerText( el, text ) {
        if ( el.textContent !== undefined ) {
            el.textcontent = text;
        } else {
            el.innerText = text;
        }

        return el;
    },

    /**
     * createDOMElement - Creates a DOM element. Should be compatible with IE8+
     * @version 1.0.0
     * @example
     * this.createDOMElement( '<p>Paragraph!</p>');
     * @param  {string} html - the string to be converted into a DOM element
     * @api private
     */
    createDOMElement: function createDOMElement( html ) {
        var div = document.createElement( 'div' );
        div.innerHTML = html;

        return div.firstChild;
    },
    /**
     * getOffset - get the top/left of a DOM Element
     * @version 1.0.0
     * @example
     * this.getOffset( el );
     * @param  {element} el - the element you need an offset for.
     * @api private
     */
    getOffset: function getOffset( el ) {
        var rect = el.getBoundingClientRect(),
        scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
        scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        return {
            top: rect.top + scrollTop,
            left: rect.left + scrollLeft
        };
    },
    /**
     * getZindex - get the current css z-index of an element
     * @version 1.0.0
     * @example
     * this.getZindex( el );
     * @param  {element} el - the element for which you need a z-index
     * @api private
     */
    getZindex: function getZindex( e ) {
        var self = this,
            z,
            dv = document.defaultView || window;

        if ( dv.getComputedStyle ) {
            z = dv.getComputedStyle( e ).getPropertyValue( 'z-index' );
        } else {
            z = e.currentStyle.zindex;
        }

        if ( isNaN( z )) {
            return self.getZindex( e.parentNode );
        }
        return z;
    },
    /**
     * scrollTo - scroll the screen to a position
     * @version 1.0.0
     * @example
     * this.scrollTo( el, 1000, 300 );
     * @param  {element} el - the element you want to scroll
     * @param  {number} to - position (px) you want to scroll to
     * @param  {number} duration - time (ms) you want to take to animate the scroll
     * @api private
     */
    scrollTo: function scrollTo( element, to, duration ) {
        if ( duration < 0 ) {
            return;
        }
        var difference = to - element.scrollTop,
            perTick = difference / duration * 10;

        setTimeout( function() {
            element.scrollTop = element.scrollTop + perTick;

            if ( element.scrollTop === to ) {
                return;
            }

            scrollTo( element, to, duration - 10 );
        }, 10 );
    },
    /**
     * arrayContains - see of an array contains something for filtering
     * @version 1.0.0
     * @example
     * this.arrayContains( obj )
     * @param  {any} obj - the object, string, element or number you are searching for
     * @api private
     */
    arrayContains: function arrayContains( a, obj ) {
        var i = a.length;

        while ( i-- ) {
            if ( a[ i ] === obj ) {
                return true;
            }
        }
        return false;
    },
    /**
     * getCurrentScreenSize - get the size of the screen based on options set in the tour
     * @version 1.0.0
     * @example
     * this.getCurrentScreenSize()
     * @api private
     */
    getCurrentScreenSize: function getCurrentScreenSize() {
        var self = this,
            currentSize;

        if ( document.documentElement.clientWidth < self.options.breakpoints.mobile ) {
            currentSize = 'mobile';
        } else if ( document.documentElement.clientWidth > self.options.breakpoints.mobile && document.documentElement.clientWidth < self.options.breakpoints.tablet ) {
            currentSize = 'tablet';
        } else {
            currentSize = 'desktop';
        }

        return currentSize;
    }
};
