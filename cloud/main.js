// Cloud code - listen on the parser for the custom event to update the live viewers count
Parse.Cloud.onLiveQueryEvent(
  ({
    event,
    className,
    queryName,
  }) => {
    if (event == 'subscribe' && className) {
      if (className == 'Masterclass' && queryName.name && queryName.name == 'masterclassLive') {
        const query = new Parse.Query(className);
        query.equalTo('name', 'masterclassLive');
        query
          .find()
          .then(results => {
            results.forEach(live => {
              live.increment('livecount');
              live.save();
            });
          })
          .catch(error => {
            console.log(error);
          });
      }
    } else if (event == 'ws_disconnect' && className) {
      if (className == 'Masterclass' && queryName.name && queryName.name == 'masterclassLive') {
        const query = new Parse.Query(className);
        query.equalTo('name', 'masterclassLive');
        query
          .find()
          .then(results => {
            results.forEach(live => {
              live.decrement('livecount');
              live.save();
            });
          })
          .catch(error => {
            console.log(error);
          });
      }
    }
    return;
  }
);
