from lexicon_scripts import checkLexiconForDuplicates
from text_scripts import formatAllFilesInDirectory
from text_scripts import applyStopWordsToDirectory
from lexicon_scripts import scoreWords
# from text_scripts import getStopWordsList


corpus_1800s_dir = './corpus/1800s/'

# sw_list = getStopWordsList()
# print(sw_list)



#checkLexiconForDuplicates()
#scoreWords("unnecessary gave none  second edition demands words acknowledgment miscellaneous remark thanks due three quarters public indulgent ear inclined plain tale pretensions press fair field honest suffrage opened obscure aspirant publishers  aid tact energy practical sense frank liberality afforded unknown unrecommended author press public vague personifications must thank vague terms  publishers definite ¹ messrs smith elder co gracious treatment publishers accorded charlotte brontë reader referred mrs gaskells admirable  life  gifted authoress ts  certain generous critics encouraged large hearted high minded men know encourage struggling stranger  ie publishers select reviewers say cordially gentlemen thank heart thus acknowledged owe aided approved turn another class  small one far know not therefore overlooked mean timorous carping doubt tendency books jane eyre whose eyes whatever unusual wrong")

formatAllFilesInDirectory(corpus_1800s_dir)
applyStopWordsToDirectory(corpus_1800s_dir + 'formatted_files/')

# terms = getStopWordsList()
# print(terms)

