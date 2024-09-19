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

    // Add "Archive All" button
    const archiveAllButton = document.createElement('button');
    archiveAllButton.textContent = 'Archive All';
    archiveAllButton.classList.add('archive-all-btn');
    archiveAllButton.addEventListener('click', archiveAllPosts);
    inbox.appendChild(archiveAllButton);

    visiblePosts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.classList.add('post');

        // Check if the post has a content warning (spoiler_text)
        const hasContentWarning = post.spoiler_text && post.spoiler_text.trim() !== '';

        postElement.innerHTML = `
            ${hasContentWarning ? `<p><strong>Content Warning:</strong> ${post.spoiler_text}</p>` : ''}
            <div class="post-content" style="${hasContentWarning ? 'display: none;' : ''}">
                <p>${post.content}</p>
                <p><a href="${post.url}" target="_blank">View Post</a></p>
            </div>
            ${hasContentWarning ?
                `<div class="button-container">
                    <button class="show-more-btn" onclick="toggleContent(this)">Show More</button>` : ''}
            
                <button class="archive-btn" data-id="${post.id}">Archive</button>
                <button class="share-btn" data-content="${encodeURIComponent(post.content)}">Share</button>
            </div>
        `;
        inbox.appendChild(postElement);

        // Add click event listener to the archive button
        const archiveButton = postElement.querySelector('.archive-btn');
        archiveButton.addEventListener('click', () => {
            const postId = archiveButton.getAttribute('data-id');
            archivePost(postId);
        });

        // Add click event listener to the share button
        const shareButton = postElement.querySelector('.share-btn');
        shareButton.addEventListener('click', () => {
            const content = decodeURIComponent(shareButton.getAttribute('data-content'));
            sharePost(post.id, content, post.account.display_name || post.account.username);
        });
    });
}

// Function to toggle the visibility of post content when "Show More" is clicked
function toggleContent(button) {
    const postContent = button.closest('.post').querySelector('.post-content');
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
    console.log(`Archiving post with ID: ${postId}`);
    archivedPosts.push(postId);
    localStorage.setItem('archivedPosts', JSON.stringify(archivedPosts));
    fetchPosts(); // Refresh the inbox after archiving a post
}

// Archive all posts
function archiveAllPosts() {
    const visiblePostIds = Array.from(document.querySelectorAll('.archive-btn'))
        .map(button => button.getAttribute('data-id'));
    
    archivedPosts = [...new Set([...archivedPosts, ...visiblePostIds])];
    localStorage.setItem('archivedPosts', JSON.stringify(archivedPosts));
    fetchPosts(); // Refresh the inbox after archiving all posts
}

async function sharePost(postId, postContent, author) {
    try {
        console.log(`Attempting to share post ID: ${postId}`);
        console.log(`Raw post content:`, postContent);
        console.log(`Author:`, author);

        // Remove HTML tags from the content
        const contentToShare = postContent.replace(/<[^>]*>?/gm, '');

        // Prepare the content with author information
        const fullContentToShare = `${contentToShare} – ${author}`;

        console.log(`Processed content to share:`, fullContentToShare);

        const requestBody = JSON.stringify({ postContent: fullContentToShare });
        console.log(`Request body:`, requestBody);

        const response = await fetch('/api/share', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: requestBody,
        });

        console.log(`Response status:`, response.status);

        if (!response.ok) {
            const errorData = await response.json();
            console.error(`Error response:`, errorData);
            throw new Error(errorData.error || 'Error sharing the post');
        }

        const data = await response.json();
        console.log('Post shared successfully:', data);
        alert('Post shared successfully!');
    } catch (error) {
        console.error('Error details:', error);
        alert(`Error sharing the post: ${error.message}. Please try again or contact support.`);
    }
}

// Fetch posts on page load
window.onload = fetchPosts;