import { Sender } from "../modules/types/types";

function sendNotification(message: string, user: Sender) {
  const notification = new Notification(`New message from @${user.username}`, {
    icon: `${import.meta.env.VITE_BACKEND_BASE_URL}/${user.profile}`,
    body: message,
  });

  notification.onclick = () => {
    window.open(`${import.meta.env.VITE_BACKEND_BASE_URL}/chats`);
  };
}

export default function checkPageStatus(message: string, user: Sender) {
  if (user._id !== localStorage.getItem("userId")) {
    return; 
  }

  if (document.hidden) {
    if (!("Notification" in window)) {
      alert("This browser does not support system notifications!");
    } else if (Notification.permission === "granted") {
      sendNotification(message, user);
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          sendNotification(message, user);
        }
      });
    }
  }
}
