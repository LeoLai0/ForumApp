# Vanilla JS: Qanda

## 2. The Task (Frontend)

Build a replica of popular forum-based platform, Edstem/Reddit, given a backend server that has been provided (as a result of this being an assignment)

### 2.1. Milestone 1 - Registration & Login

Should be able to

- Login
- Register
- Popup with Error Messages whenever the frontend or backend server presents an error.
- A dashboard after logging in.

### 2.2. Milestone 2 - Making Threads

Should be able to:

- Make a thread, retrieve a list of threads, and open a thread.

### 2.3. Milestone 3 - Thread Interactions

Milestone 3 focuses on interation with the threads. Should be able to:

- Edit a thread
- Delete a thread
- Like a thread
- Show that you are a viewer of a thread by clicking the watch button.

### 2.4. Milestone 4 - Comments

Milestone 4 focuses on comments relating to the thread. Should be able to:

- Show comment
- Make comments
- Edit Comments
- Liking Comments

### 3.2. The Backend

A backend server can be cloned by running `git clone git@nw-syd-gitlab.cseunsw.tech:COMP6080/24T1/ass3-backend.git`. After you clone this repo, you must run `npm install` in the project once.

To run the backend server, simply run `npm start` in the backend project. This will start the backend.

To view the API interface for the backend you can navigate to the base URL of the backend (e.g. `http://localhost:5005`). This will list all of the HTTP routes that you can interact with.

We have provided you with a very basic starting database containing two users and one public channel with messages. You can look in `backend/database.json` to see the contents.

Your backend is persistent in terms of data storage. That means the data will remain even after your express server process stops running. If you want to reset the data in the backend to the original starting state, you can run `npm run reset` in the backend directory. If you want to make a copy of the backend data (e.g. for a backup) then simply copy `database.json`. If you want to start with an empty database, you can run `npm run clear` in the backend directory.

Once the backend has started, you can view the API documentation by navigating to `http://localhost:[port]` in a web browser.

The port that the backend runs on (and that the frontend can use) is specified in `frontend/src/config.js`. You can change the port in this file. This file exists so that your frontend knows what port to use when talking to the backend.

Please note: If you manually update database.json you will need to restart your server.

Please note: You CANNOT modify the backend source code.
