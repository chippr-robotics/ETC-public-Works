// based on bot made by the ellisiam team

var web3 = require('./etherNode');
var dapp = require('../dapp');
var auth = require('../auth')

const ABI = dapp.a2a.abi;
const ADDR = dapp.a2a.address;

const a2a = new web3.eth.Contract(ABI, ADDR);


module.exports = async (channelID, sender,  args) => {
  var messageBody = {
        "from" : "",
        "text" : "",
    "bridgette": " | This message was delivered by Bridgette. Please do not reply to her address | "
  }

  switch(args[0]){
      case "send" :
        messageBody.from = args[1];
        messageBody.text = args[2];
        web3.eth.personal.unlockAccount(auth.account, auth.passwd);
        const msg = await a2a.methods.sendMessage(args[3], messageBody).send({
          from: auth.account,
          gas: '90000',
          gasPrice: '20000000000'
        })
        .then( res => {
          return {
              to: channelID,
              message : '@'+ sender + ', your message has been sent.'
            }
        })
        .catch((err) => {
        return {
          to: channelID,
          message : err
        }
        });
        break;
      case "count":
        console.log("ran count");
        const last = await a2a.methods.lastIndex(args[1]).call()
          .then( res => {
           if(res != undefined){
            console.log(res);
            return{
             to: channelID,
              message :  "Account `" + args[1].substring(0,10) + "` has " + res + " messages."};
            
          } else {
            return{
              to: channelID,
              message :  "Account `" + args[1].substring(0,10) + "` has no messages."
          };
        };
        });
        break;
      case "fetch":
        a2a.methods.getMessageByIndex(args[2], args[1]).call()
          .then( res => {
            return{
            to: channelID,
            message :  "``` message: "+ args[1] + "\n"
                      + "-------------------------- \n"
                      + "\n"
                      + "From: " + res[0] + "\n"
                      + "Timestamp:" + res[2] + "\n"
                      + "Msg: " + res[1] + "\n"
                      + "```"
            };
          });
           break;
        case "new":
          a2a.methods.getLastMessage(args[1]).call()
            .then( res => {
              return{
              to: channelID,
              message :  "``` Latest: \n"
                        + "-------------------------- \n"
                        + "\n"
                        + "From: " + res[0] + "\n"
                        + "Timestamp:" + res[2] + "\n"
                        + "Msg: " + res[1] + "\n"
                        + "```"
              };
            });
          break;
        };
    };