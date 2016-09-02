# CoffeeBot :coffee:
Round up the coffee order for your team on slack!

### Getting Started
Coming soon - This is still a work in progress but feel free to try it out and do some testing :)

### Commands

| Command | Description
| :--- | --- |
| @botname me | Nominate yourself to do the coffee run |
| @botname random | pick a random person from the team to do the coffee run |
| @botname order <your order> | Add your order to the list by typing '@botname order <your order>' e.g '@botname order regular americano' or '@botname order small tea'|
| @botname done | End the ordering process. No orders can be added after this command has been entered |
| @botname list | List all orders from team |

Running '@botname me / random' commands again will wipe all previous orders and start again.

### Todo
* Possibly make the bot a /slash command
* Allow user to enter shop name / location for the coffee run
* Allow user to update order after they have already added an order
* Add 'restart' command to restart an order
* Testing with multiple users ( only tested in slack channel with 1 user at the moment )

### Credits
Built using botkit ( https://github.com/howdyai/botkit )

### Updates

* 02/09/2016 - Added response when no orders have been placed after 'done' command is called.
* 02/09/2016 - Added functionality to prevent a new order being started when an order already exists.
