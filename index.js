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

const hasCustomSubreddit = message => {
    const subredditRegex = /^[rR]\/.+$/;
    let chunks = message.content.split(" ");
    for (let i=0; i<chunks.length; i++) {
        if (subredditRegex.test(chunks[i])) {
            if (chunks[i].substr(0,1) === "R") chunks[i] = chunks[i].replace('R','r');
            return chunks[i];
        }
    }
    return false;
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
        let sub = hasCustomSubreddit(message) || funnySubreddit();
        imageTransformer(getMediaUrl(message), sub, message.author.username).then(buf=>{
            message.channel.send(`you stole from reddit??? cringe`, new Discord.Attachment(buf, 'reddit.png'));
        }).catch(err=>{
            message.channel.send("Something broke");
            console.log(err);
        })
    } else {
        console.log("not responding")
    }
});

client.login(process.env.BOTTOKEN).catch(e=>{
    console.log("Couldn't start discord",e);
})