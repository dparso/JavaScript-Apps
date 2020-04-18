/*
	Corners:
	a 	b

	c 	d

	Then bounding box segments are
	ab, bd, dc, ca
	Clockwise around box
*/

// segment intersection from https://www.geeksforgeeks.org/check-if-two-given-line-segments-intersect/

// Given three colinear points p, q, r, the function checks if 
// point q lies on line segment 'pr' 
// function onSegment(p, q, r) {
// 	if(q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) && 
// 	   q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y)) {
// 		return true;
// 	}

// 	return false;
// }

function signedArea(p, q, r) {
	return (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x);
}

function collinear(p, q, r) {
	return signedArea(p, q, r) == 0;
}

function left(a, b, c) {
    return signedArea(a, b, c) > 0;
}
  
// function doIntersect(p, q) {
// 	let o1 = orientation(p.a, q.a, p.b);
// 	let o2 = orientation(p.a, q.a, q.b);
// 	let o3 = orientation(p.b, q.b, p.a);
// 	let o4 = orientation(p.b, q.b, q.a, true);

// 	// General case
// 	if(o1 != o2 && o3 != o4) {
// 		console.log(o1 + ", " + o2 + ", " + o3 + ", " + o4);
// 		return true;
// 	}

//     // Special Cases 
//     // p1, q1 and p2 are colinear and p2 lies on segment p1q1 
//     if (o1 == 0 && onSegment(p.a, p.b, q.a)) return true; 
  
//     // p1, q1 and q2 are colinear and q2 lies on segment p1q1 
//     if (o2 == 0 && onSegment(p.a, q.b, q.a)) return true; 
  
//     // p2, q2 and p1 are colinear and p1 lies on segment p2q2 
//     if (o3 == 0 && onSegment(p.b, p.a, q.b)) return true; 
  
//      // p2, q2 and q1 are colinear and q1 lies on segment p2q2 
//     if (o4 == 0 && onSegment(p.b, q.a, q.b)) return true; 

//     return false; // Doesn't fall in any of the above cases 
// }

/* handle collinear intersection case based on pseudocode from class */
function improperIntersect(a, b, c) {
    let maxX, minX, maxY, minY;
    
    maxX = Math.max(a.x, b.x);
    minX = Math.min(a.x, b.x);
    maxY = Math.max(a.y, b.y);
    minY = Math.min(a.y, b.y);
    
    return (c.x <= maxX && c.x >= minX && c.y <= maxY && c.y >= minY);
}

function intersects(r, s) {
	let intersect = 0;

    // check for 3 collinear points
    let c_1 = collinear(r.a, r.b, s.a);
    let c_2 = collinear(r.a, r.b, s.b);
    let c_3 = collinear(s.a, s.b, r.a);
    let c_4 = collinear(s.a, s.b, r.b);

    // call improperIntersect on any collinear points
    if(c_1) {
        intersect = improperIntersect(r.a, r.b, s.a);
    } else if(c_2) {
        intersect = improperIntersect(r.a, r.b, s.b);
    } else if(c_3) {
        intersect = improperIntersect(s.a, s.b, r.a);
    } else if(c_4) {
        intersect = improperIntersect(s.a, s.b, r.b);
    } else {
		let a = left(r.a, r.b, s.a);
		let b = left(r.a, r.b, s.b);
		let c = left(s.a, s.b, r.a);
		let d = left(s.a, s.b, r.b);
        
        intersect = ((a != b) && (c != d));
    }

    return intersect;
}