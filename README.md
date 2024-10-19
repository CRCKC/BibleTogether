# Bible Together
  
## Tech Stack
`Sveltekit` hosted on `Github Pages` + `Firebase` backend

## Setup Development Environment
I use mkcert, create folder certs/ and run mkcert localhost
Download the static files using npm run getFirestoreHelpers
Make the .env file

## TODO
- Use tailwind css to set color theme
- Default Chinese
- Finish home page
    - display all
    - click to go
- Optimize API calls

optional
- Localization


- Use the following command to base64 encode the .env and put it in github secrets
```bash
base64 -i -w 0 .env
```

## References
- [Firebase Auth tutorial](https://gundogmuseray.medium.com/easy-way-to-stop-worry-about-client-side-auth-with-firebase-and-sveltekit-d17cdcccb663)
- [Index DB tutorial](https://github.com/falcosan/TS_IndexedDB/blob/main/db/index.ts)