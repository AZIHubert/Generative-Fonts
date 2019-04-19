class Generation{
  constructor(){
    this.p = createP();
    this.shapes = [];
    this.analyse_once = true;
    this.get_new_gen = false;
    this.calculate_best_letter_once = true;
    this.letter_to_analyse_current = 0;
    this.min_child_by_letter = 50;
    this.max_child_by_letter = 50;
    this.num_polling = 10;
    this.array_rank_calculation = [];
    this.letter_similarity_last_part_current = 0;
    this.letter_similarity_last_part = 0;
    this.probabilite_moyenne = 0;
    this.int_to_char = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
                        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
                        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
                        'à', 'â', 'ç', 'é', 'è', 'ê', 'ë', 'î', 'ï', 'ô', 'ù', 'û', 'ü',
                        'À', 'Â', 'Ç', 'É', 'È', 'Ê', 'Ë', 'Î', 'Ï', 'Ô', 'Ù', 'Û', 'Ü',
                        '.', '?', '!', ',', ';', ':', '/', '\\', '«', '<','(', '[', '{', '»','>', ')',  ']', '}', '"', "'", '-', '_', '&', '#', '@', '$', '+', '=', '%', '*', '#', '§', '°'];
    this.max_pooling = [];
    this.font = [];
    this.max_pooling_once = true;
    this.next_gen = false;
  }
  create_random_generation(){
    const initial_shapes = int(random(this.min_child_by_letter, this.max_child_by_letter));
    while(this.shapes.length < initial_shapes){
      const shape = new Shape();
      shape.create_new_shape();
      this.shapes.push(shape);
    }
  }
  get_fitness(model_font_recognition, model_font_similarity_first_part, model_font_similarity_last_part){
    if(this.letter_to_analyse_current < this.shapes.length){
      this.shapes[this.letter_to_analyse_current].DNA.get_pixels();
      this.shapes[this.letter_to_analyse_current].DNA.predict_letter(model_font_recognition);
      this.letter_to_analyse_current++;
      this.p.html("Letter analysed : " + this.letter_to_analyse_current + '/' + this.shapes.length);
    }
  }
  get_max_pooling(){
    if(this.max_pooling_once && this.letter_to_analyse_current == this.shapes.length){
      let global_prob = 0;
      this.max_pooling_once = false;
      let probability_medium = 0;
      const ranked_shapes_by_letter = [];
      const max_pooling_by_letter = [];
      for(let j = 0; j < this.shapes.length; j++){
        const probability = this.shapes[j].DNA.letters_probability[3];
        probability_medium+=probability/this.shapes.length;
        const genotype = this.shapes[j].DNA.genotype;
        ranked_shapes_by_letter.push({genotype: genotype, probability: probability});
      }
      ranked_shapes_by_letter.sort((a, b) => a.probability - b.probability);
      console.log('//////////////////////////////////');
      console.log('Pour la lettre ' + this.int_to_char[3] + ', meilleur probabilité : ' + ranked_shapes_by_letter[ranked_shapes_by_letter.length - 1].probability + '.');
      console.log("Probabilité moyenne : " + probability_medium);
      let num_shapes_in_pool;
      if(this.max_child_by_letter < ranked_shapes_by_letter.length){
        num_shapes_in_pool = int(random(this.min_child_by_letter, this.max_child_by_letter));
      } else{
        num_shapes_in_pool = ranked_shapes_by_letter.length
      }
      for(let j = 0; j < num_shapes_in_pool; j++){
        const num_to_add = int(exp(map(j, 0, num_shapes_in_pool - 1, 0, 7)));
        for(let k = 0; k < num_to_add; k++){
          max_pooling_by_letter.push({genotype: ranked_shapes_by_letter[j].genotype, index: j});
        }
      }
      this.max_pooling.push(max_pooling_by_letter);
      this.next_gen = true;
    }
  }
  save_font(){}
  create_next_generation(){
    const next_generation = new Generation();
    const random_num_childs = int(random(this.min_child_by_letter, this.max_child_by_letter));
    for(let j = 0; j < random_num_childs; j++){
      const parent_A = int(random(0, this.max_pooling[0].length));
      let parent_B = int(random(0, this.max_pooling[0].length));
      let checker = 0;
      while(this.max_pooling[i][parent_A].index == this.max_pooling[i][parent_B].index && checker < 2000){
        parent_B = int(random(0, this.max_pooling[0].length));
        checker++;
      }
      let new_shape = new Shape();
      new_shape.create_child(this.max_pooling[0][parent_A].genotype, this.max_pooling[0][parent_B].genotype);
      if(new_shape.DNA.genotype.length > 0) next_generation.shapes.push(new_shape);
    }
    this.p.html('');
    return next_generation;
  }
  next_generation_is_created(){
    return this.next_gen;
  }
}
