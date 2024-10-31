# Bible Together
  
## Tech Stack
`Sveltekit` hosted on `Github Pages` + `Firebase` backend

## Setup Development Environment
I use mkcert, create folder certs/ and run mkcert localhost
Download the static files using npm run getFirestoreHelpers
Make the .env file

## TODO
- Use tailwind css to set color theme
- Redo home page
- Optimize API calls
- Localization
- Add autoscroll and check on audio complete
- Add user profile, see who finished the bible recently
- Facebook Login



## Use the following command to base64 encode the .env and put it in github secrets
```bash
base64 -i -w 0 .env
```
- The `-w 0` parameter makes it such that it doesn't do line breaks when printing out to the terminal

## References
- [Firebase Auth tutorial](https://gundogmuseray.medium.com/easy-way-to-stop-worry-about-client-side-auth-with-firebase-and-sveltekit-d17cdcccb663)
- [Index DB tutorial](https://github.com/falcosan/TS_IndexedDB/blob/main/db/index.ts)