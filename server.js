const cdb = require('./js/create_database');
const cf = require('./js/create_font');
const tnn = require('./js/test_nn');

//cdb.run(0);

//tnn.test_letter_recognition();

cf.run();

// Add curve


// Create letter for random int_to_char index, remove letter
// When letter is created, add to population DNA weight vector and pixels
// Create next letter with Model letter recognition and letter proximity
// Repeat until int_to_char empty
// Then send, save image with node, save font with processing
