(function() {
  app.beginSuppressDialogs();
  try {
    var aepFile = new File("C:/Users/ujan/Desktop/work anniversary/Work Anniversary2.aep");
    if (!aepFile.exists) return;
    app.open(aepFile);
    var log = [];
    
    var precomp = null;
    for (var i = 1; i <= app.project.items.length; i++) {
      var item = app.project.items[i];
      if (item instanceof CompItem && item.name === "Pre-comp 1") {
        precomp = item;
        break;
      }
    }
    
    if (precomp) {
      log.push("Pre-comp 1 Layers detailed:");
      for (var j = 1; j <= precomp.numLayers; j++) {
        var layer = precomp.layer(j);
        log.push("Layer " + j + ": " + layer.name);
        log.push("  Enabled: " + layer.enabled);
        log.push("  Solo: " + layer.solo);
        log.push("  Shy: " + layer.shy);
        log.push("  Blend Mode: " + layer.blendingMode);
        if (layer.parent) {
          log.push("  Parent: " + layer.parent.name);
        }
      }
    }
    
    var logFile = new File("C:/Users/ujan/Desktop/Birthday & Video Automation/birthday-app/scratch/precomp_details.txt");
    logFile.open("w");
    logFile.write(log.join("\n"));
    logFile.close();
  } catch (e) {
    // ignore
  } finally {
    app.endSuppressDialogs(false);
    app.quit();
  }
})();
