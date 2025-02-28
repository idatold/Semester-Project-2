// File: /javascript/api/profile.mjs
import api from './axios.mjs'; // Your custom Axios instance

export async function getProfile(username) {
  try {
    const endpoint = `/auction/profiles/${username}`;
    console.log("Fetching profile from endpoint:", endpoint);
    const response = await api.get(endpoint);
    console.log("Profile fetch response:", response);
    return response.data.data; // shape: { name, credits, avatar, ... }
  } catch (error) {
    if (error.response) {
      console.error('Error fetching profile:', error.response.data, 'Status:', error.response.status);
    } else {
      console.error('Error fetching profile:', error.message);
    }
    return null;
  }
}

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

// Additional functions updateAvatar, updateBanner, updateBio if you want to PUT new data...
