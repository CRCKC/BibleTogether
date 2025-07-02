## Fixed google signinwithredirect

Go to Google Cloud Console and add the url `https://localhost:4000/BibleTogether/__/auth/handler` to the redirect urls

https://blog.csdn.net/zzhongcy/article/details/120033407

## It actually didnt fix

Instead I made a npm run script getFirebaseHelper to deal with it

## Ipad Safari zoom not working

Fixed by adding `-webkit-text-size-adjust: none;`

Reference:
https://stackoverflow.com/questions/59000766/css-zoom-does-not-work-ipad-os-v13-latest-safari

## Adding page transition effects to sveltekit

You need the `|global` tag for the transitions to transition between pages, also you need to add `{#key page.url.pathname}` to
cause it to be reactive and actually show the transition

Reference:
https://joshcollinsworth.com/blog/sveltekit-page-transitions

Right now there is a weird issue where it doesn't transition correctly, during transition, the UI kinda drops down a bit before going to it's original position
