const query = new Parse.Query('SessionLogs');
const SUBSCRIBE = 'subscribe';
const DISCONNECT = 'ws_disconnect';
const UNSUBSCRIBE = 'unsubscribe';
const rp = require("request-promise");
const DTA_URL = process.env.PARSE_SERVER_DTA_URL;

const updateSessionLogs = async (value, queryName) => {
  if (queryName.sessionId && queryName.userIds) {
    query.equalTo('sessionId', queryName.sessionId);
    query.equalTo('userId', queryName.userIds);
    query
      .find()
      .then(results => {
        // If there is no entry for that session and user
        if (results.length == 0) {
          let SessionLogs = Parse.Object.extend('SessionLogs');
          let sessionLog = new SessionLogs();
          sessionLog.set('sessionId', queryName.sessionId);
          sessionLog.set('userId', queryName.userIds);
          let data = [];
          data.push(value);
          sessionLog.set('action', data);
          // creating log object
          sessionLog.save().then(
            log => {
              console.log('New object created with objectId: ' + log.id);
            },
            error => {
              console.log('Failed to create new object, with error code: ' + error.message);
            }
          );
        } else {
          // Update the action if the unique entry for user and session exists
          // Ideally there will be only one row, handled to loop over to avoid the issue
          results.forEach(log => {
            log.add('action', value);
            log.save();
            console.log('updated the object with sessionLogs entry');
          });
        }
      })
      .catch(error => {
        console.log(error);
      });
  }
};

const sendHTTPReq = async (userId, id, userType) => {
  console.log('---------- sendHTTP --------------')
  let body = {
    id: id,
    user_id: userId,
    type: userType
  };
  let options = {
    method: "POST",
    url:DTA_URL,
    headers: {
      "Content-Type": "application/json",
    },
    body: body,
    json: true,
  };
  return rp(options)
    .then((parsedBody) => {
      console.log(parsedBody)
      return Promise.resolve(parsedBody);
    })
    .catch((err) => {
      console.log(err)
      return err;
    });
}

const joinDynamicTrialSession= async (queryName) => {
  try {
    if (queryName.userId && queryName.pgId && queryName.userType) {
      pgId = parseInt(queryName.pgId) || 0
      if(pgId > 0) { 
        sendHTTPReq(queryName.userId, pgId, queryName.userType)
      }
    }
  } catch(e) {
    console.log(e);
  }
}

const liveQueryTrigger = async (event, className, queryName, currentTime) => {
  try {
    console.log('---- L I V E Q U E R Y ----');
    console.log(event)
    console.log(className)
    if (event == SUBSCRIBE && className == 'Session') {
      let value = 'c:' + currentTime;
      updateSessionLogs(value, queryName);
    } else if (
      (event == DISCONNECT || event == UNSUBSCRIBE) &&
      queryName &&
      'Session' in queryName
    ) {
      let value = 'd:' + currentTime;
      updateSessionLogs(value, queryName['Session']);
    } else if (event == SUBSCRIBE && className == 'TrialSession')
     {
      console.log(" ----- hitting the func ------")
      joinDynamicTrialSession(queryName);
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
    console.log('--------------- current total connections ------------', clients);
    console.log(event, className);
    console.log(queryName);
    if ((event == SUBSCRIBE || event == DISCONNECT || event == UNSUBSCRIBE) && queryName) {
      let currentTime = Date.now();
      liveQueryTrigger(event, className, queryName, currentTime);
    }
    return;
  }
);

Parse.Cloud.define('agoraTrigger', async request => {
  console.log('--------------- A G O R A --------------- ');
  request = request.params;
  let AgoraLogs = Parse.Object.extend('AgoraLogs');
  let newLog = new AgoraLogs();
  newLog.set('sessionId', request.sessionId);
  newLog.set('userId', request.userId);
  newLog.set('quality', request.quality);
  newLog.set('strength', request.strength);
  newLog.save();
  return;
});
