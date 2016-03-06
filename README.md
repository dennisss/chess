Chess
=====

- CS 451 Project, Drexel University

- By: Tess DiStefano, Dennis Shtatnov, Zach Silverstein, Dan Ziegler


Included is a full stack application for playing chess.



Getting Started
---------------

- Make sure Node.js (v5.0.0+) is installed

- Install gulp using `npm install -g gulp`

- Run `npm install`

- Build and start server using `gulp`

- View at `http://127.0.0.1:8000` or `http://localhost:8000/`


Common tasks
------------

- Generating documentation into `/public/doc`: `gulp doc`

- Static code analysis: `gulp lint`

- Running tests: `mocha`
	- Running the UI testing suite requires selenium-standalone to be setup: `./node_modules/.bin/selenium-standalone install`

- Generate coverage report into `/public/coverage`: `gulp cover`


File structure
--------------

- Server code in `src/app`

- Client-side code in `src/web`

- HTML code and static resources in `public/`
