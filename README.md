# Sorting.js
Collection of 45 sorting algorithms in Javascript with commentaries. It contains 45 sorting algorithms organised as a library which can be used in Node.js and in browser. 

Usage: 
```Javascript
var arr = [98, 45, 101, 0, 7];

arr = Sorting.bubbleSort(arr);
// [0, 7, 45, 98, 101]
```

Few tests are included (those are non-enumerable):
```Javascript
/**
 * Performs a given amount of tests using arrays of random numbers. 
 * It uses same array of integers for each test.
 * Results are displayed in the console using console.table.
 * @param {number} l     - The length of the each array for sorting. The default value is 1000.
 * @param {number} tests - The number of tests to perform. The default value is 1.
 */
Sorting.test();

/**
 * Performs a test of a given sorting function using an array of random numbers.
 * @param {Function} func - A sorting function. If not provided, the Sorting.quickSort is used. 
 * @param {number}   l    - The length of the array. The default value is 5000.
 */
Sorting.testNumbers(func, l);

/**
 * Performs a test of a given sorting function using an array of random strings.
 * @param {Function} func - A sorting function. If not provided, the Sorting.radixMSDSort is used. 
 * @param {number}   l    - The length of the array. The default value is 5000.
 */
Sorting.testStrings(func, l);
```

Sorting.js contains following algorithms:
1. Quicksort.
2. Quicksort with 3-way Dijkstra partitioning.
3. Dual-pivot Quicksort suggested by V. Yaroslavskiy in 2009.
4. Introsort
5. Mergesort.
6. In-place Mergesort.
7. Blocksort.
8. Timsort.
9. Bucket sort (naive implementation).
10. Pigeonhole sort.
11. Proxmap sort.
12. Spreadsort.
13. Flashsort.
14. Binary tree sort (simple).
15. Red-Black tree sort.
16. Splaysort.
17. Heap sort.
18. Smoothsort.
19. JSort.
20. Cartesian sort.
21. Tournament sort.
22. Patience sort.
23. Library sort.
24. Shell sort.
25. Comb sort.
26. LSD radix sort.
27. MSD radix sort.
28. MSD radix quicksort.
29. American flag sort.
30. Counting sort.
31. Bitonic sort.
32. Insertion sort.
33. Insertion sort with binary search.
34. Selection sort.
35. Bingo sort.
36. Double selection sort.
37. Cocktail shaker sort.
38. Odd-even sort.
39. Bubble sort.
40. Cycle sort.
41. Gnome sort.
42. Pancake sort.
43. Quadratic counting sort.
44. Bead sort (Gravity sort).
45. Stooge sort.
