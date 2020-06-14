# Game of Thrones Death Watch

This project allows users to explore data visualizations related to the many deaths that occur on the hit HBO show Game of
Thrones. It includes a linked choropleth map and bar chart as well as a node diagram showing the links between killer and
victim for the majority of the show's characters. For each visualization, users can explore the deaths that took place over a specific season using the slider near the top of the page.

## Setup

1. Clone the repository to your computer
2. Navigate to the cloned repository and run `http-server -p 5500`
3. Open a web browser and navigate to `http://localhost:5500/`

## References

**_Primary Data Source_**

https://data.world/datasaurusrex/game-of-thones-deaths/workspace/file?filename=Game%20of%20Thrones%20Deaths&fbclid=IwAR0uy-L5ggVSbr2OW0dvuZdrYf2aSFbac5gbPIdaFk5b1TForAe-e06zf9Y

**_Game of Thrones Map Source_**

https://www.cartographersguild.com/showthread.php?t=30472

**_Game of Thrones Character Images Source_**

https://github.com/jeffreylancaster/game-of-thrones/blob/master/data/characters.json

**_Game of Thrones Death Map References_**

Data processing from shapefile to topoJSON done here: https://mapshaper.org/

Drop down logic modeled from here: https://www.d3-graph-gallery.com/graph/line_filter.html

**_Game of Thrones Death Allegiance Bar Chart Refernces_**

No additional code was referenced/used

**_Game of Thrones Kills Node Diagram References_**

Starter code for the node diagram was based off of: https://observablehq.com/@d3/force-directed-graph?collection=@d3/d3-force

Some tooltip code is taken from: https://bl.ocks.org/mbostock/1087001

Code for creating the arrowhead for node links is based off of: https://observablehq.com/@mbostock/mobile-patent-suits

Minor amounts of code were based off of the following two links for the donut graphs:
https://stackoverflow.com/questions/14794055/place-pie-charts-on-nodes-of-force-directed-layout-graph-in-d3
https://observablehq.com/@d3/donut-chart
