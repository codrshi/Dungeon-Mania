export const errorMessageBuilder = (message,...params) => {
    return params.reduce((message, param, index) => message.replace(`{${index}}`, param), message);
};