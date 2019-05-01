const cdb = require('./js/create_database');
const cf = require('./js/create_font');
const tnn = require('./js/test_nn');

//cdb.run(0);
//tnn.test_letter_recognition();


cf.run();



// Corriger bug dans create weight (1 pour le placement d'une des weights)
// Autres bug dans courbe avec 4 points
// Autres bug dans mutation ?
// Ajouter courbes dans close et sub_shape
// Changer remove_point et move_sub_shape
// Clean code
// Ajouter sauvegarde json
// Back up plan
// Code node de sauvegarde TTF et JPG grand format (classé par lettres et par famille), sois manuel, sois à la fin du code,
// Ajouter un timer si le code ne trouve pas de lettres au bout de X iterations
// Choisir lettres aléatoires, supprimer de l'objet, si population empty, seulement letter_recognition
//  sinon, pour chaque lettre sauvegarder, ajouter au fitness sa ressemblance
