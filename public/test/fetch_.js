const API = window.location.toString().split('/').slice(0, 3).join("/");
console.log("current API", API);
let default_fetch_options = {
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json",
};
function error_handle(error) {
  console.error(error);
}
function fetch_get(url, callback) {
  const body = {
    method: "GET",
    headers: {
      ...default_fetch_options,
    },
    credentials: "include",
  }
  fetch(url, body)
    .then((response) => response.json())
    .then((res) => {
      callback(res);
    })
    .catch(error => {
      error_handle(error);
      callback({ error: "fetch error" });
    });
}
function fetch_post(url, fetchOptions, callback, method = 'POST') {
  fetchOptions.method = method;
  fetchOptions.headers = {
    ...default_fetch_options,
    ...fetchOptions.headers
  }
  if (fetchOptions.headers['Content-Type'] === "delete")
    delete fetchOptions.headers['Content-Type'];
  //add cookies before fire
  fetchOptions.credentials = "include";
  fetch(url, fetchOptions)
    .then((response) => response.json())
    .then((res) => {
      callback(res);
    })
    .catch(error => {
      error_handle(error);
      callback(error);
    });
}
function fetch_put(url, fetchOptions, callback, method = 'PUT') {
  fetch_post(url, fetchOptions, callback, method);
}
///////////////////////////////////////////////
const logout = (callback) => {
  //
  fetch_get(`${API}/user/logout`, (res) => {
    callback(res);
  })
}
const checkLoginFunction = (callback) => {
  fetch(`${API}/user/login_available`)
    .then((response) => response.json())
    .then((res) => {
      callback(res);
    })
    .catch(error => {
      error_handle(error);
      callback(false);
    });
}
function userLoginWithThirdParty(idToken, callback) {
  const body = { body: JSON.stringify({ idToken }) };
  fetch_post(`${API}/user/login_by_third_party`, body, (res) => {
    callback(res);
  });
}
function newHappn(formData, callback) {
  //set content-type to delete, means let the Browser generate the content-type, in this request should be "multipart/form-data;" with the Boundary string 
  const body = { body: formData, headers: { "Content-Type": "delete" }, };
  fetch_post(`${API}/event/new`, body, (res) => {
    callback(res);
  });
}
function updateHappn(happn_detail_id, jsonData, callback) {
  fetch_put(
    `${API}/event/update_detail/${happn_detail_id}`,
    { body: JSON.stringify(jsonData) },
    res => {
      console.log(res);
      callback(res);
    });
}
function getHappnById(happnId, callback) {
  fetch_get(`${API}/event_public_access/get_happn_by_id/${happnId}`, res => {
    callback(res);
  })
}
function checkImageExist(fileHash, callback) {
  fetch_get(`${API}/public_access/check_image_exist/${fileHash}`, res => {
    callback(res);
  })
}
///////////////////////////////////////////////
export default {
  userLoginWithThirdParty,
  checkLoginFunction,
  logout,
  //happn/event//////////
  newHappn,
  updateHappn,
  getHappnById,
  checkImageExist
}