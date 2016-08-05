# UNMAINTAINED

This project is no longer being maintained. It's suggested that an alternative be used instead.

# chaperone

> A guided tour for responsive web sites and applications.

We searched the web for a lightweight script that would allow us to provide our users with a simple guided tour of our app. Though there are some pretty nice tours out there we didn't see any that worked really well at any screen size.

Thus was born chaperone.js. In the configuration of your custom tour you can specify what screen sizes each step of the tour should be shown on. If the user opens your app/site on their phone they won't be shown the steps designated only for desktop and vice-versa.

## Installation

```
npm install chaperone
```

```
bower install chaperone
```

## Browser compatibility

chaperone is meant to be IE8+ compatible. If you find otherwise, please open a new [issue](https://github.com/datuhealth/chaperone/issues/new).

## Example

### Tour object

```javascript
tour = {
    // set up your phone and tablet breakpoints, be as generic as possible.
    // In the future it will except as many as you like and you may name them.. but for now.. just these two wil have to do
    breakpoints: {
        mobile: 640,
        tablet: 1024
    },
    // If you don't like the standard throbber html you can put yours here
    throbberHTML: 'your fancy html here',
    // Again, don't like the standard? Replace it!
    chaperoneHTML: 'more fanciness',
    // What's the selector in the chaperoneHTML for adding the progress? ( 2 of 5 )
    progressSelector: '[data-hook="chaperone-progress"]',
    // and the text selector for the step message?
    textSelector: '[data-hook="chaperone-text"]',
    // how about the back button selector?
    backSelector: '[data-hook="chaperone-back"]',
    // don't forget the next button
    nextSelector: '[data-hook="chaperone-next"]',
    // and finally the finish button
    finishSelector: '[data-hook="chaperone-finish"]',
    // how fast should things move?
    animationTime: 300,
    // do you want it to repeat or just end?
    cycle: false,
    // Here's the meat. Add some steps to your tour!
    steps: [
        {
            // if there isn't a target selector the default is 'body'
            target:'[data-tour-step="nav-what"]',
            // position can be none( absolute ), locked (absolute to the container of the target) or fixed (fixed to the window)
            position: 'locked',
            // when locked you can control the distance of the throbber from the target. This one controls the x axis.
            lockedLeft: 100,
            // and this one does the y
            lockedTop: -30,
            // This next one is required. It's gotta say something!
            message: 'Well... it\'s where we tell you what this thing is.',
            // If you need a callback when the throbber opens
            openEvent: openMenu,
            // or when it closes
            closeEvent: closeMenu,
            // here's where you decide what sizes to show this throbber on. It defaults to all of them
            shownOn: [ 'mobile', 'tablet' ]
        },
        {
          // another step
        },
        {
          // and another
        }
    ]
}
```

### Fire up that tour!
```javascript 
chaperone.init( tour );
```

## License

[Apache 2.0](LICENSE.md)
