class Population{
  constructor(){
    this.model_font_recognition;
    //this.model_font_similarity_first_part;
    //this.model_font_similarity_last_part;
    this.generation;
    this.first_generation = false;
    this.wait = false;
  }
  async load_model(){
    this.model_font_recognition =  await tf.loadLayersModel('http://localhost:3000/assets/models/letter_recognition/model_1/model.json');
  }
  create_first_generation(){
    this.load_model().then(() => {
      this.generation = new Generation();
      this.generation.create_random_generation();
      this.first_generation = true;
    });
  }
  create_next_generation(){
    if(this.first_generation){
      this.wait = true;
      this.generation.get_fitness(this.model_font_recognition, this.model_font_similarity_first_part, this.model_font_similarity_last_part);
        this.generation.get_max_pooling();
      if(this.generation.next_generation_is_created()){
        this.generation = this.generation.create_next_generation();
      }
    }
  }
}
