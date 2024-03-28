import { BACKEND_PORT } from './config.js';
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl } from './helpers.js';

let token = null;
let loggedId = null;
let openThread = null;
let threadCount = 0;
const pages = ['login', 'register', 'dashboard', 'create-thread','edit-thread'];
const navButtons = ['login', 'register', 'logout', 'create', 'cancel'];
const threadButtons = ['edit', 'delete', 'like', 'watch'];
/**
 * Helper Function: Will allow us to go to the page when selected via button or link
 * @param selectPage the page that we are selecting for the single page app
 */
const goToPage = (selectPage) => {
  for (const page of pages) {
    document.getElementById(`page-${page}`).style.display = 'none';
  }
  for (const navButton of navButtons) {
    document.getElementById(`nav-${navButton}`).style.display = 'none';
  }
  for (const threadButton of threadButtons) {
    document.getElementById(`thread-${threadButton}`).style.display = 'none';
  }

  if (['login'].includes(selectPage)) {
    document.getElementById('nav-register').style.display = 'block';
  } else if (['register'].includes(selectPage)) {
    document.getElementById('nav-login').style.display = 'block';
  } else if (['dashboard'].includes(selectPage)) {
    let user;
    getAllThreadInfo(openThread)
    .then((object) => {
      user = object.creatorId;
    })
    .then(() => {
      console.log(user);
      console.log(parseInt(loggedId));
      if (user === parseInt(loggedId)) {
        document.getElementById('thread-edit').style.display = 'block';
        document.getElementById('thread-delete').style.display = 'block';
      }
    })

    document.getElementById('nav-logout').style.display = 'inline-block';
    document.getElementById('nav-create').style.display = 'inline-block';
    document.getElementById('single-thread-container').style.display = 'inline-block';
    
  } else if (['create-thread'].includes(selectPage)) {
    document.getElementById('nav-logout').style.display = 'inline-block';
    document.getElementById('nav-cancel').style.display = 'inline-block';
  } else if (['edit-thread'].includes(selectPage)) {
    document.getElementById('nav-logout').style.display = 'inline-block';
    document.getElementById('nav-cancel').style.display = 'inline-block';
    document.getElementById('page-dashboard').style.display = 'flex';
    document.getElementById('page-edit-thread').style.display = 'inline-block';
    document.getElementById('single-thread-container').style.display = 'none';
    return;
  }
  document.getElementById(`page-${selectPage}`).style.display = 'flex';
}

// Milestone 1: Login and Register

/* Event Listeners for buttons and links */
document.getElementById('login-to-register').addEventListener('click', () => {
  goToPage('register');
});

document.getElementById('register-to-login').addEventListener('click', () => {
  goToPage('login');
});

document.getElementById('nav-register').addEventListener('click', () => {
  goToPage('register');
});

document.getElementById('nav-login').addEventListener('click', () => {
  goToPage('login'); 
});

document.getElementById('nav-logout').addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('loggedId');
  goToPage('login');
});

document.getElementById('nav-create').addEventListener('click', () => {
  if (token != null) {
    goToPage('create-thread');
  }
});

document.getElementById('nav-cancel').addEventListener('click', () => {
  goToPage('dashboard');
})

document.getElementById('next-button').addEventListener('click', () => {
  threadCount = threadCount + 5;
  loadThreads();
});

document.getElementById('previous-button').addEventListener('click', () => {
  if(threadCount != 0) {
    threadCount = threadCount - 5;
  }
  loadThreads();
});

const nullThreadIndicator = () => {
  openThread = null;
  localStorage.removeItem('threadId');
  const singleThread = document.getElementById('single-thread');
  singleThread.innerHTML = "Select a thread to view!";
}

document.getElementById('thread-delete').addEventListener('click', () => {
  const requestBody = {
    id: openThread
  };
  const f = fetch(`http://localhost:${BACKEND_PORT}/` + "thread", {
    method: 'DELETE',
    headers: {
      'Content-type': 'application/json',
      'Authorization': token,
    },
    body: JSON.stringify(requestBody)
  });
  f.then((response) => {
    response.json().then((data) => {
      if (data.error) {
        alert(data.error);
      } else {
        goToPage("dashboard");
        nullThreadIndicator();
        loadThreads();
        document.getElementById('thread-create-form').reset();
      }
    })
  });
});


