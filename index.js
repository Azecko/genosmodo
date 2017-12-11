const Discord = require("discord.js");
const PREFIX = "mod!";
const YTDL = require("ytdl-core");
const antispam = require("discord-anti-spam");
const db = require("quick.db")
const economy = require("discord-eco")
const YouTube = require("simple-youtube-api")
const fortnite = require("fortnite")
const superagent = require("superagent")
const moment = require("moment")
const fs = require("fs")

var bot = new Discord.Client();

const modrole = "Modérateur";

var client = new Discord.Client();

const queue = new Map();

function generateHex() {
    return "#" + Math.floor(Math.random() * 16777215).toString(16);
}

function roll() {
   return Math.floor(Math.random() * 99999) + 1;
}

var roll = Math.floor(Math.random() * 99999) + 1;

var fortunes = [
    "Oui.",
    "Non.",
    "Sûrment.",
    "Je ne pense pas.",
    "T'es malade ou quoi ? Jamais mec.",
    "Aspèrge",
    "Je sais pas.",
    "Pourquoi tu me demandes ça ?"
];


var servers = {};

bot.on("ready", function () {
        var games = [
        "mod!help | " + bot.guilds.size + " Serveurs !",
        "mod!help | " + bot.users.size + " Utilisateurs !",
        "mod!help | " + bot.channels.size + " Channels !"
    ]
    bot.user.setActivity(setInterval(function() {
        bot.user.setActivity(games[Math.floor(Math.random() * games.length)], {url:"https://www.twitch.tv/zelkibot", type: "WATCHING"})
    }, 5000))
    console.log("Je suis prêt à me rendre sur " + bot.guilds.size + " serveur(s) ! Sous le pseudo de " + bot.user.username + " !");
});

bot.on("guildMemberAdd", member => {
    db.fetchObject(`autoRole_${member.guild.id}`).then(i => {
        
                // Check if no role is given
                if (!i.text || i.text.toLowerCase() === 'none'); // We want to put this un our guildMemberAdd, but we want to delete the return statement and just replace it with ; so it can run the rest of the code
                else { // Run if a role is found...
        
                    try { // Try to add role...
                        member.addRole(member.guild.roles.find('name', i.text))
                    } catch (e) { // If an error is found (the guild supplied an invalid role), run this...
                        console.log("Un serveur a essayer d'ajouter un role inexistant à un utilisateur.") // You can commet this line out if you don't want this error message
                    }
        
                }
            })
    db.fetchObject(`messageChannel_${member.guild.id}`).then(i => {
        
                    // Fetch Welcome Message (DMs)
                    db.fetchObject(`joinMessageDM_${member.guild.id}`).then(o => {
        
                        // DM User
                        if (!o.text) console.log('Error: Join DM Message not set. Please set one using ~setdm <message>'); // This will log in console that a guild didn't set this up, you dont need to include the conosle.log
                        else member.send(o.text.replace('{user}', member.toString()).replace('{members}', member.guild.memberCount)) // This is where the embed function comes in, as well as replacing the variables we added earlier in chat.
        
                        // Now, return if no message channel is defined
                        if (!member.guild.channels.get(i.text)) return console.log('Error: Welcome/Leave channel not found. Please set one using ~setchannel #channel') // Again, this is optional. just the console.log not the if statement, we still want to return
        
                        // Fetch the welcome message
                        db.fetchObject(`joinMessage_${member.guild.id}`).then(p => {
        
                            // Check if they have a join message
                            if (!p.text) console.log('Error: User Join Message not found. Please set one using ~setwelcome <message>')
                            else member.guild.channels.get(i.text).send(p.text.replace('{user}', member).replace('{members}', member.guild.memberCount)) // We actually want to send the message.
        
                        })
        
                    })
        
                })
})

