function createFileHash(file) {
  return new Promise((resolve, reject) => {
    var reader = new FileReader();
    reader.onload = function (evt) {
      const hash = CryptoJS.SHA256(arrayBufferToWordArray(evt.target.result)).toString();
      resolve(hash);
    };
    reader.onerror = function (evt) {
      reject(evt.target.error);
    };
    reader.readAsArrayBuffer(file);

    ///////////////////////////////
    function arrayBufferToWordArray(ab) {
      var i8a = new Uint8Array(ab);
      var a = [];
      for (var i = 0; i < i8a.length; i += 4) {
        a.push((i8a[i] << 24) | (i8a[i + 1] << 16) | (i8a[i + 2] << 8) | (i8a[i + 3]));
      }
      return CryptoJS.lib.WordArray.create(a, i8a.length);
    }
  });
}

export {
  createFileHash
}