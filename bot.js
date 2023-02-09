const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { CronJob } = require('cron');
const axios = require('axios');
require('dotenv').config()

const { ID_BRUNO, ID_MENCIA, ID_MARCO, ID_JAPO } = process.env;

const client = new Client({
	authStrategy: new LocalAuth(),
	puppeteer: { headless: true }
});

const pi = new CronJob('14 3 * * *', () => {
	setTimeout(() => client.sendMessage(ID_BRUNO, `hora pi`), 30000);
});
pi.start();

const four = new CronJob('20 4 * * *', () => {
	setTimeout(() => client.sendMessage(ID_BRUNO, `hora porro`), 30000);
});
four.start();

client.on('qr', (qr) => {
	qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
	console.log('Client is ready!');
	/*
	const arr = [];
	for (let i=0; i<10000; i++) {
		arr.push('a');
	}
	client.sendMessage(ID_MENCIA, arr.join(' '));
	*/
});

function pick(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}

client.on('message_create', async (msg) => {
	if (msg.body.toLowerCase() == 'lindo' && msg.from == ID_MENCIA) {
		msg.reply('Linda tu');
		msg.getChat().then(chat => chat.markUnread());
	}

	const MARCO_LIST = ['marco', '*marco*', '~marco~', 'm4rc0', '_marco_', "m@rco"];
	if (MARCO_LIST.includes(msg.body.toLowerCase())) {
		msg.reply('Polo');
		msg.getChat().then(chat => chat.markUnread());
	}
	if (msg.body == '!emocion') {
		const msg_to_respond = await msg.getQuotedMessage();
		const text = msg_to_respond.body;
		const { data } = await axios.post('http://127.0.0.1:5000/', {text: text});
		const emotion = data[0].label;
		const chat = await msg_to_respond.getChat();
		await chat.sendMessage(emotion);
	}
	if (msg.body.toLowerCase() == 'ping')
		msg.reply('pong');
	if (msg.body.toLowerCase() == 'pong' && msg.from != ID_MARCO)
		msg.reply('ping');
	if (msg.body == '!sorteo') {
		const chat = await msg.getChat();
		let user;
		if (chat.isGroup) {
			const parts = chat.participants;
			user = pick(parts).id;
		} else {
			const id = pick([msg.to, msg.from]);
			user = {_serialized: id, user: id.split('@')[0]};
		}
		const contact = await client.getContactById(user._serialized);
		await chat.sendMessage(`@${user.user}`, {mentions: [contact]});
	}
	if (msg.body == '!dados') {
		const dices = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
		const results = [];
		for (let i=0; i<5; i++) {
			results.push(pick(dices));
		}
		msg.reply(results.join(' '));
	}
	if (msg.body.split(' ').length == 2 && msg.body.split(' ')[0] == '!dados') {
		const n = Number(msg.body.split(' ')[1]);
		if (n && n <= 20) {
			const dices = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
			const results = [];
			for (let i=0; i<n; i++) {
				results.push(pick(dices));
			}
			msg.reply(results.join(' '));
		} else
			msg.reply('No te pases. Max 20');
	}
	if (msg.body == '!carta') {
		const suits = ['♥️', '♠️', '♦️', '♣️'];
		const numbers = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
		if ((await msg.getChat()).id._serialized == ID_MENCIA && msg.from == ID_MARCO)
			msg.reply(`${pick(numbers)}${suits[0]}`);
		else
			msg.reply(`${pick(numbers)}${pick(suits)}`);
	}
	if (msg.body == '!moneda')
		msg.reply(pick(['cruz\n❌', 'cara\n⭕']));
	if (msg.body.slice(-3).toLowerCase() == 'uca' && msg.from != ID_MARCO)
		msg.reply('mi poll* con peluca');
	if (msg.body == '!get_id')
		msg.reply(msg.from);
});

client.on('authenticated', () => {
	console.log('AUTHENTICATED');
});

client.on('auth_failure', msg => {
	// Fired if session restore was unsuccessful
	console.error('AUTHENTICATION FAILURE', msg);
});

client.initialize();
