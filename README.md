# HDB Pulse - Visualization of Singapore HDB Flat Resale Records

HDB Pulse shows the animation of Singapore HDB flat resale price pulse in
recent years. Each resale record is represented by a solid circle, whose color
is determined by its recorded price (SGD/sqm), on Singapore map.

![Screenshot][1]
![Animation][2]

## About
* Q: Where did you get all the data?

  A: All HDB flat resale records from 2000 to Sep 2015 are available from
  [Data.gov.sg][3]. The longitude and latitude for each record used of plotting
  is retrieved by querying through [Google Geocoding API][4] using address of each
  record.

* Q: What do the data mean?

  A: The resale records are shown in the sequence of approval / registration date.
  Each resale is represented by a solid circle plotted at its address.
  The color for each circle is determined by its price (SGD/sqm). You can turn
  on colorbar on the left panel to have an impression on the color-price relationship.
  During each month, the records are shown randomly since the original data
  don't have any sequence in each month.

* Q: Why is the demo so lagging?

  A: There are around 25k resale records in each year, which means more than 2000 resale
  records in each month. Each record lasts for 1.5s on map and the total duration
  for each month is 6s. That means that there are always more than 500 circles
  on map. You'll need to have a powerful CPU to have a high FPS while playing
  the animation.


[1]: images/screenshot.png
[2]: images/animation.gif
[3]: https://data.gov.sg/dataset/resale-flat-prices
[4]: https://developers.google.com/maps/documentation/geocoding/intro
