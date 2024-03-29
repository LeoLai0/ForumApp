import { BACKEND_PORT } from './config.js';
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl } from './helpers.js';

let token = null;
let loggedId = null;
let openThread = null;
let parentCommentId = null;
let threadCount = 0;
let editCommentId = null;
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
    let lockedStatus;
    getAllThreadInfo(openThread)
    .then((object) => {
      user = object.creatorId;
      lockedStatus = object.lock;
    })
    .then((object) => {
      if (user === parseInt(loggedId)) {
        for (const threadButton of threadButtons) {
          if (['like'].includes(threadButton)) {
            if(!lockedStatus) {
              document.getElementById(`thread-${threadButton}`).style.display = 'block';    
            }
          } else {
            document.getElementById(`thread-${threadButton}`).style.display = 'block';
          }
        }
      } else {
        if (!lockedStatus) {
          document.getElementById('thread-like').style.display = 'block';
        }
        document.getElementById('thread-watch').style.display = 'block';
      }
    })
    getAllComments();

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
document.getElementById('reply-cancel').addEventListener('click', () => {
  document.getElementById('page-reply').close();
});

const nullThreadIndicator = () => {
  openThread = null;
  localStorage.removeItem('threadId');
  document.getElementById('no-thread-selected').style.display = 'block';
  const singleThread = document.getElementById('single-thread');
  singleThread.innerHTML = '';
}

document.getElementById('thread-delete').addEventListener('click', () => {
  const requestBody = {
    id: openThread
  };
  getAllComments()
  .then((comments) => {
    for (const comment of comments) {
      const commentDeleteBody = {
        id: comment.id,
      }
      fetch(`http://localhost:${BACKEND_PORT}/` + "comment", {
        method: 'DELETE',
        headers: {
          'Content-type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify(commentDeleteBody)
      })
      .then((response) => {
        response.json().then((data) => {
          if (data.error) {
            alert(data.error);
          } else {
            document.getElementById('thread-create-form').reset();
          }
        })
      });
    }
  })

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
        getAllComments();
        loadThreads();
        document.getElementById('thread-create-form').reset();
      }
    })
  });

});

const threadPutHelper = (requestBody, interactiveComponent) => {
  const f = fetch(`http://localhost:${BACKEND_PORT}/` + `thread/${interactiveComponent}`, {
    method: 'PUT',
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
        openSingleThread();
        loadThreads();
        document.getElementById('thread-create-form').reset();
      }
    })
  });
};

document.getElementById('thread-like').addEventListener('click', () => {
  getAllThreadInfo(openThread).then((e) => {
    if (!e.lock) {
      if (!e.likes.includes(parseInt(loggedId))) {
      const requestBody = {
          id: openThread,
          turnon: true
        };
        threadPutHelper(requestBody, threadButtons[2]);
        document.getElementById('thread-like').innerHTML = 'Liked';
        document.getElementById('thread-like').style.backgroundColor = 'hsl(355deg, 100%, 60%)';
        document.getElementById('thread-like').style.color = 'white';
        document.getElementById('thread-like').style.border = 'none';
      } else {
        const requestBody = {
          id: openThread,
          turnon: false
        };
        threadPutHelper(requestBody, threadButtons[2]);
        document.getElementById('thread-like').innerHTML = 'Like';
        document.getElementById('thread-like').style.backgroundColor = 'transparent';
        document.getElementById('thread-like').style.color = 'black';
        document.getElementById('thread-like').style.border = '1px solid hsl(46.67deg, 11%, 69%)';
      }
    }
  });
});

