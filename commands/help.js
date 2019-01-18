const discord = require('discord.js')
const categories = ["⚒ Moderation", "🍭 Fun", "🤖 Bot", "🎵 Music"]
const commands = require('fs').readdirSync('./commands/')

module.exports.run = (bot, message, args) => {
  console.log(require(`./${commands}`).help.name)
}

module.exports.help = {name: "help"}
