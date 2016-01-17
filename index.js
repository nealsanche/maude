var Botkit = require('botkit')
var wit = require('node-wit');
var Witbot = require('witbot')

// Expect a SLACK_TOKEN environment variable
var slackToken = process.env.SLACK_TOKEN
if (!slackToken) {
  console.error('SLACK_TOKEN is required!')
  process.exit(1)
}

var witToken = process.env.WIT_TOKEN
if (!witToken) {
  console.error('WIT_TOKEN is required!')
  process.exit(1)
}

var modChannelId = process.env.MOD_CHANNEL
if (!modChannelId) {
  console.error('MOD_CHANNEL is required!')
  process.exit(1)
}

var controller = Botkit.slackbot()
var bot = controller.spawn({
  token: slackToken
})

bot.startRTM(function (err, bot, payload) {
  if (err) {
    throw new Error('Could not connect to Slack')
  }
})

var witbot = Witbot(witToken)

controller.hears('.*', 'direct_message,direct_mention', function(bot, message) {
  witbot.process(message.text, bot, message)
})

witbot.hears('invite', 0.5, function (bot, message, outcome) {
  var url = outcome.entities.url[0].value
  if (url) {
    var stop = url.indexOf('|')
    var email = url.substr(stop + 1, url.length - stop - 2)
    bot.reply(message, 'Okay, I\'ll tell the moderators to invite ' + email)
    bot.say({ text: 'A request was made to invite ' + email + ' to our slack.',
      channel : modChannelId })
    return
  }
  bot.reply(message, 'I couldn\'t find an email address to invite.')
})

witbot.hears('greeting', 0.5, function (bot, message, outcome) {
  bot.reply(message, 'Greetings!')
})

witbot.otherwise(function (bot, message) {
  bot.reply(message, 'You are so intelligent, and I am so simple. I don\'t understnd')
})

controller.on('bot_channel_join', function (bot, message) {
  bot.reply(message, "I'm here!")
})

controller.hears(['hello', 'hi'], ['direct_mention'], function (bot, message) {
  bot.reply(message, 'Hello.')
})

controller.hears(['hello', 'hi'], ['direct_message'], function (bot, message) {
  bot.reply(message, 'Hello.')
  bot.reply(message, 'It\'s nice to talk to you directly.')
})

controller.hears('.*', ['mention'], function (bot, message) {
  bot.reply(message, 'You really do care about me. :heart:')
})

controller.hears('help', ['direct_message', 'direct_mention'], function (bot, message) {
  var help = 'I will respond to the following messages: \n' +
      '`bot hi` for a simple message.\n' +
      '`bot attachment` to see a Slack attachment message.\n' +
      '`@<your bot\'s name>` to demonstrate detecting a mention.\n' +
      '`bot help` to see this again.'
  bot.reply(message, help)
})

controller.hears(['attachment'], ['direct_message', 'direct_mention'], function (bot, message) {
  var text = 'Beep Beep Boop is a ridiculously simple hosting platform for your Slackbots.'
  var attachments = [{
    fallback: text,
    pretext: 'We bring bots to life. :sunglasses: :thumbsup:',
    title: 'Host, deploy and share your bot in seconds.',
    image_url: 'https://storage.googleapis.com/beepboophq/_assets/bot-1.22f6fb.png',
    title_link: 'https://beepboophq.com/',
    text: text,
    color: '#7CD197'
  }]

  bot.reply(message, {
    attachments: attachments
  }, function (err, resp) {
    console.log(err, resp)
  })
})

controller.hears('.*', ['direct_message', 'direct_mention'], function (bot, message) {
  bot.reply(message, 'Sorry <@' + message.user + '>, I don\'t understand. \n')
})
