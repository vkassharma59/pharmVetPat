let access_token = '';
let ip_address = '';
let screenColumn = '';
let keyword = '';
let column = '';
let activeForm = '';
let loginToken = '';

let column_list: any = {
  technical_route_column_list: [],
  chemical_directory_column_list: [],
  basic_product_column_list: [],
  dmf_supplier_column_list: [],
  impurity_column_list: [],
};

const UpdateToken = (token: any) => {
  access_token = token;
};

const updateIp = (ip: any) => {
  ip_address = ip;
};

const getIp = () => {
  return ip_address;
};

const getToken = () => {
  return access_token;
};

const setColumnList = (column: any, value: any) => {
  column_list[column] = value;
};

const getColumnList = () => {
  return column_list;
};

const setActiveformValues = (props: any) => {
  screenColumn = props.screenColumn;
  keyword = props.keyword.value;
  column = props.column;
  activeForm = props.activeForm;
};

const getActiveformValues = () => {
  return { screenColumn, keyword, column, activeForm };
};

const setLoginToken = (token: any) => {
  loginToken = token;
};

const getLoginToken = () => {
  return loginToken;
};

export const Auth_operations = {
  UpdateToken,
  getToken,
  updateIp,
  getIp,
  setActiveformValues,
  getActiveformValues,
  setColumnList,
  getColumnList,
  setLoginToken,
  getLoginToken,
};
