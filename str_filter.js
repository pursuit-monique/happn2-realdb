//////////////////////////////////////////
function accept_file_only(str) {
  const regex = /[^a-zA-Z0-9.]/g;
  try {
    return str.replaceAll(regex, "").replaceAll(/\.{2,}/g, "");
  } catch (error) {
    console.error(error);
    return "";
  }
}
/////////////////////////////////////////
function user_input_filter(str) {
  //remove all not-stand symbol and quotation mark, for prevent injection
  const regex = new RegExp(/["'\\\/$%@`{}()~^><]/g);
  try {
    return str.replace(regex, "").trim();
  } catch (error) {
    console.log(error);
    return false;
  }
}

function user_input_letter_and_numbers_only(str) {
  const regex = /\W+/g;
  try {
    return str.replace(regex, "");
  } catch (error) {
    console.log(error);
    return false;
  }
}

function clean_up_uuid(uuid) {
  const regex = /[^0-9a-fA-F-]/g;  // Match characters that are NOT [0-9a-fA-F-]
  return uuid.replace(regex, '');
}

module.exports = {
  user_input_filter,
  user_input_letter_and_numbers_only,
  clean_up_uuid
}