/* Login user event listener */
document.getElementById('login-user').addEventListener('click', () => {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  const f = fetch(`http://localhost:${BACKEND_PORT}/` + "auth/login", {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify({
      email: email,
      password: password,
    })
  });
  f.then((response) => {
    response.json().then((data) => {
      if (data.error) {
        alert(data.error);
      } else {
        token = data.token;
        loggedId = data.userId;
        localStorage.setItem('token', token);
        localStorage.setItem('loggedId', loggedId);
        goToPage("dashboard")
      }
    })
  });
});

/* Event Listener for register user */
document.getElementById('register-user').addEventListener('click', () => {
  const email = document.getElementById('register-email').value;
  const name = document.getElementById('register-name').value;
  const password = document.getElementById('register-password').value;
  const confirmPassword = document.getElementById('register-confirm-password').value;

  if (name == '') {
    alert("Please fill in the 'Name' field");
  } else if (password === confirmPassword) { 
    const f = fetch(`http://localhost:${BACKEND_PORT}/` + "auth/register", {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        name: name,
        password: password,
      })
    });
    f.then((response) => {
      response.json().then((data) => {
        if (data.error) {
          alert(data.error);
        } else {
          token = data.token;
          loggedId = data.userId;
          localStorage.setItem('token', token);
          localStorage.setItem('loggedId', loggedId);
          goToPage('dashboard');
        }
      })
    });
  } else {
    alert("Passwords do not match");
  }
});

// Milestone 2: Threading
document.getElementById('post-thread').addEventListener('click', () => {
  const title = document.getElementById('thread-title').value;
  const isPublic = document.getElementById('thread-make-public').checked;
  const content = document.getElementById('thread-content').value;

  if (!title || !content) {
    alert("Please fill in the required fields");
    return;
  } else {
    const f = fetch(`http://localhost:${BACKEND_PORT}/` + "thread", {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        'Authorization': token,
      },
      body: JSON.stringify({
        title: title,
        isPublic: isPublic,
        content: content,
      })
    });
    f.then((response) => {
      response.json().then((data) => {
        if (data.error) {
          alert(data.error);
        } else {
          goToPage("dashboard");

          openThread = data.id;
          loadThreads();
          
          openSingleThread();
          document.getElementById('thread-create-form').reset();
        }
      })
    });
  }
});

// Helper Function for Loading Threads.
const loadThreads = () => {
  const f = fetch(`http://localhost:${BACKEND_PORT}/` + `threads?start=${threadCount}`, {
    method: 'GET',
    headers: {
      'Content-type': 'application/json',
      'Authorization': token,
    }
  });
  f.then((response) => {
    response.json().then((data) => {
      if (data.error) {
        alert(data.error);
      } else {
        document.getElementById('threads-list').innerText = '';
        
        for (const threadId of data) {
          const threadDom = document.createElement('div');
          threadDom.setAttribute('id', `thread-${threadId}`);
          threadDom.setAttribute('class', 'threads-list-item');
          getThreadInfo(threadId, threadDom);
          document.getElementById('threads-list').appendChild(threadDom);
          
          threadDom.addEventListener('click', () => {
            openThread = threadId;
            localStorage.setItem('threadId', openThread);
            openSingleThread();
          })
        }
      }
    })
  });
};

