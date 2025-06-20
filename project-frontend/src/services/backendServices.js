export const serverURL = 'http://localhost:5000';

export const postData = async (url, body) => {
  try {
    const response = await fetch(`${serverURL}/${url}`, {
      method: 'POST',
      body
    });
    const result = await response.json();
    return result;
  } catch (e) {
    return null;
  }
};

export const getData = async (url) => {
  try {
    const response = await fetch(`${serverURL}/${url}`);
    const result = await response.json();
    return result;
  } catch (e) {
    return null;
  }
};
