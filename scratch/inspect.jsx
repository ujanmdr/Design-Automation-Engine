(function() {
  app.beginSuppressDialogs();
  try {
    var aepFile = new File("C:/Users/ujan/Desktop/work anniversary/Work Anniversary2.aep");
    if (!aepFile.exists) {
      return;
    }
    app.open(aepFile);
    var log = [];
    for (var i = 1; i <= app.project.items.length; i++) {
      var item = app.project.items[i];
      if (item instanceof CompItem) {
        log.push("Comp: " + item.name);
        for (var j = 1; j <= item.numLayers; j++) {
          var layer = item.layer(j);
          log.push("  Layer: " + layer.name + " (" + layer.constructor.name + ")");
        }
      }
    }
    var logFile = new File("C:/Users/ujan/Desktop/Birthday & Video Automation/birthday-app/scratch/aep_layers.txt");
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