document.getElementById('thread-watch').addEventListener('click', () => {
  getAllThreadInfo(openThread).then((e) => {
    if (!e.watchees.includes(parseInt(loggedId))) {
      const requestBody = {
        id: openThread,
        turnon: true
      };
      threadPutHelper(requestBody, threadButtons[3]);
      document.getElementById('thread-watch').style.backgroundColor = 'hsl(209.84deg 100% 40.18%)';
      document.getElementById('thread-watch').style.color = 'white';
      document.getElementById('thread-watch').style.border = 'none';
      document.getElementById('thread-watch').innerHTML = 'Watching';
    } else {
      const requestBody = {
        id: openThread,
        turnon: false
      };
      threadPutHelper(requestBody, threadButtons[3]);
      document.getElementById('thread-watch').innerHTML = 'Like';
      document.getElementById('thread-watch').style.backgroundColor = 'transparent';
      document.getElementById('thread-watch').style.color = 'black';
      document.getElementById('thread-watch').style.border = '1px solid hsl(46.67deg, 11%, 69%)';
      document.getElementById('thread-watch').innerHTML = 'Watch';
    }
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
document.getElementById('thread-post').addEventListener('click', () => {
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
            getAllComments();
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
          resolve(data);
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
        
        let numLikesDOM = document.createElement('div');
        numLikesDOM.innerHTML = "Likes: " + data.likes.length;

        let numWatcheesDOM = document.createElement('div');
        numWatcheesDOM.innerHTML = "Watchees: " + data.watchees.length;

        let authorDOM = document.createElement('div');
        getUserInfo(data.creatorId)
          .then((data) => {
            authorDOM.innerHTML = data.name;
          })
          .catch((error) => {
            console.error("Error getting user info", error);
          });

        parent.appendChild(titleDOM);
        parent.appendChild(dateDOM);
        parent.appendChild(authorDOM);
        parent.appendChild(numLikesDOM);
        parent.appendChild(numWatcheesDOM);
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
        if (data.islocked) {
          document.getElementById('thread-comments-container').style.display = 'none';
          return;
        }
        const titleDOM = document.createElement('h1');
        titleDOM.setAttribute('class', 'thread-title')
        titleDOM.innerHTML = data.title;

        const threadDetailDOM = document.createElement('div');
        threadDetailDOM.setAttribute('class', 'thread-info');

        const profileDOM = document.createElement('div');
        const profilePictureDOM = document.createElement('div');
        const userInfoDOM = document.createElement('div');
        profileDOM.appendChild(profilePictureDOM);
        profileDOM.appendChild(userInfoDOM);

        const userName = document.createElement('h3');
        const threadTime = document.createElement('div');
        threadTime.setAttribute('class', 'time-created');
        threadTime.innerHTML = data.createdAt;

        userInfoDOM.setAttribute('class', 'user-info');

        getUserInfo(data.creatorId)
        .then((user) => {
          profilePictureDOM.innerHTML = user.image;
          userName.innerHTML = user.name;
        });
        userInfoDOM.appendChild(userName);
        userInfoDOM.appendChild(threadTime);

        threadDetailDOM.appendChild(userInfoDOM);

        const statsDOM = document.createElement('div');
        statsDOM.setAttribute('class', 'stats-container')
        
        const numLikesDOM = document.createElement('div');
        numLikesDOM.innerHTML = data.likes.length;
        const likesLabel = document.createElement('div');
        likesLabel.innerHTML = 'Likes';
        numLikesDOM.appendChild(likesLabel);
        statsDOM.appendChild(numLikesDOM);

        const watchButton = document.getElementById('thread-watch');
        statsDOM.appendChild(watchButton);

        threadDetailDOM.appendChild(statsDOM);

        const likeButton = document.getElementById('thread-like');
        const editDeleteButton = document.createElement('div');
        editDeleteButton.setAttribute('class', 'edit-delete-container')
        const editButton = document.getElementById('thread-edit');
        const deleteButton = document.getElementById('thread-delete');
        editDeleteButton.appendChild(editButton);
        editDeleteButton.appendChild(deleteButton);

        const bodyDOM = document.createElement('div');
        bodyDOM.setAttribute('class', 'body-container')
        bodyDOM.appendChild(likeButton);

        const contentDOM = document.createElement('div');
        contentDOM.setAttribute('class', 'content-container');
        contentDOM.innerHTML = data.content;
        contentDOM.appendChild(editDeleteButton);
        bodyDOM.appendChild(contentDOM);

        const singleThread = document.getElementById('single-thread');
        singleThread.innerHTML = '';
        singleThread.appendChild(titleDOM);
        singleThread.appendChild(threadDetailDOM);
        singleThread.appendChild(bodyDOM);
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
          resolve(data);
        }
      })
    })
  })
}

