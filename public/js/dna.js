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
   this.mutation_rate = [0.01, 0.5, 0.1];
   this.next_point_random = 0.60;
   this.grid = 12;
   this.num_point = 7;
   this.margin = 5;
 }
 create_new_shape(){

   const shapes = [];
   const num_points = 4;
   const num_shapes = int(random(1, 3));
   for(let j = 0; j < num_shapes; j++){
     const shape = {points: [], property: ["open"]};
     for(let i = 0; i < num_points; i++){
       let point_x = int(random(0, this.grid));
       let point_y = int(random(0, this.grid));
       let point;
       if(i == 0 || random(0, 1) > 0.5){
         point = {position: {x: point_x, y: point_y}};
       } else{
        const control_points = [];
        for(let k = 0; k < 4; k++){
          control_points.push(int(random(0, this.grid)))
        }
        point = {position: {x: point_x, y: point_y}, bezier: true, control_point: control_points};
      }
      shape.points.push(point)
     }
     shapes.push(shape)
   }
   this.genotype = shapes;
   console.log(this.genotype)
   this.remove_empty_shape();
   this.remove_double();
   this.move_sub_shape();
 }

 /* Check */
 display(){
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
   background(255);
   for(let shape of sub_shapes){
     if(shape.property.includes("fill")){
       stroke(0);
       fill(0);
     } else{
       stroke(0);
       noFill();
     }
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
 /* Check */
 get_pixels(){
   if(this.pixels.length == 0){
     this.display();
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
   this.remove_empty_shape();
   this.remove_double();
   this.move_sub_shape();
   /*this.mutation();*/
  }
  /* Check */
  remove_empty_shape(){
    for(let i = this.genotype.length - 1; i >= 0; i--){
      if(this.genotype[i].points.length <= 1){
        this.genotype.splice(i, 1);
      }
    }
  }
  mutation(){
    // For each shape and each subShape;
    // Change point
    for(let i = 0; i < this.genotype.length; i++){
      for(let j = 0; j < this.genotype[i].points.length; j++){
        if(random(0, 1) < this.mutation_rate[0]){
          let new_point_x = int(random(0, this.grid));
          let new_point_y = int(random(0, this.grid));
          this.genotype[i].points.splice(j, 1, {position: {x: new_point_x, y: new_point_y}});
        }
      }
      // Add Point
      if(random(0, 1) < this.mutation_rate[1]){
        const which_shape = int(random(0, this.genotype.length));
        let point_x = int(random(0, this.grid));
        let point_y = int(random(0, this.grid));
        const point = {position: {x: point_x, y: point_y}};
        this.genotype[which_shape].points.push(point);
      }
    }

    // Remove point
    //if lenth > 3 for each shape and each sub shape
      // If break shape, create 2 shape
      // If close
        // property == open
        // if first or second has subshape
          // If subshape.length == 1
            // subshape become part of shape
          // else chose one to become part of it

    // Create subShape
      // For each shape and each sub_shape
        // Create a subShape to a random choosen point

    // Change close fill or not
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
          if(random(0, 1) > 0.5){
            shape.property.push('fill');
          }
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
    // Need to modify genotype to add weights padding to each points
    // Follow point left right with padding random(1, 4)
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
