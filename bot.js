console.log("[STARTUP] Modboi starting up...")

const discord = require('discord.js')
global.embed = discord.RichEmbed
const bot = new discord.Client()
const mongoose = require('mongoose')
const prefix = "m;"
var isUbl;
console.log("[STARTUP] Connecting to database...")
setTimeout(() => {
  mongoose.connect(`mongodb+srv://Modboi_v2:${process.env.mdb_key}@modboi-v2-blqz3.gcp.mongodb.net/test?retryWrites=true`, { useNewUrlParser: true })
  .then(() => {
    console.log("[STARTUP] Connected to MongoDB!")
  })
}, 2000)
bot.commands = new Map()
bot.invite = "https://discordapp.com/api/oauth2/authorize?client_id=534527805736878099&permissions=8&redirect_uri=https%3A%2F%2Fbot.modboi.ml%2Fv2%2Fhome&scope=bot%20guilds"
bot.owner = "242734840829575169"
bot.userConfig = require('./models/user')
bot.guildConfig = require(`./models/guild`)
bot.log = require('./logger.js').baselogger
bot.errors = {
  dbSaveError: `[ERROR] Data failed to save to database.\nError Message: %s`,
  dbConnectError: `[ERROR] Failed to connect to database. \nError Message: %s`
}

require('fs').readdir("./commands/", (err, files) => {
  if (err) return console.error("[ERROR] Commands failed to load.");
  
  files.filter(f => f.split(".").pop() === "js").forEach((f,i) => {
    bot.commands.set(require(`./commands/${f}`).help.name, require(`./commands/${f}`))
  })
})

process.on('unhandledRejection', (err) => {
  console.error(`[ERROR] Caught an unhandledRejection.\n`)
  console.error(err)
})

process.on('uncaughtException', (err) => {
  console.error(`[ERROR] Caught an uncaughtException.`)
  console.error(err)
})

bot.on('error', () => {
  console.error(`[ERROR] Caught a bot error.`)
})

bot.on('ready', () => {
  require('./modules.js').AutoPoster(bot)
  bot.log(bot, `[LOGGER] ${bot.user.username} started up.`, bot.user.avatarURL)
  console.log("[READY] Modboi v2 is ready for action!");
  bot.base = bot.guilds.get("442067917979385859");
  
  bot.user.setActivity("Loading Modboi...", {type: 'STREAMING', url: "https://twitch.tv/freakinghulk"})
  setTimeout(() => {
    /bot.user.setActivity(`for ${prefix}help | ${bot.guilds.size} servers`, {type: "WATCHING"})
     bot.user.setStatus("dnd")
      bot.user.setActivity(`UPDATES! (I won't respond to commands until the updates are finished.)`)
    
  }, 10000)
  
  bot.guilds.forEach((g,i) => {
    console.log(`[GUILD LISTINGS] Guild Name: ${g.name}   Guild ID: ${i}   Member Count: ${g.memberCount}\n`)
  })
})

bot.on('message', message => {
  const mArray = message.content.split(" ");
  const args = mArray.slice(1)
  const cmd_name = mArray[0].slice(prefix.length)
  const cmd = bot.commands.get(cmd_name)
  if (!message.guild) return;
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;
  
  bot.userConfig.findOne({userID: message.author.id}, (err,data) => {
     if (data) {
        if (data.isUBL) return isUbl = true;
     } else {
        const newData = new bot.userConfig({
          userID: message.author.id,
          username: message.author.username,
          money: 0,
          isUBL: false
        })
        
        newData.save().catch(err => console.error(bot.errors.dbSaveError.replace("%s", err)))
     }
  })
  
  if (cmd && !isUbl) {
    console.log(`${message.author.username} just used the ${cmd_name} command.`);
    bot.log(bot, `[LOGGER] ${message.author.username} just used the ${cmd_name} command.`, bot.user.avatarURL)
    cmd.run(bot, message, args);
  }
})

bot.on('guildCreate', guild => {
  bot.user.setActivity(`for b!help | ${bot.guilds.size} servers`, {type: "WATCHING"})
})

bot.on('message', message => {
  if (message.channel.id == "581933216118734888" && message.content !== "f.verify") {
    message.author.send("Please do not send messages in #verify that are not `b!verify`.")
    message.delete(500)
  }

bot.on('guildDelete', guild => {
  bot.user.setActivity(`for b!help | ${bot.guilds.size} servers`, {type: "WATCHING"})
})
    
bot.on('guildBanAdd', (guild, user) => require('./events/guildBanAdd')(bot,guild,user))



bot.login(process.env.token)
