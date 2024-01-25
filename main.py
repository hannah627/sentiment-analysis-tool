from lexicon_scripts import checkLexiconForDuplicates
from text_scripts import formatAllFilesInDirectory
from text_scripts import getStopWordsList


corpus_1800s_dir = './corpus/1800s/'



checkLexiconForDuplicates()

formatAllFilesInDirectory(corpus_1800s_dir)

# terms = getStopWordsList()
# print(terms)

