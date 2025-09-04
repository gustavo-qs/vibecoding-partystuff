import Joi from 'joi';

export const songSchema = Joi.object({
  youtube_url: Joi.string().uri().required(),
  title: Joi.string().min(1).max(200).optional(),
  added_by: Joi.string().required(),
  user_fingerprint: Joi.string().optional()
});

export const hostKeySchema = Joi.object({
  key: Joi.string().length(32).required()
});

export const validateSongData = (data: any) => {
  return songSchema.validate(data);
};

export const validateHostKey = (data: any) => {
  return hostKeySchema.validate(data);
};
