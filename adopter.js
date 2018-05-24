'use strict';

//领养者 数据结构
var Adopter = function(jsonStr) {
	if (jsonStr) {
		var object = JSON.parse(jsonStr);
		this.address = object.address;						//用户地址(唯一)
		this.nickName = object.nickName;					//用户名称
		this.phone = object.phone;							//用户手机号码
		this.animalName = object.animalName;				//动物名称
		this.getAnimalTime = object.getAnimalTime;			//领养动物时间
		this.leaveAnimalTime = object.leaveAnimalTime;		//放生动物时间
		this.lastFeedTime = object.lastFeedTime;			//最后一次喂养动物时间
		this.animalWeight = object.animalWeight;			//动物体重
		this.animalType = object.animalType;				//动物类型
		this.granry  = object.granry;						//粮仓存量
		this.granryType = object.granryType;				//粮食类型
		this.invitationCode = object.invitationCode;		//用户被邀请码(对应动物数量号)
		this.invitationCount = object.invitationCount;		//用户邀请人数
		this.invitedCode = object.invitedCode;				//用户被邀请码
		this.balance = object.balance;						//用户账户余额	
	} else {
		this.address = "";				//用户地址(唯一)
		this.nickName = "";				//用户名称
		this.phone = "";				//用户手机号码
		this.animalName = "";			//动物名称
		this.getAnimalTime = "";		//领养动物时间
		this.leaveAnimalTime = ""		//放生动物时间
		this.lastFeedTime = "";			//最后一次喂养动物时间
		this.animalWeight = 0;			//动物体重
		this.animalType = "";			//动物类型
		this.granry  = 0;				//粮仓存量
		this.granryType = "";			//粮食类型
		this.invitationCode = "";		//用户邀请码(对应动物数量号)
		this.invitationCount = 0;		//用户邀请人数
		this.invitedCode = -1;			//用户被邀请码
		this.balance = 0;
	}
}

Adopter.prototype = {
	toString: function() {
		return JSON.stringify(this);
	}
};

var AdopterContract = function() {

	//管理员的存储
	LocalContractStorage.defineProperty(this,"adminAddress");		//管理员账户地址
	LocalContractStorage.defineProperty(this,"commisionAddress");	//收款地址

	//工程的存储
	LocalContractStorage.defineMapProperty(this,"arrayMap");
	LocalContractStorage.defineMapProperty(this,"dataMap");
	LocalContractStorage.defineProperty(this,"size");

	//所有的动物的体重
	LocalContractStorage.defineProperty(this,"weight");
	//所有玩家输入的资金数
	LocalContractStorage.defineProperty(this,"moneyPool");
	//领取奖励的分数要求,初始设定为 10000 weight
	LocalContractStorage.defineProperty(this,"gifLimit");
	//达到分数后可领取的金额
	 LocalContractStorage.defineProperty(this,"gifMoney")
	//总资助资金数
	LocalContractStorage.defineProperty(this,"totalSupportCount");
	//剩余自助资金
	LocalContractStorage.defineProperty(this,"leftSupportCount");
};

