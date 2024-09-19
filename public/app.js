// Simulate a local storage or state for archived posts
let archivedPosts = JSON.parse(localStorage.getItem('archivedPosts')) || [];

// Fetch posts from the backend
async function fetchPosts() {
  try {
    const response = await fetch('/api/toots');
    const posts = await response.json();
    displayPosts(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
  }
}

// Display posts in the inbox
function displayPosts(posts) {
  const inbox = document.getElementById('post-inbox');
  inbox.innerHTML = ''; // Clear the inbox

  // Filter out archived posts
  const visiblePosts = posts.filter(post => !archivedPosts.includes(post.id));

  if (visiblePosts.length === 0) {
    inbox.innerHTML = '<p>No new posts available.</p>';
    return;
  }

  visiblePosts.forEach(post => {
    const postElement = document.createElement('div');
    postElement.classList.add('post');

    // Check if the post has a content warning (spoiler_text)
    const hasContentWarning = post.spoiler_text && post.spoiler_text.trim() !== '';

    postElement.innerHTML = `
      ${hasContentWarning ? `<p><strong>Content Warning:</strong> ${post.spoiler_text}</p>` : ''}
      <div class="post-content" style="${hasContentWarning ? 'display: none;' : ''}">
        <p>${post.content}</p>
        <p><strong>From:</strong> ${post.account.username}</p>
        <p><a href="${post.url}" target="_blank">View Post</a></p>
      </div>
      ${hasContentWarning ?
      `<div class="button-container">
        <button class="show-more-btn" onclick="toggleContent(this)">Show More</button>` : ''}
      <div class="button-container">
        <button class="archive-btn" onclick="archivePost('${post.id}')">Archive</button>
        <button class="share-btn" onclick="sharePost('${post.id}')">Share</button>
      </div>
    `;

    inbox.appendChild(postElement);
  });
}

// Function to toggle the visibility of post content when "Show More" is clicked
function toggleContent(button) {
  const postContent = button.previousElementSibling;
  if (postContent.style.display === 'none') {
    postContent.style.display = 'block';
    button.textContent = 'Show Less';
  } else {
    postContent.style.display = 'none';
    button.textContent = 'Show More';
  }
}

// Archive post
function archivePost(postId) {
  archivedPosts.push(postId);
  localStorage.setItem('archivedPosts', JSON.stringify(archivedPosts));
  fetchPosts(); // Refresh the inbox after archiving a post
}

// Function to handle sharing a post
  function sharePost(postId, postContent) {
    // Example action: log the post content or send it to a server
    console.log(`Sharing post ID: ${postId}`);
    console.log(`Post content: ${postContent}`);

    // You can also send this data to a server or use another sharing method
    // Example: Sending post data to a server
    fetch('/api/share', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ postId, postContent }),
    })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Error sharing the post');
      }
    })
    .then(data => {
      console.log('Post shared successfully:', data);
    })
    .catch(error => {
      console.error('Error:', error);
    });
  }

// Fetch posts on page load
window.onload = fetchPosts;
