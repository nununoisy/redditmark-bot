const Discord = require('discord.js');
const imageTransformer = require('./imageTransformer');

const client = new Discord.Client();

const shouldRespond = message => {
    let isCommand = message.content.substr(0, 12) === "u/redditmark";
    let isImage = (
        (message.attachments.size === 1 && !!message.attachments.first().height)
        ||
        (message.embeds.length === 1 && message.embeds[0].type === "image")
    );
    let isUserAuthorized = !!process.env.ROLENAME ? message.member.roles.some(r=>r.name===process.env.ROLENAME) : true;
    return isCommand && isImage && isUserAuthorized;
}

const getMediaUrl = message =>
    (message.attachments.size === 1 ? message.attachments.first() : message.embeds[0]).url;

const funnySubreddit = () => {
    let subs = ['okbuddyretard','satire','AmItheAsshole','cornedbeefapproved','dankmemes','memes','4chan','greentext','arabfunny','ProRevenge','TIFU','gaming','CombatFootage','worldnews'];
    ['cemetery','homicide','necrophilia','heaven','hell','flogging','amputation'].forEach(comedysub=>subs.push(`comedy${comedysub}`));
    return subs[Math.floor(Math.random() * subs.length)];
}

client.once('ready', () => {
    console.log('Discord is ready');
});

client.on('message', message => {
    console.log(`got message: ${message.content}`);
    if (shouldRespond(message)) {
        imageTransformer(getMediaUrl(message), funnySubreddit(), message.author.username).then(buf=>{
            message.channel.send(`you stole from reddit??? cringe`, new Discord.Attachment(buf, 'reddit.png'));
        }).catch(err=>{
            message.channel.send("Image is too small (or something else broke)");
            console.log(err);
        })
    } else {
        console.log("not responding")
    }
});

client.login(process.env.BOTTOKEN).catch(e=>{
    console.log("Couldn't start discord",e);
})