AdopterContract.prototype = {

	init: function() {
		this.adminAddress = "n1XfZsYC7dNmgVysW72S3EvFQy4xemindTW";
		this.commisionAddress = "n1XfZsYC7dNmgVysW72S3EvFQy4xemindTW";
		this.size = 0;
		this.weight = 0;
		this.moneyPool = 0;

		this.gifLimit = 1;
		// this.gifLimit = 10000;
		this.gifMoney = 0.01;
		this.totalSupportCount = 0;
		this.leftSupportCount = 0; 
	},

	//以地址作为用户的 key ,如有邀请码，填写邀请码
	//初始化帐号,初始化时输入(手机号码、用户姓名、宠物名称、邀请码)邀请码不存在就填默认值-1
	//phone 作为 key
	set : function(phone,nickName,animalName,invitedCode) {

		var from = Blockchain.transaction.from;
		var key = from;
		// var key = phone.trim();

		//判断用户是否存在
		var object = this.dataMap.get(key);
		if (object == null) {

			//判断是否有邀请码
			if (invitedCode == "") {
				//没有使用邀请码
				//创建新的用户
				this.createNewUser(phone,nickName,animalName,invitedCode);
			} else {

				//判断邀请码是否有效
				//检查是否为数字
				if (this.checkNumber(invitedCode) == false) {
					throw new Error("Please input the correct invitation code");
				}

				var size = this.size;
				//报邀请码无效,抛错误
				if (parseInt(invitedCode) > size) {
					throw new Error("Please input the correct invitation code");
				}
				//否则有效则创建新的用户
				this.createNewUser(phone,nickName,animalName,invitedCode);

			}
		} else {
			//存在就不在创建
			throw new Error("The address is exist.You could not use this address to create a new player");
			// throw new Error("The phone number is exist.You could not use this phone number to create a new player");
		}
	},

	//创建新的用户
	createNewUser : function(phone,nickName,animalName,invitedCode) {
		
		var index = this.size;
		var from = Blockchain.transaction.from;
		var value = Blockchain.transaction.value;

		var key = from;
		// var key = phone.trim();
		var object = new Adopter();

		object.address = from;				
		object.nickName = nickName;								
		object.phone = phone;										
		object.animalName = animalName;							
		object.getAnimalTime = Blockchain.block.timestamp;		
		object.leaveAnimalTime = ""								
		object.lastFeedTime = "";	

		var freeType = 0;
		var oneNasType = 0.001;
		var tenNasType = 0.01;
		var hundresType = 0.1;

		if (value == freeType) {
			object.animalWeight = 0;			
			object.animalType = "0";	
			//设置用户金库
			object.balance = freeType;	
		} else if (value == oneNasType * 1000000000000000000) {
			object.animalWeight = 1;			
			object.animalType = "1";
			object.balance = oneNasType;
		} else if (value == tenNasType * 1000000000000000000) {
			object.animalWeight = 100;			
			object.animalType = "2";
			object.balance = tenNasType;
		} else if (value == hundresType * 1000000000000000000) {
			object.animalWeight = 10000;			
			object.animalType = "3";
			object.balance = hundresType;
		} else {
			throw new Error("Please input the right transfer value.");
		}
		object.granry  = 0;		
		object.granryType = "";	
		//修改自己的邀请码,第一号邀请人的号码为0,下标从0开始	
		object.invitationCode = this.size;		
		object.invitationCount = 0;		
		//填入的邀请码
		object.invitedCode = invitedCode;

		//判断邀请码用户是否存在
		var invitorAddress = this.arrayMap.get(invitedCode);
		var invitor = this.dataMap.get(invitorAddress);
		//不存在，则修改 invitationCode 为-1
		if (!invitor) {
			object.invitedCode = -1;
		} else {
			//修改邀请人的邀请人数
			invitor.invitationCount += 1;

			//修改邀请人的粮仓余粮,邀请一人粮仓加 10g 余粮
			invitor.granry += 10;

			//重新写入链中
			this.dataMap.set(invitorAddress,invitor);
		}

		this.arrayMap.set(index,key);
		this.dataMap.set(key,object);
		this.size += 1;
		this.weight += object.animalWeight;
		this.moneyPool += object.balance;
	},

	//验证输入是否为数字
	checkNumber : function(invitationCode) {
		var reg = /^(-?\d+)$/ ;
  		if (reg.test(invitationCode)) {
    		return true;
 	     }
 		 return false;
	},

	//获取用户信息
	get : function(address) {
		
		var object = this.dataMap.get(address);
		return object;
	},

	//获取所有动物的体重
	getTotalWeight : function() {
		return this.weight;
	},

	//收回 nas
	takeOut : function() {
		var from = Blockchain.transaction.from;
		var object = this.dataMap.get(from);
		if (!object) {
			throw new Error("No player before");
		}

		//判断当前账户余额是否为0,为0则抛出异常
		if (object.balance <= 0) {
			throw new Error("Your balance is 0.");
		}

		var value = new BigNumber(object.balance).times("1000000000000000000");
		var result = Blockchain.transfer(from,  value);
		if (!result) {
            throw new Error("Take out failed. Address:" + from + ", NAS:" + value);
        }

        Event.Trigger("BalanceValue", {
        	Transfer: {
				from: Blockchain.transaction.to,
				to: from,
				value: value.toString()
			}
        });

        this.moneyPool -= object.balance;
        object.balance = 0;
        this.dataMap.set(from,object);
	},

	//购买喂养
	feed : function() {
		var from = Blockchain.transaction.from;
		var value = Blockchain.transaction.value;
		var object = this.dataMap.get(from);
		var key = from;

		// //判断是否吃完了上一次的食物,10分钟可喂养一次
		if ((Date.now() * 1000 - object.lastFeedTime) <= 60) {	//60秒
		// if ((Date.now() - object.lastFeedTime) <= 3600 * 10) {
			throw new Error("Wait until it done, " + (Date.now() * 1000 - object.lastFeedTime) + "left");
		}

		var freeType = 0;
		var oneNasType = 0.001;
		var tenNasType = 0.01;
		var hundresType = 0.1;
		if (value == freeType) {
			if (object.granry == 0) {
				throw new Error("There is nothing here.");
			}

			object.animalWeight += object.granry;			
			object.granryType = "0";	
			object.granry = 0;			//用粮仓余量喂养，清空粮仓
			//设置用户金库
			object.balance += freeType;
		} else if (value == oneNasType * 1000000000000000000) {
			object.animalWeight += 1;			
			object.granryType = "1";
			object.balance += oneNasType;
		} else if (value == tenNasType * 1000000000000000000) {
			object.animalWeight += 100;			
			object.granryType = "2";
			object.balance += tenNasType;
		} else if (value == hundresType * 1000000000000000000) {
			object.animalWeight += 10000;			
			object.granryType = "3";
			object.balance += hundresType;
		} else {
			throw new Error("Please input the right transfer value.");
		}

		//设置最后头喂养时间
		object.lastFeedTime = Date.now() * 1000 //单位为秒
		this.dataMap.set(key,object);
		this.weight += object.animalWeight;
		this.moneyPool += object.balance;
	},

	//资助输入
	supportProject : function() {
		var from = Blockchain.transaction.from;
		var value = Blockchain.transaction.value;
		value = value / 1000000000000000000;

		//修改自助总数和自助余额
		this.totalSupportCount += value;
		this.leftSupportCount += value;
	},

	//兑换礼物
	exchangeGif : function() {
		var from = Blockchain.transaction.from;
		var object = this.dataMap.get(from);
		//判断用户是否存在
		if (!object) {
			throw new Error("No player before");
		}

		//判断用户宠物体重是否大于此数
		//小于即抛异常
		if (object.animalWeight - this.gifLimit < 0) {
			throw new Error("Don't reach the request");
		}

		//判断当前奖励资金池容量
		if (this.leftSupportCount <= this.gifMoney) {
			throw new Error("Balance is not enough.");
		}

		//每次可体现0.01 NAS
		var value = new BigNumber(this.gifMoney).times("1000000000000000000");
		var result = Blockchain.transfer(from,value);
		if (!result) {
			throw new Error("Take out failed. Address:" + from + ", NAS:" + value);
		}

		Event.Trigger("exchangeGif",{
			Transfer: {
				from : Blockchain.transaction.to,
				to : from,
				value: value.toString()
			}
		});

		//减去 object 的宠物重量
		object.animalWeight -= this.gifLimit;
		//减去所有宠物的的重量
		this.weight -= this.gifLimit;
		this.dataMap.set(from,object);
		//修改资助余额
		this.leftSupportCount -= this.gifMoney;
	},

	//查询总的自助资金
	getTotalSupportCount : function() {
		return this.totalSupportCount;
	},

	//查询剩余资助资金
	getLeftSupportCount : function() {
		return this.leftSupportCount;
	},

	//获取领取分数要求
	getGifLimit : function() {
		return this.gifLimit;
	},

	//修改领取分数要求,只有管理员有修改权限
	setGifLimit : function(newGifLimit) {
		var from = Blockchain.transaction.from;
		if (from != this.adminAddress) {
			throw new Error("Permission denied.");
		}
		this.gifLimit =  newGifLimit;
	},

	//获取达到分数后可领取金额
	getGifMoney : function() {
		return this.gifMoney;
	},

	//修改达到领取分数后可领取金额,默认为0.01
	setGifMoney : function(newGifMoney) {
		var from = Blockchain.transaction.from;
		if (from != this.adminAddress) {
			throw new Error("Permission denied.");
		}
		this.gifMoney = newGifMoney;
	},

	//管理员提现
	withDraw : function (value) {
		if (Blockchain.transaction.from != this.adminAddress) {
			throw new Error("Permission denied.");
		}
		
		if (this.moneyPool > 0) {	//如果资金池中存在用户资金，则管理员无法提现
			throw new Error("Could not take out user's money");
		}

		//判断剩余资助资金是否> value
		if (this.leftSupportCount < value) {
			throw new Error("Left money is less than value");
		}

		var result = Blockchain.transfer(this.commisionAddress,value * 1000000000000000000);
		if (!result) {
			Event.Trigger("withdraw",{
				Transfer: {
					from: Blockchain.transaction.to,
					to: this.commisionAddress,
					value: value
				}
			});
		}
		//调整 left money
		this.leftSupportCount -= value;
	},

	 //合约部署后，调整收款地址。
	 setCommisionAddress: function(newAddress) {
        if (Blockchain.transaction.from != this.adminAddress) {
            throw new Error("Permission denied.");
        }
        this.commisionAddress = newAddress;
    },

};

module.exports = AdopterContract;
