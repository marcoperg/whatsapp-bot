const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { CronJob } = require('cron');
const axios = require('axios');
require('dotenv').config()

const { ID_BRUNO, ID_MARCO, ID_JAPO, ID_VASCO } = process.env;
const MARCO_LIST = ['marco', '*marco*', '~marco~', 'm4rc0', '_marco_', 'm@rco'];

const client = new Client({
	authStrategy: new LocalAuth(),
	puppeteer: { headless: true }
});

client.on('qr', (qr) => {
	qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
	console.log('Client is ready!');
});

function pick(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}

const MONKEY_MEDIA = MessageMedia.fromFilePath('./monkey.ogg');
const RISAS_MEDIA = MessageMedia.fromFilePath('./risas.mp3');
const YAHOO_MEDIA = MessageMedia.fromFilePath('./yahoo.ogg');
const RAMON_MEDIA = MessageMedia.fromFilePath('./ramon.ogg');
const PINON_MEDIA = MessageMedia.fromFilePath('./pinon.mp3');
const HELP_MSG = `
Estos son algunos de los comandos disponibles con el marco bot
============
!help, !ayuda - muestra este mensaje
!get_id - responde con la id del chat
!sorteo - elige aleatoriamente a uno de los integrantes del grupo
!dados - envia 5 dados aleatorios
!dados N - envia N dados aleatorios
!carta - envia una carta aleatoria 
!moneda - elige aleatoriamente entre cara o cruz
!risas, !🤡 - envia risas enlatadas
!monkey - envia monos
!dale - envia clasico audio de Daleee Ramon
!yahoo - yahoooooooo
ping - responde pong
Marco - responde Polo
============
`;

client.on('message_create', async (msg) => {
	if (MARCO_LIST.includes(msg.body.toLowerCase())) {
		msg.reply('Polo');
		msg.getChat().then(chat => chat.markUnread());
	} else if (msg.body.toLowerCase().slice(0,4) == 'marc') {
		let resp = 'Pol';
		let correct = true;
		for (const letter of msg.body.toLowerCase().slice(4)) {
			if (letter != 'o') {
				correct = false;
				break;
			}
			resp += 'o';
		}
		if (correct)
			msg.reply(resp);
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
		msg.reply(`${pick(numbers)}${pick(suits)}`);
	}
	if (msg.body == '!moneda')
		msg.reply(pick(['cruz\n❌', 'cara\n⭕']));
	if (msg.body == '!get_id')
		msg.reply(msg.from);
	if (msg.body == '!monkey') {
		const chat = await msg.getChat();
		await chat.sendMessage('', {media: MONKEY_MEDIA});
	}
	if (msg.body == '!risas' || msg.body == '!🤡') {
		const chat = await msg.getChat();
		await chat.sendMessage('', {media: RISAS_MEDIA});
	}
	if (msg.body == '!dale') {
		const chat = await msg.getChat();
		await chat.sendMessage('', {media: RAMON_MEDIA});
	}
	if (msg.body == '!yahoo') {
		const chat = await msg.getChat();
		await chat.sendMessage('', {media: YAHOO_MEDIA});
	}
	if (msg.body == '!piñon') {
		const chat = await msg.getChat();
		await chat.sendMessage('', {media: PINON_MEDIA});
	}
	if (msg.body == '!ayuda' || msg.body == '!help')
		msg.reply(HELP_MSG);

});

client.on('authenticated', () => {
	console.log('AUTHENTICATED');
});
client.on('auth_failure', msg => {
	// Fired if session restore was unsuccessful
	console.error('AUTHENTICATION FAILURE', msg);
});

client.initialize();
