//Local Storage
export const Local = {
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  get(key) {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  },
  remove(key) {
    localStorage.removeItem(key);
  }
};

//Session Storage
export const Session = {
  setRoom(roomId) {},
  set(key, value) {
    sessionStorage.setItem(key, JSON.stringify(value));
  },
  get(key) {
    const stored = sessionStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  },
  remove(key) {
    sessionStorage.removeItem(key);
  }
};
