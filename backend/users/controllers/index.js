const joi = require("joi");
const models = require("../../database/models");

exports.submitIdentification = async (req, res) => {
  const { userId, idType, document } = req.body;

  const schema = joi.object({
    userId: joi.number().required(),
    document: joi.string().required(),
    idType: joi.string().required(),
  });

  const validation = schema.validate({
    userId,
    idType,
    document,
  });

  if (validation.error) {
    return res.status(400).json({
      success: false,
      error: validation.error.details[0].message,
    });
  }

  const t = await models.sequelize.transaction();

  try {
    const identification = await models.userIdentification.create({
      userId,
      type: idType,
      document,
    });
    await t.commit();

    return res.status(200).json({
      success: true,
      message: "id added successfully",
      identification,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: "Internal server error",
    });
  }
};
