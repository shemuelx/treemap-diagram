const URL =
  "https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/movie-data.json";

const WIDTH = 1000,
  HEIGHT = 600,
  PADDING = 20,
  TOOLTIP = {
    top: 28,
    left: 10,
  },
  LEGEND = {
    width: 600,
    rows: 3,
    height: 10,
    size: 15,
  };

let movies,
  svg,
  cell,
  tooltip,
  legend,
  legendItem,
  hierarchy,
  treeMap,
  categories,
  color;

document.addEventListener("DOMContentLoaded", function () {
  getDataFromAPI()
    .then(() => setSVG())
    .then(() => setScales())
    .then(() => drawTree())
    .then(() => drawLegend());
});

function setSVG() {
  svg = d3
    .select(".canvas")
    .append("svg")
    .attr("width", WIDTH)
    .attr("height", HEIGHT);

  tooltip = d3
    .select("body")
    .append("div")
    .attr("id", "tooltip")
    .style("opacity", 0);
}

function setScales() {
  hierarchy = d3
    .hierarchy(movies, ({ children }) => children)
    .sum(({ value }) => value)
    .sort((child1, child2) => child2.value - child1.value);

  treeMap = d3.treemap().size([WIDTH, HEIGHT]).paddingInner(1);

  treeMap(hierarchy);

  categories = Array.from(new Set(hierarchy.leaves().map(getCategory)));

  color = d3.scaleOrdinal().domain(categories).range(d3.schemePastel1);
}

function drawTree() {
  cell = svg
    .selectAll("g")
    .data(hierarchy.leaves())
    .enter()
    .append("g")
    .attr("transform", translateTree);

  cell
    .append("rect")
    .attr("class", "tile")
    .attr("data-name", getName)
    .attr("data-category", getCategory)
    .attr("data-value", getValue)
    .attr("width", calculateWidth)
    .attr("height", calculateHeight)
    .attr("fill", (data) => color(getCategory(data)))
    .on("mouseover", mouseover)
    .on("mouseout", mouseout);

  cell
    .append("text")
    .attr("class", "tile-text")
    .attr("x", 0)
    .attr("y", 0)
    .selectAll("tspan")
    .data(getText)
    .enter()
    .append("tspan")
    .attr("x", 5)
    .attr("dy", "1.2em")
    .text((data) => data);
}

function drawLegend() {
  legend = d3.select("#legend").append("svg").attr("width", LEGEND.width);

  legendItem = legend
    .append("g")
    .attr("transform", translateLegend)
    .selectAll("g")
    .data(categories)
    .enter()
    .append("g")
    .attr("transform", translateLegendItem);

  legendItem
    .append("rect")
    .attr("width", LEGEND.size)
    .attr("height", LEGEND.size)
    .attr("class", "legend-item")
    .attr("fill", (data) => color(data));

  legendItem
    .append("text")
    .attr("x", LEGEND.size + 3)
    .attr("y", LEGEND.size - 3)
    .text((data) => data);
}

function getCategory({ data }) {
  const { category } = data;
  return category;
}

function getName({ data }) {
  const { name } = data;
  return name;
}

function getValue({ data }) {
  const { value } = data;
  return value;
}

function getText({ data }) {
  const { name } = data;
  return name.split(/(?=[A-Z][^A-Z])/g);
}

function translateTree({ x0, y0 }) {
  return `translate(${x0}, ${y0})`;
}

function calculateWidth({ x0, x1 }) {
  return x1 - x0;
}

function calculateHeight({ y0, y1 }) {
  return y1 - y0;
}

function mouseover(event, data) {
  tooltip
    .style("opacity", 0.9)
    .style("position", "absolute")
    .html(getTooltipHTML(data))
    .attr("data-value", getValue(data))
    .style("left", tooltipPositionLeft(event))
    .style("top", tooltipPositionTop(event));
}

function mouseout(event, data) {
  tooltip.style("opacity", 0);
}

function tooltipPositionLeft(event) {
  return `${event.pageX + TOOLTIP.left}px`;
}

function tooltipPositionTop(event) {
  return `${event.pageY - TOOLTIP.top}px`;
}

function getTooltipHTML({ data }) {
  const { category, name, value } = data;
  return `Name: ${name} <br/> Category: ${category} <br/> US$<strong>${value}</strong>`;
}

function translateLegend() {
  return `translate(90, 0)`;
}

function translateLegendItem(data, index) {
  const xAxis = (index % LEGEND.rows) * (LEGEND.width / LEGEND.rows);
  const yAxis =
    Math.floor(index / LEGEND.rows) * LEGEND.size +
    LEGEND.height * Math.floor(index / LEGEND.rows);

  return `translate(${xAxis}, ${yAxis})`;
}

async function getDataFromAPI() {
  await fetch(URL)
    .then((data) => data.json())
    .then((data) => (movies = data))
    .catch((error) => console.error(error));
}
