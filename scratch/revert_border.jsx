(function() {
  app.beginSuppressDialogs();
  try {
    var aepFile = new File("C:/Users/ujan/Desktop/work anniversary/Work Anniversary2.aep");
    if (!aepFile.exists) return;
    app.open(aepFile);
    
    var precomp = null;
    for (var i = 1; i <= app.project.items.length; i++) {
      var item = app.project.items[i];
      if (item instanceof CompItem && item.name === "Pre-comp 1") {
        precomp = item;
        break;
      }
    }
    
    if (precomp) {
      for (var j = 1; j <= precomp.numLayers; j++) {
        var layer = precomp.layer(j);
        if (layer.name === "Black Solid 1" || layer.name === "shadow") {
          layer.enabled = true;
        }
      }
      app.project.save();
    }
  } catch (e) {
    // ignore
  } finally {
    app.endSuppressDialogs(false);
    app.quit();
  }
})();
