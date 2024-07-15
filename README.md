# Vanilla JS: Qanda

## The Task (Frontend)

Build a replica of popular forum-based platform, Edstem/Reddit, given a backend server that has been provided (as a result of this being an assignment)

### 1. Registration & Login

Should be able to

- Login
- Register
- Popup with Error Messages whenever the frontend or backend server presents an error.
- A dashboard after logging in.

### 2. Making Threads

Should be able to:

- Make a thread, retrieve a list of threads, and open a thread.

### 3. Thread Interactions

Milestone 3 focuses on interation with the threads. Should be able to:

- Edit a thread
- Delete a thread
- Like a thread
- Show that you are a viewer of a thread by clicking the watch button.

### 4. Comments

Milestone 4 focuses on comments relating to the thread. Should be able to:

- Show comment
- Make comments
- Edit Comments
- Liking Comments

### 3.2. The Backend

Clone backend server through: `git clone git@nw-syd-gitlab.cseunsw.tech:COMP6080/24T1/ass3-backend.git`. Run `npm install` in the project once after cloning this repo.

Run `npm start` in the backend project to start the backend.

The base URL of the backend (e.g. `http://localhost:5005`) can be run to view the API interface for this project, listing all of the HTTP routes we can interact with.

The backend will ensure persistence. To reset the backend, run `npm run reset` in the backend directory. To make a copy of the backend data (e.g. for a backup), copy `database.json`. To start again with an empty database, run `npm run clear` in the backend directory.

Do not update/change the backend directory or the files pertaining to the backend directory to ensure that the frontend will be able to run.
