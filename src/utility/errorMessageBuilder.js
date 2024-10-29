/* errorMessageBuilder.js 
 *
 * This utility file builds the error message for logger service.
 */

export const errorMessageBuilder = (message, ...params) => {
    return params.reduce((message, param, index) => message.replace(`{${index}}`, param), message);
};