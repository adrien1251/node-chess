/**
	Games contain the history of a board and the board itself.

	At time of writing this, the game is also intended to store some
	degree of information regarding the opponents and keys that
	could be used for storage, etc.
*/

import { Board } from './board';
import { SideType } from './piece';
import crypto from 'crypto';

// types
var Move = function (sq1, sq2, cp, n, h) {
	'use strict';

	this.capturedPiece = cp;
	this.hashCode = h;
	this.algebraic = n || undefined;
	this.promotion = false;
	this.piece = sq2.piece;
	this.prevFile = sq1.file;
	this.prevRank = sq1.rank;
	this.postFile = sq2.file;
	this.postRank = sq2.rank;
};

// event handlers
var addToHistory = function (g) {
	'use strict';

	return function (ev) {
		var
			hashCode = g.getHashCode(),
			m = new Move(
				ev.prevSquare,
				ev.postSquare,
				ev.capturedPiece,
				ev.algebraic,
				hashCode);

		g.moveHistory.push(m);
	};
};

var denotePromotionInHistory = function (g) {
	'use strict';

	return function () {
		var latest = g.moveHistory[g.moveHistory.length - 1];

		if (latest) {
			latest.promotion = true;
		}
	};
};

// ctor
var Game = function (b) {
	'use strict';

	this.board = b;
	this.moveHistory = [];
};

Game.prototype.getCurrentSide = function () {
	'use strict';

	return this.moveHistory.length % 2 === 0 ?
			SideType.White :
			SideType.Black;
};

Game.prototype.getHashCode = function () {
	'use strict';

	var
		i = 0,
		sum = crypto.createHash('md5');

	for (i = 0; i < this.board.squares.length; i++) {
		if (this.board.squares[i].piece !== null) {
			sum.update(this.board.squares[i].file +
				this.board.squares[i].rank +
				(this.board.squares[i].piece.side === SideType.White ? 'w' : 'b') +
				this.board.squares[i].piece.notation +
				(i < (this.board.squares.length - 1) ? '-' : ''));
		}
	}

	// generate hash code for board
	return sum.digest('base64');
};

// exports
module.exports = {
	// methods
	create : function () {
		'use strict';

		var
			b = Board.create(),
			g = new Game(b);

		b.on('move', addToHistory(g));
		b.on('promote', denotePromotionInHistory(g));

		return g;
	},
	load : function (moveHistory) {
		'use strict';

		var
			b = Board.create(),
			g = new Game(),
			i = 0;

		b.on('move', addToHistory(g));
		b.on('promote', denotePromotionInHistory(g));

		for (i = 0; i < moveHistory.length; i++) {
			b.move(b.getSquare(moveHistory[i].prevFile, moveHistory[i].prevRank),
				b.getSquare(moveHistory[i].postFile, moveHistory[i].postRank));
		}

		return g;
	}
};
