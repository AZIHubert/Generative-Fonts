function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length != b.length) return false;
  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

class DNA{
 constructor(){
   this.genotype = [];
   this.pixels = [];
   this.letters_probability = [];
   this.fitness = [];
   this.model_similarity_vector;
   this.letter_similarity_probability = 0;
   this.letters_probability_ratio = 0.99
   this.letter_similarity_ratio = 1 - this.letters_probability_ratio;
   this.next_point_random = 0.60;
   this.grid = 9;
   this.num_point = 7;
   this.margin = 10;
   this.weight_shape = [];
 }
 create_new_shape(){
   const num_points = 5;
   const shape = {points: [], property: ["open"]};
   for(let i = 0; i < num_points; i++){
     let point_x = int(random(0, this.grid));
     let point_y = int(random(0, this.grid));
     let weight_1 = random(1, this.margin);
     let weight_2 = random(1, this.margin);
     let point;
     if(i == 0){
       point = {position: {x: point_x, y: point_y}, weight: [weight_1, weight_2]};
     }else{
       if(random(0, 1) > 0.2){
         point = {position: {x: point_x, y: point_y}, weight: [weight_1, weight_2]};
       } else{
        const control_points_1 = random(0, 1);
        const control_points_2 = random(0, 1);
        point = {position: {x: point_x, y: point_y}, weight: [weight_1, weight_2], control_points:  [control_points_1, control_points_2]};
       }
     }
     shape.points.push(point);
   }
   this.genotype.push(shape);
   this.remove_empty_shape();
   //this.remove_double();
   //this.move_sub_shape();
   this.remove_first_bezier_point();
 }
 /* Check */
 display(show_skeleton){
   background(255);
   this.create_weight();
   if(show_skeleton){
     let sub_shapes = [];
     for(let i = 0; i < this.genotype.length; i++){
       const points = this.genotype[i].points.map(a => {return {...a}});
       sub_shapes.push({points: points, property: this.genotype[i].property});
     }
     let has_sub_shape = true;
     while(has_sub_shape){
       let count_sub_shape = 0;
       for(let i = 0; i < sub_shapes.length; i++){
         for(let j = 0; j < sub_shapes[i].points.length; j++){
           if(sub_shapes[i].points[j].hasOwnProperty('sub_shape')){
           count_sub_shape++;
             for(let k = 0; k < sub_shapes[i].points[j].sub_shape.length; k++){
               const attach = sub_shapes[i].points.map(a => {return {...a}});
               sub_shapes.push({points: sub_shapes[i].points[j].sub_shape[k].points.map(a => {return {...a}}), attach: attach[j].position, property: sub_shapes[i].points[j].sub_shape[k].property});
             }
             delete sub_shapes[i].points[j].sub_shape;
           }
         }
       }
       has_sub_shape = (count_sub_shape) ? true: false;
     }
     for(let shape of sub_shapes){
       stroke(255, 0, 0);
       noFill();
       beginShape();
       if(shape.hasOwnProperty("attach")){
         const point_x = map(shape.attach.x, 0, this.grid - 1, this.margin, width - this.margin);
         const point_y = map(shape.attach.y, 0, this.grid - 1, this.margin, width - this.margin);
         vertex(point_x, point_y);
       }
       for(let point of shape.points){
        const point_x = map(point.position.x, 0, this.grid - 1, this.margin, width - this.margin);
        const point_y = map(point.position.y, 0, this.grid - 1, this.margin, width - this.margin);
        vertex(point_x, point_y);
        ellipse(point_x, point_y, 5, 5);
       }
       if(shape.hasOwnProperty("attach") && shape.property.includes('close')){
         const point_x = map(shape.points[0].position.x, 0, this.grid - 1, this.margin, width - this.margin);
         const point_y = map(shape.points[0].position.y, 0, this.grid - 1, this.margin, width - this.margin);
         vertex(point_x, point_y);
       }
       if(shape.property.includes('close')){
         endShape(CLOSE);
       } else{
         endShape();
       }
     }
   }
 }
 /* Check */
 get_pixels(show_skeleton){
   if(this.pixels.length == 0){
     this.display(show_skeleton);
     loadPixels();
       for(let j = 0; j<width*height*4; j+=4){
         const p = ((pixels[j] + pixels[j+1] + pixels[j+2]) / 3)/255;
         this.pixels.push(p);
       }
     updatePixels();
   }
 }
 /* Check */
 crossover(parent_A, parent_B){
   const p_A = []
   for(let shape of parent_A){
     const points = shape.points.map(a => {return {...a}});
     p_A.push({
       points: points,
       property: shape.property
     });
   }
   const p_B = []
   for(let shape of parent_B){
     const points = shape.points.map(a => {return {...a}});
     p_B.push({
       points: points,
       property: shape.property
     });
   }
   const num_shape_A = p_A.length;
   const num_shape_B = p_B.length;
   const max_parent_length = (num_shape_A >= num_shape_B) ? num_shape_A : num_shape_B;
   const common_shape = max_parent_length - abs(num_shape_A - num_shape_B);
   for(let i = 0; i < common_shape; i++){
     const shape_A = p_A[i].points.slice();
     let shape_B = p_B[i].points.slice();
     const mid_point_A = int(random(0, shape_A.length + 1));
     const ratio_mid_point_A = map((shape_A.length - mid_point_A)/shape_A.length, 0, 1, 1, 0);
     const ratio_mid_point_B = int(ratio_mid_point_A * shape_B.length);
     const mid_point_B = ratio_mid_point_B;
     shape_A.splice(mid_point_A);
     shape_B = shape_B.splice(mid_point_B);
     const property = (random(0, 1) > 0.5) ? p_A[i].property : p_B[i].property;
     const points = shape_A.concat(shape_B);
     if(points.length > 0){
       this.genotype.push({points : shape_A.concat(shape_B), property: property});
     }
   }
   if(max_parent_length - common_shape > 0){
     const max_parent = (num_shape_A > num_shape_B) ? p_A : p_B
     for(let i = common_shape; i < max_parent_length - common_shape; i++){
       if(random(0, 1) > 0.5){
         this.genotype.push(max_parent[i]);
       }
     }
   }
   this.remove_first_and_last_sub_shape();
   //this.remove_double();
   //this.move_sub_shape();
   this.remove_first_bezier_point();
   this.remove_empty_shape();
   this.mutation();
   this.remove_first_and_last_sub_shape();
   //this.remove_double();
   //this.move_sub_shape();
   this.remove_first_bezier_point();
   this.remove_empty_shape();
  }
  mutation(){
    let sub_shapes = [];
    for(let i = 0; i < this.genotype.length; i++){
      const points = this.genotype[i].points.map(a => {return {...a}});
      sub_shapes.push({points: points, path: [i]});
    }
    let has_sub_shape = true;
    while(has_sub_shape){
      let count_sub_shape = 0;
      for(let i = 0; i < sub_shapes.length; i++){
        for(let j = 0; j < sub_shapes[i].points.length; j++){
          if(sub_shapes[i].points[j].hasOwnProperty('sub_shape')){
            count_sub_shape++;
            for(let k = 0; k < sub_shapes[i].points[j].sub_shape.length; k++){
              const path = sub_shapes[i].path.slice();
              path.push(j);
              path.push(k);
              sub_shapes.push({points: sub_shapes[i].points[j].sub_shape[k].points.map(a => {return {...a}}), path: path});
            }
            delete sub_shapes[i].points[j].sub_shape;
          }
        }
      }
      has_sub_shape = (count_sub_shape) ? true: false;
    }
    const shapes = [];
    const index = [];
    for(let i = 0; i < sub_shapes.length; i++){
      let shape = [];
      shape.push(this.genotype[sub_shapes[i].path[0]]);
      let index_include_path = false;
      for(let j = 0; j < index.length; j++){
        if(arraysEqual(index[j], [sub_shapes[i].path[0]])) index_include_path = true;
      }
      if(!index_include_path){
        index.push([sub_shapes[i].path[0]]);
        shapes.push(shape[shape.length - 1]);
      }
      for(let j = 1; j < sub_shapes[i].path.length; j++){
        if(j % 2){
          shape.push(shape[shape.length - 1].points[sub_shapes[i].path[j]].sub_shape);
        } else{
          shape.push(shape[shape.length - 1][sub_shapes[i].path[j]]);
          let index_include_path = false;
          for(let k = 0; k < index.length; k++){
            if(arraysEqual(index[k], sub_shapes[i].path.slice(0, j + 1))) index_include_path = true;
          }
          if(!index_include_path){
            index.push(sub_shapes[i].path.slice(0, j + 1));
            shapes.push(shape[shape.length - 1]);
          }
        }
      }
    }
    const wich_shape = int(random(0, shapes.length));
    const shape = shapes[wich_shape];
    // Change constrol points
    const points_with_curve = [];
    for(let i = 0; i < shape.points.length; i++){
      if(shape.points[i].hasOwnProperty('control_points')){
        points_with_curve.push(i);
      }
    }
    if(points_with_curve.length && random(0, 1) < 0.005){
      const wich_point = int(random(0, points_with_curve.length));
      const control_points_1 = random(0, 1);
      const control_points_2 = random(0, 1);
      shape.points[points_with_curve[wich_point]].control_points = [control_points_1, control_points_2];
    }
    // Change curve, no curve
    if(random(0, 1) < 0.005){
      const wich_point = int(random(1, shape.points.length - 1));
      if(shape.points[wich_point].hasOwnProperty('control_points')){
        delete shape.points[wich_point].control_points;
      } else{
        const control_points_1 = random(0, 1);
        const control_points_2 = random(0, 1);
        shape.points[wich_point].control_points = [control_points_1, control_points_2];
      }
    }
    // Change weight_points
    if(random(0, 1) < 0.01){
      const wich_point = int(random(1, shape.points.length - 1));
      let weight_1 = random(1, this.margin);
      let weight_2 = random(1, this.margin);
      shape.points[wich_point].weight = [weight_1, weight_2];
    }
    // Remove point
    if(random(0, 1) < 0.005){
      const index_shapes_with_enough_points = []
      for(let i = 0; i < shapes.length; i++){
        if(shapes[i].points.length > 1){
          index_shapes_with_enough_points.push(i)
        }
      }
      if(index_shapes_with_enough_points.length){
        const shape_to_add = int(random(0, index_shapes_with_enough_points.length));
        const wich_point = int(random(0, shapes[shape_to_add].points.length));
        if(shapes[shape_to_add].points.length >= 5 && wich_point > 1 && wich_point < shapes[shape_to_add].points.length - 2 && random(0, 1) < 0.75){
          shape.property = ['open']
          const new_array = shapes[shape_to_add].points.splice(wich_point);
          this.genotype.push({
            points: new_array,
            property: ['open']
          });
        } else{
          shapes[shape_to_add].points.splice(wich_point, 1);
        }
      }
    }
    // Move Point
    if(random(0, 1) < 0.01){
      const random_point = int(random(0, shape.points.length));
      const point_x = int(random(0, this.grid));
      const point_y = int(random(0, this.grid));
      shape.points[random_point].position = {x: point_x, y: point_y};
    }
    // Add Point
    if(random(0, 1) < 0.006){
      const wich_point = int(random(0, shape.points.length));
      let point;
      const point_x = int(random(0, this.grid));
      const point_y = int(random(0, this.grid));
      const weight_1 = random(1, this.margin);
      const weight_2 = random(1, this.margin);
      if(random(0, 1) > 0.2){
        point = {position: {x: point_x, y: point_y}, weight: [weight_1, weight_2]};
      } else{
       const control_points_1 = random(0, 1);
       const control_points_2 = random(0, 1);
       point = {position: {x: point_x, y: point_y}, control_points: [control_points_1, control_points_2], weight: [weight_1, weight_2]};
      }
      if(!shape.points[wich_point].hasOwnProperty('sub_shape')) shape.points[wich_point].sub_shape = [];
      shape.points[wich_point].sub_shape.push({
        points: [point], property: ['open']
      });
    }
  }
  /* Check */
  remove_empty_shape(){
    for(let i = this.genotype.length - 1; i >= 0; i--){
      if(this.genotype[i].points.length <= 1){
        this.genotype.splice(i, 1);
      }
    }
  }
  remove_first_bezier_point(){
    for(let shape of this.genotype){
      if(shape.points[0].hasOwnProperty('control_points')){
        delete shape.points[0].control_points;
      }
    }
  }
  remove_first_and_last_sub_shape(){
    let shapes = [];
    for(let i = 0; i < this.genotype.length; i++){
      shapes.push(this.genotype[i]);
    }
    while(shapes.length){
      let new_shapes = [];
      for(let i = 0; i < shapes.length; i++){
        for(let j = 0; j < shapes[i].points.length; j++){
          if(shapes[i].points[j].hasOwnProperty('sub_shape')){
            if((i < this.genotype.length && j == 0) || j == shapes[i].points.length - 1){
              const sub_shape_with_open_property = [];
              for(let k = 0; k < shapes[i].points[j].sub_shape.length; k++){
                if(shapes[i].points[j].sub_shape[k].property.includes('open')){
                  sub_shape_with_open_property.push(k);
                }
              }
              if(sub_shape_with_open_property.length){
                const points_to_push = shapes[i].points[j].sub_shape[sub_shape_with_open_property[0]].points.map(a => {return {...a}});
                shapes[i].points[j].sub_shape.splice(sub_shape_with_open_property[0], 1);
                if(j == 0){
                  points_to_push.reverse();
                  shapes[i].points = points_to_push.concat(shapes[i].points);
                } else{
                  shapes[i].points = shapes[i].points.concat(points_to_push);
                }
              }
            } else{
              for(let sub_shape of shapes[i].points[j].sub_shape){
                new_shapes.push(sub_shape);
              }
            }
          }
        }
      }
      shapes = new_shapes;
    }
  }
  /* Check */
  get_double(){
    let sub_shapes = [];
    for(let i = 0; i < this.genotype.length; i++){
      const points = this.genotype[i].points.map(a => {return {...a}});
      sub_shapes.push({points: points, path: [i]});
    }
    let has_sub_shape = true;
    while(has_sub_shape){
      let count_sub_shape = 0;
      for(let i = 0; i < sub_shapes.length; i++){
        for(let j = 0; j < sub_shapes[i].points.length; j++){
          if(sub_shapes[i].points[j].hasOwnProperty('sub_shape')){
            count_sub_shape++;
            for(let k = 0; k < sub_shapes[i].points[j].sub_shape.length; k++){
              const path = sub_shapes[i].path.slice();
              path.push(j);
              path.push(k);
              sub_shapes.push({points: sub_shapes[i].points[j].sub_shape[k].points.map(a => {return {...a}}), path: path});
            }
            delete sub_shapes[i].points[j].sub_shape;
          }
        }
      }
      has_sub_shape = (count_sub_shape) ? true: false;
    }
    let point_to_remove = [];
    for(let i = 0; i < sub_shapes.length; i++){
      point_to_remove[i] = [];
      for(let j = 0; j < sub_shapes[i].points.length; j++){
        const point_position = sub_shapes[i].points[j].position;
        if (!point_to_remove[i].some(e => (e.point.x == point_position.x && e.point.y == point_position.y))) {
          point_to_remove[i].push({point: point_position, index: [j], path: sub_shapes[i].path});
        } else {
          let index;
          point_to_remove[i].some((e, k) => {
              if ((e.point.x == point_position.x && e.point.y == point_position.y)) {
                  index = k;
              }
          });
          point_to_remove[i][index].index.push(j);
        }
      }
    }
    point_to_remove.reverse();
    let is_not_empty = 0;
    for(let i = point_to_remove.length - 1; i >= 0; i--){
      for(let j = point_to_remove[i].length - 1; j >= 0; j--){
        if(point_to_remove[i][j].index.length <= 1) point_to_remove[i].splice(j, 1);
        else is_not_empty++;
      }
    }
    if(!is_not_empty) point_to_remove = [];
    return point_to_remove;
  }
  /* Check */
  remove_double(){
    let remove_array = this.get_double();
    while(remove_array.length){
      if(remove_array.length){
        let shape_to_check = 0;
        while(!remove_array[shape_to_check].length && shape_to_check < remove_array.length - 1){
          shape_to_check++;
        }
        const distance_array = [];
        for(let i = 0; i <  remove_array[shape_to_check].length; i++){
          for(let j = 0; j < remove_array[shape_to_check][i].index.length - 1; j++){
            const distance = abs(remove_array[shape_to_check][i].index[j] - remove_array[shape_to_check][i].index[j + 1]);
            distance_array.push({distance: distance, indexes: [remove_array[shape_to_check][i].index[j], remove_array[shape_to_check][i].index[j + 1]]});
          }
        }
        distance_array.sort((a, b) => a.distance - b.distance);
        let shapes = []
        shapes.push(this.genotype[remove_array[shape_to_check][0].path[0]]);
        for(let i = 1; i < remove_array[shape_to_check][0].path.length; i++){
          if(i % 2){
            shapes.push(shapes[shapes.length -1].points[remove_array[shape_to_check][0].path[i]].sub_shape);
          } else {
            shapes.push(shapes[shapes.length -1][remove_array[shape_to_check][0].path[i]]);
          }
        }
        const shape = shapes[shapes.length - 1];
        if(distance_array[0].distance == 1){
          shape.points.splice(distance_array[0].indexes[1], 1);
        } else if(distance_array[0].distance == 2){
          if(distance_array[0].indexes[1] == shape.points.length - 1){
            shape.points.splice(distance_array[0].indexes[1], 1);
          } else{
            const first_array = shape.points.slice(0, distance_array[0].indexes[1]);
            const second_array = shape.points.slice(distance_array[0].indexes[1] + 1);
            if(distance_array[0].indexes[0] == 0){
              if(remove_array[shape_to_check][0].path.length == 1){
                shape.points = second_array.concat(first_array);
              } else {
                shape.points = first_array;
                if(!shape.points[distance_array[0].indexes[0]].hasOwnProperty('sub_shape')){
                  shape.points[distance_array[0].indexes[0]].sub_shape = [];
                }
                let equal_sub_shapes = 0;
                for(let sub of shape.points[distance_array[0].indexes[0]].sub_shape){
                  if(second_array.length == sub.points.length){
                    let equal_sub_shape_points = sub.points.length;
                    for(let i = 0; i < sub.points.length; i++){
                      if(sub.points[i].position.x == second_array[i].position.x && sub.points[i].position.y == second_array[i].position.y){
                        equal_sub_shape_points++;
                      }
                    }
                    if(equal_sub_shape_points == 0){
                      equal_sub_shapes++
                    }
                  }
                }
                if(!equal_sub_shapes){
                  shape.points[distance_array[0].indexes[0]].sub_shape.push({
                    points: second_array,
                    property: ['open']
                  });
                }
              }
            } else{
              shape.points = first_array;
              if(!shape.points[distance_array[0].indexes[0]].hasOwnProperty('sub_shape')){
                shape.points[distance_array[0].indexes[0]].sub_shape = [];
              }
              let equal_sub_shapes = 0;
              for(let sub of shape.points[distance_array[0].indexes[0]].sub_shape){
                if(second_array.length == sub.points.length){
                  let equal_sub_shape_points = sub.points.length;
                  for(let i = 0; i < sub.points.length; i++){
                    if(sub.points[i].position.x == second_array[i].position.x && sub.points[i].position.y == second_array[i].position.y){
                      equal_sub_shape_points++;
                    }
                  }
                  if(equal_sub_shape_points == 0){
                    equal_sub_shapes++
                  }
                }
              }
              if(!equal_sub_shapes){
                shape.points[distance_array[0].indexes[0]].sub_shape.push({
                  points: second_array,
                  property: ['open']
                });
              }
            }
          }
        } else {
          const first_array = shape.points.slice(0, distance_array[0].indexes[0]);
          const second_array = shape.points.slice(distance_array[0].indexes[0], distance_array[0].indexes[1]);
          const third_array = shape.points.slice(distance_array[0].indexes[1] + 1);
          shape.points = second_array;
          if(first_array.length || third_array.length){
            if(!second_array[0].hasOwnProperty('sub_shape')) second_array[0].sub_shape = []
            if(first_array.length){
              second_array[0].sub_shape.push({
                points: first_array,
                property: ['open']
              })
            }
            if(third_array.length){
              second_array[0].sub_shape.push({
                points: third_array,
                property: ['open']
              })
            }
          }
          shape.property = ['close'];
          shape.points = second_array;
        }
      }
      remove_array = this.get_double();
    }
  }
  /*Check*/
  get_sub_shapes_to_move(){
      let sub_shapes = [];
      for(let i = 0; i < this.genotype.length; i++){
        const points = this.genotype[i].points.map(a => {return {...a}});
        sub_shapes.push({points: points, path: [i]});
      }
      let has_sub_shape = true;
      while(has_sub_shape){
        let count_sub_shape = 0;
        for(let i = 0; i < sub_shapes.length; i++){
          for(let j = 0; j < sub_shapes[i].points.length; j++){
            if(sub_shapes[i].points[j].hasOwnProperty('sub_shape')){
              count_sub_shape++;
              for(let k = 0; k < sub_shapes[i].points[j].sub_shape.length; k++){
                const path = sub_shapes[i].path.slice();
                path.push(j);
                path.push(k);
                const neighbour_points = [];
                if(j - 1 >= 0){
                  const neighbour_point_position = {x: sub_shapes[i].points[j - 1].position.x, y: sub_shapes[i].points[j - 1].position.y}
                  neighbour_points.push({path: j - 1, position: neighbour_point_position});
                }
                if(j + 1 < sub_shapes[i].points.length){
                  const neighbour_point_position = {x: sub_shapes[i].points[j + 1].position.x, y: sub_shapes[i].points[j + 1].position.y}
                  neighbour_points.push({path: j + 1, position: neighbour_point_position});
                }
                sub_shapes.push({points: sub_shapes[i].points[j].sub_shape[k].points.map(a => {return {...a}}), neighbour_points: neighbour_points, path: path});
              }
              delete sub_shapes[i].points[j].sub_shape;
            }
          }
        }
        has_sub_shape = (count_sub_shape) ? true: false;
      }
      for(let i = sub_shapes.length - 1; i >= 0; i--){
        if(!sub_shapes[i].hasOwnProperty('neighbour_points')){
          sub_shapes.splice(i, 1);
        }else {
          for(let j = sub_shapes[i].neighbour_points.length - 1; j >= 0 ; j--){
            if(sub_shapes[i].points[0].position.x != sub_shapes[i].neighbour_points[j].position.x || sub_shapes[i].points[0].position.y != sub_shapes[i].neighbour_points[j].position.y){
              sub_shapes[i].neighbour_points.splice(j, 1);
            }
          }
          if(!sub_shapes[i].neighbour_points.length) sub_shapes.splice(i, 1);
        }
      }
      sub_shapes.reverse();
      return sub_shapes;
  }
  /*Check*/
  move_sub_shape(){
    let sub_shape_to_move = this.get_sub_shapes_to_move();
    if(sub_shape_to_move.length){
      while(sub_shape_to_move.length){
        const shape_to_push = [];
        const shape_to_remove = [];
        shape_to_push.push(this.genotype[sub_shape_to_move[0].path[0]]);
        shape_to_remove.push(this.genotype[sub_shape_to_move[0].path[0]]);
        for(let i = 1; i < sub_shape_to_move[0].path.length; i++){
          if(i < sub_shape_to_move[0].path.length - 2){
            if(i % 2){
              shape_to_push.push(shape_to_push[shape_to_remove.length -1].points[sub_shape_to_move[0].path[i]].sub_shape);
            } else {
              shape_to_push.push(shape_to_push[shape_to_remove.length -1][sub_shape_to_move[0].path[i]]);
            }
          }
          if(i % 2){
            shape_to_remove.push(shape_to_remove[shape_to_remove.length -1].points[sub_shape_to_move[0].path[i]].sub_shape);
          } else {
            shape_to_remove.push(shape_to_remove[shape_to_remove.length -1][sub_shape_to_move[0].path[i]]);
          }
        }
        const neighbour_point = sub_shape_to_move[0].neighbour_points[0].path;
        const point_with_shape = sub_shape_to_move[0].path[sub_shape_to_move[0].path.length - 2];
        const which_sub_shapes = sub_shape_to_move[0].path[sub_shape_to_move[0].path.length - 1]
        const shape = shape_to_push[shape_to_push.length - 1];
        const new_sub_shape = shape.points[point_with_shape].sub_shape.splice(which_sub_shapes, 1);
        new_sub_shape[0].points.splice(0, 1);
        if(shape.points[point_with_shape].sub_shape.length == 0){
          delete shape.points[point_with_shape].sub_shape
        }
        if(new_sub_shape[0].points.length){
          if(shape === this.genotype[sub_shape_to_move[0].path[0]]){
            if(neighbour_point == shape.points.length - 1){
              shape.points = shape.points.concat(new_sub_shape[0].points)
            } else if(neighbour_point == 0){
              shape.points = new_sub_shape[0].points.reverse().concat(shape.points)
            } else{
              if(!shape.points[neighbour_point].hasOwnProperty('sub_shape')){
                shape.points[neighbour_point].sub_shape = [];
              }
              shape.points[neighbour_point].sub_shape.push(new_sub_shape[0]);
            }
          } else {
            if(neighbour_point == shape.points.length - 1){
              shape.points = shape.points.concat(new_sub_shape[0].points)
            } else{
              if(!shape.points[neighbour_point].hasOwnProperty('sub_shape')){
                shape.points[neighbour_point].sub_shape = [];
              }
              shape.points[neighbour_point].sub_shape.push(new_sub_shape[0]);
            }
          }
        }
        sub_shape_to_move = this.get_sub_shapes_to_move();
      }
    }
  }
  create_weight(){
    const margin_vector = createVector(this.margin, this.margin);
    const sub_shapes = [];
    for(let i = 0; i < this.genotype.length; i++){
      const points = this.genotype[i].points.map(a => {return {...a}});
      sub_shapes.push({points: points, property: this.genotype[i].property});
    }
    let has_sub_shape = true;
    while(has_sub_shape){
      let count_sub_shape = 0;
      for(let i = 0; i < sub_shapes.length; i++){
        for(let j = 0; j < sub_shapes[i].points.length; j++){
          if(sub_shapes[i].points[j].hasOwnProperty('sub_shape')){
            for(let k = 0; k < sub_shapes[i].points[j].sub_shape.length; k++){
              const attach = sub_shapes[i].points.map(a => {return {...a}});
              let weight_points;
              if(j == 0){
                weight_points = [sub_shapes[i].points[j], attach[j + 1]];
              } else{
                weight_points = [attach[j + 1], attach[j - 1]];
              }
              sub_shapes.push({points: sub_shapes[i].points[j].sub_shape[k].points.map(a => {return {...a}}), attach: attach[j], property: sub_shapes[i].points[j].sub_shape[k].property, weight_points: weight_points});
            }
            delete sub_shapes[i].points[j].sub_shape;
          }
        }
      }
      has_sub_shape = (count_sub_shape) ? true: false;
    }
    for(let shape of sub_shapes){
      if(shape.hasOwnProperty('attach')){
        shape.points.unshift(shape.attach);
      }
      if(shape.points.length > 1){
        const open_shape = [];
        const interior_shape = [];
        for(let i = 0; i < shape.points.length; i++){
          let vertex;
          if(i == 0){
            if(shape.hasOwnProperty('attach')){
              const point_1 = createVector(map(shape.points[i].position.x, 0, this.grid - 1, 0, width - this.margin * 2), map(shape.points[i].position.y, 0, this.grid - 1, 0, width - this.margin * 2));
              const point_2 = createVector(map(shape.weight_points[0].position.x, 0, this.grid - 1, 0, width - this.margin *2), map(shape.weight_points[0].position.y, 0, this.grid - 1, 0, width - this.margin *2));
              vertex = p5.Vector.sub(point_2, point_1).setMag(shape.points[i].weight[0]).add(margin_vector).add(point_1)
            } else if(shape.property.includes('close')){
              const point_1 = createVector(map(shape.points[shape.points.length - 1].position.x, 0, this.grid - 1, 0, width - this.margin * 2), map(shape.points[shape.points.length - 1].position.y, 0, this.grid - 1, 0, width - this.margin * 2));
              const point_2 = createVector(map(shape.points[i].position.x, 0, this.grid - 1, 0, width - this.margin * 2), map(shape.points[i].position.y, 0, this.grid - 1, 0, width - this.margin * 2));
              const point_3 = createVector(map(shape.points[i + 1].position.x, 0, this.grid - 1, 0, width - this.margin * 2), map(shape.points[i + 1].position.y, 0, this.grid - 1, 0, width - this.margin * 2));
              const vector_1 = p5.Vector.sub(point_3, point_2).setMag(50);
              const vector_2 = p5.Vector.sub(point_1, point_2);
              let hv1 = vector_1.heading();
              let hv2 = vector_2.heading();
              if(hv2 < 0){
                hv2 += TWO_PI;
              }
              if(hv1 < 0){
                hv1 += TWO_PI;
              }
              if(hv1 > hv2){
                if(((hv1 > PI && hv2 < PI) || (hv1 < PI && hv2 > PI)) && ((vector_1.x >= 0 && vector_2.x >= 0) || (vector_1.x > 0 && vector_2.x < 0) || (vector_1.x < 0 && vector_2.x > 0))){
                  vertex = p5.Vector.fromAngle(hv1 + vector_2.angleBetween(vector_1)/2, shape.points[i].weight[0]);
                } else{
                  vertex = p5.Vector.fromAngle(hv2 + vector_2.angleBetween(vector_1)/2, -shape.points[i].weight[0]);
                }
              } else{
                if((hv1 > PI && hv2 < PI) || (hv1 < PI && hv2 > PI) && ((vector_1.x >= 0 && vector_2.x >= 0) || (vector_1.x > 0 && vector_2.x < 0) || (vector_1.x < 0 && vector_2.x > 0))){
                  vertex = p5.Vector.fromAngle(hv2 + vector_2.angleBetween(vector_1)/2, -shape.points[i].weight[0]);
                } else{
                  vertex = p5.Vector.fromAngle(hv1 + vector_2.angleBetween(vector_1)/2, shape.points[i].weight[0]);
                }
              }
              vertex.add(margin_vector).add(point_2);
              fill(0, 0, 255);
              noStroke();
            } else{
              const point_1 = createVector(map(shape.points[i].position.x, 0, this.grid - 1, 0, width - this.margin * 2), map(shape.points[i].position.y, 0, this.grid - 1, 0, width - this.margin * 2));
              const point_2 = createVector(map(shape.points[i + 1].position.x, 0, this.grid - 1, 0, width - this.margin * 2), map(shape.points[i + 1].position.y, 0, this.grid - 1, 0, width - this.margin * 2));
              vertex = p5.Vector.fromAngle(p5.Vector.sub(point_2, point_1).heading() - PI/2, -shape.points[i].weight[0]).add(margin_vector).add(point_1);
            }
          } else if(i == shape.points.length - 1){
            if(shape.property.includes('close')){
              const point_1 = createVector(map(shape.points[i - 1].position.x, 0, this.grid - 1, 0, width - this.margin * 2), map(shape.points[i - 1].position.y, 0, this.grid - 1, 0, width - this.margin * 2));
              const point_2 = createVector(map(shape.points[i].position.x, 0, this.grid - 1, 0, width - this.margin * 2), map(shape.points[i].position.y, 0, this.grid - 1, 0, width - this.margin * 2));
              const point_3 = createVector(map(shape.points[0].position.x, 0, this.grid - 1, 0, width - this.margin * 2), map(shape.points[0].position.y, 0, this.grid - 1, 0, width - this.margin * 2));
              const vector_1 = p5.Vector.sub(point_3, point_2).setMag(50);
              const vector_2 = p5.Vector.sub(point_1, point_2);
              let hv1 = vector_1.heading();
              let hv2 = vector_2.heading();
              if(hv2 < 0){
                hv2 += TWO_PI;
              }
              if(hv1 < 0){
                hv1 += TWO_PI;
              }
              if(hv1 > hv2){
                if(((hv1 > PI && hv2 < PI) || (hv1 < PI && hv2 > PI)) && ((vector_1.x >= 0 && vector_2.x >= 0) || (vector_1.x > 0 && vector_2.x < 0) || (vector_1.x < 0 && vector_2.x > 0))){
                  vertex = p5.Vector.fromAngle(hv1 + vector_2.angleBetween(vector_1)/2, shape.points[i].weight[0]);
                } else{
                  vertex = p5.Vector.fromAngle(hv2 + vector_2.angleBetween(vector_1)/2, -shape.points[i].weight[0]);
                }
              } else{
                if((hv1 > PI && hv2 < PI) || (hv1 < PI && hv2 > PI) && ((vector_1.x >= 0 && vector_2.x >= 0) || (vector_1.x > 0 && vector_2.x < 0) || (vector_1.x < 0 && vector_2.x > 0))){
                  vertex = p5.Vector.fromAngle(hv2 + vector_2.angleBetween(vector_1)/2, -shape.points[i].weight[0]);
                } else{
                  vertex = p5.Vector.fromAngle(hv1 + vector_2.angleBetween(vector_1)/2, shape.points[i].weight[0]);
                }
              }
              vertex.setMag(shape.points[i].weight[0])
              vertex.add(margin_vector).add(point_2);
              fill(0, 0, 255);
              noStroke();
            } else {
              const point_1 = createVector(map(shape.points[i].position.x, 0, this.grid - 1, 0, width - this.margin * 2), map(shape.points[i].position.y, 0, this.grid - 1, 0, width - this.margin * 2));
              const point_2 = createVector(map(shape.points[i - 1].position.x, 0, this.grid - 1, 0, width - this.margin * 2), map(shape.points[i - 1].position.y, 0, this.grid - 1, 0, width - this.margin * 2));
              vertex = p5.Vector.fromAngle(p5.Vector.sub(point_1, point_2).heading() - PI/2, -shape.points[i].weight[0]).add(margin_vector).add(point_1);
            }
          } else{
            const point_1 = createVector(map(shape.points[i- 1].position.x, 0, this.grid - 1, 0, width - this.margin * 2), map(shape.points[i - 1].position.y, 0, this.grid - 1, 0, width - this.margin * 2));
            const point_2 = createVector(map(shape.points[i].position.x, 0, this.grid - 1, 0, width - this.margin * 2), map(shape.points[i].position.y, 0, this.grid - 1, 0, width - this.margin * 2));
            const point_3 = createVector(map(shape.points[i + 1].position.x, 0, this.grid - 1, 0, width - this.margin * 2), map(shape.points[i + 1].position.y, 0, this.grid - 1, 0, width - this.margin * 2));
            const vector_1 = p5.Vector.sub(point_3, point_2).setMag(50);
            const vector_2 = p5.Vector.sub(point_1, point_2);
            let hv1 = vector_1.heading();
            let hv2 = vector_2.heading();
            if(hv2 < 0){
              hv2 += TWO_PI;
            }
            if(hv1 < 0){
              hv1 += TWO_PI;
            }
            if(hv1 > hv2){
              if(((hv1 > PI && hv2 < PI) || (hv1 < PI && hv2 > PI)) && ((vector_1.x >= 0 && vector_2.x >= 0) || (vector_1.x > 0 && vector_2.x < 0) || (vector_1.x < 0 && vector_2.x > 0))){
                vertex = p5.Vector.fromAngle(hv1 + vector_2.angleBetween(vector_1)/2, shape.points[i].weight[0]);
              } else{
                vertex = p5.Vector.fromAngle(hv2 + vector_2.angleBetween(vector_1)/2, -shape.points[i].weight[0]);
              }
            } else{
              if((hv1 > PI && hv2 < PI) || (hv1 < PI && hv2 > PI) && ((vector_1.x >= 0 && vector_2.x >= 0) || (vector_1.x > 0 && vector_2.x < 0) || (vector_1.x < 0 && vector_2.x > 0))){
                vertex = p5.Vector.fromAngle(hv2 + vector_2.angleBetween(vector_1)/2, -shape.points[i].weight[0]);
              } else{
                vertex = p5.Vector.fromAngle(hv1 + vector_2.angleBetween(vector_1)/2, shape.points[i].weight[0]);
              }
            }
            vertex.setMag(shape.points[i].weight[0])
            vertex.add(margin_vector).add(point_2);
            fill(0, 0, 255);
            noStroke();
          }

          const point = {
            position: {x: vertex.x, y: vertex.y}
          }
          if(shape.points[i].hasOwnProperty('control_points')) point.control_points = shape.points[i].control_points
          open_shape.push(point);
        }
        for(let i = shape.points.length - 1; i >= 0; i--){
          let vertex;
          if(i == 0){
            if(shape.hasOwnProperty('attach')){
              const point_1 = createVector(map(shape.points[i].position.x, 0, this.grid - 1, 0, width - this.margin * 2), map(shape.points[i].position.y, 0, this.grid - 1, 0, width - this.margin * 2));
              const point_2 = createVector(map(shape.weight_points[1].position.x, 0, this.grid - 1, 0, width - this.margin *2), map(shape.weight_points[1].position.y, 0, this.grid - 1, 0, width - this.margin *2));
              vertex = p5.Vector.sub(point_2, point_1).setMag(shape.points[i].weight[1]).add(margin_vector).add(point_1);
            } else if(shape.property.includes('close')){
              const point_1 = createVector(map(shape.points[shape.points.length - 1].position.x, 0, this.grid - 1, 0, width - this.margin * 2), map(shape.points[shape.points.length - 1].position.y, 0, this.grid - 1, 0, width - this.margin * 2));
              const point_2 = createVector(map(shape.points[i].position.x, 0, this.grid - 1, 0, width - this.margin * 2), map(shape.points[i].position.y, 0, this.grid - 1, 0, width - this.margin * 2));
              const point_3 = createVector(map(shape.points[i + 1].position.x, 0, this.grid - 1, 0, width - this.margin * 2), map(shape.points[i + 1].position.y, 0, this.grid - 1, 0, width - this.margin * 2));
              const vector_1 = p5.Vector.sub(point_3, point_2).setMag(50);
              const vector_2 = p5.Vector.sub(point_1, point_2);
              let hv1 = vector_1.heading();
              let hv2 = vector_2.heading();
              if(hv2 < 0){
                hv2 += TWO_PI;
              }
              if(hv1 < 0){
                hv1 += TWO_PI;
              }
              if(hv1 > hv2){
                if(((hv1 > PI && hv2 < PI) || (hv1 < PI && hv2 > PI)) && ((vector_1.x >= 0 && vector_2.x >= 0) || (vector_1.x > 0 && vector_2.x < 0) || (vector_1.x < 0 && vector_2.x > 0))){
                  vertex = p5.Vector.fromAngle(hv1 + vector_2.angleBetween(vector_1)/2, -shape.points[i].weight[1]);
                } else{
                  vertex = p5.Vector.fromAngle(hv2 + vector_2.angleBetween(vector_1)/2, shape.points[i].weight[1]);
                }
              } else{
                if((hv1 > PI && hv2 < PI) || (hv1 < PI && hv2 > PI) && ((vector_1.x >= 0 && vector_2.x >= 0) || (vector_1.x > 0 && vector_2.x < 0) || (vector_1.x < 0 && vector_2.x > 0))){
                  vertex = p5.Vector.fromAngle(hv2 + vector_2.angleBetween(vector_1)/2, shape.points[i].weight[0]);
                } else{
                  vertex = p5.Vector.fromAngle(hv1 + vector_2.angleBetween(vector_1)/2, -shape.points[i].weight[0]);
                }
              }
              vertex.add(margin_vector).add(point_2);
            } else{
              const point_1 = createVector(map(shape.points[i].position.x, 0, this.grid - 1, 0, width - this.margin * 2), map(shape.points[i].position.y, 0, this.grid - 1, 0, width - this.margin * 2));
              const point_2 = createVector(map(shape.points[i + 1].position.x, 0, this.grid - 1, 0, width - this.margin * 2), map(shape.points[i + 1].position.y, 0, this.grid - 1, 0, width - this.margin * 2));
              vertex = p5.Vector.fromAngle(p5.Vector.sub(point_2, point_1).heading() - PI/2, shape.points[i].weight[1]).add(margin_vector).add(point_1);
            }
          } else if(i == shape.points.length - 1){
            if(shape.property.includes('close')){
              const point_1 = createVector(map(shape.points[i - 1].position.x, 0, this.grid - 1, 0, width - this.margin * 2), map(shape.points[i - 1].position.y, 0, this.grid - 1, 0, width - this.margin * 2));
              const point_2 = createVector(map(shape.points[i].position.x, 0, this.grid - 1, 0, width - this.margin * 2), map(shape.points[i].position.y, 0, this.grid - 1, 0, width - this.margin * 2));
              const point_3 = createVector(map(shape.points[0].position.x, 0, this.grid - 1, 0, width - this.margin * 2), map(shape.points[0].position.y, 0, this.grid - 1, 0, width - this.margin * 2));
              const vector_1 = p5.Vector.sub(point_3, point_2).setMag(50);
              const vector_2 = p5.Vector.sub(point_1, point_2);
              let hv1 = vector_1.heading();
              let hv2 = vector_2.heading();
              if(hv2 < 0){
                hv2 += TWO_PI;
              }
              if(hv1 < 0){
                hv1 += TWO_PI;
              }
              if(hv1 > hv2){
                if(((hv1 > PI && hv2 < PI) || (hv1 < PI && hv2 > PI)) && ((vector_1.x >= 0 && vector_2.x >= 0) || (vector_1.x > 0 && vector_2.x < 0) || (vector_1.x < 0 && vector_2.x > 0))){
                  vertex = p5.Vector.fromAngle(hv1 + vector_2.angleBetween(vector_1)/2, -shape.points[i].weight[1]);
                } else{
                  vertex = p5.Vector.fromAngle(hv2 + vector_2.angleBetween(vector_1)/2, shape.points[i].weight[1]);
                }
              } else{
                if((hv1 > PI && hv2 < PI) || (hv1 < PI && hv2 > PI) && ((vector_1.x >= 0 && vector_2.x >= 0) || (vector_1.x > 0 && vector_2.x < 0) || (vector_1.x < 0 && vector_2.x > 0))){
                  vertex = p5.Vector.fromAngle(hv2 + vector_2.angleBetween(vector_1)/2, shape.points[i].weight[0]);
                } else{
                  vertex = p5.Vector.fromAngle(hv1 + vector_2.angleBetween(vector_1)/2, -shape.points[i].weight[0]);
                }
              }
              vertex.add(margin_vector).add(point_2);
            } else{
              const point_1 = createVector(map(shape.points[i].position.x, 0, this.grid - 1, 0, width - this.margin * 2), map(shape.points[i].position.y, 0, this.grid - 1, 0, width - this.margin * 2));
              const point_2 = createVector(map(shape.points[i - 1].position.x, 0, this.grid - 1, 0, width - this.margin * 2), map(shape.points[i - 1].position.y, 0, this.grid - 1, 0, width - this.margin * 2));
              vertex = p5.Vector.fromAngle(p5.Vector.sub(point_1, point_2).heading() - PI/2, shape.points[i].weight[1]).add(margin_vector).add(point_1);
            }
          } else{
            const point_1 = createVector(map(shape.points[i- 1].position.x, 0, this.grid - 1, 0, width - this.margin * 2), map(shape.points[i - 1].position.y, 0, this.grid - 1, 0, width - this.margin * 2));
            const point_2 = createVector(map(shape.points[i].position.x, 0, this.grid - 1, 0, width - this.margin * 2), map(shape.points[i].position.y, 0, this.grid - 1, 0, width - this.margin * 2));
            const point_3 = createVector(map(shape.points[i + 1].position.x, 0, this.grid - 1, 0, width - this.margin * 2), map(shape.points[i + 1].position.y, 0, this.grid - 1, 0, width - this.margin * 2));
            const vector_1 = p5.Vector.sub(point_3, point_2).setMag(50);
            const vector_2 = p5.Vector.sub(point_1, point_2);
            let hv1 = vector_1.heading();
            let hv2 = vector_2.heading();
            if(hv2 < 0){
              hv2 += TWO_PI;
            }
            if(hv1 < 0){
              hv1 += TWO_PI;
            }
            if(hv1 > hv2){
              if(((hv1 > PI && hv2 < PI) || (hv1 < PI && hv2 > PI)) && ((vector_1.x >= 0 && vector_2.x >= 0) || (vector_1.x > 0 && vector_2.x < 0) || (vector_1.x < 0 && vector_2.x > 0))){
                vertex = p5.Vector.fromAngle(hv1 + vector_2.angleBetween(vector_1)/2, -shape.points[i].weight[1]);
              } else{
                vertex = p5.Vector.fromAngle(hv2 + vector_2.angleBetween(vector_1)/2, shape.points[i].weight[1]);
              }
            } else{
              if((hv1 > PI && hv2 < PI) || (hv1 < PI && hv2 > PI) && ((vector_1.x >= 0 && vector_2.x >= 0) || (vector_1.x > 0 && vector_2.x < 0) || (vector_1.x < 0 && vector_2.x > 0))){
                vertex = p5.Vector.fromAngle(hv2 + vector_2.angleBetween(vector_1)/2, shape.points[i].weight[0]);
              } else{
                vertex = p5.Vector.fromAngle(hv1 + vector_2.angleBetween(vector_1)/2, -shape.points[i].weight[0]);
              }
            }
            vertex.add(margin_vector).add(point_2);
          }
          const point = {
            position: {x: vertex.x, y: vertex.y}
          }
          if(shape.points[i].hasOwnProperty('control_points')) point.control_points = shape.points[i].control_points
          if(shape.property.includes('open')){
            open_shape.push(point);
          } else{
            interior_shape.push(point);
          }
        }
        if(shape.hasOwnProperty('attach')){
          const first_point = createVector(map(shape.points[0].position.x, 0, this.grid - 1, this.margin, width - this.margin), map(shape.points[0].position.y, 0, this.grid - 1, this.margin, width - this.margin));
          const point = {
            position: {x: first_point.x, y: first_point.y}
          }
          open_shape.push(point);
        }
        const weight = {
          points: open_shape, property: ['open']
        };
        if(interior_shape.length > 0){
          weight.interior_shape = interior_shape;
        }
        this.weight_shape.push(weight);
      }
    }
    noStroke();
    fill(0);
    for(let i = 0; i < this.weight_shape.length; i++){
      beginShape();
      if(this.weight_shape[i].points.length % 2 == 0){
        for(let j = 0; j < this.weight_shape[i].points.length; j++){
          if(j < this.weight_shape[i].points.length/2){
            if(this.weight_shape[i].points[j].hasOwnProperty('control_points')){
              const point_1 = createVector(map(sub_shapes[i].points[j - 1].position.x, 0, this.grid - 1, this.margin, width - this.margin), map(sub_shapes[i].points[j - 1].position.y, 0, this.grid - 1, this.margin, height - this.margin));
              const point_2 = createVector(map(sub_shapes[i].points[j].position.x, 0, this.grid - 1, this.margin, width - this.margin), map(sub_shapes[i].points[j].position.y, 0, this.grid - 1, this.margin, height - this.margin));
              if(j == this.weight_shape[i].points.length/2 - 1 && j - 1 == 0){
                if(point_2.x > point_1.x && point_2.y < point_1.y){
                  const x1 = this.weight_shape[i].points[j - 1].position.x;
                  const y1 = -abs(this.weight_shape[i].points[j - 1].position.y - this.weight_shape[i].points[j].position.y) * this.weight_shape[i].points[j].control_points[0] + this.weight_shape[i].points[j - 1].position.y;
                  const x2 = -abs(this.weight_shape[i].points[j - 1].position.x - this.weight_shape[i].points[j].position.x) * this.weight_shape[i].points[j].control_points[1] + this.weight_shape[i].points[j].position.x;
                  const y2 = this.weight_shape[i].points[j].position.y;
                  bezierVertex(x1, y1, x2, y2, this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                } else if(point_2.x > point_1.x && point_2.y > point_1.y){
                  const x1 = abs(this.weight_shape[i].points[j - 1].position.x - this.weight_shape[i].points[j].position.x) * this.weight_shape[i].points[j].control_points[0] + this.weight_shape[i].points[j - 1].position.x;
                  const y1 = this.weight_shape[i].points[j - 1].position.y;
                  const x2 = this.weight_shape[i].points[j].position.x;
                  const y2 = -abs(this.weight_shape[i].points[j - 1].position.y - this.weight_shape[i].points[j].position.y) * this.weight_shape[i].points[j].control_points[1] + this.weight_shape[i].points[j].position.y;
                  bezierVertex(x1, y1, x2, y2, this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                } else if(point_2.x < point_1.x && point_2.y > point_1.y){
                  const x1 = this.weight_shape[i].points[j - 1].position.x;
                  const y1 = abs(this.weight_shape[i].points[j - 1].position.y - this.weight_shape[i].points[j].position.y) * this.weight_shape[i].points[j].control_points[0] + this.weight_shape[i].points[j - 1].position.y;
                  const x2 = abs(this.weight_shape[i].points[j - 1].position.x - this.weight_shape[i].points[j].position.x) * this.weight_shape[i].points[j].control_points[1] + this.weight_shape[i].points[j].position.x;
                  const y2 = this.weight_shape[i].points[j].position.y;
                  bezierVertex(x1, y1, x2, y2, this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                } else if(point_2.x < point_1.x && point_2.y < point_1.y){
                  const x1 = -abs(this.weight_shape[i].points[j - 1].position.x - this.weight_shape[i].points[j].position.x) * this.weight_shape[i].points[j].control_points[0] + this.weight_shape[i].points[j - 1].position.x;
                  const y1 = this.weight_shape[i].points[j - 1].position.y;
                  const x2 = this.weight_shape[i].points[j].position.x;
                  const y2 = abs(this.weight_shape[i].points[j - 1].position.y - this.weight_shape[i].points[j].position.y) * this.weight_shape[i].points[j].control_points[1] + this.weight_shape[i].points[j].position.y;
                  bezierVertex(x1, y1, x2, y2, this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                } else{
                  vertex(this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                }
              } else if(j == this.weight_shape[i].points.length/2 - 1){
                const point_3 = createVector(map(sub_shapes[i].points[j - 2].position.x, 0, this.grid - 1, this.margin, width - this.margin), map(sub_shapes[i].points[j - 2].position.y, 0, this.grid - 1, this.margin, height - this.margin));
                const vertex_1 = p5.Vector.sub(point_2, point_1);
                const vertex_2 = p5.Vector.sub(point_3, point_2);
                const vertex_3 = p5.Vector.sub(point_2, point_1).mult(-1);
                const hv_1 = vertex_1.heading();
                const hv_2 = vertex_2.heading();
                const hv_3 = vertex_3.heading();
                if(point_2.x > point_1.x && point_2.y < point_1.y){
                  if((hv_2 > hv_1 && hv_2 <= 0) || (hv_2 >= 0 && hv_2 <= hv_3)){
                    const x1 = this.weight_shape[i].points[j - 1].position.x;
                    const y1 = -abs(this.weight_shape[i].points[j - 1].position.y - this.weight_shape[i].points[j].position.y) * this.weight_shape[i].points[j].control_points[0] + this.weight_shape[i].points[j - 1].position.y;
                    const x2 = -abs(this.weight_shape[i].points[j - 1].position.x - this.weight_shape[i].points[j].position.x) * this.weight_shape[i].points[j].control_points[1] + this.weight_shape[i].points[j].position.x;
                    const y2 = this.weight_shape[i].points[j].position.y;
                    bezierVertex(x1, y1, x2, y2, this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                  } else{
                    const x1 = abs(this.weight_shape[i].points[j - 1].position.x - this.weight_shape[i].points[j].position.x) * this.weight_shape[i].points[j].control_points[0] + this.weight_shape[i].points[j - 1].position.x;
                    const y1 = this.weight_shape[i].points[j - 1].position.y;
                    const x2 = this.weight_shape[i].points[j].position.x;
                    const y2 = abs(this.weight_shape[i].points[j - 1].position.y - this.weight_shape[i].points[j].position.y) * this.weight_shape[i].points[j].control_points[1] + this.weight_shape[i].points[j].position.y;
                    bezierVertex(x1, y1, x2, y2, this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                  }
                } else if(point_2.x > point_1.x && point_2.y > point_1.y){
                  if((hv_2 >= hv_1 && hv_2 <= PI) || (hv_2 >= -PI && hv_2 < hv_3)){
                    const x1 = abs(this.weight_shape[i].points[j - 1].position.x - this.weight_shape[i].points[j].position.x) * this.weight_shape[i].points[j].control_points[0] + this.weight_shape[i].points[j - 1].position.x;
                    const y1 = this.weight_shape[i].points[j - 1].position.y;
                    const x2 = this.weight_shape[i].points[j].position.x;
                    const y2 = -abs(this.weight_shape[i].points[j - 1].position.y - this.weight_shape[i].points[j].position.y) * this.weight_shape[i].points[j].control_points[1] + this.weight_shape[i].points[j].position.y;
                    bezierVertex(x1, y1, x2, y2, this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                  } else{
                    const x1 = this.weight_shape[i].points[j - 1].position.x;
                    const y1 = abs(this.weight_shape[i].points[j - 1].position.y - this.weight_shape[i].points[j].position.y) * this.weight_shape[i].points[j].control_points[0] + this.weight_shape[i].points[j - 1].position.y;
                    const x2 = -abs(this.weight_shape[i].points[j - 1].position.x - this.weight_shape[i].points[j].position.x) * this.weight_shape[i].points[j].control_points[1] + this.weight_shape[i].points[j].position.x;
                    const y2 = this.weight_shape[i].points[j].position.y;
                    bezierVertex(x1, y1, x2, y2, this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                  }
                } else if(point_2.x < point_1.x && point_2.y > point_1.y){
                  if((hv_2 >= hv_3 && hv_2 <= 0) || (hv_2 >= 0 && hv_2 < hv_1)){
                    const x1 = -abs(this.weight_shape[i].points[j - 1].position.x - this.weight_shape[i].points[j].position.x) * this.weight_shape[i].points[j].control_points[0] + this.weight_shape[i].points[j - 1].position.x;
                    const y1 = this.weight_shape[i].points[j - 1].position.y;
                    const x2 = this.weight_shape[i].points[j].position.x;
                    const y2 = -abs(this.weight_shape[i].points[j - 1].position.y - this.weight_shape[i].points[j].position.y) * this.weight_shape[i].points[j].control_points[1] + this.weight_shape[i].points[j].position.y;
                    bezierVertex(x1, y1, x2, y2, this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                  } else {
                    const x1 = this.weight_shape[i].points[j - 1].position.x;
                    const y1 = abs(this.weight_shape[i].points[j - 1].position.y - this.weight_shape[i].points[j].position.y) * this.weight_shape[i].points[j].control_points[0] + this.weight_shape[i].points[j - 1].position.y;
                    const x2 = abs(this.weight_shape[i].points[j - 1].position.x - this.weight_shape[i].points[j].position.x) * this.weight_shape[i].points[j].control_points[1] + this.weight_shape[i].points[j].position.x;
                    const y2 = this.weight_shape[i].points[j].position.y;
                    bezierVertex(x1, y1, x2, y2, this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                  }
                } else if(point_2.x < point_1.x && point_2.y < point_1.y){
                  if((hv_2 <= hv_1 && hv_2 >= -PI) || (hv_2 > hv_3 && hv_1 < PI)){
                    const x1 = this.weight_shape[i].points[j - 1].position.x;
                    const y1 = -abs(this.weight_shape[i].points[j - 1].position.y - this.weight_shape[i].points[j].position.y) * this.weight_shape[i].points[j].control_points[0] + this.weight_shape[i].points[j - 1].position.y;
                    const x2 = abs(this.weight_shape[i].points[j - 1].position.x - this.weight_shape[i].points[j].position.x) * this.weight_shape[i].points[j].control_points[1] + this.weight_shape[i].points[j].position.x;
                    const y2 = this.weight_shape[i].points[j].position.y;
                    bezierVertex(x1, y1, x2, y2, this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                  } else{
                    const x1 = -abs(this.weight_shape[i].points[j - 1].position.x - this.weight_shape[i].points[j].position.x) * this.weight_shape[i].points[j].control_points[0] + this.weight_shape[i].points[j - 1].position.x;
                    const y1 = this.weight_shape[i].points[j - 1].position.y;
                    const x2 = this.weight_shape[i].points[j].position.x;
                    const y2 = abs(this.weight_shape[i].points[j - 1].position.y - this.weight_shape[i].points[j].position.y) * this.weight_shape[i].points[j].control_points[1] + this.weight_shape[i].points[j].position.y;
                    bezierVertex(x1, y1, x2, y2, this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                  }
                }else{
                  vertex(this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                }
              } else if(j - 1 == 0){
                const point_4 = createVector(map(sub_shapes[i].points[j + 1].position.x, 0, this.grid - 1, this.margin, width - this.margin), map(sub_shapes[i].points[j + 1].position.y, 0, this.grid - 1, this.margin, height - this.margin));
                const vertex_1 = p5.Vector.sub(point_2, point_1);
                const vertex_3 = p5.Vector.sub(point_2, point_1).mult(-1);
                const vertex_4 = p5.Vector.sub(point_4, point_2);
                const hv_1 = vertex_1.heading();
                const hv_3 = vertex_3.heading();
                const hv_4 = vertex_4.heading();
                if(point_2.x > point_1.x && point_2.y < point_1.y){
                  if((hv_4 <= hv_1 && hv_4 >= -PI) || (hv_4 <= PI && hv_4 > hv_3)){
                    const x1 = abs(this.weight_shape[i].points[j - 1].position.x - this.weight_shape[i].points[j].position.x) * this.weight_shape[i].points[j].control_points[0] + this.weight_shape[i].points[j - 1].position.x;
                    const y1 = this.weight_shape[i].points[j - 1].position.y;
                    const x2 = this.weight_shape[i].points[j].position.x;
                    const y2 = abs(this.weight_shape[i].points[j - 1].position.y - this.weight_shape[i].points[j].position.y) * this.weight_shape[i].points[j].control_points[1] + this.weight_shape[i].points[j].position.y;
                    bezierVertex(x1, y1, x2, y2, this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                  } else{
                    const x1 = this.weight_shape[i].points[j - 1].position.x;
                    const y1 = -abs(this.weight_shape[i].points[j - 1].position.y - this.weight_shape[i].points[j].position.y) * this.weight_shape[i].points[j].control_points[0] + this.weight_shape[i].points[j - 1].position.y;
                    const x2 = -abs(this.weight_shape[i].points[j - 1].position.x - this.weight_shape[i].points[j].position.x) * this.weight_shape[i].points[j].control_points[1] + this.weight_shape[i].points[j].position.x;
                    const y2 = this.weight_shape[i].points[j].position.y;
                    bezierVertex(x1, y1, x2, y2, this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                  }
                } else if(point_2.x > point_1.x && point_2.y > point_1.y){
                  if((hv_4 >= hv_3 && hv_4 <= 0) || (hv_4 >= 0 && hv_4 < hv_1)){
                    const x1 = this.weight_shape[i].points[j - 1].position.x;
                    const y1 = abs(this.weight_shape[i].points[j - 1].position.y - this.weight_shape[i].points[j].position.y) * this.weight_shape[i].points[j].control_points[0] + this.weight_shape[i].points[j - 1].position.y;
                    const x2 = -abs(this.weight_shape[i].points[j - 1].position.x - this.weight_shape[i].points[j].position.x) * this.weight_shape[i].points[j].control_points[1] + this.weight_shape[i].points[j].position.x;
                    const y2 = this.weight_shape[i].points[j].position.y;
                    bezierVertex(x1, y1, x2, y2, this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                  } else{
                    const x1 = abs(this.weight_shape[i].points[j - 1].position.x - this.weight_shape[i].points[j].position.x) * this.weight_shape[i].points[j].control_points[0] + this.weight_shape[i].points[j - 1].position.x;
                    const y1 = this.weight_shape[i].points[j - 1].position.y;
                    const x2 = this.weight_shape[i].points[j].position.x;
                    const y2 = -abs(this.weight_shape[i].points[j - 1].position.y - this.weight_shape[i].points[j].position.y) * this.weight_shape[i].points[j].control_points[1] + this.weight_shape[i].points[j].position.y;
                    bezierVertex(x1, y1, x2, y2, this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                  }
                } else if(point_2.x < point_1.x && point_2.y > point_1.y){
                  if((hv_4 <= hv_3 && hv_4 >= -PI) || (hv_4 > hv_1 && hv_4 <= 0)){
                    const x1 = this.weight_shape[i].points[j - 1].position.x;
                    const y1 = abs(this.weight_shape[i].points[j - 1].position.y - this.weight_shape[i].points[j].position.y) * this.weight_shape[i].points[j].control_points[0] + this.weight_shape[i].points[j - 1].position.y;
                    const x2 = abs(this.weight_shape[i].points[j - 1].position.x - this.weight_shape[i].points[j].position.x) * this.weight_shape[i].points[j].control_points[1] + this.weight_shape[i].points[j].position.x;
                    const y2 = this.weight_shape[i].points[j].position.y;
                    bezierVertex(x1, y1, x2, y2, this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                  } else{
                    const x1 = -abs(this.weight_shape[i].points[j - 1].position.x - this.weight_shape[i].points[j].position.x) * this.weight_shape[i].points[j].control_points[0] + this.weight_shape[i].points[j - 1].position.x;
                    const y1 = this.weight_shape[i].points[j - 1].position.y;
                    const x2 = this.weight_shape[i].points[j].position.x;
                    const y2 = -abs(this.weight_shape[i].points[j - 1].position.y - this.weight_shape[i].points[j].position.y) * this.weight_shape[i].points[j].control_points[1] + this.weight_shape[i].points[j].position.y;
                    bezierVertex(x1, y1, x2, y2, this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                  }
                } else if(point_2.x < point_1.x && point_2.y < point_1.y){
                  if((hv_4 >= hv_1 && hv_4 <= 0) || (hv_4 >= 0 && hv_4 < hv_3)){
                    const x1 = -abs(this.weight_shape[i].points[j - 1].position.x - this.weight_shape[i].points[j].position.x) * this.weight_shape[i].points[j].control_points[0] + this.weight_shape[i].points[j - 1].position.x;
                    const y1 = this.weight_shape[i].points[j - 1].position.y;
                    const x2 = this.weight_shape[i].points[j].position.x;
                    const y2 = abs(this.weight_shape[i].points[j - 1].position.y - this.weight_shape[i].points[j].position.y) * this.weight_shape[i].points[j].control_points[1] + this.weight_shape[i].points[j].position.y;
                    bezierVertex(x1, y1, x2, y2, this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                  } else {
                    const x1 = this.weight_shape[i].points[j - 1].position.x;
                    const y1 = -abs(this.weight_shape[i].points[j - 1].position.y - this.weight_shape[i].points[j].position.y) * this.weight_shape[i].points[j].control_points[0] + this.weight_shape[i].points[j - 1].position.y;
                    const x2 = abs(this.weight_shape[i].points[j - 1].position.x - this.weight_shape[i].points[j].position.x) * this.weight_shape[i].points[j].control_points[1] + this.weight_shape[i].points[j].position.x;
                    const y2 = this.weight_shape[i].points[j].position.y;
                    bezierVertex(x1, y1, x2, y2, this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                  }
                } else{
                  vertex(this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                }
              }else{
                const point_3 = createVector(map(sub_shapes[i].points[j - 2].position.x, 0, this.grid - 1, this.margin, width - this.margin), map(sub_shapes[i].points[j - 2].position.y, 0, this.grid - 1, this.margin, height - this.margin));
                const point_4 = createVector(map(sub_shapes[i].points[j + 1].position.x, 0, this.grid - 1, this.margin, width - this.margin), map(sub_shapes[i].points[j + 1].position.y, 0, this.grid - 1, this.margin, height - this.margin));
                const vertex_1 = p5.Vector.sub(point_2, point_1);
                const vertex_2 = p5.Vector.sub(point_3, point_2);
                const vertex_3 = p5.Vector.sub(point_2, point_1).mult(-1);
                const vertex_4 = p5.Vector.sub(point_4, point_2);
                const hv_1 = vertex_1.heading();
                const hv_2 = vertex_2.heading();
                const hv_3 = vertex_3.heading();
                const hv_4 = vertex_4.heading();
                if(point_2.x > point_1.x && point_2.y < point_1.y){
                  if((hv_2 > hv_1 && hv_2 <= 0) || (hv_2 >= 0 && hv_2 <= hv_3)){
                    if((hv_4 >= hv_1 && hv_4 <= 0) || (hv_4 >= 0 && hv_4 < hv_3)){
                      const x1 = this.weight_shape[i].points[j - 1].position.x;
                      const y1 = -abs(this.weight_shape[i].points[j - 1].position.y - this.weight_shape[i].points[j].position.y) * this.weight_shape[i].points[j].control_points[0] + this.weight_shape[i].points[j - 1].position.y;
                      const x2 = -abs(this.weight_shape[i].points[j - 1].position.x - this.weight_shape[i].points[j].position.x) * this.weight_shape[i].points[j].control_points[1] + this.weight_shape[i].points[j].position.x;
                      const y2 = this.weight_shape[i].points[j].position.y;
                      bezierVertex(x1, y1, x2, y2, this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                    } else{
                      const x1 = abs(this.weight_shape[i].points[j - 1].position.x - this.weight_shape[i].points[j].position.x) * this.weight_shape[i].points[j].control_points[0] + this.weight_shape[i].points[j - 1].position.x;
                      const y1 = this.weight_shape[i].points[j - 1].position.y;
                      const x2 = this.weight_shape[i].points[j].position.x;
                      const y2 = abs(this.weight_shape[i].points[j - 1].position.y - this.weight_shape[i].points[j].position.y) * this.weight_shape[i].points[j].control_points[1] + this.weight_shape[i].points[j].position.y;
                      bezierVertex(x1, y1, x2, y2, this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                    }
                  } else{
                    if((hv_4 >= hv_1 && hv_4 <= 0) || (hv_4 >= 0 && hv_4 < hv_3)){
                      const x1 = abs(this.weight_shape[i].points[j - 1].position.x - this.weight_shape[i].points[j].position.x) * this.weight_shape[i].points[j].control_points[0] + this.weight_shape[i].points[j - 1].position.x;
                      const y1 = this.weight_shape[i].points[j - 1].position.y;
                      const x2 = this.weight_shape[i].points[j].position.x;
                      const y2 = abs(this.weight_shape[i].points[j - 1].position.y - this.weight_shape[i].points[j].position.y) * this.weight_shape[i].points[j].control_points[1] + this.weight_shape[i].points[j].position.y;
                      bezierVertex(x1, y1, x2, y2, this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                    } else{
                      const x1 = this.weight_shape[i].points[j - 1].position.x;
                      const y1 = -abs(this.weight_shape[i].points[j - 1].position.y - this.weight_shape[i].points[j].position.y) * this.weight_shape[i].points[j].control_points[0] + this.weight_shape[i].points[j - 1].position.y;
                      const x2 = -abs(this.weight_shape[i].points[j - 1].position.x - this.weight_shape[i].points[j].position.x) * this.weight_shape[i].points[j].control_points[1] + this.weight_shape[i].points[j].position.x;
                      const y2 = this.weight_shape[i].points[j].position.y;
                      bezierVertex(x1, y1, x2, y2, this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                    }
                  }
                } else if(point_2.x > point_1.x && point_2.y > point_1.y){
                  if((hv_2 >= hv_1 && hv_2 <= PI) || (hv_2 >= -PI && hv_2 < hv_3)){
                    if((hv_4 >= -PI && hv_4 <= hv_3) || (hv_4 <= PI && hv_4 > hv_1)){
                      const x1 = abs(this.weight_shape[i].points[j - 1].position.x - this.weight_shape[i].points[j].position.x) * this.weight_shape[i].points[j].control_points[0] + this.weight_shape[i].points[j - 1].position.x;
                      const y1 = this.weight_shape[i].points[j - 1].position.y;
                      const x2 = this.weight_shape[i].points[j].position.x;
                      const y2 = -abs(this.weight_shape[i].points[j - 1].position.y - this.weight_shape[i].points[j].position.y) * this.weight_shape[i].points[j].control_points[1] + this.weight_shape[i].points[j].position.y;
                      bezierVertex(x1, y1, x2, y2, this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                    } else {
                      const x1 = this.weight_shape[i].points[j - 1].position.x;
                      const y1 = abs(this.weight_shape[i].points[j - 1].position.y - this.weight_shape[i].points[j].position.y) * this.weight_shape[i].points[j].control_points[0] + this.weight_shape[i].points[j - 1].position.y;
                      const x2 = -abs(this.weight_shape[i].points[j - 1].position.x - this.weight_shape[i].points[j].position.x) * this.weight_shape[i].points[j].control_points[1] + this.weight_shape[i].points[j].position.x;
                      const y2 = this.weight_shape[i].points[j].position.y;
                      bezierVertex(x1, y1, x2, y2, this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                    }
                  } else{
                    if((hv_4 >= -PI && hv_4 <= hv_3) || (hv_4 <= PI && hv_4 > hv_1)){
                      const x1 = this.weight_shape[i].points[j - 1].position.x;
                      const y1 = abs(this.weight_shape[i].points[j - 1].position.y - this.weight_shape[i].points[j].position.y) * this.weight_shape[i].points[j].control_points[0] + this.weight_shape[i].points[j - 1].position.y;
                      const x2 = -abs(this.weight_shape[i].points[j - 1].position.x - this.weight_shape[i].points[j].position.x) * this.weight_shape[i].points[j].control_points[1] + this.weight_shape[i].points[j].position.x;
                      const y2 = this.weight_shape[i].points[j].position.y;
                      bezierVertex(x1, y1, x2, y2, this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                    } else {
                      const x1 = this.weight_shape[i].points[j - 1].position.x;
                      const y1 = abs(this.weight_shape[i].points[j - 1].position.y - this.weight_shape[i].points[j].position.y) * this.weight_shape[i].points[j].control_points[0] + this.weight_shape[i].points[j - 1].position.y;
                      const x2 = -abs(this.weight_shape[i].points[j - 1].position.x - this.weight_shape[i].points[j].position.x) * this.weight_shape[i].points[j].control_points[1] + this.weight_shape[i].points[j].position.x;
                      const y2 = this.weight_shape[i].points[j].position.y;
                      bezierVertex(x1, y1, x2, y2, this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                    }
                  }
                } else if(point_2.x < point_1.x && point_2.y > point_1.y){
                  if((hv_2 >= hv_3 && hv_2 <= 0) || (hv_2 >= 0 && hv_2 < hv_1)){
                    if((hv_4 <= hv_3 && hv_4 >= -PI) || (hv_4 <= PI && hv_4 > hv_1)){
                      const x1 = this.weight_shape[i].points[j - 1].position.x;
                      const y1 = abs(this.weight_shape[i].points[j - 1].position.y - this.weight_shape[i].points[j].position.y) * this.weight_shape[i].points[j].control_points[0] + this.weight_shape[i].points[j - 1].position.y;
                      const x2 = abs(this.weight_shape[i].points[j - 1].position.x - this.weight_shape[i].points[j].position.x) * this.weight_shape[i].points[j].control_points[1] + this.weight_shape[i].points[j].position.x;
                      const y2 = this.weight_shape[i].points[j].position.y;
                      bezierVertex(x1, y1, x2, y2, this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                    } else {
                      const x1 = -abs(this.weight_shape[i].points[j - 1].position.x - this.weight_shape[i].points[j].position.x) * this.weight_shape[i].points[j].control_points[0] + this.weight_shape[i].points[j - 1].position.x;
                      const y1 = this.weight_shape[i].points[j - 1].position.y;
                      const x2 = this.weight_shape[i].points[j].position.x;
                      const y2 = -abs(this.weight_shape[i].points[j - 1].position.y - this.weight_shape[i].points[j].position.y) * this.weight_shape[i].points[j].control_points[1] + this.weight_shape[i].points[j].position.y;
                      bezierVertex(x1, y1, x2, y2, this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                    }
                  } else{
                    if((hv_4 <= hv_3 && hv_4 >= -PI) || (hv_4 <= PI && hv_4 > hv_1)){
                      const x1 = this.weight_shape[i].points[j - 1].position.x;
                      const y1 = abs(this.weight_shape[i].points[j - 1].position.y - this.weight_shape[i].points[j].position.y) * this.weight_shape[i].points[j].control_points[0] + this.weight_shape[i].points[j - 1].position.y;
                      const x2 = abs(this.weight_shape[i].points[j - 1].position.x - this.weight_shape[i].points[j].position.x) * this.weight_shape[i].points[j].control_points[1] + this.weight_shape[i].points[j].position.x;
                      const y2 = this.weight_shape[i].points[j].position.y;
                      bezierVertex(x1, y1, x2, y2, this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                    } else {
                      const x1 = -abs(this.weight_shape[i].points[j - 1].position.x - this.weight_shape[i].points[j].position.x) * this.weight_shape[i].points[j].control_points[0] + this.weight_shape[i].points[j - 1].position.x;
                      const y1 = this.weight_shape[i].points[j - 1].position.y;
                      const x2 = this.weight_shape[i].points[j].position.x;
                      const y2 = -abs(this.weight_shape[i].points[j - 1].position.y - this.weight_shape[i].points[j].position.y) * this.weight_shape[i].points[j].control_points[1] + this.weight_shape[i].points[j].position.y;
                      bezierVertex(x1, y1, x2, y2, this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                    }
                  }
                } else if(point_2.x < point_1.x && point_2.y < point_1.y){
                  if((hv_2 <= hv_1 && hv_2 >= -PI) || (hv_2 > hv_3 && hv_1 < PI)){
                    if((hv_4 >= hv_3 && hv_4 >= 0) || (hv_4 >= 0 && hv_4 < hv_1)){
                      //////////////
                      //////////////
                      // Bug
                      //////////////
                      //////////////
                      /*const shape = {
                        points: [
                          {position: {x: this.grid - 1, y: this.grid - 1}, weight: [10, 10]},
                          {position: {x: this.grid - 2, y: 1}, weight: [10, 10]},
                          {position: {x: 0, y: 0}, weight: [10, 10], control_points: [0.5, 0.5]},
                          {position: {x: 0, y: this.grid - 1}, weight: [10, 10]}

                        ],
                        property: ['open']
                      }*/
                      const x1 = this.weight_shape[i].points[j - 1].position.x;
                      const y1 = -abs(this.weight_shape[i].points[j - 1].position.y - this.weight_shape[i].points[j].position.y) * this.weight_shape[i].points[j].control_points[0] + this.weight_shape[i].points[j - 1].position.y;
                      const x2 = abs(this.weight_shape[i].points[j - 1].position.x - this.weight_shape[i].points[j].position.x) * this.weight_shape[i].points[j].control_points[0] + this.weight_shape[i].points[j].position.x;
                      const y2 = this.weight_shape[i].points[j].position.y;
                      bezierVertex(x1, y1, x2, y2, this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                    } else {
                      const x1 = -abs(this.weight_shape[i].points[j - 1].position.x - this.weight_shape[i].points[j].position.x) * this.weight_shape[i].points[j].control_points[0] + this.weight_shape[i].points[j - 1].position.x;
                      const y1 = this.weight_shape[i].points[j - 1].position.y;
                      const x2 = this.weight_shape[i].points[j].position.x;
                      const y2 = abs(this.weight_shape[i].points[j - 1].position.y - this.weight_shape[i].points[j].position.y) * this.weight_shape[i].points[j].control_points[0] + this.weight_shape[i].points[j].position.y;
                      bezierVertex(x1, y1, x2, y2, this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                    }
                  } else{
                    if((hv_4 >= hv_3 && hv_4 >= 0) || (hv_4 >= 0 && hv_4 < hv_1)){
                      const x1 = -abs(this.weight_shape[i].points[j - 1].position.x - this.weight_shape[i].points[j].position.x) * this.weight_shape[i].points[j].control_points[0] + this.weight_shape[i].points[j - 1].position.x;
                      const y1 = this.weight_shape[i].points[j - 1].position.y;
                      const x2 = this.weight_shape[i].points[j].position.x;
                      const y2 = abs(this.weight_shape[i].points[j - 1].position.y - this.weight_shape[i].points[j].position.y) * this.weight_shape[i].points[j].control_points[0] + this.weight_shape[i].points[j].position.y;
                      bezierVertex(x1, y1, x2, y2, this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                    } else {
                      const x1 = -abs(this.weight_shape[i].points[j - 1].position.x - this.weight_shape[i].points[j].position.x) * this.weight_shape[i].points[j].control_points[0] + this.weight_shape[i].points[j - 1].position.x;
                      const y1 = this.weight_shape[i].points[j - 1].position.y;
                      const x2 = this.weight_shape[i].points[j].position.x;
                      const y2 = abs(this.weight_shape[i].points[j - 1].position.y - this.weight_shape[i].points[j].position.y) * this.weight_shape[i].points[j].control_points[0] + this.weight_shape[i].points[j].position.y;
                      bezierVertex(x1, y1, x2, y2, this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                    }
                  }
                } else{
                  vertex(this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                }
              }
            } else{
              vertex(this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
            }
          } else{
            let mapped_j = map(j - this.genotype[i].points.length, this.genotype[i].points.length - 1, 0, 0, this.genotype[i].points.length - 1);
            //console.log(this.weight_shape[i].points.length/2, this.weight_shape[i].points.length);
            if(j != this.weight_shape[i].points.length/2 && this.weight_shape[i].points[j - 1].hasOwnProperty('control_points')){
              /*console.log(mapped_j);
              console.log(sub_shapes[i].points);
              console.log(sub_shapes[i].points[mapped_j]);*/
              const point_1 = createVector(map(sub_shapes[i].points[mapped_j].position.x, 0, this.grid - 1, this.margin, width - this.margin), map(sub_shapes[i].points[mapped_j].position.y, 0, this.grid - 1, this.margin, height - this.margin));
              const point_2 = createVector(map(sub_shapes[i].points[mapped_j + 1].position.x, 0, this.grid - 1, this.margin, width - this.margin), map(sub_shapes[i].points[mapped_j + 1].position.y, 0, this.grid - 1, this.margin, height - this.margin));
              if(j == this.weight_shape[i].points.length - 1 && j - 1 == this.weight_shape[i].points.length/2){
                if(point_2.x > point_1.x && point_2.y < point_1.y){
                  const x1 = -abs(this.weight_shape[i].points[j - 1].position.x - this.weight_shape[i].points[j].position.x) * this.weight_shape[i].points[j - 1].control_points[1] + this.weight_shape[i].points[j - 1].position.x;
                  const y1 = this.weight_shape[i].points[j - 1].position.y;
                  const x2 = this.weight_shape[i].points[j].position.x;
                  const y2 = -abs(this.weight_shape[i].points[j - 1].position.x - this.weight_shape[i].points[j].position.x) * this.weight_shape[i].points[j - 1].control_points[0] + this.weight_shape[i].points[j].position.y;
                  bezierVertex(x1, y1, x2, y2, this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                } else if(point_2.x > point_1.x && point_2.y > point_1.y){
                  const x1 = this.weight_shape[i].points[j - 1].position.x;
                  const y1 = -abs(this.weight_shape[i].points[j - 1].position.y - this.weight_shape[i].points[j].position.y) * this.weight_shape[i].points[j - 1].control_points[1] + this.weight_shape[i].points[j - 1].position.y;
                  const x2 = abs(this.weight_shape[i].points[j - 1].position.x - this.weight_shape[i].points[j].position.x) * this.weight_shape[i].points[j - 1].control_points[0] + this.weight_shape[i].points[j].position.x;
                  const y2 = this.weight_shape[i].points[j].position.y;
                  bezierVertex(x1, y1, x2, y2, this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                } else if(point_2.x < point_1.x && point_2.y > point_1.y){
                  const x1 = abs(this.weight_shape[i].points[j - 1].position.x - this.weight_shape[i].points[j].position.x) * this.weight_shape[i].points[j - 1].control_points[1] + this.weight_shape[i].points[j - 1].position.x;
                  const y1 = this.weight_shape[i].points[j - 1].position.y;
                  const x2 = this.weight_shape[i].points[j].position.x;
                  const y2 = abs(this.weight_shape[i].points[j - 1].position.y - this.weight_shape[i].points[j].position.y) * this.weight_shape[i].points[j - 1].control_points[0] + this.weight_shape[i].points[j].position.y;
                  bezierVertex(x1, y1, x2, y2, this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                } else if(point_2.x < point_1.x && point_2.y < point_1.y){
                  const x1 = this.weight_shape[i].points[j - 1].position.x;
                  const y1 = abs(this.weight_shape[i].points[j - 1].position.y - this.weight_shape[i].points[j].position.y) * this.weight_shape[i].points[j - 1].control_points[1] + this.weight_shape[i].points[j - 1].position.y;
                  const x2 = -abs(this.weight_shape[i].points[j - 1].position.x - this.weight_shape[i].points[j].position.x) * this.weight_shape[i].points[j - 1].control_points[0] + this.weight_shape[i].points[j].position.x;
                  const y2 = this.weight_shape[i].points[j].position.y;
                  bezierVertex(x1, y1, x2, y2, this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                } else{
                  vertex(this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                }
              } else if(j - 1 == this.weight_shape[i].points.length/2){
                // Bug here ? j => mapped_j
                const point_3 = createVector(map(sub_shapes[i].points[mapped_j - 1].position.x, 0, this.grid - 1, this.margin, width - this.margin), map(sub_shapes[i].points[mapped_j - 1].position.y, 0, this.grid - 1, this.margin, height - this.margin));
                const vertex_1 = p5.Vector.sub(point_2, point_1);
                const vertex_2 = p5.Vector.sub(point_3, point_2);
                const vertex_3 = p5.Vector.sub(point_2, point_1).mult(-1);
                const hv_1 = vertex_1.heading();
                const hv_2 = vertex_2.heading();
                const hv_3 = vertex_3.heading();
                if(point_2.x > point_1.x && point_2.y < point_1.y){
                  if((hv_2 > hv_1 && hv_2 <= 0) || (hv_2 >= 0 && hv_2 <= hv_3)){
                    const x1 = -abs(this.weight_shape[i].points[j - 1].position.x - this.weight_shape[i].points[j].position.x) * this.weight_shape[i].points[j - 1].control_points[0] + this.weight_shape[i].points[j - 1].position.x;
                    const y1 = this.weight_shape[i].points[j - 1].position.y;
                    const x2 = this.weight_shape[i].points[j].position.x;
                    const y2 = -abs(this.weight_shape[i].points[j - 1].position.y - this.weight_shape[i].points[j].position.y) * this.weight_shape[i].points[j - 1].control_points[1] + this.weight_shape[i].points[j].position.y;
                    bezierVertex(x1, y1, x2, y2, this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                  } else{
                    const x1 = this.weight_shape[i].points[j - 1].position.x;
                    const y1 = abs(this.weight_shape[i].points[j - 1].position.y - this.weight_shape[i].points[j].position.y) * this.weight_shape[i].points[j - 1].control_points[1] + this.weight_shape[i].points[j - 1].position.y;
                    const x2 = abs(this.weight_shape[i].points[j - 1].position.x - this.weight_shape[i].points[j].position.x) * this.weight_shape[i].points[j - 1].control_points[0] + this.weight_shape[i].points[j].position.x;
                    const y2 = this.weight_shape[i].points[j].position.y;
                    bezierVertex(x1, y1, x2, y2, this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                  }
                } else if(point_2.x > point_1.x && point_2.y > point_1.y){
                  if((hv_2 >= hv_1 && hv_2 <= PI) || (hv_2 >= -PI && hv_2 < hv_3)){
                    const x1 = this.weight_shape[i].points[j - 1].position.x;
                    const y1 = -abs(this.weight_shape[i].points[j - 1].position.y - this.weight_shape[i].points[j].position.y) * this.weight_shape[i].points[j - 1].control_points[1] + this.weight_shape[i].points[j - 1].position.y;
                    const x2 = abs(this.weight_shape[i].points[j - 1].position.x - this.weight_shape[i].points[j].position.x) * this.weight_shape[i].points[j - 1].control_points[1] + this.weight_shape[i].points[j].position.x;
                    const y2 = this.weight_shape[i].points[j].position.y;
                    bezierVertex(x1, y1, x2, y2, this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                  } else{
                    const x1 = -abs(this.weight_shape[i].points[j - 1].position.x - this.weight_shape[i].points[j].position.x) * this.weight_shape[i].points[j - 1].control_points[1] + this.weight_shape[i].points[j - 1].position.x;
                    const y1 = this.weight_shape[i].points[j - 1].position.y;
                    const x2 = this.weight_shape[i].points[j].position.x;
                    const y2 = abs(this.weight_shape[i].points[j - 1].position.y - this.weight_shape[i].points[j].position.y) * this.weight_shape[i].points[j - 1].control_points[1] + this.weight_shape[i].points[j].position.y;
                    bezierVertex(x1, y1, x2, y2, this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                  }
                } else if(point_2.x < point_1.x && point_2.y > point_1.y){
                  if((hv_2 >= hv_3 && hv_2 <= 0) || (hv_2 >= 0 && hv_2 < hv_1)){
                    const x1 = this.weight_shape[i].points[j - 1].position.x;
                    const y1 = -abs(this.weight_shape[i].points[j - 1].position.y - this.weight_shape[i].points[j].position.y) * this.weight_shape[i].points[j - 1].control_points[1] + this.weight_shape[i].points[j - 1].position.y;
                    const x2 = -abs(this.weight_shape[i].points[j - 1].position.x - this.weight_shape[i].points[j].position.x) * this.weight_shape[i].points[j - 1].control_points[0] + this.weight_shape[i].points[j].position.x;
                    const y2 = this.weight_shape[i].points[j].position.y;
                    bezierVertex(x1, y1, x2, y2, this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                  } else {
                    const x1 = abs(this.weight_shape[i].points[j - 1].position.x - this.weight_shape[i].points[j].position.x) * this.weight_shape[i].points[j - 1].control_points[1] + this.weight_shape[i].points[j - 1].position.x;
                    const y1 = this.weight_shape[i].points[j - 1].position.y;
                    const x2 = this.weight_shape[i].points[j].position.x;
                    const y2 = abs(this.weight_shape[i].points[j - 1].position.y - this.weight_shape[i].points[j].position.y) * this.weight_shape[i].points[j - 1].control_points[0] + this.weight_shape[i].points[j].position.y;
                    bezierVertex(x1, y1, x2, y2, this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                  }
                } else if(point_2.x < point_1.x && point_2.y < point_1.y){
                  if((hv_2 <= hv_1 && hv_2 >= -PI) || (hv_2 > hv_3 && hv_1 < PI)){
                    const x2 = this.weight_shape[i].points[j].position.x;
                    const y2 = -abs(this.weight_shape[i].points[j - 1].position.y - this.weight_shape[i].points[j].position.y) * this.weight_shape[i].points[j - 1].control_points[0] + this.weight_shape[i].points[j].position.y;
                    const x1 = abs(this.weight_shape[i].points[j - 1].position.x - this.weight_shape[i].points[j].position.x) * this.weight_shape[i].points[j - 1].control_points[1] + this.weight_shape[i].points[j - 1].position.x;
                    const y1 = this.weight_shape[i].points[j - 1].position.y;
                    bezierVertex(x1, y1, x2, y2, this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                  } else{
                    const x2 = -abs(this.weight_shape[i].points[j - 1].position.x - this.weight_shape[i].points[j].position.x) * this.weight_shape[i].points[j - 1].control_points[0] + this.weight_shape[i].points[j].position.x;
                    const y2 = this.weight_shape[i].points[j].position.y;
                    const x1 = this.weight_shape[i].points[j - 1].position.x;
                    const y1 = abs(this.weight_shape[i].points[j - 1].position.y - this.weight_shape[i].points[j].position.y) * this.weight_shape[i].points[j - 1].control_points[1] + this.weight_shape[i].points[j - 1].position.y;
                    bezierVertex(x1, y1, x2, y2, this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                  }
                }else{
                  vertex(this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                }
              } else if(j == this.weight_shape[i].points.length - 1){
                const point_4 = createVector(map(sub_shapes[i].points[mapped_j + 2].position.x, 0, this.grid - 1, this.margin, width - this.margin), map(sub_shapes[i].points[mapped_j + 2].position.y, 0, this.grid - 1, this.margin, height - this.margin));
                const vertex_1 = p5.Vector.sub(point_2, point_1);
                const vertex_3 = p5.Vector.sub(point_2, point_1).mult(-1);
                const vertex_4 = p5.Vector.sub(point_4, point_2);
                const hv_1 = vertex_1.heading();
                const hv_3 = vertex_3.heading();
                const hv_4 = vertex_4.heading();
                if(point_2.x > point_1.x && point_2.y < point_1.y){
                  if((hv_4 <= hv_1 && hv_4 >= -PI) || (hv_4 <= PI && hv_4 > hv_3)){
                    const x2 = abs(this.weight_shape[i].points[j - 1].position.x - this.weight_shape[i].points[j].position.x) * this.weight_shape[i].points[j - 1].control_points[0] + this.weight_shape[i].points[j].position.x;
                    const y2 = this.weight_shape[i].points[j].position.y;
                    const x1 = this.weight_shape[i].points[j - 1].position.x;
                    const y1 = abs(this.weight_shape[i].points[j - 1].position.y - this.weight_shape[i].points[j].position.y) * this.weight_shape[i].points[j - 1].control_points[1] + this.weight_shape[i].points[j - 1].position.y;
                    bezierVertex(x1, y1, x2, y2, this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                  } else{
                    const x2 = this.weight_shape[i].points[j].position.x;
                    const y2 = -abs(this.weight_shape[i].points[j - 1].position.y - this.weight_shape[i].points[j].position.y) * this.weight_shape[i].points[j - 1].control_points[0] + this.weight_shape[i].points[j].position.y;
                    const x1 = -abs(this.weight_shape[i].points[j - 1].position.x - this.weight_shape[i].points[j].position.x) * this.weight_shape[i].points[j - 1].control_points[1] + this.weight_shape[i].points[j - 1].position.x;
                    const y1 = this.weight_shape[i].points[j - 1].position.y;
                    bezierVertex(x1, y1, x2, y2, this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                  }
                } else if(point_2.x > point_1.x && point_2.y > point_1.y){
                  if((hv_4 >= hv_3 && hv_4 <= 0) || (hv_4 >= 0 && hv_4 < hv_1)){
                    const x2 = this.weight_shape[i].points[j].position.x;
                    const y2 = abs(this.weight_shape[i].points[j - 1].position.y - this.weight_shape[i].points[j].position.y) * this.weight_shape[i].points[j - 1].control_points[0] + this.weight_shape[i].points[j].position.y;
                    const x1 = -abs(this.weight_shape[i].points[j - 1].position.x - this.weight_shape[i].points[j].position.x) * this.weight_shape[i].points[j - 1].control_points[1] + this.weight_shape[i].points[j - 1].position.x;
                    const y1 = this.weight_shape[i].points[j - 1].position.y;
                    bezierVertex(x1, y1, x2, y2, this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                  } else{
                    const x2 = abs(this.weight_shape[i].points[j - 1].position.x - this.weight_shape[i].points[j].position.x) * this.weight_shape[i].points[j - 1].control_points[0] + this.weight_shape[i].points[j].position.x;
                    const y2 = this.weight_shape[i].points[j].position.y;
                    const x1 = this.weight_shape[i].points[j - 1].position.x;
                    const y1 = -abs(this.weight_shape[i].points[j - 1].position.y - this.weight_shape[i].points[j].position.y) * this.weight_shape[i].points[j - 1].control_points[1] + this.weight_shape[i].points[j - 1].position.y;
                    bezierVertex(x1, y1, x2, y2, this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                  }
                } else if(point_2.x < point_1.x && point_2.y > point_1.y){
                  if((hv_4 <= hv_3 && hv_4 >= -PI) || (hv_4 > hv_1 && hv_4 <= 0)){
                    const x2 = this.weight_shape[i].points[j].position.x;
                    const y2 = abs(this.weight_shape[i].points[j - 1].position.y - this.weight_shape[i].points[j].position.y) * this.weight_shape[i].points[j - 1].control_points[0] + this.weight_shape[i].points[j].position.y;
                    const x1 = abs(this.weight_shape[i].points[j - 1].position.x - this.weight_shape[i].points[j].position.x) * this.weight_shape[i].points[j - 1].control_points[1] + this.weight_shape[i].points[j - 1].position.x;
                    const y1 = this.weight_shape[i].points[j - 1].position.y;
                    bezierVertex(x1, y1, x2, y2, this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                  } else{
                    const x2 = -abs(this.weight_shape[i].points[j - 1].position.x - this.weight_shape[i].points[j].position.x) * this.weight_shape[i].points[j - 1].control_points[0] + this.weight_shape[i].points[j].position.x;
                    const y2 = this.weight_shape[i].points[j].position.y;
                    const x1 = this.weight_shape[i].points[j - 1].position.x;
                    const y1 = -abs(this.weight_shape[i].points[j - 1].position.y - this.weight_shape[i].points[j].position.y) * this.weight_shape[i].points[j - 1].control_points[1] + this.weight_shape[i].points[j - 1].position.y;
                    bezierVertex(x1, y1, x2, y2, this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                  }
                } else if(point_2.x < point_1.x && point_2.y < point_1.y){
                  if((hv_4 >= hv_1 && hv_4 <= 0) || (hv_4 >= 0 && hv_4 < hv_3)){
                    const x2 = -abs(this.weight_shape[i].points[j - 1].position.x - this.weight_shape[i].points[j].position.x) * this.weight_shape[i].points[j - 1].control_points[0] + this.weight_shape[i].points[j].position.x;
                    const y2 = this.weight_shape[i].points[j].position.y;
                    const x1 = this.weight_shape[i].points[j - 1].position.x;
                    const y1 = abs(this.weight_shape[i].points[j - 1].position.y - this.weight_shape[i].points[j].position.y) * this.weight_shape[i].points[j - 1].control_points[1] + this.weight_shape[i].points[j - 1].position.y;
                    bezierVertex(x1, y1, x2, y2, this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                  } else {
                    const x2 = this.weight_shape[i].points[j].position.x;
                    const y2 = -abs(this.weight_shape[i].points[j - 1].position.y - this.weight_shape[i].points[j].position.y) * this.weight_shape[i].points[j - 1].control_points[0] + this.weight_shape[i].points[j].position.y;
                    const x1 = abs(this.weight_shape[i].points[j - 1].position.x - this.weight_shape[i].points[j].position.x) * this.weight_shape[i].points[j - 1].control_points[1] + this.weight_shape[i].points[j - 1].position.x;
                    const y1 = this.weight_shape[i].points[j - 1].position.y;
                    bezierVertex(x1, y1, x2, y2, this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                  }
                } else{
                  vertex(this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                }
              } else {
                const point_3 = createVector(map(sub_shapes[i].points[mapped_j + 1].position.x, 0, this.grid - 1, this.margin, width - this.margin), map(sub_shapes[i].points[mapped_j + 1].position.y, 0, this.grid - 1, this.margin, height - this.margin));
                const point_4 = createVector(map(sub_shapes[i].points[mapped_j + 2].position.x, 0, this.grid - 1, this.margin, width - this.margin), map(sub_shapes[i].points[mapped_j + 2].position.y, 0, this.grid - 1, this.margin, height - this.margin));
                const vertex_1 = p5.Vector.sub(point_2, point_1);
                const vertex_2 = p5.Vector.sub(point_3, point_2);
                const vertex_3 = p5.Vector.sub(point_2, point_1).mult(-1);
                const vertex_4 = p5.Vector.sub(point_4, point_2);
                const hv_1 = vertex_1.heading();
                const hv_2 = vertex_2.heading();
                const hv_3 = vertex_3.heading();
                const hv_4 = vertex_4.heading();
                if(point_2.x > point_1.x && point_2.y < point_1.y){
                  if((hv_2 > hv_1 && hv_2 <= 0) || (hv_2 >= 0 && hv_2 <= hv_3)){
                    if((hv_4 >= hv_1 && hv_4 <= 0) || (hv_4 >= 0 && hv_4 < hv_3)){
                      const x2 = this.weight_shape[i].points[j].position.x;
                      const y2 = -abs(this.weight_shape[i].points[j - 1].position.y - this.weight_shape[i].points[j].position.y) * this.weight_shape[i].points[j - 1].control_points[0] + this.weight_shape[i].points[j].position.y;
                      const x1 = -abs(this.weight_shape[i].points[j - 1].position.x - this.weight_shape[i].points[j].position.x) * this.weight_shape[i].points[j - 1].control_points[1] + this.weight_shape[i].points[j - 1].position.x;
                      const y1 = this.weight_shape[i].points[j - 1].position.y;
                      bezierVertex(x1, y1, x2, y2, this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                    } else{
                      const x2 = abs(this.weight_shape[i].points[j - 1].position.x - this.weight_shape[i].points[j].position.x) * this.weight_shape[i].points[j - 1].control_points[0] + this.weight_shape[i].points[j].position.x;
                      const y2 = this.weight_shape[i].points[j].position.y;
                      const x1 = this.weight_shape[i].points[j - 1].position.x;
                      const y1 = abs(this.weight_shape[i].points[j - 1].position.y - this.weight_shape[i].points[j].position.y) * this.weight_shape[i].points[j - 1].control_points[1] + this.weight_shape[i].points[j - 1].position.y;
                      bezierVertex(x1, y1, x2, y2, this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                    }
                  } else{
                    if((hv_4 >= hv_1 && hv_4 <= 0) || (hv_4 >= 0 && hv_4 < hv_3)){
                      const x2 = abs(this.weight_shape[i].points[j - 1].position.x - this.weight_shape[i].points[j].position.x) * this.weight_shape[i].points[j - 1].control_points[0] + this.weight_shape[i].points[j].position.x;
                      const y2 = this.weight_shape[i].points[j - 1].position.y;
                      const x1 = this.weight_shape[i].points[j].position.x;
                      const y1 = abs(this.weight_shape[i].points[j - 1].position.y - this.weight_shape[i].points[j].position.y) * this.weight_shape[i].points[j - 1].control_points[1] + this.weight_shape[i].points[j - 1].position.y;
                      bezierVertex(x1, y1, x2, y2, this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                    } else{
                      const x2 = this.weight_shape[i].points[j - 1].position.x;
                      const y2 = -abs(this.weight_shape[i].points[j - 1].position.y - this.weight_shape[i].points[j].position.y) * this.weight_shape[i].points[j - 1].control_points[0] + this.weight_shape[i].points[j].position.y;
                      const x1 = -abs(this.weight_shape[i].points[j - 1].position.x - this.weight_shape[i].points[j].position.x) * this.weight_shape[i].points[j - 1].control_points[1] + this.weight_shape[i].points[j - 1].position.x;
                      const y1 = this.weight_shape[i].points[j].position.y;
                      bezierVertex(x1, y1, x2, y2, this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                    }
                  }


                  //////////////////////
                  ///////////
                  // BUG Refaire complètement forme
                  ///////////
                  //////////////////////



                } else if(point_2.x > point_1.x && point_2.y > point_1.y){
                  if((hv_2 >= hv_1 && hv_2 <= PI) || (hv_2 >= -PI && hv_2 < hv_3)){
                    if((hv_4 >= -PI && hv_4 <= hv_3) || (hv_4 <= PI && hv_4 > hv_1)){
                      const x2 = abs(this.weight_shape[i].points[j - 1].position.x - this.weight_shape[i].points[j].position.x) * this.weight_shape[i].points[j - 1].control_points[0] + this.weight_shape[i].points[j].position.x;
                      const y2 = this.weight_shape[i].points[j].position.y;
                      const x1 = this.weight_shape[i].points[j - 1].position.x;
                      const y1 = -abs(this.weight_shape[i].points[j - 1].position.y - this.weight_shape[i].points[j].position.y) * this.weight_shape[i].points[j - 1].control_points[1] + this.weight_shape[i].points[j - 1].position.y;
                      bezierVertex(x1, y1, x2, y2, this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                    } else {
                      const x2 = this.weight_shape[i].points[j].position.x;
                      const y2 = abs(this.weight_shape[i].points[j - 1].position.y - this.weight_shape[i].points[j].position.y) * this.weight_shape[i].points[j - 1].control_points[0] + this.weight_shape[i].points[j].position.y;
                      const x1 = -abs(this.weight_shape[i].points[j - 1].position.x - this.weight_shape[i].points[j].position.x) * this.weight_shape[i].points[j].control_points[1] + this.weight_shape[i].points[j - 1].position.x;
                      const y1 = this.weight_shape[i].points[j - 1].position.y;
                      bezierVertex(x1, y1, x2, y2, this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                    }
                  } else{
                    if((hv_4 >= -PI && hv_4 <= hv_3) || (hv_4 <= PI && hv_4 > hv_1)){
                      const x2 = this.weight_shape[i].points[j].position.x;
                      const y2 = abs(this.weight_shape[i].points[j - 1].position.y - this.weight_shape[i].points[j].position.y) * this.weight_shape[i].points[j - 1].control_points[0] + this.weight_shape[i].points[j].position.y;
                      const x1 = -abs(this.weight_shape[i].points[j - 1].position.x - this.weight_shape[i].points[j].position.x) * this.weight_shape[i].points[j - 1].control_points[1] + this.weight_shape[i].points[j - 1].position.x;
                      const y1 = this.weight_shape[i].points[j - 1].position.y;
                      bezierVertex(x1, y1, x2, y2, this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                    } else {
                      const x2 = this.weight_shape[i].points[j].position.x;
                      const y2 = abs(this.weight_shape[i].points[j - 1].position.y - this.weight_shape[i].points[j].position.y) * this.weight_shape[i].points[j - 1].control_points[0] + this.weight_shape[i].points[j].position.y;
                      const x1 = -abs(this.weight_shape[i].points[j - 1].position.x - this.weight_shape[i].points[j].position.x) * this.weight_shape[i].points[j - 1].control_points[1] + this.weight_shape[i].points[j - 1].position.x;
                      const y1 = this.weight_shape[i].points[j - 1].position.y;
                      bezierVertex(x1, y1, x2, y2, this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                    }
                  }


                  //////////////////////
                  ///////////
                  // BUG Refaire complètement forme
                  ///////////
                  //////////////////////



                } else if(point_2.x < point_1.x && point_2.y > point_1.y){
                  if((hv_2 >= hv_3 && hv_2 <= 0) || (hv_2 >= 0 && hv_2 < hv_1)){
                    if((hv_4 <= hv_3 && hv_4 >= -PI) || (hv_4 <= PI && hv_4 > hv_1)){
                      const x2 = this.weight_shape[i].points[j].position.x;
                      const y2 = abs(this.weight_shape[i].points[j - 1].position.y - this.weight_shape[i].points[j].position.y) * this.weight_shape[i].points[j - 1].control_points[0] + this.weight_shape[i].points[j].position.y;
                      const x1 = abs(this.weight_shape[i].points[j - 1].position.x - this.weight_shape[i].points[j].position.x) * this.weight_shape[i].points[j - 1].control_points[1] + this.weight_shape[i].points[j - 1].position.x;
                      const y1 = this.weight_shape[i].points[j - 1].position.y;
                      bezierVertex(x1, y1, x2, y2, this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                    } else {
                      const x2 = -abs(this.weight_shape[i].points[j - 1].position.x - this.weight_shape[i].points[j].position.x) * this.weight_shape[i].points[j - 1].control_points[0] + this.weight_shape[i].points[j].position.x;
                      const y2 = this.weight_shape[i].points[j].position.y;
                      const x1 = this.weight_shape[i].points[j - 1].position.x;
                      const y1 = -abs(this.weight_shape[i].points[j - 1].position.y - this.weight_shape[i].points[j].position.y) * this.weight_shape[i].points[j - 1].control_points[1] + this.weight_shape[i].points[j - 1].position.y;
                      bezierVertex(x1, y1, x2, y2, this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                    }
                  } else{
                    if((hv_4 <= hv_3 && hv_4 >= -PI) || (hv_4 <= PI && hv_4 > hv_1)){
                      const x2 = this.weight_shape[i].points[j].position.x;
                      const y2 = abs(this.weight_shape[i].points[j - 1].position.y - this.weight_shape[i].points[j].position.y) * this.weight_shape[i].points[j - 1].control_points[0] + this.weight_shape[i].points[j].position.y;
                      const x1 = abs(this.weight_shape[i].points[j - 1].position.x - this.weight_shape[i].points[j].position.x) * this.weight_shape[i].points[j - 1].control_points[1] + this.weight_shape[i].points[j - 1].position.x;
                      const y1 = this.weight_shape[i].points[j - 1].position.y;
                      bezierVertex(x1, y1, x2, y2, this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                    } else {
                      const x2 = -abs(this.weight_shape[i].points[j - 1].position.x - this.weight_shape[i].points[j].position.x) * this.weight_shape[i].points[j - 1].control_points[0] + this.weight_shape[i].points[j].position.x;
                      const y2 = this.weight_shape[i].points[j].position.y;
                      const x1 = this.weight_shape[i].points[j - 1].position.x;
                      const y1 = -abs(this.weight_shape[i].points[j - 1].position.y - this.weight_shape[i].points[j].position.y) * this.weight_shape[i].points[j - 1].control_points[1] + this.weight_shape[i].points[j - 1].position.y;
                      bezierVertex(x1, y1, x2, y2, this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                    }
                  }


                  //////////////////////
                  ///////////
                  // BUG Refaire complètement forme
                  ///////////
                  //////////////////////


                }else if(point_2.x < point_1.x && point_2.y < point_1.y){
                  if((hv_2 <= hv_1 && hv_2 >= -PI) || (hv_2 > hv_3 && hv_1 < PI)){
                    if((hv_4 >= hv_3 && hv_4 >= 0) || (hv_4 >= 0 && hv_4 < hv_1)){
                      const x2 = this.weight_shape[i].points[j].position.x;
                      const y2 = -abs(this.weight_shape[i].points[j - 1].position.y - this.weight_shape[i].points[j].position.y) * this.weight_shape[i].points[j - 1].control_points[0] + this.weight_shape[i].points[j].position.y;
                      const x1 = abs(this.weight_shape[i].points[j - 1].position.x - this.weight_shape[i].points[j].position.x) * this.weight_shape[i].points[j - 1].control_points[1] + this.weight_shape[i].points[j - 1].position.x;
                      const y1 = this.weight_shape[i].points[j - 1].position.y;
                      bezierVertex(x1, y1, x2, y2, this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                    } else {
                      const x2 = -abs(this.weight_shape[i].points[j - 1].position.x - this.weight_shape[i].points[j].position.x) * this.weight_shape[i].points[j - 1].control_points[0] + this.weight_shape[i].points[j].position.x;
                      const y2 = this.weight_shape[i].points[j].position.y;
                      const x1 = this.weight_shape[i].points[j - 1].position.x;
                      const y1 = abs(this.weight_shape[i].points[j - 1].position.y - this.weight_shape[i].points[j].position.y) * this.weight_shape[i].points[j - 1].control_points[1] + this.weight_shape[i].points[j - 1].position.y;
                      bezierVertex(x1, y1, x2, y2, this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                    }
                  } else{
                    if((hv_4 >= hv_3 && hv_4 >= 0) || (hv_4 >= 0 && hv_4 < hv_1)){
                      const x2 = -abs(this.weight_shape[i].points[j - 1].position.x - this.weight_shape[i].points[j].position.x) * this.weight_shape[i].points[j - 1].control_points[0] + this.weight_shape[i].points[j].position.x;
                      const y2 = this.weight_shape[i].points[j].position.y;
                      const x1 = this.weight_shape[i].points[j - 1].position.x;
                      const y1 = abs(this.weight_shape[i].points[j - 1].position.y - this.weight_shape[i].points[j].position.y) * this.weight_shape[i].points[j - 1].control_points[1] + this.weight_shape[i].points[j - 1].position.y;
                      bezierVertex(x1, y1, x2, y2, this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                    } else {
                      const x2 = -abs(this.weight_shape[i].points[j - 1].position.x - this.weight_shape[i].points[j].position.x) * this.weight_shape[i].points[j - 1].control_points[0] + this.weight_shape[i].points[j].position.x;
                      const y2 = this.weight_shape[i].points[j].position.y;
                      const x1 = this.weight_shape[i].points[j - 1].position.x;
                      const y1 = abs(this.weight_shape[i].points[j - 1].position.y - this.weight_shape[i].points[j].position.y) * this.weight_shape[i].points[j - 1].control_points[1] + this.weight_shape[i].points[j - 1].position.y;
                      bezierVertex(x1, y1, x2, y2, this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                    }
                  }
                } else{
                  vertex(this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
                }
              }
            } else{
              vertex(this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
            }
          }
        }
      } else{
        // Code for sub_shape
        vertex(this.weight_shape[i].points[0].position.x, this.weight_shape[i].points[0].position.y);
        for(let j = 1; j < this.weight_shape[i].points.length; j++){
          vertex(this.weight_shape[i].points[j].position.x, this.weight_shape[i].points[j].position.y);
        }
      }
      if(this.weight_shape[i].hasOwnProperty('interior_shape')){
        let b = this.weight_shape[i].interior_shape.splice(0, 1)[0];
        this.weight_shape[i].interior_shape.reverse();
        this.weight_shape[i].interior_shape.unshift(b);
        beginContour();
        for(let j = 0; j < this.weight_shape[i].interior_shape.length; j++){
           vertex(this.weight_shape[i].interior_shape[j].position.x, this.weight_shape[i].interior_shape[j].position.y);
        }
        endContour();
      }
      endShape(CLOSE);
    }
  }
  predict_letter(model){
    const output = tf.tidy(() => model.predict(tf.tensor4d(this.pixels, [1, sqrt(this.pixels.length), sqrt(this.pixels.length), 1], 'float32')).dataSync());
    let output_array = Array.from(output);
    output_array.shift();
    output_array = output_array.map(x => (x*100).toFixed(15));
    this.letters_probability = output_array;
  }
  get_first_part_letter_similarity(model){
    const output = tf.tidy(() => model.predict(tf.tensor4d(this.pixels, [1, sqrt(this.pixels.length), sqrt(this.pixels.length), 1], 'float32')).dataSync());
    let output_array = Array.from(output);
    this.model_similarity_vector = output_array;
  }
  get_second_part_letter_similarity(model, other, divider, ratio){
    const output = tf.tidy(() => {
      const input_left = tf.tensor2d(this.model_similarity_vector, [1, this.model_similarity_vector.length], 'float32');
      const input_right = tf.tensor2d(other, [1, other.length], 'float32');
      return model.predict(input_left, input_right).dataSync();
    });
    let output_array = Array.from(output);
    this.letter_similarity_probability+=100*((output_array[0]*ratio)/(divider*100)).toFixed(15);
  }
  get_fitness(){
      this.max_pooling_letter = this.max_pooling_letter*this.letters_probability_ratio + this.letter_similarity_probability * this.letter_similarity_ratio;
  }
}
