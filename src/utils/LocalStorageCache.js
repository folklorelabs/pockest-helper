export default class LocalStorageCache {
  constructor(id) {
    this.id = id;
  }

  set(data) {
    window.localStorage.setItem(this.id, JSON.stringify(data));
  }

  get() {
    const cachedData = window.localStorage.getItem(this.id);
    return cachedData && JSON.parse(cachedData);
  }
}
