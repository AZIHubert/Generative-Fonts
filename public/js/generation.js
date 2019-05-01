class Generation{
  constructor(){
    this.p = createP();
    this.shapes = [];
    this.analyse_once = true;
    this.get_new_gen = false;
    this.calculate_best_letter_once = true;
    this.letter_to_analyse_current = 0;
    this.min_child_by_letter = 800;
    this.max_child_by_letter = 800;
    this.num_childs = 1600;
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
    this.convertor = {'0': 0, '1': 1, '10': 2, '100': 3, '101': 4, '102': 5, '103': 6, '104': 7, '105': 8, '106': 9, '107': 10, '108': 11, '109': 12, '11': 13, '110': 14, '111': 15, '112': 16, '113': 17, '114': 18, '115': 19, '116': 20, '117': 21, '118': 22, '119': 23, '12': 24, '120': 25, '121': 26, '13': 27, '14': 28, '15': 29, '16': 30, '17': 31, '18': 32, '19': 33, '2': 34, '20': 35, '21': 36, '22': 37, '23': 38, '24': 39, '25': 40, '26': 41, '27': 42, '28': 43, '29': 44, '3': 45, '30': 46, '31': 47, '32': 48, '33': 49, '34': 50, '35': 51, '36': 52, '37': 53, '38': 54, '39': 55, '4': 56, '40': 57, '41': 58, '42': 59, '43': 60, '44': 61, '45': 62, '46': 63, '47': 64, '48': 65, '49': 66, '5': 67, '50': 68, '51': 69, '52': 70, '53': 71, '54': 72, '55': 73, '56': 74, '57': 75, '58': 76, '59': 77, '6': 78, '60': 79, '61': 80, '62': 81, '63': 82, '64': 83, '65': 84, '66': 85, '67': 86, '68': 87, '69': 88, '7': 89, '70': 90, '71': 91, '72': 92, '73': 93, '74': 94, '75': 95, '76': 96, '77': 97, '78': 98, '79': 99, '8': 100, '80': 101, '81': 102, '82': 103, '83': 104, '84': 105, '85': 106, '86': 107, '87': 108, '88': 109, '89': 110, '9': 111, '90': 112, '91': 113, '92': 114, '93': 115, '94': 116, '95': 117, '96': 118, '97': 119, '98': 120, '99': 121};
    this.max_pooling = [];
    this.font = [];
    this.max_pooling_once = true;
    this.next_gen = false;
    this.random_choosen_letter = int(random(0, this.int_to_char.length +1));
    this.shape_with_max_probability;
    this.save_letter = false;
  }
  create_random_generation(){
    const initial_shapes = this.num_childs;
    while(this.shapes.length < initial_shapes){
      const shape = new Shape();
      shape.create_new_shape();
      this.shapes.push(shape);
    }
  }
  get_fitness(model_font_recognition, model_font_similarity_first_part, model_font_similarity_last_part){
    if(this.letter_to_analyse_current < this.shapes.length){
      this.shapes[this.letter_to_analyse_current].DNA.get_pixels(false);
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
        const probability = this.shapes[j].DNA.letters_probability[53];
        probability_medium+=probability/this.shapes.length;
        if(probability != 0.001){
          const genotype = this.shapes[j].DNA.genotype;
          ranked_shapes_by_letter.push({genotype: genotype, probability: probability});
        }
      }
      ranked_shapes_by_letter.sort((a, b) => a.probability - b.probability);
      console.log('//////////////////////////////////');
      console.log('Pour la lettre ' + this.int_to_char[53] + ', meilleur probabilité : ' + ranked_shapes_by_letter[ranked_shapes_by_letter.length - 1].probability + '.');
      console.log("Probabilité moyenne : " + probability_medium);
      if(this.shape_with_max_probability == null){
        this.shape_with_max_probability = ranked_shapes_by_letter[ranked_shapes_by_letter.length - 1];
        if(this.shape_with_max_probability.probability > 60){
          this.save_letter = true;
        }
      } else{
        if(this.shape_with_max_probability.probability < ranked_shapes_by_letter[ranked_shapes_by_letter.length - 1].probability){
          this.shape_with_max_probability = ranked_shapes_by_letter[ranked_shapes_by_letter.length - 1].probability;
          if(this.shape_with_max_probability.probability > 60){
            this.save_letter = true;
          }
        }
      }
      let num_shapes_in_pool;
      if(this.num_childs < ranked_shapes_by_letter.length){
        num_shapes_in_pool = this.num_childs;
      } else{
        num_shapes_in_pool = ranked_shapes_by_letter.length
      }
      for(let j = 0; j < num_shapes_in_pool; j++){
        const num_to_add = map(j, 0, num_shapes_in_pool, exp(0), exp(6));
        for(let k = 0; k < num_to_add; k++){
          max_pooling_by_letter.push({genotype: ranked_shapes_by_letter[j].genotype, index: j});
        }
      }
      this.max_pooling.push(max_pooling_by_letter);
      this.next_gen = true;
    }
  }
  letter_is_done(){
    return this.save_letter;
  }
  create_next_generation(){
    const next_generation = new Generation();
    for(let j = 0; j < this.num_childs; j++){
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
