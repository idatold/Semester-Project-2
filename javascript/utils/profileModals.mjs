// File: /javascript/profileModals.mjs
import { updateAvatar, updateBanner, updateBio, updateProfile } from '../api/profile.mjs';

export function setupProfileModals(username) {
  // Banner modal setup
  const bannerModal = document.getElementById('modal-banner');
  document.getElementById('openBannerModal').addEventListener('click', () => {
    bannerModal.classList.remove('hidden');
  });
  document.getElementById('closeBannerModal').addEventListener('click', () => {
    bannerModal.classList.add('hidden');
  });
  document.getElementById('form-banner').addEventListener('submit', async (e) => {
    e.preventDefault();
    const bannerUrl = document.getElementById('bannerUrl').value;
    const bannerAlt = document.getElementById('bannerAlt').value;
    try {
      await updateBanner(username, bannerUrl, bannerAlt);
      await updateProfile(username); // Refresh UI after update
      alert('Banner updated successfully!');
      bannerModal.classList.add('hidden');
    } catch (error) {
      alert('Error updating banner: ' + error.message);
    }
  });

  // Avatar modal setup
  const avatarModal = document.getElementById('modal-avatar');
  document.getElementById('openAvatarModal').addEventListener('click', () => {
    avatarModal.classList.remove('hidden');
  });
  document.getElementById('closeAvatarModal').addEventListener('click', () => {
    avatarModal.classList.add('hidden');
  });
  document.getElementById('form-avatar').addEventListener('submit', async (e) => {
    e.preventDefault();
    const avatarUrl = document.getElementById('avatarUrl').value;
    const avatarAlt = document.getElementById('avatarAlt').value;
    try {
      await updateAvatar(username, avatarUrl, avatarAlt);
      await updateProfile(username); // Refresh UI after update
      alert('Avatar updated successfully!');
      avatarModal.classList.add('hidden');
    } catch (error) {
      alert('Error updating avatar: ' + error.message);
    }
  });

  // Bio modal setup
  const bioModal = document.getElementById('modal-bio');
  document.getElementById('openBioModal').addEventListener('click', () => {
    bioModal.classList.remove('hidden');
  });
  document.getElementById('closeBioModal').addEventListener('click', () => {
    bioModal.classList.add('hidden');
  });
  document.getElementById('form-bio').addEventListener('submit', async (e) => {
    e.preventDefault();
    const bioText = document.getElementById('bioText').value;
    try {
      await updateBio(username, bioText);
      await updateProfile(username); // Refresh UI after update
      alert('Bio updated successfully!');
      bioModal.classList.add('hidden');
    } catch (error) {
      alert('Error updating bio: ' + error.message);
    }
  });
}
