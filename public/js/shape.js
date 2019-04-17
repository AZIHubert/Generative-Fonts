class Shape{
  constructor(){
    this.DNA = new DNA();
  }
  create_new_shape(){
    this.DNA.create_new_shape();
  }
  create_child(parent_1, parent_2){
    this.DNA.crossover(parent_1, parent_2);
  }
}
