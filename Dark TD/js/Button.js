function ButtonClass(x, y, width, height, color, text, context) {
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.color = color;
	this.text = text;
	this.context = context;

	this.click; // function

	this.draw = function() {
		drawRect(this.x, this.y, this.width, this.height, this.color, this.context);

	    ctx[this.context].fillStyle = "white";
	    ctx[this.context].font = "14px Helvetica";

        var textWidth = ctx[this.context].measureText(this.text).width;
        var xOffset = (this.width - textWidth) / 2; // centered text

		ctx[this.context].fillText(this.text, this.x + xOffset, this.y);
	}
}