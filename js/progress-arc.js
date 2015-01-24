var colors = {
    'green': '#00a13f'
};

var color = colors.green;

var radius = 50;
var border = 3;
var padding = 10;
var startPercent = 0;
var endPercent = 1;


var twoPi = Math.PI * 2;
var formatPercent = d3.format('.1%');
var boxSize = (radius + padding) * 2;


//var count = Math.abs((endPercent - startPercent) / 0.01);
//console.log(count);
//var step = endPercent < startPercent ? -0.01 : 0.01;
//console.log(step);

var arc = d3.svg.arc()
    .startAngle(0)
    .innerRadius(radius)
    .outerRadius(radius - border);

var parent = d3.select('div#progressCircle');

var svgcircle = parent.append('svg')
    .attr('width', boxSize)
    .attr('height', boxSize);

var defs = svgcircle.append('defs');

var gcircle = svgcircle.append('g')
    .attr('transform', 'translate(' + boxSize / 2 + ',' + boxSize / 2 + ')');

var meter = gcircle.append('g')
    .attr('class', 'progress-meter');

meter.append('path')
    .attr('class', 'background')
    .attr('fill', '#ccc')
    .attr('fill-opacity', 0.5)
    .attr('d', arc.endAngle(twoPi));

var foreground = meter.append('path')
    .attr('class', 'foreground')
    .attr('fill', color)
    .attr('fill-opacity', 1)
    .attr('stroke', color)
    .attr('stroke-width', 5)
    .attr('stroke-opacity', 1)
    .attr('filter', 'url(#blur)');

var front = meter.append('path')
    .attr('class', 'foreground')
    .attr('fill', color)
    .attr('fill-opacity', 1);

var numberText = meter.append('text')
    .attr('fill', '#888888')
    .attr('text-anchor', 'middle')
    .attr('dy', '.35em');

    numberText.text('0%');

function updateProgress(progress) {
    foreground.attr('d', arc.endAngle(twoPi * progress));
    front.attr('d', arc.endAngle(twoPi * progress));
    numberText.text(formatPercent(progress));
}

var progress = startPercent;