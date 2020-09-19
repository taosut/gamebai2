/**
 * Created by vinplay on 2/4/17.
 */

CoUp.GameLogic = cc.Class.extend({
    ctor: function() {
        this.playerSize = 10;
        this.boardRow = CoUp.BoardRow;
        this.boardCol = CoUp.BoardCol;
        this.board = new Array(this.boardRow);
        for (var i = 0; i < this.boardRow; i++) {
            this.board[i] = new Array(this.boardCol);
        }
        this.players = [];
        this.viewers = [];
        this.pieces = null;
        this.currentPlayer = -1;
        this.mePlaying = false;
        this.myGameChair = -1;
    },

    initBoard: function() {
        for (var i = 0; i < this.boardRow; i++) {
            for (var j = 0; j < this.boardCol; j++) {
                this.board[i][j] = new CoUp.CoUpTile();
            }
        }
    },

    initStartGame: function() {
        this.initBoard();
        var isReverse = false;
        var player;
        cc.log("i am playing " + this.mePlaying);
        cc.log("my game chair " + this.myGameChair);
        cc.log("my color: " + this.myChessColor);
        if (this.mePlaying) {
            player = this.getPlayerByGameChair(this.myGameChair);
            cc.log("check my color: " + player.chessColor);
        } else {
            player = this.getPlayerByChessColor("b");
        }

        if (player.chessColor == "r") {
            isReverse = true;
        }

        if (isReverse) {
            this.initPiece(CoUp.startPieceReverse);
        } else {
            this.initPiece(CoUp.startPiece);
        }
    },

    initPiece: function(data) {
        this.pieces = [];
        for (var i = 0; i < data.length; i++) {
            var x = data[i][1];
            var y = data[i][2];
            var name = data[i][0];
            var piece = this.createPieceByName(name, x, y);
            this.pieces.push(piece);
            this.board[x][y].setPiece(piece);
        }
    },

    isBlank: function(x, y) {
        return this.board[x][y].piece == null;
    },

    canMovePiece: function(sx, sy, dx, dy) {
        if (this.isBlank(sx, sy))
            return false;
        if (!this.isBlank(dx, dy)) {
            if (this.board[sx][sy].piece.owner == this.board[dx][dy].piece.owner)
                return false;
        }
        var cloneBoard = this.cloneBoard();
        cloneBoard[dx][dy].setPiece(cloneBoard[sx][sy].piece);
        cloneBoard[sx][sy].removePiece();
        return !this.checkEndGame(cloneBoard, this.getEnemyOf(cloneBoard[dx][dy].piece.owner), cloneBoard[dx][dy].piece.owner);
    },

    movePiece: function(sx, sy, dx, dy) {
        this.board[dx][dy].setPiece(this.board[sx][sy].piece);
        this.board[sx][sy].removePiece();
        this.board[dx][dy].piece.x = dx;
        this.board[dx][dy].piece.y = dy;
    },

    checkEndGame: function(board, attacker, defender) {
        var generalPos = this.getGeneralPosOf(board, defender);
        for (var i = 0; i < this.boardRow; i++) {
            for (var j = 0; j < this.boardCol; j++) {
                var piece = board[i][j].piece;
                if (!piece)
                    continue;
                if (piece.owner == attacker) {
                    if ((piece.x < generalPos.x - 2 || piece.x > generalPos.x + 2) &&
                        (piece.y < generalPos.y - 2 || piece.y > generalPos.y + 2))
                        continue;
                    var listAttackPos = piece.getAttackPosInBoard(board);
                    for (var k = 0; k < listAttackPos.length; k++) {
                        if (listAttackPos[k].x == generalPos.x && listAttackPos[k].y == generalPos.y) {
                            cc.log("end game day ong ah");
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    },

    getGeneralPosOf: function(board, player) {
        for (var i = 0; i < this.boardRow; i++) {
            for (var j = 0; j < this.boardCol; j++) {
                var piece = board[i][j].piece;
                if (!piece)
                    continue;
                if (piece.owner == player && piece instanceof CoUp.General) {
                    return {x: i, y: j};
                }
            }
        }
        return null;
    },

    getEnemyOf: function(player) {
        if (player == "r")
            return "b";
        return "r";
    },

    cloneBoard: function() {
        var cloneBoard = new Array(this.boardRow);
        for (var i = 0; i < this.boardRow; i++) {
            cloneBoard[i] = new Array(this.boardCol);
            for (var j = 0; j < this.boardCol; j++) {
                cloneBoard[i][j] = new CoUp.CoUpTile();
                cloneBoard[i][j].setPiece(this.board[i][j].piece);
            }
        }
        return cloneBoard;
    },

    createPieceByName: function(name, x, y) {
        var piece = null;
        switch (name[1]) {
            case 'g':
                piece = new CoUp.General();
                break;
            case 's':
                piece = new CoUp.Guard();
                break;
            case 't':
                piece = new CoUp.Elephant();
                break;
            case 'm':
                piece = new CoUp.Horse();
                break;
            case 'x':
                piece = new CoUp.Chariot();
                break;
            case 'p':
                piece = new CoUp.Cannon();
                break;
            case 'z':
                piece = new CoUp.Soldier();
                break;
        }
        piece.initData(name, x, y);
        return piece;
    },

    isOverRiver: function(owner, x) {
        if (this.mePlaying) {
            if (this.myChessColor == owner) {
                return x > CoUp.river
            }
            return x <= CoUp.river;
        }
        if (owner == "b")
            return x > CoUp.river;
        return x <= CoUp.river;
    },

    isMyTurn: function() {
        return this.mePlaying && this.currentPlayer == this.myGameChair;
    },

    joinRoom: function(pk) {
        this.playerSize = pk.playerSize;
        for(i = 0; i < this.playerSize; i++){
            var player = {};
            player.status = 0;
            this.players.push(player);
        }

        cc.log("joinRoom 1");
        this.gameState = CoUp.GameState.JOIN_ROOM;
        this.bet = pk.moneyBet;
        this.moneyType = pk.moneyType;
        this.roomId = pk.roomId;
        this.gameId = pk.gameId;
        this.myChair = pk.myChair;
        this.gameAction = pk.gameAction;
        this.activeTimeRemain = pk.countDownTime;

        for(var i = 0; i < this.playerSize; i++)
        {
            var chair = i;
            this.players[chair].info = pk.playerInfos[i];
            this.players[chair].info.chair = chair;
            this.players[chair].status = pk.playerStatus[i];
        }
        cc.log("joinRoom end");
    },

    notifyOutRoom: function(pk) {
        this.gameState = CoUp.GameState.NOTIFYOUTROOM;
    },

    userLeave: function(pkg) {
        cc.log("vao userLeave logic");

        var chairLocal = pkg.chair;
        if(pkg.nickName){
            this.activeLocalChair = chairLocal;
            if (this.players[chairLocal]) {
                this.players[chairLocal].status = 0;
                this.players[chairLocal].info.gameChair = -1;
            }
        }
        cc.log("local chair: " + this.activeLocalChair);
        this.gameState = CoUp.GameState.USER_LEAVE;
    },

    userJoinRoom: function(pkg) {
        this.gameState = CoUp.GameState.USER_JOIN;
        var chairLocal = pkg.info.chair;
        cc.log("log user join room");
        cc.log(chairLocal);
        cc.log(this.players);
        this.players[chairLocal].info = pkg.info;
        this.players[chairLocal].status = pkg.uStatus;
    },

    autoStart: function(pk){
        this.gameState = CoUp.GameState.AUTO_START;
        this.timeAutoStart = pk.timeAutoStart;
    },

    startGame: function(pk) {
        this.gameState = CoUp.GameState.START_GAME;
        this.isPlaying = true;
        this.starter = pk.starter;
        this.currentPlayer = -1;
        cc.log(this.myGameChair);
        for (var i = 0; i < 2; i++) {
            var player = this.getPlayerByGameChair(pk.playerInfo[i].gameChair);
            if (player) {
                player.status = pk.playerInfo[i].status;
                player.chessColor = pk.playerInfo[i].chessColor == 114 ? "r" : "b";
                player.turnTime = pk.playerInfo[i].turnTime;
                player.gameTime = pk.playerInfo[i].gameTime;
                if (player.info.gameChair == this.myGameChair) {
                    this.myChessColor = player.chessColor;
                }
                cc.log("player " + player.info.gameChair + " color " + player.chessColor);
            }
        }
        this.initStartGame();
    },

    getPlayerByGameChair: function(gameChair) {
        for (var i = 0; i < this.players.length; i++)
            if (this.players[i].status > 0 && this.players[i].info.gameChair == gameChair)
                return this.players[i];
        return null;
    },

    getPlayerByChessColor: function(chessColor) {
        for (var i = 0; i < this.players.length; i++)
            if (this.players[i].status > 0 && this.players[i].chessColor == chessColor)
                return this.players[i];
        return null;
    },

    convertToServerPos: function(x, y) {
        if (!this.mePlaying || this.myChessColor == "b")
            return {x: x, y: y};
        return {x: CoUp.BoardRow - x - 1, y: CoUp.BoardCol - y - 1};
    },

    resetData: function() {
        this.currentPlayer = -1;
    },

    takeTurn: function(pk) {
        this.gameState = CoUp.GameState.TAKE_TURN;
        this.movedPiece = this.board[pk.sx][pk.sy].piece;
        this.killedPiece = this.board[pk.dx][pk.dy].piece;
        if (pk.isTrans) {
            this.board[pk.sx][pk.sy].piece = this.createPieceByName(pk.newPiece, pk.sx, pk.sy);
            this.board[pk.sx][pk.sy].piece.state = CoUp.Piece.State.LAT;
        }
        this.movePiece(pk.sx, pk.sy, pk.dx, pk.dy);
    },

    changeTurn: function(pk) {
        this.currentPlayer = pk.currentPlayer;
        this.countDownTime = pk.turnTime;
        this.gameTime = pk.gameTime;
        this.gameState = CoUp.GameState.CHANGE_TURN;
    },

    endGame: function(data) {
        this.currentPlayer = -1;
        this.isPlaying = false;
        var playerWin = this.getPlayerByGameChair(data.winner);
        var playerLose = this.getPlayerByGameChair(1 - data.winner);
        if (data.result == CoUp.Result.WIN_LOSE || data.result == CoUp.Result.RESIGN || data.result == CoUp.Result.TIME_OUT) {
            playerWin.tongCuoiVan = data.moneyWin;
            playerLose.tongCuoiVan = -data.moneyLose;
        } else {
            playerWin.tongCuoiVan = data.moneyWin;
            playerLose.tongCuoiVan = data.moneyLose;
        }
        for (i = 0; i < 2; i++) {
            var player = this.getPlayerByGameChair(i);
            player.info.money = data.currentMoney[i];
            if (i == this.myGameChair) {
                lobby.updateMoney(data.currentMoney[i], this.moneyType);
            }
        }

        this.gameState = CoUp.GameState.END_GAME;
    },

    updateMatch: function(pk) {
        this.gameState = CoUp.GameState.UPDATE_MATCH;
        for (i = 0; i < pk.size; i++) {
            if (pk.hasInfoAtChair[i])
                this.players[i].status = pk.playerStatus[i];
        }
        this.resetData();
    },

    updateState: function(state) {
        this.gameState = state;
    },

    reconnect: function(pk) {
        cc.log("start reconnect");
        this.isPlaying = true;
        this.bet = pk.moneyBet;
        this.moneyType = pk.moneyType;
        this.roomId = pk.roomId;
        this.gameId = pk.gameId;
        this.myChair = pk.myChair;
        this.gameAction = pk.gameAction;
        this.countDownTime = pk.countDownTime;
        this.mePlaying = false;
        this.myGameChair = -1;

        for(var i = 0; i < pk.maxUserPerRoom; i++)
        {
            if (this.gameState == CoUp.GameState.RECONNECT) {
                this.players.push(pk.playerInfo[i]);
                this.players[i].info.chair = i;
                if (i == this.myChair) {
                    this.myGameChair = this.players[i].info.gameChair;
                    this.mePlaying = true;
                    this.myChessColor = this.players[i].chessColor;
                }
            } else {
                if (pk.hasInfoAtChair[i]) {
                    this.players[i] = pk.playerInfo[i];
                    this.players[i].info.chair = i;
                    if (i == this.myChair) {
                        this.myGameChair = this.players[i].info.gameChair;
                        this.mePlaying = true;
                        this.myChessColor = this.players[i].chessColor;
                    }
                }
            }
        }

        this.currentPlayer = pk.currentChair;
        this.initBoard();
        var isReverse = false;
        var player;
        cc.log("i am playing " + this.mePlaying);
        cc.log("my game chair " + this.myGameChair);
        cc.log("my color: " + this.myChessColor);
        if (this.mePlaying) {
            player = this.getPlayerByGameChair(this.myGameChair);
            cc.log("check my color: " + player.chessColor);
        } else {
            player = this.getPlayerByChessColor("b");
        }

        if (player.chessColor == "r") {
            isReverse = true;
        }

        var mapData = [];
        for (var i = 0; i < pk.board.length; i++) {
            for (var j = 0; j < pk.board[i].length; j++) {
                if (pk.board[i][j] != "") {
                    if (isReverse) {
                        mapData.push([pk.board[i][j], CoUp.BoardRow - i - 1, CoUp.BoardCol - j - 1]);
                    } else {
                        mapData.push([pk.board[i][j], i, j]);
                    }
                }
            }
        }
        this.initPiece(mapData);

        for (var i = 0; i < this.board.length; i++) {
            for (var j = 0; j < this.board[i].length; j++) {
                var x = i;
                var y = j;
                if (isReverse) {
                    x = CoUp.BoardRow - i - 1;
                    y = CoUp.BoardCol - j - 1;
                }
                if (pk.statusMap[x][y] == 2) {
                    this.board[i][j].piece.state = CoUp.Piece.State.LAT;
                }
            }
        }
    },

    sitting: function(pk) {
        this.gameState = CoUp.GameState.DANG_KI_GAME;
        for (var i = 0 ; i < this.players.length; i++) {
            cc.log(this.players[i].info.nickName);
            if (this.players[i].info.nickName == pk.nickname) {
                this.players[i].info.gameChair = pk.gameChair;
                this.players[i].info.money = pk.currentMoney;
                this.players[i].status = 2;
                if (i == this.myChair) {
                    this.myGameChair = pk.gameChair;
                    this.mePlaying = true;
                }
                return;
            }
        }
    },

    standup: function(pk) {
        this.gameState = CoUp.GameState.HUY_DANG_KI_GAME;
        for (var i = 0 ; i < this.players.length; i++) {
            cc.log(this.players[i].info.nickName);
            if (this.players[i].info.nickName == pk.nickname) {
                this.players[i].info.gameChair = -1;
                this.players[i].info.money = pk.currentMoney;
                this.players[i].status = 1;
                if (i == this.myChair) {
                    this.myGameChair = -1;
                    this.mePlaying = false;
                }
                return;
            }
        }
    },

    updateViewerList: function() {
        cc.log(this.players);
        this.viewers = [];
        for (var i = 0; i < this.players.length; i++) {
            if (this.players[i].status >= 1) {
                this.viewers.push(this.players[i]);
            }
        }
        cc.log(this.players);
    }
});

CoUp.isInPalace = function(x, y) {
    return ((x >= CoUp.Palace.minx1 && x <= CoUp.Palace.maxx1) || (x >= CoUp.Palace.minx2 && x <= CoUp.Palace.maxx2))
            && (y >= CoUp.Palace.miny && y <= CoUp.Palace.maxy);
};

CoUp.isInBoard = function(x, y) {
    return 0 <= x && x < CoUp.BoardRow && 0 <= y && y < CoUp.BoardCol;
};

CoUp.GameState = {
    JOIN_ROOM: 0,
    END_GAME: 1,
    START_GAME: 2,
    THONG_TIN_VAN_CHOI: 3,
    NOTIFYOUTROOM: 4,
    AUTO_START: 5,
    USER_JOIN: 6,
    USER_LEAVE: 7,
    UPDATE_MATCH: 8,
    TAKE_TURN: 9,
    CHANGE_TURN: 10,
    DANG_KI_GAME: 11,
    HUY_DANG_KI_GAME: 12,
    RECONNECT: 13
};

CoUp.GameLogic.MAX_PLAYER = 2;