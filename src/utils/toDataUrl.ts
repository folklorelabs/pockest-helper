async function toDataUrl(url) {
  return fetch(url)
    .then((response) => response.blob())
    .then((blob) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    }));
}

export default toDataUrl;