bot.on("guildMemberRemove", function(member) {
    db.fetchObject(`messageChannel_${member.guild.id}`).then(i => {
        
                    // Fetch Welcome Message (DMs)
        
                        // Now, return if no message channel is defined
                        if (!member.guild.channels.get(i.text)) return console.log('Error: Welcome/Leave channel not found. Please set one using ~setchannel #channel') // Again, this is optional. just the console.log not the if statement, we still want to return
        
                        // Fetch the welcome message
                        db.fetchObject(`leaveMessage_${member.guild.id}`).then(o => {
        
                            // Check if they have a join message
                            if (!o.text) console.log('Error: User Join Message not found. Please set one using +setleave <message>')
                            else member.guild.channels.get(i.text).send(o.text.replace('{user}', member).replace('{members}', member.guild.memberCount)) // We actually want to send the message.
        
                        })
        
                    })
});

    bot.on(`guildCreate`, guild => {
    bot.user.setActivity("mod!help sur " + bot.guilds.size + " serveurs !", {url:"https://www.twitch.tv/zelkibot", type: "WATCHING"})
    guild.owner.send("Merci de m'avoir Ajouté sur ton serveur Discord ! N'hésite pas à faire `mod!help` pour voir à quoi je sers !");
        bot.channels.get('381199796372766720').send(`J'ai été ajouté au serveur : ${guild.name} ! Propriétaire du serveur : ${guild.owner.user.toString()}`);
    });

    bot.on('guildDelete', guild => {
        bot.channels.get('381199796372766720').send(`J'ai été retiré au serveur : ${guild.name} ! Propriétaire du serveur : ${guild.owner.user.toString()}`);
        bot.user.setActivity("mod!help sur " + bot.guilds.size + " serveurs !", {url:"https://www.twitch.tv/zelkibot", type: "WATCHING"})
    })

