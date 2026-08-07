try {
    var projectPath = "C:/Users/ujan/Desktop/work anniversary/Work Anniversary2.aep";
    var outputPath = "C:/Users/ujan/Desktop/Birthday & Video Automation/birthday-app/scratch/aep_layers.txt";

    var file = new File(projectPath);
    app.open(file);

    var out = new File(outputPath);
    out.open("w");
    out.writeln("Successfully opened project.");

    var proj = app.project;
    if (proj) {
        for (var i = 1; i <= proj.numItems; i++) {
            var item = proj.item(i);
            if (item instanceof CompItem) {
                out.writeln("Composition: " + item.name);
                for (var j = 1; j <= item.numLayers; j++) {
                    var layer = item.layer(j);
                    out.writeln("  Layer " + j + ": " + layer.name + " (Type: " + getLayerType(layer) + ")");
                }
                out.writeln("");
            }
        }
    } else {
        out.writeln("No project found.");
    }
    out.close();
} catch (e) {
    var errFile = new File("C:/Users/ujan/Desktop/Birthday & Video Automation/birthday-app/scratch/aep_error.txt");
    errFile.open("w");
    errFile.writeln("Error: " + e.toString());
    errFile.close();
}

function getLayerType(layer) {
    if (layer instanceof TextLayer) return "TextLayer";
    if (layer instanceof ShapeLayer) return "ShapeLayer";
    if (layer instanceof CameraLayer) return "CameraLayer";
    if (layer instanceof LightLayer) return "LightLayer";
    if (layer instanceof AVLayer) {
        if (layer.source instanceof CompItem) return "Precomp";
        if (layer.source instanceof FootageItem) {
            if (layer.source.mainSource instanceof SolidSource) return "Solid";
            return "Footage";
        }
        return "AVLayer";
    }
    return "Unknown";
}
app.quit();