// Helper Function for retrieving User Info
const getUserInfo = (userId) => {
  return new Promise((resolve, reject) => {
    const f = fetch(`http://localhost:${BACKEND_PORT}/` + `user?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-type': 'application/json',
        'Authorization': token,
      }
    });
    f.then((response) => {
      response.json().then((data) => {
        if (data.error) {
          alert(data.error);
          reject(data.error);
        } else {
          resolve(data.name);
        }
      })
    })
    .catch(error => {
      reject(error);
    })
  })
  
}

// Helper function for retrieving necessary Thread Info
const getThreadInfo = (getThread, parent) => {
  const f = fetch(`http://localhost:${BACKEND_PORT}/` + `thread?id=${getThread}`, {
    method: 'GET',
    headers: {
      'Content-type': 'application/json',
      'Authorization': token,
    }
  });
  f.then((response) => {
    response.json().then((data) => {
      if (data.error) {
        alert(data.error);
      } else {
        let titleDOM = document.createElement('div');
        titleDOM.innerHTML = data.title;

        let dateDOM = document.createElement('div');
        dateDOM.innerHTML = data.createdAt;
        
        let numberLikesDOM = document.createElement('div');
        if (!data.likes.includes(data.creatorId)) {
          data.likes.push(data.creatorId);
        }

        numberLikesDOM.innerHTML = data.likes.length;

        let authorDOM = document.createElement('div');
        getUserInfo(data.creatorId)
          .then((userName) => {
            authorDOM.innerHTML = userName;
          })
          .catch((error) => {
            console.error("Error getting user info", error);
          });

        parent.appendChild(titleDOM);
        parent.appendChild(dateDOM);
        parent.appendChild(authorDOM);
        parent.appendChild(numberLikesDOM);
      }
    })
  });
};

// Helper Function for Opening Single Thread.
const openSingleThread = () => {
  const f = fetch(`http://localhost:${BACKEND_PORT}/` + `thread?id=${openThread}`, {
    method: 'GET',
    headers: {
      'Content-type': 'application/json',
      'Authorization': token,
    }
  });
  f.then((response) => {
    response.json().then((data) => {
      if (data.error) {
        nullThreadIndicator();
      } else {
        const titleDOM = document.createElement('div');
        titleDOM.innerHTML = data.title;

        const contentDOM = document.createElement('div');
        contentDOM.innerHTML = data.content;

        const numLikesDOM = document.createElement('div');
        numLikesDOM.innerHTML = data.likes.length;

        const singleThread = document.getElementById('single-thread');
        singleThread.innerHTML = '';
        singleThread.appendChild(titleDOM);
        singleThread.appendChild(contentDOM);
        singleThread.appendChild(numLikesDOM);

        openThread = data.id;
        localStorage.setItem('threadId', openThread);

        goToPage("dashboard");
      }
    })
  })
  .catch(error => {
    reject(error);
  })
}

// Milestone 3: Single Thread Functions.
// get all info relating to the thread
const getAllThreadInfo = (getThread) => {
  return new Promise((resolve, reject) => {
    const f = fetch(`http://localhost:${BACKEND_PORT}/` + `thread?id=${getThread}`, {
      method: 'GET',
      headers: {
        'Content-type': 'application/json',
        'Authorization': token,
      }
    });
    f.then((response) => {
      response.json().then((data) => {
        if (data.error) {
          openThread = null;
          localStorage.removeItem('threadId');
          reject(data.error);
        } else {
          console.log(data);
          resolve(data);
        }
      })
    })
  })
}

// adding an edit button that would work.
document.getElementById('thread-edit').addEventListener('click', () => {
  let creatorId
  let title;
  let content;
  let isPublic;
  let isLocked;
  getAllThreadInfo(openThread).then((e) => {
      creatorId = e.creatorId;
      title = e.title;
      content = e.content
      isPublic = e.isPublic;
      isLocked = e.lock;
  }).then (() =>{
    document.getElementById('edit-title').value = title
    document.getElementById("edit-content").value = content
    document.getElementById("edit-public-status").checked = isPublic;

    console.log(isLocked);
    document.getElementById("edit-lock-status").checked = isLocked;
    console.log(document.getElementById("edit-lock-status").checked);
  });

  goToPage('edit-thread');
  
  // .then(() => {
  //   document.getElementById()
  // });
  // // 
});

// submit changes
document.getElementById('submit-edit').addEventListener('click', () =>{
  let title = document.getElementById('edit-title').value;
  let content = document.getElementById("edit-content").value;
  let isPublic = document.getElementById("edit-public-status").checked;
  let isLocked = document.getElementById("edit-lock-status").checked;

  console.log(isLocked);
  const f = fetch(`http://localhost:${BACKEND_PORT}/` + "thread", {
    method: 'PUT',
    headers: {
      'Content-type': 'application/json',
      'Authorization': token,
    },
    body: JSON.stringify({
      id: openThread,
      title: title,
      isPublic: isPublic,
      lock: isLocked,
      content: content
    })
  });
  f.then((response) => {
    response.json().then((data) => {
      if (data.error) {
        console.log('the error is within lock');
        console.log(data.error);
        alert(data);
      } else {
        openSingleThread();
        goToPage("dashboard");

        openThread = data.id;
        loadThreads();
        document.getElementById('thread-create-form').reset();
      }
    })
  });
});

// Check for persistence.
if (localStorage.getItem('token')) {
  token = localStorage.getItem('token');
  loggedId = localStorage.getItem('loggedId');
  openThread = localStorage.getItem('threadId');
  goToPage('dashboard');
  loadThreads();
  openSingleThread();
} else {
  goToPage('login');
}