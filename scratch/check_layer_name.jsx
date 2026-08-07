(function() {
  app.beginSuppressDialogs();
  try {
    var aepFile = new File("C:/Users/ujan/Desktop/work anniversary/Work Anniversary2.aep");
    if (!aepFile.exists) return;
    app.open(aepFile);
    var log = [];
    
    var comp = null;
    for (var i = 1; i <= app.project.items.length; i++) {
      var item = app.project.items[i];
      if (item instanceof CompItem && item.name === "Comp 1") {
        comp = item;
        break;
      }
    }
    
    if (comp) {
      log.push("Comp 1 Layers name and charCodes:");
      for (var j = 1; j <= comp.numLayers; j++) {
        var layer = comp.layer(j);
        var name = layer.name;
        var chars = [];
        for (var k = 0; k < name.length; k++) {
          chars.push(name.charCodeAt(k));
        }
        log.push("Layer " + j + ": '" + name + "' (length: " + name.length + ", codes: " + chars.join(",") + ")");
      }
    } else {
      log.push("Comp 1 not found");
    }
    
    var logFile = new File("C:/Users/ujan/Desktop/Birthday & Video Automation/birthday-app/scratch/layer_codes.txt");
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
