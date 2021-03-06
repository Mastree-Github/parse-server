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