// adding an edit button that would work.
document.getElementById('thread-edit').addEventListener('click', () => {
  let creatorId;
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
    document.getElementById("edit-lock-status").checked = isLocked;
  });

  goToPage('edit-thread');
});

// submit changes
document.getElementById('submit-edit').addEventListener('click', () =>{
  let title = document.getElementById('edit-title').value;
  let content = document.getElementById("edit-content").value;
  let isPublic = document.getElementById("edit-public-status").checked;
  let isLocked = document.getElementById("edit-lock-status").checked;

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

// milestone 4: comments
// Helper Function for Loading Comments and all details
const getAllComments = () => {
  return new Promise((resolve, reject) => {
    const f = fetch(`http://localhost:${BACKEND_PORT}/` + `comments?threadId=${openThread}`, {
      method: 'GET',
      headers: {
        'Content-type': 'application/json',
        'Authorization': token,
      }
    });
    f.then((response) => {
      let isLockedStatus;
      getAllThreadInfo(parseInt(openThread)).then((thread) => {
        isLockedStatus = thread.lock;
        if (isLockedStatus) {
          document.getElementById('thread-comments-container').style.display = 'none';
          return;
        }
      });
      if (openThread == null) {
        document.getElementById('thread-comments-container').style.display = 'none';
        return;
      } else {
        document.getElementById('thread-comments-container').style.display = 'block';
        document.getElementById('no-thread-selected').style.display = 'none';
      }
      response.json().then((data) => {
        if (data.error) {
          alert(data.error);
          reject(data.error);
        } else {
          document.getElementById('thread-comments').innerHTML = '';
          for (const comment of data) {
            let commentDOM = document.createElement('div');

            const profileDOM = document.createElement('div');
            const profilePictureDOM = document.createElement('div');
            const userInfoDOM = document.createElement('div');
            profileDOM.appendChild(profilePictureDOM);
            profileDOM.appendChild(userInfoDOM);
    
            const userName = document.createElement('h2');
            const threadTime = document.createElement('div');
            threadTime.setAttribute('class', 'time-created');
            threadTime.innerHTML = comment.createdAt;
    
            userInfoDOM.setAttribute('class', 'user-info');
    
            getUserInfo(comment.creatorId)
            .then((user) => {
              profilePictureDOM.innerHTML = user.image;
              userName.innerHTML = user.name;
            });
            userInfoDOM.appendChild(userName);
            userInfoDOM.appendChild(threadTime);
            
            // creating body
            const bodyDOM = document.createElement('div');
            bodyDOM.setAttribute('class', 'body-container');
            let likeButton = document.createElement('button');
            likeButton.setAttribute('id', `${comment.id}-like`);
            likeButton.setAttribute('class', 'like-button');
            likeButton.innerHTML = 'Like';

            likeButton.addEventListener('click', () => {
              if (!comment.likes.includes(parseInt(loggedId))) {
                const requestBody = {
                  id: comment.id,
                  turnon: true,
                };
                likeComment(requestBody);
              } else {
                const requestBody = {
                  id: comment.id,
                  turnon: false,
                };
                likeComment(requestBody);
              }
            });

            const likesDOM = document.createElement('div');
            likesDOM.appendChild(likeButton);
            const numLikes = document.createElement('div');
            numLikes.innerHTML = comment.likes.length;
            numLikes.style.textAlign = 'center';
            likesDOM.appendChild(numLikes);

            const contentDOM = document.createElement('div');
            contentDOM.setAttribute('class', 'content-container');
            contentDOM.innerHTML = comment.content;

            let editButton = document.createElement('button');
            editButton.setAttribute('id', `${comment.id}-edit`);
            editButton.setAttribute('class', 'edit-button');
            editButton.innerHTML = 'Edit';

            editButton.addEventListener('click', () => {
              document.getElementById('reply-content').value = comment.content;
              document.getElementById('page-reply').showModal();
              document.getElementById('reply-post').style.display = 'none';
              document.getElementById('reply-edit').style.display = 'block';
              editCommentId = comment.id;
              localStorage.setItem('editCommentId', editCommentId);
            });

            contentDOM.appendChild(editButton);

            bodyDOM.appendChild(likesDOM);
            bodyDOM.appendChild(contentDOM);

            // edit and reply buttons
            let replyButton = document.createElement('button');
            replyButton.setAttribute('class', 'comment-reply');
            replyButton.setAttribute('id', `${comment.id}-reply-button`);
            replyButton.innerHTML = 'Reply';
            replyButton.addEventListener('click', (c) => {
              document.getElementById('reply-content').value = "Reply to: " + comment.content + " - ";
              document.getElementById('page-reply').showModal();
              document.getElementById('reply-edit').style.display = 'none';
              document.getElementById('reply-post').style.display = 'block';
              parentCommentId = comment.id;
              localStorage.setItem('parentCommentId', parentCommentId);
            });

            // adding to DOM.
            commentDOM.appendChild(profileDOM);
            commentDOM.appendChild(bodyDOM);
            commentDOM.appendChild(replyButton);

            let commentSection = document.getElementById('thread-comments');
            commentSection.appendChild(commentDOM);
          }
          resolve(data);
        }
      })
    });
  })
};

// like a comment
const likeComment = (requestBody) => {
  const f = fetch(`http://localhost:${BACKEND_PORT}/` + 'comment/like', {
    method: 'PUT',
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
        openSingleThread();
        loadThreads();
      }
    })
  });
}

