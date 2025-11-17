// ✅ utils/soundNotification.js
export const playSound = (type) => {
  let soundPath = "";

  switch (type) {
    case "success":
      soundPath = "/success.mp3";
      break;
    case "stop":
      soundPath = "/success.mp3";
      break;
    case "error":
      soundPath = "/success.mp3";
      break;
    default:
      return;
  }

  const audio = new Audio(soundPath);
  audio.volume = 0.5; // medium volume

  // ✅ Play safely and handle browser block
  audio
    .play()
    .then(() => {
      console.log(`🔊 Played sound: ${type}`);
    })
    .catch((err) => {
      console.warn("⚠️ Sound playback blocked by browser:", err);
    });
};
