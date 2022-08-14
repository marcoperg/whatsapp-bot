const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { CronJob } = require('cron');
const axios = require('axios');
require('dotenv').config()

const { ID_BRUNO, ID_MENCIA, ID_MARCO } = process.env;

const client = new Client({
	    authStrategy: new LocalAuth(),
		     puppeteer: { headless: true }
});

const pi = new CronJob('14 3 * * *', () => {
	setTimeout(() => client.sendMessage(ID_BRUNO, `hora pi`), 30000);
});
pi.start();

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

client.on('message_create', msg => {
	if (msg.body.toLowerCase() == 'lindo' && msg.from == ID_MENCIA) {
		msg.reply('Linda tu');
		msg.getChat().then(chat => chat.markUnread());
	}

	if (msg.body.toLowerCase() == 'marco') {
		msg.reply('Polo');
		msg.getChat().then(chat => chat.markUnread());
	}
	if (msg.body == '!emocion') {
		(async (msg) => {
			const msg_to_respond = await msg.getQuotedMessage();
			const text = msg_to_respond.body;
			const { data } = await axios.post('http://127.0.0.1:5000/', {text: text});
			const emotion = data[0].label;
			const chat = await msg_to_respond.getChat();
			await chat.sendMessage(emotion);
		})(msg);
	}
});

client.on('authenticated', () => {
	    console.log('AUTHENTICATED');
});

client.on('auth_failure', msg => {
	    // Fired if session restore was unsuccessful
		     console.error('AUTHENTICATION FAILURE', msg);
});

client.initialize();
