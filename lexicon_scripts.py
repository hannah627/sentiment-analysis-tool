import os
from text_scripts import applyFunctionToAllFilesInDirectory
from text_scripts import makeChangesToFileAndSaveToAnotherFile

def checkLexiconForDuplicates():
     existing_terms = set()
     terms_with_duplicates = set()
     with open('./lexicons/lexicon-v1') as f:
          for line in f:
                lowercase_line = line.lower()
                tokens = lowercase_line.split()
                term = tokens[0]
                if term in existing_terms:
                     terms_with_duplicates.add(term)
                else:
                     existing_terms.add(term)
     if len(terms_with_duplicates) == 0:
          print("No duplicates in the lexicon!")
     else:
          print("Duplicate Terms in the Lexicon:")
          print(terms_with_duplicates)


def applyLexiconToDirectory(directory):
     resultsDirectory = directory + 'formatted_files_without_stopwords/'
     applyFunctionToAllFilesInDirectory(directory, resultsDirectory, applyLexicon)


def applyLexiconToFile(textFile, resultsFile):
    makeChangesToFileAndSaveToAnotherFile(textFile, resultsFile, scoreWords)
    # check if words before word in sentiment lexicon is 'not' - if so, flip sign? (multiply score by negative 1?)


def scoreWords(text):
    tokens = text.split(' ')
    print(tokens)

    results = ' '.join(tokens)
    return results


