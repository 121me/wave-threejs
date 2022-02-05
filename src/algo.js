
// Input: A 2D Matrix of {bool, Vec3}
//
// Goal: Given a start and end node, find the shortest path to the end node.
//
// Requirements
// Assign every "true" node a G, H and F cost.
// G cost is path distance to START node
// H cost is euclidean distance to END node
// F cost = G + H
//
// Assign every "true" node a prev node
//
// Need a priority queue
//

import Heap from '../node_modules/heap-js/dist/heap-js.es5.js';


function compare(first, second) { // Todo add comparison for H values for equality
    if (first.F > second.F) {
        return 1;
    } else if (first.F < second.F) {
        return -1;
    } else return 0;
}


function aStarSearch(grid, start, end) {
    // Assign H costs to each element
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[0].length; j++) {
            let element = grid[i][j];
            if (element.hit === true) { // If the element is inside path // todo hit ?
                element.H = euDist(element, end); //todo pos ?
                element.G = Infinity;
                element.i = i;
                element.j = j;
            }
        }
    }

    let heap = new Heap(compare); // todo
    let curr = start;

    console.log("curr", curr);

    // From the start node, until we reach the end node, do this:
    // 1- "Check" every neighbor of current node (Relax + add to heap)
    // 2- Take the top element of heap
    do {
        // TODO when relaxing, how will i find the neighbours in heap to update it ?

        for (const arr of getNeighbors(curr.i, curr.j)) {
            let neighbor = grid
            if (neighbor.hit === true) { // If that neighbor is in the area (path)
                // Do the relaxation
                if (curr.G  < neighbor.G) { // todo check if this works correctly
                    neighbor.G = curr.G; // Update path distance
                    neighbor.F = neighbor.G + neighbor.H;
                    neighbor.prev = curr; // Update prev node

                    // TODO we don't remove the old version of the node if it exists
                    heap.push(neighbor);
                }
            }
        }

        curr = heap.pop();
    } while (curr !== end)

    // After the loop ends, backtrack from end to start node
    let path = [];
    curr = end;
    do {
        path.push(curr);
        curr = curr.prev;
    } while (curr !== start)

    return path;
}

// Return the neighboring nodes given a node
function getNeighbors(i, j, size) {
    // Straight and diagonal distances
    const straight = 1;
    const diagonal = 1.4;
    let arr = [];

    addArr(i - 1, j - 1, size, diagonal, arr);
    addArr(i, j - 1, size, straight, arr);
    addArr(i + 1, j - 1, size, diagonal, arr);
    addArr(i - 1, j , size, straight, arr);
    addArr(i + 1, j, size, straight, arr);
    addArr(i - 1, j + 1, size, diagonal, arr);
    addArr(i, j + 1, size, straight, arr);
    addArr(i + 1, j + 1, size, diagonal, arr);

    return arr;
}

// Add a node to the array if it is valid
function addArr(i, j, size, dist, arr) {
    if (isInside(i, j, size)) {
        arr.push([i, j, dist]);
    }
}

// Check if 0 <= i, j < size
function isInside(i, j, size) {
    return i < size && i >= 0 && j < size && j >= 0;
}

// Return the euclidean distance between two coordinates
function euDist(a, b) {
    return Math.sqrt(Math.pow(Math.abs(a.position.x - b.position.x), 2) +
        Math.pow(Math.abs(a.position.z - b.position.z), 2));
}

export {aStarSearch}