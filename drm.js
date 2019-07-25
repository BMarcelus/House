

function checkHost() {
  var knownHosts = ['bmarcelus.github.io', 'niborious.itch.io'];
  var devHosts = ['localhost', '127.0.0.1'];
  try {
    var params = new URLSearchParams(window.location.search);
    if(window.location.origin != "file://" ||  params.has("illegal")) {
      var hostname = window.location.hostname;
      console.log(hostname);
      if(knownHosts.indexOf(hostname)<0) {
        console.log("Wait thats illegal");
        if(devHosts.indexOf(hostname)<0) {
          NotifyStealer();
        } else {
          NotifyIllegalDev();
        }
      }
      return true;
    }
  } catch (e) {
    console.log("Error ", e);
    NotifyStealer();    
  }
}

function NotifyStealer() {
  var gameName = "House";
  var win = window.open("https://bmarcelus.github.io/potentialBreachOfCopyright.html/?gameName="+gameName+"&illegalHost="+window.location.hostname+'$illegalPath='+window.location, '_blank');
  win.focus();
  window.location = "https://bmarcelus.github.io/" + gameName + '/?from=' + window.location;
}

function NotifyIllegalDev() {
  var gameName = "House";
  var win = window.open("https://bmarcelus.github.io/howToDoLegalBusiness.html/?gameName="+gameName+"&illegalHost="+window.location.hostname+'$illegalPath='+window.location, '_blank');
  win.focus();
}


// checkHost();