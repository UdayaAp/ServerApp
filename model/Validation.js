const Joi = require('joi');
var joi = require('joi');


//register Validation

const registerValidation = (data) => {
    const schema = joi.object({
        firstName: Joi.string().min(2).required(),
        lastName: Joi.string().min(2).required(),
        email: Joi.string().min(6).required().email(),
        password: Joi.string().min(8).required()


    });
    return schema.validate(data);
}


const loginValidation = (data) => {

    const schema = joi.object({
        email: Joi.string().min(6).required().email(),
        password: Joi.string().min(8).required()
    });
    return schema.validate(data)
};


module.exports = { registerValidation, loginValidation };