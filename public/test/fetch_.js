const API = "https://localhost:8001";
console.log(API);
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
    .then((data) => {
      callback(data);
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
    .then((data) => {
      callback(data);
    })
    .catch(error => {
      error_handle(error);
      callback(error);
    });
}
///////////////////////////////////////////////
const logout = (callback) => {
  //
  fetch_get(`${API}/user/logout`, (data) => {
    callback(data);
  })
}
const checkLoginFunction = (callback) => {
  fetch(`${API}/user/login_available`)
    .then((response) => response.json())
    .then((data) => {
      callback(data);
    })
    .catch(error => {
      error_handle(error);
      callback(false);
    });
}
function userLoginWithThirdParty(idToken, callback) {
  const body = { body: JSON.stringify({ idToken }) };
  fetch_post(`${API}/user/login_by_third_party`, body, (data) => {
    callback(data);
  });
}
///////////////////////////////////////////////
export {
  userLoginWithThirdParty,
  checkLoginFunction,
  logout
}