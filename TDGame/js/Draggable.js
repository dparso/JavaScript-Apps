function DraggableClass(type, x, y, context, classType) {
	this.type = type;
	this.img = tilePics[type];
	this.x = x;
	this.y = y;
	this.context = context;
	this.classType = "tower";

	this.range;

    this.draw = function() {
        if(this.visible) {
            drawBitmapCenteredWithRotation(this.img, this.x, this.y, 0, this.context);
        }
    }
}