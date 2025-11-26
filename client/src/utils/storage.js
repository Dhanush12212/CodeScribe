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

export const Session = { 

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
