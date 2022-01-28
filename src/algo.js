
// Input: A 2D Matrix of {bool, Vec3}
//
// Goal: Given a start and end node, find the shortest path to the end node.
//
// Requirements
// Assign every "true" node a G, H and F cost.
// G cost is normal distance to START node
// H cost is euclidean distance to END node
// F cost = G + H
//
// Assign every "true" node a prev node
//
// Need a priority queue
//

import {Heap} from '../node_modules/heap-js/dist/heap-js.es5.js';

let minHeap = new Heap();
minHeap.push("b");
minHeap.push("a");
minHeap.push("c");

console.log(minHeap);


let n = {
    x:0,
    y:0,
    z:0
}

let m = {
    x:3,
    y:4,
    z:12
}

function aStarSearch(grid, start, end) {

}

function euDist(a, b) {
    return Math.sqrt(Math.pow(Math.abs(a.x - b.x), 2) + Math.pow(Math.abs(a.y - b.y), 2) +
        Math.pow(Math.abs(a.z - b.z), 2)); // TODO make it in "a.coord.x" format
}