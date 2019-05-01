class Population{
  constructor(){
    this.model_font_recognition;
    this.generation;
    this.first_generation = false;
    this.wait = false;
    this.letter_to_save;
    this.convertor = {'0': 0, '1': 1, '10': 2, '100': 3, '101': 4, '102': 5, '103': 6, '104': 7, '105': 8, '106': 9, '107': 10, '108': 11, '109': 12, '11': 13, '110': 14, '111': 15, '112': 16, '113': 17, '114': 18, '115': 19, '116': 20, '117': 21, '118': 22, '119': 23, '12': 24, '120': 25, '121': 26, '13': 27, '14': 28, '15': 29, '16': 30, '17': 31, '18': 32, '19': 33, '2': 34, '20': 35, '21': 36, '22': 37, '23': 38, '24': 39, '25': 40, '26': 41, '27': 42, '28': 43, '29': 44, '3': 45, '30': 46, '31': 47, '32': 48, '33': 49, '34': 50, '35': 51, '36': 52, '37': 53, '38': 54, '39': 55, '4': 56, '40': 57, '41': 58, '42': 59, '43': 60, '44': 61, '45': 62, '46': 63, '47': 64, '48': 65, '49': 66, '5': 67, '50': 68, '51': 69, '52': 70, '53': 71, '54': 72, '55': 73, '56': 74, '57': 75, '58': 76, '59': 77, '6': 78, '60': 79, '61': 80, '62': 81, '63': 82, '64': 83, '65': 84, '66': 85, '67': 86, '68': 87, '69': 88, '7': 89, '70': 90, '71': 91, '72': 92, '73': 93, '74': 94, '75': 95, '76': 96, '77': 97, '78': 98, '79': 99, '8': 100, '80': 101, '81': 102, '82': 103, '83': 104, '84': 105, '85': 106, '86': 107, '87': 108, '88': 109, '89': 110, '9': 111, '90': 112, '91': 113, '92': 114, '93': 115, '94': 116, '95': 117, '96': 118, '97': 119, '98': 120, '99': 121};
  }
  async load_model(){
    this.model_font_recognition =  await tf.loadLayersModel('http://localhost:3000/assets/models/letter_recognition/model_0/model.json');
  }
  create_first_generation(){
    this.load_model().then(() => {
      const random_letter =  int(random(0, Object.keys(this.convertor).length));
      console.log(random_letter);
      console.log(this.convertor[random_letter]);
      // Push random_letter to know wich letter
      // And this.convertor[random_letter] for the proper array
      this.generation = new Generation();
      this.generation.create_random_generation();
      this.first_generation = true;
    });
  }
  create_next_generation(){
    if(this.first_generation){
      this.letter_to_save = this.generation.letter_is_done();
      this.wait = true;
      this.generation.get_fitness(this.model_font_recognition, this.model_font_similarity_first_part, this.model_font_similarity_last_part);
      this.generation.get_max_pooling();
      if(!this.letter_to_save){
        if(this.generation.next_generation_is_created()){
          this.generation = this.generation.create_next_generation();
        }
      } else{
        const letter_to_display = this.generation.shape_with_max_probability;
        console.log(letter_to_display);
        this.genoeration = new Generation();
        this.generation.create_random_generation();
      }
    }
  }
}
