const root_path = __dirname;
const processed_file_path = root_path + "/happn-images/";
const tmp_upload_file_path = root_path + "/uploads/";

const event_image_file_size_limit = 5_000_000;//5mb
const event_json_size_limit = 20_000;//20kb
/////////////////////////////////////////////
module.exports = {
  processed_file_path,
  event_image_file_size_limit,
  event_json_size_limit,
  root_path,
  tmp_upload_file_path
}