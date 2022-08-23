console.log('Starting bot');

const Discord = require('discord.js');
const nconf = require('nconf');
const { prefix, token, bot_account_id, charlemagne_account_id, infograph_account_id, ndot_account_id } = require('./config.json');
const client = new Discord.Client();

nconf.use('file', { file: './config.json'});
nconf.load();

client.login(token);
client.once('ready', () => {
    console.log('Bot has logged in successfully');
});

var embedSearchText = ['Banshee', 'Ada', 'Rotations', 'Weekly', 'Xûr', 'Trials']
var unpinnedCount = 0

client.on('message', message => {
    if (message.channel.id === `${message_channel_id}`){
        if (message.author.id === `${bot_account_id}`){return}
        //deletePinMessages(message)
        if (message.embeds.length !== 0){
            console.log(`\n\nNew embed detected, posted by ${message.author.username}`)
            embedSearchText.forEach(searchText => {
                onEmbedMessage(message, searchText)
            })
        }
        if (message.content.startsWith(prefix)){
            const args = message.content.slice(prefix.length).trim().split(/ +/);
            const command = args.shift().toLowerCase();

            if (command === 'updatepins'){
                embedSearchText.forEach(searchText => {
                    onEmbedMessage(message, searchText)
                })
            }
        }
    }
})


function onEmbedMessage(message, searchText){
    unpinnedCount = 0;
    message.channel.messages.fetch({ limit: 100})
        .then(messages => {
            messages = messages.filter(message => message.author.bot)
            messages = messages.filter(message => message.embeds.length > 0)
            messages = messages.filter(message => {
                if ((message.embeds[0].title !== null && message.embeds[0].title.includes(searchText) && searchText !== "Xûr" && searchText !== `Trials`) || ((message.embeds[0].title === null) && (message.embeds[0].author.name.includes(searchText)))){
                    return true
                }
            })

            console.log(`${messages.size} messages found for ${searchText}`);
            return messages
        })
        .then(messages => {
            messages.forEach(message => {
                if (message === messages.first()){
                    if (message.embeds[0].title === null && message.embeds[0].author.name.includes(searchText)){
                        pinUnpin(message, searchText)
                    } else if (message.embeds[0].title !== null && message.embeds[0].title.includes(searchText) && searchText !== `Xûr` && searchText !== `Trials`) {
                        pinUnpin(message, searchText)
                    }
                }
            })
        })
        .catch(console.error)
}


function pinUnpin(message, searchText){
    var currMessageId = message.id
    message.pin()
        .then(message => {
            console.log(`${message.id} pinned, for ${searchText}`)
            return message
        })
        .then(message => {
            message.channel.messages.fetchPinned()
                .then(messages => {
                    messages = messages.filter(message => message.author.bot)
                    messages = messages.filter(message => message.embeds.length > 0)
                    messages = messages.filter(message => (message.embeds[0].title === null && message.embeds[0].author.name.includes(searchText)) || (message.embeds[0].title !== null && message.embeds[0].title.includes(searchText)))
                    if (messages.size !== 0){
                        console.log(`${messages.size} messages found pinned for ${searchText}`);
                        messages.forEach(message => {
                            if (message.id !== currMessageId){
                                unpinnedCount += 1
                                message.unpin()
                                    //.then(console.log)
                                    .catch(console.error)
                            }
                        })
                        console.log(`${unpinnedCount} messages unpinned for ${searchText}`)
                    }
                })
                .catch(console.error)
        })
        .catch(console.error)
}


function deletePinMessages(message){
    message.channel.messages.fetch({ limit: 100})
        .then(messages => {
            messages = messages.filter(message => message.type === "PINS_ADD")
            messages = messages.filter(message => message.author.id === `${bot_account_id}`)
            message.channel.bulkDelete(messages)
    })
}
