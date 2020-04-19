
/**
 * Calculate the masonry
 *
 * Calculate the average of heights of masonry-bricks and then
 * set it as the height of the masonry element.
 *
 * @since 12212018
 * @author Rahul Arora
 * @param grid       Object  The Masonry Element 
 * @param gridCell   Object  The Masonry bricks
 * @param gridGutter Integer The Vertical Space between bricks 
 * @param dGridCol   Integer Number of columns on big screens
 * @param tGridCol   Integer Number of columns on medium-sized screens
 * @param mGridCol   Integer Number of columns on small screens
 */
function masonry(grid, gridCell, gridGutter, dGridCol, tGridCol, mGridCol) {
  var g = document.querySelector(grid),
      gc = document.querySelectorAll(gridCell),
      gcLength = gc.length, // Total number of cells in the masonry
      gHeight = 0, // Initial height of our masonry
      i; // Loop counter
  
  // Calculate the net height of all the cells in the masonry
  for(i=0; i<gcLength; ++i) {
    gHeight+=gc[i].offsetHeight+parseInt(gridGutter);
  }
  
  /*
   * Calculate and set the masonry height based on the columns
   * provided for big, medium, and small screen devices.
   */ 
  if(window.screen.width >= 1024) {
    g.style.height = gHeight/dGridCol + gHeight/(gcLength+1) + "px";
  } else if(window.screen.width < 1024 && window.screen.width >= 768) {
    g.style.height = gHeight/tGridCol + gHeight/(gcLength+1) + "px";
  } else {
    g.style.height = gHeight/mGridCol + gHeight/(gcLength+1) + "px";
  }
};

/**
 * Reform the masonry
 *
 * Rebuild the masonry grid on every resize and load event after making sure 
 * all the images in the grid are completely loaded.
 */
["resize", "load"].forEach(function(event) {
    // Follow below steps every time the window is loaded or resized
    window.addEventListener(event, function() {
      // Check if all the images finished loading
      imagesLoaded( document.querySelector('.card-container'), function() {
        /*
         * A maonsry grid with 8px gutter, with 3 columns on desktop,
         * 2 on tablet, and 1 column on mobile devices.
         */
        masonry(".card-container", ".card-brick", 8, 3, 2, 1);
      });
  });


/**
 * Preload and reform the masonry
 *
 * Add some preloader text to the masonry grid and rebuild it on every resize
 * and load event after making sure all the images in the grid are loaded
 * completely.
 */

// // Grab the pointer to the masonry grid
// var masonryElem = document.querySelector('.card-container');

// // Insert preloader text dynamically
// masonryElem.insertAdjacentHTML('afterend', '<div class="masonry-preloader">Loading...</div>');

// // Grab the pointer to the masonry preloader
// var masonryPreloader = document.querySelector('.masonry-preloader');

// // Fire the magic on every load and resize event
// ['resize', 'load'].forEach(function(event) {
//   // Hide the masonry until it loads
//   masonryElem.style.display='none';

//   // Follow the below steps on every load and resize event
//   window.addEventListener(event, function() {

//     // Check if all the images finished loading
//     imagesLoaded( document.querySelector('.masonry'), function() {

//       // Show the masonry, as it is loaded now
//       masonryElem.style.display='flex';

//       // Hide the preloader, as it is not needed anymore
//       masonryPreloader.style.display='none';

//       /*
//        * A maonsry grid with 8px gutter, with 3 columns on desktop,
//        * 2 on tablet, and 1 column on mobile devices.
//        */
//       masonry('.masonry', '.masonry-brick', 8, 3, 2, 1);

//       // Done!
//       console.log('Flexbox Masonry Loaded');
//     });
//   }, false);
// });