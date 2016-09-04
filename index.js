var Botkit = require('botkit');
var config = require('./config.js');

var controller = Botkit.slackbot({
  json_file_store: './store',
});

var fullTeamList = [];
var fullChannelList = [];

var bot = controller.spawn(process.env.ACCESS_TOKEN).startRTM(function (err, bot) {
    if (err) {
        throw new Error(err);
    }

    // @ https://api.slack.com/methods/users.list
    bot.api.users.list({}, function (err, response) {
        if (response.hasOwnProperty('members') && response.ok) {
            var total = response.members.length;
            for (var i = 0; i < total; i++) {
                var member = response.members[i];
                fullTeamList.push({name: member.name, id: member.id, bot: member.is_bot});
            }
        }
    });

    // @ https://api.slack.com/methods/channels.list
    bot.api.channels.list({}, function (err, response, logteam) {
        if (response.hasOwnProperty('channels') && response.ok) {
            var total = response.channels.length;
            for (var i = 0; i < total; i++) {
                var channel = response.channels[i];
                fullChannelList.push({name: channel.name, id: channel.id});
            }
        }
    });
});

function removeBots() {
  for(var i=fullTeamList.length -1; i >= 0; i--) {
    if(fullTeamList[i].name === 'slackbot' || fullTeamList[i].bot === true) {
      fullTeamList.splice(i, 1);
    }
  }
}

function getRandomTeam() {
  var teamMember = fullTeamList[Math.floor(Math.random() * fullTeamList.length)];
  return teamMember;
}

function getMemberName(memberId) {
  for(var i=0; i < fullTeamList.length; i++) {
    if(fullTeamList[i].id === memberId) {
      return fullTeamList[i].name;
      break;
    }
  }
}

function inArray(value, array) {
  return array.indexOf(value) > -1;
}

var ordered = [];
var listening = false;
var orders = [];

controller.hears(['me'],['direct_mention', 'mention'], function(bot,message) {
  if(listening) {
    bot.say({channel: message.channel, text: "Sorry, An order has already been started."});
  } else {
    ordered = [];
    orders = [];
    bot.api.users.info({user: message.user}, function(err, response) {
      bot.say({channel: message.channel, text: "Hey, I'm " + config.botname + "  :coffee:"});
      bot.say({channel: message.channel, text: "You, " + response.user.name + ", have volunteered yourself to do the coffee run!"});
      collectOrders();
      bot.say({channel: message.channel, text: "Now listening for orders..."});
      bot.say({channel: message.channel, text: "To add an order type '" + config.botname + " order <your order here>'"});
      bot.say({channel: message.channel, text: "e.g '" + config.botname + " order regular americano'"});
      bot.say({channel: message.channel, text: "When orders have been taken type '" + config.botname + " done' to end & type '" + config.botname + " list' to show all orders!"});
    });
  }
});

controller.hears(['random'],['direct_mention', 'mention'], function(bot,message) {
  // Remove bots from team list. Prevents bot being chosen to do the coffee run!
  removeBots();

  ordered = [];
  var teamMember = getRandomTeam();
  if(listening) {
    bot.say({channel: message.channel, text: "Sorry, An order has already been started."});
  } else {
    bot.api.users.info({user: message.user}, function(err, response) {
      bot.say({channel: message.channel, text: "Hey, I'm coffeebot! :coffee:"});
      bot.say({channel: message.channel, text: teamMember.name + " has been selected to do the coffee run!"});
      collectOrders();
      bot.say({channel: message.channel, text: "Now listening for orders..."});
      bot.say({channel: message.channel, text: "To add an order type '" + config.botname + " order <your order here>'"});
      bot.say({channel: message.channel, text: "e.g '" + config.botname + " order regular americano'"});
      bot.say({channel: message.channel, text: "When orders have been taken type '" + config.botname + " done' to end & type '" + config.botname + " list' to show all orders!"});
    });
  }
});


var collectOrders = function() {
  listening = true;

  controller.hears(['order'],['direct_mention', 'mention'], function(bot,message) {
    var member = getMemberName(message.user);

    if(listening == true) {
      if(inArray(message.user, ordered)) {
        bot.say({channel: message.channel, text: "Hey, " + member + " Your order has already been taken"});
      } else {
        ordered += message.user;
        orders.push({user: message.user, order: message.text.slice(6) });
        bot.say({channel: message.channel, text: "Thanks " + member + " Your order has been taken"});
      }
    } else {
      bot.say({channel: message.channel, text: "Sorry, orders have been taken!"});
    }
  });

  controller.hears(['done'],['direct_mention', 'mention'], function(bot,message) {
    listening = false;
    if(orders.length < 1) {
      bot.say({channel: message.channel, text: "No orders were placed! :confused:"});
      bot.say({channel: message.channel, text: "Type: '" + config.botname + " me / random' to start again!"});
    } else {
      bot.say({channel: message.channel, text: "Ordering Complete! :coffee:"});
      bot.say({channel: message.channel, text: "Team Orders:"});
      orders.forEach(function(item) {
        var member = getMemberName(item.user);
        bot.say({channel: message.channel, text: member + " ordered " + item.order});
      });
    }
  });
}

controller.hears(['list'],['direct_mention', 'mention'], function(bot,message) {
  if(orders.length < 1) {
    bot.say({channel: message.channel, text: "No orders were placed! :confused:"});
    bot.say({channel: message.channel, text: "Type: '" + config.botname + " me / random' to start again!"});
  } else {
    bot.say({channel: message.channel, text: "Team Orders:"});
    orders.forEach(function(item) {
      var member = getMemberName(item.user);
      bot.say({channel: message.channel, text: member + " ordered " + item.order});
    });
  }
});
