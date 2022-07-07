const Discord = require('discord.js'),
    client = new Discord.Client({
        partials: ['MESSAGE', 'REACTION'],
        fetchAllMembers: true,
        intents : [
            Discord.Intents.FLAGS.GUILDS,
            Discord.Intents.FLAGS.GUILD_MEMBERS,
            Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS
        ]
    }),
    config = require('./config.json'),
    fs = require('fs')

client.login(config.token)
client.commands = new Discord.Collection()
client.db = require('./db.json')

fs.readdir('./commands', (err, files) => {
    if (err) throw err
    files.forEach(file => {
        if (!file.endsWith('.js')) return
        const command = require(`./commands/${file}`)
        client.commands.set(command.name, command)
    })
})

client.on('ready', () => {
    console.log('bot connecté')
    const statuses = [
        () => `twitch : DIMEJOVICH`,
        () => `attention aux règles 👀`
    ]
    let i = 0
    setInterval(() => {
        client.user.setActivity(statuses[i](), {type: 'WATCHING'})
        i = ++i % statuses.length
    }, 5000)
    client.user.setActivity({type: 'WATCHING'})
})

client.on('message', message => {
    if (message.type !== 'DEFAULT' || message.author.bot) return

    const args = message.content.trim().split(/ +/g)
    const commandName = args.shift().toLowerCase()
    if (!commandName.startsWith(config.prefix)) return
    const command = client.commands.get(commandName.slice(config.prefix.length))
    if (!command) return
    if (command.guildOnly && !message.guild) return message.channel.send('impossible d\'éffectuer cette commande  ')
    command.run(message, args, client)
})

client.on('guildMemberAdd', member => {
    member.guild.channels.cache.get(config.greeting.channel).send(new Discord.MessageEmbed()
    .setDescription(`Bienvenue à toi ${member} ! Nous sommes maintenant ${member.guild.memberCount} sur le serveur.\nHésite pas à lire le <#931656210522980362> et à prendre tes <#933028902463479928> !`)
    .setColor('BLUE'))
    member.roles.add(config.greeting.role)
})

//client.on('messageReactionAdd', (reaction, user) => {
//    if (!reaction.message.guild || user.bot) return
//    const reactionRoleElem = config.reactionRole[reaction.message.id]
//    if (!reactionRoleElem) return
//    const prop = reaction.emoji.id ? 'id' : 'name'
//    const emoji = reactionRoleElem.emojis.find(emoji => emoji[prop] === reaction.emoji[prop])
//    if (emoji) reaction.message.guild.member(user).roles.add(emoji.roles)
//    else reaction.users.remove(user)
//})

//client.on('messageReactionRemove', (reaction, user) => {
//    if (!reaction.message.guild || user.bot) return
//    const reactionRoleElem = config.reactionRole[reaction.message.id]
//    if (!reactionRoleElem || reactionRoleElem.removable) return
//    const prop = reaction.emoji.id ? 'id' : 'name'
//    const emoji = reactionRoleElem.emojis.find(emoji => emoji[prop] === reaction.emoji[prop])
//    if (emoji) reaction.message.guild.member(user).roles.remove(emoji.roles)
//})

//client.on('ready', async() => {
    //console.log('bot connecté')
    //client.user.setActivity('twitch : DIMEJOVICH', {type : 'WATCHING'})
    //client.user.setStatus('idle')
//})