 //Session Storage
export const Session = {
  set(key, value) {
    const tabKey = `${window.name}-${key}`;
    sessionStorage.setItem(tabKey, JSON.stringify(value));
  },

  get(key) {
    const tabKey = `${window.name}-${key}`;
    const value = sessionStorage.getItem(tabKey);
    return value ? JSON.parse(value) : null;
  },

  remove(key) {
    const tabKey = `${window.name}-${key}`;
    sessionStorage.removeItem(tabKey);
  }
};


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
