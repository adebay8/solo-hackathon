const joi = require("joi");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const models = require("../../database/models");
dotenv.config();

// create user helper function

/**
 * @param {string} email email of the user
 * @param {string} password password of the user
 */
async function createUser(req, res) {
  const {
    email,
    password,
    firstName,
    lastName,
    otherNames,
    address,
    state,
    city,
    country,
    phoneNumber,
    profilePicture,
  } = req.body;

  const schema = joi.object({
    email: joi.string().required(),
    password: joi.string().required(),
    firstName: joi.string().required(),
    lastName: joi.string().required(),
    otherNames: joi.string().required(),
    address: joi.string().required(),
    city: joi.string().required(),
    state: joi.string().required(),
    country: joi.string().required(),
    phoneNumber: joi.string().required(),
    profilePicture: joi.string().required(),
  });
  const validation = schema.validate({
    email,
    password,
    firstName,
    lastName,
    otherNames,
    address,
    state,
    city,
    country,
    phoneNumber,
    profilePicture,
  });

  if (validation.error) {
    return res.status(400).json({
      success: false,
      error: validation.error.details[0].message,
    });
  }

  const t = await models.sequelize.transaction();

  try {
    const existingUser = await models.users.findOne(
      { where: { email } },
      { transaction: t }
    );

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "Account already exists",
      });
    }

    const user = await models.users.create(
      {
        email,
        password: bcrypt.hashSync(password, bcrypt.genSaltSync(10)),
        firstName,
        lastName,
        otherNames,
        address,
        state,
        city,
        country,
        phoneNumber,
        profilePicture,
      },
      { transaction: t }
    );

    const token = jwt.sign(JSON.stringify(user), process.env.TOKEN_SECRET);

    await t.commit();

    return res.status(200).json({
      success: true,
      token,
      message: "User account created",
      user,
    });
  } catch (error) {
    await t.rollback();
    res.status(400).json({
      success: false,
      error: "Internal server error",
    });
  }
}

async function getUser(req, res, next) {
  const { token } = req.body;
  const schema = joi.object({
    token: joi.string().required(),
  });
  const validation = schema.validate({
    token,
  });

  if (validation.error) {
    return res.status(400).json({
      success: false,
      error: validation.error.details[0].message,
    });
  }

  jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
    if (err)
      return res.status(403).json({ success: false, message: "invalid token" });
    res.status(200).json({ success: true, user });
  });
}

async function loginUser(req, res, next) {
  const { email, password } = req.body;

  const schema = joi.object({
    email: joi.string().required(),
    password: joi.string().required(),
  });
  const validation = schema.validate({
    email,
    password,
  });

  if (validation.error) {
    return res.status(400).json({
      success: false,
      error: validation.error.details[0].message,
    });
  }

  try {
    const user = await models.users.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Incorrect email or password",
      });
    }

    const token = jwt.sign(JSON.stringify(user), process.env.TOKEN_SECRET);

    res.status(200).json({
      success: true,
      token,
      user,
      message: "user logged in successfully",
    });
  } catch (error) {
    if (error.response) {
      return res.status(400).json({ error: error.response.data });
    }
    return res.status(400).json({ error });
  }
}

module.exports = { createUser, getUser, loginUser };
