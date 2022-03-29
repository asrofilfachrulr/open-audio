/* eslint-disable camelcase */

exports.up = (pgm) => {
	pgm.createTable('user_album_like', {
		id: {
			type: 'VARCHAR(50)',
			primaryKey: true,
		},
		user_id: {
			type: 'VARCHAR(50)',
			notNull: true,
		},
		album_id: {
			type: 'VARCHAR(50)',
			notNull: true,
		},
	});

	pgm.addConstraint('user_album_like', 'unique_user_album_like.user_id_user_album_like.album_id', 'UNIQUE(user_id, album_id)');
	pgm.addConstraint('user_album_like', 'fk_user_album_like.user_id_users.id', 'FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE');
	pgm.addConstraint('user_album_like', 'fk_user_album_like.album_id_albums.id', 'FOREIGN KEY(album_id) REFERENCES albums(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
	pgm.dropTable('user_album_like');
};