// create comment/reply
const commentReplyHelper = (requestType) => {
  const content = document.getElementById(`${requestType}-content`).value.trim();
  if (content === '') {
    alert(`${requestType} cannot be empty to post`);
    return;
  }
  const f = fetch(`http://localhost:${BACKEND_PORT}/` + "comment", {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
      'Authorization': token,
    },
    body: JSON.stringify({
      content: content,
      threadId: openThread,
      parentCommentId: parentCommentId,
    })
  });
  f.then((response) => {
    response.json().then((data) => {
      if (data.error) {
        alert(data.error);
      } else {
        document.getElementById('thread-comments').innerHTML = ''
        goToPage("dashboard");
        openSingleThread();
      }
    })
  });
};

document.getElementById('comment-post').addEventListener('click', () => {
  commentReplyHelper('comment', null);
});

document.getElementById('reply-post').addEventListener('click', () => {
  commentReplyHelper('reply', parentCommentId);
  document.getElementById('page-reply').close();
});

document.getElementById('reply-edit').addEventListener('click', () =>{
  let content = document.getElementById("reply-content").value;
  const f = fetch(`http://localhost:${BACKEND_PORT}/` + "comment", {
    method: 'PUT',
    headers: {
      'Content-type': 'application/json',
      'Authorization': token,
    },
    body: JSON.stringify({
      id: parseInt(editCommentId),
      content: content
    })
  });
  f.then((response) => {
    response.json().then((data) => {
      if (data.error) {
        alert(data);
      } else {
        console.log(content);
        document.getElementById('page-reply').close();
        openSingleThread();
        goToPage("dashboard");
        loadThreads();
        document.getElementById("reply-content").value = '';
      }
    })
  });
});

// Check for persistence.
if (localStorage.getItem('token')) {
  token = localStorage.getItem('token');
  loggedId = localStorage.getItem('loggedId');
  openThread = localStorage.getItem('threadId');
  parentCommentId = localStorage.getItem('parentCommentId');
  editCommentId = localStorage.getItem('editCommentId');
  
  goToPage('dashboard');
  loadThreads();
  openSingleThread();
  getAllComments();
} else {
  goToPage('login');
}