bot.on("message", async function(message) {
    if (message.author.equals(bot.user)) return;

    if (!message.content.startsWith(PREFIX)) return;
    
    if (message.channel.type === "dm") return message.reply("Salut " + message.author.username + ", je suis désolé mais je ne peux pas répondre en MP.");

    var args = message.content.substring(PREFIX.length).split (" ");

    var args2 = message.content.split(" ").slice(1);

    var suffix = args2.join(" ");

    var reason = args2.slice(1).join(" ");

    var user = message.mentions.users.first();

    var guild = message.guild;

    var member = message.member;

    var rolemodo = member.guild.roles.find("name", "Modérateur")

    var rolehelper = member.guild.roles.find("name", "Helper")

    var roleyoutube = member.guild.roles.find("name", "YOUTUBE")
    
    var rolefriend = member.guild.roles.find("name", "AMIGO")

    var rolemute = member.guild.roles.find("name", "Mute")

    var modlog = member.guild.channels.find("name", "mod-log")

    var midlemanrole = member.guild.roles.find("name", "Midleman")

    var regleschannel = member.guild.channels.find("name", "regles")

    var cont = message.content.slice(PREFIX.length).split(" ");

    var args3 = cont.slice(1);
    
    const serverQueue = queue.get(message.guild.id);

    const url = args[1] ? args[1].replace(/<(.+)>/g, '$1') : '';
    switch (args[0].toLowerCase()) {
        case "unmute":
        if (!message.member.roles.find("name", "Staff")) {
                    message.channel.send("Tu as besoin du role `" + "Staff" + "` pour faire cette commande.");
                return;
                }
        var member = message.mentions.members.first();
        if(!rolemute) return message.channel.send("Je ne trouve pas de role nommé `Mute`.")
        if (message.mentions.users.size < 1) return message.reply("Tu as oublié de préciser qui je dois unmute.")
        member.removeRole(rolemute)
        message.channel.send(member.toString() + " a bien été unmute.")

        var embed = new Discord.MessageEmbed()
        .addField("Action :", "Unmute")
        .addField("Utilisateur :", user.toString())
        .addField("Modérateur :", message.author.toString())
        .setColor(0x808000)
        .setAuthor(message.author.username, message.author.avatarURL)
        .setTimestamp()
        message.channel.send(embed);
        break;
        case "mute":
        if (!message.member.roles.find("name", "Staff")) {
                    message.channel.send("Tu as besoin du role `" + "Staff" + "` pour faire cette commande.");
                return;
                }
        var member = message.mentions.members.first();
        if(!rolemute) return message.channel.send("Je ne trouve pas de role nommé `Mute`.")
        if (message.mentions.users.size < 1) return message.reply("Tu as oublié de préciser qui je dois Mute.")
        if (reason.length < 1) return message.reply("Tu as oublié la raison.");
        member.addRole(rolemute)

        var embed = new Discord.MessageEmbed()
        .addField("Action :", "Mute")
        .addField("Utilisateur :", user.toString())
        .addField("Modérateur :", message.author.toString())
        .addField("Raison :", reason)
        .setColor(0x808000)
        .setAuthor(message.author.username, message.author.avatarURL)
        .setTimestamp()
        message.channel.send(embed);
        break;
        case "timedmute":
        if (!message.member.roles.find("name", "Staff")) {
            message.channel.send("Tu as besoin du role `" + "Staff" + "` pour faire cette commande.");
        return;
        }
        var reasontimed = args2.slice(2).join(' ')        
        if(!rolemute) return message.channel.send("Je ne trouve pas de role nommé `Mute`.")
        let time = parseInt(args2[1]) * 60000;
        if (message.mentions.users.size < 1) return message.reply("Tu as oublié de préciser qui je dois Mute.")
        if(!time) return message.reply("Tu as oublié le temps.")
        if (!reasontimed) return message.reply("Tu as oublié la raison.")
        var member = message.mentions.members.first();
        message.channel.send(member.toString() + " a bien été mute. ✅")
        member.addRole(rolemute)
        setTimeout(() => { member.removeRole(rolemute); }, time);

        var embed = new Discord.MessageEmbed()
        .addField("Action :", "Mute")
        .addField("Utilisateur :", user.toString())
        .addField("Modérateur :", message.author.toString())
        .addField("Raison :", reasontimed)
        .addField("Temps :", args2[1] + " minute(s)")
        .setColor(0x808000)
        .setAuthor(message.author.username, message.author.avatarURL)
        .setTimestamp()
        message.channel.send(embed)
        break;
        case "help":
            member.send(`
__***Commandes disponibles sur le bot.***__

__**General**__
**invite** : Lien pour inviter le bot sur votre serveur.
**help** : Message que tu vois maintenant !

__**Informations**__
**userinfo** : Informations sur un utilisateur. Utilisation : mod!userinfo @utilisateur
**serverinfo** : Informations sur le serveur sur le quel tu te trouves.

__**Modération**__
**ban** : Bannir un utilisateur. Utilisation : mod!ban @utilisateur <raison>
**kick** : Kick un utilisateur. Utilisation : mod!kick @utilisateur <raison>
**mute** : Mute un utilisateur. Utilisation : mod!mute @utilisatuer <raison>
**unmute** : Unmute un utilisateur. Utilisation : mod!unmute @utilisateur
**purge** : Supprimer un certain nombre de messages. Utilisation : mod!purge <nombre de messages (minimum 2 et maximum 100).

(Si vous souhaitez mettre l'utilisateur ou le nombre de membres sur vos messages de bienvenue / d'aurevoir, faites {user} pour l'utilisateur et {membres} pour les membres sur le Discord.)
**setchannel** : Choisir le channel oú seront poster les messages de bienvenues et d'aurevoir. Utilisation : mod!setchannel #channel
**setwelcome** : Choisir le message de bienvenue. Utilisation : mod!setwelcome <message>
**setleave** : Choisir le message d'aurevoir. Utilisation : mod!setleave <message>
**setdm** : Choisir le message de bienvenue en message privé. Utilisation : mod!setdm <message>

**setautorole** : Choisir le role ajouté automatiquement à l'arrivée d'un nouveau membre sur le Discord. Utilisation : mod!setautorole <nom du role>
            `)
            message.react("✅")
            message.channel.send(member.toString() + " Je t'ai envoyé les commandes en MP !")
            break;
        case "userinfo":
            if (message.mentions.users.size < 1) return message.reply("Tu as oublié de préciser de qui je dois montrer les informations.")
            var embed = new Discord.MessageEmbed()
                .addField("Pseudo", user.tag)
                .addField("Surnom", user.nickname || "none")
                .addField("ID", user.id)
                .addField("Compte créer le", user.createdAt)
                .addField("Roles", message.guild.member(user).roles.sort().map(role => role).join(" | "))
                .setThumbnail(user.avatarURL)
                .setColor(0xff80ff)
                .setAuthor(message.author.username, message.author.avatarURL)
                .setFooter("Voilà.", message.author.avatarURL)
                .setTimestamp()
            message.channel.send(embed);
            break;
        case "kick":
            if (!message.member.roles.find("name", "Staff")) {
                    message.channel.send("Tu as besoin du role `" + "Staff" + "` pour faire cette commande.");
                return;
                }
            if(!modlog) return message.reply("Je ne trouve pas de channel mod-log.");
            if (message.mentions.users.size < 1) return message.reply("Tu as oublié de préciser qui je dois kick.")
            if (reason.length < 1) return message.reply("Tu as oublié la raison.");
            message.guild.member(user).kick();

            var embed = new Discord.MessageEmbed()
            .addField("Action :", "kick")
            .addField("Utilisateur :", user.toString())
            .addField("Modérateur :", message.author.toString())
            .addField("Raison :", reason)
            .setColor(0x800000)
            .setAuthor(message.author.username, message.author.avatarURL)
            .setTimestamp()
            message.channel.send(embed)
            break;
        case "ban":
            if (!message.member.roles.find("name", "Staff")) {
                    message.channel.send("Tu as besoin du role `" + "Staff" + "` pour faire cette commande.");
                return;
                }
            if(!modlog) return message.reply("Je ne trouve pas de channel mod-log.");
            if (message.mentions.users.size < 1) return message.reply("Tu as oublié de préciser qui je dois bannir.")
            if (reason.length < 1) return message.reply("Tu as oublié la raison.");
            message.guild.ban(user, 2);

            var embed = new Discord.MessageEmbed()
            .addField("Action :", "ban")
            .addField("Utilisateur :", user.toString())
            .addField("Modérateur :", message.author.toString())
            .addField("Raison :", reason)
            .setColor(0x0000ff)
            .setAuthor(message.author.username, message.author.avatarURL)
            .setTimestamp()
            message.channel.send(embed)
            break;
        case "purge":
            if (!message.member.roles.find("name", "Staff")) {
                    message.channel.send("Tu as besoin du role `" + "Staff" + "` pour faire cette commande.");
                return;
                }
            var messagecount = args2[0]
            if (!messagecount) return message.channel.send("Merci de mettre un nombre.")
message.channel.bulkDelete(messagecount);

            var embed = new Discord.MessageEmbed()
            .addField("Action :", "supression de messages")
            .addField("Modérateur :", message.author.toString())
            .addField("Nombre de messages :", messagecount)
            .setColor(0x0000ff)
            .setAuthor(message.author.username, message.author.avatarURL)
            .setTimestamp()
            message.channel.send(embed)
            break;
        case "serverinfo":
            var embed = new Discord.MessageEmbed()
            .setAuthor("Informations sur le serveur `" + message.guild.name + "`")
            .setThumbnail(message.guild.iconURL)
            .setFooter(message.guild.owner.user.tag, message.guild.owner.user.avatarURL)
            .addField("Membres", message.guild.memberCount)
            .addField("Channels", message.guild.channels.filter(chan => chan.type === "voice").size + " channels vocaux " + message.guild.channels.filter(chan => chan.type === "text").size + " channels textuels")
            .addField("Roles", message.guild.roles.map(role => role.toString()).join(" | "))
            .addField("Créateur", message.guild.owner.user.toString())
            .addField("Channel AFK", message.guild.afkChannel)
            .addField("Créer le", message.guild.createdAt)
            .addField("ID du serveur", message.guild.id)
            .addField("Region", message.guild.region)
            message.channel.send(embed)
            break;
        case "config":
        let channel
        let dmText
        let joinText
        let leaveText
    
        // First, we need to fetch the message channel
        db.fetchObject(`messageChannel_${message.guild.id}`).then(channelIDFetched => {
    
            // Verify Arguments - If the text is blank, that means it hasn't been defined yet.
            if (!message.guild.channels.get(channelIDFetched.text)) channel = '*Pas de channel pour les messages de bienvenues et aurevoirs.*'
            else channel = message.guild.channels.get(channelIDFetched.text)
            // What is happening here is that it is trying to see if the CHANNEL ID stored in channelIDFetched.text is a valid channel in the guild, if not it sets channel to none, if it is it sets channel to the channel
    
            // Next, we can fetch the Join DM Text
            db.fetchObject(`joinMessageDM_${message.guild.id}`).then(joinDMFetched => {
    
                // Verify Arguments - The same thing is happening here as the last verification. This time it's just checking it joinedDMFetched.text is empty
                if (!joinDMFetched.text) dmText = "*Pas de message de bienvenue en MP.*"
                else dmText = joinDMFetched.text
    
                // Now, we want to fetch the join text for the server - accidently put a comma instead of a period there, make sure you don't do that.
                db.fetchObject(`joinMessage_${message.guild.id}`).then(joinTextFetched => {
    
                    // Verify Arguments - Same thing as the last one.
                    if (!joinTextFetched.text) joinText = "*Pas de message de bienvenue.*"
                    else joinText = joinTextFetched.text
    
                    // Finally, we can fetch the message thats sent when someone leaves
                    db.fetchObject(`leaveMessage_${message.guild.id}`).then(leaveTextFetched => {
    
                        // Verify Arguments - Same thing as the last one.
                        if (!leaveTextFetched.text) leaveText = "*Pas de message d'aurevoir.*"
                        else leaveText = leaveTextFetched.text
    
                        // Make sure that all of the fetchObjects are nested inside eachother, or else it might lock the database if it's doing it all at the same time.
                        // Now, lets form a response from all the data we collected.
                        let response = `**Channel de bienvenue & aurevoir**\n > ${channel}\n\n` // This is the first line, make sure to use \n for new lines
                        response += `**Message de bienvenue en MP**\n > ${dmText}\n\n` // Make sure you are using += not = when adding to the string.
                        response += `**Message de bienvenue**\n > ${joinText}\n\n` // This is the third line.
                        response += `**Message d'aurevoir**\n > ${leaveText}\n\n` // Now, lets send the embed using the new function we made earlier.
    
                        message.channel.send(response) // Lets test it now.
    
                    })
    
    
                })
    
            })
    
        })
    
        break;
        case "setchannel":
        if (!message.member.roles.find('name', 'Administrateur')) return message.channel.send('**Tu as besoin du role `Administrateur` pour faire cette commande !**') // This returns if it CANT find the owner role on them. It then uses the function to send to message.channel, and deletes the message after 120000 milliseconds (2minutes)
        if (!message.mentions.channels.first() && args.join(" ").toUpperCase() !== 'NONE') return message.channel.send('**Tu as oublié de mettre un channel !**\n > *mod!setchannel <#channel>*') // This returns if they don't message a channel, but we also want it to continue running if they want to disable the log
    
        // Fetch the new channel they mentioned
        let newChannel;
        if (args.join(" ").toUpperCase() === 'NONE') newChannel = ''; // If they wrote the word none, it sets newChannel as empty.
        else newChannel = message.mentions.channels.first().id; // If they actually mentioned a channel, it will set newChannel as that.
    
        // Update Channel
        db.updateText(`messageChannel_${message.guild.id}`, newChannel).then(i => {
            message.channel.send(`**J'ai bien changé le channel pour les bienvenues et les aurevoirs pour: ${message.mentions.channels.first()}**`) // Finally, send in chat that they updated the channel.
        })    
        break;
        case "setdm":
            // Return Statements
    if (!message.member.roles.find('name', 'Administrateur')) return message.channel.send('**Tu as besoin du role `Administrateur` pour faire cette commande !**') // This returns if it CANT find the owner role on them. It then uses the function to send to message.channel, and deletes the message after 120000 milliseconds (2minutes)
    if (!args2.join(" ") && args.join(" ").toUpperCase() !== 'NONE') return message.channel.send('**Tu as oublié de mettre un message !**\n > *mod!setdm <message>*') // This returns if they don't message a channel, but we also want it to continue running if they want to disable the log
    // ^^^ This returns if they didnt type any dedscription

    // Fetch the new channel they mentioned
    let newMessage;
    if (args2.join(" ").toUpperCase() === 'NONE') newMessage = ''; // If they wrote the word none, it sets newMessage as empty.
    else newMessage = args2.join(" ").trim(); // If they didn't write none, set what they wrote as the message

    // This will update the .text of the joinMessageDM_guildID object.
    db.updateText(`joinMessageDM_${message.guild.id}`, newMessage).then(i => {
        message.channel.send(`**J'ai bien changé le message de bienvenue en MP pour:**\n > *${args2.join(" ").trim()}*`) // Finally, send in chat that they updated the channel.
    })
        break;
        case "setwelcome":
    // Return Statements
    if (!message.member.roles.find('name', 'Administrateur')) return message.channel.send('**Tu as besoin du role `Administrateur` pour faire cette commande !**') // This returns if it CANT find the owner role on them. It then uses the function to send to message.channel, and deletes the message after 120000 milliseconds (2minutes)
    if (!args2.join(" ") && args2.join(" ").toUpperCase() !== 'NONE') return message.channel.send('**Tu as oublié de mettre un message !**\n > *mod!setwelcome <message>*') // This returns if they don't message a channel, but we also want it to continue running if they want to disable the log

    let newMessage2;
    // Fetch the new channel they mentioned
    if (args2.join(" ").toUpperCase() === 'NONE') newMessage2 = ''; // If they wrote the word none, it sets newMessage as empty.
    else newMessage2 = args2.join(" ").trim(); // If they didn't write none, set what they wrote as the message

    // This will update the .text of the joinMessageDM_guildID object.
    db.updateText(`joinMessage_${message.guild.id}`, newMessage2).then(i => {
        message.channel.send(`**J'ai bien changé le message de bienvenue pour:**\n > *${args2.join(" ").trim()}*`) // Finally, send in chat that they updated the channel.
    })
        break;
        case "setleave":
    // Return Statements
    if (!message.member.roles.find('name', 'Administrateur')) return message.channel.send('**Tu as besoin du role `Administrateur` pour faire cette commande !**') // This returns if it CANT find the owner role on them. It then uses the function to send to message.channel, and deletes the message after 120000 milliseconds (2minutes)
    if (!args2.join(" ") && args.join(" ").toUpperCase() !== 'NONE') return message.channel.send('**Tu as oublié de mettre un message !**\n > *mod!setleave <message>*') // This returns if they don't message a channel, but we also want it to continue running if they want to disable the log

    // Fetch the new channel they mentioned
    let newMessage3;
    if (args2.join(" ").toUpperCase() === 'NONE') newMessage3 = ''; // If they wrote the word none, it sets newMessage as empty.
    else newMessage3 = args2.join(" ").trim(); // If they didn't write none, set what they wrote as the message

    // This will update the .text of the joinMessageDM_guildID object.
    db.updateText(`leaveMessage_${message.guild.id}`, newMessage3).then(i => {
        message.channel.send(`**J'ai bien changé le message d'aurevoir pour:**\n > *${args2.join(" ").trim()}*`) // Finally, send in chat that they updated the channel.
    })

        break;
        case "setautorole":
        if (!message.member.hasPermission('ADMINISTRATOR')) return message.channel.send('Tu as besoin de la permission `Administrateur` pour faire cette commande !') // Tell them that they dont have the proper perms
        if (!args2.join(" ")) return message.channel.send('Merci de mettre un grade `mod!setautorole <nom du role>`') // Tell them if they didn't supply arguments
    
        db.updateText(`autoRole_${message.guild.id}`, args2.join(" ").trim()).then(i => { // .trim() removes the whitespaces on both ends of the string. 
    
            message.channel.send('AutoRole changé pour : `' + i.text + '`'); // This tells them what they just set the autorole to.
    
        })
        break;
        case "invite":
            message.channel.send("Tu veux m'inviter sur ton serveur ? Merci c'est gentil ! Voilà pour toi : https://discordapp.com/api/oauth2/authorize?client_id=389466839253516288&permissions=8&scope=bot !")
        break;
            case "eval":
        if(message.author.id !== "176041361714184193") return;
        var args = message.content.split(" ").slice(1);        
          function clean(text) {
            if (typeof(text) === "string")
              return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
            else
                return text;
          }
        try {
          const code = args.join(" ");
          let evaled = eval(code);
    
          if (typeof evaled !== "string")
            evaled = require("util").inspect(evaled);
    
          message.channel.send(clean(evaled), {code:"xl"});
        } catch (err) {
          message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
        }
        break;
            default:
            message.channel.send("Commande invalide ^^")
    }
});

bot.login(process.env.TOKEN);
