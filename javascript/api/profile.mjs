import api from './axios.mjs'; // Your custom Axios instance

// Fetch profile data for a given username.
export async function getProfile(username) {
  try {
    const endpoint = `/auction/profiles/${username}`;
    console.log("Fetching profile from endpoint:", endpoint);
    const response = await api.get(endpoint);
    console.log("Profile fetch response:", response);
    return response.data.data; // Expected shape: { name, credits, avatar, bio, banner, ... }
  } catch (error) {
    if (error.response) {
      console.error('Error fetching profile:', error.response.data, 'Status:', error.response.status);
    } else {
      console.error('Error fetching profile:', error.message);
    }
    return null;
  }
}

// Updates the UI with the profile data.
export async function updateProfile(username) {
  const profile = await getProfile(username);
  if (!profile) {
    console.error('Profile data not available.');
    return;
  }

  // Update name
  const nameElement = document.querySelector('.profile-name');
  if (nameElement) {
    nameElement.textContent = profile.name || 'Unknown Name';
  }

  // Update credits
  const creditsElement = document.querySelector('.profile-credits');
  if (creditsElement) {
    creditsElement.textContent =
      typeof profile.credits === 'number' ? profile.credits : 1000;
  }

  // Update avatar
  const avatarElement = document.querySelector('.profile-avatar');
  if (avatarElement && profile.avatar && profile.avatar.url) {
    avatarElement.src = profile.avatar.url;
    avatarElement.alt = profile.avatar.alt || 'Profile Avatar';
  }

  // Update bio
  const bioElement = document.querySelector('.profile-bio');
  if (bioElement) {
    bioElement.textContent = profile.bio || '';
  }

  // Update banner
  const bannerElement = document.querySelector('.profile-banner');
  if (bannerElement && profile.banner && profile.banner.url) {
    bannerElement.src = profile.banner.url;
    bannerElement.alt = profile.banner.alt || 'Profile Banner';
  }
}

/**
 * Exported function to update the credits UI.
 * If the user is not logged in (no token), the credits containers are hidden.
 * Otherwise, it retrieves the username from localStorage, fetches the profile,
 * and updates every element with the class "profile-credits".
 */
export async function updateCredits() {
  const creditsElements = document.querySelectorAll('.profile-credits');
  if (!creditsElements.length) return;

  // If the user is not logged in, hide all credits containers.
  if (!localStorage.getItem('token')) {
    creditsElements.forEach(el => {
      if (el.parentElement) {
        el.parentElement.style.display = 'none';
      }
    });
    return;
  }

  // Otherwise, ensure all credits containers are visible.
  creditsElements.forEach(el => {
    if (el.parentElement) {
      el.parentElement.style.display = 'flex';
    }
  });

  // Get the logged-in user's info from localStorage (stored as JSON under "user")
  const userData = localStorage.getItem('user');
  if (!userData) {
    console.error('No user data found in localStorage');
    return;
  }
  const userObj = JSON.parse(userData);
  const username = userObj.data && userObj.data.name;
  if (!username) {
    console.error('Username not found in user data.');
    return;
  }

  const profile = await getProfile(username);
  if (profile) {
    creditsElements.forEach(el => {
      el.textContent =
        typeof profile.credits === 'number' ? profile.credits : 1000;
    });
  }
}

// A generic function to perform a PUT request for profile updates.
export async function updateProfileData(username, data) {
  try {
    const endpoint = `/auction/profiles/${username}`;
    const response = await api.put(endpoint, data);
    console.log('Profile update response:', response);
    return response.data;
  } catch (error) {
    console.error(
      'Error updating profile:',
      error.response ? error.response.data : error.message
    );
    throw error;
  }
}

// Exported function to update the avatar.
export async function updateAvatar(username, avatarUrl, avatarAlt = '') {
  const data = {
    avatar: {
      url: avatarUrl,
      alt: avatarAlt
    }
  };
  return updateProfileData(username, data);
}

// Exported function to update the banner.
export async function updateBanner(username, bannerUrl, bannerAlt = '') {
  const data = {
    banner: {
      url: bannerUrl,
      alt: bannerAlt
    }
  };
  return updateProfileData(username, data);
}

// Exported function to update the bio.
export async function updateBio(username, bio) {
  const data = { bio: bio };
  return updateProfileData(username, data);
}
