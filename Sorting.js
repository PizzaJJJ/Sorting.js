(function(global) {
    'use strict';

    /**
     * @typedef {*} arrayElement
     * @typedef {function(arrayElement, arrayElement): number} compareFunc
     * @typedef {function(Array, number, number)} exchangeFunc
     * @typedef {function(*, Array, number)} insertFunc
     * @typedef {function(Array, number, number): arrayElement} getPivot
     * @typedef {function(number, number, Array.<number>): number} mapKey
     * @typedef {function(arrayElement): ?} getKey
     * @typedef {function(number): Array.<number>} getGaps
     * @typedef {function(Array, compareFunc=, exchangeFunc=, insertFunc=, [Function]=): Array} sortFunc
     */

    /**
     * @type {Object.<string, sortFunc>}
     */
    var Sorting = {};

    /** 
     * Non-recursive top-down quicksort algorithm implementation with simple 2-way partitioning.
     * @param {Array} arr Input array.
     * @param {compareFunc=} compareFunc Compares two values and returns a numeric result.
     * @param {exchangeFunc=} exchangeFunc Exchanges two elements of input array receiveing the array and two indices as parameters.
     * @param {insertFunc=} insertFunc Inserts a value into array into given position. 
     * @param {getPivot=} getPivot Returns a pivoting value in input array in given boundaries.
     * @returns {Array} Sorted input array.
     */
    Sorting.quickSort = function(arr, compareFunc, exchangeFunc, insertFunc, getPivot) {
        var ind, r, l, p, i, j,
            stack = [
                [0, arr.length - 1]
            ];

        while (stack.length > 0) {
            ind = stack.pop();

            // Getting left and right boundaries of a subarray.
            l = ind[0];
            r = ind[1];

            // Switching to insertion sort if the subarray is too small.
            if (r <= l) continue;
            if (r - l < 27) {
                insertionSortWorker(arr, l, r, compareFunc, insertFunc);
                continue;
            }
            /*
                Setting left and right indices on initial positions on boundaries 
                of subarray and getting a pivot element.
            */
            i = l;
            j = r;
            p = getPivot(arr, l, r);
            /*
                While left index is smaller than right index do following:

                move elements which bigger that the pivot to the right 
                (increasing the left index) and move elements which smaller 
                than the pivot to the left (decreasing the right index).

                Finally, switch to considering smaller subarrays.
            */
            while (true) {
                while (compareFunc(arr[i], p) < 0) {
                    i++;
                }

                while (compareFunc(arr[j], p) > 0) {
                    j--;
                }

                if (i >= j) {
                    stack.push([l, j]);
                    stack.push([j + 1, r]);
                    break;
                }

                exchangeFunc(arr, i, j);
                i++;
                j--;
            }
        }

        return arr;
    };


    /** 
     * Non-recursive top-down quicksort algorithm implementation with 3-way Dijkstra partitioning.
     * 
     * @param {Array} arr Input array.
     * @param {compareFunc=} compareFunc Compares two values and returns a numeric result.
     * @param {exchangeFunc=} exchangeFunc Exchanges two elements of input array receiveing the array and two indices as parameters.
     * @param {insertFunc=} insertFunc Inserts a value into array into given position. 
     * @param {getPivot=} getPivot Returns a pivoting value in input array in given boundaries.
     * @returns {Array} Sorted input array.
     */
    Sorting.quickSort3 = function(arr, compareFunc, exchangeFunc, insertFunc, getPivot) {
        var r, l, ind, p, i, lt, ht, cmp,
            stack = [
                [0, arr.length - 1]
            ];

        while (stack.length > 0) {
            ind = stack.pop();

            // Getting left and right boundaries of a subarray.
            l = ind[0];
            r = ind[1];

            // Switching to insertion sort if the subarray is too small.
            if (r <= l) continue;
            if (r - l < 27) {
                insertionSortWorker(arr, l, r, compareFunc, insertFunc);
                continue;
            }
            /*
                Setting left and right indices and left subindex on initial positions 
                on boundaries of subarray and getting a pivot element.
            */
            lt = l;
            ht = r;
            i = lt;
            p = getPivot(arr, l, r);
            /*
                While left subindex is smaller than right index do following:

                move elements which bigger that the pivot to the right 
                (decreasing the right index) and move elements which smaller 
                than the pivot to the left (increasing both the left index and left subindex);
                
                if a considering element is equal to the pivot, then only increase left subindex.
                That allows to reduce sizes of further considering subarrays if there are a lot of 
                equal elements in the input array.

                Finally, switch to considering smaller subarrays.
            */
            while (i <= ht) {
                cmp = compareFunc(arr[i], p);
                if (cmp < 0) {
                    exchangeFunc(arr, i, lt);
                    i++;
                    lt++;
                } else if (cmp > 0) {
                    exchangeFunc(arr, i, ht);
                    ht--;
                } else {
                    i++;
                }

                if (i > ht) {
                    stack.push([l, lt - 1]);
                    stack.push([ht + 1, r]);
                }
            }
        }

        return arr;
    };

    /** 
     * An implementation of non-recursive top-down dual-pivot quicksort algorithm which was suggested by Vladimir Yaroslavskiy in 2009.
     * 
     * @param {Array} arr Input array.
     * @param {compareFunc=} compareFunc Compares two values and returns a numeric result.
     * @param {exchangeFunc=} exchangeFunc Exchanges two elements of input array receiveing the array and two indices as parameters.
     * @param {insertFunc=} insertFunc Inserts a value into array into given position.
     * @returns {Array} Sorted input array.
     */
    Sorting.quickSortDP = function(arr, compareFunc, exchangeFunc, insertFunc) {
        var ind, R, L, l, k, g, p1, p2,
            stack = [
                [0, arr.length - 1]
            ];

        while (stack.length > 0) {
            ind = stack.pop();

            // Getting left and right boundaries of a subarray.
            L = ind[0];
            R = ind[1];

            // Switching to insertion sort if the subarray is too small.
            if (R <= L) continue;
            if (R - L < 27) {
                insertionSortWorker(arr, L, R, compareFunc, insertFunc);
                continue;
            }

            // Setting elements on boundaries of the considering subarray as pivots 1 and 2.
            p1 = arr[L];
            p2 = arr[R];

            // If pivots are in wrong order, exchange their values.
            if (compareFunc(p1, p2) > 0) {
                exchangeFunc(arr, L, R);
                p1 = arr[L];
                p2 = arr[R];
            }

            // Setting l, k, g indices at leftmost/rightmost possible positions before boundaries.
            l = L + 1;
            k = l;
            g = R - 1;

            while (k <= g) {
                // If an element is less than the pivot 1 put it to the left.
                if (compareFunc(arr[k], p1) < 0) {
                    exchangeFunc(arr, k, l);
                    l++;
                    /*
                        Else if the considering element (k) is greater than the pivot 2, find the rightmost element 
                        that not greater than the pivot 2 and exchange those elements.

                        If the element on considering position (k) is less than the pivot 1, put it to the left.
                    */
                } else if (compareFunc(arr[k], p2) > 0) {
                    while (compareFunc(arr[g], p2) > 0 && k < g) {
                        g--;
                    }

                    exchangeFunc(arr, k, g);
                    g--;

                    if (compareFunc(arr[k], p1) < 0) {
                        exchangeFunc(arr, k, l);
                        l++;
                    }
                }

                k++;
            }

            l--;
            g++;

            // Put pivot elements on correct places (they were on the boundaries of considering area).
            exchangeFunc(arr, L, l);
            exchangeFunc(arr, R, g);

            // Finally, switch to considering smaller subarrays.
            stack.push([L, l - 1]);
            stack.push([l + 1, g - 1]);
            stack.push([g + 1, R]);
        }

        return arr;
    };

    /** 
     * A hybrid sorting algorithm: quicksort crossover to heapsort. 
     * 
     * When the depth of recursion in top-down quicksort
     * becomes greater than a 2log(n), where n is the input array length, it switches to heapsort to guarantee save O(n*log(n)) runtime.
     * In this implementation the dual-pivot quicksort algorithm (by V. Yaroslavsky, 2009) is used.
     * 
     * @param {Array} arr Input array.
     * @param {compareFunc=} compareFunc Compares two values and returns a numeric result.
     * @param {exchangeFunc=} exchangeFunc Exchanges two elements of input array receiveing the array and two indices as parameters.
     * @param {insertFunc=} insertFunc Inserts a value into array into given position.
     * @returns {Array} Sorted input array.
     */
    Sorting.introSort = function(arr, compareFunc, exchangeFunc, insertFunc) {
        var ind, R, L, l, k, g, p1, p2,
            depth = Math.log(arr.length) * 2,
            stack = [
                [0, arr.length - 1]
            ],
            insertionsort = insertionSortWorker,
            heapsort = heapSortWorker;

        while (stack.length > 0) {
            /*
                Getting left and right boundaries of a subarray.
            */
            ind = stack.pop();
            L = ind[0];
            R = ind[1];
            /*
                Switching to insertion sort if the subarray is too small.
            */
            if (R <= L) continue;
            if (R - L < 27) {
                insertionsort(arr, L, R, compareFunc, insertFunc);
                continue;
            }
            /*
                Switching to the heapsort because maximal recursion depth was exceeded.
            */
            if (depth < 0) {
                heapsort(arr, L, R, compareFunc, exchangeFunc);
                continue;
            }
            /*
                Setting elements on boundaries of the considering subarray as pivots 1 and 2.
            */
            p1 = arr[L];
            p2 = arr[R];
            /*
                If pivots are in wrong order, exchange their values.
            */
            if (compareFunc(p1, p2) > 0) {
                exchangeFunc(arr, L, R);
                p1 = arr[L];
                p2 = arr[R];
            }
            /*
                Setting l, k, g indices at leftmost/rightmost possible positions before boundaries.
            */
            l = L + 1;
            k = l;
            g = R - 1;

            while (k <= g) {
                /*
                    If an element is less than the pivot 1 put it to the left.
                */
                if (compareFunc(arr[k], p1) < 0) {
                    exchangeFunc(arr, k, l);
                    l++;
                    /*
                        Else if the considering element (k) is greater than the pivot 2:
                        find the rightmost element that not greater than the pivot 2
                        and exchange those elements.
                        If the element on considering position (k) is less than the pivot 1, put it to the left.
                    */
                } else if (compareFunc(arr[k], p2) > 0) {
                    while (compareFunc(arr[g], p2) > 0 && k < g) {
                        g--;
                    }

                    exchangeFunc(arr, k, g);
                    g--;

                    if (compareFunc(arr[k], p1) < 0) {
                        exchangeFunc(arr, k, l);
                        l++;
                    }
                }

                k++;
            }

            l--;
            g++;
            /*
                Put pivot elements on correct places (they were on the boundaries of considering area)
            */
            exchangeFunc(arr, L, l);
            exchangeFunc(arr, R, g);
            /*
                Finally, switch to considering smaller subarrays.
            */
            stack.push([L, l - 1]);
            stack.push([l + 1, g - 1]);
            stack.push([g + 1, R]);
            /*
                Increase the recursion depth counter.
            */
            depth--;
        }

        return arr;
    };

    /** 
     * Simple bottom-up mergesort algorithm implementation which uses two auxiliary arrays as buffers for merging.
     * 
     * @param {Array} arr Input array.
     * @param {compareFunc=} compareFunc Compares two values and returns a numeric result.
     * @param {exchangeFunc=} exchangeFunc Exchanges two elements of input array receiveing the array and two indices as parameters.
     * @param {insertFunc=} insertFunc Inserts a value into array into given position.
     * @returns {Array} Sorted input array.
     */
    Sorting.mergeSort = function(arr, compareFunc, exchangeFunc, insertFunc) {
        var l = arr.length,
            step, subL, subR,
            R = [], L = [],
            sentinel = Infinity;

        /**
         * Merges two subarrays using two auxiliary arrays as buffers.
         * @param {number} ll The leftmost index of 1st subarray.
         * @param {number} lr The rightmost index of 1st subarray.
         * @param {number} rl The leftmost index of 2nd subarray.
         * @param {number} rr The rightmost index of 2nd subarray.
         */
        var mergeSubarrays = function(ll, lr, rl, rr) {
            var i, j, k,
                Rlen = rr - rl + 1,
                Llen = lr - ll + 1;

            // Copy elements to buffers.
            for (i = 0, j = ll; i < Llen - 1; i++, j++) {
                L[i] = arr[j];
            }

            for (i = 0, j = rl; i < Rlen - 1; i++, j++) {
                R[i] = arr[j];
            }
            /*
                Set sentinel values at buffers' ends. It is necessary to identify the buffer's end
                and stop reading from that buffer.
            */
            L[Llen - 1] = sentinel;
            R[Rlen - 1] = sentinel;
            /*
                Choose the smallest value element from two buffers on each iteration and
                write it into the sorting array.
            */
            for (i = ll, j = 0, k = 0; i < rr; i++) {
                if (compareFunc(L[j], R[k]) <= 0) {
                    insertFunc(L[j], arr, i);
                    j++;
                } else {
                    insertFunc(R[k], arr, i);
                    k++;
                }
            }
        };

        /*
            Starting merge process from smallest possible subarrays (single element ones),
            then increasing subarrays sizes by 2 times each iteration.
        */
        for (step = 1; step < l; step *= 2) {
            subL = 0;
            subR = step;

            /*
                While it's possible to find pairs of subarrays of equal sizes, merging them.
            */
            while (subR + step < l) {
                mergeSubarrays(subL, subL + step, subR, subR + step);

                subL = subR + step;
                subR = subL + step;
            }

            /*
                If it is not possible to find pairs of subarrays of equal sizes, merging first 
                found subarray with the rest of elements.
            */
            if (subR < l) {
                mergeSubarrays(subL, subL + step, subR, l);
            }
        }

        return arr;
    };

    /** 
     * A bottom-up in-place mergesort algorithm implementation. It uses rotation technique to satisfy in-place condition.
     * 
     * @param {Array} arr Input array.
     * @param {compareFunc=} compareFunc Compares two values and returns a numeric result.
     * @param {exchangeFunc=} exchangeFunc Exchanges two elements of input array receiveing the array and two indices as parameters.
     * @param {insertFunc=} insertFunc Inserts a value into array into given position.
     * @returns {Array} Sorted input array.
     */
    Sorting.mergeInPlaceSort = function(arr, compareFunc, exchangeFunc, insertFunc) {
        var step = 16,
            subL, subR, nextR,
            l = arr.length,
            floor = Math.floor,
            flip = flipElementsOfArray,
            searchleft = BinarySearch.left,
            searchright = BinarySearch.right,
            insertionsort = insertionSortWorker;

        /**
         * Rotates the subarray. The result looks like a cycle shift of subarray performed by 
         * moving its left boundary to given position (rotation point).
         * @param {number} mid Rotation point index.
         * @param {number} from Left boundary of subarray.
         * @param {number} to Right boundary of subarray.
         */
        var rotateByPoint = function(mid, from, to) {
            flip(arr, from, mid - 1, exchangeFunc);
            flip(arr, mid, to - 1, exchangeFunc);
            flip(arr, from, to - 1, exchangeFunc);
        };

        /**
         * Merges two subarrays using rotation technique.
         * @param {number} from The leftmost index of 1st subarray.
         * @param {number} p The rightmost index of 1st subarray.
         * @param {number} to The rightmost index of 2nd subarray.
         * @param {number} len1 The size of 1st subarray.
         * @param {number} len2 The size of 2nd subarray.
         */
        var mergeSubarraysRotating1 = function(from, p, to, len1, len2) {
            /*
                If any of subarrays is empty, stop merging.
                If there are only two elements to merge, just set 
                them in correct order.
            */
            if (len1 == 0 || len2 == 0) return;
            if (len1 + len2 == 2) {
                if (compareFunc(arr[p], arr[from]) < 0) {
                    exchangeFunc(arr, p, from);
                }
                return;
            }

            var cut1, cut2, len11, len22, mid2;
            /*
                Reducing the area of consideration by searching for the value 
                from a middle of one subarray in another subarray.
            */
            if (len1 > len2) {
                len11 = floor(len1 / 2);
                cut1 = from + len11;
                cut2 = searchleft(arr[cut1], arr, p, to, compareFunc);
                len22 = cut2 - p;
            } else {
                len22 = floor(len2 / 2);
                cut2 = p + len22;
                cut1 = searchright(arr[cut2], arr, from, p, compareFunc);
                len11 = cut1 - from;
            }
            /*
                Rotating a part of elements to correct position and further 
                reducing the area of consideration.
            */
            rotateByPoint(p, cut1, cut2);

            mid2 = cut1 + len22;

            mergeSubarraysRotating1(from, cut1, mid2, len11, len22);
            mergeSubarraysRotating1(mid2, cut2, to, len1 - len11, len2 - len22);
        };

        subL = 0;
        subR = step;

        // Insertion sorting small subarrays first.
        while (subR <= l) {
            insertionsort(arr, subL, subR - 1, compareFunc, insertFunc);

            subL = subR;
            subR += step;
        }

        if (subL < l) {
            insertionsort(arr, subL, l - 1, compareFunc, insertFunc);
        }
        /*
            Starting merge process from already sorted subarrays,
            then increasing subarrays sizes by 2 times each iteration.
        */
        for (; step < l; step *= 2) {
            subL = 0;
            subR = step;
            nextR = subR + step;

            // While it's possible to find pairs of subarrays of equal sizes, merging them.
            while (nextR < l) {
                /*
                    If the last element of right subarray is less than first element of left subarray,
                    its faster to just rotate those subarrays around their common point.
                    In other case, merge subarrays in usual way.
                */
                if (compareFunc(arr[nextR - 1], arr[subL]) < 0) {
                    rotateByPoint(subR, subL, nextR);
                } else {
                    mergeSubarraysRotating1(subL, subR, nextR, subR - subL, nextR - subR);
                }

                subL = nextR;
                subR = subL + step;
                nextR = subR + step;
            }
            /*
                If it is not possible to find pairs of subarrays of equal sizes, merging first 
                found subarray with the rest of elements.
            */
            if (subR < l) {
                if (compareFunc(arr[l - 1], arr[subL]) < 0) {
                    rotateByPoint(subR, subL, l);
                } else {
                    mergeSubarraysRotating1(subL, subR, l, subR - subL, l - subR);
                }
            }
        }

        return arr;
    };

    /** 
     * An adaptive bottom-up in-place mergesort algorithm implementation. It uses fix-sized cache, block swaps, rotations and inner buffers to satisfy in-place condition.
     * 
     * Briefly, on each level of sort, the algorythm splits the input array on group of almost equal subarrays of two kind (blocks A and blocks B);
     * then if cache size doesn't allow to merge blocks directly, the algorithm establishes one or two blocks as buffers and moves first met 
     * unique array's values there;
     * then first elements of each A block exchanges with first buffer elements in-order (tagging blocks) and merging of each pair of A and B blocks 
     * happens (using the second buffer);
     * then the second buffer gets sorted by insertion sort, after that unique values from buffer move back to their places.
     * 
     * The algorithm is based on: <https://github.com/BonzaiThePenguin/WikiSort/blob/master/WikiSort.java>.
     * To learn more: <https://github.com/BonzaiThePenguin/WikiSort/blob/master/README.md>.
     * 
     * @param {Array} arr Input array.
     * @param {compareFunc=} compareFunc Compares two values and returns a numeric result.
     * @param {exchangeFunc=} exchangeFunc Exchanges two elements of input array receiveing the array and two indices as parameters.
     * @param {insertFunc=} insertFunc Inserts a value into array into given position.
     * @returns {Array} Sorted input array.
     */
    Sorting.blockSort = function(arr, compareFunc, exchangeFunc, insertFunc) {
        var step = 16,
            l = arr.length,
            iterator,
            buffer1, buffer2, blockA, blockB,
            lastA, lastB, firstA, range, rangeA, rangeB, pull,
            blockSize, bufferSize,
            index, last, count, pullIndex,
            find, findSep, cmp,
            start, bSplit, bRem, indexA, minA, findA,
            unique, buffer, amount,
            cacheInfo = {
                size: 512,
                cache: []
            },
            min = Math.min,
            floor = Math.floor,
            sqrt = Math.sqrt,
            flip = flipElementsOfArray,
            findFF = BinarySearch.firstForward,
            findFB = BinarySearch.firstBackward,
            findLF = BinarySearch.lastForward,
            findLB = BinarySearch.lastBackward,
            searchleft = BinarySearch.left,
            searchright = BinarySearch.right,
            copyarr = writeOneArrayToAnother,
            copyarrd = writeOneArrayToAnotherDownwards,
            insertionsort = insertionSortWorker;

        /**
         * Exchanges subarrays' values.
         * @param {number} startA The leftmost index of 1st subarray.
         * @param {number} startB The leftmost index of 2nd subarray.
         * @param {number} l The amount of values to exchange. 
         */
        var swapSubarrays = function(startA, startB, l) {
            for (var i = 0; i < l; i++) {
                exchangeFunc(arr, startA + i, startB + i);
            }
        };

        /**
         * Rotates the subarray. The result looks like a cycle shift of subarray by given amount.
         * @param {number} amount The amount of shift.
         * @param {number} from Left boundary of subarray.
         * @param {number} to Right boundary of subarray.
         * @param {boolean} noCache Using cache is restricted.
         */
        var rotate = function(amount, from, to, noCache) {
            var split, l1, l2;

            if (amount >= 0) {
                split = from + amount;
            } else {
                split = to + amount;
            }

            // If using cache is allowed, it would be faster to use it.
            if (!noCache) {
                l1 = split - from;
                l2 = to - split;

                if (l1 <= l2) {
                    if (l1 <= cacheInfo.size) {
                        copyarr(arr, cacheInfo.cache, from, split - 1, 0);
                        copyarr(arr, arr, split, to - 1, from);
                        copyarr(cacheInfo.cache, arr, 0, l1 - 1, from + l2);
                        return;
                    }
                } else {
                    if (l2 <= cacheInfo.size) {
                        copyarr(arr, cacheInfo.cache, split, to - 1, 0);
                        copyarrd(arr, arr, split - 1, from, to - 1);
                        copyarr(cacheInfo.cache, arr, 0, l2 - 1, from);
                        return;
                    }
                }
            }

            flip(arr, from, split - 1, exchangeFunc);
            flip(arr, split, to - 1, exchangeFunc);
            flip(arr, from, to - 1, exchangeFunc);
        };

        /**
         * Merges two subarrays using the buffer within the array (internal buffer).
         * @param {number} from The leftmost index of 1st subarray.
         * @param {number} p The rightmost index of 1st subarray.
         * @param {number} to The rightmost index of 2nd subarray. 
         * @param {number} bufFrom The leftmost index of internal buffer.
         * @param {number} bufTo The rightmost index of internal buffer.
         */
        var mergeInternal = function(from, p, to, bufFrom, bufTo) {
            var aLen = p - from,
                bLen = to - p,
                aCount = 0,
                bCount = 0,
                i = 0;
            /*
                The buffer already contains values to merge with the 2nd subarray.
                If the value from buffer is less than one from 2nd subarray,
                we put that value to the 1st subarray (by exchange), in other case 
                we put the value from the 2nd subarray to the 1st subaray (also by exchange).
            */
            if (aLen > 0 && bLen > 0) {
                while (true) {
                    if (compareFunc(arr[p + bCount], arr[bufFrom + aCount]) >= 0) {
                        exchangeFunc(arr, from + i, bufFrom + aCount);
                        aCount++;
                        i++;
                        if (aCount >= aLen) {
                            break;
                        }
                    } else {
                        exchangeFunc(arr, from + i, p + bCount);
                        bCount++;
                        i++;
                        if (bCount >= bLen) {
                            break;
                        }
                    }
                }
            }

            // Swap the remainder of buffer's content into the final array.
            swapSubarrays(bufFrom + aCount, from + i, aLen - aCount);
        };

        /**
         * Merges two subarrays using cache as buffer.
         * @param {number} from The leftmost index of 1st subarray.
         * @param {number} p The rightmost index of 1st subarray.
         * @param {number} to The rightmost index of 2nd subarray. 
         */
        var mergeExternal = function(from, p, to) {
            var cl = 0,
                al = p,
                i = from,
                cr = p - from - 1,
                ar = to - 1,
                cache = cacheInfo.cache;

            // Choose the smallest value element and write it into the final array.
            while (cl <= cr && al <= ar) {
                if (compareFunc(cache[cl], arr[al]) <= 0) {
                    insertFunc(cache[cl], arr, i);
                    cl++;
                } else {
                    insertFunc(arr[al], arr, i);
                    al++;
                }

                i++;
            }

            // Copy the remainder into the final array.
            if (cl <= cr) {
                copyarr(cache, arr, cl, cr, i);
            }
        };

        /**
         * Merges two subarrays using rotation technique.
         * @param {number} from The leftmost index of 1st subarray.
         * @param {number} p The rightmost index of 1st subarray.
         * @param {number} to The rightmost index of 2nd subarray.
         * @param {number} len1 The size of 1st subarray.
         * @param {number} len2 The size of 2nd subarray.
         */
        var mergeSubarraysRotating2 = function(from, p, to, len1, len2) {
            var mid, rot;

            // If any of subarrays is empty, stop merging.
            if (len1 == 0 || len2 == 0) return;

            while (true) {
                /*
                    Reducing the area of consideration by searching for the value 
                    from a beginning of one subarray in another subarray.
                */
                mid = searchleft(arr[from], arr, p, to, compareFunc);
                /*
                    Rotating a part of elements to correct position and further 
                    reducing the area of consideration.
                */
                rot = mid - p;
                rotate(-rot, from, mid);

                // The second subarray is empty, stop merging.
                if (mid == to) {
                    break;
                }

                from = searchright(arr[rot + from], arr, from, p, compareFunc);
                p = mid;

                len1 = p - from;
                len2 = to - p;

                // The first subarray is empty, stop merging.
                if (len1 == 0) {
                    break;
                }
            }
        };

        /*
            If the input array is too small, insertion sort it immediately.
        */
        if (l < step) {
            return insertionsort(arr, 0, l - 1, compareFunc, insertFunc);
        }

        iterator = new StepIterator(l, step);
        buffer1 = new Subarray();
        buffer2 = new Subarray();
        blockA = new Subarray();
        blockB = new Subarray();
        lastA = new Subarray();
        lastB = new Subarray();
        firstA = new Subarray();
        pull = [new Pull(), new Pull()];
        /*
            Preparing small sorted subarrays for further merging.
        */
        while (!iterator.finished()) {
            rangeA = iterator.nextRange(); // .nextRange() returns the instance of Subarray class
            insertionsort(arr, rangeA.from, rangeA.to - 1, compareFunc, insertFunc);
        }

        while (true) {
            /*
                If every A and B block will fit into the cache, use a special 
                branch specifically for merging with the cache.
            */
            if (iterator.length() < cacheInfo.size) {
                iterator.begin();

                while (!iterator.finished()) {
                    rangeA = iterator.nextRange();
                    rangeB = iterator.nextRange();
                    /*
                        If subarrays are in reverse order, its faster to just rotate them.
                        In other case, merge subarrays using cache as buffer.
                    */
                    if (compareFunc(arr[rangeB.to - 1], arr[rangeA.from]) < 0) {
                        rotate(rangeA.length(), rangeA.from, rangeB.to);
                    } else if (compareFunc(arr[rangeA.to - 1], arr[rangeA.to]) > 0) {
                        copyarr(arr, cacheInfo.cache, rangeA.from, rangeA.to - 1, 0);
                        mergeExternal(rangeA.from, rangeA.to, rangeB.to);
                    }
                }
            } else {
                /* 
                    In-place merge logic is following:
			        1. Pull out two internal buffers each containing √A unique values.
			        1a. Adjust blockSize and bufferSize if we couldn't find enough unique values.
			        2. Loop over the A and B subarrays within this level of the merge sort.
			        3. Break A and B into blocks of size 'blockSize'.
			        4. "Tag" each of the A blocks with values from the first internal buffer.
			        5. Roll the A blocks through the B blocks and drop/rotate them where they belong.
			        6. Merge each A block with any B values that follow, using the cache or the second internal buffer.
			        7. Sort the second internal buffer if it exists.
                    8. Redistribute the two internal buffers back into the array.
                */
                blockSize = floor(sqrt(iterator.length()));
                bufferSize = floor(iterator.length() / blockSize) + 1;
                index = last = count = pullIndex = 0;

                buffer1.set(0, 0);
                buffer2.set(0, 0);
                pull[0].reset();
                pull[1].reset();

                // Find two internal buffers of size 'bufferSize' each.
                find = bufferSize + bufferSize;
                findSep = false;

                if (blockSize <= cacheInfo.size) {
                    /* 
                        If every A block fits into the cache then the second internal buffer is not necessary,
                        so we really only need to find 'bufferSize' unique values.
                    */
                    find = bufferSize;
                } else if (find > iterator.length()) {
                    // We can't fit both buffers into the same A or B subarray, so find two buffers separately.
                    find = bufferSize;
                    findSep = true;
                }
                /* 
                    Part 1: finding unique values, getting buffers and pulling unique values into them.
                    In the case where it couldn't find a single buffer of at least √A unique values,
				    All of the Merge steps must be replaced by a different merge algorithm (mergeSubarraysRotating2)
                */
                iterator.begin();

                while (!iterator.finished()) {
                    rangeA = iterator.nextRange();
                    rangeB = iterator.nextRange();
                    /*
                        Check A for the number of unique values we need to fill an internal buffer.
                        These values will be pulled out to the start of A.
                    */
                    for (last = rangeA.from, count = 1; count < find; last = index, count++) {
                        index = findLF(arr[last], arr, last + 1, rangeA.to, find - count, compareFunc);
                        if (index == rangeA.to) {
                            break;
                        }
                    }
                    index = last;

                    if (count >= bufferSize) {
                        // Keep track of the range within the array where we'll need to "pull out" these values to create the internal buffer.
                        pull[pullIndex].range.set(rangeA.from, rangeB.to);
                        pull[pullIndex].count = count;
                        pull[pullIndex].from = index;
                        pull[pullIndex].to = rangeA.from;
                        pullIndex = 1;

                        if (count == bufferSize + bufferSize) {
                            /* 
                                We were able to find a single contiguous section containing 2√A unique values,
                                so this section can be used to contain both of the internal buffers we'll need.
                            */
                            buffer1.set(rangeA.from, rangeA.from + bufferSize);
                            buffer2.set(rangeA.from + bufferSize, rangeA.from + count);
                            break;
                        } else if (find == bufferSize + bufferSize) {
                            /* 
                                We found a buffer that contains at least √A unique values, but did not contain the full 2√A unique values,
                                so we still need to find a second separate buffer of at least √A unique values.
                            */
                            buffer1.set(rangeA.from, rangeA.from + count);
                            find = bufferSize;
                        } else if (blockSize <= cacheInfo.size) {
                            // We found the first and only internal buffer that we need, so we're done!
                            buffer1.set(rangeA.from, rangeA.from + count);
                            break;
                        } else if (findSep) {
                            // Found one buffer, but now find the other one.
                            buffer1 = new Subarray(rangeA.from, rangeA.from + count);
                            findSep = false;
                        } else {
                            // We found a second buffer in an 'A' subarray containing √A unique values, so we're done!
                            buffer2.set(rangeA.from, rangeA.from + count);
                            break;
                        }
                    } else if (pullIndex == 0 && count > buffer1.length()) {
                        // Keep track of the largest buffer we were able to find.
                        buffer1.set(rangeA.from, rangeA.from + count);

                        pull[pullIndex].range.set(rangeA.from, rangeB.to);
                        pull[pullIndex].count = count;
                        pull[pullIndex].from = index;
                        pull[pullIndex].to = rangeA.from;
                    }
                    /*
                        Check B for the number of unique values we need to fill an internal buffer.
                        These values will be pulled out to the start of B.
                    */
                    for (last = rangeB.to - 1, count = 1; count < find; last = index - 1, count++) {
                        index = findFB(arr[last], arr, rangeB.from, last, find - count, compareFunc);
                        if (index == rangeB.from) {
                            break;
                        }
                    }
                    index = last;

                    if (count >= bufferSize) {
                        pull[pullIndex].range.set(rangeA.from, rangeB.to);
                        pull[pullIndex].count = count;
                        pull[pullIndex].from = index;
                        pull[pullIndex].to = rangeB.to;
                        pullIndex = 1;

                        if (count == bufferSize + bufferSize) {
                            buffer1.set(rangeB.to - count, rangeB.to - bufferSize);
                            buffer2.set(rangeB.to - bufferSize, rangeB.to);
                            break;
                        } else if (find == bufferSize + bufferSize) {
                            buffer1.set(rangeB.to - count, rangeB.to);
                            find = bufferSize;
                        } else if (blockSize <= cacheInfo.size) {
                            buffer1.set(rangeB.to - count, rangeB.to);
                            break;
                        } else if (findSep) {
                            buffer1 = new Subarray(rangeB.to - count, rangeB.to);
                            findSep = false;
                        } else {
                            /* 
                                Buffer2 will be pulled out from a 'B' subarray, so if the first buffer was pulled out from the corresponding 'A' subarray,
                                we need to adjust the end point for that A subarray so it knows to stop redistributing its values before reaching buffer2.
                            */
                            if (pull[0].range.from == rangeA.from) {
                                pull[0].range.to -= pull[1].count;
                            }

                            // We found a second buffer in an 'B' subarray containing √A unique values, so we're done!
                            buffer2.set(rangeB.to - count, rangeB.to);
                            break;
                        }
                    } else if (pullIndex == 0 && count > buffer1.length()) {
                        buffer1.set(rangeB.to - count, rangeB.to);

                        pull[pullIndex].range.set(rangeA.from, rangeB.to);
                        pull[pullIndex].count = count;
                        pull[pullIndex].from = index;
                        pull[pullIndex].to = rangeB.to;
                    }
                }

                // Pull out the two ranges so we can use them as internal buffers.
                for (pullIndex = 0; pullIndex < 2; pullIndex++) {
                    l = pull[pullIndex].count;
                    cmp = pull[pullIndex].to - pull[pullIndex].from;

                    if (cmp < 0) {
                        // We're pulling the values out to the left, which means the start of an A subarray.
                        for (index = pull[pullIndex].from, count = 1; count < l; count++) {
                            index = findFB(arr[index - 1], arr, pull[pullIndex].to, pull[pullIndex].from - count + 1, l - count, compareFunc);
                            range = new Subarray(index + 1, pull[pullIndex].from + 1);

                            rotate(range.length() - count, range.from, range.to);

                            pull[pullIndex].from = index + count;
                        }
                    } else if (cmp > 0) {
                        // We're pulling values out to the right, which means the end of a B subarray.
                        for (index = pull[pullIndex].from + 1, count = 1; count < l; count++) {
                            index = findLF(arr[index], arr, index, pull[pullIndex].to, l - count, compareFunc);
                            range = new Subarray(pull[pullIndex].from, index - 1);

                            rotate(count, range.from, range.to);

                            pull[pullIndex].from = index - 1 - count;
                        }
                    }
                }

                // Part 2: tagging A blocks, merging tagged A blocks with following B blocks values.

                // Adjust blockSize and bufferSize based on the values we were able to pull out.
                bufferSize = buffer1.length();
                blockSize = floor(iterator.length() / bufferSize) + 1;

                iterator.begin();
                /* 
                    Now that the two internal buffers have been created, it's time to merge 
                    each A+B combination at this level of the merge sort!
                */
                while (!iterator.finished()) {
                    rangeA = iterator.nextRange();
                    rangeB = iterator.nextRange();

                    start = rangeA.from;

                    // Remove any parts of A or B that are being used by the internal buffers.
                    if (start == pull[0].range.from) {
                        cmp = pull[0].from - pull[0].to;

                        if (cmp > 0) {
                            rangeA.from += pull[0].count;
                            /* 
                                If the internal buffer takes up the entire A or B subarray, then there's nothing to merge.
							    This only happens for very small subarrays, like √4 = 2, 2 * (2 internal buffers) = 4,
                                which also only happens when cache size is small or 0 since it'd otherwise use MergeExternal.
                            */
                            if (rangeA.length() == 0) continue;
                        } else if (cmp < 0) {
                            rangeB.to -= pull[0].count;
                            if (rangeB.length() == 0) continue;
                        }
                    }

                    if (start == pull[1].range.from) {
                        cmp = pull[1].from - pull[1].to;

                        if (cmp > 0) {
                            rangeA.from += pull[1].count;
                            if (rangeA.length() == 0) continue;
                        } else if (cmp < 0) {
                            rangeB.to -= pull[1].count;
                            if (rangeB.length() == 0) continue;
                        }
                    }

                    if (compareFunc(arr[rangeB.to - 1], arr[rangeA.from]) < 0) {
                        rotate(rangeA.length(), rangeA.from, rangeB.to);
                    } else if (compareFunc(arr[rangeA.to - 1], arr[rangeA.to]) > 0) {
                        // Break the remainder of A into blocks. firstA is the uneven-sized first A block.
                        blockA.set(rangeA.from, rangeA.to);
                        firstA.set(rangeA.from, rangeA.from + blockA.length() % blockSize);

                        // Swap the first value of each A block with the value in buffer1.
                        for (indexA = buffer1.from, index = firstA.to; index < blockA.to; index += blockSize) {
                            exchangeFunc(arr, indexA, index);
                            indexA++;
                        }
                        /* 
                            Start rolling the A blocks through the B blocks.
                            Whenever we leave an A block behind, we'll need to merge the previous A block 
                            with any B blocks that follow it, so track that information as well.
                        */
                        lastA.set(firstA.from, firstA.to);
                        lastB.set(0, 0);

                        blockB.set(rangeB.from, rangeB.from + min(blockSize, rangeB.length()));
                        blockA.from += firstA.length();
                        /* 
                            If the first unevenly sized A block fits into the cache, copy it there for when we go to merge it.
                            Otherwise, if the second buffer is available, block swap the contents into that.
                        */
                        if (lastA.length() <= cacheInfo.size) {
                            copyarr(arr, cacheInfo.cache, lastA.from, lastA.to - 1, 0);
                        } else if (buffer2.length() > 0) {
                            swapSubarrays(lastA.from, buffer2.from, lastA.length());
                        }

                        indexA = buffer1.from;

                        if (blockA.length() > 0) {
                            while (true) {
                                /* 
                                    If there's a previous B block and the first value of the minimum A block is <= the last value of the previous B block,
                                    then drop that minimum A block behind. Or if there are no B blocks left then keep dropping the remaining A blocks.
                                */
                                if ((lastB.length() > 0 && compareFunc(arr[lastB.to - 1], arr[indexA]) >= 0) || blockB.length() == 0) {
                                    // Figure out where to split the previous B block, and rotate it at the split.
                                    bSplit = searchleft(arr[indexA], arr, lastB.from, lastB.to, compareFunc);
                                    bRem = lastB.to - bSplit;

                                    // Swap the minimum A block to the beginning of the rolling A blocks.
                                    minA = blockA.from;
                                    for (findA = minA + blockSize; findA < blockA.to; findA += blockSize) {
                                        if (compareFunc(arr[findA], arr[minA]) < 0) {
                                            minA = findA;
                                        }
                                    }
                                    swapSubarrays(minA, blockA.from, blockSize);
                                    // Swap the first item of the previous A block back with its original value, which is stored in buffer1.
                                    exchangeFunc(arr, blockA.from, indexA);

                                    indexA++;
                                    /* 
                                        Locally merge the previous A block with the B values that follow it.
									    If lastA fits into the external cache we'll use that (with MergeExternal),
									    or if the second internal buffer exists we'll use that (with MergeInternal),
                                        or failing that we'll use a strictly in-place merge algorithm (mergeSubarraysRotating2).
                                    */
                                    if (lastA.length() <= cacheInfo.size) {
                                        mergeExternal(lastA.from, lastA.to, bSplit);
                                    } else if (buffer2.length() > 0) {
                                        mergeInternal(lastA.from, lastA.to, bSplit, buffer2.from, buffer2.to);
                                    } else {
                                        mergeSubarraysRotating2(lastA.from, lastA.to, bSplit, lastA.length(), bSplit - lastA.to);
                                    }

                                    if (buffer2.length() > 0 || blockSize <= cacheInfo.size) {
                                        // Copy the previous A block into the cache or buffer2, since that's where we need it to be when we go to merge it anyway.
                                        if (blockSize <= cacheInfo.size) {
                                            copyarr(arr, cacheInfo.cache, blockA.from, blockA.from + blockSize - 1, 0);
                                        } else {
                                            swapSubarrays(blockA.from, buffer2.from, blockSize);
                                        }
                                        /* 
                                            This is equivalent to rotating, but faster.
										    The area normally taken up by the A block is either the contents of buffer2, or data we don't need anymore since we memcopied it.
                                            Either way, we don't need to retain the order of those items, so instead of rotating we can just block swap B to where it belongs.
                                        */
                                        swapSubarrays(bSplit, blockA.from - bRem + blockSize, bRem);
                                    } else {
                                        // We are unable to use the 'buffer2' trick to speed up the rotation operation since buffer2 doesn't exist, so perform a normal rotation.
                                        rotate(blockA.from - bSplit, bSplit, blockA.from + blockSize);
                                    }

                                    // Update the range for the remaining A blocks, and the range remaining from the B block after it was split.
                                    lastA.set(blockA.from - bRem, blockA.from + blockSize - bRem);
                                    lastB.set(lastA.to, lastA.to + bRem);

                                    blockA.from += blockSize;

                                    // If there are no more A blocks remaining, this step is finished!
                                    if (blockA.length() == 0) {
                                        break;
                                    }
                                } else if (blockB.length() < blockSize) {
                                    /*
                                        Move the last B block, which is unevenly sized, to before the remaining A blocks, by using a rotation.
                                        The cache is disabled here since it might contain the contents of the previous A block.
                                    */
                                    rotate(-blockB.length(), blockA.from, blockB.to, true);

                                    lastB.set(blockA.from, blockA.from + blockB.length());

                                    blockA.from += blockB.length();
                                    blockA.to += blockB.length();
                                    blockB.to = blockB.from;
                                } else {
                                    // Roll the leftmost A block to the end by swapping it with the next B block.
                                    swapSubarrays(blockA.from, blockB.from, blockSize);

                                    lastB.set(blockA.from, blockA.from + blockSize);

                                    blockA.from += blockSize;
                                    blockA.to += blockSize;
                                    blockB.from += blockSize;
                                    blockB.to += blockSize;

                                    if (blockB.to > rangeB.to) {
                                        blockB.to = rangeB.to;
                                    }
                                }
                            }
                        }

                        // Merge the last A block with the remaining B values.
                        if (lastA.length() <= cacheInfo.size) {
                            mergeExternal(lastA.from, lastA.to, rangeB.to);
                        } else if (buffer2.length() > 0) {
                            mergeInternal(lastA.from, lastA.to, rangeB.to, buffer2.from, buffer2.to);
                        } else {
                            mergeSubarraysRotating2(lastA.from, lastA.to, rangeB.to, lastA.length(), rangeB.to - lastA.to);
                        }
                    }
                }
                /* 
                    When we're finished with this merge step we should have the one or two internal buffers left over, where the second buffer is all jumbled up.
                    Insertion sort the second buffer, then redistribute the buffers back into the array using the opposite process used for creating the buffer.
                */
                insertionsort(arr, buffer2.from, buffer2.to - 1, compareFunc, insertFunc);

                for (pullIndex = 0; pullIndex < 2; pullIndex++) {
                    unique = pull[pullIndex].count * 2;
                    cmp = pull[pullIndex].from - pull[pullIndex].to;

                    if (cmp > 0) {
                        // The values were pulled out to the left, so redistribute them back to the right.
                        buffer = new Subarray(pull[pullIndex].range.from, pull[pullIndex].range.from + pull[pullIndex].count);

                        while (buffer.length() > 0) {
                            index = findFF(arr[buffer.from], arr, buffer.to, pull[pullIndex].range.to, unique, compareFunc);
                            amount = index - buffer.to;

                            rotate(buffer.length(), buffer.from, index);

                            buffer.from += amount + 1;
                            buffer.to += amount;
                            unique -= 2;
                        }
                    } else if (cmp < 0) {
                        // The values were pulled out to the right, so redistribute them back to the left.
                        buffer = new Subarray(pull[pullIndex].range.to - pull[pullIndex].count, pull[pullIndex].range.to);

                        while (buffer.length() > 0) {
                            index = findLB(arr[buffer.to - 1], arr, pull[pullIndex].range.from, buffer.from, unique, compareFunc);
                            amount = buffer.from - index;

                            rotate(amount, index, buffer.to);

                            buffer.from -= amount;
                            buffer.to -= amount + 1;
                            unique -= 2;
                        }
                    }
                }
            }
            /* 
                Double the size of each A and B subarray that will be merged in the next level
                or finish the sorting process when there is no more levels.
            */
            if (!iterator.nextLevel()) {
                break;
            }
        }

        return arr;
    };

    /** 
     * A hybrid bottom-up mergesort algorithm implementation. First it split the input array on runs (i.e. ordered subarrays) by scanning through array
     * and insertion sorting if necessary. Then runs merge individually according certain rules using galloping technique.
     * 
     * @param {Array} arr Input array.
     * @param {compareFunc=} compareFunc Compares two values and returns a numeric result.
     * @param {exchangeFunc=} exchangeFunc Exchanges two elements of input array receiveing the array and two indices as parameters.
     * @param {insertFunc=} insertFunc Inserts a value into array into given position.
     * @returns {Array} Sorted input array.
     */
    Sorting.timSort = function(arr, compareFunc, exchangeFunc, insertFunc) {
        var l = arr.length,
            i, minrun,
            startIndex = 0,
            lastIndex,
            cmp, isSorted, stack = [],
            cache = [],
            arrX, arrY, arrZ, lenX, lenY, lenZ,
            flip = flipElementsOfArray,
            insertionsort = insertionSortWorker,
            copyArr = writeOneArrayToAnother,
            copyArrDown = writeOneArrayToAnotherDownwards,
            leftSearch = BinarySearch.left,
            rightSearch = BinarySearch.right;

        /**
         * Calculates and returns the minimal size of a run.
         * @param {*} s The length of input sequence.
         * @returns {number} The minimal size of a run.
         */
        var getMinrun = function(s) {
            var r = 0;

            while (s >= 64) {
                // r = r OR (s AND 1)
                r |= s & 1;
                // s = s RIGHT_SHIFT_BY 1
                s >>= 1;
            }

            return s + r;
        };

        /**
         * Merges two subarrays from left to right using cache data and the galloping.
         * @param {number} ll The leftmost index of 1st subarray.
         * @param {number} lr The rightmost index of 1st subarray.
         * @param {number} rl The leftmost index of 2nd subarray.
         * @param {number} rr The rightmost index of 2nd subarray.
         */
        var gallopLeft = function(ll, lr, rl, rr) {
            var i, j, k, llen,
                mingallop = 7,
                z, lastArr;

            llen = lr - ll + 1;

            i = ll;
            j = 0;
            k = rl;
            /*
                Compare elements from left to right from cache and from 
                second subarray and insert the smallest element into first subarray.
                If we read from same subarray more than "mingallop" times,
                the galloping mode is activated. Here the galloping mode is 
                implemented as left-to-right binary search for index of 
                possible point of cache and second subarray's intersection 
                and copying all elements till found index.

                Here intersection means that the value of one subarray can be inserted
                between the boundaries of another one.

                More often we read from different subarrays, less chance 
                the gallop mode will be activated.
            */
            while (j < llen && k <= rr) {
                if (compareFunc(cache[j], arr[k]) <= 0) {
                    if (lastArr == cache) {
                        mingallop--;
                    } else {
                        mingallop++;
                    }

                    insertFunc(cache[j], arr, i);
                    lastArr = cache;

                    if (mingallop <= 0) {
                        mingallop = 7;

                        z = leftSearch(arr[k], cache, j, llen - 1, compareFunc) - 1;
                        copyArr(cache, arr, j, z, i);

                        i += z - j;
                        j = z;
                    }

                    j++;
                } else {
                    if (lastArr == arr) {
                        mingallop--;
                    } else {
                        mingallop++;
                    }

                    insertFunc(arr[k], arr, i);
                    lastArr = arr;

                    if (mingallop <= 0) {
                        mingallop = 7;

                        z = leftSearch(cache[j], arr, k, rr, compareFunc) - 1;
                        copyArr(arr, arr, k, z, i);

                        i += z - k;
                        k = z;
                    }

                    k++;
                }

                i++;
            }

            // Copy remainder into first subarray.
            if (j < llen) {
                copyArr(cache, arr, j, llen - 1, i);
            } else if (k <= rr) {
                copyArr(arr, arr, k, rr, i);
            }
        };

        /**
         * Merges two subarrays from right to left using cache data and the galloping mode.
         * @param {number} ll The leftmost index of 1st subarray.
         * @param {number} lr The rightmost index of 1st subarray.
         * @param {number} rl The leftmost index of 2nd subarray.
         * @param {number} rr The rightmost index of 2nd subarray.
         */
        var gallopRight = function(ll, lr, rl, rr) {
            var i, j, k,
                mingallop = 7,
                z, lastArr;

            i = rr;
            j = rr - rl;
            k = lr;
            /*
                Compare elements from right to left from cache and from 
                first subarray and insert the greatest element into second subarray.
                If we read from same subarray more than "mingallop" times,
                the galloping mode is activated. Here the galloping mode is 
                implemented as right-to-left binary search for index of 
                possible point of cache and first subarray's intersection 
                and copying all elements till found index.

                Here intersection means that the value of one subarray can be inserted
                between the boundaries of another one.

                More often we read from different subarrays, less chance 
                the gallop mode will be activated.
            */
            while (j >= 0 && k >= ll) {
                if (compareFunc(cache[j], arr[k]) >= 0) {
                    if (lastArr == cache) {
                        mingallop--;
                    } else {
                        mingallop++;
                    }

                    insertFunc(cache[j], arr, i);
                    lastArr = cache;

                    if (mingallop <= 0) {
                        mingallop = 7;

                        z = rightSearch(arr[k], cache, 0, j, compareFunc) + 1;
                        copyArrDown(cache, arr, j, z, i);

                        i -= j - z;
                        j = z;
                    }

                    j--;
                } else {
                    if (lastArr == arr) {
                        mingallop--;
                    } else {
                        mingallop++;
                    }

                    insertFunc(arr[k], arr, i);
                    lastArr = arr;

                    if (mingallop <= 0) {
                        mingallop = 7;

                        z = rightSearch(cache[j], arr, ll, k, compareFunc) + 1;
                        copyArrDown(arr, arr, k, z, i);

                        i -= k - z;
                        k = z;
                    }

                    k--;
                }

                i--;
            }

            // Copy remainder into second subarray.
            if (j >= 0) {
                copyArrDown(cache, arr, j, 0, i);
            } else if (k >= ll) {
                copyArrDown(arr, arr, k, ll, i);
            }
        };

        /**
         * Merges the intersection of two subarrays using left-to-right
         * or right-to-left galloping merge.
         * @param {number} ll The leftmost index of 1st subarray.
         * @param {number} lr The rightmost index of 1st subarray.
         * @param {number} rl The leftmost index of 2nd subarray.
         * @param {number} rr The rightmost index of 2nd subarray.
         */
        var mergeSubarraysGalloped = function(ll, lr, rl, rr) {
            //Considering only an intersection of two subarrays.
            ll = rightSearch(arr[rl], arr, ll, lr, compareFunc);
            rr = leftSearch(arr[lr], arr, rl, rr, compareFunc);

            if (lr - ll <= rr - rl) {
                copyArr(arr, cache, ll, lr, 0);
                gallopLeft(ll, lr, rl, rr);
            } else {
                copyArr(arr, cache, rl, rr, 0);
                gallopRight(ll, lr, rl, rr);
            }
        };

        // Getting minimal run size.
        minrun = getMinrun(l);
        lastIndex = l - 1;

        while (startIndex < lastIndex) {
            // Trying to get the biggest run as possible.
            i = startIndex + 1;

            cmp = compareFunc(arr[startIndex], arr[i]);
            isSorted = true;

            while (cmp == 0 && i < l) {
                cmp = compareFunc(arr[i - 1], arr[i]);
                i++;
            }

            for (; i < l; i++) {
                // If there is out-of-order element.
                if (cmp != compareFunc(arr[i - 1], arr[i])) {
                    /*
                        If we not achieved "minrun" size, we can insertion sort this run later.
                        In other case, stop just right before the element which breaks the order.
                    */
                    if (i <= startIndex + minrun) {
                        isSorted = false;
                        i = startIndex + minrun;
                    } else {
                        i--;
                    }

                    break;
                }
            }

            if (i >= l) {
                i = lastIndex;
            }

            if (isSorted) {
                // Reversing reverse ordered run.
                if (cmp > 0) {
                    flip(arr, startIndex, i, exchangeFunc);
                }
            } else {
                // Insertion sort a run with no order.
                insertionsort(arr, startIndex, i, compareFunc, insertFunc);
            }

            // Pushing runs' positions into stack.
            stack.push([startIndex, i]);
            startIndex = i + 1;
            /* 
                Trying to merge already found runs.
                The idea is to merge runs with closest sizes for maximal efficiency.
            */
            while (stack.length > 1) {
                // Check for last 3 runs. 
                arrX = stack.pop();
                arrY = stack.pop();
                arrZ = stack.pop();

                lenX = arrX[1] - arrX[0] + 1;
                lenY = arrY[1] - arrY[0] + 1;

                // If there are only 2 runs.
                if (!arrZ) {
                    if (lenX > lenY) {
                        mergeSubarraysGalloped(arrY[0], arrY[1], arrX[0], arrX[1]);
                        stack.push([arrY[0], arrX[1]]);
                    } else {
                        stack.push(arrY);
                        stack.push(arrX);
                    }

                    break;
                }

                lenZ = arrZ[1] - arrZ[0] + 1;

                // If run Z is bigger than both runs X and Y and the run X is smallest, don't merge.
                if (lenZ > lenY + lenX && lenY > lenX) {
                    stack.push(arrZ);
                    stack.push(arrY);
                    stack.push(arrX);
                    break;
                } else {
                    if (lenX < lenZ) {
                        // Runs X and Y are most suitable for merge.
                        mergeSubarraysGalloped(arrY[0], arrY[1], arrX[0], arrX[1]);
                        stack.push(arrZ);
                        stack.push([arrY[0], arrX[1]]);
                    } else {
                        // Runs Z and Y are most suitable for merge.
                        mergeSubarraysGalloped(arrZ[0], arrZ[1], arrY[0], arrY[1]);
                        stack.push([arrZ[0], arrY[1]]);
                        stack.push(arrX);
                    }
                }
            }
        }

        if (startIndex == lastIndex) {
            stack.push([startIndex, lastIndex]);
        }

        // Merging remaining runs.
        while (stack.length > 1) {
            arrX = stack.pop();
            arrY = stack.pop();

            mergeSubarraysGalloped(arrY[0], arrY[1], arrX[0], arrX[1]);
            stack.push([arrY[0], arrX[1]]);
        }

        return arr;
    };

    /** 
     * A naive implementation of bucket sort algorithm. Elements from input array distributes into bins and each bin
     * gets sorted by external sorting function. By default, the double-pivot quicksort is used.
     * 
     * @param {Array} arr Input array.
     * @param {compareFunc=} compareFunc Compares two values and returns a numeric result.
     * @param {exchangeFunc=} exchangeFunc Exchanges two elements of input array receiveing the array and two indices as parameters.
     * @param {insertFunc=} insertFunc Inserts a value into array into given position.
     * @param {mapKey=} mapKey Maps the input value to the numeric value (hashes input value).
     * @param {sortFunc=} sortFunc A function to sort an array. By default, the double-pivot quicksort is used.
     * @returns {Array} Sorted input array.
     */
    Sorting.bucketSort = function(arr, compareFunc, exchangeFunc, insertFunc, mapKey, sortFunc) {
        var b, i, j, item, k = 0,
            bucket, buckets = [],
            l = arr.length,
            m = [arr[0], arr[0]];

        // Getting maximal and minimal values in the input array. Its necessary for keys mapping.
        for (i = 1; i < l; i++) {
            item = arr[i];

            if (compareFunc(m[0], item) > 0) {
                m[0] = item;
            } else if (compareFunc(m[1], item) < 0) {
                m[1] = item;
            }
        }
        /* 
            Choosing a number of bins as SQRT(n), where n is the input array length.
            So, each bin would contain average SQRT(n) elements and sorting of each bin would take
            O(n) operations in worst case. Worst-case runtime for the whole algorithm 
            would be O(SQRT(n)*n).
        */
        b = Math.ceil(Math.sqrt(l));
        if (b == 0) b = 1;

        // Distributing elements to bins.
        for (i = l - 1; i >= 0; i--) {
            j = mapKey(arr[i], b, m);

            if (!buckets[j]) {
                buckets[j] = [];
            }

            buckets[j].push(arr[i]);
        }

        // Sorting each bin using external sorting function.
        for (i = 0; i < b; i++) {
            bucket = buckets[i];

            if (!bucket) continue;

            bucket = sortFunc(bucket, compareFunc, exchangeFunc, insertFunc);
        }

        // Copying values from bins to the array in-order.
        for (i = 0; i < b; i++) {
            bucket = buckets[i];

            if (!bucket) continue;

            l = bucket.length;

            for (j = 0; j < l; j++) {
                insertFunc(bucket[j], arr, k);

                k++;
            }
        }

        return arr;
    };

    /** 
     * An implementation of pigeonhole sort algorithm. Elements from input array distributes into pigeonholes corresponding to their keys
     * and each hole contains all values with certain key. Then all elements gets copied from pigeonholes to the array in-order.
     * 
     * @param {Array} arr Input array.
     * @param {compareFunc=} compareFunc Compares two values and returns a numeric result.
     * @param {exchangeFunc=} exchangeFunc Exchanges two elements of input array receiveing the array and two indices as parameters.
     * @param {insertFunc=} insertFunc Inserts a value into array into given position.
     * @param {getKey=} getKey Hashes the input value (by default the input value just returned).
     * @returns {Array} Sorted input array.
     */
    Sorting.pigeonholeSort = function(arr, compareFunc, exchangeFunc, insertFunc, getKey) {
        var i, j, k = 0,
            min = arr[0],
            max = arr[0],
            holes = [],
            hole, l = arr.length,
            key;

        /* 
            Getting maximal and minimal values in the input array.
            Its necessary for getting an optimal amount of holes.
        */
        for (i = 1; i < l; i++) {
            j = arr[i];

            if (compareFunc(j, min) < 0) {
                min = j;
            } else if (compareFunc(j, max) > 0) {
                max = j;
            }
        }

        min = getKey(min);
        max = getKey(max) - min;
        /*
            Put each value into the hole corresponding to its key.
            So each pigeonhole would contain all values with that key.
        */
        for (i = 0; i < l; i++) {
            key = getKey(arr[i]) - min;

            if (!holes[key]) {
                holes[key] = [];
            }

            holes[key].push(arr[i]);
        }

        // Copying values from holes to the array in-order.
        for (i = 0; i <= max; i++) {
            hole = holes[i];

            if (!hole) continue;

            l = hole.length;

            for (j = 0; j < l; j++) {
                insertFunc(hole[j], arr, k);

                k++;
            }
        }

        return arr;
    };

    /** 
     * An implementation of proxmap sort algorithm. It uses an approach similar to counting sort.
     * 
     * @param {Array} arr Input array.
     * @param {compareFunc=} compareFunc Compares two values and returns a numeric result.
     * @param {exchangeFunc=} exchangeFunc Exchanges two elements of input array receiveing the array and two indices as parameters.
     * @param {insertFunc=} insertFunc Inserts a value into array into given position.
     * @param {mapKey=} mapKey Maps the input value to the numeric value (hashes input value).
     * @returns {Array} Sorted input array.
     */
    Sorting.proxmapSort = function(arr, compareFunc, exchangeFunc, insertFunc, mapKey) {
        /*
            Based on: <http://webcache.googleusercontent.com/search?q=cache:http%3A%2F%2Fwww.cs.uah.edu%2F~rcoleman%2FCS221%2FSorting%2FProxMapSort.html>
            HitList - a count of the number of hits at each index in the sorted array.
            Loc - indices in the sorted array calculated using the hash function.
            ProxMap - starting index in the sorted array for each bucket.
            total - an auxiliary variable to store the starting index mentioned above.
        */
        var i, item, l = arr.length,
            hInd, total = 0,
            m = [arr[0], arr[0]],
            outArr = [],
            HitList = [],
            ProxMap = [],
            Loc = [];

        /**
         * Inserts an input value into correct place in a subarray with given boundaries.
         * @param {arrayElement} x The input value.
         * @param {number} startIndex The index of the start of the subarray.
         * @param {number} length The length of the subarray.
         */
        var proxMapInsertionSortWorker = function(x, startIndex, length) {
            var i = startIndex + length - 1;

            // Search for a non-empty element.
            while (outArr[i - 1] === undefined) {
                i--;
            }
            /*
                While the input value is less than a previous value, shift all such previous values
                one step forward and finally insert the input value into correct place.
            */
            while (i > startIndex && compareFunc(x, outArr[i - 1]) < 0) {
                insertFunc(outArr[i - 1], outArr, i);
                i--;
            }

            insertFunc(x, outArr, i);
        };

        // Initialize auxiliary arrays and get maximal and minimal values of the input array.
        for (i = 0; i < l; i++) {
            HitList.push(0);
            ProxMap.push(-1);

            item = arr[i];

            if (compareFunc(m[0], item) > 0) {
                m[0] = item;
            } else if (compareFunc(m[1], item) < 0) {
                m[1] = item;
            }
        }

        for (i = 0; i < l; i++) {
            // Getting a hashed value of the input array's element.
            hInd = mapKey(arr[i], l, m);
            // Save the hashed value for considering element in the "Loc" aux array.
            Loc[i] = hInd;
            // Increase the count of the hashed value's appearance.
            HitList[hInd]++;
        }

        for (i = 0; i < l; i++) {
            // If a value appeared at least once:
            if (HitList[i] > 0) {
                // set the starting index for it and...
                ProxMap[i] = total;
                // ...and increase the starting index by amount of hits.
                total += HitList[i];
            }
        }

        for (i = 0; i < l; i++) {
            /*
                Loc[i] is a hash value for i-th array element.
                Getting a starting index for that hash value.
            */
            hInd = ProxMap[Loc[i]];
            /* 
                If output array doesn't contain any element on such index, inserting an original value 
                from input array. In other case, insertion sorting the output array to insert an original 
                value from input array into correct place.
            */
            if (outArr[hInd] === undefined) {
                insertFunc(arr[i], outArr, hInd);
            } else {
                proxMapInsertionSortWorker(arr[i], hInd, HitList[Loc[i]]);
            }
        }

        return outArr;
    };

    /** 
     * An implementation of the spreadsort algorithm for integers (it is only suitable for input arrays which keys can be represented as integers).
     * 
     * This algorithm distributes the input into n/c partitions at each step, where n is the total number of elements in the input and 
     * c is a small constant. It locates the minimum and maximum values in the input first, and then divides the input into n/c 
     * equal-sized bins. That process repeats recursively until the number of bins is at least the number of elements which means a 
     * transition to the counting sort.
     * 
     * @param {Array} arr Input array.
     * @param {compareFunc=} compareFunc Compares two values and returns a numeric result.
     * @param {exchangeFunc=} exchangeFunc Exchanges two elements of input array receiveing the array and two indices as parameters.
     * @param {insertFunc=} insertFunc Inserts a value into array into given position.
     * @param {getKey=} getKey Hashes the input value (by default the input value just returned).
     * @returns {Array} Sorted input array.
     */
    Sorting.spreadSort = function(arr, compareFunc, exchangeFunc, insertFunc, getKey) {
        // Based on: <https://github.com/boostorg/sort/blob/master/include/boost/sort/spreadsort/detail/integer_sort.hpp>
        var l = arr.length,
            maxSplits = 20,
            logMeanBinSize = 2,
            logMinSplitCount = 9,
            logConst = 2,
            dataSize = 32,
            additionalSort = insertionSortWorker;

        /**
         * Calculates LOG2(n), where n is input value.
         * @param {number} n The input value.
         * @returns {number} LOG2(n), where n is input value.
         */
        var roughLog2 = function(n) {
            var res = 0;

            // Dividing "n" by 2 and increasing "res" counter.
            while ((n >> res) != 0 && res < dataSize) {
                res++;
            }

            return res;
        };

        /**
         * Gets the minimum child bin size to recursively call spreadsort on.
         * @param {number} logRange The logarithmic divisor.
         * @param {number} count The amount of elements in the parent bin.
         * @returns {number} The minimum child bin size.
         */
        var getMinCount = function(logRange, count) {
            var divisor = roughLog2(count);

            if (divisor > logMeanBinSize) {
                divisor -= logMeanBinSize;
            } else {
                divisor = 1;
            }

            var relativeWidth = (logConst * logRange) / Math.min(divisor, maxSplits);

            if (relativeWidth >= dataSize) {
                relativeWidth = dataSize - 1;
            }

            return 1 << Math.max(relativeWidth, logMeanBinSize + logMinSplitCount);
        };

        /**
         * Gets a logarithmic divisor of the input sequence.
         * @param {number} count The amount of elements in the sequence.
         * @param {number} logRange A logarithm of the range of values in the sequence.
         * @returns {number} The logarithmic divisor.
         */
        var getLogDivisor = function(count, logRange) {
            var logDivisor = logRange - roughLog2(count);

            if (logDivisor <= 0 && logRange < maxSplits) {
                // If we can finish sorting in one iteration.
                logDivisor = 0;
            } else {
                // Splitting into an optimized number of bins, which don't exceed "maxSplits".
                logDivisor += logMeanBinSize;

                if (logDivisor < 0) {
                    logDivisor = 0;
                }

                if (logRange - logDivisor > maxSplits) {
                    logDivisor = logRange - maxSplits;
                }
            }

            return logDivisor;
        };

        /**
         * The core unit of the spreadsort. It works recursively, receiving a parent bin and splitting it
         * into several child bins.
         * @param {number} start The index of parent bin's start.
         * @param {number} end The index of parent bin's end.
         * @param {Array} binCache An auxiliary array used as cache for bins locations data.
         * @param {Array} binSizes An auxiliary array used as cache for bins sizes data.
         * @param {number} offset An offset in the bins cache to start with.
         */
        var sortRec = function(start, end, binCache, binSizes, offset) {
            var i, j, max = start,
                min = start,
                sorted = true;
            /*
                Checking if the current bin is already sorted and finding maximal and minimal values in the bin. 
                Its necessary for calculating the bins count for further division.
            */
            for (i = start + 1; i < end; i++) {
                if (sorted && compareFunc(arr[i], arr[i - 1]) < 0) {
                    sorted = false;
                }

                if (compareFunc(arr[i], arr[max]) > 0) {
                    max = i;
                } else if (compareFunc(arr[i], arr[min]) < 0) {
                    min = i;
                }
            }

            // Return if the bin is already sorted.
            if (sorted) return;

            min = getKey(arr[min]);
            max = getKey(arr[max]);

            // Calculating the divisor and a count of bins.
            var logDivisor = getLogDivisor(end - start, roughLog2(max - min));
            var divMin = min >> logDivisor,
                divMax = max >> logDivisor;
            var binCount = divMax - divMin + 1;
            var cacheEnd = offset + binCount;
            /*
                Next few steps are similar to counting sort.
                Initializing child bins.
            */
            for (i = 0; i < binCount; i++) {
                binSizes[i] = 0;
            }

            // Each child bin would contain a count of appearance of each element of the parent bin.
            for (i = start; i < end; i++) {
                binSizes[(getKey(arr[i]) >> logDivisor) - divMin]++;
            }

            // Transform counts data to location data by in-order adding.
            binCache[offset] = start;
            for (i = 0; i < binCount - 1; i++) {
                binCache[offset + i + 1] = binCache[offset + i] + binSizes[i];
            }

            // Next step is swapping each bin's elements to their correct places.
            var nextBinStart = start,
                localBin, targetBin,
                b, c, bBin, tmp;

            for (i = 0; i < binCount - 1; i++) {
                localBin = offset + i;
                nextBinStart += binSizes[i];

                // Scanning through elements of local bin.
                for (j = binCache[localBin]; j < nextBinStart; j++) {
                    // Calculate to which bin (the target bin) should the current array's element belong.
                    targetBin = offset + ((getKey(arr[j]) >> logDivisor) - divMin);

                    // While the current array's element is in wrong bin.
                    while (targetBin != localBin) {
                        /* 
                            3-way swapping:
                            1. Get the target bin's insertion location (call it "b", and refresh it) and get a target bin for that location (new bin).
                        */
                        b = binCache[targetBin]++;
                        bBin = offset + ((getKey(arr[b]) >> logDivisor) - divMin);
                        /*
                            2. If the new bin is the local bin, then simply swap values of the target bin and local bin. 
                            In other case get the new bin's insertion location (call it "c", and refresh it) and save 
                            the array element on that location to the auxiliary variable "tmp", then:
                                1) Put the value from b-th to c-th position;
                                2) Put the value of local bin to b-th position;
                                3) Put the value from "tmp" to the current local bin element's place.
                        */
                        if (bBin == localBin) {
                            tmp = arr[b];
                        } else {
                            c = binCache[bBin]++;
                            tmp = arr[c];
                            arr[c] = arr[b];
                        }

                        arr[b] = arr[j];
                        arr[j] = tmp;

                        // Re-calculate the target bin.
                        targetBin = offset + ((getKey(arr[j]) >> logDivisor) - divMin);
                    }
                }

                // Now the location of bin's start transforms to the location of bin's end.
                binCache[localBin] = nextBinStart;
            }

            binCache[offset + binCount - 1] = end;
            /* 
                Return if there is no way for further division.
                That happens if the number of child bins is at least the number of elements 
                in the parent bin, which means that the parent bin was just sorted by 
                a variant of the counting sort.
            */
            if (logDivisor == 0) return;

            var minCount = getMinCount(logDivisor, end - start),
                lastPos = start,
                count;

            for (i = offset; i < cacheEnd; lastPos = binCache[i], i++) {
                // Get the count of elements in a bin.
                count = binCache[i] - lastPos;

                // If there is only 1 element (or even no elements at all) there is no need to sort.
                if (count < 2) {
                    continue;
                }
                /* 
                    If the bin is too small, its better to sort it using external algorithm
                    to avoid an additional recursion and a possible stack overflow.
                    Here the insertion sort is used as the external algorithm.
                */
                if (count < minCount) {
                    additionalSort(arr, lastPos, binCache[i] - 1, compareFunc, insertFunc);
                } else {
                    sortRec(lastPos, binCache[i], binCache, binSizes, cacheEnd);
                }
            }
        };

        // Launching the recursive process of sorting by considering the whole input array as a parent bin.
        sortRec(0, l, [], [], 0);

        return arr;
    };

    /** 
     * An implementation of the flashsort algorithm. It is only suitable for input arrays which keys can be represented as integers.
     * 
     * This algorithm is a distribution based sorting algorithm. The idea is: if a distribution of input elements is known (i.e. minimal 
     * and maximal values in the input array are known), it's possible to just compute an approximate location of each element in the
     * sorted array. It can be computed as quantile Li = (m - 1)*(Ai - Amin)/(Amax - Amin), where Li - the approximate location of 
     * ith array element, m - a parameter, Ai - ith array element, Amin - minimal value in the input array, Amax - maximal value in 
     * the input array.
     * 
     * @param {Array} arr Input array.
     * @param {compareFunc=} compareFunc Compares two values and returns a numeric result.
     * @param {exchangeFunc=} exchangeFunc Exchanges two elements of input array receiveing the array and two indices as parameters.
     * @param {insertFunc=} insertFunc Inserts a value into array into given position.
     * @param {getKey=} getKey Hashes the input value (by default the input value just returned).
     * @returns {Array} Sorted input array.
     */
    Sorting.flashSort = function(arr, compareFunc, exchangeFunc, insertFunc, getKey) {
        var i, j, k, m, c, x, tmp,
            extr = [arr[0], arr[0]],
            aux = [],
            l = arr.length,
            floor = Math.floor,
            insertionsort = insertionSortWorker;

        // Finding the maximal and minimal values in the input array.
        for (i = 1; i < l; i++) {
            x = arr[i];

            if (compareFunc(extr[0], x) > 0) {
                extr[0] = x;
            } else if (compareFunc(extr[1], x) < 0) {
                extr[1] = x;
            }
        }

        // Return if the array contains equal elements.
        if (compareFunc(extr[0], extr[1]) == 0) {
            return arr;
        }

        // Choosing the parameter "m" as 0.1th of length of the input array. 
        m = floor(0.1 * l);
        if (m == 0) {
            m = 1;
        }

        // Initializing the auxiliary array.
        for (i = 0; i < m; i++) {
            aux[i] = 0;
        }

        extr[0] = getKey(extr[0]);
        extr[1] = getKey(extr[1]);

        c = (m - 1) / (extr[1] - extr[0]);

        // Counting numbers of appearance of each quantile Li. Such quantile is called a class.
        for (i = 0; i < l; i++) {
            k = floor(c * (getKey(arr[i]) - extr[0]));
            aux[k]++;
        }

        // Transforming counts data to classes' location pointers data by in-order adding.
        for (k = 1; k < m; k++) {
            aux[k] += aux[k - 1];
        }

        i = 0;
        j = 0;
        k = 0;
        l--;
        /*
            Classifying each input's element. It means that elements are getting distributed in that way,
            so every element in a class is greater than any element in a lower class. An element is classified if
            its index in the array is greater than its class's pointer value.
        */
        while (i < l) {
            /* 
                Searching for an unclassified element.
                At the end of the loop "j" will point to the unclassified element.
            */
            while (j >= aux[k]) {
                j++;
                k = floor(c * (arr[j] - extr[0]));
            }

            x = arr[j];

            /* 
                Now "j" is less than "aux[k]". As next step, find a class of the jth element and put it there, 
                then consider the element that was there before and repeat same operations.
                So there is a cycle of exchanges, which should be stopped when the jth element becomes classified.
            */
            while (j != aux[k]) {
                k = floor(c * (getKey(x) - extr[0]));
                aux[k]--;

                tmp = arr[aux[k]];
                insertFunc(x, arr, aux[k]);
                x = tmp;

                i++;
            }
        }
        /* 
            Insertion sort the almost sorted array. Insertion sort works fast when insertion distances 
            (the difference between actual element's location and its correct location) are small.
        */
        insertionsort(arr, 0, l, compareFunc, insertFunc);

        return arr;
    };

    /** 
     * A simple implementation of the binary tree sort algorithm. It inserts the input array's elements into a complete binary tree, 
     * then elements are inserted into the array in correct order using in-order tree traversal.
     * 
     * @param {Array} arr Input array.
     * @param {compareFunc=} compareFunc Compares two values and returns a numeric result.
     * @param {exchangeFunc=} exchangeFunc Exchanges two elements of input array receiveing the array and two indices as parameters.
     * @param {insertFunc=} insertFunc Inserts a value into array into given position.
     * @returns {Array} Sorted input array.
     */
    Sorting.treeSort = function(arr, compareFunc, exchangeFunc, insertFunc) {
        var i, l = arr.length,
            // Initialising a new binary tree with current compare function.
            tree = new BinaryTree(compareFunc);

        // Inserting the input array's elements into the tree.
        for (i = 0; i < l; i++) {
            tree.insert(arr[i]);
        }

        // Inserting elements into the array in correct order using in-order tree traversal.
        i = 0;
        tree.traverse(function(val) {
            insertFunc(val, arr, i);
            i++;
        });

        return arr;
    };

    /** 
     * An implementation of the binary tree sort algorithm using self-balancing red-black binary tree data structure. 
     * It inserts the input array's elements into the red-black tree, then elements are inserted into the array in correct 
     * order using in-order tree traversal.
     * 
     * @param {Array} arr Input array.
     * @param {compareFunc=} compareFunc Compares two values and returns a numeric result.
     * @param {exchangeFunc=} exchangeFunc Exchanges two elements of input array receiveing the array and two indices as parameters.
     * @param {insertFunc=} insertFunc Inserts a value into array into given position.
     * @returns {Array} Sorted input array.
     */
    Sorting.RBTreeSort = function(arr, compareFunc, exchangeFunc, insertFunc) {
        var i, l = arr.length,
            // Initialising a new red-black tree with current compare function.
            tree = new RBTree(compareFunc);

        // Inserting the input array's elements into the tree.
        for (i = 0; i < l; i++) {
            tree.insert(arr[i]);
        }

        // Inserting elements into the array in correct order using in-order tree traversal.
        i = 0;
        tree.traverse(function(val) {
            insertFunc(val, arr, i);
            i++;
        });

        return arr;
    };

    /** 
     * An implementation of the binary tree sort algorithm using splay tree data structure. 
     * It inserts the input array's elements into the splay tree, then elements are inserted into the array in correct 
     * order using in-order tree traversal.
     * 
     * @param {Array} arr Input array.
     * @param {compareFunc=} compareFunc Compares two values and returns a numeric result.
     * @param {exchangeFunc=} exchangeFunc Exchanges two elements of input array receiveing the array and two indices as parameters.
     * @param {insertFunc=} insertFunc Inserts a value into array into given position.
     * @returns {Array} Sorted input array.
     */
    Sorting.splaySort = function(arr, compareFunc, exchangeFunc, insertFunc) {
        var i, l = arr.length,
            // Initialising a new red-black tree with current compare function.
            tree = new SplayTree(compareFunc);

        // Inserting the input array's elements into the tree.
        for (i = 0; i < l; i++) {
            tree.insert(arr[i]);
        }

        // Inserting elements into the array in correct order using in-order tree traversal.
        i = 0;
        tree.traverse(function(val) {
            insertFunc(val, arr, i);
            i++;
        });

        return arr;
    };

    /**
     * Heap sort algorithm implementation based on max-heap data structure.
     * @param {Array} arr Input array.
     * @param {compareFunc=} compareFunc Compares two values and returns a numeric result.
     * @param {exchangeFunc=} exchangeFunc Exchanges two elements of input array receiveing the array and two indices as parameters.
     * @returns {Array} Sorted input array.
     */
    Sorting.heapSort = function(arr, compareFunc, exchangeFunc) {
        return heapSortWorker(arr, 0, arr.length - 1, compareFunc, exchangeFunc);
    };

    /**
     * Smoothsort algorithm implementation based on a special heap data structure variaton: a Leonardo heap. 
     * 
     * The general approach is similar to the classic heapsort: constructing a number of max-heaps from the 
     * input sequence, then removing the maximum elements from the heap one by one and rebalancing the heap. 
     * But in this algorithm heaps based on Leonardo numbers (L) are used, and such heaps should follow the 
     * rules:
     * 
     * 1. The sizes of the heaps are strictly decreasing. As an important consequence, no two heaps have 
     * the same size except ones based on numbers L(1) and L(0).
     * 2. Each tree obeys the max-heap property (i.e. each node is at least as large as its children).
     * 3. The roots of the trees are in ascending order from left to right.
     * 
     * The advantage of using Leonardo heaps over classic heaps in sorting is handling the input sequence 
     * in linear time if it is already sorted (while classic heaps always performs in O(nlog(n)) time, 
     * where n is the size of the input sequence).
     * 
     * The following implementation is based on the article: <http://www.keithschwarz.com/smoothsort/>;
     * 
     * and on the code: <http://www.keithschwarz.com/interesting/code/smoothsort/Smoothsort.hh.html>
     * 
     * @param {Array} arr Input array.
     * @param {compareFunc=} compareFunc Compares two values and returns a numeric result.
     * @param {exchangeFunc=} exchangeFunc Exchanges two elements of input array receiveing the array and two indices as parameters.
     * @returns {Array} Sorted input array.
     */
    Sorting.smoothSort = function(arr, compareFunc, exchangeFunc) {
        var begin = 0,
            end = arr.length,
            i,
            // Initialising a new Leonardo heap with current compare and exchange functions.
            heap = new LeonardoHeap(arr, compareFunc, exchangeFunc);

        // Adding the input array's elements to the heaps one by one.
        for (i = begin; i < end; i++) {
            heap.add(begin, i, end);
        }

        // Extract elements with maximal values to the end of the input array.
        for (i = end; i > begin; i--) {
            heap.remove(begin, i);
        }

        return arr;
    };

    /**
     * J-sort algorithm implementation. The idea is to min-heapify the first half of the input array (with root in left), 
     * and max-heapify the right half of the array (with root in right), then finally insertion sort the array.
     * 
     * The algorithm expects that after heapifying the input array becomes nearly-sorted, so its reasonable to use 
     * insertion sort as a final step.
     * 
     * The JSort algorithm is due to Jason Morrison (<http://www.scs.carleton.ca/~morrison>). This implementation was composed 
     * according to public description of this algorithm (<https://xlinux.nist.gov/dads/HTML/JSort.html>) and seems pretty 
     * impractical for large input arrays.
     * @param {Array} arr Input array.
     * @param {compareFunc=} compareFunc Compares two values and returns a numeric result.
     * @param {exchangeFunc=} exchangeFunc Exchanges two elements of input array receiveing the array and two indices as parameters.
     * @returns {Array} Sorted input array.
     */
    Sorting.jSort = function(arr, compareFunc, exchangeFunc, insertFunc) {
        var i, l = arr.length,
            p = Math.floor(l / 2 - 1),
            minhpfy = minHeapify;
        /**
         * Establishes the max-heap property for a given root index, but the resulting heap
         * has a root in right, not in left like a classic heap.
         * @param {number} root An index of the root of the heap.
         */
        var maxHeapifyReverse = function(root) {
            var largest = root,
                l, r, len = arr.length - 1;

            while (true) {
                root = largest;
                // Calculate children positions from the end of the input array.
                l = len - 2 * (len - root) - 1;
                r = len - 2 * (len - root) - 2;
                // Find largest element among the root and it's children.
                if (l >= 0) {
                    if (compareFunc(arr[l], arr[largest]) > 0) {
                        largest = l;
                    }
                }
                if (r >= 0) {
                    if (compareFunc(arr[r], arr[largest]) > 0) {
                        largest = r;
                    }
                }
                /* 
                    If root is greater than it's children it means that the min-heap property established.
                    In other case put the largest element to root position.
                */
                if (largest == root) {
                    break;
                } else {
                    exchangeFunc(arr, largest, root);
                }
            }
        };

        // Min-heapify the first half of the input array.
        for (i = p; i >= 0; i--) {
            minhpfy(arr, i, compareFunc, exchangeFunc);
        }

        // Max-heapify the right half of the array.
        for (i = p; i < l; i++) {
            maxHeapifyReverse(i);
        }

        // Finalize the sorting with insertion sort.
        insertionSortWorker(arr, 1, l - 2, compareFunc, insertFunc);

        return arr;
    };

    /** 
     * An implementation of the binary tree sort algorithm using cartesian treap data structure (a binary tree that has both a tree and a heap properties). 
     * It inserts the input array's elements into the cartesian treap, then elements are inserted into the array in correct 
     * order using in-order treap traversal.
     * 
     * @param {Array} arr Input array.
     * @param {compareFunc=} compareFunc Compares two values and returns a numeric result.
     * @param {exchangeFunc=} exchangeFunc Exchanges two elements of input array receiveing the array and two indices as parameters.
     * @param {insertFunc=} insertFunc Inserts a value into array into given position.
     * @returns {Array} Sorted input array.
     */
    Sorting.cartesianSort = function(arr, compareFunc, exchangeFunc, insertFunc) {
        var i, l = arr.length,
            // Initialising a new treap with current compare function.
            tree = new CartesianTree(compareFunc);

        // Inserting the input array's elements into the treap.
        for (i = 0; i < l; i++) {
            tree.insert(arr[i]);
        }

        // Inserting elements into the array in correct order using in-order treap traversal.
        i = 0;
        tree.traverse(function(val) {
            insertFunc(val, arr, i);
            i++;
        });

        return arr;
    };

    /** 
     * An implementation of the tournament sort algorithm. This algorithm uses the tournament trea data structure.
     * 
     * At the bottom of the tournament tree there are leafs, which are the values of tournament's participants.
     * Pair of leafs play in two-sided matches. Each match compares the players, and the winning player is promoted 
     * to play at match at the next level up. The hierarchy continues until the final match determines the ultimate 
     * winner. Each match can simply store the index of the winner if leafs are organised as an array.
     * 
     * The sorting process is as follows:
     * 
     * 1. Copy the input array's values to leafs of the tournament tree.
     * 2. Play matches to find a champion.
     * 3. Repeat p.4-p.6 n times, where n is the size of the input array.
     * 4. Write the champion's value to the input array.
     * 5. Exclude the champion from the tournament tree (it may be done by replacing the champion's value by a sentinel value).
     * 6. Replay all matches where the ex-champion took a part in bottom-up manner to find a next champion.
     * 
     * @param {Array} arr Input array.
     * @param {compareFunc=} compareFunc Compares two values and returns a numeric result.
     * @param {exchangeFunc=} exchangeFunc Exchanges two elements of input array receiveing the array and two indices as parameters.
     * @param {insertFunc=} insertFunc Inserts a value into array into given position.
     * @returns {Array} Sorted input array.
     */
    Sorting.tournamentSort = function(arr, compareFunc, exchangeFunc, insertFunc) {
        // Initialising a new tournament with current compare function and the input array's values as leafs.
        var tournament = new Tournament(arr, compareFunc),
            l = arr.length,
            i;

        // Exctract champions from the tournament tree consistently and inserting their values to the input array.
        for (i = 0; i < l; i++) {
            insertFunc(tournament.extractChampion(), arr, i);
        }

        return arr;
    };

    /** 
     * An implementation of the patience sorting algorithm.
     * 
     * Patience sorting algorithm is based on a famous card game called "patience". Each element in the input array may be considered
     * as a single card. These cards are dealt one by one into a sequence of piles on the table, according to the following rules 
     * (taken from the Wikipedia article <https://en.wikipedia.org/wiki/Patience_sorting>):
     * 
     * 1. Initially, there are no piles. The first card dealt forms a new pile consisting of the single card.
     * 2. Each subsequent card is placed on the leftmost existing pile whose top card has a value greater than or equal the new card's value, 
     * or to the right of all of the existing piles, thus forming a new pile.
     * 3. When there are no more cards remaining to deal, the game ends.
     * 
     * When the game is over, the sorted sequence is recovered by repeatedly picking off the minimum visible card.
     * 
     * @param {Array} arr Input array.
     * @param {compareFunc=} compareFunc Compares two values and returns a numeric result.
     * @param {exchangeFunc=} exchangeFunc Exchanges two elements of input array receiveing the array and two indices as parameters.
     * @param {insertFunc=} insertFunc Inserts a value into array into given position.
     * @returns {Array} Sorted input array.
     */
    Sorting.patienceSort = function(arr, compareFunc, exchangeFunc, insertFunc) {
        var i, j, l = arr.length,
            // Initialize the array of piles with already distributed zeroth element of the input array.
            piles = [
                [arr[0]]
            ],
            search = BinarySearch.topPile,
            hpfy = minHeapify,
            heapexch = DefaultFunctions.exchangeFunc;

        /**
         * Compares two values of top elements of given piles (call them "a" and "b") and returns a numeric result.
         * @param {Array} pileA First pile to compare its top element.
         * @param {Array} pileB Second pile to compare its top element.
         * @returns {number} A number: positive when a > b, negative when a < b, zero when a = b.
         */
        var heapcmp = function(pileA, pileB) {
            var topA = pileA[pileA.length - 1],
                topB = pileB[pileB.length - 1];

            return compareFunc(topA, topB);
        };

        // Considering each element in the input array.
        for (i = 1; i < l; i++) {
            // Search for a correct pile to place the current element.
            j = search(piles, arr[i], compareFunc);

            if (j < piles.length) {
                // If a correct pile was found, put the element there.
                piles[j].push(arr[i]);
            } else {
                // In other case, create a new pile.
                piles.push([arr[i]]);
            }
        }
        /* 
            The array of piles is sorted from min to max (by top element of each pile) after operations above.
            So the top element of 0th pile is smallest value of input array. 
            That allows to use piles array as min-heap to extract smallest values one by one by restoring the min-heap
            property after each extraction.
        */
        i = 0;
        while (piles[0].length > 0) {
            // Insert the top element of 0th pile to the array.
            insertFunc(piles[0].pop(), arr, i);
            i++;
            /*
                If the 0th pile is empty and there are another piles, put the last
                of those piles to the place of 0th pile.
            */
            if (piles[0].length == 0 && piles.length > 1) {
                piles[0] = piles.pop();
            }
            /*
                Restore the min-heap property of array of piles after the extraction 
                of the top element of 0th pile.
            */
            hpfy(piles, 0, heapcmp, heapexch);
        }

        return arr;
    };

    /** 
     * An implementation of the library sort algorithm, also called gapped insertion sort. The algorithm uses an insertion sort, 
     * but with gaps in the array to accelerate subsequent insertions.
     * 
     * If there are n elements in the input array, it necessary to have an auxiliary array (let's call it S, as a Shelf) of 
     * n(1 + epsilon) elements. Epsilon defines the amount of spaces per single input element. The algorithm works in log(n) 
     * rounds. In each round we insert as many elements as there are in the S already, before re-balancing the S. For finding 
     * the position of inserting the binary search in the S is used. Once the round is over, the S is re-balanced by inserting 
     * spaces between each element.
     * 
     * (The explanation is taken from the Wikipedia article <https://en.wikipedia.org/wiki/Library_sort>)
     * 
     * @param {Array} arr Input array.
     * @param {compareFunc=} compareFunc Compares two values and returns a numeric result.
     * @param {exchangeFunc=} exchangeFunc Exchanges two elements of input array receiveing the array and two indices as parameters.
     * @param {insertFunc=} insertFunc Inserts a value into array into given position.
     * @returns {Array} Sorted input array.
     */
    Sorting.librarySort = function(arr, compareFunc, exchangeFunc, insertFunc) {
        // Initialising the Shelf auxiliary array "S".
        var S = [arr[0]],
            l = arr.length,
            i, j, prevLen, sLen, nextFree,
            min = Math.min,
            floor = Math.floor,
            search = BinarySearch.withGaps;

        /**The amount of spaces per single input element.*/
        var epsilon = 1;

        /** An amount of elements to insert into S.*/
        var goal = 1;

        /**A pointer to the input array's current element to insert.*/
        var pos = 1;

        /**A pointer to the S' position of insertion.*/
        var insPos;

        /**
         * Checks if a given value should be considered as an empty one.
         * @param {*} e The input value.
         * @returns {boolean} Boolean result of the input value check.
         */
        var isEmpty = function(e) {
            return e === undefined;
        };

        /**
         * Inserts spaces between each pair of elements in the S.
         * @param {number} initLen An initial length of the S.
         * @param {number} finLen A target length of the S.
         */
        var rebalanceArray = function(initLen, finLen) {
            var i = initLen - 1,
                j = finLen - 1,
                step = floor(finLen / initLen);
            /*
                Inserting empty spaces backwards (to avoid data corruption) with 
                "step"-sized gaps between them.
            */
            for (; i >= 0; i--, j -= step) {
                S[j] = S[i];
                S[i] = undefined;
            }
        };

        sLen = Math.max((1 + epsilon), goal + 1);

        // While there are uninserted elements in the input array.
        a: while (pos < l) {
            // Inserting a necessary amount of elements into S.
            for (i = 0; i < goal; i++) {
                // Find a position for insertion into S.
                insPos = search(arr[pos], S, sLen - 1, isEmpty, compareFunc);
                insPos++;
                /*
                    There are 2 possible cases of problems to handle:
                    1. Insertion position is not empty. 
                    2. Insertion position is further than an allowed length of the S.
                */
                if (!isEmpty(S[insPos])) {
                    /*
                        Case 1.
                        The insertion position is not empty, so its necessary to find a first empty one
                        beyond the limits of S; then shift all elements from the insertion position towards 
                        it to make the original insertion position free.
                    */
                    // Searching for a next free position forward.
                    nextFree = insPos + 1;
                    while (!isEmpty(S[nextFree])) nextFree++;

                    if (nextFree >= sLen) {
                        /*
                            Similar to case 2.
                            A free position is too distant. Trying to search for any free position backwards.
                        */
                        insPos--;

                        if (!isEmpty(S[insPos])) {
                            nextFree = insPos - 1;

                            while (!isEmpty(S[nextFree])) nextFree--;

                            // Shifting elements to make the insertion position free.
                            while (nextFree < insPos) {
                                S[nextFree] = S[nextFree + 1];
                                nextFree++;
                            }
                        }
                    } else {
                        // Shifting elements to make the insertion position free.
                        while (nextFree > insPos) {
                            S[nextFree] = S[nextFree - 1];
                            nextFree--;
                        }
                    }
                } else if (insPos >= sLen) {
                    /*
                        Case 2.
                        A free position is too distant. Trying to search for any free position backwards.
                    */
                    insPos--;
                    nextFree = insPos - 1;

                    while (!isEmpty(S[nextFree])) nextFree--;

                    // Shifting elements to make the insertion position free.
                    while (nextFree < insPos) {
                        S[nextFree] = S[nextFree + 1];
                        nextFree++;
                    }
                }

                // Inserting the input's array element to the S and moving the pointer to the next one.
                S[insPos] = arr[pos];
                pos++;

                // If all elements of the input array were inserted, we are done.
                if (pos >= l) {
                    break a;
                }
            }
            /*
                Remember the current allowed length of S (for the purpose of rebalancing) and 
                calculating the next one.
            */
            prevLen = sLen;
            sLen = min(2 * goal * (1 + epsilon), l * (1 + epsilon));
            /*
                Rebalancing the S (using the early remembered length of S) by inserting free spaces 
                between an each pair of it's elements.
            */
            rebalanceArray(prevLen, sLen);

            // We should insert as many elements as there are in the S already, so just double the "goal".
            goal *= 2;
        }

        // Inserting non-empty elements from S back to the input array in-order.
        for (i = 0, j = 0; i < sLen && j < l; i++) {
            if (!isEmpty(S[i])) {
                insertFunc(S[i], arr, j);
                j++;
            }
        }

        return arr;
    };

    /** 
     * An implementation of the shell sort algorithm. This algorithm generalizes the idea of insertion sort by sorting pairs of 
     * elements apart from each other, then progressively reducing the gap between elements to be compared.
     * 
     * @param {Array} arr Input array.
     * @param {compareFunc=} compareFunc Compares two values and returns a numeric result.
     * @param {exchangeFunc=} exchangeFunc Exchanges two elements of input array receiveing the array and two indices as parameters.
     * @param {insertFunc=} insertFunc Inserts a value into array into given position.
     * @param {getGaps=} getGaps Returns the array of ascending numbers started with 1. 
     * By default returns the Tokuda's set of increments <https://oeis.org/A108870> (1992).
     * @returns {Array} Sorted input array.
     */
    Sorting.shellSort = function(arr, compareFunc, exchangeFunc, insertFunc, getGaps) {
        var i, j, l = arr.length,
            x, gaps, gap, g;

        // Obtain gaps values.
        gaps = getGaps(arr.length);

        // For each gap value, starting from greater ones...
        for (g = gaps.length - 1; g >= 0; g--) {
            gap = gaps[g];

            // ...do an insertion sort.
            for (i = gap; i < l; i++) {
                // Consider a value.
                x = arr[i];
                j = i;
                /*
                    While considering value is less than a previous value, shift all such previous values
                    one gap value forward and finally insert the considering value into correct place.
                */
                while (j >= gap && compareFunc(x, arr[j - gap]) < 0) {
                    insertFunc(arr[j - gap], arr, j);
                    j -= gap;
                }

                insertFunc(x, arr, j);
            }
        }

        return arr;
    };

    /** 
     * An implementation of the comb sort algorithm. This algorithm generalizes the idea of bubble sort by sorting pairs of 
     * elements apart from each other, then progressively reducing the gap between elements to be compared.
     * 
     * @param {Array} arr Input array.
     * @param {compareFunc=} compareFunc Compares two values and returns a numeric result.
     * @param {exchangeFunc=} exchangeFunc Exchanges two elements of input array receiveing the array and two indices as parameters.
     * @returns {Array} Sorted input array.
     */
    Sorting.combSort = function(arr, compareFunc, exchangeFunc) {
        var i, l = arr.length,
            shrinkFactor = 1.247,
            gap,
            floor = Math.floor;

        // Calculate the gap value.
        gap = floor(l / shrinkFactor);

        while (gap > 1) {
            i = 0;

            while (i + gap < l) {
                // If the incorrect order found, swap two elements to fix it.
                if (compareFunc(arr[i], arr[i + gap]) > 0) {
                    exchangeFunc(arr, i, i + gap);
                }

                i++;
            }
            // Reduce the gap value.
            gap = floor(gap / shrinkFactor);
        }

        // As the final step, apply the usual bubble sort (with gap value equal to 1).
        return bubbleSortWorker(arr, 0, arr.length - 1, compareFunc, exchangeFunc);
    };

    /** 
     * An implementation of the least significant digit (LSD) radix sort algorithm. It is only suitable for input arrays 
     * which keys can be represented as integers.
     * 
     * In this LSD radix sort implementation input keys are grouped by their length, and then keys of the same length are 
     * sorted lexicographically.
     * 
     * @param {Array} arr Input array.
     * @param {compareFunc=} compareFunc Compares two values and returns a numeric result.
     * @param {exchangeFunc=} exchangeFunc Exchanges two elements of input array receiveing the array and two indices as parameters.
     * @param {insertFunc=} insertFunc Inserts a value into array into given position.
     * @param {getKey=} getKey Hashes the input value (by default the input value just returned).
     * @returns {Array} Sorted input array.
     */
    Sorting.radixLSDSort = function(arr, compareFunc, exchangeFunc, insertFunc, getKey) {
        var i, j, k = 0,
            min = arr[0],
            max = arr[0],
            limit, l = arr.length, base,
            aux = [], buckets = [],
            bucket, b,
            floor = Math.floor;

        /**
         * Calculates a number of digits in the input value of given base. Minimal returned value is 1.
         * @param {number} x The input value.
         * @param {number} base The input numeric base.
         * @returns {number} The number of digits in the input value.
         */
        var getNumberOfDigits = function(x, base) {
            var count = 1;
            /*
                While the input value is greater than the base, "cut off" digits by 
                performing a division without a remainder by the base value.
            */
            while (x >= base) {
                x = floor(x / base);

                count++;
            }

            return count;
        };

        /**
         * Applies a single-digit counting sort algorithm to an input array by the digit of given orger.
         * @param {Array} arr Input array.
         * @param {number} order The digit's order (from right) to sort.
         * @returns {Array} The input array, sorted by the digits of given orger.
         */
        var digitsCountingSort = function(arr, order) {
            var i, output = [],
                l = arr.length,
                key, ord = order;
            /*
                Here the order gets a new meaning. For example, in 10-base, a digit 2 in the number 231 has 
                the order of 100, a digit 3 - order of 10 and a digit 1 - order of 1.
            */
            order = 1;
            ord += 1;
            for (i = 1; i < ord; i++) {
                order *= base;
            }

            // Initialising the auxiliary array.
            for (i = 0; i < base; i++) {
                aux[i] = 0;
            }

            // Counting numbers of appearance of each digit of a given order in input's value.
            for (i = 0; i < l; i++) {
                key = floor((getKey(arr[i]) - min) / order) % base;

                aux[key]++;
            }

            // Transforming counts data to location data by in-order adding.
            for (i = 1; i < base; i++) {
                aux[i] += aux[i - 1];
            }
            /* 
                Putting each value from the input array to a correct position into output array
                and updating the location data.
            */
            for (i = l - 1; i >= 0; i--) {
                key = floor((getKey(arr[i]) - min) / order) % base;

                aux[key]--;
                insertFunc(arr[i], output, aux[key]);
            }

            return output;
        };

        // Finding the maximal and minimal values in the input array.
        for (i = 1; i < l; i++) {
            j = arr[i];

            if (compareFunc(j, min) < 0) {
                min = j;
            } else if (compareFunc(j, max) > 0) {
                max = j;
            }
        }

        min = getKey(min);
        max = getKey(max);
        /* 
            Choosing the base. 
            Instead of simply using a value 10 as the base, more complicated way is used. With such 
            an adaptive base choice the algorithm works at least twice faster. But if we just choose 
            "max - min" as the base, the algorithm would degrade to counting sort.
        */
        //base = 10;
        base = Math.max(10, floor(Math.sqrt(max - min)));

        // Distributing input keys into buckets by their length (a number of digits) in chosen base.
        for (i = 0; i < l; i++) {
            j = getNumberOfDigits(getKey(arr[i]) - min, base);

            if (!buckets[j]) {
                buckets[j] = [];
            }

            buckets[j].push(arr[i]);
        }
        /* 
            Sorting each bucket in the LSD-way digit by digit using counting sort. 
            Its important to note that "i" here is not just a pointer, but it also represents 
            a length (number of digits) of values in each bucket.
        */
        b = buckets.length;
        for (i = 1; i < b; i++) {
            if (!buckets[i]) continue;

            // Applying the single-digit counting sort digit by digit.
            for (j = 0; j < i; j++) {
                buckets[i] = digitsCountingSort(buckets[i], j);
            }
        }

        // Copying values from buckets to the array in-order.
        for (i = 1; i < b; i++) {
            bucket = buckets[i];

            if (!bucket) continue;

            l = bucket.length;

            for (j = 0; j < l; j++) {
                insertFunc(bucket[j], arr, k);
                k++;
            }
        }

        return arr;
    };

    /** 
     * An implementation of the most significant digit (MSD) radix sort algorithm. It uses lexicographic order 
     * and it is suitable for input arrays which keys can be represented as strings.
     * 
     * The MSD radix sort starts processing the keys from the most significant digit, leftmost digit, to the 
     * least significant digit, rightmost digit.
     * 
     * @param {Array} arr Input array.
     * @param {compareFunc=} compareFunc Compares two values and returns a numeric result.
     * @param {exchangeFunc=} exchangeFunc Exchanges two elements of input array receiveing the array and two indices as parameters.
     * @param {insertFunc=} insertFunc Inserts a value into array into given position.
     * @param {getKey=} getKey Hashes the input value (by default the input value just returned).
     * @returns {Array} Sorted input array.
     */
    Sorting.radixMSDSort = function(arr, compareFunc, exchangeFunc, insertFunc, getKey) {
        /*
            Here a base is the length of the ASCII table (256 symbols) plus one additional 
            place for identification of a non-existing symbol of given order. So, 257 in total.
        */
        var base = 257,
            i, key, ind,
            first, last, order = 0,
            min,
            stack = [
                [0, arr.length - 1, 0]
            ],
            aux = [],
            output = [],
            getCode = getCharCodeAt,
            insertionsort = insertionSortWorker;
        /*
            For each considered subbaray perform the counting sort by the symbols of a given order;
            Then if there are more than one elements with same symbol of a given order, consider 
            each group of those elements as subarrays with inceased order.
        */
        while (stack.length > 0) {
            ind = stack.pop();
            // Getting current subarray's boundaries from the stack.
            first = ind[0];
            last = ind[1];

            // Using insertion sort for small subarrays.
            if (last - first < 27) {
                insertionsort(arr, first, last, compareFunc, insertFunc);
                continue;
            }
            /*
                Getting current character's order from the stack. 
                Order 0 means leftmost character.
            */
            order = ind[2];
            min = base;

            // Initialising the auxiliary array.
            for (i = 0; i < base; i++) {
                aux[i] = 0;
            }
            /*
                Counting numbers of appearance of each character's code value of a given order.
                Also finding a minimal character's code value of given order in the input array.
                The point is an optimization of further cycles by reducing the amount of iterations.
            */
            for (i = first; i <= last; i++) {
                /*
                    Existing symbols have keys from 1 to 256.
                    If there is no symbol of the given order, the key value is set to 0.
                */
                key = getCode(getKey(arr[i]), order) + 1;

                if (key < min) {
                    min = key;
                }

                aux[key]++;
            }

            // Transforming counts data to location data by in-order adding.
            for (i = min + 1; i < base; i++) {
                aux[i] += aux[i - 1];
            }
            /* 
                Putting each value from the input array to a correct position into "output" array
                and updating the location data.
            */
            for (i = last; i >= first; i--) {
                key = getCode(getKey(arr[i]), order) + 1;
                aux[key]--;

                insertFunc(arr[i], output, aux[key]);
            }

            // Re-writing sorted data back to the input array.
            for (i = first; i <= last; i++) {
                insertFunc(output[i - first], arr, i);
            }

            // Exclude the case of non-existing symbols from the further consideration.
            if (min == 0) {
                min++;
            }

            // For each found symbol of a given order...
            for (i = min + 1; i < base; i++) {
                /*
                    ...check if there are more than one elements with that symbol. 
                    If those exist, consider the corresponding subarray with inceased 
                    order by adding it into the stack.
                */
                if (aux[i] - aux[i - 1] > 1) {
                    stack.push([first + aux[i - 1], first + aux[i] - 1, order + 1]);
                }
            }
        }

        return arr;
    };

    /** 
     * An implementation of a quicksort version of the MSD radix sort algorithm. It uses lexicographic order 
     * and it is suitable for input arrays which keys can be represented as strings. In this implementation, 
     * the 3-way Dijkstra partitioning is used.
     * 
     * The MSD radix sort starts processing the keys from the most significant digit, leftmost digit, to the 
     * least significant digit, rightmost digit.
     * 
     * @param {Array} arr Input array.
     * @param {compareFunc=} compareFunc Compares two values and returns a numeric result.
     * @param {exchangeFunc=} exchangeFunc Exchanges two elements of input array receiveing the array and two indices as parameters.
     * @param {insertFunc=} insertFunc Inserts a value into array into given position.
     * @param {getKey=} getKey Hashes the input value (by default the input value just returned).
     * @param {getPivot=} getPivot Returns a pivoting value in input array in given boundaries.
     * @returns {Array} Sorted input array.
     */
    Sorting.radixMSDQuickSort = function(arr, compareFunc, exchangeFunc, insertFunc, getKey, getPivot) {
        var r, l, ind, p, i, lt, ht, cmp, order, key,
            stack = [
                [0, arr.length - 1, 0]
            ],
            getCode = getCharCodeAt,
            insertionsort = insertionSortWorker;

        while (stack.length > 0) {
            ind = stack.pop();

            // Getting left and right boundaries of a subarray.
            l = ind[0];
            r = ind[1];

            // Switching to insertion sort if the subarray is too small.
            if (r <= l) {
                continue;
            } else if (r - l < 27) {
                insertionsort(arr, l, r, compareFunc, insertFunc);
                continue;
            }
            /*
                Getting current character's order from the stack. 
                Order 0 means leftmost character.
            */
            order = ind[2];
            /*
                Setting left and right indices and left subindex on initial positions 
                on boundaries of subarray and getting a pivot element.
            */
            lt = l;
            ht = r;
            i = lt;
            p = getPivot(arr, l, r);

            // Getting an ACSII code of a character of a given order of the pivot element (pivot key).
            key = getCode(getKey(p), order);
            /*
                While left subindex is smaller than right index do following:
                
                move elements which character's codes are bigger than the pivot key to the right 
                (decreasing the right index) and move elements which character's codes are smaller 
                than the pivot to the left (increasing both the left index and left subindex);

                if a considering element's code is equal to the pivot key, then only increase left subindex.

                Finally, switch to considering smaller subarrays.
            */
            while (i <= ht) {
                cmp = getCode(getKey(arr[i]), order);
                if (cmp < key) {
                    exchangeFunc(arr, i, lt);
                    i++;
                    lt++;
                } else if (cmp > key) {
                    exchangeFunc(arr, i, ht);
                    ht--;
                } else {
                    i++;
                }

                if (i > ht) {
                    stack.push([l, lt - 1, order]);
                    /*
                        Consider the subarray of elements with same character's code of a given order
                        as a subarray with inceased order by adding it into the stack (except the case 
                        of not-existing symbol, which means the pivot key value of -1).
                    */
                    if (key != -1) {
                        stack.push([lt, ht, order + 1]);
                    }

                    stack.push([ht + 1, r, order]);
                }
            }
        }

        return arr;
    };

    /** 
     * An implementation of the American flag sort algorithm. This algorithm is an in-place variant of the MSD radix sort.
     * It uses lexicographic order and it is suitable for input arrays which keys can be represented as strings.
     * 
     * The American flag sort starts processing the keys from the most significant digit, leftmost digit, to the 
     * least significant digit, rightmost digit. 
     * 
     * @param {Array} arr Input array.
     * @param {compareFunc=} compareFunc Compares two values and returns a numeric result.
     * @param {exchangeFunc=} exchangeFunc Exchanges two elements of input array receiveing the array and two indices as parameters.
     * @param {insertFunc=} insertFunc Inserts a value into array into given position.
     * @param {getKey=} getKey Hashes the input value (by default the input value just returned).
     * @returns {Array} Sorted input array.
     */
    Sorting.americanFlagSort = function(arr, compareFunc, exchangeFunc, insertFunc, getKey) {
        /*
            Here a base is the length of the ASCII table (256 symbols) plus one additional 
            place for identification of a non-existing symbol of given order. So, 257 in total.
        */
        var base = 257,
            i, key, ind,
            born, from, to, x, tmp,
            first, last, order, min,
            stack = [
                [0, arr.length - 1, 0]
            ],
            aux = [],
            count = [],
            getCode = getCharCodeAt,
            insertionsort = insertionSortWorker;
        /*
            For each considered subbaray perform the counting sort by the symbols of a given order;
            Then if there are more than one elements with same symbol of a given order, consider 
            each group of those elements as subarrays with inceased order.
        */
        while (stack.length > 0) {
            ind = stack.pop();

            // Getting current subarray's boundaries from the stack.
            first = ind[0];
            last = ind[1];

            // Using insertion sort for small subarrays.
            if (last - first < 27) {
                insertionsort(arr, first, last, compareFunc, insertFunc);
                continue;
            }
            /*
                Getting current character's order from the stack. 
                Order 0 means leftmost character.
            */
            order = ind[2];
            min = base;

            // Initialising two auxiliary arrays: one for counting, one for locations data.
            for (i = 0; i < base; i++) {
                count[i] = 0;
                aux[i] = first;
            }
            /*
                Counting numbers of appearance of each character's code value of a given order.
                Also finding a minimal character's code value of given order in the input array.
                The point is an optimization of further cycles by reducing the amount of iterations.
            */
            for (i = first; i <= last; i++) {
                /*
                    Existing symbols have keys from 1 to 256.
                    If there is no symbol of the given order, the key value is set to 0.
                */
                key = getCode(getKey(arr[i]), order) + 1;

                if (key < min) {
                    min = key;
                }

                count[key]++;
            }
            /*
                Filling up location data by in-order summing of a previous 
                location and a previous count.
            */
            for (i = min + 1; i < base; i++) {
                aux[i] = aux[i - 1] + count[i - 1];
            }
            /* 
                Instead of putting each value from the input array to a correct position into "output" array
                and updating the location data, like in classic MSD radix sort, the American flag sort algorithm 
                perform a series of exchanges (here those are done as insertions) into the input array to distribute 
                each met character's code value to its corect place.

                Considering character codes.
            */
            for (i = min; i < base; i++) {
                /*
                    While there are more than one value of a current code, move the corresponding element
                    to its intended position. That position is inhabited by a different element, which we 
                    then have to move to its correct position and so on.

                    This process of displacing elements to their correct positions continues until an element 
                    is moved to the original position of the initial element (until a cycle is complete).
                */
                while (count[i] > 0) {
                    // Remembering initial position.
                    born = aux[i];

                    // "from" is the position of current element, "x" is its value.
                    from = born;
                    x = arr[from];

                    // While a cycle is incomplete.
                    do {
                        /*
                            Finding a correct position ("to") of the element and remembering the value
                            of an element from that position in "tmp" (next element).
                        */
                        key = getCode(getKey(x), order) + 1;
                        to = aux[key];
                        tmp = arr[to];

                        // Inserting the current element to its correct position.
                        insertFunc(x, arr, to);

                        // Considering the next element as the current.
                        x = tmp;
                        from = to;

                        // Updating the location of further insertion and counts data.
                        aux[key]++;
                        count[key]--;
                    } while (from != born);
                }
            }

            // Exclude the case of non-existing symbols from the further consideration.
            if (min == 0) {
                min++;
            }

            // For each found symbol of a given order...
            for (i = min; i < base; i++) {
                /*
                    ...check if there are more than one elements with that symbol. 
                    If those exist, consider the corresponding subarray with inceased 
                    order by adding it into the stack.
                */
                if (aux[i] - aux[i - 1] > 1) {
                    stack.push([aux[i - 1], aux[i] - 1, order + 1]);
                }
            }
        }

        return arr;
    };

    /** 
     * An implementation of the counting algorithm (it is only suitable for input arrays which keys can be represented as integers).
     * This algorithm counts the number of elements that have each key value and determines the positions of each key value in the output sequence.
     * 
     * @param {Array} arr Input array.
     * @param {compareFunc=} compareFunc Compares two values and returns a numeric result.
     * @param {exchangeFunc=} exchangeFunc Exchanges two elements of input array receiveing the array and two indices as parameters.
     * @param {insertFunc=} insertFunc Inserts a value into array into given position.
     * @param {getKey=} getKey Hashes the input value (by default the input value just returned).
     * @returns {Array} Sorted input array.
     */
    Sorting.countingSort = function(arr, compareFunc, exchangeFunc, insertFunc, getKey) {
        var m = [arr[0], arr[0]],
            item, i, l = arr.length,
            aux = [],
            output = [],
            auxFin, min, key,
            floor = Math.floor;

        // Finding the maximal and minimal values in the input array.
        for (i = 1; i < l; i++) {
            item = arr[i];

            if (compareFunc(m[0], item) > 0) {
                m[0] = item;
            } else if (compareFunc(m[1], item) < 0) {
                m[1] = item;
            }
        }

        min = getKey(m[0]);
        auxFin = getKey(m[1]) - min;

        // Initializing the auxiliary array.
        for (i = 0; i <= auxFin; i++) {
            aux[i] = 0;
        }

        // Counting numbers of appearance of each input's value.
        for (i = 0; i < l; i++) {
            aux[getKey(arr[i]) - min]++;
        }

        // Transforming counts data to location data by in-order adding.
        for (i = 1; i <= auxFin; i++) {
            aux[i] += aux[i - 1];
        }
        /* 
            Putting each value from the input array to a correct position into output array
            and updating the location data.
        */
        for (i = l - 1; i >= 0; i--) {
            key = getKey(arr[i]) - min;
            aux[key]--;
            insertFunc(arr[i], output, aux[key]);
        }

        return output;
    };

    /**
     * An implementation of bitonic merge sort algorithm. The algorithm is based on sorting of bitonic sequences. 
     * 
     * A bitonic sequence is a sequence with X0 <= ... <= Xk >= ... >= Xn for some k which 0 <= k <= n.
     * 
     * Briefly, this algorithm uses a recursive splitting of the input array to subarrays to transform the input 
     * sequence into the bitonic sequence, which then transforms to a sorted monotonic non-decreasing sequence. 
     * That can be achieved by using a directional exchanging comparator, which puts a element with greater value 
     * to an optional direction (to the left or to the right). So, on each level of recursion:
     * 
     * 1. An input subarray elements' sequence transforms to the bitonic sequence in the next layer of recursion. 
     * 2. That bitonic sequence transforms to a sorted monotonically non-decreasing sequence. That calls "merging".
     * 
     * More detailed description is in the Wikipedia article: <https://en.wikipedia.org/wiki/Bitonic_sorter>
     * @param {Array} arr Input array.
     * @param {compareFunc=} compareFunc Compares two values and returns a numeric result.
     * @param {exchangeFunc=} exchangeFunc Exchanges two elements of input array receiveing the array and two indices as parameters.
     * @returns {Array} Sorted input array.
     */
    Sorting.bitonicSort = function(arr, compareFunc, exchangeFunc) {
        var startIndex = 0,
            endIndex = arr.length - 1,
            floor = Math.floor;

        /**
         * Compares and exchanges (if necessary) two elements of input array two indices and a direction of exchange as parameters.
         * @param {number} i Index of position to exchange.
         * @param {number} j Index of position to exchange.
         * @param {boolean} dir An exchange direction.
         */
        var compare = function(i, j, dir) {
            if (dir == (compareFunc(arr[i], arr[j]) > 0)) {
                exchangeFunc(arr, i, j);
            }
        };

        /**
         * Returns such k for an input value x, that k = 2^n and 2^n < x <= 2^(n + 1), where n is natural number.
         * @param {number} x The input value.
         * @returns {number} A closest non-greater value which is the power of 2.
         */
        var prevPowerOfTwoFor = function(x) {
            var k = 1;

            while (k > 0 && k < x) {
                k <<= 1;
            }

            return k >>> 1;
        };

        /**
         * Merges a bitonic sequence located in the subarray of given start index and size to the monotonic sequence.
         * @param {number} startIndex The start of the subarray.
         * @param {number} l The size of the subarray.
         * @param {boolean} dir A direction of the comparator.
         */
        var bitonicMerge = function(startIndex, l, dir) {
            var i, k, ind, m, stack = [
                [startIndex, l, dir]
            ];

            while (stack.length > 0) {
                ind = stack.pop();
                startIndex = ind[0];
                l = ind[1];
                dir = ind[2];

                if (l > 1) {
                    /*
                        Handling a bigger subarray first, then splitting it by two smaller ones
                        and also handling, while subarrays' sizes are bigger than 1. 
                        Handling means applying the exchanging comparator for pairs of elements 
                        form different halfs of the subarray.
                    */
                    m = prevPowerOfTwoFor(l);
                    k = startIndex + l - m;

                    for (i = startIndex; i < k; i++) {
                        compare(i, i + m, dir);
                    }

                    stack.push([startIndex, m, dir]);
                    stack.push([startIndex + m, l - m, dir]);
                }
            }
        };

        /**
         * Recursively splits a subarray on 2 smaller subarrays, then launches the bitonic merging of them
         * using a given comparator's direction. It implements the bitonic sorting network.
         * @param {number} startIndex The left boundary of the subarray.
         * @param {number} l The size of the subarray.
         * @param {boolean} dir A direction of the comparator.
         */
        var recurse = function(startIndex, l, dir) {
            var m;
            /* 
                Split only if the input subarray size is at least 2.
                If there are only 2 or less elements in a sequence, it is already a bitonic one,
                so further merging would transform it into a monotonic sequence.
            */
            if (l > 1) {
                m = floor(l / 2);
                // Use an opposite direction of the comparator to maintain a bitonic sequence for further merging.
                recurse(startIndex, m, !dir);
                recurse(startIndex + m, l - m, dir);
                /*
                    Merging process transforms the earlier maintained bitonic sequence to 
                    a monotonic sequence, which would be the sorted non-decreasing sequence
                    at the final step of the algorithm (which means popping the last item 
                    from the recursion stack).
                */
                bitonicMerge(startIndex, l, dir);
            }
        };

        recurse(startIndex, endIndex + 1 - startIndex, true);

        return arr;
    };

    /**
     * Insertion sort algorithm implementation.
     * @param {Array} arr Input array.
     * @param {compareFunc=} compareFunc Compares two values and returns a numeric result.
     * @param {exchangeFunc=} exchangeFunc Exchanges two elements of input array receiveing the array and two indices as parameters.
     * @param {insertFunc=} insertFunc Inserts a value into array into given position.
     * @returns {Array} Sorted input array.
     */
    Sorting.insertionSort = function(arr, compareFunc, exchangeFunc, insertFunc) {
        return insertionSortWorker(arr, 0, arr.length - 1, compareFunc, insertFunc);
    };

    /**
     * Insertion sort algorithm implementation with binary search of insertion's destination to reduce a number of comparisons.
     * @param {Array} arr Input array.
     * @param {compareFunc=} compareFunc Compares two values and returns a numeric result.
     * @param {exchangeFunc=} exchangeFunc Exchanges two elements of input array receiveing the array and two indices as parameters.
     * @param {insertFunc=} insertFunc Inserts a value into array into given position.
     * @returns {Array} Sorted input array.
     */
    Sorting.binaryInsertionSort = function(arr, compareFunc, exchangeFunc, insertFunc) {
        var i = 0,
            j, k, l = arr.length,
            x,
            binSearch = BinarySearch.right;

        for (; i < l; i++) {
            // Considering a value.
            x = arr[i];
            j = i;

            // Find the rightmost acceptable position ("k") to insert the considering value.
            k = binSearch(x, arr, 0, j, compareFunc);

            // Shifting elements to make the insertion to k-th position possible.
            while (j > k) {
                insertFunc(arr[j - 1], arr, j);
                j--;
            }

            insertFunc(x, arr, j);
        }

        return arr;
    };

    /**
     * Selection sort algorithm implementation. For each input array's element X it scans through the array to search a correct 
     * element to exchange with X. The advantage of such approach is an significantly smaller number of exchanges than the bubble sort provides.
     * @param {Array} arr Input array.
     * @param {compareFunc=} compareFunc Compares two values and returns a numeric result.
     * @param {exchangeFunc=} exchangeFunc Exchanges two elements of input array receiveing the array and two indices as parameters.
     * @returns {Array} Sorted input array.
     */
    Sorting.selectionSort = function(arr, compareFunc, exchangeFunc) {
        var i, j, l = arr.length - 1,
            min;

        for (i = 0; i < l; i++) {
            // Considering the current element as minimal in whole input array.
            min = i;

            // Searching for a smallest element among the rest of array.
            for (j = i + 1; j <= l; j++) {
                if (compareFunc(arr[j], arr[min]) < 0) {
                    min = j;
                }
            }

            // If the current element isn't the smallest one, exchanging them.
            if (i != min) {
                exchangeFunc(arr, i, min);
            }
        }

        return arr;
    };

    /**
     * Bingo sort algorithm implementation. This algorithm is a variant of the seletion sort. Items of the input array are ordered by 
     * repeatedly looking through the remaining items to find the greatest value and moving all items with that value to their final location.
     * @param {Array} arr Input array.
     * @param {compareFunc=} compareFunc Compares two values and returns a numeric result.
     * @param {exchangeFunc=} exchangeFunc Exchanges two elements of input array receiveing the array and two indices as parameters.
     * @returns {Array} Sorted input array.
     */
    Sorting.bingoSort = function(arr, compareFunc, exchangeFunc) {
        var i, j, l = arr.length - 1,
            max, x;

        // Search for a maximal value in the array.
        max = arr[l];
        for (i = 0; i < l; i++) {
            if (compareFunc(arr[i], max) > 0) {
                max = arr[i];
            }
        }

        i = l;
        // Now "i" is the index of insertion.
        while (i > 0) {
            /*
                Remember a maximal value found earlier and consider the
                current value as maximal.
            */
            x = max;
            max = arr[i];
            /* 
                Check all remaining elements. All elements equal to the
                remembered maximal value should be moved to the end of array.
                Also if the value of a considering element is greater than
                current maximal value, update the current maximal value.
            */
            for (j = i - 1; j >= 0; j--) {
                if (compareFunc(arr[j], x) == 0) {
                    exchangeFunc(arr, j, i);
                    i--;
                } else if (compareFunc(arr[j], max) > 0) {
                    max = arr[j];
                }
            }
            // Decrease the index of insertion while the value by that index is equal to the maximal value.
            while (i > 0 && compareFunc(arr[i], max) == 0) {
                i--;
            }
        }

        return arr;
    };

    /**
     * Bidirectional selection sort algorithm implementation. For each two input array's elements X and Y it scans through the array to search correct 
     * elements to exchange with X and Y.
     * @param {Array} arr Input array.
     * @param {compareFunc=} compareFunc Compares two values and returns a numeric result.
     * @param {exchangeFunc=} exchangeFunc Exchanges two elements of input array receiveing the array and two indices as parameters.
     * @returns {Array} Sorted input array.
     */
    Sorting.doubleSelectionSort = function(arr, compareFunc, exchangeFunc) {
        var i, j, l = arr.length - 1,
            min, max;

        for (i = 0; i < l; i++, l--) {
            // Considering the first element as minimal in whole input array.
            min = i;
            // Considering the last element as maximal in whole input array.
            max = l;

            // Searching for a smallest and a biggest elements among the rest of array.
            for (j = i; j <= l; j++) {
                if (compareFunc(arr[j], arr[min]) < 0) {
                    min = j;
                } else if (compareFunc(arr[j], arr[max]) > 0) {
                    max = j;
                }
            }
            /*
                Handling the case when the maximal element locates in the beginning or
                the minimal element locates in the end.
            */
            if (i == max || l == min) {
                exchangeFunc(arr, i, l);

                if (i == max) {
                    max = l;
                }
                if (l == min) {
                    min = i;
                }
            }
            // If the first element isn't the smallest one, exchanging them.
            if (i != min) {
                exchangeFunc(arr, i, min);
            }
            // If the last element isn't the biggest one, exchanging them.
            if (l != max) {
                exchangeFunc(arr, l, max);
            }
        }

        return arr;
    };

    /**
     * Cocktail shaker sort algorithm implementation. This algorithm is a faster variation of bubble sort; 
     * it scans through the input array in both directions, steadily reducing the scanning range.
     * @param {Array} arr Input array.
     * @param {compareFunc=} compareFunc Compares two values and returns a numeric result.
     * @param {exchangeFunc=} exchangeFunc Exchanges two elements of input array receiveing the array and two indices as parameters.
     * @returns {Array} Sorted input array.
     */
    Sorting.cocktailShakerSort = function(arr, compareFunc, exchangeFunc) {
        var i, endIndex = arr.length - 1,
            startIndex = 0,
            newEI, newSI;

        while (startIndex <= endIndex) {
            newSI = endIndex;
            newEI = startIndex;

            // Scan from left to right.
            for (i = startIndex; i < endIndex; i++) {
                // If the incorrect order found, swap two elements to fix it, and remember the current index.
                if (compareFunc(arr[i], arr[i + 1]) > 0) {
                    exchangeFunc(arr, i, i + 1);
                    newEI = i;
                }
            }

            // Now the scanning area's end is the index of last found order-breaking element. 
            endIndex = newEI;

            // Scan from right to left.
            for (i = endIndex; i >= startIndex; i--) {
                if (compareFunc(arr[i], arr[i + 1]) > 0) {
                    // If the incorrect order found, swap two elements to fix it, and remember the current index.
                    exchangeFunc(arr, i, i + 1);
                    newSI = i;
                }
            }

            // Now the scanning area's start is the index of last found order-breaking element.
            startIndex = newSI;
        }

        return arr;
    };

    /**
     * Odd-even sort algorithm implementation. This algorithm is a faster variation of bubble sort; 
     * it exchanges odd elements of the input array to achieve their correct order first, then it does same with even elements.
     * @param {Array} arr Input array.
     * @param {compareFunc=} compareFunc Compares two values and returns a numeric result.
     * @param {exchangeFunc=} exchangeFunc Exchanges two elements of input array receiveing the array and two indices as parameters.
     * @returns {Array} Sorted input array.
     */
    Sorting.oddEvenSort = function(arr, compareFunc, exchangeFunc) {
        var notSorted = true,
            i, l = arr.length - 1;

        while (notSorted) {
            // Lets expect that sorting is done, so need to check if the order is correct.
            notSorted = false;
            /* 
                If the incorrect order found, swap two elements to fix it.
                Also we can't expect that subarray is sorted anymore.
                Do that for odd elements first.
            */
            for (i = 1; i < l; i += 2) {
                if (compareFunc(arr[i], arr[i + 1]) > 0) {
                    exchangeFunc(arr, i, i + 1);
                    notSorted = true;
                }
            }

            // Then do same for even elements.
            for (i = 0; i < l; i += 2) {
                if (compareFunc(arr[i], arr[i + 1]) > 0) {
                    exchangeFunc(arr, i, i + 1);
                    notSorted = true;
                }
            }
        }

        return arr;
    };

    /**
     * Bubble sort algorithm implementation.
     * @param {Array} arr Input array.
     * @param {compareFunc=} compareFunc Compares two values and returns a numeric result.
     * @param {exchangeFunc=} exchangeFunc Exchanges two elements of input array receiveing the array and two indices as parameters.
     * @returns {Array} Sorted input array.
     */
    Sorting.bubbleSort = function(arr, compareFunc, exchangeFunc) {
        return bubbleSortWorker(arr, 0, arr.length - 1, compareFunc, exchangeFunc);
    };

    /**
     * Cycle sort algorithm implementation. The advantage of this algorithm is that in theory it makes an optimal number
     * of writes to the array. It works as follows (taken from the Wikipedia article: <https://en.wikipedia.org/wiki/Cycle_sort>): 
     * 
     * 1. Consider an element and find its correct position in the sorted array by counting the number of elements 
     * in the array that are smaller than that element.
     * 2. If the element is already at the correct position, do nothing.
     * 3. If it is not, we will write it to its intended position. That position is inhabited by a different element, 
     * which we then have to move to its correct position. This process of displacing elements to their correct positions 
     * continues until an element is moved to the original position of the initial element. This completes a cycle.
     * 
     * @param {Array} arr Input array.
     * @param {compareFunc=} compareFunc Compares two values and returns a numeric result.
     * @param {exchangeFunc=} exchangeFunc Exchanges two elements of input array receiveing the array and two indices as parameters.
     * @param {insertFunc=} insertFunc Inserts a value into array into given position.
     * @returns {Array} Sorted input array.
     */
    Sorting.cycleSort = function(arr, compareFunc, exchangeFunc, insertFunc) {
        var i, tmp, cstart, x, pos, l = arr.length,
            ll;

        for (cstart = 0, ll = l - 1; cstart < ll; cstart++) {
            // Consider an element and initialize the correct position counter.
            x = arr[cstart];
            pos = cstart;

            // Check if any of the remaining elements is less than the current element.
            for (i = cstart + 1; i < l; i++) {
                if (compareFunc(x, arr[i]) > 0) {
                    pos++;
                }
            }

            // Consider the next element if the position is correct.
            if (pos == cstart) continue;

            // If there are several equal value elements, set the counter after them.
            while (compareFunc(x, arr[pos]) == 0) {
                pos++;
            }
            /* 
                If the position isn't correct, store the correct position element's value in "x" 
                and paste the current element's value to the correct position.
            */
            if (pos != cstart) {
                tmp = x;
                x = arr[pos];
                insertFunc(tmp, arr, pos);
            }
            /*
                Then its necessary to finish a cycle by moving all elements to their correct 
                positions by chain. While considering position is not correct (which means
                "there are still incorrectly placed elements in this cycle"), repeat operations 
                above.
            */
            while (pos != cstart) {
                // Initialize the correct position counter. Now "x" is current value.
                pos = cstart;

                // Check if any of the remaining elements is less than the current element.
                for (i = cstart + 1; i < l; i++) {
                    if (compareFunc(x, arr[i]) > 0) {
                        pos++;
                    }
                }

                // If there are several equal value elements, set the counter after them.
                while (compareFunc(x, arr[pos]) == 0) {
                    pos++;
                }
                /* 
                    If the value on the current position ("x") isn't equal a value on the target position,
                    store the correct position element's value in "x" and paste the current element's 
                    value to the correct position.
                */
                if (compareFunc(x, arr[pos]) != 0) {
                    tmp = x;
                    x = arr[pos];
                    insertFunc(tmp, arr, pos);
                }
            }
        }

        return arr;
    };

    /**
     * Gnome sort algorithm implementation. The approach is similar to insertion sort, but series of exchanges (not insertions) are used.
     * @param {Array} arr Input array.
     * @param {compareFunc=} compareFunc Compares two values and returns a numeric result.
     * @param {exchangeFunc=} exchangeFunc Exchanges two elements of input array receiveing the array and two indices as parameters.
     * @returns {Array} Sorted input array.
     */
    Sorting.gnomeSort = function(arr, compareFunc, exchangeFunc) {
        var i = 1,
            j = 2,
            l = arr.length,
            x;

        while (i < l) {
            /* 
                If the order is correct, increase index; the "j" variable is used to
                remember the last index position before an exchange.
                In other case, exchange a pair of elements and decrease index.
            */
            if (compareFunc(arr[i], arr[i - 1]) >= 0) {
                i = j;
                j++;
            } else {
                exchangeFunc(arr, i, i - 1);
                i--;
                /*
                    If the beginning of the input array is reached, 
                    teleport back to last remembered position.
                */
                if (i == 0) {
                    i = j;
                    j++;
                }
            }
        }

        return arr;
    };

    /**
     * Pancake sort algorithm implementation. This algorithm is based on the input subarrays reversals (flips). 
     * The goal is to sort the input array in as few flips as possible.
     * @param {Array} arr Input array.
     * @param {compareFunc=} compareFunc Compares two values and returns a numeric result.
     * @param {exchangeFunc=} exchangeFunc Exchanges two elements of input array receiveing the array and two indices as parameters.
     * @returns {Array} Sorted input array.
     */
    Sorting.pancakeSort = function(arr, compareFunc, exchangeFunc) {
        var i, j, pos, l = arr.length - 1,
            flip = flipElementsOfArray;

        for (i = l; i >= 0; i--) {
            pos = i;
            // Find a first element which violates the correct order.
            for (j = 0; j < i; j++) {
                if (compareFunc(arr[j], arr[pos]) > 0) {
                    pos = j;
                }
            }

            // If no order-violating elements were found, then don't flip.
            if (pos == i) continue;
            /*
                Flip the subbarray from beginning to the violating element
                (to put that element to the beginning of the array if it's not already there).
            */
            if (pos != 0) {
                flip(arr, 0, pos, exchangeFunc);
            }
            /* 
                Then flip the subbarray from beginning to the current element.
                As result, the violating element is moving from beginning to its correct position.
            */
            flip(arr, 0, i, exchangeFunc);
        }

        return arr;
    };

    /**
     * An implementation of another algorithm which also called "counting sort". It may be considered as a quadratic version of counting sort 
     * (as it runs in O(n^2) time, where n is the size of the input array).
     * 
     * The idea is to consider each input's element and to count how many elements are less than that. The result will be a position of that element
     * in the sorted array. To properly handle a case of equal value elements, it necessary to count also how many equal elements are before 
     * the current element and add that number to the result.
     * @param {Array} arr Input array.
     * @param {compareFunc=} compareFunc Compares two values and returns a numeric result.
     * @param {exchangeFunc=} exchangeFunc Exchanges two elements of input array receiveing the array and two indices as parameters.
     * @param {insertFunc=} insertFunc Inserts a value into array into given position.
     * @returns {Array} Sorted input array.
     */
    Sorting.countingSort2 = function(arr, compareFunc, exchangeFunc, insertFunc) {
        var i, j, c, x,
            // Initializing the output array for sorted elements.
            output = [],
            l = arr.length;

        for (i = 0; i < l; i++) {
            // Set the counter "c" to zero and consider an element of the input array.
            c = 0;
            x = arr[i];

            // Count all elements that are equal or less than the current one before that.
            for (j = 0; j < i; j++) {
                if (compareFunc(arr[j], x) <= 0) {
                    c++;
                }
            }

            // Count all elements that are less than the current one after that.
            for (j = i + 1; j < l; j++) {
                if (compareFunc(arr[j], x) < 0) {
                    c++;
                }
            }
            /*
                Now "c" is a position of the current element in the sorted array.
                So just insert the current element there.
            */
            insertFunc(x, output, c);
        }

        return output;
    };

    /**
     * An implementation of bead sort algorithm, also known as gravity sort. It can work only with integers, and even in best case
     * it's runtime is about O(S), where S is the sum of the integers in the input array (expecting the input array containing only 
     * positive integers). The bead sort can be compared to the manner in which beads slide on parallel poles, 
     * such as on an abacus.
     * 
     * However, hardware implementations of this algorithm can run in linear time. That's because the software implementation
     * can't maintain the natural gravity falling mechanism. 
     * 
     * @param {Array} arr Input array.
     * @returns {Array} Sorted input array.
     * @throws {TypeError} Input array should contain only integers.
     */
    Sorting.beadSort = function(arr) {
        var i, j, item, n,
            min = arr[0],
            max = arr[0],
            l = arr.length,
            counts = [],
            aux = [],
            output = [];

        for (i = 0; i < l; i++) {
            item = arr[i];

            // Throwing a Type Error if the input array contain a non-integer value.
            if (!Number.isInteger(item)) {
                throw new TypeError("input array should contain only integers");
            }

            // Initialising the abacus' auxiliary 2-dimensional array.
            aux.push([]);

            // Searching minimax and maximal values in the input array.
            if (min > item) { // min
                min = item;
            } else if (max < item) { //max
                max = item;
            }
        }

        max -= min;
        /* 
            Initialising the abacus. Abacus has a following structure Array[row][pole]:

            (O - a bead)

            |   |   |
            O   O   |   integer value 2 (row 0)
            |   |   |
            O   |   |   integer value 1 (row 1)
            |   |   |
            O   O   O   integer value 3 (row 2)
            |   |   |
            O   O   O   integer value 3 (row 3)
            |   |   |
              poles

            So, the number of poles is "max", the number of rows is the length of the input array.
        */
        for (i = 0; i < max; i++) {
            counts[i] = 0;

            for (j = 0; j < l; j++) {
                aux[j][i] = 0;
            }
        }
        /* 
            Filling the abacus as already fallen by counting already visited poles.
            It gonna be filled as if the gravity direction is reversed.
        */
        for (i = 0; i < l; i++) {
            // "n" is the number of poles to fill.
            n = arr[i] - min;

            for (j = 0; j < n; j++) {
                aux[counts[j]][j] = 1;

                counts[j]++;
            }
        }

        // Extract the information from the abacus.
        for (i = 0; i < l; i++) {
            output[i] = min;

            // Take the information from the opposite end of abacus, because it has reversed order.
            n = l - 1 - i;

            // Counting beads. The result is the correct value for the current index of the sorted array.
            for (j = 0; j < max && aux[n][j] == 1; j++) {
                output[i] += aux[n][j];
            }
        }

        return output;
    };

    /**
     * Stooge sort algorithm implementation. This algorithm has O(n^2.71) runtime (so it is impractical), where n is the number of elements in the input array.
     * 
     * @param {Array} arr Input array.
     * @param {compareFunc=} compareFunc Compares two values and returns a numeric result.
     * @param {exchangeFunc=} exchangeFunc Exchanges two elements of input array receiveing the array and two indices as parameters.
     * @returns {Array} Sorted input array.
     */
    Sorting.stoogeSort = function(arr, compareFunc, exchangeFunc) {
        var l, r, t, stack = [
                [0, arr.length - 1]
            ],
            ind, floor = Math.floor;

        while (stack.length > 0) {
            // Getting left and right boundaries of a current subarray.
            ind = stack.pop();
            l = ind[0];
            r = ind[1];

            // If rightmost and leftmost elements are in wrong order, exchange them.
            if (compareFunc(arr[l], arr[r]) > 0) {
                exchangeFunc(arr, l, r);
            }
            /*
                If there are at least 3 elements, do following:
                1) consider first 2/3 of the current subarray;
                2) consider last 2/3 of the current subarray;
                3) consider first 2/3 of the current subarray once again.
            */
            if (r > l + 1) {
                t = floor((r - l + 1) / 3);
                stack.push([l, r - t]);
                stack.push([l + t, r]);
                stack.push([l, r - t]);
            }
        }

        return arr;
    };

    // the beginning of simple binary tree classes
    /**
     * Constructs a binary tree node with a given value, left and right children.
     * @param {*} value The value of a node.
     * @param {BinaryTreeNode} [left = null] The left child.
     * @param {BinaryTreeNode} [right = null] The right child.
     */
    function BinaryTreeNode(value, left, right) {
        this.value = value;
        this.left = left || null;
        this.right = right || null;
    }

    /**
     * Constructs a Binary Tree with given comparator.
     * @param {compareFunc} compareFunc 
     */
    function BinaryTree(compareFunc) {
        /**@private */
        this._root = null;

        /**@private */
        this._compare = compareFunc;
    }

    /**
     * Inserts a value into the tree to correct position.
     * @param {*} value The value to insert.
     */
    BinaryTree.prototype.insert = function(value) {
        // Creating a new node for a given value.
        var node = new BinaryTreeNode(value),
            root = this._root;

        // If its the first value ever to insert, insert it to the tree root.
        if (root == null) {
            this._root = node;
            return;
        }

        // Searching for a correct position to insert the value.
        while (true) {
            /*
                If the new value is less or equal to the root value, try to insert it in a left subtree,
                in other case try to insert it in a right subtree.
            */
            if (this._compare(node.value, root.value) <= 0) {
                /*
                    Checking the left subtree. If the left child is empty, insert there,
                    in other case consider the left child as a root.
                */
                if (root.left == null) {
                    root.left = node;
                    break;
                } else {
                    root = root.left;
                }
            } else {
                /*
                    Checking the right subtree. If the right child is empty, insert there,
                    in other case consider the right child as a root.
                */
                if (root.right == null) {
                    root.right = node;
                    break;
                } else {
                    root = root.right;
                }
            }
        }
    };

    /**
     * Launches a recursive traversal, which means a visiting all tree nodes in-order and applying a callback function to them.
     * @param {function(*)} callback The callback function. It called on each node with it's value as an argument.
     */
    BinaryTree.prototype.traverse = function(callback) {
        // If the root tree is not empty, launch the recursive traversal.
        if (this._root != null) {
            this._traverseRec(this._root, callback);
        }
    };

    /**
     * Visits all tree nodes in-order and applies a callback function to them. According to binary tree data structure property, 
     * to traverse in-order its necessary to recursively check root's left child, then root itself, then root's right child. So smallest values
     * would float up first.
     * @private
     * @param {BinaryTreeNode} root The root node.
     * @param {function(*)} callback The callback function. It called on each node with it's value as an argument.
     */
    BinaryTree.prototype._traverseRec = function(root, callback) {
        // Checking the root node's left child by recursively calling the process with left child as a root.
        if (root.left != null) {
            this._traverseRec(root.left, callback);
        }

        // Call the callback function with root value as an argument.
        callback(root.value);

        // Checking the root node's right child by recursively calling the process with right child as a root.
        if (root.right != null) {
            this._traverseRec(root.right, callback);
        }
    };
    // the end of simple binary tree classes

    // the beginning of cartesian treap classes
    /**
     * Constructs a cartesian treap node with a given value, priority, left and right children and parent.
     * @augments BinaryTreeNode
     * @param {*} value The value of a node.
     * @param {number} priority The priority of a node.
     * @param {CartesianTreeNode} [left = null] The left child.
     * @param {CartesianTreeNode} [right = null] The right child.
     * @param {CartesianTreeNode} [parent = null] The parent of the node.
     */
    function CartesianTreeNode(value, priority, left, right, parent) {
        // Inheriting some properties from usual binary tree node.
        BinaryTreeNode.call(this, value, left, right);

        this.priority = priority;
        this.parent = parent || null;
    }

    /**
     * Constructs a Cartesian treap with given comparator.
     * @augments BinaryTree
     * @param {compareFunc} compareFunc 
     */
    function CartesianTree(compareFunc) {
        // Inheriting some properties from usual binary tree.
        BinaryTree.call(this, compareFunc);
    }

    /**
     *         D                            D
     *         |                            |
     *        node                          T
     *       /    \         --->           / \
     *      /      \                      /   \
     * node.left    T                 node     T.right 
     *             / \               /    \
     *            /   \             /      \
     *           B   T.right    node.left   B
     *
     * Performs the operation of left rotation as it shown above.
     * @private
     * @param {CartesianTreeNode} node The node to rotate.
     */
    CartesianTree.prototype._rotateLeft = function(node) {
        // Initialising nodes.
        var T = node.right;
        var B = T.left;
        var D = node.parent;

        // If a parent node isn't empty, setting T node as its child. In other case setting the T as root node.
        if (D != null) {
            if (D.right == node) {
                D.right = T;
            } else {
                D.left = T;
            }
        } else {
            this._root = T;
        }

        // If a B node isn't empty, updating its parent.
        if (B != null) {
            B.parent = node;
        }

        // Exchanging the T and input nodes.
        T.parent = D;
        T.left = node;
        node.parent = T;
        node.right = B;
    };

    /**
     *           D                     D
     *           |                     |
     *          node                   T
     *         /    \       --->      / \
     *        /      \               /   \
     *       T    node.right    T.left   node
     *      / \                         /    \
     *     /   \                       /      \
     * T.left   B                     B    node.right
     *
     * Performs the operation of right rotation as it shown above.
     * @private
     * @param {CartesianTreeNode} node The node to rotate.
     */
    CartesianTree.prototype._rotateRight = function(node) {
        // Initialising nodes.
        var T = node.left;
        var B = T.right;
        var D = node.parent;

        // If a parent node isn't empty, setting T node as its child. In other case setting the T as root node.
        if (D != null) {
            if (D.right == node) {
                D.right = T;
            } else {
                D.left = T;
            }
        } else {
            this._root = T;
        }

        // If a B node isn't empty, updating its parent.
        if (B != null) {
            B.parent = node;
        }

        // Exchanging the T and input nodes.
        T.parent = D;
        T.right = node;
        node.parent = T;
        node.left = B;
    };

    /**
     * Inserts a value into the cartesian treap to correct position.
     * @param {*} value The value to insert.
     */
    CartesianTree.prototype.insert = function(value) {
        // Creating a new node for a given value.
        var node = new CartesianTreeNode(value, Math.random()),
            root = this._root;

        // If its the first value ever to insert, insert it to the tree root.
        if (root == null) {
            this._root = node;
            return;
        }
        /* 
            Simple binary tree insertion:
            searching for a correct position to insert the value.
        */
        while (true) {
            /*
                If the new value is less or equal to the root value, try to insert it in a left subtree,
                in other case try to insert it in a right subtree.
            */
            if (this._compare(node.value, root.value) <= 0) {
                /*
                    Checking the left subtree. If the left child is empty, insert there,
                    in other case consider the left child as a root.
                */
                if (root.left == null) {
                    root.left = node;
                    node.parent = root;

                    root = root.left;
                    break;
                } else {
                    root = root.left;
                }
            } else {
                /*
                    Checking the right subtree. If the right child is empty, insert there,
                    in other case consider the right child as a root.
                */
                if (root.right == null) {
                    root.right = node;
                    node.parent = root;

                    root = root.right;
                    break;
                } else {
                    root = root.right;
                }
            }
        }
        /*
            All priority values in this treap-tree actually make up a max-heap.
            So just fixing the heap up.
        */
        while (root != this._root && root.priority > root.parent.priority) {
            if (root == root.parent.left) {
                this._rotateRight(root.parent);
            } else {
                this._rotateLeft(root.parent);
            }
        }
    };

    /**
     * Launches a recursive traversal, which means a visiting all tree nodes in-order and applying a callback function to them.
     * @augments BinaryTree
     * @param {function(*)} callback The callback function. It called on each node with it's value as an argument.
     */
    CartesianTree.prototype.traverse = BinaryTree.prototype.traverse;

    /**
     * Visits all tree nodes in-order and applies a callback function to them. According to binary tree data structure property, 
     * to traverse in-order its necessary to recursively check root's left child, then root itself, then root's right child. So smallest values
     * would float up first.
     * @private
     * @augments BinaryTree
     * @param {CartesianTreeNode} root The root node.
     * @param {function(*)} callback The callback function. It called on each node with it's value as an argument.
     */
    CartesianTree.prototype._traverseRec = BinaryTree.prototype._traverseRec;
    // the end of cartesian treap classes

    // the beginning of red-black tree classes
    /**
     * Constructs a red-black tree node with a given value, left and right children and parent.
     * @augments BinaryTree
     * @param {*} value The value of a node.
     * @param {RBT_Node} [left = null] The left child.
     * @param {RBT_Node} [right = null] The right child.
     * @param {RBT_Node} [parent = null] The parent node.
     */
    function RBT_Node(value, left, right, parent) {
        // Inheriting some properties from usual binary tree node.
        BinaryTreeNode.call(this, value, left, right);
        this.parent = parent || null;

        /**@private */
        this._red = true;
    }

    /**
     * Constructs a Red-black Tree with given comparator. Such tree has following properties:
     * 1. Each node is either red or black.
     * 2. The root is black.
     * 3. All leaves (null nodes) are black.
     * 4. If a node is red, then both its children are black.
     * 5. Every path from a given node to any of its descendant null nodes contains the same number of black nodes.
     * 
     * Taken from Wikipedia: <https://en.wikipedia.org/wiki/Red%E2%80%93black_tree>
     * @augments BinaryTree
     * @param {compareFunc} compareFunc
     */
    function RBTree(compareFunc) {
        // Inheriting some properties from usual binary tree.
        BinaryTree.call(this, compareFunc);
    }

    /**
     * Returns a color of a given node.
     * @param {RBT_Node} node The node to read the color.
     * @returns {boolean} The boolean color representation of the node: red color is "true", black color is "false".
     */
    RBTree.prototype._getColor = function(node) {
        // Consider all empty nodes as black.
        if (node == null) {
            return false;
        }

        return node._red;
    };

    /**
     * Sets a red or black color for a given node.
     * @param {RBT_Node} node The node to set the color.
     * @param {boolean} color The boolean color representation: red color is "true", black color is "false".
     */
    RBTree.prototype._setColor = function(node, color) {
        // Do nothing if the node is empty.
        if (node == null) {
            return;
        }

        node._red = color;
    };

    /**
     * Inserts a value into the red-black tree to correct position, then fixes the tree up.
     * @param {*} value The value to insert.
     */
    RBTree.prototype.insert = function(value) {
        // Creating a new node for a given value.
        var node = new RBT_Node(value),
            root = this._root;

        // If its the first value ever to insert, insert it to the tree root.
        if (root == null) {
            this._root = node;

            // The root node should be black.
            this._setColor(node, false);

            node.parent = null;
            return;
        }

        while (true) {
            /*
                If the new value is less or equal to the root value, try to insert it in a left subtree,
                in other case try to insert it in a right subtree.
            */
            if (this._compare(node.value, root.value) <= 0) {
                /*
                    Checking the left subtree. If the left child is empty, insert there,
                    in other case consider the left child as a root.
                */
                if (root.left == null) {
                    root.left = node;
                    node.parent = root;

                    root = root.left;
                    break;
                } else {
                    root = root.left;
                }
            } else {
                /*
                    Checking the right subtree. If the right child is empty, insert there,
                    in other case consider the right child as a root.
                */
                if (root.right == null) {
                    root.right = node;
                    node.parent = root;

                    root = root.right;
                    break;
                } else {
                    root = root.right;
                }
            }
        }

        this._fixTree(node);
    };

    /**
     * Performs the operation of left rotation.
     * @private
     * @augments CartesianTree
     * @param {RBT_Node} node The node to rotate.
     */
    RBTree.prototype._rotateLeft = CartesianTree.prototype._rotateLeft;

    /**
     * Performs the operation of right rotation.
     * @private
     * @augments CartesianTree
     * @param {RBT_Node} node The node to rotate.
     */
    RBTree.prototype._rotateRight = CartesianTree.prototype._rotateRight;

    /**
     * Fixes the red-black tree properties by checking nodes upwards from a given node.
     * It fixes properties 2, 4 and 5.
     * @param {RBT_Node} node The node from which the fixing starts.
     */
    RBTree.prototype._fixTree = function(node) {
        var parent, grandparent, uncle, tmp;

        // Considering only non-root red nodes with red parents.
        while (node != this._root && this._getColor(node) && this._getColor(node.parent)) {
            parent = node.parent;
            grandparent = parent.parent;

            if (parent == grandparent.left) {
                uncle = grandparent.right;
                /* 
                    If both the uncle is red, then the uncle and the parent can be 
                    repainted black and the grandparent becomes red to maintain property 5.
                    In other case its necessary to perform rotations to put the current node 
                    to the grandparent position and maintain property 4.
                */
                if (this._getColor(uncle)) {
                    this._setColor(uncle, false);
                    this._setColor(parent, false);
                    this._setColor(grandparent, true);

                    // Considering a grandparent node next.
                    node = grandparent;
                } else {
                    // If the node isn't on the side of the tree, its necessary to rotate it with its parent first.
                    if (node == parent.right) {
                        this._rotateLeft(parent);
                        node = parent;
                        parent = node.parent;
                    }
                    // Finally, rotate the grandparent.
                    this._rotateRight(grandparent);

                    // Swapping parent's and grandparent's colors.
                    tmp = this._getColor(parent);
                    this._setColor(parent, this._getColor(grandparent));
                    this._setColor(grandparent, tmp);

                    // Considering a parent node next.
                    node = parent;
                }
            } else {
                uncle = grandparent.left;
                /* 
                    If both the parent and the uncle are red, then both of them can be 
                    repainted black and the grandparent becomes red to maintain property 5.
                    In other case its necessary to perform rotations to put the current node 
                    to the grandparent position and maintain property 4.
                */
                if (this._getColor(uncle)) {
                    this._setColor(uncle, false);
                    this._setColor(parent, false);
                    this._setColor(grandparent, true);

                    // Considering a grandparent node next.
                    node = grandparent;
                } else {
                    // If the node isn't on the side of the tree, its necessary to rotate it with its parent first.
                    if (node == parent.left) {
                        this._rotateRight(parent);
                        node = parent;
                        parent = node.parent;
                    }
                    // Finally, rotate the grandparent.
                    this._rotateLeft(grandparent);

                    // Swapping parent's and grandparent's colors.
                    tmp = this._getColor(parent);
                    this._setColor(parent, this._getColor(grandparent));
                    this._setColor(grandparent, tmp);

                    // Considering a parent node next.
                    node = parent;
                }
            }
        }

        // The root node should be black.
        this._setColor(this._root, false);
    };

    /**
     * Launches a recursive traversal, which means a visiting all tree nodes in-order and applying a callback function to them.
     * @augments BinaryTree
     * @param {function(*)} callback The callback function. It called on each node with it's value as an argument.
     */
    RBTree.prototype.traverse = BinaryTree.prototype.traverse;

    /**
     * Visits all tree nodes in-order and applies a callback function to them. According to binary tree data structure property, 
     * to traverse in-order its necessary to recursively check root's left child, then root itself, then root's right child. So smallest values
     * would float up first.
     * @private
     * @augments BinaryTree
     * @param {RBT_Node} root The root node.
     * @param {function(*)} callback The callback function. It called on each node with it's value as an argument.
     */
    RBTree.prototype._traverseRec = BinaryTree.prototype._traverseRec;
    // the end of red-black tree classes

    // the beginning of splay tree classes
    /**
     * Constructs a splay tree node with a given value, left and right children and parent.
     * @augments BinaryTreeNode
     * @param {*} value The value of a node.
     * @param {SplayTreeNode} [left = null] The left child.
     * @param {SplayTreeNode} [right = null] The right child.
     * @param {SplayTreeNode} [parent = null] The parent of the node.
     */
    function SplayTreeNode(value, left, right, parent) {
        BinaryTreeNode.call(this, value, left, right);

        this.parent = parent || null;
    }

    /**
     * Constructs a Splay tree with given comparator.
     * @augments BinaryTree
     * @param {compareFunc} compareFunc 
     */
    function SplayTree(compareFunc) {
        BinaryTree.call(this, compareFunc);
    }

    /**
     * Performs the operation of left rotation.
     * @private
     * @augments CartesianTree
     * @param {SplayTreeNode} node The node to rotate.
     */
    SplayTree.prototype._rotateLeft = CartesianTree.prototype._rotateLeft;

    /**
     * Performs the operation of right rotation.
     * @private
     * @augments CartesianTree
     * @param {SplayTreeNode} node The node to rotate.
     */
    SplayTree.prototype._rotateRight = CartesianTree.prototype._rotateRight;

    /**
     * Pulls up a given node to the tree root.
     * @param {SplayTreeNode} node 
     */
    SplayTree.prototype.splay = function(node) {
        var parent, gparent, cmp;

        while (true) {
            parent = node.parent;
            // If the root is reached, then break.
            if (parent == null) {
                break;
            }

            cmp = parent.left == node;

            gparent = parent.parent;
            /*
                Zig step: if the parent is root, simple rotation should help to 
                put the node to the root.
            */
            if (gparent == null) {
                if (cmp) {
                    this._rotateRight(parent);
                } else {
                    this._rotateLeft(parent);
                }
                break;
            }
            /*
                If the grandparent exists, perform Zig-Zig or Zig-Zag operations, which put the node 
                on grandparent's place. The Zig-Zig is performed when the node and the parent are 
                both left or right children. In other case the Zig-Zag is performed.
                For more details check the Wikipedia article: <https://en.wikipedia.org/wiki/Splay_tree>
            */
            if (gparent.left == parent) {
                if (cmp) {
                    // Zig-Zig step.
                    this._rotateRight(gparent);
                    this._rotateRight(parent);
                } else {
                    // Zig-Zag step.
                    this._rotateLeft(parent);
                    this._rotateRight(gparent);
                }
            } else {
                if (cmp) {
                    // Zig-Zag step.
                    this._rotateRight(parent);
                    this._rotateLeft(gparent);
                } else {
                    // Zig-Zig step.
                    this._rotateLeft(gparent);
                    this._rotateLeft(parent);
                }
            }
        }

        // Set up the node as the tree root.
        this._root = node;
    };

    /**
     * Inserts a value into the splay tree to correct position, then pulls it up to the tree root.
     * @param {*} value The value to insert.
     */
    SplayTree.prototype.insert = function(value) {
        // Creating a new node for a given value.
        var node = new SplayTreeNode(value),
            root = this._root;

        // If its the first value ever to insert, insert it to the tree root.
        if (root == null) {
            this._root = node;
            return;
        }

        while (true) {
            /*
                If the new value is less or equal to the root value, try to insert it in a left subtree,
                in other case try to insert it in a right subtree.
            */
            if (this._compare(node.value, root.value) <= 0) {
                /*
                    Checking the left subtree. If the left child is empty, insert there,
                    in other case consider the left child as a root.
                */
                if (root.left == null) {
                    root.left = node;
                    node.parent = root;

                    root = root.left;
                    break;
                } else {
                    root = root.left;
                }
            } else {
                /*
                    Checking the right subtree. If the right child is empty, insert there,
                    in other case consider the right child as a root.
                */
                if (root.right == null) {
                    root.right = node;
                    node.parent = root;

                    root = root.right;
                    break;
                } else {
                    root = root.right;
                }
            }
        }

        // Pull up the new node to the root.
        this.splay(root);
    };

    /**
     * Launches a recursive traversal, which means a visiting all tree nodes in-order and applying a callback function to them.
     * @augments BinaryTree
     * @param {function(*)} callback The callback function. It called on each node with it's value as an argument.
     */
    SplayTree.prototype.traverse = BinaryTree.prototype.traverse;

    /**
     * Visits all tree nodes in-order and applies a callback function to them. According to binary tree data structure property, 
     * to traverse in-order its necessary to recursively check root's left child, then root itself, then root's right child. So smallest values
     * would float up first.
     * @private
     * @augments BinaryTree
     * @param {SplayTreeNode} root The root node.
     * @param {function(*)} callback The callback function. It called on each node with it's value as an argument.
     */
    SplayTree.prototype._traverseRec = BinaryTree.prototype._traverseRec;
    // the end of splay tree classes

    // the beginning of Leonardo heap classes
    /**
     * Constructs the Uint8 arrray based bitset (bitvector) of given amount of bits. 
     * 
     * To speedup operations with bitset, a pointer approach is used: the pointer's value defines from 
     * which bit the information should be read or written to. So, instead of expensive elements shifting 
     * across the entire array, the pointer's value could be simply changed.
     * @param {number} amountOfBits The number of bits in the bitset.
     */
    function Bitset(amountOfBits) {
        /**@private */
        this._initOffset = amountOfBits - 1;
        /**@private */
        this._array = new Uint8Array(2 * amountOfBits - 1);
        /**@private */
        this._pointer = this._initOffset;
    }

    /**
     * Reads and returns a bit by a given index.
     * @param {number} index The index of the bit to read.
     * @returns {boolean} The bit's value.
     */
    Bitset.prototype.get = function(index) {
        return this._array[index + this._pointer];
    };

    /**
     * Writes a given value to the bitvector to a given index.
     * @param {number} index The index of the bit to set.
     * @param {boolean} bit The bit's value to set.
     */
    Bitset.prototype.set = function(index, bit) {
        this._array[index + this._pointer] = bit;
    };

    /**
     * Searches for a first existing bit from the given index and returns 
     * an index of that bit or -1 if no bits exist.
     * @param {number} from The index of the search's beginning.
     * @returns {number} The index of a first existing bit.
     */
    Bitset.prototype.getBitPos = function(from) {
        var i, l = this._array.length;

        for (i = this._pointer + from; i < l; i++) {
            if (this._array[i]) return i - this._pointer;
        }

        return -1;
    };

    /**
     * Emulates a left shift of the bitset for a given amount of bits.
     * @param {number} bits The amount of bits to perform the left shift.
     */
    Bitset.prototype.shiftUp = function(bits) {
        /*
            Perform the shift by reducing the pointer's value if the array's left tail
            is long enough. Otherwise, put the pointer's value in the initial state and
            perform real array shift.

            Important note: in the application of smoothSort (Leonardo heaps building) real array
            shift never happens, because the Leonardo numbers are taken with great reserve.
        */
        if (this._pointer > bits) {
            // Shifting the pointer.
            this._pointer -= bits;

            bits--;

            // Destroying the information from the right to maintain the correct behavior.
            while (bits > 0) {
                this._array[this._pointer + bits] = false;
                bits--;
            }
        } else {
            var diff = this._initOffset - this._pointer;
            this._pointer = this._initOffset;
            this._moveUp(diff + bits);
        }
    };

    /**
     * Emulates a right shift of the bitset for a given amount of bits.
     * @param {number} bits The amount of bits to perform the right shift.
     */
    Bitset.prototype.shiftDown = function(bits) {
        /*
            Perform the shift by reducing the pointer's value if the array's right tail
            is long enough. Otherwise, put the pointer's value in the initial state and
            perform real array shift.

            Important note: in the application of smoothSort (Leonardo heaps building) real array
            shift never happens, because the Leonardo numbers are taken with great reserve.
        */
        if (this._array.length - this._pointer > bits) {
            // Shifting the pointer.
            this._pointer += bits;

            // Destroying the information from the left to maintain the correct behavior.
            while (bits > 0) {
                this._array[this._pointer - bits] = false;
                bits--;
            }
        } else {
            var diff = this._pointer - this._initOffset;
            this._pointer = this._initOffset;
            this._moveDown(diff + bits);
        }
    };

    /**
     * Shifts the entire array of bits to the left for a given amount of bits.
     * @private
     * @param {*} bits The amount of bits to perform the left shift.
     */
    Bitset.prototype._moveUp = function(bits) {
        var i, l = this._array.length - 1;

        // Copy information downwards to avoid possible corruption.
        for (i = l; i >= bits; i--) {
            this._array[i] = this._array[i - bits];
        }

        bits--;
        // Destroying the information from the right to maintain the correct behavior.
        while (bits >= 0) {
            this._array[bits] = false;
            bits--;
        }
    };

    /**
     * Shifts the entire array of bits to the right for a given amount of bits.
     * @private
     * @param {*} bits The amount of bits to perform the right shift.
     */
    Bitset.prototype._moveDown = function(bits) {
        var i, l = this._array.length;

        for (i = bits; i < l; i++) {
            this._array[i - bits] = this._array[i];
        }

        // Destroying the information from the right to maintain the correct behavior.
        while (bits > 0) {
            this._array[l - bits] = false;
            bits--;
        }
    };

    /**
     * Constructs a Leonardo heap structure for a given array with a given comparator and an exchange function.
     *  
     * The following implementation is based on the article: <http://www.keithschwarz.com/smoothsort/>
     * and on the code: <http://www.keithschwarz.com/interesting/code/smoothsort/Smoothsort.hh.html>
     * @param {Array} arr The input array.
     * @param {compareFunc} compareFunc Compares two values and returns a numeric result.
     * @param {exchangeFunc} exchangeFunc Exchanges two elements of input array receiveing the array and two indices as parameters.
     */
    function LeonardoHeap(arr, compareFunc, exchangeFunc) {
        /**
         * A bitvector capable of holding all the Leonardo numbers.
         * @private 
         */
        this._trees = new Bitset(this._LeonardoNumbers.length);

        /**
         * The bitvector's right shift amount, which is also the size of the smallest tree.
         * @private
         */
        this._smallestTreeSize = 0;

        /**
         * Compares two values in the input array "arr" (receiving their indices) and returns a numeric 
         * result by wrapping the received compare function.
         * @private 
         * @param {number} i An index of a first value to compare.
         * @param {number} j An index of a second value to compare.
         * @returns {number} A number: positive when arr[i] > arr[j], negative when arr[i] < arr[j], 
         * zero when arr[i] = arr[j].
         */
        this._compare = function(i, j) {
            return compareFunc(arr[i], arr[j]);
        };

        /**
         * Exchanges two elements of input array receiveing two indices as parameters by wrapping 
         * the received exchange function.
         * @private 
         * @param {number} i Index of position to exchange.
         * @param {number} j Index of position to exchange.
         */
        this._exchange = function(i, j) {
            exchangeFunc(arr, i, j);
        };
    }

    /**
     * A list of all the Leonardo numbers precomputed below 2^32 (<http://oeis.org/A001595>).
     * @private
     */
    LeonardoHeap.prototype._LeonardoNumbers = [1, 1, 3, 5, 9, 15, 25, 41, 67, 109, 177, 287, 465, 753,
        1219, 1973, 3193, 5167, 8361, 13529, 21891, 35421, 57313, 92735, 4356617, 7049155, 11405773,
        18454929, 29860703, 48315633, 78176337, 126491971, 204668309, 331160281, 535828591, 866988873,
        1402817465, 2269806339, 3672623805
    ];

    /**
     * Returns the right child's index for a root index of right-based Leonardo heap. 
     * It's assumed that the heap is well-formed and has size > 1.
     * @param {number} root The root index.
     * @returns {number} The right child index.
     */
    LeonardoHeap.prototype._secondChild = function(root) {
        return root - 1;
    };

    /**
     * Returns the left child's index for a root index of right-based Leonardo heap. 
     * It's assumed that the heap is well-formed and has size > 1.
     * @param {number} root The root index.
     * @param {number} size The heap size.
     * @returns {number} The left child index.
     */
    LeonardoHeap.prototype._firstChild = function(root, size) {
        // Go to the second child, then step backwards L(size - 2) steps to skip over it.
        return this._secondChild(root) - this._LeonardoNumbers[size - 2];
    };

    /**
     * Returns the index of larger of two clildren for a root index of right-based Leonardo heap. 
     * It's assumed that the heap is well-formed and has size > 1.
     * @param {number} root The root index.
     * @param {number} size The heap size.
     * @returns {number} The larger child index. 
     */
    LeonardoHeap.prototype._largerChild = function(root, size) {
        // Obtaining right and left children's indices.
        var second = this._secondChild(root);
        var first = second - this._LeonardoNumbers[size - 2];

        // Comparing children values and returning the index of the larger child.
        if (this._compare(first, second) >= 0) {
            return first;
        } else {
            return second;
        }
    };

    /**
     * Rebalances the single heap of a given root and size.
     * @param {number} root The root index.
     * @param {number} size The heap size.
     */
    LeonardoHeap.prototype._heapifySingle = function(root, size) {
        var first, second, larger, childSize;

        // Loop until the current root node has no children, which happens when the order of the tree is 0 or 1.
        while (size > 1) {
            // Obtain right and left children's indices.
            first = this._firstChild(root, size);
            second = this._secondChild(root);

            // Find a larger child and remember its size.
            if (this._compare(first, second) >= 0) {
                larger = first;
                childSize = size - 1;
            } else {
                larger = second;
                childSize = size - 2;
            }

            // If the root is not less than its largest child, the heap is balanced.
            if (this._compare(root, larger) >= 0) {
                return;
            }

            // In other case exchange the root and its larger child and consider that child as the root.
            this._exchange(root, larger);
            root = larger;
            size = childSize;
        }
    };

    /**
     * Rectifies the heap structure by shuffling the new root down to the proper position and rebalancing the target heap.
     * @param {number} begin The beginning of the heap structure.
     * @param {number} end An index after the root of the rightmost heap.
     * @param {number} smallestTreeSize The size of the smallest existing correct heap.
     * @param {number} offset A correcting offset to the bitvector. It used when its necessary to 
     * rectify left and right subheaps separately (ignoring a rightmost actual heap) after removing 
     * the root value from the parent heap.
     */
    LeonardoHeap.prototype._rectify = function(begin, end, smallestTreeSize, offset) {
        // The root of the rightmost heap.
        var i = end - 1,
            j, toCompare, lastHeapSize, largeChild, priorHeap;

        while (true) {
            /*
                Keep track of the size of the last heap size that we visited. We need this so that once 
                we've positioned the new node atop the correct heap we remember how large it is.
            */
            lastHeapSize = smallestTreeSize;

            // If this is the very first heap in the tree, we're done.
            if (i - begin == this._LeonardoNumbers[lastHeapSize] - 1) {
                break;
            }
            /* 
                We want to swap the previous root with this one if it's strictly greater than 
                both the root of this tree and both its children.
            */
            toCompare = i;
            /*
                If we aren't an order-0 or order-1 tree, we have two children, and need to check 
                which of the three values is largest. That valuee will be compared.
            */
            if (smallestTreeSize > 1) {
                largeChild = this._largerChild(i, smallestTreeSize);

                if (this._compare(toCompare, largeChild) < 0) {
                    toCompare = largeChild;
                }
            }

            // Get a pointer to the root of the second heap by backing up the size of this heap.
            priorHeap = i - this._LeonardoNumbers[lastHeapSize];
            /*
                If the second tree root is greater than the element we're comparing, it's necessary 
                to exchange the root of rightmost heap ("i") and the second tree root, then consider
                the second tree root as the rightmost heap.
                Otherwise, the rightmost heap's root has a correct location.
            */
            if (this._compare(toCompare, priorHeap) < 0) {
                this._exchange(i, priorHeap);
                i = priorHeap;
                /*
                    Scan down until we find the heap before this one. We do this by continously 
                    shifting down the tree bitvector and bumping up the size of the smallest tree 
                    until we hit a new tree.
                */
                offset++;
                smallestTreeSize++;

                j = this._trees.getBitPos(offset) - offset;

                smallestTreeSize += j;
                offset += j;
            } else {
                break;
            }
        }

        // Finally, rebalance a last visited heap.
        this._heapifySingle(i, lastHeapSize);
    };

    /**
     * Increases the size of the smallest heap by one by inserting the element at "end".
     * @param {number} begin The beginning of both the heap structure and the allowed range.
     * @param {number} end The index of new heap node's insertion.
     * @param {number} heapEnd The end of the allowed insertion range.
     */
    LeonardoHeap.prototype.add = function(begin, end, heapEnd) {
        var isLast = false;
        /*
            There are three cases to consider.
            Case 0: If there are no elements in the heap, add a tree of order 1.
            Case 1: If the last two heaps have sizes that differ by one, we add the new element by merging the last two heaps.
            Case 2: Otherwise, if the last heap has Leonardo number 1, add a singleton heap of Leonardo number 0.
            Case 3: Otherwise, add a singleton heap of Leonardo number 1.
        */
        // Case 0.
        if (!this._trees.get(0)) {
            this._trees.set(0, true);
            this._smallestTreeSize = 1;

        // Case 1.
        } else if (this._trees.get(0) && this._trees.get(1)) {
            this._trees.shiftDown(2);
            this._trees.set(0, true);
            this._smallestTreeSize += 2;

        // Case 2.
        } else if (this._smallestTreeSize == 1) {
            this._trees.shiftUp(1);
            this._smallestTreeSize = 0;
            this._trees.set(0, true);

        // Case 3.
        } else {
            this._trees.shiftUp(this._smallestTreeSize - 1);
            this._trees.set(0, true);
            this._smallestTreeSize = 1;
        }
        /*
            At this point, we've set up a new tree. We need to see if this tree is at the final size it's going to take. 
            If so, we'll do a full rectify on it. Otherwise, all we need to do is maintain the heap property.
        */
        switch (this._smallestTreeSize) {
            // If this last heap has order 0, then it's in its final position only if it's the very last element of the array.
            case 0:
                if (end + 1 == heapEnd) {
                    isLast = true;
                }
                break;
                /*
                    If this last heap has order 1, then it's in its final position if it's the last element, or it's the 
                    penultimate element and it's not about to be merged.
                */
            case 1:
                if (end + 1 == heapEnd || (end + 2 == heapEnd && !this._trees.get(1))) {
                    isLast = true;
                }
                break;
                /* 
                    Otherwise, this heap is in its final position if there isn't enough room for the next Leonardo number 
                    and one extra element.
                */
            default:
                if (heapEnd - (end + 1) < this._LeonardoNumbers[this._smallestTreeSize - 1] + 1) {
                    isLast = true;
                }
                break;
        }

        if (isLast) {
            this._rectify(begin, end + 1, this._smallestTreeSize, 0);
        } else {
            this._heapifySingle(end, this._smallestTreeSize);
        }
    };

    /**
     * Dequeues the element at end - 1 and rebalances the heap. Since the largest element of the heap is already 
     * at end, this essentially keeps the max element in its place and does a rebalance if necessary.
     * @param {number} begin The beginning of the heap structure.
     * @param {number} end An index after the root of the rightmost heap.
     */
    LeonardoHeap.prototype.remove = function(begin, end) {
        /* 
            There are two cases to consider:
            Case 1: The last heap is of order zero or one. In this case, removing it doesn't expose any new trees and we can just
                drop it from the list of trees.
            Case 2: The last heap is of order two or greater. In this case, we exposed two new heaps, which may require rebalancing.
        */
        /*
            Case 1. 
            Scanning up the list looking for the next tree.
        */
        if (this._smallestTreeSize <= 1) {
            var j = this._trees.getBitPos(1);

            if (j > 0) {
                this._trees.shiftDown(j);
                this._smallestTreeSize += j;
            }

            return;
        }
        /*
            Case 2.
            Break open the last heap to expose two subheaps of order k - 2 and k - 1. 
            This works by mapping the bitvector's encoding (W1, n) to the encoding (W011, n - 2).
        */
        var leftHeap = this._firstChild(end - 1, this._smallestTreeSize),
            rightHeap = this._secondChild(end - 1);

        this._trees.set(0, false);
        this._trees.shiftUp(2);
        this._trees.set(0, true);
        this._trees.set(1, true);
        this._smallestTreeSize -= 2;
        /*
            Rebalance left and right heaps. For the left heap rebalancing we'll pretend that there is one fewer heap 
            than there actually is, since we're ignoring the rightmost heap.
        */
        this._rectify(begin, leftHeap + 1, this._smallestTreeSize + 1, 1);
        this._rectify(begin, rightHeap + 1, this._smallestTreeSize, 0);
    };
    // the end of Leonardo heap classes

    // the beginning of Tournament tree classes
    /**
     * Constructs a new Match instance. 
     * 
     * Match stores a result of competition of two (left and right) participants. Those can be 
     * another instances of Match or indices in the array of tourney participants (leafs). So that 
     * Match is a parent Match for those two competitors.
     * 
     * If a certain Match has empty parent, it means that the Match is final, and its result
     * is an index of the champion among leafs.
     * 
     * @param {Tournament} tourney A Tournament instance to which the Match belongs.
     * @param {number|Match} left The left competitor.
     * @param {number|Match} right The right competitor.
     */
    function Match(tourney, left, right) {
        /**
         * Stores the link to the Tournament object.
         * @private 
         */
        this._tourney = tourney;

        this.result = null;
        this.left = left;
        this.right = right;
        this.parent = null;
    }

    /**
     * Receives two indices of Tournament leafs (which could be the results of another Matches) and 
     * compares values by those indices. The index of a winning value becomes the result of the Match.
     * @param {number} valueL Index of the left participant.
     * @param {number} valueR Index of the right participant.
     */
    Match.prototype.playSingle = function(valueL, valueR) {
        /*
            Tournament is organised in a way, which allows the Match has only one participant 
            in certain cases. And that single participant will always be left one. 
            So if the right participant is absent, the left one instantly wins the Match.
        */
        if (valueR == null) {
            this.result = valueL;
            return;
        }
        /* 
            Otherwise, if both participants are not empty, compare them by the rules of the tourney
            and remember the result.
        */
        if (this._tourney.compare(valueL, valueR) <= 0) {
            this.result = valueL;
        } else {
            this.result = valueR;
        }
    };

    /**
     * Establishes the result of the current Match and its parent Match by chain till 
     * a final Match inclusive, if the current Match has instances of Match as left 
     * and right participants.
     * @private
     */
    Match.prototype._play = function() {
        /*
            If the right participant is absent, the left one instantly wins the Match.
            Otherwise, play the current Match.
        */
        if (this.right == null) {
            this.result = this.left.result;
        } else {
            this.playSingle(this.left.result, this.right.result);
        }

        // Do same as above for a parent Match if it exists.
        if (this.parent != null) {
            this.parent._play();
        }
    };

    /**
     * Establishes the result of the current Match and its parent Match by chain till 
     * a final Match inclusive, if the current Match has indices of Tournament leafs 
     * as left and right participants.
     */
    Match.prototype.playFromLeafs = function() {
        // Play the current Match.
        this.playSingle(this.left, this.right);

        // Play a parent Match if it exists.
        if (this.parent != null) {
            this.parent._play();
        }
    };

    /**
     * Constructs a new Tournament instance. 
     * 
     * A Tournament contains an array of participants ("leafs") and an array of matches
     * between them ("matches"). The result of the final match defines the Tournament champion,
     * which can be removed from the Tournament ("null" value written to its index in "leafs" array).
     * Then to find a new champion all necessary matches should be replayed by chain from ex-champion's 
     * leaf to the final match (bottom-up).
     * 
     * @param {Array} arr The input array of participants. 
     * @param {compareFunc} compareFunc Compares two values and returns a numeric result.
     */
    function Tournament(arr, compareFunc) {
        /**
         * The array of the Tournament's matches.
         * @type {Array.<Match>}
         * @private
         */
        this._matches = [];

        /**
         * The array of the Tournament's participants, which initialized as the copy of the input array.
         * If a champion leaves the Tournament (got extracted), "null" value get written to its index in 
         * this array.
         * @private
         */
        this._leafs = (function(a) {
            var tmp = [];

            writeOneArrayToAnother(a, tmp, 0, a.length - 1, 0);

            return tmp;
        })(arr);

        /**
         * The Tournament's final match, which result defines the champion.
         * @type {?Match}
         * @private
         */
        this._champion = null;

        /**
         * Compares two values in the leafs array (receiving their indices) and returns a numeric 
         * result by wrapping the received compare function.
         * @private 
         * @param {number} i An index of a first value to compare.
         * @param {number} j An index of a second value to compare.
         * @returns {number} A number: 
         * 
         * 1. Positive when leafs[i] > leafs[j] or leafs[i] is null;
         * 2. Negative when leafs[i] < leafs[j] or leafs[j] is null;
         * 3. Zero when leafs[i] = leafs[j].
         */
        this.compare = function(i, j) {
            if (this._leafs[i] == null) return 1;
            if (this._leafs[j] == null) return -1;

            return compareFunc(this._leafs[i], this._leafs[j]);
        };

        // Establish and play all matches between participants.
        this._establishAllMatches();
    }

    /**
     * Establishes and plays all Tournament's matches, filling up the matches array and finding a champion.
     * At first it plays matches between leafs, then between winners of previous matches and etc, till
     * only one match can be played. That match is the final one and it defines a champion.
     * @private
     */
    Tournament.prototype._establishAllMatches = function() {
        var i, start, end, l = this._leafs.length - 1,
            ll, match;
        /* 
            Play initial matches between leafs. So each such Match has indices 
            of "_leafs" array as left and right participants.
        */
        for (i = 0; i < l; i += 2) {
            match = new Match(this, i, i + 1);
            match.playSingle(match.left, match.right);

            this._matches.push(match);
        }

        l++;
        /* 
            If there is an odd number of participants, play one more match
            with an empty right participant.
        */
        if (i < l) {
            match = new Match(this, i, null);
            match.playSingle(match.left, match.right);

            this._matches.push(match);
        }

        // The pointer to the first participant among matches.
        start = 0;

        // The pointer to the last participant among matches.
        end = this._matches.length - 1;
        /* 
            Now play matches between winners of previous matches. Newly played matches
            should be parental for their participant matches. 
            Lets call each iteration of the "while" cycle below "a tour". The amount of 
            matches in each next tour will reduce in approximately two times. So when 
            the "start" and "end" pointers will point on a same single match, it will 
            mean that the match is final, and we should stop further iterations.
        */
        while (end > start) {
            for (i = start; i < end; i += 2) {
                // Establishing a new match between another two ones of the current tour.
                match = new Match(this, this._matches[i], this._matches[i + 1]);

                // The new match should be parental for those participant matches.
                this._matches[i].parent = match;
                this._matches[i + 1].parent = match;

                // Playing the new match.
                match.playSingle(match.left.result, match.right.result);

                this._matches.push(match);
            }

            end++;
            /* 
                If there is an odd number of participants, play one more match
                with an empty right participant.
            */
            if (i < end) {
                match = new Match(this, this._matches[i], null);

                this._matches[i].parent = match;

                match.playSingle(match.left.result, null);

                this._matches.push(match);
            }
            /* 
                Then all new matches become participants of the next tour.
                So put the "start" pointer exclusively to the end of the current tour,
                and the "end" pointer - to the last newly played match.
            */
            start = end;
            end = this._matches.length - 1;
        }

        // The Tournament's final match should be remebered as the champion match.
        this._champion = this._matches[end];
    };

    /**
     * Returns the current champion's value and excludes it from the Tournament by writing a "null" value 
     * to its index in "_leafs" array, then finds a new champion by playing all necessary matches bottom-up 
     * to the final match.
     * @returns {*} The value of the Tournament's ex-champion.
     */
    Tournament.prototype.extractChampion = function() {
        // The index of the champion's value.
        var index = this._champion.result;

        // The champion's value.
        var res = this._leafs[index];

        // Exclude the champions' value from participants. Now the champion is ex-champion.
        this._leafs[index] = null;
        /* 
            Calculating a pointer to the first ex-champion's match. A match has two participants, 
            so simply divide the index of the ex-champion by two if it is an even number;
            if it is an odd number, decrease it by one first.
        */
        if (index % 2 == 1) {
            index--;
        }
        index /= 2;

        // Replaying all necessary matches bottom-up to find a new champion.
        this._matches[index].playFromLeafs();

        return res;
    };
    // the end of Tournament tree classes

    // the beginning of Subarray class
    /**
     * Constructs a subarray.
     * @param {number} from Left index of the subarray.
     * @param {number} to Right index of the subarray.
     */
    function Subarray(from, to) {
        this.from = from;
        this.to = to;
    }

    /**
     * Returns a size of the subarray.
     * @returns {number} A size of the subarray.
     */
    Subarray.prototype.length = function() {
        return this.to - this.from;
    };

    /**
     * Sets boundaries of the subarray.
     * @param {number} from Left index of the subarray.
     * @param {number} to Right index of the subarray.
     */
    Subarray.prototype.set = function(from, to) {
        this.from = from;
        this.to = to;
    };
    // the end of Subarray class

    // the beginning of Pull class
    /**
     * Constructs a Pull.
     */
    function Pull() {
        this.range = new Subarray(0, 0);
        this.from = 0;
        this.to = 0;
        this.count = 0;
    }

    /**
     * Resets Pull's properties to default values.
     */
    Pull.prototype.reset = function() {
        this.range.set(0, 0);
        this.from = 0;
        this.to = 0;
        this.count = 0;
    };
    // the end of Pull class

    // the beginning of StepIterator class
    /**
     * Constructs a StepIterator.
     * @param {number} length The length of a sequence.
     * @param {number} step The iteration step.
     */
    function StepIterator(length, step) {
        /**@private */
        this._size = length;

        /**Maximal possible k where 2^k <= this._size
         * @private */
        this._pow = (function(x) {
            var k = 1;

            while (k > 0 && k <= x) {
                k <<= 1;
            }

            return k >>> 1;
        })(this._size);

        /**@private */
        this._denominator = Math.floor(this._pow / step);

        /**@private */
        this._numerator = 0;

        /**@private */
        this._decimal = 0;

        /**@private */
        this._numeratorStep = this._size % this._denominator;

        /**@private */
        this._decimalStep = Math.floor(this._size / this._denominator);
    }

    /**
     * Sets StepIterator to initial state.
     */
    StepIterator.prototype.begin = function() {
        this._numerator = 0;
        this._decimal = 0;
    };

    /**
     * Checks if further iterations are not possible.
     * @returns {boolean} The boolean result.
     */
    StepIterator.prototype.finished = function() {
        return this._decimal >= this._size;
    };

    /**
     * Returns the StepIterator's step.
     * @returns {number} The StepIterator's step.
     */
    StepIterator.prototype.length = function() {
        return this._decimalStep;
    };

    /**
     * Calculates and returns a next possible Subarray.
     * @returns {Subarray} The next range.
     */
    StepIterator.prototype.nextRange = function() {
        var start = this._decimal;

        this._decimal += this._decimalStep;
        this._numerator += this._numeratorStep;

        if (this._numerator >= this._denominator) {
            this._numerator -= this._denominator;
            this._decimal++;
        }

        return new Subarray(start, this._decimal);
    };

    /**
     * Switches StepIterator to the next iteration level by increasing step.
     * @returns {boolean} The boolean value that indicates if switching to the next iteration level was successful.
     */
    StepIterator.prototype.nextLevel = function() {
        this._decimalStep += this._decimalStep;
        this._numeratorStep += this._numeratorStep;

        if (this._numeratorStep >= this._denominator) {
            this._numeratorStep -= this._denominator;
            this._decimalStep++;
        }

        return this._decimalStep < this._size;
    };
    // the end of StepIterator class

    /**
     * The storage of various binary search methods.
     */
    var BinarySearch = {
        /**
         * Binary search for an index of first appropriate element in array.
         * @param {arrayElement} value An input value to search.
         * @param {Array} arr An input array.
         * @param {number} first The left boundary of search area.
         * @param {number} last The right boundary of search area.
         * @param {compareFunc} compareFunc Compares two values and returns a numeric result.
         * @returns {number} An index of first appropriate element.
         */
        left: function(value, arr, first, last, compareFunc) {
            var mid, floor = Math.floor;

            while (first < last) {
                mid = first + floor((last - first) / 2);

                if (compareFunc(arr[mid], value) < 0) {
                    first = mid + 1;
                } else {
                    last = mid;
                }
            }

            return first;
        },
        /**
         * Binary search for an index of last appropriate element in array.
         * @param {arrayElement} value An input value to search.
         * @param {Array} arr An input array.
         * @param {number} first The left boundary of search area.
         * @param {number} last The right boundary of search area.
         * @param {compareFunc} compareFunc Compares two values and returns a numeric result.
         * @returns {number} An index of last appropriate element.
         */
        right: function(value, arr, first, last, compareFunc) {
            var mid, floor = Math.floor;

            while (first < last) {
                mid = first + floor((last - first) / 2);

                if (compareFunc(arr[mid], value) <= 0) {
                    first = mid + 1;
                } else {
                    last = mid;
                }
            }

            return first;
        },
        /**
         * Linear search for an index of leftmost appropriate block beginning, then binary search 
         * for an index of first appropriate value in that block. Used in Sorting.blockSort.
         * @param {arrayElement} value An input value to search.
         * @param {Array} arr An input array.
         * @param {number} first The left boundary of search area.
         * @param {number} last The right boundary of search area.
         * @param {number} unique A number of unique values used for blocks' tagging.
         * @param {compareFunc} compareFunc Compares two values and returns a numeric result.
         * @returns {number} An index of first appropriate element in the leftmost found block.
         */
        firstForward: function(value, arr, first, last, unique, compareFunc) {
            var l = last - first;

            if (l == 0) {
                return first;
            }

            var i, skip = Math.max(Math.floor(l / unique), 1);

            for (i = first + skip; compareFunc(arr[i - 1], value) < 0; i += skip) {
                if (i >= last - skip) {
                    return BinarySearch.left(value, arr, i, last, compareFunc);
                }
            }

            return BinarySearch.left(value, arr, i - skip, i, compareFunc);
        },
        /**
         * Linear search for an index of leftmost appropriate block beginning, then binary search 
         * for an index of last appropriate value in that block. Used in Sorting.blockSort.
         * @param {arrayElement} value An input value to search.
         * @param {Array} arr An input array.
         * @param {number} first The left boundary of search area.
         * @param {number} last The right boundary of search area.
         * @param {number} unique A number of unique values used for blocks' tagging.
         * @param {compareFunc} compareFunc Compares two values and returns a numeric result.
         * @returns {number} An index of last appropriate element in the leftmost found block.
         */
        lastForward: function(value, arr, first, last, unique, compareFunc) {
            var l = last - first;

            if (l == 0) {
                return first;
            }

            var i, skip = Math.max(Math.floor(l / unique), 1);

            for (i = first + skip; compareFunc(arr[i - 1], value) <= 0; i += skip) {
                if (i >= last - skip) {
                    return BinarySearch.right(value, arr, i, last, compareFunc);
                }
            }

            return BinarySearch.right(value, arr, i - skip, i, compareFunc);
        },
        /**
         * Linear search for an index of rightmost appropriate block beginning, then binary search 
         * for an index of first appropriate value in that block. Used in Sorting.blockSort.
         * @param {arrayElement} value An input value to search.
         * @param {Array} arr An input array.
         * @param {number} first The left boundary of search area.
         * @param {number} last The right boundary of search area.
         * @param {number} unique A number of unique values used for blocks' tagging.
         * @param {compareFunc} compareFunc Compares two values and returns a numeric result.
         * @returns {number} An index of first appropriate element in the rightmost found block.
         */
        firstBackward: function(value, arr, first, last, unique, compareFunc) {
            var l = last - first;

            if (l == 0) {
                return first;
            }

            var i, skip = Math.max(Math.floor(l / unique), 1);

            for (i = last - skip; i > first && compareFunc(arr[i - 1], value) >= 0; i -= skip) {
                if (i < first + skip) {
                    return BinarySearch.left(value, arr, first, i, compareFunc);
                }
            }

            return BinarySearch.left(value, arr, i, i + skip, compareFunc);
        },
        /**
         * Linear search for an index of rightmost appropriate block beginning, then binary search 
         * for an index of last appropriate value in that block. Used in Sorting.blockSort.
         * @param {arrayElement} value An input value to search.
         * @param {Array} arr An input array.
         * @param {number} first The left boundary of search area.
         * @param {number} last The right boundary of search area.
         * @param {number} unique A number of unique values used for blocks' tagging.
         * @param {compareFunc} compareFunc Compares two values and returns a numeric result.
         * @returns {number} An index of last appropriate element in the rightmost found block.
         */
        lastBackward: function(value, arr, first, last, unique, compareFunc) {
            var l = last - first;

            if (l == 0) {
                return first;
            }

            var i, skip = Math.max(Math.floor(l / unique), 1);

            for (i = last - skip; i > first && compareFunc(arr[i - 1], value) > 0; i -= skip) {
                if (i < first + skip) {
                    return BinarySearch.right(value, arr, first, i, compareFunc);
                }
            }

            return BinarySearch.right(value, arr, i, i + skip, compareFunc);
        },
        /**
         * Binary search for an index of first appropriate value in array containing empty elements.
         * @param {arrayElement} value An input value to search.
         * @param {Array} arr An input array.
         * @param {number} last The right boundary of search area.
         * @param {function(arrayElement): boolean} isEmpty Checks if the element has empty value.
         * @param {compareFunc} compareFunc Compares two values and returns a numeric result.
         * @returns {number} An index of last appropriate element in the rightmost found block.
         */
        withGaps: function(value, arr, last, isEmpty, compareFunc) {
            var first = 0,
                mid, tmp, floor = Math.floor;

            while (first <= last) {
                // Adjust search area.
                while (first <= last && isEmpty(arr[last])) last--;
                while (first <= last && isEmpty(arr[first])) first++;

                mid = first + floor((last - first) / 2);

                /*
                    If middle element is empty: 
                    1. Lineary checking for rightmost non-empty value.
                    2. If it is smaller than input value, adjust search area and continue.
                    3. Lineary checking for leftmost non-empty value.
                    4. If it is smaller than input value, return found index.
                    In other case adjust search area.
                */
                if (isEmpty(arr[mid])) {
                    tmp = mid + 1;

                    while (tmp < last && isEmpty(arr[tmp])) tmp++;

                    if (compareFunc(arr[tmp], value) > 0) {
                        while (mid > first && isEmpty(arr[mid])) mid--;

                        if (compareFunc(arr[mid], value) < 0) {
                            return mid;
                        }

                        last = mid - 1;
                    } else {
                        first = tmp + 1;
                    }
                } else if (compareFunc(arr[mid], value) < 0) {
                    first = mid + 1;
                } else {
                    last = mid - 1;
                }
            }

            // Return last non-empty element index.

            if (last >= 0 && isEmpty(arr[last])) last--;

            return last;
        },
        /**
         * Binary search for an index of first appropriate topmost element in piles array.
         * @param {Array.<Array>} piles A two-dimensional input array.
         * @param {arrayElement} value An input value to search.
         * @param {compareFunc} compareFunc Compares two values and returns a numeric result.
         * @returns {number} An index of first appropriate topmost element in piles array.
         */
        topPile: function(piles, value, compareFunc) {
            var l = 0,
                r = piles.length,
                mid, pile,
                floor = Math.floor;

            while (l < r) {
                mid = l + floor((r - l) / 2);

                pile = piles[mid];

                // Compare input value with topmost element of the middle pile.
                if (compareFunc(value, pile[pile.length - 1]) < 0) {
                    r = mid;
                } else {
                    l = mid + 1;
                }
            }

            return l;
        }
    };

    /**
     * Copies values from one array to another from left to right.
     * @param {Array} arr1 Array to read.
     * @param {Array} arr2 Array to write.
     * @param {number} s1 The leftmost index of subarray to read.
     * @param {number} f1 The rightmost index of subarray to read.
     * @param {number} s2 The leftmost index of subarray to write.
     */
    function writeOneArrayToAnother(arr1, arr2, s1, f1, s2) {
        while (s1 <= f1) {
            arr2[s2] = arr1[s1];
            s1++;
            s2++;
        }
    }

    /**
     * Copies values from one array to another from right to left.
     * @param {Array} arr1 Array to read.
     * @param {Array} arr2 Array to write.
     * @param {number} s1 The rightmost index of subarray to read.
     * @param {number} f1 The leftmost index of subarray to read.
     * @param {number} s2 The rightmost index of subarray to write.
     */
    function writeOneArrayToAnotherDownwards(arr1, arr2, s1, f1, s2) {
        while (s1 >= f1) {
            arr2[s2] = arr1[s1];
            s1--;
            s2--;
        }
    }

    /**
     * Reverses an array in given boundaries.
     * @param {Array} arr Array to reverse.
     * @param {number} start Left boundary.
     * @param {number} end Right boundary.
     * @param {exchangeFunc} exchangeFunc Exchanges two elements of array.
     */
    function flipElementsOfArray(arr, start, end, exchangeFunc) {
        var i;

        for (i = start; i < end; i++, end--) {
            exchangeFunc(arr, i, end);
        }
    }

    /**
     * Returns a character code of a string from given position.
     * @param {string} s Input string.
     * @param {number} i Index of symbol in the string.
     * @returns {number} Character code of given position or -1 if there is no any symbol.
     */
    function getCharCodeAt(s, i) {
        if (i >= s.length) {
            return -1;
        }

        return s.charCodeAt(i);
    }

    /**
     * Establishes the min-heap property for a given root index.
     * @param {*} arr Input array.
     * @param {*} root An index of the root of a heap.
     * @param {compareFunc} compareFunc Compares two values and returns a numeric result.
     * @param {exchangeFunc} exchangeFunc Exchanges two elements of input array receiveing the array and two indices as parameters.
     */
    function minHeapify(arr, root, compareFunc, exchangeFunc) {
        var smallest = root,
            l, r, len = arr.length;

        while (true) {
            root = smallest;
            l = 2 * root + 1;
            r = 2 * root + 2;

            // Find smallest element among the root and it's children.
            if (l < len) {
                if (compareFunc(arr[l], arr[smallest]) < 0) {
                    smallest = l;
                }
            }
            if (r < len) {
                if (compareFunc(arr[r], arr[smallest]) < 0) {
                    smallest = r;
                }
            }
            /* 
                If root is less than it's children it means that the min-heap property established.
                In other case put the smallest element to root position.
            */
            if (smallest == root) {
                break;
            } else {
                exchangeFunc(arr, smallest, root);
            }
        }
    }

    /**
     * Subarray heap sort algorithm implementation based on max-heap data structure.
     * @param {Array} arr Input array.
     * @param {number} l An index of the beginning of subarray to sort.
     * @param {number} r An index of the end of subarray to sort.
     * @param {compareFunc} compareFunc Compares two values and returns a numeric result.
     * @param {exchangeFunc} exchangeFunc Exchanges two elements of input array receiveing the array and two indices as parameters.
     * @returns {Array} Input array with sorted subarray.
     */
    function heapSortWorker(arr, l, r, compareFunc, exchangeFunc) {
        var i, rr = r + 1;

        /**
         * Establishes the max-heap property for a given root index.
         * @param {number} pivot An index of the heap right boundary.
         * @param {number} root An index of the root of a heap.
         * @param {number} leftShift An index of the heap left boundary.
         */
        var heapify = function(pivot, root, leftShift) {
            var largest = root,
                l, r;

            while (true) {
                root = largest;
                l = 2 * root + 1 - leftShift;
                r = 2 * root + 2 - leftShift;

                // Find greatest element among the root and it's children.
                if (l < pivot) {
                    if (compareFunc(arr[l], arr[largest]) > 0) {
                        largest = l;
                    }
                }
                if (r < pivot) {
                    if (compareFunc(arr[r], arr[largest]) > 0) {
                        largest = r;
                    }
                }
                /* 
                    If root is greater than it's children it means that the max-heap property established.
                    In other case put the largest element to root position.
                */
                if (largest == root) {
                    break;
                } else {
                    exchangeFunc(arr, largest, root);
                }
            }
        };

        // Turn the subarray into max-heap with root at leftmost boundary.
        for (i = l + Math.floor((rr - l) / 2 - 1); i >= l; i--) {
            heapify(rr, i, l);
        }
        /* 
            Put the largest value to the right and exclude if from further consideration.
            Then heapify the rest part of the subarray.
        */
        for (i = r; i >= l; i--) {
            exchangeFunc(arr, l, i);
            heapify(i, l, l);
        }

        return arr;
    }

    /**
     * Subarray insertion sort algorithm implementation.
     * @param {Array} arr Input array.
     * @param {number} startIndex An index of the beginning of subarray to sort.
     * @param {number} endIndex An index of the end of subarray to sort.
     * @param {compareFunc} compareFunc Compares two values and returns a numeric result.
     * @param {insertFunc} insertFunc Inserts a value into array into given position.
     * @returns {Array} Input array with sorted subarray.
     */
    function insertionSortWorker(arr, startIndex, endIndex, compareFunc, insertFunc) {
        var i = startIndex,
            j, l = endIndex + 1,
            x;

        for (; i < l; i++) {
            // Consider a value.
            x = arr[i];
            j = i;
            /*
                While considering value is less than a previous value, shift all such previous values
                one step forward and finally insert considering value into correct place.
            */
            while (j > startIndex && compareFunc(x, arr[j - 1]) < 0) {
                insertFunc(arr[j - 1], arr, j);
                j--;
            }

            insertFunc(x, arr, j);
        }

        return arr;
    }

    /**
     * Subarray bubble sort algorithm implementation.
     * @param {Array} arr Input array.
     * @param {number} startIndex An index of the beginning of subarray to sort.
     * @param {number} endIndex An index of the end of subarray to sort.
     * @param {compareFunc} compareFunc Compares two values and returns a numeric result.
     * @param {exchangeFunc} exchangeFunc Exchanges two elements of input array receiveing the array and two indices as parameters.
     * @returns {Array} Input array with sorted subarray.
     */
    function bubbleSortWorker(arr, startIndex, endIndex, compareFunc, exchangeFunc) {
        var notSorted = true,
            i, l = endIndex + 1;

        while (notSorted) {
            // Lets expect that sorting is done, so need to check if the order is correct.
            notSorted = false;

            for (i = startIndex; i < l; i++) {
                /* 
                    If the incorrect order found, swap two elements to fix it.
                    Also we can't expect that subarray is sorted anymore.
                */
                if (compareFunc(arr[i], arr[i + 1]) > 0) {
                    exchangeFunc(arr, i, i + 1);
                    notSorted = true;
                }
            }
        }

        return arr;
    }

    /**
     * Wraps a sorting function to fix missing arguments when calling.
     * @param {sortFunc} func An input sorting function.
     * @returns {sortFunc} A wrapped sorting function, which arguments are checking on each call.
     */
    function getWrapper(func) {
        // Getting parameters names.
        var params = Function.toString.call(func)
            .replace(/[/][/].*$/mg, '')
            .replace(/\s+/g, '')
            .replace(/[/][*][^/*]*[*][/]/g, '')
            .split('){', 1)[0].replace(/^[^(]*[(]/, '')
            .replace(/=[^,]+/g, '')
            .split(',').filter(Boolean);

        return function() {
            // This function executes on each call of any enumerable Sorting's method.
            var i, l = params.length,
                args = [];

            if (Array.isArray(arguments[0])) {
                // Don't sort single element arrays.
                if (arguments[0].length <= 1) return arguments[0];

                args.push(arguments[0]);
            } else {
                // If no array was provided.
                throw new TypeError("invalid arguments: no array to sort");
            }

            // If any service functions were not provided, use ones from DefaultFunctions instead.
            for (i = 1; i < l; i++) {
                if (typeof arguments[i] === "function") {
                    args.push(arguments[i]);
                } else {
                    args.push(DefaultFunctions[params[i]]);
                }
            }

            // Applying new fixed arguments to the sorting function.
            return func.apply(Sorting, args);
        };
    }

    /*
        Defining non-enumerable "length" property, which value is an 
        amount of user-available Sorting's methods.
        Also wrapping those methods to fix such possibly missed arguments
        as service functions of compare, exchange and etc.
    */
    Object.defineProperty(Sorting, "length", {
        value: (function() {
            var amount = 0;

            for (var prop in Sorting) {
                if (typeof Sorting[prop] === "function") {
                    Sorting[prop] = getWrapper(Sorting[prop]);
                    amount++;
                }
            }

            return amount;
        })(),
        writable: false
    });

    /**
     * The storage of default service functions.
     */
    var DefaultFunctions = {
        /**
         * Compares two values and returns a numeric result.
         * @type {compareFunc}
         * @param {*} a Value to compare.
         * @param {*} b Value to compare.
         * @returns {number} A number: positive when a > b, negative when a < b, zero when a = b.
         */
        compareFunc: function(a, b) {
            if (a > b) return 1;
            if (a < b) return -1;
            return 0;
        },
        /**
         * Exchanges two elements of input array receiveing the array and two indices as parameters.
         * @type {exchangeFunc}
         * @param {Array} a Input array.
         * @param {number} i Index of position to exchange.
         * @param {number} j Index of position to exchange.
         */
        exchangeFunc: function(a, i, j) {
            var tmp = a[i];
            a[i] = a[j];
            a[j] = tmp;
        },
        /**
         * Inserts a value into array into given position.
         * @type {insertFunc}
         * @param {*} value A value to insert.
         * @param {Array} a Array to made the insertion.
         * @param {number} i Index to insert the value.
         */
        insertFunc: function(value, a, i) {
            a[i] = value;
        },
        /**
         * Returns a pivoting value in input array in given boundaries.
         * @type {getPivot}
         * @param {Array} arr Input array.
         * @param {number} l Left boundary of subarray.
         * @param {number} r Right boundary of subarray.
         * @returns {arrayElement} Pivoting value inside given boundaries.
         */
        getPivot: function(arr, l, r) {
            return arr[l + r >> 1];
        },
        /**
         * Maps the input value to the numeric value (hashes input value).
         * @type {mapKey}
         * @param {number} val A value to hash.
         * @param {number} l The length of input values sequence.
         * @param {Array.<number>} m Two elements array of minimum and maximum values in input sequence.
         * @returns {number} Hash value.
         */
        mapKey: function(val, l, m) {
            var diff = m[1] - m[0];
            if (diff == 0) {
                return 0;
            }
            return Math.floor((l - 1) * (val - m[0]) / diff);
        },
        /**
         * Hashes the input value (by default the input value just returned).
         * @type {getKey}
         * @param {arrayElement} e An input value to hash.
         * @returns {?} Output value
         */
        getKey: function(e) {
            return e;
        },
        /**
         * Returns the array of ascending numbers started with 1.
         * By default returns the Tokuda's set of increments <https://oeis.org/A108870> (1992).
         * @type {getGaps}
         * @param {number} l Length of an array to sort.
         * @returns {Array.<number>} An array of ascending integers.
         */
        getGaps: function(l) {
            var gaps = [1, 4, 9, 20, 46, 103, 233, 525, 1182,
                    2660, 5985, 13467, 30301, 68178, 153401,
                    345152, 776591, 1747331, 3931496, 8845866,
                    19903198, 44782196, 100759940, 226709866,
                    510097200, 1147718700, 2582367076,
                    5810325920, 13073233321, 29414774973
                ], //Tokuda, 1992
                h = Math.max(1, l / 2),
                i, gl, res = [1];

            for (i = 1, gl = gaps.length; i < gl; i++) {
                if (gaps[i] < h) {
                    res.push(gaps[i]);
                } else {
                    break;
                }
            }

            return res;
        },
        /**
         * A function to sort an array. Used as the default sorting function in bucket sort.
         * @type {sortFunc}
         */
        sortFunc: Sorting.quickSortDP
    };

    /**
     * Generates the array of integers.
     * @param {Object} options An object with options.
     * @param {number} options.min The minimal value in the array.
     * @param {number} options.max The maximal value in the array.
     * @param {number} options.length The array's length.
     * @param {number=} options.step The gap between two neighbour values in the array (only if options.byOrder is true). Default value is 1.
     * @param {boolean=} options.byOrder Defines if the array will contain sorted or random numbers. Default value is false.
     * @returns {Array.<number>} The array of integers.
     * @throws {TypeError} Invalid arguments.
     * @throws {Error} Invalid options.
     * @throws {RangeError} Invalid options.
     */
    function generateArrayOfInt(options) {
        var opt = {
                min: 0,
                max: null,
                length: null,
                step: 1,
                byOrder: false
            },
            i, j = 0,
            step, l, lset, maxset, max = Infinity,
            ml = Infinity,
            isInt = Number.isInteger,
            rand = Math.random,
            floor = Math.floor,
            num, output = [];

        // Filling up options by user-given values.
        if (typeof options === "object") {
            for (var prop in options) {
                opt[prop] = options[prop];
            }
        } else {
            // If no options provided.
            throw new TypeError("invalid arguments: options should be an instance of object");
        }

        // If the minimal value is incorrect.
        if (!isInt(opt.min)) {
            throw new Error("invalid options: set correct min");
        }

        lset = isInt(opt.length);
        maxset = isInt(opt.max);

        // If one of maximal or length values is incorrect, its not possible generate an array, so throw an Error.
        if (!(maxset || lset)) {
            throw new Error("invalid options: set correct max or length");
        } else if (lset && opt.length <= 0) {
            throw new RangeError("invalid options: length should be greater than zero");
        }

        // If used provided an incorrect step.
        if (!isInt(opt.step) || opt.step == 0) {
            throw new Error("invalid options: set correct step");
        }

        step = opt.step;

        // "ml" is max possible length of the array.
        if (lset) {
            ml = opt.length;
        }

        // Calculating the maximal possible value if it wasn't given by user.
        if (maxset) {
            max = opt.max;
        } else {
            max = opt.min + opt.length * step;
        }

        l = max + 1;
        i = opt.min;

        // Filling up the output array with numbers.
        if (opt.byOrder) {
            while (i < l) {
                output.push(i < max ? i : max);
                i = i + step;
                j++;
                if (j == ml) break;
            }
        } else {
            while (i < l) {
                num = floor(opt.min + l * rand());
                output.push(num < max ? num : max);
                i++;
                j++;
                if (j == ml) break;
            }
        }

        return output;
    }

    /**
     * Generates the array of strings with given size.
     * @param {number} l The size of the generated array.
     * @returns {Array.<string>} The array of strings.
     */
    function generateArrayOfStr(l) {
        var i, b, j, output = [],
            randStr;

        for (i = 0; i < l; i++) {
            // "b" is the length of the current string.

            b = 1 + Math.floor(30 * Math.random());
            //b = 1 + Math.floor(5*Math.random());

            randStr = "";

            // Filling the string with random characters.
            for (j = 0; j < b; j++) {
                randStr += String.fromCharCode(32 + Math.floor((255 - 32) * Math.random()));
                //randStr += String.fromCharCode(97 + Math.floor((123 - 97)*Math.random()));
            }

            output.push(randStr);
        }

        return output;
    }

    /**
     * Performs a given amount of tests by arrays of numbers of a given size. It uses same array of integers for each test.
     * Results are displayed in the console using console.table.
     * @param {number=} l The length of the each array for sorting. The default value is 1000.
     * @param {number=} tests The number of tests to perform. The default value is 1.
     */
    function test(l, tests) {
        if (!l) l = 1000;
        if (!tests) tests = 1;

        var arrs = [],
            arr, start, i, j, g, h,
            results = [];

        /* 
            Initialising the array of results for each function 
            except few strings-only and too slow ones.
        */
        for (var prop in Sorting) {
            if (prop == "radixMSDQuickSort" ||
                prop == "radixMSDSort" ||
                prop == "americanFlagSort" ||
                prop == "stoogeSort" ||
                prop == "beadSort") 
            {
                continue;
            }

            results.push({
                name: prop,
                func: Sorting[prop],
                res: [],
                average: 0,
                results: ""
            });
        }    

        h = results.length;
        for (i = 0; i < h; i++) {
            arrs.push([]);
        }

        console.log("Using same array of", l, "integer values for each test.", "\nAll values below are given in ms", "\nPerforming", tests, "tests...");

        // Performing the number of tests.
        for (j = 0; j < tests; j++) {
            // Generating an array to sort.
            arr = generateArrayOfInt({
                length: l
            });

            for (g = 0; g < h; g++) {
                // Copy the generated array for each function to test independently.
                for (i = 0; i < l; i++) {
                    arrs[g].push(arr[i]);
                }

                // Measure time.
                start = performance.now();
                results[g].func(arrs[g]);
                results[g].res.push(Number(performance.now() - start));
            }
        }

        // Calculating an average time and formating results.
        for (g = 0; g < h; g++) {

            results[g].average = Number((results[g].res.reduce(function(r, val) {
                r += Number(val);
                return r;
            }, 0) / results[g].res.length).toFixed(2));

            results[g].results = results[g].res.join(", ");
        }

        // Displaying the results as a table.
        console.table(results, ["name", "average", "results"]);
    }

    /**
     * Performs a test of a given sorting function using an array of random numbers of a given size.
     * @param {sortFunc=} func A sorting function. By default the Sorting.quickSort is used. 
     * @param {number=} l The length of the array. The default value is 5000.
     * @throws {Error} Incorrect sorting.
     */
    function testNumbers(func, l) {
        // If a sorting function isn't provided, use Sorting.quickSort by default.
        if (typeof func !== "function") {
            func = Sorting.quickSort;
            console.log("Sorting.testNumbers receives a sorting function as a first argument (like Sorting.quickSort)");
            console.log("Testing Sorting.quickSort as default");
        }

        if (!l) l = 5000;

        // Generating the array to sort.
        var arr = generateArrayOfInt({
                length: l
            }),
            arr2 = [],
            i, start, done,
            // Keep tracking numbers of comparisons, exchanges and insertions.
            compAmount = 0,
            swapAmount = 0,
            insAmount = 0;

        // Copy the generated array.
        for (i = 0; i < arr.length; i++) {
            arr2.push(arr[i]);
        }

        // Starting to measure time.
        start = performance.now();
        /*
            Sorting the generated array's copy tracking numbers of 
            comparisons, exchanges and insertions.
        */
        arr2 = func(arr2,
            function(a, b) {
                compAmount++;

                return a - b;
            },
            function(a, i, j) {
                var tmp = a[i];
                a[i] = a[j];
                a[j] = tmp;

                swapAmount++;
            },
            function(value, a, i) {
                a[i] = value;

                insAmount++;
            }
        );

        // Stopping to measure time.
        done = performance.now() - start;

        // If the length violation is found, throw an error.
        if (arr.length != arr2.length) {
            console.log("Array length violation: from", arr.length, "to", arr2.length);
            console.log(arr, arr2);
            throw new Error("incorrect sorting");
        }

        // If the violation of order or empty elements are found, throw an error.
        for (i = 1; i < arr2.length; i++) {
            if (arr2[i] < arr2[i - 1] || arr2[i] == null || arr2[i] === undefined) {
                console.log("arr[", i - 1, "] =", arr2[i - 1]);
                console.log("arr[", i, "] =", arr2[i]);
                console.log(arr, arr2);
                throw new Error("incorrect sorting");
            }
        }

        console.log("Array of", l, "integers sorted successfully in", done, "ms");
        console.log("Used:", compAmount, "comparisons,", swapAmount, "swaps,", insAmount, "insertions");
    }

    /**
     * Performs a test of a given sorting function using an array of random strings of a given size.
     * @param {sortFunc} func A sorting function. By default the Sorting.radixMSDSort is used. 
     * @param {number=} l The length of the array. The default value is 5000.
     * @throws {Error} Incorrect sorting.
     */
    function testStrings(func, l) {
        // If a sorting function isn't provided, use Sorting.radixMSDSort by default.
        if (typeof func !== "function") {
            func = Sorting.radixMSDSort;
            console.log("Sorting.testStrings receives a sorting function as a first argument (like Sorting.radixMSDSort)");
            console.log("Testing Sorting.radixMSDSort as default");
        }

        if (!l) l = 5000;

        // Generating the array to sort.
        var arr = generateArrayOfStr(l),
            arr2 = [],
            i, start, done,
            // Keep tracking numbers of comparisons, exchanges and insertions.
            compAmount = 0,
            swapAmount = 0,
            insAmount = 0;

        // Copy the generated array.
        for (i = 0; i < arr.length; i++) {
            arr2.push(arr[i]);
        }

        // Starting to measure time.
        start = performance.now();
        /*
            Sorting the generated array's copy tracking numbers of 
            comparisons, exchanges and insertions.
        */
        arr2 = func(arr2,
            function(a, b) {
                compAmount++;

                if (a > b) return 1;
                if (a < b) return -1;
                return 0;
            },
            function(a, i, j) {
                var tmp = a[i];
                a[i] = a[j];
                a[j] = tmp;

                swapAmount++;
            },
            function(value, a, i) {
                a[i] = value;

                insAmount++;
            }
        );

        // Stopping to measure time.
        done = performance.now() - start;

        // If the length violation is found, throw an error.
        if (arr.length != arr2.length) {
            console.log("Array length violation: from", arr.length, "to", arr2.length);
            console.log(arr, arr2);
            throw new Error("incorrect sorting");
        }

        // If the violation of order or empty elements are found, throw an error.
        for (i = 1; i < arr.length; i++) {
            if (arr2[i] < arr2[i - 1] || arr2[i] == null || arr2[i] === undefined) {
                console.log("arr[", i - 1, "] =", arr2[i - 1]);
                console.log("arr[", i, "] =", arr2[i]);
                console.log(arr2);
                throw new Error("incorrect sorting");
            }
        }

        console.log("Array of", l, "strings sorted successfully in", done, "ms");
        console.log("Used:", compAmount, "comparisons,", swapAmount, "swaps,", insAmount, "insertions");
    }

    // Defining non-enumerable methods of testing.
    Object.defineProperty(Sorting, "test", {
        value: test,
        writable: false
    });

    Object.defineProperty(Sorting, "testNumbers", {
        value: testNumbers,
        writable: false
    });

    Object.defineProperty(Sorting, "testStrings", {
        value: testStrings,
        writable: false
    });

    // Adding exports support (taken from here: <https://gist.github.com/CrocoDillon/9990078>).

    // AMD support
    if (typeof define === 'function' && define.amd) {
        define(function() {
            return Sorting;
        });
        // CommonJS and Node.js module support.
    } else if (typeof exports !== 'undefined') {
        // Support Node.js specific `module.exports` (which can be a function)
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = Sorting;
        }

        // But always support CommonJS module 1.1.1 spec (`exports` cannot be a function)
        exports.Sorting = Sorting;
    } else {
        global.Sorting = Sorting;
    }
})(this);