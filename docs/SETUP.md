# Project Setup Guide

This document provides instructions for setting up the Arbitra Enterprise Artifact Foundry project for local development.

## Prerequisites

- Node.js (v18.x or later)
- npm or yarn

## Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd arbitra-foundry
    ```

2.  **Install dependencies:**
    Using npm:
    ```bash
    npm install
    ```
    Using yarn:
    ```bash
    yarn install
    ```

## Configuration

The application uses environment variables for configuration. Create a `.env.local` file in the root of the project to override default settings.

1.  **Copy the example environment file:**
    ```bash
    cp .env.example .env.local
    ```

2.  **Set your API Key:**
    You must provide your Gemini API key in the `.env.local` file.
    ```
    # .env.local
    REACT_APP_API_KEY="YOUR_GEMINI_API_KEY_HERE"
    ```

3.  **Other Environment Variables (Optional):**
    You can customize other application settings in this file:
    ```
    # 'development' or 'production'
    NODE_ENV=development

    # Set the minimum log level ('debug', 'info', 'warn', 'error')
    REACT_APP_LOG_LEVEL=info

    # Enable or disable analytics
    REACT_APP_ENABLE_ANALYTICS=false
    ```

## Available Scripts

In the project directory, you can run:

### `npm start` or `yarn start`

Runs the app in development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.
You will also see any lint errors in the console.

### `npm test` or `yarn test`

Launches the test runner in interactive watch mode.

### `npm run build` or `yarn build`

Builds the app for production to the `build` folder.
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.
Your app is ready to be deployed!