(function() {
  app.beginSuppressDialogs();
  try {
    var aepFile = new File("C:/Users/ujan/Desktop/work anniversary/Work Anniversary2.aep");
    if (!aepFile.exists) return;
    app.open(aepFile);
    var log = [];
    
    // Find Pre-comp 1
    var precomp = null;
    for (var i = 1; i <= app.project.items.length; i++) {
      var item = app.project.items[i];
      if (item instanceof CompItem && item.name === "Pre-comp 1") {
        precomp = item;
        break;
      }
    }
    
    if (precomp) {
      log.push("Comps and Layer Details for Pre-comp 1:");
      for (var j = 1; j <= precomp.numLayers; j++) {
        var layer = precomp.layer(j);
        log.push("Layer " + j + ": " + layer.name);
        
        // Check Effects
        var effectsProp = layer.property("ADBE Effect Parade");
        if (effectsProp && effectsProp.numProperties > 0) {
          log.push("  Effects (" + effectsProp.numProperties + "):");
          for (var k = 1; k <= effectsProp.numProperties; k++) {
            log.push("    - " + effectsProp.property(k).name);
          }
        }
        
        // Check Layer Styles
        var stylesProp = layer.property("ADBE Layer Styles");
        if (stylesProp && stylesProp.numProperties > 0) {
          log.push("  Layer Styles (" + stylesProp.numProperties + "):");
          for (var s = 1; s <= stylesProp.numProperties; s++) {
            var style = stylesProp.property(s);
            if (style.enabled) {
              log.push("    - " + style.name + " (Enabled)");
            }
          }
        }
        
        // Check Masks
        var masksProp = layer.property("ADBE Mask Parade");
        if (masksProp && masksProp.numProperties > 0) {
          log.push("  Masks (" + masksProp.numProperties + "):");
          for (var m = 1; m <= masksProp.numProperties; m++) {
            log.push("    - " + masksProp.property(m).name);
          }
        }
      }
    } else {
      log.push("Pre-comp 1 not found");
    }
    
    var logFile = new File("C:/Users/ujan/Desktop/Birthday & Video Automation/birthday-app/scratch/layer_details.txt");
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
