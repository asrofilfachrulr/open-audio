/* eslint-disable max-len */
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

const filterTitleSongByParam = (song, title) => (song.title.toLowerCase().includes(title));
const filterPerformerSongByParam = (song, performer) => (song.performer.toLowerCase().includes(performer));

module.exports = {
  mapDBToModel,
  filterPerformerSongByParam,
  filterTitleSongByParam,
};
