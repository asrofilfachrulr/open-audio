/* eslint-disable no-unused-vars */
const mapDBToModel = ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  albumId,
}) => ({
  id,
  title,
  performer,
});

module.exports = mapDBToModel;
