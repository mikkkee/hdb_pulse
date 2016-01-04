# HDB Pulse - Visualization of Singapore HDB Flat Resale Records

HDB Pulse shows the animation of Singapore HDB flat resale price pulse in
recent years. Each resale record is represented by a solid circle, whose color
is determined by its recorded price (SGD / sqm), on map.

![Screenshot][1]

## About
* Q: Where did you get all the data?

  A: All HDB flat resale records from 2000 to Sep 2015 are available from
  [Data.gov.sg][1]. The longitude and latitude for each record used of plotting
  is retrieved by querying through [Google Geocoding API][2] using its BLK
  number and stress address.

* Q: What do the data mean?

  A: Each resale is represented by a solid circle plotted at the location of its
  BLK. The color for each color is determined by its price (SGD / sqm). The
  resale records are shown by the sequence of month. During each month, the
  records are shown randomly since the original data don't have any sequence
  in each month.

* Q: Why is the demo so lagging?

  A: There are around 25k resale records in each year, which means more than 2000 resale
  records in each month. Each record lasts for 1.5s on map and the total duration
  for each month is 6s. That means that there are always more than 500 circles
  on map. You'll need to have a powerful CPU to have a high FPS when playing
  the animation.


[1]: images/screenshot.png
[2]: https://data.gov.sg/dataset/resale-flat-prices
[3]: https://developers.google.com/maps/documentation/geocoding/intro
