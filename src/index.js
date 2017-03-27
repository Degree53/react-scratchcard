import React, { Component } from 'react';

class ScratchCard extends Component {

	constructor(props) {
		super(props);
		this.state = { loaded: false }
	}

	componentDidMount() {
		this.isDrawing = false;
		this.lastPoint = null;
		this.ctx = this.canvas.getContext('2d');

		const image = new Image();
		image.crossOrigin = "Anonymous";
		image.onload = () => {
			this.ctx.drawImage(image, 0, 0);
			this.setState({ loaded: true });
		}
		image.src = this.props.image;
	}

	getFilledInPixels(stride) {
		if (!stride || stride < 1) {
			stride = 1;
		}

		const pixels = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
		const total = pixels.data.length / stride;
		let count = 0;

		for (let i = 0; i < pixels.data.length; i += stride) {
			if (parseInt(pixels.data[i], 10) === 0) {
				count++;
			}
		}

		return Math.round((count / total) * 100);
	}

	getMouse(e, canvas) {
		let offsetX = 0;
		let offsetY = 0;
		let mx, my;

		const bounds = e.target.getBoundingClientRect();

		var ratioX = bounds.width / this.props.width;
		var ratioY = bounds.height / this.props.height;

		mx = (((e.pageX - window.scrollX) || e.touches[0].clientX) - bounds.left) / ratioX;
		my = (((e.pageY - window.screenY) || e.touches[0].clientY) - bounds.top) / ratioY;

		return { x: mx, y: my }
	}

	distanceBetween(point1, point2) {
		return Math.sqrt(
			Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
		);
	}

	angleBetween(point1, point2) {
		return Math.atan2(point2.x - point1.x, point2.y - point1.y);
	}

	handlePercentage(filledInPixels = 0) {
		if (filledInPixels > this.props.finishPercent) {
			this.canvas.parentNode.removeChild(this.canvas);
			this.setState({ finished: true });
			this.props.onComplete();
		}
	}

	handleMouseDown(e) {
		e.preventDefault();

		this.isDrawing = true;
		this.lastPoint = this.getMouse(e, this.canvas);
	}

	handleMouseMove(e) {
		if (!this.isDrawing) {
			return;
		}

		e.preventDefault();

		const currentPoint = this.getMouse(e, this.canvas);
		const distance = this.distanceBetween(this.lastPoint, currentPoint);
		const angle = this.angleBetween(this.lastPoint, currentPoint);

		let x, y;

		for (let i = 0; i < distance; i++) {
			x = this.lastPoint.x + (Math.sin(angle) * i);
			y = this.lastPoint.y + (Math.cos(angle) * i);
			this.ctx.globalCompositeOperation = 'destination-out';
			this.ctx.beginPath();
			this.ctx.arc(x, y, 25, 0, 2 * Math.PI, false);
			this.ctx.fill();
		}

		this.lastPoint = currentPoint;
		this.handlePercentage(this.getFilledInPixels(32));

	}

	handleMouseUp(e) {
		e.preventDefault();

		this.isDrawing = false;
	}

	render() {

		const containerStyle = {
			height: this.props.height,
			width: this.props.width,
			position: 'relative',
			WebkitUserSelect: 'none',
			MozUserSelect: 'none',
			msUserSelect: 'none',
			userSelect: 'none',
			maxWidth: '100%',
			maxHeight: '100%'
		};

		const childStyle = {
			backfaceVisibility: 'hidden',
			position: 'absolute',
			width: '100%',
			height: '100%',
			top: 0,
			left: 0
		};

		const canvasStyle = Object.assign({}, childStyle, {
			position: 'absolute',
			touchAction: 'none'
		});

		const resultStyle = Object.assign({}, childStyle, {
			visibility: this.state.loaded ? 'visible' : 'hidden'
		});

		const canvasProps = {
			ref: (ref) => this.canvas = ref,
			height: this.props.height,
			width: this.props.width,
			onMouseDown: this.handleMouseDown.bind(this),
			onTouchStart: this.handleMouseDown.bind(this),
			onMouseMove: this.handleMouseMove.bind(this),
			onTouchMove: this.handleMouseMove.bind(this),
			onMouseUp: this.handleMouseUp.bind(this),
			onTouchEnd: this.handleMouseUp.bind(this),
			onMouseOut: this.handleMouseUp.bind(this)
		};

		return (
			<div className="ScratchCard__Container" style={ containerStyle }>
				<div className="ScratchCard__Result" style={ resultStyle }>
					{ this.props.children }
				</div>
				<canvas className="ScratchCard__Canvas" style={ canvasStyle } {...canvasProps}></canvas>
			</div>
		);
	}

}

ScratchCard.defaultProps = {
	onComplete: () => {}
}

ScratchCard.propTypes = {
	image: React.PropTypes.string.isRequired,
	width: React.PropTypes.number.isRequired,
	height: React.PropTypes.number.isRequired,
	finishPercent: React.PropTypes.number.isRequired,
	onComplete: React.PropTypes.func
}

export default ScratchCard;
