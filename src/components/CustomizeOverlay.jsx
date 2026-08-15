import React, { useState, useEffect } from 'react';
import {
  getNotificationPermission,
  requestNotificationPermission,
  isNotificationSupported,
} from '../utils/notifications';

const avatarOptions = ['👦🏻', '👨🏽', '👨🏽‍🦱', '🐻', '🦊', '🐼', '🐥', '🌸', '💙', '💜', '🫂'];

const CustomizeOverlay = ({ isOpen, settings, onSave, onClose }) => {
  const [name, setName] = useState(settings.name);
  const [nickname, setNickname] = useState(settings.nickname);
  const [avatar, setAvatar] = useState(settings.avatar);
  const [notifStatus, setNotifStatus] = useState(getNotificationPermission);

  useEffect(() => {
    if (isOpen) {
      setName(settings.name);
      setNickname(settings.nickname);
      setAvatar(settings.avatar);
      setNotifStatus(getNotificationPermission());
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      name: name.trim() || 'Nini',
      nickname: nickname.trim() || 'jaanu',
      avatar,
    });
    onClose();
  };

  const handleEnableNotifications = async () => {
    const result = await requestNotificationPermission();
    setNotifStatus(result);
  };

  const notifLabel =
    notifStatus === 'granted'
      ? 'Notifications on 🔔'
      : notifStatus === 'denied'
      ? 'Blocked — enable in browser settings'
      : 'Enable Notifications 🔔';

  return (
    <div className="nini-modal-overlay" onClick={onClose}>
      <div className="nini-modal-card" onClick={(e) => e.stopPropagation()}>
        <h2>Customize 🎨</h2>
        <p className="modal-sub">Make it feel like yours.</p>

        <label className="field-label">Nini's name</label>
        <input
          className="field-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nini"
          maxLength={20}
        />

        <label className="field-label">Nickname Nini calls you</label>
        <input
          className="field-input"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="jaanu"
          maxLength={20}
        />

        <label className="field-label">Pick an avatar</label>
        <div className="avatar-grid">
          {avatarOptions.map((emoji) => (
            <button
              key={emoji}
              className={`avatar-option ${avatar === emoji ? 'selected' : ''}`}
              onClick={() => setAvatar(emoji)}
            >
              {emoji}
            </button>
          ))}
        </div>

        {isNotificationSupported() && (
          <>
            <label className="field-label">Notifications</label>
            <button
              className="modal-close-btn notif-btn"
              onClick={handleEnableNotifications}
              disabled={notifStatus === 'granted' || notifStatus === 'denied'}
            >
              {notifLabel}
            </button>
          </>
        )}

        <button className="modal-save-btn" onClick={handleSave}>Save 💖</button>
      </div>
    </div>
  );
};

export default CustomizeOverlay;
