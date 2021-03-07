const query = new Parse.Query('SessionLogs');

const liveQueryTrigger = async (event, className, queryName) => {
  try {
    if (event == 'subscribe' && className) {
      if (className == 'Sessions') {
        let value = 'c:' + Date.now();
        //const query = new Parse.Query('SessionLogs');
        query.equalTo('sessionId', queryName.sessionId);
        query.equalTo('userId', queryName.userId);
        query
          .find()
          .then(results => {
            if (results.length == 0) {
              const GameScore = Parse.Object.extend('SessionLogs');
              const gameScore = new GameScore();
              gameScore.set('sessionId', queryName.sessionId);
              gameScore.set('userId', queryName.userId['$in'][0]);
              let data = [];
              data.push(value);
              gameScore.set('action', data);
              gameScore.save().then(
                gameScore => {
                  // Execute any logic that should take place after the object is saved.
                  console.log('New object created with objectId: ' + gameScore.id);
                },
                error => {
                  // Execute any logic that should take place if the save fails.
                  // error is a Parse.Error with an error code and message.
                  console.log('Failed to create new object, with error code: ' + error.message);
                }
              );
            } else {
              results.forEach(live => {
                live.add('action', value);
                live.save();
                console.log('updated the object with sessionLogs entry');
              });
            }
          })
          .catch(error => {
            console.log(error);
          });
      }
    } else if (event == 'ws_disconnect' && className) {
      if (className == 'Sessions') {
        let value = 'd:' + Date.now();
        const query = new Parse.Query('SessionLogs');
        query.equalTo('sessionId', queryName.sessionId);
        query.equalTo('userId', queryName.userId);
        query
          .find()
          .then(results => {
            if (results.length == 0) {
              const GameScore = Parse.Object.extend('SessionLogs');
              const gameScore = new GameScore();
              gameScore.set('sessionId', queryName.sessionId);
              gameScore.set('userId', queryName.userId);
              let data = [];
              data.push(value);
              gameScore.set('action', data);
              gameScore.save().then(
                gameScore => {
                  // Execute any logic that should take place after the object is saved.
                  console.log('New object created with objectId: ' + gameScore.id);
                },
                error => {
                  // Execute any logic that should take place if the save fails.
                  // error is a Parse.Error with an error code and message.
                  console.log('Failed to create new object, with error code: ' + error.message);
                }
              );
            } else {
              results.forEach(live => {
                live.add('action', value);
                live.save();
                console.log('updated disconnect entry with the mentioned objectId');
              });
            }
          })
          .catch(error => {
            console.log(error);
          });
      }
    }
  } catch (e) {
    console.log(e);
  }
  return;
};

Parse.Cloud.onLiveQueryEvent(
  ({
    event,
    client,
    sessionToken,
    useMasterKey,
    installationId,
    clients,
    subscriptions,
    error,
    clientId,
    className,
    queryName,
  }) => {
    console.log('--------------- No of connections ------------', clients);
    //liveQueryTrigger(event, className, queryName)
    return;
  }
);

Parse.Cloud.define('agoraTrigger', async request => {
  console.log('--------------- A G O R A ------------');
  request = request.params;
  const GameScore = Parse.Object.extend('AgoraLogs');
  const gameScore = new GameScore();
  gameScore.set('sessionId', request.sessionId);
  gameScore.set('userId', request.userId);
  gameScore.set('quality', request.quality);
  gameScore.set('strength', request.strength);
  gameScore.save();
  return;
});
