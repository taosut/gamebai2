//
BaiCao.Player = cc.Class.extend({
    ctor: function(){
       //thong tin cua nguoi choi;
       this.ingame= false;
       this.active = true;
       this.chairInServer= -1;
       this.chairLocal= -1;
       this.type= 1;            // type = 0: My
       this.cards= [];
       this.state= 0;
       this.status= -1;
       // user info
       this.info= {};
       this.info.nickName = "phuBaDao";
       this.info.money = 999999;
       this.isChuong = false;
       this.isMy = false;
       this.tienDatCuoc = 0;
       this.moneyBet = 0;
       this.hasMoBai = false;
    },

    clearNewGame: function(){
        this.hasMoBai = false;
        this.moneyBet = 0;
        this.isChuong = false;
        this.cards = [];
    }


});