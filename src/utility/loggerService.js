import config from "../../configuration/config.js";

export const logger= (level,message,...params) => {
    const timestamp = new Date().toISOString();
    message = params.reduce((message, param, index) => message.replace(`{${index}}`, param), message);
    const loggerfinalMessage = `[${timestamp}] [${level}] : ${message}`;

    switch(level){
        case config.app.loggingLevel.INFO : console.info(loggerfinalMessage);
        break;
        case config.app.loggingLevel.WARN : console.warn(loggerfinalMessage);
        break;
        case config.app.loggingLevel.ERROR : console.error(loggerfinalMessage);
        break;
        default:
            console.log(`[${timestamp}] [DEFAULT] : ${message}`);
    }
};
