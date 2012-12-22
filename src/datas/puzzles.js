module.exports = {
	words : [
		['玫瑰', '菊花'],
		['床前明月光', '疑是地上霜'],
		['中秋','月饼'],
		['爹','娘'],
		['手机','电脑'],
		['蝴蝶','蜜蜂'],
		['升职','加薪'],
		['金钱','权利'],
		['神','鬼'],
		['大黄蜂','擎天柱'],
		['牛郎','织女'],
		['漫画','小说'],
		['喜欢','讨厌'],
		['山','水'],
		['吃饭','睡觉'],
		['中国好声音','中国好凉茶']
	],
	rule : function(amount) {
		amount--;

		var avg = parseInt(amount / 3),
			remainder = amount % 3
			;

		return {
			god : 1,
			people : avg + (remainder > 0?1:0),
			oni : avg + (remainder > 1?1:0),
			idiot : avg,
		}
	}
};