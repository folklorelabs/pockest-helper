export default class LocalStorageCache {
  id: string;
  
  constructor(id: string) {
    this.id = id;
  }

  set(data: unknown) {
    window.localStorage.setItem(this.id, JSON.stringify(data));
  }

  get() {
    const cachedData = window.localStorage.getItem(this.id);
    return cachedData && JSON.parse(cachedData);
  }
}
