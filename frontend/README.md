# project_1 frontend

## Requirements

1. Nodejs version [16.14.2](https://nodejs.org/en/)
2. npm version 8.5+ - To avoid any potential issues with `package-lock.json`

### Recommended but not necessary

- If you use VSC for the JS, download an extension called **Prettier** which helps with formatting.

## Good to have

Check out the **Functional components in React**

- [Official React doc](https://reactjs.org/docs/components-and-props.html)
- [Someone's blog](https://www.robinwieruch.de/react-function-component/)

## Instruction

1. Install any requirements
   - `npm install` - make sure you are in the `frontend` directory
2. Run the app

   - `npm start`
     Runs the app in the development mode.\
     Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## Folder structure

- **views** - This directory contains a bigger component that is equivalent to the body section. `views` are also components, except it is a set of components.
- **components** - A component itself
- **assets** - CSS, images etc... any sort of assets belong here.
- **constants** - any CONSTANT variables, will be stored here
- **contexts** - The directory for [useContext API](https://reactjs.org/docs/hooks-reference.html#usecontext) - think it as a global variable which is there to share states between components.

## Naming and other conventions

- **Files** are in PascalCase - E.g., LandingPage.js, SignUpPage.js...
- **Variables** are in camalCase - E.g., firstName, lastName...
- **Indentation** - We use 2 spaces indent per tab
- **Import order** - Give one space between each section.

  - Any react related comes first
  - Followed by any third party packages
  - Followed by internal modules
  - Followed by assets

  ```javascript
  # These are directly related to react
  import React from "react";
  import ReactDOMClient from "react-dom/client";

  # Third party package, for instance, material-ui
  import XXX from "@material-ui";

  # Internal modules, any JS files created by us
  import App from "./App";
  import reportWebVitals from "./reportWebVitals";

  # Any assets
  import "assets/css/index.css";
  ```
